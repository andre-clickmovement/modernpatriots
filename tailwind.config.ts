import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: 'var(--navy)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        'paper-3': 'var(--paper-3)',
        rule: 'var(--rule)',
        'rule-strong': 'var(--rule-strong)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        head: ['var(--font-head)'],
        sub: ['var(--font-sub)'],
        body: ['var(--font-body)'],
        ui: ['var(--font-ui)'],
      },
      maxWidth: {
        crg: '1180px',
      },
    },
  },
  plugins: [],
}

export default config
