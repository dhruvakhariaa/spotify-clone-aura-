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
