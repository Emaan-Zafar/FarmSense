import React, { ChangeEvent, forwardRef } from 'react';

interface FileUploaderProps {
  type: string;
  onUploadComplete: (response: any) => void;
}

// Use forwardRef to allow the ref prop to be passed in
const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ type, onUploadComplete }, ref) => {
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        fetch("http://localhost:4000/api/upload", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(`${type} upload successful`, data);
            onUploadComplete(data);
          })
          .catch((error) => console.error(`Error uploading ${type}:`, error));
      }
    };

    return (
      <input
        type="file"
        style={{ display: "none" }}
        accept=".csv"
        onChange={handleFileChange}
        ref={ref} // Attach the ref here
      />
    );
  }
);

export default FileUploader;
