import { Button, TextField } from "@mui/material";
import { useState } from "react";
import axios from "axios";

export const TeamCreationForm = () => {
  const [new_team_name, set_new_team_name] = useState("");
  const [new_team_is_teen_only, set_new_team_is_teen_only] = useState(false);

  const team_creation = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const team_to_create = {
      name: new_team_name,
      is_teen_team: new_team_is_teen_only,
      players: [],
    };

    axios
      .post("http://localhost:3000/api/teams", team_to_create)
      .then((res) => {
        console.log(res);
      });

    set_new_team_name("");
    set_new_team_is_teen_only(false);
  };

  return (
    <>
      <form onSubmit={team_creation}>
        <TextField
          id="team-name"
          label="Team Name"
          value={new_team_name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            set_new_team_name(event.target.value);
          }}
        />
        <Button type="submit">Create Team</Button>
      </form>
    </>
  );
};
