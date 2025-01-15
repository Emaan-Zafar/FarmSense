from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pydantic import BaseModel
from tensorflow.keras.models import load_model
import torch
import os
import sys
import cv2
from torchvision.models.video import r3d_18
import torch.nn as nn
import joblib
import supervision as sv
from ultralytics import YOLO
from tqdm import tqdm
from collections import defaultdict
import csv
from torchvision import transforms
from itertools import cycle
import subprocess
# Initialize FastAPI app
app = FastAPI()

# Allow CORS for React frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3039"],  # Specify exact origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Set UTF-8 encoding for logging and output
sys.stdout.reconfigure(encoding='utf-8')

# Constants
lost_track_buffer_thresh=100
track_activation_thresh=0.6
minimum_matching_thresh=0.8
cow_class_id=19
detection_confidence=0.7
frame_height=100
frame_width=100
input_frames=450
NUM_CLASSES = 11  # Set to the number of classes in your task
# Create a CSV file to store the annotations (including tracker ID, class, confidence)
csv_file_path = "cow_annotations.csv"
csv_columns = ['Frame', 'Tracker ID', 'Class Name', 'Confidence']
lost_tracks_csv_path = "lost_tracks.csv"
LABELS = {
    0: "grazing",
    1: "walking",
    2: "ruminating-standing",
    3: "ruminating-lying",
    4: "resting-standing",
    5: "resting-lying",
    6: "drinking",
    7: "grooming",
    8: "other",
    9: "hidden",
    10: "running"
}

# Dictionary to track the frames in which each tracker ID appears
tracker_frame_appearance = {}
# Global dictionary to store cropped frames for each tracker ID
tracker_frame_buffers = {}
predicted_classes = {}
csv_behavior_file_path = "cow_behavior_predictions.csv"
# Open a video writer to save the annotated video
fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for mp4
out = cv2.VideoWriter('annotated_result.mp4', fourcc, 30.0, (640, 384))  # Adjust the frame size as needed

# Dictionary to manage video writers for individual tracked cows
cow_video_writers = {}
cow_video_dimensions = {}

# Dictionary to track the last frame each tracker ID was seen
last_seen_frame = {}

# List to store lost track information
lost_tracks = []



# Mapping of adjusted label IDs to class names


# Preprocessing for I3D model input

yolo_model = YOLO('yolov10m.pt')
byte_tracker = sv.ByteTrack(
    track_activation_threshold=track_activation_thresh,  # Minimum detection confidence for tracking
    minimum_matching_threshold=minimum_matching_thresh,  # Minimum IoU for association
    lost_track_buffer=lost_track_buffer_thresh    # Number of frames to keep a track alive without an update
)
annotator = sv.BoxAnnotator()

class R3D(nn.Module):
    def __init__(self, num_classes):
        super(R3D, self).__init__()
        self.model = r3d_18(weights="KINETICS400_V1")  # Pre-trained on Kinetics-400
        self.model.fc = nn.Linear(self.model.fc.in_features, num_classes)  # Replace the last layer

    def forward(self, x):
        # Permute x to [batch_size, channels, num_frames, height, width]
        x = x.permute(0, 2, 1, 3, 4)
        return self.model(x)

# Function to load the model
def load_r3d_model(model_path, device):
    model = R3D(num_classes=NUM_CLASSES)
    state_dict = torch.load(model_path, map_location=device)

    # Handle models saved with DataParallel
    if 'module.' in list(state_dict.keys())[0]:
        state_dict = {k.replace('module.', ''): v for k, v in state_dict.items()}

    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model
    
# Initialize the CSV file if it doesn't exist
def initialize_csv():
    try:
        with open(csv_file_path, mode='w', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=csv_columns)
            writer.writeheader()
    except Exception as e:
        print(f"Error initializing CSV file: {e}")

# Initialize the lost tracks CSV file
def initialize_lost_tracks_csv():
    try:
        with open(lost_tracks_csv_path, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["Tracker ID", "Last Seen Frame", "Time (s)"])  # Headers for the CSV
    except Exception as e:
        print(f"Error initializing lost tracks CSV file: {e}")

