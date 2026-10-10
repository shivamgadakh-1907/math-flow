/* ====================================================================
   MathFlow — Main Application Component
   Orchestrates visualizer layout, state synchronization,
   multi-tier education levels, precision settings, limits, and mobile responsiveness.
   ==================================================================== */

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState } from './hooks/useAppState';
import type { HoverPoint, ClickPoint, LimitState } from './types';
import { formatSmartNumber } from './math/engine';
import Header from './components/Header';
import FunctionInput from './components/FunctionInput';
import FunctionManager from './components/FunctionManager';
import InfoPanel from './components/InfoPanel';
import AnimationControls from './components/AnimationControls';
import EmptyState from './components/EmptyState';
import LibraryPage from './components/LibraryPage';
import SavedPage from './components/SavedPage';
import AboutPage from './components/AboutPage';
import DashboardPage from './components/DashboardPage';
import GraphCanvas from './graph/GraphCanvas';

export default function App() {
  const state = useAppState();
  const [hoverPoint, setHoverPoint] = useState<HoverPoint | null>(null);
  const [clickPoints, setClickPoints] = useState<ClickPoint[]>([]);
  const activeClickPoint = clickPoints.length > 0 ? clickPoints[clickPoints.length - 1] : null;
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Limit visualization state (§27)
  const [limitState, setLimitState] = useState<LimitState>({
    enabled: false,
    targetX: 0,
    leftLimit: null,
    rightLimit: null,
    limit: null,
    exists: null,
    delta: 1.0,
  });

  const handleAddFunction = useCallback((expression: string, name?: string, displayExpr?: string) => {
    state.addFunction(expression, name, displayExpr);
  }, [state.addFunction]);

  const isDashboard = state.navPage === 'dashboard';
  const hasVisualizer = state.navPage === 'visualizer';
  const hasFunctions = state.functions.length > 0;

  return (
    <div className="w-full h-full flex flex-col bg-[var(--color-bg)]">
      {/* Header — hidden on dashboard and in fullscreen */}
      {!isDashboard && !state.isFullscreen && (
        <Header
          navPage={state.navPage}
          setNavPage={state.setNavPage}
          isFullscreen={state.isFullscreen}
          toggleFullscreen={state.toggleFullscreen}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isDashboard ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <DashboardPage setNavPage={state.setNavPage} onSelectFunction={handleAddFunction} />
            </motion.div>
          ) : state.navPage === 'library' ? (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <LibraryPage onVisualize={handleAddFunction} />
            </motion.div>
          ) : state.navPage === 'saved' ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <SavedPage
                savedFunctions={state.savedFunctions}
                onVisualize={handleAddFunction}
                onDelete={state.deleteSaved}
                onRename={state.renameSaved}
              />
            </motion.div>
          ) : state.navPage === 'about' ? (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <AboutPage />
            </motion.div>
          ) : (
            /* ── Visualizer Layout ────────────────────────── */
            <motion.div
              key="visualizer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex relative overflow-hidden"
            >
              {/* Left Panel — Info / Analysis */}
              {!state.isFullscreen && leftPanelOpen && (
                <div className="w-[280px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col overflow-hidden z-20 absolute inset-y-0 left-0 lg:static shadow-xl lg:shadow-none">
                  <div className="px-3 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
                    <span className="section-title">Analysis & Inspector</span>
                    <button 
                      onClick={() => setLeftPanelOpen(false)}
                      className="btn-icon w-6 h-6 text-[10px]"
                      title="Collapse Analysis"
                    >
                      ◀
                    </button>
                  </div>
                  <InfoPanel
                    functions={state.functions}
                    selectedFuncId={state.selectedFuncId}
                    hoverPoint={hoverPoint}
                    clickPoint={activeClickPoint}
                    clickPoints={clickPoints}
                    onClearPoints={() => setClickPoints([])}
                    globalTime={state.globalTime}
                    limitState={limitState}
                    setLimitState={setLimitState}
                  />
                </div>
              )}

              {/* Left panel toggle (when collapsed) */}
              {!state.isFullscreen && !leftPanelOpen && (
                <button
                  onClick={() => setLeftPanelOpen(true)}
                  className="w-6 shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-[10px] z-10"
                  title="Expand Analysis"
                >
                  ▶
                </button>
              )}

              {/* Center — Graph */}
              <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Function input (above graph) */}
                {!state.isFullscreen && (
                  <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                    <FunctionInput onAdd={handleAddFunction} />
                  </div>
                )}

                {/* Graph area */}
                <div className="flex-1 relative overflow-hidden">
                  {hasFunctions ? (
                    <GraphCanvas
                      functions={state.functions}
                      view={state.view}
                      setView={state.setView}
                      animationMode={state.animationMode}
                      globalTime={state.globalTime}
                      morphState={state.morphState}
                      limitState={limitState}
                      onHover={setHoverPoint}
                      clickPoint={activeClickPoint}
                      clickPoints={clickPoints}
                      onClickPoints={setClickPoints}
                      onClearPoints={() => setClickPoints([])}
                      onClickPoint={(pt) => {
                        if (pt) setClickPoints(prev => [...prev.filter(p => p.id !== pt.id), pt]);
                        else setClickPoints([]);
                      }}
                      isFullscreen={state.isFullscreen}
                    />
                  ) : (
                    <EmptyState />
                  )}

                  {/* Point Controls Overlay — Clear All Points (Only visible when points exist) */}
                  {!state.isFullscreen && clickPoints.length > 0 && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-auto">
                      <button
                        id="clear-all-points-btn"
                        onClick={() => setClickPoints([])}
                        title={`Clear all ${clickPoints.length} highlighted point${clickPoints.length > 1 ? 's' : ''}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all backdrop-blur-md border shadow-md select-none bg-[var(--color-surface)]/90 text-[var(--color-text)] border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)] hover:border-rose-500/50 hover:text-rose-300 cursor-pointer active:scale-95"
                      >
                        <span className="text-[12px] opacity-75">⌫</span>
                        <span>Clear All Points</span>
                        <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {clickPoints.length}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Hover tooltip overlay */}
                  {hoverPoint && clickPoints.length === 0 && (
                    <div className="absolute top-3 right-3 glass-panel px-3 py-2 pointer-events-none z-10">
                      <div className="font-mono text-[11px] space-y-0.5">
                        <div className="text-[var(--color-text-muted)] text-[10px] mb-1">{hoverPoint.funcName}</div>
                        <div>
                          <span className="text-[var(--color-text-muted)]">x = </span>
                          <span style={{ color: hoverPoint.color }}>{formatSmartNumber(hoverPoint.x)}</span>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-muted)]">y = </span>
                          <span style={{ color: hoverPoint.color }}>{formatSmartNumber(hoverPoint.y)}</span>
                        </div>
                        {hoverPoint.slope !== undefined && (
                          <div>
                            <span className="text-[var(--color-text-muted)]">Slope = </span>
                            <span className="text-[var(--color-text-secondary)]">{formatSmartNumber(hoverPoint.slope)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mobile Quick Panel Buttons (when on phone screens) */}
                  <div className="absolute bottom-3 left-3 z-10 flex lg:hidden items-center gap-1.5">
                    {!leftPanelOpen && (
                      <button
                        onClick={() => setLeftPanelOpen(true)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white shadow-lg"
                      >
                        Analysis
                      </button>
                    )}
                    {!rightPanelOpen && (
                      <button
                        onClick={() => setRightPanelOpen(true)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white shadow-lg"
                      >
                        Functions
                      </button>
                    )}
                  </div>

                  {/* Fullscreen controls overlay (§22 & §43: Minimal single Restart All) */}
                  {state.isFullscreen && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl">
                      <button onClick={state.toggleFullscreen} className="btn-ghost text-[11px] px-2 py-1">
                        ✕ Exit (Esc)
                      </button>
                      <button
                        onClick={state.restartAll}
                        className="btn-icon text-xs"
                        title="Restart All Animations (R)"
                      >
                        ↻
                      </button>
                      <button
                        onClick={state.resetView}
                        className="btn-icon text-xs"
                        title="Reset View"
                      >
                        ⊞
                      </button>
                      {clickPoints.length > 0 && (
                        <>
                          <div className="w-[1px] h-4 bg-white/15 my-auto" />
                          <button
                            id="fullscreen-clear-all-points-btn"
                            onClick={() => setClickPoints([])}
                            title={`Clear all ${clickPoints.length} highlighted point${clickPoints.length > 1 ? 's' : ''}`}
                            className="text-[11px] px-2.5 py-1 rounded transition-all flex items-center gap-1.5 text-white hover:text-rose-300 hover:bg-white/5 cursor-pointer"
                          >
                            <span className="text-[11px]">⌫</span>
                            <span>Clear All Points</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {clickPoints.length}
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel — Function Manager */}
              {!state.isFullscreen && rightPanelOpen && (
                <div className="w-[280px] shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col overflow-hidden z-20 absolute inset-y-0 right-0 md:static shadow-xl md:shadow-none">
                  <div className="px-3 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
                    <span className="section-title">Functions</span>
                    <button 
                      onClick={() => setRightPanelOpen(false)}
                      className="btn-icon w-6 h-6 text-[10px]"
                      title="Collapse Functions"
                    >
                      ▶
                    </button>
                  </div>
                  <FunctionManager
                    functions={state.functions}
                    selectedFuncId={state.selectedFuncId}
                    setSelectedFuncId={state.setSelectedFuncId}
                    updateFunction={state.updateFunction}
                    removeFunction={state.removeFunction}
                    toggleAnimation={state.toggleAnimation}
                    restartAnimation={state.restartAnimation}
                    updateExpression={state.updateExpression}
                    saveFunction={state.saveFunction}
                    playAll={state.playAll}
                    pauseAll={state.pauseAll}
                    restartAll={state.restartAll}
                    resetView={state.resetView}
                  />
                </div>
              )}

              {/* Right panel toggle (when collapsed) */}
              {!state.isFullscreen && !rightPanelOpen && (
                <button
                  onClick={() => setRightPanelOpen(true)}
                  className="w-6 shrink-0 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-[10px] z-10"
                  title="Expand Functions"
                >
                  ◀
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Animation Controls (§22 & §43) */}
      {hasVisualizer && !state.isFullscreen && (
        <AnimationControls
          animationMode={state.animationMode}
          setAnimationMode={state.setAnimationMode}
          globalTime={state.globalTime}
          setGlobalTime={state.setGlobalTime}
          morphState={state.morphState}
          setMorphState={state.setMorphState}
          playAll={state.playAll}
          pauseAll={state.pauseAll}
          restartAll={state.restartAll}
        />
      )}
    </div>
  );
}
