
# V2 Active 1v1 Technical Spike Evidence Plan Draft

---

# 2. Status

**Draft / technical-spike-evidence-plan / owner-product-lock-aligned / db-api-boundary-aligned / not implementation**

Bu doküman:

* implementation değildir
* production kod değildir
* migration değildir
* route creation değildir
* final ADR değildir
* Codex implementation promptu değildir
* repo dosyası değildir

---

# 3. Purpose

Bu plan, V2 active 1v1 implementation öncesinde hangi teknik varsayımların küçük, kontrollü, throwaway/evidence çalışmalarıyla kanıtlanması gerektiğini netleştirir.

Netleştirir:

* hangi spike önce yapılmalı
* hangi varsayım kanıtlanmalı
* hangi risk kapanmalı
* hangi acceptance kriteri PASS sayılmalı
* hangi evidence olmadan migration/API/schema/route implementation yapılamaz

Netleştirmez:

* exact schema
* exact enum
* exact API endpoint
* exact migration
* exact route implementation
* final architecture freeze
* Codex implementation planı

---

# 4. Source of truth summary

## Owner product lock

* `/live/[username]` public watch + telefon ikonu / 1v1 request başlangıcıdır.
* `/studio` incoming request + kabul/ret yüzeyidir.
* `/call/[sessionId]` yalnız active private 1v1 yüzeyidir.
* Kamera/mikrofon optionaldır.
* Dakika backend `private_session_active` timestamp ile başlar.
* Client timer billing truth değildir.
* 1v1 chat DM/public chat/kalıcı geçmiş değildir.
* Publisher accept sonrası public broadcast aktif canlı olmaktan çıkar.
* Public viewer fallback görür ve 5 saniye sonra `/` ana sayfaya döner.
* Discovery call state’e direkt bağlanmaz.
* `broadcasts` içine 1v1/payment/minute/chat/earning/social state girmez. 

## DB/API boundary

DB/API boundary contract; V2 ailelerini V1 core’dan ayırır, `broadcasts` tablosunu dar public broadcast lifecycle olarak korur, backend timestamp truth’unu esas alır, minute ledger ile publisher earning ayrımını korur ve exact schema/API/migration freeze etmez. 

## Unknowns

* exact schema / field names
* exact enum names
* exact constraints
* exact transaction boundary
* exact LiveKit private call token handoff
* exact payment approval flow
* exact publisher earning / payout model
* iOS Safari gerçek cihaz evidence
* Android Chrome dışı mobile evidence
* technical spike sonuçları

---

# 5. Spike order

## 1. `private_session_active` timestamp spike

İlk yapılmalı. Çünkü billing, duration, finalize, ledger ve earning truth bunun üstüne kurulacak.

## 2. Idempotent finalize spike

İkinci yapılmalı. Çünkü finansal güvenlik için double accept, double active ve double finalize riskleri önce kapanmalı.

## 3. LiveKit private token boundary spike

Üçüncü yapılmalı. Çünkü public broadcast token ile private call token ayrılmadan `/call` güvenliği kanıtlanamaz.

## 4. `/live → /call` handoff spike

Dördüncü yapılmalı. Public watch bozulmadan telefon action + gate + request handoff kanıtlanmalı.

## 5. `/studio → /call` handoff spike

Beşinci yapılmalı. Publisher incoming request accept/reject ve active call’a geçiş, studio media surface bozulmadan kanıtlanmalı.

## 6. Public broadcast fallback / discovery spike

Altıncı yapılmalı. Accept sonrası public broadcast aktif canlıdan düşme, fallback ve discovery read model davranışı kanıtlanmalı.

## 7. Camera/mic optional behavior spike

Yedinci yapılmalı. `/call` active session zemini kanıtlandıktan sonra media permission/track davranışı ölçülmeli.

## 8. 1v1 ephemeral chat spike

Sekizinci yapılmalı. Session boundary ve token/access zemini oturduktan sonra chat’in session-scoped geçici kaldığı kanıtlanmalı.

---

# 6. Spike detail table

