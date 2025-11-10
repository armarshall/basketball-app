import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { type Statline } from "../types";
import { useState } from "react";
import axios from "axios";

interface StatsUpdaterProps {
  player_id: string;
  is_teen: boolean;
  game_id: string;
}

export const StatsUpdater = (p: StatsUpdaterProps) => {
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

  const [player_stats, set_player_stats] = useState(
    new Map(Object.entries(dummy_statline)),
  );

  // const form_submit = (e: React.SyntheticEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  // };
  //
  const capitalize = (s: string) => {
    return s[0].toUpperCase() + s.slice(1);
  };

  const updateStats = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (p.is_teen) {
      console.log(player_stats);
      axios
        .patch(`http://localhost:3000/api/teenagers/stats/${p.player_id}`, {
          game_stats: player_stats,
          game_id: p.game_id,
        })
        .then((r) => {
          console.log(r);
        });
    } else {
      console.log(player_stats);

      axios
        .patch(`http://localhost:3000/api/children/stats/${p.player_id}`, {
          game_stats: Object.fromEntries(player_stats),
          game_id: p.game_id,
        })
        .then((r) => {
          console.log(r);
        });
    }
  };

  return (
    <>
      <form onSubmit={updateStats}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(dummy_statline).map((keyname, i) => (
                  <TableCell scope="col" key={i}>
                    {capitalize(keyname.replace(/_/g, " "))}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {Object.keys(dummy_statline).map((key, i) => (
                  <TableCell key={i}>
                    <input
                      key={i}
                      value={player_stats.get(key)}
                      onChange={(e) =>
                        set_player_stats(
                          new Map(player_stats).set(
                            key,
                            new Number(e.target.value),
                          ),
                        )
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <button type="submit">Submit</button>
      </form>
    </>
  );
};
