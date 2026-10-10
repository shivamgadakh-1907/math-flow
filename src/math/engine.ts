/* ====================================================================
   MathFlow — Math Engine
   Expression parsing, evaluation, domain detection, analysis
   Supports explicit, implicit, parametric, and polar functions
   ==================================================================== */

import { compile, parse, type MathNode, type EvalFunction } from 'mathjs';
import type { FunctionType, ParametricDef, PolarDef } from '../types';

// ── Types ──────────────────────────────────────────────────────────────

export interface EvalResult {
  x: number;
  y: number;
  valid: boolean;
}

export interface FunctionAnalysis {
  domain: { from: number; to: number; description: string; exact: boolean };
  range: { min: number; max: number; description: string; exact: boolean };
  symmetry: { type: 'even' | 'odd' | 'neither' | 'unknown'; exact: boolean };
  period: { value: number | null; description: string; exact: boolean };
  intercepts: { x: number[]; y: number | null };
  continuity: string;
  undefinedRegions: string;
  extrema: { minima: number[]; maxima: number[] };
  increasing: string;
  decreasing: string;
  asymptotes: string;
}

export interface ParsedFunction {
  expression: string;
  compiled: EvalFunction | null;
  hasTime: boolean;
  funcType: FunctionType;
  isImplicit: boolean;
  parametric?: ParametricDef;
  polar?: PolarDef;
  error: string | null;
  errorDetail?: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const PI = Math.PI;
const E = Math.E;

// ── Supported functions list (for error hints) ────────────────────────

const SUPPORTED_FUNCTIONS = [
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'asin', 'acos', 'atan', 'atan2',
  'sinh', 'cosh', 'tanh', 'coth', 'sech', 'csch',
  'log', 'ln', 'log2', 'log10', 'exp',
  'sqrt', 'cbrt', 'abs', 'sign', 'sgn',
  'floor', 'ceil', 'round',
  'max', 'min', 'mod',
  'pow', 'factorial',
  'sinc',
];

// ── Detect parametric expressions ─────────────────────────────────────

export function detectParametric(input: string): { isParametric: boolean; xExpr?: string; yExpr?: string } {
  const cleaned = input.trim();

  // Pattern: x = expr, y = expr (separated by ; or newline or comma)
  const paramPattern = /^\s*x\s*(?:\(t\))?\s*=\s*(.+?)(?:\s*[;,\n]\s*|\s+)y\s*(?:\(t\))?\s*=\s*(.+?)\s*$/i;
  const match = cleaned.match(paramPattern);
  if (match) {
    return { isParametric: true, xExpr: match[1].trim(), yExpr: match[2].trim() };
  }

  // Pattern: x(t) = expr; y(t) = expr
  const paramPattern2 = /x\s*\(\s*t\s*\)\s*=\s*(.+?)\s*[;,]\s*y\s*\(\s*t\s*\)\s*=\s*(.+)/i;
  const match2 = cleaned.match(paramPattern2);
  if (match2) {
    return { isParametric: true, xExpr: match2[1].trim(), yExpr: match2[2].trim() };
  }

  return { isParametric: false };
}

// ── Detect polar expressions ──────────────────────────────────────────

export function detectPolar(input: string): { isPolar: boolean; rExpr?: string } {
  const cleaned = input.trim();

  // Pattern: r = expr or r(θ) = expr or r(theta) = expr
  const polarPattern = /^\s*r\s*(?:\(\s*(?:θ|theta|t)\s*\))?\s*=\s*(.+)\s*$/i;
  const match = cleaned.match(polarPattern);
  if (match) {
    return { isPolar: true, rExpr: match[1].trim() };
  }

  return { isPolar: false };
}

// ── Classify Expression ───────────────────────────────────────────────

export interface ClassificationResult {
  type: FunctionType;
  family: string;
  description: string;
  variable: string;
  badge: string;
}

export function classifyExpression(input: string): ClassificationResult {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  const param = detectParametric(trimmed);
  if (param.isParametric) {
    return {
      type: 'parametric',
      family: 'Parametric Curve',
      description: 'Parametric Curve (x(t), y(t))',
      variable: 't',
      badge: 'Parametric',
    };
  }
  const polar = detectPolar(trimmed);
  if (polar.isPolar) {
    return {
      type: 'polar',
      family: 'Polar Function',
      description: 'Polar Function r(θ)',
      variable: 'θ / theta',
      badge: 'Polar',
    };
  }
  const pre = preprocessExpression(trimmed);
  if (pre.isImplicit) {
    return {
      type: 'implicit',
      family: 'Implicit Curve',
      description: 'Implicit Equation F(x, y) = 0',
      variable: 'x, y',
      badge: 'Implicit',
    };
  }

  // Explicit family classification
  let family = 'Algebraic';
  if (/sin|cos|tan|cot|sec|csc/.test(lower) && !/asin|acos|atan|sinh|cosh|tanh/.test(lower)) {
    family = 'Trigonometric';
  } else if (/asin|acos|atan/.test(lower)) {
    family = 'Inverse Trigonometric';
  } else if (/sinh|cosh|tanh|coth|sech|csch/.test(lower)) {
    family = 'Hyperbolic';
  } else if (/exp|e\^|\be\b/.test(lower) && /\^/.test(lower)) {
    family = 'Exponential';
  } else if (/\blog\b|ln\b/.test(lower)) {
    family = 'Logarithmic';
  } else if (/sqrt|cbrt/.test(lower)) {
    family = 'Radical';
  } else if (/\^[3-9]|\^1\d/.test(lower)) {
    family = 'Polynomial';
  } else if (/\^2/.test(lower)) {
    family = 'Quadratic';
  } else if (/\//.test(lower) && /x/.test(lower)) {
    family = 'Rational';
  } else if (/abs|floor|ceil|sign/.test(lower)) {
    family = 'Piecewise / Step';
  }

  return {
    type: 'explicit',
    family,
    description: `Explicit 2D ${family} Function`,
    variable: 'x',
    badge: family,
  };
}

// ── Expression Preprocessing ──────────────────────────────────────────

export function preprocessExpression(expr: string): { expression: string; isImplicit: boolean } {
  let s = expr.trim();
  
  // Replace unicode and common notation
  s = s.replace(/π/g, 'pi');
  s = s.replace(/θ/g, 'theta');
  s = s.replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');
  s = s.replace(/⁵/g, '^5').replace(/⁶/g, '^6').replace(/⁷/g, '^7');
  s = s.replace(/⁸/g, '^8').replace(/⁹/g, '^9').replace(/⁰/g, '^0');
  s = s.replace(/√/g, 'sqrt');
  s = s.replace(/∞/g, 'Infinity');

  // Check if it's an explicit f(x) = or y = definition where RHS doesn't contain y
  const explicitMatch = s.match(/^(?:[fghy]\s*\(\s*[xt]\s*\)|y)\s*=\s*(.+)$/i);
  let isExplicitAssignment = false;
  if (explicitMatch) {
    const rhs = explicitMatch[1].trim();
    if (!/\by\b/.test(rhs)) {
      s = rhs;
      isExplicitAssignment = true;
    }
  }

  // Handle implicit equations with '=': LHS = RHS -> ((LHS) - (RHS)) = 0
  let hadEquals = false;
  if (!isExplicitAssignment && s.includes('=')) {
    hadEquals = true;
    const parts = s.split('=');
    if (parts.length === 2) {
      s = `((${parts[0].trim()}) - (${parts[1].trim()}))`;
    }
  }

  // Handle log_a(x) -> log(x, a)
  s = s.replace(/log_([\d]+)\(([^)]+)\)/g, 'log($2, $1)');
  s = s.replace(/log₂\(([^)]+)\)/g, 'log($1, 2)');
  s = s.replace(/log₁₀\(([^)]+)\)/g, 'log($1, 10)');
  
  // Handle sin^2(x) -> sin(x)^2
  s = s.replace(/(sin|cos|tan|cot|sec|csc)\^(\d)\(([^)]+)\)/g, '($1($3))^$2');
  
  // Handle implicit multiplication: 2x -> 2*x, 2sin -> 2*sin, etc.
  s = s.replace(/(\d)\s*([a-zA-Z(])/g, '$1*$2');
  s = s.replace(/\)\s*(\d)/g, ')*$1');
  s = s.replace(/\)\s*([a-zA-Z(])/g, ')*$1');

  // Adjacent coordinate variables: xy -> x*y, yx -> y*x
  s = s.replace(/\bxy\b/gi, 'x*y');
  s = s.replace(/\byx\b/gi, 'y*x');

  // Variable after exponent: x^2 y^3 or x^2y -> x^2*y^3
  s = s.replace(/(\^[\d]+)\s*([a-zA-Z(])/g, '$1*$2');
  
  // Handle |x| -> abs(x)
  s = s.replace(/\|([^|]+)\|/g, 'abs($1)');
  
  // Handle cot, sec, csc, sgn
  s = s.replace(/\bcot\b/g, '__cot__');
  s = s.replace(/\bsec\b/g, '__sec__');
  s = s.replace(/\bcsc\b/g, '__csc__');
  s = s.replace(/\bcoth\b/g, '__coth__');
  s = s.replace(/\bsech\b/g, '__sech__');
  s = s.replace(/\bcsch\b/g, '__csch__');
  s = s.replace(/\bsgn\b/g, 'sign');
  s = s.replace(/\bsinc\b/g, '__sinc__');
  s = s.replace(/\bln\b/g, 'log');
  
  // Replace back with mathjs-compatible expressions
  s = s.replace(/__cot__\(([^)]+)\)/g, '(cos($1)/sin($1))');
  s = s.replace(/__sec__\(([^)]+)\)/g, '(1/cos($1))');
  s = s.replace(/__csc__\(([^)]+)\)/g, '(1/sin($1))');
  s = s.replace(/__coth__\(([^)]+)\)/g, '(cosh($1)/sinh($1))');
  s = s.replace(/__sech__\(([^)]+)\)/g, '(1/cosh($1))');
  s = s.replace(/__csch__\(([^)]+)\)/g, '(1/sinh($1))');
  s = s.replace(/__sinc__\(([^)]+)\)/g, '(sin($1)/($1))');

  // Detect whether expression uses 'y' as an independent variable
  let hasY = false;
  try {
    const node = parse(s);
    node.traverse((n: MathNode) => {
      if (n.type === 'SymbolNode' && (n as any).name === 'y') {
        hasY = true;
      }
    });
  } catch {
    hasY = /\by\b/.test(s);
  }

  const isImplicit = hasY || hadEquals;
  return { expression: s, isImplicit };
}

