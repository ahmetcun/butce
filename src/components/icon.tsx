import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import Home01Icon from '@hugeicons/core-free-icons/Home01Icon';
import LeftToRightListBulletIcon from '@hugeicons/core-free-icons/LeftToRightListBulletIcon';
import ArrowDataTransferHorizontalIcon from '@hugeicons/core-free-icons/ArrowDataTransferHorizontalIcon';
import AddCircleIcon from '@hugeicons/core-free-icons/AddCircleIcon';
import UserIcon from '@hugeicons/core-free-icons/UserIcon';
import UserGroupIcon from '@hugeicons/core-free-icons/UserGroupIcon';
import Search01Icon from '@hugeicons/core-free-icons/Search01Icon';
import Notification01Icon from '@hugeicons/core-free-icons/Notification01Icon';
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Tick02Icon from '@hugeicons/core-free-icons/Tick02Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon';
import ArrowUpRight01Icon from '@hugeicons/core-free-icons/ArrowUpRight01Icon';
import ArrowDownLeft01Icon from '@hugeicons/core-free-icons/ArrowDownLeft01Icon';
import MoreHorizontalIcon from '@hugeicons/core-free-icons/MoreHorizontalIcon';
import DragDropVerticalIcon from '@hugeicons/core-free-icons/DragDropVerticalIcon';
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon';
import SparklesIcon from '@hugeicons/core-free-icons/SparklesIcon';
import ViewIcon from '@hugeicons/core-free-icons/ViewIcon';
import ViewOffSlashIcon from '@hugeicons/core-free-icons/ViewOffSlashIcon';
import PieChartIcon from '@hugeicons/core-free-icons/PieChartIcon';
import Calendar03Icon from '@hugeicons/core-free-icons/Calendar03Icon';
import Target02Icon from '@hugeicons/core-free-icons/Target02Icon';
import PiggyBankIcon from '@hugeicons/core-free-icons/PiggyBankIcon';
import FlashIcon from '@hugeicons/core-free-icons/FlashIcon';
import ShoppingBasket01Icon from '@hugeicons/core-free-icons/ShoppingBasket01Icon';
import Invoice01Icon from '@hugeicons/core-free-icons/Invoice01Icon';
import Home09Icon from '@hugeicons/core-free-icons/Home09Icon';
import Car01Icon from '@hugeicons/core-free-icons/Car01Icon';
import Restaurant01Icon from '@hugeicons/core-free-icons/Restaurant01Icon';
import Medicine02Icon from '@hugeicons/core-free-icons/Medicine02Icon';
import School01Icon from '@hugeicons/core-free-icons/School01Icon';
import TShirtIcon from '@hugeicons/core-free-icons/TShirtIcon';
import BabyBottleIcon from '@hugeicons/core-free-icons/BabyBottleIcon';
import GameController03Icon from '@hugeicons/core-free-icons/GameController03Icon';
import CreditCardIcon from '@hugeicons/core-free-icons/CreditCardIcon';
import GridViewIcon from '@hugeicons/core-free-icons/GridViewIcon';
import Wallet01Icon from '@hugeicons/core-free-icons/Wallet01Icon';
import Coins01Icon from '@hugeicons/core-free-icons/Coins01Icon';
import Building03Icon from '@hugeicons/core-free-icons/Building03Icon';
import GiftIcon from '@hugeicons/core-free-icons/GiftIcon';
import HelpCircleIcon from '@hugeicons/core-free-icons/HelpCircleIcon';
import Mail01Icon from '@hugeicons/core-free-icons/Mail01Icon';
import SecurityCheckIcon from '@hugeicons/core-free-icons/SecurityCheckIcon';

/**
 * Hugeicons (stroke rounded) tabanlı ikon seti. İkonlar tek tek içe aktarılır,
 * böylece pakete yalnızca kullanılanlar girer. Uygulama içinde hep kısa
 * adlarla (`home`, `cart`...) kullanılır; seti değiştirmek için bu dosya yeterli.
 */
