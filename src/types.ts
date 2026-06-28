export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute: number; // 0 to 90 for LIVE simulator
  group: string;
  date: string;
  penaltyWinner?: 'home' | 'away' | null;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isCustom?: boolean;
  email?: string;
  imageUrl?: string;
  isGoogleUser?: boolean;
  locked?: boolean;
  lockedFase2?: boolean;
  lockedMatches?: string[];
  role?: 'servidor' | 'estagiario';
}

export interface Guess {
  participantId: string;
  matchId: string;
  homeScoreGuess: number;
  awayScoreGuess: number;
  penaltyWinnerGuess?: 'home' | 'away' | null;
}

export interface ParticipantScores {
  participantId: string;
  points: number;
  bonusPoints: number;
  exactScores: number; // TIE-BREAKER: Exact scores guessed
  correctOutcomes: number; // TIE-BREAKER: Correct outcome but not exact score
  pointsBreakdown: {
    exact: number; // count of matches
    difference: number; // count of matches
    oneTeam: number; // count of matches
    outcome: number; // count of matches
    zero: number; // count of matches
  };
  isIncomplete?: boolean;
}

export interface SimulationEvent {
  matchId: string;
  time: number; // Match minute
  message: string;
  team: 'home' | 'away';
  type: 'GOAL' | 'START' | 'HALF_TIME' | 'END' | 'CLOSE_CALL';
}