// ── Parse Expression ─────────────────────────────────────────────────

export function parseExpression(expr: string): ParsedFunction {
  const trimmed = expr.trim();

  // ── Check for parametric ──
  const paramCheck = detectParametric(trimmed);
  if (paramCheck.isParametric && paramCheck.xExpr && paramCheck.yExpr) {
    try {
      const xPreprocessed = preprocessExpression(paramCheck.xExpr).expression;
      const yPreprocessed = preprocessExpression(paramCheck.yExpr).expression;
      const compiledX = compile(xPreprocessed);
      const compiledY = compile(yPreprocessed);
      // Test
      compiledX.evaluate({ t: 0, e: E, pi: PI, theta: 0 });
      compiledY.evaluate({ t: 0, e: E, pi: PI, theta: 0 });

      return {
        expression: trimmed,
        compiled: null,
        hasTime: false,
        funcType: 'parametric',
        isImplicit: false,
        parametric: {
          xExpr: xPreprocessed,
          yExpr: yPreprocessed,
          compiledX,
          compiledY,
          tFrom: 0,
          tTo: 2 * PI,
        },
        error: null,
      };
    } catch (e: any) {
      return {
        expression: trimmed,
        compiled: null,
        hasTime: false,
        funcType: 'parametric',
        isImplicit: false,
        error: `Parametric expression error: ${e.message || 'Could not evaluate'}`,
        errorDetail: `Check both x(t) and y(t) expressions for valid syntax.`,
      };
    }
  }

  // ── Check for polar ──
  const polarCheck = detectPolar(trimmed);
  if (polarCheck.isPolar && polarCheck.rExpr) {
    try {
      const rPreprocessed = preprocessExpression(polarCheck.rExpr).expression;
      const compiledR = compile(rPreprocessed);
      // Test with theta
      compiledR.evaluate({ theta: 0, t: 0, x: 0, e: E, pi: PI });

      return {
        expression: trimmed,
        compiled: null,
        hasTime: false,
        funcType: 'polar',
        isImplicit: false,
        polar: {
          rExpr: rPreprocessed,
          compiledR,
          thetaFrom: 0,
          thetaTo: 2 * PI,
        },
        error: null,
      };
    } catch (e: any) {
      return {
        expression: trimmed,
        compiled: null,
        hasTime: false,
        funcType: 'polar',
        isImplicit: false,
        error: `Polar expression error: ${e.message || 'Could not evaluate'}`,
        errorDetail: `Check the r(θ) expression for valid syntax.`,
      };
    }
  }

  // ── Standard explicit / implicit ──
  try {
    const { expression: preprocessed, isImplicit } = preprocessExpression(trimmed);
    const compiled = compile(preprocessed);
    
    // Test evaluation
    if (isImplicit) {
      compiled.evaluate({ x: 1, y: 1, t: 0, e: E, pi: PI });
    } else {
      compiled.evaluate({ x: 1, t: 0, e: E, pi: PI });
    }
    
    // More robust time detection
    let hasTimeVar = false;
    try {
      const node = parse(preprocessed);
      node.traverse((n: MathNode) => {
        if (n.type === 'SymbolNode' && (n as any).name === 't') {
          hasTimeVar = true;
        }
      });
    } catch {
      hasTimeVar = false;
    }
    
    return {
      expression: preprocessed,
      compiled,
      hasTime: hasTimeVar,
      funcType: isImplicit ? 'implicit' : 'explicit',
      isImplicit,
      error: null,
    };
  } catch (e: any) {
    // ── Try to give a helpful error ──
    const errorMsg = e.message || '';
    let friendlyError = "We couldn't evaluate this expression.";
    let detail = '';

    // Check for unknown function
    const unknownMatch = errorMsg.match(/Undefined function\s+(\w+)/i) ||
                         errorMsg.match(/Unknown.*?function\s+(\w+)/i) ||
                         errorMsg.match(/Unexpected type.*?"(\w+)"/i);
    if (unknownMatch) {
      const fnName = unknownMatch[1];
      friendlyError = `Unknown function: "${fnName}"`;
      detail = `Supported functions include: ${SUPPORTED_FUNCTIONS.slice(0, 15).join(', ')}...`;
    }

    // Check for syntax issues
    if (errorMsg.includes('Parenthesis') || errorMsg.includes('parenthesis')) {
      friendlyError = 'Mismatched parentheses in expression.';
      detail = 'Check that every opening ( has a matching closing ).';
    }

    if (errorMsg.includes('Unexpected end')) {
      friendlyError = 'Expression appears incomplete.';
      detail = 'Try something like sin(x) + x² or e^(-x²).';
    }

    return {
      expression: trimmed,
      compiled: null,
      hasTime: false,
      funcType: 'explicit',
      isImplicit: false,
      error: friendlyError,
      errorDetail: detail || `Try something like sin(x), x², or (x² + y² - 1)³ = x²y³.`,
    };
  }
}


