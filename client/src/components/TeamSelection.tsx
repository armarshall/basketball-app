// components/TeamSelection.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ADD THIS IMPORT
import axios from "axios";
import { get_user_data } from "../services/session_service";
import TeamOverviewModal from "../components/TeamOverviewModal";

interface Team {
  _id: string;
  name: string;
  managerId: string | null;
  managerName: string;
  playerCount: number;
  maxPlayers: number;
  primaryColor?: string;
  jerseyColor?: string;
  teamImage?: string;
}

export default function TeamSelection() {
  const navigate = useNavigate(); // ADD THIS HOOK
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const userData = get_user_data();
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
      await fetchTeams();
    };
    initialize();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/teams");
      setTeams(res.data);
    } catch (err: any) {
      console.error("Error fetching teams:", err);
      setError("Error loading teams");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeamId(null);
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!currentUser) {
      alert("Please log in to join a team");
      return;
    }

    setJoiningTeam(teamId);
    try {
      const res = await axios.post(`http://localhost:3000/api/teams/${teamId}/join`, {
        playerId: currentUser._id || currentUser.id
      });

      alert("Successfully joined the team!");
      await fetchTeams(); // Refresh the team list
    } catch (err: any) {
      console.error("Error joining team:", err);
      alert(err?.response?.data?.error || "Error joining team");
    } finally {
      setJoiningTeam(null);
    }
  };

  const handleJoinAsManager = async (teamId: string) => {
    if (!currentUser) {
      alert("Please log in to join a team");
      return;
    }

    setJoiningTeam(teamId);
    try {
      const res = await axios.post(`http://localhost:3000/api/teams/join-as-manager`, {
        teamId: teamId,
        guardianId: currentUser._id || currentUser.id
      });

      // Fetch fresh guardian data to update session
      const guardianRes = await axios.get(`http://localhost:3000/api/guardians/email/${currentUser.email}`);
      const updatedGuardian = guardianRes.data;
      
      // Update session storage with fresh data
      const updatedUser = {
        ...currentUser,
        isManager: updatedGuardian.isManager || false,
        managedTeamId: updatedGuardian.managedTeamId || null
      };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      alert("Successfully joined the team as manager!");
      await fetchTeams(); // Refresh the team list
    } catch (err: any) {
      console.error("Error joining team as manager:", err);
      alert(err?.response?.data?.error || "Error joining team as manager");
    } finally {
      setJoiningTeam(null);
    }
  };

  // FIXED: Navigation handler
  const handleCreateTeam = () => {
    navigate("/teamcreate");
  };

  const canJoinTeam = (team: Team) => {
    if (!currentUser) return false;
    if (currentUser.type !== 'teen') return false;
    if (team.playerCount >= team.maxPlayers) return false;
    return true;
  };

  const canJoinAsManager = (team: Team) => {
    if (!currentUser) return false;
    if (currentUser.type !== 'guardian') return false;
    if (team.managerId) return false; // Team already has a manager
    if (currentUser.isManager) return false; // Guardian already managing another team
    return true;
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Loading teams...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1>Browse Teams</h1>
        <p style={{ color: "#666", fontSize: 18 }}>
          {currentUser ? `Welcome, ${currentUser.name}!` : "Browse available teams to join"}
        </p>
        {!currentUser && (
          <p style={{ color: "#dc2626", marginTop: 10 }}>
            Please log in to join a team
          </p>
        )}
        {currentUser?.type === 'guardian' && currentUser.isManager && (
          <div style={{
            padding: "12px 20px",
            backgroundColor: "#d1ecf1",
            color: "#0c5460",
            border: "1px solid #bee5eb",
            borderRadius: "6px",
            marginTop: "16px",
            display: "inline-block"
          }}>
            ℹ️ You are currently managing a team. You can only manage one team at a time.
          </div>
        )}
      </div>

      {error && (
        <div style={{ 
          padding: 15, 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          border: "1px solid #f5c6cb",
          borderRadius: 4,
          marginBottom: 20
        }}>
          {error}
        </div>
      )}

      {teams.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          <h3>No teams available</h3>
          <p>Check back later or create your own team!</p>
          {currentUser?.type === 'guardian' && !currentUser.isManager && (
            <button
              onClick={handleCreateTeam} // FIXED: Use navigation handler
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 16,
                marginTop: 20
              }}
            >
              Create a Team
            </button>
          )}
          {currentUser?.type === 'guardian' && currentUser.isManager && (
            <p style={{ marginTop: 20, color: "#856404" }}>
              You are already managing a team.
            </p>
          )}
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: 20 
        }}>
          {teams.map(team => (
            <div 
              key={team._id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 24,
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
              onClick={() => handleTeamClick(team._id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              {/* Color accent */}
              <div 
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  backgroundColor: team.primaryColor || "#1e40af"
                }}
              />

              {/* Team Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                {team.teamImage && (
                  <img 
                    src={team.teamImage.startsWith('http') ? team.teamImage : `http://localhost:3000${team.teamImage}`}
                    alt={`${team.name} team image`}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      objectFit: "cover",
                      border: `2px solid ${team.primaryColor || "#1e40af"}`,
                      backgroundColor: "#f5f5f5"
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3 
                    style={{
                      margin: "0 0 8px 0",
                      color: team.primaryColor || "#1e40af",
                      fontSize: "20px",
                      fontWeight: "600",
                      textDecoration: "underline"
                    }}
                  >
                    {team.name}
                  </h3>
                  <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                    👤 Managed by {team.managerName}
                  </p>
                </div>
              </div>

              {/* Team Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: "#475569", fontWeight: "500" }}>Players:</span>
                  <span style={{ 
                    color: team.playerCount >= team.maxPlayers ? "#dc2626" : "#059669",
                    fontWeight: "600" 
                  }}>
                    {team.playerCount} / {team.maxPlayers}
                  </span>
                </div>

                {/* Team Colors Preview */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: "#475569", fontSize: "14px", fontWeight: "500" }}>Colors:</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {team.jerseyColor && (
                      <div 
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: team.jerseyColor,
                          borderRadius: "50%",
                          border: "2px solid #fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                        }}
                        title="Jersey Color"
                      />
                    )}
                    {team.primaryColor && (
                      <div 
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: team.primaryColor,
                          borderRadius: "50%",
                          border: "2px solid #fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                        }}
                        title="Primary Color"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Join Button for Teenagers */}
              {canJoinTeam(team) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering team click
                    handleJoinTeam(team._id);
                  }}
                  disabled={joiningTeam === team._id || team.playerCount >= team.maxPlayers}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: team.playerCount >= team.maxPlayers ? "#9ca3af" : 
                                   joiningTeam === team._id ? "#6b7280" : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: team.playerCount >= team.maxPlayers ? "not-allowed" : 
                           joiningTeam === team._id ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s ease"
                  }}
                   onMouseEnter={(e) => {
                    if (team.playerCount < team.maxPlayers && joiningTeam !== team._id) {
                      e.currentTarget.style.backgroundColor = "#059669";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (team.playerCount < team.maxPlayers && joiningTeam !== team._id) {
                      e.currentTarget.style.backgroundColor = "#10b981";
                    }
                  }}
                >
                  {team.playerCount >= team.maxPlayers ? "Team Full" :
                   joiningTeam === team._id ? "Joining..." : "Join Team"}
                </button>
              )}

              {/* Join as Manager Button for Guardians */}
              {canJoinAsManager(team) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering team click
                    handleJoinAsManager(team._id);
                  }}
                  disabled={joiningTeam === team._id}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: joiningTeam === team._id ? "#6b7280" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: joiningTeam === team._id ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (joiningTeam !== team._id) {
                      e.currentTarget.style.backgroundColor = "#2563eb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (joiningTeam !== team._id) {
                      e.currentTarget.style.backgroundColor = "#3b82f6";
                    }
                  }}
                >
                  {joiningTeam === team._id ? "Joining..." : "Join as Manager"}
                </button>
              )}

              {/* Status messages for guardians who can't join */}
              {currentUser?.type === 'guardian' && !canJoinAsManager(team) && (
                <div style={{ 
                  padding: "8px 12px", 
                  backgroundColor: "#f3f4f6", 
                  borderRadius: 4,
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#6b7280"
                }}>
                  {team.managerId ? 'Team already has a manager' : 
                   currentUser.isManager ? 'You are already managing another team' : 
                   'Cannot join as manager'}
                </div>
              )}

              {/* Status message for non-logged-in or other user types */}
              {!currentUser?.type && currentUser && (
                <div style={{ 
                  padding: "8px 12px", 
                  backgroundColor: "#f3f4f6", 
                  borderRadius: 4,
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#6b7280"
                }}>
                  Please log in as a teenager or guardian to join
                </div>
              )}

              {/* Click hint */}
              <div style={{ 
                textAlign: "center", 
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid #f1f5f9"
              }}>
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                  Click for team details
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Overview Modal */}
      <TeamOverviewModal 
        teamId={selectedTeamId || ""}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentUserId={currentUser?._id || currentUser?.id} // ADD THIS PROP
      />

      {/* Create Team CTA for Guardians */}
      {currentUser?.type === 'guardian' && !currentUser.isManager && (
        <div style={{ 
          textAlign: "center", 
          marginTop: 40, 
          padding: 30,
          backgroundColor: "#f8fafc",
          borderRadius: 12,
          border: "2px dashed #cbd5e1"
        }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#374151" }}>Don't see a team you like?</h3>
          <p style={{ color: "#64748b", marginBottom: 20 }}>
            Create your own team and start managing!
          </p>
          <button
            onClick={handleCreateTeam} // FIXED: Use navigation handler
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "600",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0056b3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#007bff";
            }}
          >
            Create Your Team
          </button>
        </div>
      )}
      
      {/* Message for guardians already managing a team */}
      {currentUser?.type === 'guardian' && currentUser.isManager && (
        <div style={{ 
          textAlign: "center", 
          marginTop: 40, 
          padding: 30,
          backgroundColor: "#fff3cd",
          borderRadius: 12,
          border: "2px solid #ffc107"
        }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#856404" }}>Already Managing a Team</h3>
          <p style={{ color: "#856404", marginBottom: 20 }}>
            You are currently managing a team. You can only manage one team at a time.
          </p>
          <button
            onClick={() => navigate("/manager-profile")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#ffc107",
              color: "#000",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "600",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e0a800";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffc107";
            }}
          >
            Go to Manager Dashboard
          </button>
        </div>
      )}
    </div>
  );
}