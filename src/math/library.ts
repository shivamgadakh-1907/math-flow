/* ====================================================================
   MathFlow — Function Library (200+ Mathematical Functions)
   Organized by Standard Mathematics Categories
   Covers School → College → Advanced
   ==================================================================== */

export interface LibraryFunction {
  id: string;
  name: string;
  expression: string;
  displayExpr: string;
  category: string;
  subcategory?: string;
  description: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isImplicit?: boolean;
  isParametric?: boolean;
  isPolar?: boolean;
}

export const CATEGORIES = [
  'Algebraic',
  'Polynomial',
  'Exponential',
  'Logarithmic',
  'Trigonometric',
  'Inverse Trigonometric',
  'Hyperbolic',
  'Special',
  'Rational',
  'Piecewise',
  'Oscillatory',
  'Composite',
  'Implicit & Curves',
  'Parametric',
  'Polar',
  'Famous Curves',
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  'Algebraic': '#6366f1',
  'Polynomial': '#818cf8',
  'Exponential': '#a78bfa',
  'Logarithmic': '#c084fc',
  'Trigonometric': '#38bdf8',
  'Inverse Trigonometric': '#22d3ee',
  'Hyperbolic': '#2dd4bf',
  'Special': '#34d399',
  'Rational': '#fbbf24',
  'Piecewise': '#fb923c',
  'Oscillatory': '#f472b6',
  'Composite': '#94a3b8',
  'Implicit & Curves': '#f43f5e',
  'Parametric': '#e879f9',
  'Polar': '#4ade80',
  'Famous Curves': '#f59e0b',
};

