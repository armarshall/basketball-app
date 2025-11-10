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
  game_id: String;
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

export interface IGuardian {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  name: string;
  dateOfBirth: Date;
  email: string;
  password: string;
  childId?: string;
  isManager?: boolean;
  managedTeamId?: mongoose.Types.ObjectId | null;
  isAdmin?: boolean;
}

export interface ITeenager {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  name: string;
  dateOfBirth: Date;
  email: string;
  password: string;
  teamId?: mongoose.Types.ObjectId | null;
  game_stats?: GameStats[];
}

export interface IChild {
  id: string;
  name: string;
  dateOfBirth: Date;
  guardianId: string;
  teamId?: string;
  game_stats?: GameStats[];
}

export interface IMatch {
  team_ids: string[];
  start_date_time?: Date;
  scores?: number[];
  winner_id?: string;
}

export interface IRound {
  matches: IMatch[];
}

export interface ITournament {
  id?: string;
  start_date_time: Date;
  is_teen_tournament: boolean;
  rounds: IRound[];
}

export interface IImage extends mongoose.Document {
  filename: string;
  url: string;
  uploadDate: Date;
}