export enum RoomState {
  LOBBY = 'lobby',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

export interface Room {
  code: string;
  animeId: string;
  rounds: number;
  roundTimer: number; // in seconds
  state: RoomState;
  players: Player[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  correctAnswers: number;
  totalRounds: number;
}

export interface GameEndData {
  scores: PlayerScore[];
  winner: PlayerScore;
  secretCharacters: Array<{
    name: string;
    imageUrl: string;
    round: number;
  }>;
  timestamp: string;
}

export interface CreateRoomRequest {
  animeId: string;
  rounds: number;
  roundTimer: number;
  playerId: string;
}
