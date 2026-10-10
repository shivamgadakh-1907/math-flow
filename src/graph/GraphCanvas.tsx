/* ====================================================================
   MathFlow — Canvas Graph Renderer
   High-performance canvas-based graphing with animation, tracing,
   discontinuity handling, parametric & polar curves, derivative/integral,
   limit visualization, mobile touch gestures, and interactive coordinate guides.
   ==================================================================== */

import { useRef, useEffect, useCallback, useState } from 'react';
import type { GraphFunction, ViewState, HoverPoint, ClickPoint, AnimationMode, MorphState, LimitState } from '../types';
import {
  evaluateFunction,
  evaluatePolar,
  evaluateParametric,
  hasDiscontinuity,
  numericalDerivative,
  calculateGeometricArea,
  formatSmartNumber,
  generateImplicitCurveSegments,
  type ImplicitSegment,
  parseExpression
} from '../math/engine';

interface GraphCanvasProps {
  functions: GraphFunction[];
  view: ViewState;
  setView: (v: ViewState | ((prev: ViewState) => ViewState)) => void;
  animationMode: AnimationMode;
  globalTime: number;
  morphState: MorphState;
  limitState?: LimitState;
  onHover: (point: HoverPoint | null) => void;
  clickPoint?: ClickPoint | null;
  onClickPoint?: (point: ClickPoint | null) => void;
  clickPoints?: ClickPoint[];
  onClickPoints?: (points: ClickPoint[] | ((prev: ClickPoint[]) => ClickPoint[])) => void;
  onClearPoints?: () => void;
  isFullscreen: boolean;
}

