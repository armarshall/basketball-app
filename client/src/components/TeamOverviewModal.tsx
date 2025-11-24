// components/TeamOverviewModal.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Team {
  _id: string;
  name: string;
  managerId: string;
  players: any[];
  teamSettings?: {
    teamImage?: string;
    jerseyColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
    practiceDays?: string[];
    practiceTime?: string;
    maxPlayers?: number;
    contactEmail?: string;
    contactPhone?: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface TeamOverviewModalProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string; // Add this to show management options
}

export default function TeamOverviewModal({ 
  teamId, 
  isOpen, 
  onClose, 
  currentUserId 
}: TeamOverviewModalProps) {
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [manager, setManager] = useState<User | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && teamId) {
      fetchTeamData(teamId);
    } else {
      // Reset state when modal closes
      setTeam(null);
      setManager(null);
      setPlayers([]);
      setError(null);
    }
  }, [isOpen, teamId]);

  const fetchTeamData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch team data
      const teamRes = await axios.get(`http://localhost:3000/api/teams/${id}`);
      const teamData = teamRes.data;
      setTeam(teamData);

      // Fetch manager data
      if (teamData.managerId) {
        const managerRes = await axios.get(`http://localhost:3000/api/users/${teamData.managerId}`);
        setManager(managerRes.data);
      }

      // Fetch players data
      const playersRes = await axios.get(`http://localhost:3000/api/teams/${id}/players`);
      setPlayers(playersRes.data);

    } catch (err: any) {
      console.error("Error fetching team data:", err);
      setError(err?.response?.data?.error || "Error loading team information");
    } finally {
      setLoading(false);
    }
  };

  const getTeamImageUrl = (teamImage: string | undefined): string => {
    if (!teamImage) {
      return 'https://via.placeholder.com/150/cccccc/969696?text=No+Image';
    }
    
    if (teamImage.startsWith('http')) {
      return teamImage;
    }
    
    if (teamImage.startsWith('/uploads/')) {
      return `http://localhost:3000${teamImage}`;
    }
    
    return 'https://via.placeholder.com/150/cccccc/969696?text=No+Image';
  };

  // Close modal when clicking outside or pressing Escape key
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleViewFullPage = () => {
    if (team) {
      onClose();
      navigate(`/team/${team._id}`);
    }
  };

  const handleManageTeam = () => {
    if (team) {
      onClose();
      navigate(`/team/${team._id}/settings`);
    }
  };

  const isTeamManager = currentUserId && team?.managerId === currentUserId;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 0,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: team?.teamSettings?.primaryColor || "#1e40af",
            color: "white",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "24px" }}>Team Overview</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: 0,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", maxHeight: "calc(90vh - 80px)", overflowY: "auto" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <p>Loading team information...</p>
            </div>
          )}

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

          {team && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Team Header */}
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <img 
                  src={getTeamImageUrl(team.teamSettings?.teamImage)}
                  alt={`${team.name} team image`}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: `3px solid ${team.teamSettings?.primaryColor || "#1e40af"}`,
                    backgroundColor: "#f5f5f5"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#1e293b" }}>
                    {team.name}
                  </h3>
                  {manager && (
                    <p style={{ margin: "4px 0", color: "#475569" }}>
                      <strong>Manager:</strong> {manager.name}
                    </p>
                  )}
                  <p style={{ margin: "4px 0", color: "#475569" }}>
                    <strong>Players:</strong> {players.length} / {team.teamSettings?.maxPlayers || 12}
                  </p>
                  {isTeamManager && (
                    <span style={{
                      padding: "2px 8px",
                      backgroundColor: "#10b981",
                      color: "white",
                      borderRadius: 12,
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      You manage this team
                    </span>
                  )}
                </div>
              </div>

              {/* Team Colors */}
              <div>
                <h4 style={{ margin: "0 0 12px 0", color: "#374151" }}>Team Colors</h4>
                <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
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
                    <span style={{ fontSize: "14px", color: "#475569" }}>Jersey</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div 
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: team.teamSettings?.primaryColor || "#1e40af",
                        borderRadius: 4,
                        border: "1px solid #ddd"
                      }}
                    />
                    <span style={{ fontSize: "14px", color: "#475569" }}>Primary</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div 
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: team.teamSettings?.secondaryColor || "#dc2626",
                        borderRadius: 4,
                        border: "1px solid #ddd"
                      }}
                    />
                    <span style={{ fontSize: "14px", color: "#475569" }}>Secondary</span>
                  </div>
                </div>
              </div>

              {/* Practice Schedule */}
              {team.teamSettings?.practiceDays && team.teamSettings.practiceDays.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 12px 0", color: "#374151" }}>Practice Schedule</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <strong style={{ color: "#475569" }}>Days:</strong>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                        {team.teamSettings.practiceDays.map(day => (
                          <span 
                            key={day}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: team.teamSettings?.primaryColor || "#1e40af",
                              color: "white",
                              borderRadius: 4,
                              fontSize: "12px",
                              fontWeight: "500"
                            }}
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                    {team.teamSettings.practiceTime && (
                      <div>
                        <strong style={{ color: "#475569" }}>Time:</strong>
                        <span style={{ marginLeft: 8, color: "#475569" }}>
                          {team.teamSettings.practiceTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Players Roster */}
              <div>
                <h4 style={{ margin: "0 0 12px 0", color: "#374151" }}>
                  Players ({players.length})
                </h4>
                {players.length === 0 ? (
                  <p style={{ color: "#64748b", fontStyle: "italic" }}>No players yet</p>
                ) : (
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 8,
                    maxHeight: 200,
                    overflowY: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: 12
                  }}>
                    {players.map((player, index) => (
                      <div 
                        key={player._id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: index % 2 === 0 ? "#f8fafc" : "white",
                          borderRadius: 4
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "500", color: "#1e293b" }}>
                            {player.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            {player.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              {(team.teamSettings?.contactEmail || team.teamSettings?.contactPhone) && (
                <div>
                  <h4 style={{ margin: "0 0 12px 0", color: "#374151" }}>Contact Information</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {team.teamSettings.contactEmail && (
                      <div>
                        <strong style={{ color: "#475569" }}>Email:</strong>
                        <span style={{ marginLeft: 8, color: "#475569" }}>
                          {team.teamSettings.contactEmail}
                        </span>
                      </div>
                    )}
                    {team.teamSettings.contactPhone && (
                      <div>
                        <strong style={{ color: "#475569" }}>Phone:</strong>
                        <span style={{ marginLeft: 8, color: "#475569" }}>
                          {team.teamSettings.contactPhone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ 
                display: "flex", 
                gap: 12, 
                justifyContent: "flex-end", 
                paddingTop: 16, 
                borderTop: "1px solid #e2e8f0",
                flexWrap: "wrap" 
              }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#5a6268";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#6c757d";
                  }}
                >
                  Close
                </button>
                
                {isTeamManager && (
                  <button
                    onClick={handleManageTeam}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#0da271";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#10b981";
                    }}
                  >
                    Manage Team
                  </button>
                )}
                
                <button
                  onClick={handleViewFullPage}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: team.teamSettings?.primaryColor || "#1e40af",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = team?.teamSettings?.primaryColor 
                      ? darkenColor(team.teamSettings.primaryColor, 20) 
                      : "#1e3a8a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = team?.teamSettings?.primaryColor || "#1e40af";
                  }}
                >
                  View Full Team Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to darken colors for hover effects
function darkenColor(color: string, percent: number): string {
  // Simple color darkening - you might want to use a library for more robust color manipulation
  return color; // Placeholder - implement proper color manipulation
}