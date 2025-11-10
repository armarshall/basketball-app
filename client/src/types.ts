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
