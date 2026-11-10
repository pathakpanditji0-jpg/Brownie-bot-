import React, { useState } from 'react';
import {
  Shield,
  Flame,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Sliders,
} from 'lucide-react';
import {
  DiscordUser,
  ServerState,
  SERVER_USERS,
  BAKERY_ITEMS,
  isBotOwnerOrAdmin,
  formatChips,
} from '../utils/botEngine';

interface AdminConsoleProps {
  activeUser: DiscordUser;
  serverState: ServerState;
  customPersona: string;
  onUpdateCustomPersona: (val: string) => void;
  onExecuteCommand: (cmd: string) => Promise<void>;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  activeUser,
  serverState,
  customPersona,
  onUpdateCustomPersona,
  onExecuteCommand,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>(
    'shadow_yapper99'
  );
  const [cashAmount, setCashAmount] = useState<string>('5000');
  const [selectedBakeryItem, setSelectedBakeryItem] = useState<string>('cookie');
  const [bakeryPriceInput, setBakeryPriceInput] = useState<string>('90');
  const [statusFeedback, setStatusFeedback] = useState<string>('');

  const isAuthorizedAdmin = isBotOwnerOrAdmin(activeUser);

  const runAdminAction = async (cmd: string, feedbackLabel: string) => {
    await onExecuteCommand(cmd);
    setStatusFeedback(feedbackLabel);
    setTimeout(() => setStatusFeedback(''), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Dual-Owner Authorization Banner */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 text-sm font-medium text-amber-400">
            <Shield className="w-4 h-4 shrink-0" />
            <span>Configured Bot Owners & Admin Authority</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Dual-Owner Access Control: akshatkrofficial_47531 &amp; killer_sole5
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Both <code className="text-amber-300">akshatkrofficial_47531</code>{' '}
            and <code className="text-amber-300">killer_sole5</code> are
            hardcoded into the bot&apos;s root authorization table. They bypass
            cooldowns and can execute all economy grants, No-Prefix Pass
            assignments, and Gemini Roast Brain controls.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/80 shrink-0 space-y-2 min-w-[260px]">
          <div className="text-xs text-slate-400">Current Acting Session</div>
          <div className="font-mono text-sm font-semibold text-white">
            @{activeUser.username}
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isAuthorizedAdmin ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Authorized Bot Owner / Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Standard Member (Read-Only Admin)
              </span>
            )}
          </div>
        </div>
      </div>

