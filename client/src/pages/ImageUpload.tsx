import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile); // Multer expects 'image' field name

    try {
      const response = await axios.post('http://localhost:3000/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        alert('Image uploaded successfully!');
      } else {
        alert('Upload failed: ' + response.data.error);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Image</h2>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
      />
      <button onClick={handleUpload}>Upload Image</button>
    </div>
  );
}

export default ImageUpload;