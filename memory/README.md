# ycarissan.github.io

## Supabase integration

Quick steps to enable remote best-score saving using Supabase:

1. Create a project on https://supabase.com and note the **Project URL** and **anon public API key** (Settings → API).
2. Create the `scores` table. Use the SQL editor and run the following:

```
create table scores (
	id bigint generated always as identity primary key,
	username text,
	score integer not null,
	size text,
	timestamp timestamptz default now(),
	device_id text,
	verified boolean default false,
	meta jsonb
);
```

3. For a quick dev setup allow anonymous inserts (development only):

```
-- If you want Row Level Security enabled, run:
alter table public.scores enable row level security;
create policy "anon insert" on public.scores for insert using (true);

-- Or in the Supabase UI set the table to allow inserts from the anon role.
```

4. In `index.html` the Supabase client is included via CDN. Edit `record.js`: set `ENABLE_SUPABASE = true`, and replace `SUPABASE_URL` / `SUPABASE_ANON_KEY` with your project values.

5. The code will prompt the player for a name when a new best score is saved and attempt to insert a row into `scores`.

Notes:
- For production, enable authentication (Supabase Auth) and tighten RLS policies to avoid spam/fraud. Consider server-side verification for anti-cheat.
- Monitor usage and set quotas to control costs.
