// Block TCH-CORE: Teacher Dashboard, Classes, Grading & Work (~22 tasks)
module.exports = {
  block: {
    code: "TCH-CORE",
    name: "Teacher Dashboard, Classes, Grading & Work",
    description: "Teacher portal core pages: dashboard, class manager, roster and enrollment, class rules and rewards, student profiles, homework/quiz management, grading queue, interactive grading screen, and reports (TC-01 to TC-08, TC-13 to TC-16, TC-20 to TC-29).",
  },
  tasks: [
    {
      code: "TCH-CORE-01",
      block: "TCH-CORE",
      title: "Teacher Dashboard: urgent grading pill, class cards and activity feed (TC-01)",
      description: `### Goal
Build primary Teacher Dashboard (\`TC-01\`) featuring urgent ungraded submissions counter, active class performance cards, quick actions bar, and recent student activity log.

### Implementation Details
- Create \`frontend/src/pages/teacher/DashboardPage/index.tsx\`.
- Urgent grading banner ("14 submissions awaiting grading") linking directly to grading queue.
- Class overview cards: student count, attendance/activity rate today, pending work count.
- Quick action buttons: 'Create Assignment', 'Launch Quiz', 'Post Announcement'.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/DashboardPage/**\`
- **Conflict Prevention**: Follow TC-01 specification in TEACHER-SPEC.`,
      acceptance_criteria: `- Renders active class cards with live student counts.
- Urgent grading badge highlights pending submissions.
- Quick actions navigate to respective creation flows.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "dashboard", "classes"],
      links: [
        { label: "Teacher Dashboard Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-01-dashboard" }
      ],
      depends_on: ["UIK-24", "BE-CORE-03"]
    },
    {
      code: "TCH-CORE-02",
      block: "TCH-CORE",
      title: "Classes directory and Create Class modal wizard (TC-02)",
      description: `### Goal
Implement \`/teacher/classes\` class list page and 'Create Class' modal wizard supporting academic term selection, grade level, and join code generation.

### Implementation Details
- Create \`frontend/src/pages/teacher/ClassesListPage/index.tsx\`.
- Create Class modal form: Class name, Grade level (Grade 1–12), Academic Term, Optional description.
- Generates unique 6-character uppercase join code upon creation.
- Class cards with quick links to Roster, Rules, and Curriculum.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/ClassesListPage/**\`
- **Conflict Prevention**: Follow TC-02 in TEACHER-SPEC.`,
      acceptance_criteria: `- Lists all teaching classes assigned to authenticated teacher.
- Create Class modal validates inputs and creates class in database.
- New class appears immediately in class switcher.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "classes", "creation"],
      links: [
        { label: "Classes List Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-02-classes-list" }
      ],
      depends_on: ["TCH-CORE-01"]
    },
    {
      code: "TCH-CORE-03",
      block: "TCH-CORE",
      title: "Class detail dashboard: roster summary, curriculum and announcements (TC-03)",
      description: `### Goal
Implement \`/teacher/classes/:classId\` detail hub showing enrolled students summary, assigned courses, active assignments, and class announcements feed.

### Implementation Details
- Create \`frontend/src/pages/teacher/ClassDetailPage/index.tsx\`.
- Class header: Class name, grade, join code copy chip, and co-teachers avatars.
- Tabbed view: 'Overview', 'Roster & Students', 'Assigned Work', 'Class Rules', 'Announcements'.
- Quick invite button displaying shareable class code and QR code.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/ClassDetailPage/index.tsx\`
  - \`frontend/src/pages/teacher/ClassDetailPage/ClassHeader.tsx\`
- **Conflict Prevention**: Follow TC-03 in TEACHER-SPEC.`,
      acceptance_criteria: `- Renders class overview metrics and join code display.
- Tab navigation transitions smoothly between sub-views.
- Join code chip copies formatted link to clipboard with toast confirmation.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "classes", "overview"],
      links: [
        { label: "Class Detail Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-03-class-detail" }
      ],
      depends_on: ["TCH-CORE-02"]
    },
    {
      code: "TCH-CORE-04",
      block: "TCH-CORE",
      title: "Class roster management and student enrollment tools (TC-04)",
      description: `### Goal
Implement \`/teacher/classes/:classId/roster\` table with search, student removal, attendance status, and 'Enroll Existing Students' modal.

### Implementation Details
- Create \`frontend/src/pages/teacher/ClassDetailPage/RosterTab.tsx\`.
- TanStack DataTable of enrolled students: Avatar, Name, Username, Enrolled Date, Current Streak, Last Active.
- 'Enroll Students' search modal allowing teacher to search school directory and add students.
- Remove student confirmation dialog with reason notes.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/ClassDetailPage/RosterTab.tsx\`
  - \`frontend/src/pages/teacher/ClassDetailPage/EnrollStudentsModal.tsx\`
- **Conflict Prevention**: Follow TC-04 in TEACHER-SPEC.`,
      acceptance_criteria: `- Displays all enrolled students with search filtering.
- Teacher can search and bulk-enroll students into class.
- Removing student safely archives enrollment via RPC.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "roster", "enrollment"],
      links: [
        { label: "Class Roster Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-04-class-roster-and-enrollment" }
      ],
      depends_on: ["TCH-CORE-03", "UIK-18", "BE-OPS-04"]
    },
    {
      code: "TCH-CORE-05",
      block: "TCH-CORE",
      title: "Class rules, game limits and accommodation overrides (TC-05)",
      description: `### Goal
Implement \`/teacher/classes/:classId/rules\` settings page configuring class rules: games availability, late submission policy, and student accommodations.

### Implementation Details
- Create \`frontend/src/pages/teacher/ClassDetailPage/RulesTab.tsx\`.
- Toggles: Enable Arcade Minigames (always / after lessons completed / disabled), Enable AI Tutor.
- Late work policy: Allow late submissions, penalty percentage slider (0% to 50%).
- Individual student accommodation overrides (extra time multiplier 1.5x, late penalty waiver).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/ClassDetailPage/RulesTab.tsx\`
- **Conflict Prevention**: Follow TC-05 in TEACHER-SPEC.`,
      acceptance_criteria: `- Allows teachers to toggle gamification and AI feature availability.
- Late penalty slider updates class policy in database.
- Student accommodation overrides save correctly.`,
      estimate: "1h",
      priority: "high",
      tags: ["teacher", "rules", "accommodations"],
      links: [
        { label: "Class Rules Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-05-class-rules" }
      ],
      depends_on: ["TCH-CORE-03", "BE-CORE-04"]
    },
    {
      code: "TCH-CORE-06",
      block: "TCH-CORE",
      title: "Class custom rewards and group milestone manager (TC-06)",
      description: `### Goal
Implement \`/teacher/classes/:classId/rewards\` page allowing teachers to set custom class rewards (e.g. "Pizza Party on 10,000 XP") and grant manual bonus coins.

### Implementation Details
- Create \`frontend/src/pages/teacher/ClassDetailPage/RewardsTab.tsx\`.
- Create and edit Class Milestone Quests with target XP values.
- 'Grant Bonus Coins' modal allowing teacher to award 50-200 coins to students for classroom excellence.
- Feed of granted bonuses and achievements.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/ClassDetailPage/RewardsTab.tsx\`
- **Conflict Prevention**: Follow TC-06 in TEACHER-SPEC.`,
      acceptance_criteria: `- Teacher can launch group milestone goal with reward description.
- Awarding bonus coins updates student coin balances and logs reason.
- Bonus feed reflects recent awards.`,
      estimate: "1h",
      priority: "medium",
      tags: ["teacher", "rewards", "gamification"],
      links: [
        { label: "Class Rewards Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-06-class-rewards" }
      ],
      depends_on: ["TCH-CORE-03", "BE-OPS-06"]
    },
    {
      code: "TCH-CORE-07",
      block: "TCH-CORE",
      title: "All my students master list with performance filters (TC-07)",
      description: `### Goal
Implement \`/teacher/students\` multi-class student directory with filters for struggling students, streak champions, and missing work flags.

### Implementation Details
- Create \`frontend/src/pages/teacher/StudentsDirectoryPage/index.tsx\`.
- Comprehensive DataTable across all enrolled classes.
- Quick filter chips: 'Needs Attention' (<60% average or 2+ missing assignments), 'Top Performers', 'Inactive This Week'.
- Search by student name or username.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/StudentsDirectoryPage/**\`
- **Conflict Prevention**: Follow TC-07 in TEACHER-SPEC.`,
      acceptance_criteria: `- Lists students across all classes taught by teacher.
- Filter chips immediately isolate struggling or inactive students.
- Clicking student row opens individual progress dossier.`,
      estimate: "1h",
      priority: "high",
      tags: ["teacher", "students", "directory"],
      links: [
        { label: "All Students Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-07-all-my-students" }
      ],
      depends_on: ["TCH-CORE-01", "UIK-18"]
    },
    {
      code: "TCH-CORE-08",
      block: "TCH-CORE",
      title: "Individual student progress dossier and mastery history (TC-08)",
      description: `### Goal
Implement \`/teacher/students/:studentId\` deep-dive dossier showing complete assignment history, quiz grades, vocabulary mastery, and private teacher notes.

### Implementation Details
- Create \`frontend/src/pages/teacher/StudentProgressPage/index.tsx\`.
- Student overview: current level, overall GPA/grade percentage, attendance streak.
- Chronological timeline of completed assessments with score pills.
- Private 'Teacher Notes' notepad with auto-save for IEP/parent conferences.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/StudentProgressPage/**\`
- **Conflict Prevention**: Follow TC-08 in TEACHER-SPEC.`,
      acceptance_criteria: `- Displays full academic track record for selected student.
- Visual charts depict score trajectory over time.
- Private teacher notes persist securely in \`admin_notes\`.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "student", "progress", "dossier"],
      links: [
        { label: "Student Progress Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-08-student-progress" }
      ],
      depends_on: ["TCH-CORE-07", "BE-CORE-02"]
    },
    {
      code: "TCH-CORE-09",
      block: "TCH-CORE",
      title: "Assignments manager: homework list, status badges and statistics (TC-13)",
      description: `### Goal
Implement \`/teacher/assignments\` hub showing all created assignments, submission completion counts, and due date countdowns.

### Implementation Details
- Create \`frontend/src/pages/teacher/AssignmentsHubPage/index.tsx\`.
- Assignment card: Title, class tags, due date, submission counter (e.g. 22/28 submitted), ungraded pill.
- Actions: 'Grade Submissions', 'Edit', 'Duplicate', 'Archive'.
- Filter by class and publication status (Draft vs Published).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/AssignmentsHubPage/**\`
- **Conflict Prevention**: Follow TC-13 in TEACHER-SPEC.`,
      acceptance_criteria: `- Clean list of assignments filtered by active class.
- Submission counter accurately reflects student submissions.
- Quick action navigates directly to grading queue.`,
      estimate: "1h",
      priority: "high",
      tags: ["teacher", "assignments", "hub"],
      links: [
        { label: "Assignments List Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-13-assignments-list" }
      ],
      depends_on: ["TCH-CORE-01"]
    },
    {
      code: "TCH-CORE-10",
      block: "TCH-CORE",
      title: "Assignment submission results and item breakdown table (TC-15)",
      description: `### Goal
Implement \`/teacher/assignments/:assignmentId/results\` results table displaying all student submissions, submission timestamps, and grade status.

### Implementation Details
- Create \`frontend/src/pages/teacher/AssignmentResultsPage/index.tsx\`.
- Student submission table: Student name, status ('Not Started', 'Submitted', 'Graded'), score, submission time, late flag.
- Export results to CSV button.
- 'Release All Grades' bulk button notifying students.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/AssignmentResultsPage/**\`
- **Conflict Prevention**: Follow TC-15 in TEACHER-SPEC.`,
      acceptance_criteria: `- Lists all class students and their submission status.
- Highlights late submissions with red pill.
- Release Grades button publishes grades to students via RPC.`,
      estimate: "1h",
      priority: "high",
      tags: ["teacher", "assignments", "results"],
      links: [
        { label: "Assignment Results Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-15-assignment-results" }
      ],
      depends_on: ["TCH-CORE-09", "BE-OPS-13"]
    },
    {
      code: "TCH-CORE-11",
      block: "TCH-CORE",
      title: "Quizzes manager: active quizzes, scheduled runs and live attempts (TC-16)",
      description: `### Goal
Implement \`/teacher/quizzes\` hub listing created quizzes, active scheduled test windows, average class scores, and pass rates.

### Implementation Details
- Create \`frontend/src/pages/teacher/QuizzesHubPage/index.tsx\`.
- Quiz cards: Title, question count, time limit, class name, average score percentage, pass rate badge.
- Live test indicator: shows how many students are currently in an active quiz attempt.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/QuizzesHubPage/**\`
- **Conflict Prevention**: Follow TC-16 in TEACHER-SPEC.`,
      acceptance_criteria: `- Lists all quizzes with status and average score stats.
- Indicates live ongoing student attempts.
- Links to Quiz Builder and Quiz Results.`,
      estimate: "1h",
      priority: "high",
      tags: ["teacher", "quizzes", "hub"],
      links: [
        { label: "Quizzes List Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-16-quizzes-list" }
      ],
      depends_on: ["TCH-CORE-01"]
    },
    {
      code: "TCH-CORE-12",
      block: "TCH-CORE",
      title: "Quiz item analysis, question difficulty and distractors breakdown (TC-18)",
      description: `### Goal
Implement \`/teacher/quizzes/:quizId/results\` item analysis screen detailing class score distributions, hardest questions, and common mistake patterns.

### Implementation Details
- Create \`frontend/src/pages/teacher/QuizResultsPage/index.tsx\`.
- Class score distribution histogram (Recharts).
- Question-by-question item analysis: percentage answered correctly, most common incorrect option chosen.
- 'Grant Extra Attempt' action allowing teacher to give specific students a retake.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/QuizResultsPage/**\`
- **Conflict Prevention**: Follow TC-18 in TEACHER-SPEC.`,
      acceptance_criteria: `- Score histogram displays class grade distribution.
- Item analysis highlights questions with low success rates.
- Grant Extra Attempt increments student attempt allowance.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "quizzes", "item-analysis", "analytics"],
      links: [
        { label: "Quiz Results Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-18-quiz-results-and-item-analysis" }
      ],
      depends_on: ["TCH-CORE-11"]
    },
    {
      code: "TCH-CORE-13",
      block: "TCH-CORE",
      title: "Unified grading queue with class filter and urgency sorting (TC-20)",
      description: `### Goal
Implement \`/teacher/grading\` central queue displaying all un-graded student submissions across all classes, sorted by due date and submission age.

### Implementation Details
- Create \`frontend/src/pages/teacher/GradingQueuePage/index.tsx\`.
- Filter bar: by class, by assessment kind (Essay, Quiz review, Speaking), by due date.
- Queue row: Student name, assessment title, submitted timestamp, AI pre-grade badge (if AI grading ran).
- 'Start Grading Next' button launching focused continuous grading flow.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/GradingQueuePage/**\`
- **Conflict Prevention**: Follow TC-20 in TEACHER-SPEC.`,
      acceptance_criteria: `- Groups all pending student submissions in single queue.
- Sorting puts oldest un-graded submissions at the top.
- 'Start Grading Next' opens first pending submission.`,
      estimate: "1h",
      priority: "critical",
      tags: ["teacher", "grading", "queue"],
      links: [
        { label: "Grading Queue Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-20-grading-queue" }
      ],
      depends_on: ["TCH-CORE-01", "BE-OPS-13"]
    },
    {
      code: "TCH-CORE-14",
      block: "TCH-CORE",
      title: "Interactive grading screen: submission reader, rubric evaluator and comments (TC-21)",
      description: `### Goal
Implement \`/teacher/grading/:submissionId\` focused grading workspace featuring side-by-side student work reader, interactive rubric selector, and inline margin notes.

### Implementation Details
- Create \`frontend/src/pages/teacher/GradingScreenPage/index.tsx\`.
- Left pane: Student written submission with text selection to attach inline comments.
- Right pane: Rubric criteria evaluator (click level to assign points) and AI pre-grade suggestions.
- Audio feedback recording button (allowing teacher to record quick voice note).
- 'Save & Next' keyboard shortcut (Cmd/Ctrl + Enter) advancing to next queue item.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/GradingScreenPage/**\`
- **Conflict Prevention**: Follow TC-21 in TEACHER-SPEC.`,
      acceptance_criteria: `- Clean split-pane layout for reading and rubric scoring.
- Tapping rubric levels recalculates score instantly.
- Save & Next records grade via \`save_grade\` RPC and opens next student work.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "grading", "rubrics", "evaluator"],
      links: [
        { label: "Grading Screen Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-21-grading-screen" }
      ],
      depends_on: ["TCH-CORE-13", "BE-OPS-13"]
    },
    {
      code: "TCH-CORE-15",
      block: "TCH-CORE",
      title: "Class performance reports hub and analytics overview (TC-22, TC-23)",
      description: `### Goal
Implement \`/teacher/reports\` and \`/teacher/reports/class/:classId\` detailing curriculum completion rates, CEFR level distribution, and attendance trends.

### Implementation Details
- Create \`frontend/src/pages/teacher/ReportsPage/index.tsx\` and \`ClassReportPage.tsx\`.
- Charts: Average Quiz Scores over time, Vocabulary Mastery rate, Skills breakdown (Reading, Writing, Listening).
- Highlighting students needing targeted intervention.
- Export PDF / CSV report button.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/ReportsPage/**\`
- **Conflict Prevention**: Follow TC-22 and TC-23 in TEACHER-SPEC.`,
      acceptance_criteria: `- Renders aggregate class performance charts clearly.
- Categorizes performance by CEFR language competencies.
- Exports printable report summary.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "reports", "analytics"],
      links: [
        { label: "Reports Hub Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-22-reports-hub" },
        { label: "Class Report Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-23-class-report" }
      ],
      depends_on: ["TCH-CORE-03"]
    },
    {
      code: "TCH-CORE-16",
      block: "TCH-CORE",
      title: "Cross-class comparison and student progress report card (TC-24, TC-25)",
      description: `### Goal
Implement \`/teacher/reports/compare\` comparing multiple classes side-by-side, and \`/teacher/reports/student/:studentId\` printable student report card.

### Implementation Details
- Create \`frontend/src/pages/teacher/CompareClassesPage/index.tsx\`.
- Create \`frontend/src/pages/teacher/StudentReportCardPage/index.tsx\`.
- Multi-class comparative bar charts.
- Printable report card with school letterhead, teacher comments, and grade distributions for parent-teacher conferences.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/CompareClassesPage/**\`
  - \`frontend/src/pages/teacher/StudentReportCardPage/**\`
- **Conflict Prevention**: Follow TC-24, TC-25 in TEACHER-SPEC.`,
      acceptance_criteria: `- Compares performance benchmarks across class sections.
- Printable report card adheres to A4 print stylesheet standards.
- Teacher can add personalized narrative summary before printing.`,
      estimate: "2h",
      priority: "medium",
      tags: ["teacher", "reports", "print", "report-card"],
      links: [
        { label: "Compare Classes Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-24-compare-classes" },
        { label: "Student Report Card Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-25-student-report-card" }
      ],
      depends_on: ["TCH-CORE-15"]
    },
    {
      code: "TCH-CORE-17",
      block: "TCH-CORE",
      title: "Class announcements hub and rich announcement composer (TC-26, TC-27)",
      description: `### Goal
Implement \`/teacher/announcements\` feed and rich announcement composer allowing teachers to publish updates, homework reminders, and urgent alerts.

### Implementation Details
- Create \`frontend/src/pages/teacher/AnnouncementsPage/index.tsx\`.
- Composer modal: Title, target class selection, rich text body, priority toggle (Normal vs Urgent).
- Urgent toggle emits immediate Realtime alert banner to student screens.
- Read receipt stats: shows list of students who have opened announcement.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/AnnouncementsPage/**\`
- **Conflict Prevention**: Follow TC-26, TC-27 in TEACHER-SPEC.`,
      acceptance_criteria: `- Creates and broadcasts announcement to enrolled students.
- Shows read receipts percentage for teacher.
- Urgent priority broadcasts Realtime notification immediately.`,
      estimate: "1h",
      priority: "high",
      tags: ["teacher", "announcements", "communication"],
      links: [
        { label: "Announcements List Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-26-announcements-list" },
        { label: "Announcement Composer Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-27-announcement-composer" }
      ],
      depends_on: ["TCH-CORE-03", "BE-OPS-19"]
    },
    {
      code: "TCH-CORE-18",
      block: "TCH-CORE",
      title: "Teacher notifications inbox and alerts drawer (TC-28)",
      description: `### Goal
Implement \`/teacher/notifications\` inbox showing alerts for new student submissions, late submissions, help requests, and school admin notices.

### Implementation Details
- Create \`frontend/src/pages/teacher/NotificationsPage/index.tsx\`.
- Filter categories: 'Submissions', 'Class Requests', 'System Notices'.
- Clicking notification opens relevant grading screen or class approval modal.
- Mark all as read action.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/NotificationsPage/**\`
- **Conflict Prevention**: Follow TC-28 in TEACHER-SPEC.`,
      acceptance_criteria: `- Receives real-time alerts on student submissions.
- Directly navigates to action item on click.
- Clean unread badge synchronization.`,
      estimate: "1h",
      priority: "medium",
      tags: ["teacher", "notifications"],
      links: [
        { label: "Teacher Notifications Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-28-notifications" }
      ],
      depends_on: ["TCH-CORE-01"]
    },
    {
      code: "TCH-CORE-19",
      block: "TCH-CORE",
      title: "Teacher account and classroom preferences settings (TC-29)",
      description: `### Goal
Implement \`/teacher/settings\` page allowing teachers to manage profile, default class grading scales, notification email preferences, and password.

### Implementation Details
- Create \`frontend/src/pages/teacher/SettingsPage/index.tsx\`.
- Default grading scale settings (Percentage vs Letter Grade A-F).
- Notification preferences: submission digests, instant alerts on urgent questions.
- Profile update (Display name, title, bio).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/SettingsPage/**\`
- **Conflict Prevention**: Follow TC-29 in TEACHER-SPEC.`,
      acceptance_criteria: `- Updates teacher preferences cleanly in database.
- Adjusts default grading scales across builder workflows.
- Password change modal functions securely.`,
      estimate: "1h",
      priority: "low",
      tags: ["teacher", "settings"],
      links: [
        { label: "Teacher Settings Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-29-settings" }
      ],
      depends_on: ["TCH-CORE-01"]
    },
    {
      code: "TCH-CORE-20",
      block: "TCH-CORE",
      title: "Live quiz monitoring dashboard and active test control room",
      description: `### Goal
Build real-time quiz monitoring room displaying a live grid of active student progress during ongoing exams (question number, active time, online status).

### Implementation Details
- Create \`frontend/src/pages/teacher/QuizMonitorPage/index.tsx\`.
- Realtime grid of all enrolled students taking active test.
- Indicators: Current question number, elapsed time, connection status (green dot = active, yellow = idle).
- Teacher actions: 'Extend Time for Class (+5 min)', 'Force Submit Student Attempt'.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/QuizMonitorPage/**\`
- **Conflict Prevention**: Connects via Realtime channel.`,
      acceptance_criteria: `- Real-time grid updates student progress without manual page reload.
- Extend Time action pushes extra minutes to student timers.
- Force Submit terminates and auto-scores attempt immediately.`,
      estimate: "2h",
      priority: "medium",
      tags: ["teacher", "quizzes", "realtime", "monitoring"],
      links: [
        { label: "Quiz Results Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-18-quiz-results-and-item-analysis" }
      ],
      depends_on: ["TCH-CORE-11", "BE-EDGE-17"]
    },
    {
      code: "TCH-CORE-21",
      block: "TCH-CORE",
      title: "Audio feedback recorder component for grading oral student exercises",
      description: `### Goal
Build audio feedback recording tool inside teacher grading screen enabling teachers to record up to 60 seconds of verbal encouragement and pronunciation tips.

### Implementation Details
- Create \`frontend/src/shared/components/teacher/AudioFeedbackRecorder.tsx\`.
- Microphone record, pause, and preview playback controls.
- Uploads audio recording to \`media-audio\` storage bucket via \`storage-upload\` Edge Function.
- Attaches audio URL to submission grading feedback.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/components/teacher/AudioFeedbackRecorder.tsx\`
- **Conflict Prevention**: Integrates into \`GradingScreenPage\`.`,
      acceptance_criteria: `- Records crisp audio via MediaRecorder API.
- Previews audio with waveform prior to saving.
- Uploads and attaches public URL to student submission feedback.`,
      estimate: "1h",
      priority: "medium",
      tags: ["teacher", "audio", "grading", "speaking"],
      links: [
        { label: "Grading Screen Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-21-grading-screen" }
      ],
      depends_on: ["TCH-CORE-14", "BE-EDGE-15"]
    },
    {
      code: "TCH-CORE-22",
      block: "TCH-CORE",
      title: "Teacher core workflows integration tests and grading verification",
      description: `### Goal
Write end-to-end integration tests in Vitest validating the full teacher journey: class creation, student enrollment, assignment publishing, and rubric grading.

### Implementation Details
- Create \`frontend/src/test/integration/teacher-core.test.tsx\`.
- Test class creation and join code generation.
- Test roster student addition and removal.
- Test rubric grading calculation and submission.
- Test grade release notification dispatch.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/test/integration/teacher-core.test.tsx\`
- **Conflict Prevention**: Automated test suite.`,
      acceptance_criteria: `- All teacher core integration tests run green.
- Confirms grading arithmetic conforms to rubric criteria rules.
- Verifies security boundaries so teachers cannot grade other classes.`,
      estimate: "2h",
      priority: "high",
      tags: ["testing", "teacher", "vitest"],
      links: [
        { label: "Testing Spec", url: "backend/docs/12-TESTING.md#1-test-pyramid-and-responsibilities" }
      ],
      depends_on: ["TCH-CORE-02", "TCH-CORE-14"]
    }
  ]
};
