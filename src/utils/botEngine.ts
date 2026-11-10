export interface DiscordUser {
  id: string;
  username: string;
  globalName?: string;
  roleLabel: string;
  avatarColor: string;
}

export interface BrowniePet {
  name: string;
  level: number;
  xp: number;
  happiness: number;
  hunger: number;
  evolution: string;
}

export interface AccountData {
  wallet: number;
  bank: number;
  job: 'Yapper' | 'Messages Grinder';
  xp: number;
  streak: number;
  workKitOwned: boolean;
  workKitActive: boolean;
  noPrefixPass: boolean;
  xpScrolls: number;
  luckyCharms: number;
  bakeryInventory: Record<string, number>;
  browniePet: BrowniePet;
  history: Array<{ text: string; at: number }>;
}

export type RoastIntensity = 'Playful' | 'Savage' | 'Nuclear';
export type RoastStyle =
  | 'Desi Hinglish'
  | 'Deadpan Sarcasm'
  | 'Shakespearean Villain'
  | 'Esports Caster'
  | 'Silicon Valley Tech Bro';

export interface RoastTargetRule {
  target: string;
  angle: string;
  addedBy: string;
}

export interface RoastCustomization {
  customGreeting: string;
  greetingEnabled: boolean;
  roastIntensity: RoastIntensity;
  roastStyle: RoastStyle;
  roastTopics: string[];
  priorityTargets: RoastTargetRule[];
  customPersonaDirective: string;
  updatedAt: number;
  updatedBy: string;
}

export interface GuildConfig {
  roastMode: boolean;
  roastIntensity: RoastIntensity;
  customization: RoastCustomization;
  chatbotChannelId: string;
  botChannelIds: string[];
  workChannelId: string;
  messageGoal: number;
  maxGameBet: number;
  slotJackpotMultiplier: number;
  shopPrices: Record<string, number>;
  bakeryPrices: Record<string, number>;
  bakeryMarketValues: Record<string, number>;
}

export interface ServerState {
  config: GuildConfig;
  accounts: Record<string, AccountData>;
}

export const CONFIGURED_OWNERS = [
  'akshatkrofficial_47531',
  'killer_sole5',
] as const;

export const ROAST_STYLES: RoastStyle[] = [
  'Desi Hinglish',
  'Deadpan Sarcasm',
  'Shakespearean Villain',
  'Esports Caster',
  'Silicon Valley Tech Bro',
];

export const ROAST_INTENSITIES: RoastIntensity[] = [
  'Playful',
  'Savage',
  'Nuclear',
];

export const SERVER_USERS: DiscordUser[] = [
  {
    id: '109283746501928374',
    username: 'akshatkrofficial_47531',
    globalName: 'AkshatkrOfficial',
    roleLabel: 'Bot Owner & Admin',
    avatarColor: '#D97706',
  },
  {
    id: '293847561029384756',
    username: 'killer_sole5',
    globalName: 'Killer_Sole5',
    roleLabel: 'Bot Owner & Admin',
    avatarColor: '#DC2626',
  },
  {
    id: '384756192837465192',
    username: 'shadow_yapper99',
    globalName: 'ShadowYapper',
    roleLabel: 'Server Member',
    avatarColor: '#2563EB',
  },
  {
    id: '475869201928374650',
    username: 'choco_grinder',
    globalName: 'ChocoGrinder',
    roleLabel: 'Server Member',
    avatarColor: '#16A34A',
  },
];

export const BAKERY_ITEMS: Record<
  string,
  { name: string; emoji: string; baseValue: number }
> = {
  cookie: { name: 'Cookies', emoji: '🍪', baseValue: 50 },
  chocolate: { name: 'Chocolate', emoji: '🍫', baseValue: 100 },
  cake: { name: 'Cake', emoji: '🎂', baseValue: 250 },
  brownie: { name: 'Brownie', emoji: '🧁', baseValue: 120 },
  pastries: { name: 'Pastries', emoji: '🥐', baseValue: 80 },
  puffs: { name: 'Puffs', emoji: '🥟', baseValue: 40 },
  sweet_rolls: { name: 'Sweet Rolls', emoji: '🍥', baseValue: 70 },
  donuts: { name: 'Donuts', emoji: '🍩', baseValue: 60 },
};

export const SHOP_ITEMS: Record<
  string,
  { name: string; description: string; defaultPrice: number }
> = {
  work_kit: {
    name: 'Work Kit',
    description: 'Adds a 10% bonus to eligible work rewards while owned and active.',
    defaultPrice: 5000,
  },
  lucky_charm: {
    name: 'Lucky Charm',
    description: 'Collectible charm with 60% resale protection.',
    defaultPrice: 2500,
  },
  xp_scroll: {
    name: 'XP Scroll',
    description: 'Use one to immediately gain +100 Job XP.',
    defaultPrice: 1500,
  },
  no_prefix_pass: {
    name: 'No Prefix Pass',
    description: 'Lets you execute recognized commands without typing the * prefix.',
    defaultPrice: 5000000,
  },
};

export function normalizeIdentifier(value: string | undefined | null): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '');
}

export function isBotOwnerOrAdmin(
  user: Pick<DiscordUser, 'id' | 'username' | 'globalName'> | null | undefined,
  extraOwnerEnv = ''
): boolean {
  if (!user) return false;
  const envList = String(extraOwnerEnv || '')
    .split(/[\s,]+/)
    .map(normalizeIdentifier)
    .filter(Boolean);

  const allowedSet = new Set<string>([
    ...CONFIGURED_OWNERS.map(normalizeIdentifier),
    'akshatkrofficial',
    '109283746501928374',
    '293847561029384756',
    ...envList,
  ]);

  const idNorm = normalizeIdentifier(user.id);
  const userNorm = normalizeIdentifier(user.username);
  const globalNorm = normalizeIdentifier(user.globalName);

  return (
    allowedSet.has(idNorm) ||
    allowedSet.has(userNorm) ||
    (Boolean(globalNorm) && allowedSet.has(globalNorm))
  );
}

