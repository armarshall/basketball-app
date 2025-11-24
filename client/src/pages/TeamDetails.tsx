// pages/TeamDetails.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTeamData(id);
    }
  }, [id]);

  const fetchTeamData = async (teamId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch team data - using a simpler approach first
      const teamRes = await axios.get(`http://localhost:3000/api/teams/${teamId}`);
      
      if (teamRes.data) {
        setTeam(teamRes.data);
      } else {
        setError("Team not found");
      }

    } catch (err: any) {
      console.error("Error fetching team data:", err);
      
      // Create mock data for testing if API fails
      const mockTeam: Team = {
        _id: teamId,
        name: "Demo Team",
        managerId: "mock-manager-id",
        players: [],
        teamSettings: {
          primaryColor: "#1e40af",
          secondaryColor: "#dc2626",
          jerseyColor: "#000000",
          practiceDays: ["Monday", "Wednesday"],
          practiceTime: "18:00",
          maxPlayers: 12,
          contactEmail: "demo@team.com",
          contactPhone: "(555) 123-4567"
        }
      };
      
      setTeam(mockTeam);
      setError("Using demo data - API connection failed");
      
    } finally {
      setLoading(false);
    }
  };

  const getTeamImageUrl = (teamImage: string | undefined): string => {
    if (!teamImage) {
      return 'https://via.placeholder.com/300x300/cccccc/969696?text=No+Team+Image';
    }
    
    if (teamImage.startsWith('http')) {
      return teamImage;
    }
    
    if (teamImage.startsWith('/uploads/')) {
      return `http://localhost:3000${teamImage}`;
    }
    
    return 'https://via.placeholder.com/300x300/cccccc/969696?text=No+Team+Image';
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Loading team information...</h2>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div style={{ padding: 40, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ 
          padding: 20, 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          border: "1px solid #f5c6cb",
          borderRadius: 8
        }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button
            onClick={() => navigate("/teams")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              marginTop: 15
            }}
          >
            Back to Teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      {/* Show warning if using demo data */}
      {error && team && (
        <div style={{ 
          padding: 15, 
          backgroundColor: "#fff3cd", 
          color: "#856404", 
          border: "1px solid #ffeaa7",
          borderRadius: 8,
          marginBottom: 20
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Header */}
      <div style={{ 
        background: team?.teamSettings?.primaryColor || "#1e40af",
        color: "white",
        padding: "40px 30px",
        borderRadius: 12,
        marginBottom: 30,
        textAlign: "center",
        position: "relative"
      }}>
        <button
          onClick={() => navigate("/teams")}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "8px 16px",
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          ← Back to Teams
        </button>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 30, flexWrap: "wrap" }}>
          <img 
            src={getTeamImageUrl(team?.teamSettings?.teamImage)}
            alt={`${team?.name} team image`}
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid rgba(255,255,255,0.3)",
              backgroundColor: "#f5f5f5"
            }}
          />
          <div>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "36px", fontWeight: "bold" }}>
              {team?.name || "Unknown Team"}
            </h1>
            <p style={{ margin: "5px 0", fontSize: "16px", opacity: 0.8 }}>
              {team?.players?.length || 0} player{(team?.players?.length || 0) !== 1 ? 's' : ''} • {team?.teamSettings?.maxPlayers || 12} max
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Team Colors */}
          <div style={{ border: "1px solid #e2e8f0", padding: 25, borderRadius: 12, backgroundColor: "white" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Team Colors</h3>
            <div style={{ display: "flex", gap: 20, justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div 
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: team?.teamSettings?.jerseyColor || "#000000",
                    borderRadius: "50%",
                    border: "3px solid #fff",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    margin: "0 auto 10px"
                  }}
                />
                <span style={{ fontSize: "14px", color: "#64748b" }}>Jersey</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div 
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: team?.teamSettings?.primaryColor || "#1e40af",
                    borderRadius: "50%",
                    border: "3px solid #fff",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    margin: "0 auto 10px"
                  }}
                />
                <span style={{ fontSize: "14px", color: "#64748b" }}>Primary</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div 
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: team?.teamSettings?.secondaryColor || "#dc2626",
                    borderRadius: "50%",
                    border: "3px solid #fff",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    margin: "0 auto 10px"
                  }}
                />
                <span style={{ fontSize: "14px", color: "#64748b" }}>Secondary</span>
              </div>
            </div>
          </div>

          {/* Practice Schedule */}
          {team?.teamSettings?.practiceDays && team.teamSettings.practiceDays.length > 0 && (
            <div style={{ border: "1px solid #e2e8f0", padding: 25, borderRadius: 12, backgroundColor: "white" }}>
              <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Practice Schedule</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div>
                  <strong style={{ color: "#475569", display: "block", marginBottom: 10 }}>Days:</strong>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {team.teamSettings.practiceDays.map(day => (
                      <span 
                        key={day}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: team.teamSettings?.primaryColor || "#1e40af",
                          color: "white",
                          borderRadius: 20,
                          fontSize: "14px",
                          fontWeight: "600"
                        }}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                {team.teamSettings.practiceTime && (
                  <div>
                    <strong style={{ color: "#475569", display: "block", marginBottom: 5 }}>Time:</strong>
                    <span style={{ fontSize: "16px", color: "#1e293b" }}>
                      {team.teamSettings.practiceTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Contact Information */}
          {(team?.teamSettings?.contactEmail || team?.teamSettings?.contactPhone) && (
            <div style={{ border: "1px solid #e2e8f0", padding: 25, borderRadius: 12, backgroundColor: "white" }}>
              <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Contact Information</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                {team.teamSettings?.contactEmail && (
                  <div>
                    <strong style={{ color: "#475569", display: "block", marginBottom: 5 }}>Email:</strong>
                    <a 
                      href={`mailto:${team.teamSettings.contactEmail}`}
                      style={{ color: team.teamSettings?.primaryColor || "#1e40af", textDecoration: "none" }}
                    >
                      {team.teamSettings.contactEmail}
                    </a>
                  </div>
                )}
                {team.teamSettings?.contactPhone && (
                  <div>
                    <strong style={{ color: "#475569", display: "block", marginBottom: 5 }}>Phone:</strong>
                    <a 
                      href={`tel:${team.teamSettings.contactPhone}`}
                      style={{ color: team.teamSettings?.primaryColor || "#1e40af", textDecoration: "none" }}
                    >
                      {team.teamSettings.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Information */}
          <div style={{ border: "1px solid #e2e8f0", padding: 25, borderRadius: 12, backgroundColor: "white" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Team Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <strong style={{ color: "#475569", display: "block", marginBottom: 5 }}>Team Size:</strong>
                <span style={{ fontSize: "16px", color: "#1e293b" }}>
                  {team?.players?.length || 0} / {team?.teamSettings?.maxPlayers || 12} players
                </span>
              </div>
              <div>
                <strong style={{ color: "#475569", display: "block", marginBottom: 5 }}>Status:</strong>
                <span style={{ 
                  fontSize: "16px", 
                  color: (team?.players?.length || 0) >= (team?.teamSettings?.maxPlayers || 12) ? "#dc2626" : "#059669",
                  fontWeight: "600"
                }}>
                  {(team?.players?.length || 0) >= (team?.teamSettings?.maxPlayers || 12) ? "Team Full" : "Open for Players"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}