import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-urbanist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Semantic design tokens (consumed via CSS variables in globals.css)
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        'muted-foreground': 'hsl(var(--muted-foreground) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        primary: 'hsl(var(--primary) / <alpha-value>)',
        'primary-foreground': 'hsl(var(--primary-foreground) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        'accent-foreground': 'hsl(var(--accent-foreground) / <alpha-value>)',

        // Chronic-care domain tokens (mirrors spec: risk red / amber / green)
        risk: {
          high: '#EF4444',
          moderate: '#F59E0B',
          low: '#10B981',
        },
      },
      borderRadius: {
        // Spec uses --radius for corner rounding
        DEFAULT: 'calc(var(--radius))',
        sm: 'calc(var(--radius) - 4px)',
        lg: 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        // Spec: 0 8px 32px rgba(15, 165, 233, 0.1)
        glass: '0 8px 32px rgba(15, 165, 233, 0.10)',
        'glass-lg': '0 16px 48px rgba(15, 165, 233, 0.14)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-top-2': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-in-from-top-2': 'slide-in-from-top-2 240ms ease-out',
        'slide-in-from-left': 'slide-in-from-left 480ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
export default config
