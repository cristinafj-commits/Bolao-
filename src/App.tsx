import React, { useState, useEffect } from 'react';
import { Match, Participant, Guess } from './types';
import { initialMatches, initialParticipants, initialGuesses, calculateLeaderboard } from './utils';
import ParticipantSelector from './components/ParticipantSelector';
import Leaderboard from './components/Leaderboard';
import MatchesList from './components/MatchesList';
import RulesModal from './components/RulesModal';
import GoogleLoginCard from './components/GoogleLoginCard';
import DataBackupCard from './components/DataBackupCard';
import AdminPasscodeModal from './components/AdminPasscodeModal';
import LeaderBanner from './components/LeaderBanner';
import { Trophy, HelpCircle, Shield, ShieldAlert, Sparkles, Check, Database, RefreshCw, Star, Calendar, Users, Zap, Cloud, CloudOff, CloudLightning, Key, Lock } from 'lucide-react';
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
    return saved ? JSON.parse(saved) : '';
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState<boolean>(false);
  const [tempPasscode, setTempPasscode] = useState<string>('');
  const [mobileActiveTab, setMobileActiveTab] = useState<'jogos' | 'classificacao' | 'perfil'>('classificacao');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'connecting' | 'synced' | 'offline'>('connecting');
  const [selectedLeague, setSelectedLeague] = useState<string>('WC');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [autoSyncInterval, setAutoSyncInterval] = useState<number>(() => {
    const saved = localStorage.getItem('bolao_autosync_interval');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [secondsUntilNextSync, setSecondsUntilNextSync] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<{
    status: 'idle' | 'checking' | 'success' | 'key_missing' | 'error';
    message?: string;
    matchCount?: number;
  } | null>(null);

  // Mutable reference for fresh score updates callback
  const syncRef = React.useRef<() => any>(() => {});
  useEffect(() => {
    syncRef.current = () => {
      if (autoSyncInterval > 0 && !isSyncing) {
        handleAutoSyncScores('update');
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('bolao_autosync_interval', autoSyncInterval.toString());
    
    if (autoSyncInterval <= 0) {
      setSecondsUntilNextSync(null);
      return;
    }

    setSecondsUntilNextSync(autoSyncInterval);

    const timer = setInterval(() => {
      setSecondsUntilNextSync((prev) => {
        if (prev === null || prev <= 1) {
          syncRef.current();
          return autoSyncInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoSyncInterval]);

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

  // Self-healing active participant selection
  useEffect(() => {
    if (participants.length > 0) {
      const activeExists = participants.some((p) => p.id === activeParticipantId);
      if (!activeExists) {
        setActiveParticipantId(participants[0].id);
      }
    } else {
      if (activeParticipantId !== '') {
        setActiveParticipantId('');
      }
    }
  }, [participants, activeParticipantId]);

  // LIVE CLOUD FIREBASE SYNC: Matches & Results subscription under config/jogos
  useEffect(() => {
    const unsubscribeMatches = onSnapshot(doc(db, "config", "jogos"), (snapshot) => {
      if (snapshot.exists()) {
        const fbMatches = snapshot.data().lista;
        if (Array.isArray(fbMatches)) {
          // Automatic database migration/upgrade to the new 72-match list or reset from outdated list
          const hasOutdated = fbMatches.length < 72 || fbMatches.some((m: any) => 
            (m.id === 'm0' && (m.teamB === 'Dinamarca' || m.awayTeam === 'Dinamarca')) ||
            (m.id === 'm1' && (m.teamB === 'Suécia' || m.awayTeam === 'Suécia'))
          );
          
          const needsHealing = fbMatches.some((m: any) => {
            const local = initialMatches.find((lm) => lm.id === m.id);
            if (!local) return false;
            const fbScoreA = m.scoreA !== undefined ? m.scoreA : m.homeScore;
            return local.homeScore !== null && (fbScoreA === null || fbScoreA === undefined);
          });

          if (fbMatches.length < initialMatches.length || hasOutdated || needsHealing) {
            const upgraded = initialMatches.map((m) => {
              const fbMatch = hasOutdated ? null : fbMatches.find((fbm: any) => fbm.id === m.id);
              
              const fbScoreA = fbMatch?.scoreA !== undefined ? fbMatch.scoreA : (fbMatch?.homeScore !== undefined ? fbMatch.homeScore : null);
              const fbScoreB = fbMatch?.scoreB !== undefined ? fbMatch.scoreB : (fbMatch?.awayScore !== undefined ? fbMatch.awayScore : null);

              return {
                id: m.id,
                teamA: m.homeTeam,
                teamB: m.awayTeam,
                scoreA: fbScoreA !== null ? fbScoreA : m.homeScore,
                scoreB: fbScoreB !== null ? fbScoreB : m.awayScore,
                date: m.date,
                status: (fbMatch?.status && fbMatch?.status !== 'SCHEDULED') ? fbMatch.status : m.status,
                minute: fbMatch?.minute !== undefined ? fbMatch.minute : m.minute,
                group: m.group,
                homeFlag: m.homeFlag,
                awayFlag: m.awayFlag
              };
            });
            setDoc(doc(db, "config", "jogos"), { lista: upgraded })
              .catch((err) => console.error("Erro ao realizar upgrade de rodadas no Firebase:", err));
            return;
          }

          const mapped = fbMatches.map((m: any) => {
            const localFallback = initialMatches.find((lm) => lm.id === m.id);
            const rawScoreA = m.scoreA !== undefined ? m.scoreA : (m.homeScore !== undefined ? m.homeScore : null);
            const rawScoreB = m.scoreB !== undefined ? m.scoreB : (m.awayScore !== undefined ? m.awayScore : null);

            return {
              id: m.id,
              homeTeam: m.teamA || m.homeTeam || localFallback?.homeTeam || 'Time A',
              awayTeam: m.teamB || m.awayTeam || localFallback?.awayTeam || 'Time B',
              homeFlag: m.homeFlag || localFallback?.homeFlag || '⚽',
              awayFlag: m.awayFlag || localFallback?.awayFlag || '⚽',
              homeScore: rawScoreA !== null ? rawScoreA : localFallback?.homeScore,
              awayScore: rawScoreB !== null ? rawScoreB : localFallback?.awayScore,
              status: (m.status && m.status !== 'SCHEDULED') ? m.status : (localFallback?.status || 'SCHEDULED'),
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
          locked: !!data.locked,
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
  const handleAddParticipant = async (name: string, avatar: string, imageUrl?: string) => {
    const docId = name.trim().toLowerCase();
    const newP: Participant = {
      id: docId,
      name,
      avatar,
      imageUrl,
      isCustom: true,
    };

    // Store in Firebase
    try {
      await setDoc(doc(db, "usuarios", docId), {
        nome: name,
        avatar: avatar,
        imageUrl: imageUrl || '',
        palpites: {}
      }, { merge: true });
      setActiveParticipantId(docId);
      setMobileActiveTab('jogos');
      triggerToast(`🚨 ${name} cadastrado na Nuvem!`);
    } catch (err) {
      console.error("Erro ao cadastrar na nuvem:", err);
      // Fallback local write
      setParticipants((prev) => [...prev, newP]);
      setActiveParticipantId(docId);
      setMobileActiveTab('jogos');
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

  const handleSelectParticipant = (pId: string) => {
    setActiveParticipantId(pId);
    setMobileActiveTab('jogos');
    const name = participants.find((p) => p.id === pId)?.name || pId;
    triggerToast(`⚽ Perfil de ${name} ativado.`);
  };

  const handleGoogleLogin = async (profile: { name: string; email: string; imageUrl?: string; avatar?: string }) => {
    const docId = profile.name.trim().toLowerCase();
    
    try {
      await setDoc(doc(db, "usuarios", docId), {
        nome: profile.name,
        email: profile.email,
        imageUrl: profile.imageUrl || '',
        avatar: profile.avatar || '⚽'
      }, { merge: true });
    } catch (e) {
      console.error("Erro ao registrar no Firebase:", e);
    }

    setActiveParticipantId(docId);
    setMobileActiveTab('jogos');
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
    const activeParticipant = participants.find((p) => p.id === activeParticipantId);
    if (activeParticipant?.locked && !isAdminMode) {
      triggerToast('⚠️ Seus palpites estão consolidados e bloqueados!');
      return;
    }

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

  const handleLockGuesses = async () => {
    const activeParticipant = participants.find((p) => p.id === activeParticipantId);
    if (!activeParticipant) return;

    if (activeParticipant.locked) {
      triggerToast('⚠️ Seus palpites já estão bloqueados!');
      return;
    }

    // Determine current guesses for active participant
    const activeGuesses = guesses.filter(
      (g) =>
        g.participantId === activeParticipantId &&
        g.homeScoreGuess !== null &&
        g.homeScoreGuess !== undefined
    );

    // Block locking if any matches remain unpredicted
    const unfilledCount = matches.length - activeGuesses.length;
    if (unfilledCount > 0) {
      alert(`⚠️ Confirmação Recusada: Você ainda não preencheu todos os dias de jogos! Faltam ${unfilledCount} palpites de um total de ${matches.length}.\n\nPor favor, salve palpites para todos os jogos para liberar o bloqueio de rascunhos.`);
      triggerToast(`⚠️ Faltam palpites para ${unfilledCount} jogo(s).`);
      return;
    }

    if (!window.confirm('⚠️ ATENÇÃO: Deseja realmente confirmar e BLOQUEAR todos os seus palpites de uma vez? \n\nUma vez bloqueados, você NÃO poderá fazer quaisquer edições subsequentes.')) {
      return;
    }

    // Update locally
    const updatedParticipants = participants.map((p) => {
      if (p.id === activeParticipantId) {
        return { ...p, locked: true };
      }
      return p;
    });
    setParticipants(updatedParticipants);

    // Sync to firebase
    const palpitesObj: Record<string, { scoreA: number; scoreB: number }> = {};
    activeGuesses.forEach((g) => {
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
        locked: true,
      }, { merge: true });

      triggerToast('🔐 Palpites CONSOLIDADOS e BLOQUEADOS definitivamente! Boa sorte!');
    } catch (err) {
      console.error("Erro ao bloquear palpites no Firebase:", err);
      triggerToast('🔐 Palpites bloqueados com sucesso em cache local!');
    }
  };

  const handleUnlockParticipant = async (pId: string) => {
    const target = participants.find((p) => p.id === pId);
    if (!target) return;

    if (!window.confirm(`Deseja desbloquear os palpites de ${target.name}? Ele(a) poderá editar novamente.`)) {
      return;
    }

    // Update state
    const updatedParticipants = participants.map((p) => {
      if (p.id === pId) {
        return { ...p, locked: false };
      }
      return p;
    });
    setParticipants(updatedParticipants);

    try {
      await setDoc(doc(db, "usuarios", pId), {
        locked: false,
      }, { merge: true });
      triggerToast(`🔓 Palpites de ${target.name} desbloqueados com sucesso!`);
    } catch (err) {
      console.error("Erro ao desbloquear participante:", err);
      triggerToast(`🔓 Desbloqueado localmente.`);
    }
  };

  const handleUpdateAvatar = async (pId: string, avatar: string, imageUrl?: string) => {
    const target = participants.find((p) => p.id === pId);
    if (!target) return;

    // Update state
    const updatedParticipants = participants.map((p) => {
      if (p.id === pId) {
        return { ...p, avatar, imageUrl };
      }
      return p;
    });
    setParticipants(updatedParticipants);

    // Sync to database
    try {
      await setDoc(doc(db, "usuarios", pId), {
        avatar,
        imageUrl: imageUrl || '',
      }, { merge: true });
    } catch (err) {
      console.error("Erro ao atualizar avatar no Firebase (silencioso, salvo em cache local):", err);
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

  const handleResetMatches = async () => {
    const resetList = initialMatches.map((m) => ({
      ...m,
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

  // Helper translations for automated country/team matches between Pt-Br and API English listings
  const teamTranslations: Record<string, string[]> = {
    'brasil': ['brazil', 'brasil'],
    'croacia': ['croatia', 'croácia', 'croacia'],
    'mexico': ['mexico', 'méxico'],
    'camaroes': ['cameroon', 'camarões', 'camaroes'],
    'espanha': ['spain', 'espanha'],
    'holanda': ['netherlands', 'holanda', 'países baixos', 'neth'],
    'chile': ['chile'],
    'australia': ['australia', 'austrália'],
    'colombia': ['colombia', 'colômbia'],
    'grecia': ['greece', 'grécia'],
    'costa do marfim': ['ivory coast', 'cote d\'ivoire', 'costa do marfim', 'côte d\'ivoire'],
    'japao': ['japan', 'japão', 'japao'],
    'uruguai': ['uruguay', 'uruguai'],
    'costa rica': ['costa rica'],
    'inglaterra': ['england', 'inglaterra'],
    'italia': ['italy', 'itália', 'italia'],
    'suica': ['switzerland', 'suíça', 'suica'],
    'equador': ['ecuador', 'equador'],
    'franca': ['france', 'frança', 'franca'],
    'honduras': ['honduras'],
    'argentina': ['argentina'],
    'bosnia': ['bosnia', 'bósnia', 'bosnia and herzegovina', 'bosnia & herzegovina', 'bósnia e herzegovina'],
    'bosnia e herzegovina': ['bosnia', 'bósnia', 'bosnia and herzegovina', 'bosnia & herzegovina', 'bósnia e herzegovina'],
    'ira': ['iran', 'irã', 'ira'],
    'nigeria': ['nigeria', 'nigéria'],
    'alemanha': ['germany', 'alemanha'],
    'portugal': ['portugal'],
    'gana': ['ghana', 'gana'],
    'eua': ['usa', 'united states', 'eua', 'estados unidos', 'united states of america'],
    'estados unidos': ['usa', 'united states', 'eua', 'estados unidos', 'united states of america'],
    'belgica': ['belgium', 'bélgica', 'belgica'],
    'argelia': ['algeria', 'argélia', 'argelia'],
    'russia': ['russia', 'rússia'],
    'coreia do sul': ['south korea', 'korea republic', 'coreia do sul', 'korea'],
    'africa do sul': ['south africa', 'áfrica do sul', 'africa do sul', 'rsa'],
    'tchequia': ['czech republic', 'czechia', 'tchéquia', 'tchequia'],
    'canada': ['canada', 'canadá'],
    'catar': ['qatar', 'catar'],
    'marrocos': ['morocco', 'marrocos'],
    'haiti': ['haiti'],
    'escocia': ['scotland', 'escócia', 'escocia'],
    'turquia': ['turkey', 'türkiye', 'turquia', 'turquie'],
    'curacao': ['curacao', 'curaçao'],
    'suecia': ['sweden', 'suécia', 'suecia'],
    'tunisia': ['tunisia', 'tunísia', 'tunisia'],
    'cabo verde': ['cape verde', 'cabo verde'],
    'egito': ['egypt', 'egito'],
    'arabia saudita': ['saudi arabia', 'arábia saudita', 'arabia saudita'],
    'nova zelandia': ['new zealand', 'nova zelândia', 'nova zelandia'],
    'senegal': ['senegal'],
    'iraque': ['iraq', 'iraque'],
    'noruega': ['norway', 'noruega'],
    'austria': ['austria', 'áustria'],
    'jordania': ['jordan', 'jordânia', 'jordania'],
    'rd do congo': ['congo dr', 'dr congo', 'rd congo', 'democratic republic of the congo', 'rd do congo'],
    'panama': ['panama', 'panamá'],
    'uzbequistao': ['uzbekistan', 'uzbequistão', 'uzbequistao']
  };

  // Maps external Football-Data.org match format to our structural Match representation
  const mapFootballDataMatch = (m: any): Match => {
    const homeName = m.homeTeam?.shortName || m.homeTeam?.name || 'Time A';
    const awayName = m.awayTeam?.shortName || m.awayTeam?.name || 'Time B';
    const homeFlag = m.homeTeam?.crest || '⚽';
    const awayFlag = m.awayTeam?.crest || '⚽';
    
    let mappedStatus: 'SCHEDULED' | 'LIVE' | 'FINISHED' = 'SCHEDULED';
    if (m.status === 'FINISHED') {
      mappedStatus = 'FINISHED';
    } else if (m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'LIVE') {
      mappedStatus = 'LIVE';
    }
    
    const homeScore = m.score?.fullTime?.home !== undefined && m.score?.fullTime?.home !== null ? m.score.fullTime.home : null;
    const awayScore = m.score?.fullTime?.away !== undefined && m.score?.fullTime?.away !== null ? m.score.fullTime.away : null;
    
    let formattedDate = m.utcDate || '';
    try {
      if (m.utcDate) {
        const d = new Date(m.utcDate);
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const day = d.getDate().toString().padStart(2, '0');
        const month = months[d.getMonth()];
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        formattedDate = `${day} ${month}, ${hours}:${minutes}`;
      }
    } catch (e) {
      formattedDate = m.utcDate || '';
    }

    return {
      id: `fd-${m.id}`,
      homeTeam: homeName,
      awayTeam: awayName,
      homeFlag: homeFlag,
      awayFlag: awayFlag,
      homeScore: homeScore,
      awayScore: awayScore,
      status: mappedStatus,
      minute: m.status === 'FINISHED' ? 90 : (m.status === 'IN_PLAY' ? 45 : 0),
      group: m.matchday ? `Rodada ${m.matchday}` : (m.stage ? m.stage.replace('_', ' ') : 'Partida'),
      date: formattedDate,
    };
  };

  // String containment-based fuzzy search for team matching
  const matchExistingByTeamNames = (localMatch: Match, remoteMatches: any[]) => {
    const normalize = (s: string) => {
      return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    };

    const localHome = normalize(localMatch.homeTeam);
    const localAway = normalize(localMatch.awayTeam);

    return remoteMatches.find((rm) => {
      const remoteHome = normalize(rm.homeTeam?.name || '');
      const remoteHomeShort = normalize(rm.homeTeam?.shortName || '');
      const remoteAway = normalize(rm.awayTeam?.name || '');
      const remoteAwayShort = normalize(rm.awayTeam?.shortName || '');

      const isHomeMatch = remoteHome === localHome || remoteHomeShort === localHome ||
        remoteHome.includes(localHome) || localHome.includes(remoteHome) ||
        (teamTranslations[localHome] && teamTranslations[localHome].some(t => remoteHome.includes(t) || remoteHomeShort.includes(t)));

      const isAwayMatch = remoteAway === localAway || remoteAwayShort === localAway ||
        remoteAway.includes(localAway) || localAway.includes(remoteAway) ||
        (teamTranslations[localAway] && teamTranslations[localAway].some(t => remoteAway.includes(t) || remoteAwayShort.includes(t)));

      return isHomeMatch && isAwayMatch;
    });
  };

  // Connects to our back-end proxy and triggers database updates or league imports
  const handleAutoSyncScores = async (mode: 'update' | 'import') => {
    setIsSyncing(true);
    triggerToast(`⏳ Conectando à API Football-Data (${selectedLeague})...`);

    try {
      const response = await fetch(`/api/football-data/matches?leagueCode=${selectedLeague}`);
      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'FOOTBALL_DATA_API_KEY_MISSING') {
          triggerToast(`🔑 Erro: Chave de API não cadastrada em Configurações!`);
        } else {
          triggerToast(`❌ Erro da API: ${data.message || 'Falha na requisição'}`);
        }
        setIsSyncing(false);
        return;
      }

      const remoteMatches = data.matches;
      if (!Array.isArray(remoteMatches)) {
        triggerToast(`❌ Resposta inesperada: Lista de partidas não encontrada.`);
        setIsSyncing(false);
        return;
      }

      if (remoteMatches.length === 0) {
        triggerToast(`⚠️ Nenhuma de partida encontrada para a liga ${selectedLeague}.`);
        setIsSyncing(false);
        return;
      }

      if (mode === 'import') {
        const confirmImport = window.confirm(
          `⚠️ Importar as ${remoteMatches.length} partidas da liga ${selectedLeague} irá REDEFINIR todas as partidas atuais por completo. Deseja prosseguir de forma definitiva?`
        );
        if (!confirmImport) {
          setIsSyncing(false);
          return;
        }

        const mappedMatches = remoteMatches.map((m: any) => mapFootballDataMatch(m));
        setMatches(mappedMatches);

        const converted = mappedMatches.map((m) => ({
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

        await setDoc(doc(db, "config", "jogos"), { lista: converted });
        triggerToast(`🎉 Importados ${mappedMatches.length} jogos da liga ${selectedLeague} com sucesso!`);
      } else {
        // Mode is 'update' - search and update scores of existing matches
        let updatedCount = 0;
        const updatedList = matches.map((m) => {
          const matchedRemote = matchExistingByTeamNames(m, remoteMatches);
          if (matchedRemote) {
            const remoteHomeScore = matchedRemote.score?.fullTime?.home;
            const remoteAwayScore = matchedRemote.score?.fullTime?.away;
            
            let mappedStatus: 'SCHEDULED' | 'LIVE' | 'FINISHED' = m.status;
            if (matchedRemote.status === 'FINISHED') {
              mappedStatus = 'FINISHED';
            } else if (matchedRemote.status === 'LIVE' || matchedRemote.status === 'IN_PLAY' || matchedRemote.status === 'PAUSED') {
              mappedStatus = 'LIVE';
            }

            updatedCount++;
            return {
              ...m,
              homeScore: remoteHomeScore !== undefined && remoteHomeScore !== null ? remoteHomeScore : m.homeScore,
              awayScore: remoteAwayScore !== undefined && remoteAwayScore !== null ? remoteAwayScore : m.awayScore,
              status: mappedStatus,
              minute: matchedRemote.status === 'FINISHED' ? 90 : (matchedRemote.status === 'IN_PLAY' ? 45 : m.minute),
            };
          }
          return m;
        });

        if (updatedCount === 0) {
          triggerToast(`⚠️ Nenhum jogo coincidente foi encontrado para atualizar os placares.`);
          setIsSyncing(false);
          return;
        }

        setMatches(updatedList);

        const converted = updatedList.map((m) => ({
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

        await setDoc(doc(db, "config", "jogos"), { lista: converted });
        triggerToast(`🔥 Atualizados placares de ${updatedCount} jogos com sucesso!`);
      }
    } catch (err: any) {
      console.error("Erro na busca automática:", err);
      triggerToast(`⚠️ Erro de rede ou indisponibilidade da API Football-Data.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestApiConnection = async () => {
    setApiStatus({ status: 'checking' });
    try {
      const response = await fetch('/api/football-data/matches?leagueCode=WC');
      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'FOOTBALL_DATA_API_KEY_MISSING') {
          setApiStatus({
            status: 'key_missing',
            message: 'A chave FOOTBALL_DATA_API_KEY não foi encontrada nas variáveis de ambiente (.env ou Configurações do AI Studio).'
          });
          triggerToast('🔑 Chave API não configurada.');
        } else {
          setApiStatus({
            status: 'error',
            message: data.message || `Erro do servidor: ${response.status}`
          });
          triggerToast('❌ Erro ao testar conexão.');
        }
        return;
      }

      if (data && Array.isArray(data.matches)) {
        setApiStatus({
          status: 'success',
          matchCount: data.matches.length,
          message: `Conexão bem-sucedida! Foram encontrados ${data.matches.length} jogos da Copa do Mundo na API.`
        });
        triggerToast('✅ Conexão com a API OK!');
      } else {
        setApiStatus({
          status: 'error',
          message: 'A API respondeu com status de sucesso, mas o formato de resposta não contém a lista de partidas esperada.'
        });
        triggerToast('⚠️ Formato de resposta inválido.');
      }
    } catch (err: any) {
      setApiStatus({
        status: 'error',
        message: err.message || 'Erro de rede ou conexão instável.'
      });
      triggerToast('⚠️ Falha de conexão.');
    }
  };

  const handleResetDatabaseAll = async () => {
    if (window.confirm('Deseja resetar completamente todos os dados para o padrão inicial do bolão?')) {
      setParticipants(initialParticipants);
      setGuesses(initialGuesses);
      setMatches(initialMatches);
      setActiveParticipantId('');

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

      try {
        await setDoc(doc(db, "config", "jogos"), { lista: converted });
        triggerToast('🔄 Bolão reiniciado e sincronizado com a Nuvem!');
      } catch (err) {
        console.error("Erro ao sincronizar reinício com Firebase:", err);
        triggerToast('🔄 Todo o bolão foi reiniciado com sucesso!');
      }
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

  const handleSaveNewPasscode = () => {
    const trimmed = tempPasscode.trim();
    if (!trimmed) {
      triggerToast('⚠️ Digite um código de acesso válido.');
      return;
    }
    if (trimmed.length < 4) {
      triggerToast('⚠️ O código precisa ter pelo menos 4 caracteres.');
      return;
    }
    localStorage.setItem('bolao_admin_passcode', trimmed);
    triggerToast('🔐 Novo código de acesso configurado com sucesso!');
    setTempPasscode('');
  };

  // Calculate global leaderboards
  const scoresLeaderboard = calculateLeaderboard(participants, matches, guesses);
  const activeParticipant = participants.find((p) => p.id === activeParticipantId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-yellow-50/30 to-blue-50/15 text-slate-800 flex flex-col font-sans" id="app-wrapper">
      
      {/* Top Glassmorphic Navigation Banner */}
      <header className="sticky top-0 z-40 bg-emerald-800 backdrop-blur-md border-b-2 border-yellow-400 px-4 py-3.5 sm:px-6 text-white shadow-md" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20 text-yellow-300">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                BOLÃO COPA DO MUNDO 2026
              </h1>
              <div className="flex items-center flex-wrap gap-2 mt-0.5">
                <p className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">
                  Ranking Automático & Palpites da Copa
                </p>
                <div className="hidden xs:block h-3 w-[1px] bg-emerald-600" />
                {cloudStatus === 'synced' && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-250 font-mono font-bold px-1.5 py-0.2 rounded-xs border border-emerald-500/20 flex items-center gap-1" title="Sincronizado em tempo real com o Firestore bolao-da-copa-ff854">
                    <Cloud className="w-2.5 h-2.5 text-emerald-250 shrink-0" />
                    <span>NUVEM ATIVA</span>
                  </span>
                )}
                {cloudStatus === 'connecting' && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-200 font-mono font-bold px-1.5 py-0.2 rounded-xs border border-amber-500/20 flex items-center gap-1 animate-pulse">
                    <CloudLightning className="w-2.5 h-2.5 text-amber-200 shrink-0" />
                    <span>CONECTANDO...</span>
                  </span>
                )}
                {cloudStatus === 'offline' && (
                  <span className="text-[9px] bg-white/10 text-slate-200 font-mono font-bold px-1.5 py-0.2 rounded-xs border border-white/10 flex items-center gap-1">
                    <CloudOff className="w-2.5 h-2.5 text-slate-200 shrink-0" />
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
              className="px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-700 text-white flex items-center gap-1.5 border border-yellow-400/30 cursor-pointer transition-colors"
              id="open-rules-btn"
            >
              <HelpCircle className="w-4 h-4 text-yellow-300" />
              <span>Regras de Pontos</span>
            </button>

            <button
              onClick={() => {
                if (isAdminMode) {
                  setIsAdminMode(false);
                  triggerToast('🔓 Modo administrador desativado.');
                } else {
                  setIsPasscodeModalOpen(true);
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border cursor-pointer transition-all ${
                isAdminMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-emerald-900 hover:bg-emerald-700 text-white border-yellow-400/30'
              }`}
              id="toggle-admin-btn"
            >
              {isAdminMode ? <ShieldAlert className="w-4 h-4 text-slate-950" /> : <Shield className="w-4 h-4 text-yellow-300" />}
              <span>{isAdminMode ? 'Sair do Painel Admin' : 'Painel Admin'}</span>
            </button>

            <button
              onClick={handleResetDatabaseAll}
              className="p-1.5 rounded-lg bg-emerald-900 hover:bg-red-750 text-red-100 border border-emerald-750 transition cursor-pointer"
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
              className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-white border border-emerald-250 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold text-emerald-700 font-mono shadow-emerald-100/50"
              id="toast-notification"
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebrating 1st Place Champion banner when accessed */}
        <LeaderBanner participants={participants} scores={scoresLeaderboard} />

        {/* Two Columns Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="dashboard-columns-grid">
          
          {/* LEFT SIDEBAR: ACTIVE PROFILE SWAPPER & AUTOMATED LEADERBOARD (4 of 12 columns) */}
          <section className="lg:col-span-5 space-y-6 flex flex-col" id="sidebar-left">
            
            {/* Simulated Live rankings list */}
            <div className={mobileActiveTab === 'classificacao' ? 'block' : 'hidden lg:block'}>
              <Leaderboard
                participants={participants}
                scores={scoresLeaderboard}
                activeParticipantId={activeParticipantId}
              />
            </div>

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
                onSelectParticipant={handleSelectParticipant}
                onAddParticipant={handleAddParticipant}
                onDeleteParticipant={handleDeleteParticipant}
                isAdminMode={isAdminMode}
                onUnlockParticipant={handleUnlockParticipant}
                onUpdateAvatar={handleUpdateAvatar}
                onLockGuesses={handleLockGuesses}
                onGoToGuesses={() => setMobileActiveTab('jogos')}
              />

              {/* Local offline storage backup control card */}
              {isAdminMode && (
                <DataBackupCard
                  participants={participants}
                  matches={matches}
                  guesses={guesses}
                  activeParticipantId={activeParticipantId}
                  onImportData={handleImportData}
                  onResetDatabase={handleResetDatabaseAll}
                />
              )}

              {/* API and Football-Data Synchronization Panel */}
              {isAdminMode && (
                <div 
                  className="bg-linear-to-b from-emerald-50 to-emerald-100/20 border border-emerald-300 p-5 rounded-2xl space-y-3.5 shadow-sm animate-in fade-in slide-in-from-top-3 duration-200 text-left" 
                  id="admin-api-sync-card"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-750 shrink-0 border border-emerald-200">
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider">
                        Sincronização Automática (API)
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Importe partidas ou atualize placares automaticamente via Football-Data.org.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Campeonato / Liga
                        </label>
                        <select
                          value={selectedLeague}
                          onChange={(e) => setSelectedLeague(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-2.5 py-2 font-medium text-slate-800 outline-hidden"
                          id="select-league-api"
                          disabled
                        >
                          <option value="WC">🏆 Copa do Mundo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Busca Automática
                        </label>
                        <select
                          value={autoSyncInterval}
                          onChange={(e) => setAutoSyncInterval(parseInt(e.target.value, 10))}
                          className="w-full text-xs bg-white border border-slate-300 focus:border-emerald-500 rounded-xl px-2.5 py-2 font-medium text-slate-850 cursor-pointer outline-hidden"
                          id="select-interval-api"
                        >
                          <option value={0}>Manual (Desativado)</option>
                          <option value={30}>A cada 30 segundos</option>
                          <option value={60}>A cada 1 minuto</option>
                          <option value={180}>A cada 3 minutos</option>
                          <option value={300}>A cada 5 minutos</option>
                          <option value={600}>A cada 10 minutos</option>
                        </select>
                      </div>
                    </div>

                    {secondsUntilNextSync !== null && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-250 p-2 rounded-xl animate-pulse">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>
                          Próxima verificação automática em {secondsUntilNextSync} segundos...
                        </span>
                      </div>
                    )}

                    {/* API Connection Diagnostics Checker */}
                    <div className="bg-white border border-slate-205 p-3 rounded-xl space-y-2 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Diagnóstico da API
                        </span>
                        <button
                          onClick={handleTestApiConnection}
                          disabled={apiStatus?.status === 'checking'}
                          className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[9px] font-extrabold px-2.5 py-1.5 rounded-lg transition active:scale-95 flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                          <span>Testar Conexão</span>
                        </button>
                      </div>

                      {apiStatus ? (
                        <div className="text-[10px] space-y-1">
                          {apiStatus.status === 'checking' && (
                            <div className="text-slate-500 flex items-center gap-1.5 py-1">
                              <span className="inline-block animate-spin text-slate-400 text-xs">⏳</span>
                              <span>Verificando status do canal...</span>
                            </div>
                          )}
                          {apiStatus.status === 'success' && (
                            <div className="text-emerald-900 bg-emerald-50/50 border border-emerald-200 p-2.5 rounded-lg space-y-1">
                              <p className="font-extrabold flex items-center gap-1">
                                <span className="text-emerald-600 font-bold">●</span> Conectado com sucesso!
                              </p>
                              <p className="text-[9px] text-slate-500 leading-normal">{apiStatus.message}</p>
                              <div className="text-[9px] text-slate-550 border-t border-dashed border-emerald-200 pt-1.5 mt-1 leading-normal font-semibold">
                                💡 <strong>Atenção:</strong> Para sincronizar as partidas reais do mundial (Brasil, Equador, Argentina, etc.) no seu bolão, primeiro clique em <strong>"Importar Tudo"</strong> abaixo para substituir os jogos de testes/fictícios atuais de forma automática.
                              </div>
                            </div>
                          )}
                          {apiStatus.status === 'key_missing' && (
                            <div className="text-red-900 bg-red-50/50 border border-red-200 p-2.5 rounded-lg space-y-1">
                              <p className="font-extrabold flex items-center gap-1">
                                <span className="text-red-500">●</span> Chave de API Ausente
                              </p>
                              <p className="text-[9px] text-red-700 leading-normal">
                                A chave <strong>FOOTBALL_DATA_API_KEY</strong> não está configurada. Cadastre-a nas Configurações (ícone de engrenagem no topo do painel do AI Studio) para liberar a busca.
                              </p>
                            </div>
                          )}
                          {apiStatus.status === 'error' && (
                            <div className="text-amber-900 bg-amber-50/50 border border-amber-200 p-2.5 rounded-lg space-y-1">
                              <p className="font-extrabold flex items-center gap-1">
                                <span className="text-amber-500">●</span> Erro na Consulta
                              </p>
                              <p className="text-[9px] text-amber-700 leading-normal">{apiStatus.message}</p>
                              <p className="text-[9px] text-slate-500 leading-normal pt-1 border-t border-dashed border-amber-200 mt-1">
                                Verifique a validade da chave ou as cotas gratuitas na conta football-data.org.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-400 font-medium">
                          Clique em "Testar Conexão" para validar o canal e certificar se sua chave já está ativa.
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAutoSyncScores('update')}
                        disabled={isSyncing}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-extrabold text-[10px] uppercase rounded-xl cursor-pointer transition shadow-xs active:scale-95 text-center flex items-center justify-center gap-1 leading-none"
                        id="auto-sync-scores-btn"
                        title="Atualizar resultados dos jogos que têm o mesmo nome de time no bolão atualmente."
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Placares
                      </button>
                      <button
                        onClick={() => handleAutoSyncScores('import')}
                        disabled={isSyncing}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-[10px] uppercase rounded-xl cursor-pointer transition shadow-xs active:scale-95 text-center flex items-center justify-center gap-1 leading-none"
                        id="auto-import-matches-btn"
                        title="Sobrescrever banco de dados atual com todas as partidas da liga selecionada."
                      >
                        <Database className="w-3.5 h-3.5" />
                        Importar Tudo
                      </button>
                    </div>

                    <p className="text-[9px] text-slate-400 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                      💡 <strong>Importar Tudo</strong> redefine todos os jogos ativos para a liga escolhida. Certifique-se de configurar a <strong>FOOTBALL_DATA_API_KEY</strong> nas configurações do app.
                    </p>
                  </div>
                </div>
              )}

              {/* Security passcode configuration settings card */}
              {isAdminMode && (
                <div 
                  className="bg-linear-to-b from-amber-50 to-amber-100/30 border border-amber-300 p-5 rounded-2xl space-y-3.5 shadow-sm animate-in fade-in slide-in-from-top-3 duration-200 text-left" 
                  id="admin-passcode-settings-card"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-amber-105 rounded-lg text-amber-750 shrink-0 border border-amber-200">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider">
                        Código de Segurança (Admin)
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Altere o código de acesso para que apenas você possa gerenciar os resultados do bolão.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Novo Código"
                      value={tempPasscode}
                      onChange={(e) => setTempPasscode(e.target.value)}
                      className="flex-1 text-xs bg-white border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2 focus:outline-hidden font-mono text-center text-slate-800 shadow-2xs"
                      id="save-new-passcode-input"
                    />
                    <button
                      onClick={handleSaveNewPasscode}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] rounded-xl cursor-pointer transition shadow-xs active:scale-95 shrink-0"
                      id="save-new-passcode-btn"
                    >
                      Alterar
                    </button>
                  </div>
                </div>
              )}
            </div>

          </section>

          {/* RIGHT CENTRAL COMPONENT: MATCHES LIST AND RESULTS DESK (7 of 12 columns) */}
          <section 
            className={`lg:col-span-7 space-y-6 ${
              mobileActiveTab === 'jogos' ? 'block' : 'hidden lg:block'
            }`} 
            id="main-central-panel"
          >
            <div className="space-y-4" id="view-tab-jogos">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Partidas Relacionadas
                  </h2>
                  <p className="text-xs text-slate-500">Insira palpites ou consulte pontuações provisórias</p>
                </div>

                {isAdminMode && (
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <button
                      onClick={handleResetMatches}
                      className="text-[10px] bg-red-100 hover:bg-red-200 text-red-700 font-bold px-2 py-1 rounded-sm border border-red-250 uppercase tracking-wide cursor-pointer text-center select-none"
                      title="Apagar placares reais e redefinir jogos como Agendados"
                      id="reset-scores-btn"
                    >
                      Resetar Resultados
                    </button>
                    <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2.5 py-1 rounded-sm border border-amber-500/20 uppercase tracking-widest animate-pulse">
                      Modo Edit Ativo
                    </span>
                  </div>
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
                onLockGuesses={handleLockGuesses}
              />
            </div>
          </section>

        </div>
      </main>

      {/* Mobile Sticky Bottom Tab Bar - Visible premium mobile-friendly design navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-205 pb-2 shadow-2xl" 
        id="mobile-navigation-bar"
      >
        <div className="grid grid-cols-3 items-center h-16">
          <button
            onClick={() => {
              setMobileActiveTab('jogos');
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full select-none cursor-pointer transition-colors ${
              mobileActiveTab === 'jogos' ? 'text-emerald-700 font-bold font-mono' : 'text-slate-500 hover:text-emerald-700'
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
              mobileActiveTab === 'classificacao' ? 'text-emerald-700 font-bold font-mono' : 'text-slate-500 hover:text-emerald-700'
            }`}
            id="mobile-tab-classificacao"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px]">Ranking</span>
          </button>

          <button
            onClick={() => {
              setMobileActiveTab('perfil');
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full select-none cursor-pointer transition-colors ${
              mobileActiveTab === 'perfil' ? 'text-emerald-700 font-bold font-mono' : 'text-slate-500 hover:text-emerald-700'
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

      {/* Admin Passcode Entry Overlay */}
      <AdminPasscodeModal 
        isOpen={isPasscodeModalOpen} 
        onClose={() => setIsPasscodeModalOpen(false)} 
        onSuccess={() => {
          setIsAdminMode(true);
        }} 
      />

      {/* Universal Footer Credit */}
      <footer className="bg-emerald-950 border-t-2 border-yellow-500 py-6 text-center text-xs text-emerald-100 mt-12 pb-24 lg:pb-6 space-y-1.5" id="app-footer-credit">
        <p>🏆 Bolão Copa do Mundo 2026 - Versão Premium adaptado com as Cores de 🇧🇷.</p>
        <p className="text-[10px] text-emerald-250/80">Calculadoras robustas de pontos com desempate matemático integrados • Salvamento automático em cache LocalStorage.</p>
      </footer>
    </div>
  );
}
