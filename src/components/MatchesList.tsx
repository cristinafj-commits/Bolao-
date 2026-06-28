import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Match, Guess, Participant } from '../types';
import { calculateGuessPoints, isMatchExpiredForGuesses } from '../utils';
import { Users, Save, CheckCircle, ChevronDown, ChevronUp, Lock, Edit2, Play, Sparkles, AlertCircle, Calendar, Search, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';

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

// Gets the week day abbreviation in Portuguese for a given "DD Jun" date string in 2026
const getWeekDayPt = (dateStr: string) => {
  const parts = dateStr.trim().split(' ');
  const day = parseInt(parts[0], 10);
  const monthStr = parts[1];
  if (isNaN(day)) return '';
  const months: Record<string, number> = {
    'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
    'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11
  };
  const month = months[monthStr] !== undefined ? months[monthStr] : 5;
  const dateObj = new Date(2026, month, day);
  const daysPt = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  return daysPt[dateObj.getDay()];
};

interface MatchesListProps {
  matches: Match[];
  guesses: Guess[];
  participants: Participant[];
  activeParticipantId: string;
  onSaveGuess: (matchId: string, homeScore: number, awayScore: number, penaltyWinnerGuess?: 'home' | 'away' | null) => void;
  onSaveMultipleGuesses?: (bets: { matchId: string; homeScore: number; awayScore: number }[]) => Promise<void>;
  isAdminMode: boolean;
  onUpdateActualScore: (
    matchId: string, 
    homeScore: number | null, 
    awayScore: number | null, 
    status: 'SCHEDULED' | 'LIVE' | 'FINISHED', 
    minute?: number,
    penaltyWinner?: 'home' | 'away' | null
  ) => void;
  onLockGuesses?: () => void;
  tourneyPhase?: 'grupo' | 'fase2';
}

export default function MatchesList({
  matches,
  guesses,
  participants,
  activeParticipantId,
  onSaveGuess,
  onSaveMultipleGuesses,
  isAdminMode,
  onUpdateActualScore,
  onLockGuesses,
  tourneyPhase = 'grupo',
}: MatchesListProps) {
  const [expandedGuesses, setExpandedGuesses] = useState<Record<string, boolean>>({});
  const [editGuesses, setEditGuesses] = useState<Record<string, { home: number; away: number }>>({});
  const [adminScores, setAdminScores] = useState<Record<string, { home: number | null; away: number | null; status: 'SCHEDULED' | 'LIVE' | 'FINISHED'; minute?: number }>>({});
  const [justSavedIds, setJustSavedIds] = useState<Record<string, boolean>>({});
  const [adminSavedIds, setAdminSavedIds] = useState<Record<string, boolean>>({});

  const [consultedParticipantId, setConsultedParticipantId] = useState<string>(activeParticipantId);

  useEffect(() => {
    setConsultedParticipantId(activeParticipantId);
  }, [activeParticipantId]);

  const [localHomeGuesses, setLocalHomeGuesses] = useState<Record<string, string>>({});
  const [localAwayGuesses, setLocalAwayGuesses] = useState<Record<string, string>>({});

  const lastGuessesPropRef = useRef<Guess[]>([]);
  const lastConsultedIdRef = useRef<string>('');

  // Populate local input values from Firebase once loaded or changed, preserving unsaved/dirty user input
  useEffect(() => {
    const idChanged = lastConsultedIdRef.current !== consultedParticipantId;
    lastConsultedIdRef.current = consultedParticipantId;

    setLocalHomeGuesses((prevHome) => {
      setLocalAwayGuesses((prevAway) => {
        const updatedAway = { ...prevAway };

        matches.forEach((m) => {
          const myGuess = guesses.find((g) => g.participantId === consultedParticipantId && g.matchId === m.id);
          const prevGuess = lastGuessesPropRef.current.find((g) => g.participantId === consultedParticipantId && g.matchId === m.id);

          const hasGuess = myGuess && myGuess.homeScoreGuess !== null && myGuess.homeScoreGuess !== undefined;
          const hadGuess = prevGuess && prevGuess.homeScoreGuess !== null && prevGuess.homeScoreGuess !== undefined;

          // Decide if we should overwrite the local value for this match
          let shouldOverwrite = false;

          if (idChanged) {
            shouldOverwrite = true;
          } else if (hasGuess !== hadGuess) {
            shouldOverwrite = true;
          } else if (hasGuess && prevGuess && (myGuess.homeScoreGuess !== prevGuess.homeScoreGuess || myGuess.awayScoreGuess !== prevGuess.awayScoreGuess)) {
            shouldOverwrite = true;
          } else if (updatedAway[m.id] === undefined) {
            shouldOverwrite = true;
          }

          if (shouldOverwrite) {
            if (hasGuess) {
              updatedAway[m.id] = String(myGuess.awayScoreGuess);
            } else {
              updatedAway[m.id] = '';
            }
          }
        });

        return updatedAway;
      });

      const updatedHome = { ...prevHome };
      matches.forEach((m) => {
        const myGuess = guesses.find((g) => g.participantId === consultedParticipantId && g.matchId === m.id);
        const prevGuess = lastGuessesPropRef.current.find((g) => g.participantId === consultedParticipantId && g.matchId === m.id);

        const hasGuess = myGuess && myGuess.homeScoreGuess !== null && myGuess.homeScoreGuess !== undefined;
        const hadGuess = prevGuess && prevGuess.homeScoreGuess !== null && prevGuess.homeScoreGuess !== undefined;

        let shouldOverwrite = false;

        if (idChanged) {
          shouldOverwrite = true;
        } else if (hasGuess !== hadGuess) {
          shouldOverwrite = true;
        } else if (hasGuess && prevGuess && (myGuess.homeScoreGuess !== prevGuess.homeScoreGuess || myGuess.awayScoreGuess !== prevGuess.awayScoreGuess)) {
          shouldOverwrite = true;
        } else if (updatedHome[m.id] === undefined) {
          shouldOverwrite = true;
        }

        if (shouldOverwrite) {
          if (hasGuess) {
            updatedHome[m.id] = String(myGuess.homeScoreGuess);
          } else {
            updatedHome[m.id] = '';
          }
        }
      });

      return updatedHome;
    });

    lastGuessesPropRef.current = guesses;
  }, [consultedParticipantId, guesses, matches]);

  const [viewType, setViewType] = useState<'day' | 'round'>('day');
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeParticipant = participants.find((p) => p.id === activeParticipantId);
  const consultedParticipant = participants.find((p) => p.id === consultedParticipantId);
  const isConsultingSelf = consultedParticipantId === activeParticipantId;

  const isActiveParticipantLocked = tourneyPhase === 'fase2' ? activeParticipant?.lockedFase2 : activeParticipant?.locked;
  const isConsultedParticipantLocked = tourneyPhase === 'fase2' ? consultedParticipant?.lockedFase2 : consultedParticipant?.locked;

  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const dirtyMatchesInfo = useMemo(() => {
    if (!isConsultingSelf || (isActiveParticipantLocked && !isAdminMode)) {
      return [];
    }
    const list: { matchId: string; homeScore: number; awayScore: number; m: Match }[] = [];
    matches.forEach((m) => {
      // Se não for admin e o palpite para a partida estiver expirado (trava de 12h), ignora
      if (!isAdminMode && isMatchExpiredForGuesses(m.date, m.id)) {
        return;
      }

      const valHome = localHomeGuesses[m.id] ?? '';
      const valAway = localAwayGuesses[m.id] ?? '';
      const isMarked = valHome !== '' && valAway !== '';
      if (!isMarked) return;

      const savedGuess = guesses.find((g) => g.participantId === activeParticipantId && g.matchId === m.id);
      const isDirty = !savedGuess || String(savedGuess.homeScoreGuess) !== valHome || String(savedGuess.awayScoreGuess) !== valAway;

      if (isDirty) {
        list.push({
          matchId: m.id,
          homeScore: parseInt(valHome, 10),
          awayScore: parseInt(valAway, 10),
          m,
        });
      }
    });
    return list;
  }, [isConsultingSelf, activeParticipant, isAdminMode, matches, localHomeGuesses, localAwayGuesses, guesses, activeParticipantId]);

  const handleBulkSave = async () => {
    if (!onSaveMultipleGuesses || dirtyMatchesInfo.length === 0) return;
    setIsBulkSaving(true);
    try {
      const bets = dirtyMatchesInfo.map((info) => ({
        matchId: info.matchId,
        homeScore: info.homeScore,
        awayScore: info.awayScore,
      }));
      await onSaveMultipleGuesses(bets);
      
      const savedIdsObj: Record<string, boolean> = {};
      bets.forEach((b) => {
        savedIdsObj[b.matchId] = true;
      });
      setJustSavedIds((prev) => ({ ...prev, ...savedIdsObj }));
      setTimeout(() => {
        setJustSavedIds((prev) => {
          const clone = { ...prev };
          bets.forEach((b) => {
            clone[b.matchId] = false;
          });
          return clone;
        });
      }, 2000);
    } catch (err) {
      console.error("Bulk save error:", err);
    } finally {
      setIsBulkSaving(false);
    }
  };

  const unfilledMatchesCount = useMemo(() => {
    const activeGuesses = guesses.filter(
      (g) =>
        g.participantId === activeParticipantId &&
        g.homeScoreGuess !== null &&
        g.homeScoreGuess !== undefined &&
        String(g.homeScoreGuess).trim() !== '' &&
        g.awayScoreGuess !== null &&
        g.awayScoreGuess !== undefined &&
        String(g.awayScoreGuess).trim() !== ''
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

  // Auto-scroll selected date to the center of the list
  useEffect(() => {
    if (!selectedDate) return;

    const scrollSelectedIntoView = (behavior: ScrollBehavior = 'smooth') => {
      const sanitizedId = `date-chip-${selectedDate.replace(' ', '-')}`;
      const element = document.getElementById(sanitizedId);
      if (element) {
        element.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
      }
    };

    // 1. Initial/selectedDate change scroll attempts
    const timer1 = setTimeout(() => scrollSelectedIntoView('smooth'), 120);
    const timer2 = setTimeout(() => scrollSelectedIntoView('smooth'), 300);

    // 2. IntersectionObserver to detect when the date-scroll container becomes visible on screen (e.g. mobile tab changes)
    const container = document.getElementById('dates-scroll-row');
    let observer: IntersectionObserver | null = null;

    if (container && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        const isVisible = entries.some(entry => entry.isIntersecting);
        if (isVisible) {
          // Perform instant centering scroll so it is centered the moment it appears, then support a smooth center verification
          scrollSelectedIntoView('auto');
          const t1 = setTimeout(() => scrollSelectedIntoView('smooth'), 50);
          const t2 = setTimeout(() => scrollSelectedIntoView('smooth'), 200);
          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      }, { threshold: 0.1 });
      observer.observe(container);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [selectedDate]);

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

  const adjustLocalGuess = (matchId: string, team: 'home' | 'away', change: number) => {
    const currentValStr = team === 'home' ? localHomeGuesses[matchId] : localAwayGuesses[matchId];
    let currentVal = 0;
    if (currentValStr !== undefined && currentValStr !== '') {
      currentVal = parseInt(currentValStr, 10);
      if (isNaN(currentVal)) currentVal = 0;
    }
    const finalVal = Math.max(0, Math.min(25, currentVal + change));
    if (team === 'home') {
      setLocalHomeGuesses((prev) => ({ ...prev, [matchId]: String(finalVal) }));
    } else {
      setLocalAwayGuesses((prev) => ({ ...prev, [matchId]: String(finalVal) }));
    }
  };

  const handleInputChange = (matchId: string, team: 'home' | 'away', rawValue: string) => {
    const cleaned = rawValue.replace(/[^0-9]/g, '');
    if (team === 'home') {
      setLocalHomeGuesses((prev) => ({ ...prev, [matchId]: cleaned }));
    } else {
      setLocalAwayGuesses((prev) => ({ ...prev, [matchId]: cleaned }));
    }
  };

  const handleSaveGuessClick = (matchId: string) => {
    const homeValStr = localHomeGuesses[matchId];
    const awayValStr = localAwayGuesses[matchId];
    if (homeValStr === undefined || homeValStr === '' || awayValStr === undefined || awayValStr === '') return;
    
    const homeVal = parseInt(homeValStr, 10);
    const awayVal = parseInt(awayValStr, 10);
    if (isNaN(homeVal) || isNaN(awayVal)) return;

    const existingGuess = guesses.find((g) => g.participantId === activeParticipantId && g.matchId === matchId);
    const finalPenaltyGuess = homeVal === awayVal ? (existingGuess?.penaltyWinnerGuess || null) : null;

    onSaveGuess(matchId, homeVal, awayVal, finalPenaltyGuess);

    setJustSavedIds((prev) => ({ ...prev, [matchId]: true }));
    setTimeout(() => {
      setJustSavedIds((prev) => ({ ...prev, [matchId]: false }));
    }, 2000);
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

  const handleAdminStatusChange = (matchId: string, status: 'SCHEDULED' | 'LIVE' | 'FINISHED') => {
    const match = matches.find((x) => x.id === matchId);
    const mHome = match ? match.homeScore : null;
    const mAway = match ? match.awayScore : null;
    const mStatus = match ? match.status : 'SCHEDULED';
    const mMinute = match ? match.minute : 0;

    const current = adminScores[matchId] || { home: mHome, away: mAway, status: mStatus, minute: mMinute };

    setAdminScores((prev) => ({
      ...prev,
      [matchId]: {
        ...current,
        status,
        minute: status === 'FINISHED' ? 90 : (status === 'SCHEDULED' ? 0 : current.minute),
      },
    }));
  };

  const handleAdminMinuteChange = (matchId: string, rawMinute: string) => {
    const match = matches.find((x) => x.id === matchId);
    const mHome = match ? match.homeScore : null;
    const mAway = match ? match.awayScore : null;
    const mStatus = match ? match.status : 'SCHEDULED';
    const mMinute = match ? match.minute : 0;

    const current = adminScores[matchId] || { home: mHome, away: mAway, status: mStatus, minute: mMinute };

    let cleanMin = 0;
    if (rawMinute && rawMinute.trim() !== '') {
      const parsed = parseInt(rawMinute, 10);
      cleanMin = isNaN(parsed) ? 0 : Math.max(0, Math.min(120, parsed));
    }

    setAdminScores((prev) => ({
      ...prev,
      [matchId]: {
        ...current,
        minute: cleanMin,
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
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-300/20'
                  : 'text-slate-500 hover:text-slate-800'
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
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-300/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="view-type-round-btn"
            >
              <ListFilter className="w-3.5 h-3.5 text-emerald-700" />
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
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-hidden transition-all"
              id="team-search-input"
            />
          </div>

        </div>

        {/* Consultation Mode Selection Row */}
        <div className="border-t border-slate-100 pt-3.5" id="consultation-section">
          <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            
            {/* Left Status side */}
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="py-1 px-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-black flex items-center gap-1 shrink-0 uppercase tracking-wider text-[9px] select-none">
                🔎 VISUALIZAÇÃO
              </span>
              <div className="min-w-0">
                {activeParticipantId === '' ? (
                  <span className="text-amber-800 font-extrabold bg-amber-50/75 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-flex items-center gap-1.5 text-[11px] leading-none shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                    Modo Consulta (Visitante)
                  </span>
                ) : (
                  <span className="text-emerald-800 font-extrabold bg-emerald-50/75 px-2.5 py-1 rounded-lg border border-emerald-305 inline-flex items-center gap-1.5 text-[11px] leading-none shrink-0 truncate max-w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    Participante: {activeParticipant?.name}
                  </span>
                )}
              </div>
            </div>

            {/* Right dropdown filter side */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto min-w-0">
              <span className="text-slate-500 font-black uppercase tracking-wider text-[9px] shrink-0 sm:text-right">
                Consultar Palpites:
              </span>
              <div className="relative w-full sm:w-72 max-w-full min-w-0">
                <select
                  value={consultedParticipantId}
                  onChange={(e) => setConsultedParticipantId(e.target.value)}
                  className="bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 text-xs rounded-xl pl-3 pr-8 py-2 font-bold text-slate-800 cursor-pointer outline-hidden w-full truncate transition-all shadow-3xs"
                  id="consultation-participant-select"
                >
                  {activeParticipantId !== '' && (
                    <option value={activeParticipantId}>📝 Meus Palpites ({activeParticipant?.name})</option>
                  )}
                  <option value="">🚫 Apenas tabela de jogos (sem palpites)</option>
                  {participants
                    .filter(p => p.id !== activeParticipantId)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        👁️ Palpites de {p.name} {(tourneyPhase === 'fase2' ? p.lockedFase2 : p.locked) ? '🔒' : '📝'}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Mode specific sliders/selectors */}
        {viewType === 'day' ? (
          /* Day Slider Calendar (The Scrollable chip selection system) */
          uniqueDates.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-3" id="calendar-view-panel">

              <div className="relative flex items-center group/calendar mt-1 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                {/* Left scroll assist button */}
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('dates-scroll-row')?.scrollBy({ left: -160, behavior: 'smooth' });
                  }}
                  className="absolute left-2 z-10 p-1.5 rounded-full bg-white/95 border border-slate-200 shadow-md hover:bg-white text-slate-700 hover:text-emerald-700 transition active:scale-90 cursor-pointer lg:flex hidden"
                  title="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div 
                  className="flex gap-2.5 pb-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-600/35 scrollbar-track-transparent snap-x justify-start select-none w-full px-1 lg:px-9" 
                  id="dates-scroll-row"
                >
                  {uniqueDates.map((date) => {
                    const isSelected = date === selectedDate;
                    const matchesCountOnDay = matches.filter((m) => normalizeDateStr(m.date) === date).length;
                    const weekDay = getWeekDayPt(date);

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`px-3 py-2 rounded-2xl transition-all duration-200 shrink-0 snap-center flex flex-col items-center gap-0.5 cursor-pointer min-w-[76px] shadow-3xs active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 text-white ring-2 ring-yellow-400 border border-emerald-500 shadow-md'
                            : 'bg-white hover:bg-emerald-50/50 text-slate-800 border border-slate-200 hover:border-emerald-300'
                        }`}
                        id={`date-chip-${date.replace(' ', '-')}`}
                      >
                        <span className={`text-[9px] font-black tracking-widest ${
                          isSelected ? 'text-yellow-300' : 'text-slate-400'
                        }`}>{weekDay}</span>
                        <span className="text-xs font-black tracking-tight leading-none">{date}</span>
                        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full leading-none mt-1 ${
                          isSelected ? 'bg-yellow-400 text-emerald-950 font-black' : 'bg-slate-100 text-emerald-800'
                        }`}>
                          {matchesCountOnDay} {matchesCountOnDay === 1 ? 'jogo' : 'jogos'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right scroll assist button */}
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('dates-scroll-row')?.scrollBy({ left: 160, behavior: 'smooth' });
                  }}
                  className="absolute right-2 z-10 p-1.5 rounded-full bg-white/95 border border-slate-200 shadow-md hover:bg-white text-slate-700 hover:text-emerald-700 transition active:scale-90 cursor-pointer lg:flex hidden"
                  title="Próximo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                        ? 'bg-emerald-700 text-white border-emerald-700 ring-1 ring-yellow-400 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
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
            isActiveParticipantLocked
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : unfilledMatchesCount > 0
                ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
          }`} 
          id="matches-lock-banner"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg border shrink-0 ${
              isActiveParticipantLocked
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : unfilledMatchesCount > 0
                  ? 'bg-amber-100 border-amber-300 text-amber-705'
                  : 'bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}>
              <Lock className="w-5 h-5 shrink-0 animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs uppercase tracking-wider block">
                {isActiveParticipantLocked 
                  ? '🔒 Seus Palpites Estão Consolidados' 
                  : unfilledMatchesCount > 0
                    ? `📝 Palpites em Modo Rascunho (${matches.length - unfilledMatchesCount}/${matches.length} Preenchidos)`
                    : '🎉 Pronto para Trancar Tudo!'}
              </span>
              <span className="text-xs text-slate-600 mt-1 block leading-relaxed">
                {isActiveParticipantLocked
                  ? `Seus palpites para todos os jogos da Copa estão validados e trancados definitivamente na nuvem. Boa sorte!`
                  : unfilledMatchesCount > 0
                    ? `Faltam palpites para ${unfilledMatchesCount} jogo(s) de um total de ${matches.length}. Você precisa cadastrar palpites para todos os dias e jogos para liberar a confirmação.`
                    : `Parabéns! Todos os ${matches.length} jogos foram respondidos. Você já pode oficializar e trancar seus palpites para a competição.`}
              </span>
            </div>
          </div>

          {!isActiveParticipantLocked && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0 justify-center md:justify-end">
              {dirtyMatchesInfo.length > 0 && onSaveMultipleGuesses && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBulkSave();
                  }}
                  disabled={isBulkSaving}
                  className="w-full sm:w-auto py-2.5 px-5 font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white border border-amber-600"
                  id="matches-banner-bulk-save-btn"
                >
                  <Save className="w-4 h-4 shrink-0" />
                  <span>{isBulkSaving ? 'Gravando...' : `Salvar ${dirtyMatchesInfo.length} Palpites`}</span>
                </button>
              )}

              {onLockGuesses && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLockGuesses();
                  }}
                  disabled={unfilledMatchesCount > 0 || dirtyMatchesInfo.length > 0}
                  className={`w-full sm:w-auto py-2.5 px-5 font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                    (unfilledMatchesCount > 0 || dirtyMatchesInfo.length > 0)
                      ? 'bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white'
                  }`}
                  title={dirtyMatchesInfo.length > 0 ? 'Grave as alterações pendentes primeiro para poder trancar' : ''}
                  id="matches-banner-lock-btn"
                >
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {dirtyMatchesInfo.length > 0
                      ? 'Grave alterações para liberar'
                      : unfilledMatchesCount > 0
                        ? 'Grave todos para liberar'
                        : 'Confirmar / Trancar'}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Visitor Banner if not logged in / no active profile selected */}
      {!activeParticipant && !isAdminMode && (
        <div 
          className="p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 border-slate-200 text-slate-800 shadow-3xs mb-4"
          id="matches-visitor-banner"
        >
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 rounded-lg border bg-slate-100 border-slate-200 text-slate-500 shrink-0">
              <span className="text-slate-505 font-bold uppercase tracking-wider">⚽</span>
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs uppercase tracking-wider block text-slate-700">
                👁️ Modo de Consulta (Sem Login)
              </span>
              <span className="text-xs text-slate-500 block leading-relaxed">
                Você está visualizando a tabela e palpites de forma anônima. Para fazer suas próprias apostas e preencher palpites, siga para a aba **"Perfil"** para cadastrar ou acessar um perfil do Bolão!
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const tabBtn = document.getElementById('tab-btn-perfil') || document.getElementById('mobile-tab-perfil');
              if (tabBtn) {
                tabBtn.click();
              } else {
                const card = document.getElementById('login-card') || document.getElementById('sidebar-left');
                if (card) card.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full md:w-auto py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md active:scale-95"
          >
            Apostar / Criar Meu Perfil
          </button>
        </div>
      )}

      {/* Top Banner Alert for Bulk Saving */}
      {dirtyMatchesInfo.length > 0 && onSaveMultipleGuesses && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200" id="matches-bulk-save-banner">
          <div className="flex items-start gap-2.5 text-left">
            <div className="p-2 rounded-lg bg-amber-100 border border-amber-200 text-amber-800 shrink-0">
              <Save className="w-5 h-5 shrink-0" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-amber-950 uppercase tracking-wider leading-none">
                Palpites Alterados Pendentes!
              </p>
              <p className="text-xs text-amber-800 leading-normal font-medium">
                Você editou <strong>{dirtyMatchesInfo.length}</strong> palpite(s). Lembre-se de gravar para sincronizá-los na nuvem.
              </p>
            </div>
          </div>
          <button
            onClick={handleBulkSave}
            disabled={isBulkSaving}
            className="w-full sm:w-auto py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 shrink-0 select-none"
            id="matches-bulk-save-banner-btn"
          >
            {isBulkSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white animate-fade-in" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Gravando...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 shrink-0 text-white" />
                <span>Salvar {dirtyMatchesInfo.length} Palpites</span>
              </>
            )}
          </button>
        </div>
      )}

      {filteredMatches.length > 0 ? (
        filteredMatches.map((m) => {
          // Find current participant's guess
          const myGuess = guesses.find((g) => g.participantId === consultedParticipantId && g.matchId === m.id);
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

          // Allow submitting guesses even for already played or live games to let user consolidate results,
          // but lock if the profile is locked, we're not consulting ourselves, or the match has expired for guesses (12h limit)
          const isMatchExpired = isMatchExpiredForGuesses(m.date, m.id);
          const isMatchLocked = !isConsultingSelf || (!!isActiveParticipantLocked && !isAdminMode) || (!isAdminMode && isMatchExpired);

          // Calculate points for active participant if match score exists
          const scoreResult = calculateGuessPoints(
            myGuess?.homeScoreGuess,
            myGuess?.awayScoreGuess,
            m.homeScore,
            m.awayScore,
            myGuess?.penaltyWinnerGuess,
            m.penaltyWinner
          );

          return (
            <div
              key={m.id}
              className={`bg-white border overflow-hidden rounded-2xl shadow-sm transition-all ${
                isLive
                  ? 'border-rose-300 bg-linear-to-b from-rose-50/20 to-white shadow-md shadow-rose-100/30'
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
                    <span className="text-slate-600 font-bold tracking-tight animate-fade-in text-[11px] sm:text-xs flex items-center gap-1" id={`date-${m.id}`}>
                      {m.date}
                      {isMatchExpired && !isAdminMode && (
                        <span className="bg-amber-150 text-amber-900 border border-amber-250 text-[9px] px-1.5 py-0.5 rounded-sm font-black flex items-center gap-0.5" title="Palpites trancados (menos de 12h do horário do jogo)">
                          <Lock className="w-2.5 h-2.5 text-amber-700" />
                          Trancado (12h)
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>

               {/* Teams, Inputs, and Scores Display Symmetrical Layout */}
               <div className="p-4 sm:p-5" id={`match-${m.id}-dashboard`}>
                <div className="flex items-center justify-between gap-1.5 sm:gap-4 w-full">
                  
                  {/* Home Team (Left Side) */}
                  <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3 text-right min-w-0">
                    <span className="font-extrabold text-[13px] xs:text-sm sm:text-sm md:text-base text-slate-900 tracking-tight text-right truncate min-w-0 select-none leading-none">
                      {m.homeTeam}
                    </span>
                    {m.homeFlag && m.homeFlag.startsWith('http') ? (
                      <img 
                        src={m.homeFlag} 
                        className="w-8 h-5.5 sm:w-12 sm:h-8.5 object-cover rounded-md shrink-0 filter drop-shadow-xs animate-fade-in" 
                        alt={m.homeTeam} 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <span className="text-3xl xs:text-4xl sm:text-5xl filter drop-shadow-xs select-none shrink-0 leading-none" role="img" aria-label={m.homeTeam}>
                        {m.homeFlag}
                      </span>
                    )}
                  </div>

                  {/* Score / Selector Center Column */}
                  <div className="flex-shrink-0 flex justify-center items-center px-1 sm:px-2 min-w-[80px] xs:min-w-[90px] sm:min-w-[120px]">
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
                            className="w-10 text-center font-mono font-black text-sm text-slate-900 bg-white border border-slate-200 rounded-md py-0.5"
                          />
                          <span className="text-amber-500 font-bold select-none">:</span>
                          {/* AWAY ADMIN BOX */}
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={currentAdminAwayScore !== null && currentAdminAwayScore !== undefined ? currentAdminAwayScore : ''}
                            onChange={(e) => handleAdminScoreChange(m.id, 'away', e.target.value)}
                            className="w-10 text-center font-mono font-black text-sm text-slate-900 bg-white border border-slate-200 rounded-md py-0.5"
                          />
                        </div>
                      </div>
                    ) : (
                      /* OFFICIAL GAME SCOREBOARD */
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-black text-slate-500/90 tracking-wider uppercase select-none whitespace-nowrap animate-fade-in">
                          {isLive ? 'Placar Parcial' : isFinished ? '✅ Placar Final' : 'Placar Oficial'}
                        </span>
                        {isScheduled ? (
                          <div className="text-slate-500 font-black text-xs sm:text-sm bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl select-none">
                            VS
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className={`flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-slate-200/95 shadow-3xs font-mono font-black text-sm xs:text-base sm:text-lg md:text-xl text-slate-900 select-none rounded-xl ${
                              isLive ? 'bg-rose-50 border-rose-350 text-rose-700 animate-pulse' : ''
                            }`}>
                              <span>{m.homeScore !== null ? m.homeScore : '-'}</span>
                              <span className="text-slate-400 font-normal">:</span>
                              <span>{m.awayScore !== null ? m.awayScore : '-'}</span>
                            </div>

                            {m.homeScore !== null && m.awayScore !== null && m.homeScore === m.awayScore && m.penaltyWinner && (
                              <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-md text-center mt-1.5 select-none whitespace-nowrap animate-fade-in shadow-3xs">
                                🏆 Pênaltis: {m.penaltyWinner === 'home' ? m.homeTeam : m.awayTeam}
                              </span>
                            )}
                          </div>
                        )}

                      </div>
                    )}
                  </div>

                  {/* Away Team (Right Side) */}
                  <div className="flex-1 flex items-center justify-start gap-1.5 sm:gap-3 text-left min-w-0">
                    {m.awayFlag && m.awayFlag.startsWith('http') ? (
                      <img 
                        src={m.awayFlag} 
                        className="w-8 h-5.5 sm:w-12 sm:h-8.5 object-cover rounded-md shrink-0 filter drop-shadow-xs animate-fade-in" 
                        alt={m.awayTeam} 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <span className="text-3xl xs:text-4xl sm:text-5xl filter drop-shadow-xs select-none shrink-0 leading-none" role="img" aria-label={m.awayTeam}>
                        {m.awayFlag}
                      </span>
                    )}
                    <span className="font-extrabold text-[13px] xs:text-sm sm:text-sm md:text-base text-slate-900 tracking-tight text-left truncate min-w-0 select-none leading-none">
                      {m.awayTeam}
                    </span>
                  </div>

                </div>

                {/* DEDICATED PALPITES (GUESSES) CONTAINER PANEL */}
                {consultedParticipant && !isAdminMode && (
                  <div className={`mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 p-2.5 rounded-xl border ${
                    isAdminMode 
                      ? 'bg-amber-50/30 border-amber-200/50' 
                      : isConsultingSelf
                        ? 'bg-slate-50/50 border-slate-200/40'
                        : 'bg-indigo-50/40 border-indigo-200/40'
                  }`}>
                    
                    {/* Left label part */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`p-1 rounded-lg border ${
                        isAdminMode 
                          ? 'bg-amber-100/50 text-amber-800 border-amber-300' 
                          : isConsultingSelf
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      }`}>
                        {isConsultingSelf ? (
                          <Sparkles className={`w-4 h-4 shrink-0 ${isAdminMode ? 'text-amber-600' : 'text-emerald-600'}`} />
                        ) : (
                          <Users className="w-4 h-4 shrink-0 text-indigo-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] uppercase font-black tracking-wider block text-slate-400 select-none">
                          {isAdminMode 
                            ? '🛠️ AJUSTE ADMINISTRATIVO DE PALPITE' 
                            : isConsultingSelf
                              ? 'Meu Palpite Pessoal'
                              : 'Consultando Palpite de'}
                        </span>
                        <span className="text-slate-755 font-black text-[11px] sm:text-xs flex items-center gap-1.5 flex-wrap">
                          {consultedParticipant.imageUrl ? (
                            <img 
                              src={consultedParticipant.imageUrl} 
                              alt={consultedParticipant.name} 
                              referrerPolicy="no-referrer"
                              className="w-4 h-4 rounded-full object-cover border border-slate-200 inline" 
                            />
                          ) : (
                            <span>{consultedParticipant.avatar}</span>
                          )}
                          <span>{consultedParticipant.name}</span>
                          {isConsultedParticipantLocked && <span>🔒</span>}
                        </span>
                      </div>
                    </div>

                    {/* Middle / Right control part */}
                    {isMatchLocked ? (
                      /* Display Locked prediction results */
                      <div className="flex items-center gap-2">
                        {hasGuessed ? (
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-md shadow-3xs select-none ${
                              isConsultingSelf 
                                ? 'text-slate-800 bg-white border border-slate-200' 
                                : 'text-indigo-950 bg-white border border-indigo-200'
                            }`}>
                              Palpite de {consultedParticipant.name}: {myGuess.homeScoreGuess} x {myGuess.awayScoreGuess}
                              {myGuess.homeScoreGuess === myGuess.awayScoreGuess && myGuess.penaltyWinnerGuess && (
                                <span className="text-amber-700 font-bold ml-1">
                                  (Pênaltis: {myGuess.penaltyWinnerGuess === 'home' ? m.homeTeam : m.awayTeam})
                                </span>
                              )}
                            </span>
                            
                            {m.homeScore !== null && m.awayScore !== null && (
                              <div className="inline-flex">
                                {scoreResult.points === 5 ? (
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-md select-none shadow-3xs">
                                    🥇 +5 pts (Exato!)
                                  </span>
                                ) : scoreResult.points > 0 ? (
                                  <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-black px-2 py-0.5 rounded-md select-none shadow-3xs">
                                    🥈 +{scoreResult.points} {scoreResult.points === 1 ? 'pt' : 'pts'} (Parcial)
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-400 border border-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-md select-none shadow-3xs">
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
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto" id={`edit-guess-panel-${m.id}`}>
                        {m.homeScore !== null && m.awayScore !== null && hasGuessed && (
                          <div className="inline-flex shrink-0">
                            {scoreResult.points === 5 ? (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-lg select-none shadow-3xs flex items-center gap-1">
                                🥇 +5 pts (Exato!)
                              </span>
                            ) : scoreResult.points > 0 ? (
                              <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black px-2.5 py-1 rounded-lg select-none shadow-3xs flex items-center gap-1">
                                🥈 +{scoreResult.points} {scoreResult.points === 1 ? 'pt' : 'pts'} (Parcial)
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 border border-slate-250 text-[10px] font-bold px-2.5 py-1 rounded-lg select-none shadow-3xs flex items-center gap-1">
                                0 pts
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 p-2 rounded-2xl shadow-xs transition-all select-none justify-center">
                            {/* HOME GOAL SLIDERS */}
                            <div className="flex items-center gap-1">
                              <button 
                                type="button"
                                onClick={() => adjustLocalGuess(m.id, 'home', -1)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl font-black text-sm select-none cursor-pointer transition active:scale-90"
                              >
                                -
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="-"
                                value={localHomeGuesses[m.id] ?? ''}
                                onChange={(e) => handleInputChange(m.id, 'home', e.target.value)}
                                className="w-9 text-center font-mono font-black text-sm text-slate-900 bg-transparent outline-none focus:outline-none placeholder-slate-300"
                              />
                              <button 
                                type="button"
                                onClick={() => adjustLocalGuess(m.id, 'home', 1)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl font-black text-sm select-none cursor-pointer transition active:scale-90"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-slate-400 font-black text-xs px-1 select-none text-center">x</span>

                            {/* AWAY GOAL SLIDERS */}
                            <div className="flex items-center gap-1">
                              <button 
                                type="button"
                                onClick={() => adjustLocalGuess(m.id, 'away', -1)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl font-black text-sm select-none cursor-pointer transition active:scale-90"
                              >
                                -
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="-"
                                value={localAwayGuesses[m.id] ?? ''}
                                onChange={(e) => handleInputChange(m.id, 'away', e.target.value)}
                                className="w-9 text-center font-mono font-black text-sm text-slate-900 bg-transparent outline-none focus:outline-none placeholder-slate-300"
                              />
                              <button 
                                type="button"
                                onClick={() => adjustLocalGuess(m.id, 'away', 1)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl font-black text-sm select-none cursor-pointer transition active:scale-90"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* USER PENALTY WINNER PICKER */}
                          {(() => {
                            const valHome = localHomeGuesses[m.id] ?? '';
                            const valAway = localAwayGuesses[m.id] ?? '';
                            if (valHome !== '' && valAway !== '' && valHome === valAway) {
                              const currentSelected = myGuess?.penaltyWinnerGuess;
                              return (
                                <div className="bg-amber-50/75 border border-amber-250 p-2 rounded-xl text-center flex flex-col items-center gap-1.5 animate-in fade-in duration-200 shadow-2xs" id={`penalty-guess-${m.id}`}>
                                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                                    🏆 Empate! Quem vence nos pênaltis?
                                  </span>
                                  <div className="flex items-center gap-1.5 justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSaveGuess(m.id, parseInt(valHome, 10), parseInt(valAway, 10), 'home');
                                      }}
                                      className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-tight rounded-lg border cursor-pointer transition-all duration-200 ${
                                        currentSelected === 'home'
                                          ? 'bg-amber-500 border-amber-600 text-white shadow-xs font-black scale-105'
                                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      {m.homeTeam}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSaveGuess(m.id, parseInt(valHome, 10), parseInt(valAway, 10), 'away');
                                      }}
                                      className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-tight rounded-lg border cursor-pointer transition-all duration-200 ${
                                        currentSelected === 'away'
                                          ? 'bg-amber-500 border-amber-600 text-white shadow-xs font-black scale-105'
                                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      {m.awayTeam}
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        {/* HIGH-QUALITY MANUAL SAVE BUTTON */}
                        {(() => {
                          const valHome = localHomeGuesses[m.id] ?? '';
                          const valAway = localAwayGuesses[m.id] ?? '';
                          const isMarked = valHome !== '' && valAway !== '';
                          
                          const savedGuess = guesses.find((g) => g.participantId === activeParticipantId && g.matchId === m.id);
                          const isDirty = !savedGuess || String(savedGuess.homeScoreGuess) !== valHome || String(savedGuess.awayScoreGuess) !== valAway;

                          const isSavedJustNow = !!justSavedIds[m.id];

                          if (isSavedJustNow) {
                            return (
                              <button
                                type="button"
                                disabled
                                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center gap-1.5 shadow-xs animate-pulse select-none"
                              >
                                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 animate-bounce" />
                                <span>Salvo!</span>
                              </button>
                            );
                          }

                          if (!isMarked) {
                            return (
                              <button
                                type="button"
                                disabled
                                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                                title="Preencha o placar acima para liberar a gravação do palpite"
                              >
                                <Lock className="w-3.5 h-3.5 shrink-0 text-slate-350" />
                                <span>Marcar Placar</span>
                              </button>
                            );
                          }

                          if (!isDirty && savedGuess) {
                            return (
                              <button
                                type="button"
                                disabled
                                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center gap-1.5 select-none cursor-default"
                              >
                                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                                <span>Palpite Salvo</span>
                              </button>
                            );
                          }

                          // Unsaved modifications exist
                          return (
                            <button
                              type="button"
                              onClick={() => handleSaveGuessClick(m.id)}
                              className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white ring-2 ring-yellow-400 border border-emerald-500 hover:border-emerald-400 shadow-md flex items-center justify-center gap-1.5 transform active:scale-95 transition-all duration-200 cursor-pointer"
                              id={`save-guess-btn-${m.id}`}
                            >
                              <Save className="w-4 h-4 shrink-0 text-yellow-400" />
                              <span>Gravar Palpite</span>
                            </button>
                          );
                        })()}
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* ADMIN MODE OVERRIDES ROW FOR SCORE SAVE */}
              {isAdminMode && (
                <div className="bg-amber-50/25 px-5 py-3 border-t border-amber-150 flex flex-col xs:flex-row justify-between items-center gap-2">
                  <span className="text-[10px] text-amber-900 font-black tracking-widest uppercase flex items-center gap-1 select-none">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                    <span>Controlador de Partida</span>
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-amber-100/80 border border-amber-300 rounded-lg px-2 py-1">
                      <span className="text-[9px] font-black uppercase text-amber-800 mr-1 select-none font-mono">Status:</span>
                      <select
                        value={selectedStatus}
                        onChange={(e) => handleAdminStatusChange(m.id, e.target.value as 'SCHEDULED' | 'LIVE' | 'FINISHED')}
                        className="bg-transparent text-amber-950 font-mono font-extrabold text-[10px] uppercase select-none tracking-wide cursor-pointer outline-none border-none py-0 px-1 focus:ring-0"
                      >
                        <option value="SCHEDULED">🔮 Agendado</option>
                        <option value="LIVE">🔴 Ao Vivo</option>
                        <option value="FINISHED">🏁 Finalizado</option>
                      </select>
                    </div>

                    {selectedStatus === 'LIVE' && (
                      <div className="flex items-center gap-1 bg-amber-100/80 border border-amber-300 rounded-lg px-2 py-1 animate-fade-in">
                        <span className="text-[9px] font-black uppercase text-amber-800 mr-1 select-none font-mono">Minuto:</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={adminScores[m.id]?.minute !== undefined ? adminScores[m.id]?.minute : m.minute}
                          onChange={(e) => handleAdminMinuteChange(m.id, e.target.value)}
                          className="w-10 text-center font-mono font-black text-xs text-amber-950 bg-white border border-amber-350 rounded-md py-0.5 outline-hidden"
                        />
                        <span className="text-[9px] font-extrabold text-amber-800 font-mono select-none">'</span>
                      </div>
                    )}

                    {(() => {
                      const finalHome = currentAdminHomeScore !== null && currentAdminHomeScore !== undefined && String(currentAdminHomeScore).trim() !== '' ? Number(currentAdminHomeScore) : null;
                      const finalAway = currentAdminAwayScore !== null && currentAdminAwayScore !== undefined && String(currentAdminAwayScore).trim() !== '' ? Number(currentAdminAwayScore) : null;
                      
                      if (selectedStatus === 'FINISHED' && finalHome !== null && finalAway !== null && finalHome === finalAway) {
                        return (
                          <div className="flex items-center gap-1 bg-amber-105 border border-amber-350 rounded-lg px-2 py-1 animate-fade-in">
                            <span className="text-[9px] font-black uppercase text-amber-900 mr-1 select-none font-mono">Pênaltis:</span>
                            <select
                              value={adminScores[m.id]?.penaltyWinner || m.penaltyWinner || ''}
                              onChange={(e) => {
                                const val = e.target.value as 'home' | 'away' | '';
                                setAdminScores((prev) => ({
                                  ...prev,
                                  [m.id]: {
                                    ...(prev[m.id] || { home: finalHome, away: finalAway, status: selectedStatus }),
                                    penaltyWinner: val === '' ? null : val,
                                  }
                                }));
                              }}
                              className="bg-transparent text-amber-950 font-mono font-extrabold text-[10px] uppercase select-none tracking-wide cursor-pointer outline-none border-none py-0 px-1 focus:ring-0"
                            >
                              <option value="">🔮 Escolher Vencedor</option>
                              <option value="home">🏠 {m.homeTeam}</option>
                              <option value="away">✈️ {m.awayTeam}</option>
                            </select>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <button
                      onClick={() => {
                        const finalHome = currentAdminHomeScore !== null && currentAdminHomeScore !== undefined && String(currentAdminHomeScore).trim() !== '' ? Number(currentAdminHomeScore) : null;
                        const finalAway = currentAdminAwayScore !== null && currentAdminAwayScore !== undefined && String(currentAdminAwayScore).trim() !== '' ? Number(currentAdminAwayScore) : null;
                        
                        const finalMinute = selectedStatus === 'LIVE' 
                          ? (adminScores[m.id]?.minute !== undefined ? adminScores[m.id]?.minute : m.minute)
                          : (selectedStatus === 'FINISHED' ? 90 : 0);

                        const finalPenaltyWinner = adminScores[m.id]?.penaltyWinner !== undefined 
                          ? adminScores[m.id]?.penaltyWinner 
                          : m.penaltyWinner;

                        onUpdateActualScore(
                          m.id,
                          finalHome,
                          finalAway,
                          selectedStatus,
                          finalMinute,
                          finalPenaltyWinner || null
                        );

                        // Trigger visual success confirmation feedback
                        setAdminSavedIds((prev) => ({ ...prev, [m.id]: true }));
                        setTimeout(() => {
                          setAdminSavedIds((prev) => ({ ...prev, [m.id]: false }));
                          // Clear the adminScores local override for that match, so it falls back to the database-synced state
                          setAdminScores((prevAdminScores) => {
                            const updated = { ...prevAdminScores };
                            delete updated[m.id];
                            return updated;
                          });
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
                              : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {player.imageUrl ? (
                              <img 
                                src={player.imageUrl} 
                                alt={player.name} 
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0" 
                              />
                            ) : (
                              <span className="text-sm">{player.avatar}</span>
                            )}
                            <span className="truncate max-w-[100px] font-bold">
                              {player.name} {isSelf && '(Você)'}
                            </span>
                          </div>
                          <div>
                             {otherGuess ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                  {otherGuess.homeScoreGuess}x{otherGuess.awayScoreGuess}
                                  {otherGuess.homeScoreGuess === otherGuess.awayScoreGuess && otherGuess.penaltyWinnerGuess && (
                                    <span className="text-[10px] text-amber-700 font-extrabold ml-1">
                                      (P: {otherGuess.penaltyWinnerGuess === 'home' ? 'Casa' : 'Fora'})
                                    </span>
                                  )}
                                </span>
                                {otherPoints !== null && (
                                  <span
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm border ${
                                      otherPoints.points === 5
                                        ? 'text-emerald-700 bg-emerald-100 border-emerald-200'
                                        : otherPoints.points > 0
                                        ? 'text-blue-700 bg-blue-50 border-blue-200'
                                        : 'text-slate-500 bg-slate-100 border-slate-200'
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

      {/* Floating Save All Guesses bar */}
      {dirtyMatchesInfo.length > 0 && onSaveMultipleGuesses && (
        <div className="fixed bottom-[74px] lg:bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md bg-slate-900 border border-slate-700/60 shadow-2xl rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 animate-slide-up-custom" id="matches-floating-bulk-save">
          <div className="text-left">
            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 block select-none">
              Palpites Pendentes
            </span>
            <span className="text-white text-xs font-bold leading-tight block">
              {dirtyMatchesInfo.length} palpite(s) não gravado(s)
            </span>
          </div>
          <button
            onClick={handleBulkSave}
            disabled={isBulkSaving}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 select-none shrink-0"
            id="matches-floating-bulk-save-btn"
          >
            {isBulkSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Gravando...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 shrink-0" />
                <span>Gravar Todos</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
