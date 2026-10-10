/* ====================================================================
   MathFlow — Information Panel (Left Side)
   Function analysis, mathematical properties, cursor tracking,
   clicked curve inspection, limits visualization, and multi-tier educational explanations.
   ==================================================================== */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphFunction, HoverPoint, ClickPoint, LimitState, EducationLevel } from '../types';
import { analyzeFunction, calculateLimit, numericalDerivative, formatSmartNumber } from '../math/engine';

interface InfoPanelProps {
  functions: GraphFunction[];
  selectedFuncId: string | null;
  hoverPoint: HoverPoint | null;
  clickPoint: ClickPoint | null;
  clickPoints?: ClickPoint[];
  onClearPoints?: () => void;
  globalTime: number;
  limitState: LimitState;
  setLimitState: (state: LimitState | ((prev: LimitState) => LimitState)) => void;
}

export default function InfoPanel({
  functions,
  selectedFuncId,
  hoverPoint,
  clickPoint,
  clickPoints,
  onClearPoints,
  globalTime,
  limitState,
  setLimitState,
}: InfoPanelProps) {
  const selectedFn = functions.find(f => f.id === selectedFuncId) || functions[0];

  // Limit target input state
  const [limitInput, setLimitInput] = useState<string>('0');

  // Analysis memo
  const analysis = useMemo(() => {
    if (!selectedFn?.compiled) return null;
    return analyzeFunction(
      selectedFn.compiled,
      selectedFn.expression,
      selectedFn.domain.from,
      selectedFn.domain.to,
      globalTime,
      selectedFn.isImplicit || selectedFn.funcType === 'implicit'
    );
  }, [selectedFn?.compiled, selectedFn?.expression, selectedFn?.domain, selectedFn?.isImplicit, selectedFn?.funcType, globalTime]);

  // Click point slope if on selected function
  const clickSlope = useMemo(() => {
    if (!clickPoint || !selectedFn?.compiled || selectedFn.isImplicit || selectedFn.funcType !== 'explicit') {
      return null;
    }
    const s = numericalDerivative(selectedFn.compiled, clickPoint.x, globalTime);
    return isNaN(s) ? null : s;
  }, [clickPoint, selectedFn, globalTime]);

  // Calculated limit result
  const limitResult = useMemo(() => {
    if (!selectedFn?.compiled || selectedFn.isImplicit || selectedFn.funcType !== 'explicit') {
      return null;
    }
    const num = parseFloat(limitInput);
    if (isNaN(num)) return null;
    return calculateLimit(selectedFn.compiled, num, globalTime);
  }, [selectedFn, limitInput, globalTime]);

  const handleApplyLimit = (xVal: number) => {
    setLimitInput(xVal.toString());
    if (selectedFn?.compiled && selectedFn.funcType === 'explicit') {
      const res = calculateLimit(selectedFn.compiled, xVal, globalTime);
      setLimitState({
        enabled: true,
        targetX: xVal,
        leftLimit: res.leftLimit,
        rightLimit: res.rightLimit,
        limit: res.limit,
        exists: res.exists,
        delta: 1.0,
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto divide-y divide-[var(--color-border)] select-text">
      {/* ── Clicked Curve Point (§16-18 Prominent Display) ── */}
      <AnimatePresence>
        {clickPoint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-[var(--color-accent-dim)]/20 border-l-2 border-[var(--color-accent)]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: clickPoint.color || '#3b82f6' }} />
                {clickPoint.funcName ? 'Curve Point' : 'Selected Point'}
                {clickPoints && clickPoints.length > 1 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] font-mono normal-case">
                    {clickPoints.length} total
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {onClearPoints && (
                  <button
                    id="infopanel-clear-points-btn"
                    onClick={onClearPoints}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-medium underline"
                    title="Clear all highlighted points"
                  >
                    Clear All
                  </button>
                )}
                {clickPoint.funcName && (
                  <button
                    onClick={() => handleApplyLimit(clickPoint.x)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-medium underline"
                    title="Explore limit at this coordinate"
                  >
                    Analyze Limit →
                  </button>
                )}
              </div>
            </div>

            <div className="font-mono text-xs space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[var(--color-text-muted)] text-[11px]">Coordinate</span>
                <span className="font-bold text-white text-sm">
                  ({formatSmartNumber(clickPoint.x)}, {formatSmartNumber(clickPoint.y)})
                </span>
              </div>
              {clickSlope !== null && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Tangent Slope f'(x)</span>
                  <span className="text-emerald-400">{formatSmartNumber(clickSlope)}</span>
                </div>
              )}
              {clickPoint.funcName && (
                <div className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">
                  Snapped to: <span style={{ color: clickPoint.color }}>{clickPoint.funcName}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hover cursor info ── */}
      <AnimatePresence>
        {hoverPoint && !clickPoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2.5 bg-white/[0.02]"
          >
            <div className="section-title mb-1.5 text-[10px]">Cursor Inspector</div>
            <div className="font-mono text-xs space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">x</span>
                <span style={{ color: hoverPoint.color }}>{formatSmartNumber(hoverPoint.x)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">y</span>
                <span style={{ color: hoverPoint.color }}>{formatSmartNumber(hoverPoint.y)}</span>
              </div>
              {hoverPoint.slope !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Slope</span>
                  <span className="text-[var(--color-text-secondary)]">{formatSmartNumber(hoverPoint.slope)}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Limit Visualization Tool (§27) ── */}
      {selectedFn && selectedFn.funcType === 'explicit' && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="section-title text-[10px]">Limit Tool: lim x→a</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={limitState.enabled}
                onChange={e => {
                  const val = parseFloat(limitInput) || 0;
                  if (e.target.checked && selectedFn.compiled) {
                    const res = calculateLimit(selectedFn.compiled, val, globalTime);
                    setLimitState({
                      enabled: true,
                      targetX: val,
                      leftLimit: res.leftLimit,
                      rightLimit: res.rightLimit,
                      limit: res.limit,
                      exists: res.exists,
                      delta: 1.0,
                    });
                  } else {
                    setLimitState(prev => ({ ...prev, enabled: false }));
                  }
                }}
                className="accent-[var(--color-accent)] w-3.5 h-3.5"
              />
              <span className="text-[10px] text-[var(--color-text-secondary)]">Show on Graph</span>
            </label>
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-mono text-[var(--color-text-muted)]">x →</span>
            <input
              type="text"
              value={limitInput}
              onChange={e => setLimitInput(e.target.value)}
              placeholder="e.g. 0, 2, -1"
              className="flex-1 bg-black/40 border border-[var(--color-border)] rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              onClick={() => {
                const val = parseFloat(limitInput);
                if (!isNaN(val)) handleApplyLimit(val);
              }}
              className="px-2 py-1 bg-[var(--color-accent)] text-white rounded text-[11px] font-medium"
            >
              Evaluate
            </button>
          </div>

          {/* Quick preset targets */}
          <div className="flex items-center gap-1 mb-2.5 flex-wrap">
            <span className="text-[10px] text-[var(--color-text-muted)] mr-1">Presets:</span>
            {[0, 1, 2, -1].map(val => (
              <button
                key={val}
                onClick={() => handleApplyLimit(val)}
                className="px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.1] text-[10px] font-mono text-[var(--color-text-secondary)]"
              >
                x={val}
              </button>
            ))}
          </div>

          {/* Evaluated Limit Results */}
          {limitResult && (
            <div className="bg-black/30 rounded-lg p-2.5 border border-white/[0.05] space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-sky-400">LHL (x→a⁻)</span>
                <span className="text-white">
                  {limitResult.leftLimit !== null ? formatSmartNumber(limitResult.leftLimit) : 'undefined'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-400">RHL (x→a⁺)</span>
                <span className="text-white">
                  {limitResult.rightLimit !== null ? formatSmartNumber(limitResult.rightLimit) : 'undefined'}
                </span>
              </div>
              <div className="border-t border-white/10 pt-1 flex justify-between items-center">
                <span className="font-bold text-[10px] uppercase text-[var(--color-text-muted)]">Result</span>
                <span className={`font-bold ${limitResult.exists ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {limitResult.exists ? `Limit = ${formatSmartNumber(limitResult.limit)}` : 'Limit DNE'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Function Analysis Panel (§11-13) ── */}
      {selectedFn && analysis ? (
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="section-title text-[10px]">Mathematical Analysis</span>
          </div>

          {/* Equation */}
          <InfoRow label="Equation" value={selectedFn.displayExpr} mono />

          {/* Type / Family */}
          <InfoRow
            label="Type"
            value={
              selectedFn.funcType === 'parametric'
                ? 'Parametric Curve • (x(t), y(t))'
                : selectedFn.funcType === 'polar'
                ? 'Polar Function • r(θ)'
                : selectedFn.isImplicit || selectedFn.funcType === 'implicit'
                ? 'Implicit Equation • F(x, y) = 0'
                : 'Explicit 2D Function • y = f(x)'
            }
            badge={selectedFn.funcType.toUpperCase()}
          />

          {/* Educational Explanation (§34) */}
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <div className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wide mb-1">
              Curriculum Overview
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              {getEducationalSummary(selectedFn, 'student')}
            </p>
          </div>

          {/* Domain */}
          <InfoRow
            label="Domain"
            value={analysis.domain.description}
            badge={analysis.domain.exact ? 'Exact' : 'Domain'}
          />

          {/* Range */}
          <InfoRow
            label="Range"
            value={analysis.range.description}
            badge={analysis.range.exact ? 'Exact' : 'Estimated'}
          />

          {/* Symmetry */}
          <InfoRow
            label="Symmetry"
            value={
              analysis.symmetry.type === 'even'
                ? 'Even: f(−x) = f(x) (Symmetric about Y-axis)'
                : analysis.symmetry.type === 'odd'
                ? 'Odd: f(−x) = −f(x) (180° Rotational Origin Symmetry)'
                : analysis.symmetry.type === 'neither'
                ? 'Neither even nor odd'
                : 'Non-symmetric or general curve'
            }
            badge={analysis.symmetry.exact ? 'Exact' : 'Numerical'}
          />

          {/* Periodicity */}
          <InfoRow
            label="Periodicity"
            value={analysis.period.description}
            badge={analysis.period.exact ? 'Exact' : 'Numerical'}
          />

          {/* Continuity & Discontinuities */}
          <InfoRow label="Continuity" value={analysis.continuity} />
          {analysis.undefinedRegions !== 'None detected' && (
            <InfoRow label="Undefined Points" value={analysis.undefinedRegions} />
          )}

          {/* Intercepts */}
          <InfoRow
            label="Y-intercept"
            value={analysis.intercepts.y !== null ? `(0, ${formatSmartNumber(analysis.intercepts.y)})` : 'None / undefined'}
          />
          <InfoRow
            label="X-intercepts (Roots)"
            value={
              analysis.intercepts.x.length > 0
                ? analysis.intercepts.x.slice(0, 6).map(x => formatSmartNumber(x)).join(', ') +
                  (analysis.intercepts.x.length > 6 ? '...' : '')
                : 'None detected in domain'
            }
            badge="Numerical"
          />

          {/* Extrema */}
          {analysis.extrema.maxima.length > 0 && (
            <InfoRow
              label="Local Maxima"
              value={`at x ≈ ${analysis.extrema.maxima.slice(0, 4).map(x => formatSmartNumber(x)).join(', ')}`}
              badge="Extrema"
            />
          )}
          {analysis.extrema.minima.length > 0 && (
            <InfoRow
              label="Local Minima"
              value={`at x ≈ ${analysis.extrema.minima.slice(0, 4).map(x => formatSmartNumber(x)).join(', ')}`}
              badge="Extrema"
            />
          )}

          {/* Asymptotes */}
          {analysis.asymptotes && (
            <InfoRow label="Asymptotes" value={analysis.asymptotes} />
          )}

          {/* Online Reference / Learn More (§35) */}
          <div className="pt-2 border-t border-[var(--color-border)]">
            <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Learn More
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-normal">
              Explore calculus tangent lines, integration bounds, and parameter animation from the right panel and bottom controls.
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <div className="text-[var(--color-text-muted)] text-xs">
            Add or select a function to inspect mathematical properties.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Educational Summary Generator (§33 & §34) ─────────────────────────

function getEducationalSummary(fn: GraphFunction, level: EducationLevel): string {
  const expr = fn.expression.toLowerCase();

  if (fn.funcType === 'parametric') {
    if (level === 'beginner') return 'A curve defined by two equations tracking x and y coordinates simultaneously over a moving parameter t.';
    if (level === 'student') return 'Parametric equations specify coordinates as functions of an independent parameter t: x(t) and y(t). Velocity vector is (x\'(t), y\'(t)).';
    return '1D manifold embedded in R². Tangent vector is given by (dx/dt, dy/dt); arc length element ds = √(x\'² + y\'²) dt.';
  }

  if (fn.funcType === 'polar') {
    if (level === 'beginner') return 'A curve mapped by distance from the origin (r) based on angle of rotation (θ).';
    if (level === 'student') return 'Polar coordinates describe points by radius r(θ) and angle θ. Transformation to Cartesian coordinates: x = r·cos(θ), y = r·sin(θ).';
    return 'Planar curve in polar coordinate system (r, θ). Area differential dA = ½ r² dθ; curvature κ = (r² + 2r\'² − r·r\'\') / (r² + r\'²)^(3/2).';
  }

  if (fn.isImplicit || fn.funcType === 'implicit') {
    if (level === 'beginner') return 'An equation where x and y are balanced on both sides, forming geometric shapes like circles, ovals, or loops.';
    if (level === 'student') return 'Level curve F(x, y) = 0. Tangent slope dy/dx = −(∂F/∂x) / (∂F/∂y) via the Implicit Function Theorem.';
    return 'Zero-set of a smooth scalar field F: R² → R. Regular points satisfy ∇F ≠ 0, defining locally 1D manifolds by the Implicit Function Theorem.';
  }

  // Common explicit patterns
  if (expr.includes('sin') || expr.includes('cos')) {
    if (level === 'beginner') return 'A smooth wave repeating periodically, oscillating smoothly between high peaks and low valleys.';
    if (level === 'student') return 'Trigonometric harmonic wave with period 2π/k and amplitude A. Key building block of Fourier analysis.';
    return 'C^∞ smooth analytic harmonic function satisfying the Helmholtz differential equation d²y/dx² + ω²y = 0.';
  }

  if (expr.includes('exp') || expr.includes('e^')) {
    if (level === 'beginner') return 'A curve that grows or decays very rapidly, where the rate of change is proportional to its own value.';
    if (level === 'student') return 'Exponential curve y = eˣ. Its derivative is identical to itself: d/dx(eˣ) = eˣ. Always positive for all real x.';
    return 'Unique analytic eigenfunction of the derivative operator d/dx with eigenvalue 1: f\'(x) = f(x) with f(0) = 1.';
  }

  if (expr.includes('log') || expr.includes('ln')) {
    if (level === 'beginner') return 'The inverse of an exponential curve — grows quickly at first, then flattens out, only defined for positive x.';
    if (level === 'student') return 'Natural logarithm ln(x). Defined on (0, ∞) with vertical asymptote at x = 0 and x-intercept at (1, 0). Derivative is 1/x.';
    return 'Inverse of the exponential map, defined as the integral ∫₁ˣ (1/t) dt. Strictly concave function mapping (0, ∞) onto R.';
  }

  if (expr.includes('^2') || expr.includes('x*x')) {
    if (level === 'beginner') return 'A parabolic curve shaped like a U, symmetric around its vertex with a single minimum or maximum.';
    if (level === 'student') return 'Quadratic polynomial. Second derivative is constant, indicating uniform curvature. Solvable via quadratic formula.';
    return 'Convex quadratic form. Has a unique critical point where f\'(x) = 0, representing the global extremum.';
  }

  if (level === 'beginner') return 'An algebraic curve showing the relationship between input x and output f(x).';
  if (level === 'student') return 'Real-valued function f: R → R. Explore domain constraints, zeroes, and derivative slopes.';
  return 'Real-valued scalar map with local differential properties determined by f\'(x) and Riemann integral.';
}

// ── Info Row Helper ───────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  badge,
  mono,
}: {
  label: string;
  value: string;
  badge?: string;
  mono?: boolean;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </span>
        {badge && (
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
              badge === 'Exact'
                ? 'bg-emerald-500/10 text-emerald-400'
                : badge === 'Numerical'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-white/5 text-[var(--color-text-muted)]'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className={`text-xs text-[var(--color-text-secondary)] ${mono ? 'font-mono' : ''} break-all`}>
        {value}
      </div>
    </div>
  );
}