// ── Evaluate Function ────────────────────────────────────────────────

export function evaluateFunction(
  compiled: EvalFunction,
  x: number,
  t: number = 0,
  y: number = 0
): number {
  try {
    const result = compiled.evaluate({ x, y, t, e: E, pi: PI, theta: x });
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }
    return NaN;
  } catch {
    return NaN;
  }
}

// ── Evaluate Polar Function ──────────────────────────────────────────

export function evaluatePolar(
  compiledR: EvalFunction,
  theta: number,
  t: number = 0
): number {
  try {
    const result = compiledR.evaluate({ theta, t, x: theta, e: E, pi: PI });
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }
    return NaN;
  } catch {
    return NaN;
  }
}

// ── Evaluate Parametric Function ─────────────────────────────────────

export function evaluateParametric(
  compiledX: EvalFunction,
  compiledY: EvalFunction,
  t: number,
  time: number = 0
): { x: number; y: number; valid: boolean } {
  try {
    const x = compiledX.evaluate({ t, e: E, pi: PI, theta: t, time });
    const y = compiledY.evaluate({ t, e: E, pi: PI, theta: t, time });
    const valid = typeof x === 'number' && isFinite(x) && typeof y === 'number' && isFinite(y);
    return { x: valid ? x : NaN, y: valid ? y : NaN, valid };
  } catch {
    return { x: NaN, y: NaN, valid: false };
  }
}

// ── Generate Samples ─────────────────────────────────────────────────

export function generateSamples(
  compiled: EvalFunction,
  from: number,
  to: number,
  numPoints: number = 1000,
  t: number = 0
): EvalResult[] {
  const results: EvalResult[] = [];
  const step = (to - from) / numPoints;
  
  for (let i = 0; i <= numPoints; i++) {
    const x = from + i * step;
    const y = evaluateFunction(compiled, x, t);
    results.push({ x, y, valid: !isNaN(y) && isFinite(y) });
  }
  
  return results;
}

// ── Detect Discontinuities ──────────────────────────────────────────

export function hasDiscontinuity(y1: number, y2: number, threshold: number = 100): boolean {
  if (isNaN(y1) || isNaN(y2)) return true;
  if (!isFinite(y1) || !isFinite(y2)) return true;
  return Math.abs(y2 - y1) > threshold;
}

// ── Marching Squares for Implicit Curves ───────────────────────────

export interface ImplicitSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function generateImplicitCurveSegments(
  compiled: EvalFunction,
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
  gridRes: { nx: number; ny: number } = { nx: 140, ny: 100 },
  t: number = 0
): ImplicitSegment[] {
  const { xMin, xMax, yMin, yMax } = bounds;
  const { nx, ny } = gridRes;
  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;
  const vals = new Float64Array((nx + 1) * (ny + 1));

  for (let j = 0; j <= ny; j++) {
    const y = yMin + j * dy;
    const offset = j * (nx + 1);
    for (let i = 0; i <= nx; i++) {
      const x = xMin + i * dx;
      vals[offset + i] = evaluateFunction(compiled, x, t, y);
    }
  }

  const interp = (va: number, vb: number) => {
    const diff = vb - va;
    if (Math.abs(diff) < 1e-12) return 0.5;
    return Math.max(0, Math.min(1, -va / diff));
  };

  const segments: ImplicitSegment[] = [];

  for (let j = 0; j < ny; j++) {
    const y0 = yMin + j * dy;
    const y1 = y0 + dy;
    const row0 = j * (nx + 1);
    const row1 = (j + 1) * (nx + 1);

    for (let i = 0; i < nx; i++) {
      const x0 = xMin + i * dx;
      const x1 = x0 + dx;

      const v0 = vals[row0 + i];
      const v1 = vals[row0 + i + 1];
      const v2 = vals[row1 + i + 1];
      const v3 = vals[row1 + i];

      if (isNaN(v0) || isNaN(v1) || isNaN(v2) || isNaN(v3)) continue;

      let idx = 0;
      if (v0 > 0) idx |= 1;
      if (v1 > 0) idx |= 2;
      if (v2 > 0) idx |= 4;
      if (v3 > 0) idx |= 8;

      if (idx === 0 || idx === 15) continue;

      const e0 = { x: x0 + dx * interp(v0, v1), y: y0 };
      const e1 = { x: x1, y: y0 + dy * interp(v1, v2) };
      const e2 = { x: x0 + dx * interp(v3, v2), y: y1 };
      const e3 = { x: x0, y: y0 + dy * interp(v0, v3) };

      switch (idx) {
        case 1: segments.push({ x1: e3.x, y1: e3.y, x2: e0.x, y2: e0.y }); break;
        case 2: segments.push({ x1: e0.x, y1: e0.y, x2: e1.x, y2: e1.y }); break;
        case 3: segments.push({ x1: e3.x, y1: e3.y, x2: e1.x, y2: e1.y }); break;
        case 4: segments.push({ x1: e1.x, y1: e1.y, x2: e2.x, y2: e2.y }); break;
        case 5: {
          const center = (v0 + v1 + v2 + v3) / 4;
          if (center > 0) {
            segments.push({ x1: e3.x, y1: e3.y, x2: e2.x, y2: e2.y }, { x1: e0.x, y1: e0.y, x2: e1.x, y2: e1.y });
          } else {
            segments.push({ x1: e3.x, y1: e3.y, x2: e0.x, y2: e0.y }, { x1: e1.x, y1: e1.y, x2: e2.x, y2: e2.y });
          }
          break;
        }
        case 6: segments.push({ x1: e0.x, y1: e0.y, x2: e2.x, y2: e2.y }); break;
        case 7: segments.push({ x1: e3.x, y1: e3.y, x2: e2.x, y2: e2.y }); break;
        case 8: segments.push({ x1: e3.x, y1: e3.y, x2: e2.x, y2: e2.y }); break;
        case 9: segments.push({ x1: e0.x, y1: e0.y, x2: e2.x, y2: e2.y }); break;
        case 10: {
          const center = (v0 + v1 + v2 + v3) / 4;
          if (center > 0) {
            segments.push({ x1: e3.x, y1: e3.y, x2: e0.x, y2: e0.y }, { x1: e1.x, y1: e1.y, x2: e2.x, y2: e2.y });
          } else {
            segments.push({ x1: e3.x, y1: e3.y, x2: e2.x, y2: e2.y }, { x1: e0.x, y1: e0.y, x2: e1.x, y2: e1.y });
          }
          break;
        }
        case 11: segments.push({ x1: e1.x, y1: e1.y, x2: e2.x, y2: e2.y }); break;
        case 12: segments.push({ x1: e3.x, y1: e3.y, x2: e1.x, y2: e1.y }); break;
        case 13: segments.push({ x1: e0.x, y1: e0.y, x2: e1.x, y2: e1.y }); break;
        case 14: segments.push({ x1: e3.x, y1: e3.y, x2: e0.x, y2: e0.y }); break;
      }
    }
  }

  return segments;
}

