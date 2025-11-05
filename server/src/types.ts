import { Document } from "mongoose";

export interface Statline {
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
  turnovers: number;
  field_goals_made: number;
  field_goals_attempted: number;
  three_pointers_made: number;
  threee_pointers_attempted: number;
  personal_fouls: number;
  minutes: number;
}

export interface GameStats {
  date: Date;
  game_id: String;
  statline: Statline; // decided to break this up for readability, also easier assignment
}

export interface ITeam {
  id: String; // team id
  name: String; // team name
  players: String[]; // player ids
  is_teen_team: Boolean; // if the team is teens or kids
}

export interface IGuardian {
  id: String; // guardian id
  name: String; // guardian name
  dateOfBirth: Date; // guardian date of birth
  email: String; // guardian email
  password: String; // guardian password
  childId?: String; // id of child, TODO: add multiple children support
}

export interface IChild {
  id: String; // child id
  name: String; // child name
  dateOfBirth: Date; // child date of birth
  guardianId: String; // guardian id
  teamId?: String; // optional team id
  game_stats: GameStats[];
}

export interface ITeenager {
  id: String; // teenager id
  name: String; // teenager name
  dateOfBirth: Date; // teenager date of birth
  email: String; // teenager email
  password: String; // teenager password
  teamId?: String; // optional team id
  game_stats: GameStats[];
}

export interface IMatch {
  team_ids: String[];
  start_date_time?: Date;
  scores?: Number[];
  winner_id?: String;
}

export interface IRound {
  matches: IMatch[];
}

// rounds: array of rounds, which is an array of matches, which is a pair of teams

export interface ITournament {
  id?: String;
  start_date_time: Date;
  is_teen_tournament: Boolean;
  rounds: IRound[];
}

export interface IImage extends Document {
  filename: string;
  url: string;
  uploadDate: Date;
}
