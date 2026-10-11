// Block BE-OPS: Database RPC Business Logic, Economy & Triggers (~20 tasks)
module.exports = {
  block: {
    code: "BE-OPS",
    name: "Database RPC Business Logic, Economy & Triggers",
    description: "PostgreSQL stored procedures (RPCs), economy reward engine, streak calculators, quiz/assignment scoring functions, enrollment logic, shop purchases, and automated database triggers.",
  },
  tasks: [
    {
      code: "BE-OPS-01",
      block: "BE-OPS",
      title: "Public platform state and server time RPC functions",
      description: `### Goal
Implement \`get_public_state()\` and \`server_time()\` RPCs providing unauthenticated visitors with platform operational status and synchronized timestamps.

### Implementation Details
- Create function \`get_public_state()\` returning JSON: \`{ maintenance_mode: boolean, registration_enabled: boolean, school_name: text, current_academic_year: text }\`.
- Create function \`server_time()\` returning current \`timestamptz\` using \`app_now()\`.
- Grant execute permissions to \`anon\` and \`authenticated\` roles.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_01_public_state.sql\`
- **Conflict Prevention**: Keep public RPCs lightweight; no expensive joins.`,
      acceptance_criteria: `- \`get_public_state()\` executes without auth token and returns accurate config.
- \`server_time()\` matches database system clock for anti-cheat synchronization.`,
      estimate: "1h",
      priority: "high",
      tags: ["rpc", "database", "public-api"],
      links: [
        { label: "Public State API", url: "backend/docs/05-API-CONTRACT.md#2-public-session-and-shared-shared-spec-sh-xx" }
      ],
      depends_on: ["BE-CORE-18"]
    },
    {
      code: "BE-OPS-02",
      block: "BE-OPS",
      title: "Session context resolution and role verification RPC",
      description: `### Goal
Implement \`get_session_context()\` RPC resolving user profile, role permissions, active enrollments, and unread notification counts on startup.

### Implementation Details
- Create function \`get_session_context()\` reading \`auth.uid()\`.
- Return structured JSON containing:
  - User profile (display name, avatar, equipped theme, must_change_password)
  - Active role & effective permissions
  - Enrolled classes (for student) or teaching classes (for teacher)
  - Unread notifications count and active streak count
- Verify account status is 'active'; raise exception if 'locked' or 'archived'.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_02_session_context.sql\`
- **Conflict Prevention**: Single query aggregation via JSONB to optimize login roundtrips.`,
      acceptance_criteria: `- Returns full user context in a single roundtrip (<25ms).
- Rejects locked or banned accounts with explicit error code.
- Unread counts accurately reflect unread notification table records.`,
      estimate: "1h",
      priority: "critical",
      tags: ["rpc", "auth", "session"],
      links: [
        { label: "Session Context API", url: "backend/docs/05-API-CONTRACT.md#2-public-session-and-shared-shared-spec-sh-xx" }
      ],
      depends_on: ["BE-CORE-18"]
    },
    {
      code: "BE-OPS-03",
      block: "BE-OPS",
      title: "Class enrollment by join code and student invite RPCs",
      description: `### Goal
Implement transactional functions for students joining classes via 6-character codes and accepting teacher invites.

### Implementation Details
- Implement \`join_class_by_code(code text)\` verifying active class, enrolling student in \`class_enrollments\`, and creating enrollment notification.
- Implement \`respond_class_invite(class_id uuid, accept boolean)\`.
- Implement \`rotate_join_code(class_id uuid)\` allowing teachers to regenerate unique join code.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_03_enrollment_rpcs.sql\`
- **Conflict Prevention**: Use \`SELECT FOR UPDATE\` on \`classes\` to prevent race conditions.`,
      acceptance_criteria: `- Student successfully joins class using valid code.
- Duplicate enrollment attempts handled idempotently without error.
- Invalid or expired codes return clean user error.`,
      estimate: "1h",
      priority: "high",
      tags: ["rpc", "classes", "enrollment"],
      links: [
        { label: "Class Enrollment API", url: "backend/docs/05-API-CONTRACT.md#42-classes-and-enrollment-tc-02-to-tc-06" }
      ],
      depends_on: ["BE-CORE-18"]
    },
    {
      code: "BE-OPS-04",
      block: "BE-OPS",
      title: "Teacher roster management and student removal RPCs",
      description: `### Goal
Create teacher RPCs to add students directly, remove students from classes, and transfer class ownership.

### Implementation Details
- Implement \`add_students_to_class(class_id uuid, student_ids uuid[])\`.
- Implement \`remove_student_from_class(class_id uuid, student_id uuid, reason text)\`.
- Enforce caller is authenticated primary teacher or admin of the specified class.
- Record changes in \`audit_log\`.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_04_teacher_roster.sql\`
- **Conflict Prevention**: Validate teacher permissions using \`is_teacher_of_class\`.`,
      acceptance_criteria: `- Teachers can bulk enroll existing students.
- Removing student preserves past assignment grades but sets enrollment to 'archived'.
- Non-teachers cannot modify rosters.`,
      estimate: "1h",
      priority: "high",
      tags: ["rpc", "teacher", "roster"],
      links: [
        { label: "Teacher Classes", url: "backend/docs/05-API-CONTRACT.md#42-classes-and-enrollment-tc-02-to-tc-06" }
      ],
      depends_on: ["BE-CORE-18"]
    },
    {
      code: "BE-OPS-05",
      block: "BE-OPS",
      title: "XP reward engine with daily caps and level progression calculation",
      description: `### Goal
Implement \`award_xp(student_id uuid, amount int, source text, ref_id uuid)\` RPC with daily cap enforcement, level threshold calculation, and ledger recording.

### Implementation Details
- Read daily XP cap from \`platform_settings\` (default 1000 XP/day).
- Check sum of XP earned today in \`xp_ledger\`; clamp reward if approaching cap.
- Insert immutable record into \`xp_ledger\`.
- Compute new level according to non-linear XP curve (\`level = floor(sqrt(total_xp / 100)) + 1\`).
- If level increases, trigger level-up celebration event and award bonus coins.
- Update \`student_stats\`.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_05_award_xp.sql\`
- **Conflict Prevention**: Must be atomic and thread-safe.`,
      acceptance_criteria: `- XP awards strictly logged to \`xp_ledger\`.
- Daily caps prevent exploitative grinding.
- Level changes accurately calculated and returned in AwardResult JSON.`,
      estimate: "2h",
      priority: "critical",
      tags: ["rpc", "gamification", "xp", "economy"],
      links: [
        { label: "Award XP Business Logic", url: "backend/docs/06-BUSINESS-LOGIC.md#22-award_xp-and-award_coins" },
        { label: "Levels Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#3-levels" }
      ],
      depends_on: ["BE-CORE-18"]
    },
    {
      code: "BE-OPS-06",
      block: "BE-OPS",
      title: "Coin transaction engine with balance checks and fraud prevention",
      description: `### Goal
Implement \`award_coins\` and \`spend_coins\` RPCs with strict balance validation and atomic deduction.

### Implementation Details
- Implement \`award_coins(student_id uuid, amount int, source text, ref_id uuid)\` writing to \`coin_ledger\` and incrementing \`student_stats.current_coins\`.
- Implement \`spend_coins(student_id uuid, amount int, reason text, item_id uuid)\`:
  - Check \`current_coins >= amount\`; raise insufficient funds error if balance is low.
  - Insert negative transaction to \`coin_ledger\`.
  - Decrement \`student_stats.current_coins\`.
- All operations run within transaction isolation.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_06_coins.sql\`
- **Conflict Prevention**: No client should ever update \`current_coins\` directly; RPC only.`,
      acceptance_criteria: `- Coins cannot drop below zero.
- Double-spend attempts are caught by transaction locks.
- Every coin delta has an audit entry in \`coin_ledger\`.`,
      estimate: "1h",
      priority: "critical",
      tags: ["rpc", "coins", "economy"],
      links: [
        { label: "Economy Rules", url: "backend/docs/06-BUSINESS-LOGIC.md#22-award_xp-and-award_coins" }
      ],
      depends_on: ["BE-OPS-05"]
    },
    {
      code: "BE-OPS-07",
      block: "BE-OPS",
      title: "Daily streak tracking and streak freeze consumption logic",
      description: `### Goal
Implement daily streak maintenance RPCs: recording activity, maintaining streak counts, and consuming streak freezes on missed days.

### Implementation Details
- Implement \`record_daily_activity(student_id uuid)\`:
  - Check \`streak_days\` for today; if exists, increment xp counter.
  - If yesterday had activity, increment \`current_streak\`.
  - If yesterday was missed but student has \`streak_freeze_count > 0\`, use freeze, mark yesterday frozen, preserve streak.
  - Otherwise, reset \`current_streak = 1\`.
  - Update \`longest_streak\` if current exceeds it.
- Implement \`buy_streak_freeze(student_id uuid)\` spending coins to add freeze item.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_07_streaks.sql\`
- **Conflict Prevention**: Use school timezone or UTC standard from platform config.`,
      acceptance_criteria: `- Streak increments accurately on consecutive active days.
- Streak freeze automatically protects broken streak if available.
- Longest streak record updates when personal record broken.`,
      estimate: "2h",
      priority: "high",
      tags: ["rpc", "gamification", "streaks"],
      links: [
        { label: "Streak Rules", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#1-time-rules" },
        { label: "Streak Business Logic", url: "backend/docs/06-BUSINESS-LOGIC.md#2-the-engine-events-awards-levels" }
      ],
      depends_on: ["BE-OPS-05"]
    },
    {
      code: "BE-OPS-08",
      block: "BE-OPS",
      title: "Course snapshot publication and versioning RPC",
      description: `### Goal
Implement \`publish_course(course_id uuid)\` and \`publish_course_changes(course_id uuid)\` RPCs creating immutable content snapshots.

### Implementation Details
- Verify course has at least 1 unit and 1 lesson with valid content.
- Package full course tree (units, lessons, blocks, question references) into JSON snapshot.
- Store snapshot in \`content_snapshots\` with incremented version number.
- Update \`courses.status = 'published'\` and record \`published_at\` timestamp.
- Trigger Realtime broadcast notifying enrolled classes of curriculum update.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_08_publish_course.sql\`
- **Conflict Prevention**: Validate that non-authors/non-admins cannot publish courses.`,
      acceptance_criteria: `- Snapshots are completely self-contained and immutable.
- Existing student progress remains intact across course updates.
- Validation prevents publishing empty or broken courses.`,
      estimate: "2h",
      priority: "critical",
      tags: ["rpc", "curriculum", "publishing"],
      links: [
        { label: "Publish Course API", url: "backend/docs/05-API-CONTRACT.md#44-courses-and-lessons-tc-09-to-tc-12" }
      ],
      depends_on: ["BE-CORE-18"]
    },
    {
      code: "BE-OPS-09",
      block: "BE-OPS",
      title: "Lesson progress tracking and activity submission RPCs",
      description: `### Goal
Implement \`complete_lesson(lesson_id uuid)\` and \`submit_activity(activity_id uuid, answers jsonb)\` updating student progress and awarding rewards.

### Implementation Details
- Check if lesson was already completed by student; if already completed, award repeat bonus (reduced XP) or 0 XP to prevent farming.
- If first completion, invoke \`award_xp\` and \`award_coins\` according to lesson rewards.
- Mark \`lesson_progress.is_completed = true\`.
- Check if all lessons in current unit completed; if yes, unlock next unit.
- Record activity in streak engine.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_09_lesson_progress.sql\`
- **Conflict Prevention**: Return complete AwardResult with level-up flags in JSON.`,
      acceptance_criteria: `- Lesson completion marks progress and unlocks downstream units.
- First-time completion awards full configured XP and coins.
- Re-completing past lessons adheres to repeat reward policy.`,
      estimate: "1h",
      priority: "high",
      tags: ["rpc", "progress", "lessons"],
      links: [
        { label: "Lesson Progress Logic", url: "backend/docs/06-BUSINESS-LOGIC.md#4-unlocks-course-access-and-progress" }
      ],
      depends_on: ["BE-OPS-05", "BE-OPS-07"]
    },
    {
      code: "BE-OPS-10",
      block: "BE-OPS",
      title: "Quiz attempt lifecycle: start attempt and timing validation RPC",
      description: `### Goal
Implement \`start_quiz_attempt(assessment_id uuid)\` creating attempt record, calculating deadline, and enforcing attempt limit rules.

### Implementation Details
- Check student enrollment in the assessment's class.
- Verify assessment is currently published and not past strict closing deadline.
- Count existing attempts; raise error if \`attempt_count >= max_attempts\`.
- If \`time_limit_minutes\` is set, calculate \`expires_at = app_now() + interval\`.
- Insert \`assessment_attempts\` record with status 'in_progress'.
- If assessment specifies shuffle, randomize question sequence for this attempt.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_10_start_quiz.sql\`
- **Conflict Prevention**: Return questions WITHOUT \`correct_answer\` or explanations.`,
      acceptance_criteria: `- Successfully initializes quiz attempt with server-side time tracking.
- Answer keys are strictly omitted from student payload.
- Attempt limit prevents unauthorized extra takes.`,
      estimate: "2h",
      priority: "critical",
      tags: ["rpc", "quizzes", "assessments"],
      links: [
        { label: "Quizzes Business Logic", url: "backend/docs/06-BUSINESS-LOGIC.md#31-starting-an-attempt-start_quiz_attempt" },
        { label: "Quiz Start Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-08-quiz-start" }
      ],
      depends_on: ["BE-CORE-18"]
    },
    {
      code: "BE-OPS-11",
      block: "BE-OPS",
      title: "Quiz autosave answers and atomic submission RPC",
      description: `### Goal
Implement \`save_quiz_answers(attempt_id uuid, answers jsonb)\` and \`submit_quiz_attempt(attempt_id uuid)\` with automated objective scoring.

### Implementation Details
- Implement autosave writing partial answers to \`attempt_answers\` without grading.
- Implement \`submit_quiz_attempt\`:
  - Verify attempt is in 'in_progress' state.
  - Verify elapsed time does not exceed limit (with 30-second grace period for network latency).
  - Iterate through objective questions (multiple choice, matching, fill blank), comparing student answers against \`correct_answer\`.
  - Calculate total score and percentage.
  - Set \`status = 'submitted'\` or \`'graded'\` (if 100% auto-graded).
  - Award XP and coins proportional to score.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_11_submit_quiz.sql\`
- **Conflict Prevention**: Grade calculation performed entirely on server.`,
      acceptance_criteria: `- Auto-grades objective questions with 100% accuracy.
- Enforces strict timer expiration policy.
- Awards XP and coins based on percentage scored.`,
      estimate: "2h",
      priority: "critical",
      tags: ["rpc", "quizzes", "grading"],
      links: [
        { label: "Scoring Quiz Attempts", url: "backend/docs/06-BUSINESS-LOGIC.md#33-scoring-submit_quiz_attempt" }
      ],
      depends_on: ["BE-OPS-10", "BE-OPS-05"]
    },
    {
      code: "BE-OPS-12",
      block: "BE-OPS",
      title: "Assignment submission, late policy enforcement and draft saving RPCs",
      description: `### Goal
Implement student assignment draft saving, final submission, and automatic late penalty calculations.

### Implementation Details
- Implement \`save_assignment_draft(assessment_id uuid, draft_data jsonb)\`.
- Implement \`submit_assignment(assessment_id uuid, submission_data jsonb)\`:
  - Check submission time against \`due_date\`.
  - If late, verify class rules allow late work. Apply late penalty deduction percentage.
  - Set status to 'submitted', add submission to teacher grading queue.
  - Notify class teachers of new submission.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_12_assignment_submission.sql\`
- **Conflict Prevention**: Preserve draft history if resubmissions are allowed.`,
      acceptance_criteria: `- Saves drafts with zero data loss.
- Flags late submissions and correctly calculates penalty percentage.
- Adds submission to teacher grading queue.`,
      estimate: "1h",
      priority: "high",
      tags: ["rpc", "assignments", "submission"],
      links: [
        { label: "Assignment Logic", url: "backend/docs/06-BUSINESS-LOGIC.md#5-assignments-and-grading" }
      ],
      depends_on: ["BE-CORE-18"]
    },
    {
      code: "BE-OPS-13",
      block: "BE-OPS",
      title: "Teacher grading submission, rubric scoring and score release RPCs",
      description: `### Goal
Implement teacher grading functions: locking submissions for review, saving rubric scores, overriding totals, and releasing grades to students.

### Implementation Details
- Implement \`lock_submission_for_grading(attempt_id uuid)\` preventing multiple teachers from grading simultaneously.
- Implement \`save_grade(attempt_id uuid, rubric_scores jsonb, feedback text, final_score numeric)\`:
  - Write detailed breakdown to \`attempt_answers\`.
  - Update \`assessment_attempts.score\` and status.
  - Log modification in \`grade_history\`.
- Implement \`release_grades(assessment_id uuid)\` publishing scores to students and sending notifications.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_13_teacher_grading.sql\`
- **Conflict Prevention**: Verify teacher owns the class before permitting grading.`,
      acceptance_criteria: `- Concurrency lock prevents grading collisions between co-teachers.
- Rubric criteria scores saved and summed accurately.
- Releasing grades broadcasts notification to enrolled students.`,
      estimate: "2h",
      priority: "critical",
      tags: ["rpc", "teacher", "grading", "rubrics"],
      links: [
        { label: "Teacher Grading Logic", url: "backend/docs/06-BUSINESS-LOGIC.md#54-grading-teacher" }
      ],
      depends_on: ["BE-OPS-11", "BE-OPS-12"]
    },
    {
      code: "BE-OPS-14",
      block: "BE-OPS",
      title: "Daily and weekly quest generation and reward claim RPCs",
      description: `### Goal
Implement automated quest generation for students and \`claim_quest_reward(instance_id uuid)\` with chest opening animations.

### Implementation Details
- Implement \`generate_daily_quests(student_id uuid)\`:
  - Select 3 daily quests from active templates (e.g. complete 1 lesson, practice 10 vocab words, play 1 minigame).
  - Set expiration to midnight in school timezone.
- Implement \`claim_quest_reward(instance_id uuid)\`:
  - Verify \`is_completed = true\` and \`is_claimed = false\`.
  - Award quest XP and coins via reward engine.
  - Mark \`is_claimed = true\`.
  - Return chest rewards payload (XP, coins, chance for streak freeze).

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_14_quests_claim.sql\`
- **Conflict Prevention**: Prevent duplicate claiming via row locking.`,
      acceptance_criteria: `- Students receive 3 personalized daily quests each day.
- Claiming rewards updates XP/coins and marks quest claimed.
- Cannot claim incomplete quests.`,
      estimate: "2h",
      priority: "high",
      tags: ["rpc", "quests", "rewards", "gamification"],
      links: [
        { label: "Quests Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#4-quests-and-weekly-goals" }
      ],
      depends_on: ["BE-OPS-05", "BE-OPS-06"]
    },
    {
      code: "BE-OPS-15",
      block: "BE-OPS",
      title: "Badge evaluation and award engine triggers",
      description: `### Goal
Implement automated badge evaluation engine that triggers on XP awards, streaks, quiz completions, and reading milestones.

### Implementation Details
- Create function \`evaluate_badges_for_student(student_id uuid, event_type text)\`.
- Check unearned badges against conditions:
  - Streak badges (7 days, 30 days, 100 days)
  - XP milestones (10,000 XP, 50,000 XP)
  - Perfect quiz score badges
  - Bookworm badges (reading lessons completed)
- Insert earned badges into \`user_badges\` and send achievement notification.
- Implement \`pin_badges(student_id uuid, badge_ids uuid[])\` supporting up to 3 pinned badges.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_15_badges.sql\`
- **Conflict Prevention**: Execute evaluation asynchronously or efficiently to avoid delaying user actions.`,
      acceptance_criteria: `- Badges automatically award upon meeting criteria.
- Achievement notification generated for newly unlocked badges.
- Up to 3 badges can be pinned to student public profile.`,
      estimate: "2h",
      priority: "high",
      tags: ["rpc", "badges", "achievements"],
      links: [
        { label: "Badges Specification", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#5-badges" }
      ],
      depends_on: ["BE-OPS-05", "BE-OPS-07"]
    },
    {
      code: "BE-OPS-16",
      block: "BE-OPS",
      title: "Class and school leaderboard ranking calculation RPCs",
      description: `### Goal
Implement \`get_leaderboard(class_id uuid, timeframe text)\` RPC returning real-time rankings with tie-breakers and privacy masking.

### Implementation Details
- Timeframes: \`'week'\`, \`'month'\`, \`'all_time'\`.
- Calculate sum of XP earned within timeframe from \`xp_ledger\` for all students in class.
- Sort by XP descending, secondary sort by earliest timestamp.
- Include student rank, display name, avatar, and equipped badge.
- Support optional anonymization if class rule mandates private leaderboards.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_16_leaderboards.sql\`
- **Conflict Prevention**: Optimize with composite indexes on \`xp_ledger(student_id, created_at)\`.`,
      acceptance_criteria: `- Ranks calculate within <50ms even with thousands of ledger entries.
- Weekly and monthly timeframes filter strictly within calendar dates.
- Returns current user's relative ranking position.`,
      estimate: "1h",
      priority: "high",
      tags: ["rpc", "leaderboard", "gamification"],
      links: [
        { label: "Leaderboard Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#6-leaderboard" }
      ],
      depends_on: ["BE-OPS-05"]
    },
    {
      code: "BE-OPS-17",
      block: "BE-OPS",
      title: "Minigame score validation, session recording and rewards RPC",
      description: `### Goal
Implement \`record_game_session(game_slug text, score int, accuracy numeric, duration int)\` validating game constraints and awarding XP.

### Implementation Details
- Validate score sanity (e.g. max theoretical score per minute) to deter script injection.
- Check if game is the Daily Featured Game; apply 1.5x bonus multiplier if active.
- Calculate XP and coin earnings based on score and duration.
- Record session in \`game_sessions\`.
- Update student game best score and streak activity.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_17_game_session.sql\`
- **Conflict Prevention**: Rate-limit game session submissions to prevent spamming.`,
      acceptance_criteria: `- Unrealistic scores (> max threshold) rejected or flagged for audit.
- Daily featured game bonus correctly applied.
- Game session successfully awards XP and coins.`,
      estimate: "1h",
      priority: "medium",
      tags: ["rpc", "games", "minigames"],
      links: [
        { label: "Games Scoring Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#9-games" }
      ],
      depends_on: ["BE-OPS-05", "BE-OPS-06"]
    },
    {
      code: "BE-OPS-18",
      block: "BE-OPS",
      title: "Virtual shop purchase transaction and inventory equip RPCs",
      description: `### Goal
Implement \`purchase_shop_item(item_id uuid)\` and \`equip_inventory_item(item_id uuid)\` RPCs.

### Implementation Details
- In \`purchase_shop_item\`:
  - Check item exists and \`is_available = true\`.
  - Check student meets \`required_level\`.
  - Check student does not already own the item.
  - Deduct coins atomically via \`spend_coins\`.
  - Insert record into \`user_inventory\`.
- In \`equip_inventory_item\`:
  - Verify student owns item.
  - If theme item, update \`profiles.equipped_theme\`.
  - If avatar item, update \`profiles.avatar_url\` or custom avatar configuration.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_18_shop_purchase.sql\`
- **Conflict Prevention**: Atomically enforce inventory uniqueness and coin deduction.`,
      acceptance_criteria: `- Students cannot purchase items they lack coins or levels for.
- Cannot purchase duplicate items.
- Equipping updates profile theme or avatar immediately.`,
      estimate: "1h",
      priority: "high",
      tags: ["rpc", "shop", "inventory", "economy"],
      links: [
        { label: "Shop Logic", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#7-shop-and-customization" }
      ],
      depends_on: ["BE-OPS-06"]
    },
    {
      code: "BE-OPS-19",
      block: "BE-OPS",
      title: "School-wide announcement publishing and fan-out notification trigger",
      description: `### Goal
Implement \`publish_announcement\` RPC and fan-out trigger distributing notifications to all targeted students and staff.

### Implementation Details
- Validate author is authorized teacher or admin.
- Insert record into \`announcements\`.
- For targeted audience (school or class), bulk insert recipient entries into \`announcement_recipients\`.
- Bulk create in-app notification rows for active members.
- If urgent priority, trigger Realtime push broadcast.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_19_announcements.sql\`
- **Conflict Prevention**: Chunk recipient insertions for large student populations.`,
      acceptance_criteria: `- Announcements create recipient rows for all target users.
- Urgent broadcasts immediately emit Realtime channel event.
- Non-privileged users blocked from creating announcements.`,
      estimate: "1h",
      priority: "high",
      tags: ["rpc", "announcements", "notifications"],
      links: [
        { label: "Announcements Spec", url: "backend/docs/08-STORAGE-REALTIME-NOTIFICATIONS.md#54-announcement-fan-out" }
      ],
      depends_on: ["BE-CORE-18"]
    },
    {
      code: "BE-OPS-20",
      block: "BE-OPS",
      title: "Action card lifecycle: apply, undo and discard stored procedures",
      description: `### Goal
Implement \`apply_action_card(card_id uuid, edits jsonb)\`, \`undo_action_card(card_id uuid)\`, and \`discard_action_card(card_id uuid)\` RPCs.

### Implementation Details
- In \`apply_action_card\`:
  - Validate caller is card recipient / conversation owner.
  - Execute card action (e.g. insert quiz question, update lesson plan, enroll student).
  - Save snapshot of changes in card payload to allow reversal.
  - Set \`status = 'applied'\` and timestamp.
- In \`undo_action_card\`:
  - Reverse the changes created by card.
  - Set \`status = 'undone'\`.
- In \`discard_action_card\`:
  - Set \`status = 'discarded'\`.

### Execution & File Ownership
- **Owns**:
  - \`supabase/migrations/*_ops_20_action_cards.sql\`
- **Conflict Prevention**: Validate schema integrity before applying card modifications.`,
      acceptance_criteria: `- Applying card mutates target entity exactly as previewed.
- Undo cleanly restores previous database state.
- Unauthorized users cannot apply action cards.`,
      estimate: "2h",
      priority: "high",
      tags: ["rpc", "ai", "action-cards"],
      links: [
        { label: "Action Cards Logic", url: "backend/docs/07-AI-SYSTEM.md#8-action-cards" }
      ],
      depends_on: ["BE-CORE-18"]
    }
  ]
};
