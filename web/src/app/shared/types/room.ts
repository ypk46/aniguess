export interface RoomData {
  animeId: string;
  rounds: number;
  roundTimer: number;
  player: Player;
}

export interface Player {
  id: string;
  name: string;
}

export interface Room {
  animeId: string;
  code: string;
  players: Player[];
  owner: string;
  roundTimer: number;
  rounds: number;
  state: 'lobby' | 'in_progress' | 'finished';
}
