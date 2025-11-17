import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { get_user_data } from "../services/session_service";
import TeamChat from "./TeamChat";

interface Player {
  _id: string;
  name: string;
  email: string;
}

interface Team {
  _id: string;
  name: string;
  players: Player[];
  is_teen_team: boolean;
  managerId: string;
}

export default function TeamPage() {
  const { teamName } = useParams<{ teamName: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [playerEmail, setPlayerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);

  // Load user and team data on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = get_user_data();

        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);

          if (teamName) {
            await fetchTeamDataByName(teamName, user);
          } else {
            setError("No team specified");
          }
        }
        // Allow viewing team even if not logged in
      } catch (err) {
        console.error("Error in useEffect:", err);
        setError(`Initialization error: ${err}`);
      }
    };

    initialize();
  }, [teamName]);

  // Check if current user is a team member
  const checkTeamMembership = (teamData: Team, user: any) => {
    if (!user) return false;

    const userId = user._id || user.id;
    const userType = user.type;

    // Extract manager ID - it might be an object or a string
    const managerIdValue =
      typeof teamData.managerId === "object" && teamData.managerId !== null
        ? (teamData.managerId as any)._id
        : teamData.managerId;

    // Check if user is the manager
    if (
      userType === "guardian" &&
      managerIdValue?.toString() === userId?.toString()
    ) {
      setIsManager(true);
      setIsTeamMember(true);
      return true;
    }

    // Check if user is a player on the team
    if ((userType === "teen" || userType === "teenager") && user.teamId) {
      const isPlayer =
        user.teamId === teamData._id ||
        teamData.players.some((p) => p._id === userId);
      if (isPlayer) {
        setIsTeamMember(true);
        return true;
      }
    }
    return false;
  };

  // Fetch team data by name from API
  const fetchTeamDataByName = async (teamName: string, user?: any) => {
    try {
      const encodedTeamName = encodeURIComponent(teamName.toLowerCase());
      const teamRes = await axios.get(
        `http://localhost:3000/api/teams/by-name/${encodedTeamName}`
      );
      const teamData = teamRes.data;

      // Fetch full team details with players
      const res = await axios.get(
        `http://localhost:3000/api/teams/${teamData._id}/manage`
      );

      setTeam(res.data);

      // Check if current user is a member
      if (user) {
        checkTeamMembership(res.data, user);
      }
    } catch (err: any) {
      console.error("Error fetching team data:", err);
      setError(err?.response?.data?.error || "Error loading team data");
    }
  };

  // Fetch team data from API
  const fetchTeamData = async (teamId: string) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/teams/${teamId}/manage`
      );
      setTeam(res.data);

      if (currentUser) {
        checkTeamMembership(res.data, currentUser);
      }
    } catch (err: any) {
      console.error("Error fetching team data:", err);
      setError(err?.response?.data?.error || "Error loading team data");
    }
  };

  // Add player to team (manager only)
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !playerEmail.trim() || !currentUser || !isManager) return;

    setLoading(true);
    try {
      const guardianId = currentUser._id || currentUser.id;

      // Try POST first, then PATCH if that fails
      let res;
      try {
        res = await axios.post(
          `http://localhost:3000/api/teams/${team._id}/add-player`,
          {
            playerEmail: playerEmail.trim(),
            guardianId: guardianId,
          }
        );
      } catch (postError: any) {
        if (
          postError.response?.status === 404 ||
          postError.response?.status === 405
        ) {
          res = await axios.patch(
            `http://localhost:3000/api/teams/${team._id}/add-player`,
            {
              playerEmail: playerEmail.trim(),
              guardianId: guardianId,
            }
          );
        } else {
          throw postError;
        }
      }

      alert(res.data.message);
      setTeam(res.data.team);
      setPlayerEmail("");

      await fetchTeamData(team._id);
    } catch (err: any) {
      console.error("Error adding player:", err);
      alert(err?.response?.data?.error || "Error adding player");
    } finally {
      setLoading(false);
    }
  };

  // Remove player from team (manager only)
  const handleRemovePlayer = async (playerId: string) => {
    if (!team || !currentUser || !isManager) return;

    if (
      !confirm("Are you sure you want to remove this player from the team?")
    ) {
      return;
    }

    try {
      const guardianId = currentUser._id || currentUser.id;

      // Try POST first, then PATCH if that fails
      let res;
      try {
        res = await axios.post(
          `http://localhost:3000/api/teams/${team._id}/remove-player`,
          {
            playerId: playerId,
            guardianId: guardianId,
          }
        );
      } catch (postError: any) {
        if (
          postError.response?.status === 404 ||
          postError.response?.status === 405
        ) {
          res = await axios.patch(
            `http://localhost:3000/api/teams/${team._id}/remove-player/${playerId}`,
            {
              guardianId: guardianId,
            }
          );
        } else {
          throw postError;
        }
      }

      alert(res.data.message);
      setTeam(res.data.team);

      await fetchTeamData(team._id);
    } catch (err: any) {
      console.error("Error removing player:", err);
      alert(err?.response?.data?.error || "Error removing player");
    }
  };

  // Create unique keys for player list
  const getUniqueKey = (player: Player, index: number) => {
    return `${player._id}-${index}`;
  };

  // Error state
  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          style={{ marginTop: 10, padding: "10px 20px" }}
        >
          Try Again
        </button>
        <button
          onClick={() => (window.location.href = "/teams")}
          style={{ marginTop: 10, marginLeft: 10, padding: "10px 20px" }}
        >
          Back to Teams
        </button>
      </div>
    );
  }

  // Team loading state
  if (!team) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Loading team data...</h2>
        <p>Team Name: {teamName}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      {/* Team Header */}
      <div style={{ marginBottom: 30 }}>
        <h1>{team.name}</h1>
        {isManager && (
          <p style={{ color: "#28a745", fontWeight: "bold" }}>
            You are the manager of this team
          </p>
        )}
        {isTeamMember && !isManager && (
          <p style={{ color: "#007bff", fontWeight: "bold" }}>
            You are a member of this team
          </p>
        )}
      </div>

      {/* Add Player Form - Only visible to managers */}
      {isManager && (
        <div
          style={{
            marginBottom: 30,
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <h3>Add Player to Team</h3>
          <form
            onSubmit={handleAddPlayer}
            style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
          >
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontWeight: "bold",
                }}
              >
                Player Email:
              </label>
              <input
                type="email"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                placeholder="Enter player's email address"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: 16,
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !playerEmail.trim()}
              style={{
                padding: "10px 20px",
                backgroundColor: loading ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 16,
              }}
            >
              {loading ? "Adding..." : "Add Player"}
            </button>
          </form>
        </div>
      )}

      {/* Team Chat - Only visible to team members */}
      {isTeamMember && currentUser && (
        <TeamChat
          teamId={team._id}
          userId={currentUser._id || currentUser.id}
          userType={currentUser.type}
        />
      )}

      {/* Current Players List */}
      <div style={{ marginBottom: 30 }}>
        <h3>Current Players ({team.players.length})</h3>
        {team.players.length === 0 ? (
          <p style={{ padding: 20, textAlign: "center", color: "#666" }}>
            No players on this team yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {team.players.map((player, index) => (
              <div
                key={getUniqueKey(player, index)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 15,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 16 }}>
                    {player.name}
                  </div>
                  <div style={{ color: "#666", fontSize: 14 }}>
                    {player.email}
                  </div>
                </div>
                {/* Remove button - Only visible to managers */}
                {isManager && (
                  <button
                    onClick={() => handleRemovePlayer(player._id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
