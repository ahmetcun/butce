# Mağaza formlarının cevapları

Uygulama hiçbir veriyi toplamadığı, göndermediği ve paylaşmadığı için cevapların neredeyse hepsi "hayır". Bu cevaplar koda dayanıyor. İleride analiz, reklam, giriş ya da bulut yedekleme eklenirse bu dosya ve gizlilik politikası güncellenmeli.

Dayanak:

- Veriler cihazdaki SQLite'ta (expo-sqlite/kv-store) saklanıyor.
- Ağ isteği yok.
- Hesap, reklam ve analiz yok.
- Bildirimler yalnızca yerel (expo-notifications, push token alınmıyor).

---

## App Store Connect

### Uygulama Gizliliği (App Privacy)

- **Data Collection:** "No, we do not collect data from this app" (Veri toplamıyoruz)
- Gizlilik etiketi bunun sonucunda **"Data Not Collected"** olarak görünür.

### Yaş Derecelendirmesi (Age Rating)

Bütün sorulara **Hayır / Yok**: şiddet, cinsellik, kumar, alkol, uyuşturucu, korku, küfür, tıbbi bilgi, kullanıcı içeriği, sohbet, sınırsız web erişimi, reklam ve yaş doğrulama.

Sonuç: **4+**.

### Şifreleme (Export Compliance)

`app.json` içinde `ios.config.usesNonExemptEncryption: false` ayarlı. App Store Connect artık her derlemede soru sormaz.

### İnceleme bilgileri (App Review Information)

- **Giriş gerekli mi:** Hayır (Sign-in required: kapalı)
- **İletişim:** adın, soyadın, telefonun ve e-postan

**Notlar (Notes):**

```
Aile Bütçem is a personal/family budgeting ledger. It does not connect to banks, does not move money, and does not provide any financial service, loan or investment advice. There is no account or login. All data is stored locally on the device (SQLite); the app makes no network requests.

To review quickly: on the welcome screen tap "Örnek verilerle göz at" (Browse with sample data) to load 3 months of sample transactions, bills and goals.

Notifications: Profile (Profil) > Bildirimler > "Test bildirimi gönder" sends a local test notification. Bill reminders are local notifications scheduled on the device.
```

### Fiyat ve bulunabilirlik

- **Fiyat:** Ücretsiz
- **Ülkeler:** Türkiye (ya da tümü; uygulama Türkçe ve TL ile çalışıyor)
- **AB Dijital Hizmetler Yasası (DSA) tüccar durumu:** Ücretsiz ve ticari olmayan bir uygulamaysa "Tüccar değilim" seçilebilir. Ticari amaçla (gelir elde ederek) yayınlıyorsan "Tüccarım" seçilmeli. Bu durumda adres, telefon ve e-posta AB'de herkese gösterilir.

---

## Google Play Console: Uygulama içeriği (App content)

| Bölüm | Cevap |
| --- | --- |
| Gizlilik politikası | https://ahmetcun.github.io/butce/gizlilik.html |
| Reklamlar | Hayır, uygulamada reklam yok |
| Uygulama erişimi | Tüm işlevler özel erişim olmadan kullanılabilir (giriş yok) |
| İçerik derecelendirmesi (IARC) | Kategori: "Yardımcı Program, Üretkenlik, İletişim veya Diğer". Bütün sorulara Hayır. Sonuç: 3+ / Herkes. |
| Hedef kitle ve içerik | Yalnızca **18 yaş ve üzeri**. Çocuklara yönelik değil; bu seçim Aileler politikasının ek yükümlülüklerinden kaçınır. |
| Haber uygulaması | Hayır |
| Veri güvenliği (Data safety) | Aşağıda |
| Devlet uygulaması | Hayır |
| Finansal özellikler | Kişisel bütçe ve harcama takibi seçeneği varsa onu işaretle. Uygulama ödeme, kredi, yatırım, banka bağlantısı ya da kripto sunmuyor; ek belge gerekmez. |
| Sağlık uygulaması | Hayır / sağlık özelliği yok |
| Reklam kimliği (Advertising ID) | Hayır, kullanılmıyor (`AD_ID` izni `app.json` içinde engellendi) |

### Veri güvenliği (Data safety)

- **Uygulamanız gerekli kullanıcı veri türlerinden herhangi birini topluyor veya paylaşıyor mu?** Hayır
- Bu cevapla form şu sonuçla biter: **"Veri toplanmıyor"** ve **"Veri paylaşılmıyor"**.
- Şifreleme ve silme talebi soruları veri toplanmadığı için sorulmaz. Uygulama içinde zaten **Profil > Veriler > Tüm verileri sıfırla** var.

> Not: Android'in otomatik yedeklemesi (`allowBackup: true`) kullanıcının kendi Google hesabına yapılır ve Google'ın kendi işlemidir. Geliştiricinin veri toplaması sayılmaz.

### Mağaza kaydı (Store listing)

- **Uygulama simgesi:** `store/gorseller/play-icon-512.png` (512×512)
- **Öne çıkan görsel:** `store/gorseller/feature-graphic.png` (1024×500)
- **Telefon ekran görüntüleri:** `store/gorseller/android/*.png` (1080×1920; en az 2, en fazla 8)
- **Kategori:** Finans
- **E-posta:** cangursoy4155@gmail.com (Play'de herkese açık görünür)
