import type { IconProps, IconWeight } from 'phosphor-react-native';
import type { ComponentType } from 'react';

import { ArrowDownLeftIcon } from 'phosphor-react-native/src/icons/ArrowDownLeft';
import { ArrowUpRightIcon } from 'phosphor-react-native/src/icons/ArrowUpRight';
import { ArrowsClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowsClockwise';
import { ArrowsDownUpIcon } from 'phosphor-react-native/src/icons/ArrowsDownUp';
import { ArrowsLeftRightIcon } from 'phosphor-react-native/src/icons/ArrowsLeftRight';
import { BabyIcon } from 'phosphor-react-native/src/icons/Baby';
import { BackspaceIcon } from 'phosphor-react-native/src/icons/Backspace';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { BellRingingIcon } from 'phosphor-react-native/src/icons/BellRinging';
import { BuildingsIcon } from 'phosphor-react-native/src/icons/Buildings';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { CarIcon } from 'phosphor-react-native/src/icons/Car';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ChartPieSliceIcon } from 'phosphor-react-native/src/icons/ChartPieSlice';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { CreditCardIcon } from 'phosphor-react-native/src/icons/CreditCard';
import { DotsSixVerticalIcon } from 'phosphor-react-native/src/icons/DotsSixVertical';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeCircleIcon } from 'phosphor-react-native/src/icons/DotsThreeCircle';
import { EyeIcon } from 'phosphor-react-native/src/icons/Eye';
import { EyeSlashIcon } from 'phosphor-react-native/src/icons/EyeSlash';
import { FirstAidKitIcon } from 'phosphor-react-native/src/icons/FirstAidKit';
import { ForkKnifeIcon } from 'phosphor-react-native/src/icons/ForkKnife';
import { GameControllerIcon } from 'phosphor-react-native/src/icons/GameController';
import { GearIcon } from 'phosphor-react-native/src/icons/Gear';
import { GiftIcon } from 'phosphor-react-native/src/icons/Gift';
import { GraduationCapIcon } from 'phosphor-react-native/src/icons/GraduationCap';
import { HeartIcon } from 'phosphor-react-native/src/icons/Heart';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { HouseLineIcon } from 'phosphor-react-native/src/icons/HouseLine';
import { InvoiceIcon } from 'phosphor-react-native/src/icons/Invoice';
import { LightningIcon } from 'phosphor-react-native/src/icons/Lightning';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { MoneyIcon } from 'phosphor-react-native/src/icons/Money';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { PaletteIcon } from 'phosphor-react-native/src/icons/Palette';
import { PawPrintIcon } from 'phosphor-react-native/src/icons/PawPrint';
import { PiggyBankIcon } from 'phosphor-react-native/src/icons/PiggyBank';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { PlusCircleIcon } from 'phosphor-react-native/src/icons/PlusCircle';
import { ReceiptIcon } from 'phosphor-react-native/src/icons/Receipt';
import { ShoppingCartIcon } from 'phosphor-react-native/src/icons/ShoppingCart';
import { SlidersIcon } from 'phosphor-react-native/src/icons/Sliders';
import { SparkleIcon } from 'phosphor-react-native/src/icons/Sparkle';
import { TShirtIcon } from 'phosphor-react-native/src/icons/TShirt';
import { TargetIcon } from 'phosphor-react-native/src/icons/Target';
import { TrashIcon } from 'phosphor-react-native/src/icons/Trash';
import { UserIcon } from 'phosphor-react-native/src/icons/User';
import { UserCircleIcon } from 'phosphor-react-native/src/icons/UserCircle';
import { UsersThreeIcon } from 'phosphor-react-native/src/icons/UsersThree';
import { WalletIcon } from 'phosphor-react-native/src/icons/Wallet';
import { XIcon } from 'phosphor-react-native/src/icons/X';

/**
 * Uygulamadaki tüm ikonlar tek yerde: Phosphor, çift tonlu (duotone).
 * Paketin tamamı değil, yalnızca kullanılan ikonlar içe aktarılır.
 */
export const Glyphs = {
  home: HouseIcon,
  list: ReceiptIcon,
  plus: PlusIcon,
  chart: ChartPieSliceIcon,
  person: UserIcon,
  bell: BellIcon,
  gear: GearIcon,
  close: XIcon,
  check: CheckIcon,
  backspace: BackspaceIcon,
  chevronRight: CaretRightIcon,
  eye: EyeIcon,
  eyeOff: EyeSlashIcon,
  trash: TrashIcon,
  repeat: ArrowsClockwiseIcon,
  arrowUp: ArrowUpRightIcon,
  arrowDown: ArrowDownLeftIcon,
  calendar: CalendarBlankIcon,
  target: TargetIcon,
  bolt: LightningIcon,
  palette: PaletteIcon,
  family: UsersThreeIcon,
  sliders: SlidersIcon,
  moon: MoonIcon,
  arrowUpDown: ArrowsDownUpIcon,
  grip: DotsSixVerticalIcon,
  search: MagnifyingGlassIcon,
  homeOutline: HouseIcon,
  swap: ArrowsLeftRightIcon,
  plusCircle: PlusCircleIcon,
  heart: HeartIcon,
  personOutline: UserCircleIcon,
  dots: DotsThreeIcon,
  chevronDown: CaretDownIcon,
  wallet: WalletIcon,
  sparkles: SparkleIcon,
  bellOutline: BellRingingIcon,
  piggy: PiggyBankIcon,
  receipt: ReceiptIcon,
  cart: ShoppingCartIcon,
  bill: InvoiceIcon,
  house: HouseLineIcon,
  car: CarIcon,
  food: ForkKnifeIcon,
  health: FirstAidKitIcon,
  school: GraduationCapIcon,
  clothes: TShirtIcon,
  child: BabyIcon,
  fun: GameControllerIcon,
  card: CreditCardIcon,
  more: DotsThreeCircleIcon,
  salary: MoneyIcon,
  extra: PlusCircleIcon,
  building: BuildingsIcon,
  gift: GiftIcon,
  pet: PawPrintIcon,
} satisfies Record<string, ComponentType<IconProps>>;

export type GlyphName = keyof typeof Glyphs;

/** Dolgu alanı olmayan küçük arayüz işaretleri: çift ton yerine kalın çizgi daha okunaklı */
const LINE_ONLY = new Set<GlyphName>(['arrowDown', 'arrowUp', 'arrowUpDown', 'backspace', 'check', 'chevronDown', 'chevronRight', 'close', 'dots', 'grip', 'plus', 'swap']);

export function Icon({
  name,
  size = 22,
  color,
  weight,
}: {
  name: GlyphName;
  size?: number;
  color: string;
  weight?: IconWeight;
}) {
  const Component = Glyphs[name];
  return (
    <Component
      size={size}
      color={color}
      weight={weight ?? (LINE_ONLY.has(name) ? 'bold' : 'duotone')}
      duotoneOpacity={0.28}
    />
  );
}
