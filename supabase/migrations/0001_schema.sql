-- Task claiming platform: schema, rules and realtime.
-- No auth by design: anyone with the site URL can read and write. Keep the URL internal.

-- ---------------------------------------------------------------- types
create type task_status as enum ('open', 'claimed', 'in_progress', 'done');
create type request_status as enum ('pending', 'approved', 'declined', 'cancelled');

-- ---------------------------------------------------------------- tables
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);
create unique index members_name_key on members (lower(trim(name)));

create table blocks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references blocks (id) on delete cascade,
  code text not null unique,
  title text not null,
  description text not null default '',
  acceptance_criteria text not null default '',
  estimate text not null default '',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  tags text[] not null default '{}',
  links jsonb not null default '[]'::jsonb,
  notes text not null default '',
  status task_status not null default 'open',
  claimed_by uuid references members (id) on delete set null,
  claimed_at timestamptz,
  completed_at timestamptz,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_block_idx on tasks (block_id, position);
create index tasks_claimed_by_idx on tasks (claimed_by);

create table task_dependencies (
  task_id uuid not null references tasks (id) on delete cascade,
  depends_on_id uuid not null references tasks (id) on delete cascade,
  primary key (task_id, depends_on_id),
  check (task_id <> depends_on_id)
);
create index task_dependencies_dep_idx on task_dependencies (depends_on_id);