// ── Automatic Domain Detection ───────────────────────────────────────

export function detectDomain(expression: string, isImplicit: boolean = false, funcType?: FunctionType): { from: number; to: number } {
  const expr = expression.toLowerCase();

  if (funcType === 'parametric' || funcType === 'polar') {
    return { from: 0, to: 2 * PI };
  }
  
  if (isImplicit) {
    if (expr.includes('1)^3') || expr.includes('y^3') || expr.includes('x^2 y^3')) {
      return { from: -2.5, to: 2.5 };
    }
    if (/x\^2\s*\+\s*y\^2\s*=\s*(\d+)/.test(expr)) {
      const match = expr.match(/x\^2\s*\+\s*y\^2\s*=\s*(\d+)/);
      if (match) {
        const r = Math.sqrt(parseFloat(match[1]));
        const margin = Math.ceil(r * 1.3);
        return { from: -margin, to: margin };
      }
    }
    return { from: -4, to: 4 };
  }
  
  // Trigonometric → 2π periods
  if (/sin|cos|tan|cot|sec|csc/.test(expr) && !(/asin|acos|atan/.test(expr))) {
    if (/sinh|cosh|tanh|coth|sech|csch/.test(expr)) {
      return { from: -5, to: 5 };
    }
    return { from: -2 * PI, to: 2 * PI };
  }
  
  // Inverse trig
  if (/asin|acos/.test(expr)) {
    return { from: -1, to: 1 };
  }
  if (/atan/.test(expr)) {
    return { from: -10, to: 10 };
  }
  
  // Logarithmic
  if (/\blog\b|ln/.test(expr)) {
    return { from: 0.01, to: 20 };
  }
  
  // Square root
  if (/sqrt/.test(expr)) {
    return { from: 0, to: 20 };
  }
  
  // Exponential with decay
  if (/e\^.*-.*x|exp.*-/.test(expr)) {
    return { from: -2, to: 8 };
  }
  
  // Exponential
  if (/e\^|exp|2\^|10\^/.test(expr)) {
    return { from: -5, to: 5 };
  }
  
  // High-degree polynomials
  if (/x\^[4-9]|x\^1\d/.test(expr)) {
    return { from: -3, to: 3 };
  }
  
  // Cubic
  if (/x\^3|x\*x\*x/.test(expr)) {
    return { from: -5, to: 5 };
  }
  
  // Reciprocal / rational
  if (/1\/x|1\/\(/.test(expr)) {
    return { from: -10, to: 10 };
  }
  
  // Floor / ceil
  if (/floor|ceil/.test(expr)) {
    return { from: -5, to: 5 };
  }
  
  // Default
  return { from: -10, to: 10 };
}

// ── Numerical Derivative ─────────────────────────────────────────────

export function numericalDerivative(
  compiled: EvalFunction,
  x: number,
  t: number = 0,
  h: number = 0.0001
): number {
  const y1 = evaluateFunction(compiled, x - h, t);
  const y2 = evaluateFunction(compiled, x + h, t);
  if (isNaN(y1) || isNaN(y2)) return NaN;
  return (y2 - y1) / (2 * h);
}

// ── Numerical Integration (Simpson's rule) ───────────────────────────

export function numericalIntegral(
  compiled: EvalFunction,
  a: number,
  b: number,
  t: number = 0,
  n: number = 1000
): number {
  if (a === b) return 0;
  if (a > b) return -numericalIntegral(compiled, b, a, t, n);
  
  const h = (b - a) / n;
  let sum = evaluateFunction(compiled, a, t) + evaluateFunction(compiled, b, t);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const y = evaluateFunction(compiled, x, t);
    if (isNaN(y) || !isFinite(y)) return NaN;
    sum += (i % 2 === 0 ? 2 : 4) * y;
  }
  
  return (h / 3) * sum;
}

// ── Smart Numerical Display Formatter (§2, §3, §14, §15) ─────────────

/**
 * Smart numerical display formatting:
 * - Fixed 3 decimal places for numerical approximations (e.g. 3.14159265 -> 3.142)
 * - Exact integers display without trailing decimals (e.g. 4 -> "4", not "4.000")
 * - Values close to zero normalized to "0" (never -0 or -0.000)
 * - Exact zero: "0"
 * - Proper mathematical notations (+∞, −∞, undefined)
 */
