import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import type { ColorValue } from 'react-native';

type Glyph = { ios: SFSymbol; android: AndroidSymbol };

/**
 * Uygulamadaki tüm ikonlar tek yerde. iOS'ta SF Symbols,
 * Android ve web'de Material Symbols kullanılır.
 */
export const Glyphs = {
  // Gezinme
  home: { ios: 'house.fill', android: 'home' },
  list: { ios: 'list.bullet.rectangle', android: 'receipt_long' },
  plus: { ios: 'plus', android: 'add' },
  chart: { ios: 'chart.pie.fill', android: 'pie_chart' },
  person: { ios: 'person.crop.circle.fill', android: 'account_circle' },

  // Arayüz
  bell: { ios: 'bell.fill', android: 'notifications' },
  gear: { ios: 'gearshape.fill', android: 'settings' },
  close: { ios: 'xmark', android: 'close' },
  check: { ios: 'checkmark', android: 'check' },
  backspace: { ios: 'delete.left', android: 'backspace' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right' },
  eye: { ios: 'eye.fill', android: 'visibility' },
  eyeOff: { ios: 'eye.slash.fill', android: 'visibility_off' },
  trash: { ios: 'trash.fill', android: 'delete' },
  repeat: { ios: 'arrow.triangle.2.circlepath', android: 'autorenew' },
  arrowUp: { ios: 'arrow.up.right', android: 'north_east' },
  arrowDown: { ios: 'arrow.down.left', android: 'south_west' },
  calendar: { ios: 'calendar', android: 'calendar_month' },
  target: { ios: 'target', android: 'flag' },
  bolt: { ios: 'bolt.fill', android: 'bolt' },
  palette: { ios: 'paintpalette.fill', android: 'palette' },
  family: { ios: 'person.3.fill', android: 'groups' },
  sliders: { ios: 'slider.horizontal.3', android: 'tune' },
  moon: { ios: 'moon.fill', android: 'dark_mode' },
  arrowUpDown: { ios: 'arrow.up.arrow.down', android: 'swap_vert' },

  // Kategoriler
  cart: { ios: 'cart.fill', android: 'shopping_cart' },
  bill: { ios: 'doc.text.fill', android: 'receipt' },
  house: { ios: 'house.lodge.fill', android: 'cottage' },
  car: { ios: 'car.fill', android: 'directions_car' },
  food: { ios: 'fork.knife', android: 'restaurant' },
  health: { ios: 'cross.case.fill', android: 'medical_services' },
  school: { ios: 'book.fill', android: 'school' },
  clothes: { ios: 'tshirt.fill', android: 'checkroom' },
  child: { ios: 'figure.and.child.holdinghands', android: 'child_care' },
  fun: { ios: 'gamecontroller.fill', android: 'sports_esports' },
  card: { ios: 'creditcard.fill', android: 'credit_card' },
  more: { ios: 'ellipsis.circle.fill', android: 'more_horiz' },
  salary: { ios: 'banknote.fill', android: 'payments' },
  extra: { ios: 'plus.circle.fill', android: 'add_circle' },
  building: { ios: 'building.2.fill', android: 'apartment' },
  gift: { ios: 'gift.fill', android: 'redeem' },
  pet: { ios: 'pawprint.fill', android: 'pets' },
} satisfies Record<string, Glyph>;

export type GlyphName = keyof typeof Glyphs;

export function Icon({
  name,
  size = 22,
  color,
}: {
  name: GlyphName;
  size?: number;
  color: ColorValue;
}) {
  const g: Glyph = Glyphs[name];
  return (
    <SymbolView
      name={{ ios: g.ios, android: g.android, web: g.android }}
      size={size}
      tintColor={color}
    />
  );
}
