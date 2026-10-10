/* ====================================================================
   MathFlow — Dashboard / Home Page
   Brand introduction and entry point to the Visualizer.
   Features Originkit Lattice Flight 3D raymarched background animation.
   ==================================================================== */

import { motion, useReducedMotion } from 'framer-motion';
import ElasticText from './ElasticText';
import ParticleText from './ParticleText';
import LatticeFlight from './LatticeFlight';
import { POPULAR_FUNCTIONS } from '../data/popularFunctions';
import type { NavPage } from '../types';

interface DashboardPageProps {
  setNavPage: (p: NavPage) => void;
  onSelectFunction: (expr: string) => void;
}

export default function DashboardPage({ setNavPage, onSelectFunction }: DashboardPageProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleChipClick = (expr: string) => {
    onSelectFunction(expr);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-x-hidden overflow-y-auto bg-[#09090f]">
      {/* Layer 1: Originkit Lattice Flight 3D animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <LatticeFlight
          background="#09090f"
          baseColor="#6366f1"
          density={220}
          speed={shouldReduceMotion ? 0 : 14}
          thickness={3}
          fog={75}
          distance={3}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
          }}
        />
      </div>

      {/* Layer 2: Dark MathFlow overlay to preserve readability and atmosphere */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#09090f]/75 via-[#09090f]/55 to-[#09090f]/85"
        aria-hidden="true"
      />

      {/* Layer 3: Dashboard content container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 w-full max-w-2xl pointer-events-none my-auto py-8 sm:py-12"
      >
        {/* Logo */}
        <motion.img
          src="/mathflow-logo.png"
          alt="MathFlow"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-contain ring-1 ring-white/10 shadow-lg select-none mb-5 pointer-events-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        {/* Particle-based MathFlow wordmark */}
        <motion.div
          className="w-full h-[100px] sm:h-[120px] md:h-[140px] mb-2 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ParticleText
            text="MathFlow"
            particleSize={2}
            density={4}
            color="#e8e8ed"
            highlightColor="#8b5cf6"
            scatter={100}
            gatherDuration={1200}
            stagger={250}
            pointerRepel={28}
            repelRadius={100}
            idleDrift={0.25}
            trigger="mount"
            fontSize="clamp(2.5rem, 8vw, 5.5rem)"
            fontWeight={800}
            fontFamily="inherit"
            glow={false}
          />
        </motion.div>

        {/* Headline with elastic animation */}
        <motion.div
          className="min-h-[3.5rem] sm:min-h-[4.5rem] flex items-end justify-center mb-3 pointer-events-auto select-text"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            <ElasticText text="Bring Mathematics to Life." />
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-sm text-[var(--color-text-secondary)] mb-7 max-w-md mx-auto pointer-events-auto select-text"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Choose a function, create your own, and watch mathematics evolve.
        </motion.p>

        {/* Function example chips */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto mb-4 pointer-events-auto"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          {POPULAR_FUNCTIONS.map((fn, i) => (
            <motion.button
              key={fn.expr}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
              onClick={() => handleChipClick(fn.expr)}
              className="group px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] transition-all duration-300"
            >
              <span className="font-mono text-sm text-[var(--color-text-secondary)] group-hover:text-white transition-colors">
                {fn.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Expression hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-[11px] text-[var(--color-text-muted)] mb-8 pointer-events-auto select-text"
        >
          Or type any expression like{' '}
          <span className="font-mono text-[var(--color-accent)]">sin(x²) + e⁻ˣ</span>
        </motion.p>

        {/* Primary CTA */}
        <motion.button
          onClick={() => setNavPage('visualizer')}
          className="px-8 py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.97] pointer-events-auto"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          Open Visualizer
        </motion.button>
      </motion.div>

      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/20 to-transparent pointer-events-none z-[2]" />
    </div>
  );
}
