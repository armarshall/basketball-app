export interface ITeam {
  id: String; // team id
  name: String; // team name
  players: String[]; // player ids
  is_teen_team: Boolean; // if the team is teens or kids
}

export interface IMatch {
  team_ids: String[];
  winner_id: String;
}

export interface IRound {
  matches: IMatch[];
}

// rounds: array of rounds, which is an array of matches, which is a pair of teams

export interface ITournament {
  id?: String;
  is_teen_tournament: Boolean;
  rounds: IRound[];
}
