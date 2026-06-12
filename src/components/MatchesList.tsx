import React, { useState } from 'react';
import { Match, Guess, Participant } from '../types';
import { calculateGuessPoints } from '../utils';
import { Users, Save, CheckCircle, ChevronDown, ChevronUp, Lock, Edit2, Play, Sparkles, AlertCircle } from 'lucide-react';

interface MatchesListProps {
  matches: Match[];
  guesses: Guess[];
  participants: Participant[];
  activeParticipantId: string;
  onSaveGuess: (matchId: string, homeScore: number, awayScore: number) => void;
  isAdminMode: boolean;
  onUpdateActualScore: (matchId: string, homeScore: number | null, awayScore: number | null, status: 'SCHEDULED' | 'LIVE' | 'FINISHED') => void;
}

export default function MatchesList({
  matches,
  guesses,
  participants,
  activeParticipantId,
  onSaveGuess,
  isAdminMode,
  onUpdateActualScore,
}: MatchesListProps) {
  const [expandedGuesses, setExpandedGuesses] = useState<Record<string, boolean>>({});
  const [editGuesses, setEditGuesses] = useState<Record<string, { home: number; away: number }>>({});
  const [adminScores, setAdminScores] = useState<Record<string, { home: number; away: number; status: 'SCHEDULED' | 'LIVE' | 'FINISHED' }>>({});

  const activeParticipant = participants.find((p) => p.id === activeParticipantId);

  const toggleGuesses = (matchId: string) => {
    setExpandedGuesses((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const handleGuessChange = (matchId: string, team: 'home' | 'away', value: number) => {
    const current = editGuesses[matchId] || { home: 0, away: 0 };
    const cleanVal = Math.max(0, Math.min(20, value));
    setEditGuesses((prev) => ({
      ...prev,
      [matchId]: {
        ...current,
        [team]: cleanVal,
      },
    }));
  };

  const handleAdminScoreChange = (matchId: string, team: 'home' | 'away', value: number) => {
    const current = adminScores[matchId] || { home: 0, away: 0, status: 'SCHEDULED' };
    const cleanVal = Math.max(0, Math.min(20, value));
    setAdminScores((prev) => ({
      ...prev,
      [matchId]: {
        ...current,
        [team]: cleanVal,
      },
    }));
  };

  return (
    <div className="space-y-4" id="matches-list-root">
      {matches.map((m) => {
        // Find current participant's guess
        const myGuess = guesses.find((g) => g.participantId === activeParticipantId && g.matchId === m.id);
        const hasGuessed = !!myGuess;

        // Active editing inputs local state inside editGuesses or fallbacks
        const guessHome = editGuesses[m.id]?.home ?? myGuess?.homeScoreGuess ?? 0;
        const guessAway = editGuesses[m.id]?.away ?? myGuess?.awayScoreGuess ?? 0;

        // Admin scores inputs
        const currentAdminHomeScore = adminScores[m.id]?.home ?? m.homeScore ?? 0;
        const currentAdminAwayScore = adminScores[m.id]?.away ?? m.awayScore ?? 0;

        const isLive = m.status === 'LIVE';
        const isFinished = m.status === 'FINISHED';
        const isScheduled = m.status === 'SCHEDULED';

        // Check if user is trying to guess after match has started
        const isMatchLocked = isLive || isFinished;

        // Calculate points for active participant if match score exists
        const scoreResult = calculateGuessPoints(
          myGuess?.homeScoreGuess,
          myGuess?.awayScoreGuess,
          m.homeScore,
          m.awayScore
        );

        return (
          <div
            key={m.id}
            className={`bg-slate-900 border overflow-hidden rounded-2xl shadow-md transition-all ${
              isLive
                ? 'border-red-500/30 bg-radial from-red-950/10 to-slate-900 shadow-rose-950/5'
                : hasGuessed
                ? 'border-slate-800'
                : 'border-slate-800/60'
            }`}
            id={`match-card-${m.id}`}
          >
            {/* Header info */}
            <div className="bg-slate-950/70 px-4 py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">{m.group}</span>
              <div className="flex items-center gap-1.5">
                {isLive && (
                  <span className="bg-rose-500/10 text-rose-400 font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 animate-pulse" id={`live-badge-${m.id}`}>
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    AO VIVO • {m.minute}'
                  </span>
                )}
                {isFinished && (
                  <span className="bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-sm" id={`finished-badge-${m.id}`}>
                    FINALIZADO
                  </span>
                )}
                {isScheduled && (
                  <span className="text-slate-400 font-mono tracking-tight" id={`date-${m.id}`}>
                    {m.date}
                  </span>
                )}
              </div>
            </div>

            {/* Teams and Scores Display */}
            <div className="p-5 flex flex-col md:flex-row gap-5 items-center justify-between">
              {/* Home vs Away Display */}
              <div className="flex items-center justify-center gap-4 w-full md:w-auto shrink-0 py-1">
                {/* Home */}
                <div className="flex items-center gap-2.5 w-24 sm:w-28 md:w-32 justify-end">
                  <span className="font-semibold text-sm sm:text-base text-white text-right truncate">
                    {m.homeTeam}
                  </span>
                  <span className="text-2xl sm:text-3xl filter drop-shadow-sm select-none" role="img" aria-label={m.homeTeam}>
                    {m.homeFlag}
                  </span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-4 py-2 rounded-xl border border-slate-850">
                  {isScheduled ? (
                    <span className="text-slate-400 text-sm font-semibold tracking-wider font-mono">VS</span>
                  ) : (
                    <>
                      <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                        {m.homeScore}
                      </span>
                      <span className="text-slate-600 font-mono">:</span>
                      <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                        {m.awayScore}
                      </span>
                    </>
                  )}
                </div>

                {/* Away */}
                <div className="flex items-center gap-2.5 w-24 sm:w-28 md:w-32 justify-start">
                  <span className="text-2xl sm:text-3xl filter drop-shadow-sm select-none" role="img" aria-label={m.awayTeam}>
                    {m.awayFlag}
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-white text-left truncate">
                    {m.awayTeam}
                  </span>
                </div>
              </div>

              {/* PARTICIPANT'S GUESS INPUT ROW */}
              {!isAdminMode ? (
                <div className="w-full md:w-auto p-3.5 bg-slate-950/40 rounded-xl border border-slate-850/60 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Palpite de {activeParticipant?.name || 'Perfil'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {isMatchLocked ? (
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>Palpites Encerrados</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs text-balance">Regule e salve:</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isMatchLocked ? (
                      // Locked Display
                      <div className="flex items-center gap-1">
                        {hasGuessed ? (
                          <div className="flex items-center gap-2">
                            <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold font-mono text-slate-100">
                              {myGuess.homeScoreGuess} x {myGuess.awayScoreGuess}
                            </div>
                            {/* Points scored */}
                            {m.homeScore !== null && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  scoreResult.points === 3
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : scoreResult.points > 0
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/20'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                +{scoreResult.points} pts
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-rose-450 text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Sem Palpite
                          </span>
                        )}
                      </div>
                    ) : (
                      // Interactive Inputs
                      <div className="flex items-center gap-2">
                        {/* Minus Home */}
                        <button
                          onClick={() => handleGuessChange(m.id, 'home', guessHome - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                        >
                          -
                        </button>
                        {/* Numeric representation */}
                        <div className="w-10 text-center font-mono font-bold text-sm bg-slate-950 border border-slate-800 rounded-lg py-1 text-white">
                          {guessHome}
                        </div>
                        {/* Plus Home */}
                        <button
                          onClick={() => handleGuessChange(m.id, 'home', guessHome + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                        >
                          +
                        </button>

                        <span className="text-slate-600 px-1">x</span>

                        {/* Minus Away */}
                        <button
                          onClick={() => handleGuessChange(m.id, 'away', guessAway - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                        >
                          -
                        </button>
                        {/* Numeric representation */}
                        <div className="w-10 text-center font-mono font-bold text-sm bg-slate-950 border border-slate-800 rounded-lg py-1 text-white">
                          {guessAway}
                        </div>
                        {/* Plus Away */}
                        <button
                          onClick={() => handleGuessChange(m.id, 'away', guessAway + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                        >
                          +
                        </button>

                        {/* Save Guess */}
                        <button
                          onClick={() => onSaveGuess(m.id, guessHome, guessAway)}
                          className={`ml-1.5 p-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                            hasGuessed && myGuess.homeScoreGuess === guessHome && myGuess.awayScoreGuess === guessAway
                              ? 'bg-slate-850 hover:bg-slate-800 text-slate-400 border border-slate-800'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                          title="Salvar Palpite"
                        >
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline text-xs">Salvar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ADMINISTRATIVE INTERACTIVE SCORING CARD */
                <div className="w-full md:w-auto p-3.5 bg-amber-950/10 border border-amber-900/30 rounded-xl flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                      🔧 CONTROLE DE RESULTADOS (ADMIN)
                    </span>
                    <span className="text-xs text-slate-300">Defina o placar real e status no painel:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdminScoreChange(m.id, 'home', currentAdminHomeScore - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 font-bold border border-amber-900/20 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-sm text-amber-200">
                        {currentAdminHomeScore}
                      </span>
                      <button
                        onClick={() => handleAdminScoreChange(m.id, 'home', currentAdminHomeScore + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 font-bold border border-amber-900/20 cursor-pointer"
                      >
                        +
                      </button>

                      <span className="text-slate-600 px-0.5">x</span>

                      <button
                        onClick={() => handleAdminScoreChange(m.id, 'away', currentAdminAwayScore - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 font-bold border border-amber-900/20 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-sm text-amber-200">
                        {currentAdminAwayScore}
                      </span>
                      <button
                        onClick={() => handleAdminScoreChange(m.id, 'away', currentAdminAwayScore + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 font-bold border border-amber-900/20 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateActualScore(m.id, currentAdminHomeScore, currentAdminAwayScore, 'FINISHED')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                        title="Finalizar jogo com este placar"
                      >
                        <CheckCircle className="w-3 h-3" /> Encerrar
                      </button>

                      <button
                        onClick={() => onUpdateActualScore(m.id, currentAdminHomeScore, currentAdminAwayScore, 'LIVE')}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all animate-pulse"
                        title="Iniciar partida no modo Ao Vivo"
                      >
                        <Play className="w-3 h-3" /> Ao Vivo
                      </button>

                      <button
                        onClick={() => onUpdateActualScore(m.id, null, null, 'SCHEDULED')}
                        className="px-2 py-1.5 rounded-lg bg-slate-805 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer border border-slate-700"
                        title="Resetar placar real de jogo"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Accordion - Guesses from other members */}
            <div className="bg-slate-950/30 px-5 py-2.5 border-t border-slate-850/40 flex justify-between items-center text-xs">
              <button
                onClick={() => toggleGuesses(m.id)}
                className="text-slate-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
                id={`toggle-other-guesses-${m.id}`}
              >
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{expandedGuesses[m.id] ? 'Ocultar palpites da galera' : 'Ver palpites dos participantes'}</span>
                {expandedGuesses[m.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Your status tag */}
              {hasGuessed ? (
                <span className="text-emerald-400 font-semibold inline-flex items-center gap-1" id={`user-guessed-tag-${m.id}`}>
                  <CheckCircle className="w-3 h-3" /> Seu palpite salvo ({myGuess.homeScoreGuess}x{myGuess.awayScoreGuess})
                </span>
              ) : (
                <span className="text-amber-500 font-medium" id={`user-not-guessed-tag-${m.id}`}>
                  Você não palpitou ainda
                </span>
              )}
            </div>

            {/* Expanded section - participants guesses */}
            {expandedGuesses[m.id] && (
              <div className="bg-slate-950 px-5 py-4 border-t border-slate-850 space-y-2 text-xs">
                <h5 className="font-semibold text-slate-300 mb-2.5">Palpites dos Colegas de Grupo:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {participants.map((player) => {
                    const otherGuess = guesses.find((g) => g.participantId === player.id && g.matchId === m.id);
                    const isSelf = player.id === activeParticipantId;

                    // calculate points for this other player if match score is ready
                    const otherPoints = otherGuess && m.homeScore !== null && m.awayScore !== null
                      ? calculateGuessPoints(otherGuess.homeScoreGuess, otherGuess.awayScoreGuess, m.homeScore, m.awayScore)
                      : null;

                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                          isSelf
                            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                            : 'bg-slate-900/60 border-slate-850 text-slate-350'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{player.avatar}</span>
                          <span className="truncate max-w-[100px] font-medium">
                            {player.name} {isSelf && '(Você)'}
                          </span>
                        </div>
                        <div>
                          {otherGuess ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-white bg-slate-950 px-1.5 py-0.5 rounded-sm">
                                {otherGuess.homeScoreGuess}x{otherGuess.awayScoreGuess}
                              </span>
                              {otherPoints !== null && (
                                <span
                                  className={`text-[9px] font-mono font-semibold px-1 py-0.2 rounded-sm ${
                                    otherPoints.points === 3
                                      ? 'text-emerald-400 bg-emerald-500/10'
                                      : otherPoints.points > 0
                                      ? 'text-sky-400 bg-sky-500/10'
                                      : 'text-slate-500 bg-slate-800'
                                  }`}
                                  title={`Ganhou ${otherPoints.points} pontos com este palpite.`}
                                >
                                  +{otherPoints.points}p
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Nenhum palpite</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
