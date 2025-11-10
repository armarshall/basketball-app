import axios from "axios";
import { useEffect, useState } from "react";
import { type GameStats, type Statline } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

interface StatsViewerProps {
  is_teen: boolean;
  player_id: string;
}

export const StatsViewer = (props: StatsViewerProps) => {
  const dummy_statline: Statline = {
    points: 0,
    rebounds: 0,
    assists: 0,
    blocks: 0,
    steals: 0,
    turnovers: 0,
    field_goals_made: 0,
    field_goals_attempted: 0,
    three_pointers_made: 0,
    three_pointers_attempted: 0,
    personal_fouls: 0,
    minutes: 0,
  };
  const [player_stats, set_player_stats] = useState([] as GameStats[]);

  useEffect(() => {
    if (props.is_teen) {
      axios
        .get(`http://localhost:3000/api/teenager/stats/${props.player_id}`)
        .then((r) => {
          set_player_stats(r.data);
        });
    } else {
      axios
        .get(`http://localhost:3000/api/children/stats/${props.player_id}`)
        .then((r) => {
          set_player_stats(r.data);
        });
    }
  });

  const getFormattedDate = (_date: Date) => {
    const date = new Date(_date);
    const year = date.getFullYear();

    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : "0" + month;

    let day = date.getDate().toString();
    day = day.length > 1 ? day : "0" + day;

    return month + "/" + day + "/" + year;
  };

  const capitalize = (s: string) => {
    return s[0].toUpperCase() + s.slice(1);
  };

  return (
    <>
      {player_stats.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell scope="col">Date</TableCell>
                {Object.keys(dummy_statline).map((keyname, i) => (
                  <TableCell scope="col" key={i}>
                    {capitalize(keyname.replace(/_/g, " "))}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {player_stats.map((gs, i) => (
                <TableRow>
                  <TableCell component="th" scope="row" key={i}>
                    {getFormattedDate(gs.date)}
                  </TableCell>
                  {Object.values(player_stats[i].statline).map((vals, j) => (
                    <TableCell key={j}>{vals}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};