export function formatSmartNumber(
  val: number | null | undefined,
  options?: {
    prefixApprox?: boolean;
    decimals?: number;
    trimTrailingZeros?: boolean;
  }
): string {
  if (val === null || val === undefined || isNaN(val)) {
    return 'undefined';
  }
  if (!isFinite(val)) {
    return val > 0 ? '∞' : '−∞';
  }
  // Normalize values very close to zero within numerical tolerance
  if (Math.abs(val) < 1e-9) {
    return '0';
  }
  // Naturally exact integer values (e.g. 4, -2, 0)
  const rounded = Math.round(val);
  if (Math.abs(val - rounded) < 1e-7) {
    return rounded.toString();
  }

  const decimals = options?.decimals ?? 3;
  let str = val.toFixed(decimals);
  // Guard against '-0.000' or '0.000'
  if (str === '-0.000' || str === '0.000' || Math.abs(parseFloat(str)) === 0) {
    return '0';
  }

  if (options?.trimTrailingZeros && str.includes('.')) {
    str = parseFloat(str).toString();
  }

  const prefix = options?.prefixApprox ? '≈ ' : '';
  return `${prefix}${str}`;
}

// ── Geometric Area Under Curve Engine (§4 - §16) ─────────────────────

export interface AreaSubregion {
  from: number;
  to: number;
  area: number;
  signedIntegral: number;
  isPositive: boolean;
}

export interface GeometricAreaResult {
  valid: boolean;
  totalArea: number;
  regions: AreaSubregion[];
  hasDiscontinuity: boolean;
  hasUndefined: boolean;
  errorMessage?: string;
  validInterval?: { from: number; to: number };
}

/**
 * Calculates geometric area A = ∫ₐᵇ |f(x)| dx by detecting x-axis crossings/roots,
 * splitting into subintervals, integrating each region separately, and summing absolute areas.
 * Positive and negative regions never cancel, and geometric area is strictly non-negative.
 * Respects domain restrictions and discontinuity detection.
 */
export function calculateGeometricArea(
  compiled: EvalFunction,
  rawA: number,
  rawB: number,
  t: number = 0
): GeometricAreaResult {
  const start = Math.min(rawA, rawB);
  const end = Math.max(rawA, rawB);

  if (Math.abs(end - start) < 1e-12) {
    return {
      valid: true,
      totalArea: 0,
      regions: [],
      hasDiscontinuity: false,
      hasUndefined: false,
      validInterval: { from: start, to: end },
    };
  }

  // 1. Sampling to detect domain bounds & discontinuities
  const NUM_SAMPLES = 600;
  const dx = (end - start) / NUM_SAMPLES;
  
  interface SamplePt {
    x: number;
    y: number;
    valid: boolean;
  }
  const samples: SamplePt[] = [];
  for (let i = 0; i <= NUM_SAMPLES; i++) {
    const x = start + i * dx;
    const y = evaluateFunction(compiled, x, t);
    const valid = !isNaN(y) && isFinite(y);
    samples.push({ x, y, valid });
  }

  // Find valid domain sub-range (respecting domain restrictions like sqrt(x) on [-5, 5])
  let firstValid = -1;
  let lastValid = -1;
  for (let i = 0; i < samples.length; i++) {
    if (samples[i].valid) {
      if (firstValid === -1) firstValid = i;
      lastValid = i;
    }
  }

  if (firstValid === -1 || lastValid === -1) {
    return {
      valid: false,
      totalArea: 0,
      regions: [],
      hasDiscontinuity: false,
      hasUndefined: true,
      errorMessage: 'Function undefined on selected interval',
    };
  }

  // If there's an invalid gap INSIDE the valid range (e.g. 1/(x-2) on [0, 4] where x=2 is undefined)
  let hasInteriorGap = false;
  for (let i = firstValid; i <= lastValid; i++) {
    if (!samples[i].valid) {
      hasInteriorGap = true;
      break;
    }
  }

  // Check for asymptotic discontinuities where |y| jumps wildly between adjacent points
  let hasAsymptote = false;
  for (let i = firstValid; i < lastValid; i++) {
    const s1 = samples[i];
    const s2 = samples[i + 1];
    if (s1.valid && s2.valid) {
      if (Math.abs(s2.y - s1.y) > 150 && (Math.abs(s1.y) > 40 || Math.abs(s2.y) > 40)) {
        hasAsymptote = true;
        break;
      }
    }
  }

  if (hasInteriorGap || hasAsymptote) {
    return {
      valid: false,
      totalArea: 0,
      regions: [],
      hasDiscontinuity: true,
      hasUndefined: hasInteriorGap,
      errorMessage: 'Discontinuity detected on interval',
      validInterval: { from: samples[firstValid].x, to: samples[lastValid].x },
    };
  }

  // Valid domain boundaries:
  const domainStart = samples[firstValid].x;
  const domainEnd = samples[lastValid].x;

  // 2. Detect roots / x-axis crossings within (domainStart, domainEnd)
  const roots: number[] = [];
  
  for (let i = firstValid; i < lastValid; i++) {
    const s1 = samples[i];
    const s2 = samples[i + 1];
    
    // Exact root at sample point
    if (Math.abs(s1.y) < 1e-9) {
      if (s1.x > domainStart + 1e-6 && s1.x < domainEnd - 1e-6) {
        roots.push(s1.x);
      }
      continue;
    }

    // Sign change between s1 and s2
    if (s1.y * s2.y < 0) {
      // Refine root using bisection
      let low = s1.x;
      let high = s2.x;
      let yLow = s1.y;
      let yHigh = s2.y;
      let isRoot = true;

      for (let iter = 0; iter < 32; iter++) {
        const mid = (low + high) / 2;
        const yMid = evaluateFunction(compiled, mid, t);
        
        if (isNaN(yMid) || !isFinite(yMid)) {
          isRoot = false;
          break;
        }

        // Check if value blows up instead of converging to 0 (asymptote detection)
        if (Math.abs(yMid) > 1000 && Math.abs(yMid) > Math.max(Math.abs(yLow), Math.abs(yHigh))) {
          isRoot = false;
          break;
        }

        if (Math.abs(yMid) < 1e-12 || (high - low) < 1e-12) {
          low = mid;
          high = mid;
          break;
        }

        if (yLow * yMid <= 0) {
          high = mid;
          yHigh = yMid;
        } else {
          low = mid;
          yLow = yMid;
        }
      }

      if (isRoot) {
        const root = (low + high) / 2;
        if (root > domainStart + 1e-6 && root < domainEnd - 1e-6) {
          roots.push(root);
        }
      } else {
        // Discontinuity encountered during bisection
        return {
          valid: false,
          totalArea: 0,
          regions: [],
          hasDiscontinuity: true,
          hasUndefined: false,
          errorMessage: 'Discontinuity detected near root search',
          validInterval: { from: domainStart, to: domainEnd },
        };
      }
    }
  }

  // 3. Deduplicate and sort roots
  roots.sort((a, b) => a - b);
  const uniqueRoots: number[] = [];
  for (const r of roots) {
    if (uniqueRoots.length === 0 || Math.abs(r - uniqueRoots[uniqueRoots.length - 1]) > 1e-5) {
      uniqueRoots.push(r);
    }
  }

  // 4. Split interval into subintervals at roots
  const splitPoints = [domainStart, ...uniqueRoots, domainEnd];
  const regions: AreaSubregion[] = [];
  let totalArea = 0;

  for (let i = 0; i < splitPoints.length - 1; i++) {
    const subA = splitPoints[i];
    const subB = splitPoints[i + 1];
    if (subB - subA < 1e-9) continue;

    const mid = (subA + subB) / 2;
    const midY = evaluateFunction(compiled, mid, t);
    
    // Numerically integrate this region using Simpson's rule
    const steps = Math.min(1000, Math.max(100, Math.round((subB - subA) * 200)));
    const signed = numericalIntegral(compiled, subA, subB, t, steps % 2 === 0 ? steps : steps + 1);
    
    if (isNaN(signed) || !isFinite(signed)) {
      return {
        valid: false,
        totalArea: 0,
        regions: [],
        hasDiscontinuity: true,
        hasUndefined: false,
        errorMessage: 'Integration failed (non-convergent)',
        validInterval: { from: domainStart, to: domainEnd },
      };
    }

    const regArea = Math.abs(signed);
    totalArea += regArea;

    regions.push({
      from: subA,
      to: subB,
      area: regArea,
      signedIntegral: signed,
      isPositive: midY >= 0,
    });
  }

  // Normalize tiny values close to zero
  if (totalArea < 1e-9) {
    totalArea = 0;
  }

  return {
    valid: true,
    totalArea,
    regions,
    hasDiscontinuity: false,
    hasUndefined: firstValid > 0 || lastValid < samples.length - 1,
    validInterval: { from: domainStart, to: domainEnd },
  };
}

