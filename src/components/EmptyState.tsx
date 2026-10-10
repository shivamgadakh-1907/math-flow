/* ====================================================================
   MathFlow — Empty State (Visualizer workspace)
   Minimal prompt shown when no functions have been added yet.
   ==================================================================== */

import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center px-6"
      >
        <div className="text-3xl mb-4 opacity-30">ƒ</div>
        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          No functions added yet.
        </p>
        <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto">
          Type a function above or browse the Library.
        </p>
      </motion.div>
    </div>
  );
}
