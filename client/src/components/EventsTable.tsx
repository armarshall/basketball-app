import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";

interface Event {
  id: number;
  team1: string;
  team2: string;
  date: string;
  time: string;
}

const EventsTable: any = () => {
  const [teams, setTeams] = useState<{ [key: string]: string }>({});
  const [eventsData, setEventsData] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/tournaments");
        const tournaments = res.data;

        const teamIds = new Set<string>();
        tournaments.forEach((tournament: any) => {
          tournament.rounds.forEach((round: any) => {
            round.matches.forEach((match: any) => {
              if (match.team_ids) {
                match.team_ids.forEach((teamId: string) => teamIds.add(teamId));
              }
            });
          });
        });

        const teamsMap: { [key: string]: string } = {};
        for (const teamId of teamIds) {
          try {
            const teamRes = await axios.get(
              `http://localhost:3000/api/teams/${teamId}`,
            );
            teamsMap[teamId] = teamRes.data.name;
          } catch (error) {
            console.error(`Could not find team with id: ${teamId}`, error);
            teamsMap[teamId] = teamId;
          }
        }
        setTeams(teamsMap);

        const formattedEvents: Event[] = [];
        tournaments.forEach((tournament: any) => {
          tournament.rounds.forEach((round: any) => {
            round.matches.forEach((match: any) => {
              if (!match.start_date_time) return;
              formattedEvents.push({
                id: match.id,
                team1: teamsMap[match.team_ids[0]] || "Loading...",
                team2: teamsMap[match.team_ids[1]] || "Loading...",
                date: dayjs(match.start_date_time)
                  .add(4, "hour")
                  .format("YYYY-MM-DD"),
                time: dayjs(match.start_date_time)
                  .add(4, "hour")
                  .format("HH:mm"),
              });
            });
          });
        });
        setEventsData(formattedEvents);
      } catch (error) {
        console.error("Failed to load tournament data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Button
        variant="contained"
        style={{ margin: "20px", backgroundColor: "#7CCD7C" }}
      >
        Add Event
      </Button>
      <TableContainer component={Paper} style={{ margin: "20px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
            {eventsData.map((event) => (
              <TableRow
                key={event.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="left">{event.team1}</TableCell>
                <TableCell align="left">{event.team2}</TableCell>
                <TableCell align="left">{event.date}</TableCell>
                <TableCell align="left">{event.time}</TableCell>
                <TableCell align="left">
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#6495ED" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#F08080", marginLeft: "5px" }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default EventsTable;
