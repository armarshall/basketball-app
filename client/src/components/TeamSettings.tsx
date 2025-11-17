import { useState, useEffect } from "react";
import axios from "axios";
import { get_user_data } from "../services/session_service";

interface TeamSettings {
  jerseyColor: string;
  primaryColor: string;
  secondaryColor: string;
  practiceDays: string[];
  practiceTime: string;
  maxPlayers: number;
  seasonStart: string;
  seasonEnd: string;
  contactEmail: string;
  contactPhone: string;
  teamImage: string;
}

interface Team {
  _id: string;
  name: string;
  managerId: string;
}

export default function TeamSettings() {
  const [team, setTeam] = useState<Team | null>(null);
  const [settings, setSettings] = useState<TeamSettings>({
    jerseyColor: "#000000",
    primaryColor: "#1e40af",
    secondaryColor: "#dc2626",
    practiceDays: [],
    practiceTime: "18:00",
    maxPlayers: 12,
    seasonStart: new Date().toISOString().split('T')[0],
    seasonEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contactEmail: "",
    contactPhone: "",
    teamImage: ""
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const practiceDayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const initialize = async () => {
      const userData = get_user_data();
      if (userData) {
        const user = JSON.parse(userData);
        if (user.managedTeamId) {
          await fetchTeamData(user.managedTeamId, user._id || user.id);
        }
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (settings.teamImage) {
      setImagePreview(settings.teamImage);
    }
  }, [settings.teamImage]);

  const fetchTeamData = async (teamId: string, guardianId: string) => {
    try {
      const teamRes = await axios.get(`http://localhost:3000/api/teams/${teamId}`);
      setTeam(teamRes.data);

      const settingsRes = await axios.get(`http://localhost:3000/api/teams/${teamId}/settings`, {
        params: { guardianId }
      });
      
      if (settingsRes.data) {
        const formattedSettings = {
          ...settingsRes.data,
          seasonStart: settingsRes.data.seasonStart ? new Date(settingsRes.data.seasonStart).toISOString().split('T')[0] : settings.seasonStart,
          seasonEnd: settingsRes.data.seasonEnd ? new Date(settingsRes.data.seasonEnd).toISOString().split('T')[0] : settings.seasonEnd
        };
        setSettings(formattedSettings);
      }
    } catch (err: any) {
      console.error("Error fetching team data:", err);
      alert(err?.response?.data?.error || "Error loading team settings");
    }
  };

  const handleSaveSettings = async () => {
    if (!team) return;

    setSaving(true);
    try {
      const userData = get_user_data();
      if (!userData) {
        alert("Please log in first");
        return;
      }

      const user = JSON.parse(userData);
      const guardianId = user._id || user.id;

      await axios.patch(`http://localhost:3000/api/teams/${team._id}/settings`, {
        settings,
        guardianId
      });

      alert("Team settings updated successfully!");
    } catch (err: any) {
      console.error("Error updating settings:", err);
      alert(err?.response?.data?.error || "Error updating team settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !team) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('teamId', team._id);

      const userData = get_user_data();
      if (!userData) {
        alert("Please log in first");
        return;
      }

      const user = JSON.parse(userData);
      const guardianId = user._id || user.id;
      formData.append('guardianId', guardianId);

      const uploadRes = await axios.post('http://localhost:3000/api/images/upload-team', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newSettings = {
        ...settings,
        teamImage: uploadRes.data.imageUrl
      };

      await axios.patch(`http://localhost:3000/api/teams/${team._id}/settings`, {
        settings: newSettings,
        guardianId
      });

      setSettings(newSettings);
      setImageFile(null);
      alert("Team image uploaded successfully!");
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert(err?.response?.data?.error || "Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const togglePracticeDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      practiceDays: prev.practiceDays.includes(day)
        ? prev.practiceDays.filter(d => d !== day)
        : [...prev.practiceDays, day]
    }));
  };

  if (!team) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Loading team settings...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>Team Settings: {team.name}</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Team Image Upload */}
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
          <h3>Team Image</h3>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Current Team Image:
              </label>
              {imagePreview ? (
                <div style={{ textAlign: "center" }}>
                  <img 
                    src={imagePreview} 
                    alt="Team preview" 
                    style={{ 
                      maxWidth: "200px", 
                      maxHeight: "200px", 
                      borderRadius: 8,
                      border: "1px solid #ddd"
                    }} 
                  />
                  <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
                    Preview of selected image
                  </p>
                </div>
              ) : (
                <div style={{ 
                  width: "200px", 
                  height: "200px", 
                  border: "2px dashed #ddd", 
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666"
                }}>
                  No image selected
                </div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                  Upload New Image:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ width: "100%", padding: "8px 0" }}
                />
                <p style={{ fontSize: 12, color: "#666", marginTop: 5 }}>
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
              
              {imageFile && (
                <button
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: uploadingImage ? "#6c757d" : "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: uploadingImage ? "not-allowed" : "pointer",
                    fontSize: 14
                  }}
                >
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
          <h3>Team Colors</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15 }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Jersey Color
              </label>
              <input
                type="color"
                value={settings.jerseyColor}
                onChange={(e) => setSettings({ ...settings, jerseyColor: e.target.value })}
                style={{ width: "100%", height: 40 }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Primary Color
              </label>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                style={{ width: "100%", height: 40 }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Secondary Color
              </label>
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                style={{ width: "100%", height: 40 }}
              />
            </div>
          </div>
        </div>

        {/* Practice Schedule */}
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
          <h3>Practice Schedule</h3>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              Practice Days
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {practiceDayOptions.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => togglePracticeDay(day)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: settings.practiceDays.includes(day) ? settings.primaryColor : "#f0f0f0",
                    color: settings.practiceDays.includes(day) ? "white" : "black",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              Practice Time
            </label>
            <input
              type="time"
              value={settings.practiceTime}
              onChange={(e) => setSettings({ ...settings, practiceTime: e.target.value })}
              style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>
        </div>

        {/* Team Configuration */}
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
          <h3>Team Configuration</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Max Players
              </label>
              <input
                type="number"
                value={settings.maxPlayers}
                onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) || 12 })}
                min="1"
                max="20"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>
          </div>
        </div>

        {/* Season Dates */}
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
          <h3>Season Dates</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Season Start
              </label>
              <input
                type="date"
                value={settings.seasonStart}
                onChange={(e) => setSettings({ ...settings, seasonStart: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Season End
              </label>
              <input
                type="date"
                value={settings.seasonEnd}
                onChange={(e) => setSettings({ ...settings, seasonEnd: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
          <h3>Contact Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="team@example.com"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                Contact Phone
              </label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                placeholder="(555) 123-4567"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          style={{
            padding: "12px 24px",
            backgroundColor: saving ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: 16,
            fontWeight: "bold"
          }}
        >
          {saving ? "Saving..." : "Save Team Settings"}
        </button>
      </div>
    </div>
  );
}