// ── Function Analysis ────────────────────────────────────────────────

export function analyzeFunction(
  compiled: EvalFunction,
  expression: string,
  from: number,
  to: number,
  t: number = 0,
  isImplicit: boolean = false
): FunctionAnalysis {
  if (isImplicit) {
    // Generate sample segments within bounds to find bounding box and intercepts
    const bounds = { xMin: from, xMax: to, yMin: from, yMax: to };
    const segments = generateImplicitCurveSegments(compiled, bounds, { nx: 80, ny: 80 }, t);
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const seg of segments) {
      if (seg.x1 < minX) minX = seg.x1;
      if (seg.x2 < minX) minX = seg.x2;
      if (seg.x1 > maxX) maxX = seg.x1;
      if (seg.x2 > maxX) maxX = seg.x2;
      if (seg.y1 < minY) minY = seg.y1;
      if (seg.y2 < minY) minY = seg.y2;
      if (seg.y1 > maxY) maxY = seg.y1;
      if (seg.y2 > maxY) maxY = seg.y2;
    }

    const hasPoints = segments.length > 0;
    const domainDesc = hasPoints ? `[${formatSmartNumber(minX)}, ${formatSmartNumber(maxX)}]` : `[${formatSmartNumber(from)}, ${formatSmartNumber(to)}]`;
    const rangeDesc = hasPoints ? `[${formatSmartNumber(minY)}, ${formatSmartNumber(maxY)}]` : `[${formatSmartNumber(from)}, ${formatSmartNumber(to)}]`;

    // Symmetry check across axes
    let yAxisSym = true;
    let xAxisSym = true;
    let originSym = true;
    const testPoints = [[0.5, 0.5], [1.2, 0.8], [0.8, 1.4], [1.5, 0.3], [0.3, 0.9]];
    for (const [xp, yp] of testPoints) {
      const f0 = evaluateFunction(compiled, xp, t, yp);
      const f_nx = evaluateFunction(compiled, -xp, t, yp);
      const f_ny = evaluateFunction(compiled, xp, t, -yp);
      const f_both = evaluateFunction(compiled, -xp, t, -yp);
      if (isNaN(f0) || isNaN(f_nx) || Math.abs(f0 - f_nx) > 1e-4) yAxisSym = false;
      if (isNaN(f0) || isNaN(f_ny) || Math.abs(f0 - f_ny) > 1e-4) xAxisSym = false;
      if (isNaN(f0) || isNaN(f_both) || Math.abs(f0 - f_both) > 1e-4) originSym = false;
    }

    let symmetryType: 'even' | 'odd' | 'neither' | 'unknown' = 'neither';
    if (yAxisSym && xAxisSym) symmetryType = 'even';
    else if (yAxisSym) symmetryType = 'even';
    else if (originSym) symmetryType = 'odd';

    // X-intercepts (y = 0)
    const xIntercepts: number[] = [];
    const step = (to - from) / 400;
    let prevVal = evaluateFunction(compiled, from, t, 0);
    for (let i = 1; i <= 400; i++) {
      const x = from + i * step;
      const val = evaluateFunction(compiled, x, t, 0);
      if (!isNaN(prevVal) && !isNaN(val) && prevVal * val <= 0) {
        const x0 = x - step * (val / (val - prevVal || 1));
        xIntercepts.push(Math.round(x0 * 1000) / 1000);
      }
      prevVal = val;
    }

    // Y-intercepts (x = 0)
    let yIntercept: number | null = null;
    let prevValY = evaluateFunction(compiled, 0, t, from);
    for (let i = 1; i <= 400; i++) {
      const y = from + i * step;
      const val = evaluateFunction(compiled, 0, t, y);
      if (!isNaN(prevValY) && !isNaN(val) && prevValY * val <= 0) {
        yIntercept = Math.round(y * 1000) / 1000;
        break;
      }
      prevValY = val;
    }

    return {
      domain: { from, to, description: domainDesc, exact: false },
      range: { min: hasPoints ? minY : from, max: hasPoints ? maxY : to, description: rangeDesc, exact: false },
      symmetry: { type: symmetryType, exact: true },
      period: { value: null, description: 'Non-periodic (Implicit Curve)', exact: true },
      intercepts: { x: xIntercepts.slice(0, 10), y: yIntercept },
      continuity: hasPoints ? 'Continuous implicit relation' : 'No real curve found in range',
      undefinedRegions: 'Zero set F(x, y) = 0',
      extrema: { minima: [], maxima: [] },
      increasing: 'Multi-valued / implicit curve',
      decreasing: 'Multi-valued / implicit curve',
      asymptotes: 'Implicit algebraic relation',
    };
  }

  const samples = generateSamples(compiled, from, to, 2000, t);
  const validSamples = samples.filter(s => s.valid);
  
  // Range
  let minY = Infinity, maxY = -Infinity;
  for (const s of validSamples) {
    if (s.y < minY) minY = s.y;
    if (s.y > maxY) maxY = s.y;
  }
  
  // Known exact ranges
  const expr = expression.toLowerCase();
  let rangeExact = false;
  let rangeDesc = `[${formatSmartNumber(minY)}, ${formatSmartNumber(maxY)}]`;
  
  if (expr === 'sin(x)' || expr === 'cos(x)') {
    rangeDesc = '[-1, 1]';
    rangeExact = true;
    minY = -1; maxY = 1;
  } else if (expr === 'x^2' || expr === 'x*x') {
    rangeDesc = '[0, ∞)';
    rangeExact = true;
  } else if (expr === 'abs(x)') {
    rangeDesc = '[0, ∞)';
    rangeExact = true;
  } else if (expr === 'tanh(x)') {
    rangeDesc = '(-1, 1)';
    rangeExact = true;
  } else if (expr === '1/(1+exp(-x))') {
    rangeDesc = '(0, 1)';
    rangeExact = true;
  } else if (expr === 'exp(x)') {
    rangeDesc = '(0, ∞)';
    rangeExact = true;
  } else if (expr === 'exp(-x^2)' || expr === 'exp(-x^2/2)') {
    rangeDesc = '(0, 1]';
    rangeExact = true;
  }
  
  // Domain description
  const domainExact = true;
  let domainDesc = `[${from}, ${to}]`;
  if (expr === 'sin(x)' || expr === 'cos(x)' || expr.match(/^x\^?\d*$/)) {
    domainDesc = '(-∞, ∞)';
  } else if (/log|ln/.test(expr) && !/\+|\-|\*/.test(expr.replace('log', ''))) {
    domainDesc = '(0, ∞)';
  } else if (expr === 'sqrt(x)') {
    domainDesc = '[0, ∞)';
  } else if (expr === 'asin(x)' || expr === 'acos(x)') {
    domainDesc = '[-1, 1]';
  }
  
  // Symmetry check
  let symmetryType: 'even' | 'odd' | 'neither' | 'unknown' = 'unknown';
  let isEven = true, isOdd = true;
  const testPoints = [0.5, 1, 1.5, 2, 3, 4, 5];
  for (const xp of testPoints) {
    const yPos = evaluateFunction(compiled, xp, t);
    const yNeg = evaluateFunction(compiled, -xp, t);
    if (isNaN(yPos) || isNaN(yNeg)) {
      isEven = false;
      isOdd = false;
      break;
    }
    if (Math.abs(yPos - yNeg) > 1e-6) isEven = false;
    if (Math.abs(yPos + yNeg) > 1e-6) isOdd = false;
  }
  if (isEven) symmetryType = 'even';
  else if (isOdd) symmetryType = 'odd';
  else symmetryType = 'neither';
  
  // Period detection for known trig
  let period: number | null = null;
  let periodDesc = 'None detected';
  let periodExact = false;
  
  if (/^sin\(x\)$|^cos\(x\)$/.test(expr)) {
    period = 2 * PI;
    periodDesc = '2π';
    periodExact = true;
  } else if (/^tan\(/.test(expr)) {
    period = PI;
    periodDesc = 'π';
    periodExact = true;
  } else if (/^sin\((\d+)\*?x\)$/.test(expr)) {
    const match = expr.match(/^sin\((\d+)\*?x\)$/);
    if (match) {
      const n = parseInt(match[1]);
      period = (2 * PI) / n;
      periodDesc = `2π/${n}`;
      periodExact = true;
    }
  } else if (/^cos\((\d+)\*?x\)$/.test(expr)) {
    const match = expr.match(/^cos\((\d+)\*?x\)$/);
    if (match) {
      const n = parseInt(match[1]);
      period = (2 * PI) / n;
      periodDesc = `2π/${n}`;
      periodExact = true;
    }
  }
  
  // X-intercepts (zeros)
  const xIntercepts: number[] = [];
  for (let i = 0; i < validSamples.length - 1; i++) {
    const s1 = validSamples[i];
    const s2 = validSamples[i + 1];
    if (s1.y * s2.y < 0) {
      // Linear interpolation
      const x0 = s1.x - s1.y * (s2.x - s1.x) / (s2.y - s1.y);
      xIntercepts.push(Math.round(x0 * 1000) / 1000);
    } else if (Math.abs(s1.y) < 1e-6) {
      xIntercepts.push(Math.round(s1.x * 1000) / 1000);
    }
  }
  
  // Y-intercept
  const yIntercept = evaluateFunction(compiled, 0, t);
  
  // Extrema
  const minima: number[] = [];
  const maxima: number[] = [];
  for (let i = 1; i < validSamples.length - 1; i++) {
    const prev = validSamples[i - 1];
    const curr = validSamples[i];
    const next = validSamples[i + 1];
    if (curr.y < prev.y && curr.y < next.y) {
      minima.push(Math.round(curr.x * 1000) / 1000);
    }
    if (curr.y > prev.y && curr.y > next.y) {
      maxima.push(Math.round(curr.x * 1000) / 1000);
    }
  }
  
  // Undefined regions
  const undefinedCount = samples.length - validSamples.length;
  const undefinedRegions = undefinedCount > 0 
    ? `${undefinedCount} undefined point(s) in selected domain`
    : 'None in selected domain';
  
  // Continuity
  let discontinuities = 0;
  for (let i = 0; i < validSamples.length - 1; i++) {
    if (hasDiscontinuity(validSamples[i].y, validSamples[i + 1].y, 50)) {
      discontinuities++;
    }
  }
  const continuity = discontinuities > 0
    ? `${discontinuities} apparent discontinuity/ies detected`
    : 'Appears continuous on selected domain';
    
  // Increasing/decreasing
  let increasing: string[] = [];
  let decreasing: string[] = [];
  let incStart: number | null = null;
  let decStart: number | null = null;
  
  for (let i = 0; i < validSamples.length - 1; i++) {
    const diff = validSamples[i + 1].y - validSamples[i].y;
    if (diff > 1e-8) {
      if (incStart === null) incStart = validSamples[i].x;
      if (decStart !== null) {
        decreasing.push(`(${decStart.toFixed(2)}, ${validSamples[i].x.toFixed(2)})`);
        decStart = null;
      }
    } else if (diff < -1e-8) {
      if (decStart === null) decStart = validSamples[i].x;
      if (incStart !== null) {
        increasing.push(`(${incStart.toFixed(2)}, ${validSamples[i].x.toFixed(2)})`);
        incStart = null;
      }
    }
  }
  if (incStart !== null) increasing.push(`(${incStart.toFixed(2)}, ${validSamples[validSamples.length - 1].x.toFixed(2)})`);
  if (decStart !== null) decreasing.push(`(${decStart.toFixed(2)}, ${validSamples[validSamples.length - 1].x.toFixed(2)})`);
  
  // Asymptotes — improved detection
  let asympStr = 'None detected';
  // Check for vertical asymptotes by finding where values blow up
  const verticalAsymptotes: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const s1 = samples[i - 1];
    const s2 = samples[i];
    if (s1.valid && !s2.valid) {
      verticalAsymptotes.push(Math.round(s2.x * 100) / 100);
    } else if (!s1.valid && s2.valid) {
      verticalAsymptotes.push(Math.round(s1.x * 100) / 100);
    } else if (s1.valid && s2.valid && Math.abs(s2.y - s1.y) > 500) {
      const midX = (s1.x + s2.x) / 2;
      verticalAsymptotes.push(Math.round(midX * 100) / 100);
    }
  }
  // Deduplicate
  const uniqueAsymptotes = [...new Set(verticalAsymptotes.map(v => v.toFixed(1)))];
  
  // Check horizontal asymptotes
  const yAtRight = validSamples.length > 10 ? validSamples[validSamples.length - 1].y : NaN;
  const yAtLeft = validSamples.length > 10 ? validSamples[0].y : NaN;
  let horizontalAsymptotes: string[] = [];
  if (!isNaN(yAtRight) && Math.abs(yAtRight) < 1000) {
    const yRight2 = validSamples.length > 20 ? validSamples[validSamples.length - 10].y : NaN;
    if (!isNaN(yRight2) && Math.abs(yAtRight - yRight2) < 0.01) {
      horizontalAsymptotes.push(`y = ${yAtRight.toFixed(2)} (as x → ∞)`);
    }
  }
  if (!isNaN(yAtLeft) && Math.abs(yAtLeft) < 1000) {
    const yLeft2 = validSamples.length > 20 ? validSamples[9].y : NaN;
    if (!isNaN(yLeft2) && Math.abs(yAtLeft - yLeft2) < 0.01) {
      horizontalAsymptotes.push(`y = ${yAtLeft.toFixed(2)} (as x → -∞)`);
    }
  }

  const allAsymp: string[] = [];
  if (uniqueAsymptotes.length > 0 && uniqueAsymptotes.length <= 5) {
    allAsymp.push(`Vertical: x = ${uniqueAsymptotes.join(', ')}`);
  }
  if (horizontalAsymptotes.length > 0) {
    allAsymp.push(...horizontalAsymptotes);
  }
  if (allAsymp.length > 0) {
    asympStr = allAsymp.join('; ');
  }

  return {
    domain: { from, to, description: domainDesc, exact: domainExact },
    range: { min: minY, max: maxY, description: rangeDesc, exact: rangeExact },
    symmetry: { type: symmetryType, exact: true },
    period: { value: period, description: periodDesc, exact: periodExact },
    intercepts: { x: xIntercepts.slice(0, 20), y: isNaN(yIntercept) ? null : Math.round(yIntercept * 1000) / 1000 },
    continuity,
    undefinedRegions,
    extrema: { minima: minima.slice(0, 10), maxima: maxima.slice(0, 10) },
    increasing: increasing.slice(0, 5).join(', ') || 'None detected',
    decreasing: decreasing.slice(0, 5).join(', ') || 'None detected',
    asymptotes: asympStr,
  };
}

