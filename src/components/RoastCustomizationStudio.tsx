import React, { useState } from 'react';
import {
  Flame,
  MessageSquareHeart,
  Target,
  Sparkles,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Lock,
  CheckCircle2,
  Play,
} from 'lucide-react';
import {
  DiscordUser,
  ServerState,
  ROAST_INTENSITIES,
  ROAST_STYLES,
  RoastIntensity,
  RoastStyle,
  SERVER_USERS,
  isBotOwnerOrAdmin,
  formatCustomGreeting,
} from '../utils/botEngine';

interface RoastCustomizationStudioProps {
  activeUser: DiscordUser;
  serverState: ServerState;
  onSaveCustomization: (updatedState: ServerState, announceText?: string) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onTestRoastInSimulator: (targetUsername: string) => Promise<void>;
}

export const RoastCustomizationStudio: React.FC<RoastCustomizationStudioProps> = ({
  activeUser,
  serverState,
  onSaveCustomization,
  onResetDefaults,
  onTestRoastInSimulator,
}) => {
  const cust = serverState.config.customization;
  const isAuthorizedAdmin = isBotOwnerOrAdmin(activeUser);

  const [greetingInput, setGreetingInput] = useState<string>(cust.customGreeting);
  const [greetingEnabled, setGreetingEnabled] = useState<boolean>(cust.greetingEnabled);
  const [selectedIntensity, setSelectedIntensity] = useState<RoastIntensity>(
    cust.roastIntensity
  );
  const [selectedStyle, setSelectedStyle] = useState<RoastStyle>(cust.roastStyle);
  const [personaDirective, setPersonaDirective] = useState<string>(
    cust.customPersonaDirective
  );
  const [newTopic, setNewTopic] = useState<string>('');
  const [targetUserSelect, setTargetUserSelect] = useState<string>('shadow_yapper99');
  const [targetAngleInput, setTargetAngleInput] = useState<string>('');
  const [saveBanner, setSaveBanner] = useState<string>('');
  const [previewMember, setPreviewMember] = useState<string>('shadow_yapper99');

  // Sync local inputs when serverState resets or updates externally
  React.useEffect(() => {
    setGreetingInput(serverState.config.customization.customGreeting);
    setGreetingEnabled(serverState.config.customization.greetingEnabled);
    setSelectedIntensity(serverState.config.customization.roastIntensity);
    setSelectedStyle(serverState.config.customization.roastStyle);
    setPersonaDirective(serverState.config.customization.customPersonaDirective);
  }, [serverState.config.customization]);

  const showSavedFlash = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(''), 4000);
  };

  const handlePersistMainSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedAdmin) return;

    const nextState: ServerState = structuredClone(serverState);
    const trimmedNewTopic = newTopic.trim();
    if (
      trimmedNewTopic &&
      !nextState.config.customization.roastTopics.includes(trimmedNewTopic)
    ) {
      nextState.config.customization.roastTopics.push(trimmedNewTopic);
      setNewTopic('');
    }
    const trimmedAngle = targetAngleInput.trim();
    if (trimmedAngle) {
      const existingIdx =
        nextState.config.customization.priorityTargets.findIndex(
          (item) =>
            item.target.toLowerCase() === targetUserSelect.toLowerCase()
        );
      const rule = {
        target: targetUserSelect,
        angle: trimmedAngle,
        addedBy: activeUser.username,
      };
      if (existingIdx >= 0) {
        nextState.config.customization.priorityTargets[existingIdx] = rule;
      } else {
        nextState.config.customization.priorityTargets.push(rule);
      }
      setTargetAngleInput('');
    }

    nextState.config.roastIntensity = selectedIntensity;
    nextState.config.customization = {
      ...nextState.config.customization,
      customGreeting:
        greetingInput.trim() || nextState.config.customization.customGreeting,
      greetingEnabled,
      roastIntensity: selectedIntensity,
      roastStyle: selectedStyle,
      customPersonaDirective: personaDirective.trim(),
      updatedAt: Date.now(),
      updatedBy: activeUser.username,
    };

    await onSaveCustomization(
      nextState,
      `Persisted Greeting, Style (${selectedStyle}), and Intensity (${selectedIntensity}) to brownie-customization.json`
    );
    showSavedFlash(
      `Saved & persisted to brownie-customization.json by @${activeUser.username}`
    );
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newTopic.trim();
    if (!cleaned || !isAuthorizedAdmin) return;

    const nextState: ServerState = structuredClone(serverState);
    if (!nextState.config.customization.roastTopics.includes(cleaned)) {
      nextState.config.customization.roastTopics.push(cleaned);
    }
    nextState.config.customization.updatedAt = Date.now();
    nextState.config.customization.updatedBy = activeUser.username;
    setNewTopic('');
    await onSaveCustomization(nextState);
    showSavedFlash(`Added roast topic "${cleaned}" and persisted to disk`);
  };

  const handleRemoveTopic = async (topicToRemove: string) => {
    if (!isAuthorizedAdmin) return;
    const nextState: ServerState = structuredClone(serverState);
    nextState.config.customization.roastTopics =
      nextState.config.customization.roastTopics.filter((t) => t !== topicToRemove);
    nextState.config.customization.updatedAt = Date.now();
    nextState.config.customization.updatedBy = activeUser.username;
    await onSaveCustomization(nextState);
    showSavedFlash(`Removed topic "${topicToRemove}" from persistent storage`);
  };

  const handleAddTargetRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const angle = targetAngleInput.trim();
    if (!angle || !isAuthorizedAdmin) return;

    const nextState: ServerState = structuredClone(serverState);
    const existingIdx = nextState.config.customization.priorityTargets.findIndex(
      (item) => item.target.toLowerCase() === targetUserSelect.toLowerCase()
    );
    const rule = {
      target: targetUserSelect,
      angle,
      addedBy: activeUser.username,
    };
    if (existingIdx >= 0) {
      nextState.config.customization.priorityTargets[existingIdx] = rule;
    } else {
      nextState.config.customization.priorityTargets.push(rule);
    }
    nextState.config.customization.updatedAt = Date.now();
    nextState.config.customization.updatedBy = activeUser.username;
    setTargetAngleInput('');
    await onSaveCustomization(nextState);
    showSavedFlash(`Saved priority roast target @${targetUserSelect} to persistent storage`);
  };

  const handleRemoveTargetRule = async (targetName: string) => {
    if (!isAuthorizedAdmin) return;
    const nextState: ServerState = structuredClone(serverState);
    nextState.config.customization.priorityTargets =
      nextState.config.customization.priorityTargets.filter(
        (item) => item.target !== targetName
      );
    nextState.config.customization.updatedAt = Date.now();
    nextState.config.customization.updatedBy = activeUser.username;
    await onSaveCustomization(nextState);
    showSavedFlash(`Removed @${targetName} from priority roast targets`);
  };

  return (
    <div className="space-y-8">
      {/* Header & Persistence Status Banner */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>PERSISTENT STORAGE: brownie-customization.json</span>
            <span aria-hidden="true">·</span>
            <span>LAST UPDATED BY @{cust.updatedBy}</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Roast Bot Customization Module
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Configure custom server welcome greetings, define specific roast
            topics and target lore angles, and tune Gemini&apos;s comedic style
            and intensity. All changes automatically persist on the server
            across bot restarts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!isAuthorizedAdmin && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300">
              <Lock className="w-3.5 h-3.5" />
              <span>
                Switch to @akshatkrofficial_47531 or @killer_sole5 to edit
              </span>
            </div>
          )}
          <button
            type="button"
            disabled={!isAuthorizedAdmin}
            onClick={onResetDefaults}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Factory Defaults</span>
          </button>
        </div>
      </div>

      {saveBanner && (
        <div
          role="status"
          className="px-4 py-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-sm font-medium flex items-center justify-between"
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveBanner}</span>
          </span>
          <span className="font-mono text-xs text-emerald-400">
            DISK SYNCED
          </span>
        </div>
      )}

      {/* Main Grid: Left = Greeting + Intensity/Style, Right = Topics + Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handlePersistMainSettings}
          className="lg:col-span-6 p-6 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-6">
            {/* Section 1: Custom Greetings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                  <MessageSquareHeart className="w-4 h-4 text-amber-400" />
                  <span>01. Custom Server Greeting</span>
                </h3>
                <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={greetingEnabled}
                    disabled={!isAuthorizedAdmin}
                    onChange={(e) => setGreetingEnabled(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Auto-Greet New Members</span>
                </label>
              </div>

              <div>
                <label
                  htmlFor="greeting-template-input"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  GREETING TEMPLATE (SUPPORTS <code>{'{user}'}</code> AND{' '}
                  <code>{'{server}'}</code> PLACEHOLDERS)
                </label>
                <textarea
                  id="greeting-template-input"
                  rows={3}
                  disabled={!isAuthorizedAdmin}
                  value={greetingInput}
                  onChange={(e) => setGreetingInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-60"
                />
              </div>

              <div className="p-3.5 rounded-lg border border-slate-800/90 bg-slate-950/70 space-y-1">
                <div className="text-xs font-mono text-slate-400">
                  LIVE DISCORD WELCOME PREVIEW (<code>*greet</code>):
                </div>
                <div className="text-sm text-amber-200 leading-relaxed">
                  {formatCustomGreeting(
                    greetingInput,
                    previewMember,
                    'Brownie Server'
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Roast Intensity & Comedic Style */}
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>02. Roast Intensity &amp; Delivery Style</span>
              </h3>

              <div>
                <span className="block text-xs font-medium text-slate-400 mb-2">
                  ROAST INTENSITY TIER
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {ROAST_INTENSITIES.map((tier) => {
                    const active = selectedIntensity === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        disabled={!isAuthorizedAdmin}
                        onClick={() => setSelectedIntensity(tier)}
                        className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                          active
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tier}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="roast-style-select"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  GEMINI COMEDIC PERSONA STYLE (<code>*roaststyle</code>)
                </label>
                <select
                  id="roast-style-select"
                  disabled={!isAuthorizedAdmin}
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as RoastStyle)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {ROAST_STYLES.map((styleName) => (
                    <option key={styleName} value={styleName}>
                      {styleName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="persona-directive-input"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  CUSTOM SYSTEM DIRECTIVE FOR GEMINI BRAIN
                </label>
                <input
                  id="persona-directive-input"
                  type="text"
                  disabled={!isAuthorizedAdmin}
                  value={personaDirective}
                  onChange={(e) => setPersonaDirective(e.target.value)}
                  placeholder="Additional instructions for Gemini..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Persists across restarts in <code>brownie-customization.json</code>
            </span>
            <button
              type="submit"
              disabled={!isAuthorizedAdmin}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Persist Configuration</span>
            </button>
          </div>
        </form>

        {/* Right Column: Specific Topics & Priority Targets */}
        <div className="lg:col-span-6 space-y-6">
          {/* Section 3: Specific Roast Topics */}
          <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>03. Specific Roast Topics &amp; Themes</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Topics Gemini weaves into server roasts (<code>*roasttopic</code>)
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {cust.roastTopics.length} Active
              </span>
            </div>

            <form onSubmit={handleAddTopic} className="flex items-center gap-2.5">
              <input
                type="text"
                disabled={!isAuthorizedAdmin}
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Add topic (e.g. missing open-net goals in Rocket League)..."
                aria-label="New roast topic"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!isAuthorizedAdmin || !newTopic.trim()}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Topic</span>
              </button>
            </form>

            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-slate-950/50">
              {cust.roastTopics.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">
                  No custom roast topics defined yet. Add one above!
                </div>
              ) : (
                cust.roastTopics.map((topic, index) => (
                  <div
                    key={topic}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        0{index + 1}.
                      </span>
                      <span className="text-slate-200 truncate">{topic}</span>
                    </div>
                    <button
                      type="button"
                      disabled={!isAuthorizedAdmin}
                      onClick={() => handleRemoveTopic(topic)}
                      aria-label={`Remove topic ${topic}`}
                      className="text-slate-500 hover:text-red-400 disabled:opacity-40 p-1 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Section 4: Priority Roast Targets & Custom Lore Angles */}
          <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>04. Priority Roast Targets &amp; Custom Lore</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assign tailored roast material to specific members (
                  <code>*roasttarget</code>)
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {cust.priorityTargets.length} Targets
              </span>
            </div>

            <form onSubmit={handleAddTargetRule} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label
                    htmlFor="priority-target-user"
                    className="block text-xs font-medium text-slate-400 mb-1"
                  >
                    Target Member
                  </label>
                  <select
                    id="priority-target-user"
                    disabled={!isAuthorizedAdmin}
                    value={targetUserSelect}
                    onChange={(e) => {
                      setTargetUserSelect(e.target.value);
                      setPreviewMember(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                  >
                    {SERVER_USERS.map((u) => (
                      <option key={u.id} value={u.username}>
                        @{u.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="priority-target-angle"
                    className="block text-xs font-medium text-slate-400 mb-1"
                  >
                    Specific Roast Angle / Inside Joke
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="priority-target-angle"
                      type="text"
                      disabled={!isAuthorizedAdmin}
                      value={targetAngleInput}
                      onChange={(e) => setTargetAngleInput(e.target.value)}
                      placeholder="e.g. Always goes AFK when the boss fight starts"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!isAuthorizedAdmin || !targetAngleInput.trim()}
                      className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Target</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-slate-950/50">
              {cust.priorityTargets.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">
                  No priority targets configured.
                </div>
              ) : (
                cust.priorityTargets.map((item) => (
                  <div
                    key={item.target}
                    className="p-3.5 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-amber-300">
                          @{item.target}
                        </span>
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-slate-500">
                          Added by @{item.addedBy}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        &ldquo;{item.angle}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onTestRoastInSimulator(item.target)}
                        className="px-2.5 py-1 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                        title={`Test roast on @${item.target} in Simulator`}
                      >
                        <Play className="w-3 h-3" />
                        <span>Test Roast</span>
                      </button>
                      <button
                        type="button"
                        disabled={!isAuthorizedAdmin}
                        onClick={() => handleRemoveTargetRule(item.target)}
                        aria-label={`Remove target ${item.target}`}
                        className="text-slate-500 hover:text-red-400 disabled:opacity-40 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
