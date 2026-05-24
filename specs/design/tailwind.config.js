/** Kikar — Tailwind theme.extend. Drop into tailwind.config.js.
 *
 * Generated from tokens.json. Works with Tailwind v3.3+ (logical properties
 * `ms-/me-/ps-/pe-/start-/end-` are core, no plugin needed).
 *
 * Companion files:
 *   tokens.json    — canonical source
 *   tokens.css     — CSS custom properties
 *   components.md  — component API
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,html}',
    './src/**/*.{ts,tsx,js,jsx,html}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg:        '#F8F5EE',
        'bg-2':    '#F2EAD8',
        paper:     '#FFFFFF',
        line:      '#EDE5D2',
        'line-2':  '#DCD0B4',

        // Ink (text)
        ink:       { DEFAULT: '#1F1A14', 2: '#6E6457', 3: '#A6997F' },

        // Accent (clay)
        accent:    { DEFAULT: '#E66B3D', 2: '#F2BC8E', bg: '#FCE7D4' },

        // Sage (secondary / success)
        sage:      { DEFAULT: '#BFC7A0', 2: '#8C9963', bg: '#ECEFDC' },

        // Status
        warn:      { DEFAULT: '#D38D1B', bg: '#FBEFD0' },
        danger:    { DEFAULT: '#A14525', bg: '#F8D8CE' },
      },

      fontFamily: {
        ui:      ['Rubik', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Rubik', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        // [size, { lineHeight, letterSpacing, fontWeight }]
        'display-lg': ['36px', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-md': ['28px', { lineHeight: '1.1',  letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-sm': ['22px', { lineHeight: '1.15', letterSpacing: '-0.02em',  fontWeight: '600' }],
        heading:      ['17px', { lineHeight: '1.3',  letterSpacing: '-0.015em', fontWeight: '700' }],
        'body-lg':    ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        body:         ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        label:        ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        small:        ['12px', { lineHeight: '1.45', fontWeight: '500' }],
        tiny:         ['11px', { lineHeight: '1.4',  fontWeight: '500' }],
        eyebrow:      ['11px', { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '600' }],
      },

      spacing: {
        1:  '4px',  2: '8px',   3:  '12px', 4:  '16px',
        5:  '20px', 6: '24px',  8:  '32px', 10: '40px',
        12: '48px', 16: '64px', 20: '80px',
      },

      borderRadius: {
        xs:    '6px',
        sm:   '10px',
        DEFAULT: '14px',
        md:   '14px',
        lg:   '18px',
        xl:   '22px',
        '2xl':'24px',
        '3xl':'28px',
      },

      boxShadow: {
        sm:    '0 1px 0 rgba(31,26,20,.04), 0 4px 12px rgba(31,26,20,.04)',
        DEFAULT: '0 1px 0 rgba(31,26,20,.04), 0 6px 24px rgba(31,26,20,.06)',
        lg:    '0 1px 0 rgba(31,26,20,.04), 0 16px 40px rgba(31,26,20,.10)',
        cta:   '0 1px 0 rgba(0,0,0,.06), 0 10px 24px rgba(230,107,61,.32)',
        sheet: '0 -10px 40px rgba(0,0,0,.18)',
      },

      transitionDuration: {
        fast:  '120ms',
        base:  '200ms',
        slow:  '300ms',
        delib: '450ms',
      },
      transitionTimingFunction: {
        out:    'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out':'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      zIndex: {
        sticky:  '10',
        sheet:   '50',
        toast:   '100',
        overlay: '200',
      },

      minHeight: {
        touch: '44px',  // a11y target floor
        cta:   '56px',  // standard CTA
      },

      // RTL-friendly aliases — you can use these directly e.g. `me-4` or `ps-6`.
      // (Tailwind v3.3+ has logical property utilities out of the box, this is
      //  just to give them friendlier names in your codebase if you want.)
    },
  },
  plugins: [
    // Recommend: @tailwindcss/forms for sane base styles on inputs.
    // require('@tailwindcss/forms'),
  ],
};