export function isOwnerQuestion(value: string): boolean {
  const t = String(value || '')
    .toLowerCase()
    .replace(/[!?.,…。，！؟]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (
    /^(owner|who is your owner|who is the owner|who created you|who made you|tumhara owner kaun hai|tera owner kaun hai|aapka owner kaun hai|owner kaun hai|who owns you)$/.test(
      t
    ) ||
    /\bwho(?:'s| is)\s+(?:your|the|ur)\s+owner\b/.test(t) ||
    /\bwho (?:created|made|built) you\b/.test(t) ||
    /\b(tumhara|tera|aapka) owner kaun\b/.test(t)
  );
}

export function formatCustomGreeting(
  template: string,
  username: string,
  serverName = 'Brownie Server'
): string {
  const raw =
    template.trim() ||
    'Welcome to {server}, @{user}! Ready to get roasted or stack Chocochips? 🍫🔥';
  return raw
    .replace(/\{user\}/gi, username)
    .replace(/\{server\}/gi, serverName);
}

export function formatChips(n: number): string {
  return `${Math.floor(n).toLocaleString('en-US')} Chocochips 🍫`;
}

export function createDefaultCustomization(): RoastCustomization {
  return {
    customGreeting:
      'Welcome to {server}, @{user}! Keep your helmet on—Gemini Roast Brain is watching and akshatkrofficial_47531 & killer_sole5 run this turf. 🍫🔥',
    greetingEnabled: true,
    roastIntensity: 'Savage',
    roastStyle: 'Desi Hinglish',
    roastTopics: [
      'rank hardstuck bronze gameplay',
      'late night Discord yapping',
      'zero Chocochips broke wallet energy',
      'copy-paste comeback attempts',
    ],
    priorityTargets: [
      {
        target: 'shadow_yapper99',
        angle: 'Spends 6 hours in voice chat yapping but still misses every daily streak',
        addedBy: 'akshatkrofficial_47531',
      },
      {
        target: 'choco_grinder',
        angle: 'Grinds messages non-stop only to lose all Chocochips on a single coinflip',
        addedBy: 'killer_sole5',
      },
    ],
    customPersonaDirective:
      'Blend sharp Desi Hinglish street wit with savage gaming banter; hype up akshatkrofficial_47531 and killer_sole5 as untouchable server legends.',
    updatedAt: Date.now(),
    updatedBy: 'akshatkrofficial_47531',
  };
}

export function createInitialServerState(): ServerState {
  const defaultAccounts: Record<string, AccountData> = {};
  for (const u of SERVER_USERS) {
    const isOwner = isBotOwnerOrAdmin(u);
    defaultAccounts[u.username] = {
      wallet: isOwner ? 25000 : 1200,
      bank: isOwner ? 100000 : 3500,
      job: u.username === 'choco_grinder' ? 'Messages Grinder' : 'Yapper',
      xp: isOwner ? 450 : 120,
      streak: isOwner ? 7 : 2,
      workKitOwned: isOwner,
      workKitActive: isOwner,
      noPrefixPass: isOwner,
      xpScrolls: isOwner ? 3 : 1,
      luckyCharms: isOwner ? 2 : 0,
      bakeryInventory: {
        cookie: 3,
        brownie: 2,
        chocolate: isOwner ? 5 : 1,
      },
      browniePet: {
        name: isOwner ? 'Destroyer Brownie' : 'Cocoa',
        level: isOwner ? 8 : 2,
        xp: isOwner ? 340 : 60,
        happiness: 90,
        hunger: 85,
        evolution: isOwner ? 'Growing Brownie' : 'Baby Brownie',
      },
      history: [
        {
          text: isOwner
            ? 'Owner vault initialized: +25,000 Chocochips'
            : 'Starter grant: +1,200 Chocochips',
          at: Date.now() - 3600000,
        },
      ],
    };
  }

  const customization = createDefaultCustomization();

  return {
    config: {
      roastMode: true,
      roastIntensity: customization.roastIntensity,
      customization,
      chatbotChannelId: 'roast-arena',
      botChannelIds: ['roast-arena', 'bot-commands', 'bakery-market'],
      workChannelId: 'bot-commands',
      messageGoal: 25,
      maxGameBet: 100000,
      slotJackpotMultiplier: 10,
      shopPrices: {
        work_kit: 5000,
        lucky_charm: 2500,
        xp_scroll: 1500,
        no_prefix_pass: 5000000,
      },
      bakeryPrices: {
        cookie: 65,
        chocolate: 140,
        cake: 320,
        brownie: 160,
        pastries: 110,
        puffs: 55,
        sweet_rolls: 95,
        donuts: 85,
      },
      bakeryMarketValues: {
        cookie: 58,
        chocolate: 115,
        cake: 275,
        brownie: 142,
        pastries: 88,
        puffs: 44,
        sweet_rolls: 76,
        donuts: 64,
      },
    },
    accounts: defaultAccounts,
  };
}

export interface CommandExecutionResult {
  handled: boolean;
  replyText: string;
  embedTitle?: string;
  embedColor?: string;
  isError?: boolean;
  requiresAiRoast?: boolean;
  roastTarget?: string;
  updatedState: ServerState;
}

export function resolveTargetUsername(
  rawArg: string | undefined,
  fallbackUsername: string
): string {
  if (!rawArg) return fallbackUsername;
  const cleaned = normalizeIdentifier(rawArg.replace(/[<@!>]/g, ''));
  const found = SERVER_USERS.find(
    (u) =>
      normalizeIdentifier(u.username) === cleaned ||
      normalizeIdentifier(u.globalName) === cleaned ||
      normalizeIdentifier(u.id) === cleaned ||
      normalizeIdentifier(u.username).includes(cleaned)
  );
  return found ? found.username : cleaned || fallbackUsername;
}

export function ensureAccount(
  state: ServerState,
  username: string
): AccountData {
  const key = normalizeIdentifier(username);
  const existingKey = Object.keys(state.accounts).find(
    (k) => normalizeIdentifier(k) === key
  );
  if (existingKey) return state.accounts[existingKey];

  state.accounts[username] = {
    wallet: 500,
    bank: 0,
    job: 'Yapper',
    xp: 0,
    streak: 1,
    workKitOwned: false,
    workKitActive: false,
    noPrefixPass: false,
    xpScrolls: 0,
    luckyCharms: 0,
    bakeryInventory: { cookie: 1 },
    browniePet: {
      name: 'Brownie',
      level: 1,
      xp: 0,
      happiness: 75,
      hunger: 75,
      evolution: 'Baby Brownie',
    },
    history: [{ text: 'Account created: +500 Chocochips', at: Date.now() }],
  };
  return state.accounts[username];
}

export function executeBotCommand(
  rawMessage: string,
  actor: DiscordUser,
  currentState: ServerState
): CommandExecutionResult {
  const state: ServerState = structuredClone(currentState);
  if (!state.config.customization) {
    state.config.customization = createDefaultCustomization();
  }
  const actorAccount = ensureAccount(state, actor.username);
  const isOwner = isBotOwnerOrAdmin(actor);
  const trimmed = rawMessage.trim();

  if (!trimmed) {
    return { handled: false, replyText: '', updatedState: state };
  }

  const hasPrefix = trimmed.startsWith('*') || trimmed.startsWith('/');
  const withoutPrefix = hasPrefix ? trimmed.slice(1).trim() : trimmed;
  const parts = withoutPrefix.split(/\s+/).filter(Boolean);
  const cmd = (parts.shift() || '').toLowerCase();

  const knownCommands = new Set([
    'roast',
    'roastuser',
    'setgreeting',
    'greet',
    'roasttopic',
    'roasttarget',
    'roaststyle',
    'roastconfig',
    'balance',
    'bal',
    'daily',
    'weekly',
    'work',
    'job',
    'xp',
    'deposit',
    'dep',
    'withdraw',
    'with',
    'pay',
    'givecash',
    'takecash',
    'noprefix',
    'crime',
    'rob',
    'leaderboard',
    'lb',
    'shop',
    'buy',
    'shop2',
    'value',
    'setprice',
    'inventory',
    'inv',
    'use',
    'pet',
    'showpet',
    'petname',
    'feedpet',
    'playpet',
    'cf',
    'slot',
    'eat',
    'gamemaxbet',
    'slotjackpot',
    'botchannel',
    'chatbotchannel',
    'help',
  ]);

  if (!hasPrefix) {
    if (!(actorAccount.noPrefixPass && knownCommands.has(cmd))) {
      return { handled: false, replyText: '', updatedState: state };
    }
  } else if (!knownCommands.has(cmd)) {
    return { handled: false, replyText: '', updatedState: state };
  }

  switch (cmd) {
    case 'setgreeting': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          embedTitle: 'Admin Permission Required',
          replyText:
            '🔒 Only configured bot owners (**akshatkrofficial_47531** and **killer_sole5**) can customize server greetings.',
          updatedState: state,
        };
      }
      const sub = (parts[0] || '').toLowerCase();
      if (sub === 'off' || sub === 'disable') {
        state.config.customization.greetingEnabled = false;
        state.config.customization.updatedAt = Date.now();
        state.config.customization.updatedBy = actor.username;
        return {
          handled: true,
          embedTitle: '👋 Custom Welcome Greeting Disabled',
          replyText: `Admin **${actor.username}** disabled automatic custom greetings. Setting persisted to storage.`,
          updatedState: state,
        };
      }
      if (sub === 'on' || sub === 'enable') {
        state.config.customization.greetingEnabled = true;
        state.config.customization.updatedAt = Date.now();
        state.config.customization.updatedBy = actor.username;
        return {
          handled: true,
          embedTitle: '👋 Custom Welcome Greeting Enabled',
          replyText: `Admin **${actor.username}** enabled custom greetings!\nPreview: "${formatCustomGreeting(state.config.customization.customGreeting, actor.username)}"`,
          updatedState: state,
        };
      }
      const newGreeting = parts.join(' ').trim();
      if (!newGreeting) {
        return {
          handled: true,
          isError: true,
          replyText:
            'Usage: `*setgreeting Welcome to {server}, @{user}!` or `*setgreeting on|off`.',
          updatedState: state,
        };
      }
      state.config.customization.customGreeting = newGreeting;
      state.config.customization.greetingEnabled = true;
      state.config.customization.updatedAt = Date.now();
      state.config.customization.updatedBy = actor.username;
      return {
        handled: true,
        embedTitle: '👋 Custom Greeting Saved & Persisted',
        replyText: `Template saved by **${actor.username}**:\n"${newGreeting}"\n\nLive Preview:\n${formatCustomGreeting(newGreeting, 'shadow_yapper99')}`,
        updatedState: state,
      };
    }

    case 'greet': {
      const targetUser = parts[0]
        ? resolveTargetUsername(parts[0], actor.username)
        : actor.username;
      const formatted = formatCustomGreeting(
        state.config.customization.customGreeting,
        targetUser
      );
      return {
        handled: true,
        embedTitle: '👋 Server Welcome Greeting',
        replyText: formatted,
        updatedState: state,
      };
    }

    case 'roasttopic': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          embedTitle: 'Admin Permission Required',
          replyText:
            '🔒 Only **akshatkrofficial_47531** and **killer_sole5** can manage roast topics.',
          updatedState: state,
        };
      }
      const action = (parts.shift() || 'list').toLowerCase();
      const topicText = parts.join(' ').trim();

      if (action === 'add' && topicText) {
        if (!state.config.customization.roastTopics.includes(topicText)) {
          state.config.customization.roastTopics.push(topicText);
        }
        state.config.customization.updatedAt = Date.now();
        state.config.customization.updatedBy = actor.username;
        return {
          handled: true,
          embedTitle: '🎯 Roast Topic Added & Persisted',
          replyText: `Added topic **"${topicText}"**. Active topics (${state.config.customization.roastTopics.length}): ${state.config.customization.roastTopics.join(', ')}`,
          updatedState: state,
        };
      }

      if (action === 'remove' || action === 'del') {
        const before = state.config.customization.roastTopics.length;
        state.config.customization.roastTopics =
          state.config.customization.roastTopics.filter(
            (t) => t.toLowerCase() !== topicText.toLowerCase()
          );
        state.config.customization.updatedAt = Date.now();
        state.config.customization.updatedBy = actor.username;
        return {
          handled: true,
          embedTitle: '🎯 Roast Topic Removed',
          replyText:
            before !== state.config.customization.roastTopics.length
              ? `Removed topic **"${topicText}"**.`
              : `Topic "${topicText}" not found.`,
          updatedState: state,
        };
      }

      if (action === 'clear') {
        state.config.customization.roastTopics = [];
        state.config.customization.updatedAt = Date.now();
        state.config.customization.updatedBy = actor.username;
        return {
          handled: true,
          embedTitle: '🎯 Roast Topics Cleared',
          replyText: 'Cleared all custom roast topics.',
          updatedState: state,
        };
      }

      return {
        handled: true,
        embedTitle: '🎯 Configured Roast Topics',
        replyText: state.config.customization.roastTopics.length
          ? state.config.customization.roastTopics
              .map((t, i) => `${i + 1}. **${t}**`)
              .join('\n')
          : 'No custom roast topics configured. Use `*roasttopic add <topic>`.',
        updatedState: state,
      };
    }

    case 'roasttarget': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          embedTitle: 'Admin Permission Required',
          replyText:
            '🔒 Only **akshatkrofficial_47531** and **killer_sole5** can configure priority roast targets.',
          updatedState: state,
        };
      }
      const action = (parts.shift() || 'list').toLowerCase();
      if (action === 'add') {
        const rawTarget = parts.shift();
        const angle = parts.join(' ').trim() || 'Always deserves extra savage commentary';
        if (!rawTarget) {
          return {
            handled: true,
            isError: true,
            replyText: 'Usage: `*roasttarget add @member <custom roast angle/lore>`',
            updatedState: state,
          };
        }
        const targetUsername = resolveTargetUsername(rawTarget, rawTarget);
        const existingIdx =
          state.config.customization.priorityTargets.findIndex(
            (item) =>
              normalizeIdentifier(item.target) ===
              normalizeIdentifier(targetUsername)
          );
        const rule: RoastTargetRule = {
          target: targetUsername,
          angle,
          addedBy: actor.username,
        };
        if (existingIdx >= 0) {
          state.config.customization.priorityTargets[existingIdx] = rule;
        } else {
          state.config.customization.priorityTargets.push(rule);
        }
        state.config.customization.updatedAt = Date.now();
        state.config.customization.updatedBy = actor.username;
        return {
          handled: true,
          embedTitle: '🎯 Priority Roast Target Saved',
          replyText: `Target **@${targetUsername}** locked in with angle: _"${angle}"_ (saved across restarts).`,
          updatedState: state,
        };
      }

      if (action === 'remove' || action === 'del') {
        const rawTarget = parts.shift() || '';
        const targetUsername = resolveTargetUsername(rawTarget, rawTarget);
        state.config.customization.priorityTargets =
          state.config.customization.priorityTargets.filter(
            (item) =>
              normalizeIdentifier(item.target) !==
              normalizeIdentifier(targetUsername)
          );
        state.config.customization.updatedAt = Date.now();
        state.config.customization.updatedBy = actor.username;
        return {
          handled: true,
          embedTitle: '🎯 Priority Roast Target Removed',
          replyText: `Removed **@${targetUsername}** from priority roast targets.`,
          updatedState: state,
        };
      }

      return {
        handled: true,
        embedTitle: '🎯 Priority Roast Targets & Lore Angles',
        replyText: state.config.customization.priorityTargets.length
          ? state.config.customization.priorityTargets
              .map(
                (item, i) =>
                  `${i + 1}. **@${item.target}** — _"${item.angle}"_ (by ${item.addedBy})`
              )
              .join('\n')
          : 'No priority roast targets configured.',
        updatedState: state,
      };
    }

    case 'roaststyle': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          embedTitle: 'Admin Permission Required',
          replyText:
            '🔒 Only **akshatkrofficial_47531** and **killer_sole5** can adjust the roast style.',
          updatedState: state,
        };
      }
      const requested = parts.join(' ').trim().toLowerCase();
      const matched = ROAST_STYLES.find(
        (s) =>
          s.toLowerCase() === requested ||
          s.toLowerCase().includes(requested)
      );
      if (!matched || !requested) {
        return {
          handled: true,
          isError: Boolean(requested),
          embedTitle: '🎭 Available Roast Styles',
          replyText: `Current style: **${state.config.customization.roastStyle}**\nChoose one with \`*roaststyle <style>\`:\n${ROAST_STYLES.map((s) => `• **${s}**`).join('\n')}`,
          updatedState: state,
        };
      }
      state.config.customization.roastStyle = matched;
      state.config.customization.updatedAt = Date.now();
      state.config.customization.updatedBy = actor.username;
      return {
        handled: true,
        embedTitle: '🎭 Roast Style Updated & Persisted',
        replyText: `Admin **${actor.username}** switched Gemini Roast Style to **${matched}**.`,
        updatedState: state,
      };
    }

    case 'roastconfig': {
      const cust = state.config.customization;
      return {
        handled: true,
        embedTitle: '⚙️ Persistent Roast Customization Profile',
        replyText: [
          `• **Roast Mode:** ${state.config.roastMode ? 'ON 🔥' : 'OFF 🍫'}`,
          `• **Intensity & Style:** **${cust.roastIntensity}** · **${cust.roastStyle}**`,
          `• **Custom Greeting (${cust.greetingEnabled ? 'Enabled' : 'Disabled'}):** "${cust.customGreeting}"`,
          `• **Active Topics (${cust.roastTopics.length}):** ${cust.roastTopics.join(', ') || 'None'}`,
          `• **Priority Targets (${cust.priorityTargets.length}):** ${cust.priorityTargets.map((t) => `@${t.target} (${t.angle})`).join(' | ') || 'None'}`,
          `• **Persona Directive:** "${cust.customPersonaDirective || 'Default'}"`,
        ].join('\n'),
        updatedState: state,
      };
    }

    case 'roast': {
      const sub = (parts[0] || '').toLowerCase();
      if (sub === 'on' || sub === 'off') {
        if (!isOwner) {
          return {
            handled: true,
            isError: true,
            embedTitle: 'Admin Permission Required',
            replyText:
              '🔒 Only configured bot owners (**akshatkrofficial_47531** and **killer_sole5**) can toggle global Savage Roast Mode.',
            updatedState: state,
          };
        }
        state.config.roastMode = sub === 'on';
        state.config.customization.updatedAt = Date.now();
        state.config.customization.updatedBy = actor.username;
        return {
          handled: true,
          embedTitle: state.config.roastMode
            ? '🔥 Savage Roast Mode: ON'
            : '🍫 Savage Roast Mode: OFF',
          replyText: state.config.roastMode
            ? `Admin **${actor.username}** enabled **Savage Roast Mode**! Gemini will now roast every message with ruthless comedic precision.`
            : `Admin **${actor.username}** disabled **Savage Roast Mode**. Brownie Bot is back to friendly mode.`,
          updatedState: state,
        };
      }

      if (sub === 'level' || sub === 'intensity') {
        if (!isOwner) {
          return {
            handled: true,
            isError: true,
            embedTitle: 'Admin Permission Required',
            replyText:
              '🔒 Only **akshatkrofficial_47531** and **killer_sole5** can change roast intensity.',
            updatedState: state,
          };
        }
        const levelArg = (parts[1] || '').toLowerCase();
        if (['playful', 'savage', 'nuclear'].includes(levelArg)) {
          const normalizedLevel = (levelArg.charAt(0).toUpperCase() +
            levelArg.slice(1)) as RoastIntensity;
          state.config.roastIntensity = normalizedLevel;
          state.config.customization.roastIntensity = normalizedLevel;
          state.config.customization.updatedAt = Date.now();
          state.config.customization.updatedBy = actor.username;
          return {
            handled: true,
            embedTitle: '⚡ Roast Intensity Updated & Persisted',
            replyText: `Admin **${actor.username}** set Gemini Roast Intensity to **${normalizedLevel}**.`,
            updatedState: state,
          };
        }
      }

      // Otherwise *roast @target roasts a user via Gemini
      const targetName = parts[0]
        ? resolveTargetUsername(parts[0], actor.username)
        : actor.username;
      return {
        handled: true,
        requiresAiRoast: true,
        roastTarget: targetName,
        replyText: '',
        updatedState: state,
      };
    }

    case 'roastuser': {
      const targetName = resolveTargetUsername(parts[0], actor.username);
      return {
        handled: true,
        requiresAiRoast: true,
        roastTarget: targetName,
        replyText: '',
        updatedState: state,
      };
    }

    case 'givecash': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          embedTitle: 'Owner / Admin Command Restricted',
          replyText:
            '❌ Access Denied. Only **akshatkrofficial_47531** and **killer_sole5** can execute `*givecash`.',
          updatedState: state,
        };
      }
      const targetUsername = resolveTargetUsername(parts[0], actor.username);
      const amount = Number(parts[1]);
      if (!Number.isSafeInteger(amount) || amount < 1) {
        return {
          handled: true,
          isError: true,
          replyText: 'Usage: `*givecash @member <amount>` (positive whole number).',
          updatedState: state,
        };
      }
      const recipient = ensureAccount(state, targetUsername);
      recipient.wallet += amount;
      recipient.history.unshift({
        text: `Admin grant from ${actor.username}: +${amount} Chocochips`,
        at: Date.now(),
      });
      return {
        handled: true,
        embedTitle: '🍫 Admin Cash Grant Executed',
        replyText: `Admin **${actor.username}** granted **${formatChips(amount)}** to **${targetUsername}**. New wallet balance: **${formatChips(recipient.wallet)}**.`,
        updatedState: state,
      };
    }

    case 'takecash': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          embedTitle: 'Owner / Admin Command Restricted',
          replyText:
            '❌ Access Denied. Only **akshatkrofficial_47531** and **killer_sole5** can execute `*takecash`.',
          updatedState: state,
        };
      }
      const targetUsername = resolveTargetUsername(parts[0], '');
      if (!targetUsername) {
        return {
          handled: true,
          isError: true,
          replyText: 'Usage: `*takecash @member <amount|all>`',
          updatedState: state,
        };
      }
      const recipient = ensureAccount(state, targetUsername);
      const available = recipient.wallet + recipient.bank;
      const rawAmount = (parts[1] || '').toLowerCase();
      const takeAmount = rawAmount === 'all' ? available : Number(parts[1]);
      if (!Number.isSafeInteger(takeAmount) || takeAmount < 1) {
        return {
          handled: true,
          isError: true,
          replyText: 'Specify a valid positive amount or `all`.',
          updatedState: state,
        };
      }
      const actualTaken = Math.min(available, takeAmount);
      const fromWallet = Math.min(recipient.wallet, actualTaken);
      const fromBank = actualTaken - fromWallet;
      recipient.wallet -= fromWallet;
      recipient.bank -= fromBank;
      recipient.history.unshift({
        text: `Admin deduction by ${actor.username}: -${actualTaken} Chocochips`,
        at: Date.now(),
      });
      return {
        handled: true,
        embedTitle: '🛡️ Admin Balance Deduction',
        replyText: `Admin **${actor.username}** deducted **${formatChips(actualTaken)}** from **${targetUsername}**. Remaining wallet: **${formatChips(recipient.wallet)}** · Bank: **${formatChips(recipient.bank)}**.`,
        updatedState: state,
      };
    }

    case 'noprefix': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          embedTitle: 'Owner / Admin Command Restricted',
          replyText:
            '❌ Access Denied. Only **akshatkrofficial_47531** and **killer_sole5** can grant or revoke No Prefix Passes.',
          updatedState: state,
        };
      }
      const targetUsername = resolveTargetUsername(parts[0], actor.username);
      const action = (parts[1] || 'add').toLowerCase();
      const recipient = ensureAccount(state, targetUsername);
      const grant = ['add', 'grant', 'give', 'on'].includes(action);
      recipient.noPrefixPass = grant;
      return {
        handled: true,
        embedTitle: '⚡ No-Prefix Pass Updated',
        replyText: grant
          ? `✅ Admin **${actor.username}** granted the permanent **No Prefix Pass** to **${targetUsername}**.`
          : `✅ Admin **${actor.username}** revoked the **No Prefix Pass** from **${targetUsername}**.`,
        updatedState: state,
      };
    }

    case 'setprice': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          embedTitle: 'Admin Permission Required',
          replyText:
            '🔒 Only **akshatkrofficial_47531** and **killer_sole5** can lock Brownie Bakery prices.',
          updatedState: state,
        };
      }
      const itemId = (parts[0] || '').toLowerCase().replace(/[\s-]+/g, '_');
      const price = Number(parts[1]);
      if (!BAKERY_ITEMS[itemId] || !Number.isSafeInteger(price) || price < 1) {
        return {
          handled: true,
          isError: true,
          replyText: `Usage: \`*setprice <item> <price>\`. Valid items: ${Object.keys(BAKERY_ITEMS).join(', ')}.`,
          updatedState: state,
        };
      }
      state.config.bakeryPrices[itemId] = price;
      return {
        handled: true,
        embedTitle: '🔐 Bakery Price Updated',
        replyText: `**${BAKERY_ITEMS[itemId].emoji} ${BAKERY_ITEMS[itemId].name}** is now priced at **${formatChips(price)}**.`,
        updatedState: state,
      };
    }

    case 'gamemaxbet': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          replyText:
            '🔒 Only **akshatkrofficial_47531** and **killer_sole5** can change max game bets.',
          updatedState: state,
        };
      }
      const maxBet = Number(parts[0]);
      if (!Number.isSafeInteger(maxBet) || maxBet < 100) {
        return {
          handled: true,
          isError: true,
          replyText: 'Specify a valid max bet of at least 100 Chocochips.',
          updatedState: state,
        };
      }
      state.config.maxGameBet = maxBet;
      return {
        handled: true,
        embedTitle: '🎲 Max Game Bet Updated',
        replyText: `Maximum server bet is now **${formatChips(maxBet)}**.`,
        updatedState: state,
      };
    }

    case 'slotjackpot': {
      if (!isOwner) {
        return {
          handled: true,
          isError: true,
          replyText:
            '🔒 Only **akshatkrofficial_47531** and **killer_sole5** can change the slot jackpot multiplier.',
          updatedState: state,
        };
      }
      const mult = Number(parts[0]);
      if (!Number.isSafeInteger(mult) || mult < 2 || mult > 100) {
        return {
          handled: true,
          isError: true,
          replyText: 'Slot jackpot multiplier must be between 2 and 100.',
          updatedState: state,
        };
      }
      state.config.slotJackpotMultiplier = mult;
      return {
        handled: true,
        embedTitle: '🎰 Slot Jackpot Updated',
        replyText: `Slot jackpot gross payout multiplier is now **${mult}×**.`,
        updatedState: state,
      };
    }

    case 'balance':
    case 'bal': {
      const targetUsername = parts[0]
        ? resolveTargetUsername(parts[0], actor.username)
        : actor.username;
      const b = ensureAccount(state, targetUsername);
      return {
        handled: true,
        embedTitle: `🍫 ${targetUsername}'s Balance`,
        replyText: `Wallet: **${formatChips(b.wallet)}**\nBank: **${formatChips(b.bank)}**\nNet Worth: **${formatChips(b.wallet + b.bank)}**\nJob: **${b.job}** (${b.xp} XP)`,
        updatedState: state,
      };
    }

    case 'daily': {
      const reward = 320;
      const bonus = Math.min(actorAccount.streak, 7) * 25;
      actorAccount.streak += 1;
      actorAccount.wallet += reward + bonus;
      actorAccount.history.unshift({
        text: `Daily reward: +${reward + bonus}`,
        at: Date.now(),
      });
      return {
        handled: true,
        embedTitle: '🎁 Daily Chocochips Claimed',
        replyText: `Base reward: **${formatChips(reward)}**\n🔥 Streak bonus (${actorAccount.streak} days): **${formatChips(bonus)}**\nTotal credited: **${formatChips(reward + bonus)}**`,
        updatedState: state,
      };
    }

    case 'weekly': {
      const reward = 1850;
      actorAccount.wallet += reward;
      actorAccount.history.unshift({
        text: `Weekly reward: +${reward}`,
        at: Date.now(),
      });
      return {
        handled: true,
        embedTitle: '🗓️ Weekly Supply Drop',
        replyText: `You claimed your weekly reward of **${formatChips(reward)}**!`,
        updatedState: state,
      };
    }

    case 'work': {
      const base = actorAccount.job === 'Yapper' ? 180 : 160;
      const bonus = actorAccount.workKitOwned && actorAccount.workKitActive
        ? Math.floor(base * 0.1)
        : 0;
      const total = base + bonus;
      actorAccount.wallet += total;
      actorAccount.xp += 25;
      actorAccount.history.unshift({
        text: `${actorAccount.job} shift complete: +${total}`,
        at: Date.now(),
      });
      return {
        handled: true,
        embedTitle: `💼 ${actorAccount.job} Shift Completed`,
        replyText: `You completed your **${actorAccount.job}** task and earned **${formatChips(total)}** ${bonus ? `(includes +${bonus} Work Kit bonus)` : ''} plus **+25 XP**!`,
        updatedState: state,
      };
    }

    case 'job': {
      const desired = parts.join(' ').trim().toLowerCase();
      if (!desired) {
        return {
          handled: true,
          replyText: `💼 Your current job is **${actorAccount.job}**. Use \`*job Yapper\` or \`*job Messages Grinder\`.`,
          updatedState: state,
        };
      }
      if (desired.includes('yapper')) {
        actorAccount.job = 'Yapper';
      } else if (desired.includes('message') || desired.includes('grinder')) {
        actorAccount.job = 'Messages Grinder';
      } else {
        return {
          handled: true,
          isError: true,
          replyText: 'Choose either **Yapper** or **Messages Grinder**.',
          updatedState: state,
        };
      }
      return {
        handled: true,
        embedTitle: '💼 Job Updated',
        replyText: `Your job is now **${actorAccount.job}**. Run \`*work\` to earn Chocochips and XP.`,
        updatedState: state,
      };
    }

    case 'xp': {
      return {
        handled: true,
        replyText: `⭐ **${actor.username}'s Job XP:** ${actorAccount.xp.toLocaleString('en-US')} XP`,
        updatedState: state,
      };
    }

    case 'deposit':
    case 'dep': {
      const raw = (parts[0] || '').toLowerCase();
      const amount = raw === 'all' ? actorAccount.wallet : Number(parts[0]);
      if (!Number.isSafeInteger(amount) || amount < 1 || amount > actorAccount.wallet) {
        return {
          handled: true,
          isError: true,
          replyText: 'Enter a valid amount up to your current wallet balance, or `all`.',
          updatedState: state,
        };
      }
      actorAccount.wallet -= amount;
      actorAccount.bank += amount;
      return {
        handled: true,
        replyText: `🏦 Deposited **${formatChips(amount)}** into your bank.`,
        updatedState: state,
      };
    }

    case 'withdraw':
    case 'with': {
      const raw = (parts[0] || '').toLowerCase();
      const amount = raw === 'all' ? actorAccount.bank : Number(parts[0]);
      if (!Number.isSafeInteger(amount) || amount < 1 || amount > actorAccount.bank) {
        return {
          handled: true,
          isError: true,
          replyText: 'Enter a valid amount up to your bank balance, or `all`.',
          updatedState: state,
        };
      }
      actorAccount.bank -= amount;
      actorAccount.wallet += amount;
      return {
        handled: true,
        replyText: `💵 Withdrew **${formatChips(amount)}** to your wallet.`,
        updatedState: state,
      };
    }

    case 'pay': {
      const targetUsername = resolveTargetUsername(parts[0], '');
      const amount =
        (parts[1] || '').toLowerCase() === 'all'
          ? actorAccount.wallet
          : Number(parts[1]);
      if (
        !targetUsername ||
        normalizeIdentifier(targetUsername) === normalizeIdentifier(actor.username)
      ) {
        return {
          handled: true,
          isError: true,
          replyText: 'Specify another member to pay: `*pay @member <amount>`.',
          updatedState: state,
        };
      }
      if (!Number.isSafeInteger(amount) || amount < 1 || amount > actorAccount.wallet) {
        return {
          handled: true,
          isError: true,
          replyText: 'Insufficient wallet balance or invalid amount.',
          updatedState: state,
        };
      }
      const targetAcc = ensureAccount(state, targetUsername);
      actorAccount.wallet -= amount;
      targetAcc.wallet += amount;
      return {
        handled: true,
        replyText: `💸 Paid **${formatChips(amount)}** to **${targetUsername}**.`,
        updatedState: state,
      };
    }

    case 'crime': {
      if (actorAccount.wallet < 100) {
        return {
          handled: true,
          isError: true,
          replyText: '❌ You need at least 100 Chocochips in your wallet to attempt a crime.',
          updatedState: state,
        };
      }
      const reward = 240;
      actorAccount.wallet += reward;
      return {
        handled: true,
        replyText: `🦹 Heist successful! You raided the cocoa vault and escaped with **${formatChips(reward)}**.`,
        updatedState: state,
      };
    }

    case 'rob': {
      const targetUsername = resolveTargetUsername(parts[0], '');
      if (
        !targetUsername ||
        normalizeIdentifier(targetUsername) === normalizeIdentifier(actor.username)
      ) {
        return {
          handled: true,
          isError: true,
          replyText: 'Choose another member to rob: `*rob @member`.',
          updatedState: state,
        };
      }
      const victim = ensureAccount(state, targetUsername);
      if (victim.wallet < 50) {
        return {
          handled: true,
          isError: true,
          replyText: `**${targetUsername}** doesn't have enough cash in their wallet to rob.`,
          updatedState: state,
        };
      }
      const stolen = Math.max(25, Math.floor(victim.wallet * 0.15));
      victim.wallet -= stolen;
      actorAccount.wallet += stolen;
      return {
        handled: true,
        replyText: `🏴‍☠️ You pickpocketed **${formatChips(stolen)}** from **${targetUsername}**!`,
        updatedState: state,
      };
    }

    case 'leaderboard':
    case 'lb': {
      const sorted = Object.entries(state.accounts)
        .map(([username, acc]) => ({
          username,
          total: acc.wallet + acc.bank,
        }))
        .sort((a, b) => b.total - a.total);
      const lines = sorted.map(
        (entry, idx) => `**${idx + 1}.** ${entry.username} — **${formatChips(entry.total)}**`
      );
      return {
        handled: true,
        embedTitle: '🏆 Chocochips Server Leaderboard',
        replyText: lines.join('\n'),
        updatedState: state,
      };
    }

    case 'shop': {
      const lines = Object.entries(SHOP_ITEMS).map(([id, item]) => {
        const price = state.config.shopPrices[id] ?? item.defaultPrice;
        return `• **${item.name}** (\`${id}\`) — **${formatChips(price)}**\n  _${item.description}_`;
      });
      return {
        handled: true,
        embedTitle: '🛍️ Brownie Bot Shop',
        replyText: `${lines.join('\n\n')}\n\nBuy with \`*buy <item_id>\`.`,
        updatedState: state,
      };
    }

    case 'buy': {
      const rawItem = (parts[0] || '').toLowerCase().replace(/[\s-]+/g, '_');
      if (BAKERY_ITEMS[rawItem]) {
        const price = state.config.bakeryPrices[rawItem];
        if (!price) {
          return {
            handled: true,
            isError: true,
            replyText: '🔒 That bakery item does not have a price set yet.',
            updatedState: state,
          };
        }
        if (actorAccount.wallet < price) {
          return {
            handled: true,
            isError: true,
            replyText: `You need **${formatChips(price)}** to buy **${BAKERY_ITEMS[rawItem].name}**.`,
            updatedState: state,
          };
        }
        actorAccount.wallet -= price;
        actorAccount.bakeryInventory[rawItem] =
          (actorAccount.bakeryInventory[rawItem] || 0) + 1;
        return {
          handled: true,
          embedTitle: '🍰 Bakery Purchase Complete',
          replyText: `Bought ${BAKERY_ITEMS[rawItem].emoji} **${BAKERY_ITEMS[rawItem].name}** for **${formatChips(price)}**.`,
          updatedState: state,
        };
      }

      if (!SHOP_ITEMS[rawItem]) {
        return {
          handled: true,
          isError: true,
          replyText: `Choose a valid item: ${[...Object.keys(SHOP_ITEMS), ...Object.keys(BAKERY_ITEMS)].join(', ')}.`,
          updatedState: state,
        };
      }
      const price = state.config.shopPrices[rawItem];
      if (actorAccount.wallet < price) {
        return {
          handled: true,
          isError: true,
          replyText: `You need **${formatChips(price)}**, but have **${formatChips(actorAccount.wallet)}**.`,
          updatedState: state,
        };
      }
      actorAccount.wallet -= price;
      if (rawItem === 'work_kit') {
        actorAccount.workKitOwned = true;
        actorAccount.workKitActive = true;
      } else if (rawItem === 'xp_scroll') {
        actorAccount.xpScrolls += 1;
      } else if (rawItem === 'lucky_charm') {
        actorAccount.luckyCharms += 1;
      } else if (rawItem === 'no_prefix_pass') {
        actorAccount.noPrefixPass = true;
      }
      return {
        handled: true,
        embedTitle: '✅ Shop Item Purchased',
        replyText: `Purchased **${SHOP_ITEMS[rawItem].name}** for **${formatChips(price)}**!`,
        updatedState: state,
      };
    }

    case 'shop2':
    case 'value': {
      const lines = Object.entries(BAKERY_ITEMS).map(([id, item]) => {
        const buyPrice = state.config.bakeryPrices[id];
        const marketVal = state.config.bakeryMarketValues[id] || item.baseValue;
        const owned = actorAccount.bakeryInventory[id] || 0;
        return `${item.emoji} **${item.name}** (\`${id}\`) — Buy: **${buyPrice ? formatChips(buyPrice) : 'Locked'}** · Market: **${formatChips(marketVal)}** · Owned: **${owned}**`;
      });
      return {
        handled: true,
        embedTitle: '🍰 Brownie Bakery & Live Market Values',
        replyText: `${lines.join('\n')}\n\nBuy pastries with \`*buy <item>\` or feed your pet with \`*feedpet\`.`,
        updatedState: state,
      };
    }

    case 'inventory':
    case 'inv': {
      const bakeryList = Object.entries(actorAccount.bakeryInventory)
        .filter(([, count]) => count > 0)
        .map(([id, count]) => `${BAKERY_ITEMS[id]?.emoji || '🍪'} ${BAKERY_ITEMS[id]?.name || id} ×${count}`)
        .join(', ');
      return {
        handled: true,
        embedTitle: `🎒 ${actor.username}'s Inventory`,
        replyText: [
          `• **Work Kit:** ${actorAccount.workKitOwned ? (actorAccount.workKitActive ? 'Owned (Active +10%)' : 'Owned (Inactive)') : 'Not owned'}`,
          `• **No Prefix Pass:** ${actorAccount.noPrefixPass ? 'Active' : 'Not owned'}`,
          `• **XP Scrolls:** ${actorAccount.xpScrolls}`,
          `• **Lucky Charms:** ${actorAccount.luckyCharms}`,
          `• **Bakery Items:** ${bakeryList || 'None'}`,
        ].join('\n'),
        updatedState: state,
      };
    }

    case 'use': {
      if (actorAccount.xpScrolls < 1) {
        return {
          handled: true,
          isError: true,
          replyText: 'You do not own any XP Scrolls. Buy one with `*buy xp_scroll`.',
          updatedState: state,
        };
      }
      actorAccount.xpScrolls -= 1;
      actorAccount.xp += 100;
      return {
        handled: true,
        replyText: `📜 Used an **XP Scroll**! You gained **+100 XP** (Total: **${actorAccount.xp} XP**).`,
        updatedState: state,
      };
    }

    case 'pet':
    case 'showpet': {
      const pet = actorAccount.browniePet;
      return {
        handled: true,
        embedTitle: `🐾 ${pet.name} — ${pet.evolution}`,
        replyText: `**Level:** ${pet.level} (${pet.xp}/${pet.level * 100} XP)\n**Happiness:** ${pet.happiness}/100 😄\n**Hunger:** ${pet.hunger}/100 🍰\n\nUse \`*feedpet\`, \`*playpet\`, or \`*petname <name>\`.`,
        updatedState: state,
      };
    }

    case 'petname': {
      const newName = parts.join(' ').trim().slice(0, 24);
      if (!newName) {
        return {
          handled: true,
          isError: true,
          replyText: 'Usage: `*petname <new name>`',
          updatedState: state,
        };
      }
      actorAccount.browniePet.name = newName;
      return {
        handled: true,
        replyText: `🐾 Your Brownie Pet is now named **${newName}**!`,
        updatedState: state,
      };
    }

    case 'feedpet': {
      const ownedEntry = Object.entries(actorAccount.bakeryInventory).find(
        ([, qty]) => qty > 0
      );
      if (!ownedEntry) {
        return {
          handled: true,
          isError: true,
          replyText: '🍪 You have no bakery pastries! Buy one with `*buy cookie` first.',
          updatedState: state,
        };
      }
      const [itemId] = ownedEntry;
      actorAccount.bakeryInventory[itemId] -= 1;
      actorAccount.browniePet.hunger = Math.min(100, actorAccount.browniePet.hunger + 25);
      actorAccount.browniePet.happiness = Math.min(
        100,
        actorAccount.browniePet.happiness + 10
      );
      return {
        handled: true,
        replyText: `${BAKERY_ITEMS[itemId].emoji} Fed **${actorAccount.browniePet.name}** a ${BAKERY_ITEMS[itemId].name}! Hunger: **${actorAccount.browniePet.hunger}/100**, Happiness: **${actorAccount.browniePet.happiness}/100**.`,
        updatedState: state,
      };
    }

    case 'playpet': {
      const pet = actorAccount.browniePet;
      pet.happiness = Math.min(100, pet.happiness + 20);
      pet.xp += 25;
      if (pet.xp >= pet.level * 100) {
        pet.xp -= pet.level * 100;
        pet.level += 1;
        pet.evolution =
          pet.level >= 10
            ? 'Legendary Brownie'
            : pet.level >= 5
              ? 'Growing Brownie'
              : 'Baby Brownie';
      }
      return {
        handled: true,
        replyText: `🎾 Played with **${pet.name}**! Happiness +20, Pet XP +25 (Level **${pet.level}** · ${pet.evolution}).`,
        updatedState: state,
      };
    }

    case 'cf': {
      const rawBet = (parts[0] || '').toLowerCase();
      const bet = rawBet === 'all' ? actorAccount.wallet : Number(parts[0]);
      if (
        !Number.isSafeInteger(bet) ||
        bet < 1 ||
        bet > actorAccount.wallet ||
        bet > state.config.maxGameBet
      ) {
        return {
          handled: true,
          isError: true,
          replyText: `Enter a valid bet between 1 and ${formatChips(Math.min(actorAccount.wallet, state.config.maxGameBet))}.`,
          updatedState: state,
        };
      }
      actorAccount.wallet += bet;
      return {
        handled: true,
        embedTitle: '🪙 Coinflip Victory!',
        replyText: `The coin landed in your favor! You won **+${formatChips(bet)}** net profit. Wallet: **${formatChips(actorAccount.wallet)}**.`,
        updatedState: state,
      };
    }

    case 'slot': {
      const rawBet = (parts[0] || '').toLowerCase();
      const bet = rawBet === 'all' ? actorAccount.wallet : Number(parts[0]);
      if (
        !Number.isSafeInteger(bet) ||
        bet < 1 ||
        bet > actorAccount.wallet ||
        bet > state.config.maxGameBet
      ) {
        return {
          handled: true,
          isError: true,
          replyText: `Enter a valid bet between 1 and ${formatChips(Math.min(actorAccount.wallet, state.config.maxGameBet))}.`,
          updatedState: state,
        };
      }
      const winBonus = Math.floor(bet * 0.5);
      actorAccount.wallet += winBonus;
      return {
        handled: true,
        embedTitle: '🎰 Brownie Slots — Pair Match!',
        replyText: `🍫 🍫 🍪 **Pair Match!** You won **+${formatChips(winBonus)}** net profit! Wallet: **${formatChips(actorAccount.wallet)}**.`,
        updatedState: state,
      };
    }

    case 'eat': {
      actorAccount.wallet -= 10;
      return {
        handled: true,
        replyText:
          '😱 Ah, you tried to eat me! 10 Chocochips are consumed, whether or not you have enough money. Your wallet can go negative! 🍫',
        updatedState: state,
      };
    }

    case 'help': {
      return {
        handled: true,
        embedTitle: '🍫 Brownie Bot — Command Center',
        replyText: [
          '🔥 **Roast & AI Brain (Gemini):** `*roast @user`, `*roast on|off` (Owner), `*roast intensity playful|savage|nuclear` (Owner), `*roastconfig`',
          '🎨 **Roast Customization (Persistent):** `*setgreeting <template>`, `*greet @user`, `*roasttopic add|remove|list <topic>`, `*roasttarget add|remove|list @user <angle>`, `*roaststyle <style>`',
          '👑 **Owner / Admin (`akshatkrofficial_47531` & `killer_sole5`):** `*givecash @user <amt>`, `*takecash @user <amt|all>`, `*noprefix @user add|remove`, `*setprice <item> <price>`',
          '💰 **Economy & Jobs:** `*balance`, `*daily`, `*weekly`, `*work`, `*job <Yapper|Messages Grinder>`, `*deposit`, `*withdraw`, `*pay`, `*crime`, `*rob`, `*leaderboard`',
          '🍰 **Shop & Bakery:** `*shop`, `*shop2`, `*value`, `*buy <item>`, `*inventory`, `*use`',
        ].join('\n\n'),
        updatedState: state,
      };
    }

    default:
      return { handled: false, replyText: '', updatedState: state };
  }
}
