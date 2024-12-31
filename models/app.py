from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pydantic import BaseModel
from keras.models import load_model
import torch
import os
import sys
import cv2
from torchvision.models.video import r3d_18
import torch.nn as nn
import joblib

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


class I3D(nn.Module):
    def __init__(self, num_classes):
        super(I3D, self).__init__()
        self.model = r3d_18(weights="KINETICS400_V1")
        self.model.fc = nn.Linear(self.model.fc.in_features, num_classes)

    def forward(self, x):
        # Permute x to [batch_size, channels, num_frames, height, width]
        x = x.permute(0, 2, 1, 3, 4)
        return self.model(x)
    

# Function to load the model on CPU
def load_i3d_model(model_path, device=torch.device('cpu')):
    model = I3D(num_classes=11)  # Initialize the I3D model
    
    # Load the state dictionary with map_location set to CPU
    state_dict = torch.load(model_path, map_location=device)
    # Handle models saved with DataParallel (if the keys start with 'module.')
    if 'module.' in list(state_dict.keys())[0]:
        state_dict = {k.replace('module.', ''): v for k, v in state_dict.items()}

    model.load_state_dict(state_dict)
    
    # Set model to evaluation mode and ensure it is on the CPU
    model.to(device)
    model.eval()
    
    return model


# Load the LSTM model
try:
    model_path = os.path.join(os.getcwd(), 'model_lstm(1).keras')
    model = load_model(model_path)
    print(f"LSTM Model loaded successfully from {model_path}")
except Exception as e:
    print(f"Error loading LSTM model: {e}")
    raise HTTPException(status_code=500, detail=f"Error loading LSTM model: {e}")

# Load the I3D video model
# Load the I3D model
try:
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    i3d_model_path = os.path.join(os.getcwd(), 'i3d_model.pth')
    # Load the model with map_location to CPU
    i3d_model = load_i3d_model(i3d_model_path, device)
    print(f"I3D Model loaded successfully from {i3d_model_path}")
except Exception as e:
    print(f"Error loading I3D model: {e}")
    raise HTTPException(status_code=500, detail=f"Error loading I3D model: {e}")


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



# try:
#     # Load the Random Forest model
#     rf_model_path = os.path.join(os.getcwd(), 'symptom_model.pkl')
#     rf_model = joblib.load(rf_model_path)  # Load the Random Forest model
#     print(f"Random Forest Model loaded successfully")

#     # Mapping of label to disease name
#     label_mapping_2 = {0: 'mastitis', 1: 'blackleg', 2: 'bloat', 3: 'coccidiosis', 4: 'cryptosporidiosis', 
#                        5: 'displaced_abomasum', 6: 'gut_worms', 7: 'listeriosis', 8: 'liver_fluke', 
#                        9: 'necrotic_enteritis', 10: 'peri_weaning_diarrhoea', 11: 'rift_valley_fever', 
#                        12: 'rumen_acidosis', 13: 'traumatic_reticulitis', 14: 'calf_diphtheria', 
#                        15: 'foot_rot', 16: 'foot_and_mouth', 17: 'ragwort_poisoning', 18: 'wooden_tongue', 
#                        19: 'infectious_bovine_rhinotracheitis', 20: 'acetonaemia', 21: 'fatty_liver_syndrome', 
#                        22: 'calf_pneumonia', 23: 'schmallen_berg_virus', 24: 'trypanosomosis', 25: 'fog_fever'}

# except Exception as e:
#     print(f"Error loading Random Forest model: {e}")
#     raise HTTPException(status_code=500, detail=f"Error loading Random Forest model: {e}")

