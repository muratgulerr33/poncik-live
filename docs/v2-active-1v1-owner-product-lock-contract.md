
# V2 Active 1v1 Owner Product Lock Contract

## 1. Status

* Draft
* Owner-product-lock-aligned
* Not final ADR
* Not implementation
* Not migration
* Not route creation prompt

## 2. Purpose

Bu contract, Poncik Live V2’de aktif özel 1v1 görüşme davranışını ürün seviyesinde netleştirir.

Netleştirir:

* `/live/[username]`, `/studio`, `/call/[sessionId]` yüzey ayrımını
* active 1v1 görüşme boundary’sini
* kamera/mikrofonun opsiyonel olduğunu
* dakikanın backend `private_session_active` timestamp ile başlayacağını
* public yayın davranışını
* geçici 1v1 chat sınırını
* billing / dakika / publisher kazanç ayrımını
* DB lifecycle guardlarını

Netleştirmez:

* exact schema
* exact API
* migration
* dosya listesi
* UI tasarım
* ücret yuvarlama kuralı
* final ADR kararı
* implementation planı

## 3. Product Behavior Lock

1. `/live/[username]`, public watch + telefon ikonu / 1v1 istek başlangıcıdır.

2. `/studio`, publisher incoming request + kabul/ret yüzeyidir.

3. `/call/[sessionId]`, yalnız aktif özel 1v1 görüşme yüzeyidir.

4. Kamera/mikrofon arama başlatmak için zorunlu değildir.

5. User `/call/[sessionId]` içinde:

   * sadece izleyebilir
   * görüşme içi anlık chat yazabilir
   * isterse mikrofon açabilir
   * isterse kamera açabilir
   * isterse kamera + mikrofon açabilir

6. Dakika kamera veya mikrofon açılınca başlamaz. Dakika backend `private_session_active` timestamp oluşunca başlar.

7. Client timer sadece görsel sayaçtır. Dakika ve publisher kazanç için ana truth backend timestamp ve finalized session süresidir.

8. 1v1 içi chat:

   * DM değildir
   * kalıcı mesaj kutusu değildir
   * sosyal mesajlaşma değildir
   * public live chat değildir
   * sadece aktif özel görüşme boyunca çalışır
   * V2’de kalıcı mesaj geçmişi açılmaz

9. Publisher aynı anda yalnız bir aktif 1v1 kabul edebilir. Active 1v1 varken yeni accept server-side engellenir.

10. Publisher 1v1’i kabul edince public yayın izlenemez hale gelir.

11. Public izleyicilere şu fallback gösterilir:

```text
Yayıncı şu an özel görüşmede. Ana sayfaya dönüyorsun…
```

12. Public izleyiciler 5 saniye sonra `/` ana sayfaya yönlendirilir.

13. Discovery aktif canlı kartı call state’e göre değil, public broadcast visibility/lifecycle üzerinden düşer.

14. Call bitince public yayın otomatik geri dönmez.

15. Publisher `/studio` içinde güvenli idle/prep state’e döner. İsterse yeniden canlı başlatır.

16. User eski public canlıyı aktifmiş gibi görmemelidir. User dönüş UX’i hâlâ küçük owner UX kararıdır:

* ana sayfa
* veya `/live/[username]` güncel public state

17. `broadcasts` içine 1v1, dakika, payment, chat, publisher kazanç veya social state girmez.

18. `call_requests` / `call_sessions` V2 paid 1v1 ailesidir.

19. User dakika ledger’ı ile publisher kazanç/manual payment tracking karıştırılmaz.

20. Exact schema, API, migration, file list, UI tasarım ve ücret yuvarlama kuralı bu lock ile freeze edilmez. Bunlar sonraki V2-0 audit / DB/API audit konusudur.

## 4. Surface Boundaries

### `/live/[username]`

Amaç:

* Public watch yüzeyi
* Telefon ikonu üzerinden 1v1 istek başlangıcı

Kurallar:

* Watch public kalır.
* Guest ve user public yayını izleyebilir.
* 1v1 login + dakika/bakiye gate yalnız telefon aksiyonuna bağlıdır.
* Watch yüzeyi auth wall’a dönüşmez.
* User 1v1 isteği gönderdiğinde public watch akışı bozulmamalıdır.

### `/studio`

Amaç:

* Publisher yüzeyi
* Incoming request bildirimi
* Kabul/ret aksiyonu

Kurallar:

* Publisher incoming request’i `/studio` içinde görebilir.
* Publisher kabul veya ret verebilir.
* Active 1v1 media call `/studio` içine gömülmez.
* `/studio` prep/publish/media/top chrome/action/chat yüzeyleri active call lifecycle ile şişirilmez.
* Call bitince publisher güvenli idle/prep state’e döner.

### `/call/[sessionId]`

Amaç:

* Yalnız aktif özel 1v1 görüşme yüzeyi

Kurallar:

* Active private session burada yaşar.
* Kamera/mikrofon opsiyonel moddur.
* Görüşme içi geçici chat burada yaşar.
* Dakika görsel timer’ı burada gösterilebilir.
* Dashboard, profil, DM, gift, takip, sosyal, ödeme paneli, publisher kazanç paneli, admin paneli, discovery veya büyük menü değildir.

## 5. Active Session Behavior

Active session şu şekilde düşünülür:

