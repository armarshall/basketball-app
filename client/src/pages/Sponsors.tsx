// client/src/pages/Sponsors.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Sponsor {
  _id: string;
  name: string;
  description: string;
  logoUrl: string;
  website?: string;
}

function Sponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/sponsors');
      setSponsors(response.data);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading sponsors...</div>;

  return (
    <div>
      <h1>Our Sponsors</h1>
      {sponsors.map(sponsor => (
        <div key={sponsor._id}>
          <img src={sponsor.logoUrl} alt={sponsor.name} />
          <h3>{sponsor.name}</h3>
          <p>{sponsor.description}</p>
        </div>
      ))}
    </div>
  );
}

export default Sponsors;