/* ====================================================================
   MathFlow — Function Manager (Right Panel)
   Individual function controls with animation, visibility, speed
   ==================================================================== */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphFunction } from '../types';
import { parseDomainValue } from '../math/engine';

interface FunctionManagerProps {
  functions: GraphFunction[];
  selectedFuncId: string | null;
  setSelectedFuncId: (id: string | null) => void;
  updateFunction: (id: string, updates: Partial<GraphFunction>) => void;
  removeFunction: (id: string) => void;
  toggleAnimation: (id: string) => void;
  restartAnimation: (id: string) => void;
  updateExpression: (id: string, expr: string) => void;
  saveFunction: (expr: string, name: string) => void;
  playAll: () => void;
  pauseAll: () => void;
  restartAll: () => void;
  resetView: () => void;
}

const SPEED_PRESETS = [0.1, 0.25, 0.5, 0.75, 1, 2, 4, 8];

export default function FunctionManager({
  functions, selectedFuncId, setSelectedFuncId,
  updateFunction, removeFunction, toggleAnimation,
  restartAnimation, updateExpression, saveFunction,
  playAll, pauseAll, restartAll, resetView
}: FunctionManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [domainFrom, setDomainFrom] = useState('');
  const [domainTo, setDomainTo] = useState('');
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null);

  const startEdit = useCallback((fn: GraphFunction) => {
    setEditingId(fn.id);
    setEditValue(fn.expression);
  }, []);

  const submitEdit = useCallback((id: string) => {
    if (editValue.trim()) {
      updateExpression(id, editValue.trim());
    }
    setEditingId(null);
  }, [editValue, updateExpression]);

  const startDomainEdit = useCallback((fn: GraphFunction) => {
    setEditingDomainId(fn.id);
    setDomainFrom(fn.domain.from.toString());
    setDomainTo(fn.domain.to.toString());
  }, []);

  const applyDomain = useCallback((id: string) => {
    const from = parseDomainValue(domainFrom);
    const to = parseDomainValue(domainTo);
    if (from !== null && to !== null && from < to) {
      updateFunction(id, { domain: { from, to } });
    }
    setEditingDomainId(null);
  }, [domainFrom, domainTo, updateFunction]);

  const autoDomain = useCallback((fn: GraphFunction) => {
    updateFunction(fn.id, { domain: { ...fn.autoDomain } });
    setEditingDomainId(null);
  }, [updateFunction]);

  return (
    <div className="flex flex-col h-full">
      {/* Global Controls (§22 & §43) */}
      <div className="px-3 py-2 border-b border-[var(--color-border)]">
        <div className="section-title mb-2">Global Controls</div>
        <div className="flex gap-2">
          <button
            onClick={restartAll}
            className="btn-ghost text-[11px] flex-1 flex items-center justify-center gap-1.5 py-1.5 font-medium"
            title="Reset & Restart all animations to initial state (R)"
          >
            <span className="text-xs">↻</span> Restart All
          </button>
          <button
            onClick={resetView}
            className="btn-ghost text-[11px] px-3 flex items-center justify-center gap-1 py-1.5"
            title="Reset zoom & pan"
          >
            <span>⊞</span> Reset
          </button>
        </div>
      </div>

      {/* Function List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <div className="section-title mb-2">Functions ({functions.length})</div>
        </div>

        <AnimatePresence>
          {functions.map((fn, index) => (
            <motion.div
              key={fn.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`mx-2 mb-2 rounded-lg border transition-all duration-200 cursor-pointer
                ${selectedFuncId === fn.id 
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]' 
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-hover)]'
                }`}
              onClick={() => setSelectedFuncId(fn.id === selectedFuncId ? null : fn.id)}
            >
              {/* Function header */}
              <div className="px-3 py-2 flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: fn.color }}
                />
                <div className="flex-1 min-w-0">
                  {editingId === fn.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitEdit(fn.id)}
                      onBlur={() => submitEdit(fn.id)}
                      className="input-field text-xs py-1"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className="text-xs font-mono text-[var(--color-text)] truncate">
                        {fn.displayExpr}
                      </div>
                      {fn.isImplicit && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                          implicit
                        </span>
                      )}
                    </div>
                  )}
                  {fn.error && (
                    <div className="text-[10px] text-[var(--color-error)] mt-0.5">{fn.error}</div>
                  )}
                </div>
              </div>

              {/* Controls (expanded when selected) */}
              {selectedFuncId === fn.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-[var(--color-border)] px-3 py-2"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Playback */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <button
                      onClick={() => toggleAnimation(fn.id)}
                      className="btn-icon"
                      title={fn.isAnimating ? 'Pause' : 'Play'}
                    >
                      {fn.isAnimating ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={() => restartAnimation(fn.id)}
                      className="btn-icon"
                      title="Restart"
                    >
                      ↻
                    </button>
                    <button
                      onClick={() => updateFunction(fn.id, { visible: !fn.visible })}
                      className="btn-icon"
                      title={fn.visible ? 'Hide' : 'Show'}
                    >
                      {fn.visible ? '👁' : '👁‍🗨'}
                    </button>
                    <button onClick={() => startEdit(fn)} className="btn-icon" title="Edit">✎</button>
                    <button
                      onClick={() => saveFunction(fn.expression, fn.name)}
                      className="btn-icon"
                      title="Save"
                    >
                      ★
                    </button>
                    <button
                      onClick={() => removeFunction(fn.id)}
                      className="btn-icon text-[var(--color-error)]"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="text-[10px] text-[var(--color-text-muted)] mb-1">
                      Progress: {Math.round(fn.animationProgress * 100)}%
                    </div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{
                          width: `${fn.animationProgress * 100}%`,
                          backgroundColor: fn.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Speed */}
                  <div className="mb-2">
                    <div className="text-[10px] text-[var(--color-text-muted)] mb-1">
                      Speed: {fn.animationSpeed}x
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {SPEED_PRESETS.map(s => (
                        <button
                          key={s}
                          onClick={() => updateFunction(fn.id, { animationSpeed: s })}
                          className={`px-1.5 py-0.5 rounded text-[10px] transition-all
                            ${fn.animationSpeed === s
                              ? 'bg-[var(--color-accent)] text-white'
                              : 'bg-white/[0.04] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                            }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="8"
                      step="0.1"
                      value={fn.animationSpeed}
                      onChange={e => updateFunction(fn.id, { animationSpeed: parseFloat(e.target.value) })}
                      className="w-full mt-1 accent-[var(--color-accent)]"
                      style={{ height: '4px' }}
                    />
                  </div>

                  {/* Domain */}
                  <div className="mb-2">
                    <div className="text-[10px] text-[var(--color-text-muted)] mb-1">Domain</div>
                    {editingDomainId === fn.id ? (
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          value={domainFrom}
                          onChange={e => setDomainFrom(e.target.value)}
                          className="input-field text-[11px] py-1 w-16"
                          placeholder="-10"
                        />
                        <span className="text-[10px] text-[var(--color-text-muted)]">to</span>
                        <input
                          type="text"
                          value={domainTo}
                          onChange={e => setDomainTo(e.target.value)}
                          className="input-field text-[11px] py-1 w-16"
                          placeholder="10"
                        />
                        <button onClick={() => applyDomain(fn.id)} className="btn-ghost text-[10px]">✓</button>
                        <button onClick={() => autoDomain(fn)} className="btn-ghost text-[10px]">Auto</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startDomainEdit(fn)}
                        className="text-[11px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                      >
                        [{fn.domain.from.toFixed(2)}, {fn.domain.to.toFixed(2)}]
                      </button>
                    )}
                  </div>

                  {/* Analysis toggles */}
                  {fn.isImplicit ? (
                    <div className="text-[10px] text-[var(--color-text-muted)] italic py-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80 inline-block" />
                      Implicit curve • Solution set F(x, y) = 0
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fn.showDerivative}
                            onChange={e => updateFunction(fn.id, { showDerivative: e.target.checked })}
                            className="accent-[var(--color-accent)]"
                          />
                          f'(x)
                        </label>
                        <label className="flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fn.showIntegral}
                            onChange={e => updateFunction(fn.id, { showIntegral: e.target.checked })}
                            className="accent-[var(--color-accent)]"
                          />
                          ∫f(x)dx
                        </label>
                      </div>

                      {/* Integral bounds */}
                      {fn.showIntegral && (
                        <div className="mt-2 flex gap-1 items-center">
                          <span className="text-[10px] text-[var(--color-text-muted)]">a=</span>
                          <input
                            type="number"
                            value={fn.integralBounds.a}
                            onChange={e => updateFunction(fn.id, {
                              integralBounds: { ...fn.integralBounds, a: parseFloat(e.target.value) || 0 }
                            })}
                            className="input-field text-[11px] py-1 w-14"
                            step="0.5"
                          />
                          <span className="text-[10px] text-[var(--color-text-muted)]">b=</span>
                          <input
                            type="number"
                            value={fn.integralBounds.b}
                            onChange={e => updateFunction(fn.id, {
                              integralBounds: { ...fn.integralBounds, b: parseFloat(e.target.value) || 0 }
                            })}
                            className="input-field text-[11px] py-1 w-14"
                            step="0.5"
                          />
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {functions.length === 0 && (
          <div className="px-4 py-8 text-center">
            <div className="text-[var(--color-text-muted)] text-xs">
              No functions added yet.
            </div>
            <div className="text-[var(--color-text-muted)] text-[10px] mt-1">
              Type a function above or browse the library.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