export const FUNCTION_LIBRARY: LibraryFunction[] = [
  // ── ALGEBRAIC ────────────────────────────────────────────────────
  { id: 'alg-constant', name: 'Constant', expression: '3', displayExpr: 'f(x) = 3', category: 'Algebraic', description: 'A constant function — always returns the same value regardless of input.', difficulty: 'beginner' },
  { id: 'alg-identity', name: 'Identity', expression: 'x', displayExpr: 'f(x) = x', category: 'Algebraic', description: 'The identity function — output equals input.', difficulty: 'beginner' },
  { id: 'alg-linear', name: 'Linear', expression: '2*x + 1', displayExpr: 'f(x) = 2x + 1', category: 'Algebraic', description: 'A linear function with slope 2 and y-intercept 1.', difficulty: 'beginner' },
  { id: 'alg-affine', name: 'Affine', expression: '3*x - 2', displayExpr: 'f(x) = 3x − 2', category: 'Algebraic', description: 'An affine function — a linear function with a constant term.', difficulty: 'beginner' },
  { id: 'alg-modulus', name: 'Modulus / Absolute', expression: 'abs(x)', displayExpr: 'f(x) = |x|', category: 'Algebraic', description: 'The absolute value function — distance from zero.', difficulty: 'beginner' },
  { id: 'alg-signum', name: 'Signum', expression: 'sign(x)', displayExpr: 'f(x) = sgn(x)', category: 'Algebraic', description: 'Returns −1, 0, or +1 depending on the sign of x.', difficulty: 'beginner' },
  { id: 'alg-floor', name: 'Greatest Integer', expression: 'floor(x)', displayExpr: 'f(x) = ⌊x⌋', category: 'Algebraic', description: 'The floor function — greatest integer less than or equal to x.', difficulty: 'beginner' },
  { id: 'alg-ceil', name: 'Ceiling', expression: 'ceil(x)', displayExpr: 'f(x) = ⌈x⌉', category: 'Algebraic', description: 'The ceiling function — smallest integer greater than or equal to x.', difficulty: 'beginner' },
  { id: 'alg-frac', name: 'Fractional Part', expression: 'x - floor(x)', displayExpr: 'f(x) = {x}', category: 'Algebraic', description: 'The fractional part of x.', difficulty: 'beginner' },
  { id: 'alg-recip', name: 'Reciprocal', expression: '1/x', displayExpr: 'f(x) = 1/x', category: 'Algebraic', description: 'The reciprocal function — undefined at x = 0.', difficulty: 'beginner' },
  { id: 'alg-sqrt', name: 'Square Root', expression: 'sqrt(x)', displayExpr: 'f(x) = √x', category: 'Algebraic', description: 'The principal square root — defined for x ≥ 0.', difficulty: 'beginner' },
  { id: 'alg-cbrt', name: 'Cube Root', expression: 'cbrt(x)', displayExpr: 'f(x) = ∛x', category: 'Algebraic', description: 'The cube root function — defined for all real numbers.', difficulty: 'beginner' },
  { id: 'alg-power-x15', name: 'x^(3/2)', expression: 'x^(3/2)', displayExpr: 'f(x) = x^(3/2)', category: 'Algebraic', description: 'Power 3/2 — defined for x ≥ 0, grows faster than sqrt.', difficulty: 'intermediate' },
  { id: 'alg-neg-linear', name: 'Negative Linear', expression: '-x + 3', displayExpr: 'f(x) = −x + 3', category: 'Algebraic', description: 'A decreasing linear function with slope −1.', difficulty: 'beginner' },
  
  // ── POLYNOMIAL ───────────────────────────────────────────────────
  { id: 'poly-x2', name: 'Quadratic', expression: 'x^2', displayExpr: 'f(x) = x²', category: 'Polynomial', description: 'A basic parabola opening upward.', difficulty: 'beginner' },
  { id: 'poly-x3', name: 'Cubic', expression: 'x^3', displayExpr: 'f(x) = x³', category: 'Polynomial', description: 'A cubic function with a single inflection point at the origin.', difficulty: 'beginner' },
  { id: 'poly-x4', name: 'Quartic', expression: 'x^4', displayExpr: 'f(x) = x⁴', category: 'Polynomial', description: 'A quartic function — flatter near the origin than x².', difficulty: 'intermediate' },
  { id: 'poly-x5', name: 'Quintic', expression: 'x^5', displayExpr: 'f(x) = x⁵', category: 'Polynomial', description: 'A quintic function — odd power polynomial.', difficulty: 'intermediate' },
  { id: 'poly-quad1', name: 'x² + 2x + 1', expression: 'x^2 + 2*x + 1', displayExpr: 'f(x) = x² + 2x + 1', category: 'Polynomial', description: 'A perfect square trinomial, equivalent to (x + 1)².', difficulty: 'beginner' },
  { id: 'poly-quad2', name: 'x² − 4', expression: 'x^2 - 4', displayExpr: 'f(x) = x² − 4', category: 'Polynomial', description: 'Difference of squares, factors as (x − 2)(x + 2).', difficulty: 'beginner' },
  { id: 'poly-quad3', name: '−x² + 4', expression: '-x^2 + 4', displayExpr: 'f(x) = −x² + 4', category: 'Polynomial', description: 'An inverted parabola with vertex at (0, 4).', difficulty: 'beginner' },
  { id: 'poly-cub1', name: 'x³ − 3x', expression: 'x^3 - 3*x', displayExpr: 'f(x) = x³ − 3x', category: 'Polynomial', description: 'A cubic with two turning points.', difficulty: 'intermediate' },
  { id: 'poly-cub2', name: 'x³ + x² − x', expression: 'x^3 + x^2 - x', displayExpr: 'f(x) = x³ + x² − x', category: 'Polynomial', description: 'A cubic polynomial with mixed terms.', difficulty: 'intermediate' },
  { id: 'poly-cub3', name: 'x³ − 6x² + 11x − 6', expression: 'x^3 - 6*x^2 + 11*x - 6', displayExpr: 'f(x) = x³ − 6x² + 11x − 6', category: 'Polynomial', description: 'Factors as (x−1)(x−2)(x−3), roots at 1, 2, 3.', difficulty: 'intermediate' },
  { id: 'poly-quart1', name: 'x⁴ − x²', expression: 'x^4 - x^2', displayExpr: 'f(x) = x⁴ − x²', category: 'Polynomial', description: 'A quartic with a W-shape.', difficulty: 'intermediate' },
  { id: 'poly-quart2', name: 'x⁴ − 4x² + 3', expression: 'x^4 - 4*x^2 + 3', displayExpr: 'f(x) = x⁴ − 4x² + 3', category: 'Polynomial', description: 'A quartic polynomial with multiple extrema.', difficulty: 'intermediate' },
  { id: 'poly-neg', name: '−x³', expression: '-x^3', displayExpr: 'f(x) = −x³', category: 'Polynomial', description: 'A reflected cubic function.', difficulty: 'beginner' },
  { id: 'poly-power-half', name: 'x^(1/2)', expression: 'x^(1/2)', displayExpr: 'f(x) = x^(1/2)', category: 'Polynomial', description: 'Square root as a power function — defined for x ≥ 0.', difficulty: 'beginner' },
  { id: 'poly-shifted-quad', name: '(x − 2)² − 3', expression: '(x-2)^2 - 3', displayExpr: 'f(x) = (x − 2)² − 3', category: 'Polynomial', description: 'Shifted parabola with vertex at (2, −3).', difficulty: 'beginner' },
  { id: 'poly-x6', name: 'x⁶', expression: 'x^6', displayExpr: 'f(x) = x⁶', category: 'Polynomial', description: 'A sixth-degree polynomial — very flat near origin.', difficulty: 'intermediate' },
  
  // ── EXPONENTIAL ──────────────────────────────────────────────────
  { id: 'exp-ex', name: 'e^x', expression: 'exp(x)', displayExpr: 'f(x) = eˣ', category: 'Exponential', description: 'The natural exponential function — foundation of exponential growth.', difficulty: 'beginner' },
  { id: 'exp-enx', name: 'e^−x', expression: 'exp(-x)', displayExpr: 'f(x) = e⁻ˣ', category: 'Exponential', description: 'Exponential decay function.', difficulty: 'beginner' },
  { id: 'exp-2x', name: '2^x', expression: '2^x', displayExpr: 'f(x) = 2ˣ', category: 'Exponential', description: 'Exponential growth with base 2 — doubles for each unit increase.', difficulty: 'beginner' },
  { id: 'exp-10x', name: '10^x', expression: '10^x', displayExpr: 'f(x) = 10ˣ', category: 'Exponential', description: 'Exponential growth with base 10.', difficulty: 'beginner' },
  { id: 'exp-x2', name: 'e^(x²)', expression: 'exp(x^2)', displayExpr: 'f(x) = e^(x²)', category: 'Exponential', description: 'Super-exponential growth — grows faster than e^x.', difficulty: 'intermediate' },
  { id: 'exp-nx2', name: 'e^(−x²)', expression: 'exp(-x^2)', displayExpr: 'f(x) = e^(−x²)', category: 'Exponential', description: 'The Gaussian bell curve (unnormalized).', difficulty: 'intermediate' },
  { id: 'exp-half', name: '(1/2)^x', expression: '(1/2)^x', displayExpr: 'f(x) = (½)ˣ', category: 'Exponential', description: 'Exponential decay with base 1/2.', difficulty: 'beginner' },
  { id: 'exp-shifted', name: 'e^x − 1', expression: 'exp(x) - 1', displayExpr: 'f(x) = eˣ − 1', category: 'Exponential', description: 'Shifted exponential — passes through the origin.', difficulty: 'beginner' },
  { id: 'exp-scaled', name: '2e^(−x/2)', expression: '2*exp(-x/2)', displayExpr: 'f(x) = 2e^(−x/2)', category: 'Exponential', description: 'Scaled exponential decay.', difficulty: 'intermediate' },
  { id: 'exp-3x', name: '3^x', expression: '3^x', displayExpr: 'f(x) = 3ˣ', category: 'Exponential', description: 'Exponential growth with base 3.', difficulty: 'beginner' },
  { id: 'exp-negex', name: '−e^x', expression: '-exp(x)', displayExpr: 'f(x) = −eˣ', category: 'Exponential', description: 'Reflected exponential — always negative.', difficulty: 'beginner' },
  
  // ── LOGARITHMIC ──────────────────────────────────────────────────
  { id: 'log-ln', name: 'Natural Log', expression: 'log(x)', displayExpr: 'f(x) = ln(x)', category: 'Logarithmic', description: 'The natural logarithm — inverse of e^x.', difficulty: 'beginner' },
  { id: 'log-log10', name: 'Log base 10', expression: 'log(x, 10)', displayExpr: 'f(x) = log₁₀(x)', category: 'Logarithmic', description: 'The common logarithm — used in decibels and pH.', difficulty: 'beginner' },
  { id: 'log-log2', name: 'Log base 2', expression: 'log(x, 2)', displayExpr: 'f(x) = log₂(x)', category: 'Logarithmic', description: 'The binary logarithm — fundamental in computer science.', difficulty: 'beginner' },
  { id: 'log-neg', name: '−ln(x)', expression: '-log(x)', displayExpr: 'f(x) = −ln(x)', category: 'Logarithmic', description: 'Reflected natural log.', difficulty: 'beginner' },
  { id: 'log-shifted', name: 'ln(x + 1)', expression: 'log(x + 1)', displayExpr: 'f(x) = ln(x + 1)', category: 'Logarithmic', description: 'Shifted logarithm — defined for x > −1.', difficulty: 'beginner' },
  { id: 'log-scaled', name: '2ln(x)', expression: '2*log(x)', displayExpr: 'f(x) = 2ln(x)', category: 'Logarithmic', description: 'Scaled natural logarithm.', difficulty: 'beginner' },
  { id: 'log-xlogx', name: 'x·ln(x)', expression: 'x*log(x)', displayExpr: 'f(x) = x·ln(x)', category: 'Logarithmic', description: 'Product of x and its logarithm — appears in entropy and information theory.', difficulty: 'intermediate' },
  { id: 'log-logx2', name: 'ln(x²)', expression: 'log(x^2)', displayExpr: 'f(x) = ln(x²)', category: 'Logarithmic', description: 'Logarithm of x² — equivalent to 2ln|x|.', difficulty: 'intermediate' },
  { id: 'log-log1px', name: 'ln(1+x²)', expression: 'log(1+x^2)', displayExpr: 'f(x) = ln(1+x²)', category: 'Logarithmic', description: 'Smooth even function — defined for all x.', difficulty: 'intermediate' },
  
  // ── TRIGONOMETRIC ────────────────────────────────────────────────
  { id: 'trig-sin', name: 'Sine', expression: 'sin(x)', displayExpr: 'f(x) = sin(x)', category: 'Trigonometric', description: 'The sine function — fundamental periodic function with period 2π.', difficulty: 'beginner' },
  { id: 'trig-cos', name: 'Cosine', expression: 'cos(x)', displayExpr: 'f(x) = cos(x)', category: 'Trigonometric', description: 'The cosine function — sin(x) shifted by π/2.', difficulty: 'beginner' },
  { id: 'trig-tan', name: 'Tangent', expression: 'sin(x)/cos(x)', displayExpr: 'f(x) = tan(x)', category: 'Trigonometric', description: 'The tangent function — undefined at odd multiples of π/2.', difficulty: 'beginner' },
  { id: 'trig-cot', name: 'Cotangent', expression: 'cos(x)/sin(x)', displayExpr: 'f(x) = cot(x)', category: 'Trigonometric', description: 'The cotangent function — reciprocal of tangent.', difficulty: 'intermediate' },
  { id: 'trig-sec', name: 'Secant', expression: '1/cos(x)', displayExpr: 'f(x) = sec(x)', category: 'Trigonometric', description: 'The secant function — reciprocal of cosine.', difficulty: 'intermediate' },
  { id: 'trig-csc', name: 'Cosecant', expression: '1/sin(x)', displayExpr: 'f(x) = csc(x)', category: 'Trigonometric', description: 'The cosecant function — reciprocal of sine.', difficulty: 'intermediate' },
  { id: 'trig-sin2x', name: 'sin(2x)', expression: 'sin(2*x)', displayExpr: 'f(x) = sin(2x)', category: 'Trigonometric', description: 'Sine with doubled frequency — period π.', difficulty: 'beginner' },
  { id: 'trig-cos2x', name: 'cos(2x)', expression: 'cos(2*x)', displayExpr: 'f(x) = cos(2x)', category: 'Trigonometric', description: 'Cosine with doubled frequency.', difficulty: 'beginner' },
  { id: 'trig-2sinx', name: '2sin(x)', expression: '2*sin(x)', displayExpr: 'f(x) = 2sin(x)', category: 'Trigonometric', description: 'Sine with doubled amplitude — range [−2, 2].', difficulty: 'beginner' },
  { id: 'trig-sinx1', name: 'sin(x) + 1', expression: 'sin(x) + 1', displayExpr: 'f(x) = sin(x) + 1', category: 'Trigonometric', description: 'Sine shifted up by 1 — range [0, 2].', difficulty: 'beginner' },
  { id: 'trig-sincos', name: 'sin(x) + cos(x)', expression: 'sin(x) + cos(x)', displayExpr: 'f(x) = sin(x) + cos(x)', category: 'Trigonometric', description: 'Sum of sine and cosine — equals √2·sin(x + π/4).', difficulty: 'beginner' },
  { id: 'trig-sinxcosx', name: 'sin(x)·cos(x)', expression: 'sin(x)*cos(x)', displayExpr: 'f(x) = sin(x)·cos(x)', category: 'Trigonometric', description: 'Product of sine and cosine — equals ½sin(2x).', difficulty: 'beginner' },
  { id: 'trig-sin2', name: 'sin²(x)', expression: '(sin(x))^2', displayExpr: 'f(x) = sin²(x)', category: 'Trigonometric', description: 'Squared sine — always non-negative, period π.', difficulty: 'beginner' },
  { id: 'trig-cos2', name: 'cos²(x)', expression: '(cos(x))^2', displayExpr: 'f(x) = cos²(x)', category: 'Trigonometric', description: 'Squared cosine — always non-negative, period π.', difficulty: 'beginner' },
  { id: 'trig-sin3x', name: 'sin(3x)', expression: 'sin(3*x)', displayExpr: 'f(x) = sin(3x)', category: 'Trigonometric', description: 'Sine with tripled frequency — period 2π/3.', difficulty: 'beginner' },
  { id: 'trig-sinx-half', name: 'sin(x/2)', expression: 'sin(x/2)', displayExpr: 'f(x) = sin(x/2)', category: 'Trigonometric', description: 'Sine with halved frequency — period 4π.', difficulty: 'beginner' },
  { id: 'trig-tanx2', name: 'tan(x/2)', expression: 'sin(x/2)/cos(x/2)', displayExpr: 'f(x) = tan(x/2)', category: 'Trigonometric', description: 'Tangent of half angle — period 2π.', difficulty: 'intermediate' },
  { id: 'trig-sin-abs', name: '|sin(x)|', expression: 'abs(sin(x))', displayExpr: 'f(x) = |sin(x)|', category: 'Trigonometric', description: 'Absolute sine — always non-negative, period π.', difficulty: 'beginner' },
  { id: 'trig-cos-abs', name: '|cos(x)|', expression: 'abs(cos(x))', displayExpr: 'f(x) = |cos(x)|', category: 'Trigonometric', description: 'Absolute cosine — always non-negative, period π.', difficulty: 'beginner' },
  
  // ── INVERSE TRIGONOMETRIC ────────────────────────────────────────
  { id: 'itrig-asin', name: 'Arcsine', expression: 'asin(x)', displayExpr: 'f(x) = sin⁻¹(x)', category: 'Inverse Trigonometric', description: 'The inverse sine — domain [−1, 1], range [−π/2, π/2].', difficulty: 'intermediate' },
  { id: 'itrig-acos', name: 'Arccosine', expression: 'acos(x)', displayExpr: 'f(x) = cos⁻¹(x)', category: 'Inverse Trigonometric', description: 'The inverse cosine — domain [−1, 1], range [0, π].', difficulty: 'intermediate' },
  { id: 'itrig-atan', name: 'Arctangent', expression: 'atan(x)', displayExpr: 'f(x) = tan⁻¹(x)', category: 'Inverse Trigonometric', description: 'The inverse tangent — horizontal asymptotes at ±π/2.', difficulty: 'intermediate' },
  { id: 'itrig-2asin', name: '2sin⁻¹(x)', expression: '2*asin(x)', displayExpr: 'f(x) = 2sin⁻¹(x)', category: 'Inverse Trigonometric', description: 'Scaled arcsine function.', difficulty: 'intermediate' },
  { id: 'itrig-atan-shifted', name: 'atan(x) + π/2', expression: 'atan(x) + pi/2', displayExpr: 'f(x) = tan⁻¹(x) + π/2', category: 'Inverse Trigonometric', description: 'Arctangent shifted up — range (0, π).', difficulty: 'intermediate' },
  { id: 'itrig-asin-2x', name: 'sin⁻¹(2x)', expression: 'asin(2*x)', displayExpr: 'f(x) = sin⁻¹(2x)', category: 'Inverse Trigonometric', description: 'Compressed arcsine — domain [−0.5, 0.5].', difficulty: 'intermediate' },
  
  // ── HYPERBOLIC ───────────────────────────────────────────────────
  { id: 'hyp-sinh', name: 'Hyperbolic Sine', expression: 'sinh(x)', displayExpr: 'f(x) = sinh(x)', category: 'Hyperbolic', description: 'The hyperbolic sine — (eˣ − e⁻ˣ)/2.', difficulty: 'intermediate' },
  { id: 'hyp-cosh', name: 'Hyperbolic Cosine', expression: 'cosh(x)', displayExpr: 'f(x) = cosh(x)', category: 'Hyperbolic', description: 'The hyperbolic cosine — the catenary curve, (eˣ + e⁻ˣ)/2.', difficulty: 'intermediate' },
  { id: 'hyp-tanh', name: 'Hyperbolic Tangent', expression: 'tanh(x)', displayExpr: 'f(x) = tanh(x)', category: 'Hyperbolic', description: 'The hyperbolic tangent — sigmoid-like, range (−1, 1).', difficulty: 'intermediate' },
  { id: 'hyp-coth', name: 'Hyperbolic Cotangent', expression: 'cosh(x)/sinh(x)', displayExpr: 'f(x) = coth(x)', category: 'Hyperbolic', description: 'The hyperbolic cotangent — undefined at x = 0.', difficulty: 'advanced' },
  { id: 'hyp-sech', name: 'Hyperbolic Secant', expression: '1/cosh(x)', displayExpr: 'f(x) = sech(x)', category: 'Hyperbolic', description: 'The hyperbolic secant — bell-shaped curve.', difficulty: 'advanced' },
  { id: 'hyp-csch', name: 'Hyperbolic Cosecant', expression: '1/sinh(x)', displayExpr: 'f(x) = csch(x)', category: 'Hyperbolic', description: 'The hyperbolic cosecant — undefined at x = 0.', difficulty: 'advanced' },
  { id: 'hyp-asinh', name: 'Inverse Sinh', expression: 'log(x + sqrt(x^2 + 1))', displayExpr: 'f(x) = sinh⁻¹(x)', category: 'Hyperbolic', description: 'The inverse hyperbolic sine — defined for all real x.', difficulty: 'advanced' },
  { id: 'hyp-acosh', name: 'Inverse Cosh', expression: 'log(x + sqrt(x^2 - 1))', displayExpr: 'f(x) = cosh⁻¹(x)', category: 'Hyperbolic', description: 'The inverse hyperbolic cosine — defined for x ≥ 1.', difficulty: 'advanced' },
  { id: 'hyp-atanh', name: 'Inverse Tanh', expression: '0.5*log((1+x)/(1-x))', displayExpr: 'f(x) = tanh⁻¹(x)', category: 'Hyperbolic', description: 'The inverse hyperbolic tangent — defined for |x| < 1.', difficulty: 'advanced' },
  
  // ── RATIONAL ─────────────────────────────────────────────────────
  { id: 'rat-1x', name: '1/x', expression: '1/x', displayExpr: 'f(x) = 1/x', category: 'Rational', description: 'The simplest rational function — hyperbola with vertical and horizontal asymptotes.', difficulty: 'beginner' },
  { id: 'rat-1x2', name: '1/x²', expression: '1/x^2', displayExpr: 'f(x) = 1/x²', category: 'Rational', description: 'Inverse square — always positive, decays faster than 1/x.', difficulty: 'beginner' },
  { id: 'rat-x1x', name: 'x/(x+1)', expression: 'x/(x+1)', displayExpr: 'f(x) = x/(x+1)', category: 'Rational', description: 'A simple rational function — horizontal asymptote at y = 1.', difficulty: 'intermediate' },
  { id: 'rat-1xm2', name: '1/(x−2)', expression: '1/(x-2)', displayExpr: 'f(x) = 1/(x−2)', category: 'Rational', description: 'Shifted reciprocal — vertical asymptote at x = 2.', difficulty: 'beginner' },
  { id: 'rat-x2p1', name: 'x²/(x²+1)', expression: 'x^2/(x^2+1)', displayExpr: 'f(x) = x²/(x²+1)', category: 'Rational', description: 'Bounded rational — approaches 1 as |x| → ∞.', difficulty: 'intermediate' },
  { id: 'rat-xm1xp1', name: '(x−1)/(x+1)', expression: '(x-1)/(x+1)', displayExpr: 'f(x) = (x−1)/(x+1)', category: 'Rational', description: 'Möbius-like transformation — horizontal asymptote at y = 1.', difficulty: 'intermediate' },
  { id: 'rat-1x2p1', name: '1/(x²+1)', expression: '1/(x^2+1)', displayExpr: 'f(x) = 1/(x²+1)', category: 'Rational', description: 'The Witch of Agnesi — smooth bell curve, maximum at x = 0.', difficulty: 'intermediate' },
  { id: 'rat-x2m1x2p1', name: '(x²−1)/(x²+1)', expression: '(x^2-1)/(x^2+1)', displayExpr: 'f(x) = (x²−1)/(x²+1)', category: 'Rational', description: 'A bounded rational function approaching 1 from below.', difficulty: 'intermediate' },
  { id: 'rat-xxm1', name: 'x/(x²−1)', expression: 'x/(x^2-1)', displayExpr: 'f(x) = x/(x²−1)', category: 'Rational', description: 'Rational with two vertical asymptotes at x = ±1.', difficulty: 'intermediate' },
  { id: 'rat-x3x2p1', name: 'x³/(x²+1)', expression: 'x^3/(x^2+1)', displayExpr: 'f(x) = x³/(x²+1)', category: 'Rational', description: 'Rational with oblique asymptote y = x.', difficulty: 'advanced' },
  
  // ── SPECIAL ──────────────────────────────────────────────────────
  { id: 'spc-gaussian', name: 'Gaussian', expression: 'exp(-x^2/2)', displayExpr: 'f(x) = e^(−x²/2)', category: 'Special', description: 'The Gaussian function — the basis of the normal distribution bell curve.', difficulty: 'intermediate' },
  { id: 'spc-sinc', name: 'Sinc', expression: 'sin(x)/x', displayExpr: 'f(x) = sin(x)/x', category: 'Special', description: 'The sinc function — important in signal processing and Fourier analysis.', difficulty: 'intermediate' },
  { id: 'spc-damped-sin', name: 'Damped Sine', expression: 'exp(-x/3)*sin(x)', displayExpr: 'f(x) = e^(−x/3)·sin(x)', category: 'Special', description: 'An exponentially damped oscillation.', difficulty: 'intermediate' },
  { id: 'spc-sigmoid', name: 'Sigmoid', expression: '1/(1+exp(-x))', displayExpr: 'f(x) = 1/(1+e⁻ˣ)', category: 'Special', description: 'The logistic sigmoid — S-shaped, range (0, 1). Widely used in machine learning.', difficulty: 'intermediate' },
  { id: 'spc-relu', name: 'ReLU', expression: 'max(0, x)', displayExpr: 'f(x) = max(0, x)', category: 'Special', description: 'Rectified Linear Unit — the most common neural network activation function.', difficulty: 'beginner' },
  { id: 'spc-softplus', name: 'Softplus', expression: 'log(1+exp(x))', displayExpr: 'f(x) = ln(1+eˣ)', category: 'Special', description: 'A smooth approximation of ReLU.', difficulty: 'intermediate' },
  { id: 'spc-heaviside', name: 'Heaviside Step', expression: '(sign(x)+1)/2', displayExpr: 'f(x) = H(x)', category: 'Special', description: 'The unit step function — 0 for x < 0, 1 for x > 0.', difficulty: 'beginner' },
  { id: 'spc-bump', name: 'Bump Function', expression: 'exp(-1/(1-x^2))*(abs(x)<1?1:0)', displayExpr: 'f(x) = exp(−1/(1−x²))', category: 'Special', description: 'A smooth bump function — nonzero only on (−1, 1).', difficulty: 'advanced' },
  { id: 'spc-witch', name: 'Witch of Agnesi', expression: '8/(x^2+4)', displayExpr: 'f(x) = 8/(x²+4)', category: 'Special', description: 'The Witch of Agnesi — a famous bell-shaped curve studied by Maria Gaetana Agnesi.', difficulty: 'intermediate' },
  { id: 'spc-lorentz', name: 'Lorentzian', expression: '1/(1+x^2)', displayExpr: 'f(x) = 1/(1+x²)', category: 'Special', description: 'The Cauchy-Lorentz distribution — heavier tails than Gaussian.', difficulty: 'intermediate' },
  { id: 'spc-error', name: 'Error-like', expression: 'exp(-x^2)*2/sqrt(pi)', displayExpr: 'f(x) = (2/√π)e^(−x²)', category: 'Special', description: 'Approximate derivative of the error function erf(x).', difficulty: 'advanced' },
  { id: 'spc-leaky-relu', name: 'Leaky ReLU', expression: 'max(0.1*x, x)', displayExpr: 'f(x) = max(0.1x, x)', category: 'Special', description: 'Leaky ReLU — allows small negative slope for x < 0.', difficulty: 'intermediate' },
  
  // ── PIECEWISE ────────────────────────────────────────────────────
  { id: 'pw-abs', name: '|x|', expression: 'abs(x)', displayExpr: 'f(x) = |x|', category: 'Piecewise', description: 'The modulus function — a V-shaped graph.', difficulty: 'beginner' },
  { id: 'pw-mod-x1', name: '|x − 1|', expression: 'abs(x-1)', displayExpr: 'f(x) = |x − 1|', category: 'Piecewise', description: 'Modulus shifted right by 1.', difficulty: 'beginner' },
  { id: 'pw-step', name: 'Step at x=0', expression: '(sign(x)+1)/2', displayExpr: 'f(x) = u(x)', category: 'Piecewise', description: 'Unit step function — 0 for negative, 1 for positive.', difficulty: 'beginner' },
  { id: 'pw-sawtooth', name: 'Sawtooth', expression: 'x - floor(x)', displayExpr: 'f(x) = x − ⌊x⌋', category: 'Piecewise', description: 'A sawtooth wave — periodic linear ramp.', difficulty: 'beginner' },
  { id: 'pw-triangle', name: 'Triangle Wave', expression: 'abs(2*(x - floor(x+0.5)))', displayExpr: 'f(x) = triangle(x)', category: 'Piecewise', description: 'A triangle wave — periodic, made of linear segments.', difficulty: 'beginner' },
  { id: 'pw-square', name: 'Square Wave', expression: 'sign(sin(x))', displayExpr: 'f(x) = sgn(sin(x))', category: 'Piecewise', description: 'A square wave — alternates between −1 and 1.', difficulty: 'beginner' },
  { id: 'pw-abs-sum', name: '|x| + |x−2|', expression: 'abs(x) + abs(x-2)', displayExpr: 'f(x) = |x| + |x−2|', category: 'Piecewise', description: 'Sum of two absolute values — piecewise linear.', difficulty: 'beginner' },
  { id: 'pw-min-abs', name: 'min(|x|, 1)', expression: 'min(abs(x), 1)', displayExpr: 'f(x) = min(|x|, 1)', category: 'Piecewise', description: 'Clipped absolute value — flat top.', difficulty: 'beginner' },
  
  // ── OSCILLATORY ──────────────────────────────────────────────────
  { id: 'osc-sinx2', name: 'sin(x²)', expression: 'sin(x^2)', displayExpr: 'f(x) = sin(x²)', category: 'Oscillatory', description: 'Chirp-like oscillation — frequency increases with |x|.', difficulty: 'intermediate' },
  { id: 'osc-xsinx', name: 'x·sin(x)', expression: 'x*sin(x)', displayExpr: 'f(x) = x·sin(x)', category: 'Oscillatory', description: 'Sine with linearly growing amplitude.', difficulty: 'intermediate' },
  { id: 'osc-sin1x', name: 'sin(1/x)', expression: 'sin(1/x)', displayExpr: 'f(x) = sin(1/x)', category: 'Oscillatory', description: 'Oscillates infinitely rapidly near x = 0 — a classic analysis example.', difficulty: 'advanced' },
  { id: 'osc-xsin1x', name: 'x·sin(1/x)', expression: 'x*sin(1/x)', displayExpr: 'f(x) = x·sin(1/x)', category: 'Oscillatory', description: 'Continuous at origin despite infinite oscillation.', difficulty: 'advanced' },
  { id: 'osc-cos-x2', name: 'cos(x²)', expression: 'cos(x^2)', displayExpr: 'f(x) = cos(x²)', category: 'Oscillatory', description: 'Cosine chirp — accelerating oscillation.', difficulty: 'intermediate' },
  { id: 'osc-sinx-exp', name: 'e⁻ˣsin(5x)', expression: 'exp(-x)*sin(5*x)', displayExpr: 'f(x) = e⁻ˣsin(5x)', category: 'Oscillatory', description: 'Rapidly damped oscillation.', difficulty: 'intermediate' },
  { id: 'osc-beat', name: 'Beat Pattern', expression: 'sin(5*x)*sin(0.5*x)', displayExpr: 'f(x) = sin(5x)·sin(0.5x)', category: 'Oscillatory', description: 'A beat pattern — product of two different frequencies.', difficulty: 'intermediate' },
  { id: 'osc-fourier3', name: 'Fourier (3 terms)', expression: 'sin(x) + sin(3*x)/3 + sin(5*x)/5', displayExpr: 'f(x) = sin(x) + sin(3x)/3 + sin(5x)/5', category: 'Oscillatory', description: 'Fourier series approaching a square wave — 3 terms.', difficulty: 'advanced' },
  
  // ── COMPOSITE ────────────────────────────────────────────────────
  { id: 'comp-sinex', name: 'sin(eˣ)', expression: 'sin(exp(x))', displayExpr: 'f(x) = sin(eˣ)', category: 'Composite', description: 'Sine of exponential — rapidly accelerating oscillation.', difficulty: 'intermediate' },
  { id: 'comp-esinx', name: 'e^sin(x)', expression: 'exp(sin(x))', displayExpr: 'f(x) = e^sin(x)', category: 'Composite', description: 'Exponential of sine — periodic, always positive.', difficulty: 'intermediate' },
  { id: 'comp-sqrtsin', name: '√|sin(x)|', expression: 'sqrt(abs(sin(x)))', displayExpr: 'f(x) = √|sin(x)|', category: 'Composite', description: 'Square root of |sin(x)| — cusps at multiples of π.', difficulty: 'intermediate' },
  { id: 'comp-logsin', name: 'ln|sin(x)|', expression: 'log(abs(sin(x)))', displayExpr: 'f(x) = ln|sin(x)|', category: 'Composite', description: 'Logarithm of |sin(x)| — spikes to −∞ at multiples of π.', difficulty: 'advanced' },
  { id: 'comp-sinpcos', name: 'sin(x) + cos(2x)', expression: 'sin(x) + cos(2*x)', displayExpr: 'f(x) = sin(x) + cos(2x)', category: 'Composite', description: 'Sum of harmonics — interesting waveform.', difficulty: 'intermediate' },
  { id: 'comp-x-sinx', name: 'x − sin(x)', expression: 'x - sin(x)', displayExpr: 'f(x) = x − sin(x)', category: 'Composite', description: 'Deviation of identity from sine — monotonically increasing.', difficulty: 'intermediate' },
  { id: 'comp-xex', name: 'xe^x', expression: 'x*exp(x)', displayExpr: 'f(x) = xeˣ', category: 'Composite', description: 'Product of linear and exponential — minimum at x = −1.', difficulty: 'intermediate' },
  { id: 'comp-xenx', name: 'xe⁻ˣ', expression: 'x*exp(-x)', displayExpr: 'f(x) = xe⁻ˣ', category: 'Composite', description: 'Linear × decay — has a maximum at x = 1.', difficulty: 'intermediate' },
  { id: 'comp-x2ex', name: 'x²e⁻ˣ', expression: 'x^2*exp(-x)', displayExpr: 'f(x) = x²e⁻ˣ', category: 'Composite', description: 'Quadratic × decay — a bump-like function peaking near x = 2.', difficulty: 'intermediate' },
  { id: 'comp-sinlog', name: 'sin(ln(x))', expression: 'sin(log(x))', displayExpr: 'f(x) = sin(ln(x))', category: 'Composite', description: 'Sine of logarithm — oscillation slows as x → ∞.', difficulty: 'advanced' },
  { id: 'comp-tanhinv', name: 'tanh(1/x)', expression: 'tanh(1/x)', displayExpr: 'f(x) = tanh(1/x)', category: 'Composite', description: 'Hyperbolic tangent of reciprocal — jump discontinuity at origin.', difficulty: 'advanced' },
  { id: 'comp-sqrtx2p1', name: '√(x²+1)', expression: 'sqrt(x^2+1)', displayExpr: 'f(x) = √(x²+1)', category: 'Composite', description: 'Smooth approximation of |x| — always ≥ 1.', difficulty: 'intermediate' },
  { id: 'comp-logx2p1', name: 'ln(x²+1)', expression: 'log(x^2+1)', displayExpr: 'f(x) = ln(x²+1)', category: 'Composite', description: 'Logarithm of x²+1 — symmetric, always ≥ 0.', difficulty: 'intermediate' },
  { id: 'comp-sinxex', name: 'sin(x)+e⁻ˣ', expression: 'sin(x)+exp(-x)', displayExpr: 'f(x) = sin(x) + e⁻ˣ', category: 'Composite', description: 'Oscillation with decay bias — approaches pure sine for large x.', difficulty: 'intermediate' },
  { id: 'comp-sqrtsincos', name: '√(sin²+cos²)', expression: 'sqrt((sin(x))^2 + (cos(x))^2)', displayExpr: 'f(x) = √(sin²x+cos²x)', category: 'Composite', description: 'Always equals 1 — the Pythagorean identity.', difficulty: 'beginner' },
  { id: 'comp-xsinx2', name: 'sin(x²) + cos(x)', expression: 'sin(x^2) + cos(x)', displayExpr: 'f(x) = sin(x²) + cos(x)', category: 'Composite', description: 'Combination of chirp and cosine — complex interference pattern.', difficulty: 'intermediate' },
  
  // ── IMPLICIT & CURVES ─────────────────────────────────────────────
  { id: 'imp-heart', name: 'Heart Curve', expression: '(x^2 + y^2 - 1)^3 = x^2 y^3', displayExpr: '(x² + y² - 1)³ = x²y³', category: 'Implicit & Curves', description: 'The famous cardioid algebraic heart curve — symmetric degree-6 polynomial.', isImplicit: true, difficulty: 'intermediate' },
  { id: 'imp-beating-heart', name: 'Beating Heart', expression: '(x^2 + y^2 - (1 + 0.18*sin(t)))^3 = x^2 y^3', displayExpr: '(x² + y² - (1 + 0.18sin(t)))³ = x²y³', category: 'Implicit & Curves', description: 'Animated beating heart pulsating over time t.', isImplicit: true, difficulty: 'intermediate' },
  { id: 'imp-circle', name: 'Circle (r=5)', expression: 'x^2 + y^2 = 25', displayExpr: 'x² + y² = 25', category: 'Implicit & Curves', description: 'Standard circle of radius 5 centered at origin.', isImplicit: true, difficulty: 'beginner' },
  { id: 'imp-ellipse', name: 'Ellipse', expression: 'x^2/16 + y^2/9 = 1', displayExpr: 'x²/16 + y²/9 = 1', category: 'Implicit & Curves', description: 'Ellipse with semi-major axis a=4 and semi-minor axis b=3.', isImplicit: true, difficulty: 'beginner' },
  { id: 'imp-hyperbola', name: 'Hyperbola', expression: 'x^2 - y^2 = 1', displayExpr: 'x² − y² = 1', category: 'Implicit & Curves', description: 'Unit rectangular hyperbola with asymptotic behavior.', isImplicit: true, difficulty: 'intermediate' },
  { id: 'imp-folium', name: 'Folium of Descartes', expression: 'x^3 + y^3 = 3*x*y', displayExpr: 'x³ + y³ = 3xy', category: 'Implicit & Curves', description: 'Historic mathematical loop curve proposed by René Descartes in 1638.', isImplicit: true, difficulty: 'advanced' },
  { id: 'imp-lemniscate', name: 'Lemniscate of Bernoulli', expression: '(x^2 + y^2)^2 = 4*(x^2 - y^2)', displayExpr: '(x² + y²)² = 4(x² − y²)', category: 'Implicit & Curves', description: 'Figure-eight infinity shape discovered by Jakob Bernoulli in 1694.', isImplicit: true, difficulty: 'advanced' },
  { id: 'imp-astroid', name: 'Astroid', expression: 'x^(2/3) + y^(2/3) = 1', displayExpr: 'x^(2/3) + y^(2/3) = 1', category: 'Implicit & Curves', description: 'A hypocycloid with four cusps — star-like geometric envelope.', isImplicit: true, difficulty: 'advanced' },
  { id: 'imp-devils', name: "Devil's Curve", expression: 'y^2*(y^2 - 4) = x^2*(x^2 - 5)', displayExpr: 'y²(y² − 4) = x²(x² − 5)', category: 'Implicit & Curves', description: 'Famous diabolo / hourglass shaped curve discovered by Gabriel Cramer.', isImplicit: true, difficulty: 'advanced' },
  { id: 'imp-parabola', name: 'Parabola (y²=4x)', expression: 'y^2 = 4*x', displayExpr: 'y² = 4x', category: 'Implicit & Curves', description: 'A rightward-opening parabola in standard conic form.', isImplicit: true, difficulty: 'beginner' },
  { id: 'imp-circle-unit', name: 'Unit Circle', expression: 'x^2 + y^2 = 1', displayExpr: 'x² + y² = 1', category: 'Implicit & Curves', description: 'The unit circle — radius 1, center at origin.', isImplicit: true, difficulty: 'beginner' },
  
  // ── PARAMETRIC ────────────────────────────────────────────────────
  { id: 'param-circle', name: 'Circle', expression: 'x(t) = cos(t); y(t) = sin(t)', displayExpr: 'x = cos(t), y = sin(t)', category: 'Parametric', description: 'Unit circle traced parametrically as t goes from 0 to 2π.', isParametric: true, difficulty: 'beginner' },
  { id: 'param-ellipse', name: 'Ellipse', expression: 'x(t) = 3*cos(t); y(t) = 2*sin(t)', displayExpr: 'x = 3cos(t), y = 2sin(t)', category: 'Parametric', description: 'An ellipse with semi-axes a=3 and b=2.', isParametric: true, difficulty: 'beginner' },
  { id: 'param-lissajous-12', name: 'Lissajous (1:2)', expression: 'x(t) = sin(t); y(t) = sin(2*t)', displayExpr: 'x = sin(t), y = sin(2t)', category: 'Parametric', description: 'A Lissajous figure with frequency ratio 1:2 — figure-eight pattern.', isParametric: true, difficulty: 'intermediate' },
  { id: 'param-lissajous-23', name: 'Lissajous (2:3)', expression: 'x(t) = sin(2*t); y(t) = sin(3*t)', displayExpr: 'x = sin(2t), y = sin(3t)', category: 'Parametric', description: 'A Lissajous figure with frequency ratio 2:3 — complex knot pattern.', isParametric: true, difficulty: 'intermediate' },
  { id: 'param-cycloid', name: 'Cycloid', expression: 'x(t) = t - sin(t); y(t) = 1 - cos(t)', displayExpr: 'x = t − sin(t), y = 1 − cos(t)', category: 'Parametric', description: 'Path traced by a point on a rolling circle — the "Helen of geometry".', isParametric: true, difficulty: 'intermediate' },
  { id: 'param-epicycloid', name: 'Epicycloid', expression: 'x(t) = 5*cos(t) - cos(5*t); y(t) = 5*sin(t) - sin(5*t)', displayExpr: 'x = 5cos(t)−cos(5t), y = 5sin(t)−sin(5t)', category: 'Parametric', description: 'An epicycloid — a curve traced by a circle rolling outside another circle.', isParametric: true, difficulty: 'advanced' },
  { id: 'param-hypocycloid', name: 'Hypocycloid (4 cusps)', expression: 'x(t) = 3*cos(t) + cos(3*t); y(t) = 3*sin(t) - sin(3*t)', displayExpr: 'x = 3cos(t)+cos(3t), y = 3sin(t)−sin(3t)', category: 'Parametric', description: 'An astroid — a four-cusped hypocycloid.', isParametric: true, difficulty: 'advanced' },
  { id: 'param-spiral', name: 'Spiral', expression: 'x(t) = t*cos(t); y(t) = t*sin(t)', displayExpr: 'x = t·cos(t), y = t·sin(t)', category: 'Parametric', description: 'An Archimedean spiral expanding outward.', isParametric: true, difficulty: 'intermediate' },
  { id: 'param-figure8', name: 'Figure-Eight', expression: 'x(t) = sin(t); y(t) = sin(t)*cos(t)', displayExpr: 'x = sin(t), y = sin(t)cos(t)', category: 'Parametric', description: 'A simple figure-eight (lemniscate-like) curve.', isParametric: true, difficulty: 'intermediate' },
  { id: 'param-butterfly', name: 'Butterfly Curve', expression: 'x(t) = sin(t)*(exp(cos(t))-2*cos(4*t)); y(t) = cos(t)*(exp(cos(t))-2*cos(4*t))', displayExpr: 'Butterfly (parametric)', category: 'Parametric', description: 'The Temple Fay butterfly curve — a beautiful complex shape.', isParametric: true, difficulty: 'advanced' },
  
  // ── POLAR ─────────────────────────────────────────────────────────
  { id: 'polar-circle', name: 'Circle (polar)', expression: 'r = 2', displayExpr: 'r = 2', category: 'Polar', description: 'A circle of radius 2 in polar coordinates.', isPolar: true, difficulty: 'beginner' },
  { id: 'polar-cardioid', name: 'Cardioid', expression: 'r = 1 + cos(theta)', displayExpr: 'r = 1 + cos(θ)', category: 'Polar', description: 'A heart-shaped cardioid curve — classic polar example.', isPolar: true, difficulty: 'intermediate' },
  { id: 'polar-rose3', name: 'Rose (3 petals)', expression: 'r = cos(3*theta)', displayExpr: 'r = cos(3θ)', category: 'Polar', description: 'A three-petaled rose curve.', isPolar: true, difficulty: 'intermediate' },
  { id: 'polar-rose4', name: 'Rose (4 petals)', expression: 'r = cos(2*theta)', displayExpr: 'r = cos(2θ)', category: 'Polar', description: 'A four-petaled rose curve.', isPolar: true, difficulty: 'intermediate' },
  { id: 'polar-rose5', name: 'Rose (5 petals)', expression: 'r = cos(5*theta)', displayExpr: 'r = cos(5θ)', category: 'Polar', description: 'A five-petaled rose curve.', isPolar: true, difficulty: 'intermediate' },
  { id: 'polar-spiral', name: 'Archimedes Spiral', expression: 'r = theta', displayExpr: 'r = θ', category: 'Polar', description: 'The Archimedean spiral — radius increases linearly with angle.', isPolar: true, difficulty: 'beginner' },
  { id: 'polar-log-spiral', name: 'Logarithmic Spiral', expression: 'r = exp(0.2*theta)', displayExpr: 'r = e^(0.2θ)', category: 'Polar', description: 'A logarithmic (equiangular) spiral found in nature — nautilus shells.', isPolar: true, difficulty: 'intermediate' },
  { id: 'polar-limacon', name: 'Limaçon', expression: 'r = 1 + 2*cos(theta)', displayExpr: 'r = 1 + 2cos(θ)', category: 'Polar', description: 'A limaçon with an inner loop — a generalization of the cardioid.', isPolar: true, difficulty: 'intermediate' },
  { id: 'polar-lemniscate', name: 'Lemniscate (polar)', expression: 'r = sqrt(2*cos(2*theta))', displayExpr: 'r = √(2cos(2θ))', category: 'Polar', description: 'The lemniscate of Bernoulli in polar form — figure-eight shape.', isPolar: true, difficulty: 'advanced' },
  { id: 'polar-double-cardioid', name: 'Double Cardioid', expression: 'r = 1 + cos(theta/2)', displayExpr: 'r = 1 + cos(θ/2)', category: 'Polar', description: 'A double cardioid — traced over 4π.', isPolar: true, difficulty: 'intermediate' },
  
  // ── FAMOUS CURVES ─────────────────────────────────────────────────
  { id: 'famous-catenary', name: 'Catenary', expression: 'cosh(x)', displayExpr: 'f(x) = cosh(x)', category: 'Famous Curves', description: 'The catenary — shape of a hanging chain under gravity. Used in architecture (e.g., Gateway Arch).', difficulty: 'intermediate' },
  { id: 'famous-tractrix', name: 'Tractrix (approx)', expression: '1/cosh(x)', displayExpr: 'f(x) = sech(x)', category: 'Famous Curves', description: 'The sech curve — approximates the profile of a tractrix, used in pseudosphere geometry.', difficulty: 'advanced' },
  { id: 'famous-versiera', name: 'Versiera (Witch)', expression: '1/(1+x^2)', displayExpr: 'f(x) = 1/(1+x²)', category: 'Famous Curves', description: 'The Witch of Agnesi — named after Maria Gaetana Agnesi (1748), important in probability.', difficulty: 'intermediate' },
  { id: 'famous-gaussian-bell', name: 'Normal Distribution', expression: 'exp(-x^2/2)/sqrt(2*pi)', displayExpr: 'f(x) = φ(x)', category: 'Famous Curves', description: 'The standard normal PDF — the bell curve central to statistics.', difficulty: 'intermediate' },
  { id: 'famous-logistic', name: 'Logistic Growth', expression: '10/(1+9*exp(-x))', displayExpr: 'f(x) = 10/(1+9e⁻ˣ)', category: 'Famous Curves', description: 'The logistic curve — models population growth with carrying capacity K=10.', difficulty: 'intermediate' },
  { id: 'famous-heart-explicit', name: 'Heart (explicit)', expression: 'sqrt(1-x^2) + cbrt(x^2)', displayExpr: 'f(x) = √(1−x²) + ∛(x²)', category: 'Famous Curves', description: 'An explicit heart-like curve — approximates the upper half of a heart shape.', difficulty: 'intermediate' },
  { id: 'famous-gamma-approx', name: 'Gamma-like', expression: 'x^2*exp(-x)', displayExpr: 'f(x) = x²e⁻ˣ', category: 'Famous Curves', description: 'Resembles the Gamma distribution (shape=3, rate=1) — a right-skewed bump.', difficulty: 'intermediate' },
  { id: 'famous-dirichlet', name: 'Dirichlet Kernel (3)', expression: 'sin(3.5*x)/sin(x/2)', displayExpr: 'f(x) = sin(3.5x)/sin(x/2)', category: 'Famous Curves', description: 'The Dirichlet kernel for N=3 — important in Fourier analysis.', difficulty: 'advanced' },
  { id: 'famous-fermi', name: 'Fermi-Dirac', expression: '1/(exp(x)+1)', displayExpr: 'f(x) = 1/(eˣ+1)', category: 'Famous Curves', description: 'The Fermi-Dirac distribution — describes electron energy levels in quantum mechanics.', difficulty: 'advanced' },
  { id: 'famous-planck-like', name: 'Planck-like', expression: 'x^3/(exp(x)-1)', displayExpr: 'f(x) = x³/(eˣ−1)', category: 'Famous Curves', description: 'Resembles Planck\'s black-body radiation law — peaks then decays.', difficulty: 'advanced' },

  // ── NEW ADVANCED & EDUCATIONAL ADDITIONS ───────────────────────────
  // Algebraic additions
  { id: 'alg-odd-quadratic', name: 'x·|x|', expression: 'x * abs(x)', displayExpr: 'f(x) = x·|x|', category: 'Algebraic', description: 'Odd parity quadratic — continuously differentiable everywhere including x = 0.', difficulty: 'intermediate' },
  { id: 'alg-triangular-dome', name: 'Dome √(1−|x|)', expression: 'sqrt(max(0, 1 - abs(x)))', displayExpr: 'f(x) = √(1 − |x|)', category: 'Algebraic', description: 'Triangular dome curve with peak at (0, 1) and compact support on [−1, 1].', difficulty: 'intermediate' },

  // Polynomial additions
  { id: 'poly-w-potential', name: 'Double-Well (x⁴ − 2x²)', expression: 'x^4 - 2*x^2', displayExpr: 'f(x) = x⁴ − 2x²', category: 'Polynomial', description: 'Classic double-well potential with local maximum at 0 and symmetric minima at ±1.', difficulty: 'intermediate' },
  { id: 'poly-quintic-roots', name: 'Quintic x(x²−1)(x²−4)', expression: 'x^5 - 5*x^3 + 4*x', displayExpr: 'f(x) = x⁵ − 5x³ + 4x', category: 'Polynomial', description: 'Degree 5 polynomial with 5 distinct real roots at x = −2, −1, 0, 1, 2.', difficulty: 'advanced' },

  // Exponential additions
  { id: 'exp-poisson-peak', name: 'Peak x·e⁻ˣ', expression: 'x * exp(-x)', displayExpr: 'f(x) = x·e⁻ˣ', category: 'Exponential', description: 'Classic Poisson-type curve with global maximum at x = 1 and asymptote y = 0.', difficulty: 'intermediate' },
  { id: 'exp-laplace', name: 'Laplace e⁻|ˣ|', expression: 'exp(-abs(x))', displayExpr: 'f(x) = e⁻|ˣ|', category: 'Exponential', description: 'Double exponential / Laplace distribution curve with sharp apex at (0, 1).', difficulty: 'intermediate' },

  // Logarithmic additions
  { id: 'log-entropy', name: 'x·ln(x)', expression: 'x * log(x)', displayExpr: 'f(x) = x·ln(x)', category: 'Logarithmic', description: 'Information entropy curve with minimum at x = 1/e and limit 0 as x → 0⁺.', difficulty: 'intermediate' },
  { id: 'log-bilateral', name: 'ln(|x|)', expression: 'log(abs(x))', displayExpr: 'f(x) = ln(|x|)', category: 'Logarithmic', description: 'Even symmetric natural logarithm with vertical asymptote at x = 0.', difficulty: 'beginner' },

  // Trigonometric additions
  { id: 'trig-harmonic-mix', name: 'sin(2x)·cos(x)', expression: 'sin(2*x) * cos(x)', displayExpr: 'f(x) = sin(2x)·cos(x)', category: 'Trigonometric', description: 'Modulated harmonic wave product equivalent to (sin(3x) + sin(x))/2.', difficulty: 'intermediate' },
  { id: 'trig-cos-cubed', name: 'cos³(x)', expression: 'cos(x)^3', displayExpr: 'f(x) = cos³(x)', category: 'Trigonometric', description: 'Triple angle harmonic curve with period 2π and flattened peaks.', difficulty: 'intermediate' },

  // Inverse Trigonometric additions
  { id: 'inv-atan-reciprocal', name: 'arctan(1/x)', expression: 'atan(1/x)', displayExpr: 'f(x) = arctan(1/x)', category: 'Inverse Trigonometric', description: 'Classic step-like curve with jump discontinuity at x = 0 between π/2 and −π/2.', difficulty: 'advanced' },
  { id: 'inv-asin-rational', name: 'arcsin(2x/(1+x²))', expression: 'asin(2*x / (1 + x^2))', displayExpr: 'f(x) = arcsin(2x/(1+x²))', category: 'Inverse Trigonometric', description: 'Important JEE calculus identity equal to 2·arctan(x) on [−1, 1].', difficulty: 'advanced' },

  // Hyperbolic additions
  { id: 'hyp-tanh-sharp', name: 'tanh(2x)', expression: 'tanh(2*x)', displayExpr: 'f(x) = tanh(2x)', category: 'Hyperbolic', description: 'Steep hyperbolic tangent sigmoid with horizontal asymptotes at y = ±1.', difficulty: 'intermediate' },
  { id: 'hyp-convex-sinh', name: 'x·sinh(x)', expression: 'x * sinh(x)', displayExpr: 'f(x) = x·sinh(x)', category: 'Hyperbolic', description: 'U-shaped even convex growth curve with global minimum at (0, 0).', difficulty: 'advanced' },

  // Rational additions
  { id: 'rat-normalized-sat', name: '(x²−1)/(x²+1)', expression: '(x^2 - 1) / (x^2 + 1)', displayExpr: 'f(x) = (x²−1)/(x²+1)', category: 'Rational', description: 'Normalized rational saturation curve with minimum at (0, −1) and asymptote y = 1.', difficulty: 'intermediate' },
  { id: 'rat-dual-asymptote', name: 'x / (x²−4)', expression: 'x / (x^2 - 4)', displayExpr: 'f(x) = x/(x²−4)', category: 'Rational', description: 'Odd rational function with two vertical asymptotes at x = −2 and x = 2.', difficulty: 'intermediate' },

  // Special additions
  { id: 'spec-cardinal-sinc', name: 'Normalized sinc(πx)', expression: 'sin(pi*x) / (pi*x)', displayExpr: 'f(x) = sinc(πx)', category: 'Special', description: 'Whittaker-Shannon cardinal sine filter — zeros at all non-zero integers.', difficulty: 'advanced' },
  { id: 'spec-airy-approx', name: 'Airy-like Wave', expression: 'sin(x^3/3) / sqrt(abs(x)+0.5)', displayExpr: 'f(x) ≈ Ai(x)', category: 'Special', description: 'Approximates optical diffraction pattern of light near a caustic.', difficulty: 'advanced' },

  // Oscillatory additions
  { id: 'osc-modulated-decay', name: 'Damped Wave e⁻⁰·¹ˣsin(3x)', expression: 'exp(-0.1*x) * sin(3*x)', displayExpr: 'f(x) = e⁻⁰·¹ˣ·sin(3x)', category: 'Oscillatory', description: 'Underdamped harmonic motion representing RLC circuits and mechanical suspension.', difficulty: 'intermediate' },
  { id: 'osc-interfering-waves', name: 'Wave Interference', expression: 'sin(x) + sin(1.2*x)', displayExpr: 'f(x) = sin(x) + sin(1.2x)', category: 'Oscillatory', description: 'Superposition of two nearby frequencies generating acoustic beat envelopes.', difficulty: 'intermediate' },

  // Parametric additions
  { id: 'param-deltoid', name: 'Deltoid (Tricuspoid)', expression: 'x = 2*cos(t) + cos(2*t), y = 2*sin(t) - sin(2*t)', displayExpr: 'x = 2cos(t)+cos(2t), y = 2sin(t)−sin(2t)', category: 'Parametric', description: 'Hypocycloid with three symmetric cusps formed by a rolling circle.', difficulty: 'advanced' },
  { id: 'param-lissajous-32', name: 'Lissajous (3:2)', expression: 'x = sin(2*t), y = sin(3*t)', displayExpr: 'x = sin(2t), y = sin(3t)', category: 'Parametric', description: 'Harmonic motion figure with 3:2 frequency ratio forming a self-intersecting knot.', difficulty: 'advanced' },

  // Polar additions
  { id: 'polar-rose-8', name: '8-Petal Rose', expression: 'r = 2 * sin(4*theta)', displayExpr: 'r = 2sin(4θ)', category: 'Polar', description: 'Rhodonea rose curve with 8 symmetric petals.', difficulty: 'intermediate' },
  { id: 'polar-lituus', name: 'Lituus Spiral', expression: 'r = 2 / sqrt(theta + 0.1)', displayExpr: 'r = 2/√(θ+0.1)', category: 'Polar', description: 'Historic spiral introduced by Roger Cotes where r²θ = k.', difficulty: 'advanced' },

  // Famous Curves additions
  { id: 'famous-kampyle', name: 'Kampyle of Eudoxus', expression: 'y^2 = x^4 - 4*x^2', displayExpr: 'y² = x⁴ − 4x²', category: 'Famous Curves', description: 'Classical Greek curve studied by Eudoxus in connection with the duplication of the cube.', isImplicit: true, difficulty: 'advanced' },
  { id: 'famous-amphora', name: 'Cassini Oval (approx)', expression: '(x^2 + y^2)^2 - 2*(x^2 - y^2) = 0.5', displayExpr: '(x² + y²)² − 2(x² − y²) = 0.5', category: 'Famous Curves', description: 'Cassini oval curve with peanut / dumbbell contour studied in celestial mechanics.', isImplicit: true, difficulty: 'advanced' },
];

export function searchFunctions(query: string): LibraryFunction[] {
  const q = query.toLowerCase().trim();
  if (!q) return FUNCTION_LIBRARY;
  return FUNCTION_LIBRARY.filter(fn =>
    fn.name.toLowerCase().includes(q) ||
    fn.expression.toLowerCase().includes(q) ||
    fn.displayExpr.toLowerCase().includes(q) ||
    fn.category.toLowerCase().includes(q) ||
    fn.description.toLowerCase().includes(q) ||
    (fn.difficulty && fn.difficulty.includes(q))
  );
}

export function filterByCategory(category: string): LibraryFunction[] {
  if (!category || category === 'All') return FUNCTION_LIBRARY;
  return FUNCTION_LIBRARY.filter(fn => fn.category === category);
}
