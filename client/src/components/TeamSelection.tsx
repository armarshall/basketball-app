import { useState, useEffect } from 'react';
import axios from 'axios';
import teamService from '../services/team_service';

export default function TeamSelection() {
  // Save team and player states
  const [teams, setTeams] = useState([]);

  // Fetch teams from api
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/teams');
        setTeams(res.data);
      } catch (e) {
        console.error('Error fetching teams:', e);
      }
    };
    fetchTeams();
  }, []);

  const dummyPlayer = {
    _id: "68fae285c475c441b39bf744",
    name: "Test Player",
    dateOfBirth: "2010-05-15",
    password: "pass_hash",
    email: "test@te.com",
    id: "dd"
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>		
      {teams.map((team) => (
        <div key={team._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', alignItems: 'center', gap: 20 }}>
          <span style={{ fontWeight: 'bold', minWidth: '100px' }}>{team.name}</span>
          <span style={{ flex: 1 }}>
            {name} Team info
          </span>
          <button 
            type="button" 
            style={{
              padding: '10px 20px',
              fontSize: '16px'
            }}
            onClick={() => teamService.joinTeam(team._id, dummyPlayer)}
          >
            Join
          </button>
        </div>
      ))}
    </div>
  );
}