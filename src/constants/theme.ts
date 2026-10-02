import '@/global.css';

import { Platform } from 'react-native';

/**
 * Kullanıcının seçebileceği ana renkler. Akbank'ın kırmızısı yerine
 * varsayılan olarak zümrüt yeşili kullanılıyor.
 */
export const Accents = {
  zumrut: { name: 'Zümrüt', primary: '#0E7C66', deep: '#08594A', soft: '#D7F0E8', softDark: '#123B33' },
  lacivert: { name: 'Lacivert', primary: '#2D4BB3', deep: '#1D3282', soft: '#DDE4FA', softDark: '#1C2647' },
  mor: { name: 'Mor', primary: '#6E43B0', deep: '#4E2D84', soft: '#EADFF8', softDark: '#2C2142' },
  turuncu: { name: 'Turuncu', primary: '#D4651C', deep: '#A34A10', soft: '#FBE6D6', softDark: '#3D2617' },
  okyanus: { name: 'Okyanus', primary: '#0A7EA8', deep: '#075C7B', soft: '#D6EEF7', softDark: '#13323F' },
} as const;

export type AccentKey = keyof typeof Accents;

const Base = {
  light: {
    background: '#F3F5F7',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF1F4',
    text: '#14181F',
    textMuted: '#667085',
    border: '#E3E7EC',
    income: '#139A5B',
    expense: '#D93A3A',
    warning: '#E39A13',
    onPrimary: '#FFFFFF',
  },
  dark: {
    background: '#0E1116',
    surface: '#171B22',
    surfaceAlt: '#1F242D',
    text: '#F2F4F7',
    textMuted: '#98A2B3',
    border: '#2A303A',
    income: '#3CC584',
    expense: '#F26464',
    warning: '#F2B33D',
    onPrimary: '#FFFFFF',
  },
} as const;

export type Scheme = keyof typeof Base;

export function buildTheme(scheme: Scheme, accent: AccentKey) {
  const a = Accents[accent];
  return {
    scheme,
    ...Base[scheme],
    primary: a.primary,
    primaryDeep: a.deep,
    primarySoft: scheme === 'dark' ? a.softDark : a.soft,
  };
}

export type Theme = ReturnType<typeof buildTheme>;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'var(--font-display)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const MaxContentWidth = 640;
