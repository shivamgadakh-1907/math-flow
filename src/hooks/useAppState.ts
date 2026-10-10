/* ====================================================================
   MathFlow — Application State Hook
   ==================================================================== */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GraphFunction, ViewState, AnimationMode, MorphState, SavedFunction, NavPage } from '../types';
import { GRAPH_COLORS } from '../types';
import { parseExpression, detectDomain } from '../math/engine';

let nextFuncId = Date.now();

function createGraphFunction(
  expression: string,
  name?: string,
  displayExpr?: string
): GraphFunction {
  const parsed = parseExpression(expression);
  const domain = detectDomain(parsed.expression, parsed.isImplicit);
  const id = `fn-${nextFuncId++}-${Math.random().toString(36).slice(2, 6)}`;
  const colorIndex = (nextFuncId) % GRAPH_COLORS.length;

  return {
    id,
    expression: parsed.expression,
    displayExpr: displayExpr || (parsed.isImplicit ? expression : (expression.includes('=') ? expression : `f(x) = ${expression}`)),
    name: name || expression,
    color: GRAPH_COLORS[colorIndex],
    compiled: parsed.compiled,
    error: parsed.error,
    hasTime: parsed.hasTime,
    funcType: parsed.funcType,
    isImplicit: parsed.isImplicit,
    parametric: parsed.parametric,
    polar: parsed.polar,
    visible: true,
    animationProgress: 0,
    animationSpeed: 0.75,
    isAnimating: true,
    domain,
    autoDomain: { ...domain },
    showDerivative: false,
    showIntegral: false,
    integralBounds: { a: domain.from, b: domain.to / 2 },
  };
}

const STORAGE_KEY = 'mathflow-saved-functions';

function loadSaved(): SavedFunction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFunctions(fns: SavedFunction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fns));
}

