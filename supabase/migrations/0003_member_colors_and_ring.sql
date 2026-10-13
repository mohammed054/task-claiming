-- Member colours + the shared position of the contribution ring.
-- ADDITIVE AND SAFE TO RE-RUN: it only adds a nullable column and a new table.
-- It does not touch, rewrite or delete any existing row.

-- ---------------------------------------------------------------- member colour
alter table members add column if not exists color text;

alter table members drop constraint if exists members_color_format;
alter table members add constraint members_color_format
  check (color is null or color ~ '^#[0-9a-fA-F]{6}$');

-- two people cannot hold the same colour (existing rows are all null, so this cannot fail)
create unique index if not exists members_color_key on members (lower(color)) where color is not null;

-- ---------------------------------------------------------------- shared board settings
create table if not exists board_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references members (id) on delete set null
);

alter table board_settings enable row level security;
drop policy if exists "open access" on board_settings;
create policy "open access" on board_settings for all to anon, authenticated using (true) with check (true);
grant select, insert, update, delete on board_settings to anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table board_settings;
exception when duplicate_object then null;
end $$;
