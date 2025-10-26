import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeamSelection() {
  // Save team and player states
  const [teams, setTeams] = useState([]);

  // Fetch teams from api
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Get database teams data from api (setup in tournament_router.ts)
        const res = await axios.get('http://localhost:3000/api/teams');
        setTeams(res.data);
      } catch (e) {
        console.error('Error fetching teams:', e);
      }
    };
    fetchTeams();
  }, []);

  // Function to add a player to a team and teamId to a player
  const joinTeam = async (teamId, player) => {
    try {
      const team = teams.find(t => t._id === teamId);
      if (!team) throw new Error('Team not found');

      // determine if the player is a child or teenager
      const player_type = player.guardianId != null ? 'children' : 'teenagers';
      
      // First update the player with the teamId
      const playerRes = await axios.patch(`http://localhost:3000/api/${player_type}/${player._id}`, {
        teamId: teamId
      });

      if (!playerRes.data) throw new Error('Failed to update player');
      
      // Then update the team with the new player
      const teamRes = await axios.patch(`http://localhost:3000/api/teams/${teamId}`, {
        player: player._id // Send the updated player data
      });

      if (teamRes.data) {
        alert(`Successfully joined ${team.name}!`);
      }

    } catch (error) {
      console.error('Error joining team:', error);
      alert('Failed to join team: ' + (error.response?.data?.error || error.message));
    }
  };

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
            onClick={() => joinTeam(team._id, dummyPlayer)}
          >
            Join
          </button>
        </div>
      ))}
    </div>
  );
}