import React, { useState, useMemo, useEffect } from 'react';
import { Match, Guess, Participant } from '../types';
import { calculateGuessPoints } from '../utils';
import { Users, Save, CheckCircle, ChevronDown, ChevronUp, Lock, Edit2, Play, Sparkles, AlertCircle, Calendar, Search, ListFilter } from 'lucide-react';

// Normalizes single-digit or zero-padded day names (e.g., "09 Jun" or "9 Jun" become "9 Jun")
const normalizeDateStr = (dateStr: string) => {
  if (!dateStr) return '';
  const dayMonth = dateStr.split(',')[0] || '';
  const parts = dayMonth.trim().split(' ');
  if (parts.length < 2) return dayMonth.trim();
  const dayVal = parseInt(parts[0], 10);
  if (isNaN(dayVal)) return dayMonth.trim();
  return `${dayVal} ${parts[1]}`;
};

interface MatchesListProps {
  matches: Match[];
  guesses: Guess[];
  participants: Participant[];
  activeParticipantId: string;
  onSaveGuess: (matchId: string, homeScore: number, awayScore: number) => void;
  isAdminMode: boolean;
  onUpdateActualScore: (matchId: string, homeScore: number | null, awayScore: number | null, status: 'SCHEDULED' | 'LIVE' | 'FINISHED') => void;
  onLockGuesses?: () => void;
}

