export interface RoomData {
  animeId: string;
  rounds: number;
  roundTimer: number;
  playerId: string;
}

export interface Room {
  animeId: string;
  code: string;
  players: string[];
  roundTimer: number;
  rounds: number;
  state: 'lobby' | 'active' | 'finished';
}
