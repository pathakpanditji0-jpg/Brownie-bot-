import React, { useState } from 'react';
import { Copy, Check, Download, Code2 } from 'lucide-react';
import { ServerState } from '../utils/botEngine';
import { generateDiscordBotSource } from '../utils/discordCodeGenerator';

interface BotCodeExporterProps {
  serverState: ServerState;
}

export const BotCodeExporter: React.FC<BotCodeExporterProps> = ({
  serverState,
}) => {
  const [copied, setCopied] = useState(false);

  const code = generateDiscordBotSource({
    roastModeDefault: serverState.config.roastMode,
    customization: serverState.config.customization,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brownie-bot-gemini.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Code2 className="w-4 h-4" />
            <span>DISCORD.JS + @GOOGLE/GENAI PRODUCTION SCRIPT</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Export Updated Discord Server Bot (index.js)
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            This generated script embeds your live Customization Studio settings
            (custom greeting, roast topics, target lore, and{' '}
            <code className="text-amber-300">
              {serverState.config.customization.roastStyle}
            </code>{' '}
            style), uses <code className="text-amber-300">@google/genai</code>{' '}
            (<code className="text-amber-300">gemini-3.8-flash</code>) as its AI
            brain, and grants full admin command authority to{' '}
            <code className="text-amber-300">akshatkrofficial_47531</code> and{' '}
            <code className="text-amber-300">killer_sole5</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs inline-flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy index.js</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download index.js</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>index.js — Node.js + Discord.js v14 + @google/genai</span>
          <span>
            Owners: akshatkrofficial_47531, killer_sole5 · Brain: gemini-3.8-flash
          </span>
        </div>
        <pre className="p-5 text-xs font-mono text-slate-200 overflow-x-auto max-h-[540px] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
