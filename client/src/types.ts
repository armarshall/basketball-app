export interface ITeam {
  _id?: string;
  id?: string;
  name: string;
  players: string[];
  is_teen_team: boolean;
  managerId?: string | null;
  teamSettings?: TeamSettings;
}

export interface GameEvent {
  player_origin_id: string; // the player that did the thing
  action: string; // the thing the player did (blocked, scored, shot attempt, etc)
  player_target_id: string; // the player the origin targeted (i.e. player_origin_id blocked player_target_id) (can be empty)
  count: number; // the amount (i.e. player_origin_id scored 3)
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
  _id?: string;
  id?: string;
  name: string;
  dateOfBirth: Date;
  email: string;
  password: string;
  childId?: string;
  isManager?: boolean;
  isAdmin?: boolean; // Add this line if you need admin
  managedTeamId?: string | null;
}

export interface ITeenager {
  _id?: string;
  id?: string;
  name: string;
  dateOfBirth: Date;
  email: string;
  password: string;
  teamId?: string;
  game_stats?: GameStats[]; // Add this line
}

export interface GameStats {
  game_id: string;
  statline: Statline;
  date: Date;
}

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

export interface IChild {
  id: string;
  name: string;
  dateOfBirth: Date;
  guardianId: string;
  teamId?: string;
  game_stats?: GameStats[];
}

export interface IMatch {
  id?: string;
  team_ids: string[];
  start_date_time?: Date;
  team1_score?: number[];
  team2_score?: number[];
  winner_id?: string;
  round_id?: string;
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

export interface IImage {
  filename: string;
  url: string;
  uploadDate: Date;
}
