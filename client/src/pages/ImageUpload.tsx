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
    formData.append('image', selectedFile);

    try {
      await axios.post('http://localhost:3000/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Upload Sponsor Logo</h2>
      <p>Select an image file to upload as a sponsor logo:</p>
      
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
        style={{ margin: '20px 0' }}
      />
      <br />
      <button onClick={handleUpload}>Upload Image</button>
    </div>
  );
}

export default ImageUpload;