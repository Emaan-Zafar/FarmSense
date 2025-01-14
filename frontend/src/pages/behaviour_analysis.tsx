import { Box, Button, Card, Typography, CardMedia, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Video {
  _id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

interface ResponseData {
  message: string;
  annotatedVideoPath: string;
}

export default function Page() {
  const [videos, setVideos] = useState<Video[]>([]); // List of videos
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null); // Selected video
  const [responseData, setResponseData] = useState<ResponseData | null>(null); // Prediction response
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

  // Handle prediction
  const handlePredict = async () => {
    setLoading(true);
    setTimestamp(new Date().toLocaleString());

    try {
      const videoFileName = selectedVideo?.split('/').pop(); // Extract the file name from the video URL
      if (videoFileName) {
        const response = await axios.get('http://localhost:4000/disease/predict-video', {
          params: { videoPath: videoFileName },
        });
        setResponseData(response.data); // Save the response data
      } else {
        console.error('No video selected');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ ml: 4, mt: 2 }}>
      <Typography variant="h4" mb={3} sx={{ color: 'white' }}>
        Behaviour Analysis
      </Typography>

      {/* Dropdown and Predict Button */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FormControl
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderColor: 'white',
              color: 'white',
            },
            '& .MuiInputLabel-root': {
              color: 'white',
            },
            '& .MuiSelect-select': {
              color: 'white',
            },
          }}
        >
          <InputLabel id="video-select-label">Select Video</InputLabel>
          <Select
            labelId="video-select-label"
            value={selectedVideo || ''}
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
            backgroundColor: '#30ac66',
            color: 'white',
            '&:hover': { backgroundColor: '#f57c00' },
          }}
          disabled={!selectedVideo || loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Predict'}
        </Button>
      </Box>

      {/* Video Preview */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          p: 2,
          backgroundColor: '#f5f5f5',
          mr: 3,
        }}
      >
        <CardMedia
          component="video"
          height="400"
          controls
          src={selectedVideo || ''}
          sx={{ borderRadius: 2 }}
        />
      </Card>

      {/* Display prediction output */}
      {responseData && (
        <>
          {/* Display message */}
          <Card
            sx={{
              p: 2,
              backgroundColor: '#e0f7fa',
              borderRadius: 3,
              minWidth: '250px',
              mb: 3,
            }}
          >
            <Typography variant="subtitle1">
              <strong>Message:</strong> {responseData.message}
            </Typography>
          </Card>

          {/* Display annotated video */}
          {responseData.annotatedVideoPath && (
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Annotated Video Result:
              </Typography>
              <video controls width="600">
                <source src={responseData.annotatedVideoPath} type="video/mp4" />
                <track
                  kind="captions"
                  src="captions.vtt" // Optional: Provide a valid path for captions
                  srcLang="en"
                  label="English"
                />
                Your browser does not support the video tag.
              </video>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
