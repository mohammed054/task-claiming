
-- Placeholder data so the app has something to show.
-- Delete it from the Manage page (or run `delete from blocks;`) once you import the real list.

insert into blocks (code, name, description, position) values
  ('A', 'Foundation', 'Repository, tooling and project conventions.', 1),
  ('B', 'Backend', 'Data model, services and APIs.', 2),
  ('C', 'Frontend', 'Design system, layout and screens.', 3),
  ('D', 'Release', 'Pipelines, deployment and launch.', 4);

insert into tasks (block_id, code, title, description, acceptance_criteria, estimate, priority, tags, position)
select b.id, v.code, v.title, v.description, v.criteria, v.estimate, v.priority, v.tags, v.position
from (values
  ('A', 'A-01', 'Folder structure', 'Lay out the top-level folders for apps, packages and docs.', E'- Layout documented in README\n- Folders committed with placeholder files', '1h', 'high', array['setup'], 1),
  ('A', 'A-02', 'package.json', 'Create the root package.json with scripts and workspaces.', E'- install, build and test scripts run\n- Workspaces resolve', '1h', 'high', array['setup'], 2),
  ('A', 'A-03', 'TypeScript and lint config', 'Shared tsconfig, ESLint and formatting rules.', E'- Lint and typecheck pass on a clean checkout', '2h', 'medium', array['setup', 'tooling'], 3),
  ('B', 'B-01', 'Database schema', 'Design and migrate the core tables.', E'- Migrations apply on a fresh database\n- ERD added to docs', '4h', 'critical', array['database'], 1),
  ('B', 'B-02', 'Auth service', 'Sessions, roles and access checks.', E'- Protected routes reject anonymous calls', '6h', 'high', array['security'], 2),
  ('B', 'B-03', 'API routes', 'CRUD endpoints for the core entities.', E'- Endpoints documented\n- Integration tests green', '8h', 'high', array['api'], 3),
  ('C', 'C-01', 'Design system', 'Tokens, typography and base components.', E'- Components documented with usage notes', '6h', 'medium', array['design'], 1),
  ('C', 'C-02', 'Layout shell', 'App shell with navigation and responsive behaviour.', E'- Works from phone to desktop widths', '4h', 'medium', array['ui'], 2),
  ('C', 'C-03', 'Dashboard screen', 'First real screen using the API.', E'- Loads real data\n- Empty and error states handled', '8h', 'medium', array['ui'], 3),
  ('D', 'D-01', 'CI pipeline', 'Build, lint and test on every push.', E'- Pipeline blocks merges on failure', '3h', 'medium', array['devops'], 1),
  ('D', 'D-02', 'Staging deploy', 'Automatic deploy of main to staging.', E'- Staging URL updates on merge', '4h', 'high', array['devops'], 2),
  ('D', 'D-03', 'Launch checklist', 'Final verification before go-live.', E'- Every checklist item signed off', '2h', 'critical', array['release'], 3)
) as v(block_code, code, title, description, criteria, estimate, priority, tags, position)
join blocks b on b.code = v.block_code;

insert into task_dependencies (task_id, depends_on_id)
select t.id, d.id
from (values
  ('A-02', 'A-01'),
  ('A-03', 'A-02'),
  ('B-01', 'A-02'),
  ('B-02', 'B-01'),
  ('B-03', 'B-01'),
  ('B-03', 'B-02'),
  ('C-01', 'A-03'),
  ('C-02', 'C-01'),
  ('C-03', 'C-02'),
  ('C-03', 'B-03'),
  ('D-01', 'A-03'),
  ('D-02', 'D-01'),
  ('D-02', 'C-03'),
  ('D-03', 'D-02')
) as v(task_code, dep_code)
join tasks t on t.code = v.task_code
join tasks d on d.code = v.dep_code;
