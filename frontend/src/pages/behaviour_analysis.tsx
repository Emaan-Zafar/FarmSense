import { Box, Button, Card, Typography, CardMedia, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnalyticsWebsiteVisitsLineChart } from 'src/components/dashboard_charts/linechart';

interface Video {
  _id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export default function Page() {
  const [videos, setVideos] = useState<Video[]>([]);  // List of videos
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null); // Selected video
  const [prediction, setPrediction] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch videos from the gallery API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/video-upload/videos');
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };
    fetchVideos();
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    const currentTimestamp = new Date().toLocaleString();
    setTimestamp(currentTimestamp);

    try {
      const response = await axios.get('http://localhost:4000/disease/predict-video', {
        params: { videoPath: selectedVideo }, // Pass the selected video to the backend
      });

      const predictedAction = response.data.predicted_label;
      let action = "";
      if (predictedAction === 0) {
        action = "Grazing";
      } else if (predictedAction === 1) {
        action = "Walking";
      } else if (predictedAction === 2) {
        action = "Ruminating-Standing";
      } else if (predictedAction === 3) {
        action = "Ruminating-Lying";
      } else if (predictedAction === 4) {
        action = "Resting-Standing";
      } else if (predictedAction === 5) {
        action = "Resting-Lying";
      } else if (predictedAction === 6) {
        action = "Drinking";
      } else if (predictedAction === 7) {
        action = "Grooming";
      } else if (predictedAction === 8) {
        action = "Other";
      } else if (predictedAction === 9) {
        action = "Hidden";
      } 
      else {
        action = "Running";
      }
      setPrediction(`Action Detected: ${action[predictedAction] || "Unknown"}`);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setPrediction('Error: Unable to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ ml: 4, mt: 2 }}>
      <Typography variant="h4" mb={3} sx={{ color: "white" }}>
        Behaviour Analysis
      </Typography>

      {/* Dropdown and Predict Button */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FormControl
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderColor: "white",
              color: "white",
            },
            "& .MuiInputLabel-root": {
              color: "white",
            },
            "& .MuiSelect-select": {
              color: "white",
            },
          }}
        >
          <InputLabel id="video-select-label">Select Video</InputLabel>
          <Select
            labelId="video-select-label"
            value={selectedVideo || ""}
            onChange={(e) => setSelectedVideo(e.target.value)}
          >
            {videos.map((video) => (
              <MenuItem
                key={video._id}
                value={`http://localhost:4000/uploaded-videos/${video.filePath}`}
              >
                {video.fileName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePredict}
          sx={{
            backgroundColor: "#30ac66",
            color: "white",
            "&:hover": { backgroundColor: "#f57c00" },
          }}
          disabled={!selectedVideo || loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Predict"}
        </Button>
      </Box>

      {/* Video Preview */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          p: 2,
          backgroundColor: "#f5f5f5",
          mr: 3,
        }}
      >
        <CardMedia
          component="video"
          height="400"
          controls
          src={selectedVideo || ""} // Always show the media player
          sx={{ borderRadius: 2 }}
        />
      </Card>

      {/* Prediction Output */}
      {prediction && (
        <Card
          sx={{
            p: 2,
            backgroundColor: "#e0f7fa",
            borderRadius: 3,
            minWidth: "250px",
            mb: 3,
          }}
        >
          <Typography variant="subtitle1">
            <strong>Timestamp:</strong> {timestamp}
          </Typography>
          <Typography variant="subtitle1">
            <strong>{prediction}</strong>
          </Typography>
        </Card>
      )}
    </Box>
  );
}
