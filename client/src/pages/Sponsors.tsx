// client/src/pages/Sponsors.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Image {
  _id: string;
  filename: string;
  url: string;
  uploadDate: string;
}

function Sponsors() {
  const [sponsorImages, setSponsorImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsorImages();
  }, []);

  const fetchSponsorImages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/images');
      setSponsorImages(response.data);
    } catch (error) {
      console.error('Error fetching sponsor images:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSponsorName = (filename: string): string => {
    const cleanName = filename
      .replace(/\d+-/g, '') // Remove timestamp
      .replace(/\.\w+$/, '') // Remove file extension
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .toUpperCase(); // Convert to uppercase
    
    return cleanName;
  };

  if (loading) return <div>Loading sponsors...</div>;

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Our Sponsors</h1>
      <p>Thank you to our amazing sponsors who support our team:</p>
      
      {sponsorImages.length === 0 ? (
        <p>No sponsor images found.</p>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '40px',
          marginTop: '40px'
        }}>
          {sponsorImages.map((image) => (
            <div 
              key={image._id}
              style={{
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <img 
                src={image.url} 
                alt="Sponsor logo"
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}
              />
              
              <h3 style={{ margin: '15px 0 5px 0' }}>
                {getSponsorName(image.filename)}
              </h3>
              
              <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>
                Official Partner
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sponsors;