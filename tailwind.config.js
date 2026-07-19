/** @type {import('tailwindcss').Config} */
// PALETTE "LIGHT CALDO" — redesign 2026.
// I NOMI dei token restano invariati (sx-dark, sx-light, sx-cyan...) per non
// dover riscrivere le classi in 17 pagine, ma i VALORI sono rimappati verso
// un sistema chiaro e caldo ("studio di consulenza", non "terminale AI").
// Nota: alcuni nomi ora sono semanticamente ribaltati (sx-dark = sfondo chiaro).
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        sx: {
          dark: '#faf7f2',    // sfondo base (crema caldo)  [ex nero]
          deeper: '#f2ebe0',  // sezioni alternate (crema più profondo)
          card: '#ffffff',    // superfici card (bianco)
          border: '#e6ddcf',  // bordi caldi chiari
          cyan: '#2e6b73',    // accento secondario (teal profondo, non neon)
          purple: '#b5771f',  // accento primario (oro ricco) — AA su chiaro
          blue: '#4a6b85',    // slate muted (usi decorativi)
          pink: '#b85539',    // terracotta (accento caldo, AA body)
          muted: '#6b6355',   // testo secondario (grigio caldo, AA su crema)
          light: '#1c1a26',   // testo primario (quasi nero caldo)  [ex crema]
        },
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'sans-serif'],
        display: ['Bricolage Grotesque', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'orbit': 'orbit 15s linear infinite',
        'orbit-reverse': 'orbitReverse 12s linear infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'fade-up-delay': 'fadeUp 0.8s ease-out 0.2s forwards',
        'fade-up-delay2': 'fadeUp 0.8s ease-out 0.4s forwards',
        'blink': 'blink 0.7s step-end infinite',
      },
    },
  },
  plugins: [],
}
