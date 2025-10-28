import axios from 'axios';

const teamService = {
  // Function to add a player to a team and teamId to a player
  joinTeam: async (teamId, player) => {
    try {
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
        alert(`Successfully joined ${teamRes.data.name}!`);
      }

    } catch (error) {
      console.error('Error joining team:', error);
      alert('Failed to join team: ' + (error.response?.data?.error || error.message));
    }
  },
}

export default teamService;