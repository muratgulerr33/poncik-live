# Live Watch In-Scene Chat Alignment Tur 4B Close-out

## 1. Short verdict

PASS WITH NOTES.

This is not global chat completion.
This close-out only covers `/live/[username]` in-scene chat alignment, guest CTA, logged-in user composer gate, route-local history/composer surface polish, stretch/blur fix, and final mobile polish.

## 2. Scope covered

- `/live/[username]` route-local chat owner/surface/controller line was added or aligned.
- Guest can watch.
- Guest can see the read surface.
- Guest does not see a composer.
- Guest does not see a disabled composer.
- Guest sees the soft CTA: `Yorum yapmak için giriş yap`.
- CTA routes to `/auth`.
- CTA is not an auth wall.
- CTA is not a modal or sheet.
- CTA is not a history row.
- CTA is not an input/composer.
- Logged-in user composer is shown only when a real `viewerUsername` source exists.
- No fake username fallback exists.
- No `Sen`, `User`, `Viewer`, `anonymous`, or `guest` fallback exists.
- History item format follows Studio Tur 3 visual/behavior contract:
  - username on the first line
  - message content on the second line
  - no avatar
  - no fake/system row
- Long message wrapping and horizontal overflow behavior were handled.
- Composer remains a single-line bottom dock.
- Composer stretch/blur bug was fixed through explicit chat grid row placement.
- Follow-up polish improved mobile history spacing, send button breathing room, and guest CTA contrast.

## 3. Scope not covered

- Realtime chat
- LiveKit data channel
- `publishData`
- `RoomEvent.DataReceived`
- Message payload protocol
- Persisted chat history
- DB/schema/migration
- `/studio` mutation
- Shared/global chat abstraction
- Generic chat abstraction
- Moderation/report/gift/reaction/typing/DM
- V2/V3 breadth
- Global chat completion

## 4. Changed files

Current tracked `git diff --name-status` output before staging:

- `M src/app/(public)/live/[username]/_components/LiveWatchPlaybackSurface.tsx`
- `M src/app/(public)/live/[username]/_controllers/LiveWatchPlaybackController.tsx`
- `M src/app/(public)/live/[username]/_controllers/live-watch-controller.tsx`

Final close-out source set:

- `src/app/(public)/live/[username]/_components/LiveWatchChatSurface.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchPlaybackSurface.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-chat.module.css`
- `src/app/(public)/live/[username]/_controllers/LiveWatchChatController.tsx`
- `src/app/(public)/live/[username]/_controllers/LiveWatchPlaybackController.tsx`
- `src/app/(public)/live/[username]/_controllers/live-watch-controller.tsx`
- `docs/live-watch-in-scene-chat-alignment-tur-4b-closeout.md`

## 5. Follow-up notes included

- After the initial Tur 4B alignment, a composer backdrop/stretch bug was observed.
- The root cause was not `backdrop-filter`.
- The root cause was chat grid auto-placement / row placement.
- It was fixed by explicitly placing history, composer, and guest action dock into stable grid rows.
- A later CSS-only polish pass improved send button breathing room, mobile history spacing, and guest CTA contrast.
- These follow-ups did not expand scope outside the route-local Live Watch chat surface.

## 6. Manual smoke summary

Owner-reported/manual smoke:

- Red Mi Note 11 Pro Android Chrome was used for `/live/[username]` watch testing.
- MacBook publisher camera source was used during real-device checks.
- Guest CTA appeared after clean guest state.
- Guest CTA did not look or behave like a composer/input.
- Logged-in user composer appeared.
- Send button no longer looked tightly squeezed.
- Composer stayed as a small bottom dock with keyboard open.
- Composer stretch/blur did not return.
- Long messages wrapped without horizontal overflow.
- Username/message visual separation was preserved.
- Video geometry, top chrome, and black letterbox were preserved.

## 7. Known notes

- Because Tur 4B does not include realtime, guest read surface can be empty until Tur 5 realtime seam.
- Local UI smoke is not realtime delivery.
- Long single-word breaking is accepted as safer than horizontal overflow.
- History can sometimes sit across the video/black-letterbox boundary; media geometry was intentionally not changed.
- Tur 5 realtime seam must not bloat the current controller with transport concerns; it needs a separate narrow turn.

## 8. Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## 9. Commit

Commit message:

`live: close out in-scene chat alignment tur 4b`