// ── Parse Domain Expression ──────────────────────────────────────────

export function parseDomainValue(value: string): number | null {
  try {
    const s = value.trim()
      .replace(/π/g, `${PI}`)
      .replace(/pi/gi, `${PI}`)
      .replace(/e(?![0-9])/g, `${E}`)
      .replace(/(\d)([a-zA-Z(])/g, '$1*$2');
    const result = compile(s).evaluate({});
    if (typeof result === 'number' && isFinite(result)) return result;
    return null;
  } catch {
    return null;
  }
}

// ── Numerical Limit Calculation ──────────────────────────────────────

export interface LimitResult {
  targetX: number;
  leftLimit: number | null;
  rightLimit: number | null;
  limit: number | null;
  exists: boolean;
  isInfinite: boolean;
  description: string;
}

export function calculateLimit(
  compiled: EvalFunction,
  targetX: number,
  t: number = 0
): LimitResult {
  const steps = [1e-2, 1e-3, 1e-4, 1e-5, 1e-6];
  
  // Left approach: x -> targetX - h
  let leftVal: number | null = null;
  const leftVals: number[] = [];
  for (const h of steps) {
    const v = evaluateFunction(compiled, targetX - h, t);
    if (!isNaN(v) && isFinite(v)) {
      leftVals.push(v);
    }
  }
  if (leftVals.length > 0) {
    leftVal = leftVals[leftVals.length - 1];
  }

  // Right approach: x -> targetX + h
  let rightVal: number | null = null;
  const rightVals: number[] = [];
  for (const h of steps) {
    const v = evaluateFunction(compiled, targetX + h, t);
    if (!isNaN(v) && isFinite(v)) {
      rightVals.push(v);
    }
  }
  if (rightVals.length > 0) {
    rightVal = rightVals[rightVals.length - 1];
  }

  const leftInf = leftVals.length >= 2 && Math.abs(leftVals[leftVals.length - 1]) > 1e4;
  const rightInf = rightVals.length >= 2 && Math.abs(rightVals[rightVals.length - 1]) > 1e4;

  if (leftInf || rightInf) {
    return {
      targetX,
      leftLimit: leftInf ? (leftVals[leftVals.length - 1] > 0 ? Infinity : -Infinity) : leftVal,
      rightLimit: rightInf ? (rightVals[rightVals.length - 1] > 0 ? Infinity : -Infinity) : rightVal,
      limit: null,
      exists: false,
      isInfinite: true,
      description: 'Limit diverges to infinity or has vertical asymptote.',
    };
  }

  if (leftVal === null && rightVal === null) {
    return {
      targetX,
      leftLimit: null,
      rightLimit: null,
      limit: null,
      exists: false,
      isInfinite: false,
      description: `Function undefined in neighborhood of x = ${targetX}`,
    };
  }

  const cleanVal = (val: number | null) => {
    if (val === null) return null;
    if (Math.abs(val - Math.round(val)) < 1e-4) return Math.round(val);
    return Math.round(val * 10000) / 10000;
  };

  const cLeft = cleanVal(leftVal);
  const cRight = cleanVal(rightVal);

  if (cLeft !== null && cRight !== null) {
    const diff = Math.abs(cLeft - cRight);
    if (diff < 1e-3) {
      const lim = cleanVal((cLeft + cRight) / 2);
      return {
        targetX,
        leftLimit: cLeft,
        rightLimit: cRight,
        limit: lim,
        exists: true,
        isInfinite: false,
        description: `Limit exists: lim(x→${targetX}) f(x) = ${lim}`,
      };
    } else {
      return {
        targetX,
        leftLimit: cLeft,
        rightLimit: cRight,
        limit: null,
        exists: false,
        isInfinite: false,
        description: `LHL (${cLeft}) ≠ RHL (${cRight}). Two-sided limit does not exist.`,
      };
    }
  }

  return {
    targetX,
    leftLimit: cLeft,
    rightLimit: cRight,
    limit: cLeft ?? cRight,
    exists: false,
    isInfinite: false,
    description: cLeft !== null ? `One-sided limit from left = ${cLeft}` : `One-sided limit from right = ${cRight}`,
  };
}
