import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      await axios.post('http://localhost:3000/api/images/upload', formData)
      alert('Image uploaded!');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
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