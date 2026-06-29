import { Match, Participant, Guess, ParticipantScores } from './types';

// Mock World Cup Matches
export const initialMatches: Match[] = [
  // --- 1ª RODADA ---
  { id: 'm0', homeTeam: 'México', awayTeam: 'África do Sul', homeFlag: '🇲🇽', awayFlag: '🇿🇦', homeScore: 1, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo A (Rodada 1)', date: '11 Jun, 16:00' },
  { id: 'm1', homeTeam: 'Coreia do Sul', awayTeam: 'Tchéquia', homeFlag: '🇰🇷', awayFlag: '🇨🇿', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo A (Rodada 1)', date: '11 Jun, 23:00' },
  { id: 'm2', homeTeam: 'Canadá', awayTeam: 'Bósnia e Herzegovina', homeFlag: '🇨🇦', awayFlag: '🇧🇦', homeScore: 1, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo B (Rodada 1)', date: '12 Jun, 16:00' },
  { id: 'm3', homeTeam: 'Estados Unidos', awayTeam: 'Paraguai', homeFlag: '🇺🇸', awayFlag: '🇵🇾', homeScore: 4, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo D (Rodada 1)', date: '12 Jun, 22:00' },
  { id: 'm4', homeTeam: 'Catar', awayTeam: 'Suíça', homeFlag: '🇶🇦', awayFlag: '🇨🇭', homeScore: 1, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo B (Rodada 1)', date: '13 Jun, 16:00' },
  { id: 'm5', homeTeam: 'Brasil', awayTeam: 'Marrocos', homeFlag: '🇧🇷', awayFlag: '🇲🇦', homeScore: 3, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo C (Rodada 1)', date: '13 Jun, 19:00' },
  { id: 'm6', homeTeam: 'Haiti', awayTeam: 'Escócia', homeFlag: '🇭🇹', awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', homeScore: 1, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo C (Rodada 1)', date: '13 Jun, 22:00' },
  { id: 'm7', homeTeam: 'Austrália', awayTeam: 'Turquia', homeFlag: '🇦🇺', awayFlag: '🇹🇷', homeScore: 1, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo D (Rodada 1)', date: '14 Jun, 01:00' },
  { id: 'm8', homeTeam: 'Alemanha', awayTeam: 'Curaçao', homeFlag: '🇩🇪', awayFlag: '🇨🇼', homeScore: 5, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo E (Rodada 1)', date: '14 Jun, 14:00' },
  { id: 'm9', homeTeam: 'Holanda', awayTeam: 'Japão', homeFlag: '🇳🇱', awayFlag: '🇯🇵', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo F (Rodada 1)', date: '14 Jun, 17:00' },
  { id: 'm10', homeTeam: 'Costa do Marfim', awayTeam: 'Equador', homeFlag: '🇨🇮', awayFlag: '🇪🇨', homeScore: 2, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo E (Rodada 1)', date: '14 Jun, 20:00' },
  { id: 'm11', homeTeam: 'Suécia', awayTeam: 'Tunísia', homeFlag: '🇸🇪', awayFlag: '🇹🇳', homeScore: 1, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo F (Rodada 1)', date: '14 Jun, 23:00' },
  { id: 'm12', homeTeam: 'Espanha', awayTeam: 'Cabo Verde', homeFlag: '🇪🇸', awayFlag: '🇨🇻', homeScore: 3, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo H (Rodada 1)', date: '15 Jun, 13:00' },
  { id: 'm13', homeTeam: 'Bélgica', awayTeam: 'Egito', homeFlag: '🇧🇪', awayFlag: '🇪🇬', homeScore: 2, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo G (Rodada 1)', date: '15 Jun, 16:00' },
  { id: 'm14', homeTeam: 'Arábia Saudita', awayTeam: 'Uruguai', homeFlag: '🇸🇦', awayFlag: '🇺🇾', homeScore: 1, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo H (Rodada 1)', date: '15 Jun, 19:00' },
  { id: 'm15', homeTeam: 'Irã', awayTeam: 'Nova Zelândia', homeFlag: '🇮🇷', awayFlag: '🇳🇿', homeScore: 1, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo G (Rodada 1)', date: '15 Jun, 22:00' },
  { id: 'm16', homeTeam: 'França', awayTeam: 'Senegal', homeFlag: '🇫🇷', awayFlag: '🇸🇳', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo I (Rodada 1)', date: '16 Jun, 16:00' },
  { id: 'm17', homeTeam: 'Iraque', awayTeam: 'Noruega', homeFlag: '🇮🇶', awayFlag: '🇳🇴', homeScore: 1, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo I (Rodada 1)', date: '16 Jun, 19:00' },
  { id: 'm18', homeTeam: 'Argentina', awayTeam: 'Argélia', homeFlag: '🇦🇷', awayFlag: '🇩🇿', homeScore: 3, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo J (Rodada 1)', date: '16 Jun, 22:00' },
  { id: 'm19', homeTeam: 'Áustria', awayTeam: 'Jordânia', homeFlag: '🇦🇹', awayFlag: '🇯🇴', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo J (Rodada 1)', date: '17 Jun, 01:00' },
  { id: 'm20', homeTeam: 'Portugal', awayTeam: 'RD do Congo', homeFlag: '🇵🇹', awayFlag: '🇨🇩', homeScore: 2, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo K (Rodada 1)', date: '17 Jun, 14:00' },
  { id: 'm21', homeTeam: 'Inglaterra', awayTeam: 'Croácia', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇭🇷', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo L (Rodada 1)', date: '17 Jun, 17:00' },
  { id: 'm22', homeTeam: 'Gana', awayTeam: 'Panamá', homeFlag: '🇬🇭', awayFlag: '🇵🇦', homeScore: 1, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo L (Rodada 1)', date: '17 Jun, 20:00' },
  { id: 'm23', homeTeam: 'Uzbequistão', awayTeam: 'Colômbia', homeFlag: '🇺🇿', awayFlag: '🇨🇴', homeScore: 0, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo K (Rodada 1)', date: '17 Jun, 23:00' },

  // --- 2ª RODADA ---
  { id: 'm24', homeTeam: 'Tchéquia', awayTeam: 'África do Sul', homeFlag: '🇨🇿', awayFlag: '🇿🇦', homeScore: 1, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo A (Rodada 2)', date: '18 Jun, 13:00' },
  { id: 'm25', homeTeam: 'Suíça', awayTeam: 'Bósnia e Herzegovina', homeFlag: '🇨🇭', awayFlag: '🇧🇦', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo B (Rodada 2)', date: '18 Jun, 16:00' },
  { id: 'm26', homeTeam: 'Canadá', awayTeam: 'Catar', homeFlag: '🇨🇦', awayFlag: '🇶🇦', homeScore: 3, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo B (Rodada 2)', date: '18 Jun, 19:00' },
  { id: 'm27', homeTeam: 'México', awayTeam: 'Coreia do Sul', homeFlag: '🇲🇽', awayFlag: '🇰🇷', homeScore: 0, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo A (Rodada 2)', date: '18 Jun, 22:00' },
  { id: 'm28', homeTeam: 'Estados Unidos', awayTeam: 'Austrália', homeFlag: '🇺🇸', awayFlag: '🇦🇺', homeScore: 2, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo D (Rodada 2)', date: '19 Jun, 16:00' },
  { id: 'm29', homeTeam: 'Escócia', awayTeam: 'Marrocos', homeFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', awayFlag: '🇲🇦', homeScore: 1, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo C (Rodada 2)', date: '19 Jun, 19:00' },
  { id: 'm30', homeTeam: 'Brasil', awayTeam: 'Haiti', homeFlag: '🇧🇷', awayFlag: '🇭🇹', homeScore: 4, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo C (Rodada 2)', date: '19 Jun, 21:30' },
  { id: 'm31', homeTeam: 'Turquia', awayTeam: 'Paraguai', homeFlag: '🇹🇷', awayFlag: '🇵🇾', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo D (Rodada 2)', date: '20 Jun, 00:00' },
  { id: 'm32', homeTeam: 'Holanda', awayTeam: 'Suécia', homeFlag: '🇳🇱', awayFlag: '🇸🇪', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo F (Rodada 2)', date: '20 Jun, 14:00' },
  { id: 'm33', homeTeam: 'Alemanha', awayTeam: 'Costa do Marfim', homeFlag: '🇩🇪', awayFlag: '🇨🇮', homeScore: 3, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo E (Rodada 2)', date: '20 Jun, 17:00' },
  { id: 'm34', homeTeam: 'Equador', awayTeam: 'Curaçao', homeFlag: '🇪🇨', awayFlag: '🇨🇼', homeScore: 2, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo E (Rodada 2)', date: '20 Jun, 21:00' },
  { id: 'm35', homeTeam: 'Tunísia', awayTeam: 'Japão', homeFlag: '🇹🇳', awayFlag: '🇯🇵', homeScore: 1, awayScore: 2, status: 'FINISHED', minute: 90, group: 'Grupo F (Rodada 2)', date: '21 Jun, 01:00' },
  { id: 'm36', homeTeam: 'Espanha', awayTeam: 'Arábia Saudita', homeFlag: '🇪🇸', awayFlag: '🇸🇦', homeScore: 4, awayScore: 0, status: 'FINISHED', minute: 90, group: 'Grupo H (Rodada 2)', date: '21 Jun, 13:00' },
  { id: 'm37', homeTeam: 'Bélgica', awayTeam: 'Irã', homeFlag: '🇧🇪', awayFlag: '🇮🇷', homeScore: 3, awayScore: 1, status: 'FINISHED', minute: 90, group: 'Grupo G (Rodada 2)', date: '21 Jun, 16:00' },
  { id: 'm38', homeTeam: 'Uruguai', awayTeam: 'Cabo Verde', homeFlag: '🇺🇾', awayFlag: '🇨🇻', homeScore: 2, awayScore: 1, status: 'LIVE', minute: 78, group: 'Grupo H (Rodada 2)', date: '21 Jun, 19:00' },
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

// Default World Cup Knockout Stages matches for the Second Phase (Round of 32/16 avos to the Final)
export const initialMatchesFase2: Match[] = [
  // --- 16 AVOS DE FINAL ---
  { id: 'k0', homeTeam: 'África do Sul', awayTeam: 'Canadá', homeFlag: '🇿🇦', awayFlag: '🇨🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '28 Jun, 16:00' },
  { id: 'k1', homeTeam: 'Brasil', awayTeam: 'Japão', homeFlag: '🇧🇷', awayFlag: '🇯🇵', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '29 Jun, 14:00' },
  { id: 'k2', homeTeam: 'Alemanha', awayTeam: 'Paraguai', homeFlag: '🇩🇪', awayFlag: '🇵🇾', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '29 Jun, 17:30' },
  { id: 'k3', homeTeam: 'Holanda', awayTeam: 'Marrocos', homeFlag: '🇳🇱', awayFlag: '🇲🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '29 Jun, 22:00' },
  { id: 'k4', homeTeam: 'Costa do Marfim', awayTeam: 'Noruega', homeFlag: '🇨🇮', awayFlag: '🇳🇴', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '30 Jun, 14:00' },
  { id: 'k5', homeTeam: 'França', awayTeam: 'Suécia', homeFlag: '🇫🇷', awayFlag: '🇸🇪', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '30 Jun, 18:00' },
  { id: 'k6', homeTeam: 'México', awayTeam: 'Equador', homeFlag: '🇲🇽', awayFlag: '🇪🇨', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '30 Jun, 22:00' },
  { id: 'k7', homeTeam: 'Inglaterra', awayTeam: 'RD Congo', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇨🇩', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '01 Jul, 13:00' },
  { id: 'k8', homeTeam: 'Bélgica', awayTeam: 'Senegal', homeFlag: '🇧🇪', awayFlag: '🇸🇳', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '01 Jul, 16:00' },
  { id: 'k9', homeTeam: 'Estados Unidos', awayTeam: 'Bósnia e Herzegovina', homeFlag: '🇺🇸', awayFlag: '🇧🇦', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '01 Jul, 21:00' },
  { id: 'k10', homeTeam: 'Espanha', awayTeam: 'Áustria', homeFlag: '🇪🇸', awayFlag: '🇦🇹', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '02 Jul, 16:00' },
  { id: 'k11', homeTeam: 'Portugal', awayTeam: 'Croácia', homeFlag: '🇵🇹', awayFlag: '🇭🇷', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '02 Jul, 20:00' },
  { id: 'k12', homeTeam: 'Suíça', awayTeam: 'Argélia', homeFlag: '🇨🇭', awayFlag: '🇩🇿', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '03 Jul, 00:00' },
  { id: 'k13', homeTeam: 'Austrália', awayTeam: 'Egito', homeFlag: '🇦🇺', awayFlag: '🇪🇬', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '03 Jul, 15:00' },
  { id: 'k14', homeTeam: 'Argentina', awayTeam: 'Cabo Verde', homeFlag: '🇦🇷', awayFlag: '🇨🇻', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '03 Jul, 19:00' },
  { id: 'k15', homeTeam: 'Colômbia', awayTeam: 'Gana', homeFlag: '🇨🇴', awayFlag: '🇬🇭', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: '16 avos de final', date: '03 Jul, 22:30' },

  // --- OITAVAS DE FINAL ---
  { id: 'k16', homeTeam: 'Vencedor Alemanha x Paraguai', awayTeam: 'Vencedor França x Suécia', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Oitavas de final', date: '03 Jul, 13:00' },
  { id: 'k17', homeTeam: 'Vencedor África do Sul x Canadá', awayTeam: 'Vencedor Holanda x Marrocos', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Oitavas de final', date: '03 Jul, 18:00' },
  { id: 'k18', homeTeam: 'Vencedor Brasil x Japão', awayTeam: 'Vencedor Costa do Marfim x Noruega', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Oitavas de final', date: '04 Jul, 13:00' },
  { id: 'k19', homeTeam: 'Vencedor México x Equador', awayTeam: 'Vencedor Inglaterra x RD Congo', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Oitavas de final', date: '04 Jul, 18:00' },
  { id: 'k20', homeTeam: 'Vencedor Espanha x Áustria', awayTeam: 'Vencedor Portugal x Croácia', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Oitavas de final', date: '05 Jul, 13:00' },
  { id: 'k21', homeTeam: 'Vencedor Estados Unidos x Bósnia', awayTeam: 'Vencedor Bélgica x Senegal', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Oitavas de final', date: '05 Jul, 18:00' },
  { id: 'k22', homeTeam: 'Vencedor Argentina x Cabo Verde', awayTeam: 'Vencedor Austrália x Egito', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Oitavas de final', date: '05 Jul, 21:00' },
  { id: 'k23', homeTeam: 'Vencedor Suíça x Argélia', awayTeam: 'Vencedor Colômbia x Gana', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Oitavas de final', date: '05 Jul, 23:00' },

  // --- QUARTAS DE FINAL ---
  { id: 'k24', homeTeam: 'Vencedor Oitavas 1', awayTeam: 'Vencedor Oitavas 2', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Quartas de final', date: '06 Jul, 16:00' },
  { id: 'k25', homeTeam: 'Vencedor Oitavas 3', awayTeam: 'Vencedor Oitavas 4', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Quartas de final', date: '07 Jul, 16:05' },
  { id: 'k26', homeTeam: 'Vencedor Oitavas 5', awayTeam: 'Vencedor Oitavas 6', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Quartas de final', date: '08 Jul, 16:00' },
  { id: 'k27', homeTeam: 'Vencedor Oitavas 7', awayTeam: 'Vencedor Oitavas 8', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Quartas de final', date: '08 Jul, 20:00' },

  // --- SEMIFINAIS ---
  { id: 'k28', homeTeam: 'Vencedor Quartas 1', awayTeam: 'Vencedor Quartas 2', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Semifinais', date: '09 Jul, 16:00' },
  { id: 'k29', homeTeam: 'Vencedor Quartas 3', awayTeam: 'Vencedor Quartas 4', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Semifinais', date: '10 Jul, 16:00' },

  // --- DISPUTA DE 3º LUGAR ---
  { id: 'k30', homeTeam: 'Perdedor Semifinal 1', awayTeam: 'Perdedor Semifinal 2', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Disputa de 3º lugar', date: '18 Jul, 16:00' },

  // --- FINAL ---
  { id: 'k31', homeTeam: 'Vencedor Semifinal 1', awayTeam: 'Vencedor Semifinal 2', homeFlag: '🏳️', awayFlag: '🏳️', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, group: 'Final', date: '19 Jul, 16:00' }
];

// Initial pre-registered participants
export const initialParticipants: Participant[] = [];

/**
 * Checks if a match is expired for guessing (i.e. less than 12 hours before start, or already started/finished).
 */
export function isMatchExpiredForGuesses(matchDateStr: string, matchId?: string): boolean {
  if (!matchDateStr) return false;
  
  // Exceção solicitada pelo usuário: liberar apenas o primeiro jogo de hoje (África do Sul x Canadá - k0)
  if (matchId === 'k0' || matchDateStr === '28 Jun, 16:00') {
    return false;
  }
  
  try {
    // Expected format: "DD Month, HH:MM"
    const regex = /(\d+)\s+([A-Za-zçãõáéíóú]+),\s+(\d+):(\d+)/i;
    const match = matchDateStr.match(regex);
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const monthStr = match[2].toLowerCase();
    const hours = parseInt(match[3], 10);
    const minutes = parseInt(match[4], 10);
    
    // Map Portuguese/English month name to 0-indexed month
    const monthsMap: Record<string, number> = {
      'jan': 0, 'janeiro': 0,
      'feb': 1, 'fev': 1, 'fevereiro': 1,
      'mar': 2, 'março': 2,
      'apr': 3, 'abr': 3, 'abril': 3,
      'may': 4, 'mai': 4, 'maio': 4,
      'jun': 5, 'junho': 5,
      'jul': 6, 'julho': 6,
      'aug': 7, 'ago': 7, 'agosto': 7,
      'sep': 8, 'set': 8, 'setembro': 8,
      'oct': 9, 'out': 9, 'outubro': 9,
      'nov': 10, 'novembro': 10,
      'dec': 11, 'dez': 11, 'dezembro': 11
    };
    
    const month = monthsMap[monthStr] !== undefined ? monthsMap[monthStr] : 5; // Default June (5)
    
    // Use the current year from local time (e.g., 2026)
    const year = 2026;
    
    // Create Date object in local timezone
    const matchDate = new Date(year, month, day, hours, minutes);
    
    const now = new Date();
    const diffMs = matchDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // If diffHours is less than 12, it means we are less than 12 hours away from the match,
    // or the match is already on a past date.
    return diffHours < 12;
  } catch (e) {
    console.error("Error parsing match date:", e);
    return false;
  }
}

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
  awayActual: number | string | null,
  penaltyWinnerGuess?: 'home' | 'away' | null,
  penaltyWinnerActual?: 'home' | 'away' | null
): { points: number; bonusPoints: number; type: 'EXACT' | 'DIFFERENCE' | 'ONE_TEAM' | 'OUTCOME' | 'ZERO'; penaltyBonus?: boolean } {
  if (homeGuess === undefined || homeGuess === null || homeGuess === '' || awayGuess === undefined || awayGuess === null || awayGuess === '') {
    return { points: 0, bonusPoints: 0, type: 'ZERO' };
  }
  if (homeActual === null || awayActual === null || homeActual === '' || awayActual === '') {
    return { points: 0, bonusPoints: 0, type: 'ZERO' }; // Game hasn't started or no score yet
  }

  const numHomeGuess = Number(homeGuess);
  const numAwayGuess = Number(awayGuess);
  const numHomeActual = Number(homeActual);
  const numAwayActual = Number(awayActual);

  if (isNaN(numHomeGuess) || isNaN(numAwayGuess) || isNaN(numHomeActual) || isNaN(numAwayActual)) {
    return { points: 0, bonusPoints: 0, type: 'ZERO' };
  }

  const guessSign = Math.sign(numHomeGuess - numAwayGuess);
  const actualSign = Math.sign(numHomeActual - numAwayActual);

  // Correct outcome prediction (home wins, draw, or away wins)
  const correctOutcome = guessSign === actualSign;

  if (!correctOutcome) {
    return { points: 0, bonusPoints: 0, type: 'ZERO' };
  }

  // Check if penalty bonus applies: actual draw, guessed draw, penaltyWinnerGuess is correct
  const hasPenaltyBonus = numHomeActual === numAwayActual &&
                          numHomeGuess === numAwayGuess &&
                          !!penaltyWinnerActual &&
                          !!penaltyWinnerGuess &&
                          penaltyWinnerGuess === penaltyWinnerActual;

  const penaltyAddonPoints = hasPenaltyBonus ? 2 : 0;

  // EXACT Match score (e.g. guessed 2-1, ended 2-1)
  if (numHomeGuess === numHomeActual && numAwayGuess === numAwayActual) {
    // Placar exato = 3 pontos
    // Acertar gols do vencedor = 1 ponto (gols do vencedor sempre certos no placar exato)
    // Acertar gols do perdedor = 1 ponto (gols do perdedor sempre certos no placar exato)
    // Não acumula o ponto de resultado (resultado = 0 se exato), conforme solicitado.
    // Total = 3 + 1 + 1 = 5 pontos.
    return { 
      points: 5 + penaltyAddonPoints, 
      bonusPoints: 2 + penaltyAddonPoints, 
      type: 'EXACT',
      penaltyBonus: hasPenaltyBonus
    };
  }

  // Determine correct winner/loser goals for non-exact guess but correct outcome
  let winnerGoalsCorrect = false;
  let loserGoalsCorrect = false;

  if (numHomeActual > numAwayActual) {
    // Home is winner, Away is loser
    winnerGoalsCorrect = numHomeGuess === numHomeActual;
    loserGoalsCorrect = numAwayGuess === numAwayActual;
  } else if (numAwayActual > numHomeActual) {
    // Away is winner, Home is loser
    winnerGoalsCorrect = numAwayGuess === numAwayActual;
    loserGoalsCorrect = numHomeGuess === numHomeActual;
  } else {
    // Draw (Empate): both scored the same
    winnerGoalsCorrect = numHomeGuess === numHomeActual;
    loserGoalsCorrect = numAwayGuess === numAwayActual;
  }

  // Base: outcome correct = 1 point
  let pts = 1;
  let bonusPts = 0;
  if (winnerGoalsCorrect) {
    pts += 1;
    bonusPts += 1;
  }
  if (loserGoalsCorrect) {
    pts += 1;
    bonusPts += 1;
  }

  // Map our return to a compatible type so the leaderboard counts it correctly
  const type = pts === 2 ? 'ONE_TEAM' : 'OUTCOME';

  return { 
    points: pts + penaltyAddonPoints, 
    bonusPoints: bonusPts + penaltyAddonPoints, 
    type,
    penaltyBonus: hasPenaltyBonus
  };
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
    let bonusPoints = 0;
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
            m.awayScore,
            userGuess.penaltyWinnerGuess,
            m.penaltyWinner
          );

          points += res.points;
          bonusPoints += res.bonusPoints;
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

    // Check if the participant completed all matches of the tourney
    const participantGuesses = guesses.filter(
      (g) =>
        g.participantId === p.id &&
        g.homeScoreGuess !== null &&
        g.homeScoreGuess !== undefined &&
        String(g.homeScoreGuess).trim() !== '' &&
        g.awayScoreGuess !== null &&
        g.awayScoreGuess !== undefined &&
        String(g.awayScoreGuess).trim() !== ''
    );
    const hasFinishedAll = participantGuesses.length === matches.length;

    return {
      participantId: p.id,
      points,
      bonusPoints,
      exactScores,
      correctOutcomes,
      pointsBreakdown,
      isIncomplete: !hasFinishedAll,
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

/**
 * Computes scores and leaderboard statistics for Phase 2 participants.
 * Since future stages depend on previous outcomes, users are NOT penalized
 * with a 0-point score for not filling subsequent stages. Points are calculated
 * for any completed games that have predictions.
 */
export function calculateLeaderboardFase2(
  participants: Participant[],
  matches: Match[],
  guesses: Guess[]
): ParticipantScores[] {
  return participants.map((p) => {
    let points = 0;
    let bonusPoints = 0;
    let exactScores = 0;
    let correctOutcomes = 0;

    const pointsBreakdown = {
      exact: 0,
      difference: 0,
      oneTeam: 0,
      outcome: 0,
      zero: 0,
    };

    // Calculate points only for matches in Phase 2 that actually have results
    matches.forEach((m) => {
      if (m.homeScore !== null && m.awayScore !== null) {
        const userGuess = guesses.find((g) => g.participantId === p.id && g.matchId === m.id);
        if (userGuess) {
          const res = calculateGuessPoints(
            userGuess.homeScoreGuess,
            userGuess.awayScoreGuess,
            m.homeScore,
            m.awayScore,
            userGuess.penaltyWinnerGuess,
            m.penaltyWinner
          );

          points += res.points;
          bonusPoints += res.bonusPoints;
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
      bonusPoints,
      exactScores,
      correctOutcomes,
      pointsBreakdown,
      isIncomplete: false, // No penalty for unfinished matches in Phase 2
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

