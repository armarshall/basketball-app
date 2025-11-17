// components/TeamDetails.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { get_user_data } from "../services/session_service";

interface Team {
  _id: string;
  name: string;
  players: any[];
  is_teen_team: boolean;
  managerId?: string;
  teamSettings?: {
    practiceDays: string[];
    practiceTime: string;
    contactEmail: string;
    contactPhone: string;
    teamImage: string;
    seasonStart: string;
    seasonEnd: string;
  };
}

interface Player {
  _id: string;
  name: string;
  email: string;
}

export default function TeamDetails() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!teamId) return;

      try {
        const userData = get_user_data();
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }

        const teamRes = await axios.get(`http://localhost:3000/api/teams/${teamId}`);
        setTeam(teamRes.data);
      } catch (err: any) {
        console.error("Error fetching team details:", err);
        alert(err?.response?.data?.error || "Error loading team details");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [teamId]);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Loading team details...</h2>
      </div>
    );
  }

  if (!team) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Team not found</h2>
        <p>The team you're looking for doesn't exist.</p>
        <button onClick={() => window.location.href = "/team"}>
          Back to Teams
        </button>
      </div>
    );
  }

  const isOnTeam = currentUser && team.players.some((player: any) => 
    player._id === currentUser._id || player._id === currentUser.id
  );

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      {/* Team Header with Image */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30 }}>
        {team.teamSettings?.teamImage && (
          <img 
            src={`http://localhost:3000${team.teamSettings.teamImage}`}
            alt={team.name}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "8px",
              objectFit: "cover",
              border: "3px solid #ddd"
            }}
          />
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: "2.5rem" }}>{team.name}</h1>
          <p style={{ fontSize: "1.2rem", color: "#666", margin: "5px 0" }}>
            {team.is_teen_team ? "Teen Team" : "Children Team"}
          </p>
          <p style={{ color: "#888" }}>
            {team.players.length} players
          </p>
        </div>
      </div>

      {/* Practice Schedule */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: 25, 
        borderRadius: 10, 
        marginBottom: 30,
        border: "1px solid #e9ecef"
      }}>
        <h2 style={{ color: "#495057", marginBottom: 20 }}>Practice Schedule</h2>
        
        {team.teamSettings?.practiceDays && team.teamSettings.practiceDays.length > 0 ? (
          <div>
            <div style={{ marginBottom: 15 }}>
              <strong style={{ color: "#495057" }}>Practice Days:</strong>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {team.teamSettings.practiceDays.map((day: string) => (
                  <span
                    key={day}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: 20,
                      fontSize: "14px",
                      fontWeight: "bold"
                    }}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
            
            {team.teamSettings.practiceTime && (
              <div style={{ marginBottom: 15 }}>
                <strong style={{ color: "#495057" }}>Practice Time:</strong>
                <div style={{ 
                  fontSize: "18px", 
                  fontWeight: "bold", 
                  color: "#28a745",
                  marginTop: 5
                }}>
                  {team.teamSettings.practiceTime}
                </div>
              </div>
            )}

            {/* Season Dates */}
            {(team.teamSettings.seasonStart || team.teamSettings.seasonEnd) && (
              <div>
                <strong style={{ color: "#495057" }}>Season:</strong>
                <div style={{ marginTop: 5 }}>
                  {team.teamSettings.seasonStart && (
                    <span>Starts: {new Date(team.teamSettings.seasonStart).toLocaleDateString()}</span>
                  )}
                  {team.teamSettings.seasonStart && team.teamSettings.seasonEnd && " • "}
                  {team.teamSettings.seasonEnd && (
                    <span>Ends: {new Date(team.teamSettings.seasonEnd).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#6c757d" }}>
            <p>No practice schedule has been set for this team.</p>
            {isOnTeam && (
              <p>Check back later for updates from your manager.</p>
            )}
          </div>
        )}
      </div>

      {/* Contact Information */}
      {(team.teamSettings?.contactEmail || team.teamSettings?.contactPhone) && (
        <div style={{ 
          backgroundColor: "#e7f3ff", 
          padding: 25, 
          borderRadius: 10, 
          marginBottom: 30,
          border: "1px solid #b3d9ff"
        }}>
          <h2 style={{ color: "#004085", marginBottom: 20 }}>Contact Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {team.teamSettings.contactEmail && (
              <div>
                <strong>Email:</strong> {team.teamSettings.contactEmail}
              </div>
            )}
            {team.teamSettings.contactPhone && (
              <div>
                <strong>Phone:</strong> {team.teamSettings.contactPhone}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Players */}
      <div style={{ 
        backgroundColor: "white", 
        padding: 25, 
        borderRadius: 10, 
        border: "1px solid #ddd"
      }}>
        <h2 style={{ marginBottom: 20 }}>Team Players ({team.players.length})</h2>
        {team.players.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6c757d" }}>
            No players on this team yet.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 15 }}>
            {team.players.map((player: Player) => (
              <div
                key={player._id}
                style={{
                  padding: 15,
                  border: "1px solid #e9ecef",
                  borderRadius: 8,
                  backgroundColor: "#f8f9fa"
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: 16 }}>{player.name}</div>
                <div style={{ color: "#6c757d", fontSize: 14 }}>{player.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button
          onClick={() => window.location.href = "/team"}
          style={{
            padding: "12px 24px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16
          }}
        >
          Back to All Teams
        </button>
      </div>
    </div>
  );
}