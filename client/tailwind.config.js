// Extends Tailwind's default theme rather than replacing it, so every
// core utility (transparent, current, inherit, black, white, and the
// full default color/spacing/shadow scale) stays available. The Phase 1
// design tokens are layered on top as named additions, sourced from
// the CSS variables in src/styles/tokens.css - that file remains the
// single source of truth for the actual values.
//
// This does not, by itself, stop a component from reaching for an
// off-token utility (e.g. `bg-blue-500`) - Tailwind's defaults are
// still technically present, per this project's explicit instruction
// to preserve them. Visual consistency with Phase 1 is enforced by
// convention instead: every page is required (Phase 2) to build from
// the shared primitives in src/components/ui/, which are themselves
// built only from the tokens below - so off-token values simply never
// appear in a page unless someone bypasses the shared components.
//
// Spacing is left untouched: Tailwind's default scale
// (1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 12=48px, 16=64px, 24=96px)
// already matches the Phase 1 spacing scale exactly.

// Colors are CSS variables (tokens.css), which Tailwind cannot apply an
// opacity modifier to on its own - utilities like border-navy/10 or
// hover:bg-sky/90 were silently not generated. This helper keeps the
// variable as the single source of truth and builds the modifier with
// color-mix, so `/NN` works without changing any token value.
const withAlpha = (variable) => ({ opacityValue }) => {
  if (opacityValue === undefined) return `var(${variable})`;
  // Tailwind passes either a number (e.g. 0.1 for /10) or a CSS
  // variable reference (e.g. var(--tw-bg-opacity)) for plain utilities.
  const percent = Number.isNaN(Number(opacityValue))
    ? `calc(${opacityValue} * 100%)`
    : `${Math.round(Number(opacityValue) * 100)}%`;
  return `color-mix(in srgb, var(${variable}) ${percent}, transparent)`;
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sky: {
          DEFAULT: withAlpha('--color-sky'),
          ink: withAlpha('--color-sky-ink'),
          mist: withAlpha('--color-sky-tint'),
        },
        navy: withAlpha('--color-navy'),
        'gray-light': withAlpha('--color-gray-light'),
        'gray-dark': withAlpha('--color-gray-dark'),

        // Department accents - reserved for badges/cards/results only,
        // per the Phase 1 rule. Nothing structural should reference these.
        dte: {
          DEFAULT: withAlpha('--color-dte'),
          tint: withAlpha('--color-dte-tint'),
          text: withAlpha('--color-dte-text'),
        },
        dci: {
          DEFAULT: withAlpha('--color-dci'),
          tint: withAlpha('--color-dci-tint'),
          text: withAlpha('--color-dci-text'),
        },
        dba: {
          DEFAULT: withAlpha('--color-dba'),
          tint: withAlpha('--color-dba-tint'),
          text: withAlpha('--color-dba-text'),
        },
        das: {
          DEFAULT: withAlpha('--color-das'),
          tint: withAlpha('--color-das-tint'),
          text: withAlpha('--color-das-text'),
        },
      },

      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      // Named sizes matching the Phase 1 type scale exactly. Tailwind's
      // default text-sm/base/lg/etc. remain available but unused by
      // convention - these named tokens are what components use.
      fontSize: {
        'display-1': ['44px', '52px'],
        'display-2': ['34px', '42px'],
        h1: ['28px', '36px'],
        h2: ['22px', '30px'],
        h3: ['18px', '26px'],
        body: ['16px', '26px'],
        small: ['14px', '22px'],
        caption: ['13px', '18px'],
      },

      // Only sm/md/lg are redefined to the Phase 1 values; other default
      // radius keys (none, xl, 2xl, 3xl, full) are left as Tailwind
      // defaults since Phase 1 doesn't define them.
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },

      // New, non-colliding keys - Tailwind's default shadow-sm/md/lg/xl
      // scale is left untouched.
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
      },

      // Soft gradients for the redesigned look - built only from the
      // existing Phase 1 palette variables (no new colors).
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-sky-ink) 100%)',
        'soft-gradient': 'linear-gradient(180deg, var(--color-sky-tint) 0%, var(--color-gray-light) 100%)',
        'progress-gradient': 'linear-gradient(90deg, var(--color-sky) 0%, var(--color-navy) 100%)',
      },

      transitionDuration: {
        150: '150ms',
        200: '200ms',
      },

      // Phase 1 §5: 200ms fade + 8px slide is the standard flow-step
      // transition. Toast reuses that exact motion for its entrance
      // rather than inventing a separate animation feel.
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'toast-in': 'toast-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};
