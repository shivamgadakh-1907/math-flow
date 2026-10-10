/* ====================================================================
   MathFlow — Function Library Page
   Searchable, filterable library of 100+ functions with mini previews
   ==================================================================== */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FUNCTION_LIBRARY, CATEGORIES, CATEGORY_COLORS, searchFunctions, type LibraryFunction } from '../math/library';
import { parseExpression, evaluateFunction } from '../math/engine';

interface LibraryPageProps {
  onVisualize: (expression: string, name?: string, displayExpr?: string) => void;
}

export default function LibraryPage({ onVisualize }: LibraryPageProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    let results = searchFunctions(search);
    if (category !== 'All') {
      results = results.filter(fn => fn.category === category);
    }
    return results;
  }, [search, category]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = { All: FUNCTION_LIBRARY.length };
    for (const fn of FUNCTION_LIBRARY) {
      counts[fn.category] = (counts[fn.category] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Search & Filter */}
      <div className="px-5 py-4 border-b border-[var(--color-border)] shrink-0">
        <h2 className="text-lg font-semibold mb-3">Function Library</h2>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search functions..."
          className="input-field mb-3"
          id="library-search"
        />
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setCategory('All')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all
              ${category === 'All'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] bg-white/[0.03]'
              }`}
          >
            All ({categories['All']})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all
                ${category === cat
                  ? 'text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] bg-white/[0.03]'
                }`}
              style={category === cat ? { backgroundColor: CATEGORY_COLORS[cat] || '#6366f1' } : undefined}
            >
              {cat} ({categories[cat] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Function Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((fn, i) => (
              <FunctionCard
                key={fn.id}
                fn={fn}
                index={i}
                onVisualize={() => onVisualize(fn.expression, fn.name, fn.displayExpr)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)] text-sm">
            No functions match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Function Card ────────────────────────────────────────────────────

function FunctionCard({
  fn, index, onVisualize
}: {
  fn: LibraryFunction;
  index: number;
  onVisualize: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const color = CATEGORY_COLORS[fn.category] || '#6366f1';

  // Mini preview
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 200;
    const h = 60;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = '100%';
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const parsed = parseExpression(fn.expression);
    if (!parsed.compiled) return;

    // Auto range
    const from = -5;
    const to = 5;
    const points: { x: number; y: number }[] = [];
    let minY = Infinity, maxY = -Infinity;

    for (let i = 0; i <= 100; i++) {
      const x = from + (to - from) * (i / 100);
      const y = evaluateFunction(parsed.compiled, x);
      if (!isNaN(y) && isFinite(y) && Math.abs(y) < 1000) {
        points.push({ x, y });
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (points.length < 2) return;

    const rangeY = Math.max(maxY - minY, 0.1);
    const padding = rangeY * 0.1;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color + '80';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let started = false;
    let prevScreenY = 0;

    for (const p of points) {
      const sx = ((p.x - from) / (to - from)) * w;
      const sy = h - ((p.y - minY + padding) / (rangeY + 2 * padding)) * h;

      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        if (Math.abs(sy - prevScreenY) > h * 0.8) {
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sx, sy);
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      prevScreenY = sy;
    }
    ctx.stroke();
  }, [fn, color]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      className="glass-panel-solid overflow-hidden group hover:border-[var(--color-border-hover)] transition-all duration-200"
    >
      {/* Mini graph */}
      <div className="relative h-[60px] bg-[var(--color-bg)] overflow-hidden">
        <canvas ref={canvasRef} className="w-full" />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(transparent 50%, ${color}10)` }}
        />
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="text-xs font-medium text-[var(--color-text)] truncate">{fn.name}</div>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: color + '15', color }}
          >
            {fn.category}
          </span>
        </div>
        <div className="text-[11px] font-mono text-[var(--color-text-secondary)] mb-2 truncate">
          {fn.displayExpr}
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)] mb-2 line-clamp-2">
          {fn.description}
        </div>
        <button
          onClick={onVisualize}
          className="w-full btn-primary text-[11px] py-1.5"
          style={{ backgroundColor: color }}
        >
          Visualize
        </button>
      </div>
    </motion.div>
  );
}
