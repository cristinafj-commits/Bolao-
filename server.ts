import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';
import { initialMatches } from "./src/utils";

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyCfrX0U_2dGPK6qNsBQshfJ0S_hq39pmgU",
  authDomain: "bolao-da-copa-ff854.firebaseapp.com",
  projectId: "bolao-da-copa-ff854",
  storageBucket: "bolao-da-copa-ff854.firebasestorage.app",
  messagingSenderId: "730063016595",
  appId: "1:730063016595:web:a300394ce11bff5e0bb366",
  measurementId: "G-CH72NPPMPQ",
  databaseURL: "https://bolao-da-copa-ff854-default-rtdb.firebaseio.com"
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getDatabase(firebaseApp);

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
  'paraguai': ['paraguay', 'paraguai'],
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

interface LocalMatch {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  date: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  minute?: number;
  group?: string;
  homeFlag?: string;
  awayFlag?: string;
}

const matchExistingByTeamNames = (localMatch: LocalMatch, remoteMatches: any[]) => {
  const normalize = (s: string) => {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const localHome = normalize(localMatch.teamA);
  const localAway = normalize(localMatch.teamB);

  return remoteMatches.find((rm) => {
    const remoteHome = normalize(rm.homeTeam?.name || '');
    const remoteHomeShort = normalize(rm.homeTeam?.shortName || '');
    const remoteAway = normalize(rm.awayTeam?.name || '');
    const remoteAwayShort = normalize(rm.awayTeam?.shortName || '');

    const isHomeMatch = remoteHome === localHome || remoteHomeShort === localHome ||
      remoteHome.includes(localHome) || localHome.includes(remoteHome) ||
      (teamTranslations[localHome] && teamTranslations[localHome].some(t => {
        const normT = normalize(t);
        return remoteHome.includes(normT) || remoteHomeShort.includes(normT);
      }));

    const isAwayMatch = remoteAway === localAway || remoteAwayShort === localAway ||
      remoteAway.includes(localAway) || localAway.includes(remoteAway) ||
      (teamTranslations[localAway] && teamTranslations[localAway].some(t => {
        const normT = normalize(t);
        return remoteAway.includes(normT) || remoteAwayShort.includes(normT);
      }));

    return isHomeMatch && isAwayMatch;
  });
};

const sanitizeForFirebase = (val: any): any => {
  if (val === undefined) {
    return null;
  }
  if (val === null) {
    return null;
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeForFirebase);
  }
  if (typeof val === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(val)) {
      cleaned[key] = sanitizeForFirebase(val[key]);
    }
    return cleaned;
  }
  return val;
};

