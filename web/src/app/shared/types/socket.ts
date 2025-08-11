export interface WelcomeMessage {
  message: string;
  socketId: string;
  timestamp: string;
}

export interface GuessResultMessage {
  isCorrect: boolean;
  currentRound: number;
  characterName: string;
  characterImage: string;
  attributeEvaluation: Record<
    string,
    {
      status: 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower';
      value: any;
    }
  >;
  timestamp: string;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  correctAnswers: number;
  totalRounds: number;
}

export interface GameEndMessage {
  scores: PlayerScore[];
  winner: PlayerScore;
  secretCharacters: Array<{
    name: string;
    imageUrl: string;
    round: number;
  }>;
  timestamp: string;
}
