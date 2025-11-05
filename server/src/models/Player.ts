export interface Player {
  id: string;
  name: string;
  position: string;
  teamId: string | null;
  jerseyNumber: number;
  height?: string; // Optional: e.g., "6'5""
  weight?: number; // Optional: in pounds
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlayerRequest {
  name: string;
  position: string;
  teamId?: string | null;
  jerseyNumber: number;
  height?: string;
  weight?: number;
}

export interface UpdatePlayerRequest {
  name?: string;
  position?: string;
  teamId?: string | null;
  jerseyNumber?: number;
  height?: string;
  weight?: number;
}

export interface PlayerResponse {
  id: string;
  name: string;
  position: string;
  teamId: string | null;
  jerseyNumber: number;
  height?: string;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

// Utility function to convert Player to PlayerResponse (for API responses)
export const playerToResponse = (player: Player): PlayerResponse => ({
  id: player.id,
  name: player.name,
  position: player.position,
  teamId: player.teamId,
  jerseyNumber: player.jerseyNumber,
  height: player.height,
  weight: player.weight,
  createdAt: player.createdAt.toISOString(),
  updatedAt: player.updatedAt.toISOString()
});

// Position enum for consistent values
export enum PlayerPosition {
  POINT_GUARD = 'Point Guard',
  SHOOTING_GUARD = 'Shooting Guard',
  SMALL_FORWARD = 'Small Forward',
  POWER_FORWARD = 'Power Forward',
  CENTER = 'Center'
}

// Validation functions
export const validateCreatePlayerRequest = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.position || typeof data.position !== 'string' || data.name.trim().length === 0) {
    errors.push('Position is required');
  } else if (!Object.values(PlayerPosition).includes(data.position as PlayerPosition)) {
    errors.push(`Position must be one of: ${Object.values(PlayerPosition).join(', ')}`);
  }

  if (data.jerseyNumber === undefined || typeof data.jerseyNumber !== 'number') {
    errors.push('Jersey number is required and must be a number');
  } else if (data.jerseyNumber < 0 || data.jerseyNumber > 99) {
    errors.push('Jersey number must be between 0 and 99');
  }

  if (data.height && typeof data.height !== 'string') {
    errors.push('Height must be a string');
  }

  if (data.weight && typeof data.weight !== 'number') {
    errors.push('Weight must be a number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};