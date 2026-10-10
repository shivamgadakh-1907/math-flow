/* ====================================================================
   MathFlow — Types
   ==================================================================== */

import type { EvalFunction } from 'mathjs';

export type FunctionType = 'explicit' | 'implicit' | 'parametric' | 'polar';
export type EducationLevel = 'beginner' | 'student' | 'advanced';

export interface ParametricDef {
  xExpr: string;
  yExpr: string;
  compiledX: EvalFunction | null;
  compiledY: EvalFunction | null;
  tFrom: number;
  tTo: number;
}

export interface PolarDef {
  rExpr: string;
  compiledR: EvalFunction | null;
  thetaFrom: number;
  thetaTo: number;
}

export interface GraphFunction {
  id: string;
  expression: string;
  displayExpr: string;
  name: string;
  color: string;
  compiled: EvalFunction | null;
  error: string | null;
  hasTime: boolean;
  funcType: FunctionType;
  isImplicit?: boolean; // kept for backwards compat
  parametric?: ParametricDef;
  polar?: PolarDef;
  visible: boolean;
  animationProgress: number; // 0 to 1
  animationSpeed: number;
  isAnimating: boolean;
  domain: { from: number; to: number };
  autoDomain: { from: number; to: number };
  showDerivative: boolean;
  showIntegral: boolean;
  integralBounds: { a: number; b: number };
}

export interface ViewState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface HoverPoint {
  x: number;
  y: number;
  slope?: number;
  funcId: string;
  funcName: string;
  color: string;
}

export interface ClickPoint {
  id: string;
  x: number;
  y: number;
  funcId?: string;
  funcName?: string;
  color?: string;
  animProgress: number; // 0→1 for coordinate guide animation
  startTime: number;
}

export type AnimationMode = 'draw' | 'trace' | 'time' | 'morph';

export type NavPage = 'dashboard' | 'visualizer' | 'library' | 'saved' | 'about';

export interface MorphState {
  enabled: boolean;
  functionA: string;
  functionB: string;
  progress: number; // 0 to 1
}

export interface LimitState {
  enabled: boolean;
  targetX: number;
  leftLimit: number | null;
  rightLimit: number | null;
  limit: number | null;
  exists: boolean | null;
  delta: number;
}

export interface SavedFunction {
  id: string;
  name: string;
  expression: string;
  savedAt: number;
}

export const GRAPH_COLORS = [
  '#6366f1', // indigo
  '#38bdf8', // sky
  '#34d399', // emerald
  '#fbbf24', // amber
  '#f472b6', // pink
  '#a78bfa', // violet
  '#22d3ee', // cyan
  '#fb923c', // orange
  '#818cf8', // light indigo
  '#2dd4bf', // teal
];