# # Pydantic model for input validation (Random Forest input)
# class CowHealthInput(BaseModel):
#     anorexia: int
#     abdominal_pain: int
#     anaemia: int
#     abortions: int
#     acetone: int
#     aggression: int
#     arthrogyposis: int
#     ankylosis: int
#     anxiety: int
#     bellowing: int
#     blood_loss: int
#     blood_poisoning: int
#     blisters: int
#     colic: int
#     Condemnation_of_livers: int
#     conjunctivae: int
#     coughing: int
#     depression: int
#     discomfort: int
#     dyspnea: int
#     dysentery: int
#     diarrhoea: int
#     dehydration: int
#     drooling: int
#     dull: int
#     decreased_fertility: int
#     diffculty_breath: int
#     emaciation: int
#     encephalitis: int
#     fever: int
#     facial_paralysis: int
#     frothing_of_mouth: int
#     frothing: int
#     gaseous_stomach: int
#     highly_diarrhoea: int
#     high_pulse_rate: int
#     high_temp: int
#     high_proportion: int
#     hyperaemia: int
#     hydrocephalus: int
#     isolation_from_herd: int
#     infertility: int
#     intermittent_fever: int
#     jaundice: int
#     ketosis: int
#     loss_of_appetite: int
#     lameness: int
#     lack_of_coordination: int
#     lethargy: int
#     lacrimation: int
#     milk_flakes: int
#     milk_watery: int
#     milk_clots: int
#     mild_diarrhoea: int
#     moaning: int
#     mucosal_lesions: int
#     milk_fever: int
#     nausea: int
#     nasel_discharges: int
#     oedema: int
#     pain: int
#     painful_tongue: int
#     pneumonia: int
#     photo_sensitization: int
#     quivering_lips: int
#     reduction_milk_vields: int
#     rapid_breathing: int
#     rumenstasis: int
#     reduced_rumination: int
#     reduced_fertility: int
#     reduced_fat: int
#     reduces_feed_intake: int
#     raised_breathing: int
#     stomach_pain: int
#     salivation: int
#     stillbirths: int
#     shallow_breathing: int
#     swollen_pharyngeal: int
#     swelling: int
#     saliva: int
#     swollen_tongue: int
#     tachycardia: int
#     torticollis: int
#     udder_swelling: int
#     udder_heat: int
#     udder_hardeness: int
#     udder_redness: int
#     udder_pain: int
#     unwillingness_to_move: int
#     ulcers: int
#     vomiting: int
#     weight_loss: int
#     weakness: int

# @app.post("/symptoms")
# async def predict_cow_health(data: CowHealthInput):
#     try:
#         # Log input data
#         input_data = np.array([[
#             data.anorexia,
#             data.abdominal_pain,
#             data.anaemia,
#             data.abortions,
#             data.acetone,
#             data.aggression,
#             data.arthrogyposis,
#             data.ankylosis,
#             data.anxiety,
#             data.bellowing,
#             data.blood_loss,
#             data.blood_poisoning,
#             data.blisters,
#             data.colic,
#             data.Condemnation_of_livers,
#             data.conjunctivae,
#             data.coughing,
#             data.depression,
#             data.discomfort,
#             data.dyspnea,
#             data.dysentery,
#             data.diarrhoea,
#             data.dehydration,
#             data.drooling,
#             data.dull,
#             data.decreased_fertility,
#             data.diffculty_breath,
#             data.emaciation,
#             data.encephalitis,
#             data.fever,
#             data.facial_paralysis,
#             data.frothing_of_mouth,
#             data.frothing,
#             data.gaseous_stomach,
#             data.highly_diarrhoea,
#             data.high_pulse_rate,
#             data.high_temp,
#             data.high_proportion,
#             data.hyperaemia,
#             data.hydrocephalus,
#             data.isolation_from_herd,
#             data.infertility,
#             data.intermittent_fever,
#             data.jaundice,
#             data.ketosis,
#             data.loss_of_appetite,
#             data.lameness,
#             data.lack_of_coordination,
#             data.lethargy,
#             data.lacrimation,
#             data.milk_flakes,
#             data.milk_watery,
#             data.milk_clots,
#             data.mild_diarrhoea,
#             data.moaning,
#             data.mucosal_lesions,
#             data.milk_fever,
#             data.nausea,
#             data.nasel_discharges,
#             data.oedema,
#             data.pain,
#             data.painful_tongue,
#             data.pneumonia,
#             data.photo_sensitization,
#             data.quivering_lips,
#             data.reduction_milk_vields,
#             data.rapid_breathing,
#             data.rumenstasis,
#             data.reduced_rumination,
#             data.reduced_fertility,
#             data.reduced_fat,
#             data.reduces_feed_intake,
#             data.raised_breathing,
#             data.stomach_pain,
#             data.salivation,
#             data.stillbirths,
#             data.shallow_breathing,
#             data.swollen_pharyngeal,
#             data.swelling,
#             data.saliva,
#             data.swollen_tongue,
#             data.tachycardia,
#             data.torticollis,
#             data.udder_swelling,
#             data.udder_heat,
#             data.udder_hardeness,
#             data.udder_redness,
#             data.udder_pain,
#             data.unwillingness_to_move,
#             data.ulcers,
#             data.vomiting,
#             data.weight_loss,
#             data.weakness
#         ]])
#         print(f"Received input for cow health prediction: {input_data}")

#         # Predict using the Random Forest model
#         prediction = rf_model.predict(input_data)[0]
#         prediction_label = label_mapping_2.get(prediction, "Unknown")
#         print(f"Predicted cow disease: {prediction_label}")

#         # Return the prediction result
#         return {
#             "predicted_cow_disease": prediction_label
#         }
#     except Exception as e:
#         print(f"Error during cow health prediction: {e}")
#         raise HTTPException(status_code=500, detail=f"Error during cow health prediction: {e}")



