/* ====================================================================
   MathFlow — Popular Functions (shared data)
   Used by both the Dashboard and any component that needs example functions.
   ==================================================================== */

export const POPULAR_FUNCTIONS = [
  { expr: 'x^2', label: 'x²', color: '#6366f1' },
  { expr: 'sin(x)', label: 'sin(x)', color: '#38bdf8' },
  { expr: 'cos(x)', label: 'cos(x)', color: '#22d3ee' },
  { expr: 'exp(x)', label: 'eˣ', color: '#a78bfa' },
  { expr: 'log(x)', label: 'ln(x)', color: '#c084fc' },
  { expr: 'abs(x)', label: '|x|', color: '#34d399' },
  { expr: '1/x', label: '1/x', color: '#fbbf24' },
  { expr: 'sin(x)/cos(x)', label: 'tan(x)', color: '#f472b6' },
] as const;