| spike                              | varsayım                                                                 | risk        | bağımlılık                    | evidence yöntemi                                   | PASS kriteri                                                                   | kalıcı repo etkisi |
| ---------------------------------- | ------------------------------------------------------------------------ | ----------- | ----------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------ |
| `private_session_active` timestamp | Accept ile active ayrılabilir; dakika server active timestamp ile başlar | Çok yüksek  | DB/API boundary               | throwaway transition simulation, log/evidence notu | active yoksa 0 finansal etki; active server-side oluşur                        | Yok                |
| Idempotent finalize                | Double accept/active/finalize çift finansal yazım üretmez                | Çok yüksek  | active timestamp spike        | throwaway race/idempotency matrix                  | tek session, tek active timestamp, tek debit, tek earning                      | Yok                |
| LiveKit private token boundary     | Public token ve private call token ayrılabilir                           | Çok yüksek  | session/access boundary       | token access matrix, throwaway endpoint/read audit | yalnız session tarafları token alır; ended session token alamaz                | Yok                |
| `/live → /call` handoff            | Telefon action public watch’ı bozmaz                                     | Yüksek      | token + request boundary      | UI flow evidence, controller ownership audit       | guest izler; gate sadece telefon action’da; playback controller şişmez         | Yok                |
| `/studio → /call` handoff          | Incoming request studio media surface’i bozmaz                           | Yüksek      | accept + one-active guard     | layer ownership audit, throwaway flow evidence     | request slotu `StudioPreviewPanel` içine gömülmez; active media `/call`a gider | Yok                |
| Public fallback/discovery          | Accept sonrası public broadcast aktif canlıdan düşer                     | Yüksek      | accept transition             | read model evidence, redirect timing ölçümü        | viewer fallback + 5 sn redirect; discovery public read modelden düşer          | Yok                |
| Camera/mic optional                | User camera/mic açmadan call’da kalabilir                                | Orta-yüksek | `/call` active evidence       | real device matrix                                 | sadece izleme/chat PASS; sonra mic/camera açma PASS                            | Yok                |
| 1v1 ephemeral chat                 | Chat DB persistence olmadan session-scoped çalışır                       | Orta-yüksek | token/access + active session | temporary data flow evidence                       | public chat/DM değil; call bitince erişim kapanır                              | Yok                |

---

# 7. Repo touch policy

Spike sırasında:

* production kod yazılmayacak
* kalıcı feature dosyası açılmayacak
* migration yazılmayacak
* route açılmayacak
* exact schema freeze edilmeyecek
* exact enum freeze edilmeyecek
* exact API implementation freeze edilmeyecek
* Codex implementation promptu üretilmeyecek

Allowed:

* throwaway local ölçüm
* geçici script / local-only simulation
* ekran kaydı
* log çıktısı
* read-only repo audit
* kısa evidence notu
* gerekirse daha sonra doc-only close-out

Codex sadece ileride **read-only audit** veya **throwaway spike planı** için düşünülebilir. Production implementation için bu aşamada kullanılmaz.

---

# 8. Acceptance matrix

## `private_session_active` timestamp PASS

* Accept timestamp ile active timestamp ayrı kanıtlanır.
* Active timestamp server-side oluşur.
* Client timer değişse bile billing duration değişmez.
* Camera/mic açılmasa bile active transition mümkün olur.
* Active öncesi failed/timeout finansal etki üretmez.

## Idempotent finalize PASS

* Double accept tek session üretir.
* Double active timestamp overwrite etmez.
* Double finalize tek minute debit üretir.
* Publisher earning source tek kez oluşur.
* Failed/timeout tekrarları çift finansal kayıt üretmez.

## LiveKit private token boundary PASS

* Public broadcast token private call için kullanılamaz.
* Private call token sadece session taraflarına verilir.
* Guest private call token alamaz.
* Session tarafı olmayan user token alamaz.
* Ended/finalized session token alamaz.

## `/live → /call` handoff PASS

* Guest public watch izlemeye devam eder.
* Guest telefon action’da auth/dakika gate’e takılır.
* Logged-in user telefon action’dan request başlatabilir.
* Public playback bozulmaz.
* Telefon action playback controller içine sızmaz.

## `/studio → /call` handoff PASS

