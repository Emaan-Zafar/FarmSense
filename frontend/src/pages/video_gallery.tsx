import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
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

      <DashboardLayout>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2, ml: 4, mr: 4 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'left', mr: 10 }}>
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

        <div>
          {videos.map((video) => (
            <div key={video._id}>
              <h2>{video.fileName}</h2>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video controls>
                <source src={`http://localhost:4000/uploads/videos/${video.filePath}`} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
      </DashboardLayout>

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
        // anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
