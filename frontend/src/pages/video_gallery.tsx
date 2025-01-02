import { Box, Button, Typography, Snackbar, Alert, Grid, Paper } from '@mui/material';
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { Iconify } from 'src/components/iconify';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import VideoUploader from 'src/components/file_upload/video';
import axios from 'axios';

interface Video {
  _id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export default function VideoGallery() {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<Video[]>([]); 
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message

  // Function to fetch videos
  const fetchVideos = useCallback(async () => {
    const res = await axios.get('http://localhost:4000/api/video-upload/videos');
    setVideos(res.data);
  }, []);

  // Fetch videos when component mounts
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Handle video upload completion
  const handleUploadComplete = (response: any) => {
    console.log("Video uploaded:", response);
    fetchVideos(); // Refresh the video list
    setSnackbarMessage('Video uploaded successfully!');
    setOpenSnackbar(true); // Show success message in snackbar
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Helmet>
        <title>{`Video Gallery - ${CONFIG.appName}`}</title>
      </Helmet>

        <Box display="flex" alignItems="left" mb={5} marginTop={2} sx={{ px: 4}}>
          <Typography variant="h4" sx={{ color: 'white', flexGrow: 1 }}>
            Video Gallery
          </Typography>

          <Button
            variant="contained"
            sx={{ backgroundColor: '#30ac66', color: 'white', '&:hover': { backgroundColor: '#f57c00' } }}
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => videoInputRef.current?.click()}
          >
            Upload Video
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, px: 4 }}>
          {videos.map((video) => (
            <Box key={video._id} sx={{ backgroundColor: '#7b8687', borderRadius: 2, boxShadow: 2, padding: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                {video.fileName}
              </Typography>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video controls width="100%">
                <source src={`http://localhost:4000/uploaded-videos/${video.filePath}`} type="video/mp4" />
                <track kind="subtitles" srcLang="en" label="English" />
              </video>
              <Typography
                variant="body2"
                  sx={{
                    color: 'black',
                    textAlign: 'center',
                    marginTop: 1,
                    fontSize: '0.875rem', // Small font size
                  }}
                >
                  Uploaded At: {new Date(video.uploadedAt).toLocaleString()}
                </Typography>
            </Box>
          ))}
        </Box>

      {/* Video uploader */}
      <VideoUploader
        type="video"
        onUploadComplete={handleUploadComplete}
        ref={videoInputRef}
      />

      {/* Snackbar for success message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