* Publisher incoming request’i `/studio` içinde görür.
* Accept/reject studio preview/media surface’i bozmaz.
* Incoming request slotu `StudioPreviewPanel` içine gömülmez.
* Accept sonrası active call media `/call` boundary’sine gider.
* Publisher aynı anda ikinci active call kabul edemez.

## Public fallback/discovery PASS

* Publisher accept sonrası public broadcast aktif canlıdan düşer.
* Public viewer fallback görür.
* Fallback 5 saniye sonra `/` yönlendirir.
* Discovery call state’e direkt bağlanmadan public read modelden düşer.
* Call bitince public broadcast otomatik geri dönmez.

## Camera/mic optional PASS

* User camera/mic açmadan `/call` içinde kalır.
* User sadece izleyebilir.
* User geçici chat yazabilir.
* Sonradan mic açınca permission/track lifecycle bozulmaz.
* Sonradan camera açınca permission/track lifecycle bozulmaz.
* Android Chrome gerçek cihaz evidence alınır.
* iOS Safari gerçek cihaz evidence olmadan global mobile PASS denmez.

## 1v1 ephemeral chat PASS

* Chat sadece active session scope’unda çalışır.
* Public live chat ile karışmaz.
* DB kalıcı chat history yazılmaz.
* Call bitince chat gönderimi kapanır.
* Eski session chat geçmişi ürün yüzeyi gibi görünmez.
* DM/social inbox açılmaz.

---

# 9. Risk register

| risk                              | etki                                              | guard                                                |
| --------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| public watch bozulması            | V1 watch auth wall’a dönüşür                      | Gate yalnız telefon action’da kalır                  |
| studio god file                   | `StudioPreviewPanel` request/call logic ile şişer | Incoming slot scene-level ayrı boundary olur         |
| call route scope şişmesi          | `/call` dashboard/DM/payment paneline döner       | `/call` yalnız active private session yüzeyi olur    |
| billing client truth olması       | Timer drift/manipülasyon finansı bozar            | Backend active/finalized timestamp truth             |
| LiveKit token karışması           | Public/private erişim sızar                       | Broadcast token ve private call token ayrı boundary  |
| chat DM’e dönüşmesi               | V3/social scope V2’ye sızar                       | Session-scoped ephemeral chat; DB persistence yok    |
| discovery call state’e bağlanması | Public read model private state’e bağımlı olur    | Discovery public broadcast visibility/lifecycle okur |
| mobile browser permission sorunu  | Camera/mic optional behavior yanlış kabul edilir  | iOS Safari + Android Chrome gerçek cihaz evidence    |
| double finalize                   | Çift dakika düşümü / çift kazanç                  | source-session unique idempotency guard kanıtı       |
| active öncesi timeout billing     | Haksız ücret                                      | active timestamp yoksa 0 finansal etki               |

---

# 10. What remains blocked

Bu spike evidence olmadan yapılamaz:

* migration
* DB schema freeze
* exact enum/status freeze
* API implementation
* `/call/[sessionId]` route implementation
* request/session API implementation
* billing ledger implementation
* publisher earning implementation
* LiveKit private call token implementation
* public fallback/discovery integration
* camera/mic optional production behavior
* ephemeral chat production behavior

Özellikle billing tarafında client timer truth yapılmayacak. Chat tarafında DB persistence, DM veya social inbox açılmayacak. Discovery call state’e direkt bağlanmayacak.

---

# 11. Readiness

## Bu doc draft repo doc-only PR adayı mı?

**Evet, doc-only PR adayı olabilir.**

Önerilen statü:

```text
Draft / technical-spike-evidence-plan / owner-product-lock-aligned / db-api-boundary-aligned / not implementation
```

## Repo’ya eklenmeden önce son denetim

Repo’ya doc-only olarak eklenmeden önce şu kontrol yapılmalı:

* Owner product lock ile çelişki var mı?
* DB/API boundary contract ile çelişki var mı?
* Spike planı migration/implementation diline kayıyor mu?
* `/live`, `/studio`, `/call`, `broadcasts`, billing, chat ve discovery guardları korunuyor mu?
* iOS Safari evidence olmadan global mobile PASS iddiası var mı?
* Codex implementation promptu gibi okunabilecek cümle var mı?