async function performServerSync(remoteMatches?: any[]) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    console.log("[Server-Sync] Skip: Var FOOTBALL_DATA_API_KEY no config.");
    return;
  }

  try {
    let resolvedRemoteMatches = remoteMatches;
    if (!resolvedRemoteMatches) {
      console.log("[Server-Sync] Fetching fresh data from API...");
      const apiResponse = await fetch(`https://api.football-data.org/v4/competitions/WC/matches?season=2026`, {
        headers: { 'X-Auth-Token': apiKey }
      });
      if (!apiResponse.ok) {
        throw new Error(`External API returned status: ${apiResponse.status}`);
      }
      const apiData = await apiResponse.json() as any;
      resolvedRemoteMatches = apiData.matches;
    }

    if (!Array.isArray(resolvedRemoteMatches) || resolvedRemoteMatches.length === 0) {
      console.log("[Server-Sync] No matches list received, aborting.");
      return;
    }

    const snapshot = await get(ref(firebaseDb, "config/jogos"));
    let currentMatches: LocalMatch[] = [];

    if (!snapshot.exists()) {
      console.log("[Server-Sync] Database has no matches. Initializing from local templates...");
      const converted = initialMatches.map((m) => ({
        id: m.id,
        teamA: m.homeTeam,
        teamB: m.awayTeam,
        scoreA: m.homeScore === undefined ? null : m.homeScore,
        scoreB: m.awayScore === undefined ? null : m.awayScore,
        date: m.date,
        status: m.status as any,
        minute: m.minute === undefined ? 0 : m.minute,
        group: m.group || '',
        homeFlag: m.homeFlag || '',
        awayFlag: m.awayFlag || ''
      }));
      await set(ref(firebaseDb, "config/jogos"), { lista: sanitizeForFirebase(converted) });
      currentMatches = converted as LocalMatch[];
    } else {
      const val = snapshot.val();
      const list = val.lista || [];
      currentMatches = list.map((m: any) => ({
        id: m.id || '',
        teamA: m.teamA || '',
        teamB: m.teamB || '',
        scoreA: m.scoreA === undefined || m.scoreA === null ? null : m.scoreA,
        scoreB: m.scoreB === undefined || m.scoreB === null ? null : m.scoreB,
        date: m.date || '',
        status: m.status || 'SCHEDULED',
        minute: m.minute !== undefined ? m.minute : 0,
        group: m.group || '',
        homeFlag: m.homeFlag || '',
        awayFlag: m.awayFlag || ''
      }));
    }

    let updatedCount = 0;
    const updatedList = currentMatches.map((m) => {
      const matchedRemote = matchExistingByTeamNames(m, resolvedRemoteMatches!);
      if (matchedRemote) {
        const remoteHomeScore = matchedRemote.score?.fullTime?.home;
        const remoteAwayScore = matchedRemote.score?.fullTime?.away;
        
        let mappedStatus: 'SCHEDULED' | 'LIVE' | 'FINISHED' = m.status;
        if (matchedRemote.status === 'FINISHED') {
          mappedStatus = 'FINISHED';
        } else if (matchedRemote.status === 'LIVE' || matchedRemote.status === 'IN_PLAY' || matchedRemote.status === 'PAUSED') {
          mappedStatus = 'LIVE';
        }

        const scoreA = remoteHomeScore !== undefined && remoteHomeScore !== null ? remoteHomeScore : m.scoreA;
        const scoreB = remoteAwayScore !== undefined && remoteAwayScore !== null ? remoteAwayScore : m.scoreB;

        if (m.scoreA !== scoreA || m.scoreB !== scoreB || m.status !== mappedStatus) {
          updatedCount++;
          console.log(`[Server-Sync] Match [${m.teamA} x ${m.teamB}] altered: [${m.scoreA}x${m.scoreB} - ${m.status}] -> [${scoreA}x${scoreB} - ${mappedStatus}]`);
        }

        return {
          ...m,
          scoreA,
          scoreB,
          status: mappedStatus,
          minute: matchedRemote.status === 'FINISHED' ? 90 : (matchedRemote.status === 'IN_PLAY' ? 45 : (m.minute || 0)),
        };
      }
      return m;
    });

    if (updatedCount > 0) {
      console.log(`[Server-Sync] Writing ${updatedCount} score changes to Realtime Database...`);
      await set(ref(firebaseDb, "config/jogos"), { lista: sanitizeForFirebase(updatedList) });
      console.log("[Server-Sync] Realtime Database updated successfully.");
    } else {
      console.log("[Server-Sync] Matches are in sync with this record.");
    }

  } catch (error: any) {
    console.error("[Server-Sync] Error during database synchronization:", error.message || error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cache in-memory structure with 60-second TTL to avoid 429 rate limit
  interface CacheEntry {
    timestamp: number;
    data: any;
  }
  const matchCache: Record<string, CacheEntry> = {};
  const CACHE_TTL_MS = 60 * 1000; // 60 segundos

  // API Route: Match integration with Football-Data.org
  app.get("/api/football-data/matches", async (req, res) => {
    try {
      const apiKey = process.env.FOOTBALL_DATA_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "FOOTBALL_DATA_API_KEY_MISSING",
          message: "API Key para football-data.org não configurada. Defina a variável FOOTBALL_DATA_API_KEY no menu Configurações." 
        });
      }

      // Forçado para WC (Copa do Mundo) para garantir que apenas os dados do mundial sejam utilizados
      const leagueCode = 'WC'; 
      const season = req.query.season || '2026';

      const cacheKey = `${leagueCode}-${season}`;
      const now = Date.now();
      if (matchCache[cacheKey] && (now - matchCache[cacheKey].timestamp < CACHE_TTL_MS)) {
        console.log(`[Cache Hit] Retornando dados em cache para ${cacheKey}`);
        return res.json(matchCache[cacheKey].data);
      }

      console.log(`Buscando partidas de football-data.org para a liga: ${leagueCode}, temporada: ${season}`);
      const response = await fetch(`https://api.football-data.org/v4/competitions/${leagueCode}/matches?season=${season}`, {
        headers: {
          'X-Auth-Token': apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API externa: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // Save to cache
      matchCache[cacheKey] = {
        timestamp: Date.now(),
        data: data
      };

      res.json(data);

      // Trigger asynchronous database synchronization with the fetched matches
      if (data && Array.isArray(data.matches)) {
        performServerSync(data.matches).catch(err => {
          console.error("[Server] Error in inline score sync:", err);
        });
      }
    } catch (error: any) {
      console.error("Erro ao buscar dados do Football-Data API:", error);
      res.status(500).json({ 
        error: "ERROR_FETCHING_FOOTBALL_DATA", 
        message: error.message || "Erro interno do servidor ao consultar placares" 
      });
    }
  });

  // Periodically run background sync every 3 minutes (180,000 ms) as a fail-safe
  if (process.env.FOOTBALL_DATA_API_KEY) {
    console.log("[Server] Periodic score synchronization initialized (every 3 minutes).");
    setInterval(() => {
      console.log("[Server] Running background periodic synchronization task...");
      performServerSync().catch(err => console.error("Periodic background sync error:", err));
    }, 180000);
    
    // Also trigger one immediately on server startup after a 5 second warm up
    setTimeout(() => {
      console.log("[Server] Running initial startup score synchronization...");
      performServerSync().catch(err => console.error("Initial startup sync error:", err));
    }, 5000);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
