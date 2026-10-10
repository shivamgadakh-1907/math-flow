/* ====================================================================
   MathFlow — Animation Controls Bar (Bottom)
   Mode selection, time slider, morph controls
   ==================================================================== */

import type { AnimationMode, MorphState } from '../types';

interface AnimationControlsProps {
  animationMode: AnimationMode;
  setAnimationMode: (m: AnimationMode) => void;
  globalTime: number;
  setGlobalTime: (t: number) => void;
  morphState: MorphState;
  setMorphState: (s: MorphState | ((prev: MorphState) => MorphState)) => void;
  playAll: () => void;
  pauseAll: () => void;
  restartAll: () => void;
}

const MODES: { key: AnimationMode; label: string; icon: string; desc: string }[] = [
  { key: 'draw', label: 'Draw', icon: '✎', desc: 'Progressively reveal' },
  { key: 'trace', label: 'Trace', icon: '●', desc: 'Move along curve' },
  { key: 'time', label: 'Time', icon: '⏱', desc: 'Time parameter' },
  { key: 'morph', label: 'Morph', icon: '⇌', desc: 'Transform between' },
];

export default function AnimationControls({
  animationMode, setAnimationMode,
  globalTime, setGlobalTime,
  morphState, setMorphState,
  playAll, pauseAll, restartAll,
}: AnimationControlsProps) {
  return (
    <div className="h-auto border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 shrink-0">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Mode selector */}
        <div className="flex items-center gap-1">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setAnimationMode(m.key)}
              title={m.desc}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200
                ${animationMode === m.key
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-white/[0.03]'
                }`}
            >
              <span className="mr-1">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--color-border)]" />

        {/* Global playback (§22 & §43) */}
        <div className="flex items-center">
          <button
            onClick={restartAll}
            className="btn-ghost text-[11px] px-2.5 py-1.5 flex items-center gap-1.5"
            title="Restart All Animations to Initial State (R)"
          >
            <span className="text-xs">↻</span>
            <span>Restart All</span>
          </button>
        </div>

        {/* Time mode slider */}
        {animationMode === 'time' && (
          <>
            <div className="w-px h-6 bg-[var(--color-border)]" />
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">t={globalTime.toFixed(2)}</span>
              <input
                type="range"
                min="0"
                max="20"
                step="0.05"
                value={globalTime}
                onChange={e => setGlobalTime(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--color-accent)]"
                style={{ height: '4px' }}
              />
              <span className="text-[10px] text-[var(--color-text-muted)]">20</span>
            </div>
          </>
        )}

        {/* Morph controls */}
        {animationMode === 'morph' && (
          <>
            <div className="w-px h-6 bg-[var(--color-border)]" />
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={morphState.enabled}
                  onChange={e => setMorphState(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="accent-[var(--color-accent)]"
                />
                <span className="text-[10px] text-[var(--color-text-muted)]">Enable</span>
              </label>
              <input
                type="text"
                value={morphState.functionB}
                onChange={e => setMorphState(prev => ({ ...prev, functionB: e.target.value }))}
                placeholder="Target: cos(x)"
                className="input-field text-[11px] py-1 w-28"
              />
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {Math.round(morphState.progress * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={morphState.progress}
                onChange={e => setMorphState(prev => ({ ...prev, progress: parseFloat(e.target.value) }))}
                className="flex-1 accent-[var(--color-accent)]"
                style={{ height: '4px' }}
              />
            </div>
          </>
        )}

        {/* Keyboard hints */}
        <div className="ml-auto flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] hidden lg:flex">
          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-[var(--color-border)]">Space</span>
          <span>Play/Pause</span>
          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-[var(--color-border)]">R</span>
          <span>Restart</span>
          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-[var(--color-border)]">F</span>
          <span>Fullscreen</span>
        </div>
      </div>
    </div>
  );
}
