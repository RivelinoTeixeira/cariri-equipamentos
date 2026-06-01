/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nexus: {
          // tematicas (CSS vars RGB - mudam com .dark / :root)
          // Formato rgb(var() / <alpha-value>) faz os modificadores
          // de opacidade do Tailwind (bg-nexus-bg/80) funcionarem.
          bg: 'rgb(var(--nexus-bg) / <alpha-value>)',
          surface: 'rgb(var(--nexus-surface) / <alpha-value>)',
          card: 'rgb(var(--nexus-card) / <alpha-value>)',
          border: 'rgb(var(--nexus-border) / <alpha-value>)',
          text: 'rgb(var(--nexus-text) / <alpha-value>)',
          muted: 'rgb(var(--nexus-muted) / <alpha-value>)',
          // brand (fixas em ambos os temas)
          purple: '#A855F7',
          'purple-deep': '#7C3AED',
          cyan: '#22D3EE',
          'cyan-neon': '#06B6D4',
          success: '#22C55E',
          danger: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 30px rgba(168, 85, 247, 0.35)',
        'glow-cyan': '0 0 30px rgba(34, 211, 238, 0.35)'
      },
      backgroundImage: {
        'grad-nexus': 'linear-gradient(135deg, #A855F7 0%, #22D3EE 100%)',
        'grad-card': 'linear-gradient(160deg, rgba(168,85,247,0.10) 0%, rgba(34,211,238,0.06) 100%)'
      },
      backdropBlur: {
        xs: '2px'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
