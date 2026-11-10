import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Flame,
  Shield,
  Coins,
  Sparkles,
  Terminal,
  Trash2,
} from 'lucide-react';
import {
  DiscordUser,
  ServerState,
  SERVER_USERS,
  isBotOwnerOrAdmin,
  formatChips,
} from '../utils/botEngine';

export interface ChatMessage {
  id: string;
  authorName: string;
  authorRole: string;
  authorColor: string;
  isBot: boolean;
  content: string;
  embedTitle?: string;
  isError?: boolean;
  timestamp: string;
  aiModelTag?: string;
}

interface DiscordSimulatorProps {
  activeUser: DiscordUser;
  onSelectUser: (user: DiscordUser) => void;
  serverState: ServerState;
  messages: ChatMessage[];
  onSendMessage: (text: string, channelId: string) => Promise<void>;
  onClearChat: () => void;
  isGenerating: boolean;
}

const CHANNELS = [
  {
    id: 'roast-arena',
    name: 'roast-arena',
    description: 'Gemini 3.8 Flash auto-roasts & Hinglish/English banter',
  },
  {
    id: 'bot-commands',
    name: 'bot-commands',
    description: 'Economy, Chocochips, Admin grants & Brownie Pet commands',
  },
  {
    id: 'bakery-market',
    name: 'bakery-market',
    description: 'Shop 2 pastries, live market values & item trading',
  },
];

const QUICK_ACTIONS = [
  { label: 'Roast @shadow_yapper99', cmd: '*roast @shadow_yapper99' },
  { label: 'Who is your owner?', cmd: 'Who is your owner?' },
  { label: 'Check Balance', cmd: '*balance' },
  { label: 'Claim Daily', cmd: '*daily' },
  { label: 'Admin: Give 10k Chips', cmd: '*givecash @shadow_yapper99 10000', adminOnly: true },
  { label: 'Admin: Toggle Roast Mode', cmd: '*roast on', adminOnly: true },
  { label: 'Admin: Grant No-Prefix', cmd: '*noprefix @choco_grinder add', adminOnly: true },
  { label: 'View Brownie Pet', cmd: '*pet' },
];