export function useAppState() {
  const [functions, setFunctions] = useState<GraphFunction[]>([]);
  const [view, setView] = useState<ViewState>({ offsetX: 0, offsetY: 0, scale: 50 });
  const [animationMode, setAnimationMode] = useState<AnimationMode>('draw');
  const [globalTime, setGlobalTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [navPage, setNavPage] = useState<NavPage>('dashboard');
  const [selectedFuncId, setSelectedFuncId] = useState<string | null>(null);
  const [savedFunctions, setSavedFunctions] = useState<SavedFunction[]>(loadSaved);
  const [morphState, setMorphState] = useState<MorphState>({
    enabled: false,
    functionA: '',
    functionB: '',
    progress: 0,
  });

  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Animation loop
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setFunctions(prev => {
        let changed = false;
        const next = prev.map(fn => {
          const canAnimate = fn.compiled || (fn.parametric?.compiledX && fn.parametric?.compiledY) || fn.polar?.compiledR;
          if (!fn.isAnimating || !canAnimate) return fn;
          
          const speed = fn.animationSpeed;
          const newProgress = Math.min(1, fn.animationProgress + dt * speed * 0.3);
          
          if (newProgress !== fn.animationProgress) {
            changed = true;
            // Auto-stop animation when progress reaches 1
            const done = newProgress >= 1;
            return { ...fn, animationProgress: newProgress, isAnimating: done ? false : fn.isAnimating };
          }
          return fn;
        });
        return changed ? next : prev;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Add function
  const addFunction = useCallback((expression: string, name?: string, displayExpr?: string) => {
    const fn = createGraphFunction(expression, name, displayExpr);
    setFunctions(prev => [...prev, fn]);
    setSelectedFuncId(fn.id);
    setNavPage('visualizer');
    return fn;
  }, []);

  // Remove function
  const removeFunction = useCallback((id: string) => {
    setFunctions(prev => prev.filter(fn => fn.id !== id));
    setSelectedFuncId(prev => prev === id ? null : prev);
  }, []);

  // Update function
  const updateFunction = useCallback((id: string, updates: Partial<GraphFunction>) => {
    setFunctions(prev => prev.map(fn => fn.id === id ? { ...fn, ...updates } : fn));
  }, []);

  // Toggle animation
  const toggleAnimation = useCallback((id: string) => {
    setFunctions(prev => prev.map(fn => {
      if (fn.id !== id) return fn;
      if (fn.animationProgress >= 1) {
        return { ...fn, animationProgress: 0, isAnimating: true };
      }
      return { ...fn, isAnimating: !fn.isAnimating };
    }));
  }, []);

  // Restart animation
  const restartAnimation = useCallback((id: string) => {
    setFunctions(prev => prev.map(fn =>
      fn.id === id ? { ...fn, animationProgress: 0, isAnimating: true } : fn
    ));
  }, []);

  // Play all
  const playAll = useCallback(() => {
    setFunctions(prev => prev.map(fn => ({ ...fn, isAnimating: true })));
  }, []);

  // Pause all
  const pauseAll = useCallback(() => {
    setFunctions(prev => prev.map(fn => ({ ...fn, isAnimating: false })));
  }, []);

  // Restart all
  const restartAll = useCallback(() => {
    setFunctions(prev => prev.map(fn => ({
      ...fn, animationProgress: 0, isAnimating: true
    })));
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    setView({ offsetX: 0, offsetY: 0, scale: 50 });
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Save function
  const saveFunction = useCallback((expression: string, name: string) => {
    const newSaved: SavedFunction = {
      id: `saved-${Date.now()}`,
      name,
      expression,
      savedAt: Date.now(),
    };
    setSavedFunctions(prev => {
      const next = [...prev, newSaved];
      saveFunctions(next);
      return next;
    });
  }, []);

  // Delete saved
  const deleteSaved = useCallback((id: string) => {
    setSavedFunctions(prev => {
      const next = prev.filter(s => s.id !== id);
      saveFunctions(next);
      return next;
    });
  }, []);

  // Rename saved
  const renameSaved = useCallback((id: string, name: string) => {
    setSavedFunctions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, name } : s);
      saveFunctions(next);
      return next;
    });
  }, []);

  // Update expression (re-parse)
  const updateExpression = useCallback((id: string, newExpr: string) => {
    const parsed = parseExpression(newExpr);
    const domain = detectDomain(parsed.expression, parsed.isImplicit);
    setFunctions(prev => prev.map(fn =>
      fn.id === id ? {
        ...fn,
        expression: parsed.expression,
        displayExpr: parsed.isImplicit ? newExpr : (newExpr.includes('=') ? newExpr : `f(x) = ${newExpr}`),
        name: newExpr,
        compiled: parsed.compiled,
        error: parsed.error,
        hasTime: parsed.hasTime,
        funcType: parsed.funcType,
        isImplicit: parsed.isImplicit,
        parametric: parsed.parametric,
        polar: parsed.polar,
        domain,
        autoDomain: { ...domain },
        animationProgress: 0,
      } : fn
    ));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          const anyPlaying = functions.some(f => f.isAnimating);
          if (anyPlaying) pauseAll();
          else playAll();
          break;
        case 'r':
        case 'R':
          restartAll();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [functions, isFullscreen, pauseAll, playAll, restartAll, toggleFullscreen]);

  // Fullscreen change detection
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return {
    functions,
    view,
    setView,
    animationMode,
    setAnimationMode,
    globalTime,
    setGlobalTime,
    isFullscreen,
    navPage,
    setNavPage,
    selectedFuncId,
    setSelectedFuncId,
    savedFunctions,
    morphState,
    setMorphState,
    addFunction,
    removeFunction,
    updateFunction,
    updateExpression,
    toggleAnimation,
    restartAnimation,
    playAll,
    pauseAll,
    restartAll,
    resetView,
    toggleFullscreen,
    saveFunction,
    deleteSaved,
    renameSaved,
  };
}
