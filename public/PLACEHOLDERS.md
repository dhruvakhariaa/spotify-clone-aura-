# 🖼️ Image placeholders — where to drop your own art

Anything in `public/` is served from the site root. Drop a file at the path
below and it appears automatically — no code changes. Until a file exists, the
app shows a labelled "Image slot" placeholder telling you exactly what goes
there (rendered by `src/components/app/PlaceholderImage.tsx`).

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
