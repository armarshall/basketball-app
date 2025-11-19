import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

import type { IMatch } from "../types";

interface EventEditorProps {
  event: IMatch;
  onSave: (event: IMatch) => void;
  onCancel: () => void;
}

const EventEditor: React.FC<EventEditorProps> = ({
  event,
  onSave,
  onCancel,
}) => {
  const [editedEvent, setEditedEvent] = useState<IMatch>(event);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedEvent({ ...editedEvent, [name]: value });
  };

  const handleSave = () => {
    onSave(editedEvent);
  };

  return (
    <Box sx={{ width: 400, padding: 2 }}>
      <TextField
        fullWidth
        margin="normal"
        label="Team 1"
        name="team1"
        value={editedEvent.team1 || ""}
        onChange={handleInputChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Team 2"
        name="team2"
        value={editedEvent.team2 || ""}
        onChange={handleInputChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Date"
        name="date"
        value={editedEvent.date || ""}
        onChange={handleInputChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Time"
        name="time"
        value={editedEvent.time || ""}
        onChange={handleInputChange}
      />
      <Box
        sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}
      >
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EventEditor;
