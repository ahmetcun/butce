import '@/global.css';

/**
 * Kullanıcının seçebileceği ana renkler. Akbank'ın kırmızısı yerine
 * varsayılan olarak zümrüt yeşili kullanılıyor.
 */
export const Accents = {
  zumrut: {
    name: 'Zümrüt', primary: '#0B7A63', deep: '#075845', soft: '#D9F0E9', softDark: '#123B33',
    pastel: '#F2F07A', bg: ['#DCEFE4', '#EEF4D6'], bgDark: ['#0E1513', '#141A12'],
  },
  lacivert: {
    name: 'Lacivert', primary: '#2449B8', deep: '#173285', soft: '#DEE5FA', softDark: '#1C2647',
    pastel: '#C8D6FF', bg: ['#E1E8F6', '#EEF0FA'], bgDark: ['#0E1118', '#13151D'],
  },
  mor: {
    name: 'Mor', primary: '#6A3DB0', deep: '#4B2A82', soft: '#EBE1F8', softDark: '#2C2142',
    pastel: '#DCCEFF', bg: ['#EAE4F6', '#F5EEF8'], bgDark: ['#120F17', '#17121A'],
  },
  turuncu: {
    name: 'Turuncu', primary: '#D45F12', deep: '#A2470B', soft: '#FBE7D8', softDark: '#3D2617',
    pastel: '#FFD6A8', bg: ['#F6EADF', '#FAF3E1'], bgDark: ['#17110D', '#1A150E'],
  },
  okyanus: {
    name: 'Okyanus', primary: '#0678A6', deep: '#055B7D', soft: '#D7EEF7', softDark: '#13323F',
    pastel: '#B8EAF2', bg: ['#DDEFF3', '#E8F5EC'], bgDark: ['#0D1416', '#111915'],
  },
} as const;

export type AccentKey = keyof typeof Accents;

/**
 * Ana sayfadaki bakiye kartının bölüme göre pastel rengi.
 * "accent": kullanıcının seçtiği rengin pasteli.
 */
export const SectionPastels = {
  genel: 'accent',
  butce: '#C6EFD8',
  odemeler: '#FFDDB3',
  hedefler: '#DAD2FF',
} as const;

const Base = {
  light: {
    background: '#EAF2E6',
    surface: '#FFFFFF',
    surfaceAlt: '#F2F3F2',
    text: '#1D1D20',
    textMuted: '#6B6E76',
    border: '#E6E7EA',
    income: '#139A5B',
    expense: '#D93A3A',
    warning: '#E39A13',
    onPrimary: '#FFFFFF',
    promo: '#D6EDE4',
    promoText: '#0B5E48',
    /** Siyah vurgu: ana butonlar, seçili öğeler */
    ink: '#121413',
    onInk: '#FFFFFF',
    /** Pastel kart üzerindeki yazı */
    onPastel: '#121413',
    glass: 'rgba(255,255,255,0.72)',
  },
  dark: {
    background: '#0F1013',
    surface: '#1A1B1F',
    surfaceAlt: '#24262B',
    text: '#F2F3F5',
    textMuted: '#9A9DA6',
    border: '#2C2E34',
    income: '#3CC584',
    expense: '#F26464',
    warning: '#F2B33D',
    onPrimary: '#FFFFFF',
    promo: '#16352B',
    promoText: '#8FDDBF',
    ink: '#F2F3F5',
    onInk: '#121413',
    onPastel: '#121413',
    glass: 'rgba(30,32,36,0.72)',
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
    pastel: a.pastel,
    bgGradient: (scheme === 'dark' ? a.bgDark : a.bg) as readonly [string, string],
  };
}

export type Theme = ReturnType<typeof buildTheme>;

/** Akbank'ın geniş, geometrik yazı tipine yakın: Lexend */
export const FontFamily = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
} as const;

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
  xl: 32,
  pill: 999,
} as const;

export const MaxContentWidth = 640;
