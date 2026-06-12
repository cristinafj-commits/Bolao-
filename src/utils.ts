import { Match, Participant, Guess, ParticipantScores } from './types';

// Mock World Cup Matches
export const initialMatches: Match[] = [
  {
    id: 'm1',
    homeTeam: 'Brasil',
    awayTeam: 'Croácia',
    homeFlag: '🇧🇷',
    awayFlag: '🇭🇷',
    homeScore: null,
    awayScore: null,
    status: 'SCHEDULED',
    minute: 0,
    group: 'Grupo A - Rodada 1',
    date: '12 Out, 15:00',
  },
  {
    id: 'm2',
    homeTeam: 'Espanha',
    awayTeam: 'Alemanha',
    homeFlag: '🇪🇸',
    awayFlag: '🇩🇪',
    homeScore: null,
    awayScore: null,
    status: 'SCHEDULED',
    minute: 0,
    group: 'Grupo E - Rodada 2',
    date: '13 Out, 16:00',
  },
  {
    id: 'm3',
    homeTeam: 'Argentina',
    awayTeam: 'França',
    homeFlag: '🇦🇷',
    awayFlag: '🇫🇷',
    homeScore: null,
    awayScore: null,
    status: 'SCHEDULED',
    minute: 0,
    group: 'Grupo C - Rodada 1',
    date: '14 Out, 15:00',
  },
  {
    id: 'm4',
    homeTeam: 'Portugal',
    awayTeam: 'Uruguai',
    homeFlag: '🇵🇹',
    awayFlag: '🇺🇾',
    homeScore: null,
    awayScore: null,
    status: 'SCHEDULED',
    minute: 0,
    group: 'Grupo H - Rodada 2',
    date: '15 Out, 16:00',
  },
  {
    id: 'm5',
    homeTeam: 'EUA',
    awayTeam: 'Inglaterra',
    homeFlag: '🇺🇸',
    awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    homeScore: null,
    awayScore: null,
    status: 'SCHEDULED',
    minute: 0,
    group: 'Grupo B - Rodada 1',
    date: '16 Out, 12:00',
  },
  {
    id: 'm6',
    homeTeam: 'Japão',
    awayTeam: 'Costa Rica',
    homeFlag: '🇯🇵',
    awayFlag: '🇨🇷',
    homeScore: null,
    awayScore: null,
    status: 'SCHEDULED',
    minute: 0,
    group: 'Grupo E - Rodada 1',
    date: '17 Out, 09:00',
  }
];

// Initial pre-registered participants
export const initialParticipants: Participant[] = [
  { id: 'p1', name: 'Neymar de Sousa', avatar: '👑' },
  { id: 'p2', name: 'Ana Silva', avatar: '🔬' },
  { id: 'p3', name: 'Beto Cascardo', avatar: '⚽' },
  { id: 'p4', name: 'Carla Souza', avatar: '🧠' },
  { id: 'p5', name: 'Danilo Pereira', avatar: '🎮' }
];

// Funny predefined predictions for initial participants to populate the app on first boot
export const initialGuesses: Guess[] = [
  // Neymar de Sousa
  { participantId: 'p1', matchId: 'm1', homeScoreGuess: 3, awayScoreGuess: 0 },
  { participantId: 'p1', matchId: 'm2', homeScoreGuess: 1, awayScoreGuess: 2 },
  { participantId: 'p1', matchId: 'm3', homeScoreGuess: 2, awayScoreGuess: 2 },
  { participantId: 'p1', matchId: 'm4', homeScoreGuess: 2, awayScoreGuess: 1 },
  { participantId: 'p1', matchId: 'm5', homeScoreGuess: 0, awayScoreGuess: 3 },
  { participantId: 'p1', matchId: 'm6', homeScoreGuess: 2, awayScoreGuess: 0 },

  // Ana Silva
  { participantId: 'p2', matchId: 'm1', homeScoreGuess: 2, awayScoreGuess: 1 },
  { participantId: 'p2', matchId: 'm2', homeScoreGuess: 1, awayScoreGuess: 1 },
  { participantId: 'p2', matchId: 'm3', homeScoreGuess: 1, awayScoreGuess: 3 },
  { participantId: 'p2', matchId: 'm4', homeScoreGuess: 1, awayScoreGuess: 2 },
  { participantId: 'p2', matchId: 'm5', homeScoreGuess: 1, awayScoreGuess: 4 },
  { participantId: 'p2', matchId: 'm6', homeScoreGuess: 1, awayScoreGuess: 0 },

  // Beto Cascardo
  { participantId: 'p3', matchId: 'm1', homeScoreGuess: 2, awayScoreGuess: 0 },
  { participantId: 'p3', matchId: 'm2', homeScoreGuess: 2, awayScoreGuess: 2 },
  { participantId: 'p3', matchId: 'm3', homeScoreGuess: 3, awayScoreGuess: 1 },
  { participantId: 'p3', matchId: 'm4', homeScoreGuess: 3, awayScoreGuess: 0 },
  { participantId: 'p3', matchId: 'm5', homeScoreGuess: 1, awayScoreGuess: 2 },
  { participantId: 'p3', matchId: 'm6', homeScoreGuess: 3, awayScoreGuess: 1 },

  // Carla Souza
  { participantId: 'p4', matchId: 'm1', homeScoreGuess: 1, awayScoreGuess: 0 },
  { participantId: 'p4', matchId: 'm2', homeScoreGuess: 0, awayScoreGuess: 2 },
  { participantId: 'p4', matchId: 'm3', homeScoreGuess: 1, awayScoreGuess: 2 },
  { participantId: 'p4', matchId: 'm4', homeScoreGuess: 1, awayScoreGuess: 1 },
  { participantId: 'p4', matchId: 'm5', homeScoreGuess: 0, awayScoreGuess: 2 },
  { participantId: 'p4', matchId: 'm6', homeScoreGuess: 0, awayScoreGuess: 0 },

  // Danilo Pereira
  { participantId: 'p5', matchId: 'm1', homeScoreGuess: 4, awayScoreGuess: 1 },
  { participantId: 'p5', matchId: 'm2', homeScoreGuess: 2, awayScoreGuess: 1 },
  { participantId: 'p5', matchId: 'm3', homeScoreGuess: 0, awayScoreGuess: 2 },
  { participantId: 'p5', matchId: 'm4', homeScoreGuess: 1, awayScoreGuess: 0 },
  { participantId: 'p5', matchId: 'm5', homeScoreGuess: 1, awayScoreGuess: 1 },
  { participantId: 'p5', matchId: 'm6', homeScoreGuess: 0, awayScoreGuess: 2 }
];