export const DiscordSimulator: React.FC<DiscordSimulatorProps> = ({
  activeUser,
  onSelectUser,
  serverState,
  messages,
  onSendMessage,
  onClearChat,
  isGenerating,
}) => {
  const [activeChannel, setActiveChannel] = useState<string>('roast-arena');
  const [inputText, setInputText] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const isCurrentUserAdmin = isBotOwnerOrAdmin(activeUser);
  const currentAccount = serverState.accounts[activeUser.username];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text, activeChannel);
  };

  const handleQuickCommand = async (cmd: string) => {
    if (isGenerating) return;
    await onSendMessage(cmd, activeChannel);
  };

  const currentChannelObj =
    CHANNELS.find((c) => c.id === activeChannel) || CHANNELS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-800 rounded-xl bg-slate-900/90 overflow-hidden">
      {/* Left Column: Channels & Identity Switcher */}
      <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between gap-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
              <span>BROWNIE SERVER CHANNELS</span>
              <span className="font-mono text-amber-400">PREFIX: *</span>
            </div>
            <div className="space-y-1" role="tablist" aria-label="Discord Channels">
              {CHANNELS.map((chan) => {
                const isActive = chan.id === activeChannel;
                return (
                  <button
                    key={chan.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveChannel(chan.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate"># {chan.name}</span>
                    {chan.id === 'roast-arena' && (
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active User / Identity Switcher */}
          <div>
            <label
              htmlFor="simulator-user-select"
              className="block text-xs font-medium text-slate-400 mb-2"
            >
              ACTING DISCORD IDENTITY
            </label>
            <div className="space-y-1.5">
              {SERVER_USERS.map((u) => {
                const selected = u.username === activeUser.username;
                const isOwner = isBotOwnerOrAdmin(u);
                const acc = serverState.accounts[u.username];
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onSelectUser(u)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-colors ${
                      selected
                        ? 'bg-slate-800/90 border-amber-500/50 text-slate-100'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold truncate text-slate-100">
                        @{u.username}
                      </span>
                      {isOwner && (
                        <Shield
                          className="w-3.5 h-3.5 text-amber-400 shrink-0"
                          aria-label="Bot Owner and Admin"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1 tabular-nums">
                      <span>{u.roleLabel}</span>
                      <span className="font-mono text-amber-300/90">
                        {acc ? (acc.wallet + acc.bank).toLocaleString() : 0} 🍫
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Identity Status Footer */}
        <div className="pt-4 border-t border-slate-800/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span>Permission Level</span>
            <span className="font-mono font-semibold text-amber-400">
              {isCurrentUserAdmin ? 'OWNER / ADMIN' : 'STANDARD MEMBER'}
            </span>
          </div>
          {currentAccount && (
            <div className="flex items-center justify-between text-slate-400 tabular-nums">
              <span>Wallet Balance</span>
              <span className="font-mono text-slate-200">
                {formatChips(currentAccount.wallet)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-400">
            <span>No-Prefix Pass</span>
            <span className="font-mono text-slate-200">
              {currentAccount?.noPrefixPass ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </aside>

      {/* Right Column: Live Discord Chat Stream & Command Input */}
      <div className="lg:col-span-9 flex flex-col h-[640px]">
        {/* Channel Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-base font-semibold text-slate-100 whitespace-nowrap">
              # {currentChannelObj.name}
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-slate-400 truncate">
              {currentChannelObj.description}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>
              Roast Mode:{' '}
              <strong className="text-amber-400 font-mono">
                {serverState.config.roastMode
                  ? `ON (${serverState.config.roastIntensity})`
                  : 'OFF'}
              </strong>
            </span>
            <button
              type="button"
              onClick={onClearChat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors whitespace-nowrap"
              title="Reset channel messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Feed</span>
            </button>
          </div>
        </div>

        {/* Quick Command Trigger Bar */}
        <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0 mr-1">
            Quick Run:
          </span>
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={isGenerating}
              onClick={() => handleQuickCommand(item.cmd)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap shrink-0 border ${
                item.adminOnly
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div
          className="flex-1 overflow-y-auto p-5 space-y-4"
          data-testid="discord-chat-feed"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 p-3 rounded-lg transition-colors ${
                msg.isBot
                  ? 'bg-slate-950/70 border border-slate-800/90'
                  : 'hover:bg-slate-800/30'
              }`}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-sm text-white shrink-0"
                style={{ backgroundColor: msg.authorColor }}
              >
                {msg.isBot ? '🍫' : msg.authorName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-100 text-sm">
                    {msg.authorName}
                  </span>
                  <span className="text-slate-500" aria-hidden="true">
                    ·
                  </span>
                  <span
                    className={`font-mono ${
                      msg.isBot ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {msg.authorRole}
                  </span>
                  {msg.aiModelTag && (
                    <>
                      <span className="text-slate-500" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono text-slate-400">
                        {msg.aiModelTag}
                      </span>
                    </>
                  )}
                  <span className="text-slate-500" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.embedTitle ? (
                  <div
                    className={`mt-2 p-3.5 rounded-lg border ${
                      msg.isError
                        ? 'bg-red-950/25 border-red-800/60 text-red-200'
                        : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                    }`}
                  >
                    <div className="font-display font-semibold text-sm text-white mb-1">
                      {msg.embedTitle}
                    </div>
                    <div className="text-sm whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-amber-300 font-mono">
              <Sparkles className="w-4 h-4 animate-spin shrink-0" />
              <span>
                Brownie Bot (Gemini Brain) is cooking a response...
              </span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-3"
        >
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400 shrink-0">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>@{activeUser.username}</span>
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message #${currentChannelObj.name} as @${activeUser.username} (try "roast me", "*givecash @killer_sole5 5000", or "*help")...`}
            aria-label="Discord command or chat message"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={isGenerating || !inputText.trim()}
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
