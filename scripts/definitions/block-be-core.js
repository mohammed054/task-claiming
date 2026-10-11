// Block BE-CORE: Database Schema, Tables, Indexes, RLS Policies (~18 tasks)
module.exports = {
  block: {
    code: "BE-CORE",
    name: "Database Schema, Tables, Indexes & RLS Policies",
    description: "PostgreSQL schemas, identity and school tables, curriculum and content structures, assessment tables, gamification ledgers, AI system tables, security RLS policies, and core database indexes.",
  },
  tasks: [
    {
      code: "BE-CORE-01",
      block: "BE-CORE",
      title: "Core database setup, extensions, custom enums and helper domains",
      description: `### Goal
Initialize PostgreSQL database extensions (\`uuid-ossp\`, \`pgcrypto\`, \`citext\`), utility functions, and custom enum types specified in backend docs.

### Implementation Details
- Create migration for PostgreSQL extensions.
- Define custom enums:
  - User roles: \`user_role\` ('student', 'teacher', 'admin', 'super_admin')
  - Account status: \`user_status\` ('active', 'locked', 'archived')
  - Course status: \`content_status\` ('draft', 'published', 'archived')
  - Question types: \`question_type\` ('multiple_choice', 'fill_blank', 'matching', 'short_answer', 'reorder', 'audio_spelling', 'drag_drop')
  - Assessment kinds: \`assessment_kind\` ('quiz', 'assignment')
  - Submission status: \`submission_status\` ('in_progress', 'submitted', 'graded', 'returned')
- Create helper function \`app_now()\` for consistent time manipulation and testing.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_01_extensions_enums.sql\`
- **Conflict Prevention**: Keep enums modular and alphabetically organized.`,
      acceptance_criteria: `- Migration applies cleanly without errors on fresh Supabase instance.
- All required enum types created and queryable.
- \`app_now()\` returns current \`timestamptz\`.`,
      estimate: "1h",
      priority: "critical",
      tags: ["database", "enums", "sql"],
      links: [
        { label: "Core Enums", url: "backend/docs/02-DATA-MODEL-CORE.md#1-enums" },
        { label: "Engagement Enums", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#1-enums-part-2" }
      ],
      depends_on: ["FND-11"]
    },
    {
      code: "BE-CORE-02",
      block: "BE-CORE",
      title: "Identity and profile schema, user settings and admin notes tables",
      description: `### Goal
Create core user identity tables linking with \`auth.users\`, user preferences, and private administrative notes.

### Implementation Details
- Create table \`profiles\` (id uuid PK references auth.users on delete cascade, username citext unique, display_name text, role user_role, status user_status, avatar_url text, equipped_theme text, must_change_password boolean default false, created_at, updated_at).
- Create table \`user_settings\` (user_id uuid PK references profiles on delete cascade, sound_enabled boolean default true, effects_tier text default 'balanced', prefers_reduced_motion boolean default false, notifications_json jsonb, updated_at).
- Create table \`admin_notes\` (id uuid PK, user_id uuid references profiles, author_id uuid references profiles, note text, created_at).
- Add updated_at automatic timestamp triggers.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_02_identity_profiles.sql\`
- **Conflict Prevention**: Ensure cascading constraints don't cause orphaned records.`,
      acceptance_criteria: `- \`profiles\` table integrates with Supabase Auth users.
- Unique username constraints case-insensitive with \`citext\`.
- \`admin_notes\` accessible only to authorized staff.`,
      estimate: "1h",
      priority: "critical",
      tags: ["database", "profiles", "identity"],
      links: [
        { label: "Identity & Accounts", url: "backend/docs/02-DATA-MODEL-CORE.md#2-identity-and-accounts" }
      ],
      depends_on: ["BE-CORE-01"]
    },
    {
      code: "BE-CORE-03",
      block: "BE-CORE",
      title: "School structure tables: academic years, terms, classes and enrollments",
      description: `### Goal
Define the school hierarchy database tables: academic years, terms, classes, teacher assignments, and student enrollments.

### Implementation Details
- Create table \`school_years\` (id uuid PK, name text, is_active boolean, start_date date, end_date date).
- Create table \`terms\` (id uuid PK, year_id uuid references school_years, name text, start_date date, end_date date).
- Create table \`classes\` (id uuid PK, term_id uuid references terms, name text, join_code text unique, grade_level text, is_archived boolean default false).
- Create table \`class_teachers\` (class_id uuid references classes, teacher_id uuid references profiles, is_primary boolean default false, PK (class_id, teacher_id)).
- Create table \`class_enrollments\` (id uuid PK, class_id uuid references classes, student_id uuid references profiles, enrolled_at timestamptz, status text default 'active', unique (class_id, student_id)).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_03_school_structure.sql\`
- **Conflict Prevention**: Index foreign keys for performant join queries.`,
      acceptance_criteria: `- Unique indexes enforce one enrollment per student per class.
- \`join_code\` generated with unique index on \`classes\`.
- Teacher co-teaching relationships cleanly modeled.`,
      estimate: "2h",
      priority: "critical",
      tags: ["database", "classes", "enrollment"],
      links: [
        { label: "School Structure", url: "backend/docs/02-DATA-MODEL-CORE.md#3-school-structure" }
      ],
      depends_on: ["BE-CORE-02"]
    },
    {
      code: "BE-CORE-04",
      block: "BE-CORE",
      title: "Class rules, reward settings and course assignments schema",
      description: `### Goal
Create schema for class-specific rule overrides, custom rewards, and curriculum assignments.

### Implementation Details
- Create table \`class_rules\` (class_id uuid PK references classes on delete cascade, games_enabled boolean default true, ai_tutor_enabled boolean default true, late_submission_allowed boolean default true, late_penalty_percent integer default 10, bonus_multiplier numeric(3,2) default 1.0, updated_at).
- Create table \`class_courses\` (class_id uuid references classes on delete cascade, course_id uuid, is_active boolean default true, assigned_at timestamptz, PK (class_id, course_id)).
- Create table \`class_unlock_overrides\` (id uuid PK, class_id uuid references classes, student_id uuid references profiles, target_type text, target_id uuid, is_unlocked boolean, reason text).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_04_class_rules.sql\`
- **Conflict Prevention**: Foreign keys to courses will connect after BE-CORE-05.`,
      acceptance_criteria: `- \`class_rules\` enforces default values on class creation.
- Unlock overrides support student-specific accommodations.
- Class courses map assigned curriculum to class rosters.`,
      estimate: "1h",
      priority: "high",
      tags: ["database", "rules", "classes"],
      links: [
        { label: "School Structure", url: "backend/docs/02-DATA-MODEL-CORE.md#3-school-structure" }
      ],
      depends_on: ["BE-CORE-03"]
    },
    {
      code: "BE-CORE-05",
      block: "BE-CORE",
      title: "Curriculum and content hierarchy tables: courses, units, lessons and blocks",
      description: `### Goal
Create database hierarchy for official and teacher-created curriculum: courses, units, lessons, content blocks, and version snapshots.

### Implementation Details
- Create table \`courses\` (id uuid PK, author_id uuid references profiles, title text, slug text unique, description text, grade_level text, is_official boolean default false, status content_status default 'draft', cover_image text, position int, created_at, updated_at).
- Create table \`units\` (id uuid PK, course_id uuid references courses on delete cascade, title text, description text, order_index int, created_at).
- Create table \`lessons\` (id uuid PK, unit_id uuid references units on delete cascade, title text, description text, xp_reward int default 20, coin_reward int default 5, order_index int, created_at).
- Create table \`lesson_blocks\` (id uuid PK, lesson_id uuid references lessons on delete cascade, block_type text, content jsonb, order_index int).
- Create table \`content_snapshots\` (id uuid PK, course_id uuid references courses, version_number int, snapshot_data jsonb, published_by uuid references profiles, published_at timestamptz).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_05_curriculum_content.sql\`
- **Conflict Prevention**: Follow JSONB schema formats for lesson_blocks.`,
      acceptance_criteria: `- Cascade deletes clean up unit, lesson, and block child records on course removal.
- Content snapshots capture immutable versions of published courses.
- Unique slug on courses for clean routing.`,
      estimate: "2h",
      priority: "critical",
      tags: ["database", "curriculum", "courses"],
      links: [
        { label: "Curriculum & Content", url: "backend/docs/02-DATA-MODEL-CORE.md#4-curriculum-and-content" }
      ],
      depends_on: ["BE-CORE-02"]
    },
    {
      code: "BE-CORE-06",
      block: "BE-CORE",
      title: "Questions and rubrics schema supporting all interactive exercise types",
      description: `### Goal
Create database tables for questions, question bank tags, and assessment rubrics for automated and manual scoring.

### Implementation Details
- Create table \`rubrics\` (id uuid PK, title text, criteria jsonb, max_score numeric(5,2), author_id uuid references profiles, is_public boolean default false, created_at).
- Create table \`questions\` (id uuid PK, author_id uuid references profiles, question_type question_type, prompt text, options jsonb, correct_answer jsonb, explanation text, points numeric(5,2) default 1.0, difficulty text, tags text[], rubric_id uuid references rubrics, created_at).
- Add GIN index on \`tags\` and \`correct_answer\` JSONB fields for rapid bank filtering.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_06_questions_rubrics.sql\`
- **Conflict Prevention**: JSONB structures must match QuestionRenderer schemas.`,
      acceptance_criteria: `- \`questions\` table supports multiple choice, fill in the blank, matching, reorder, short answer.
- GIN index on tags allows instant search across thousands of questions.
- Rubrics link to subjective questions for teacher grading.`,
      estimate: "2h",
      priority: "critical",
      tags: ["database", "questions", "rubrics"],
      links: [
        { label: "Questions & Rubrics", url: "backend/docs/02-DATA-MODEL-CORE.md#5-questions-and-rubrics" }
      ],
      depends_on: ["BE-CORE-02"]
    },
    {
      code: "BE-CORE-07",
      block: "BE-CORE",
      title: "Assessments schema: quizzes, assignments, questions linkage and settings",
      description: `### Goal
Define database tables for quizzes, homework assignments, assessment settings, and question linkages.

### Implementation Details
- Create table \`assessments\` (id uuid PK, class_id uuid references classes, author_id uuid references profiles, title text, description text, kind assessment_kind, due_date timestamptz, time_limit_minutes int, max_attempts int default 1, pass_percentage numeric(5,2) default 60.0, shuffle_questions boolean default false, show_feedback_mode text default 'immediate', status content_status default 'draft', created_at).
- Create table \`assessment_questions\` (assessment_id uuid references assessments on delete cascade, question_id uuid references questions, order_index int, points_override numeric(5,2), PK (assessment_id, question_id)).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_07_assessments_schema.sql\`
- **Conflict Prevention**: Coordinate with attempts tables in BE-CORE-08.`,
      acceptance_criteria: `- Foreign keys properly connect classes, authors, and questions.
- Time limit and attempt constraints modeled with positive integer checks.
- \`status\` flag controls draft vs published visibility.`,
      estimate: "1h",
      priority: "critical",
      tags: ["database", "assessments", "quizzes"],
      links: [
        { label: "Assessments", url: "backend/docs/02-DATA-MODEL-CORE.md#6-assessments" }
      ],
      depends_on: ["BE-CORE-03", "BE-CORE-06"]
    },
    {
      code: "BE-CORE-08",
      block: "BE-CORE",
      title: "Student attempts, submissions, answers and grading history schema",
      description: `### Goal
Create schema for student assessment attempts, autosaved answers, teacher grades, and feedback history.

### Implementation Details
- Create table \`assessment_attempts\` (id uuid PK, assessment_id uuid references assessments on delete cascade, student_id uuid references profiles, attempt_number int, status submission_status default 'in_progress', started_at timestamptz default app_now(), submitted_at timestamptz, score numeric(5,2), max_score numeric(5,2), feedback text, graded_by uuid references profiles, graded_at timestamptz).
- Create table \`attempt_answers\` (id uuid PK, attempt_id uuid references assessment_attempts on delete cascade, question_id uuid references questions, student_answer jsonb, is_correct boolean, points_awarded numeric(5,2), teacher_comment text, updated_at timestamptz).
- Create table \`grade_history\` (id uuid PK, attempt_id uuid references assessment_attempts on delete cascade, grader_id uuid references profiles, old_score numeric(5,2), new_score numeric(5,2), reason text, changed_at timestamptz default app_now()).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_08_attempts_grading.sql\`
- **Conflict Prevention**: Index (assessment_id, student_id) for rapid progress lookups.`,
      acceptance_criteria: `- Enforces unique attempt per student/attempt_number pair.
- \`attempt_answers\` supports JSONB answers for all question formats.
- Complete grade audit trail in \`grade_history\`.`,
      estimate: "2h",
      priority: "critical",
      tags: ["database", "attempts", "grading"],
      links: [
        { label: "Assessments", url: "backend/docs/02-DATA-MODEL-CORE.md#6-assessments" }
      ],
      depends_on: ["BE-CORE-07"]
    },
    {
      code: "BE-CORE-09",
      block: "BE-CORE",
      title: "Learning progress tables: lesson progress, activity logs and drafts",
      description: `### Goal
Create database tables tracking student lesson progress, activity completion, and draft writing pieces.

### Implementation Details
- Create table \`lesson_progress\` (id uuid PK, student_id uuid references profiles, lesson_id uuid references lessons on delete cascade, is_completed boolean default false, completed_at timestamptz, last_accessed_at timestamptz default app_now(), unique (student_id, lesson_id)).
- Create table \`activity_progress\` (id uuid PK, student_id uuid references profiles, activity_id uuid, answers jsonb, score numeric(5,2), completed_at timestamptz).
- Create table \`writing_drafts\` (id uuid PK, student_id uuid references profiles, prompt_id uuid, title text, content text, word_count int default 0, last_saved_at timestamptz default app_now()).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_09_learning_progress.sql\`
- **Conflict Prevention**: Use composite primary or unique keys for fast progress lookup.`,
      acceptance_criteria: `- Tracks completion state per student per lesson accurately.
- \`writing_drafts\` handles autosaved revisions without locking rows.
- Indices on student_id enable sub-10ms query times on dashboard.`,
      estimate: "1h",
      priority: "high",
      tags: ["database", "progress", "student"],
      links: [
        { label: "Learning Progress", url: "backend/docs/02-DATA-MODEL-CORE.md#7-learning-progress-student-data" }
      ],
      depends_on: ["BE-CORE-05"]
    },
    {
      code: "BE-CORE-10",
      block: "BE-CORE",
      title: "Gamification engine tables: stats, XP ledger, coin ledger and streak days",
      description: `### Goal
Establish the core gamification ledger tables: student statistics, immutable XP and Coin transactional ledgers, and streak history.

### Implementation Details
- Create table \`student_stats\` (student_id uuid PK references profiles on delete cascade, total_xp bigint default 0, current_level int default 1, current_coins bigint default 0, current_streak int default 0, longest_streak int default 0, streak_freeze_count int default 0, last_active_date date).
- Create table \`xp_ledger\` (id uuid PK, student_id uuid references profiles, amount int not null, source text not null, reference_id uuid, created_at timestamptz default app_now()).
- Create table \`coin_ledger\` (id uuid PK, student_id uuid references profiles, amount int not null, source text not null, reference_id uuid, created_at timestamptz default app_now()).
- Create table \`streak_days\` (id uuid PK, student_id uuid references profiles, activity_date date not null, xp_earned int default 0, is_frozen boolean default false, unique (student_id, activity_date)).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_10_gamification_ledgers.sql\`
- **Conflict Prevention**: Ledgers are strictly append-only; never delete ledger transactions.`,
      acceptance_criteria: `- Append-only transactions in XP and Coin ledgers.
- Unique constraint prevents multiple streak records for the same day.
- \`student_stats\` maintains denormalized counters synchronized by triggers.`,
      estimate: "2h",
      priority: "critical",
      tags: ["database", "gamification", "xp", "economy"],
      links: [
        { label: "Gamification Engine Tables", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#3-gamification-engine-tables" },
        { label: "Economy & Games Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#2-xp" }
      ],
      depends_on: ["BE-CORE-02"]
    },
    {
      code: "BE-CORE-11",
      block: "BE-CORE",
      title: "Quests, badges, achievements and leaderboards schema",
      description: `### Goal
Create schema for daily and weekly quest templates, active quest instances, badge definitions, user achievements, and leaderboard rankings.

### Implementation Details
- Create table \`quest_templates\` (id uuid PK, title text, description text, quest_type text, target_count int, xp_reward int, coin_reward int, is_active boolean default true).
- Create table \`quest_instances\` (id uuid PK, quest_template_id uuid references quest_templates, student_id uuid references profiles, current_count int default 0, is_completed boolean default false, is_claimed boolean default false, expires_at timestamptz, created_at timestamptz default app_now()).
- Create table \`badge_definitions\` (id uuid PK, code text unique, name text, description text, icon_url text, category text, requirement_json jsonb).
- Create table \`user_badges\` (id uuid PK, student_id uuid references profiles, badge_id uuid references badge_definitions, awarded_at timestamptz default app_now(), is_pinned boolean default false, unique (student_id, badge_id)).
- Create table \`leaderboard_snapshots\` (id uuid PK, class_id uuid references classes, period text, ranking_data jsonb, generated_at timestamptz default app_now()).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_11_quests_badges.sql\`
- **Conflict Prevention**: Follow standard JSONB payload for badge criteria.`,
      acceptance_criteria: `- Quests track progress count, completion state, and claim flag.
- Unique badge awards per student.
- Pinned badge flags supported up to limit of 3.`,
      estimate: "2h",
      priority: "high",
      tags: ["database", "quests", "badges", "leaderboard"],
      links: [
        { label: "Quests & Badges Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#4-quests-and-weekly-goals" }
      ],
      depends_on: ["BE-CORE-10"]
    },
    {
      code: "BE-CORE-12",
      block: "BE-CORE",
      title: "Minigames schema: game catalog, player sessions, high scores and daily games",
      description: `### Goal
Create database tables for 7 educational minigames, user game sessions, scores, and daily featured game tracking.

### Implementation Details
- Create table \`games\` (id uuid PK, slug text unique, title text, description text, icon_url text, instructions text, is_active boolean default true).
- Create table \`game_sessions\` (id uuid PK, game_id uuid references games, student_id uuid references profiles, score int not null, accuracy numeric(5,2), xp_awarded int default 0, coins_awarded int default 0, time_spent_seconds int, played_at timestamptz default app_now()).
- Create table \`game_daily_featured\` (featured_date date PK, game_id uuid references games, bonus_multiplier numeric(3,2) default 1.5).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_12_games_schema.sql\`
- **Conflict Prevention**: Index (student_id, game_id) for personal best score calculations.`,
      acceptance_criteria: `- All 7 arcade games (Word Scramble, Speed Match, Grammar Dash, etc.) supported.
- Session logs capture score, accuracy, and playtime.
- Featured game assigns bonus multiplier.`,
      estimate: "1h",
      priority: "medium",
      tags: ["database", "games", "minigames"],
      links: [
        { label: "Games Data Model", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#4-games" },
        { label: "Economy & Games", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#9-games" }
      ],
      depends_on: ["BE-CORE-10"]
    },
    {
      code: "BE-CORE-13",
      block: "BE-CORE",
      title: "Economy shop catalog, items inventory and cosmetic purchases schema",
      description: `### Goal
Create schema for virtual arcade shop catalog, student item inventories, themes, and avatar cosmetics.

### Implementation Details
- Create table \`shop_items\` (id uuid PK, sku text unique, name text, description text, category text, coin_price int not null, required_level int default 1, asset_url text, metadata jsonb, is_available boolean default true).
- Create table \`user_inventory\` (id uuid PK, user_id uuid references profiles on delete cascade, item_id uuid references shop_items, purchased_at timestamptz default app_now(), is_equipped boolean default false, unique (user_id, item_id)).
- Create table \`avatar_assets\` (id uuid PK, asset_type text, name text, svg_data text, coin_price int default 0, is_default boolean default false).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_13_shop_inventory.sql\`
- **Conflict Prevention**: Item SKU must be lowercase snake_case.`,
      acceptance_criteria: `- Unique item ownership per student.
- Equipped status toggled per category.
- Minimum level requirements enforced on items.`,
      estimate: "1h",
      priority: "high",
      tags: ["database", "shop", "inventory", "economy"],
      links: [
        { label: "Shop & Customization", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#5-shop-and-customization" }
      ],
      depends_on: ["BE-CORE-10"]
    },
    {
      code: "BE-CORE-14",
      block: "BE-CORE",
      title: "Communication tables: announcements, recipients and notifications schema",
      description: `### Goal
Create database tables for school and class announcements, recipient lists, and user in-app notifications.

### Implementation Details
- Create table \`announcements\` (id uuid PK, author_id uuid references profiles, title text, body text, priority text default 'normal', target_type text, target_class_id uuid references classes, published_at timestamptz default app_now(), expires_at timestamptz).
- Create table \`announcement_recipients\` (announcement_id uuid references announcements on delete cascade, user_id uuid references profiles on delete cascade, read_at timestamptz, PK (announcement_id, user_id)).
- Create table \`notifications\` (id uuid PK, user_id uuid references profiles on delete cascade, notification_type text not null, title text, body text, data jsonb, is_read boolean default false, created_at timestamptz default app_now()).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_14_communication_notifications.sql\`
- **Conflict Prevention**: Index (user_id, is_read) for instant unread badge badge counter.`,
      acceptance_criteria: `- Announcements target whole school or specific class.
- Read tracking stored per recipient.
- Notification table indexed for fast unread count queries.`,
      estimate: "1h",
      priority: "high",
      tags: ["database", "notifications", "announcements"],
      links: [
        { label: "Communication", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#6-communication" },
        { label: "Notification Catalog", url: "backend/docs/08-STORAGE-REALTIME-NOTIFICATIONS.md#5-notification-catalog" }
      ],
      depends_on: ["BE-CORE-02"]
    },
    {
      code: "BE-CORE-15",
      block: "BE-CORE",
      title: "AI system schema: conversations, messages, action cards and token usage logs",
      description: `### Goal
Create database tables for AI Tutor dialogues, Copilot sessions, streaming messages, action cards, and token metering.

### Implementation Details
- Create table \`ai_conversations\` (id uuid PK, user_id uuid references profiles on delete cascade, conversation_type text, context_data jsonb, is_archived boolean default false, created_at timestamptz default app_now()).
- Create table \`ai_messages\` (id uuid PK, conversation_id uuid references ai_conversations on delete cascade, role text, content text, tokens_used int default 0, safety_flag boolean default false, created_at timestamptz default app_now()).
- Create table \`ai_action_cards\` (id uuid PK, conversation_id uuid references ai_conversations on delete cascade, card_type text, payload jsonb, status text default 'pending', applied_at timestamptz).
- Create table \`ai_usage_logs\` (id uuid PK, user_id uuid references profiles, feature text, model text, prompt_tokens int, completion_tokens int, estimated_cost numeric(8,5), created_at timestamptz default app_now()).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_15_ai_system_tables.sql\`
- **Conflict Prevention**: Isolate token logs from active conversation reads.`,
      acceptance_criteria: `- Action cards track pending, accepted, discarded states.
- AI messages link to parent conversation with role ordering.
- Usage logs track token costs and model identifiers.`,
      estimate: "2h",
      priority: "high",
      tags: ["database", "ai", "action-cards", "metering"],
      links: [
        { label: "AI Tables", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#7-ai-tables" },
        { label: "AI System Architecture", url: "backend/docs/07-AI-SYSTEM.md#1-principles" }
      ],
      depends_on: ["BE-CORE-02"]
    },
    {
      code: "BE-CORE-16",
      block: "BE-CORE",
      title: "Async job runner schema: background jobs, job steps and worker status",
      description: `### Goal
Create database tables for asynchronous background jobs (AI course generation, bulk grading, CSV import, year rollover).

### Implementation Details
- Create table \`jobs\` (id uuid PK, kind text not null, status text default 'queued', initiator_id uuid references profiles, input_params jsonb, result_payload jsonb, error_message text, started_at timestamptz, completed_at timestamptz, created_at timestamptz default app_now()).
- Create table \`job_steps\` (id uuid PK, job_id uuid references jobs on delete cascade, step_index int, name text, status text default 'pending', progress_percent int default 0, log text, started_at timestamptz, completed_at timestamptz).
- Index on \`(status, created_at)\` for efficient queue polling.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_16_jobs_schema.sql\`
- **Conflict Prevention**: Status values must adhere strictly to: queued, running, completed, failed, cancelled.`,
      acceptance_criteria: `- Background jobs track multi-step progress percentages.
- Worker locking pattern supported via status transitions.
- Errors capture stack traces and failure reasons.`,
      estimate: "1h",
      priority: "high",
      tags: ["database", "jobs", "background-tasks"],
      links: [
        { label: "Jobs Data Model", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#9-jobs" },
        { label: "Job Runner", url: "backend/docs/07-AI-SYSTEM.md#9-job-runner-job-runner-edge-function" }
      ],
      depends_on: ["BE-CORE-02"]
    },
    {
      code: "BE-CORE-17",
      block: "BE-CORE",
      title: "Administrative governance tables: platform settings, audit logs and moderation queue",
      description: `### Goal
Establish system administrative tables: configuration key-value storage, immutable audit logs, and content moderation records.

### Implementation Details
- Create table \`platform_settings\` (key text PK, value jsonb not null, description text, updated_by uuid references profiles, updated_at timestamptz default app_now()).
- Create table \`audit_log\` (id uuid PK, user_id uuid references profiles, action text not null, target_table text, target_id uuid, ip_address text, old_values jsonb, new_values jsonb, created_at timestamptz default app_now()).
- Create table \`moderation_queue\` (id uuid PK, reported_by uuid references profiles, entity_type text not null, entity_id uuid not null, reason text, status text default 'pending', reviewed_by uuid references profiles, resolution_notes text, created_at timestamptz default app_now()).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_17_admin_audit_moderation.sql\`
- **Conflict Prevention**: Audit logs must never allow updates or deletes (append only).`,
      acceptance_criteria: `- Audit logs record all administrative mutations with diffs.
- Moderation queue connects flagged content to admin review.
- Platform settings manage global feature toggles via JSONB.`,
      estimate: "1h",
      priority: "critical",
      tags: ["database", "audit", "moderation", "admin"],
      links: [
        { label: "Audit Log Model", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#12-audit-log" },
        { label: "Moderation Queue", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#10-moderation-and-problem-reports" }
      ],
      depends_on: ["BE-CORE-02"]
    },
    {
      code: "BE-CORE-18",
      block: "BE-CORE",
      title: "Row Level Security (RLS) policies, access matrices and database indexes",
      description: `### Goal
Enable Row Level Security (RLS) across all tables and implement granular, secure policies according to the Access Matrix in backend documentation.

### Implementation Details
- Enable RLS on every created table (\`ALTER TABLE ... ENABLE ROW LEVEL SECURITY\`).
- Implement helper security functions: \`auth_role()\`, \`is_admin()\`, \`is_teacher_of_class(class_id)\`, \`is_student_enrolled(class_id)\`.
- Apply RLS policies:
  - Students can read published courses and only their own submissions/stats.
  - Teachers can read and grade their classes' students, but not other classes.
  - Admins have elevated read/write permissions.
  - Audit log is read-only for Super Admins and write-only via system triggers.
- Create composite indexes for all foreign keys and high-frequency queries.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_18_rls_policies_indexes.sql\`
- **Conflict Prevention**: Run pgTAP or access matrix tests to ensure no unintentional policy leaks.`,
      acceptance_criteria: `- All tables have RLS enabled with restrictive policies.
- Anonymous and unauthorized cross-student data access is completely blocked.
- Query performance on indexed foreign keys stays sub-10ms.`,
      estimate: "2h",
      priority: "critical",
      tags: ["security", "rls", "database", "indexes"],
      links: [
        { label: "Auth & Access Matrix", url: "backend/docs/04-AUTH-AND-ACCESS.md#3-access-matrix-policy-logic" },
        { label: "Security & Privacy", url: "backend/docs/10-SECURITY-PRIVACY.md#1-row-level-security-standards" }
      ],
      depends_on: [
        "BE-CORE-02", "BE-CORE-03", "BE-CORE-04", "BE-CORE-05",
        "BE-CORE-06", "BE-CORE-07", "BE-CORE-08", "BE-CORE-09",
        "BE-CORE-10", "BE-CORE-11", "BE-CORE-12", "BE-CORE-13",
        "BE-CORE-14", "BE-CORE-15", "BE-CORE-16", "BE-CORE-17"
      ]
    }
  ]
};