export const AVATARS = ['⚽', '🇧🇷', '🏆', '🔥', '🧠', '💼', '💻', '🧪', '🎮', '🦄', '👑', '🐼', '🦊', '🚀', '🎸', '🌟'];

/**
 * Calculates score points for a single prediction and actual score
 */
export function calculateGuessPoints(
  homeGuess: number | undefined | null,
  awayGuess: number | undefined | null,
  homeActual: number | null,
  awayActual: number | null
): { points: number; type: 'EXACT' | 'DIFFERENCE' | 'ONE_TEAM' | 'OUTCOME' | 'ZERO' } {
  if (homeGuess === undefined || homeGuess === null || awayGuess === undefined || awayGuess === null) {
    return { points: 0, type: 'ZERO' };
  }
  if (homeActual === null || awayActual === null) {
    return { points: 0, type: 'ZERO' }; // Game hasn't started or no score yet
  }

  const guessSign = Math.sign(homeGuess - awayGuess);
  const actualSign = Math.sign(homeActual - awayActual);

  // Correct outcome prediction (home wins, draw, or away wins)
  const correctOutcome = guessSign === actualSign;

  if (!correctOutcome) {
    return { points: 0, type: 'ZERO' };
  }

  // EXACT Match score (e.g. guessed 2-1, ended 2-1)
  if (homeGuess === homeActual && awayGuess === awayActual) {
    return { points: 3, type: 'EXACT' };
  }

  // Only outcome correct (e.g. guessed 3-1, ended 1-0) - 1 point
  return { points: 1, type: 'OUTCOME' };
}

/**
 * Computes scores and leaderboard statistics for all participants
 */
export function calculateLeaderboard(
  participants: Participant[],
  matches: Match[],
  guesses: Guess[]
): ParticipantScores[] {
  return participants.map((p) => {
    let points = 0;
    let exactScores = 0;
    let correctOutcomes = 0;

    const pointsBreakdown = {
      exact: 0,
      difference: 0,
      oneTeam: 0,
      outcome: 0,
      zero: 0,
    };

    // Calculate against each match that has started/finished/has actual scores
    matches.forEach((m) => {
      if (m.homeScore !== null && m.awayScore !== null) {
        const userGuess = guesses.find((g) => g.participantId === p.id && g.matchId === m.id);
        if (userGuess) {
          const res = calculateGuessPoints(
            userGuess.homeScoreGuess,
            userGuess.awayScoreGuess,
            m.homeScore,
            m.awayScore
          );

          points += res.points;
          if (res.type === 'EXACT') {
            exactScores++;
            pointsBreakdown.exact++;
          } else if (res.type === 'DIFFERENCE') {
            correctOutcomes++;
            pointsBreakdown.difference++;
          } else if (res.type === 'ONE_TEAM') {
            correctOutcomes++;
            pointsBreakdown.oneTeam++;
          } else if (res.type === 'OUTCOME') {
            correctOutcomes++;
            pointsBreakdown.outcome++;
          } else {
            pointsBreakdown.zero++;
          }
        } else {
          pointsBreakdown.zero++;
        }
      }
    });

    return {
      participantId: p.id,
      points,
      exactScores,
      correctOutcomes,
      pointsBreakdown,
    };
  }).sort((a, b) => {
    // 1. Sort by points descending
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // 2. Tie-breaker 1: Exact scores count descending
    if (b.exactScores !== a.exactScores) {
      return b.exactScores - a.exactScores;
    }
    // 3. Tie-breaker 2: Outcomes count descending
    return b.correctOutcomes - a.correctOutcomes;
  });
}
