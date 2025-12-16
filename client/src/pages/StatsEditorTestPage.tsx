import { useEffect, useState } from "react";
import { StatsUpdater } from "../components/StatsEditor";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  type SelectChangeEvent,
} from "@mui/material";
import axios from "axios";
import type { IChild, ITeenager } from "../types";

export const StatsEditorPage = () => {
  const [player_chosen, set_player_chosen] = useState<IChild | ITeenager>();

  const [child_player_list, set_child_player_list] = useState(
    [] as Array<IChild>,
  );
  const [teen_player_list, set_teen_player_list] = useState(
    [] as Array<ITeenager>,
  );

  useEffect(() => {
    axios.get("http://localhost:3000/api/children").then((r) => {
      set_child_player_list(r.data);
    });
    axios.get("http://localhost:3000/api/teenagers").then((r) => {
      set_teen_player_list(r.data);
    });
  }, []);

  const handle_form_change = (event: SelectChangeEvent) => {
    // set_player_name_text(event.target.value as string);

    set_player_chosen(event.target.value);
    console.log(event.target.value);
  };

  return (
    <>
      <h1>Stats Editor</h1>

      <Button href="/admin/events" variant="contained">
        Back
      </Button>
      <FormControl fullWidth>
        <InputLabel id="input-label">Select Player</InputLabel>
        <Select value={player_chosen || ""} onChange={handle_form_change}>
          {teen_player_list.map((v) => (
            <MenuItem value={v}>{v.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {player_chosen ? (
        <StatsUpdater
          player_id={player_chosen ? player_chosen.id! : ""}
          is_teen={true}
          game_id="0"
        />
      ) : (
        <p>Waiting for selection...</p>
      )}
    </>
  );
};
