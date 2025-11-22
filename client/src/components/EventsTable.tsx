import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import type { IMatch, ITeam } from "../types";
import EventEditor from "./EventEditor";

const EventsTable: React.FC = () => {
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [teams, setTeams] = useState<{ [key: string]: ITeam }>({});
  const [selectedMatch, setSelectedMatch] = useState<IMatch | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesResponse = await axios.get(
          "http://localhost:3000/api/matches",
        );
        const fetchedMatches: IMatch[] = matchesResponse.data;
        setMatches(fetchedMatches);

        const teamIds = new Set<string>();
        fetchedMatches.forEach((match) => {
          teamIds.add(match.team1_id);
          teamIds.add(match.team2_id);
        });

        const teamPromises = Array.from(teamIds).map(async (teamId) => {
          const teamResponse = await axios.get(
            `http://localhost:3000/api/teams/${teamId}`,
          );
          return teamResponse.data;
        });

        const fetchedTeams: ITeam[] = await Promise.all(teamPromises);
        const teamsMap: { [key: string]: ITeam } = {};
        fetchedTeams.forEach((team) => {
          teamsMap[team.id] = team;
        });
        setTeams(teamsMap);
      } catch (error) {
        console.error("Error fetching matches or teams:", error);
      }
    };

    fetchMatches();
  }, []);

  const handleEditClick = (match: IMatch) => {
    setSelectedMatch(match);
    setIsEditorOpen(true);
  };

  const handleDeleteClick = async (matchId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://localhost:3000/api/matches/${matchId}`);
        setMatches(matches.filter((match) => match.id !== matchId));
      } catch (error) {
        console.error("Error deleting match:", error);
      }
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedMatch(null);
  };

  const handleSave = async (editedEvent: IMatch) => {
    try {
      await axios.put(
        `http://localhost:3000/api/matches/${editedEvent.id}`,
        editedEvent,
      );

      setMatches(
        matches.map((match) =>
          match.id === editedEvent.id ? editedEvent : match,
        ),
      );
      handleEditorClose();
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        style={{ margin: "20px", backgroundColor: "#7CCD7C" }}
      >
        Add Event
      </Button>
      <TableContainer
        component={Paper}
        style={{ margin: "20px", width: "calc(100% - 40px)" }}
      >
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Team 1</TableCell>
              <TableCell align="left">Team 2</TableCell>
              <TableCell align="left">Date</TableCell>
              <TableCell align="left">Time</TableCell>
              <TableCell align="left">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell align="left">
                  {teams[match.team1_id]?.name || "Loading..."}
                </TableCell>
                <TableCell align="left">
                  {teams[match.team2_id]?.name || "Loading..."}
                </TableCell>
                <TableCell align="left">
                  {match.start_date_time
                    ? dayjs(match.start_date_time).format("YYYY-MM-DD")
                    : "Loading..."}
                </TableCell>
                <TableCell align="left">
                  {match.start_date_time
                    ? dayjs(match.start_date_time).format("HH:mm")
                    : "Loading..."}
                </TableCell>
                <TableCell align="left">
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#6495ED" }}
                    onClick={() => handleEditClick(match)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#F08080", marginLeft: "5px" }}
                    onClick={() => handleDeleteClick(match.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={isEditorOpen} onClose={handleEditorClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedMatch && (
            <EventEditor
              event={selectedMatch}
              onSave={handleSave}
              onCancel={handleEditorClose}
            />
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default EventsTable;
