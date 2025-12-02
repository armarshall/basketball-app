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

export interface ITeamSettings {
  jerseyColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  practiceDays?: string[];
  practiceTime?: string;
  maxPlayers?: number;
  seasonStart?: Date;
  seasonEnd?: Date;
  contactEmail?: string;
  contactPhone?: string;
  teamImage?: string;
}

export interface ITeam {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  name: string;
  players: mongoose.Types.ObjectId[];
  is_teen_team: boolean;
  managerId?: mongoose.Types.ObjectId | null;
  teamSettings?: ITeamSettings; // ✅ ADD THIS LINE
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
  _id?: mongoose.Types.ObjectId;
  id?: string;
  team_ids: string[];
  start_date_time?: Date;
  scores?: number[];
  winner_id?: string;
  round_id?: string;
}

export interface IRound {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  matches: IMatch[];
  tournament_id: string;
}

export interface ITournament {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  start_date_time: Date;
  is_teen_tournament: boolean;
  round_ids?: string[]; // This line might be missing in your actual file
}

export interface IImage extends mongoose.Document {
  filename: string;
  url: string;
  uploadDate: Date;
}

export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  teamId: mongoose.Types.ObjectId;
  senderId: string;
  senderType: "Teenager" | "Guardian";
  content: string;
  senderName: string;
  timestamp: Date;
}
