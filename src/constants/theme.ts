import '@/global.css';

/**
 * Kullanıcının seçebileceği ana renkler. Akbank'ın kırmızısı yerine
 * varsayılan olarak zümrüt yeşili kullanılıyor.
 */
export const Accents = {
  zumrut: { name: 'Zümrüt', primary: '#0B7A63', deep: '#075845', soft: '#D9F0E9', softDark: '#123B33' },
  lacivert: { name: 'Lacivert', primary: '#2449B8', deep: '#173285', soft: '#DEE5FA', softDark: '#1C2647' },
  mor: { name: 'Mor', primary: '#6A3DB0', deep: '#4B2A82', soft: '#EBE1F8', softDark: '#2C2142' },
  turuncu: { name: 'Turuncu', primary: '#D45F12', deep: '#A2470B', soft: '#FBE7D8', softDark: '#3D2617' },
  okyanus: { name: 'Okyanus', primary: '#0678A6', deep: '#055B7D', soft: '#D7EEF7', softDark: '#13323F' },
} as const;

export type AccentKey = keyof typeof Accents;

/**
 * Ana sayfadaki her bölümün kendi rengi var (Akbank'taki Kartlar sarı,
 * Yatırımlar koyu gri gibi). "primary" kullanıcının seçtiği renk demek.
 */
export const SectionColors = {
  genel: 'primary',
  butce: 'primary',
  odemeler: '#E8A10C',
  hedefler: '#2F3138',
} as const;

const Base = {
  light: {
    background: '#F4F4F6',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F1F3',
    text: '#1D1D20',
    textMuted: '#6B6E76',
    border: '#E6E7EA',
    income: '#139A5B',
    expense: '#D93A3A',
    warning: '#E39A13',
    onPrimary: '#FFFFFF',
    promo: '#D6EDE4',
    promoText: '#0B5E48',
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
  lg: 20,
  pill: 999,
} as const;

export const MaxContentWidth = 640;
