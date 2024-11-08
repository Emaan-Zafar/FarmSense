// VideoUploader.tsx
import { useState } from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

interface VideoUploaderProps {
  onUploadSuccess: (filePath: string) => void;
}

export default function VideoUploader({ onUploadSuccess }: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setVideoFile(file);
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await axios.post('http://localhost:4000/api/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Call the callback with the uploaded video path
      onUploadSuccess(response.data.filePath);
    } catch (error) {
      console.error('Video upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label htmlFor="video-upload">
        <Button variant="contained" component="span">
          Select Video
        </Button>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the input
          id="video-upload" // Set the id here for association
        />
      </label>

      {videoFile && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Selected file: {videoFile.name}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!videoFile || uploading}
        sx={{ mt: 2 }}
      >
        {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload Video'}
      </Button>
    </div>
  );
}
