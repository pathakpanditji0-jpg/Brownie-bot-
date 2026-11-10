import { RoastCustomization } from './botEngine';

export function generateDiscordBotSource(options: {
  roastModeDefault: boolean;
  customization: RoastCustomization;
}): string {
  const { customization } = options;
  const serializedCustomization = JSON.stringify(customization, null, 6);

  return `/**
 * 🍫 BROWNIE BOT — GEMINI-POWERED DISCORD ROAST & ECONOMY SERVER BOT
 * Brain: Google Gemini (@google/genai SDK - gemini-3.8-flash)
 * Configured Owners & Admins: akshatkrofficial_47531, killer_sole5
 * Persistent Customization Module: Greetings, Roast Topics, Target Lore, Intensity & Style
 *
 * Setup:
 * 1. npm install discord.js @google/genai dotenv
 * 2. Set DISCORD_TOKEN and GEMINI_API_KEY in your .env file
 * 3. Run: node index.js
 */

require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits
} = require("discord.js");
const { GoogleGenAI } = require("@google/genai");
const fs = require("node:fs");
const path = require("node:path");

const TOKEN = process.env.DISCORD_TOKEN;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-3.8-flash";

// Dual Bot Owners & Admin Authorities
const OWNER_IDENTIFIERS = new Set([
  "akshatkrofficial_47531",
  "killer_sole5",
  "akshatkrofficial",
  ...String(process.env.BROWNIE_OWNER_ID || "")
    .split(/[\\s,]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
]);

function isBotOwnerOrAdmin(user, member = null) {
  if (!user) return false;
  const id = String(user.id || "").trim().toLowerCase();
  const username = String(user.username || "").trim().toLowerCase();
  const globalName = String(user.globalName || "").trim().toLowerCase();
  const tag = String(user.tag || "").trim().toLowerCase();

  if (
    OWNER_IDENTIFIERS.has(id) ||
    OWNER_IDENTIFIERS.has(username) ||
    (globalName && OWNER_IDENTIFIERS.has(globalName)) ||
    (tag && OWNER_IDENTIFIERS.has(tag))
  ) {
    return true;
  }
  return Boolean(member?.permissions?.has?.(PermissionFlagsBits.Administrator));
}

const PREFIX = "*";
const DATA_FILE = path.join(__dirname, "brownie-data.json");

const DEFAULT_CUSTOMIZATION = ${serializedCustomization};

let db = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    console.error("Failed reading brownie-data.json:", err.message);
  }
}

function save() {
  const tempFile = \`\${DATA_FILE}.tmp\`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tempFile, DATA_FILE);
}

function guildSettings(guildId) {
  if (!db[guildId]) db[guildId] = {};
  if (!db[guildId]._config) {
    db[guildId]._config = {
      chatbotChannelId: "",
      roastMode: ${options.roastModeDefault ? 'true' : 'false'},
      roastIntensity: DEFAULT_CUSTOMIZATION.roastIntensity,
      customization: structuredClone(DEFAULT_CUSTOMIZATION),
      botChannelIds: [],
      workChannelId: "",
      messageGoal: 20,
      maxGameBet: 100000,
      slotJackpotMultiplier: 10,
      bakeryPrices: {}
    };
    save();
  }
  if (!db[guildId]._config.customization) {
    db[guildId]._config.customization = structuredClone(DEFAULT_CUSTOMIZATION);
    save();
  }
  return db[guildId]._config;
}

function account(guildId, userId) {
  if (!db[guildId]) db[guildId] = {};
  if (!db[guildId][userId]) {
    db[guildId][userId] = {
      wallet: 500,
      bank: 0,
      xp: 0,
      job: "Yapper",
      streak: 0,
      inventory: {
        xp_scroll: 0,
        no_prefix_pass: false
      },
      bakeryInventory: {},
      browniePet: { name: "Brownie", level: 1, xp: 0, happiness: 80, hunger: 80, evolution: "Baby Brownie" },
      history: []
    };
  }
  return db[guildId][userId];
}

function chips(n) {
  return \`\${Math.floor(n).toLocaleString("en-US")} Chocochips 🍫\`;
}

function formatCustomGreeting(template, username, serverName) {
  const raw = String(template || "").trim() || "Welcome to {server}, @{user}! 🍫🔥";
  return raw.replace(/\\{user\\}/gi, username).replace(/\\{server\\}/gi, serverName || "the server");
}

// ============================================================================
// GEMINI AI BRAIN — SAVAGE ROAST & CUSTOMIZATION MODULE
// ============================================================================
const chatHistories = new Map();
const MAX_CHAT_HISTORY_MESSAGES = 10;

function isOwnerQuestion(value) {
  const t = String(value || "").toLowerCase().replace(/[!?.,]+/g, " ").trim();
  return /^(owner|who is your owner|who is the owner|who created you|who made you|tumhara owner kaun hai|tera owner kaun hai|owner kaun hai|who owns you)$/.test(t)
    || /\\bwho(?:'s| is)\\s+(?:your|the)\\s+owner\\b/.test(t)
    || /\\b(tumhara|tera|aapka) owner kaun\\b/.test(t);
}

async function generateBrownieChatReply(message, explicitRoastTarget = null) {
  const userText = String(message.content || "").trim().slice(0, 1400);
  if (!userText && !explicitRoastTarget) return;

  if (isOwnerQuestion(userText)) {
    await message.reply({
      content: "👑 My owners & supreme admins are **akshatkrofficial_47531** and **killer_sole5**! 🍫🔥",
      allowedMentions: { parse: [] }
    }).catch(() => {});
    return;
  }

  const settings = guildSettings(message.guild.id);
  const cust = settings.customization;
  const roastMode = Boolean(settings.roastMode) || Boolean(explicitRoastTarget);
  const historyKey = \`\${message.guild.id}:\${message.channel.id}\`;
  const previousHistory = chatHistories.get(historyKey) || [];

  const targetName = explicitRoastTarget || message.author.username;
  const matchedTargetLore = (cust.priorityTargets || []).find(
    item => String(item.target || "").toLowerCase() === String(targetName).toLowerCase()
  );

  const systemInstruction = [
    "You are Brownie Bot, the ultimate Discord server roast & economy bot powered by Google Gemini.",
    "Your official owners and supreme admins are akshatkrofficial_47531 and killer_sole5.",
    \`Roast Delivery Style: \${cust.roastStyle || "Desi Hinglish"}.\`,
    \`Roast Intensity Level: \${cust.roastIntensity || "Savage"}.\`,
    cust.roastTopics?.length ? \`Configured Server Roast Topics: \${cust.roastTopics.join(", ")}.\` : "",
    matchedTargetLore ? \`Specific Admin Target Lore for @\${matchedTargetLore.target}: "\${matchedTargetLore.angle}".\` : "",
    cust.customPersonaDirective || "",
    "Keep replies punchy, witty, and formatted cleanly for Discord (1-3 sentences max).",
    roastMode
      ? \`ROAST MODE IS ON (Intensity: \${cust.roastIntensity}, Style: \${cust.roastStyle}). Deliver a sharp, hilarious, creative, and savage roast responding directly to what the member said (or roasting \${targetName}). Avoid slurs, hate speech, or real-world harm.\`
      : "ROAST MODE IS OFF. Be a witty, charismatic, helpful Discord companion with a chocolate/brownie vibe."
  ].filter(Boolean).join(" ");

  try {
    if (typeof message.channel.sendTyping === "function") {
      await message.channel.sendTyping().catch(() => {});
    }

    const promptText = explicitRoastTarget
      ? \`\${message.author.username} commanded you to deliver a savage roast to "\${explicitRoastTarget}". Context: \${userText}\`
      : \`\${message.author.username}: \${userText}\`;

    const contents = [
      ...previousHistory.map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }]
      })),
      { role: "user", parts: [{ text: promptText }] }
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction
      }
    });

    const answer = (response.text || "").trim();
    if (!answer) throw new Error("Empty Gemini response");

    const updatedHistory = [
      ...previousHistory,
      { role: "user", content: promptText },
      { role: "assistant", content: answer }
    ].slice(-MAX_CHAT_HISTORY_MESSAGES);
    chatHistories.set(historyKey, updatedHistory);

    await message.reply({
      content: answer.slice(0, 1900),
      allowedMentions: { parse: [] }
    });
  } catch (error) {
    console.error("[BrownieBot Gemini Error]:", error.message);
    await message.reply({
      content: "🔥 Tera message dekh ke mera circuit bhi roast ho gaya—ek second baad wapas aao! 🍫",
      allowedMentions: { parse: [] }
    }).catch(() => {});
  }
}

// ============================================================================
// DISCORD CLIENT & PERSISTENT CUSTOMIZATION COMMANDS
// ============================================================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once("ready", () => {
  console.log(\`🍫 Brownie Bot (Gemini Brain) is online as \${client.user.tag}\`);
  console.log("👑 Authorized Owners/Admins: akshatkrofficial_47531, killer_sole5");
});

// Persistent Custom Greeting on Member Join
client.on("guildMemberAdd", async member => {
  const settings = guildSettings(member.guild.id);
  const cust = settings.customization;
  if (!cust.greetingEnabled || !cust.customGreeting) return;
  const channel =
    (settings.chatbotChannelId && member.guild.channels.cache.get(settings.chatbotChannelId)) ||
    member.guild.systemChannel;
  if (channel && typeof channel.send === "function") {
    const text = formatCustomGreeting(cust.customGreeting, member.user.username, member.guild.name);
    await channel.send({ content: text, allowedMentions: { users: [member.id] } }).catch(() => {});
  }
});

client.on("messageCreate", async message => {
  if (!message.guild || message.author.bot || message.webhookId) return;
  const content = String(message.content || "").trim();
  if (!content) return;

  const settings = guildSettings(message.guild.id);
  const cust = settings.customization;
  const userAcc = account(message.guild.id, message.author.id);
  const isAdmin = isBotOwnerOrAdmin(message.author, message.member);

  const hasPrefix = content.startsWith(PREFIX);
  if (hasPrefix || userAcc.inventory.no_prefix_pass) {
    const raw = hasPrefix ? content.slice(PREFIX.length).trim() : content;
    const parts = raw.split(/\\s+/).filter(Boolean);
    const cmd = (parts.shift() || "").toLowerCase();

    if (cmd === "setgreeting") {
      if (!isAdmin) return message.reply("🔒 Only **akshatkrofficial_47531**, **killer_sole5**, or Server Admins can customize greetings.");
      const newGreeting = parts.join(" ").trim();
      if (!newGreeting) return message.reply("Usage: \`*setgreeting Welcome to {server}, @{user}!\`");
      cust.customGreeting = newGreeting;
      cust.greetingEnabled = true;
      save();
      return message.reply(\`👋 Custom greeting saved & persisted to disk:\\n"\${newGreeting}"\`);
    }

    if (cmd === "roasttopic") {
      if (!isAdmin) return message.reply("🔒 Only **akshatkrofficial_47531** and **killer_sole5** can manage roast topics.");
      const sub = (parts.shift() || "list").toLowerCase();
      const topic = parts.join(" ").trim();
      if (sub === "add" && topic) {
        if (!cust.roastTopics.includes(topic)) cust.roastTopics.push(topic);
        save();
        return message.reply(\`🎯 Added roast topic **"\${topic}"** (persisted to brownie-data.json).\`);
      }
      if (sub === "remove" && topic) {
        cust.roastTopics = cust.roastTopics.filter(t => t.toLowerCase() !== topic.toLowerCase());
        save();
        return message.reply(\`🎯 Removed roast topic **"\${topic}"**.\`);
      }
      return message.reply(\`🎯 **Active Roast Topics:** \\n\${cust.roastTopics.map((t, i) => \`\${i + 1}. \${t}\`).join("\\n") || "None"}\`);
    }

    if (cmd === "roasttarget") {
      if (!isAdmin) return message.reply("🔒 Only **akshatkrofficial_47531** and **killer_sole5** can configure priority roast targets.");
      const sub = (parts.shift() || "list").toLowerCase();
      if (sub === "add") {
        const mention = message.mentions.users.first();
        const targetName = mention ? mention.username : (parts.shift() || "");
        const angle = parts.filter(p => !p.startsWith("<@")).join(" ").trim();
        if (!targetName || !angle) return message.reply("Usage: \`*roasttarget add @member <roast angle>\`");
        cust.priorityTargets = cust.priorityTargets.filter(t => t.target.toLowerCase() !== targetName.toLowerCase());
        cust.priorityTargets.push({ target: targetName, angle, addedBy: message.author.username });
        save();
        return message.reply(\`🎯 Priority roast target **@\${targetName}** saved with angle: _"\${angle}"_\`);
      }
      return message.reply(\`🎯 **Priority Roast Targets:**\\n\${cust.priorityTargets.map(t => \`• @\${t.target}: "\${t.angle}"\`).join("\\n") || "None"}\`);
    }

    if (cmd === "roaststyle") {
      if (!isAdmin) return message.reply("🔒 Only **akshatkrofficial_47531** and **killer_sole5** can change roast style.");
      const style = parts.join(" ").trim();
      if (!style) return message.reply(\`Current style: **\${cust.roastStyle}**\`);
      cust.roastStyle = style;
      save();
      return message.reply(\`🎭 Roast style updated to **\${style}** and persisted to disk.\`);
    }

    if (cmd === "roast") {
      const sub = (parts[0] || "").toLowerCase();
      if (sub === "on" || sub === "off") {
        if (!isAdmin) {
          return message.reply("🔒 Only **akshatkrofficial_47531**, **killer_sole5**, or Server Admins can toggle roast mode.");
        }
        settings.roastMode = sub === "on";
        save();
        return message.reply(
          settings.roastMode
            ? "🔥 **Savage Roast Mode: ON!** Gemini Brain is locked and loaded."
            : "🍫 **Savage Roast Mode: OFF!** Friendly mode restored."
        );
      }
      if (sub === "intensity" || sub === "level") {
        if (!isAdmin) return message.reply("🔒 Only **akshatkrofficial_47531** and **killer_sole5** can change roast intensity.");
        const level = parts[1] || "Savage";
        settings.roastIntensity = level;
        cust.roastIntensity = level;
        save();
        return message.reply(\`⚡ Roast intensity updated to **\${level}** and persisted.\`);
      }
      const targetUser = message.mentions.users.first();
      const targetName = targetUser ? targetUser.username : (parts[0] || message.author.username);
      return generateBrownieChatReply(message, targetName);
    }

    if (cmd === "givecash") {
      if (!isAdmin) {
        return message.reply("❌ Only **akshatkrofficial_47531** and **killer_sole5** can execute \`*givecash\`.");
      }
      const target = message.mentions.users.first();
      const amount = Number(parts.find(p => /^\\d+$/.test(p)));
      if (!target || !Number.isSafeInteger(amount) || amount < 1) {
        return message.reply("Usage: \`*givecash @member <amount>\`");
      }
      const rec = account(message.guild.id, target.id);
      rec.wallet += amount;
      save();
      return message.reply(\`🍫 Admin **\${message.author.username}** granted **\${chips(amount)}** to **\${target.username}**!\`);
    }

    if (cmd === "takecash") {
      if (!isAdmin) {
        return message.reply("❌ Only **akshatkrofficial_47531** and **killer_sole5** can execute \`*takecash\`.");
      }
      const target = message.mentions.users.first();
      if (!target) return message.reply("Usage: \`*takecash @member <amount|all>\`");
      const rec = account(message.guild.id, target.id);
      const amtArg = parts.find(p => !p.startsWith("<@"));
      const takeAmt = String(amtArg).toLowerCase() === "all" ? rec.wallet + rec.bank : Number(amtArg);
      if (!Number.isSafeInteger(takeAmt) || takeAmt < 1) return message.reply("Specify a valid amount.");
      const fromWallet = Math.min(rec.wallet, takeAmt);
      rec.wallet -= fromWallet;
      rec.bank = Math.max(0, rec.bank - (takeAmt - fromWallet));
      save();
      return message.reply(\`🛡️ Admin **\${message.author.username}** deducted **\${chips(takeAmt)}** from **\${target.username}**.\`);
    }

    if (cmd === "noprefix") {
      if (!isAdmin) {
        return message.reply("❌ Only **akshatkrofficial_47531** and **killer_sole5** can manage No Prefix Passes.");
      }
      const target = message.mentions.users.first();
      const action = (parts.find(p => !p.startsWith("<@")) || "add").toLowerCase();
      if (!target) return message.reply("Usage: \`*noprefix @member add|remove\`");
      const rec = account(message.guild.id, target.id);
      rec.inventory.no_prefix_pass = ["add", "grant", "give", "on"].includes(action);
      save();
      return message.reply(
        rec.inventory.no_prefix_pass
          ? \`✅ Granted permanent **No Prefix Pass** to **\${target.username}**.\`
          : \`✅ Revoked **No Prefix Pass** from **\${target.username}**.\`
      );
    }

    if (cmd === "balance" || cmd === "bal") {
      const target = message.mentions.users.first() || message.author;
      const b = account(message.guild.id, target.id);
      return message.reply(\`🍫 **\${target.username}'s Balance**\\nWallet: **\${chips(b.wallet)}**\\nBank: **\${chips(b.bank)}**\`);
    }

    if (cmd === "daily") {
      const reward = 350;
      userAcc.wallet += reward;
      save();
      return message.reply(\`🎁 Daily reward claimed: **+\${chips(reward)}**!\`);
    }
  }

  // Automatic Gemini Chat / Roast in configured chatbot channel or when bot is mentioned
  if (
    (settings.chatbotChannelId && message.channel.id === settings.chatbotChannelId) ||
    message.mentions.has(client.user)
  ) {
    await generateBrownieChatReply(message);
  }
});

if (TOKEN) {
  client.login(TOKEN);
} else {
  console.warn("Set DISCORD_TOKEN and GEMINI_API_KEY in .env to connect to Discord.");
}
`;
}