type IconData = readonly (readonly [string, { readonly [key: string]: string | number }])[];

/** Hugeicons'ta karşılığı olmayan tuş takımı silme ikonu, aynı çizgi diliyle. */
const Backspace: IconData = [
  ['path', { d: 'M8.6 5h9.9A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5H8.6a2 2 0 0 1-1.5-.7L3.2 13.3a2 2 0 0 1 0-2.6l3.9-5a2 2 0 0 1 1.5-.7Z', stroke: 'currentColor', strokeWidth: '1.5', strokeLinejoin: 'round', key: '0' }],
  ['path', { d: 'M11.5 9.5l5 5M16.5 9.5l-5 5', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round', key: '1' }],
];

export const Glyphs = {
  home: Home01Icon,
  list: LeftToRightListBulletIcon,
  swap: ArrowDataTransferHorizontalIcon,
  plusCircle: AddCircleIcon,
  person: UserIcon,
  family: UserGroupIcon,
  search: Search01Icon,
  bellOutline: Notification01Icon,
  plus: Add01Icon,
  close: Cancel01Icon,
  check: Tick02Icon,
  chevronRight: ArrowRight01Icon,
  chevronDown: ArrowDown01Icon,
  arrowUp: ArrowUpRight01Icon,
  arrowDown: ArrowDownLeft01Icon,
  dots: MoreHorizontalIcon,
  grip: DragDropVerticalIcon,
  trash: Delete02Icon,
  sparkles: SparklesIcon,
  eye: ViewIcon,
  eyeOff: ViewOffSlashIcon,
  chart: PieChartIcon,
  calendar: Calendar03Icon,
  target: Target02Icon,
  piggy: PiggyBankIcon,
  bolt: FlashIcon,
  cart: ShoppingBasket01Icon,
  bill: Invoice01Icon,
  house: Home09Icon,
  car: Car01Icon,
  food: Restaurant01Icon,
  health: Medicine02Icon,
  school: School01Icon,
  clothes: TShirtIcon,
  child: BabyBottleIcon,
  fun: GameController03Icon,
  card: CreditCardIcon,
  more: GridViewIcon,
  salary: Wallet01Icon,
  extra: Coins01Icon,
  building: Building03Icon,
  gift: GiftIcon,
  shield: SecurityCheckIcon,
  help: HelpCircleIcon,
  mail: Mail01Icon,
  backspace: Backspace,
} satisfies Record<string, IconData>;

export type GlyphName = keyof typeof Glyphs;

/**
 * line: ince (1.5) · duotone: varsayılan (1.7) · bold: seçili durumlar için kalın (2.1)
 * (Ad geriye dönük uyumluluk için duotone; set tek tonlu.)
 */
export type IconWeight = 'duotone' | 'bold' | 'line';

const STROKE: Record<IconWeight, number> = { line: 1.5, duotone: 1.7, bold: 2.1 };

export function Icon({
  name,
  size = 22,
  color,
  weight = 'duotone',
}: {
  name: GlyphName;
  size?: number;
  color: string;
  weight?: IconWeight;
}) {
  const data: IconData = Glyphs[name];
  const scale = STROKE[weight] / 1.5;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {data.map(([tag, { key, ...a }]) => {
        const p = {
          ...a,
          stroke: a.stroke === 'currentColor' ? color : a.stroke,
          fill: a.fill === 'currentColor' ? color : (a.fill ?? 'none'),
          strokeWidth: a.strokeWidth ? Number(a.strokeWidth) * scale : undefined,
        } as Record<string, string | number | undefined>;
        if (tag === 'circle') return <Circle key={key} {...p} />;
        if (tag === 'ellipse') return <Ellipse key={key} {...p} />;
        return <Path key={key} {...(p as { d: string })} />;
      })}
    </Svg>
  );
}
