import mongoose from "mongoose";

export interface ITeam {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  name: string;
  players: mongoose.Types.ObjectId[];
  is_teen_team: boolean;
  managerId?: mongoose.Types.ObjectId | null;
  teamSettings?: TeamSettings;
}

export interface TeamSettings {
  jerseyColor: string;
  primaryColor: string;
  secondaryColor: string;
  practiceDays: string[];
  practiceTime: string;
  maxPlayers: number;
  seasonStart: Date;
  seasonEnd: Date;
  contactEmail: string;
  contactPhone: string;
  teamImage: string;
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
}

export interface ITeenager {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  name: string;
  dateOfBirth: Date;
  email: string;
  password: string;
  teamId?: mongoose.Types.ObjectId | null;
}

export interface IChild {
  id: string;
  name: string;
  dateOfBirth: Date;
  guardianId: string;
  teamId?: string;
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