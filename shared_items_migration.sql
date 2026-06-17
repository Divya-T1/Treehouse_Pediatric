-- Run this once in your Supabase SQL editor to enable the sharing feature.

create table if not exists shared_items (
  id          uuid primary key default gen_random_uuid(),
  share_code  text unique not null,
  shared_by   uuid references auth.users(id) on delete cascade,
  item_type   text not null default 'activities',
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);

alter table shared_items enable row level security;

-- Any authenticated user can look up a share by code.
-- The 8-char code is the access-control mechanism.
create policy "authenticated_read_shared_items"
  on shared_items for select
  to authenticated
  using (true);

-- Users can only create shares under their own user_id.
create policy "users_insert_own_shares"
  on shared_items for insert
  to authenticated
  with check (shared_by = auth.uid());

-- Users can only delete their own shares.
create policy "users_delete_own_shares"
  on shared_items for delete
  to authenticated
  using (shared_by = auth.uid());

-- Optional periodic cleanup (run via Supabase cron or manually):
-- delete from shared_items where expires_at < now();
