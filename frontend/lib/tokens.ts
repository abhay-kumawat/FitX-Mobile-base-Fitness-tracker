export const spacingTokens = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
  '4xl': '48px',
  '5xl': '64px',
} as const;

export const radiusTokens = {
  none: '0px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '28px',
  '3xl': '32px',
  full: '9999px',
} as const;

export const typographyTokens = {
  displayXL: { fontSize: '32px', lineHeight: '36px', fontWeight: '900', letterSpacing: '-0.02em' },
  display: { fontSize: '24px', lineHeight: '28px', fontWeight: '800', letterSpacing: '-0.01em' },
  heading: { fontSize: '18px', lineHeight: '22px', fontWeight: '800', letterSpacing: '0em' },
  title: { fontSize: '15px', lineHeight: '20px', fontWeight: '700', letterSpacing: '0em' },
  body: { fontSize: '13px', lineHeight: '18px', fontWeight: '500', letterSpacing: '0em' },
  caption: { fontSize: '11px', lineHeight: '14px', fontWeight: '600', letterSpacing: '0.05em' },
  badgeMono: { fontSize: '10px', lineHeight: '12px', fontWeight: '900', fontFamily: 'JetBrains Mono, monospace' },
} as const;

export const elevationTokens = {
  level1: '0 4px 12px -2px rgba(0, 0, 0, 0.2)',
  level2: '0 12px 32px -8px rgba(0, 0, 0, 0.4)',
  level3: '0 20px 40px -15px rgba(88, 204, 2, 0.3)',
  duo3D: '0 5px 0 #46A302',
  duoGold: '0 5px 0 #E5B200',
  duoBlue: '0 5px 0 #1899D6',
} as const;

export const motionTokens = {
  durationInstant: '100ms',
  durationFast: '200ms',
  durationNormal: '350ms',
  durationSlow: '500ms',
  springPhysics: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smoothReveal: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const mascotMotionVariants = {
  idle: {
    y: [0, -8, 0],
    rotate: [0, 1.5, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
  tapBounce: {
    scale: [1, 1.15, 0.95, 1],
    transition: { duration: 0.35, ease: "backOut" },
  },
  cheerJump: {
    y: [0, -20, 0],
    scale: [1, 1.1, 1],
    transition: { duration: 0.5, repeat: 2, ease: "easeOut" },
  },
};
