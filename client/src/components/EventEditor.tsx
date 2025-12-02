import React, { useState, useEffect } from "react";
import { TextField, Button, Box } from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";

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
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");

  useEffect(() => {
    setEditedEvent(event);
    if (event.team_ids) {
      // Fetch team names based on team IDs
      const fetchTeamNames = async () => {
        try {
          const team1Response = await axios.get(
            `http://localhost:3000/api/teams/${event.team_ids[0]}`,
          );
          setTeam1Name(team1Response.data.name);

          const team2Response = await axios.get(
            `http://localhost:3000/api/teams/${event.team_ids[1]}`,
          );
          setTeam2Name(team2Response.data.name);
        } catch (error) {
          console.error("Error fetching team names:", error);
        }
      };

      fetchTeamNames();
    }
  }, [event]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "team1_name") {
      setTeam1Name(value);
    } else if (name === "team2_name") {
      setTeam2Name(value);
    } else {
      setEditedEvent({ ...editedEvent, [name]: value });
    }
  };

  const handleSave = async () => {
    let team1Id = "";
    let team2Id = "";

    try {
      const team1Response = await axios.get(
        `http://localhost:3000/api/teams/by-name/${team1Name}`,
      );
      team1Id = team1Response.data.id;
    } catch (error) {
      console.error("Error fetching team 1:", error);
      // Handle error: team not found
      team1Id = "";
    }

    try {
      const team2Response = await axios.get(
        `http://localhost:3000/api/teams/by-name/${team2Name}`,
      );
      team2Id = team2Response.data.id;
    } catch (error) {
      console.error("Error fetching team 2:", error);
      // Handle error: team not found
      team2Id = "";
    }

    const updatedEvent = {
      ...editedEvent,
      team_ids: [team1Id, team2Id],
    };

    onSave(updatedEvent);
  };

  return (
    <Box sx={{ width: 400, padding: 2 }}>
      <TextField
        fullWidth
        margin="normal"
        label="Team 1 Name"
        name="team1_name"
        value={team1Name}
        onChange={handleInputChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Team 2 Name"
        name="team2_name"
        value={team2Name}
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
