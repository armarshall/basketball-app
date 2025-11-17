import { useState, useEffect } from "react";
import axios from "axios";
import { get_user_data } from "../services/session_service";

interface Team {
  _id: string;
  name: string;
  players: string[];
  is_teen_team: boolean;
  managerId?: string;
  teamSettings?: {
    teamImage?: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  isManager?: boolean;
  managedTeamId?: string;
  teamId?: string;
  type: "guardian" | "teen";
}

export default function TeamSelection() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<{ [teamId: string]: boolean }>({});

  // Load user data and teams on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = get_user_data();
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setCurrentUser(parsedUser);
        }

        const teamsRes = await axios.get<Team[]>("http://localhost:3000/api/teams");
        setTeams(teamsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Handle session changes across browser tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = get_user_data();
      setCurrentUser(userData ? JSON.parse(userData) : null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Join or leave team as manager
  const updateTeamManager = async (url: string, teamId: string) => {
    if (!currentUser) {
      alert("Please log in first.");
      return;
    }

    const guardianId = currentUser._id || currentUser.id;
    if (!guardianId) {
      alert("Error: User ID not found. Please log in again.");
      return;
    }

    setLoading((prev) => ({ ...prev, [teamId]: true }));

    try {
      const res = await axios.post(url, {
        teamId: teamId,
        guardianId: guardianId,
      });

      alert(res.data.message);
      sessionStorage.setItem("user", JSON.stringify({ ...res.data.guardian, type: "guardian" }));
      setCurrentUser({ ...res.data.guardian, type: "guardian" });

      const teamsRes = await axios.get<Team[]>("http://localhost:3000/api/teams");
      setTeams(teamsRes.data);
    } catch (err: any) {
      console.error("Error updating team manager:", err);
      alert(err?.response?.data?.error || err.message);
    } finally {
      setLoading((prev) => ({ ...prev, [teamId]: false }));
    }
  };

  // Join team as player
  const handleJoinAsPlayer = async (teamId: string) => {
    if (!currentUser) {
      alert("Please log in first.");
      return;
    }

    const teenagerId = currentUser._id || currentUser.id;
    if (!teenagerId) {
      alert("Error: User ID not found. Please log in again.");
      return;
    }
  
    setLoading((prev) => ({ ...prev, [teamId]: true }));
  
    try {
      const res = await axios.post("http://localhost:3000/api/teams/join-as-player", {
        teamId,
        teenagerId: teenagerId,
      });
  
      alert(res.data.message);
      
      const updatedTeenager = res.data.teenager;
      sessionStorage.setItem("user", JSON.stringify({ 
        ...updatedTeenager, 
        type: "teen",
        teamId: updatedTeenager.teamId
      }));
      
      setCurrentUser({ 
        ...updatedTeenager, 
        type: "teen",
        teamId: updatedTeenager.teamId 
      });

      const teamsRes = await axios.get("http://localhost:3000/api/teams");
      setTeams(teamsRes.data);
      
    } catch (err: any) {
      console.error("Error joining team as player:", err);
      alert(err?.response?.data?.error || err.message);
    } finally {
      setLoading((prev) => ({ ...prev, [teamId]: false }));
    }
  };

  const handleJoinAsManager = (teamId: string) =>
    updateTeamManager("http://localhost:3000/api/teams/join-as-manager", teamId);

  const handleLeaveAsManager = (teamId: string) =>
    updateTeamManager("http://localhost:3000/api/teams/leave-as-manager", teamId);

  // Check if user manages this team
  const isTeamManager = (team: Team) => {
    if (!currentUser) return false;
    const userId = currentUser._id || currentUser.id;
    return team.managerId === userId;
  };

  // Check if user is on this team
  const isOnTeam = (team: Team) => {
    if (!currentUser || !team.players || !Array.isArray(team.players)) return false;
    const userId = currentUser._id || currentUser.id;
    return team.players.includes(userId);
  };

  // Check if user manages any team
  const isManagingAnyTeam = currentUser && currentUser.type === "guardian"
    ? !!currentUser.isManager || !!currentUser.managedTeamId
    : false;

  // Check if user is on any team
  const isOnAnyTeam = currentUser && currentUser.type === "teen"
    ? !!currentUser.teamId
    : false;

  // Check if user can join this team
  const canJoinTeam = (team: Team) => {
    if (!currentUser) return false;
    
    if (currentUser.type === "teen") {
      if (isOnAnyTeam) return false;
      if (isOnTeam(team)) return false;
      return true;
    } else {
      if (team.managerId) return false;
      if (isManagingAnyTeam) return false;
      return true;
    }
  };

  // Get button text based on user status
  const getButtonText = (team: Team) => {
    if (!currentUser) return "Sign In to Join";
    
    const isLoading = loading[team._id];
    if (isLoading) return "Joining...";
    
    if (currentUser.type === "teen") {
      if (isOnAnyTeam) return "Already on a Team";
      if (isOnTeam(team)) return "Already on Team";
      return "Join as Player";
    } else {
      if (isManagingAnyTeam) return "Managing Another Team";
      if (team.managerId) return "Already Managed";
      return "Join as Manager";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 20px", marginTop: 20 }}>
      {/* Current User Info */}
      {currentUser ? (
        <div style={{ padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8, marginBottom: 16 }}>
          <h3>Current User</h3>
          <p><strong>Name:</strong> {currentUser.name}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Type:</strong> {currentUser.type}</p>
          <p>
            <strong>Status:</strong> 
            {currentUser.type === "teen" 
              ? (isOnAnyTeam ? "Team Player" : "Teen - Not on a Team")
              : (isManagingAnyTeam ? "Manager of a team" : "Guardian - Available to Manage")
            }
          </p>
          {currentUser.managedTeamId && (
            <p><strong>Managed Team ID:</strong> {currentUser.managedTeamId}</p>
          )}
        </div>
      ) : (
        <div style={{ padding: 16, backgroundColor: "#fff3cd", border: "1px solid #ffeaa7", borderRadius: 8 }}>
          <h3>Current User</h3>
          <p>Status: Not signed in</p>
          <p><a href="/login" style={{ color: "#007bff" }}>Sign in to join teams</a></p>
        </div>
      )}

      {/* Teams List */}
      <h2>Available Teams</h2>
      {teams.length === 0 && <p>No teams available.</p>}

      {teams.map((team) => {
        const isManager = isTeamManager(team);
        const isPlayer = isOnTeam(team);
        const hasManager = !!team.managerId;
        const isLoading = loading[team._id];
        const canJoin = canJoinTeam(team);

        return (
          <div key={team._id} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 8,
            backgroundColor: isManager ? "#f0f8ff" : isPlayer ? "#f0fff0" : "white",
            gap: 20
          }}>
            {/* Team Info with Image */}
            <div style={{ display: "flex", alignItems: "center", gap: 15, flex: 1 }}>
              {/* Team Image - Clickable */}
              {team.teamSettings?.teamImage && (
                <img 
                  src={`http://localhost:3000${team.teamSettings.teamImage}`}
                  alt={team.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    border: "2px solid #ddd",
                    cursor: "pointer"
                  }}
                  onClick={() => window.location.href = `/team/${team._id}`}
                />
              )}
              {/* Team Details */}
              <div style={{ flex: 1 }}>
                {/* Clickable Team Name */}
                <span 
                  style={{ 
                    fontWeight: "bold", 
                    fontSize: 18, 
                    display: "block", 
                    marginBottom: 8,
                    cursor: "pointer",
                    color: "#007bff",
                    textDecoration: "underline"
                  }}
                  onClick={() => window.location.href = `/team/${team._id}`}
                >
                  {team.name}
                </span>
                <div style={{ fontSize: 14, color: "#666" }}>
                  <div>Players: {(team.players && team.players.length) || 0}</div>
                  <div>Type: {team.is_teen_team ? "Teen Team" : "Children Team"}</div>
                  <div>Manager: {hasManager ? (isManager ? "You" : "A Guardian") : "None - Available"}</div>
                  {isManager && <div style={{ color: "green", fontWeight: "bold" }}>You manage this team</div>}
                  {isPlayer && <div style={{ color: "blue", fontWeight: "bold" }}>You play on this team</div>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {isManager ? (
                <>
                  <button
                    onClick={() => handleLeaveAsManager(team._id)}
                    disabled={isLoading}
                    style={{
                      padding: "10px 20px",
                      fontSize: 16,
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.6 : 1
                    }}
                  >
                    {isLoading ? "Leaving..." : "Leave as Manager"}
                  </button>
                  <button
                    onClick={() => window.location.href = "/manageteam"}
                    style={{
                      padding: "10px 20px",
                      fontSize: 16,
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    Manage Team
                  </button>
                </>
              ) : isPlayer ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button disabled style={{
                    padding: "10px 20px",
                    fontSize: 16,
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "not-allowed",
                    opacity: 0.6
                  }}>
                    Already on Team
                  </button>
                  <button
                    onClick={() => window.location.href = `/team/${team._id}`}
                    style={{
                      padding: "10px 20px",
                      fontSize: 14,
                      backgroundColor: "#17a2b8",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    View Team Details
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => currentUser?.type === "teen" ? handleJoinAsPlayer(team._id) : handleJoinAsManager(team._id)}
                  disabled={!canJoin || isLoading}
                  style={{
                    padding: "10px 20px",
                    fontSize: 16,
                    backgroundColor: canJoin ? "#28a745" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: canJoin ? "pointer" : "not-allowed",
                    opacity: (canJoin && !isLoading) ? 1 : 0.6
                  }}
                >
                  {getButtonText(team)}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}