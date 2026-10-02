import { Easing, FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

/**
 * Tüm animasyonların ortak ayarları.
 * Kurallar: yay (spring) yok, hedefi geçip geri sekme yok; gecikme yok;
 * hiçbir animasyon 200 ms'yi geçmez. Kullanıcı animasyonu beklemez.
 */
const ease = Easing.out(Easing.cubic);

export const Fast = { duration: 120, easing: ease };
export const Base = { duration: 200, easing: ease };

/** Yeni beliren öğe: yalnızca opaklık, kayma yok */
export const enter = FadeIn.duration(160);
export const exit = FadeOut.duration(120);
/** Liste içinde yer değişimi */
export const layout = LinearTransition.duration(180).easing(ease);
