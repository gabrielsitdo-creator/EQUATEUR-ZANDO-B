import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'EQUATEUR ZANDO',
    slogan: 'Le grand marché de l’Équateur, désormais dans votre téléphone.',
    version: '1.0.0',
    mode: 'TEST_AND_LIVE_READY',
  });
});

// Gemini AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Intelligent local fallback if API key is not yet set
    return res.json({
      text: `Mbote ! Bienvenue sur EQUATEUR ZANDO. Pour votre demande ("${prompt}"), nos commerçants des marchés de Mbandaka, Gemena et Gbadolite disposent de nombreux articles correspondants en vivres frais, pagnes Super Wax et énergie solaire.`,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Tu es l'Assistant officiel de EQUATEUR ZANDO, le grand marché en ligne de la province de l'Équateur en République Démocratique du Congo (RDC).
Slogan: « Le grand marché de l’Équateur, désormais dans votre téléphone. »
Tu aides les clients à trouver des produits (poisson capitaine fumé, manioc fufu, huile de palme de Gemena, pagnes Super Wax, kits solaires, sandales en cuir) sur les marchés de Mbandaka, Gemena, Gbadolite et Lisala.
Les prix sont exprimés en Francs Congolais (FC).
Sois chaleureux, concis, utilise parfois des salutations courantes en lingala comme "Mbote", et donne des conseils pratiques de commerce local.

Question de l'utilisateur : ${prompt}`,
            },
          ],
        },
      ],
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.json({
      text: `Mbote ! EQUATEUR ZANDO est à votre écoute pour trouver vos vivres frais et produits du Grand Équateur.`,
    });
  }
});

// Setup dev server with Vite or production static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[EQUATEUR ZANDO] Serveur actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
