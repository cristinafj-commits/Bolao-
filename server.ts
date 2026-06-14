import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

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
    } catch (error: any) {
      console.error("Erro ao buscar dados do Football-Data API:", error);
      res.status(500).json({ 
        error: "ERROR_FETCHING_FOOTBALL_DATA", 
        message: error.message || "Erro interno do servidor ao consultar placares" 
      });
    }
  });

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
