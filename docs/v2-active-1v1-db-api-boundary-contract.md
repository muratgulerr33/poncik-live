
# V2 Active 1v1 DB/API Boundary Contract Draft

---

# 2. Status

**Draft / DB-API-boundary-contract / owner-product-lock-aligned / not implementation**

Bu doküman:

* migration değildir
* exact schema freeze değildir
* exact Drizzle field listesi değildir
* exact API implementation değildir
* final ADR değildir
* Codex promptu değildir

---

# 3. Purpose

Bu taslak, Poncik Live V2 active 1v1 için DB/API sınırlarını netleştirir.

Amaç:

* V2 DB ailelerini V1 core’dan ayırmak
* `broadcasts` tablosunu dar public broadcast lifecycle olarak korumak
* call request/session lifecycle sınırını çizmek
* backend timestamp truth’unu netleştirmek
* minute ledger ile publisher earning ayrımını korumak
* API transition ve idempotency guardlarını contract seviyesinde tanımlamak

---

# 4. Source of truth summary

## Canonical truth

V1/V2 DB modeli single-role ve dar tutulur. V2 extension aileleri V1 core’a sızmaz; payment/minute ailesi ve paid 1v1 ailesi ayrı eklenir. `broadcasts` dar lifecycle tablosudur; chat, 1v1, payment, sosyal state ve benzeri alanları taşımaz. 

Current repo schema hâlâ V1 core aileleriyle sınırlıdır: `accounts`, `auth_sessions`, `broadcasts`, `cover_images`, `publisher_applications`, `publisher_settings`. 

Current `broadcasts` schema dar public lifecycle taşır: publisher id, status, started/ended timestamps ve temel timestamps. 

## Owner lock

* `/live/[username]` public watch + telefon ikonu / 1v1 request başlangıcıdır.
* `/studio` incoming request + kabul/ret yüzeyidir.
* `/call/[sessionId]` yalnız active private 1v1 yüzeyidir.
* Dakika kamera/mikrofonla değil backend `private_session_active` timestamp ile başlar.
* Client timer billing truth değildir.
* 1v1 chat DM/public chat/kalıcı geçmiş değildir.
* `broadcasts` içine 1v1, dakika, payment, chat, publisher kazanç veya social state girmez.
* `call_requests` / `call_sessions` V2 paid 1v1 ailesidir. 

## Audit decision

* Publisher 1v1 accept edince public broadcast aktif canlı olmaktan çıkar.
* “ended” yaklaşımı en düşük refactor riskli adaydır.
* Exact status/enum freeze değildir.
* Call bitince public broadcast otomatik geri dönmez.
* User call sonunda kısa feedback görür ve `/` ana sayfaya yönlenir.
* Backend raw active duration saniye bazlı tutulur.
* V2 başlangıç billing rule adayı: active yoksa 0; active varsa başlayan dakika, minimum 1 dakika.

## Unknown

* exact schema / field names
* exact enum names
* exact constraints
* exact API endpoint design
* exact payment approval flow
* exact publisher earning / payout model
* exact LiveKit private call token / handoff sequence
* technical spike sonucu

---

# 5. DB family boundary

