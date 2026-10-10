/* ====================================================================
   MathFlow — Saved Functions Page
   ==================================================================== */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavedFunction } from '../types';

interface SavedPageProps {
  savedFunctions: SavedFunction[];
  onVisualize: (expression: string, name?: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export default function SavedPage({ savedFunctions, onVisualize, onDelete, onRename }: SavedPageProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (fn: SavedFunction) => {
    setEditingId(fn.id);
    setEditName(fn.name);
  };

  const submitRename = (id: string) => {
    if (editName.trim()) onRename(id, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-4 border-b border-[var(--color-border)] shrink-0">
        <h2 className="text-lg font-semibold mb-1">Saved Functions</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Your saved functions are stored locally on this device.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {savedFunctions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-3xl mb-3 opacity-30">★</div>
            <div className="text-[var(--color-text-muted)] text-sm mb-1">No saved functions yet.</div>
            <div className="text-[var(--color-text-muted)] text-xs">
              Click the ★ button on any function to save it here.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {savedFunctions.map((fn, i) => (
                <motion.div
                  key={fn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel-solid p-3"
                >
                  {editingId === fn.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitRename(fn.id)}
                      onBlur={() => submitRename(fn.id)}
                      className="input-field text-xs py-1 mb-2"
                      autoFocus
                    />
                  ) : (
                    <div className="text-xs font-medium text-[var(--color-text)] mb-1 truncate">
                      {fn.name}
                    </div>
                  )}
                  <div className="text-[11px] font-mono text-[var(--color-text-secondary)] mb-3 truncate">
                    f(x) = {fn.expression}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] mb-3">
                    Saved {new Date(fn.savedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onVisualize(fn.expression, fn.name)}
                      className="btn-primary text-[11px] py-1 flex-1"
                    >
                      Visualize
                    </button>
                    <button onClick={() => startRename(fn)} className="btn-ghost text-[11px] py-1">
                      Rename
                    </button>
                    <button
                      onClick={() => onDelete(fn.id)}
                      className="btn-ghost text-[11px] py-1 text-[var(--color-error)]"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
