/* ====================================================================
   MathFlow — About / Help Page
   ==================================================================== */

import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-2">MathFlow</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-8">
            Interactive Mathematics Visualizer — Explore, animate, and understand mathematical functions.
          </p>

          <Section title="What is MathFlow?">
            <p>
              MathFlow is an interactive mathematics visualization tool that lets you explore
              mathematical functions visually, animate them over time, understand their behavior,
              and experiment with your own equations. It combines the best of graphing calculators
              with modern interactive visualization.
            </p>
          </Section>

          <Section title="How to Use">
            <ul className="list-disc list-inside space-y-1.5">
              <li>Type any function in the input box (e.g., <code>sin(x) + x²</code>)</li>
              <li>Browse the Function Library for 100+ built-in functions</li>
              <li>Press Play to animate functions drawing progressively</li>
              <li>Add multiple functions to compare them on the same graph</li>
              <li>Hover over the graph to see coordinates and slope</li>
              <li>Zoom with scroll wheel, pan by dragging</li>
              <li>Toggle derivatives and integrals per function</li>
              <li>Use Time mode for time-dependent functions like <code>sin(x+t)</code></li>
              <li>Use Morph mode to smoothly transition between two functions</li>
            </ul>
          </Section>

          <Section title="Supported Expressions">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="glass-panel-solid p-2">+, -, *, /, ^</div>
              <div className="glass-panel-solid p-2">sin, cos, tan</div>
              <div className="glass-panel-solid p-2">asin, acos, atan</div>
              <div className="glass-panel-solid p-2">sinh, cosh, tanh</div>
              <div className="glass-panel-solid p-2">log, ln, log₂, log₁₀</div>
              <div className="glass-panel-solid p-2">exp, sqrt, cbrt</div>
              <div className="glass-panel-solid p-2">abs, floor, ceil</div>
              <div className="glass-panel-solid p-2">sign, max, min</div>
              <div className="glass-panel-solid p-2">π, e (constants)</div>
              <div className="glass-panel-solid p-2">Implicit: 2x → 2*x</div>
            </div>
          </Section>

          <Section title="Keyboard Shortcuts">
            <div className="space-y-2 text-xs">
              <Shortcut keys="Space" desc="Play / Pause all animations" />
              <Shortcut keys="R" desc="Restart all animations" />
              <Shortcut keys="F" desc="Toggle fullscreen" />
              <Shortcut keys="Esc" desc="Exit fullscreen" />
              <Shortcut keys="Scroll" desc="Zoom in / out" />
              <Shortcut keys="Drag" desc="Pan the graph" />
            </div>
          </Section>

          <Section title="Animation Modes">
            <div className="space-y-2 text-xs">
              <div><strong>Draw:</strong> Progressively reveals the function curve from left to right.</div>
              <div><strong>Trace:</strong> Moves a point along the curve showing coordinates.</div>
              <div><strong>Time:</strong> Adds a time parameter <code>t</code> — use expressions like <code>sin(x+t)</code>.</div>
              <div><strong>Morph:</strong> Smoothly transforms one function into another.</div>
            </div>
          </Section>

          <Section title="Mathematical Accuracy">
            <p>
              MathFlow distinguishes between <span className="text-emerald-400">exact</span> mathematical
              properties (proven/determined) and <span className="text-amber-400">numerical</span> estimates
              (computed from sampled values). Results are clearly labeled so you always know the confidence level.
            </p>
          </Section>

          <Section title="Curriculum Alignment">
            <p>
              The function library prioritizes functions commonly encountered in NCERT Mathematics
              (Class 11 & 12), including Algebra, Trigonometry, Calculus, Coordinate Geometry,
              and Functions & Relations. Functions are organized into intuitive categories for easy browsing.
            </p>
          </Section>

          <Section title="Learn More">
            <div className="space-y-1.5 text-xs">
              <a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener" className="block text-[var(--color-accent)] hover:underline">
                NCERT Mathematics Textbooks
              </a>
              <a href="https://www.khanacademy.org/math" target="_blank" rel="noopener" className="block text-[var(--color-accent)] hover:underline">
                Khan Academy — Mathematics
              </a>
              <a href="https://en.wikipedia.org/wiki/List_of_mathematical_functions" target="_blank" rel="noopener" className="block text-[var(--color-accent)] hover:underline">
                Wikipedia — List of Mathematical Functions
              </a>
              <a href="https://mathworld.wolfram.com/" target="_blank" rel="noopener" className="block text-[var(--color-accent)] hover:underline">
                Wolfram MathWorld
              </a>
            </div>
          </Section>

          <div className="mt-8 pt-4 border-t border-[var(--color-border)] text-center">
            <p className="text-[11px] text-[var(--color-text-muted)]">
              MathFlow — Interactive Mathematics Visualizer
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">{title}</h3>
      <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Shortcut({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-[var(--color-border)] font-mono text-[var(--color-text)] min-w-[60px] text-center">
        {keys}
      </span>
      <span className="text-[var(--color-text-secondary)]">{desc}</span>
    </div>
  );
}