| family                                           | purpose                                            | taşıdığı truth                                                                             | taşımaması gereken şey                                                                 | V1’den ayrımı                           | exact schema freeze mi? |
| ------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| `call_requests`                                  | User’ın publisher’a 1v1 isteği açması              | request lifecycle, requester user, target publisher, request timestamps                    | active duration, dakika düşümü, publisher kazanç, chat history, public broadcast state | V2 paid 1v1 request ailesidir           | Hayır                   |
| `call_sessions`                                  | Publisher accept sonrası private session lifecycle | accepted/active/ended/finalized session truth, active timestamp, finalized duration source | user wallet, publisher payout, public broadcast lifecycle, kalıcı chat                 | V2 active call çekirdeğidir             | Hayır                   |
| `minute_packages`                                | Satılabilir dakika paketleri                       | paket, dakika miktarı, fiyat/paket truth                                                   | call session lifecycle, publisher kazanç, public broadcast                             | V2 payment/minute ailesidir             | Hayır                   |
| `minute_orders`                                  | User dakika satın alma siparişi                    | order lifecycle, user, package, ödeme niyeti                                               | wallet ana truth, publisher kazanç, call state                                         | payment approval hattına bağlanır       | Hayır                   |
| `bank_transfer_orders` / payment approval ailesi | Manuel ödeme onay takibi                           | banka/havale ödeme durumu, admin approval izi                                              | call session, active duration, broadcast state                                         | V2 payment operasyon ailesidir          | Hayır                   |
| `minute_wallets`                                 | User dakika bakiyesi özeti                         | user balance snapshot                                                                      | publisher earning, payout, call request state                                          | User minute truth’tur                   | Hayır                   |
| `minute_ledger_entries`                          | Dakika hareket defteri                             | credit/debit history, source order/session                                                 | publisher payout, public broadcast, chat                                               | Wallet audit trail’idir                 | Hayır                   |
| publisher earning source ailesi                  | Publisher kazanç kaynağı                           | finalized active session duration’dan türeyen earning source                               | user wallet, user ledger, bank order                                                   | Publisher earning truth ayrı kalır      | Hayır                   |
| publisher manual payment tracking ailesi         | Publisher’a manuel ödeme/payout operasyonu         | payout period/status/manual settlement                                                     | user minute debit, call active truth                                                   | Banka sistemi değil, operasyon tracking | Hayır                   |
| `broadcasts`                                     | Public broadcast lifecycle                         | public live status, started/ended truth                                                    | 1v1, dakika, payment, chat, kazanç, social state                                       | V1 public broadcast core olarak kalır   | V2 için yeni freeze yok |

---

# 6. Lifecycle boundary

## Request lifecycle — aday, enum freeze değil

Aday akış:

```text
requested → accepted / rejected / cancelled / expired / failed
```

Kurallar:

* `requested`: logged-in user tarafından açılır.
* `accepted`: yalnız target approved publisher kabul eder.
* `rejected`: publisher reddeder, finansal etki yoktur.
* `cancelled`: user active öncesi iptal eder, finansal etki yoktur.
* `expired / timeout`: active olmadan zaman aşımıdır, finansal etki yoktur.
* `failed`: active olmadıysa finansal etki yoktur.

## Session lifecycle — aday, enum freeze değil

Aday akış:

```text
created_after_accept → activating → active → ending → finalized
```

Yan sonuçlar:

```text
failed_before_active
timeout_before_active
ended_after_active
minute_exhausted_after_active
```

Kurallar:

* Active öncesi failed/timeout/cancel sonuçları dakika veya publisher kazanç üretmez.
* Active sonrası completed/failed/minute_exhausted sonuçları finalized duration üretir.
* Active session truth backend timestamp ile başlar.
* Client timer sadece görseldir.

## Ended reason semantics — aday, enum freeze değil

Aday reason grupları:

* user ended
* publisher ended
* system timeout
* technical failed
* minute exhausted

Bu reason grupları schema/enum freeze değildir. Sadece DB/API contract seviyesinde ayrılması gereken anlamlardır.

---

# 7. Timestamp truth boundary

Bu timestamp isimleri **exact field freeze değildir**. Contract seviyesinde truth ayrımıdır.

