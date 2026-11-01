/**
 * Design tokens for the whole app: a "dawn over the church" palette
 * (deep night blue -> violet -> sunrise orange) with warm gold accents.
 */
export const colors = {
  night: '#0B1033',
  indigo: '#1E1B5E',
  violet: '#2B1B6B',
  royal: '#4B2A8C',
  plum: '#8E3E97',
  dawn: '#F2762E',
  amber: '#FFB347',
  gold: '#FFD369',
  coral: '#F25C54',

  ink: '#16163A',
  slate: '#5B5F82',
  placeholder: '#9A9DBB',
  mist: '#F1F2FA',
  line: '#E1E3F0',
  white: '#FFFFFF',

  danger: '#D93A4B',
  dangerBg: '#FDECEF',
  success: '#1F9D6B',
} as const;

export const gradients = {
  /** The sky behind the church on the login hero. */
  sky: ['#0B1033', '#2B1B6B', '#8E3E97', '#F2762E'] as const,
  /** Main call-to-action button. */
  cta: ['#FFB347', '#F25C54'] as const,
  /** Header on the signed-in screens. */
  header: ['#0B1033', '#2B1B6B', '#4B2A8C'] as const,
} as const;

/** Font family names registered in app/_layout.tsx. */
export const fonts = {
  heading: 'PlayfairDisplay_700Bold',
  headingSemi: 'PlayfairDisplay_600SemiBold',
  body: 'Poppins_400Regular',
  bodyMedium: 'Poppins_500Medium',
  bodySemi: 'Poppins_600SemiBold',
  bodyBold: 'Poppins_700Bold',
} as const;