# Initialize or load the CSV
def initialize_behavior_csv(csv_file, labels):
    """
    Initialize the CSV file with column headers for each behavior.
    """
    if not os.path.exists(csv_file):
        with open(csv_file, mode="w", newline="") as file:
            writer = csv.writer(file)
            headers = ["Cow ID"] + labels  # Include a column for Cow ID
            writer.writerow(headers)

# Function to write lost track records to the CSV
def log_lost_tracks(lost_tracks, csv_path, fps):
    """
    Log lost tracks into a CSV file.

    Args:
        lost_tracks (list): List of tuples containing tracker ID, last seen frame, and time in seconds.
        csv_path (str): Path to the CSV file for lost tracks.
        fps (int): Frames per second of the video.
    """
    try:
        with open(csv_path, mode='a', newline='') as file:
            writer = csv.writer(file)
            for tracker_id, last_seen_frame in lost_tracks:
                time_seconds = round(last_seen_frame / fps, 2)  # Convert frame to time in seconds
                writer.writerow([tracker_id, last_seen_frame, time_seconds])
    except Exception as e:
        print(f"Error writing to lost tracks CSV file: {e}")
    
def process_frame(frame: np.ndarray, index: int,fps: int) -> np.ndarray:
    global last_seen_frame, lost_tracks

    # Run YOLO model inference
    results = yolo_model(frame)[0]

    # Convert YOLO results to detections
    detections = sv.Detections.from_ultralytics(results)

    # Update ByteTrack with current detections
    detections = byte_tracker.update_with_detections(detections)

    # Update the `last_seen_frame` for active tracks
    current_tracker_ids = set(detections.tracker_id)
    for tracker_id in current_tracker_ids:
        last_seen_frame[tracker_id] = index

    # Check for lost tracks
    lost_tracker_ids = [
        tracker_id for tracker_id, last_frame in last_seen_frame.items()
        if tracker_id not in current_tracker_ids and index - last_frame > lost_track_buffer_thresh  # lost_track_buffer threshold
    ]
    for tracker_id in lost_tracker_ids:
        print(f"Track ID {tracker_id} lost at frame {last_seen_frame[tracker_id]}")
        lost_tracks.append((tracker_id, last_seen_frame[tracker_id]))
        del last_seen_frame[tracker_id]  # Remove from tracking dictionary

    # Log lost tracks to the CSV
    if lost_tracks:
        log_lost_tracks(lost_tracks, lost_tracks_csv_path, fps)
        lost_tracks.clear()  # Clear the lost tracks list after logging

    # Annotate the frame with detections
    annotated_frame = annotator.annotate(scene=frame.copy(), detections=detections)

    # Process frames for action recognition prediction
    process_frame_for_prediction(frame, detections, index)

    # Draw tracker ID and class label on the frame
    for (x1, y1, x2, y2), confidence, class_id, tracker_id in zip(detections.xyxy, detections.confidence, detections.class_id, detections.tracker_id):
        if class_id == cow_class_id:  # Only annotate cows (class_id == 19)
            # Display either the predicted class or "Waiting for prediction..."
            if tracker_id in predicted_classes:
                label = f"ID: {tracker_id} {predicted_classes[tracker_id][0]} {predicted_classes[tracker_id][1]:.2f}"
            else:
                label = f"ID: {tracker_id} Waiting for prediction..."
            cv2.rectangle(annotated_frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            cv2.putText(annotated_frame, label, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    out.write(annotated_frame)
    return annotated_frame

# Append or update behavior times in the CSV
def update_csv(csv_file, tracker_id, behavior, total_time):
    """
    Update the CSV file with cumulative behavior times for a tracker ID.

    Args:
        csv_file (str): Path to the CSV file.
        tracker_id (int): Unique ID of the tracker (e.g., cow ID).
        behavior (str): Predicted behavior for the tracker.
        total_time (int): Time to add to the behavior in seconds.
    """
    try:
        # Read existing data
        data = {}
        try:
            with open(csv_file, mode='r') as f:
                reader = csv.DictReader(f)
                data = {row["Cow ID"]: row for row in reader}
        except FileNotFoundError:
            pass

        # Update or add the row for the tracker
        tracker_id = str(tracker_id)
        if tracker_id not in data:
            data[tracker_id] = {"Cow ID": tracker_id, **{key: "0" for key in LABELS.values()}}
        current_time = float(data[tracker_id][behavior]) if data[tracker_id][behavior] else 0.0
        data[tracker_id][behavior] = str(int(current_time + total_time))


        # Write updated data back to the CSV
        with open(csv_file, mode='w', newline='') as f:
            fieldnames = ["Cow ID"] + list(LABELS.values())
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data.values())
    except Exception as e:
        print(f"Error updating CSV: {e}")

def process_frame_for_prediction(frame: np.ndarray, detections, index: int):
    global tracker_frame_buffers

    for (x1, y1, x2, y2), confidence, class_id, tracker_id in zip(detections.xyxy, detections.confidence, detections.class_id, detections.tracker_id):
        # Only process detections for cows (assuming class_id == 19 is for cows)
        if class_id == cow_class_id and confidence >= detection_confidence:
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            cropped_frame = frame[y1:y2, x1:x2]

            # Skip invalid regions
            if cropped_frame.size == 0:
                continue

            # Add the cropped frame to the buffer for the current tracker ID
            if tracker_id not in tracker_frame_buffers:
                tracker_frame_buffers[tracker_id] = []
            tracker_frame_buffers[tracker_id].append(cv2.cvtColor(cropped_frame, cv2.COLOR_BGR2RGB))  # Convert to RGB

def process_video_in_intervals(video_path, target_video, interval_duration):
    global tracker_frame_buffers
    """
    Process a video in fixed time intervals, run YOLO and predictions on each interval,
    and update cumulative behavior times in a CSV file.

    Args:
        video_path (str): Path to the input video file.
        target_video (str): Path to save the output annotated video.
        interval_duration (int): Duration of each interval in seconds.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Could not open video.")
        return

    # Get video properties
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Interval properties
    interval_frames = interval_duration * fps

    # Initialize video writer for annotated video
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(target_video, fourcc, fps, (width, height))

    frame_index = 0
    interval_index = 0
    frame_buffer = []

    # CSV file path
    csv_file = "cow_behavior.csv"

    # Process the video frame by frame
    with tqdm(total=total_frames, desc="Processing Video") as pbar:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Add frame to the buffer
            frame_buffer.append(frame)
            frame_index += 1

            # If enough frames for an interval are collected, process them
            if len(frame_buffer) == interval_frames or frame_index == total_frames:
                print(f"Processing interval {interval_index + 1}")

                # Process the interval's frames through YOLO and prediction
                for idx, buffered_frame in enumerate(frame_buffer):
                    annotated_frame = process_frame(buffered_frame, idx, fps)
                    out.write(annotated_frame)

                # Perform prediction for this interval
                prediction_results = predict_from_buffers(tracker_frame_buffers)
                actual_interval_duration = len(frame_buffer) / fps
                for tracker_id, predicted_class, confidence in prediction_results:
                    print(f"Interval {interval_index + 1}, Tracker ID: {tracker_id}, "
                          f"Predicted Class: {predicted_class}, Confidence: {confidence:.2f}")

                    # Update the predictions dictionary
                    predicted_classes[tracker_id] = (predicted_class, confidence)

                    # Update CSV with cumulative behavior time
                    update_csv(
                        csv_file=csv_file,
                        tracker_id=tracker_id,
                        behavior=predicted_class,
                        total_time=actual_interval_duration if frame_index == total_frames else interval_duration,
                    )

                # Clear buffer for next interval
                frame_buffer.clear()
                tracker_frame_buffers.clear()
                interval_index += 1

            pbar.update(1)

    cap.release()
    out.release()
    print(f"Annotated video saved at {target_video}")


# Release all resources
def release_resources():
    for writer in cow_video_writers.values():
        writer.release()
    out.release()

# Preprocessing for R3D model input
def preprocess_frames(frames):
    """
    Preprocess frames for R3D input.
    """
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Resize((frame_height, frame_width)),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    preprocessed_frames = torch.stack([transform(frame) for frame in frames])  # (T, C, H, W)
    return preprocessed_frames.unsqueeze(0)  # Add batch dimension (B, T, C, H, W)

# Perform predictions on buffered frames
def infer_buffered_frames(buffered_frames, tracker_id):
    """
    Perform prediction using buffered frames for a given tracker ID.
    """
    try:
        # Ensure enough frames are available by repeating the sequence if needed
        if len(buffered_frames) < input_frames:
            print(f"Tracker ID {tracker_id}: Insufficient frames ({len(buffered_frames)}). Repeating sequence.")
            repeat_factor = (input_frames // len(buffered_frames)) + 1  # Calculate how many times to repeat the sequence
            buffered_frames = (buffered_frames * repeat_factor)[:input_frames]  # Repeat and truncate to 450 frames

        # Select the last 450 frames for prediction
        frames = buffered_frames[-input_frames:]
        preprocessed_frames = preprocess_frames(frames).to(device)

        # Perform inference
        with torch.no_grad():
            output = r3d_model(preprocessed_frames)

        predictions = torch.softmax(output, dim=1)
        class_idx = torch.argmax(predictions, dim=1).item()
        predicted_class = LABELS.get(class_idx, "Unknown")
        confidence = predictions[0, class_idx].item()

        return tracker_id, predicted_class, confidence
    except Exception as e:
        print(f"Error predicting for tracker ID {tracker_id}: {e}")
        return tracker_id, "Error", 0.0


# Run predictions for all trackers
def predict_from_buffers(tracker_frame_buffers):
    """
    Run predictions for all tracker IDs using their respective frame buffers.
    """
    results = []
    for tracker_id, frames in tracker_frame_buffers.items():
        result = infer_buffered_frames(frames, tracker_id)
        results.append(result)
    return results

# Function to load the model on CPU
def encode_video(input_path, output_path):
    """
    Re-encode a video file using FFmpeg for web compatibility.
    """
    command = [
        "ffmpeg",
        "-i", input_path,
        "-c:v", "libx264",
        "-crf", "23",
        "-preset", "veryfast",
        "-c:a", "aac",
        "-b:a", "128k",
        output_path
    ]
    subprocess.run(command, check=True)

#Load the R3D model
try:
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    r3d_model_path = 'i3d_model_20epoch.pth'
    # Load the model with map_location to CPU
    r3d_model = load_r3d_model(r3d_model_path, device)
    print(f"R3D Model loaded successfully from {r3d_model_path}")
except Exception as e:
    print(f"Error loading R3D model: {e}")
    raise HTTPException(status_code=500, detail=f"Error loading R3D model : {e}")


try:
    print("Starting to load the Random Forest symptom model...")
    rf_symptom_model_path = os.path.join(os.getcwd(), 'symptom_model.pkl')
    print(f"Symptom model path: {rf_symptom_model_path}")
    
    if not os.path.exists(rf_symptom_model_path):
        raise FileNotFoundError(f"File not found: {rf_symptom_model_path}")
    
    rf_symptom_model = joblib.load(rf_symptom_model_path)
    print(f"Random Forest Model Symptoms loaded successfully: {rf_symptom_model}")
    
    # Mapping of label to disease name
    label_mapping_2 = {
        0: 'mastitis', 1: 'blackleg', 2: 'bloat', 3: 'coccidiosis', 
        4: 'cryptosporidiosis', 5: 'displaced_abomasum', 6: 'gut_worms', 
        7: 'listeriosis', 8: 'liver_fluke', 9: 'necrotic_enteritis', 
        10: 'peri_weaning_diarrhoea', 11: 'rift_valley_fever', 12: 'rumen_acidosis', 
        13: 'traumatic_reticulitis', 14: 'calf_diphtheria', 15: 'foot_rot', 
        16: 'foot_and_mouth', 17: 'ragwort_poisoning', 18: 'wooden_tongue', 
        19: 'infectious_bovine_rhinotracheitis', 20: 'acetonaemia', 
        21: 'fatty_liver_syndrome', 22: 'calf_pneumonia', 23: 'schmallen_berg_virus', 
        24: 'trypanosomosis', 25: 'fog_fever'
    }
    print("Label mapping for symptoms created successfully.")
except Exception as e:
    print(f"Error in symptom model block: {e}")
    raise HTTPException(status_code=500, detail=f"Error loading Random Forest model: {e}")


# Load the LSTM model
# try:
#     lstm_model_path = os.path.join(os.getcwd(), 'model_lstm(1).keras')
#     lstm_model = load_model(lstm_model_path)
#     print(f"LSTM Model loaded successfully from {lstm_model_path}")
# except Exception as e:
#     print(f"Error loading LSTM model: {e}")
#     raise HTTPException(status_code=500, detail=f"Error loading LSTM model: {e}")

try:
    rf_model_path = os.path.join(os.getcwd(), 'random_forest_cow_health_model.pkl')
    scaler_path = os.path.join(os.getcwd(), 'scaler.pkl')
    
    rf_model = joblib.load(rf_model_path)  # Load the Random Forest model
    scaler = joblib.load(scaler_path)  # Load the scaler
    print(f"Random Forest Model and scaler loaded successfully")
except Exception as e:
    print(f"Error loading Random Forest model: {e}")
    raise HTTPException(status_code=500, detail=f"Error loading Random Forest model: {e}")


# Pydantic model for input validation (Random Forest input)
class CowHealthInput(BaseModel):
    body_temperature: float
    milk_production: float
    respiratory_rate: float
    walking_capacity: float
    sleeping_duration: float
    body_condition_score: float
    heart_rate: float
    eating_duration: float
    lying_down_duration: float
    ruminating: float
    rumen_fill: float

# Random Forest Prediction endpoint for cow health
@app.post("/predict-cow-health")
async def predict_cow_health(data: CowHealthInput):
    try:
        # Log input data
        input_data = np.array([[
            data.body_temperature,
            data.milk_production,
            data.respiratory_rate,
            data.walking_capacity,
            data.sleeping_duration,
            data.body_condition_score,
            data.heart_rate,
            data.eating_duration,
            data.lying_down_duration,
            data.ruminating,
            data.rumen_fill
        ]])
        print(f"Received input for cow health prediction: {input_data}")
        
        # Scale the input data
        scaled_input = scaler.transform(input_data)
        
        # Predict using the Random Forest model
        prediction = rf_model.predict(scaled_input)
        prediction_label = 'Unhealthy' if prediction[0] == 1 else 'Healthy'
        print(f"Predicted cow health status: {prediction_label}")

        # Return the prediction result
        return {
            "predicted_health_status": prediction_label
        }
    except Exception as e:
        print(f"Error during cow health prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Error during cow health prediction: {e}")


# # Pydantic model for input validation (Random Forest input)
class CowSymptomInput(BaseModel):
    anorexia: int
    abdominal_pain: int
    anaemia: int
    abortions: int
    acetone: int
    aggression: int
    arthrogyposis: int
    ankylosis: int
    anxiety: int
    bellowing: int
    blood_loss: int
    blood_poisoning: int
    blisters: int
    colic: int
    Condemnation_of_livers: int
    conjunctivae: int
    coughing: int
    depression: int
    discomfort: int
    dyspnea: int
    dysentery: int
    diarrhoea: int
    dehydration: int
    drooling: int
    dull: int
    decreased_fertility: int
    diffculty_breath: int
    emaciation: int
    encephalitis: int
    fever: int
    facial_paralysis: int
    frothing_of_mouth: int
    frothing: int
    gaseous_stomach: int
    highly_diarrhoea: int
    high_pulse_rate: int
    high_temp: int
    high_proportion: int
    hyperaemia: int
    hydrocephalus: int
    isolation_from_herd: int
    infertility: int
    intermittent_fever: int
    jaundice: int
    ketosis: int
    loss_of_appetite: int
    lameness: int
    lack_of_coordination: int
    lethargy: int
    lacrimation: int
    milk_flakes: int
    milk_watery: int
    milk_clots: int
    mild_diarrhoea: int
    moaning: int
    mucosal_lesions: int
    milk_fever: int
    nausea: int
    nasel_discharges: int
    oedema: int
    pain: int
    painful_tongue: int
    pneumonia: int
    photo_sensitization: int
    quivering_lips: int
    reduction_milk_vields: int
    rapid_breathing: int
    rumenstasis: int
    reduced_rumination: int
    reduced_fertility: int
    reduced_fat: int
    reduces_feed_intake: int
    raised_breathing: int
    stomach_pain: int
    salivation: int
    stillbirths: int
    shallow_breathing: int
    swollen_pharyngeal: int
    swelling: int
    saliva: int
    swollen_tongue: int
    tachycardia: int
    torticollis: int
    udder_swelling: int
    udder_heat: int
    udder_hardeness: int
    udder_redness: int
    udder_pain: int
    unwillingness_to_move: int
    ulcers: int
    vomiting: int
    weight_loss: int
    weakness: int

@app.post("/symptoms")
async def predict_cow_health(data: CowSymptomInput):
    try:
        print("ahmed")
        # Log input data
        input_data = np.array([[
            data.anorexia,
            data.abdominal_pain,
            data.anaemia,
            data.abortions,
            data.acetone,
            data.aggression,
            data.arthrogyposis,
            data.ankylosis,
            data.anxiety,
            data.bellowing,
            data.blood_loss,
            data.blood_poisoning,
            data.blisters,
            data.colic,
            data.Condemnation_of_livers,
            data.conjunctivae,
            data.coughing,
            data.depression,
            data.discomfort,
            data.dyspnea,
            data.dysentery,
            data.diarrhoea,
            data.dehydration,
            data.drooling,
            data.dull,
            data.decreased_fertility,
            data.diffculty_breath,
            data.emaciation,
            data.encephalitis,
            data.fever,
            data.facial_paralysis,
            data.frothing_of_mouth,
            data.frothing,
            data.gaseous_stomach,
            data.highly_diarrhoea,
            data.high_pulse_rate,
            data.high_temp,
            data.high_proportion,
            data.hyperaemia,
            data.hydrocephalus,
            data.isolation_from_herd,
            data.infertility,
            data.intermittent_fever,
            data.jaundice,
            data.ketosis,
            data.loss_of_appetite,
            data.lameness,
            data.lack_of_coordination,
            data.lethargy,
            data.lacrimation,
            data.milk_flakes,
            data.milk_watery,
            data.milk_clots,
            data.mild_diarrhoea,
            data.moaning,
            data.mucosal_lesions,
            data.milk_fever,
            data.nausea,
            data.nasel_discharges,
            data.oedema,
            data.pain,
            data.painful_tongue,
            data.pneumonia,
            data.photo_sensitization,
            data.quivering_lips,
            data.reduction_milk_vields,
            data.rapid_breathing,
            data.rumenstasis,
            data.reduced_rumination,
            data.reduced_fertility,
            data.reduced_fat,
            data.reduces_feed_intake,
            data.raised_breathing,
            data.stomach_pain,
            data.salivation,
            data.stillbirths,
            data.shallow_breathing,
            data.swollen_pharyngeal,
            data.swelling,
            data.saliva,
            data.swollen_tongue,
            data.tachycardia,
            data.torticollis,
            data.udder_swelling,
            data.udder_heat,
            data.udder_hardeness,
            data.udder_redness,
            data.udder_pain,
            data.unwillingness_to_move,
            data.ulcers,
            data.vomiting,
            data.weight_loss,
            data.weakness
        ]])
        print(f"Received input for cow health prediction: {input_data}")

        # Predict using the Random Forest model
        prediction = rf_symptom_model.predict(input_data)[0]
        prediction_label = label_mapping_2.get(prediction, "Unknown")
        print(f"Predicted cow disease: {prediction_label}")

        # Return the prediction result
        return {
            "predicted_cow_disease": prediction_label
        }
    except Exception as e:
        print(f"Error during cow health prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Error during cow health prediction: {e}")



# # Disease class names for LSTM
# disease_names = ['oestrus', 'calving', 'lameness', 'mastitis', 'LPS', 'other_disease', 'accidents', 'OK']

# # Pydantic model for input validation (LSTM input)
# class ModelInput(BaseModel):
#     IN_ALLEYS: list[float]
#     REST: list[float]
#     EAT: list[float]
#     ACTIVITY_LEVEL: list[float]

# # Helper function to prepare LSTM input
# def prepare_lstm_input(data_dict):
#     try:
#         data = np.array([data_dict[key] for key in ['IN_ALLEYS', 'REST', 'EAT', 'ACTIVITY_LEVEL']]).T
#         data = np.expand_dims(data, axis=0)  # Shape: (1, timesteps, features)
#         print(f"Prepared LSTM input shape: {data.shape}")
#         return data
#     except Exception as e:
#         raise ValueError(f"Error preparing LSTM input: {e}")

# # LSTM Prediction endpoint
# @app.post("/predict")
# async def get_prediction(data: ModelInput):
#     try:
#         # Log input data
#         input_data = {
#             "IN_ALLEYS": data.IN_ALLEYS,
#             "REST": data.REST,
#             "EAT": data.EAT,
#             "ACTIVITY_LEVEL": data.ACTIVITY_LEVEL
#         }
#         print(f"Received input: {input_data}")
        
#         # Prepare input for LSTM
#         lstm_input = prepare_lstm_input(input_data)
        
#         # Predict using LSTM model
#         try:
#             predictions = lstm_model.predict(lstm_input)
#             print(f"Raw LSTM predictions: {predictions}")
#         except ValueError as ve:
#             print(f"LSTM Model prediction error: {ve}")
#             raise HTTPException(status_code=400, detail="Bad input data format")
#         except Exception as e:
#             print(f"Unexpected error during LSTM prediction: {e}")
#             raise HTTPException(status_code=500, detail="Error during LSTM prediction")

#         # Normalize predictions
#         prediction_percentages = (predictions[0] / np.sum(predictions[0])) * 100
#         print(f"LSTM Prediction percentages: {prediction_percentages}")

#         # Return results
#         return {
#             "labels": disease_names,
#             "values": prediction_percentages.tolist()
#         }
#     except Exception as e:
#         print(f"Error during LSTM prediction: {e}")
#         raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


# # Helper function to preprocess video frames for I3D model
# def preprocess_video_frames(frames):
#     # Resize frames to 150x150 and normalize (if necessary)
#     processed_frames = []
#     for frame in frames:
#         resized_frame = cv2.resize(frame, (150, 150))
#         processed_frames.append(resized_frame)
    
#     # Convert to numpy array, then to torch tensor
#     processed_frames = np.array(processed_frames)
#     processed_frames = processed_frames / 255.0  # Normalize if required
#     processed_frames = np.transpose(processed_frames, (1,0,2,3))  # Convert to (C, T, H, W)
    
#     # Add batch dimension and convert to torch tensor
#     processed_frames = torch.tensor(processed_frames, dtype=torch.float32).unsqueeze(0)  # Shape: (1, C, T, H, W)
#     processed_frames = processed_frames.permute(0, 2, 4, 1, 3)
#     return processed_frames

# I3D Video Prediction endpoint (Accepts video path as a query parameter)
@app.get("/predict-video")
async def predict_video(video_path: str = Query(..., description="Path to the video file")):
                        # target_video: str = "annotated_result.mp4",
                        # interval_duration: int = 10):
    try:
        print("Ahmedpro")
        initialize_csv()
        initialize_lost_tracks_csv()
        output_video_path = "output_annotated_intervals_fastapi.mp4"  # Path to save the annotated video
        encoded_video_path ="C:/Users/aamna/Downloads/uploads/videos/annotated_intervals.mp4"
        interval_duration = 15  # Interval duration in seconds
        cow_behaviour = "cow_behavior.csv"

        process_video_in_intervals(video_path, output_video_path, interval_duration)
        release_resources()
        print("Processing complete!")

        if os.path.exists(encoded_video_path):
            os.remove(encoded_video_path)
            print(f"Removed existing encoded file: {encoded_video_path}")

        print("Re-encoding video...")
        encode_video(output_video_path, encoded_video_path)
        print(f"Re-encoding complete! Video saved at {encoded_video_path}")
        encoded_video = "annotated_intervals.mp4"

        # Read the CSV contents
        csv_data = []
        with open(cow_behaviour, "r") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                csv_data.append(row)


        return {
            "message": "Prediction completed successfully.",
            "annotated_video": encoded_video,
              "csv_data": csv_data,
        }
    except Exception as e:
        print(f"Error processing video: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {e}")
