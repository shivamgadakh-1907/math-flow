/* ====================================================================
   MathFlow — Header Component
   ==================================================================== */

import { motion } from 'framer-motion';
import type { NavPage } from '../types';

interface HeaderProps {
  navPage: NavPage;
  setNavPage: (p: NavPage) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const NAV_ITEMS: { key: NavPage; label: string; icon: string }[] = [
  { key: 'visualizer', label: 'Visualizer', icon: '◎' },
  { key: 'library', label: 'Library', icon: '▤' },
  { key: 'saved', label: 'Saved', icon: '★' },
  { key: 'about', label: 'About', icon: '?' },
];

export default function Header({
  navPage,
  setNavPage,
  isFullscreen,
  toggleFullscreen,
}: HeaderProps) {
  return (
    <header className="h-[52px] flex items-center justify-between px-4 sm:px-5 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 z-50 gap-2">
      {/* Logo — click to return to Dashboard */}
      <button
        onClick={() => setNavPage('dashboard')}
        className="flex items-center gap-2.5 sm:gap-3 bg-transparent border-none cursor-pointer group"
        aria-label="Back to MathFlow Dashboard"
      >
        <img
          src="/mathflow-logo.png"
          alt="MathFlow Logo"
          className="w-[30px] h-[30px] sm:w-8 sm:h-8 rounded-full object-contain shrink-0 ring-1 ring-white/15 shadow-sm select-none transition-opacity group-hover:opacity-80"
        />
        <span className="text-sm font-semibold tracking-tight text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">
          MathFlow
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] ml-1 hidden md:inline">
          Interactive Mathematics Laboratory
        </span>
      </button>

      {/* Navigation */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => setNavPage(item.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 relative
              ${navPage === item.key 
                ? 'text-white bg-[var(--color-accent-dim)]' 
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-white/[0.03]'
              }`}
          >
            <span className="mr-1.5">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
            {navPage === item.key && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[var(--color-accent)] rounded-full"
              />
            )}
          </button>
        ))}
        
        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="btn-icon ml-1"
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (F)'}
        >
          {isFullscreen ? '⊠' : '⛶'}
        </button>
      </nav>
    </header>
  );
}
