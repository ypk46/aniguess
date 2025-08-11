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
