import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      await axios.post('http://localhost:5000/upload', formData);
      alert('Image uploaded!');
    } catch (error) {
      console.error('Upload failed:', error);
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

// MAKE SURE THIS LINE IS AT THE END:
export default ImageUpload;