// Block STU-CORE: Student Core Learning, Courses & Assessments (~24 tasks)
module.exports = {
  block: {
    code: "STU-CORE",
    name: "Student Core Learning, Courses & Assessments",
    description: "Student portal core pages: dashboard, course list, unit map, interactive lesson player, activity screens, quiz attempt runner, assignment submission, results, and account settings (ST-01 to ST-14, ST-31).",
  },
  tasks: [
    {
      code: "STU-CORE-01",
      block: "STU-CORE",
      title: "Student Dashboard: overview banner, continue learning card and quick stats (ST-01)",
      description: `### Goal
Build primary Student Dashboard page (\`ST-01\`) displaying personalized welcome greeting, current level badge, 'Continue Learning' resume button, and daily XP goal bar.

### Implementation Details
- Create \`frontend/src/pages/student/DashboardPage/index.tsx\`.
- Fetch student stats via \`useStudentStats()\` (XP, level, coins, streak).
- 'Continue Learning' hero card linking to last accessed lesson or next pending activity.
- Daily XP progress bar toward target goal.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-01-student-dashboard\`
- **Owns**:
  - \`frontend/src/pages/student/DashboardPage/**\`
- **Conflict Prevention**: Follow ST-01 specification in STUDENT-SPEC.`,
      acceptance_criteria: `- Renders student greeting with active level and avatar.
- Continue Learning button launches correct lesson.
- Daily XP bar fills proportionally to today's earnings.`,
      estimate: "2h",
      priority: "critical",
      tags: ["student", "dashboard", "learning"],
      links: [
        { label: "Student Dashboard Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-01-dashboard" }
      ],
      depends_on: ["UIK-23", "BE-OPS-02"]
    },
    {
      code: "STU-CORE-02",
      block: "STU-CORE",
      title: "Student Dashboard: upcoming deadlines and active class quests widget",
      description: `### Goal
Implement dashboard side widgets: upcoming assessment deadlines, unsubmitted homework alerts, and active daily quest progress previews.

### Implementation Details
- Create \`frontend/src/pages/student/DashboardPage/DeadlinesWidget.tsx\` and \`QuestsWidget.tsx\`.
- Query active deadlines via \`my_deadlines\` API hook.
- Highlight overdue items in coral-600 and items due within 24 hours with pulsing clock tag.
- Quest widget displays 3 daily quests with quick-claim button.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-02-dashboard-widgets\`
- **Owns**:
  - \`frontend/src/pages/student/DashboardPage/DeadlinesWidget.tsx\`
  - \`frontend/src/pages/student/DashboardPage/QuestsWidget.tsx\`
- **Conflict Prevention**: Coordinate with STU-CORE-01 layout container.`,
      acceptance_criteria: `- Lists upcoming assignments and quizzes chronologically.
- Clicking deadline navigates directly to assessment start page.
- Quest progress counters synchronize with live database values.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "dashboard", "deadlines", "quests"],
      links: [
        { label: "Student Dashboard Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-01-dashboard" }
      ],
      depends_on: ["STU-CORE-01"]
    },
    {
      code: "STU-CORE-03",
      block: "STU-CORE",
      title: "Courses catalog and enrolled classes hub (ST-02)",
      description: `### Goal
Implement \`/student/courses\` list page displaying enrolled class curricula and optional supplementary learning tracks.

### Implementation Details
- Create \`frontend/src/pages/student/CoursesPage/index.tsx\`.
- Fetch student courses via \`my_courses\` hook.
- Course cards displaying cover image, progress percentage bar, completed lessons count, and teacher name.
- Filter tabs: 'Enrolled Classes', 'Completed', 'Self-Paced'.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-03-courses-list\`
- **Owns**:
  - \`frontend/src/pages/student/CoursesPage/**\`
- **Conflict Prevention**: Follow ST-02 in STUDENT-SPEC.`,
      acceptance_criteria: `- Renders grid of enrolled courses with progress bars.
- Filter tabs filter courses without re-fetching.
- Clicking course navigates to /student/courses/:courseId.`,
      estimate: "1h",
      priority: "critical",
      tags: ["student", "courses"],
      links: [
        { label: "Courses List Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-02-courses-list" }
      ],
      depends_on: ["UIK-23", "BE-OPS-09"]
    },
    {
      code: "STU-CORE-04",
      block: "STU-CORE",
      title: "Course details and curriculum roadmap tree (ST-03)",
      description: `### Goal
Implement \`/student/courses/:courseId\` course details page with syllabus overview, learning objectives, and unit roadmap.

### Implementation Details
- Create \`frontend/src/pages/student/CourseDetailsPage/index.tsx\`.
- Fetch course tree (units and lessons) with student completion indicators.
- Display course header band with overall progress percentage and estimated time remaining.
- List units with expandable accordion or vertical roadmap layout.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-04-course-details\`
- **Owns**:
  - \`frontend/src/pages/student/CourseDetailsPage/**\`
- **Conflict Prevention**: Follow ST-03 in STUDENT-SPEC.`,
      acceptance_criteria: `- Renders complete unit hierarchy of the course.
- Highlights current in-progress unit.
- Locked units clearly indicated with lock icon according to class rules.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "course", "curriculum"],
      links: [
        { label: "Course Details Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-03-course-details" }
      ],
      depends_on: ["STU-CORE-03"]
    },
    {
      code: "STU-CORE-05",
      block: "STU-CORE",
      title: "Unit learning map and visual lesson progression path (ST-04)",
      description: `### Goal
Implement \`/student/courses/:courseId/units/:unitId\` unit page featuring an arcade winding path map of lessons and milestone checkpoints.

### Implementation Details
- Create \`frontend/src/pages/student/UnitPage/index.tsx\`.
- Visual winding progression path (stepping stones representing lessons).
- Lesson status: \`completed\` (green with star), \`current\` (pulsing active ring), \`locked\` (padlock icon).
- Unit checkpoint boss or quiz node at the end of the path.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-05-unit-page\`
- **Owns**:
  - \`frontend/src/pages/student/UnitPage/**\`
- **Conflict Prevention**: Follow ST-04 in STUDENT-SPEC.`,
      acceptance_criteria: `- Interactive stepping-stone path linking unit lessons.
- Tooltip displays lesson title, duration, and XP reward on hover.
- Stepping stones animate slightly on hover.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "unit", "gamification", "progression"],
      links: [
        { label: "Unit Page Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-04-unit-page" }
      ],
      depends_on: ["STU-CORE-04"]
    },
    {
      code: "STU-CORE-06",
      block: "STU-CORE",
      title: "Interactive lesson player: block carousel and audio narration (ST-05)",
      description: `### Goal
Implement \`/student/lessons/:lessonId\` lesson player supporting text blocks, vocabulary callouts, audio pronunciation, and video embeds.

### Implementation Details
- Create \`frontend/src/pages/student/LessonPlayerPage/index.tsx\`.
- Render content blocks sequentially: Introduction, Vocabulary spotlight, Reading passage, Dialogue card, Audio player.
- Integrate TTS audio playback button on vocabulary words.
- 'Continue to Practice' button navigating to attached activities upon reaching the end.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-06-lesson-player\`
- **Owns**:
  - \`frontend/src/pages/student/LessonPlayerPage/**\`
- **Conflict Prevention**: Follow ST-05 in STUDENT-SPEC.`,
      acceptance_criteria: `- Renders all rich lesson content blocks cleanly without layout bugs.
- Pronunciation audio plays clearly on click.
- Marks lesson accessed via \`touch_lesson\` RPC.`,
      estimate: "2h",
      priority: "critical",
      tags: ["student", "lesson", "multimedia"],
      links: [
        { label: "Lesson Page Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-05-lesson-page" }
      ],
      depends_on: ["STU-CORE-05", "UIK-03"]
    },
    {
      code: "STU-CORE-07",
      block: "STU-CORE",
      title: "Interactive activity runner with instant feedback and reward fanfare (ST-06)",
      description: `### Goal
Implement \`/student/lessons/:lessonId/activities/:activityId\` activity solving screen using QuestionRenderer with immediate validation and celebration.

### Implementation Details
- Create \`frontend/src/pages/student/ActivityPage/index.tsx\`.
- Render interactive exercise questions (multiple choice, matching, sentence ordering).
- 'Check Answer' button with immediate positive reinforcement sound and haptic pulse.
- Completing activity awards XP/coins and triggers celebration fanfare.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-07-activity-page\`
- **Owns**:
  - \`frontend/src/pages/student/ActivityPage/**\`
- **Conflict Prevention**: Follow ST-06 in STUDENT-SPEC.`,
      acceptance_criteria: `- QuestionRenderer handles user input and validates answer.
- Correct answer triggers success audio and celebration particles.
- Submits results to backend via \`submit_activity\` RPC.`,
      estimate: "2h",
      priority: "critical",
      tags: ["student", "activity", "exercises", "feedback"],
      links: [
        { label: "Activity Page Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-06-activity-page" }
      ],
      depends_on: ["STU-CORE-06", "UIK-26", "UIK-28"]
    },
    {
      code: "STU-CORE-08",
      block: "STU-CORE",
      title: "Quizzes hub: active, upcoming and completed quiz tabs (ST-07)",
      description: `### Goal
Implement \`/student/quizzes\` hub listing assigned quizzes organized by status: Available Now, Upcoming, and Completed/Graded.

### Implementation Details
- Create \`frontend/src/pages/student/QuizzesHubPage/index.tsx\`.
- Fetch quizzes via \`my_quizzes\` hook.
- Quiz cards: title, class name, question count, time limit, attempt allowance, score badge.
- Filter by status and search by quiz title.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-08-quizzes-hub\`
- **Owns**:
  - \`frontend/src/pages/student/QuizzesHubPage/**\`
- **Conflict Prevention**: Follow ST-07 in STUDENT-SPEC.`,
      acceptance_criteria: `- Separates available vs completed quizzes accurately.
- Highlights urgent quizzes due soon.
- Past quizzes show earned grade percentage.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "quizzes", "hub"],
      links: [
        { label: "Quizzes Hub Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-07-quizzes-hub" }
      ],
      depends_on: ["UIK-23", "BE-OPS-10"]
    },
    {
      code: "STU-CORE-09",
      block: "STU-CORE",
      title: "Quiz start page: instructions, honor code and attempt launcher (ST-08)",
      description: `### Goal
Implement \`/student/quizzes/:quizId\` pre-flight start screen detailing rules, timer limits, attempt number, and 'Start Quiz' confirmation.

### Implementation Details
- Create \`frontend/src/pages/student/QuizStartPage/index.tsx\`.
- Display assessment metadata: duration, allowed attempts, passing grade, shuffle notice.
- Academic integrity pledge checkbox.
- 'Begin Attempt' button invoking \`start_quiz_attempt\` RPC and navigating to attempt screen.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-09-quiz-start\`
- **Owns**:
  - \`frontend/src/pages/student/QuizStartPage/**\`
- **Conflict Prevention**: Follow ST-08 in STUDENT-SPEC.`,
      acceptance_criteria: `- Displays clear pre-quiz instructions and time constraints.
- Prevents starting attempt if max attempts reached.
- Begin Attempt creates active database attempt and transitions to runner.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "quizzes", "pre-flight"],
      links: [
        { label: "Quiz Start Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-08-quiz-start" }
      ],
      depends_on: ["STU-CORE-08"]
    },
    {
      code: "STU-CORE-10",
      block: "STU-CORE",
      title: "Quiz attempt runner: live timer, question navigator and autosave (ST-09)",
      description: `### Goal
Implement \`/student/quizzes/:quizId/attempt/:attemptId\` focused quiz taking screen with synchronized countdown timer, question navigator grid, and autosave.

### Implementation Details
- Create \`frontend/src/pages/student/QuizAttemptPage/index.tsx\`.
- Floating header: synchronized countdown timer, question progress indicator, and 'Submit Quiz' button.
- Question navigator sidebar / bottom drawer showing answered vs unanswered pills.
- Autosaves answers every 30 seconds or on question change via \`save_quiz_answers\`.
- Fullscreen focused flow mode hiding standard sidebar navigation.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-10-quiz-attempt-runner\`
- **Owns**:
  - \`frontend/src/pages/student/QuizAttemptPage/**\`
- **Conflict Prevention**: Follow ST-09 in STUDENT-SPEC.`,
      acceptance_criteria: `- Timer counts down accurately against server-calculated expiration.
- Question navigator highlights answered vs flagged questions.
- Unload warning prevents accidental tab closing without submission.`,
      estimate: "2h",
      priority: "critical",
      tags: ["student", "quizzes", "timer", "runner"],
      links: [
        { label: "Quiz Attempt Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-09-quiz-attempt-question--navigation" }
      ],
      depends_on: ["STU-CORE-09", "UIK-26", "BE-OPS-11"]
    },
    {
      code: "STU-CORE-11",
      block: "STU-CORE",
      title: "Quiz result page: score breakdown, item review and explanations (ST-10)",
      description: `### Goal
Implement \`/student/quizzes/:quizId/result/:attemptId\` result screen displaying final score, pass/fail badge, XP rewards, and review of questions.

### Implementation Details
- Create \`frontend/src/pages/student/QuizResultPage/index.tsx\`.
- Score summary card: percentage, points earned / max points, time taken.
- If passed, trigger celebration dialog and XP/coins reward fanfare.
- Question-by-question review (if quiz settings permit review): shows student answer, correct answer, and explanation.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-11-quiz-result\`
- **Owns**:
  - \`frontend/src/pages/student/QuizResultPage/**\`
- **Conflict Prevention**: Follow ST-10 in STUDENT-SPEC.`,
      acceptance_criteria: `- Accurately displays final score and pass/fail status.
- Triggers celebratory fanfare on high passing grades.
- Question explanations display when review mode is unlocked.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "quizzes", "results"],
      links: [
        { label: "Quiz Result Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-10-quiz-result" }
      ],
      depends_on: ["STU-CORE-10", "UIK-28"]
    },
    {
      code: "STU-CORE-12",
      block: "STU-CORE",
      title: "Assignments list and homework hub (ST-11)",
      description: `### Goal
Implement \`/student/assignments\` hub listing assigned written essays, worksheets, and speaking exercises with due dates and submission statuses.

### Implementation Details
- Create \`frontend/src/pages/student/AssignmentsListPage/index.tsx\`.
- Tabs: 'To Do', 'Submitted (Pending Review)', 'Graded'.
- Cards display title, class name, due date pill, submission status, and rubric summary.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-12-assignments-list\`
- **Owns**:
  - \`frontend/src/pages/student/AssignmentsListPage/**\`
- **Conflict Prevention**: Follow ST-11 in STUDENT-SPEC.`,
      acceptance_criteria: `- Filters homework assignments by active status cleanly.
- Overdue assignments flagged with clear warnings.
- Graded assignments display final teacher mark.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "assignments", "homework"],
      links: [
        { label: "Assignments List Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-11-assignments-list" }
      ],
      depends_on: ["UIK-23", "BE-OPS-12"]
    },
    {
      code: "STU-CORE-13",
      block: "STU-CORE",
      title: "Assignment details, guidelines and rubric preview (ST-12)",
      description: `### Goal
Implement \`/student/assignments/:assignmentId\` overview page presenting teacher prompt, attached reference materials, and grading rubric.

### Implementation Details
- Create \`frontend/src/pages/student/AssignmentDetailsPage/index.tsx\`.
- Render assignment guidelines, word count targets, and resource attachments (PDFs, audio).
- Rubric criteria table detailing expectations for full credit.
- 'Start Working' button opening solving workspace.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-13-assignment-details\`
- **Owns**:
  - \`frontend/src/pages/student/AssignmentDetailsPage/**\`
- **Conflict Prevention**: Follow ST-12 in STUDENT-SPEC.`,
      acceptance_criteria: `- Displays clear writing prompt and formatting guidelines.
- Rubric criteria preview is fully readable.
- 'Start Working' resumes existing draft if one exists.`,
      estimate: "1h",
      priority: "medium",
      tags: ["student", "assignments", "rubric"],
      links: [
        { label: "Assignment Details Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-12-assignment-details" }
      ],
      depends_on: ["STU-CORE-12"]
    },
    {
      code: "STU-CORE-14",
      block: "STU-CORE",
      title: "Assignment solving workspace: rich text editor, autosave and submit (ST-13)",
      description: `### Goal
Implement \`/student/assignments/:assignmentId/solve\` workspace featuring Tiptap rich text editor, live word counter, automatic draft saving, and final submit.

### Implementation Details
- Create \`frontend/src/pages/student/AssignmentSolvePage/index.tsx\`.
- Tiptap rich text editor (bold, italic, lists, headings).
- Live word counter and character counter.
- Autosaves draft every 15 seconds to \`writing_drafts\` via debounced hook.
- 'Submit for Grading' confirmation modal.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-14-assignment-solve\`
- **Owns**:
  - \`frontend/src/pages/student/AssignmentSolvePage/**\`
- **Conflict Prevention**: Follow ST-13 in STUDENT-SPEC.`,
      acceptance_criteria: `- Seamless typing experience in rich text editor.
- Autosaves draft without UI lockup; status shows 'Saved just now'.
- Submitting marks status 'submitted' and locks editor from further edits.`,
      estimate: "2h",
      priority: "critical",
      tags: ["student", "assignments", "editor", "tiptap"],
      links: [
        { label: "Assignment Solving Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-13-assignment-solving-autosave" }
      ],
      depends_on: ["STU-CORE-13", "BE-OPS-12"]
    },
    {
      code: "STU-CORE-15",
      block: "STU-CORE",
      title: "Assignment feedback and teacher rubric review page (ST-14)",
      description: `### Goal
Implement \`/student/assignments/:assignmentId/result\` page reviewing teacher grades, rubric score breakdown, and inline margin comments.

### Implementation Details
- Create \`frontend/src/pages/student/AssignmentResultPage/index.tsx\`.
- Rubric score evaluation breakdown showing marks awarded per criterion.
- Read-only student text view with highlighted inline teacher comments.
- Overall teacher feedback card with audio feedback note player if provided.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-15-assignment-result\`
- **Owns**:
  - \`frontend/src/pages/student/AssignmentResultPage/**\`
- **Conflict Prevention**: Follow ST-14 in STUDENT-SPEC.`,
      acceptance_criteria: `- Clearly displays final letter grade / percentage.
- Rubric criteria marks detail exactly where points were earned.
- Inline teacher comments expand on hover or tap.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "assignments", "feedback", "grading"],
      links: [
        { label: "Assignment Result Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-14-assignment-result-and-feedback" }
      ],
      depends_on: ["STU-CORE-14"]
    },
    {
      code: "STU-CORE-16",
      block: "STU-CORE",
      title: "Vocabulary practice library and flashcards tool (ST-15)",
      description: `### Goal
Implement \`/student/practice/vocabulary\` vocabulary library with spaced repetition flashcards, audio pronunciation, and mastery status filters.

### Implementation Details
- Create \`frontend/src/pages/student/VocabularyPracticePage/index.tsx\`.
- Interactive 3D flip flashcard component (term, part of speech, CEFR level on front; Arabic translation, definition, and example sentence on back).
- Spaced repetition action buttons: 'Need Practice', 'Almost Got It', 'Mastered'.
- Filter by topic tag and mastery level.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-16-vocabulary-tool\`
- **Owns**:
  - \`frontend/src/pages/student/VocabularyPracticePage/**\`
- **Conflict Prevention**: Follow ST-15 in STUDENT-SPEC.`,
      acceptance_criteria: `- Flashcard flips smoothly on click or Spacebar.
- Audio icon pronounces English word clearly.
- Spaced repetition ratings update mastery stats in database.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "vocabulary", "flashcards", "practice"],
      links: [
        { label: "Vocabulary Practice Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-15-vocabulary" }
      ],
      depends_on: ["UIK-23", "UIK-03"]
    },
    {
      code: "STU-CORE-17",
      block: "STU-CORE",
      title: "Grammar trainer: rules reference and interactive exercises (ST-16)",
      description: `### Goal
Implement \`/student/practice/grammar\` grammar workout page featuring bite-sized rule explanations and interactive sentence correction drills.

### Implementation Details
- Create \`frontend/src/pages/student/GrammarPracticePage/index.tsx\`.
- Topic selector: Tenses, Prepositions, Conditionals, Modals, Passive Voice.
- Interactive sentence unscrambling and error-spotting exercises.
- Instant explanations detailing grammatical rules on mistakes.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-17-grammar-trainer\`
- **Owns**:
  - \`frontend/src/pages/student/GrammarPracticePage/**\`
- **Conflict Prevention**: Follow ST-16 in STUDENT-SPEC.`,
      acceptance_criteria: `- Modular grammar exercise cards with immediate feedback.
- Explains grammatical rule rationale on error.
- Tracks completed drills toward daily XP goals.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "grammar", "practice"],
      links: [
        { label: "Grammar Practice Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-16-grammar" }
      ],
      depends_on: ["STU-CORE-16", "UIK-26"]
    },
    {
      code: "STU-CORE-18",
      block: "STU-CORE",
      title: "Reading room: leveled passages, comprehension questions and audio read-along (ST-17)",
      description: `### Goal
Implement \`/student/practice/reading\` reading lab featuring leveled stories, synchronized audio read-along, and comprehension checkpoints.

### Implementation Details
- Create \`frontend/src/pages/student/ReadingPracticePage/index.tsx\`.
- CEFR leveled stories (A1 to B2) with reading time estimates.
- Synchronized read-along highlighting active sentence in sync with audio narration.
- Comprehension quiz questions at conclusion of passage.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-18-reading-room\`
- **Owns**:
  - \`frontend/src/pages/student/ReadingPracticePage/**\`
- **Conflict Prevention**: Follow ST-17 in STUDENT-SPEC.`,
      acceptance_criteria: `- Highlights text in sync with audio playback.
- Word definition popover appears on clicking difficult words.
- Comprehension quiz awards XP upon completion.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "reading", "practice", "audio"],
      links: [
        { label: "Reading Practice Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-17-reading" }
      ],
      depends_on: ["STU-CORE-16", "UIK-15"]
    },
    {
      code: "STU-CORE-19",
      block: "STU-CORE",
      title: "Writing workshop: prompts, guided scaffolding and drafting tool (ST-18)",
      description: `### Goal
Implement \`/student/practice/writing\` guided writing lab with creative/academic prompts, sentence starters, and structured essay templates.

### Implementation Details
- Create \`frontend/src/pages/student/WritingPracticePage/index.tsx\`.
- Prompt gallery categorized by type: Story, Opinion, Email, Review.
- Sentence starter chips that can be inserted with one click.
- Integrated AI feedback trigger connecting to \`ai-writing-feedback\` Edge Function.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-19-writing-workshop\`
- **Owns**:
  - \`frontend/src/pages/student/WritingPracticePage/**\`
- **Conflict Prevention**: Follow ST-18 in STUDENT-SPEC.`,
      acceptance_criteria: `- Clicking sentence starter inserts phrase into editor.
- AI feedback button triggers structured grammar and vocabulary review.
- Saves writing drafts safely in background.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "writing", "practice"],
      links: [
        { label: "Writing Practice Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-18-writing" }
      ],
      depends_on: ["STU-CORE-14", "BE-EDGE-06"]
    },
    {
      code: "STU-CORE-20",
      block: "STU-CORE",
      title: "Bilingual translation workbench and custom vocabulary notebook (ST-19)",
      description: `### Goal
Implement \`/student/practice/translation\` translation workbench with English-Arabic lookup, phonetic audio, and 'Add to My Words' notebook saver.

### Implementation Details
- Create \`frontend/src/pages/student/TranslationPracticePage/index.tsx\`.
- Bidirectional search bar with instant translation powered by \`ai-translate\` function.
- Detailed card: Arabic with harakat, phonetic spelling, part of speech, and 3 example sentences.
- 'Save to My Words' button adding entry to student's personal vocabulary bank.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-20-translation-workbench\`
- **Owns**:
  - \`frontend/src/pages/student/TranslationPracticePage/**\`
- **Conflict Prevention**: Follow ST-19 in STUDENT-SPEC.`,
      acceptance_criteria: `- Displays accurate Arabic translation with vowel marks.
- Pronunciation audio plays on click.
- 'Save to My Words' persists word into student's personal review deck.`,
      estimate: "1h",
      priority: "medium",
      tags: ["student", "translation", "arabic", "vocabulary"],
      links: [
        { label: "Translation Practice Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-19-translation" }
      ],
      depends_on: ["STU-CORE-16", "BE-EDGE-07"]
    },
    {
      code: "STU-CORE-21",
      block: "STU-CORE",
      title: "Student profile, stats overview and pinned badges showcase (ST-28)",
      description: `### Goal
Implement \`/student/profile\` page displaying lifetime stats, total XP, current level, streak records, and showcase of up to 3 pinned badges.

### Implementation Details
- Create \`frontend/src/pages/student/ProfilePage/index.tsx\`.
- Profile hero: avatar with LevelRing, username, enrolled grade level.
- Stats grid: Total XP, Lessons Completed, Quiz Average, Longest Streak.
- Pinned badges showcase slot with 'Change Pinned Badges' modal.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-21-student-profile\`
- **Owns**:
  - \`frontend/src/pages/student/ProfilePage/**\`
- **Conflict Prevention**: Follow ST-28 in STUDENT-SPEC.`,
      acceptance_criteria: `- Renders lifetime stats with clear visual cards.
- Displays up to 3 pinned badges with achievement tooltips.
- Responsive layout adapting to mobile and desktop.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "profile", "stats", "badges"],
      links: [
        { label: "Profile Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-28-profile-and-avatar-editor" }
      ],
      depends_on: ["UIK-23", "UIK-08"]
    },
    {
      code: "STU-CORE-22",
      block: "STU-CORE",
      title: "Avatar customizer studio: parts picker and color palette (ST-28)",
      description: `### Goal
Build interactive avatar customization modal/page allowing students to equip unlocked hairstyles, glasses, hats, and outfits with live preview.

### Implementation Details
- Create \`frontend/src/pages/student/ProfilePage/AvatarStudioModal.tsx\`.
- Category tabs: Head, Hair, Eyes/Glasses, Accessories, Outfits, Background.
- Live SVG avatar preview updating in real-time on selection.
- Save button updating \`profiles.avatar_url\` in database.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-22-avatar-studio\`
- **Owns**:
  - \`frontend/src/pages/student/ProfilePage/AvatarStudioModal.tsx\`
- **Conflict Prevention**: Follow ST-28 in STUDENT-SPEC.`,
      acceptance_criteria: `- Real-time SVG avatar composition updating on click.
- Locked items display lock icon with unlock level requirement.
- Successfully saves chosen avatar configuration.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "avatar", "customization"],
      links: [
        { label: "Avatar Studio Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-28-profile-and-avatar-editor" }
      ],
      depends_on: ["STU-CORE-21"]
    },
    {
      code: "STU-CORE-23",
      block: "STU-CORE",
      title: "Certificates of completion gallery and PDF export (ST-29)",
      description: `### Goal
Implement \`/student/certificates\` page showing earned course graduation certificates with printable styling and PDF download.

### Implementation Details
- Create \`frontend/src/pages/student/CertificatesPage/index.tsx\`.
- Certificate card displaying course title, completion date, and verified certificate hash.
- Fullscreen certificate modal with ornate arcade border, gold seal, and student name.
- 'Print / Download PDF' button formatted for standard A4 landscape printing.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-23-certificates\`
- **Owns**:
  - \`frontend/src/pages/student/CertificatesPage/**\`
- **Conflict Prevention**: Follow ST-29 in STUDENT-SPEC.`,
      acceptance_criteria: `- Renders beautiful certificate template with student name and date.
- Verification hash displayed on certificate footer.
- Print stylesheet formats cleanly to landscape page without cutoffs.`,
      estimate: "1h",
      priority: "medium",
      tags: ["student", "certificates", "pdf"],
      links: [
        { label: "Certificates Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-29-certificates" }
      ],
      depends_on: ["STU-CORE-21"]
    },
    {
      code: "STU-CORE-24",
      block: "STU-CORE",
      title: "Student settings: audio, motion, notification preferences and password change (ST-31)",
      description: `### Goal
Implement \`/student/settings\` page allowing students to adjust audio volume, sound effects toggle, reduced motion, and change their password.

### Implementation Details
- Create \`frontend/src/pages/student/SettingsPage/index.tsx\`.
- Sound effects toggle and volume slider syncing with \`SoundProvider\`.
- Reduced motion toggle and visual effects tier picker (Low, Balanced, High).
- Change password card (current password, new password, confirmation).
- Save preferences to \`user_settings\` table.

### Git & Review Guidelines
- **Branch**: \`task/STU-CORE-24-student-settings\`
- **Owns**:
  - \`frontend/src/pages/student/SettingsPage/**\`
- **Conflict Prevention**: Follow ST-31 in STUDENT-SPEC.`,
      acceptance_criteria: `- Toggling sound or effects tier applies immediately across the app.
- Changing password validates policies and confirms with toast.
- Preferences persist reliably in database.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "settings", "preferences"],
      links: [
        { label: "Student Settings Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-31-settings" }
      ],
      depends_on: ["UIK-23", "UIK-02", "UIK-03"]
    }
  ]
};
