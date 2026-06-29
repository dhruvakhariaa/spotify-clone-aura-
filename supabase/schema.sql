create table if not exists artists (
  id text primary key,
  name text not null,
  spotify_artist_id text,
  category text,
  image text,
  sync_status text default 'pending',
  updated_at timestamptz default now()
);

create table if not exists tracks (
  id text primary key,
  spotify_id text,
  spotify_uri text,
  title text not null,
  artist_names text not null,
  artist_ids text[] default '{}',
  album text,
  artwork text,
  duration_sec integer,
  market text default 'IN',
  preview_url text,
  source_metadata jsonb default '{}',
  updated_at timestamptz default now()
);

create table if not exists playlists (
  id uuid primary key,
  user_id text not null,
  name text not null,
  description text default '',
  visibility text default 'private',
  aura_metadata jsonb default '{}',
  created_source text default 'manual',
  spotify_playlist_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists playlist_tracks (
  playlist_id uuid references playlists(id) on delete cascade,
  track_id text,
  track_snapshot jsonb,
  track_order integer not null default 0,
  added_at timestamptz default now(),
  primary key (playlist_id, track_id)
);

create table if not exists karaoke_assets (
  track_id text primary key references tracks(id) on delete cascade,
  instrumental_url text not null,
  provider text not null default 'demucs',
  status text not null default 'pending',
  cost_metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- Per-user data (tied to Supabase Auth users, including anonymous "guest" users)
-- ============================================================================

-- One Aura snapshot per user.
create table if not exists auras (
  user_id text primary key,
  aura jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Liked songs, keyed by user.
create table if not exists likes (
  user_id text not null,
  track_id text not null,
  track_snapshot jsonb,
  liked_at timestamptz default now(),
  primary key (user_id, track_id)
);

-- ============================================================================
-- Row Level Security: each user can only see/modify their own rows.
-- `user_id` is stored as text; auth.uid() is a uuid, so we compare as text.
-- The shared catalog tables (artists, tracks, karaoke_assets) deliberately keep
-- RLS off so the Universe cache can be upserted by any signed-in client.
-- ============================================================================

alter table playlists       enable row level security;
alter table playlist_tracks enable row level security;
alter table auras           enable row level security;
alter table likes           enable row level security;

-- playlists: owner-only
drop policy if exists "playlists_owner" on playlists;
create policy "playlists_owner" on playlists
  for all
  using  (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

-- playlist_tracks: access governed by the parent playlist's owner
drop policy if exists "playlist_tracks_owner" on playlist_tracks;
create policy "playlist_tracks_owner" on playlist_tracks
  for all
  using (
    exists (select 1 from playlists p where p.id = playlist_id and p.user_id = auth.uid()::text)
  )
  with check (
    exists (select 1 from playlists p where p.id = playlist_id and p.user_id = auth.uid()::text)
  );

-- auras: owner-only
drop policy if exists "auras_owner" on auras;
create policy "auras_owner" on auras
  for all
  using  (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

-- likes: owner-only
drop policy if exists "likes_owner" on likes;
create policy "likes_owner" on likes
  for all
  using  (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