| timestamp                   | event                                    | truth kaynağı | dakika etkisi                                          | kazanç etkisi                                          | risk                                           |
| --------------------------- | ---------------------------------------- | ------------- | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------- |
| `requested_at`              | user request create                      | Server        | Yok                                                    | Yok                                                    | Request açıldı diye dakika düşülmemeli         |
| `accepted_at`               | publisher accept                         | Server        | Henüz yok                                              | Henüz yok                                              | Accept ile active karışırsa erken billing olur |
| `private_session_active_at` | backend active session truth oluşturunca | **Server**    | Dakika başlangıcı                                      | Kazanç duration başlangıcı                             | Client/media event truth yapılmamalı           |
| `ended_at`                  | active session bittiğinde                | Server        | Duration kapanışı                                      | Duration kapanışı                                      | Double end duration bozabilir                  |
| `finalized_at`              | ledger/earning final yazımı tamamlanınca | Server        | Debit güvenli olur                                     | Earning source güvenli olur                            | Double finalize çift yazım riski               |
| `cancelled_at`              | active öncesi user cancel                | Server        | Yok                                                    | Yok                                                    | Cancel/accept race                             |
| `rejected_at`               | publisher reject                         | Server        | Yok                                                    | Yok                                                    | Reject finansal etki üretmemeli                |
| `timeout_at`                | timeout oluşunca                         | Server        | Active öncesi yok; active sonrası finalize gerekebilir | Active öncesi yok; active sonrası finalize gerekebilir | Timeout öncesi/sonrası ayrımı şart             |

---

# 8. API transition boundary

| transition                             | actor                     | backend guard                                                               | DB etkisi                                                | idempotency guard                             | unknown                       |
| -------------------------------------- | ------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------- | ----------------------------- |
| user request create                    | logged-in user            | role user, active account, yeterli dakika/bakiye, target approved publisher | `call_requests` requested                                | aynı pending request tekrarını engelle        | request expiry                |
| user request cancel                    | request owner user        | request pending olmalı                                                      | request cancelled                                        | accepted/active olmuş request cancel edilemez | UX copy                       |
| publisher incoming read                | target approved publisher | sadece kendi incoming requestleri                                           | read-only                                                | write yok                                     | polling/realtime              |
| publisher reject                       | target approved publisher | request pending + ownership                                                 | request rejected                                         | tekrar reject noop                            | reject reason gerekir mi      |
| publisher accept                       | target approved publisher | request pending, one-active-call guard, user balance hâlâ yeterli           | request accepted + session candidate                     | double accept tek session üretmeli            | exact transaction/constraint  |
| one-active-call guard                  | backend                   | publisher için active/activating session yok                                | ikinci active engellenir                                 | transaction/unique guard                      | exact constraint              |
| public broadcast active canlıdan düşme | backend                   | publisher public live ise                                                   | public broadcast aktif canlı olmaktan çıkar              | tekrar drop state bozmaz                      | ended/derived exact status    |
| private active timestamp create        | backend/system            | session accepted/activating                                                 | active timestamp set                                     | timestamp overwrite yok                       | LiveKit handoff sırası        |
| session end/finalize                   | user/publisher/system     | session active olmalı                                                       | ended/finalized duration                                 | double finalize yok                           | end reason seti               |
| failed/timeout handling                | backend/system            | active öncesi/sonrası ayrılır                                               | active öncesi finansal etki yok; active sonrası finalize | tekrar failure noop                           | timeout süreleri              |
| minute ledger debit                    | backend finalize          | finalized active duration                                                   | debit ledger entry                                       | source session unique                         | rounding exact implementation |
| publisher earning source write         | backend finalize          | finalized paid active duration                                              | earning source entry                                     | source session unique                         | rate/payout model             |
| public viewer fallback read/signal     | public watch read/API     | public broadcast artık aktif canlı değil                                    | fallback read sonucu                                     | tekrar signal sorun çıkarmaz                  | exact read model              |

---

# 9. Idempotency and authorization boundary

## Idempotency

Kurallar:

* Double accept tek session üretmeli.
* Double active timestamp overwrite etmemeli.
* Double end/finalize iki kez dakika düşmemeli.
* Publisher earning iki kez yazılmamalı.
* Public broadcast visibility iki kez bozulmamalı.
* Active öncesi failed/timeout finansal etki üretmemeli.
* Ledger debit ve publisher earning source aynı finalized session için tekil olmalı.
* Cancel/reject/timeout sonrası accept race engellenmeli.

