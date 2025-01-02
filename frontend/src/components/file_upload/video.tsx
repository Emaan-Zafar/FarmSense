import React, { ChangeEvent, forwardRef } from "react";

interface VideoUploaderProps {
  type: string;
  onUploadComplete: (response: any) => void;
//   apiUrl?: string; // Optional API URL override
}

const VideoUploader = forwardRef<HTMLInputElement, VideoUploaderProps>(
  ({ type, onUploadComplete}, ref) => {
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file) {
        // Validate file type (only allow videos)
        const allowedTypes = ["video/mp4", "video/avi", "video/mov"];
        if (!allowedTypes.includes(file.type)) {
          alert("Invalid file type. Please upload a video file.");
          return;
        }

        const formData = new FormData();
        formData.append("video", file);
        formData.append("type", type);

        fetch("http://localhost:4000/api/video-upload", {
            method: "POST",
            body: formData,
          })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Upload failed with status ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log(`${type} upload successful`, data);
            onUploadComplete(data);
          })
          .catch((error) => {
            console.error(`Error uploading ${type}:`, error);
            alert(`Error uploading ${type}. Please try again.`);
          });
      }
    };

    return (
      <input
        type="file"
        style={{ display: "none" }}
        accept="video/*" // Limit selection to video files
        onChange={handleFileChange}
        ref={ref} // Attach the ref here
      />
    );
  }
);

export default VideoUploader;
