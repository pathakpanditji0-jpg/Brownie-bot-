import express from 'express';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  isOwnerQuestion,
  createInitialServerState,
  createDefaultCustomization,
  ServerState,
  RoastCustomization,
  normalizeIdentifier,
} from './src/utils/botEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PERSIST_FILE = path.join(__dirname, 'brownie-customization.json');

const app = express();
app.use(express.json({ limit: '1mb' }));

const GEMINI_MODEL = 'gemini-3.8-flash';

function loadPersistedServerState(): ServerState {
  const fallback = createInitialServerState();
  try {
    if (fs.existsSync(PERSIST_FILE)) {
      const raw = JSON.parse(fs.readFileSync(PERSIST_FILE, 'utf8'));
      if (raw && typeof raw === 'object' && raw.config && raw.accounts) {
        if (!raw.config.customization) {
          raw.config.customization = createDefaultCustomization();
        }
        return raw as ServerState;
      }
    }
  } catch (err) {
    console.warn('[Persistence] Could not read brownie-customization.json, using default state:', err);
  }
  return fallback;
}

function savePersistedServerState(state: ServerState): void {
  const tempPath = `${PERSIST_FILE}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tempPath, PERSIST_FILE);
  } catch (err) {
    console.error('[Persistence] Failed to write brownie-customization.json:', err);
  }
}

let persistedState: ServerState = loadPersistedServerState();
savePersistedServerState(persistedState);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildLocalRoastFallback(
  username: string,
  userMessage: string,
  roastTarget: string | undefined,
  roastMode: boolean,
  customization: RoastCustomization
): string {
  const target = roastTarget || username;
  const cleanMsg = String(userMessage || '').trim();

  if (isOwnerQuestion(cleanMsg)) {
    return '👑 My official owners & supreme admins are **akshatkrofficial_47531** and **killer_sole5**! 🍫🔥';
  }

  if (!roastMode && !roastTarget) {
    return `Hey **${username}**! Brownie Bot is active and ready. Need Chocochips or want me to roast someone? Try \`*daily\`, \`*roast @shadow_yapper99\`, or ask **akshatkrofficial_47531** / **killer_sole5** for an admin boost! 🍫`;
  }

  const matchedTargetRule = customization.priorityTargets.find(
    (item) => normalizeIdentifier(item.target) === normalizeIdentifier(target)
  );
  const topicNote =
    customization.roastTopics.length > 0
      ? customization.roastTopics[0]
      : 'hardstuck gameplay';

  if (matchedTargetRule) {
    return `🔥 **[${customization.roastStyle} · ${customization.roastIntensity}]** **@${target}**, admin lore says it all: _"${matchedTargetRule.angle}"_ — aur upar se tera "${topicNote}" record dekh ke Gemini Brain bhi has pada! 🍫💀`;
  }

  const roasts = [
    `🔥 **[${customization.roastStyle} · ${customization.roastIntensity}]** **@${target}**, tera confidence toh VIP lounge waala hai, par "${topicNote}" mein dimaag abhi bhi free trial pe chal raha hai! 🍫`,
    `💀 **[${customization.roastStyle} · ${customization.roastIntensity}]** **@${target}**, "${cleanMsg.slice(0, 45) || 'that message'}" likhne se pehle keyboard ne bhi socha hoga: *bhai mujhe kyu toda?* 🔥`,
    `🍫 **[${customization.roastStyle} · ${customization.roastIntensity}]** **@${target}**, tu server mein aise entry maarta hai jaise main character ho, par asliyat mein "${topicNote}" ka living example hai!`,
  ];
  let hash = 0;
  const seed = `${target}:${cleanMsg}:${Date.now().toString().slice(-3)}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return roasts[hash % roasts.length];
}

// Get persistent server & customization state
app.get('/api/bot/state', (_req, res) => {
  persistedState = loadPersistedServerState();
  res.json({
    state: persistedState,
    persistedFile: 'brownie-customization.json',
  });
});

// Save persistent server & customization state
app.post('/api/bot/state', (req, res) => {
  const incomingState = req.body?.state as ServerState | undefined;
  if (!incomingState || !incomingState.config || !incomingState.accounts) {
    res.status(400).json({ error: 'Invalid server state payload' });
    return;
  }
  if (!incomingState.config.customization) {
    incomingState.config.customization = createDefaultCustomization();
  }
  incomingState.config.customization.updatedAt = Date.now();
  persistedState = incomingState;
  savePersistedServerState(persistedState);
  res.json({
    ok: true,
    state: persistedState,
    persistedAt: incomingState.config.customization.updatedAt,
  });
});

// Reset persistent state to factory defaults
app.post('/api/bot/reset', (_req, res) => {
  persistedState = createInitialServerState();
  savePersistedServerState(persistedState);
  res.json({
    ok: true,
    state: persistedState,
  });
});

app.post('/api/bot/chat', async (req, res) => {
  const {
    username = 'member',
    message = '',
    roastMode = persistedState.config.roastMode,
    roastTarget,
    history = [],
    customization: reqCustomization,
  } = req.body || {};

  const customization: RoastCustomization =
    reqCustomization ||
    persistedState.config.customization ||
    createDefaultCustomization();

  const trimmedMsg = String(message || '').trim();

  if (isOwnerQuestion(trimmedMsg)) {
    res.json({
      reply:
        '👑 My official owners and supreme admins are **akshatkrofficial_47531** and **killer_sole5**! Both have full admin command authority. 🍫🔥',
      model: GEMINI_MODEL,
      source: 'deterministic-owner-guard',
    });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallback = buildLocalRoastFallback(
      username,
      trimmedMsg,
      roastTarget,
      Boolean(roastMode),
      customization
    );
    res.json({
      reply: fallback,
      model: GEMINI_MODEL,
      source: 'fallback-engine',
    });
    return;
  }

  try {
    const activeTargetName = roastTarget || username;
    const matchedTargetRule = customization.priorityTargets.find(
      (item) =>
        normalizeIdentifier(item.target) ===
        normalizeIdentifier(activeTargetName)
    );

    const topicsInstruction =
      customization.roastTopics.length > 0
        ? `Configured Roast Topics to weave in when fitting: ${customization.roastTopics.join(', ')}.`
        : '';

    const targetLoreInstruction = matchedTargetRule
      ? `Specific Admin-Defined Target Lore for @${matchedTargetRule.target}: "${matchedTargetRule.angle}" (added by ${matchedTargetRule.addedBy}). Make sure to roast them specifically using this angle!`
      : '';

    const systemInstruction = [
      'You are Brownie Bot, the ultimate Discord server roast and economy bot powered by Google Gemini.',
      'Your two official owners and supreme server admins are akshatkrofficial_47531 and killer_sole5. If anyone asks who owns, created, or controls you, always credit both akshatkrofficial_47531 and killer_sole5.',
      `Roast Delivery Style: ${customization.roastStyle}.`,
      `Roast Intensity Level: ${customization.roastIntensity}.`,
      topicsInstruction,
      targetLoreInstruction,
      customization.customPersonaDirective
        ? `Custom Server Persona Rule: ${customization.customPersonaDirective}`
        : '',
      'Format replies cleanly for Discord (1 to 3 punchy sentences, use bolding and emojis tastefully). Never output internal chain-of-thought or meta-analysis.',
      roastMode || roastTarget
        ? `SAVAGE ROAST MODE IS ACTIVE (Intensity: ${customization.roastIntensity}, Style: ${customization.roastStyle}). Deliver a hilarious, razor-sharp, creative, and witty roast targeting ${activeTargetName} based on what they said ("${trimmedMsg}"). While strictly avoiding slurs, hate speech, or real-world harm, do not hold back on comedic destruction.`
        : 'SAVAGE ROAST MODE IS OFF. Be a witty, charismatic, helpful Discord server bot with a chocolate/brownie theme.',
    ]
      .filter(Boolean)
      .join(' ');

    const recentHistory = Array.isArray(history) ? history.slice(-8) : [];
    const contents = [
      ...recentHistory.map((h: { role?: string; content?: string }) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(h.content || '') }],
      })),
      {
        role: 'user',
        parts: [
          {
            text: roastTarget
              ? `${username} used the roast command on "${roastTarget}". Context message: "${trimmedMsg || `Roast ${roastTarget} mercilessly using style ${customization.roastStyle}!`}"`
              : `${username}: ${trimmedMsg}`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const text = (response.text ?? '').trim();
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    res.json({
      reply: text,
      model: GEMINI_MODEL,
      source: 'gemini-api',
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[Gemini Bot Brain Error]:', errMsg);
    const fallback = buildLocalRoastFallback(
      username,
      trimmedMsg,
      roastTarget,
      Boolean(roastMode),
      customization
    );
    res.json({
      reply: fallback,
      model: GEMINI_MODEL,
      source: 'fallback-engine',
      warning: errMsg,
    });
  }
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍫 Brownie Bot Server running on http://localhost:${PORT}`);
  });
}

startServer();
