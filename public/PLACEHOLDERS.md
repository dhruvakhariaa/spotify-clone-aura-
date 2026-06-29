# 🖼️ Image placeholders — where to drop your own art

Anything in `public/` is served from the site root. Drop a file at the path
below and it appears automatically — no code changes. Until a file exists, the
app shows a labelled "Image slot" placeholder telling you exactly what goes
there (rendered by `src/components/app/PlaceholderImage.tsx`).

---

## 🏙️ Landing pixel city — `public/landing/`

The landing (`src/sections/Landing.tsx`) is an interactive pixel-art city. The
clickable "characters" are **hotspots positioned over figures already painted
into the city image** (so no separate sprite cut-outs are required).

| File | Size | Used for |
|------|------|----------|
| `landing/city.png` | landscape · ~1600×900 | Full-bleed hero scene (currently `final-city.png`) |

**Hotspot positions** live in `CONCEPTS` in
[`src/components/landing/concepts.tsx`](../src/components/landing/concepts.tsx)
as `x`/`y` percentages — nudge them if you swap the city image so each pin sits
over the right character.

**Optional — free-roaming sprites:** `CityCharacter` accepts a `spriteSrc` prop.
Drop **clean, transparent-background PNG** sprites into `public/landing/characters/`
and pass them through to turn hotspots into walking characters.

> ⚠️ The reference sprites (`public/references/pixel-character{1,2,3}.jpg`,
> `characters.webp`) are **watermarked stock on white backgrounds** — not usable
> as-is (the white box + watermark would show). They need a background-knockout +
> watermark crop before they can be used as `spriteSrc`. The three of them (cat
> DJ, guitarist, singer) already appear cleanly inside `city.png`, which is why
> the landing uses in-art hotspots by default.

> Tip: keep files reasonably small (≤ ~400 KB). JPG/PNG/WebP all work — the
> paths below use `.jpg`; if you use a different extension, rename to `.jpg`
> or update the path in the matching data file.

---

## 🎤 Concerts — `public/concerts/<concert-id>/`

Concert ids live in [`src/data/concerts.ts`](../src/data/concerts.ts):
`mumbai-arijit`, `bengaluru-indie`, `hyderabad-south`.

For **each** concert id, add:

| File | Ratio / size | Used on |
|------|--------------|---------|
| `hero.jpg` | 16:9 · ~1600×900 | Detail page hero + list card + "Now staging" |
| `1.jpg` | 4:5 · ~800×1000 | Gallery ("From the pit") |
| `2.jpg` | 4:5 · ~800×1000 | Gallery |
| `3.jpg` | 4:5 · ~800×1000 | Gallery |

Example: `public/concerts/mumbai-arijit/hero.jpg`

## 🗣️ Testimonial avatars — `public/concerts/testimonials/`

| File | Size | Used on |
|------|------|---------|
| `1.jpg` … `9.jpg` | square · ~200×200 | Fan testimonial cards (3 per concert) |

## 😂 Pay meme — `public/memes/`

| File | Size | Used on |
|------|------|---------|
| `pay.png` | square · ~1000×1000 | Full-screen celebration after pressing **Pay** |

Swap in whatever meme you like — it fills the success screen.

## 🧑‍🎤 Artist photos (optional override) — `public/artists/`

In-app artist photos are fetched automatically (Spotify proxy → iTunes). To pin
your **own** photo for any artist, drop a square JPG named by the artist's slug:

- slug = lowercase, every run of non-alphanumeric chars → a single hyphen
- `Arijit Singh` → `arijit-singh.jpg`
- `Billie Eilish` → `billie-eilish.jpg`
- `A.R. Rahman` → `a-r-rahman.jpg`

| File | Size |
|------|------|
| `public/artists/<slug>.jpg` | square · ~600×600 |

A local file always wins over the fetched image. (Slugging lives in
`artistSlug()` in [`src/lib/artistImage.ts`](../src/lib/artistImage.ts).)
