import { Box, Button, Card, Typography, CardMedia, CircularProgress } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { AnalyticsWebsiteVisitsLineChart } from 'src/components/dashboard_charts/linechart'; // Adjust the import path accordingly
import VideoUploader from 'src/components/file_upload/video_upload';

// ----------------------------------------------------------------------

export default function Page() {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // State for loading
  const [videoPath, setVideoPath] = useState<string | null>(null);

  const handlePredict = async () => {
    // Set loading to true when the prediction is being fetched
    setLoading(true);

    // Set the current time as timestamp when the button is clicked
    const currentTimestamp = new Date().toLocaleString();
    setTimestamp(currentTimestamp);

    try {
      // Make an API call to the backend
      const response = await axios.get('http://localhost:4000/disease/predict-video');
      
      // Update the prediction with the response from the API
      const predictedAction = response.data.predicted_label;  // Adjust this based on the API response structure
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
    
      // Set the translated prediction
      setPrediction(`Action Detected: ${action}`);


    } catch (error) {
      console.error('Error fetching prediction:', error);
      setPrediction('Error: Unable to fetch prediction');
    } finally {
      // Set loading to false after the API call is complete
      setLoading(false);
    }
  };

  // Dummy data for the line chart for 4 cows
  const dummyChartData = {
    series: [
      {
        name: "6610",
        data: [10, 15, 12, 25, 30, 28, 35, 40], // Activity levels for Cow 1
      },
      {
        name: "6612",
        data: [5, 20, 18, 30, 25, 35, 40, 50], // Activity levels for Cow 2
      },
      {
        name: "6613",
        data: [15, 10, 25, 20, 30, 40, 45, 50], // Activity levels for Cow 3
      },
      {
        name: "6629",
        data: [20, 30, 25, 35, 40, 50, 55, 60], // Activity levels for Cow 4
      },
    ],
    categories: [
      "2023-10-01", 
      "2023-10-02", 
      "2023-10-03", 
      "2023-10-04", 
      "2023-10-05", 
      "2023-10-06", 
      "2023-10-07", 
      "2023-10-08" // Dates for the activity levels
    ],
  };

  // Define colors for the cows
  const chartColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1']; // Different colors for each cow

  return (
    <Box sx={{ ml: 4, mt: 2 }}>
      <Typography variant="h4" mb={3}>
        Behaviour Analysis
      </Typography>

      <VideoUploader onUploadSuccess={setVideoPath} />

      {/* Video Box */}
      {videoPath && (
        <Card sx={{ mb: 3, borderRadius: 3, p: 2, backgroundColor: '#f5f5f5', mr: 3 }}>
          <CardMedia
            component="video"
            height="400"
            controls
            src={videoPath}  // Dynamically set the video path from the uploader
            sx={{ borderRadius: 2 }}
          />
        </Card>
      )}

      {/* Predict Button and Output Card Side by Side */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mr={3}>
        {/* Predict Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handlePredict}
          sx={{ backgroundColor: '#30ac66', color: 'white', '&:hover': { backgroundColor: '#f57c00' } }}
          disabled={loading} // Disable the button while loading
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Predict'}
        </Button>

        {/* Prediction Output */}
        {prediction && (
          <Card sx={{ p: 2, backgroundColor: '#e0f7fa', borderRadius: 3, minWidth: '250px' }}>
            <Typography variant="subtitle1">
              <strong>Timestamp:</strong> {timestamp}
            </Typography>
            <Typography variant="subtitle1">
              <strong>{prediction}</strong>
            </Typography>
          </Card>
        )}
      </Box>

      {/* Line Chart with Dummy Data */}
      <Box sx={{ mb: 3, mr: 3 }}>
        <AnalyticsWebsiteVisitsLineChart
          title="Cow Activity Over Time"
          subheader="Activity Levels"
          chart={{
            series: dummyChartData.series.map((series, index) => ({
              ...series,
              color: chartColors[index], // Assigning colors to each cow
            })),
            categories: dummyChartData.categories,
          }}
          tooltipLabel="Activity Level"
        />
      </Box>
    </Box>
  );
}