## Authorization

Kurallar:

* 1v1 request sadece logged-in `user` tarafından açılır.
* Guest public yayını izleyebilir ama 1v1 request açamaz.
* Publisher accept/reject sadece target approved publisher tarafından yapılır.
* `/call/[sessionId]` sadece session tarafları tarafından erişilebilir.
* Ended/finalized session tekrar active call gibi açılamaz.
* Admin için ayrı auth route açılmaz.
* Payment approval admin operation olarak ayrı tutulur; shared auth ve admin role guard ile çözülür.

---

# 10. Public broadcast / discovery boundary

Kurallar:

* Publisher 1v1 accept ettiğinde public broadcast aktif canlı olmaktan çıkar.
* Private call detail, session id, dakika, payment, chat veya earning state `broadcasts` içine girmez.
* Call bitince public broadcast otomatik geri dönmez.
* Publisher `/studio` içinde güvenli idle/prep state’e döner.
* Public viewer fallback görür ve 5 saniye sonra `/` ana sayfaya yönlenir.
* Discovery call state’e direkt bağlanmaz.
* Discovery public broadcast visibility/lifecycle read modelinden beslenir.
* “Ended” yaklaşımı en düşük refactor riskli güçlü adaydır.
* `hidden`, `unavailable`, `private_call` gibi yeni statuslar açmak `broadcasts` içine V2/private anlam sızdırabilir.
* Exact status/enum freeze değildir.

---

# 11. Billing / earning boundary

## Minute / billing

Kurallar:

* Client timer billing truth değildir.
* Billing source backend active/finalized session truth’udur.
* Raw active duration saniye bazlı saklanır.
* Billed minute derived finansal değerdir.
* Active başlamadıysa 0 dakika.
* Active başladıysa V2 başlangıç billing rule adayı: başlayan dakika, minimum 1 dakika.
* Exact rounding implementation değildir; billing-ledger audit’te netleşir.
* Ledger write backend finalize transition’dan beslenir.
* Double debit engellenmelidir.
* Failed/timeout active öncesiyse dakika düşmez.

## Publisher earning / manual payment

Kurallar:

* Publisher earning finalized active session duration’dan türeyebilir.
* Publisher earning user minute ledger değildir.
* User minute debit ile publisher earning source aynı aileye yazılmaz.
* Manual payment tracking banka sistemi değildir.
* Publisher payout/payment tracking ayrı operasyon truth’u olmalıdır.
* Exact table/field/model pending kalır.
* Double earning source write engellenmelidir.

---

# 12. Non-goals

Bu contract’ın kapsamı değildir:

* migration
* exact schema
* exact Drizzle field listesi
* exact enum names
* exact constraint design
* exact API implementation
* route açmak
* Codex promptu
* final ADR
* DM
* gift
* social/growth
* dashboard
* public chat persistence
* 1v1 chat history
* `broadcasts` şişirme
* `account_roles`
* multi-role
* separate admin auth route
* generic shared abstraction

---

# 13. Pending decisions

Gerçek açıklar:

1. Exact schema / field names.
2. Exact status enum names.
3. Exact DB constraints.
4. Exact transaction boundaries.
5. Exact payment approval flow.
6. Exact publisher earning / payout model.
7. Exact LiveKit private call token / handoff sequence.
8. Exact request timeout durations.
9. Exact minute exhausted behavior.
10. Technical spike result.

---

# 14. Readiness

## Bu doc draft repo doc-only PR adayı mı?

**Evet, doc-only PR adayı olabilir.**

Statüsü şu şekilde kalmalı:

```text
Draft / DB-API-boundary-contract / owner-product-lock-aligned / not implementation
```

## Önce başka owner karar gerekir mi?

DB/API contract doc draft için **hayır**.

Migration veya implementation için **evet**, hâlâ şu alanlar kapanmalı:

* exact schema
* exact enum/status
* exact constraints
* exact API handoff
* exact payment/earning model
* technical spike evidence


