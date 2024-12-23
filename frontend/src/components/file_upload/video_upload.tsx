import { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import axios from 'axios';

interface VideoUploaderProps {
  onUploadSuccess: (filePath: string) => void;
}

export default function VideoUploader({ onUploadSuccess }: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    // Generate a preview URL for the selected video file
    if (videoFile) {
      const previewUrl = URL.createObjectURL(videoFile);
      onUploadSuccess(previewUrl);

      // Clean up the preview URL when component unmounts or file changes
      return () => URL.revokeObjectURL(previewUrl);
    }
    
    return undefined; // Add this line for consistent return
  }, [videoFile, onUploadSuccess]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setVideoFile(file);
  };

  return (
    <div>
      <label htmlFor="video-upload">
        <Button
          variant="contained"
          sx={{ backgroundColor: '#30ac66', color: 'white', '&:hover': { backgroundColor: '#f57c00' } }}
          component="span"
        >
          Select Video
        </Button>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="video-upload"
        />
      </label>

      {videoFile && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Selected file: {videoFile.name}
        </Typography>
      )}
    </div>
  );
}