# Disease class names for LSTM
disease_names = ['oestrus', 'calving', 'lameness', 'mastitis', 'LPS', 'other_disease', 'accidents', 'OK']

# Pydantic model for input validation (LSTM input)
class ModelInput(BaseModel):
    IN_ALLEYS: list[float]
    REST: list[float]
    EAT: list[float]
    ACTIVITY_LEVEL: list[float]

# Helper function to prepare LSTM input
def prepare_lstm_input(data_dict):
    try:
        data = np.array([data_dict[key] for key in ['IN_ALLEYS', 'REST', 'EAT', 'ACTIVITY_LEVEL']]).T
        data = np.expand_dims(data, axis=0)  # Shape: (1, timesteps, features)
        print(f"Prepared LSTM input shape: {data.shape}")
        return data
    except Exception as e:
        raise ValueError(f"Error preparing LSTM input: {e}")

# LSTM Prediction endpoint
@app.post("/predict")
async def get_prediction(data: ModelInput):
    try:
        # Log input data
        input_data = {
            "IN_ALLEYS": data.IN_ALLEYS,
            "REST": data.REST,
            "EAT": data.EAT,
            "ACTIVITY_LEVEL": data.ACTIVITY_LEVEL
        }
        print(f"Received input: {input_data}")
        
        # Prepare input for LSTM
        lstm_input = prepare_lstm_input(input_data)
        
        # Predict using LSTM model
        try:
            predictions = model.predict(lstm_input)
            print(f"Raw LSTM predictions: {predictions}")
        except ValueError as ve:
            print(f"LSTM Model prediction error: {ve}")
            raise HTTPException(status_code=400, detail="Bad input data format")
        except Exception as e:
            print(f"Unexpected error during LSTM prediction: {e}")
            raise HTTPException(status_code=500, detail="Error during LSTM prediction")

        # Normalize predictions
        prediction_percentages = (predictions[0] / np.sum(predictions[0])) * 100
        print(f"LSTM Prediction percentages: {prediction_percentages}")

        # Return results
        return {
            "labels": disease_names,
            "values": prediction_percentages.tolist()
        }
    except Exception as e:
        print(f"Error during LSTM prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


# Helper function to preprocess video frames for I3D model
def preprocess_video_frames(frames):
    # Resize frames to 150x150 and normalize (if necessary)
    processed_frames = []
    for frame in frames:
        resized_frame = cv2.resize(frame, (150, 150))
        processed_frames.append(resized_frame)
    
    # Convert to numpy array, then to torch tensor
    processed_frames = np.array(processed_frames)
    processed_frames = processed_frames / 255.0  # Normalize if required
    processed_frames = np.transpose(processed_frames, (1,0,2,3))  # Convert to (C, T, H, W)
    
    # Add batch dimension and convert to torch tensor
    processed_frames = torch.tensor(processed_frames, dtype=torch.float32).unsqueeze(0)  # Shape: (1, C, T, H, W)
    processed_frames = processed_frames.permute(0, 2, 4, 1, 3)
    return processed_frames

# I3D Video Prediction endpoint (Accepts video path as a query parameter)
@app.get("/predict-video")
async def predict_video(video_path: str = Query(..., description="Path to the video file")):
    try:
        # Check if the video file exists
        if not os.path.exists(video_path):
            raise HTTPException(status_code=400, detail=f"Video file does not exist at path: {video_path}")

        # Load video and extract frames
        cap = cv2.VideoCapture(video_path)
        frames = []
        while len(frames) < 450:
            ret, frame = cap.read()
            if not ret:
                break
            frames.append(frame)
        cap.release()

        if len(frames) != 450:
            raise HTTPException(status_code=400, detail=f"Expected 450 frames, but got {len(frames)}")

        # Preprocess frames for the I3D model
        input_tensor = preprocess_video_frames(frames)

        # Log the input tensor shape
        print(f"Input tensor shape: {input_tensor.shape}")

        # Log the expected input shape of the I3D model
        expected_input_shape = list(i3d_model.parameters())[0].shape
        print(f"Expected input shape by the I3D model: {expected_input_shape}")

        # Perform prediction using the I3D model
        try:
            with torch.no_grad():
                print("Ahmed")
                output = i3d_model(input_tensor)
                print(output)
                predicted_label = torch.argmax(output, dim=1).item()
        except Exception as e:
            print(f"Model prediction error: {e}")
            raise HTTPException(status_code=500, detail="Error during I3D model prediction")

        # Return the predicted label
        return {
            "predicted_label": predicted_label
        }
    except Exception as e:
        print(f"Error processing video: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {e}")
