/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DiscordUser,
  ServerState,
  SERVER_USERS,
  createInitialServerState,
  executeBotCommand,
  formatCustomGreeting,
} from './utils/botEngine';
import {
  DiscordSimulator,
  ChatMessage,
} from './components/DiscordSimulator';
import { RoastCustomizationStudio } from './components/RoastCustomizationStudio';
import { AdminConsole } from './components/AdminConsole';
import { BotCodeExporter } from './components/BotCodeExporter';

type ActiveTab = 'simulator' | 'customization' | 'admin' | 'export';

function currentTimeStr(): string {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    authorName: 'Brownie Bot',
    authorRole: 'GEMINI BRAIN BOT',
    authorColor: '#D97706',
    isBot: true,
    embedTitle: '🍫 Brownie Bot Online — Gemini Brain & Dual-Owner Authority',
    content:
      'Welcome to the **Brownie Server**! I am powered by **Google Gemini** (`gemini-3.8-flash`).\n👑 Configured Bot Owners & Supreme Admins: **@akshatkrofficial_47531** and **@killer_sole5**.\n🔥 Persistent Customization Active: Custom greetings, roast topics, priority targets, and comedic styles are synced to disk.',
    timestamp: currentTimeStr(),
    aiModelTag: 'gemini-3.8-flash',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [activeUser, setActiveUser] = useState<DiscordUser>(SERVER_USERS[0]);
  const [serverState, setServerState] = useState<ServerState>(() =>
    createInitialServerState()
  );
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [persistenceSynced, setPersistenceSynced] = useState<boolean>(true);

  // Load persisted customization & server state from backend on mount
  useEffect(() => {
    let mounted = true;
    fetch('/api/bot/state')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.state) {
          setServerState(data.state);
          setPersistenceSynced(true);
        }
      })
      .catch(() => {
        // Fallback to local state if offline
      });
    return () => {
      mounted = false;
    };
  }, []);

  const persistStateToServer = useCallback(async (nextState: ServerState) => {
    setServerState(nextState);
    try {
      const res = await fetch('/api/bot/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: nextState }),
      });
      if (res.ok) {
        setPersistenceSynced(true);
      }
    } catch {
      // Keep local state updated
    }
  }, []);

  const handleResetDefaults = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data?.state) {
          setServerState(data.state);
        }
      }
    } catch {
      const fresh = createInitialServerState();
      setServerState(fresh);
    }
  }, []);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const callGeminiBrain = useCallback(
    async (
      sender: DiscordUser,
      userText: string,
      currentState: ServerState,
      roastTarget?: string
    ) => {
      setIsGenerating(true);
      try {
        const chatHistory = messages
          .slice(-6)
          .map((m) => ({
            role: m.isBot ? 'assistant' : 'user',
            content: `${m.authorName}: ${m.content}`,
          }));

        const response = await fetch('/api/bot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: sender.username,
            message: userText,
            roastMode: currentState.config.roastMode,
            roastTarget,
            history: chatHistory,
            customization: currentState.config.customization,
          }),
        });

        const data = await response.json();
        const replyText =
          data?.reply ||
          '🔥 Gemini Brain cooked you so hard the message buffer overflowed! 🍫';

        appendMessage({
          id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          authorName: 'Brownie Bot',
          authorRole: 'GEMINI BRAIN BOT',
          authorColor: '#D97706',
          isBot: true,
          embedTitle:
            currentState.config.roastMode || roastTarget
              ? `🔥 Gemini Roast (${currentState.config.customization.roastStyle} · ${currentState.config.customization.roastIntensity})`
              : undefined,
          content: replyText,
          timestamp: currentTimeStr(),
          aiModelTag: data?.model || 'gemini-3.8-flash',
        });
      } catch {
        appendMessage({
          id: `bot-err-${Date.now()}`,
          authorName: 'Brownie Bot',
          authorRole: 'GEMINI BRAIN BOT',
          authorColor: '#D97706',
          isBot: true,
          content:
            '🔥 Tera message dekh ke mera circuit bhi roast ho gaya—try again in a moment! 🍫',
          timestamp: currentTimeStr(),
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [appendMessage, messages]
  );

  const handleSendMessage = useCallback(
    async (text: string, _channelId: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      appendMessage({
        id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        authorName: activeUser.username,
        authorRole: activeUser.roleLabel,
        authorColor: activeUser.avatarColor,
        isBot: false,
        content: trimmed,
        timestamp: currentTimeStr(),
      });

      const cmdResult = executeBotCommand(trimmed, activeUser, serverState);

      if (cmdResult.handled) {
        await persistStateToServer(cmdResult.updatedState);

        if (cmdResult.requiresAiRoast) {
          await callGeminiBrain(
            activeUser,
            trimmed,
            cmdResult.updatedState,
            cmdResult.roastTarget
          );
          return;
        }

        appendMessage({
          id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          authorName: 'Brownie Bot',
          authorRole: 'GEMINI BRAIN BOT',
          authorColor: '#D97706',
          isBot: true,
          embedTitle: cmdResult.embedTitle,
          isError: cmdResult.isError,
          content: cmdResult.replyText,
          timestamp: currentTimeStr(),
          aiModelTag: 'Command Engine',
        });
        return;
      }

      // Otherwise route ordinary message to Gemini Brain
      await callGeminiBrain(activeUser, trimmed, serverState);
    },
    [
      activeUser,
      appendMessage,
      callGeminiBrain,
      persistStateToServer,
      serverState,
    ]
  );

  const handleSaveCustomization = useCallback(
    async (updatedState: ServerState, announceText?: string) => {
      await persistStateToServer(updatedState);
      if (announceText) {
        appendMessage({
          id: `cust-${Date.now()}`,
          authorName: 'Brownie Bot',
          authorRole: 'CUSTOMIZATION ENGINE',
          authorColor: '#D97706',
          isBot: true,
          embedTitle: '⚙️ Customization Profile Persisted',
          content: announceText,
          timestamp: currentTimeStr(),
        });
      }
    },
    [appendMessage, persistStateToServer]
  );

  const handleTestRoastTarget = useCallback(
    async (targetUsername: string) => {
      setActiveTab('simulator');
      await handleSendMessage(`*roast @${targetUsername}`, 'roast-arena');
    },
    [handleSendMessage]
  );

  const handleTriggerWelcomeGreeting = useCallback(() => {
    const greetingText = formatCustomGreeting(
      serverState.config.customization.customGreeting,
      activeUser.username,
      'Brownie Server'
    );
    setActiveTab('simulator');
    appendMessage({
      id: `greet-${Date.now()}`,
      authorName: 'Brownie Bot',
      authorRole: 'WELCOME GREETER',
      authorColor: '#D97706',
      isBot: true,
      embedTitle: '👋 Member Joined Server',
      content: greetingText,
      timestamp: currentTimeStr(),
    });
  }, [
    activeUser.username,
    appendMessage,
    serverState.config.customization.customGreeting,
  ]);

  const cust = serverState.config.customization;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/90 sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#simulator"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('simulator');
          }}
          className="text-lg font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Brownie Bot
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav
          className="flex items-center gap-6 text-sm font-medium text-slate-400 overflow-x-auto"
          aria-label="Primary Navigation"
        >
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'simulator'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : ''
            }`}
          >
            Live Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customization')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'customization'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : ''
            }`}
          >
            Roast Customization
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'admin'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : ''
            }`}
          >
            Owner Console
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'export'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : ''
            }`}
          >
            Bot Source Code
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleTriggerWelcomeGreeting}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Test Welcome Greeting
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-6 space-y-6">
        {/* Top Summary Strip — Unboxed Metadata & Active Configuration */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Discord Roast &amp; Economy Server Bot
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Brain: Gemini 3.8 Flash</span>
              <span aria-hidden="true">·</span>
              <span>
                Owners: <strong className="text-amber-300 font-mono">akshatkrofficial_47531</strong> &amp;{' '}
                <strong className="text-amber-300 font-mono">killer_sole5</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Style: <strong className="text-slate-200">{cust.roastStyle}</strong> ({cust.roastIntensity})
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Persistence: <strong className="text-emerald-400 font-mono">{persistenceSynced ? 'Saved to Disk' : 'Syncing'}</strong>
              </span>
            </div>
          </div>

          {/* Acting Identity Selector Bar */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="header-identity-select"
              className="text-xs text-slate-400 whitespace-nowrap"
            >
              Active Discord User:
            </label>
            <select
              id="header-identity-select"
              value={activeUser.username}
              onChange={(e) => {
                const found = SERVER_USERS.find(
                  (u) => u.username === e.target.value
                );
                if (found) setActiveUser(found);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
            >
              {SERVER_USERS.map((u) => (
                <option key={u.id} value={u.username}>
                  @{u.username} — {u.roleLabel}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Active View Render */}
        {activeTab === 'simulator' && (
          <DiscordSimulator
            activeUser={activeUser}
            onSelectUser={setActiveUser}
            serverState={serverState}
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={() => setMessages(INITIAL_MESSAGES)}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'customization' && (
          <RoastCustomizationStudio
            activeUser={activeUser}
            serverState={serverState}
            onSaveCustomization={handleSaveCustomization}
            onResetDefaults={handleResetDefaults}
            onTestRoastInSimulator={handleTestRoastTarget}
          />
        )}

        {activeTab === 'admin' && (
          <AdminConsole
            activeUser={activeUser}
            serverState={serverState}
            customPersona={serverState.config.customization.customPersonaDirective}
            onUpdateCustomPersona={(val) => {
              const next = structuredClone(serverState);
              next.config.customization.customPersonaDirective = val;
              persistStateToServer(next);
            }}
            onExecuteCommand={(cmd) => handleSendMessage(cmd, 'bot-commands')}
          />
        )}

        {activeTab === 'export' && (
          <BotCodeExporter serverState={serverState} />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 max-w-[1360px] w-full mx-auto">
        <span>
          Brownie Bot Discord Engine · Configured for akshatkrofficial_47531 &amp; killer_sole5
        </span>
        <span>
          Persistent settings stored in brownie-customization.json
        </span>
      </footer>
    </div>
  );
}
