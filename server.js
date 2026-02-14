/**
 * Borin AI - Backend Server
 * Proxy für die Hugging Face API (umgeht CORS-Probleme)
 */

const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conversation history für Kontext
const conversationHistory = {};

/**
 * POST /api/chat - Hauptendpunkt für Chat
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = 'default' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nachricht erforderlich' });
    }

    // Konversationshistorie initialisieren
    if (!conversationHistory[userId]) {
      conversationHistory[userId] = [];
    }

    // Nachricht zur Historie hinzufügen
    conversationHistory[userId].push({ role: 'user', content: message });

    // Letzte 6 Nachrichten für Kontext
    const recentHistory = conversationHistory[userId].slice(-6);

    // System-Prompt
    const systemPrompt = "Du bist Borin AI, ein freundlicher und hilfreicher Lerntutor für Schüler. Du erklärst komplexe Themen einfach und verständlich. Antworte kurz und prägnant (max 300 Wörter). Nutze Emojis um es ansprechend zu gestalten.";

    // Konversationskontext aufbauen
    let formattedHistory = '';
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        formattedHistory += `Schüler: ${msg.content}\n`;
      } else {
        formattedHistory += `Borin: ${msg.content}\n`;
      }
    });

    const prompt = `${systemPrompt}\n\n${formattedHistory}Borin:`;

    // Anfrage an Hugging Face API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer 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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('HF API Error:', error);
      return res.status(response.status).json({ 
        error: `API Fehler: ${error.error?.[0] || 'Unbekannt'}`,
        isRetryable: error.error?.[0]?.includes('currently loading') 
      });
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0] && data[0].generated_text) {
      let result = data[0].generated_text;

      // Extrahiere nur die KI-Antwort (nach letztem "Borin:")
      const borinIndex = result.lastIndexOf('Borin:');
      if (borinIndex !== -1) {
        result = result.substring(borinIndex + 6).trim();
      }

      // Limite auf 500 Zeichen
      if (result.length > 500) {
        result = result.substring(0, 500) + '...';
      }

      // Fallback wenn leer
      if (!result) {
        result = '📚 Interessante Frage! Schreibe die Frage bitte etwas detaillierter auf, damit ich dir besser helfen kann.';
      }

      // Zur Historie hinzufügen
      conversationHistory[userId].push({ role: 'assistant', content: result });

      return res.json({ response: result });
    } else {
      return res.status(500).json({ error: 'Unerwartete API-Antwort' });
    }

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Interner Fehler: ' + error.message 
    });
  }
});

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'Borin AI Backend läuft ✅' });
});

/**
 * Server starten
 */
app.listen(PORT, () => {
  console.log(`🤖 Borin AI Server läuft auf http://localhost:${PORT}`);
  console.log(`📚 API verfügbar unter http://localhost:${PORT}/api/chat`);
});
