// Block ADM: Admin Control Room, Operations, Governance & Settings (~22 tasks)
module.exports = {
  block: {
    code: "ADM",
    name: "Admin Control Room, Operations, Governance & Settings",
    description: "School administrator control room: user management, CSV import, academic year rollover, curriculum governance, moderation queue, economy studios, AI governance & limits, audit log, and platform settings (AD-01 to AD-29).",
  },
  tasks: [
    {
      code: "ADM-01",
      block: "ADM",
      title: "Admin Executive Dashboard: operational metrics, active learners and alerts (AD-01)",
      description: `### Goal
Build primary Admin Dashboard (\`AD-01\`) displaying total active students today, platform operational health, pending moderation items, and quick management links.

### Implementation Details
- Create \`frontend/src/pages/admin/DashboardPage/index.tsx\`.
- Real-time stat tiles: Enrolled Students, Active Teachers, Completed Lessons Today, System Health (All Systems Nominal).
- Action alerts: Unreviewed Moderation Reports, Failed Background Jobs, Pending Password Resets.
- Quick navigation shortcuts: 'Import Users', 'Year Rollover', 'Edit Settings'.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/DashboardPage/**\`
- **Conflict Prevention**: Follow AD-01 specification in ADMIN-SPEC.`,
      acceptance_criteria: `- Renders high-level platform health metrics cleanly.
- Alerts highlight pending moderation reports or failed jobs.
- Quick links navigate directly to admin submodules.`,
      estimate: "2h",
      priority: "critical",
      tags: ["admin", "dashboard", "metrics"],
      links: [
        { label: "Admin Dashboard Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-01-dashboard" }
      ],
      depends_on: ["UIK-25", "BE-CORE-17"]
    },
    {
      code: "ADM-02",
      block: "ADM",
      title: "Users directory master table: role filters, status toggles and search (AD-02)",
      description: `### Goal
Implement \`/admin/users\` master directory displaying all students, teachers, and administrators with multi-attribute filtering and bulk actions.

### Implementation Details
- Create \`frontend/src/pages/admin/UsersListPage/index.tsx\`.
- TanStack DataTable: Avatar, Display Name, Username, Role badge, Status ('active', 'locked', 'archived'), Created Date.
- Filter by Role (All, Students, Teachers, Admins) and Status.
- Bulk actions: Lock Accounts, Archive Accounts, Reset Passwords.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/UsersListPage/**\`
- **Conflict Prevention**: Follow AD-02 in ADMIN-SPEC.`,
      acceptance_criteria: `- Fast searching and sorting across thousands of user records.
- Bulk selection allows locking or archiving accounts.
- Clicking user opens full User Detail page.`,
      estimate: "2h",
      priority: "critical",
      tags: ["admin", "users", "directory"],
      links: [
        { label: "Users List Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-02-users-list" }
      ],
      depends_on: ["ADM-01", "UIK-18"]
    },
    {
      code: "ADM-03",
      block: "ADM",
      title: "User detail dossier, account status control and administrative notes (AD-03)",
      description: `### Goal
Implement \`/admin/users/:userId\` user management profile allowing admins to view academic history, toggle lockout, change role, and view audit trail.

### Implementation Details
- Create \`frontend/src/pages/admin/UserDetailPage/index.tsx\`.
- User profile header with status indicator chip and role badge.
- Administrative controls: Lock / Unlock account button, Reset Password trigger, Change Role dropdown.
- Private \`admin_notes\` feed visible only to administrators.
- 'Simulate View-As User' button launching View-As mode.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/UserDetailPage/**\`
- **Conflict Prevention**: Follow AD-03 in ADMIN-SPEC.`,
      acceptance_criteria: `- Admins can lock or unlock user accounts with immediate effect.
- Role changes update user permissions in database.
- Private admin notes save securely.`,
      estimate: "2h",
      priority: "high",
      tags: ["admin", "user-detail", "account-management"],
      links: [
        { label: "User Detail Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-03-user-detail" }
      ],
      depends_on: ["ADM-02", "BE-CORE-02"]
    },
    {
      code: "ADM-04",
      block: "ADM",
      title: "Create User manual account generator modal (AD-04)",
      description: `### Goal
Implement \`/admin/users/create\` modal or page for manually creating student, teacher, or administrator accounts with auto-generated passwords.

### Implementation Details
- Create \`frontend/src/pages/admin/CreateUserModal.tsx\`.
- Form: Full name, Username (validated unique), Email (optional for younger students), Role, Grade Level, Initial Temporary Password.
- Force password change on first login toggle (defaults to true).
- Copy credentials card (Username and Password) to clipboard or print.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/CreateUserModal.tsx\`
- **Conflict Prevention**: Follow AD-04 in ADMIN-SPEC.`,
      acceptance_criteria: `- Validates unique username availability in real-time.
- Creates account in Supabase Auth and inserts profile row.
- Offers one-click copy of login credentials for student card.`,
      estimate: "1h",
      priority: "high",
      tags: ["admin", "create-user", "accounts"],
      links: [
        { label: "Create User Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-04-create-user" }
      ],
      depends_on: ["ADM-02"]
    },
    {
      code: "ADM-05",
      block: "ADM",
      title: "CSV Bulk Import Wizard: mapping, validation and staged commit (AD-05)",
      description: `### Goal
Implement \`/admin/users/import\` multi-step wizard allowing admins to upload class rosters in CSV format, map columns, fix validation errors, and bulk create accounts.

### Implementation Details
- Create \`frontend/src/pages/admin/CsvImportWizardPage/index.tsx\`.
- Step 1: Upload CSV file (with downloadable sample template).
- Step 2: Column mapping interface (First Name, Last Name, Username, Grade, Class Code).
- Step 3: Interactive error grid showing invalid rows with inline cell correction.
- Step 4: Dispatch import job via \`job-runner\` and download credentials distribution CSV.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/CsvImportWizardPage/**\`
- **Conflict Prevention**: Follow AD-05 in ADMIN-SPEC.`,
      acceptance_criteria: `- Parses CSV file and maps columns flexibly.
- Highlights invalid rows (e.g. duplicate username, invalid grade) before commit.
- Asynchronously processes import job and generates credentials PDF/CSV.`,
      estimate: "2h",
      priority: "critical",
      tags: ["admin", "csv", "import", "bulk-accounts"],
      links: [
        { label: "CSV Import Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-05-csv-import-wizard" },
        { label: "CSV Import Job", url: "backend/docs/07-AI-SYSTEM.md#9-job-runner-job-runner-edge-function" }
      ],
      depends_on: ["ADM-02", "BE-EDGE-13"]
    },
    {
      code: "ADM-06",
      block: "ADM",
      title: "Academic Year Rollover Wizard with pre-flight check and rollback (AD-06)",
      description: `### Goal
Implement \`/admin/operations/rollover\` academic rollover wizard archiving concluding school year, advancing grades, creating classes, and storing rollback snapshots.

### Implementation Details
- Create \`frontend/src/pages/admin/YearRolloverPage/index.tsx\`.
- Pre-flight checklist: verifies all current term grades are submitted, warns of active sessions.
- Rollover configuration: Select source year, destination year, grade advancement mapping (e.g. Grade 5 -> Grade 6).
- Two-factor confirmation: requires typing "CONFIRM ROLLOVER" to proceed.
- 48-hour rollback button allowing instant reversal if school schedules change.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/YearRolloverPage/**\`
- **Conflict Prevention**: Follow AD-06 in ADMIN-SPEC.`,
      acceptance_criteria: `- Multi-step safeguards prevent accidental execution.
- Dispatches background rollover job and shows progress percentage.
- Rollback button successfully restores previous year state if triggered.`,
      estimate: "2h",
      priority: "critical",
      tags: ["admin", "rollover", "operations", "safeguards"],
      links: [
        { label: "Year Rollover Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-06-year-rollover" },
        { label: "Rollover Job", url: "backend/docs/07-AI-SYSTEM.md#9-job-runner-job-runner-edge-function" }
      ],
      depends_on: ["ADM-01", "BE-EDGE-14"]
    },
    {
      code: "ADM-07",
      block: "ADM",
      title: "School classes admin master directory and term management (AD-07, AD-08)",
      description: `### Goal
Implement \`/admin/classes\` and \`/admin/classes/:classId\` administrative views showing all school classes across all grades, assigned teachers, and enrollment totals.

### Implementation Details
- Create \`frontend/src/pages/admin/ClassesAdminPage/index.tsx\` and \`ClassAdminDetailPage.tsx\`.
- Comprehensive list of school classes filtered by Academic Year and Grade.
- Admin controls: Reassign Primary Teacher, Add Co-Teachers, Archive Class, Force Reset Join Code.
- View class roster and grade averages across sections.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/ClassesAdminPage/**\`
  - \`frontend/src/pages/admin/ClassAdminDetailPage/**\`
- **Conflict Prevention**: Follow AD-07, AD-08 in ADMIN-SPEC.`,
      acceptance_criteria: `- Lists all school classes with assigned teachers and student counts.
- Allows reassigning primary teachers and adding co-teachers.
- Archive class preserves historical data safely.`,
      estimate: "2h",
      priority: "high",
      tags: ["admin", "classes", "school-structure"],
      links: [
        { label: "Classes List Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-07-classes-list" },
        { label: "Class Detail Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-08-class-detail-admin-view" }
      ],
      depends_on: ["ADM-01", "BE-CORE-03"]
    },
    {
      code: "ADM-08",
      block: "ADM",
      title: "Official curriculum management and scope-and-sequence tree (AD-09)",
      description: `### Goal
Implement \`/admin/curriculum\` official curriculum repository managing school-wide courses, grade-level learning outcomes, and master versions.

### Implementation Details
- Create \`frontend/src/pages/admin/CurriculumAdminPage/index.tsx\`.
- Master curriculum hierarchy: Grades 1–12, Core English tracks, Supplementary reading tracks.
- 'Promote to Official Curriculum' action on verified teacher courses.
- Lock/unlock editing permissions on official courses.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/CurriculumAdminPage/**\`
- **Conflict Prevention**: Follow AD-09 in ADMIN-SPEC.`,
      acceptance_criteria: `- Renders official curriculum tree by grade level.
- Promotes verified courses to official status via database flag.
- Enforces strict administrative authoring controls on official tracks.`,
      estimate: "2h",
      priority: "high",
      tags: ["admin", "curriculum", "standards"],
      links: [
        { label: "Curriculum Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-09-curriculum-management" }
      ],
      depends_on: ["ADM-01", "BE-CORE-05"]
    },
    {
      code: "ADM-09",
      block: "ADM",
      title: "AI Official Curriculum Wizard: grade syllabus and standard generator (AD-10)",
      description: `### Goal
Implement \`/admin/curriculum/generate\` enterprise AI wizard generating year-long English curriculum scopes aligned with international CEFR standards.

### Implementation Details
- Create \`frontend/src/pages/admin/CurriculumGeneratorPage/index.tsx\`.
- Input parameters: Grade level, Academic weeks (30 to 40), CEFR targets (A1, A2, B1, B2), Core themes (Grammar, Fiction, Essay Writing).
- Generates 6 comprehensive units with weekly lesson breakdown and milestone assessment checkpoints.
- Dispatches async generation job and creates draft official course.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/CurriculumGeneratorPage/**\`
- **Conflict Prevention**: Follow AD-10 in ADMIN-SPEC.`,
      acceptance_criteria: `- Generates comprehensive year-long curriculum syllabus with CEFR alignment.
- Tracks background generation progress in real-time.
- Creates official curriculum draft awaiting admin review.`,
      estimate: "2h",
      priority: "high",
      tags: ["admin", "ai", "curriculum-wizard"],
      links: [
        { label: "AI Curriculum Wizard Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-10-generate-official-curriculum-ai-wizard" }
      ],
      depends_on: ["ADM-08", "BE-EDGE-12"]
    },
    {
      code: "ADM-10",
      block: "ADM",
      title: "Content moderation queue: reported essays, chat flags and review triage (AD-13)",
      description: `### Goal
Implement \`/admin/moderation\` queue displaying student writing flags, safety filter trigger logs, and user problem reports with resolution actions.

### Implementation Details
- Create \`frontend/src/pages/admin/ModerationQueuePage/index.tsx\`.
- Moderation cards: Entity type (Student Essay, AI Chat message, Forum comment), Trigger reason (Safety filter flag, PII detected, Offensive language), Timestamp.
- Triage actions: 'Approve Content (False Positive)', 'Redact Content', 'Warn Student', 'Notify Parents / Teacher'.
- Resolves item and logs resolution in \`moderation_queue\` table.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/ModerationQueuePage/**\`
- **Conflict Prevention**: Follow AD-13 in ADMIN-SPEC.`,
      acceptance_criteria: `- Groups flagged content items chronologically with urgency tags.
- Triage actions resolve items and update database state.
- Admins can add notes explaining resolution decisions.`,
      estimate: "2h",
      priority: "critical",
      tags: ["admin", "moderation", "safety", "triage"],
      links: [
        { label: "Moderation Queue Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-13-moderation-queue" },
        { label: "Moderation Data Model", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#10-moderation-and-problem-reports" }
      ],
      depends_on: ["ADM-01", "BE-CORE-17"]
    },
    {
      code: "ADM-11",
      block: "ADM",
      title: "XP, Levels, Coins and Streak rules economy studio (AD-14)",
      description: `### Goal
Implement \`/admin/studios/economy\` configuration studio allowing admins to adjust economy parameters: lesson XP, quiz XP multipliers, daily caps, and level curve.

### Implementation Details
- Create \`frontend/src/pages/admin/EconomyStudioPage/index.tsx\`.
- Parameter inputs: Daily XP Cap (default 1000), Base Lesson XP (20), Base Activity XP (10), Quiz Perfect Score Bonus (50).
- Level progression curve calculator graph showing XP required for levels 1 to 50.
- Economy health simulation calculating average student coin earnings per week.
- Save configuration into \`platform_settings\`.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/EconomyStudioPage/**\`
- **Conflict Prevention**: Follow AD-14 in ADMIN-SPEC.`,
      acceptance_criteria: `- Admins can tune reward formulas and daily caps.
- Visual graph depicts level progression curve.
- Changes update economy config in \`platform_settings\` atomically.`,
      estimate: "2h",
      priority: "high",
      tags: ["admin", "economy", "xp", "rules"],
      links: [
        { label: "Economy Studio Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-14-xp-levels-coins-and-streak-rules" },
        { label: "Economy Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#2-xp" }
      ],
      depends_on: ["ADM-01", "BE-OPS-05"]
    },
    {
      code: "ADM-12",
      block: "ADM",
      title: "Quest templates and badge definitions designer (AD-15)",
      description: `### Goal
Implement \`/admin/studios/quests-badges\` studio allowing administrators to create daily quest templates and define achievement badges with custom criteria.

### Implementation Details
- Create \`frontend/src/pages/admin/QuestsBadgesStudioPage/index.tsx\`.
- Quest Template Builder: Quest type, Title, Target count, Reward XP/coins, Active toggle.
- Badge Definition Builder: Badge code, Name, Category, Icon image upload, Criteria JSON builder (e.g. \`streak_days >= 30\`).
- Preview badge card with retro arcade borders.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/QuestsBadgesStudioPage/**\`
- **Conflict Prevention**: Follow AD-15 in ADMIN-SPEC.`,
      acceptance_criteria: `- Create, edit, and deactivate quest templates.
- Define achievement badges with criteria conditions.
- Badge image upload integrates with storage bucket.`,
      estimate: "2h",
      priority: "high",
      tags: ["admin", "quests", "badges", "studio"],
      links: [
        { label: "Quests & Badges Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-15-quest-templates-and-badge-definitions" }
      ],
      depends_on: ["ADM-11", "BE-CORE-11"]
    },
    {
      code: "ADM-13",
      block: "ADM",
      title: "Virtual shop catalog manager and item pricing studio (AD-16)",
      description: `### Goal
Implement \`/admin/studios/shop\` catalog editor managing purchasable items: themes, streak freezes, sticker packs, coin costs, and unlock level requirements.

### Implementation Details
- Create \`frontend/src/pages/admin/ShopCatalogPage/index.tsx\`.
- Item editor modal: SKU, Item Title, Category (Theme, Accessory, Power-up), Coin Price, Required Student Level, Asset URL, Availability toggle.
- Reorder items within shop shelves via drag-and-drop.
- Sales metrics: shows most popular purchased items.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/ShopCatalogPage/**\`
- **Conflict Prevention**: Follow AD-16 in ADMIN-SPEC.`,
      acceptance_criteria: `- Add and edit virtual goods in shop catalog.
- Configure level locks and coin pricing.
- Toggling availability immediately updates student shop view.`,
      estimate: "1h",
      priority: "high",
      tags: ["admin", "shop", "catalog", "economy"],
      links: [
        { label: "Shop Catalog Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-16-shop-catalog" }
      ],
      depends_on: ["ADM-11", "BE-CORE-13"]
    },
    {
      code: "ADM-14",
      block: "ADM",
      title: "Avatar studio asset manager and theme studio palette editor (AD-17, AD-18)",
      description: `### Goal
Implement \`/admin/studios/avatar\` SVG asset manager and \`/admin/studios/themes\` theme palette studio for creating brand-new unlockable arcade themes.

### Implementation Details
- Create \`frontend/src/pages/admin/AvatarStudioAdminPage/index.tsx\`.
- Create \`frontend/src/pages/admin/ThemesStudioAdminPage/index.tsx\`.
- Avatar asset manager: Upload modular SVG parts (hairstyles, hats, glasses, shirts) with layer ordering.
- Theme studio: Color picker configuring the 6 World variables, neutral surface tones, and contrast ratio validation check (WCAG AA).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/AvatarStudioAdminPage/**\`
  - \`frontend/src/pages/admin/ThemesStudioAdminPage/**\`
- **Conflict Prevention**: Follow AD-17, AD-18 in ADMIN-SPEC.`,
      acceptance_criteria: `- Uploads and organizes modular SVG avatar assets.
- Creates new purchasable color themes with WCAG AA contrast check.
- Theme previews update live across mockup interface.`,
      estimate: "2h",
      priority: "medium",
      tags: ["admin", "themes", "avatar", "design-system"],
      links: [
        { label: "Avatar Studio Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-17-avatar-studio" },
        { label: "Themes Studio Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-18-themes-studio" }
      ],
      depends_on: ["ADM-13"]
    },
    {
      code: "ADM-15",
      block: "ADM",
      title: "Leaderboard moderation and score anomaly detector (AD-19)",
      description: `### Goal
Implement \`/admin/studios/leaderboards\` monitoring tool detecting suspicious XP spikes or script exploits, with manual score adjustment and student reset tools.

### Implementation Details
- Create \`frontend/src/pages/admin/LeaderboardModerationPage/index.tsx\`.
- Anomaly detector: Flags students earning >500 XP within 10 minutes or perfect scores across 10 consecutive exercises.
- Actions: 'Investigate Activity Log', 'Adjust Student XP', 'Temporarily Hide from Leaderboard'.
- Toggle school-wide or class-level leaderboard visibility.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/LeaderboardModerationPage/**\`
- **Conflict Prevention**: Follow AD-19 in ADMIN-SPEC.`,
      acceptance_criteria: `- Highlights suspicious XP spikes with automated anomaly flags.
- Admin can audit ledger entries and adjust points with justification note.
- Can hide bad actors from public rankings with one click.`,
      estimate: "1h",
      priority: "high",
      tags: ["admin", "leaderboard", "anti-cheat", "moderation"],
      links: [
        { label: "Leaderboard Moderation Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-19-leaderboard-moderation" }
      ],
      depends_on: ["ADM-11", "BE-OPS-16"]
    },
    {
      code: "ADM-16",
      block: "ADM",
      title: "AI features toggles and student daily limits governance (AD-20)",
      description: `### Goal
Implement \`/admin/ai/features-limits\` governance panel controlling which AI capabilities are active per grade level and setting daily student token budgets.

### Implementation Details
- Create \`frontend/src/pages/admin/AiGovernancePage/index.tsx\`.
- Feature toggles per grade level (Grades 1-3, 4-6, 7-9, 10-12): AI Tutor chat, AI Writing Feedback, AI Translation.
- Daily message limit slider: default 20 messages/day for students.
- Token budget caps per class and monthly cost alert threshold ($100 / month).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/AiGovernancePage/**\`
- **Conflict Prevention**: Follow AD-20 in ADMIN-SPEC.`,
      acceptance_criteria: `- Toggles AI features on or off by grade level.
- Adjusts daily student message caps and token budgets.
- Updates platform configuration in database immediately.`,
      estimate: "1h",
      priority: "critical",
      tags: ["admin", "ai-governance", "limits", "metering"],
      links: [
        { label: "AI Features & Limits Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-20-ai-features-and-limits" },
        { label: "AI System Architecture", url: "backend/docs/07-AI-SYSTEM.md#1-principles" }
      ],
      depends_on: ["ADM-01", "BE-EDGE-05"]
    },
    {
      code: "ADM-17",
      block: "ADM",
      title: "AI safety rules, custom pedagogical instructions and test sandbox (AD-21)",
      description: `### Goal
Implement \`/admin/ai/safety-instructions\` editor allowing school administrators to customize AI system prompts, pedagogical tone, and test replies in a sandbox.

### Implementation Details
- Create \`frontend/src/pages/admin/AiSafetyEditorPage/index.tsx\`.
- System instruction editor: Add school-specific guidelines (e.g. British English spelling preference, school motto encouragement).
- Prohibited topics keyword list.
- Interactive test sandbox: run test queries directly in the browser and inspect system prompts, model reasoning, and safety filter verdicts.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/AiSafetyEditorPage/**\`
- **Conflict Prevention**: Follow AD-21 in ADMIN-SPEC.`,
      acceptance_criteria: `- Custom system instructions append cleanly to AI prompt assembly.
- Prohibited keywords trigger safety redirections in sandbox tests.
- Sandbox displays live token counts and safety evaluations.`,
      estimate: "2h",
      priority: "high",
      tags: ["admin", "ai", "safety", "sandbox"],
      links: [
        { label: "AI Safety Rules Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-21-ai-safety-rules-and-custom-instructions" },
        { label: "AI Prompts Spec", url: "backend/docs/07-AI-SYSTEM.md#3-prompt-assembly-_sharedaipromptsts" }
      ],
      depends_on: ["ADM-16", "BE-EDGE-03"]
    },
    {
      code: "ADM-18",
      block: "ADM",
      title: "AI usage, token consumption, cost breakdown and activity audit log (AD-22, AD-23)",
      description: `### Goal
Implement \`/admin/ai/usage\` cost dashboard and \`/admin/ai/logs\` activity inspector detailing token metrics across models, features, and classes.

### Implementation Details
- Create \`frontend/src/pages/admin/AiUsagePage/index.tsx\` and \`AiLogsPage.tsx\`.
- Recharts visualizations: Daily Token Consumption over time, Cost breakdown by feature (Tutor vs Writing vs Copilot), Token spend per class.
- AI Logs inspector: Filterable table of past interactions with model name, tokens used, latency, and safety status.
- Export usage report to CSV.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/AiUsagePage/**\`
  - \`frontend/src/pages/admin/AiLogsPage/**\`
- **Conflict Prevention**: Follow AD-22, AD-23 in ADMIN-SPEC.`,
      acceptance_criteria: `- Charts historical token and dollar spend accurately.
- Filterable activity log pinpoints expensive or flagged queries.
- Exports CSV summary for school financial reporting.`,
      estimate: "2h",
      priority: "high",
      tags: ["admin", "ai", "usage", "cost", "logs"],
      links: [
        { label: "AI Usage Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-22-ai-usage-and-cost" },
        { label: "AI Activity Log Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-23-ai-activity-log" }
      ],
      depends_on: ["ADM-16", "BE-CORE-15"]
    },
    {
      code: "ADM-19",
      block: "ADM",
      title: "School-wide announcements publisher and urgent broadcast (AD-24)",
      description: `### Goal
Implement \`/admin/announcements\` school broadcaster creating campus announcements, parent bulletins, and full-screen urgent emergency alerts.

### Implementation Details
- Create \`frontend/src/pages/admin/SchoolAnnouncementsPage/index.tsx\`.
- Composer: Title, Target Audience (All School, All Students, All Teachers), Priority (Normal vs Urgent Broadcast).
- Scheduled release date and expiration date picker.
- Urgent broadcast triggers instant Realtime modal overlay across all connected clients.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/SchoolAnnouncementsPage/**\`
- **Conflict Prevention**: Follow AD-24 in ADMIN-SPEC.`,
      acceptance_criteria: `- Publishes announcements targeting whole school or specific roles.
- Urgent priority displays prominent banner to all online users.
- Tracks view statistics and read percentages.`,
      estimate: "1h",
      priority: "high",
      tags: ["admin", "announcements", "broadcast"],
      links: [
        { label: "School Announcements Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-24-school-wide-announcements" }
      ],
      depends_on: ["ADM-01", "BE-OPS-19"]
    },
    {
      code: "ADM-20",
      block: "ADM",
      title: "Immutable system audit log inspector with JSON diff viewer (AD-26)",
      description: `### Goal
Implement \`/admin/audit\` security log viewer displaying every administrative modification, user deletion, grade override, and setting change with before/after JSON diffs.

### Implementation Details
- Create \`frontend/src/pages/admin/AuditLogPage/index.tsx\`.
- Comprehensive DataTable reading \`audit_log\` table: Timestamp, Admin Name, Action type, Target Table, IP address.
- Interactive JSON diff modal highlighting old values in red and new values in green.
- Filter by date range, action type, or target user.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/AuditLogPage/**\`
- **Conflict Prevention**: Follow AD-26 in ADMIN-SPEC.`,
      acceptance_criteria: `- Renders complete, tamper-evident audit history.
- JSON diff viewer clearly illuminates modifications.
- Filterable by date range and administrative actor.`,
      estimate: "2h",
      priority: "critical",
      tags: ["admin", "audit", "security", "diff"],
      links: [
        { label: "Audit Log Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-26-audit-log" },
        { label: "Audit Data Model", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#12-audit-log" }
      ],
      depends_on: ["ADM-01", "BE-CORE-17"]
    },
    {
      code: "ADM-21",
      block: "ADM",
      title: "Platform settings control room: maintenance mode, registration and Super Admin roles (AD-27, AD-28)",
      description: `### Goal
Implement \`/admin/settings\` and \`/admin/admins\` (restricted to Super Admins) controlling maintenance mode, student registration toggles, and admin role assignments.

### Implementation Details
- Create \`frontend/src/pages/admin/PlatformSettingsPage/index.tsx\` and \`AdminsManagementPage.tsx\`.
- Platform toggles: Emergency Maintenance Mode (blocks non-admins with friendly banner), Public Registration Allowed, Default World Theme.
- Admins Manager: Assign and revoke Admin / Super Admin roles with confirmation modal.
- Require password verification before saving sensitive platform settings.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/admin/PlatformSettingsPage/**\`
  - \`frontend/src/pages/admin/AdminsManagementPage/**\`
- **Conflict Prevention**: Follow AD-27, AD-28 in ADMIN-SPEC.`,
      acceptance_criteria: `- Super Admin role strictly enforced for accessing these settings.
- Toggling maintenance mode updates \`get_public_state\` immediately.
- Role modifications write immutable entries to \`audit_log\`.`,
      estimate: "2h",
      priority: "critical",
      tags: ["admin", "settings", "super-admin", "maintenance"],
      links: [
        { label: "Platform Settings Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-27-platform-settings-super-admin-only" },
        { label: "Admins & Roles Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-28-admins-and-roles-super-admin-only" }
      ],
      depends_on: ["ADM-01", "BE-CORE-17"]
    },
    {
      code: "ADM-22",
      block: "ADM",
      title: "View-As student/teacher simulation mode and security sandbox integration",
      description: `### Goal
Implement administrative View-As simulation mechanism: allows admins to temporarily experience the app from any student or teacher's perspective with read-only safety locks.

### Implementation Details
- Create \`frontend/src/shared/hooks/useViewAs.ts\`.
- Admin activates View-As on \`UserDetailPage.tsx\`.
- Sets session simulation state in AuthProvider; loads target user's classes, courses, and stats.
- \`ViewAsBanner\` docks permanently at screen top with warning: "SIMULATION MODE (READ-ONLY) - Simulating [Student Name]".
- Mutation operations are intercepted and blocked in read-only mode to prevent altering real student grades.
- 'Exit View-As' button immediately restores admin interface.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/hooks/useViewAs.ts\`
  - \`frontend/src/shared/components/layout/ViewAsBanner.tsx\`
- **Conflict Prevention**: Never bypass backend RLS; simulation operates with safe audit trail.`,
      acceptance_criteria: `- Admin seamlessly simulates any student or teacher portal.
- View-As banner stays docked with high-visibility warning.
- Read-only interceptor prevents accidental data mutations.
- Exit simulation cleanly restores administrator session.`,
      estimate: "2h",
      priority: "critical",
      tags: ["admin", "view-as", "simulation", "security"],
      links: [
        { label: "Admin Global Shell", url: "frontend/docs/05-admin/ADMIN-SPEC.md#4-global-shell" },
        { label: "View-As Spec", url: "backend/docs/04-AUTH-AND-ACCESS.md#3-access-matrix-policy-logic" }
      ],
      depends_on: ["UIK-25", "ADM-03"]
    }
  ]
};
