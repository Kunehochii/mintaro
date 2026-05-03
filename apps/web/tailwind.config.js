// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        vapor: {
          pink: 'var(--vapor-pink)',
          cyan: 'var(--vapor-cyan)',
          mint: 'var(--vapor-mint)',
          purple: 'var(--vapor-purple)',
          gold: 'var(--vapor-gold)',
          bg: 'var(--vapor-bg)',
          surface: 'var(--vapor-surface)',
          text: 'var(--vapor-text)',
          muted: 'var(--vapor-muted)',
        },
      },
      fontFamily: {
        display: ['var(--font-orbitron)', 'sans-serif'],
        body: ['var(--font-exo2)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        'glow-pink': '0 0 12px #FF71CE, 0 0 24px #FF71CE40',
        'glow-cyan': '0 0 12px #01CDFE, 0 0 24px #01CDFE40',
        'glow-purple': '0 0 12px #B967FF, 0 0 24px #B967FF40',
        'glow-gold': '0 0 12px #FBBF24, 0 0 24px #FBBF2440',
        'glow-mint': '0 0 12px #05FFA1, 0 0 24px #05FFA140',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      backgroundImage: {
        sunset:
          'linear-gradient(180deg, #FF71CE 0%, #B967FF 50%, #01CDFE 100%)',
        'retro-grid':
          'linear-gradient(rgba(255,113,206,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(1,205,254,0.15) 1px, transparent 1px)',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': {
            transform: 'translate(-2px, 2px)',
            filter: 'hue-rotate(90deg)',
          },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': {
            transform: 'translate(-1px, 1px)',
            filter: 'hue-rotate(-90deg)',
          },
          '80%': { transform: 'translate(1px, -1px)' },
          '100%': { transform: 'translate(0)' },
        },
        'gradient-cycle': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        glitch: 'glitch 400ms steps(1) infinite',
        'gradient-cycle': 'gradient-cycle 3s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
