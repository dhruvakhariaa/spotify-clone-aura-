UI audio asset slots
====================

Put button and reveal audio files here, then wire them in `src/lib/reactions.ts`
inside `REACTION_AUDIO_FILES`.

Recommended filenames:
- `tap.mp3`
- `select.mp3`
- `flip.mp3`
- `next.mp3`
- `wow.mp3`
- `romance.mp3`
- `night.mp3`
- `success.mp3`
- `laugh.mp3`

Current wired files:
- `mouse-click-sound.mp3` -> global website/app click tone (`tap`)
- `careles-romance.mp3` -> Aura reveal "Find your Soulmate" (`soulmate`)
- `acha-ji-aisa-hai-kya.mp3` -> Aura reveal "Make your own" (`make`)

Example mapping in `src/lib/reactions.ts`:

```ts
export const REACTION_AUDIO_FILES = {
  tap: "/audio/ui/tap.mp3",
  flip: "/audio/ui/flip.mp3",
  laugh: "/audio/ui/laugh.mp3",
};
```
