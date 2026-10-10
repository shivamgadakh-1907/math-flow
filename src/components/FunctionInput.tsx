/* ====================================================================
   MathFlow — Function Input Component
   Supports explicit 2D, implicit curves, parametric, and polar functions
   with real-time classification, quick presets, and informative error hints.
   ==================================================================== */

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { classifyExpression, parseExpression } from '../math/engine';

interface FunctionInputProps {
  onAdd: (expression: string) => void;
}

const QUICK_FUNCTIONS = [
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'x²', expr: 'x^2' },
  { label: 'Circle: x²+y²=25', expr: 'x^2 + y^2 = 25' },
  { label: 'Heart Implicit', expr: '(x^2 + y^2 - 1)^3 = x^2 * y^3' },
  { label: 'Parametric Circle', expr: 'x = cos(t), y = sin(t)' },
  { label: 'Polar Cardioid', expr: 'r = 1 + cos(theta)' },
  { label: '1/(x−2)', expr: '1/(x - 2)' },
  { label: 'e⁻ˣ²', expr: 'exp(-x^2)' },
  { label: 'ln(x)', expr: 'ln(x)' },
  { label: '|x|', expr: 'abs(x)' },
];

export default function FunctionInput({ onAdd }: FunctionInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Real-time classification (§7)
  const classification = useMemo(() => {
    if (!value.trim()) return null;
    return classifyExpression(value);
  }, [value]);

  // Real-time parse validation preview (§37)
  const validation = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = parseExpression(trimmed);
    return parsed.error ? { error: parsed.error, detail: parsed.errorDetail } : null;
  }, [value]);

  const prefixLabel = useMemo(() => {
    if (!classification) return 'f(x) =';
    if (classification.type === 'parametric') return 'param:';
    if (classification.type === 'polar') return 'polar:';
    if (classification.type === 'implicit') return 'eq:';
    return 'f(x) =';
  }, [classification]);

  const handleSubmit = useCallback(() => {
    const expr = value.trim();
    if (!expr) return;
    onAdd(expr);
    setValue('');
  }, [value, onAdd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  }, [handleSubmit]);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="label-text">Enter Function, Implicit Equation, Parametric, or Polar</span>
        {classification && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-accent-dim)] text-white border border-[var(--color-accent)]/30 font-medium">
            {classification.description}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-xs font-mono font-medium select-none">
            {prefixLabel}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="sin(x), x^2, x=cos(t);y=sin(t), r=1+cos(theta), or x^2+y^2=25"
            className="input-field pl-16 pr-4 font-mono text-sm"
            id="function-input"
            aria-label="Enter mathematical function, implicit equation, parametric, or polar curve"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="btn-primary flex items-center gap-1.5 px-4"
          id="add-function-btn"
        >
          <span>+</span>
          <span>Add</span>
        </button>
      </div>

      {/* Validation warning hint (§37) */}
      {validation && value.trim().length > 3 && (
        <div className="mt-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
          <span>{validation.error}</span>
          {validation.detail && (
            <span className="text-[10px] text-amber-400/80 font-mono hidden sm:inline ml-2">
              {validation.detail}
            </span>
          )}
        </div>
      )}

      {/* Quick function presets */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex flex-wrap gap-1.5"
          >
            {QUICK_FUNCTIONS.map(item => (
              <button
                key={item.label}
                onClick={() => onAdd(item.expr)}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-[var(--color-border)] text-[11px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
