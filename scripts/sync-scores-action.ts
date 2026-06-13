import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

// Configuration of the Bolão Firebase database
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

// Team translations dictionary to support matching English API names with Portuguese names
const teamTranslations: Record<string, string[]> = {
  'brasil': ['brazil', 'brasil'],
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

// Normalized string match for match evaluation
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
      (teamTranslations[localHome] && teamTranslations[localHome].some(t => remoteHome.includes(t) || remoteHomeShort.includes(t)));

    const isAwayMatch = remoteAway === localAway || remoteAwayShort === localAway ||
      remoteAway.includes(localAway) || localAway.includes(remoteAway) ||
      (teamTranslations[localAway] && teamTranslations[localAway].some(t => remoteAway.includes(t) || remoteAwayShort.includes(t)));

    return isHomeMatch && isAwayMatch;
  });
};

async function syncScores() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    console.error("❌ ERRO: A variável de ambiente FOOTBALL_DATA_API_KEY não foi configurada.");
    process.exit(1);
  }

  console.log("🚀 Iniciando robô de sincronização automática de jogos...");

  // Initialize Firebase applet Realtime Database
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  try {
    // 1. Fetch current matches from Realtime Database
    console.log("📚 Buscando jogos cadastrados no Realtime Database...");
    const snapshot = await get(ref(db, "config/jogos"));

    if (!snapshot.exists()) {
      console.error("⚠️ Caminho/Documento config/jogos não existe no banco!");
      console.error("Por favor, acesse o site no navegador pelo menos uma vez para inicializar os jogos!");
      process.exit(1);
    }

    const { lista: currentMatches } = snapshot.val() as { lista: LocalMatch[] };
    console.log(`✅ Foram encontrados ${currentMatches.length} jogos locais no Realtime Database.`);

    // 2. Fetch latest scores from Football-Data.org API
    const leagueCode = 'WC'; // World Cup por padrão
    const season = '2026';
    console.log(`🌐 Consultando API Football-Data para a Copa do Mundo ${season}...`);

    const apiResponse = await fetch(`https://api.football-data.org/v4/competitions/${leagueCode}/matches?season=${season}`, {
      headers: { 'X-Auth-Token': apiKey }
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Erro na API externa: ${apiResponse.status} - ${errorText}`);
    }

    const apiData = await apiResponse.json() as { matches: any[] };
    const remoteMatches = apiData.matches;

    if (!Array.isArray(remoteMatches) || remoteMatches.length === 0) {
      console.log("⚠️ Nenhuma partida retornada pela API externa.");
      process.exit(0);
    }

    console.log(`📊 Recebidas ${remoteMatches.length} partidas da API. Iniciando comparação...`);

    // 3. Match and update scores
    let updatedCount = 0;
    const updatedList = currentMatches.map((m) => {
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

        const scoreA = remoteHomeScore !== undefined && remoteHomeScore !== null ? remoteHomeScore : m.scoreA;
        const scoreB = remoteAwayScore !== undefined && remoteAwayScore !== null ? remoteAwayScore : m.scoreB;

        if (m.scoreA !== scoreA || m.scoreB !== scoreB || m.status !== mappedStatus) {
          updatedCount++;
          console.log(`🔄 Atualizando o jogo [${m.teamA} x ${m.teamB}]: de [${m.scoreA}x${m.scoreB} - ${m.status}] para [${scoreA}x${scoreB} - ${mappedStatus}]`);
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

    if (updatedCount === 0) {
      console.log("⚽ Tudo em dia! Nenhum jogo novo ou placar alterado desde a última execução.");
      process.exit(0);
    }

    // 4. Save updated results to Realtime Database
    console.log(`💾 Gravando novos dados no Realtime Database (${updatedCount} partidas atualizadas)...`);
    await set(ref(db, "config/jogos"), { lista: updatedList });
    console.log("🎉 Sucesso! Robô rodou e sincronizou os jogos com maestria.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Ocorreu um erro catastrófico na execução do robô:", error);
    process.exit(1);
  }
}

syncScores();
