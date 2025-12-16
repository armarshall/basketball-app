import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  type SelectChangeEvent,
} from "@mui/material";
import { LiveGameEventsViewer } from "../components/LiveGameEventsViewer";
import { useEffect, useState } from "react";
import type { IMatch } from "../types";
import axios from "axios";

export const LiveGameEventsPage = () => {
  const [chosen_match, set_chosen_match] = useState<IMatch>();
  const [all_matches, set_matches] = useState([] as IMatch[]);

  useEffect(() => {
    axios.get("http://localhost:3000/api/matches/").then((r) => {
      set_matches(r.data);
    });
  }, []);

  const handle_form_change = (event: SelectChangeEvent) => {
    // set_player_name_text(event.target.value as string);

    set_chosen_match(event.target.value);
    console.log(event.target.value);
  };

  return (
    <>
      <h1>Live Game Events</h1>
      <Button href="/admin/events" variant="contained">
        Back
      </Button>

      <FormControl fullWidth>
        <InputLabel id="input-label">Select Match</InputLabel>
        <Select value={chosen_match || ""} onChange={handle_form_change}>
          {all_matches.map((v) => (
            <MenuItem value={v}>{v.start_date_time}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {chosen_match ? (
        <LiveGameEventsViewer game_id={chosen_match.id!} is_teen_team={false} />
      ) : (
        <p>Select a match...</p>
      )}
    </>
  );
};
