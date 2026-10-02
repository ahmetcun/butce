# Aile Bütçem

Aile bütçesi takip uygulaması. Akbank mobil uygulamasının düzeninden ilham alındı, renkleri farklı ve kullanıcı tarafından seçilebilir.

## Özellikler

- **Hızlı giriş:** Kendi tuş takımı, en sık kullanılan kategori önceden seçili. Bir harcama 2-3 dokunuşla kaydedilir.
- **Hızlı ekle kısayolları:** Sık girilen harcamalar ana sayfada tek dokunuşla tekrar eklenir ve geri alınabilir.
- **Aile üyeleri:** Her işlem kimin yaptığıyla kaydedilir ve kişiye göre filtrelenebilir.
- **Bütçe limitleri:** Kategori başına aylık limit konur. Limitin %80'i geçilince sarı, aşılınca kırmızı uyarı verilir.
- **Düzenli ödemeler:** Kira, fatura ve kredi kartı ödemeleri takip edilir. "Ödendi" işaretlenen ödeme otomatik olarak gider kaydına eklenir.
- **Birikim hedefleri:** Hedef tutarı ve ilerleme gösterilir, hedefe hızlıca para eklenebilir.
- **Kişiselleştirme:** 5 renk teması, açık/koyu mod, ana sayfa bölümlerini gizleme ve sıralama, tutarları gizleme.

## Teknolojiler

| Alan | Seçim |
| --- | --- |
| Çatı | Expo SDK 57, React Native 0.86, React 19 (React Compiler açık) |
| Dil | TypeScript |
| Gezinme | Expo Router (dosya tabanlı; alt sekmeler + modal) |
| Durum yönetimi | Zustand |
| Kalıcı veri | `expo-sqlite/kv-store` (telefon), `localStorage` (web) |
| İkonlar | `expo-symbols` (iOS'ta SF Symbols, Android/web'de Material Symbols) |
| Dokunsal geri bildirim | `expo-haptics` |

Veriler şimdilik yalnızca cihazda tutuluyor. Aile üyelerinin farklı telefonlardan aynı bütçeyi görmesi için ileride bir senkronizasyon katmanı eklenecek (örneğin Supabase).

## Çalıştırma

```bash
npm install
npx expo start
```

Çıkan QR kodu telefondaki **Expo Go** uygulamasıyla okut. Web'de görmek için terminalde `w` tuşuna bas.

## Proje yapısı

```
src/
  app/              Ekranlar (Expo Router)
    (tabs)/         Ana Sayfa, İşlemler, Bütçe, Profil
    ekle.tsx        Hızlı işlem ekleme (modal)
    hosgeldin.tsx   İlk açılış
  components/       Ortak arayüz parçaları
  constants/        Tema ve renkler
  lib/              Biçimlendirme, hesaplamalar, depolama
  store/            Zustand veri deposu
```