export default function GraphCanvas({
  functions,
  view,
  setView,
  animationMode,
  globalTime,
  morphState,
  limitState,
  onHover,
  clickPoint: externalClickPoint,
  onClickPoint,
  clickPoints: externalClickPoints,
  onClickPoints: externalOnClickPoints,
  onClearPoints,
  isFullscreen
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const implicitSegmentsRef = useRef<Map<string, ImplicitSegment[]>>(new Map());

  // Interactive Multi-Point Click State
  const [localClickPoints, setLocalClickPoints] = useState<ClickPoint[]>([]);
  const activeClickPoints = externalClickPoints !== undefined ? externalClickPoints : localClickPoints;
  const updateClickPoints = useCallback((updater: ClickPoint[] | ((prev: ClickPoint[]) => ClickPoint[])) => {
    if (externalOnClickPoints) {
      externalOnClickPoints(updater);
    } else {
      setLocalClickPoints(updater);
    }
  }, [externalOnClickPoints]);

  // Touch gesture refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(50);
  const touchMovedRef = useRef<boolean>(false);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ w: Math.floor(width), h: Math.floor(height) });
      }
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Coordinate transforms
  const worldToScreen = useCallback((wx: number, wy: number) => {
    const cx = size.w / 2;
    const cy = size.h / 2;
    return {
      x: cx + (wx * view.scale) + view.offsetX,
      y: cy - (wy * view.scale) + view.offsetY,
    };
  }, [size, view]);

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const cx = size.w / 2;
    const cy = size.h / 2;
    return {
      x: (sx - cx - view.offsetX) / view.scale,
      y: (cy - sy + view.offsetY) / view.scale,
    };
  }, [size, view]);

  // Click Guide Lines Animation loop for newly added points (350ms ease-out)
  const [animTick, setAnimTick] = useState(0);
  useEffect(() => {
    const hasAnimating = activeClickPoints.some(p => (performance.now() - p.startTime) < 350);
    if (!hasAnimating) return;
    let rafId: number;
    const step = () => {
      const stillActive = activeClickPoints.some(p => (performance.now() - p.startTime) < 350);
      setAnimTick(t => (t + 1) % 100000);
      if (stillActive) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [activeClickPoints]);

  // Find nearest point across all visible curves
  const findNearestCurvePoint = useCallback((sx: number, sy: number) => {
    const world = screenToWorld(sx, sy);
    let best: { x: number; y: number; funcId: string; funcName: string; color: string; dist: number } | null = null;
    let minDist = 32; // pixel snap threshold

    for (const fn of functions) {
      if (!fn.visible) continue;

      // Parametric curves
      if (fn.funcType === 'parametric' && fn.parametric?.compiledX && fn.parametric?.compiledY) {
        const { tFrom, tTo } = fn.parametric;
        const samples = 160;
        const step = (tTo - tFrom) / samples;
        for (let i = 0; i <= samples; i++) {
          const t = tFrom + i * step;
          const pt = evaluateParametric(fn.parametric.compiledX, fn.parametric.compiledY, t, globalTime);
          if (!pt.valid) continue;
          const sp = worldToScreen(pt.x, pt.y);
          const d = Math.hypot(sp.x - sx, sp.y - sy);
          if (d < minDist) {
            minDist = d;
            best = { x: pt.x, y: pt.y, funcId: fn.id, funcName: fn.name, color: fn.color, dist: d };
          }
        }
      }
      // Polar curves
      else if (fn.funcType === 'polar' && fn.polar?.compiledR) {
        const { thetaFrom, thetaTo } = fn.polar;
        const samples = 160;
        const step = (thetaTo - thetaFrom) / samples;
        for (let i = 0; i <= samples; i++) {
          const theta = thetaFrom + i * step;
          const r = evaluatePolar(fn.polar.compiledR, theta, globalTime);
          if (isNaN(r) || !isFinite(r)) continue;
          const wx = r * Math.cos(theta);
          const wy = r * Math.sin(theta);
          const sp = worldToScreen(wx, wy);
          const d = Math.hypot(sp.x - sx, sp.y - sy);
          if (d < minDist) {
            minDist = d;
            best = { x: wx, y: wy, funcId: fn.id, funcName: fn.name, color: fn.color, dist: d };
          }
        }
      }
      // Implicit curves
      else if ((fn.isImplicit || fn.funcType === 'implicit') && fn.compiled) {
        const segs = implicitSegmentsRef.current.get(fn.id);
        if (segs) {
          for (const seg of segs) {
            const sp1 = worldToScreen(seg.x1, seg.y1);
            const sp2 = worldToScreen(seg.x2, seg.y2);
            const { distSq, cx, cy } = distToSegment(sx, sy, sp1.x, sp1.y, sp2.x, sp2.y);
            const d = Math.sqrt(distSq);
            if (d < minDist) {
              minDist = d;
              const wPt = screenToWorld(cx, cy);
              best = { x: wPt.x, y: wPt.y, funcId: fn.id, funcName: fn.name, color: fn.color, dist: d };
            }
          }
        }
      }
      // Explicit 2D functions
      else if (fn.compiled) {
        // Sample around world.x to find exact closest screen point (handles steep curves)
        const xRange = Math.max(0.1, 24 / view.scale);
        const subSteps = 16;
        for (let s = -subSteps; s <= subSteps; s++) {
          const testX = world.x + (s / subSteps) * xRange;
          const testY = evaluateFunction(fn.compiled, testX, globalTime);
          if (isNaN(testY) || !isFinite(testY)) continue;
          const sp = worldToScreen(testX, testY);
          const d = Math.hypot(sp.x - sx, sp.y - sy);
          if (d < minDist) {
            minDist = d;
            best = { x: testX, y: testY, funcId: fn.id, funcName: fn.name, color: fn.color, dist: d };
          }
        }
      }
    }

    return best;
  }, [functions, globalTime, screenToWorld, worldToScreen, view.scale]);

  // Click trigger (used by both mouse click and mobile tap)
  const triggerClickAtScreen = useCallback((sx: number, sy: number) => {
    const HIT_TOLERANCE_PX = 16;
    let closestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < activeClickPoints.length; i++) {
      const p = activeClickPoints[i];
      const sp = worldToScreen(p.x, p.y);
      const d = Math.hypot(sp.x - sx, sp.y - sy);
      if (d < minDistance) {
        minDistance = d;
        closestIndex = i;
      }
    }

    // Toggle off: remove point if clicked within hit tolerance
    if (closestIndex !== -1 && minDistance <= HIT_TOLERANCE_PX) {
      const targetId = activeClickPoints[closestIndex].id;
      updateClickPoints(prev => {
        const next = prev.filter(p => p.id !== targetId);
        if (onClickPoint) onClickPoint(next.length > 0 ? next[next.length - 1] : null);
        return next;
      });
      return;
    }

    // Add new point: check if clicked near a curve first
    const nearest = findNearestCurvePoint(sx, sy);
    const newId = `pt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    let newPt: ClickPoint;

    if (nearest && nearest.dist < 20) {
      newPt = {
        id: newId,
        x: nearest.x,
        y: nearest.y,
        funcId: nearest.funcId,
        funcName: nearest.funcName,
        color: nearest.color,
        animProgress: 0,
        startTime: performance.now(),
      };
    } else {
      const world = screenToWorld(sx, sy);
      if (!isFinite(world.x) || !isFinite(world.y)) return;
      newPt = {
        id: newId,
        x: world.x,
        y: world.y,
        animProgress: 0,
        startTime: performance.now(),
      };
    }

    updateClickPoints(prev => {
      const next = [...prev, newPt];
      if (onClickPoint) onClickPoint(newPt);
      return next;
    });
  }, [activeClickPoints, findNearestCurvePoint, onClickPoint, screenToWorld, updateClickPoints, worldToScreen]);

  // Main Draw Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Dark sleek background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, size.w, size.h);

    // Grid
    drawGrid(ctx, size, view, worldToScreen);

    // Axes
    drawAxes(ctx, size, view, worldToScreen);

    // Functions
    for (const fn of functions) {
      if (!fn.visible) continue;

      if (fn.funcType === 'parametric') {
        drawParametricFunction(ctx, fn, size, view, worldToScreen, animationMode, globalTime);
      } else if (fn.funcType === 'polar') {
        drawPolarFunction(ctx, fn, size, view, worldToScreen, animationMode, globalTime);
      } else if (fn.isImplicit || fn.funcType === 'implicit') {
        if (!fn.compiled) continue;
        drawImplicitFunction(ctx, fn, size, view, worldToScreen, screenToWorld, animationMode, globalTime, (id, segs) => {
          implicitSegmentsRef.current.set(id, segs);
        });
      } else if (animationMode === 'morph' && morphState.enabled) {
        if (!fn.compiled) continue;
        drawMorphedFunction(ctx, fn, morphState, size, view, worldToScreen, globalTime);
      } else {
        if (!fn.compiled) continue;
        drawFunction(ctx, fn, size, view, worldToScreen, animationMode, globalTime);
      }

      // Derivative (only explicit)
      if (fn.showDerivative && !fn.isImplicit && fn.compiled) {
        drawDerivative(ctx, fn, size, view, worldToScreen, globalTime);
      }

      // Integral (only explicit)
      if (fn.showIntegral && !fn.isImplicit && fn.compiled) {
        drawIntegral(ctx, fn, size, view, worldToScreen, globalTime);
      }
    }

    // Limit visualization
    if (limitState?.enabled && functions.length > 0) {
      drawLimitVisualization(ctx, functions, limitState, size, view, worldToScreen, globalTime);
    }

    // Selected curve & coordinate guide lines (Multi-point support)
    for (const cp of activeClickPoints) {
      drawClickGuideLines(ctx, cp, size, view, worldToScreen);
    }

  }, [
    functions, view, size, animationMode, globalTime, morphState,
    limitState, activeClickPoints, animTick, worldToScreen, screenToWorld
  ]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    hasDragged.current = false;
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current && mouseDownPos.current) {
      const dist = Math.hypot(e.clientX - mouseDownPos.current.x, e.clientY - mouseDownPos.current.y);
      if (dist >= 4) {
        hasDragged.current = true;
      }
      if (hasDragged.current) {
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        setView(prev => ({
          ...prev,
          offsetX: prev.offsetX + dx,
          offsetY: prev.offsetY + dy,
        }));
        return;
      }
    }

    // Hover detection
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const nearest = findNearestCurvePoint(sx, sy);

    if (nearest && nearest.dist < 20) {
      let slope: number | undefined;
      const fn = functions.find(f => f.id === nearest.funcId);
      if (fn && fn.compiled && !fn.isImplicit && fn.funcType === 'explicit') {
        const s = numericalDerivative(fn.compiled, nearest.x, globalTime);
        if (!isNaN(s)) slope = s;
      }
      onHover({
        x: nearest.x,
        y: nearest.y,
        slope,
        funcId: nearest.funcId,
        funcName: nearest.funcName,
        color: nearest.color,
      });
    } else {
      onHover(null);
    }
  }, [findNearestCurvePoint, functions, globalTime, setView, onHover]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    isDragging.current = false;
    if (mouseDownPos.current && !hasDragged.current) {
      const dist = Math.hypot(e.clientX - mouseDownPos.current.x, e.clientY - mouseDownPos.current.y);
      if (dist < 5) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const sx = e.clientX - rect.left;
          const sy = e.clientY - rect.top;
          triggerClickAtScreen(sx, sy);
        }
      }
    }
    mouseDownPos.current = null;
    hasDragged.current = false;
  }, [triggerClickAtScreen]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setView(prev => ({
      ...prev,
      scale: Math.max(5, Math.min(500, prev.scale * factor)),
    }));
  }, [setView]);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    onHover(null);
  }, [onHover]);

  // Touch handlers (Mobile support §40)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: performance.now(),
      };
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchMovedRef.current = false;
      isDragging.current = true;
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialScaleRef.current = view.scale;
      touchMovedRef.current = true;
    }
  }, [view.scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - lastMouse.current.x;
      const dy = e.touches[0].clientY - lastMouse.current.y;
      if (Math.hypot(dx, dy) > 4) {
        touchMovedRef.current = true;
      }
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setView(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy,
      }));
    } else if (e.touches.length === 2 && initialPinchDistRef.current) {
      touchMovedRef.current = true;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / initialPinchDistRef.current;
      setView(prev => ({
        ...prev,
        scale: Math.max(5, Math.min(500, initialScaleRef.current * ratio)),
      }));
    }
  }, [setView]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    isDragging.current = false;
    initialPinchDistRef.current = null;

    if (!touchMovedRef.current && touchStartRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const sx = touchStartRef.current.x - rect.left;
        const sy = touchStartRef.current.y - rect.top;
        triggerClickAtScreen(sx, sy);
      }
    }
    touchStartRef.current = null;
  }, [triggerClickAtScreen]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative touch-none select-none"
      style={{ cursor: isDragging.current ? 'grabbing' : 'crosshair' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full block"
      />
    </div>
  );
}

// ── Grid Drawing ─────────────────────────────────────────────────────

function drawGrid(
  ctx: CanvasRenderingContext2D,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number }
) {
  const pixelsPerUnit = view.scale;
  let gridSpacing = 1;

  if (pixelsPerUnit < 15) gridSpacing = 5;
  else if (pixelsPerUnit < 30) gridSpacing = 2;
  else if (pixelsPerUnit > 150) gridSpacing = 0.5;
  else if (pixelsPerUnit > 300) gridSpacing = 0.25;

  const topLeft = {
    x: (-view.offsetX - size.w / 2) / view.scale,
    y: (view.offsetY + size.h / 2) / view.scale
  };
  const bottomRight = {
    x: (size.w / 2 - view.offsetX) / view.scale,
    y: (view.offsetY - size.h / 2) / view.scale
  };

  // Minor grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 0.5;

  const minorSpacing = gridSpacing / 5;
  for (let x = Math.floor(topLeft.x / minorSpacing) * minorSpacing; x <= bottomRight.x; x += minorSpacing) {
    const sp = worldToScreen(x, 0);
    ctx.beginPath();
    ctx.moveTo(sp.x, 0);
    ctx.lineTo(sp.x, size.h);
    ctx.stroke();
  }
  for (let y = Math.floor(bottomRight.y / minorSpacing) * minorSpacing; y <= topLeft.y; y += minorSpacing) {
    const sp = worldToScreen(0, y);
    ctx.beginPath();
    ctx.moveTo(0, sp.y);
    ctx.lineTo(size.w, sp.y);
    ctx.stroke();
  }

  // Major grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 0.5;

  for (let x = Math.floor(topLeft.x / gridSpacing) * gridSpacing; x <= bottomRight.x; x += gridSpacing) {
    const sp = worldToScreen(x, 0);
    ctx.beginPath();
    ctx.moveTo(sp.x, 0);
    ctx.lineTo(sp.x, size.h);
    ctx.stroke();
  }
  for (let y = Math.floor(bottomRight.y / gridSpacing) * gridSpacing; y <= topLeft.y; y += gridSpacing) {
    const sp = worldToScreen(0, y);
    ctx.beginPath();
    ctx.moveTo(0, sp.y);
    ctx.lineTo(size.w, sp.y);
    ctx.stroke();
  }
}

// ── Axes Drawing ─────────────────────────────────────────────────────

function drawAxes(
  ctx: CanvasRenderingContext2D,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number }
) {
  const origin = worldToScreen(0, 0);

  // X-axis
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(size.w, origin.y);
  ctx.stroke();

  // Y-axis
  ctx.beginPath();
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, size.h);
  ctx.stroke();

  // Labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const pixelsPerUnit = view.scale;
  let labelSpacing = 1;
  if (pixelsPerUnit < 15) labelSpacing = 5;
  else if (pixelsPerUnit < 30) labelSpacing = 2;
  else if (pixelsPerUnit > 150) labelSpacing = 0.5;

  const topLeft = { x: (-view.offsetX - size.w / 2) / view.scale };
  const bottomRight = { x: (size.w / 2 - view.offsetX) / view.scale };

  for (let x = Math.floor(topLeft.x / labelSpacing) * labelSpacing; x <= bottomRight.x; x += labelSpacing) {
    if (Math.abs(x) < 0.001) continue;
    const sp = worldToScreen(x, 0);
    const label = Math.abs(x - Math.round(x)) < 0.001 ? Math.round(x).toString() : x.toFixed(1);
    ctx.fillText(label, sp.x, origin.y + 4);
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const topLeftY = (view.offsetY + size.h / 2) / view.scale;
  const bottomRightY = (view.offsetY - size.h / 2) / view.scale;

  for (let y = Math.floor(bottomRightY / labelSpacing) * labelSpacing; y <= topLeftY; y += labelSpacing) {
    if (Math.abs(y) < 0.001) continue;
    const sp = worldToScreen(0, y);
    const label = Math.abs(y - Math.round(y)) < 0.001 ? Math.round(y).toString() : y.toFixed(1);
    ctx.fillText(label, origin.x - 6, sp.y);
  }

  // Origin label
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('0', origin.x - 4, origin.y + 4);
}

// ── Explicit Function Drawing ────────────────────────────────────────

function drawFunction(
  ctx: CanvasRenderingContext2D,
  fn: GraphFunction,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number },
  animationMode: AnimationMode,
  globalTime: number
) {
  if (!fn.compiled) return;

  const { from, to } = fn.domain;
  const numPoints = Math.min(2000, Math.max(500, Math.floor(size.w * 2)));
  const step = (to - from) / numPoints;
  const progress = fn.animationProgress;
  const drawEnd = from + (to - from) * progress;

  ctx.strokeStyle = fn.color;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  let drawing = false;
  let prevY = NaN;

  for (let i = 0; i <= numPoints; i++) {
    const x = from + i * step;

    if (animationMode === 'draw' && x > drawEnd && progress < 1) break;

    const y = fn.hasTime
      ? evaluateFunction(fn.compiled, x, globalTime)
      : evaluateFunction(fn.compiled, x);

    const screen = worldToScreen(x, y);

    if (isNaN(y) || !isFinite(y) || hasDiscontinuity(prevY, y, (to - from) * 0.4)) {
      if (drawing) {
        ctx.stroke();
        drawing = false;
      }
    } else {
      if (!drawing) {
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        drawing = true;
      } else {
        ctx.lineTo(screen.x, screen.y);
      }
    }
    prevY = y;
  }
  if (drawing) ctx.stroke();

  // Tracer point (during animation)
  if (progress < 1 && progress > 0 && fn.isAnimating) {
    const tracerX = drawEnd;
    const tracerY = fn.hasTime
      ? evaluateFunction(fn.compiled, tracerX, globalTime)
      : evaluateFunction(fn.compiled, tracerX);

    if (!isNaN(tracerY) && isFinite(tracerY)) {
      const sp = worldToScreen(tracerX, tracerY);
      ctx.fillStyle = fn.color;
      ctx.shadowColor = fn.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

// ── Parametric Function Drawing ──────────────────────────────────────

function drawParametricFunction(
  ctx: CanvasRenderingContext2D,
  fn: GraphFunction,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number },
  animationMode: AnimationMode,
  globalTime: number
) {
  if (!fn.parametric?.compiledX || !fn.parametric?.compiledY) return;
  const { tFrom, tTo } = fn.parametric;
  const numPoints = Math.min(2500, Math.max(800, Math.floor(size.w * 2.5)));
  const step = (tTo - tFrom) / numPoints;
  const progress = fn.animationProgress;
  const maxT = animationMode === 'draw' && progress < 1 ? tFrom + (tTo - tFrom) * progress : tTo;

  ctx.strokeStyle = fn.color;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  let drawing = false;
  let prevPt: { x: number; y: number } | null = null;

  for (let i = 0; i <= numPoints; i++) {
    const t = tFrom + i * step;
    if (t > maxT && progress < 1) break;

    const pt = evaluateParametric(fn.parametric.compiledX, fn.parametric.compiledY, t, globalTime);
    if (!pt.valid || isNaN(pt.x) || isNaN(pt.y)) {
      if (drawing) {
        ctx.stroke();
        drawing = false;
      }
      prevPt = null;
      continue;
    }

    const screen = worldToScreen(pt.x, pt.y);

    if (prevPt) {
      const dist = Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
      if (dist > (view.scale > 0 ? 500 / view.scale : 10)) {
        if (drawing) {
          ctx.stroke();
          drawing = false;
        }
      }
    }

    if (!drawing) {
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y);
      drawing = true;
    } else {
      ctx.lineTo(screen.x, screen.y);
    }
    prevPt = pt;
  }
  if (drawing) ctx.stroke();

  // Tracer point
  if ((animationMode === 'trace' || (animationMode === 'draw' && progress < 1)) && fn.isAnimating) {
    const currentT = tFrom + (tTo - tFrom) * progress;
    const pt = evaluateParametric(fn.parametric.compiledX, fn.parametric.compiledY, currentT, globalTime);
    if (pt.valid) {
      const sp = worldToScreen(pt.x, pt.y);
      ctx.fillStyle = fn.color;
      ctx.shadowColor = fn.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

// ── Polar Function Drawing ───────────────────────────────────────────

function drawPolarFunction(
  ctx: CanvasRenderingContext2D,
  fn: GraphFunction,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number },
  animationMode: AnimationMode,
  globalTime: number
) {
  if (!fn.polar?.compiledR) return;
  const { thetaFrom, thetaTo } = fn.polar;
  const numPoints = Math.min(2500, Math.max(800, Math.floor(size.w * 2.5)));
  const step = (thetaTo - thetaFrom) / numPoints;
  const progress = fn.animationProgress;
  const maxTheta = animationMode === 'draw' && progress < 1 ? thetaFrom + (thetaTo - thetaFrom) * progress : thetaTo;

  ctx.strokeStyle = fn.color;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  let drawing = false;
  let prevPt: { x: number; y: number } | null = null;

  for (let i = 0; i <= numPoints; i++) {
    const theta = thetaFrom + i * step;
    if (theta > maxTheta && progress < 1) break;

    const r = evaluatePolar(fn.polar.compiledR, theta, globalTime);
    if (isNaN(r) || !isFinite(r)) {
      if (drawing) {
        ctx.stroke();
        drawing = false;
      }
      prevPt = null;
      continue;
    }

    const wx = r * Math.cos(theta);
    const wy = r * Math.sin(theta);
    const screen = worldToScreen(wx, wy);

    if (prevPt) {
      const dist = Math.hypot(wx - prevPt.x, wy - prevPt.y);
      if (dist > (view.scale > 0 ? 500 / view.scale : 10)) {
        if (drawing) {
          ctx.stroke();
          drawing = false;
        }
      }
    }

    if (!drawing) {
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y);
      drawing = true;
    } else {
      ctx.lineTo(screen.x, screen.y);
    }
    prevPt = { x: wx, y: wy };
  }
  if (drawing) ctx.stroke();

  // Tracer point
  if ((animationMode === 'trace' || (animationMode === 'draw' && progress < 1)) && fn.isAnimating) {
    const currentTheta = thetaFrom + (thetaTo - thetaFrom) * progress;
    const r = evaluatePolar(fn.polar.compiledR, currentTheta, globalTime);
    if (!isNaN(r) && isFinite(r)) {
      const sp = worldToScreen(r * Math.cos(currentTheta), r * Math.sin(currentTheta));
      ctx.fillStyle = fn.color;
      ctx.shadowColor = fn.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

// ── Segment Distance Utility ─────────────────────────────────────────

function distToSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): { distSq: number; cx: number; cy: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ddx = px - x1, ddy = py - y1;
    return { distSq: ddx * ddx + ddy * ddy, cx: x1, cy: y1 };
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  const ddx = px - cx, ddy = py - cy;
  return { distSq: ddx * ddx + ddy * ddy, cx, cy };
}

// ── Implicit Function Drawing (Marching Squares) ────────────────────

function drawImplicitFunction(
  ctx: CanvasRenderingContext2D,
  fn: GraphFunction,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number },
  screenToWorld: (x: number, y: number) => { x: number; y: number },
  animationMode: AnimationMode,
  globalTime: number,
  saveSegments?: (id: string, segs: ImplicitSegment[]) => void
) {
  if (!fn.compiled) return;

  const p0 = screenToWorld(-20, size.h + 20);
  const p1 = screenToWorld(size.w + 20, -20);
  const xMin = Math.min(p0.x, p1.x);
  const xMax = Math.max(p0.x, p1.x);
  const yMin = Math.min(p0.y, p1.y);
  const yMax = Math.max(p0.y, p1.y);

  const nx = Math.min(180, Math.max(70, Math.floor(size.w / 5)));
  const ny = Math.min(140, Math.max(50, Math.floor(size.h / 5)));

  const tVal = fn.hasTime ? globalTime : 0;
  const segments = generateImplicitCurveSegments(fn.compiled, { xMin, xMax, yMin, yMax }, { nx, ny }, tVal);

  if (saveSegments) {
    saveSegments(fn.id, segments);
  }

  const progress = fn.animationProgress;
  const isAnimating = fn.isAnimating && progress < 1;
  const thresholdX = xMin + (xMax - xMin) * progress;

  ctx.save();
  ctx.strokeStyle = fn.color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = fn.color + '40';
  ctx.shadowBlur = 6;

  ctx.beginPath();
  let tracerPoint: { x: number; y: number } | null = null;
  let maxDrawnX = -Infinity;

  for (const seg of segments) {
    if (animationMode === 'draw' && isAnimating) {
      if (seg.x1 > thresholdX && seg.x2 > thresholdX) continue;
      if (seg.x1 > thresholdX || seg.x2 > thresholdX) {
        const segMax = Math.max(seg.x1, seg.x2);
        if (segMax > maxDrawnX) {
          maxDrawnX = segMax;
          tracerPoint = seg.x1 > seg.x2 ? { x: seg.x1, y: seg.y1 } : { x: seg.x2, y: seg.y2 };
        }
      }
    }

    const s1 = worldToScreen(seg.x1, seg.y1);
    const s2 = worldToScreen(seg.x2, seg.y2);
    ctx.moveTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
  }
  ctx.stroke();
  ctx.restore();

  if (isAnimating && tracerPoint) {
    const sp = worldToScreen(tracerPoint.x, tracerPoint.y);
    ctx.fillStyle = fn.color;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Derivative Drawing ───────────────────────────────────────────────

function drawDerivative(
  ctx: CanvasRenderingContext2D,
  fn: GraphFunction,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number },
  globalTime: number
) {
  if (!fn.compiled) return;

  const { from, to } = fn.domain;
  const numPoints = Math.min(1000, Math.max(300, Math.floor(size.w)));
  const step = (to - from) / numPoints;

  ctx.strokeStyle = fn.color + '80';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);

  let drawing = false;
  let prevDy = NaN;

  for (let i = 0; i <= numPoints; i++) {
    const x = from + i * step;
    const dy = numericalDerivative(fn.compiled, x, globalTime);
    const screen = worldToScreen(x, dy);

    if (isNaN(dy) || !isFinite(dy) || hasDiscontinuity(prevDy, dy, (to - from) * 0.4)) {
      if (drawing) { ctx.stroke(); drawing = false; }
    } else {
      if (!drawing) {
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        drawing = true;
      } else {
        ctx.lineTo(screen.x, screen.y);
      }
    }
    prevDy = dy;
  }
  if (drawing) ctx.stroke();
  ctx.setLineDash([]);
}

// ── Integral Drawing (Geometric Area Under Curve §4 - §16) ───────────

function drawIntegral(
  ctx: CanvasRenderingContext2D,
  fn: GraphFunction,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number },
  globalTime: number
) {
  if (!fn.compiled) return;

  const { a, b } = fn.integralBounds;
  const areaResult = calculateGeometricArea(fn.compiled, a, b, globalTime);

  // If discontinuous or undefined, do not draw false continuous shading across gap
  if (!areaResult.valid) {
    if (areaResult.hasDiscontinuity) {
      const midX = (a + b) / 2;
      const labelScreen = worldToScreen(midX, 0);
      const cx = Math.max(120, Math.min(size.w - 120, labelScreen.x));
      const cy = Math.max(25, Math.min(size.h - 25, labelScreen.y - 14));

      ctx.save();
      ctx.font = '11px JetBrains Mono, monospace';
      const warnText = 'Area: Discontinuous on interval';
      const tw = ctx.measureText(warnText).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#ef4444aa';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx - tw / 2 - 8, cy - 10, tw + 16, 20, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f87171';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(warnText, cx, cy);
      ctx.restore();
    }
    return;
  }

  // Draw shaded geometric regions separated by x-axis crossings (§10)
  // If curve is above x-axis: shade curve -> x-axis.
  // If curve is below x-axis: shade x-axis -> curve (physically below x-axis).
  const validDomainSpan = (areaResult.validInterval?.to ?? b) - (areaResult.validInterval?.from ?? a) || 1;

  for (const region of areaResult.regions) {
    const subPoints = Math.max(25, Math.floor(180 * (region.to - region.from) / validDomainSpan));
    const subStep = (region.to - region.from) / subPoints;

    ctx.fillStyle = fn.color + '18';
    ctx.strokeStyle = fn.color + '45';
    ctx.lineWidth = 1;

    ctx.beginPath();
    const startPt = worldToScreen(region.from, 0);
    ctx.moveTo(startPt.x, startPt.y);

    for (let i = 0; i <= subPoints; i++) {
      const x = region.from + i * subStep;
      const y = evaluateFunction(fn.compiled, x, globalTime);
      if (isNaN(y) || !isFinite(y)) continue;
      const screen = worldToScreen(x, y);
      ctx.lineTo(screen.x, screen.y);
    }

    const endPt = worldToScreen(region.to, 0);
    ctx.lineTo(endPt.x, endPt.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Draw Area Label with pill background
  const vStart = areaResult.validInterval?.from ?? Math.min(a, b);
  const vEnd = areaResult.validInterval?.to ?? Math.max(a, b);
  const midX = (vStart + vEnd) / 2;
  const midY = evaluateFunction(fn.compiled, midX, globalTime);
  const labelY = isNaN(midY) || !isFinite(midY) ? 0 : midY / 2;
  const labelScreen = worldToScreen(midX, labelY);

  const cx = Math.max(70, Math.min(size.w - 70, labelScreen.x));
  const cy = Math.max(25, Math.min(size.h - 25, labelScreen.y));

  let text: string;
  if (areaResult.totalArea === 0 || Math.abs(areaResult.totalArea - Math.round(areaResult.totalArea)) < 1e-7) {
    text = `Area = ${Math.round(areaResult.totalArea)}`;
  } else {
    text = `Area ≈ ${formatSmartNumber(areaResult.totalArea, { decimals: 3 })}`;
  }

  ctx.save();
  ctx.font = '11px JetBrains Mono, monospace';
  const tm = ctx.measureText(text);
  const tw = tm.width;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = fn.color + '70';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cx - tw / 2 - 8, cy - 11, tw + 16, 22, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = fn.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

// ── Morph Drawing ────────────────────────────────────────────────────

function drawMorphedFunction(
  ctx: CanvasRenderingContext2D,
  fn: GraphFunction,
  morphState: MorphState,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number },
  globalTime: number
) {
  if (!fn.compiled) return;

  const parsedB = parseExpression(morphState.functionB);
  if (!parsedB.compiled) {
    drawFunction(ctx, fn, size, view, worldToScreen, 'draw', globalTime);
    return;
  }

  const { from, to } = fn.domain;
  const numPoints = 1000;
  const step = (to - from) / numPoints;
  const t = morphState.progress;

  ctx.strokeStyle = fn.color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  let drawing = false;
  let prevY = NaN;

  for (let i = 0; i <= numPoints; i++) {
    const x = from + i * step;
    const yA = evaluateFunction(fn.compiled, x, globalTime);
    const yB = evaluateFunction(parsedB.compiled, x, globalTime);

    if (isNaN(yA) || isNaN(yB)) {
      if (drawing) { ctx.stroke(); drawing = false; }
      prevY = NaN;
      continue;
    }

    const y = yA * (1 - t) + yB * t;
    const screen = worldToScreen(x, y);

    if (isNaN(y) || !isFinite(y) || hasDiscontinuity(prevY, y)) {
      if (drawing) { ctx.stroke(); drawing = false; }
    } else {
      if (!drawing) {
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        drawing = true;
      } else {
        ctx.lineTo(screen.x, screen.y);
      }
    }
    prevY = y;
  }
  if (drawing) ctx.stroke();
}

// ── Click-on-Curve Guide Lines & Coordinate Display (§16-18) ────────

function drawClickGuideLines(
  ctx: CanvasRenderingContext2D,
  cp: ClickPoint,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number }
) {
  const sp = worldToScreen(cp.x, cp.y);
  const origin = worldToScreen(0, 0);

  if (!isFinite(sp.x) || !isFinite(sp.y) || !isFinite(origin.x) || !isFinite(origin.y)) {
    return;
  }

  // Smooth ease-out entrance animation (350ms duration)
  const elapsed = performance.now() - (cp.startTime || 0);
  const animProgress = Math.min(1, Math.max(0, elapsed / 350));
  const easeProgress = animProgress < 0.5 ? 2 * animProgress * animProgress : -1 + (4 - 2 * animProgress) * animProgress;

  ctx.save();

  // ── 1. RED Vertical Guide Line to X-axis ──
  const targetXAxisY = origin.y;
  const currY = sp.y + (targetXAxisY - sp.y) * easeProgress;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(sp.x, sp.y);
  ctx.lineTo(sp.x, currY);
  ctx.stroke();

  // ── 2. GREEN Horizontal Guide Line to Y-axis ──
  const targetYAxisX = origin.x;
  const currX = sp.x + (targetYAxisX - sp.x) * easeProgress;
  ctx.strokeStyle = '#10b981';
  ctx.beginPath();
  ctx.moveTo(sp.x, sp.y);
  ctx.lineTo(currX, sp.y);
  ctx.stroke();

  ctx.setLineDash([]);

  // ── 3. Red Indicator on X-axis (when progress >= 0.35 & X-axis is in/near viewport) ──
  if (easeProgress >= 0.35 && targetXAxisY >= -20 && targetXAxisY <= size.h + 20) {
    const alpha = Math.min(1, (easeProgress - 0.35) * 2.5);
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(sp.x, targetXAxisY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const xText = `x = ${formatSmartNumber(cp.x)}`;
    ctx.font = '10px JetBrains Mono, monospace';
    const tm = ctx.measureText(xText);
    const tw = tm.width + 10;
    const th = 18;
    const tagX = Math.max(4, Math.min(size.w - tw - 4, sp.x - tw / 2));
    const tagY = targetXAxisY + 5 > size.h - th - 4 ? targetXAxisY - th - 5 : targetXAxisY + 5;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tw, th, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(xText, tagX + tw / 2, tagY + th / 2);
    ctx.restore();
  }

  // ── 4. Green Indicator on Y-axis (when progress >= 0.35 & Y-axis is in/near viewport) ──
  if (easeProgress >= 0.35 && targetYAxisX >= -20 && targetYAxisX <= size.w + 20) {
    const alpha = Math.min(1, (easeProgress - 0.35) * 2.5);
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(targetYAxisX, sp.y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const yText = `y = ${formatSmartNumber(cp.y)}`;
    ctx.font = '10px JetBrains Mono, monospace';
    const tm = ctx.measureText(yText);
    const tw = tm.width + 10;
    const th = 18;
    const tagX = targetYAxisX - tw - 6 < 4 ? targetYAxisX + 6 : targetYAxisX - tw - 6;
    const tagY = Math.max(4, Math.min(size.h - th - 4, sp.y - th / 2));

    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tw, th, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(yText, tagX + tw / 2, tagY + th / 2);
    ctx.restore();
  }

  // ── 5. BLUE Highlighted Point Marker ──
  const pulse = (Math.sin(performance.now() * 0.005) + 1) * 2.5;
  ctx.save();
  ctx.shadowColor = 'rgba(59, 130, 246, 0.7)';
  ctx.shadowBlur = 10;

  // Blue outer pulsing ring
  ctx.strokeStyle = 'rgba(96, 165, 250, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sp.x, sp.y, 6 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  // Solid blue marker core
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
  ctx.fill();

  // White pinpoint center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sp.x, sp.y, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── 6. YELLOW Coordinate Label ──
  if (easeProgress >= 0.2) {
    const alpha = Math.min(1, (easeProgress - 0.2) * 1.6);
    ctx.save();
    ctx.globalAlpha = alpha;

    const coordText = `(${formatSmartNumber(cp.x)}, ${formatSmartNumber(cp.y)})`;
    const hasCurve = Boolean(cp.funcName);
    const subText = cp.funcName || '';

    ctx.font = 'bold 11px JetBrains Mono, monospace';
    const cWidth = ctx.measureText(coordText).width;
    let boxW = cWidth + 18;
    let boxH = 24;

    if (hasCurve) {
      ctx.font = '10px system-ui, sans-serif';
      const fWidth = ctx.measureText(subText).width;
      boxW = Math.max(cWidth, fWidth) + 18;
      boxH = 38;
    }

    let boxX = sp.x + 10;
    let boxY = sp.y - boxH - 8;
    if (boxX + boxW > size.w - 10) boxX = sp.x - boxW - 10;
    if (boxX < 10) boxX = 10;
    if (boxY < 10) boxY = sp.y + 10;
    if (boxY + boxH > size.h - 10) boxY = size.h - boxH - 10;

    // Dark sleek pill box with yellow border
    ctx.fillStyle = 'rgba(10, 15, 29, 0.94)';
    ctx.strokeStyle = '#eab308'; // Yellow accent
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 5);
    ctx.fill();
    ctx.stroke();

    // Yellow coordinate text
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillStyle = '#facc15'; // Bright yellow
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(coordText, boxX + 9, boxY + (hasCurve ? 5 : 5));

    if (hasCurve) {
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillStyle = cp.color || 'rgba(250, 204, 21, 0.75)';
      ctx.fillText(subText, boxX + 9, boxY + 21);
    }

    ctx.restore();
  }

  ctx.restore();
}

// ── Limit Visualization (§27) ───────────────────────────────────────

function drawLimitVisualization(
  ctx: CanvasRenderingContext2D,
  functions: GraphFunction[],
  limitState: LimitState,
  size: { w: number; h: number },
  view: ViewState,
  worldToScreen: (x: number, y: number) => { x: number; y: number },
  globalTime: number
) {
  const targetX = limitState.targetX;
  const spTarget = worldToScreen(targetX, 0);

  ctx.save();

  // Target vertical line
  ctx.strokeStyle = '#e2e8f055';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(spTarget.x, 0);
  ctx.lineTo(spTarget.x, size.h);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tag on X-axis for target
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(spTarget.x, worldToScreen(0, 0).y, 4, 0, Math.PI * 2);
  ctx.fill();

  const fn = functions.find(f => f.visible && f.compiled);
  if (!fn || !fn.compiled) {
    ctx.restore();
    return;
  }

  // Dynamic animated approach from left and right
  const animT = (Math.sin(performance.now() * 0.003) + 1) / 2;
  const approachDist = Math.max(0.01, limitState.delta * (1 - animT * 0.95));

  const xL = targetX - approachDist;
  const xR = targetX + approachDist;
  const yL = evaluateFunction(fn.compiled, xL, globalTime);
  const yR = evaluateFunction(fn.compiled, xR, globalTime);

  // Left approach point
  if (!isNaN(yL) && isFinite(yL)) {
    const spL = worldToScreen(xL, yL);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(spL.x, spL.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillText(`x→${targetX}⁻`, spL.x - 8, spL.y - 4);
  }

  // Right approach point
  if (!isNaN(yR) && isFinite(yR)) {
    const spR = worldToScreen(xR, yR);
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(spR.x, spR.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = '#f43f5e';
    ctx.textAlign = 'left';
    ctx.fillText(`x→${targetX}⁺`, spR.x + 8, spR.y - 4);
  }

  // Limit overlay HUD badge
  const boxW = 230;
  const boxH = 75;
  const boxX = 16;
  const boxY = 16;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.strokeStyle = '#6366f1aa';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Limit at x = ${formatSmartNumber(targetX)}`, boxX + 12, boxY + 10);

  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = '#38bdf8';
  const leftStr = limitState.leftLimit !== null ? formatSmartNumber(limitState.leftLimit) : 'und';
  ctx.fillText(`LHL (x→${targetX}⁻): ${leftStr}`, boxX + 12, boxY + 28);

  ctx.fillStyle = '#f43f5e';
  const rightStr = limitState.rightLimit !== null ? formatSmartNumber(limitState.rightLimit) : 'und';
  ctx.fillText(`RHL (x→${targetX}⁺): ${rightStr}`, boxX + 12, boxY + 44);

  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillStyle = limitState.exists ? '#34d399' : '#f59e0b';
  const statusStr = limitState.exists
    ? `Limit = ${formatSmartNumber(limitState.limit)} (Exists)`
    : (limitState.leftLimit === null && limitState.rightLimit === null ? 'Undefined' : 'Does not exist (LHL ≠ RHL)');
  ctx.fillText(statusStr, boxX + 12, boxY + 59);

  ctx.restore();
}
