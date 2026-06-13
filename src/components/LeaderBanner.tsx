import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, Crown, X, Star, TrendingUp } from 'lucide-react';
import { Participant, ParticipantScores } from '../types';

interface LeaderBannerProps {
  participants: Participant[];
  scores: ParticipantScores[];
}

export default function LeaderBanner({ participants, scores }: LeaderBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!scores || scores.length === 0 || !isVisible) {
    return null;
  }

  const leaderScore = scores[0];
  const leaderParticipant = leaderScore
    ? participants.find((p) => p.id === leaderScore.participantId)
    : null;

  if (!leaderParticipant) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden bg-radial from-amber-50 via-yellow-50/50 to-emerald-50/25 border-4 border-amber-400 rounded-3xl p-5 shadow-lg shadow-amber-200/45 text-slate-800 flex flex-col md:flex-row items-center gap-5 ring-4 ring-amber-400/20"
        id="leader-celebration-banner"
      >
        {/* Background festive decorative subtle sparkles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Dismiss trigger */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-yellow-450/40 text-amber-900/60 hover:text-amber-950 transition-colors cursor-pointer"
          title="Minimizar mensagem de campeão"
          id="close-leader-banner-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1st Place Trophy badge glow effect */}
        <div className="relative shrink-0 flex items-center justify-center bg-gradient-to-tr from-amber-400 to-yellow-300 p-4 rounded-2xl shadow-md border border-amber-500/20 animate-bounce">
          <Crown className="absolute -top-3 text-amber-700 w-5 h-5 drop-shadow-md animate-pulse" />
          <Trophy className="w-8 h-8 text-amber-900 drop-shadow-sm" />
          <Star className="absolute bottom-1 right-1 w-3.5 h-3.5 text-amber-800 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        {/* Main message workspace */}
        <div className="flex-1 text-center md:text-left space-y-1.5 z-10">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-amber-500/15 text-amber-850 font-black text-[10px] tracking-widest px-2.5 py-0.5 rounded-full uppercase border border-amber-400/30">
              🏆 LÍDER DO MOMENTO
            </span>
            <span className="flex items-center gap-0.5 text-emerald-800 font-bold text-xs select-none">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              1º Lugar Geral
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-650 tracking-tight leading-relaxed">
            Ao acessar a arena do bolão, prestamos homenagem ao competidor que está comandando a liga:
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-0.5">
            {/* Participant avatar visualization */}
            {leaderParticipant.imageUrl ? (
              <img
                src={leaderParticipant.imageUrl}
                alt={leaderParticipant.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-amber-400 object-cover shadow-sm bg-slate-50"
              />
            ) : (
              <span className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center text-lg bg-yellow-100 shadow-sm">
                {leaderParticipant.avatar || '⚽'}
              </span>
            )}

            <span className="font-extrabold text-base sm:text-lg text-amber-950 font-sans tracking-tight">
              {leaderParticipant.name}
            </span>

            <span className="flex items-center gap-1 bg-yellow-400/30 text-amber-950 px-2.5 py-0.5 rounded-full text-xs font-black shadow-3xs border border-yellow-400/50">
              <TrendingUp className="w-3.5 h-3.5 text-amber-900 shrink-0" />
              {leaderScore.points} {leaderScore.points === 1 ? 'Ponto' : 'Pontos'}
            </span>

            <span className="text-[11px] text-slate-550 font-medium">
              ({leaderScore.exactScores} {leaderScore.exactScores === 1 ? 'placar exato' : 'placares exatos'})
            </span>
          </div>
        </div>

        {/* Motivational Sidebar Accent */}
        <div className="hidden lg:flex flex-col items-end shrink-0 select-none border-l-2 border-amber-400/20 pl-5 text-right font-mono">
          <span className="text-[10px] text-amber-850 font-bold tracking-widest uppercase">Próxima Rodada</span>
          <span className="text-xs text-slate-500 mt-0.5 font-sans leading-none">Mantenha seus palpites preenchidos!</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
