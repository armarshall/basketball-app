import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage(null);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file first!' });
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setUploading(true);
      setMessage(null);
      
      const response = await axios.post('http://localhost:3000/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage({ type: 'success', text: 'Image uploaded successfully! Check the Sponsors page to see it.' });
      setSelectedFile(null);
      setPreview(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      console.log('Upload response:', response.data);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setMessage({ 
        type: 'error', 
        text: 'Upload failed: ' + (error.response?.data?.error || error.message)
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Upload Sponsor Logo</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Select an image file to upload as a sponsor logo:
      </p>
      
      <div style={{ 
        border: '2px dashed #ccc', 
        borderRadius: '8px', 
        padding: '30px',
        marginBottom: '20px',
        backgroundColor: '#fafafa'
      }}>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileSelect}
          style={{ marginBottom: '20px' }}
          disabled={uploading}
        />
        
        {preview && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Preview:</p>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ 
                maxWidth: '300px', 
                maxHeight: '300px',
                objectFit: 'contain',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
                backgroundColor: 'white'
              }} 
            />
          </div>
        )}
      </div>
      
      <button 
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        style={{
          padding: '12px 30px',
          backgroundColor: !selectedFile || uploading ? '#ccc' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
      
      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;