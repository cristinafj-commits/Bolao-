import { Match, Participant, Guess, ParticipantScores } from './types';

// Mock World Cup Matches
export const initialMatches: Match[] = [
  // --- 1ª RODADA ---
  { id: 'm0', homeTeam: 'México', awayTeam: 'África do Sul', homeFlag: '🇲🇽', awayFlag: '🇿🇦', homeScore: 1, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo A (Rodada 1)', date: '11 Jun, 16:00' },
  { id: 'm1', homeTeam: 'Coreia do Sul', awayTeam: 'Tchéquia', homeFlag: '🇰🇷', awayFlag: '🇨🇿', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo A (Rodada 1)', date: '11 Jun, 23:00' },
  { id: 'm2', homeTeam: 'Canadá', awayTeam: 'Bósnia e Herzegovina', homeFlag: '🇨🇦', awayFlag: '🇧🇦', homeScore: 1, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo B (Rodada 1)', date: '12 Jun, 16:00' },
  { id: 'm3', homeTeam: 'Estados Unidos', awayTeam: 'Paraguai', homeFlag: '🇺🇸', awayFlag: '🇵🇾', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo D (Rodada 1)', date: '12 Jun, 22:00' },
  { id: 'm4', homeTeam: 'Catar', awayTeam: 'Suíça', homeFlag: '🇶🇦', awayFlag: '🇨🇭', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo B (Rodada 1)', date: '13 Jun, 16:00' },
  { id: 'm5', homeTeam: 'Brasil', awayTeam: 'Marrocos', homeFlag: '🇧🇷', awayFlag: '🇲🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo C (Rodada 1)', date: '13 Jun, 19:00' },
  { id: 'm6', homeTeam: 'Haiti', awayTeam: 'Escócia', homeFlag: '🇭🇹', awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo C (Rodada 1)', date: '13 Jun, 22:00' },
  { id: 'm7', homeTeam: 'Austrália', awayTeam: 'Turquia', homeFlag: '🇦🇺', awayFlag: '🇹🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo D (Rodada 1)', date: '14 Jun, 01:00' },
  { id: 'm8', homeTeam: 'Alemanha', awayTeam: 'Curaçao', homeFlag: '🇩🇪', awayFlag: '🇨🇼', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo E (Rodada 1)', date: '14 Jun, 14:00' },
  { id: 'm9', homeTeam: 'Holanda', awayTeam: 'Japão', homeFlag: '🇳🇱', awayFlag: '🇯🇵', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo F (Rodada 1)', date: '14 Jun, 17:00' },
  { id: 'm10', homeTeam: 'Costa do Marfim', awayTeam: 'Equador', homeFlag: '🇨🇮', awayFlag: '🇪🇨', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo E (Rodada 1)', date: '14 Jun, 20:00' },
  { id: 'm11', homeTeam: 'Suécia', awayTeam: 'Tunísia', homeFlag: '🇸🇪', awayFlag: '🇹🇳', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo F (Rodada 1)', date: '14 Jun, 23:00' },
  { id: 'm12', homeTeam: 'Espanha', awayTeam: 'Cabo Verde', homeFlag: '🇪🇸', awayFlag: '🇨🇻', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo H (Rodada 1)', date: '15 Jun, 13:00' },
  { id: 'm13', homeTeam: 'Bélgica', awayTeam: 'Egito', homeFlag: '🇧🇪', awayFlag: '🇪🇬', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo G (Rodada 1)', date: '15 Jun, 16:00' },
  { id: 'm14', homeTeam: 'Arábia Saudita', awayTeam: 'Uruguai', homeFlag: '🇸🇦', awayFlag: '🇺🇾', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo H (Rodada 1)', date: '15 Jun, 19:00' },
  { id: 'm15', homeTeam: 'Irã', awayTeam: 'Nova Zelândia', homeFlag: '🇮🇷', awayFlag: '🇳🇿', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo G (Rodada 1)', date: '15 Jun, 22:00' },
  { id: 'm16', homeTeam: 'França', awayTeam: 'Senegal', homeFlag: '🇫🇷', awayFlag: '🇸🇳', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo I (Rodada 1)', date: '16 Jun, 16:00' },
  { id: 'm17', homeTeam: 'Iraque', awayTeam: 'Noruega', homeFlag: '🇮🇶', awayFlag: '🇳🇴', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo I (Rodada 1)', date: '16 Jun, 19:00' },
  { id: 'm18', homeTeam: 'Argentina', awayTeam: 'Argélia', homeFlag: '🇦🇷', awayFlag: '🇩🇿', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo J (Rodada 1)', date: '16 Jun, 22:00' },
  { id: 'm19', homeTeam: 'Áustria', awayTeam: 'Jordânia', homeFlag: '🇦🇹', awayFlag: '🇯🇴', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo J (Rodada 1)', date: '17 Jun, 01:00' },
  { id: 'm20', homeTeam: 'Portugal', awayTeam: 'RD do Congo', homeFlag: '🇵🇹', awayFlag: '🇨🇩', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo K (Rodada 1)', date: '17 Jun, 14:00' },
  { id: 'm21', homeTeam: 'Inglaterra', awayTeam: 'Croácia', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇭🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo L (Rodada 1)', date: '17 Jun, 17:00' },
  { id: 'm22', homeTeam: 'Gana', awayTeam: 'Panamá', homeFlag: '🇬🇭', awayFlag: '🇵🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo L (Rodada 1)', date: '17 Jun, 20:00' },
  { id: 'm23', homeTeam: 'Uzbequistão', awayTeam: 'Colômbia', homeFlag: '🇺🇿', awayFlag: '🇨🇴', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo K (Rodada 1)', date: '17 Jun, 23:00' },

  // --- 2ª RODADA ---
  { id: 'm24', homeTeam: 'Tchéquia', awayTeam: 'África do Sul', homeFlag: '🇨🇿', awayFlag: '🇿🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo A (Rodada 2)', date: '18 Jun, 13:00' },
  { id: 'm25', homeTeam: 'Suíça', awayTeam: 'Bósnia e Herzegovina', homeFlag: '🇨🇭', awayFlag: '🇧🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo B (Rodada 2)', date: '18 Jun, 16:00' },
  { id: 'm26', homeTeam: 'Canadá', awayTeam: 'Catar', homeFlag: '🇨🇦', awayFlag: '🇶🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo B (Rodada 2)', date: '18 Jun, 19:00' },
  { id: 'm27', homeTeam: 'México', awayTeam: 'Coreia do Sul', homeFlag: '🇲🇽', awayFlag: '🇰🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo A (Rodada 2)', date: '18 Jun, 22:00' },
  { id: 'm28', homeTeam: 'Estados Unidos', awayTeam: 'Austrália', homeFlag: '🇺🇸', awayFlag: '🇦🇺', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo D (Rodada 2)', date: '19 Jun, 16:00' },
  { id: 'm29', homeTeam: 'Escócia', awayTeam: 'Marrocos', homeFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', awayFlag: '🇲🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo C (Rodada 2)', date: '19 Jun, 19:00' },
  { id: 'm30', homeTeam: 'Brasil', awayTeam: 'Haiti', homeFlag: '🇧🇷', awayFlag: '🇭🇹', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo C (Rodada 2)', date: '19 Jun, 21:30' },
  { id: 'm31', homeTeam: 'Turquia', awayTeam: 'Paraguai', homeFlag: '🇹🇷', awayFlag: '🇵🇾', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo D (Rodada 2)', date: '20 Jun, 00:00' },
  { id: 'm32', homeTeam: 'Holanda', awayTeam: 'Suécia', homeFlag: '🇳🇱', awayFlag: '🇸🇪', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo F (Rodada 2)', date: '20 Jun, 14:00' },
  { id: 'm33', homeTeam: 'Alemanha', awayTeam: 'Costa do Marfim', homeFlag: '🇩🇪', awayFlag: '🇨🇮', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo E (Rodada 2)', date: '20 Jun, 17:00' },
  { id: 'm34', homeTeam: 'Equador', awayTeam: 'Curaçao', homeFlag: '🇪🇨', awayFlag: '🇨🇼', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo E (Rodada 2)', date: '20 Jun, 21:00' },
  { id: 'm35', homeTeam: 'Tunísia', awayTeam: 'Japão', homeFlag: '🇹🇳', awayFlag: '🇯🇵', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo F (Rodada 2)', date: '21 Jun, 01:00' },
  { id: 'm36', homeTeam: 'Espanha', awayTeam: 'Arábia Saudita', homeFlag: '🇪🇸', awayFlag: '🇸🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo H (Rodada 2)', date: '21 Jun, 13:00' },
  { id: 'm37', homeTeam: 'Bélgica', awayTeam: 'Irã', homeFlag: '🇧🇪', awayFlag: '🇮🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo G (Rodada 2)', date: '21 Jun, 16:00' },
  { id: 'm38', homeTeam: 'Uruguai', awayTeam: 'Cabo Verde', homeFlag: '🇺🇾', awayFlag: '🇨🇻', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo H (Rodada 2)', date: '21 Jun, 19:00' },
  { id: 'm39', homeTeam: 'Nova Zelândia', awayTeam: 'Egito', homeFlag: '🇳🇿', awayFlag: '🇪🇬', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo G (Rodada 2)', date: '21 Jun, 22:00' },
  { id: 'm40', homeTeam: 'Argentina', awayTeam: 'Áustria', homeFlag: '🇦🇷', awayFlag: '🇦🇹', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo J (Rodada 2)', date: '22 Jun, 14:00' },
  { id: 'm41', homeTeam: 'França', awayTeam: 'Iraque', homeFlag: '🇫🇷', awayFlag: '🇮🇶', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo I (Rodada 2)', date: '22 Jun, 18:00' },
  { id: 'm42', homeTeam: 'Noruega', awayTeam: 'Senegal', homeFlag: '🇳🇴', awayFlag: '🇸🇳', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo I (Rodada 2)', date: '22 Jun, 21:00' },
  { id: 'm43', homeTeam: 'Jordânia', awayTeam: 'Argélia', homeFlag: '🇯🇴', awayFlag: '🇩🇿', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo J (Rodada 2)', date: '23 Jun, 00:00' },
  { id: 'm44', homeTeam: 'Portugal', awayTeam: 'Uzbequistão', homeFlag: '🇵🇹', awayFlag: '🇺🇿', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo K (Rodada 2)', date: '23 Jun, 14:00' },
  { id: 'm45', homeTeam: 'Inglaterra', awayTeam: 'Gana', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇬🇭', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo L (Rodada 2)', date: '23 Jun, 17:00' },
  { id: 'm46', homeTeam: 'Panamá', awayTeam: 'Croácia', homeFlag: '🇵🇦', awayFlag: '🇭🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo L (Rodada 2)', date: '23 Jun, 20:00' },
  { id: 'm47', homeTeam: 'Colômbia', awayTeam: 'RD do Congo', homeFlag: '🇨🇴', awayFlag: '🇨🇩', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo K (Rodada 2)', date: '23 Jun, 23:00' },

  // --- 3ª RODADA ---
  { id: 'm48', homeTeam: 'Suíça', awayTeam: 'Canadá', homeFlag: '🇨🇭', awayFlag: '🇨🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo B (Rodada 3)', date: '24 Jun, 16:00' },
  { id: 'm49', homeTeam: 'Bósnia e Herzegovina', awayTeam: 'Catar', homeFlag: '🇧🇦', awayFlag: '🇶🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo B (Rodada 3)', date: '24 Jun, 16:00' },
  { id: 'm50', homeTeam: 'Escócia', awayTeam: 'Brasil', homeFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', awayFlag: '🇧🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo C (Rodada 3)', date: '24 Jun, 19:00' },
  { id: 'm51', homeTeam: 'Marrocos', awayTeam: 'Haiti', homeFlag: '🇲🇦', awayFlag: '🇭🇹', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo C (Rodada 3)', date: '24 Jun, 19:00' },
  { id: 'm52', homeTeam: 'Tchéquia', awayTeam: 'México', homeFlag: '🇨🇿', awayFlag: '🇲🇽', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo A (Rodada 3)', date: '24 Jun, 22:00' },
  { id: 'm53', homeTeam: 'África do Sul', awayTeam: 'Coreia do Sul', homeFlag: '🇿🇦', awayFlag: '🇰🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo A (Rodada 3)', date: '24 Jun, 22:00' },
  { id: 'm54', homeTeam: 'Curaçao', awayTeam: 'Costa do Marfim', homeFlag: '🇨🇼', awayFlag: '🇨🇮', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo E (Rodada 3)', date: '25 Jun, 17:00' },
  { id: 'm55', homeTeam: 'Equador', awayTeam: 'Alemanha', homeFlag: '🇪🇨', awayFlag: '🇩🇪', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo E (Rodada 3)', date: '25 Jun, 17:00' },
  { id: 'm56', homeTeam: 'Japão', awayTeam: 'Suécia', homeFlag: '🇯🇵', awayFlag: '🇸🇪', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo F (Rodada 3)', date: '25 Jun, 20:00' },
  { id: 'm57', homeTeam: 'Tunísia', awayTeam: 'Holanda', homeFlag: '🇹🇳', awayFlag: '🇳🇱', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo F (Rodada 3)', date: '25 Jun, 20:00' },
  { id: 'm58', homeTeam: 'Turquia', awayTeam: 'Estados Unidos', homeFlag: '🇹🇷', awayFlag: '🇺🇸', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo D (Rodada 3)', date: '25 Jun, 23:00' },
  { id: 'm59', homeTeam: 'Paraguai', awayTeam: 'Austrália', homeFlag: '🇵🇾', awayFlag: '🇦🇺', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo D (Rodada 3)', date: '25 Jun, 23:00' },
  { id: 'm60', homeTeam: 'Noruega', awayTeam: 'França', homeFlag: '🇳🇴', awayFlag: '🇫🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo I (Rodada 3)', date: '26 Jun, 16:00' },
  { id: 'm61', homeTeam: 'Senegal', awayTeam: 'Iraque', homeFlag: '🇸🇳', awayFlag: '🇮🇶', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo I (Rodada 3)', date: '26 Jun, 16:00' },
  { id: 'm62', homeTeam: 'Cabo Verde', awayTeam: 'Arábia Saudita', homeFlag: '🇨🇻', awayFlag: '🇸🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo H (Rodada 3)', date: '26 Jun, 21:00' },
  { id: 'm63', homeTeam: 'Uruguai', awayTeam: 'Espanha', homeFlag: '🇺🇾', awayFlag: '🇪🇸', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo H (Rodada 3)', date: '26 Jun, 21:00' },
  { id: 'm64', homeTeam: 'Egito', awayTeam: 'Irã', homeFlag: '🇪🇬', awayFlag: '🇮🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo G (Rodada 3)', date: '27 Jun, 00:00' },
  { id: 'm65', homeTeam: 'Nova Zelândia', awayTeam: 'Bélgica', homeFlag: '🇳🇿', awayFlag: '🇧🇪', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo G (Rodada 3)', date: '27 Jun, 00:00' },
  { id: 'm66', homeTeam: 'Panamá', awayTeam: 'Inglaterra', homeFlag: '🇵🇦', awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo L (Rodada 3)', date: '27 Jun, 18:00' },
  { id: 'm67', homeTeam: 'Croácia', awayTeam: 'Gana', homeFlag: '🇭🇷', awayFlag: '🇬🇭', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo L (Rodada 3)', date: '27 Jun, 18:00' },
  { id: 'm68', homeTeam: 'Colômbia', awayTeam: 'Portugal', homeFlag: '🇨🇴', awayFlag: '🇵🇹', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo K (Rodada 3)', date: '27 Jun, 20:30' },
  { id: 'm69', homeTeam: 'RD do Congo', awayTeam: 'Uzbequistão', homeFlag: '🇨🇩', awayFlag: '🇺🇿', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo K (Rodada 3)', date: '27 Jun, 20:30' },
  { id: 'm70', homeTeam: 'Argélia', awayTeam: 'Áustria', homeFlag: '🇩🇿', awayFlag: '🇦🇹', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo J (Rodada 3)', date: '27 Jun, 23:00' },
  { id: 'm71', homeTeam: 'Jordânia', awayTeam: 'Argentina', homeFlag: '🇯🇴', awayFlag: '🇦🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Grupo J (Rodada 3)', date: '27 Jun, 23:00' }
];

// Initial pre-registered participants
export const initialParticipants: Participant[] = [];

// Predefined predictions for initial participants to populate the app on first boot (covering Round 1)
export const initialGuesses: Guess[] = [];

export const AVATARS = ['⚽', '🇧🇷', '🏆', '🔥', '🧠', '💼', '💻', '🧪', '🎮', '🦄', '👑', '🐼', '🦊', '🚀', '🎸', '🌟'];

/**
 * Calculates score points for a single prediction and actual score
 */
export function calculateGuessPoints(
  homeGuess: number | string | undefined | null,
  awayGuess: number | string | undefined | null,
  homeActual: number | string | null,
  awayActual: number | string | null
): { points: number; type: 'EXACT' | 'DIFFERENCE' | 'ONE_TEAM' | 'OUTCOME' | 'ZERO' } {
  if (homeGuess === undefined || homeGuess === null || homeGuess === '' || awayGuess === undefined || awayGuess === null || awayGuess === '') {
    return { points: 0, type: 'ZERO' };
  }
  if (homeActual === null || awayActual === null || homeActual === '' || awayActual === '') {
    return { points: 0, type: 'ZERO' }; // Game hasn't started or no score yet
  }

  const numHomeGuess = Number(homeGuess);
  const numAwayGuess = Number(awayGuess);
  const numHomeActual = Number(homeActual);
  const numAwayActual = Number(awayActual);

  if (isNaN(numHomeGuess) || isNaN(numAwayGuess) || isNaN(numHomeActual) || isNaN(numAwayActual)) {
    return { points: 0, type: 'ZERO' };
  }

  const guessSign = Math.sign(numHomeGuess - numAwayGuess);
  const actualSign = Math.sign(numHomeActual - numAwayActual);

  // Correct outcome prediction (home wins, draw, or away wins)
  const correctOutcome = guessSign === actualSign;

  if (!correctOutcome) {
    return { points: 0, type: 'ZERO' };
  }

  // EXACT Match score (e.g. guessed 2-1, ended 2-1)
  if (numHomeGuess === numHomeActual && numAwayGuess === numAwayActual) {
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
  // Only include participants who have at least one valid guess registered
  const activeParticipants = participants.filter((p) =>
    guesses.some(
      (g) =>
        g.participantId === p.id &&
        g.homeScoreGuess !== null &&
        g.homeScoreGuess !== undefined &&
        g.awayScoreGuess !== null &&
        g.awayScoreGuess !== undefined
    )
  );

  return activeParticipants.map((p) => {
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
