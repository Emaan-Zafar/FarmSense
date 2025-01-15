import {
  Box,
  Button,
  Card,
  Typography,
  CardMedia,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material';
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
  csvData: Array<{ [key: string]: any }>; // Flexible type for table rows
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

  const handleVideoChange = (event: SelectChangeEvent<string>) => {
    setSelectedVideo(event.target.value);
    setResponseData(null); // Clear previous predictions
  };

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
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ffffff', // Bright white for hover
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ffffff', // Bright white for focused state
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.7)', // Slightly translucent white
            },
            '& .MuiInputLabel-root': {
              color: 'white',
              '&.Mui-focused': {
                color: 'white',
              },
            },
            '& .MuiSelect-select': {
              color: 'white',
            },
            '& .MuiFormLabel-root.MuiInputLabel-shrink': {
              transform: 'translate(14px, -14px) scale(0.75)', // Adjust label position
            },
          }}
        >
          <InputLabel id="video-select-label">Select Video</InputLabel>
          <Select
            labelId="video-select-label"
            value={selectedVideo || ''}
            onChange={handleVideoChange}
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

          <Typography variant="h6" mb={2}>
            Annotated Video:
          </Typography>
          {responseData.annotatedVideoPath && (
            <Card
              sx={{
                mb: 3,
                borderRadius: 3,
                p: 2,
                backgroundColor: '#f5f5f5',
              }}
            >
              <CardMedia
                component="video"
                height="400"
                controls
                src={responseData.annotatedVideoPath}
                sx={{ borderRadius: 2 }}
              />
            </Card>
          )}

          {/* Display prediction table */}
          <Box>
            <Typography variant="h6" mb={2}>
              Behavior Prediction Table:
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {responseData.csvData.length > 0 &&
                      Object.keys(responseData.csvData[0]).map((key) => (
                        <TableCell key={key}>{key}</TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {responseData.csvData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, colIndex) => (
                        <TableCell key={colIndex}>{value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Box>
  );
}