export default function MatchesList({
  matches,
  guesses,
  participants,
  activeParticipantId,
  onSaveGuess,
  isAdminMode,
  onUpdateActualScore,
  onLockGuesses,
}: MatchesListProps) {
  const [expandedGuesses, setExpandedGuesses] = useState<Record<string, boolean>>({});
  const [editGuesses, setEditGuesses] = useState<Record<string, { home: number; away: number }>>({});
  const [adminScores, setAdminScores] = useState<Record<string, { home: number | null; away: number | null; status: 'SCHEDULED' | 'LIVE' | 'FINISHED' }>>({});
  const [justSavedIds, setJustSavedIds] = useState<Record<string, boolean>>({});
  const [adminSavedIds, setAdminSavedIds] = useState<Record<string, boolean>>({});

  const [viewType, setViewType] = useState<'day' | 'round'>('day');
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeParticipant = participants.find((p) => p.id === activeParticipantId);

  const unfilledMatchesCount = useMemo(() => {
    const activeGuesses = guesses.filter(
      (g) =>
        g.participantId === activeParticipantId &&
        g.homeScoreGuess !== null &&
        g.homeScoreGuess !== undefined
    );
    return Math.max(0, matches.length - activeGuesses.length);
  }, [guesses, activeParticipantId, matches.length]);

  // Parse custom strings like "12 Jun, 15:00" to secure numeric timestamps for chronologic sorting
  const parseDateForSorting = (dateStr: string) => {
    if (!dateStr) return 0;
    const [dayMonth, time] = dateStr.split(',');
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

  // stable representation sorted chronologically
  const sortedAllMatches = useMemo(() => {
    return [...matches].sort((a, b) => parseDateForSorting(a.date) - parseDateForSorting(b.date));
  }, [matches]);

  // stable unique dates present across matches (chronological)
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(sortedAllMatches.map((m) => normalizeDateStr(m.date))));
  }, [sortedAllMatches]);

  // select current active day of cup on startup, or fallbacks to the first day of games
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const monthsEnPt: Record<number, string> = {
      0: 'Jan', 1: 'Fev', 2: 'Mar', 3: 'Abr', 4: 'Mai', 5: 'Jun',
      6: 'Jul', 7: 'Ago', 8: 'Set', 9: 'Out', 10: 'Nov', 11: 'Dez'
    };
    const d = new Date();
    const day = d.getDate();
    const month = monthsEnPt[d.getMonth()] || 'Jun';
    const candidateToday = `${day} ${month}`;

    const datesList = Array.from(new Set(sortedAllMatches.map((m) => normalizeDateStr(m.date))));
    if (datesList.includes(candidateToday)) {
      return candidateToday;
    }
    return datesList[0] || '11 Jun';
  });

  // reset if selected date is missing from uniqueDates due to dataset shifts
  useEffect(() => {
    if (uniqueDates.length > 0 && !uniqueDates.includes(selectedDate)) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates, selectedDate]);

  // filter only for selected day matches or round matches + searchQuery text search
  const filteredMatches = useMemo(() => {
    return sortedAllMatches.filter((m) => {
      // 1. Search filter with robust lowercase comparisons
      if (searchQuery.trim() !== '') {
        const homeNorm = m.homeTeam.toLowerCase();
        const awayNorm = m.awayTeam.toLowerCase();
        const queryNorm = searchQuery.toLowerCase().trim();
        if (!homeNorm.includes(queryNorm) && !awayNorm.includes(queryNorm)) {
          return false;
        }
      }

      // 2. Tab Filter selector
      if (viewType === 'day') {
        const matchDayPart = normalizeDateStr(m.date);
        return matchDayPart === selectedDate;
      } else {
        if (selectedRound === 'all') {
          return true;
        }
        const groupNormalized = m.group.toLowerCase();
        return groupNormalized.includes(`rodada ${selectedRound}`) || groupNormalized.includes(`round ${selectedRound}`);
      }
    });
  }, [sortedAllMatches, viewType, selectedDate, selectedRound, searchQuery]);

  const toggleGuesses = (matchId: string) => {
    setExpandedGuesses((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const persistGuessImmediately = (matchId: string, home: number, away: number) => {
    setEditGuesses((prev) => ({
      ...prev,
      [matchId]: { home, away }
    }));
    onSaveGuess(matchId, home, away);
    setJustSavedIds((prev) => ({ ...prev, [matchId]: true }));
    setTimeout(() => {
      setJustSavedIds((prev) => ({ ...prev, [matchId]: false }));
    }, 1500);
  };

  const handleGuessInputChange = (matchId: string, team: 'home' | 'away', rawValue: string) => {
    const myGuess = guesses.find((g) => g.participantId === activeParticipantId && g.matchId === matchId);
    const currentHome = editGuesses[matchId]?.home ?? myGuess?.homeScoreGuess ?? 0;
    const currentAway = editGuesses[matchId]?.away ?? myGuess?.awayScoreGuess ?? 0;

    let cleanVal = parseInt(rawValue, 10);
    if (isNaN(cleanVal)) {
      cleanVal = 0;
    }
    cleanVal = Math.max(0, Math.min(20, cleanVal));

    const newHome = team === 'home' ? cleanVal : currentHome;
    const newAway = team === 'away' ? cleanVal : currentAway;

    persistGuessImmediately(matchId, newHome, newAway);
  };

  const updateGuessDirectly = (matchId: string, team: 'home' | 'away', change: number) => {
    const myGuess = guesses.find((g) => g.participantId === activeParticipantId && g.matchId === matchId);
    
    // Retrieve current working value from state, or fallback to saved guess, or fallback to 0
    const currentHome = editGuesses[matchId]?.home ?? myGuess?.homeScoreGuess ?? 0;
    const currentAway = editGuesses[matchId]?.away ?? myGuess?.awayScoreGuess ?? 0;

    let newHome = currentHome;
    let newAway = currentAway;

    if (team === 'home') {
      newHome = Math.max(0, Math.min(20, currentHome + change));
    } else {
      newAway = Math.max(0, Math.min(20, currentAway + change));
    }

    persistGuessImmediately(matchId, newHome, newAway);
  };

  const handleAdminScoreChange = (matchId: string, team: 'home' | 'away', rawValue: string) => {
    const match = matches.find((x) => x.id === matchId);
    const mHome = match ? match.homeScore : null;
    const mAway = match ? match.awayScore : null;
    const mStatus = match ? match.status : 'SCHEDULED';

    const current = adminScores[matchId] || { home: mHome, away: mAway, status: mStatus };

    let cleanVal: number | null = null;
    if (rawValue && rawValue.trim() !== '') {
      const parsed = parseInt(rawValue, 10);
      cleanVal = isNaN(parsed) ? null : Math.max(0, Math.min(25, parsed));
    }

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
      
      {/* Visual Filters and Search Header Card */}
      <div className="bg-white border border-emerald-100 rounded-3xl p-5 space-y-4 shadow-xs text-left" id="matches-filter-controller">
        
        {/* Toggle Mode Buttons + Fast Search Bar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Toggle Tab Pill Buttons (Day vs Round) */}
          <div className="md:col-span-6 flex p-1 bg-slate-100/80 rounded-xl border border-slate-200 select-none">
            <button
              onClick={() => {
                setViewType('day');
                setSearchQuery(''); 
              }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewType === 'day'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-250/20'
                  : 'text-slate-550 hover:text-slate-800'
              }`}
              id="view-type-day-btn"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ver por Dia</span>
            </button>
            <button
              onClick={() => {
                setViewType('round');
                setSearchQuery('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewType === 'round'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-250/20'
                  : 'text-slate-550 hover:text-slate-800'
              }`}
              id="view-type-round-btn"
            >
              <ListFilter className="w-3.5 h-3.5 text-emerald-705" />
              <span>Ver por Rodada</span>
            </button>
          </div>

          {/* Quick Search Entry */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar país (ex: Brasil)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-220 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 rounded-xl text-xs text-slate-850 placeholder-slate-400 outline-hidden transition-all"
              id="team-search-input"
            />
          </div>

        </div>

        {/* Mode specific sliders/selectors */}
        {viewType === 'day' ? (
          /* Day Slider Calendar (The Scrollable chip selection system) */
          uniqueDates.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-3" id="calendar-view-panel">
              <div className="flex justify-between items-center px-0.5">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                  📅 Calendário por Dia
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-850 font-mono font-black px-2 mt-0.5 border border-emerald-200/50 rounded-sm">
                  {selectedDate} • {filteredMatches.length} {filteredMatches.length === 1 ? 'partida selecionada' : 'partidas selecionadas'}
                </span>
              </div>

              <div 
                className="flex gap-2 pb-1 overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-600 scrollbar-track-transparent snap-x justify-start select-none" 
                id="dates-scroll-row"
              >
                {uniqueDates.map((date) => {
                  const isSelected = date === selectedDate;
                  const matchesCountOnDay = matches.filter((m) => normalizeDateStr(m.date) === date).length;

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 snap-center flex flex-col items-center gap-0.5 cursor-pointer min-w-[72px] shadow-3xs active:scale-95 ${
                        isSelected
                          ? 'bg-emerald-700 text-white ring-1 ring-yellow-455 shadow-sm shadow-emerald-700/20'
                          : 'bg-emerald-50/20 text-emerald-990 hover:bg-emerald-50 border border-emerald-100/40 hover:border-emerald-200/50'
                      }`}
                      id={`date-chip-${date.replace(' ', '-')}`}
                    >
                      <span className="tracking-tight">{date}</span>
                      <span className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded-sm leading-none ${
                        isSelected ? 'bg-yellow-450 text-emerald-950' : 'bg-emerald-100 text-emerald-850'
                      }`}>
                        {matchesCountOnDay} {matchesCountOnDay === 1 ? 'jogo' : 'jogos'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          /* Round Filter Segmented Selector Row */
          <div className="space-y-2 border-t border-slate-100 pt-3" id="round-view-panel">
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                🏆 Selecionar Rodada (Fase de Grupos)
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-805 font-mono font-black px-2 mt-0.5 border border-emerald-200/50 rounded-sm">
                Exibindo: {filteredMatches.length} {filteredMatches.length === 1 ? 'partida' : 'partidas'}
              </span>
            </div>

            <div className="flex gap-2 select-none flex-wrap sm:flex-nowrap" id="rounds-chip-row">
              {[
                { id: 'all', label: 'Todas as Rodadas' },
                { id: '1', label: '1ª Rodada' },
                { id: '2', label: '2ª Rodada' },
                { id: '3', label: '3ª Rodada' }
              ].map((round) => {
                const isSelected = round.id === selectedRound;
                return (
                  <button
                    key={round.id}
                    onClick={() => setSelectedRound(round.id)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center active:scale-95 border ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 ring-1 ring-yellow-450 shadow-sm shadow-emerald-700/10'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-220'
                    }`}
                    id={`round-chip-${round.id}`}
                  >
                    {round.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Participant Lock/Draft status info banner & quick consolidation directly in Games screen */}
      {activeParticipant && !isAdminMode && (
        <div 
          className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm mb-4 ${
            activeParticipant.locked
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : unfilledMatchesCount > 0
                ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
          }`} 
          id="matches-lock-banner"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg border shrink-0 ${
              activeParticipant.locked
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : unfilledMatchesCount > 0
                  ? 'bg-amber-150 border-amber-300 text-amber-700'
                  : 'bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}>
              <Lock className="w-5 h-5 shrink-0 animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs uppercase tracking-wider block">
                {activeParticipant.locked 
                  ? '🔒 Seus Palpites Estão Consolidados' 
                  : unfilledMatchesCount > 0
                    ? `📝 Palpites em Modo Rascunho (${matches.length - unfilledMatchesCount}/${matches.length} Preenchidos)`
                    : '🎉 Pronto para Trancar Tudo!'}
              </span>
              <span className="text-xs text-slate-600 mt-1 block leading-relaxed">
                {activeParticipant.locked
                  ? `Seus palpites para todos os jogos da Copa estão validados e trancados definitivamente na nuvem. Boa sorte!`
                  : unfilledMatchesCount > 0
                    ? `Faltam palpites para ${unfilledMatchesCount} jogo(s) de um total de ${matches.length}. Você precisa cadastrar palpites para todos os dias e jogos para liberar a confirmação.`
                    : `Parabéns! Todos os ${matches.length} jogos foram respondidos. Você já pode oficializar e trancar seus palpites para a competição.`}
              </span>
            </div>
          </div>

          {!activeParticipant.locked && onLockGuesses && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLockGuesses();
              }}
              disabled={unfilledMatchesCount > 0}
              className={`w-full md:w-auto py-2.5 px-5 font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider shrink-0 ${
                unfilledMatchesCount > 0
                  ? 'bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white'
              }`}
              id="matches-banner-lock-btn"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{unfilledMatchesCount > 0 ? 'Grave todos para liberar' : 'Confirmar & Trancar Palpites'}</span>
            </button>
          )}
        </div>
      )}

      {filteredMatches.length > 0 ? (
        filteredMatches.map((m) => {
          // Find current participant's guess
          const myGuess = guesses.find((g) => g.participantId === activeParticipantId && g.matchId === m.id);
          const hasGuessed = !!myGuess;

          // Active editing inputs local state inside editGuesses or fallbacks
          const guessHome = editGuesses[m.id]?.home ?? myGuess?.homeScoreGuess ?? 0;
          const guessAway = editGuesses[m.id]?.away ?? myGuess?.awayScoreGuess ?? 0;

          // Admin scores inputs without falling back to 0 if null
          const currentAdminHomeScore = adminScores[m.id]?.home !== undefined ? adminScores[m.id]?.home : m.homeScore;
          const currentAdminAwayScore = adminScores[m.id]?.away !== undefined ? adminScores[m.id]?.away : m.awayScore;
          const selectedStatus = adminScores[m.id]?.status ?? m.status;

          const isLive = m.status === 'LIVE';
          const isFinished = m.status === 'FINISHED';
          const isScheduled = m.status === 'SCHEDULED';

          // Allow submitting guesses even for already played or live games to let user consolidate results
          const isMatchLocked = !!activeParticipant?.locked && !isAdminMode;

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
              className={`bg-white border overflow-hidden rounded-2xl shadow-sm transition-all ${
                isLive
                  ? 'border-rose-350 bg-linear-to-b from-rose-50/20 to-white shadow-md shadow-rose-100/30'
                  : hasGuessed
                  ? 'border-emerald-500 shadow-xs ring-2 ring-emerald-500/5'
                  : 'border-slate-200'
              }`}
              id={`match-card-${m.id}`}
            >
              {/* Header info */}
               <div className="bg-emerald-50/40 px-4 py-2.5 flex justify-between items-center text-xs border-b border-emerald-100/40">
                <span className="text-slate-500 font-bold uppercase tracking-wider">{m.group}</span>
                <div className="flex items-center gap-1.5">
                  {isLive && (
                    <span className="bg-rose-100 text-rose-700 font-bold px-2.5 py-0.5 rounded-sm flex items-center gap-1 animate-pulse" id={`live-badge-${m.id}`}>
                      <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping"></span>
                      AO VIVO • {m.minute}'
                    </span>
                  )}
                  {isFinished && (
                    <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-sm" id={`finished-badge-${m.id}`}>
                      FINALIZADO
                    </span>
                  )}
                  {isScheduled && (
                    <span className="text-slate-505 font-semibold tracking-tight animate-fade-in" id={`date-${m.id}`}>
                      {m.date}
                    </span>
                  )}
                </div>
              </div>

              {/* Teams, Inputs, and Scores Display Symmetrical Layout */}
              <div className="p-4 sm:p-5" id={`match-${m.id}-dashboard`}>
                <div className="grid grid-cols-12 gap-1 sm:gap-4 items-center">
                  
                  {/* Home Team (Left Side) */}
                  <div className="col-span-4 sm:col-span-5 flex flex-col sm:flex-row items-center justify-end gap-1.5 sm:gap-3 text-right">
                    <span className="font-extrabold text-[11px] sm:text-sm md:text-base text-slate-900 tracking-tight text-right truncate max-w-[85px] sm:max-w-none order-2 sm:order-1 select-none leading-tight">
                      {m.homeTeam}
                    </span>
                    {m.homeFlag && m.homeFlag.startsWith('http') ? (
                      <img 
                        src={m.homeFlag} 
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0 order-1 sm:order-2 filter drop-shadow-xs" 
                        alt={m.homeTeam} 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl filter drop-shadow-xs select-none order-1 sm:order-2 shrink-0" role="img" aria-label={m.homeTeam}>
                        {m.homeFlag}
                      </span>
                    )}
                  </div>

                  {/* Score / Selector Center Column */}
                  <div className="col-span-4 sm:col-span-2 flex justify-center items-center">
                    {isAdminMode ? (
                      /* DEEP ADMINISTRATOR ACTIVE OVERRIDES */
                      <div className="flex flex-col items-center gap-1.5" id={`admin-override-box-${m.id}`}>
                        <div className="bg-amber-100/30 border border-amber-300 text-amber-800 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-sm select-none">
                          🛠️ Admin
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50/55 border border-amber-300 p-1.5 rounded-xl shadow-2xs">
                          {/* HOME ADMIN BOX */}
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={currentAdminHomeScore !== null && currentAdminHomeScore !== undefined ? currentAdminHomeScore : ''}
                            onChange={(e) => handleAdminScoreChange(m.id, 'home', e.target.value)}
                            className="w-10 text-center font-mono font-black text-sm text-slate-900 bg-white border border-slate-250 rounded-md py-0.5"
                          />
                          <span className="text-amber-500 font-bold select-none">:</span>
                          {/* AWAY ADMIN BOX */}
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={currentAdminAwayScore !== null && currentAdminAwayScore !== undefined ? currentAdminAwayScore : ''}
                            onChange={(e) => handleAdminScoreChange(m.id, 'away', e.target.value)}
                            className="w-10 text-center font-mono font-black text-sm text-slate-900 bg-white border border-slate-250 rounded-md py-0.5"
                          />
                        </div>
                      </div>
                    ) : (
                      /* OFFICIAL GAME SCOREBOARD */
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-extrabold text-slate-400 tracking-wider uppercase select-none">
                          Placar Oficial
                        </span>
                        {isScheduled ? (
                          <div className="text-slate-450 font-black text-[11px] sm:text-xs bg-slate-50 border border-slate-205 px-2.5 py-1 rounded-lg select-none">
                            VS
                          </div>
                        ) : (
                          <div className={`flex items-center gap-1 bg-slate-100 px-3 py-1 border border-slate-205 shadow-3xs font-mono font-black text-sm text-slate-900 select-none rounded-lg ${
                            isLive ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : ''
                          }`}>
                            <span>{m.homeScore !== null ? m.homeScore : '-'}</span>
                            <span className="text-slate-400 font-normal">:</span>
                            <span>{m.awayScore !== null ? m.awayScore : '-'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Away Team (Right Side) */}
                  <div className="col-span-4 sm:col-span-5 flex flex-col sm:flex-row items-center justify-start gap-1.5 sm:gap-3 text-left">
                    {m.awayFlag && m.awayFlag.startsWith('http') ? (
                      <img 
                        src={m.awayFlag} 
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0 filter drop-shadow-xs" 
                        alt={m.awayTeam} 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl filter drop-shadow-xs select-none shrink-0" role="img" aria-label={m.awayTeam}>
                        {m.awayFlag}
                      </span>
                    )}
                    <span className="font-extrabold text-[11px] sm:text-sm md:text-base text-slate-900 tracking-tight text-left truncate max-w-[85px] sm:max-w-none select-none leading-tight">
                      {m.awayTeam}
                    </span>
                  </div>

                </div>

                {/* DEDICATED PALPITES (GUESSES) CONTAINER PANEL */}
                {activeParticipant && !isAdminMode && (
                  <div className={`mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 p-2.5 rounded-xl border ${
                    isAdminMode 
                      ? 'bg-amber-50/30 border-amber-200/50' 
                      : 'bg-slate-50/50 border-slate-200/40'
                  }`}>
                    
                    {/* Left label part */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`p-1 rounded-lg border ${
                        isAdminMode 
                          ? 'bg-amber-100/50 text-amber-800 border-amber-250' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                      }`}>
                        <Sparkles className={`w-4 h-4 shrink-0 ${isAdminMode ? 'text-amber-600' : 'text-emerald-600'}`} />
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] uppercase font-black tracking-wider block text-slate-400 select-none">
                          {isAdminMode ? '🛠️ AJUSTE ADMINISTRATIVO DE PALPITE' : 'Palpite Pessoal de'}
                        </span>
                        <span className="text-slate-755 font-black text-[11px] sm:text-xs">
                          {activeParticipant.name} ({activeParticipant.avatar})
                        </span>
                      </div>
                    </div>

                    {/* Middle / Right control part */}
                    {isMatchLocked ? (
                      /* Display Locked prediction results */
                      <div className="flex items-center gap-2">
                        {hasGuessed ? (
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <span className="text-xs font-mono font-black text-slate-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-3xs select-none">
                              Palpite: {myGuess.homeScoreGuess} x {myGuess.awayScoreGuess}
                            </span>
                            
                            {m.homeScore !== null && m.awayScore !== null && (
                              <div className="inline-flex">
                                {scoreResult.points === 3 ? (
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-250 text-[9px] font-black px-2 py-0.5 rounded-md select-none shadow-3xs">
                                    🥇 +3 pts (Exato!)
                                  </span>
                                ) : scoreResult.points === 1 ? (
                                  <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-black px-2 py-0.5 rounded-md select-none shadow-3xs">
                                    🥈 +1 pt (Parcial)
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-400 border border-slate-220 text-[9px] font-bold px-2 py-0.5 rounded-md select-none shadow-3xs">
                                    0 pts
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-extrabold tracking-tight select-none border border-amber-200 bg-amber-50 px-2 py-0.5 rounded-md">
                            ⚠️ Sem palpite cadastrado a tempo
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Display Editable prediction controls */
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white border border-slate-220 px-1 py-0.5 rounded-xl shadow-3xs">
                          {/* HOME GOAL SLIDERS */}
                          <div className="flex items-center gap-0.5">
                            <button 
                              onClick={() => updateGuessDirectly(m.id, 'home', -1)}
                              className="w-5 h-5 flex items-center justify-center bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md font-extrabold text-xs select-none cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={guessHome}
                              onChange={(e) => handleGuessInputChange(m.id, 'home', e.target.value)}
                              className="w-6 text-center font-mono font-black text-xs text-slate-900 bg-transparent outline-none focus:outline-none"
                            />
                            <button 
                              onClick={() => updateGuessDirectly(m.id, 'home', 1)}
                              className="w-5 h-5 flex items-center justify-center bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md font-extrabold text-xs select-none cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-slate-300 font-black text-xs px-1">x</span>

                          {/* AWAY GOAL SLIDERS */}
                          <div className="flex items-center gap-0.5">
                            <button 
                              onClick={() => updateGuessDirectly(m.id, 'away', -1)}
                              className="w-5 h-5 flex items-center justify-center bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-705 rounded-md font-extrabold text-xs select-none cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={guessAway}
                              onChange={(e) => handleGuessInputChange(m.id, 'away', e.target.value)}
                              className="w-6 text-center font-mono font-black text-xs text-slate-900 bg-transparent outline-none focus:outline-none"
                            />
                            <button 
                              onClick={() => updateGuessDirectly(m.id, 'away', 1)}
                              className="w-5 h-5 flex items-center justify-center bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md font-extrabold text-xs select-none cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div 
                          className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 border transition-all duration-300 select-none ${
                            justSavedIds[m.id]
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-250 animate-pulse font-bold'
                              : 'bg-emerald-50/20 text-emerald-700 border-emerald-100'
                          }`}
                          id={`auto-saved-badge-${m.id}`}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${justSavedIds[m.id] ? 'text-emerald-600 animate-bounce' : 'text-emerald-500'}`} />
                          <span>{justSavedIds[m.id] ? 'Salvo!' : 'Auto-salvo'}</span>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* ADMIN MODE OVERRIDES ROW FOR SCORE SAVE */}
              {isAdminMode && (
                <div className="bg-amber-50/20 px-5 py-3 border-t border-amber-100 flex flex-col xs:flex-row justify-between items-center gap-2">
                  <span className="text-[10px] text-amber-800 font-black tracking-widest uppercase flex items-center gap-1 select-none">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                    <span>Controlador de Partida</span>
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded text-[9px] font-black uppercase select-none tracking-wider">
                      Status: Finalizado
                    </span>

                    <button
                      onClick={() => {
                        const finalHome = currentAdminHomeScore !== null && currentAdminHomeScore !== undefined && String(currentAdminHomeScore).trim() !== '' ? Number(currentAdminHomeScore) : null;
                        const finalAway = currentAdminAwayScore !== null && currentAdminAwayScore !== undefined && String(currentAdminAwayScore).trim() !== '' ? Number(currentAdminAwayScore) : null;
                        
                        onUpdateActualScore(
                          m.id,
                          finalHome,
                          finalAway,
                          'FINISHED'
                        );

                        // Trigger visual success confirmation feedback
                        setAdminSavedIds((prev) => ({ ...prev, [m.id]: true }));
                        setTimeout(() => {
                          setAdminSavedIds((prev) => ({ ...prev, [m.id]: false }));
                        }, 2000);
                      }}
                      className={`py-1 px-3.5 rounded-lg text-white font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-3xs select-none transition-all duration-300 ${
                        adminSavedIds[m.id]
                          ? 'bg-emerald-700 font-black animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                      id={`admin-save-btn-${m.id}`}
                    >
                      {adminSavedIds[m.id] ? '✓ Gravado!' : 'Gravar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Actions Accordion - Guesses from other members */}
              <div className="bg-slate-50/70 px-5 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs">
                <button
                  onClick={() => toggleGuesses(m.id)}
                  className="text-slate-605 hover:text-emerald-700 font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
                  id={`toggle-other-guesses-${m.id}`}
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{expandedGuesses[m.id] ? 'Ocultar palpites da galera' : 'Ver palpites dos outros participantes'}</span>
                  {expandedGuesses[m.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded section - participants guesses */}
              {expandedGuesses[m.id] && (
                <div className="bg-slate-50/40 px-5 py-4 border-t border-slate-200 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-600 mb-2.5">Palpites dos Colegas de Grupo:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {participants
                      .filter((player) => player.id !== activeParticipantId)
                      .map((player) => {
                        const otherGuess = guesses.find((g) => g.participantId === player.id && g.matchId === m.id);
                        const isSelf = false;

                      // calculate points for this other player if match score is ready
                      const otherPoints = otherGuess && m.homeScore !== null && m.awayScore !== null
                        ? calculateGuessPoints(otherGuess.homeScoreGuess, otherGuess.awayScoreGuess, m.homeScore, m.awayScore)
                        : null;

                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                            isSelf
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                              : 'bg-white border-slate-205 text-slate-700 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{player.avatar}</span>
                            <span className="truncate max-w-[100px] font-bold">
                              {player.name} {isSelf && '(Você)'}
                            </span>
                          </div>
                          <div>
                            {otherGuess ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                  {otherGuess.homeScoreGuess}x{otherGuess.awayScoreGuess}
                                </span>
                                {otherPoints !== null && (
                                  <span
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm border ${
                                      otherPoints.points === 3
                                        ? 'text-emerald-700 bg-emerald-100 border-emerald-250'
                                        : otherPoints.points > 0
                                        ? 'text-blue-700 bg-blue-105 border-blue-200'
                                        : 'text-slate-505 bg-slate-100 border-slate-200'
                                    }`}
                                    title={`Ganhou ${otherPoints.points} pontos com este palpite.`}
                                  >
                                    +{otherPoints.points}p
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Nenhum palpite</span>
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
        })
      ) : (
        <div className="bg-white border border-dashed border-emerald-100 rounded-2xl p-10 text-center text-slate-400 text-xs font-semibold" id="no-matches-on-day">
          ⚽ Nenhuma partida encontrada com os filtros selecionados.
        </div>
      )}
    </div>
  );
}
