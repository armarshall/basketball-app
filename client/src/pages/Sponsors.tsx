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

  // MANUALLY SET YOUR SPONSOR NAMES AND DESCRIPTIONS FOR THE SPONSORS
  const sponsorData = [
    { name: "Baltimore City", description: "Official Apparel Partner" },
    { name: "WILSON", description: "Official Sports Drink" },
    { name: "GATORADE", description: "Official Ball Provider" },
    { name: "Nike", description: "Official Host City"}
  ];

  if (loading) {
    return <div>Loading sponsors...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Our Sponsors</h1>
      <p>Thank you to our amazing sponsors who support our Baltimore Basketball League:</p>
      
      {sponsorImages.length === 0 ? (
        <p>No sponsor images found in database.</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          marginTop: '40px'
        }}>
          {sponsorImages.map((image, index) => (
            <div 
              key={image._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <img 
                src={image.url} 
                alt="Sponsor logo"
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'contain',
                  marginBottom: '15px'
                }}
              />
              
              {/* Use manual sponsor names instead of filenames */}
              <h3 style={{ margin: '10px 0', color: '#333' }}>
                {sponsorData[index]?.name || "Sponsor"}
              </h3>
              
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                {sponsorData[index]?.description || "Official Partner"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sponsors;