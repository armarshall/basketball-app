// client/src/pages/Sponsors.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Image {
  _id: string;
  filename: string;
  originalFilename?: string;
  url: string;
  uploadDate: string;
}

function Sponsors() {
  const [sponsorImages, setSponsorImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSponsorImages();
  }, []);

  const fetchSponsorImages = async () => {
    try {
      setError(null);
      // ✅ FIX: Use the correct sponsor-specific endpoint
      const response = await axios.get('http://localhost:3000/api/images/sponsors');
      setSponsorImages(response.data);
    } catch (error) {
      console.error('Error fetching sponsor images:', error);
      setError('Failed to load sponsors. Please try again later.');
      
      // Fallback: try the general images endpoint
      try {
        const fallbackResponse = await axios.get('http://localhost:3000/api/images');
        setSponsorImages(fallbackResponse.data);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Add function to handle relative image URLs
  const getImageUrl = (url: string): string => {
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a relative path, prepend the server URL
    if (url.startsWith('/')) {
      return `http://localhost:3000${url}`;
    }
    
    // Default case
    return url;
  };

  const getSponsorName = (filename: string, originalFilename?: string): string => {
    // Use original filename if available, otherwise use the generated filename
    const nameToProcess = originalFilename || filename;
    // Known sponsor mappings for common brands
    const nameMap: { [key: string]: string } = {
      'nike': 'Nike',
      'gatorade': 'Gatorade',
      'wilson': 'Wilson',
      'baltimore': 'Baltimore City',
      'adidas': 'Adidas',
      'underarmour': 'Under Armour',
      'under-armour': 'Under Armour',
      'spalding': 'Spalding',
      'puma': 'Puma',
      'reebok': 'Reebok',
      'jordan': 'Air Jordan',
      'champion': 'Champion',
      'new-balance': 'New Balance',
      'newbalance': 'New Balance',
    };

    // Check for known sponsors first (case-insensitive)
    const lowerFilename = nameToProcess.toLowerCase();
    for (const [key, value] of Object.entries(nameMap)) {
      if (lowerFilename.includes(key)) {
        return value;
      }
    }

    // Fallback: clean up the filename automatically
    let cleanName = nameToProcess
      // Remove file extension
      .replace(/\.\w+$/, '')
      // Remove "sponsor-" prefix
      .replace(/^sponsor-/i, '')
      // Remove "team-" prefix if present
      .replace(/^team-/i, '')
      // Remove timestamps (e.g., 1234567890-123456789)
      .replace(/\d{10,}-\d+/g, '')
      // Remove standalone numbers with dashes
      .replace(/\d+-/g, '')
      .replace(/-\d+/g, '')
      // Replace underscores and dashes with spaces
      .replace(/[-_]/g, ' ')
      // Remove common words
      .replace(/\b(logo|image|sponsor|png|jpg|jpeg|gif)\b/gi, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    // Capitalize each word properly
    cleanName = cleanName
      .split(' ')
      .map(word => {
        // Skip empty strings
        if (!word) return '';
        
        // Handle all caps acronyms (e.g., NBA, UFC)
        if (word.length <= 4 && word.toUpperCase() === word) {
          return word.toUpperCase();
        }
        
        // Capitalize first letter of each word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .filter(word => word.length > 0)
      .join(' ');
    
    // If we couldn't extract a clean name, show the filename without extension
    if (!cleanName) {
      const filenameWithoutExt = nameToProcess.replace(/\.\w+$/, '');
      return filenameWithoutExt || 'Unnamed Sponsor';
    }
    
    return cleanName;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading sponsors...</div>
      </div>
    );
  }

  if (error && sponsorImages.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: '#d32f2f', marginBottom: '20px' }}>{error}</div>
        <button 
          onClick={fetchSponsorImages}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Our Sponsors</h1>
      <p>Thank you to our amazing sponsors who support our team:</p>
      
      {sponsorImages.length === 0 ? (
        <div style={{ padding: '40px', color: '#666' }}>
          <p>No sponsor images found.</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Check if sponsor images exist in your database.
          </p>
        </div>
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
                textAlign: 'center',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                minWidth: '250px'
              }}
            >
              {/* ✅ FIX: Use getImageUrl to handle relative paths */}
              <img 
                src={getImageUrl(image.url)} 
                alt={`${getSponsorName(image.filename, image.originalFilename)} logo`}
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  console.error('❌ Failed to load sponsor image:', image.url);
                  // Try alternative approach
                  const directUrl = image.url.replace('http://localhost:3000', '');
                  if (e.currentTarget.src !== directUrl) {
                    e.currentTarget.src = directUrl;
                  } else {
                    // Fallback to placeholder
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5TcG9uc29yIExvZ288L3RleHQ+Cjwvc3ZnPg==';
                  }
                }}
                onLoad={() => console.log('✅ Sponsor image loaded successfully')}
              />
              
              <h3 style={{ margin: '15px 0 5px 0' }}>
                {getSponsorName(image.filename, image.originalFilename)}
              </h3>
              
              <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>
                Official Partner
              </p>
              
              <p style={{ color: '#999', fontSize: '12px', margin: '5px 0 0 0' }}>
                Added: {new Date(image.uploadDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sponsors;