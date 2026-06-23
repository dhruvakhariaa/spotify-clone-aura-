Meme asset slots
================

Current wired examples:
- `public/memes/weeknd-over.png`
- `public/memes/midnight-squidward.png`

Recommended future convention:
- Artist memes: `public/memes/artists/<artist-slug>.png`
  Example: `public/memes/artists/the-weeknd.png`
- Mood memes: `public/memes/moods/<mood-id>.png`
  Example: `public/memes/moods/tender.png`
- Time memes: `public/memes/times/<time-id>.png`
  Example: `public/memes/times/midnight.png`
- Aura reveal memes: `public/memes/aura/<aura-or-cue-id>.png`

After adding a file, wire it in `src/lib/reactions.ts` by setting the cue's `image` path.
