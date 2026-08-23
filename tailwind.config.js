/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#F3F6F4',
        surface: '#FFFFFF',
        'surface-raised': '#F7F9F8',
        border: '#DCE4DF',
        foreground: '#111713',
        muted: '#68736C',
        success: '#10B981',
        'success-dark': '#D9F7EA',
        xp: '#6366F1',
      },
      fontFamily: {
        body: ['HankenGrotesk_400Regular'],
        headline: ['HankenGrotesk_700Bold'],
        label: ['JetBrainsMono_500Medium'],
      },
    },
  },
  plugins: [],
};
