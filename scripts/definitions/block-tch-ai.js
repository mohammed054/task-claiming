// Block TCH-AI: Teacher Builders, Question Bank, Rubrics & AI Wizards (~20 tasks)
module.exports = {
  block: {
    code: "TCH-AI",
    name: "Teacher Builders, Question Bank, Rubrics & AI Wizards",
    description: "Curriculum and assessment authoring tools: course builder, lesson block editor, quiz builder, assignment authoring, question bank, rubric designer, AI Course Wizard, AI Planner, and AI Support Plans (TC-09 to TC-12, TC-14, TC-17, TC-19, TC-30 to TC-32).",
  },
  tasks: [
    {
      code: "TCH-AI-01",
      block: "TCH-AI",
      title: "Teacher courses list and curriculum management hub (TC-09)",
      description: `### Goal
Implement \`/teacher/courses\` hub displaying all teacher-authored courses, official school curriculum copies, publication statuses, and 'Create Course' launcher.

### Implementation Details
- Create \`frontend/src/pages/teacher/CoursesAuthoringPage/index.tsx\`.
- Course cards showing draft/published badges, unit counts, enrolled classes count, and last edited timestamp.
- 'Create New Course' and 'Adopt Official Curriculum' action buttons.
- Duplicate course and archive actions.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/CoursesAuthoringPage/**\`
- **Conflict Prevention**: Follow TC-09 in TEACHER-SPEC.`,
      acceptance_criteria: `- Lists teacher courses with publication status badges.
- Duplicate action creates fresh copy with '(Copy)' suffix.
- Create Course navigates to course builder.`,
      estimate: "1h",
      priority: "high",
      tags: ["teacher", "curriculum", "courses", "authoring"],
      links: [
        { label: "Courses Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-09-courses" }
      ],
      depends_on: ["TCH-CORE-01", "BE-CORE-05"]
    },
    {
      code: "TCH-AI-02",
      block: "TCH-AI",
      title: "Interactive course builder: unit hierarchy and drag-and-drop reordering (TC-10)",
      description: `### Goal
Implement \`/teacher/courses/:courseId/edit\` course outline builder allowing teachers to structure units, add lessons, and reorder elements via drag-and-drop.

### Implementation Details
- Create \`frontend/src/pages/teacher/CourseBuilderPage/index.tsx\`.
- Drag-and-drop outline tree powered by \`@dnd-kit\`.
- Add Unit and Add Lesson inline action buttons.
- Lesson metadata drawer: Title, XP reward, estimated duration, CEFR level.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/CourseBuilderPage/**\`
- **Conflict Prevention**: Follow TC-10 in TEACHER-SPEC.`,
      acceptance_criteria: `- Units and lessons can be reordered via drag-and-drop.
- Inline creation adds units and lessons instantly.
- Saves outline order to database via debounced update.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "course-builder", "dnd-kit"],
      links: [
        { label: "Course Builder Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-10-course-builder" }
      ],
      depends_on: ["TCH-AI-01"]
    },
    {
      code: "TCH-AI-03",
      block: "TCH-AI",
      title: "Modular lesson editor: rich content blocks and media attachments (TC-11)",
      description: `### Goal
Implement \`/teacher/lessons/:lessonId/edit\` content editor allowing teachers to assemble lessons by adding and arranging modular learning blocks.

### Implementation Details
- Create \`frontend/src/pages/teacher/LessonEditorPage/index.tsx\`.
- Supported block types: Text/Exposition (Tiptap), Vocabulary Spotlight, Dialogue/Conversation, Audio Narration, Image Card, Interactive Quiz Question.
- Drag-handle to reorder blocks within lesson.
- Live preview toggle showing exactly how lesson appears to students.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/LessonEditorPage/**\`
- **Conflict Prevention**: Follow TC-11 in TEACHER-SPEC.`,
      acceptance_criteria: `- Allows adding, editing, and deleting all 6 block types.
- Media upload button attaches audio and images via storage pipeline.
- Live preview mirrors student lesson player.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "lesson-editor", "blocks", "authoring"],
      links: [
        { label: "Lesson Editor Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-11-lesson-editor" }
      ],
      depends_on: ["TCH-AI-02", "BE-EDGE-15"]
    },
    {
      code: "TCH-AI-04",
      block: "TCH-AI",
      title: "Course publish and class assignment wizard (TC-12)",
      description: `### Goal
Implement \`/teacher/courses/:courseId/publish\` validation checklist and assignment wizard creating immutable snapshot and enrolling classes.

### Implementation Details
- Create \`frontend/src/pages/teacher/CoursePublishPage/index.tsx\`.
- Pre-publish validation checklist: checks that course has >= 1 unit, >= 1 lesson, no empty text blocks, and valid XP values.
- Version bump selector (Major, Minor revision notes).
- Class assignment checkboxes assigning published version to active classes.
- Invokes \`publish_course\` RPC.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/CoursePublishPage/**\`
- **Conflict Prevention**: Follow TC-12 in TEACHER-SPEC.`,
      acceptance_criteria: `- Validation checklist catches broken or empty lessons before publishing.
- Publishing creates immutable snapshot via \`publish_course\` RPC.
- Assigns course to selected classes immediately.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "publishing", "snapshot", "curriculum"],
      links: [
        { label: "Course Publish Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-12-course-publish-and-assign" }
      ],
      depends_on: ["TCH-AI-02", "BE-OPS-08"]
    },
    {
      code: "TCH-AI-05",
      block: "TCH-AI",
      title: "Assignment builder: prompt authoring, attachments and rubric selector (TC-14)",
      description: `### Goal
Implement \`/teacher/assignments/create\` and \`/teacher/assignments/:assignmentId/edit\` authoring flow with rich text prompt editor, due dates, and rubric picker.

### Implementation Details
- Create \`frontend/src/pages/teacher/AssignmentBuilderPage/index.tsx\`.
- Details form: Assignment title, Target class selector, Due date & time picker, Late submissions policy.
- Rich text writing prompt editor (Tiptap).
- Attached Rubric selector (pick existing rubric or click 'Build New Rubric').

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/AssignmentBuilderPage/**\`
- **Conflict Prevention**: Follow TC-14 in TEACHER-SPEC.`,
      acceptance_criteria: `- Creates homework assignments with scheduled due dates.
- Attaches rubric for structured scoring.
- Saves assignment draft or publishes to class immediately.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "assignment-builder", "rubrics"],
      links: [
        { label: "Assignment Builder Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-14-assignment-builder" }
      ],
      depends_on: ["TCH-CORE-09", "BE-CORE-07"]
    },
    {
      code: "TCH-AI-06",
      block: "TCH-AI",
      title: "Quiz builder: test settings, question assembly and shuffle rules (TC-17)",
      description: `### Goal
Implement \`/teacher/quizzes/create\` and \`/teacher/quizzes/:quizId/edit\` quiz authoring workspace supporting timer constraints, passing threshold, and question ordering.

### Implementation Details
- Create \`frontend/src/pages/teacher/QuizBuilderPage/index.tsx\`.
- Quiz settings: Duration in minutes (or untimed), Max attempts (1 to 5), Passing grade (default 60%), Shuffle questions toggle, Results visibility mode.
- Question list: Add from Question Bank, Create New Question, or Generate with AI.
- Per-question points override input.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/QuizBuilderPage/**\`
- **Conflict Prevention**: Follow TC-17 in TEACHER-SPEC.`,
      acceptance_criteria: `- Configures complete quiz timing and attempt rules.
- Assembles questions from scratch or question bank.
- Calculates total quiz points automatically.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "quiz-builder", "quizzes"],
      links: [
        { label: "Quiz Builder Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-17-quiz-builder" }
      ],
      depends_on: ["TCH-CORE-11", "BE-CORE-07"]
    },
    {
      code: "TCH-AI-07",
      block: "TCH-AI",
      title: "Question Bank: searchable repository, tag filtering and difficulty sorting (TC-19)",
      description: `### Goal
Implement \`/teacher/question-bank\` central repository holding thousands of curriculum questions with faceted search by topic, CEFR level, question type, and usage history.

### Implementation Details
- Create \`frontend/src/pages/teacher/QuestionBankPage/index.tsx\`.
- Faceted filter bar: Question Type (Multiple Choice, Fill Blank, Matching, etc.), CEFR Level (A1–B2), Tags (Grammar, Vocab, Reading, Literature).
- Question preview card displaying prompt, answer key, and explanation.
- Actions: 'Edit', 'Add to Quiz', 'Duplicate', 'Export'.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/QuestionBankPage/**\`
- **Conflict Prevention**: Follow TC-19 in TEACHER-SPEC.`,
      acceptance_criteria: `- Instant search filters questions by keywords and tags.
- Question preview renders exact interactive preview.
- 'Add to Quiz' lets teacher insert questions directly into active quiz drafts.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "question-bank", "repository"],
      links: [
        { label: "Question Bank Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-19-question-bank" }
      ],
      depends_on: ["TCH-AI-06", "BE-CORE-06"]
    },
    {
      code: "TCH-AI-08",
      block: "TCH-AI",
      title: "Interactive Question Creator modal for all question types",
      description: `### Goal
Build modal editor enabling teachers to create questions of any type (Multiple Choice, Fill in the Blank, Matching Pairs, Reorder, Short Answer, Audio Spelling).

### Implementation Details
- Create \`frontend/src/pages/teacher/QuestionBankPage/QuestionCreatorModal.tsx\`.
- Type selector switches form fields dynamically.
- Multiple Choice: prompt, 4 options, radio button designating correct option.
- Matching: pair rows (term and definition).
- Fill in the Blank: sentence editor with \`[brackets]\` marking target blank words.
- Tag input and explanation notes for student review.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/QuestionBankPage/QuestionCreatorModal.tsx\`
- **Conflict Prevention**: Reusable modal used by Quiz Builder and Question Bank.`,
      acceptance_criteria: `- Supports creation and editing of all 6 core question types.
- Validates that correct answer is designated before saving.
- Saves question into \`questions\` table cleanly.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "question-creator", "modal"],
      links: [
        { label: "Question Bank Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-19-question-bank" },
        { label: "Questions Model", url: "backend/docs/02-DATA-MODEL-CORE.md#5-questions-and-rubrics" }
      ],
      depends_on: ["TCH-AI-07"]
    },
    {
      code: "TCH-AI-09",
      block: "TCH-AI",
      title: "Interactive Rubric Designer: criteria grid, performance levels and score weights",
      description: `### Goal
Build \`/teacher/rubrics\` authoring workspace enabling teachers to create multi-criteria assessment rubrics with performance levels (e.g. Exemplary, Proficient, Developing, Beginning).

### Implementation Details
- Create \`frontend/src/pages/teacher/RubricsPage/index.tsx\`.
- Dynamic rubric grid: Criteria rows (Content, Organization, Grammar, Vocabulary) and Level columns.
- Point values per cell and total max score calculation.
- Save as shared template or private rubric.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/RubricsPage/**\`
- **Conflict Prevention**: Follow rubrics data model in BE-CORE-06.`,
      acceptance_criteria: `- Dynamic grid adds/removes criteria rows and performance columns.
- Total score recalculates automatically based on criterion weightings.
- Saves rubric into \`rubrics\` table with JSONB criteria payload.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "rubrics", "assessment-design"],
      links: [
        { label: "Rubrics Data Model", url: "backend/docs/02-DATA-MODEL-CORE.md#5-questions-and-rubrics" },
        { label: "Grading Screen Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-21-grading-screen" }
      ],
      depends_on: ["TCH-AI-05"]
    },
    {
      code: "TCH-AI-10",
      block: "TCH-AI",
      title: "Teacher AI Copilot slide-over panel: pedagogical chat and context injection",
      description: `### Goal
Implement slide-over \`TeacherCopilotPanel\` allowing teachers to chat with educational AI while building courses or grading work.

### Implementation Details
- Create \`frontend/src/shared/components/teacher/TeacherCopilotPanel.tsx\`.
- Context injection: passes currently open course, quiz, or rubric to the model automatically.
- Streaming conversational advice powered by \`ai-copilot\` Edge Function.
- One-click prompt shortcuts: "Suggest 3 discussion questions", "Simplify this passage for Grade 5", "Create a rubric for this prompt".

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/components/teacher/TeacherCopilotPanel.tsx\`
- **Conflict Prevention**: Docked in TeacherAppShell; opens as slide-over drawer.`,
      acceptance_criteria: `- Streams pedagogical suggestions with low latency.
- Automatically injects active workspace context into prompt.
- Suggestion chips provide instant starter prompts.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "ai", "copilot", "drawer"],
      links: [
        { label: "Teacher AI Copilot", url: "backend/docs/07-AI-SYSTEM.md#5-feature-catalog" }
      ],
      depends_on: ["UIK-27", "BE-EDGE-09"]
    },
    {
      code: "TCH-AI-11",
      block: "TCH-AI",
      title: "AI Action Cards integration: visual preview, edit diff and one-click apply",
      description: `### Goal
Connect Teacher Copilot to \`ActionCardDisplay\` allowing teachers to review AI-generated quiz questions, edit them inline, and insert them directly into curriculum with one click.

### Implementation Details
- Create \`frontend/src/shared/components/teacher/TeacherActionCardContainer.tsx\`.
- Visual diff preview showing proposed questions, lesson additions, or rubric criteria.
- Inline edit mode allowing teacher to tweak suggested text before applying.
- 'Apply Changes' invokes \`apply_action_card\` RPC, mutating course/quiz immediately without manual copy-pasting.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/components/teacher/TeacherActionCardContainer.tsx\`
- **Conflict Prevention**: Follow Action Cards logic in BE-OPS-20.`,
      acceptance_criteria: `- Action card displays visual preview of proposed database modification.
- Teacher can edit text inline before applying.
- Apply button executes mutation via RPC with immediate success toast.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "ai", "action-cards", "diff"],
      links: [
        { label: "Action Cards Spec", url: "backend/docs/07-AI-SYSTEM.md#8-action-cards" }
      ],
      depends_on: ["TCH-AI-10", "BE-OPS-20"]
    },
    {
      code: "TCH-AI-12",
      block: "TCH-AI",
      title: "AI Course Generation Wizard: multi-step prompt builder and outline review (TC-30)",
      description: `### Goal
Implement \`/teacher/courses/generate\` multi-step wizard allowing teachers to input topic, grade level, learning objectives, and generate a complete course outline.

### Implementation Details
- Create \`frontend/src/pages/teacher/CourseWizardPage/index.tsx\`.
- Step 1: Course topic, CEFR target level, number of units (1 to 6), target grade level.
- Step 2: Learning standards and skill emphasis (Grammar, Writing, Literature, Speaking).
- Step 3: Trigger background generation job via \`job-runner\` and display live progress bar (0% to 100%).
- Step 4: Review generated outline with ability to regenerate specific units before saving.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/CourseWizardPage/**\`
- **Conflict Prevention**: Follow TC-30 in TEACHER-SPEC.`,
      acceptance_criteria: `- Multi-step form gathers pedagogical parameters.
- Dispatches async background job and streams step progress.
- Review screen lets teacher approve or refine generated course outline.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "ai", "course-wizard", "jobs"],
      links: [
        { label: "Course Wizard Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-30-generate-a-course-ai-wizard" },
        { label: "AI Course Job", url: "backend/docs/07-AI-SYSTEM.md#example-ai_course" }
      ],
      depends_on: ["TCH-AI-02", "BE-EDGE-12"]
    },
    {
      code: "TCH-AI-13",
      block: "TCH-AI",
      title: "AI Weekly Lesson Planner: curriculum schedule and lesson plan generator (TC-31)",
      description: `### Goal
Implement \`/teacher/planner\` AI-assisted weekly lesson planning board generating daily 45-minute lesson agendas, bell-ringers, and homework ideas.

### Implementation Details
- Create \`frontend/src/pages/teacher/LessonPlannerPage/index.tsx\`.
- Weekly calendar view (Monday through Friday) mapping class periods.
- 'Generate Weekly Plan' modal: takes target unit and generates 5 daily lesson plans with timing breakdowns.
- Daily plan detail: Warm-up activity (5m), Direct instruction (15m), Guided practice (15m), Exit ticket (10m).
- Export to printable PDF lesson plan.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/LessonPlannerPage/**\`
- **Conflict Prevention**: Follow TC-31 in TEACHER-SPEC.`,
      acceptance_criteria: `- Generates structured 5-day lesson schedule based on syllabus.
- Timed agenda breakdown for classroom management.
- Printable lesson plan format.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "ai", "planner", "lesson-planning"],
      links: [
        { label: "Planner Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-31-planner-ai-lesson-and-weekly-planning" }
      ],
      depends_on: ["TCH-CORE-01", "BE-EDGE-09"]
    },
    {
      code: "TCH-AI-14",
      block: "TCH-AI",
      title: "AI Support Plans: personalized intervention generator for struggling students (TC-32)",
      description: `### Goal
Implement \`/teacher/students/:studentId/support-plan\` intervention generator creating individualized education plans (IEP/remediation) from student mistake data.

### Implementation Details
- Create \`frontend/src/pages/teacher/SupportPlanPage/index.tsx\`.
- Automatically analyzes student's recent low-scoring quizzes and homework mistakes.
- Generates 3 targeted remediation goals and specific practice recommendations.
- Allows teacher to edit intervention strategies, assign targeted practice packs, and set follow-up check-in date.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/SupportPlanPage/**\`
- **Conflict Prevention**: Follow TC-32 in TEACHER-SPEC.`,
      acceptance_criteria: `- Analyzes student struggle areas and suggests concrete remediation steps.
- Teacher can edit and finalize support plan.
- Assigns targeted practice exercises with one click.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "ai", "support-plans", "intervention"],
      links: [
        { label: "Support Plans Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-32-support-plans-ai-help-plans-for-struggling-students" }
      ],
      depends_on: ["TCH-CORE-08", "BE-EDGE-09"]
    },
    {
      code: "TCH-AI-15",
      block: "TCH-AI",
      title: "AI Question Generator: bulk exercise generation from text or reading passage",
      description: `### Goal
Build 'Generate Questions with AI' tool inside Question Bank allowing teachers to paste any reading passage and generate 5–10 aligned comprehension questions.

### Implementation Details
- Create \`frontend/src/pages/teacher/QuestionBankPage/AiQuestionGeneratorModal.tsx\`.
- Input: Paste text passage, select target grade level, choose desired question types.
- Generates questions with answer keys and rationale explanations.
- Teacher can accept individual questions with checkboxes and add them directly to Question Bank.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/QuestionBankPage/AiQuestionGeneratorModal.tsx\`
- **Conflict Prevention**: Integrates into Question Bank.`,
      acceptance_criteria: `- Generates 5+ valid questions aligned with pasted text passage.
- Pre-populates correct answers and explanations.
- One-click bulk insertion into question bank.`,
      estimate: "2h",
      priority: "high",
      tags: ["teacher", "ai", "question-generator"],
      links: [
        { label: "Question Bank Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-19-question-bank" }
      ],
      depends_on: ["TCH-AI-08", "BE-EDGE-09"]
    },
    {
      code: "TCH-AI-16",
      block: "TCH-AI",
      title: "AI Rubric Generator: rubric creation from assignment prompt",
      description: `### Goal
Build 'Generate Rubric with AI' modal inside Rubric Designer that crafts tailored scoring criteria and descriptions from an assignment prompt.

### Implementation Details
- Create \`frontend/src/pages/teacher/RubricsPage/AiRubricGeneratorModal.tsx\`.
- Input: Assignment title, writing genre (Argumentative, Narrative, Expository), grade level.
- Generates 4 criteria rows with 4 performance levels each and descriptive descriptions.
- Inserts generated rubric into designer for teacher fine-tuning.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/RubricsPage/AiRubricGeneratorModal.tsx\`
- **Conflict Prevention**: Integrates into RubricsPage.`,
      acceptance_criteria: `- Generates comprehensive criteria matching genre expectations.
- Differentiates performance levels clearly.
- Seamlessly transfers generated rubric into grid editor.`,
      estimate: "1h",
      priority: "medium",
      tags: ["teacher", "ai", "rubrics"],
      links: [
        { label: "Rubrics Designer", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-21-grading-screen" }
      ],
      depends_on: ["TCH-AI-09", "BE-EDGE-09"]
    },
    {
      code: "TCH-AI-17",
      block: "TCH-AI",
      title: "AI Pre-Grading assistant integration in teacher grading screen",
      description: `### Goal
Connect \`ai-grade-submission\` Edge Function to teacher grading screen, providing draft rubric criterion scores and constructive feedback suggestions for teacher approval.

### Implementation Details
- Add 'Run AI Pre-Grade' button in \`GradingScreenPage.tsx\`.
- Calls \`ai-grade-submission\` Edge Function.
- Displays suggested scores as highlighted outlines on rubric cells with reasoning tooltips.
- Inserts suggested feedback into draft comments box; teacher can edit, accept, or reject with one click.
- Strict human-in-the-loop guarantee: AI suggestions never finalize without teacher confirmation.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/GradingScreenPage/AiGradingAssistant.tsx\`
- **Conflict Prevention**: Follow human-in-the-loop rule in backend docs §7.`,
      acceptance_criteria: `- Pre-evaluates essay against rubric criteria with rationale tooltips.
- Teacher retains complete control to edit or override scores.
- Clear badge distinguishes AI suggestions from finalized teacher grades.`,
      estimate: "2h",
      priority: "critical",
      tags: ["teacher", "ai", "grading", "human-in-the-loop"],
      links: [
        { label: "AI Grading Spec", url: "backend/docs/07-AI-SYSTEM.md#5-feature-catalog" },
        { label: "Grading Screen Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-21-grading-screen" }
      ],
      depends_on: ["TCH-CORE-14", "BE-EDGE-10"]
    },
    {
      code: "TCH-AI-18",
      block: "TCH-AI",
      title: "AI Announcement Drafter and tone adjuster wizard",
      description: `### Goal
Build AI announcement assistant in Announcement Composer helping teachers draft engaging announcements, praise student milestones, and translate to parents.

### Implementation Details
- Create \`frontend/src/pages/teacher/AnnouncementsPage/AiAnnouncementDrafter.tsx\`.
- Tone selector: Encouraging, Urgent / Reminder, Celebratory, Formal.
- Generates draft announcement body with emoji and arcade formatting.
- One-click Arabic translation preview for bilingual parent communications.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/AnnouncementsPage/AiAnnouncementDrafter.tsx\`
- **Conflict Prevention**: Integrates into AnnouncementsPage.`,
      acceptance_criteria: `- Generates well-crafted announcement drafts based on topic keywords.
- Adapts tone according to selection.
- Provides bilingual English/Arabic draft preview for parents.`,
      estimate: "1h",
      priority: "medium",
      tags: ["teacher", "ai", "announcements", "translation"],
      links: [
        { label: "Announcement Composer", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-27-announcement-composer" }
      ],
      depends_on: ["TCH-CORE-17", "BE-EDGE-09"]
    },
    {
      code: "TCH-AI-19",
      block: "TCH-AI",
      title: "Curriculum snapshot diff viewer and version history inspector",
      description: `### Goal
Build curriculum snapshot comparator allowing teachers to inspect changes between course versions before publishing updates.

### Implementation Details
- Create \`frontend/src/pages/teacher/CourseBuilderPage/VersionHistoryModal.tsx\`.
- Visual diff viewer highlighting added lessons in green, modified blocks in amber, and deleted elements in red.
- 'Rollback to Version X' action allowing teachers to restore past snapshots.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/teacher/CourseBuilderPage/VersionHistoryModal.tsx\`
- **Conflict Prevention**: Reads from \`content_snapshots\` table.`,
      acceptance_criteria: `- Displays clear visual diff between course versions.
- Highlights additions, edits, and deletions.
- Restore button reverts draft course state cleanly.`,
      estimate: "1h",
      priority: "medium",
      tags: ["teacher", "curriculum", "versioning", "diff"],
      links: [
        { label: "Course Publish Spec", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-12-course-publish-and-assign" }
      ],
      depends_on: ["TCH-AI-04"]
    },
    {
      code: "TCH-AI-20",
      block: "TCH-AI",
      title: "Teacher AI builders integration test suite and safety verification",
      description: `### Goal
Write automated integration tests validating AI wizard parameters, action card generation, safety filters on teacher prompts, and rubric scoring integrity.

### Implementation Details
- Create \`frontend/src/test/integration/teacher-ai-builders.test.tsx\`.
- Test course generation job parameter payload and step progression.
- Test action card apply and undo execution.
- Test question bank search filter queries.
- Test AI pre-grading suggestion payload verification.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/test/integration/teacher-ai-builders.test.tsx\`
- **Conflict Prevention**: Automated test suite.`,
      acceptance_criteria: `- All integration tests execute cleanly in Vitest.
- Action card modifications conform to schema requirements.
- Confirms AI pre-grading recommendations enforce human approval.`,
      estimate: "2h",
      priority: "high",
      tags: ["testing", "teacher", "ai", "vitest"],
      links: [
        { label: "Testing Spec", url: "backend/docs/12-TESTING.md#1-test-pyramid-and-responsibilities" }
      ],
      depends_on: ["TCH-AI-11", "TCH-AI-12", "TCH-AI-17"]
    }
  ]
};
