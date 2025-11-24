import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ADD THIS IMPORT
import axios from "axios";
import { get_user_data } from "../services/session_service";

interface Team {
  _id: string;
  name: string;
  players: any[];
  teamSettings?: {
    teamImage?: string;
    jerseyColor?: string;
    primaryColor?: string;
    practiceDays?: string[];
    practiceTime?: string;
    maxPlayers?: number;
  };
}

interface Player {
  _id: string;
  name: string;
  email: string;
}

export default function ManagerProfile() {
  const navigate = useNavigate(); // ADD THIS HOOK
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [playerEmail, setPlayerEmail] = useState("");

  const getTeamImageUrl = (teamImage: string | undefined): string => {
    if (!teamImage) {
      return 'https://via.placeholder.com/120x120/cccccc/969696?text=No+Image';
    }
    
    if (teamImage.startsWith('http')) {
      return teamImage;
    }
    
    if (teamImage.startsWith('/uploads/')) {
      return `http://localhost:3000${teamImage}`;
    }
    
    if (teamImage.includes('team-')) {
      return `http://localhost:3000/uploads/teams/${teamImage}`;
    }
    
    return 'https://via.placeholder.com/120x120/cccccc/969696?text=No+Image';
  };

  useEffect(() => {
    const initialize = async () => {
      const userData = get_user_data();
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        if (user.managedTeamId) {
          await fetchTeamData(user.managedTeamId, user._id || user.id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const fetchTeamData = async (teamId: string, guardianId: string) => {
    try {
      const teamRes = await axios.get(`http://localhost:3000/api/teams/${teamId}/manage`, {
        params: { guardianId }
      });
      setTeam(teamRes.data);

      const playersRes = await axios.get(`http://localhost:3000/api/teams/${teamId}/players`);
      setPlayers(playersRes.data);

    } catch (err: any) {
      console.error("Error fetching team data:", err);
      alert(err?.response?.data?.error || "Error loading team data");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!team || !currentUser) return;

    if (!confirm("Are you sure you want to remove this player from the team?")) {
      return;
    }

    try {
      const guardianId = currentUser._id || currentUser.id;
      
      await axios.post(`http://localhost:3000/api/teams/${team._id}/remove-player`, {
        playerId,
        guardianId
      });

      await fetchTeamData(team._id, guardianId);
      alert("Player removed successfully!");
    } catch (err: any) {
      console.error("Error removing player:", err);
      alert(err?.response?.data?.error || "Error removing player");
    }
  };

  const handleAddPlayer = async () => {
    if (!team || !currentUser || !playerEmail.trim()) return;

    setAddingPlayer(true);
    try {
      const guardianId = currentUser._id || currentUser.id;
      
      const res = await axios.post(`http://localhost:3000/api/teams/${team._id}/add-player`, {
        playerEmail: playerEmail.trim(),
        guardianId
      });

      alert(`Player ${playerEmail} has been added to the team!`);
      
      setPlayerEmail("");
      await fetchTeamData(team._id, guardianId);
    } catch (err: any) {
      console.error("Error adding player:", err);
      alert(err?.response?.data?.error || "Error adding player");
    } finally {
      setAddingPlayer(false);
    }
  };

  // FIXED: Navigation handlers using React Router
  const handleTeamSettings = () => {
    if (team) {
      navigate(`/team/${team._id}/settings`);
    }
  };

  const handleViewPublicPage = () => {
    if (team) {
      navigate(`/team/${team._id}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Loading manager profile...</h2>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Please log in to access manager profile</h2>
        <a href="/login" style={{ color: "#007bff" }}>Sign In</a>
      </div>
    );
  }

  if (!currentUser.isManager || !team) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Manager Profile</h2>
        <p>You are not currently managing any team.</p>
        <a href="/teams" style={{ color: "#007bff" }}>Browse Available Teams</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
        <div>
          <h2>Manager Dashboard</h2>
          <p>Welcome back, {currentUser.name}!</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleTeamSettings} // FIXED: Use navigation handler
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Team Settings
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        {/* Team Overview */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
            <h3>Team Overview</h3>
            
            <div style={{ textAlign: "center", marginBottom: 15 }}>
              <img 
                src={getTeamImageUrl(team.teamSettings?.teamImage)}
                alt={`${team.name} team image`}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: 8,
                  objectFit: "cover",
                  border: `3px solid ${team.teamSettings?.primaryColor || "#007bff"}`,
                  backgroundColor: "#f5f5f5"
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/120x120/cccccc/969696?text=No+Image';
                }}
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>Team Name:</span>
                <span>{team.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>Players:</span>
                <span>{players.length} / {team.teamSettings?.maxPlayers || 12}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold" }}>Jersey Color:</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div 
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: team.teamSettings?.jerseyColor || "#000000",
                      borderRadius: 4,
                      border: "1px solid #ddd"
                    }}
                  />
                  <span>{team.teamSettings?.jerseyColor || "#000000"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Practice Schedule */}
          {team.teamSettings && (
            <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
              <h3>Practice Schedule</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <span style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Days:</span>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {team.teamSettings.practiceDays && team.teamSettings.practiceDays.length > 0 ? (
                      team.teamSettings.practiceDays.map(day => (
                        <span 
                          key={day}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: team.teamSettings?.primaryColor || "#007bff",
                            color: "white",
                            borderRadius: 4,
                            fontSize: 12
                          }}
                        >
                          {day}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#666" }}>Not scheduled</span>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Time:</span>
                  <span>{team.teamSettings.practiceTime || "Not set"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
            <h3>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={handleTeamSettings} // FIXED: Use navigation handler
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                Team Settings
              </button>
              <button
                onClick={handleViewPublicPage} // FIXED: Use navigation handler
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                View Public Team Page
              </button>
            </div>
          </div>
        </div>

        {/* Players Roster with Add Player Functionality */}
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3>Team Roster</h3>
            <span>{players.length} player{players.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Add Player Section */}
          <div style={{ marginBottom: 20, padding: 15, backgroundColor: "#f8f9fa", borderRadius: 4 }}>
            <h4 style={{ marginBottom: 10 }}>Invite Player to Team</h4>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="email"
                placeholder="Enter player's email address to send invitation"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: 14
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddPlayer();
                  }
                }}
              />
              <button
                onClick={handleAddPlayer}
                disabled={addingPlayer || !playerEmail.trim()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: addingPlayer ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: addingPlayer ? "not-allowed" : "pointer",
                  opacity: (!playerEmail.trim() || addingPlayer) ? 0.6 : 1
                }}
              >
                {addingPlayer ? "Sending Invite..." : "Send Invite"}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
              Enter the email address of a registered teenager to send them a team invitation.
              They'll receive an email with instructions to join your team.
            </p>
          </div>

          {players.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
              <p style={{ marginBottom: 15 }}>No players on the team yet</p>
              <p>Use the form above to add players to your team</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {players.map((player, index) => (
                <div 
                  key={player._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px",
                    border: "1px solid #eee",
                    borderRadius: 4,
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>{player.name}</div>
                    <div style={{ color: "#666", fontSize: 14 }}>{player.email}</div>
                  </div>
                  <button
                    onClick={() => handleRemovePlayer(player._id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}