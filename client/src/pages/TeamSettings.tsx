// pages/TeamSettings.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { get_user_data } from "../services/session_service";

interface TeamSettings {
  teamImage?: string;
  jerseyColor: string;
  primaryColor: string;
  secondaryColor: string;
  practiceDays: string[];
  practiceTime: string;
  maxPlayers: number;
  contactEmail: string;
  contactPhone: string;
}

interface Team {
  _id: string;
  name: string;
  managerId: string;
  teamSettings?: TeamSettings;
}

export default function TeamSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<TeamSettings>({
    jerseyColor: "#000000",
    primaryColor: "#1e40af",
    secondaryColor: "#dc2626",
    practiceDays: [],
    practiceTime: "",
    maxPlayers: 12,
    contactEmail: "",
    contactPhone: ""
  });

  const practiceDayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const initialize = async () => {
      const userData = get_user_data();
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        if (id) {
          await fetchTeamData(id, user._id || user.id);
        }
      } else {
        setLoading(false);
        setError("Please log in to access team settings");
      }
    };
    initialize();
  }, [id]);

  const fetchTeamData = async (teamId: string, userId: string) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/teams/${teamId}/manage`, {
        params: { guardianId: userId }
      });
      
      const teamData = res.data;
      setTeam(teamData);
      
      // Initialize form data with existing team settings
      if (teamData.teamSettings) {
        setFormData({
          jerseyColor: teamData.teamSettings.jerseyColor || "#000000",
          primaryColor: teamData.teamSettings.primaryColor || "#1e40af",
          secondaryColor: teamData.teamSettings.secondaryColor || "#dc2626",
          practiceDays: teamData.teamSettings.practiceDays || [],
          practiceTime: teamData.teamSettings.practiceTime || "",
          maxPlayers: teamData.teamSettings.maxPlayers || 12,
          contactEmail: teamData.teamSettings.contactEmail || "",
          contactPhone: teamData.teamSettings.contactPhone || ""
        });
      }
      
    } catch (err: any) {
      console.error("Error fetching team data:", err);
      setError(err?.response?.data?.error || "Error loading team data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePracticeDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      practiceDays: prev.practiceDays.includes(day)
        ? prev.practiceDays.filter(d => d !== day)
        : [...prev.practiceDays, day]
    }));
  };

  const handleSaveSettings = async () => {
    if (!team || !currentUser) return;

    setSaving(true);
    try {
      const guardianId = currentUser._id || currentUser.id;
      
      await axios.put(`http://localhost:3000/api/teams/${team._id}/settings`, {
        settings: formData,
        guardianId
      });

      alert("Team settings updated successfully!");
      await fetchTeamData(team._id, guardianId);
    } catch (err: any) {
      console.error("Error updating team settings:", err);
      alert(err?.response?.data?.error || "Error updating team settings");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!team || !currentUser || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('teamImage', file);
    formData.append('guardianId', currentUser._id || currentUser.id);

    try {
      const res = await axios.post(
        `http://localhost:3000/api/teams/${team._id}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert("Team image updated successfully!");
      await fetchTeamData(team._id, currentUser._id || currentUser.id);
    } catch (err: any) {
      console.error("Error uploading team image:", err);
      alert(err?.response?.data?.error || "Error uploading team image");
    }
  };

  const getTeamImageUrl = (teamImage: string | undefined): string => {
    if (!teamImage) {
      return 'https://via.placeholder.com/200x200/cccccc/969696?text=No+Image';
    }
    
    if (teamImage.startsWith('http')) {
      return teamImage;
    }
    
    if (teamImage.startsWith('/uploads/')) {
      return `http://localhost:3000${teamImage}`;
    }
    
    return 'https://via.placeholder.com/200x200/cccccc/969696?text=No+Image';
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Loading team settings...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
        <div style={{ 
          padding: 20, 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          border: "1px solid #f5c6cb",
          borderRadius: 8,
          textAlign: "center"
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
              marginTop: 10
            }}
          >
            Back to Teams
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Team not found</h2>
        <button
          onClick={() => navigate("/teams")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginTop: 10
          }}
        >
          Back to Teams
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
        <div>
          <h1>Team Settings</h1>
          <p style={{ color: "#666", fontSize: 18 }}>Manage your team: <strong>{team.name}</strong></p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate(`/team/${team._id}`)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            View Team Page
          </button>
          <button
            onClick={() => navigate("/manager-profile")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Manager Profile
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30 }}>
        {/* Team Image Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ border: "1px solid #e2e8f0", padding: 20, borderRadius: 8 }}>
            <h3 style={{ marginBottom: 15 }}>Team Image</h3>
            <div style={{ textAlign: "center" }}>
              <img 
                src={getTeamImageUrl(team.teamSettings?.teamImage)}
                alt={`${team.name} team image`}
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: 8,
                  objectFit: "cover",
                  border: `3px solid ${formData.primaryColor}`,
                  backgroundColor: "#f5f5f5",
                  marginBottom: 15
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                id="teamImageUpload"
              />
              <label
                htmlFor="teamImageUpload"
                style={{
                  display: "block",
                  padding: "10px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                Upload New Image
              </label>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ border: "1px solid #e2e8f0", padding: 20, borderRadius: 8 }}>
            <h3 style={{ marginBottom: 15 }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => navigate("/manager-profile")}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                Manage Players
              </button>
              <button
                onClick={() => navigate(`/team/${team._id}`)}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                View Public Page
              </button>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Team Colors */}
          <div style={{ border: "1px solid #e2e8f0", padding: 20, borderRadius: 8 }}>
            <h3 style={{ marginBottom: 20 }}>Team Colors</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "500" }}>
                  Jersey Color
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="color"
                    name="jerseyColor"
                    value={formData.jerseyColor}
                    onChange={handleInputChange}
                    style={{ width: 50, height: 40, border: "none", borderRadius: 4 }}
                  />
                  <span style={{ fontSize: 14, color: "#666" }}>{formData.jerseyColor}</span>
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "500" }}>
                  Primary Color
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                    style={{ width: 50, height: 40, border: "none", borderRadius: 4 }}
                  />
                  <span style={{ fontSize: 14, color: "#666" }}>{formData.primaryColor}</span>
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "500" }}>
                  Secondary Color
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                    style={{ width: 50, height: 40, border: "none", borderRadius: 4 }}
                  />
                  <span style={{ fontSize: 14, color: "#666" }}>{formData.secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Practice Schedule */}
          <div style={{ border: "1px solid #e2e8f0", padding: 20, borderRadius: 8 }}>
            <h3 style={{ marginBottom: 20 }}>Practice Schedule</h3>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 10, fontWeight: "500" }}>
                Practice Days
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {practiceDayOptions.map(day => (
                  <label key={day} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input
                      type="checkbox"
                      checked={formData.practiceDays.includes(day)}
                      onChange={() => handlePracticeDayChange(day)}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 14 }}>{day}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "500" }}>
                Practice Time
              </label>
              <input
                type="time"
                name="practiceTime"
                value={formData.practiceTime}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>
          </div>

          {/* Team Configuration */}
          <div style={{ border: "1px solid #e2e8f0", padding: 20, borderRadius: 8 }}>
            <h3 style={{ marginBottom: 20 }}>Team Configuration</h3>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "500" }}>
                Maximum Players
              </label>
              <input
                type="number"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleInputChange}
                min="1"
                max="20"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ border: "1px solid #e2e8f0", padding: 20, borderRadius: 8 }}>
            <h3 style={{ marginBottom: 20 }}>Contact Information</h3>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "500" }}>
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="team@example.com"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "500" }}>
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={() => navigate("/manager-profile")}
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
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              style={{
                padding: "12px 24px",
                backgroundColor: saving ? "#6c757d" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: 16
              }}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}