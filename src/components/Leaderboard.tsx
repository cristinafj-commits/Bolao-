import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Target, HelpCircle, Check, Play } from 'lucide-react';
import { Participant, ParticipantScores } from '../types';

interface LeaderboardProps {
  participants: Participant[];
  scores: ParticipantScores[];
  activeParticipantId: string;
}

export default function Leaderboard({ participants, scores, activeParticipantId }: LeaderboardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4" id="leaderboard-card">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-white tracking-tight flex items-center gap-2 text-base">
            <Award className="w-5 h-5 text-amber-500 animate-bounce" />
            Classificação do Bolão
          </h3>
          <p className="text-xs text-slate-400">Classificação atualizada automaticamente em tempo real</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-850">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 bg-slate-950 px-4 py-2.5 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
          <div className="col-span-1 text-center">Pos</div>
          <div className="col-span-6">Participante</div>
          <div className="col-span-2 text-center" title="Placares Exatos acertados (3 pontos)">Placar Exato</div>
          <div className="col-span-1 text-center" title="Empates ou Vencedores acertados (1 ponto)">Parcial</div>
          <div className="col-span-2 text-right">Pontos</div>
        </div>

        {/* Table Body with Layout Reordering animations */}
        <div className="divide-y divide-slate-850 bg-slate-900/40">
          <AnimatePresence mode="popLayout">
            {scores.map((stat, index) => {
              const participant = participants.find((p) => p.id === stat.participantId);
              if (!participant) return null;

              const isCurrentUser = participant.id === activeParticipantId;
              const rank = index + 1;

              // Render Medal/Rank decoration
              let rankBadge = (
                <span className="font-mono font-bold text-slate-400">{rank}º</span>
              );
              if (rank === 1) {
                rankBadge = (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs ring-2 ring-amber-500/20 shadow-md">
                    🥇
                  </span>
                );
              } else if (rank === 2) {
                rankBadge = (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-bold text-xs ring-2 ring-slate-300/20 shadow-md">
                    🥈
                  </span>
                );
              } else if (rank === 3) {
                rankBadge = (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-750 text-slate-100 font-bold text-xs ring-2 ring-amber-700/20 shadow-md">
                    🥉
                  </span>
                );
              }

              return (
                <motion.div
                  key={participant.id}
                  layoutId={`rank-${participant.id}`}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-800/40 transition-colors ${
                    isCurrentUser ? 'bg-emerald-950/20 border-l-2 border-l-emerald-500' : ''
                  }`}
                >
                  {/* Position */}
                  <div className="col-span-1 flex justify-center text-xs">
                    {rankBadge}
                  </div>

                  {/* Participant Meta */}
                  <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                    <span className="text-lg bg-slate-800 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center py-0 shrink-0">
                      {participant.avatar}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-white truncate flex items-center gap-1">
                        {participant.name}
                        {isCurrentUser && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded-sm">
                            Você
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 capitalize truncate">
                        {stat.pointsBreakdown.exact} exatos • {stat.pointsBreakdown.outcome} parciais
                      </p>
                    </div>
                  </div>

                  {/* Exact Scores Count */}
                  <div className="col-span-2 text-center text-xs text-emerald-400 font-mono font-semibold flex items-center justify-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {stat.exactScores}
                  </div>

                  {/* Non-exact Outcome Count */}
                  <div className="col-span-1 text-center text-xs text-slate-300 font-mono">
                    {stat.correctOutcomes}
                  </div>

                  {/* Total Points */}
                  <div className="col-span-2 text-right pr-2">
                    <div className="font-mono text-base font-bold text-white tracking-tight">
                      {stat.points}
                    </div>
                    <div className="text-[8px] uppercase font-semibold text-slate-400 tracking-wider">
                      pontos
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Point breakdown hints */}
      <div className="grid grid-cols-2 gap-4 text-[10px] text-center text-slate-400 border-t border-slate-800 pt-3">
        <div>
          <span className="text-emerald-400 font-bold block text-sm">3 pts</span>
          Placar Exato
        </div>
        <div>
          <span className="text-sky-400 font-bold block text-sm">1 pt</span>
          Vencedor ou Empate
        </div>
      </div>
    </div>
  );
}
