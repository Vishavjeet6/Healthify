import { Platform, useColorScheme } from 'react-native';

/**
 * Design tokens. See IMPLEMENTATION_PLAN.md "Design system".
 * Dark-first: this app is opened at night, in private. Dark is the
 * default ground; light exists but is not the design center of gravity.
 */

export type ThemeTokens = {
  ground: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentOn: string;
  caution: string;
  cautionOn: string;
  /** Reserved exclusively for the red-flag check screen. */
  alert: string;
  alertOn: string;
};

const dark: ThemeTokens = {
  ground: '#0F1513',
  surface: '#161E1C',
  surfaceRaised: '#1C2624',
  border: '#28322F',
  textPrimary: '#EAF1EE',
  textSecondary: '#9FB0AB',
  textTertiary: '#6C7C77',
  accent: '#5FC3B4',
  accentOn: '#052420',
  caution: '#D8A64E',
  cautionOn: '#231701',
  alert: '#C97B68',
  alertOn: '#210A04',
};

const light: ThemeTokens = {
  ground: '#F4F6F4',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  border: '#DCE3DF',
  textPrimary: '#131A18',
  textSecondary: '#4B5C57',
  textTertiary: '#7C8B86',
  accent: '#0E6E5F',
  accentOn: '#F4FFFC',
  caution: '#8A5B0E',
  cautionOn: '#FFF7E8',
  alert: '#9A3F2C',
  alertOn: '#FFF3EF',
};

/**
 * Warm onboarding-only alternate treatment (redesign option 1b). Not a
 * light/dark mode — a deliberate stylistic direction offered alongside
 * the default ("cool") onboarding, selected by `useOnboardingVariant`,
 * not by system color scheme. Kept out of `themes` so it never leaks
 * into `useTheme()` / the rest of the app.
 */
const warm: ThemeTokens = {
  ground: '#12100D',
  surface: '#1A1713',
  surfaceRaised: '#221E17',
  border: '#2C2620',
  textPrimary: '#F0EDE6',
  textSecondary: '#B5AEA1',
  textTertiary: '#8C8578',
  accent: '#D8A64E',
  accentOn: '#241705',
  caution: '#D8A64E',
  cautionOn: '#241705',
  alert: '#C97B68',
  alertOn: '#210A04',
};

export const themes = { dark, light };
export const onboardingPalettes = { cool: dark, warm };

export function useTheme(): ThemeTokens {
  const scheme = useColorScheme();
  return scheme === 'light' ? light : dark;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const type = {
  displayLg: { fontFamily: 'Newsreader_500Medium', fontSize: 32, lineHeight: 38 },
  displayMd: { fontFamily: 'Newsreader_500Medium', fontSize: 24, lineHeight: 30 },
  title: { fontFamily: 'Newsreader_600SemiBold', fontSize: 20, lineHeight: 26 },
  body: { fontFamily: 'System', fontSize: 16, lineHeight: 23 },
  bodySmall: { fontFamily: 'System', fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: 'System', fontSize: 12, lineHeight: 16 },
  numeral: { fontFamily: 'Newsreader_500Medium', fontVariant: ['tabular-nums'] as const },
  /** Uppercase eyebrow / stat-label / step-counter captions (WEEK 1 · DAY 3, SETS DONE…). */
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    letterSpacing: 0.7,
  },
} as const;
