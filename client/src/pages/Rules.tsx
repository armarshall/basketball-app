import { useState, useEffect } from "react";
import { Button, TextField, Box } from "@mui/material";
import { get_user_data } from "../services/session_service";
import { getRules, updateRules } from "../services/rules_service";

export default function Rules() {
  const [rules, setRules] = useState("");
  const [draftRules, setDraftRules] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const userData = get_user_data();
    if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.isAdmin || false);
      setUserId(user.id || "");
    }

    // Fetch existing rules
    getRules()
      .then((data) => {
        const content = data.content || "";
        setRules(content);
        setDraftRules(content);
      })
      .catch((err) => console.error("Failed to fetch rules:", err));
  }, []);

  const handleSaveRules = async () => {
    try {
      await updateRules(draftRules, userId);
      setRules(draftRules);
      alert("Rules saved successfully!");
    } catch (err) {
      console.error("Failed to save rules:", err);
      alert("Failed to save rules. Please try again.");
    }
  };

  return (
    <div>
      <h1>Rules</h1>
      <Box sx={{ mt: 2, mb: 4 }}>
        {rules ? (
          <div style={{ whiteSpace: "pre-wrap" }}>{rules}</div>
        ) : (
          <p>League rules and regulations will be displayed here.</p>
        )}
      </Box>

      {isAdmin && (
        <Box sx={{ mt: 4, maxWidth: 600 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Competition Rules"
            placeholder="Enter competition rules here..."
            value={draftRules}
            onChange={(e) => setDraftRules(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleSaveRules}>
            Save Rules
          </Button>
        </Box>
      )}
    </div>
  );
}
