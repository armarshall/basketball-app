import React, { useState, useEffect } from "react";
import { TextField, Button, Box } from "@mui/material";
import dayjs from "dayjs";

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

  useEffect(() => {
    setEditedEvent(event);
  }, [event]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "team1_id") {
      setEditedEvent({
        ...editedEvent,
        team_ids: [value, editedEvent.team_ids ? editedEvent.team_ids[1] : ""],
      });
    } else if (name === "team2_id") {
      setEditedEvent({
        ...editedEvent,
        team_ids: [editedEvent.team_ids ? editedEvent.team_ids[0] : "", value],
      });
    } else {
      setEditedEvent({ ...editedEvent, [name]: value });
    }
  };

  const handleSave = () => {
    onSave(editedEvent);
  };

  return (
    <Box sx={{ width: 400, padding: 2 }}>
      <TextField
        fullWidth
        margin="normal"
        label="Team 1 ID"
        name="team1_id"
        value={editedEvent.team_ids ? editedEvent.team_ids[0] || "" : ""}
        onChange={handleInputChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Team 2 ID"
        name="team2_id"
        value={editedEvent.team_ids ? editedEvent.team_ids[1] || "" : ""}
        onChange={handleInputChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Start Time"
        name="start_date_time"
        value={
          editedEvent.start_date_time
            ? dayjs(editedEvent.start_date_time).format("YYYY-MM-DDTHH:mm")
            : ""
        }
        onChange={handleInputChange}
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
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
