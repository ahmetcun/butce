import { buildTheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBudget } from '@/store/budget';

/** Kullanıcının seçtiği renk ve açık/koyu mod tercihine göre tema. */
export function useTheme() {
  const system = useColorScheme();
  const accent = useBudget((s) => s.settings.accent);
  const mode = useBudget((s) => s.settings.themeMode);
  const scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return buildTheme(scheme, accent);
}