create table claim_requests (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks (id) on delete cascade,
  requester_id uuid not null references members (id) on delete cascade,
  message text not null default '',
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create unique index claim_requests_one_pending
  on claim_requests (task_id, requester_id) where status = 'pending';

create table activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks (id) on delete cascade,
  member_id uuid references members (id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_created_idx on activity (created_at desc);
create index activity_task_idx on activity (task_id, created_at desc);

-- ---------------------------------------------------------------- triggers
create function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger tasks_touch before update on tasks
  for each row execute function touch_updated_at();

create function prevent_dependency_cycle() returns trigger language plpgsql as $$
begin
  if new.task_id = new.depends_on_id then
    raise exception 'A task cannot depend on itself';
  end if;
  if exists (
    with recursive chain (id) as (
      select depends_on_id from task_dependencies where task_id = new.depends_on_id
      union
      select d.depends_on_id from task_dependencies d join chain c on d.task_id = c.id
    )
    select 1 from chain where id = new.task_id
  ) then
    raise exception 'This dependency would create a loop';
  end if;
  return new;
end $$;

create trigger task_dependencies_no_cycle before insert on task_dependencies
  for each row execute function prevent_dependency_cycle();

-- ---------------------------------------------------------------- helpers
create function task_is_unlocked(p_task uuid) returns boolean
language sql stable as $$
  select not exists (
    select 1
    from task_dependencies d
    join tasks dep on dep.id = d.depends_on_id
    where d.task_id = p_task and dep.status <> 'done'
  );
$$;

-- ---------------------------------------------------------------- actions
-- Every state change goes through these functions so rules hold even when two
-- people click at the same moment (rows are locked while they run).

create function claim_task(p_task uuid, p_member uuid) returns tasks
language plpgsql as $$
declare t tasks;
begin
  select * into t from tasks where id = p_task for update;
  if not found then raise exception 'Task not found'; end if;
  if t.status <> 'open' then raise exception 'This task has already been claimed'; end if;
  if not task_is_unlocked(p_task) then
    raise exception 'This task is still waiting on its dependencies';
  end if;

  update tasks
     set status = 'claimed', claimed_by = p_member, claimed_at = now(), completed_at = null
   where id = p_task
   returning * into t;

  update claim_requests set status = 'cancelled', resolved_at = now()
   where task_id = p_task and status = 'pending';

  insert into activity (task_id, member_id, action) values (p_task, p_member, 'claimed');
  return t;
end $$;

create function release_task(p_task uuid, p_member uuid) returns tasks
language plpgsql as $$
declare t tasks;
begin
  select * into t from tasks where id = p_task for update;
  if not found then raise exception 'Task not found'; end if;
  if t.claimed_by is distinct from p_member then raise exception 'Only the current owner can release this task'; end if;
  if t.status not in ('claimed', 'in_progress') then raise exception 'This task is not currently held'; end if;

  update tasks
     set status = 'open', claimed_by = null, claimed_at = null
   where id = p_task
   returning * into t;

  update claim_requests set status = 'cancelled', resolved_at = now()
   where task_id = p_task and status = 'pending';

  insert into activity (task_id, member_id, action) values (p_task, p_member, 'released');
  return t;
end $$;

create function start_task(p_task uuid, p_member uuid) returns tasks
language plpgsql as $$
declare t tasks;
begin
  select * into t from tasks where id = p_task for update;
  if not found then raise exception 'Task not found'; end if;
  if t.claimed_by is distinct from p_member then raise exception 'Only the current owner can start this task'; end if;
  if t.status <> 'claimed' then raise exception 'This task cannot be started from its current status'; end if;

  update tasks set status = 'in_progress' where id = p_task returning * into t;
  insert into activity (task_id, member_id, action) values (p_task, p_member, 'started');
  return t;
end $$;

create function complete_task(p_task uuid, p_member uuid) returns tasks
language plpgsql as $$
declare t tasks;
begin
  select * into t from tasks where id = p_task for update;
  if not found then raise exception 'Task not found'; end if;
  if t.claimed_by is distinct from p_member then raise exception 'Only the current owner can complete this task'; end if;
  if t.status not in ('claimed', 'in_progress') then raise exception 'This task cannot be completed from its current status'; end if;

  update tasks set status = 'done', completed_at = now() where id = p_task returning * into t;

  update claim_requests set status = 'cancelled', resolved_at = now()
   where task_id = p_task and status = 'pending';

  insert into activity (task_id, member_id, action) values (p_task, p_member, 'completed');
  return t;
end $$;

create function reopen_task(p_task uuid, p_member uuid) returns tasks
language plpgsql as $$
declare t tasks;
begin
  select * into t from tasks where id = p_task for update;
  if not found then raise exception 'Task not found'; end if;
  if t.claimed_by is distinct from p_member then raise exception 'Only the person who completed this task can reopen it'; end if;
  if t.status <> 'done' then raise exception 'Only finished tasks can be reopened'; end if;

  update tasks set status = 'in_progress', completed_at = null where id = p_task returning * into t;
  insert into activity (task_id, member_id, action) values (p_task, p_member, 'reopened');
  return t;
end $$;

create function request_claim(p_task uuid, p_member uuid, p_message text default '') returns claim_requests
language plpgsql as $$
declare t tasks; r claim_requests;
begin
  select * into t from tasks where id = p_task;
  if not found then raise exception 'Task not found'; end if;
  if t.status not in ('claimed', 'in_progress') then raise exception 'This task is not claimed, so you can claim it directly'; end if;
  if t.claimed_by = p_member then raise exception 'You already hold this task'; end if;

  begin
    insert into claim_requests (task_id, requester_id, message)
    values (p_task, p_member, coalesce(trim(p_message), ''))
    returning * into r;
  exception when unique_violation then
    raise exception 'You already have a pending request for this task';
  end;

  insert into activity (task_id, member_id, action, detail)
  values (p_task, p_member, 'requested', jsonb_build_object('to', t.claimed_by));
  return r;
end $$;

create function cancel_request(p_request uuid, p_member uuid) returns claim_requests
language plpgsql as $$
declare r claim_requests;
begin
  update claim_requests set status = 'cancelled', resolved_at = now()
   where id = p_request and requester_id = p_member and status = 'pending'
   returning * into r;
  if not found then raise exception 'Request not found or already resolved'; end if;
  return r;
end $$;

create function resolve_request(p_request uuid, p_member uuid, p_approve boolean) returns claim_requests
language plpgsql as $$
declare r claim_requests; t tasks;
begin
  select * into r from claim_requests where id = p_request for update;
  if not found or r.status <> 'pending' then raise exception 'Request not found or already resolved'; end if;

  select * into t from tasks where id = r.task_id for update;
  if t.claimed_by is distinct from p_member then raise exception 'Only the current owner can answer this request'; end if;

  if p_approve then
    update tasks
       set claimed_by = r.requester_id, claimed_at = now(), status = 'claimed', completed_at = null
     where id = t.id;
    update claim_requests set status = 'approved', resolved_at = now() where id = r.id returning * into r;
    insert into activity (task_id, member_id, action, detail)
    values (t.id, p_member, 'transferred', jsonb_build_object('to', r.requester_id));
  else
    update claim_requests set status = 'declined', resolved_at = now() where id = r.id returning * into r;
    insert into activity (task_id, member_id, action, detail)
    values (t.id, p_member, 'declined', jsonb_build_object('to', r.requester_id));
  end if;
  return r;
end $$;

-- ---------------------------------------------------------------- access
-- Open access: there are no passwords in this app.
do $$
declare tbl text;
begin
  foreach tbl in array array['members', 'blocks', 'tasks', 'task_dependencies', 'claim_requests', 'activity']
  loop
    execute format('alter table %I enable row level security', tbl);
    execute format(
      'create policy "open access" on %I for all to anon, authenticated using (true) with check (true)', tbl);
    execute format('grant select, insert, update, delete on %I to anon, authenticated', tbl);
  end loop;
end $$;

grant execute on all functions in schema public to anon, authenticated;

-- ---------------------------------------------------------------- realtime
do $$
declare tbl text;
begin
  foreach tbl in array array['members', 'blocks', 'tasks', 'task_dependencies', 'claim_requests', 'activity']
  loop
    begin
      execute format('alter publication supabase_realtime add table %I', tbl);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
