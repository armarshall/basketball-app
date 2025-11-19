import mongoose from "mongoose";

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
  three_pointers_attempted: number;
  personal_fouls: number;
  minutes: number;
}

export interface GameStats {
  date: Date;
  game_id: string;
  statline: Statline; // decided to break this up for readability, also easier assignment
}

export interface ITeam {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  name: string;
  players: mongoose.Types.ObjectId[];
  is_teen_team: boolean;
  managerId?: mongoose.Types.ObjectId | null;
}

export interface IMatch {
  id?: string;
  team1_id: string;
  team2_id: string;
  start_date_time?: Date;
  team1_score?: number[];
  team2_score?: number[];
  winner_id?: string;
  round_id: string;
}

export interface IRound {
  id?: string;
  match_ids?: string[];
  tournament_id: string;
}

export interface ITournament {
  id?: string;
  start_date_time: Date;
  is_teen_tournament: boolean;
  round_ids?: string[];
}