      {statusFeedback && (
        <div
          role="status"
          className="px-4 py-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm font-medium flex items-center justify-between"
        >
          <span>{statusFeedback}</span>
          <span className="font-mono text-xs text-amber-400">
            Synced with Simulator State
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini Roast Brain Configuration */}
        <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>01. Gemini Roast Brain Configuration</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Powered by @google/genai (gemini-3.8-flash)
              </p>
            </div>
            <span className="font-mono text-xs text-amber-400">
              {serverState.config.roastMode ? 'ROAST: ACTIVE' : 'ROAST: OFF'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Global Savage Roast Mode (<code>*roast on|off</code>)
                </div>
                <div className="text-xs text-slate-400">
                  When enabled, Brownie Bot roasts every chat message in the AI
                  channel.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    runAdminAction(
                      '*roast on',
                      `Executed *roast on as @${activeUser.username}`
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    serverState.config.roastMode
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Enable ON
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runAdminAction(
                      '*roast off',
                      `Executed *roast off as @${activeUser.username}`
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !serverState.config.roastMode
                      ? 'bg-slate-200 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Disable OFF
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                ROAST INTENSITY TIER
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Playful', 'Savage', 'Nuclear'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      runAdminAction(
                        `*roast intensity ${level.toLowerCase()}`,
                        `Set roast intensity to ${level}`
                      )
                    }
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      serverState.config.roastIntensity === level
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="custom-persona-input"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                CUSTOM GEMINI SYSTEM PROMPT ADDON
              </label>
              <input
                id="custom-persona-input"
                type="text"
                value={customPersona}
                onChange={(e) => onUpdateCustomPersona(e.target.value)}
                placeholder="e.g. Use Desi Hinglish slang and hype up akshatkrofficial_47531 and killer_sole5"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </section>

        {/* Owner Vault & Member Management */}
        <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>02. Owner Economy &amp; Privilege Controls</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct wallet grants, deductions, and permanent No-Prefix Passes
              </p>
            </div>
            <Sliders className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-target-member"
                  className="block text-xs font-medium text-slate-400 mb-1"
                >
                  Target Server Member
                </label>
                <select
                  id="admin-target-member"
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  {SERVER_USERS.map((u) => (
                    <option key={u.id} value={u.username}>
                      @{u.username} ({u.roleLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-cash-amount"
                  className="block text-xs font-medium text-slate-400 mb-1"
                >
                  Chocochips Amount
                </label>
                <input
                  id="admin-cash-amount"
                  type="number"
                  min={1}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  runAdminAction(
                    `*givecash @${selectedTarget} ${cashAmount}`,
                    `Executed *givecash @${selectedTarget} ${cashAmount}`
                  )
                }
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap"
              >
                Grant Cash (*givecash)
              </button>
              <button
                type="button"
                onClick={() =>
                  runAdminAction(
                    `*takecash @${selectedTarget} ${cashAmount}`,
                    `Executed *takecash @${selectedTarget} ${cashAmount}`
                  )
                }
                className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors whitespace-nowrap"
              >
                Deduct Cash (*takecash)
              </button>
              <button
                type="button"
                onClick={() =>
                  runAdminAction(
                    `*noprefix @${selectedTarget} add`,
                    `Granted No-Prefix Pass to @${selectedTarget}`
                  )
                }
                className="px-3.5 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-xs transition-colors whitespace-nowrap"
              >
                Grant No-Prefix Pass
              </button>
            </div>

            {/* Bakery Price Setter */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              <div>
                <label
                  htmlFor="bakery-item-select"
                  className="block text-xs font-medium text-slate-400 mb-1"
                >
                  Bakery Item (Shop 2)
                </label>
                <select
                  id="bakery-item-select"
                  value={selectedBakeryItem}
                  onChange={(e) => setSelectedBakeryItem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-100"
                >
                  {Object.entries(BAKERY_ITEMS).map(([id, item]) => (
                    <option key={id} value={id}>
                      {item.emoji} {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="bakery-price-input"
                  className="block text-xs font-medium text-slate-400 mb-1"
                >
                  Price (Chocochips)
                </label>
                <input
                  id="bakery-price-input"
                  type="number"
                  min={1}
                  value={bakeryPriceInput}
                  onChange={(e) => setBakeryPriceInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-mono tabular-nums"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  runAdminAction(
                    `*setprice ${selectedBakeryItem} ${bakeryPriceInput}`,
                    `Updated ${selectedBakeryItem} price to ${bakeryPriceInput}`
                  )
                }
                className="px-3 py-2 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium text-xs transition-colors whitespace-nowrap"
              >
                Lock Price (/setprice)
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Live Server Member Ledger Table */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-display font-semibold text-white">
            03. Server Accounts &amp; Admin Privilege Matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            Max Game Bet: {formatChips(serverState.config.maxGameBet)} ·
            Jackpot: {serverState.config.slotJackpotMultiplier}×
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 bg-slate-950/50">
                <th className="py-3 px-4 font-medium">Discord Username</th>
                <th className="py-3 px-4 font-medium">Authority Role</th>
                <th className="py-3 px-4 font-medium text-right">Wallet</th>
                <th className="py-3 px-4 font-medium text-right">Bank</th>
                <th className="py-3 px-4 font-medium">Job &amp; XP</th>
                <th className="py-3 px-4 font-medium">No-Prefix Pass</th>
                <th className="py-3 px-4 font-medium">Brownie Pet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {SERVER_USERS.map((u) => {
                const acc = serverState.accounts[u.username];
                const isOwner = isBotOwnerOrAdmin(u);
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-white">
                      @{u.username}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span
                        className={
                          isOwner
                            ? 'text-amber-400 font-semibold'
                            : 'text-slate-400'
                        }
                      >
                        {u.roleLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-right text-slate-200 tabular-nums">
                      {acc ? acc.wallet.toLocaleString() : 0} 🍫
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-right text-slate-300 tabular-nums">
                      {acc ? acc.bank.toLocaleString() : 0} 🍫
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300 tabular-nums">
                      {acc?.job} · {acc?.xp} XP
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">
                      {acc?.noPrefixPass ? (
                        <span className="text-emerald-400">Active</span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {acc?.browniePet.name} (Lv.{acc?.browniePet.level})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
