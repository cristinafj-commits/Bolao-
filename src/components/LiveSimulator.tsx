import React, { useState, useEffect, useRef } from 'react';
import { Match, SimulationEvent, Participant, Guess } from '../types';
import { Play, Pause, RefreshCw, Radio, Flame, Sparkles, Volume2, Award, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveSimulatorProps {
  matches: Match[];
  participants: Participant[];
  guesses: Guess[];
  onSimulationUpdate: (simulatedMatches: Match[]) => void;
  onSimulationScoresFinished: (simulatedMatches: Match[]) => void;
  onResetMatches: () => void;
}

const NARRATIONS_HOME = [
  "golaço absurdo de fora da área no ângulo!",
  "marca de cabeça após espetacular cobrança de escanteio!",
  "completou para o fundo da rede após rebote do goleiro!",
  "converte pênalti com extrema categoria deslocando o arqueiro!",
  "arrancou do meio-campo e finalizou com um toque sutil por cobertura!"
];

const NARRATIONS_AWAY = [
  "desvia levemente e mata o goleiro após cruzamento rasteiro!",
  "aproveita a falha terrível da defesa e empurra para o barbante!",
  "marca um lindo gol de falta por cima da barreira!",
  "chuta firme de primeira após passe açucarado!",
  "bate cruzado rasteiro sem chances de defesa para o goleiro!"
];

const NARRATIONS_CLOSE = [
  "quase marca! A bola carimba a trave travando a respiração da torcida!",
  "soltou uma bomba e o goleiro operou um milagre incrível salvando de ponta de dedo!",
  "chuta cruzado para fora tirando tinta da trave esquerda!",
  "recebe livre na pequena área mas finaliza desequilibrado por cima do travessão!"
];

export default function LiveSimulator({
  matches,
  participants,
  guesses,
  onSimulationUpdate,
  onSimulationScoresFinished,
  onResetMatches,
}: LiveSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [simMatches, setSimMatches] = useState<Match[]>([]);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [latestGoal, setLatestGoal] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or synchronize local simulation matches when simulated list is empty or reset
  useEffect(() => {
    // If we have matches from props and nothing is running, copy them
    if (!isSimulating && currentMinute === 0) {
      setSimMatches(JSON.parse(JSON.stringify(matches)));
    }
  }, [matches, isSimulating, currentMinute]);

  // Handle Simulation Start / Stop loop
  useEffect(() => {
    if (isSimulating) {
      // 1 simulated minute every 200ms => 90 seconds total for a whole match
      timerRef.current = setInterval(() => {
        setCurrentMinute((prevMin) => {
          const nextMin = prevMin + 1;
          
          if (nextMin > 90) {
            handleSimulationEnd();
            return 90;
          }

          // Generate events for matches
          tickMatchSimulation(nextMin);
          return nextMin;
        });
      }, 300);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, simMatches]);

  const handleStartSimulation = () => {
    // Reset matches to LIVE state if we are starting a fresh simulation
    let preparedMatches = [];
    if (currentMinute === 0 || currentMinute === 90) {
      preparedMatches = matches.map((m) => ({
        ...m,
        homeScore: 0,
        awayScore: 0,
        status: 'LIVE' as const,
        minute: 1,
      }));
      setSimMatches(preparedMatches);
      setEvents([{
        matchId: 'all',
        time: 1,
        message: '🏆 Árbitro apita o início de todas as partidas da rodada!',
        team: 'home',
        type: 'START'
      }]);
      setCurrentMinute(1);
      onSimulationUpdate(preparedMatches);
    } else {
      preparedMatches = [...simMatches];
    }
    
    setIsSimulating(true);
  };

  const handlePauseSimulation = () => {
    setIsSimulating(false);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setCurrentMinute(0);
    setEvents([]);
    setLatestGoal(null);
    onResetMatches();
  };

  const handleSimulationEnd = () => {
    setIsSimulating(false);
    // Set all matches to finished
    const finishedMatches = simMatches.map((m) => ({
      ...m,
      status: 'FINISHED' as const,
      minute: 90,
    }));
    setSimMatches(finishedMatches);
    
    // Add wrap up event
    const endEvent: SimulationEvent = {
      matchId: 'all',
      time: 90,
      message: '🏁 FIM DE JOGO! Rodada concluída com sucesso! Os placares reais finais foram consolidados.',
      team: 'home',
      type: 'END'
    };
    setEvents((prev) => [endEvent, ...prev]);
    onSimulationScoresFinished(finishedMatches);
  };

  const tickMatchSimulation = (minute: number) => {
    let updatedNeeded = false;
    
    const updatedMatches = simMatches.map((m) => {
      if (m.status !== 'LIVE') return m;

      // Update match's current minute
      const updatedMatch = { ...m, minute };

      // Probability check for event (e.g. 1.2% chance of goal every minute for either team)
      const rand = Math.random();
      
      if (rand < 0.012) {
        // Home goal
        const currentScore = updatedMatch.homeScore ?? 0;
        updatedMatch.homeScore = currentScore + 1;
        updatedNeeded = true;

        const narration = NARRATIONS_HOME[Math.floor(Math.random() * NARRATIONS_HOME.length)];
        const newGoalEvent: SimulationEvent = {
          matchId: m.id,
          time: minute,
          message: `⚽ GOOOL do ${m.homeTeam}! (${m.homeScore}x${m.awayScore ?? 0}) - ${m.homeTeam} ${narration}`,
          team: 'home',
          type: 'GOAL'
        };

        setEvents((prev) => [newGoalEvent, ...prev]);
        setLatestGoal(`GOL! ${m.homeTeam} ${m.homeScore} x ${m.awayScore ?? 0} ${m.awayTeam}`);
        setTimeout(() => setLatestGoal(null), 3500);

      } else if (rand > 0.988) {
        // Away goal
        const currentScore = updatedMatch.awayScore ?? 0;
        updatedMatch.awayScore = currentScore + 1;
        updatedNeeded = true;

        const narration = NARRATIONS_AWAY[Math.floor(Math.random() * NARRATIONS_AWAY.length)];
        const newGoalEvent: SimulationEvent = {
          matchId: m.id,
          time: minute,
          message: `⚽ GOOOL da ${m.awayTeam}! (${m.homeScore ?? 0}x${updatedMatch.awayScore}) - ${m.awayTeam} ${narration}`,
          team: 'away',
          type: 'GOAL'
        };

        setEvents((prev) => [newGoalEvent, ...prev]);
        setLatestGoal(`GOL! ${m.homeTeam} ${m.homeScore ?? 0} x ${updatedMatch.awayScore} ${m.awayTeam}`);
        setTimeout(() => setLatestGoal(null), 3500);

      } else if (rand > 0.49 && rand < 0.505) {
        // Close Call Near-Goal
        const narration = NARRATIONS_CLOSE[Math.floor(Math.random() * NARRATIONS_CLOSE.length)];
        const closeEvent: SimulationEvent = {
          matchId: m.id,
          time: minute,
          message: `🔥 Lance Perigoso (${m.homeTeam} vs ${m.awayTeam}): ${narration}`,
          team: 'home',
          type: 'CLOSE_CALL'
        };
        setEvents((prev) => [closeEvent, ...prev]);
      }

      return updatedMatch;
    });

    if (minute === 45) {
      const halfTimeEvent: SimulationEvent = {
        matchId: 'all',
        time: 45,
        message: '⏸️ Fim do Primeiro Tempo! Árbitro apita para o intervalo das partidas.',
        team: 'home',
        type: 'HALF_TIME'
      };
      setEvents((prev) => [halfTimeEvent, ...prev]);
    }

    setSimMatches(updatedMatches);
    onSimulationUpdate(updatedMatches);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="simulator-cockpit">
      {/* Header with Live Signal */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-tight flex items-center gap-1.5 text-base">
              Simulador da Copa em Tempo Real
              {isSimulating && (
                <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-xs font-bold animate-pulse tracking-wide uppercase">
                  No Ar
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Assista ao vivo aos gols saindo e os pontos recalculando</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isSimulating ? (
            <button
              onClick={handlePauseSimulation}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transitional"
              id="pause-sim-btn"
            >
              <Pause className="w-4 h-4" /> Pausar Ticker
            </button>
          ) : (
            <button
              onClick={handleStartSimulation}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/10 cursor-pointer transition-all"
              id="start-sim-btn"
            >
              <Play className="w-4 h-4 fill-white" />
              {currentMinute === 0 || currentMinute === 90 ? 'Iniciar Simulação!' : 'Retomar Simulação'}
            </button>
          )}

          {(currentMinute > 0) && (
            <button
              onClick={handleResetSimulation}
              className="p-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition"
              id="reset-sim-btn"
              title="Resetar jogos e palpites"
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress timeline */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Cronômetro Virtual</span>
          <span className="font-mono text-white text-sm font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            {currentMinute}' min
          </span>
        </div>
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
            style={{ width: `${(currentMinute / 90) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Início (1')</span>
          <span>Intervalo (45')</span>
          <span>Fim de Jogo (90')</span>
        </div>
      </div>

      {/* Goal Overlay alert popup */}
      <AnimatePresence>
        {latestGoal && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-emerald-950 border-2 border-emerald-500/40 p-4 rounded-xl flex items-center justify-between text-white shadow-xl shadow-emerald-950/20"
            id="latest-goal-banner"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-spin shadow-inner">⚽</span>
              <div>
                <h4 className="font-bold text-sm tracking-tight text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  GOOOOOOOOL DA COPA!
                </h4>
                <p className="font-mono text-xs font-bold text-slate-100 mt-0.5">{latestGoal}</p>
              </div>
            </div>
            <div className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-1 rounded-sm animate-pulse">
              Placar Atualizado!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Simulation matches summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {simMatches.map((m) => (
          <div key={m.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-center space-y-2">
            <span className="text-[9px] text-slate-500 font-semibold uppercase block">{m.group.split(' ')[0]}</span>
            <div className="flex items-center justify-center gap-1.5 py-0.5">
              <span className="text-sm font-semibold text-white">{m.homeTeam}</span>
              <span className="text-base">{m.homeFlag}</span>
              <span className="font-mono font-bold bg-slate-900 border border-slate-800 text-xs px-2 py-0.5 rounded-sm text-emerald-400">
                {m.homeScore !== null ? m.homeScore : '-'}
              </span>
              <span className="text-xs text-slate-600">:</span>
              <span className="font-mono font-bold bg-slate-900 border border-slate-800 text-xs px-2 py-0.5 rounded-sm text-emerald-400">
                {m.awayScore !== null ? m.awayScore : '-'}
              </span>
              <span className="text-base">{m.awayFlag}</span>
              <span className="text-sm font-semibold text-white">{m.awayTeam}</span>
            </div>
            {m.status === 'LIVE' ? (
              <span className="text-[9px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-sm animate-pulse">
                AO VIVO ({m.minute}')
              </span>
            ) : m.status === 'FINISHED' ? (
              <span className="text-[9px] text-slate-400 bg-slate-800 px-2 rounded-sm font-semibold">
                ENCERRADO
              </span>
            ) : (
              <span className="text-[9px] text-slate-400">AGUARDANDO</span>
            )}
          </div>
        ))}
      </div>

      {/* Event narration timeline */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Transmissão em Tempo Real (Eventos)
        </h4>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-52 overflow-y-auto space-y-3 font-mono text-xs text-slate-350">
          {events.length === 0 ? (
            <div className="text-center text-slate-500 py-12 italic">
              Clique em "Iniciar Simulação" para começar a receber as transmissões ao vivo.
            </div>
          ) : (
            events.map((e, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-120 ${
                  e.type === 'GOAL'
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-350 font-semibold'
                    : e.type === 'START' || e.type === 'END'
                    ? 'bg-blue-950/20 border-blue-500/20 text-blue-300 font-bold'
                    : 'bg-slate-900/40 border-slate-850 text-slate-400'
                }`}
              >
                <span className="bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-800 font-mono font-bold shrink-0 text-[10px] text-slate-300">
                  {e.time}'
                </span>
                <p className="leading-relaxed">{e.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
