import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Design system tokens (hex, light vivid theme) ──
        bg:     '#f4f6ff',
        card:   '#ffffff',
        border: '#e4e7f8',
        text:   '#1a1c2e',
        muted:  '#6b7280',
        subtle: '#9ca3af',
        primary: {
          DEFAULT: '#6366f1',
          hover:   '#4f52d4',
          light:   'rgba(99,102,241,0.08)',
          border:  'rgba(99,102,241,0.2)',
          foreground: '#ffffff',
        },
        crm: {
          green:       '#16a34a',
          'green-light': 'rgba(22,163,74,0.08)',
          amber:       '#d97706',
          'amber-light': 'rgba(217,119,6,0.08)',
          red:         '#dc2626',
          'red-light':   'rgba(220,38,38,0.07)',
          blue:        '#2563eb',
          'blue-light':  'rgba(37,99,235,0.08)',
          violet:      '#7c3aed',
          'violet-light':'rgba(124,58,237,0.08)',
          pink:        '#db2777',
          'pink-light':  'rgba(219,39,119,0.08)',
        },
        // ── HSL-based tokens (kept for backwards compat) ──
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring:  'hsl(var(--ring))',
      },
      borderRadius: {
        card: '14px',
        btn:  '9px',
        pill: '20px',
        // legacy
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card:    '0 1px 4px rgba(99,102,241,0.06)',
        primary: '0 2px 8px rgba(99,102,241,0.55)',
        modal:   '0 24px 64px rgba(99,102,241,0.18), 0 4px 24px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
