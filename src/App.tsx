import React, { useState, useEffect } from 'react';
import { Match, Participant, Guess } from './types';
import { initialMatches, initialParticipants, initialGuesses, calculateLeaderboard } from './utils';
import ParticipantSelector from './components/ParticipantSelector';
import Leaderboard from './components/Leaderboard';
import MatchesList from './components/MatchesList';
import LiveSimulator from './components/LiveSimulator';
import RulesModal from './components/RulesModal';
import GoogleLoginCard from './components/GoogleLoginCard';
import DataBackupCard from './components/DataBackupCard';
import { Trophy, HelpCircle, Shield, ShieldAlert, Sparkles, Check, Database, RefreshCw, Star, Calendar, Users, Zap, Cloud, CloudOff, CloudLightning } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, setDoc, onSnapshot, collection } from './firebase';

export default function App() {
  // Load initial states from localStorage if available, or fallbacks
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('bolao_participants');
    return saved ? JSON.parse(saved) : initialParticipants;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('bolao_matches');
    return saved ? JSON.parse(saved) : initialMatches;
  });

  const [guesses, setGuesses] = useState<Guess[]>(() => {
    const saved = localStorage.getItem('bolao_guesses');
    return saved ? JSON.parse(saved) : initialGuesses;
  });

  const [activeParticipantId, setActiveParticipantId] = useState<string>(() => {
    const saved = localStorage.getItem('bolao_active_id');
    return saved ? JSON.parse(saved) : 'p2'; // Default to Ana Silva
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'jogos' | 'simulador'>('jogos');
  const [mobileActiveTab, setMobileActiveTab] = useState<'jogos' | 'classificacao' | 'simulador' | 'perfil'>('jogos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'connecting' | 'synced' | 'offline'>('connecting');

  // Synchronize with Local Storage on any changes
  useEffect(() => {
    localStorage.setItem('bolao_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('bolao_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('bolao_guesses', JSON.stringify(guesses));
  }, [guesses]);

  useEffect(() => {
    localStorage.setItem('bolao_active_id', JSON.stringify(activeParticipantId));
  }, [activeParticipantId]);

  // LIVE CLOUD FIREBASE SYNC: Matches & Results subscription under config/jogos
  useEffect(() => {
    const unsubscribeMatches = onSnapshot(doc(db, "config", "jogos"), (snapshot) => {
      if (snapshot.exists()) {
        const fbMatches = snapshot.data().lista;
        if (Array.isArray(fbMatches)) {
          const mapped = fbMatches.map((m: any) => {
            const localFallback = initialMatches.find((lm) => lm.id === m.id);
            return {
              id: m.id,
              homeTeam: m.teamA || m.homeTeam || localFallback?.homeTeam || 'Time A',
              awayTeam: m.teamB || m.awayTeam || localFallback?.awayTeam || 'Time B',
              homeFlag: m.homeFlag || localFallback?.homeFlag || '⚽',
              awayFlag: m.awayFlag || localFallback?.awayFlag || '⚽',
              homeScore: m.scoreA !== undefined ? m.scoreA : (m.homeScore !== undefined ? m.homeScore : null),
              awayScore: m.scoreB !== undefined ? m.scoreB : (m.awayScore !== undefined ? m.awayScore : null),
              status: m.status || localFallback?.status || 'SCHEDULED',
              minute: m.minute !== undefined ? m.minute : (localFallback?.minute || 0),
              group: m.group || localFallback?.group || 'Copa do Mundo',
              date: m.date || localFallback?.date || '',
            };
          });
          setMatches(mapped);
          setCloudStatus('synced');
        }
      } else {
        // Document config/jogos does not exist yet. Initialize it with our local initialMatches
        const converted = initialMatches.map((m) => ({
          id: m.id,
          teamA: m.homeTeam,
          teamB: m.awayTeam,
          scoreA: m.homeScore,
          scoreB: m.awayScore,
          date: m.date,
          status: m.status,
          minute: m.minute,
          group: m.group,
          homeFlag: m.homeFlag,
          awayFlag: m.awayFlag
        }));
        setDoc(doc(db, "config", "jogos"), { lista: converted })
          .then(() => setCloudStatus('synced'))
          .catch((err) => {
            console.error("Erro ao inicializar jogos no Firebase:", err);
            setCloudStatus('offline');
          });
      }
    }, (error) => {
      console.error("Erro ao escutar jogos do Firebase:", error);
      setCloudStatus('offline');
    });

    return () => unsubscribeMatches();
  }, []);

  // LIVE CLOUD FIREBASE SYNC: Users profiles & guesses under usuarios
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "usuarios"), (snapshot) => {
      const fbParticipants: Participant[] = [];
      const fbGuesses: Guess[] = [];
      const processedIds = new Set<string>();

      snapshot.forEach((snapDoc) => {
        const data = snapDoc.data();
        const docId = snapDoc.id; // Lowercase unique matching ID
        const name = data.nome || docId;

        const p: Participant = {
          id: docId,
          name: name,
          avatar: data.avatar || '⚽',
          email: data.email || `${docId}@gmail.com`,
          imageUrl: data.imageUrl || '',
          isCustom: true,
        };

        fbParticipants.push(p);
        processedIds.add(docId);

        // Extract nested palpites Map
        const palpites = data.palpites || {};
        Object.entries(palpites).forEach(([matchId, scoreItem]: [string, any]) => {
          if (scoreItem) {
            fbGuesses.push({
              participantId: docId,
              matchId: matchId,
              homeScoreGuess: scoreItem.scoreA !== undefined ? scoreItem.scoreA : scoreItem.homeScoreGuess,
              awayScoreGuess: scoreItem.scoreB !== undefined ? scoreItem.scoreB : scoreItem.awayScoreGuess,
            });
          }
        });
      });

      // Maintain initial registered standard participants if missing on Firebase to keep local list populated
      initialParticipants.forEach((p) => {
        if (!processedIds.has(p.id)) {
          fbParticipants.push(p);
          const relatedGuesses = initialGuesses.filter((g) => g.participantId === p.id);
          fbGuesses.push(...relatedGuesses);
        }
      });

      setParticipants(fbParticipants);
      setGuesses(fbGuesses);
      setCloudStatus('synced');
    }, (error) => {
      console.error("Erro ao sincronizar participantes do Firebase:", error);
    });

    return () => unsubscribeUsers();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Participant Operations
  const handleAddParticipant = async (name: string, avatar: string) => {
    const docId = name.trim().toLowerCase();
    const newP: Participant = {
      id: docId,
      name,
      avatar,
      isCustom: true,
    };

    // Store in Firebase
    try {
      await setDoc(doc(db, "usuarios", docId), {
        nome: name,
        avatar: avatar,
        palpites: {}
      }, { merge: true });
      setActiveParticipantId(docId);
      triggerToast(`🚨 ${name} cadastrado na Nuvem!`);
    } catch (err) {
      console.error("Erro ao cadastrar na nuvem:", err);
      // Fallback local write
      setParticipants((prev) => [...prev, newP]);
      setActiveParticipantId(docId);
      triggerToast(`🚨 ${name} cadastrado localmente!`);
    }
  };

  const handleDeleteParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setGuesses((prev) => prev.filter((g) => g.participantId !== id));
    if (activeParticipantId === id) {
      const remaining = participants.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setActiveParticipantId(remaining[0].id);
      }
    }
    triggerToast('Participante excluído.');
  };

  const handleGoogleLogin = async (profile: { name: string; email: string; imageUrl: string }) => {
    const docId = profile.name.trim().toLowerCase();
    
    try {
      await setDoc(doc(db, "usuarios", docId), {
        nome: profile.name,
        email: profile.email,
        imageUrl: profile.imageUrl || '',
        avatar: '⚽'
      }, { merge: true });
    } catch (e) {
      console.error("Erro ao registrar no Firebase:", e);
    }

    setActiveParticipantId(docId);
    triggerToast(`🎉 Olá, ${profile.name}! Sincronizado com a Nuvem.`);
  };

  const handleGoogleLogout = () => {
    const googleUser = participants.find((p) => p.id === activeParticipantId);
    if (googleUser) {
      const fallbacks = participants.filter((p) => p.id !== activeParticipantId);
      if (fallbacks.length > 0) {
        setActiveParticipantId(fallbacks[0].id);
      }
      triggerToast(`🚪 Sessão de ${googleUser.name} finalizada.`);
    }
  };

  // Guess Saving
  const handleSaveGuess = async (matchId: string, homeScore: number, awayScore: number) => {
    const match = matches.find((m) => m.id === matchId);
    const matchLabel = match ? `${match.homeTeam} vs ${match.awayTeam}` : 'jogo';

    const newGuess = {
      participantId: activeParticipantId,
      matchId,
      homeScoreGuess: homeScore,
      awayScoreGuess: awayScore,
    };

    setGuesses((prev) => {
      const filtered = prev.filter((g) => !(g.participantId === activeParticipantId && g.matchId === matchId));
      return [...filtered, newGuess];
    });

    const activeParticipant = participants.find((p) => p.id === activeParticipantId);
    if (activeParticipant) {
      const currentGuesses = guesses.filter((g) => g.participantId === activeParticipantId && g.matchId !== matchId);
      const allGuesses = [...currentGuesses, newGuess];

      const palpitesObj: Record<string, { scoreA: number; scoreB: number }> = {};
      allGuesses.forEach((g) => {
        palpitesObj[g.matchId] = {
          scoreA: g.homeScoreGuess,
          scoreB: g.awayScoreGuess,
        };
      });

      try {
        await setDoc(doc(db, "usuarios", activeParticipantId), {
          nome: activeParticipant.name,
          avatar: activeParticipant.avatar || '⚽',
          email: activeParticipant.email || '',
          imageUrl: activeParticipant.imageUrl || '',
          palpites: palpitesObj,
        }, { merge: true });
        triggerToast(`☁️ Palpite na Nuvem! ${matchLabel}: ${homeScore} x ${awayScore}`);
      } catch (err) {
        console.error("Erro ao salvar palpite no Firebase:", err);
        triggerToast(`✅ Salvo Localmente: ${homeScore} x ${awayScore}`);
      }
    } else {
      triggerToast(`✅ Salvo Localmente: ${homeScore} x ${awayScore}`);
    }
  };

  // Admin and Simulation score updating
  const handleUpdateActualScore = async (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    status: 'SCHEDULED' | 'LIVE' | 'FINISHED'
  ) => {
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          homeScore,
          awayScore,
          status,
          minute: status === 'FINISHED' ? 90 : m.minute,
        };
      }
      return m;
    });

    setMatches(updated);

    const converted = updated.map((m) => ({
      id: m.id,
      teamA: m.homeTeam,
      teamB: m.awayTeam,
      scoreA: m.homeScore,
      scoreB: m.awayScore,
      date: m.date,
      status: m.status,
      minute: m.minute,
      group: m.group,
      homeFlag: m.homeFlag,
      awayFlag: m.awayFlag
    }));

    try {
      await setDoc(doc(db, "config", "jogos"), { lista: converted });
      triggerToast(`☁️ Resultados oficiais sincronizados na Nuvem!`);
    } catch (err) {
      console.error("Erro ao salvar jogos no Firebase:", err);
      triggerToast(`⚠️ Salvamento Local: Placar atualizado.`);
    }
  };

  // Triggered when LiveSimulator ticks or ends
  const handleSimulationUpdate = (simulatedMatches: Match[]) => {
    setMatches(simulatedMatches);
  };

  const handleSimulationScoresFinished = async (simulatedMatches: Match[]) => {
    setMatches(simulatedMatches);
    triggerToast('🏆 Rodada Encerrada! Classificação consolidada.');

    const converted = simulatedMatches.map((m) => ({
      id: m.id,
      teamA: m.homeTeam,
      teamB: m.awayTeam,
      scoreA: m.homeScore,
      scoreB: m.awayScore,
      date: m.date,
      status: m.status,
      minute: m.minute,
      group: m.group,
      homeFlag: m.homeFlag,
      awayFlag: m.awayFlag
    }));

    try {
      await setDoc(doc(db, "config", "jogos"), { lista: converted });
    } catch (err) {
      console.error("Erro ao sincronizar simulação finalizada:", err);
    }
  };

  const handleResetMatches = async () => {
    const resetList = initialMatches.map((m) => ({
      ...m,
      homeScore: null,
      awayScore: null,
      status: 'SCHEDULED' as const,
      minute: 0,
    }));
    setMatches(resetList);

    const converted = resetList.map((m) => ({
      id: m.id,
      teamA: m.homeTeam,
      teamB: m.awayTeam,
      scoreA: m.homeScore,
      scoreB: m.awayScore,
      date: m.date,
      status: m.status,
      minute: m.minute,
      group: m.group,
      homeFlag: m.homeFlag,
      awayFlag: m.awayFlag
    }));

    try {
      await setDoc(doc(db, "config", "jogos"), { lista: converted });
      triggerToast('🔄 Resultados limpos e sincronizados com a Nuvem!');
    } catch (err) {
      console.error("Erro ao limpar jogos no Firebase:", err);
      triggerToast('🔄 Resultados dos jogos limpos com sucesso!');
    }
  };

  const handleResetDatabaseAll = () => {
    if (window.confirm('Deseja resetar completamente todos os dados para o padrão inicial do bolão?')) {
      setParticipants(initialParticipants);
      setGuesses(initialGuesses);
      setMatches(initialMatches);
      setActiveParticipantId('p2');
      triggerToast('🔄 Todo o bolão foi reiniciado com sucesso!');
    }
  };

  const handleImportData = (data: {
    participants: Participant[];
    matches: Match[];
    guesses: Guess[];
    activeParticipantId: string;
  }) => {
    setParticipants(data.participants);
    setMatches(data.matches);
    setGuesses(data.guesses);
    setActiveParticipantId(data.activeParticipantId);
    triggerToast('🎉 Backup importado com sucesso!');
  };

  // Calculate global leaderboards
  const scoresLeaderboard = calculateLeaderboard(participants, matches, guesses);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-wrapper">
      
      {/* Top Glassmorphic Navigation Banner */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 sm:px-6" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                BOLÃO COPA DO MUNDO 2026
              </h1>
              <div className="flex items-center flex-wrap gap-2 mt-0.5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Ranking Automático & Palpites Ao Vivo
                </p>
                <div className="hidden xs:block h-3 w-[1px] bg-slate-800" />
                {cloudStatus === 'synced' && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded-xs border border-emerald-500/10 flex items-center gap-1" title="Sincronizado em tempo real com o Firestore bolao-da-copa-ff854">
                    <Cloud className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span>NUVEM ATIVA</span>
                  </span>
                )}
                {cloudStatus === 'connecting' && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-400 font-mono font-bold px-1.5 py-0.2 rounded-xs border border-amber-500/10 flex items-center gap-1 animate-pulse">
                    <CloudLightning className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span>CONECTANDO...</span>
                  </span>
                )}
                {cloudStatus === 'offline' && (
                  <span className="text-[9px] bg-rose-500/10 text-rose-400 font-mono font-bold px-1.5 py-0.2 rounded-xs border border-rose-500/10 flex items-center gap-1">
                    <CloudOff className="w-2.5 h-2.5 text-rose-450 shrink-0" />
                    <span>MODO LOCAL</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex items-center flex-wrap justify-center gap-2 text-xs">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
              id="open-rules-btn"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Regras de Pontos</span>
            </button>

            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border cursor-pointer transition-all ${
                isAdminMode
                  ? 'bg-amber-950/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-350 border-slate-700'
              }`}
              id="toggle-admin-btn"
            >
              {isAdminMode ? <ShieldAlert className="w-4 h-4 text-amber-400" /> : <Shield className="w-4 h-4 text-emerald-400" />}
              <span>{isAdminMode ? 'Sair do Painel Admin' : 'Painel Admin'}</span>
            </button>

            <button
              onClick={handleResetDatabaseAll}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-450 border border-slate-700 hover:border-rose-950/20 transition cursor-pointer"
              title="Resetar Banco de Dados completo do Bolão"
              id="wipe-db-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6" id="app-main">
        {/* Floating notifications */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 border border-emerald-500/30 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono shadow-emerald-950/10"
              id="toast-notification"
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Summary Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-banner">
          <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
            <div className="text-2xl">🌍</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Jogos Cadastrados</span>
              <span className="font-mono text-base font-bold text-white">{matches.length} partidas</span>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
            <div className="text-2xl">👥</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Participantes</span>
              <span className="font-mono text-base font-bold text-white">{participants.length} cadastrados</span>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Líder do Ranking</span>
              <span className="font-mono text-base font-bold text-emerald-400 truncate max-w-[120px] block">
                {participants.find((p) => p.id === scoresLeaderboard[0]?.participantId)?.name || '-'}
              </span>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
            <div className="text-2xl">🔥</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Perfil Ativo</span>
              <span className="font-mono text-base font-bold text-amber-400 truncate max-w-[120px] block">
                {participants.find((p) => p.id === activeParticipantId)?.name || 'Nenhum'}
              </span>
            </div>
          </div>
        </div>

        {/* Two Columns Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="dashboard-columns-grid">
          
          {/* LEFT SIDEBAR: ACTIVE PROFILE SWAPPER & AUTOMATED LEADERBOARD (4 of 12 columns) */}
          <section className="lg:col-span-5 space-y-6 flex flex-col" id="sidebar-left">
            
            {/* Google Authentication, Participant selector and Database backup grouping */}
            <div className={mobileActiveTab === 'perfil' ? 'block space-y-6' : 'hidden lg:block space-y-6'}>
              {/* Google Authentication Control Desk */}
              <GoogleLoginCard
                participants={participants}
                activeParticipantId={activeParticipantId}
                onGoogleLogin={handleGoogleLogin}
                onGoogleLogout={handleGoogleLogout}
              />
              
              {/* Participant selector engine */}
              <ParticipantSelector
                participants={participants}
                activeParticipantId={activeParticipantId}
                onSelectParticipant={setActiveParticipantId}
                onAddParticipant={handleAddParticipant}
                onDeleteParticipant={handleDeleteParticipant}
              />

              {/* Local offline storage backup control card */}
              <DataBackupCard
                participants={participants}
                matches={matches}
                guesses={guesses}
                activeParticipantId={activeParticipantId}
                onImportData={handleImportData}
                onResetDatabase={handleResetDatabaseAll}
              />
            </div>

            {/* Simulated Live rankings list */}
            <div className={mobileActiveTab === 'classificacao' ? 'block' : 'hidden lg:block'}>
              <Leaderboard
                participants={participants}
                scores={scoresLeaderboard}
                activeParticipantId={activeParticipantId}
              />
            </div>

          </section>

          {/* RIGHT CENTRAL COMPONENT: MATCHES LIST AND REALTIME TICKER DESK (7 of 12 columns) */}
          <section 
            className={`lg:col-span-7 space-y-6 ${
              mobileActiveTab === 'jogos' || mobileActiveTab === 'simulador' ? 'block' : 'hidden lg:block'
            }`} 
            id="main-central-panel"
          >
            
            {/* View tab switches (Visible only on desktop screens since mobile features dedicated navigation) */}
            <div className="hidden lg:flex border-b border-slate-800 bg-slate-900/30 p-1 rounded-xl" id="view-tabs">
              <button
                onClick={() => setActiveTab('jogos')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'jogos'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-250'
                }`}
                id="tab-jogos-btn"
              >
                ⚽ Jogos & Palpites
              </button>
              <button
                onClick={() => setActiveTab('simulador')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'simulador'
                    ? 'bg-slate-805 text-emerald-400 border border-emerald-500/10 shadow-xs'
                    : 'text-slate-400 hover:text-slate-250'
                }`}
                id="tab-simulador-btn"
              >
                ⚡ Simulador Ao Vivo
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div id="tab-content">
              {activeTab === 'jogos' ? (
                <div className="space-y-4" id="view-tab-jogos">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        Partidas Relacionadas
                      </h2>
                      <p className="text-xs text-slate-400">Insira palpites ou consulte pontuações provisórias</p>
                    </div>

                    {isAdminMode && (
                      <span className="text-[10px] bg-amber-500/15 text-amber-400 font-bold px-2.5 py-1 rounded-sm border border-amber-500/20 uppercase tracking-widest animate-pulse">
                        Modo Edit Ativo
                      </span>
                    )}
                  </div>

                  <MatchesList
                    matches={matches}
                    guesses={guesses}
                    participants={participants}
                    activeParticipantId={activeParticipantId}
                    onSaveGuess={handleSaveGuess}
                    isAdminMode={isAdminMode}
                    onUpdateActualScore={handleUpdateActualScore}
                  />
                </div>
              ) : (
                <div id="view-tab-simulador">
                  <LiveSimulator
                    matches={matches}
                    participants={participants}
                    guesses={guesses}
                    onSimulationUpdate={handleSimulationUpdate}
                    onSimulationScoresFinished={handleSimulationScoresFinished}
                    onResetMatches={handleResetMatches}
                  />
                </div>
              )}
            </div>

          </section>

        </div>
      </main>

      {/* Mobile Sticky Bottom Tab Bar - Visible premium mobile-friendly design navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-2 shadow-2xl" 
        id="mobile-navigation-bar"
      >
        <div className="grid grid-cols-4 items-center h-16">
          <button
            onClick={() => {
              setMobileActiveTab('jogos');
              setActiveTab('jogos');
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full select-none cursor-pointer transition-colors ${
              mobileActiveTab === 'jogos' ? 'text-emerald-400 font-bold font-mono' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="mobile-tab-jogos"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Jogos</span>
          </button>

          <button
            onClick={() => {
              setMobileActiveTab('classificacao');
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full select-none cursor-pointer transition-colors ${
              mobileActiveTab === 'classificacao' ? 'text-emerald-400 font-bold font-mono' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="mobile-tab-classificacao"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px]">Ranking</span>
          </button>

          <button
            onClick={() => {
              setMobileActiveTab('simulador');
              setActiveTab('simulador');
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full select-none cursor-pointer transition-colors ${
              mobileActiveTab === 'simulador' ? 'text-emerald-400 font-bold font-mono' : 'text-slate-400 hover:text-slate-250'
            }`}
            id="mobile-tab-simulador"
          >
            <Zap className="w-5 h-5" />
            <span className="text-[10px]">Simulador</span>
          </button>

          <button
            onClick={() => {
              setMobileActiveTab('perfil');
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full select-none cursor-pointer transition-colors ${
              mobileActiveTab === 'perfil' ? 'text-emerald-400 font-bold font-mono' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="mobile-tab-perfil"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Perfis</span>
          </button>
        </div>
      </div>

      {/* System Rules Modal Overlay */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Universal Footer Credit */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-12 pb-24 lg:pb-6 space-y-1.5" id="app-footer-credit">
        <p>🏆 Bolão Copa do Mundo 2026 - Versão Premium.</p>
        <p className="text-[10px] text-slate-600">Calculadoras robustas de pontos com desempate matemático integrados • Salvamento automático em cache LocalStorage.</p>
      </footer>
    </div>
  );
}