* User ve publisher `/call/[sessionId]` yüzeyindedir.
* Backend `private_session_active` timestamp oluşturmuştur.
* Dakika bu timestamp ile başlar.
* Client timer sadece görsel sayaçtır.
* Kamera/mikrofon active başlatmak için şart değildir.
* User isterse sadece izler.
* User isterse chat yazar.
* User isterse mikrofon açar.
* User isterse kamera açar.
* User isterse kamera + mikrofon açar.

Ana truth:

```text
backend private_session_active timestamp
+
finalized session duration
```

Client timer, billing veya kazanç için ana truth değildir.

## 6. Public Broadcast Behavior

Publisher 1v1’i kabul edince:

* Public yayın izlenemez hale gelir.
* Public izleyiciler fallback görür.
* 5 saniye sonra `/` ana sayfaya yönlendirilir.
* Discovery aktif canlı kartı düşer.
* Discovery kartı call state’e doğrudan bağlanmaz.
* Discovery görünürlüğü public broadcast visibility/lifecycle üzerinden hesaplanır.

Call bitince:

* Public yayın otomatik geri dönmez.
* Publisher `/studio`ya döner.
* Publisher isterse yeniden canlı başlatır.
* User eski public canlıyı aktifmiş gibi görmemelidir.
* User dönüş UX’i hâlâ owner review konusudur.

## 7. Chat Boundary

1v1 içi chat:

* DM değildir.
* Kalıcı mesaj kutusu değildir.
* Sosyal mesajlaşma değildir.
* Public live chat değildir.
* Sadece active özel görüşme boyunca çalışır.
* V2’de kalıcı mesaj geçmişi açılmaz.
* Call sona erince chat yüzeyi de sona erer.

Bu chat, V2 active private session yardımcı yüzeyidir; ayrı sosyal ürün değildir.

## 8. Billing / Minute Boundary

Dakika davranışı:

* Dakika kamera açılınca başlamaz.
* Dakika mikrofon açılınca başlamaz.
* Dakika chat yazılınca başlamaz.
* Dakika backend `private_session_active` timestamp oluşunca başlar.
* Client timer yalnız görsel sayaçtır.
* Final dakika/kazanç hesabı backend timestamp ve finalized session duration üzerinden yapılır.

Ayrımlar:

* User dakika ledger’ı ayrı truth’tur.
* Publisher kazanç/manual payment tracking ayrı truth’tur.
* Bu iki alan birbirine karıştırılmaz.

Pending:

* Exact ücret yuvarlama kuralı henüz freeze değildir.
* Saniye bazlı mı, başlayan dakika mı, minimum süre var mı: unknown.

## 9. DB / Lifecycle Boundary

DB guardları:

* `broadcasts` yalnız public broadcast lifecycle için dar kalır.
* `broadcasts` içine 1v1 state girmez.
* `broadcasts` içine dakika state girmez.
* `broadcasts` içine payment state girmez.
* `broadcasts` içine chat state girmez.
* `broadcasts` içine publisher kazanç state girmez.
* `broadcasts` içine social state girmez.

V2 aileleri:

* `call_requests`
* `call_sessions`

Bu aileler V2 paid 1v1 çekirdeğine aittir.

Pending:

* Exact schema pending.
* Exact API pending.
* Exact migration pending.
* Exact enum/status isimleri pending.
* Final DB/API audit gerekir.

## 10. Non-goals

Bu contract’ın kapsamı değildir:

* implementation
* migration
* final ADR
* final route freeze
* Codex implementation promptu
* dashboard
* profil
* DM
* gift
* takip
* sosyal yüzey
* admin panel
* payment panel
* publisher kazanç paneli
* discovery redesign
* kalıcı mesaj geçmişi
* generic shared abstraction
* generic media abstraction
* `shared/ui` açmak
* generic `useLive.ts` açmak

## 11. Pending Decisions

Hâlâ açık kalan kararlar:

1. **User call sonrası dönüş UX’i**

   * ana sayfa mı?
   * `/live/[username]` güncel public state mi?

2. **Exact ücret yuvarlama kuralı**

   * saniye bazlı mı?
   * başlayan dakika mı?
   * minimum süre var mı?

3. **Exact DB/API karşılıkları**

   * `private_session_active`
   * finalized session duration
   * request/session status isimleri
   * active/ended reason metadata

4. **Exact UI metinleri**

   * permission denied
   * failed
   * timeout
   * minute exhausted
   * completed
   * call sonrası dönüş

5. **Technical spike sonucu**

   * `/live` → `/call` handoff
   * `/studio` → `/call` handoff
   * active timestamp
   * idempotent ending
   * iOS Safari / Android Chrome davranışı
   * public viewer fallback
   * discovery visibility

## 12. Readiness

Bu doc draft **ana V2 penceresine taşınmaya hazırdır**.

Taşınırken şu statüyle taşınmalı:

```text
Draft / owner-product-lock-aligned / not final ADR / not implementation
```

Repo doc-only PR öncesi gereken denetim:

* Canonical docs ile tekrar uyum kontrolü
* DB/API audit ile schema boundary kontrolü
* Route-local dosya disiplini kontrolü
* Owner pending decisions listesinin güncellenmesi
* Technical spike sonuçlarının ayrı evidence olarak eklenmesi


