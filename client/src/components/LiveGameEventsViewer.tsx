import { useEffect, useState } from "react";
import type { GameEvent } from "../types";
import axios from "axios";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

interface LiveGameEventsProps {
  is_teen_team: boolean;
  game_id: string;
}

export const LiveGameEventsViewer = (props: LiveGameEventsProps) => {
  const [game_events, set_game_events] = useState([] as GameEvent[]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/game_events/${props.game_id}`)
      .then((r) => {
        set_game_events(r.data);
      });
  });

  const delete_game_event = (i: number) => {
    axios
      .delete(`http://localhost:3000/api/game_events/${props.game_id}`, {
        data: {
          game_event_to_delete: i,
        },
      })
      .then((r) => {
        console.log(r);
        set_game_events(r.data);
      });
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell scope="col">Player Origin ID</TableCell>
              <TableCell scope="col">Action</TableCell>
              <TableCell scope="col">Player Target ID</TableCell>
              <TableCell scope="col">Quantitiy</TableCell>
              <TableCell scope="col">Delete Event</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {game_events.map((event, i) => (
              <TableRow key={i}>
                <TableCell>{event.player_origin_id}</TableCell>
                <TableCell>{event.action}</TableCell>
                <TableCell>{event.player_target_id}</TableCell>
                <TableCell>{event.count}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      delete_game_event(i);
                    }}
                  >
                    Delete Game Event
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
