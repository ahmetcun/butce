# App Store ve Google Play'de yayınlama rehberi

Bu dosya, Aile Bütçem'i iki mağazada yayınlamak için gereken her şeyi sırayla anlatır. Koddaki hazırlıklar tamam. Kalan adımlar hesap açmak, ödeme yapmak ve formları doldurmak; bunları yalnızca sen yapabilirsin.

## Projede hazır olanlar

| Şart | Durum |
| --- | --- |
| Uygulamaya özel ikon (iOS 1024 px, saydamsız) | `assets/images/icon.png` |
| Android uyarlanabilir ikon (ön, arka, tek renk) | `assets/images/android-icon-*.png` |
| Android bildirim ikonu (96 px, beyaz ve saydam) | `assets/images/notification-icon.png` |
| Açılış ekranı (açık ve koyu tema) | `splash-icon.png`, `splash-icon-dark.png` |
| iOS paket kimliği | `com.ahmetcun.ailebutcem` |
| Android paket adı | `com.ahmetcun.ailebutcem` |
| Android hedef API 36 (31 Ağustos 2026'dan itibaren zorunlu) | React Native 0.86 varsayılanı: `targetSdk 36` |
| iOS 26 SDK ile derleme (28 Nisan 2026'dan itibaren zorunlu) | EAS Build, SDK 57 ile Xcode 26 imajını kullanır |
| iOS gizlilik bildirimi (PrivacyInfo.xcprivacy) | `app.json` > `ios.privacyManifests` |
| Şifreleme beyanı | `ios.config.usesNonExemptEncryption: false` |
| Gereksiz Android izinleri | `android.blockedPermissions` ile kaldırıldı (konum, kamera, mikrofon, depolama, kesin alarm, reklam kimliği) |
| Yalnızca iPhone (iPad ekran görüntüsü gerekmez) | `ios.supportsTablet: false` |
| Sürüm numarası yönetimi | `eas.json`: sürüm EAS sunucusunda tutulur ve her derlemede artar |
| Gizlilik politikası ve destek sayfası | `docs/` klasörü (GitHub Pages) |
| Uygulama içinde gizlilik, destek ve iletişim bağlantıları | Profil > Hakkında |
| Uygulama içinden tüm verileri silme | Profil > Veriler > Tüm verileri sıfırla |
| Mağaza metinleri | `store/magaza-metinleri.md` |
| Gizlilik, yaş ve içerik formlarının cevapları | `store/form-cevaplari.md` |
| Ekran görüntüleri | `store/gorseller/ios-6.9/` (1320×2868), `store/gorseller/android/` (1080×1920) |
| Play öne çıkan görsel ve 512 px ikon | `store/gorseller/feature-graphic.png`, `play-icon-512.png` |

> **Paket kimliği kalıcıdır.** `com.ahmetcun.ailebutcem` ilk yüklemeden sonra değiştirilemez. Başka bir kimlik istiyorsan ilk derlemeden önce `app.json` içinde iki yerde değiştir.

---

## 1. Hesaplar (bir kez)

1. **Apple Developer Program:** https://developer.apple.com/programs/enroll/
   - Yıllık 99 USD.
   - Bireysel kayıt için Apple Kimliği, iki adımlı doğrulama ve kimlik doğrulaması yeterli.
   - Onay genellikle 1-2 gün sürer.
2. **Google Play Console:** https://play.google.com/console/signup
   - Bir kerelik 25 USD.
   - Kimlik doğrulaması ve bir Android cihazla telefon doğrulaması gerekir.
3. **Expo hesabı:** https://expo.dev/signup (ücretsiz). Derlemeler bulutta yapıldığı için Mac'te Xcode ya da Android Studio gerekmez.

> **Kişisel Play hesapları için önemli:** 13 Kasım 2023'ten sonra açılan kişisel hesaplar, üretime çıkmadan önce **en az 12 test kullanıcısıyla, 14 gün kesintisiz** kapalı test yapmak zorunda. Google bu kullanıcıların uygulamayı gerçekten kullandığını da kontrol ediyor. Aileni ve arkadaşlarını şimdiden topla (Gmail adresleri gerekiyor). Şirket (organizasyon) hesaplarında bu zorunluluk yok.

## 2. Gizlilik sayfasını yayınla (bir kez)

GitHub'da repo > **Settings > Pages** bölümüne gir:

- **Source:** Deploy from a branch
- **Branch:** `main`, klasör `/docs`

Birkaç dakika sonra şu adresler açılır:

- https://ahmetcun.github.io/butce/gizlilik.html
- https://ahmetcun.github.io/butce/destek.html

## 3. Projeyi EAS'e bağla (bir kez)

```bash
npx eas-cli@latest login
npx eas-cli@latest init        # app.json'a projectId ve owner ekler; değişikliği commit'le
```

## 4. iOS: derle ve gönder

1. App Store Connect'te uygulamayı oluştur: https://appstoreconnect.apple.com > Uygulamalar > **+** > Yeni Uygulama.
   - Platform: iOS
   - Ad: **Aile Bütçem**
   - Birincil dil: **Türkçe**
   - Paket kimliği: `com.ahmetcun.ailebutcem` (listede yoksa EAS ilk derlemede kaydeder; sonra tekrar bak)
   - SKU: `ailebutcem`
2. Derle ve gönder:
   ```bash
   npx eas-cli@latest build --platform ios --profile production --auto-submit
   ```
   EAS, sertifika ve provisioning profilini kendisi oluşturur; Apple hesabınla giriş yapman yeterli. Derleme 10-15 dakika işlendikten sonra **TestFlight**'a düşer.
3. TestFlight'tan kendi telefonuna kur ve dene: bildirimler, örnek veriler, ekleme ve silme.
4. App Store Connect'te sürüm sayfasını doldur:
   - Ekran görüntüleri: `store/gorseller/ios-6.9/` içindeki 6 dosya (6,9" alanına; diğer boyutlar otomatik ölçeklenir)
   - Metinler: `store/magaza-metinleri.md`
   - Uygulama Gizliliği, yaş derecelendirmesi ve inceleme notları: `store/form-cevaplari.md`
   - Destek URL'si ve gizlilik URL'si
5. **İncelemeye Gönder.** İnceleme genellikle 1-2 gün sürer.

## 5. Android: derle ve gönder

1. Play Console > **Uygulama oluştur**:
   - Ad: Aile Bütçem: Harcama Takibi
   - Varsayılan dil: Türkçe
   - Uygulama, Ücretsiz
2. **Uygulama içeriği** bölümündeki bütün formları `store/form-cevaplari.md`'ye göre doldur.
3. **Mağaza kaydı:** metinler, 512 px ikon, öne çıkan görsel ve `store/gorseller/android/` görselleri.
4. İlk derleme:
   ```bash
   npx eas-cli@latest build --platform android --profile production
   ```
   EAS imza anahtarını kendisi oluşturur ve saklar. **Play Uygulama İmzalama**'yı açık bırak.
5. İlk `.aab` dosyasını Play Console > Test > **Kapalı test** > yeni sürüm ekranına elle yükle (EAS'in sayfasından indir). Test kullanıcılarının e-posta listesini ekle ve katılım bağlantısını onlarla paylaş.
6. Sonraki yüklemeleri otomatik yapmak için bir Google hizmet hesabı anahtarı oluştur ve EAS'e ekle: https://docs.expo.dev/submit/android/. Ardından:
   ```bash
   npx eas-cli@latest submit --platform android --profile kapali-test   # kapalı test kanalı
   npx eas-cli@latest submit --platform android --profile production    # üretime taslak olarak
   ```
7. 14 gün ve 12 test kullanıcısı tamamlanınca Gösterge Paneli'nden **Üretim erişimi için başvur**. Onaydan sonra sürümü üretime çıkar.

## 6. Güncelleme yayınlarken

1. `app.json` içinde `version`'ı artır (örneğin 1.0.1). Derleme numarası EAS'te kendiliğinden artar.
2. Aynı `build` ve `submit` komutlarını çalıştır.
3. Uygulamaya analiz, reklam, giriş ya da bulut senkronizasyonu eklersen gizlilik politikasını (`docs/gizlilik.html`) ve iki mağazadaki gizlilik formlarını güncelle.

## Reddedilmemek için kontrol listesi

- [ ] Ekran görüntüleri gerçek uygulamayı gösteriyor (örnek verilerle, gerçek kişi bilgisi yok).
- [ ] Gizlilik ve destek URL'leri açılıyor.
- [ ] İnceleme notunda "banka bağlantısı yok, para transferi yok, hesap yok" açıklaması var. Apple, finans kategorisinde finansal hizmet sunan uygulamaların şirket hesabından gelmesini istiyor. Bu uygulama yalnızca kişisel kayıt tuttuğu için bireysel hesapla yayınlanabilir, ama bunu notta açıkça belirtmek incelemeyi hızlandırır.
- [ ] Uygulama adında ya da görsellerde başka bir markanın (banka vb.) adı veya logosu yok.
- [ ] Bildirim izni yalnızca kullanıcı hatırlatmaları açınca ya da test butonuna basınca isteniyor.
- [ ] Koyu temada ve küçük ekranda (iPhone SE) görünüm kontrol edildi.
