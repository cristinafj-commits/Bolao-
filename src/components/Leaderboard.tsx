import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Target, HelpCircle, Check, Play, Crown, Sparkles, Flame, TrendingUp, X, Trophy, Gift, Briefcase, GraduationCap, RefreshCw, Eye, Calendar } from 'lucide-react';
import { Participant, ParticipantScores, Match, Guess } from '../types';
import { calculateGuessPoints } from '../utils';

interface LeaderboardProps {
  participants: Participant[];
  scores: ParticipantScores[];
  activeParticipantId: string;
  matches: Match[];
  guesses: Guess[];
}

export default function Leaderboard({ participants, scores: rawScores, activeParticipantId, matches, guesses }: LeaderboardProps) {
  // Only include participants who have complete guesses and are locked
  const scores = rawScores.filter((s) => {
    const p = participants.find((x) => x.id === s.participantId);
    return !s.isIncomplete && p?.locked;
  });

  const firstStat = scores[0];
  const secondStat = scores[1];
  const thirdStat = scores[2];

  const firstParticipant = firstStat ? participants.find((p) => p.id === firstStat.participantId) : null;
  const secondParticipant = secondStat ? participants.find((p) => p.id === secondStat.participantId) : null;
  const thirdParticipant = thirdStat ? participants.find((p) => p.id === thirdStat.participantId) : null;

  const [activeTab, setActiveTab ] = useState<'classificacao' | 'premiacao'>('classificacao');

  const [cycleIndex, setCycleIndex] = useState(0);
  const [selectedAuditParticipant, setSelectedAuditParticipant] = useState<Participant | null>(null);

  // Determine actual leaders (all participants who have complete guesses and match the top leader on all primary tie-breaker criteria)
  const leaders = scores.filter((s) => 
    firstStat && 
    s.points === firstStat.points && 
    s.exactScores === firstStat.exactScores && 
    s.correctOutcomes === firstStat.correctOutcomes
  ).map((s) => {
    const p = participants.find((x) => x.id === s.participantId);
    return { p, s };
  }).filter((item) => item.p !== undefined) as { p: Participant; s: ParticipantScores }[];

  const activeLeaderItem = leaders.length > 0 ? leaders[cycleIndex % leaders.length] : null;
  const activeLeader = activeLeaderItem ? activeLeaderItem.p : null;
  const activeLeaderStat = activeLeaderItem ? activeLeaderItem.s : null;

  const renderLeaderPhrase = (name: string, points: number, id: string) => {
    // Deterministic base hash index + manual cycleIndex to change or alternate manually
    let hash = 0;
    const combinedStr = id + name;
    for (let i = 0; i < combinedStr.length; i++) {
       hash = (hash << 5) - hash + combinedStr.charCodeAt(i);
       hash |= 0;
    }
    const index = (Math.abs(hash) + cycleIndex) % 24;

    const leaderNameSpan = (
      <span className="font-black text-amber-950 uppercase bg-amber-200/50 px-1.5 py-0.5 rounded-md inline-block">
        {name}
      </span>
    );
    const pointsSpan = (
      <strong className="text-emerald-700 font-black">{points} pontos</strong>
    );

    switch (index) {
      case 0:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Respeita a caminhada de {leaderNameSpan}! Está voando no topo com {pointsSpan}. Aceitem que dói menos! 😎🏆✨
          </p>
        );
      case 1:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Parece que temos um viajante do tempo! {leaderNameSpan} previu tudo e está isolado no topo com {pointsSpan}. Alguém pare essa máquina! 🦾⚽⚡
          </p>
        );
      case 2:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Alô, NASA? Temos um astronauta flutuando no topo da tabela! {leaderNameSpan} chegou a {pointsSpan} e não parece que vai descer tão cedo! 🛸🌟🔥
          </p>
        );
      case 3:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Segurem seus corações (e seus palpites)! {leaderNameSpan} ligou o turbo, ultrapassou todo mundo e agora dita o ritmo com {pointsSpan}! 🏎️💨🇧🇷
          </p>
        );
      case 4:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Calma lá, {leaderNameSpan}! Deixa um pouco de pontos para a gente... Liderando o bolão com {pointsSpan} de pura sabedoria futebolística! 🧠⚽✨
          </p>
        );
      case 5:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Quem é o verdadeiro guru do futebol aqui? Com {pointsSpan}, {leaderNameSpan} está dando aula de palpite e olhando todo mundo pelo retrovisor! 🎓🔮🪄
          </p>
        );
      case 6:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Dizem que o topo é solitário, mas a gente aposta que {leaderNameSpan} está adorando a vista lá de cima com {pointsSpan}! Só não vale comemorar antes da hora! 🏔️🥇🎉
          </p>
        );
      case 7:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Atenção: nível altíssimo de apelação detectado! {leaderNameSpan} assumiu o trono com {pointsSpan} e já pode pedir música no Fantástico! 🎶👑🍾
          </p>
        );
      case 8:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            A concorrência que lute! {leaderNameSpan} está ostentando {pointsSpan} no topo e exalando a pura aura de campeão! 💎  💫
          </p>
        );
      case 9:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Alguém confira o cafezinho de {leaderNameSpan}, porque o líder tá muito inspirado! Liderando com soberania absoluta com {pointsSpan}! ☕🔥🏁
          </p>
        );
      case 10:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            O terror dos secadores! Ninguém consegue derrubar {leaderNameSpan}, firme e forte com seus {pointsSpan} impecáveis! 🔒🧿🧤
          </p>
        );
      case 11:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Que categoria! {leaderNameSpan} joga de terno e gravata na liderança, somando {pointsSpan} com extrema elegância! 🤵👔⚽
          </p>
        );
      case 12:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            O pódio de ouro tem dono! {leaderNameSpan} agarrou o topo com {pointsSpan} e se bobear vai montar residência definitiva por lá! 🏰🚩✨
          </p>
        );
      case 13:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Simplesmente inacreditável! {leaderNameSpan} engoliu o manual da Copa e lidera o pelotão com {pointsSpan}. Que fase espetacular! 📚🤩🌠
          </p>
        );
      case 14:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Se palpite fosse obra de arte, {leaderNameSpan} seria o pintor do bolão! Pincelando o topo com memoráveis {pointsSpan}! 🎨🎭🪄
          </p>
        );
      case 15:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Para tudo! {leaderNameSpan} tá impossível, doutrinando a tabela com fantásticos {pointsSpan}. Quem tem limite é município! 🗺️🚀🔥
          </p>
        );
      case 16:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Liderança de respeito! {leaderNameSpan} com {pointsSpan} tá parecendo técnico de copa do mundo. Só falta dar entrevista coletiva! 🎤📋🔥
          </p>
        );
      case 17:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Previsões milagrosas de {leaderNameSpan}! Está mais confiável que a previsão do tempo, brilhando eternizado no topo com {pointsSpan}! ☀️🔮🌡️
          </p>
        );
      case 18:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Que espetáculo de liderança! Seguir {leaderNameSpan} na tabela tá parecendo corrida de Fórmula 1 na chuva. Pontuação máxima de {pointsSpan}! 🏎️🏁🎉
          </p>
        );
      case 19:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Majestoso! O império de {leaderNameSpan} está consolidado no trono de primeiro lugar com {pointsSpan}. Vida longa à liderança! 👑🏰🛡️
          </p>
        );
      case 20:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Sai da frente que o líder tá em alta velocidade! {leaderNameSpan} atingiu incríveis {pointsSpan} e rompeu todos os limites! 🛞💨🚨
          </p>
        );
      case 21:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Sensacional! {leaderNameSpan} tá acertando mais precisão que algoritmo de inteligência artificial espacial. Líder absoluto com {pointsSpan}! 🤖📊💻
          </p>
        );
      case 22:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Alerta de gênio tático! {leaderNameSpan} com {pointsSpan} tá operando verdadeiras obras-primas de placar na tabela histórica do bolão! 🕯️💫⚽
          </p>
        );
      case 23:
      default:
        return (
          <p className="text-[12px] text-slate-800 font-bold leading-normal">
            Sem palavras para a precisão milimétrica de {leaderNameSpan}! Cravou os resultados e reina como realeza com {pointsSpan}! 🩺⚔️🎖️
          </p>
        );
    }
  };

  // Count servants vs interns to calculate total prize money dynamically
  const countServidores = participants.filter((p) => p.role !== 'estagiario').length;
  const countEstagiarios = participants.filter((p) => p.role === 'estagiario').length;
  const totalPrizeMoney = (countServidores * 50) + (countEstagiarios * 20);

  // Dynamic badge based on actual registration density
  let statusBadgeValue = (
    <div className="z-10 flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-full border border-white/5 shrink-0 self-start xs:self-center">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-[9px] uppercase font-black tracking-wider text-slate-350 font-mono">Sem Participantes</span>
    </div>
  );

  if (participants.length === 1) {
    statusBadgeValue = (
      <div className="z-10 flex items-center gap-1.5 bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-500/20 shrink-0 self-start xs:self-center animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[9px] uppercase font-black tracking-wider text-amber-400 font-mono">Aguardando Rivais</span>
      </div>
    );
  } else if (participants.length >= 2) {
    statusBadgeValue = (
      <div className="z-10 flex items-center gap-1.5 bg-indigo-950/50 px-3 py-1.5 rounded-full border border-white/10 shrink-0 self-start xs:self-center">
        <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-[9px] uppercase font-black tracking-wider text-amber-300 font-mono">Disputa Quente</span>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border-2 border-emerald-500 rounded-3xl shadow-xl space-y-0 overflow-hidden ring-4 ring-yellow-450/20 transition-all duration-300 transform" 
      id="leaderboard-card"
    >
      {/* High-Impact Visual Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-blue-700 text-white p-5 flex flex-col xs:flex-row justify-between xs:items-center gap-3 border-b-2 border-yellow-400 relative" id="leaderboard-header">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-linear-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="z-10 text-left">
          <h3 className="font-extrabold text-white tracking-tight flex items-center gap-2 text-base sm:text-lg">
            <Award className="w-5.5 h-5.5 text-amber-400 animate-pulse shrink-0" />
            Classificação Geral
          </h3>
          <p className="text-[11px] text-blue-105">Classificação do bolão calculada em tempo real</p>
        </div>
        {statusBadgeValue}
      </div>

      {/* Dynamic Tab Switcher inside Leaderboard Card */}
      <div className="bg-emerald-50/20 p-1.5 flex gap-1.5 border-b border-emerald-100/60" id="leaderboard-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab('classificacao')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'classificacao'
              ? 'bg-emerald-600 text-white shadow-3xs font-black'
              : 'text-emerald-800/80 hover:text-emerald-950 hover:bg-emerald-500/10'
          }`}
          id="tab-btn-classificacao"
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span>Classificação</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('premiacao')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
            activeTab === 'premiacao'
              ? 'bg-emerald-600 text-white shadow-3xs font-black'
              : 'text-emerald-800/80 hover:text-emerald-950 hover:bg-emerald-500/10'
          }`}
          id="tab-btn-premiacao"
        >
          <Gift className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Premiação</span>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-3xs">
            Novo
          </span>
        </button>
      </div>

      {/* Spectacular Olympic-Style Podium Block */}
      {activeTab === 'classificacao' && scores.length > 0 && (
        <div className="bg-gradient-to-b from-emerald-50/50 via-yellow-50/20 to-white p-5 pb-6 border-b border-emerald-100/40 relative overflow-hidden" id="podium-showcase">
          {/* Subtle background graphics */}
          <div className="absolute top-0 right-0 -translate-y-1/2 w-48 h-48 bg-amber-200/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200/10 rounded-full blur-2xl pointer-events-none" />

          {/* Title inside layout */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            <span className="text-[9px] bg-amber-500/15 text-amber-700 border border-amber-300/30 px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Pódio de Líderes</span>
            </span>
          </div>

          <div className="grid grid-cols-3 items-end max-w-sm mx-auto gap-1">
            
            {/* 2nd Place: Silver Column */}
            <div className="flex flex-col items-center">
              {secondParticipant ? (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center text-center space-y-1"
                >
                  {/* Avatar with Silver Ring and Medal */}
                  <div className="relative">
                    {secondParticipant.imageUrl ? (
                      <img 
                        src={secondParticipant.imageUrl} 
                        alt={secondParticipant.name} 
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full ring-2 ring-slate-300 object-cover shadow-md bg-white shrink-0"
                      />
                    ) : (
                      <span className="text-xl bg-slate-50 ring-2 ring-slate-300 w-12 h-12 rounded-full flex items-center justify-center shadow-md shrink-0 font-bold">
                        {secondParticipant.avatar}
                      </span>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-slate-200 text-slate-800 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs font-mono">
                      2º
                    </span>
                  </div>
                  {/* Participant Name */}
                  <div className="text-slate-800 text-[11px] font-extrabold max-w-[80px] truncate leading-tight mt-1">
                    {secondParticipant.name}
                  </div>
                  {/* Points Box */}
                  <div className="text-[10px] font-mono font-black text-slate-500">
                    {secondStat?.points} pts
                  </div>
                </motion.div>
              ) : (
                <div className="h-16 flex items-center justify-center text-slate-300 text-xs font-semibold font-mono">—</div>
              )}
              {/* Silver Podium Pillar */}
              <div className="w-full h-14 bg-gradient-to-t from-slate-200 via-slate-100 to-slate-200 border-x border-t border-slate-350 rounded-t-xl shadow-xs mt-3 flex items-center justify-center relative">
                <span className="text-slate-400 font-extrabold text-base">🥈</span>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-300/40" />
              </div>
            </div>

            {/* 1st Place: Gold Column (Tallest, Center Highlighted) */}
            <div className="flex flex-col items-center z-10">
              {firstParticipant ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex flex-col items-center text-center space-y-1 relative"
                >
                  {/* Floating Crown Decoration */}
                  <div className="absolute -top-6 animate-bounce duration-1000">
                    <Crown className="w-5.5 h-5.5 text-amber-500 fill-amber-300 filter drop-shadow-xs" />
                  </div>
                  
                  {/* Avatar with Shiny Golden Ring and Pulse */}
                  <div className="relative mt-1">
                    {firstParticipant.imageUrl ? (
                      <img 
                        src={firstParticipant.imageUrl} 
                        alt={firstParticipant.name} 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full ring-4 ring-amber-400 object-cover shadow-lg bg-white shrink-0"
                      />
                    ) : (
                      <span className="text-2xl bg-amber-50 ring-4 ring-amber-400 w-16 h-16 rounded-full flex items-center justify-center shadow-lg shrink-0 font-bold">
                        {firstParticipant.avatar}
                      </span>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md font-mono">
                      1º
                    </span>
                  </div>
                  {/* Participant Name */}
                  <div className="text-amber-950 text-xs font-black max-w-[90px] truncate leading-tight mt-1">
                    {firstParticipant.name}
                  </div>
                  {/* Points Highlight */}
                  <div className="text-xs font-mono font-black text-amber-600">
                    {firstStat?.points} pts
                  </div>
                </motion.div>
              ) : (
                <div className="h-20 flex items-center justify-center text-slate-300 text-xs font-semibold font-mono">—</div>
              )}
              {/* Golden Podium Pillar */}
              <div className="w-full h-20 bg-gradient-to-t from-amber-200 via-amber-105 to-amber-200 border-x-2 border-t-2 border-amber-400 rounded-t-xl shadow-md mt-3 flex items-center justify-center relative">
                <span className="text-amber-600 font-extrabold text-xl">🥇</span>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-amber-300/40" />
                <div className="absolute top-0 inset-x-0 h-0.5 bg-white/60" />
              </div>
            </div>

            {/* 3rd Place: Bronze Column */}
            <div className="flex flex-col items-center">
              {thirdParticipant ? (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center text-center space-y-1"
                >
                  {/* Avatar with Bronze Ring and Medal */}
                  <div className="relative">
                    {thirdParticipant.imageUrl ? (
                      <img 
                        src={thirdParticipant.imageUrl} 
                        alt={thirdParticipant.name} 
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full ring-2 ring-amber-700 object-cover shadow-md bg-white shrink-0"
                      />
                    ) : (
                      <span className="text-xl bg-orange-50 ring-2 ring-amber-700 w-11 h-11 rounded-full flex items-center justify-center shadow-md shrink-0 font-bold">
                        {thirdParticipant.avatar}
                      </span>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs font-mono">
                      3º
                    </span>
                  </div>
                  {/* Participant Name */}
                  <div className="text-slate-800 text-[11px] font-extrabold max-w-[80px] truncate leading-tight mt-1">
                    {thirdParticipant.name}
                  </div>
                  {/* Points Box */}
                  <div className="text-[10px] font-mono font-black text-slate-500">
                    {thirdStat?.points} pts
                  </div>
                </motion.div>
              ) : (
                <div className="h-14 flex items-center justify-center text-slate-300 text-xs font-semibold font-mono">—</div>
              )}
              {/* Bronze Podium Pillar */}
              <div className="w-full h-10 bg-gradient-to-t from-orange-200 via-orange-105 to-orange-200 border-x border-t border-orange-300 rounded-t-xl shadow-xs mt-3 flex items-center justify-center relative">
                <span className="text-orange-600 font-extrabold text-base">🥉</span>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-orange-300/40" />
              </div>
            </div>

          </div>

          {/* Simple and clean direct leader tribute phrase right on the podium, now rotating and cycling between all leaders and phrases! */}
          {activeLeader && activeLeaderStat && (
            <div className="mt-4 mx-auto max-w-sm bg-gradient-to-r from-amber-500/15 via-yellow-450/10 to-amber-500/15 border-2 border-dashed border-amber-400/60 rounded-2xl px-4 py-3 text-center shadow-xs animate-in fade-in duration-300 relative">
              <div className="flex items-center justify-between mb-1.55">
                <div className="w-6 h-6" /> {/* spacer */}
                <div className="flex items-center justify-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-600 animate-bounce shrink-0" />
                  <span className="text-[10px] text-amber-850 font-black tracking-widest uppercase font-mono">
                    {leaders.length > 1 ? '🚨 LÍDERES EMPATADOS! 🚨' : '🚨 ALERTA DE LENDA! 🚨'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCycleIndex((prev) => prev + 1)}
                  className="p-1 hover:bg-amber-500/10 rounded-full transition-all duration-200 text-amber-700 hover:scale-110 active:scale-90 cursor-pointer flex items-center justify-center"
                  title="Próxima homenagem"
                >
                  <RefreshCw className="w-3.5 h-3.5 transition-transform duration-500 active:rotate-180" />
                </button>
              </div>
              
              <div className="min-h-[44px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeLeader.id}-${cycleIndex}`}
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    {renderLeaderPhrase(activeLeader.name, activeLeaderStat.points, activeLeader.id)}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 font-black font-mono flex items-center justify-center gap-1 flex-wrap">
                <span>🎯 {activeLeaderStat.exactScores} placar{activeLeaderStat.exactScores !== 1 ? 'es' : ''} na mosca!</span>
                {leaders.length > 1 && (
                  <span className="text-amber-800/80 font-black">
                    ({(cycleIndex % leaders.length) + 1} de {leaders.length} líderes)
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Main Table Content wrapped in spacious padding */}
      {activeTab === 'classificacao' && (
        <div className="p-4 sm:p-5 space-y-4">

          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-slate-50/20 shadow-xs">
            
            {/* Enhanced Grid Table Header */}
            <div className="grid grid-cols-12 gap-1.5 sm:gap-2 bg-slate-50 border-b border-blue-100 px-3 sm:px-4 py-3 text-slate-550 font-black text-[9px] sm:text-[10px] uppercase tracking-wider">
              <div className="col-span-1 text-center" title="Posição">Pos</div>
              <div className="col-span-3 sm:col-span-4 text-left pl-1 sm:pl-3">
                <span className="hidden sm:inline">Participante</span>
                <span className="sm:hidden">Partic.</span>
              </div>
              <div className="col-span-2 text-center" title="Placares Exatos acertados (5 pontos)">
                Exatos
              </div>
              <div className="col-span-2 sm:col-span-1 text-center" title="Acertos de resultado parcial">
                Parcial
              </div>
              <div className="col-span-2 text-center" title="Pontos extra acumulados de gols do vencedor ou perdedor">
                Bônus
              </div>
              <div className="col-span-2 text-right pr-1 sm:pr-2">
                Pontos
              </div>
            </div>

            {/* Dynamic Table Body with spring layout reordering */}
            <div className="divide-y divide-slate-100 bg-white">
              <AnimatePresence mode="popLayout">
                {scores.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <Trophy className="w-10 h-10 text-slate-300 mx-auto opacity-60 animate-pulse" />
                    <p className="font-extrabold text-sm text-slate-700">Nenhum participante pontuou ainda!</p>
                    <p className="text-xs text-slate-450 max-w-xs mx-auto leading-relaxed">
                      Os pontos e o ranking geral serão atualizados assim que os jogos oficiais iniciarem e os palpites completos forem validados.
                    </p>
                  </div>
                ) : (
                  scores.map((stat, index) => {
                    const participant = participants.find((p) => p.id === stat.participantId);
                    if (!participant) return null;

                    const isCurrentUser = participant.id === activeParticipantId;
                    const rank = scores.findIndex(s => 
                      s.points === stat.points &&
                      s.exactScores === stat.exactScores &&
                      s.correctOutcomes === stat.correctOutcomes
                    ) + 1;

                    // Position styling and medals for list view
                    let rankBadge = (
                      <span className="font-mono font-black text-slate-45 – text-[10px] sm:text-[11px]">{rank}º</span>
                    );
                    if (rank === 1) {
                      rankBadge = (
                        <span className="inline-flex items-center justify-center w-5 sm:w-5.5 h-5 sm:h-5.5 rounded-full bg-amber-500 text-[9px] sm:text-[10px] font-black text-slate-950 ring-2 ring-amber-400">
                          🥇
                        </span>
                      );
                    } else if (rank === 2) {
                      rankBadge = (
                        <span className="inline-flex items-center justify-center w-5 sm:w-5.5 h-5 sm:h-5.5 rounded-full bg-slate-200 text-[9px] sm:text-[10px] font-black text-slate-800 ring-2 ring-slate-355 border border-white">
                          🥈
                        </span>
                      );
                    } else if (rank === 3) {
                      rankBadge = (
                        <span className="inline-flex items-center justify-center w-5 sm:w-5.5 h-5 sm:h-5.5 rounded-full bg-amber-705 text-[9px] sm:text-[10px] font-black text-white ring-2 ring-amber-600">
                          🥉
                        </span>
                      );
                    }

                    return (
                      <motion.div
                        key={participant.id}
                        layoutId={`rank-${participant.id}`}
                        transition={{ type: 'spring', damping: 22, stiffness: 105 }}
                        className={`grid grid-cols-12 gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 items-center hover:bg-emerald-50/40 active:bg-emerald-100/30 transition-colors cursor-pointer relative group ${
                          isCurrentUser 
                            ? 'bg-linear-to-r from-emerald-500/8 to-emerald-500/1 border-l-4 border-l-emerald-500 font-medium' 
                            : ''
                        }`}
                        onClick={() => setSelectedAuditParticipant(participant)}
                        title="Clique de auditar o histórico de palpites e pontuação"
                      >
                        {/* Rank Badge */}
                        <div className="col-span-1 flex justify-center">
                          {rankBadge}
                        </div>

                      {/* Participant Details */}
                      <div className="col-span-3 sm:col-span-4 flex items-center gap-1 sm:gap-2 min-w-0 pl-1 sm:pl-3">
                        {participant.imageUrl ? (
                          <img
                            src={participant.imageUrl}
                            alt={participant.name}
                            referrerPolicy="no-referrer"
                            className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full aspect-square object-cover shrink-0 border shadow-xs ${
                              isCurrentUser ? 'ring-2 ring-emerald-450 border-white' : 'border-slate-205'
                            }`}
                          />
                        ) : (
                          <span className={`text-xs sm:text-sm w-6 sm:w-8 h-6 sm:h-8 rounded-full border flex items-center justify-center shrink-0 font-bold ${
                            isCurrentUser 
                              ? 'bg-emerald-100/50 border-emerald-300 ring-2 ring-emerald-450/20' 
                              : 'bg-slate-50 border-slate-200'
                          }`}>
                            {participant.avatar}
                          </span>
                        )}
                        
                        <div className="min-w-0 text-left">
                          <h4 className={`text-[11px] sm:text-xs text-slate-900 truncate flex items-center gap-1 flex-wrap ${isCurrentUser ? 'font-extrabold' : 'font-bold'}`}>
                            <span className="truncate max-w-[60px] xs:max-w-none group-hover:text-emerald-700 transition-colors">{participant.name}</span>
                            {isCurrentUser && (
                              <span className="text-[7px] sm:text-[8px] bg-emerald-500/15 text-emerald-800 border border-emerald-500/20 px-1 py-0.2 rounded-xs font-bold leading-none shrink-0">
                                Você
                              </span>
                            )}
                            {stat.isIncomplete && (
                              <span 
                                className="text-[7.5px] sm:text-[8px] bg-amber-100 text-amber-900 border border-amber-250 px-1 py-0.2 rounded font-black leading-none shrink-0 cursor-help"
                                title="Falta palpitar jogos!"
                              >
                                ⚠️
                              </span>
                            )}
                          </h4>
                          {stat.isIncomplete && (
                            <p className="text-[8px] sm:text-[9px] text-amber-600 font-extrabold mt-0.5 truncate uppercase">
                              🚫 Falta palpites
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Target Exact Hits Count */}
                      <div className="col-span-2 text-center text-[10px] sm:text-[11px] text-emerald-600 font-mono font-black flex items-center justify-center gap-0.5" title="Acertos exatos do placar">
                        <Target className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0 opacity-80" />
                        <span>{stat.exactScores}</span>
                      </div>

                      {/* Parcial Hits Count */}
                      <div className="col-span-2 sm:col-span-1 text-center text-[10px] sm:text-[11px] text-slate-600 font-mono font-bold" title="Acertos de ganhador/empate">
                        {stat.correctOutcomes}
                      </div>

                      {/* Bônus Points Count */}
                      <div className="col-span-2 text-center text-[10px] sm:text-[11px] text-indigo-600 font-mono font-black flex items-center justify-center gap-0.5" title="Pontos de bônus acumulados">
                        <Gift className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-500 shrink-0 opacity-80" />
                        <span>+{stat.bonusPoints}</span>
                      </div>

                      {/* Dynamic Total Points */}
                      <div className="col-span-2 text-right pr-1 sm:pr-2 flex flex-col items-end justify-center">
                        <div className={`font-mono leading-none tracking-tight flex items-center justify-end ${
                          stat.isIncomplete 
                            ? 'text-slate-400 font-bold text-xs line-through' 
                            : isCurrentUser 
                              ? 'text-sm sm:text-lg font-black text-emerald-650' 
                              : 'text-xs sm:text-sm md:text-base font-extrabold text-slate-800'
                        }`}>
                          {stat.points}
                        </div>
                        {!stat.isIncomplete && (
                          <div className="text-[7px] sm:text-[8px] uppercase font-black text-slate-400 tracking-wider mt-0.5 select-none leading-none flex items-center justify-end gap-0.5 group-hover:text-emerald-650 transition-colors">
                            <span>conferir</span>
                            <Eye className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                          </div>
                        )}
                      </div>

                    </motion.div>
                  );
                })
              )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      )}

      {/* Dedicated Prizes Tab View */}
      {activeTab === 'premiacao' && (
        <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-200 bg-white" id="prizes-tab-view">
          
          {/* Dynamic header summary explanation */}
          <div className="bg-gradient-to-br from-emerald-50/50 via-yellow-50/20 to-blue-50/10 border border-emerald-100 rounded-2xl p-4 text-center space-y-1.5 shadow-3xs text-slate-800">
            <Gift className="w-8 h-8 text-emerald-600 mx-auto animate-pulse" />
            <h4 className="font-black text-emerald-950 text-sm uppercase tracking-wide">Quadro Geral de Prêmios</h4>
            <p className="text-[11px] text-slate-600 max-w-sm mx-auto leading-relaxed">
              O prêmio principal em dinheiro é financiado de forma colaborativa: Servidores pagam R$ 50 e Estagiários pagam R$ 20. 100% dos fundos vão do Bolão direto para o 1º colocado!
            </p>
          </div>

          <div className="space-y-3">
            
            {/* 1st Prêmio: Money Pool */}
            <div className="hover:scale-[1.01] transition-transform duration-200 bg-gradient-to-tr from-amber-500/10 via-yellow-450/5 to-amber-500/10 border-2 border-yellow-400 p-4 rounded-2xl shadow-3xs relative overflow-hidden text-slate-800">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Crown className="w-20 h-20 text-yellow-600" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] bg-yellow-400 text-slate-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-5xs">
                  🥇 1º Prêmio
                </span>
                <span className="text-[10px] text-slate-400 font-bold font-mono">Campeão do Bolão</span>
              </div>
              
              <h5 className="font-extrabold text-sm text-slate-800">Bolada Total Acumulada</h5>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-700 tracking-tight leading-none">
                  R$ {totalPrizeMoney},00
                </span>
                <span className="text-[11px] text-slate-500 font-black">arrecadados s/ taxas</span>
              </div>

              {/* Dynamic counters for participants role density */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 grid grid-cols-2 gap-3 text-center">
                <div className="p-2 bg-white/80 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider">
                    <Briefcase className="w-3 h-3 text-emerald-600 shrink-0" /> Servidores
                  </div>
                  <span className="text-base font-black text-slate-800 block mt-0.5">{countServidores}x</span>
                  <span className="text-[8px] text-slate-400 block font-semibold font-mono">R$ 50 por inscrição</span>
                </div>
                <div className="p-2 bg-white/80 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Estagiários
                  </div>
                  <span className="text-base font-black text-slate-800 block mt-0.5">{countEstagiarios}x</span>
                  <span className="text-[8px] text-slate-400 block font-semibold font-mono">R$ 20 por inscrição</span>
                </div>
              </div>
            </div>

            {/* 2nd Prêmio: Album */}
            <div className="hover:scale-[1.01] transition-transform duration-200 bg-white border border-slate-150 p-4 rounded-2xl shadow-3xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-slate-800">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-205/60 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    🥈 2º Prêmio
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">Vice-Campeão</span>
                </div>
                <h5 className="font-extrabold text-sm text-slate-850">Álbum da Copa do RH 📖</h5>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-semibold">
                  Álbum oficial completo e personalizado do evento Copa RH! Perfeito para colecionar fotos dos momentos marcantes da rodada.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex sm:flex-col items-center justify-center gap-1.5 shrink-0 min-w-[75px] h-full">
                <span className="text-2xl">📖</span>
                <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider text-center">Exclusivo!</span>
              </div>
            </div>

            {/* 3rd Prêmio: Limpeza de Pele */}
            <div className="hover:scale-[1.01] transition-transform duration-200 bg-white border border-slate-150 p-4 rounded-2xl shadow-3xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-slate-800">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    🥉 3º Prêmio
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">Terceiro Lugar</span>
                </div>
                <h5 className="font-extrabold text-sm text-slate-850">Limpeza de Pele Profissional 💆‍♀️✨</h5>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-semibold">
                  Uma sessão estética especializada e relaxante para cuidar do rosto com o máximo de carinho após o torneio.
                </p>
              </div>
              <div className="bg-amber-50/15 border border-amber-100/50 p-3 rounded-xl flex sm:flex-col items-center justify-center gap-1.5 shrink-0 min-w-[75px] h-full">
                <span className="text-2xl animate-pulse">💆‍♀️</span>
                <span className="text-[8px] text-amber-600 font-black uppercase tracking-wider text-center">Skin Care</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SCORE AUDIT MOUNTED OVERLAY */}
      <AnimatePresence>
        {selectedAuditParticipant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              id="score-audit-modal-container"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 sm:p-5 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-3">
                  {selectedAuditParticipant.imageUrl ? (
                    <img
                      src={selectedAuditParticipant.imageUrl}
                      alt={selectedAuditParticipant.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border-2 border-white/40 object-cover"
                    />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-white/20 border border-white/10 flex items-center justify-center font-bold text-lg">
                      {selectedAuditParticipant.avatar}
                    </span>
                  )}
                  <div className="text-left">
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight truncate max-w-[200px] xs:max-w-none">
                      Auditoria de Pontos
                    </h3>
                    <p className="text-emerald-100 text-[11px] font-medium">{selectedAuditParticipant.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAuditParticipant(null)}
                  className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Summary Panel */}
              {(() => {
                const stat = rawScores.find(s => s.participantId === selectedAuditParticipant.id);
                if (!stat) return null;
                return (
                  <div className="bg-slate-50 border-b border-slate-200/60 p-3 sm:p-4 shrink-0 text-left">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Resumo das Conquistas</p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white p-2 rounded-xl border border-slate-250 shadow-5xs">
                        <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-tight">Total</span>
                        <span className="text-sm sm:text-base font-black text-emerald-650 block mt-0.5">{stat.points} <span className="text-[9px] uppercase text-emerald-500 font-bold">pts</span></span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-5xs">
                        <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-tight">Exatos</span>
                        <span className="text-sm sm:text-base font-black text-slate-800 block mt-0.5">{stat.exactScores} <span className="text-[8px] text-slate-400 font-semibold">x 5pts</span></span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-5xs">
                        <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-tight">Parciais</span>
                        <span className="text-sm sm:text-base font-black text-slate-800 block mt-0.5">{stat.correctOutcomes} <span className="text-[8px] text-slate-400 font-semibold font-bold">x 1pt</span></span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-5xs">
                        <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-tight">Bônus Gols</span>
                        <span className="text-sm sm:text-base font-black text-indigo-650 block mt-0.5">+{stat.bonusPoints} <span className="text-[8px] text-indigo-400 font-bold">pts</span></span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* List of graded games */}
              <div className="p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-100/60 flex-1 text-left">
                {(() => {
                  // Parse custom strings like "12 Jun, 15:00" to secure numeric timestamps for chronologic sorting
                  const parseDateForSorting = (dateStrByMatch: string) => {
                    if (!dateStrByMatch) return 0;
                    const [dayMonth, time] = dateStrByMatch.split(',');
                    const [dayStr, monthStr] = (dayMonth || '').trim().split(' ');
                    const [hourStr, minStr] = (time || '00:00').trim().split(':');

                    const day = parseInt(dayStr, 10) || 1;
                    const months: Record<string, number> = {
                      'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
                      'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11
                    };
                    const month = months[monthStr || 'Jun'] || 5;
                    const hour = parseInt(hourStr, 10) || 0;
                    const min = parseInt(minStr, 10) || 0;

                    return new Date(2026, month, day, hour, min).getTime();
                  };

                  // Sort games chronologically by date and time
                  const sortedMatches = [...matches].sort((a, b) => {
                    return parseDateForSorting(a.date) - parseDateForSorting(b.date);
                  });

                  if (sortedMatches.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-500 space-y-2">
                        <Calendar className="w-10 h-10 text-slate-350 mx-auto animate-pulse" />
                        <p className="font-extrabold text-sm">Nenhum oficial lançado ou agendado</p>
                      </div>
                    );
                  }

                  return sortedMatches.map(m => {
                    const guess = guesses.find(g => g.participantId === selectedAuditParticipant.id && g.matchId === m.id);
                    const isPlayedState = m.homeScore !== null && m.awayScore !== null;
                    
                    const calc = guess && isPlayedState
                      ? calculateGuessPoints(guess.homeScoreGuess, guess.awayScoreGuess, m.homeScore, m.awayScore)
                      : { points: 0, bonusPoints: 0, type: 'ZERO' as const };

                    // Determine detailed items feedback
                    const hits: string[] = [];
                    const hasGuess = guess !== undefined;
                    const homeGuess = hasGuess ? Number(guess.homeScoreGuess) : 0;
                    const awayGuess = hasGuess ? Number(guess.awayScoreGuess) : 0;

                    let pointsText = '0 pontos';
                    let pointsColorClass = 'text-slate-400 bg-slate-50 border-slate-205';

                    if (isPlayedState) {
                      if (calc.points === 5) {
                        pointsText = '+5 pontos [Placar Exato]';
                        pointsColorClass = 'text-emerald-800 bg-emerald-50/70 border-emerald-300 font-extrabold';
                      } else if (calc.points > 0) {
                        pointsText = `+${calc.points} ${calc.points === 1 ? 'ponto' : 'pontos'} [Parcial]`;
                        pointsColorClass = 'text-blue-800 bg-blue-50/70 border-blue-200 font-bold';
                      } else {
                        pointsText = '0 pontos';
                        pointsColorClass = 'text-rose-600 bg-rose-50/50 border-rose-150 font-bold';
                      }
                    } else {
                      pointsText = 'Aguardando jogo';
                      pointsColorClass = 'text-slate-500 bg-slate-50 border-slate-200';
                    }

                    // Reconstruct calculation for explanatory bullet list
                    if (hasGuess) {
                      if (isPlayedState) {
                        const guessSign = Math.sign(homeGuess - awayGuess);
                        const actualSign = m.homeScore !== null && m.awayScore !== null ? Math.sign(m.homeScore - m.awayScore) : 0;
                        
                        if (guessSign === actualSign) {
                          if (homeGuess === m.homeScore && awayGuess === m.awayScore) {
                            hits.push('🎯 Placar Exato (+3 pts)');
                            hits.push(`⚽ Gols do Vencedor (${m.homeScore !== null && m.awayScore !== null ? (m.homeScore >= m.awayScore ? m.homeScore : m.awayScore) : 0} gols, +1 pt)`);
                            hits.push(`⚽ Gols do Perdedor (${m.homeScore !== null && m.awayScore !== null ? (m.homeScore < m.awayScore ? m.homeScore : m.awayScore) : 0} gols, +1 pt)`);
                          } else {
                            hits.push('✓ Resultado Correto: Vitória/Empate (+1 pt)');
                            
                            let winnerGoalsCorrect = false;
                            let loserGoalsCorrect = false;
                            
                            if (m.homeScore !== null && m.awayScore !== null) {
                              if (m.homeScore > m.awayScore) {
                                winnerGoalsCorrect = homeGuess === m.homeScore;
                                loserGoalsCorrect = awayGuess === m.awayScore;
                              } else if (m.awayScore > m.homeScore) {
                                winnerGoalsCorrect = awayGuess === m.awayScore;
                                loserGoalsCorrect = homeGuess === m.homeScore;
                              } else {
                                winnerGoalsCorrect = homeGuess === m.homeScore;
                                loserGoalsCorrect = awayGuess === m.awayScore;
                              }
                            }
                            
                            if (winnerGoalsCorrect) {
                              hits.push('✓ Bônus: Gols do Vencedor (+1 pt)');
                            }
                            if (loserGoalsCorrect) {
                              hits.push('✓ Bônus: Gols do Perdedor (+1 pt)');
                            }
                            if (!winnerGoalsCorrect && !loserGoalsCorrect) {
                              hits.push('ℹ Sem bônus de gols do vencedor/perdedor (0 pts)');
                            }
                          }
                        } else {
                          hits.push('❌ Resultado incorreto (0 pts)');
                        }
                      } else {
                        hits.push('🔒 Palpite registrado e trancado. Aguardando resultado!');
                      }
                    } else {
                      hits.push('⚠️ Sem palpites registrados para este jogo (0 pts)');
                    }

                    return (
                      <div key={m.id} className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 space-y-2.5 shadow-3xs hover:border-slate-300 transition-colors">
                        {/* Group label */}
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>{m.group}</span>
                          <span className={m.status === 'LIVE' ? 'text-emerald-600 font-black flex items-center gap-1 animate-pulse' : ''}>
                            {m.status === 'LIVE' ? '● AO VIVO' : m.date}
                          </span>
                        </div>

                        {/* Match presentation */}
                        <div className="grid grid-cols-12 gap-1 items-center bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                          {/* Home */}
                          <div className="col-span-4 flex items-center gap-1.5 justify-end text-right">
                            <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate" title={m.homeTeam}>
                              {m.homeTeam}
                            </span>
                            <span className="text-base select-none shrink-0" role="img" aria-label="home flag">{m.homeFlag}</span>
                          </div>

                          {/* Scores */}
                          <div className="col-span-4 flex justify-center items-center gap-1">
                            <div className="bg-slate-200 border border-slate-300 font-mono text-center font-black text-xs px-2 py-0.5 rounded-md min-w-8 shadow-5xs">
                              {m.homeScore !== null ? m.homeScore : '-'}
                            </div>
                            <span className="text-slate-400 text-[10px] font-black">x</span>
                            <div className="bg-slate-200 border border-slate-300 font-mono text-center font-black text-xs px-2 py-0.5 rounded-md min-w-8 shadow-5xs">
                              {m.awayScore !== null ? m.awayScore : '-'}
                            </div>
                          </div>

                          {/* Away */}
                          <div className="col-span-4 flex items-center gap-1.5 justify-start text-left">
                            <span className="text-base select-none shrink-0" role="img" aria-label="away flag">{m.awayFlag}</span>
                            <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate" title={m.awayTeam}>
                              {m.awayTeam}
                            </span>
                          </div>
                        </div>

                        {/* Prediction vs Actual comparison */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-dashed border-slate-150">
                          <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                            <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[8px] font-black uppercase">Seu Palpite</span>
                            {hasGuess ? (
                              <span className="font-mono font-bold text-slate-850 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {guess.homeScoreGuess} x {guess.awayScoreGuess}
                              </span>
                            ) : (
                              <span className="italic text-slate-400 font-medium">Não palpitou</span>
                            )}
                          </div>

                          <div className={`text-[10px] border px-2 py-0.5 rounded-md shadow-5xs ${pointsColorClass}`}>
                            {pointsText}
                          </div>
                        </div>

                        {/* Explanation list */}
                        <div className="pl-1 pt-1 space-y-1">
                          {hits.map((h, hIdx) => {
                            const isBonus = h.includes('Bônus') || h.includes('✓ Bônus');
                            const isExact = h.includes('🎯');
                            const isErr = h.includes('❌') || h.includes('⚠️');
                            const isInfo = h.includes('ℹ');
                            
                            let textColor = 'text-slate-600';
                            let dotColor = 'bg-slate-400';
                            
                            if (isExact) {
                              textColor = 'text-emerald-700 font-extrabold';
                              dotColor = 'bg-emerald-500';
                            } else if (isBonus) {
                              textColor = 'text-indigo-600 font-extrabold';
                              dotColor = 'bg-indigo-500';
                            } else if (isErr) {
                              textColor = 'text-rose-500';
                              dotColor = 'bg-rose-450';
                            } else if (isInfo) {
                              textColor = 'text-slate-450 font-normal';
                              dotColor = 'bg-slate-300';
                            } else if (h.includes('✓ Resultado')) {
                              textColor = 'text-blue-700 font-bold';
                              dotColor = 'bg-blue-500';
                            }

                            return (
                              <p 
                                key={hIdx} 
                                className={`text-[9.5px] sm:text-[10px] leading-relaxed flex items-center gap-1.5 ${textColor}`}
                              >
                                <span className={`inline-block w-1.2 h-1.2 rounded-full shrink-0 ${dotColor}`} />
                                {h}
                              </p>
                            );
                          })}
                        </div>

                      </div>
                    );
                  });
                })()}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 text-right shrink-0">
                <button 
                  onClick={() => setSelectedAuditParticipant(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-3xs"
                >
                  Fechar Auditoria
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

