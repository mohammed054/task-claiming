// Block BE-EDGE: Supabase Edge Functions, AI Streaming & Jobs (~18 tasks)
module.exports = {
  block: {
    code: "BE-EDGE",
    name: "Supabase Edge Functions, AI Streaming & Jobs",
    description: "Deno Edge Functions for AI chat streaming, safety pipelines, text-to-speech audio synthesis, async background job runners, CSV bulk imports, asset uploads, and Realtime event hubs.",
  },
  tasks: [
    {
      code: "BE-EDGE-01",
      block: "BE-EDGE",
      title: "Shared Edge Function library: auth, error handling, rate limiting and CORS",
      description: `### Goal
Create shared Deno runtime utilities in \`supabase/functions/_shared/\` for authorization, error envelopes, rate limiting, and CORS headers.

### Implementation Details
- Create \`_shared/cors.ts\` supporting configured origins and preflight requests.
- Create \`_shared/auth.ts\` validating JWT tokens and extracting user roles from Supabase Auth.
- Create \`_shared/errors.ts\` serializing exceptions into consistent API error JSON envelopes.
- Create \`_shared/ratelimit.ts\` utilizing database or in-memory token bucket counters.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/_shared/**\`
- **Conflict Prevention**: Reusable core module; avoid hardcoding specific function logic here.`,
      acceptance_criteria: `- CORS headers allow frontend development and production origins.
- Validates Supabase JWTs and rejects expired/tampered tokens.
- Standardized error envelopes returned on all failures.`,
      estimate: "1h",
      priority: "critical",
      tags: ["edge-functions", "deno", "security", "cors"],
      links: [
        { label: "Edge Functions Arch", url: "backend/docs/01-ARCHITECTURE.md#3-edge-functions" }
      ],
      depends_on: ["FND-11"]
    },
    {
      code: "BE-EDGE-02",
      block: "BE-EDGE",
      title: "Multi-provider AI adapter layer with fallback and fake mocks",
      description: `### Goal
Implement provider-agnostic AI adapter in \`_shared/ai/adapter.ts\` supporting Gemini, Anthropic/OpenAI, and local deterministic mock testing.

### Implementation Details
- Define standard interface: \`generateCompletion()\`, \`streamCompletion()\`, \`generateStructured<T>()\`.
- Implement Google Gemini adapter (default primary).
- Implement secondary fallback provider.
- Implement \`FakeAIAdapter\` returning deterministic test fixtures when running local CI/CD tests.
- Support temperature, maxTokens, and systemInstruction parameters.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/_shared/ai/adapter.ts\`
- **Conflict Prevention**: Never expose API keys to client; keys reside strictly in Edge secrets.`,
      acceptance_criteria: `- Seamless switching between Gemini and fallback providers.
- Fake adapter enables offline CI unit tests with zero cost.
- Streaming responses emit standard chunk structures.`,
      estimate: "2h",
      priority: "critical",
      tags: ["ai", "edge-functions", "gemini", "adapter"],
      links: [
        { label: "AI Provider Adapter", url: "backend/docs/07-AI-SYSTEM.md#2-provider-adapter-_sharedaiadapterts" }
      ],
      depends_on: ["BE-EDGE-01"]
    },
    {
      code: "BE-EDGE-03",
      block: "BE-EDGE",
      title: "AI safety filter pipeline: PII redaction, prompt injection guard and moderation",
      description: `### Goal
Implement pre-check and post-check safety pipelines in \`_shared/ai/safety.ts\` protecting student conversations from inappropriate content and data leakage.

### Implementation Details
- Pre-check: Redact student PII (phone numbers, emails, physical addresses).
- Prompt injection defense: Detect and block jailbreak patterns ("ignore previous instructions").
- Inappropriate content filter: Check against prohibited educational topics and hate speech.
- Post-check: Validate model output before streaming to client.
- Log flagged safety violations to \`moderation_queue\` table.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/_shared/ai/safety.ts\`
- **Conflict Prevention**: Keep safety rules configurable via platform settings.`,
      acceptance_criteria: `- PII redacted from student messages before reaching LLM.
- Flagged unsafe queries trigger standard safety redirect message.
- Violations logged to administrative moderation records.`,
      estimate: "2h",
      priority: "critical",
      tags: ["ai", "safety", "moderation", "security"],
      links: [
        { label: "AI Safety Pipeline", url: "backend/docs/07-AI-SYSTEM.md#4-safety-pipeline-_sharedaisafetyts" }
      ],
      depends_on: ["BE-EDGE-02"]
    },
    {
      code: "BE-EDGE-04",
      block: "BE-EDGE",
      title: "AI prompt assembly modules for educational personas and characters",
      description: `### Goal
Create centralized prompt templates in \`_shared/ai/prompts.ts\` for Pip (curious owl) and Nova (encouraging robot) personas and curriculum contexts.

### Implementation Details
- Define system prompts for student AI Tutor: Socratic guidance (hints rather than direct answers), CEFR English levels A1–B2 adaptation.
- Define system prompts for Teacher Copilot: pedagogical tone, lesson planning, rubric generation.
- Support dynamic context injection: current lesson topic, student grade level, previous mistakes history.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/_shared/ai/prompts.ts\`
- **Conflict Prevention**: Keep prompts strictly aligned with AI-BEHAVIOR.md spec.`,
      acceptance_criteria: `- AI Tutor encourages students with Socratic questions.
- Adapts vocabulary and complexity according to student grade level.
- Pip and Nova distinct conversational styles reflected.`,
      estimate: "1h",
      priority: "high",
      tags: ["ai", "prompts", "personas"],
      links: [
        { label: "Prompt Assembly", url: "backend/docs/07-AI-SYSTEM.md#3-prompt-assembly-_sharedaipromptsts" },
        { label: "AI Behavior Spec", url: "frontend/docs/03-student/AI-BEHAVIOR.md#1-character-and-voice" }
      ],
      depends_on: ["BE-EDGE-02"]
    },
    {
      code: "BE-EDGE-05",
      block: "BE-EDGE",
      title: "AI Tutor streaming Edge Function with SSE protocol",
      description: `### Goal
Implement \`ai-tutor\` Edge Function streaming real-time token responses to student clients via Server-Sent Events (SSE).

### Implementation Details
- Endpoint \`/functions/v1/ai-tutor\` receiving \`{ conversation_id, message, lesson_context }\`.
- Check student daily AI message limit; return 429 if quota exceeded.
- Pass student query through safety pre-check.
- Assemble prompt and stream tokens via \`ReadableStream\` using SSE event format (\`data: { chunk: "..." }\`).
- On stream completion, write full assistant reply to \`ai_messages\` and log tokens to \`ai_usage_logs\`.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/ai-tutor/**\`
- **Conflict Prevention**: Follow SSE streaming specification in API contract §1.6.`,
      acceptance_criteria: `- Streams text tokens to browser with sub-500ms initial token latency.
- Rate-limiting prevents quota overruns.
- Persists final conversation message and token counts upon stream close.`,
      estimate: "2h",
      priority: "critical",
      tags: ["edge-functions", "ai", "streaming", "sse"],
      links: [
        { label: "Streaming API", url: "backend/docs/05-API-CONTRACT.md#16-streaming-ai-conversations" },
        { label: "AI Tutor Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-20-ai-tutor" }
      ],
      depends_on: ["BE-EDGE-03", "BE-EDGE-04", "BE-CORE-15"]
    },
    {
      code: "BE-EDGE-06",
      block: "BE-EDGE",
      title: "AI writing feedback and grammar check Edge Function",
      description: `### Goal
Create \`ai-writing-feedback\` Edge Function providing structured grammar, spelling, clarity suggestions, and CEFR level estimations for student essays.

### Implementation Details
- Endpoint \`/functions/v1/ai-writing-feedback\` receiving \`{ text, grade_level, prompt }\`.
- Run through safety pipeline.
- Request structured JSON output from LLM:
  - Overall score and CEFR level assessment
  - Strengths and areas for improvement
  - Array of inline corrections: \`{ original, suggestion, explanation, category }\`.
- Store feedback summary in student's \`writing_drafts\` or return directly.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/ai-writing-feedback/**\`
- **Conflict Prevention**: Validate JSON schema using Zod parser before returning.`,
      acceptance_criteria: `- Returns valid structured JSON containing categorized writing feedback.
- Identifies spelling, grammatical, and stylistic improvements.
- Provides constructive, age-appropriate praise.`,
      estimate: "2h",
      priority: "high",
      tags: ["edge-functions", "ai", "writing", "feedback"],
      links: [
        { label: "AI Writing Feedback", url: "backend/docs/07-AI-SYSTEM.md#5-feature-catalog" },
        { label: "Student Writing Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-18-writing" }
      ],
      depends_on: ["BE-EDGE-03"]
    },
    {
      code: "BE-EDGE-07",
      block: "BE-EDGE",
      title: "AI dictionary lookup and English-Arabic translation Edge Function",
      description: `### Goal
Create \`ai-translate\` Edge Function delivering bidirectional English/Arabic translations, phonetic spelling, and contextual example sentences.

### Implementation Details
- Endpoint \`/functions/v1/ai-translate\` receiving \`{ query, source_lang, target_lang, context }\`.
- Return structured definition:
  - Translated word or sentence with Arabic diacritics (harakat)
  - Part of speech (noun, verb, adjective)
  - Phonetic pronunciation / IPA
  - 3 contextual example sentences in both languages.
- Cache common vocabulary definitions to avoid redundant model invocations.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/ai-translate/**\`
- **Conflict Prevention**: Support single words and full paragraph translation.`,
      acceptance_criteria: `- Accurately translates between English and Arabic with accurate diacritics.
- Generates contextual bilingual examples for learning.
- Caches repeated lookups in Redis/PostgreSQL.`,
      estimate: "1h",
      priority: "high",
      tags: ["edge-functions", "ai", "translation", "arabic"],
      links: [
        { label: "Student Translation Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-19-translation" }
      ],
      depends_on: ["BE-EDGE-02"]
    },
    {
      code: "BE-EDGE-08",
      block: "BE-EDGE",
      title: "Text-to-Speech (TTS) audio synthesis and caching Edge Function",
      description: `### Goal
Implement \`tts-synthesize\` Edge Function generating clear British/American English audio pronunciation for vocabulary and listening exercises.

### Implementation Details
- Endpoint \`/functions/v1/tts-synthesize\` receiving \`{ text, accent, speed }\`.
- Check if audio file already exists in \`media-audio\` storage bucket via content hash.
- If cached, return signed public URL immediately.
- If not cached, call Google Cloud TTS API or ElevenLabs, stream audio bytes to Supabase Storage, and return generated URL.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/tts-synthesize/**\`
- **Conflict Prevention**: Content-hash audio keys to prevent redundant generation costs.`,
      acceptance_criteria: `- Audio synthesis returns clean MP3 audio streams.
- Content hash caching prevents re-generating identical words.
- Returns pre-signed URL for direct browser playback.`,
      estimate: "2h",
      priority: "high",
      tags: ["edge-functions", "tts", "audio", "multimedia"],
      links: [
        { label: "TTS Pipeline Spec", url: "backend/docs/08-STORAGE-REALTIME-NOTIFICATIONS.md#4-text-to-speech-tts" }
      ],
      depends_on: ["BE-EDGE-01"]
    },
    {
      code: "BE-EDGE-09",
      block: "BE-EDGE",
      title: "Teacher AI Copilot streaming and action card generator function",
      description: `### Goal
Implement \`ai-copilot\` Edge Function assisting teachers with lesson structuring, quiz generation, and producing structured \`ActionCards\`.

### Implementation Details
- Endpoint \`/functions/v1/ai-copilot\` receiving teacher chat message and workspace state.
- System prompt equips Copilot with teacher tools: course generation, quiz builder, grading assistant.
- Stream conversational reasoning to the teacher.
- If Copilot proposes a database modification (e.g. adding 5 questions to a quiz), emit structured \`action_card\` event in stream.
- Insert card into \`ai_action_cards\` table with status 'pending'.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/ai-copilot/**\`
- **Conflict Prevention**: Only authenticated teachers and admins can invoke this endpoint.`,
      acceptance_criteria: `- Stream advice to teacher with high pedagogical relevance.
- Generates valid Action Cards for one-click insertion into curriculum.
- Enforces strict teacher role authorization check.`,
      estimate: "2h",
      priority: "high",
      tags: ["edge-functions", "ai", "teacher", "copilot"],
      links: [
        { label: "Teacher AI Copilot", url: "backend/docs/07-AI-SYSTEM.md#5-feature-catalog" },
        { label: "Action Cards Spec", url: "backend/docs/07-AI-SYSTEM.md#8-action-cards" }
      ],
      depends_on: ["BE-EDGE-03", "BE-EDGE-04", "BE-OPS-20"]
    },
    {
      code: "BE-EDGE-10",
      block: "BE-EDGE",
      title: "AI assessment auto-grading Edge Function for subjective student answers",
      description: `### Goal
Implement \`ai-grade-submission\` Edge Function evaluating open-ended student responses against teacher-defined rubrics.

### Implementation Details
- Endpoint \`/functions/v1/ai-grade-submission\` receiving \`{ attempt_id, question_id, student_answer, rubric_id }\`.
- Evaluate student answer against each rubric criterion.
- Generate suggested criterion score, explanation, and feedback suggestions.
- Write draft AI suggestions to \`attempt_answers.teacher_comment\` flagged as \`is_ai_draft = true\`.
- Teacher must review and approve; AI grades never auto-finalize without teacher signoff.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/ai-grade-submission/**\`
- **Conflict Prevention**: Ensure human-in-the-loop guarantee; AI cannot publish final scores alone.`,
      acceptance_criteria: `- Evaluates essay against rubric criteria with clear rationales.
- Flags uncertain or borderline responses for teacher attention.
- Requires teacher confirmation before releasing scores to student.`,
      estimate: "2h",
      priority: "high",
      tags: ["edge-functions", "ai", "grading", "rubrics"],
      links: [
        { label: "AI Grading Specs", url: "backend/docs/07-AI-SYSTEM.md#5-feature-catalog" },
        { label: "Teacher Grading Screen", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-21-grading-screen" }
      ],
      depends_on: ["BE-EDGE-03", "BE-CORE-08"]
    },
    {
      code: "BE-EDGE-11",
      block: "BE-EDGE",
      title: "Async job runner core Edge Function for multi-step background tasks",
      description: `### Goal
Implement \`job-runner\` Edge Function managing execution of queued background tasks (curriculum generation, bulk grading, exports).

### Implementation Details
- Endpoint \`/functions/v1/job-runner\` (triggered via webhook, cron, or admin invocation).
- Acquire next available queued job from \`jobs\` table with row lock (\`status = 'running'\`).
- Dispatch job to specific handler based on \`kind\` (e.g. \`ai_course\`, \`csv_import\`, \`year_rollover\`).
- Update progress percentage in \`job_steps\` at each milestone.
- Mark job 'completed' with payload, or 'failed' with error stack trace.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/job-runner/**\`
- **Conflict Prevention**: Handle worker timeouts and dead-letter queue retries.`,
      acceptance_criteria: `- Asynchronously processes queued background jobs.
- Updates live progress percentages in database during execution.
- Captures runtime errors and marks job status failed cleanly.`,
      estimate: "2h",
      priority: "critical",
      tags: ["edge-functions", "jobs", "background-tasks"],
      links: [
        { label: "Job Runner Spec", url: "backend/docs/07-AI-SYSTEM.md#9-job-runner-job-runner-edge-function" }
      ],
      depends_on: ["BE-CORE-16"]
    },
    {
      code: "BE-EDGE-12",
      block: "BE-EDGE",
      title: "AI Course Generation background job handler",
      description: `### Goal
Implement \`ai_course\` handler inside job runner generating complete curriculum: outline, units, lessons, vocabulary, and quizzes from a teacher prompt.

### Implementation Details
- Step 1: Generate course overview and unit outline (progress: 25%).
- Step 2: Expand each unit with lesson descriptions and learning objectives (progress: 50%).
- Step 3: Generate interactive lesson blocks and practice questions (progress: 75%).
- Step 4: Assemble draft course hierarchy in database, assign to teacher author, mark job finished (progress: 100%).

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/job-runner/handlers/ai-course.ts\`
- **Conflict Prevention**: Maintain transactional consistency so failure rolls back partial entities.`,
      acceptance_criteria: `- Creates comprehensive course draft with multiple units and lessons.
- Emits real-time progress updates through job steps.
- Produced course is saved in 'draft' state awaiting teacher review.`,
      estimate: "2h",
      priority: "high",
      tags: ["edge-functions", "ai", "course-wizard"],
      links: [
        { label: "AI Course Job Example", url: "backend/docs/07-AI-SYSTEM.md#example-ai_course" },
        { label: "Teacher Course Wizard", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#tc-30-generate-a-course-ai-wizard" }
      ],
      depends_on: ["BE-EDGE-11"]
    },
    {
      code: "BE-EDGE-13",
      block: "BE-EDGE",
      title: "CSV student and teacher bulk import validation and execution job",
      description: `### Goal
Implement \`csv-import\` background job validating uploaded roster CSVs, resolving schema conflicts, and creating user accounts in bulk.

### Implementation Details
- Parse CSV data using PapaParse/Deno std CSV parser.
- Validate rows against schema: username format, duplicate emails, valid grade level.
- Stage valid records and flag invalid rows with explicit error line numbers.
- For valid rows: generate initial temporary passwords, insert into \`profiles\` and \`auth.users\`, create class enrollments.
- Produce summary report of created accounts and download file.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/job-runner/handlers/csv-import.ts\`
- **Conflict Prevention**: Chunk inserts in batches of 100 to prevent database query timeouts.`,
      acceptance_criteria: `- Validates 500+ student rows within 5 seconds.
- Pinpoints errors to exact row and column numbers.
- Safely generates bulk student accounts with temporary passwords.`,
      estimate: "2h",
      priority: "high",
      tags: ["edge-functions", "csv", "import", "admin"],
      links: [
        { label: "Admin CSV Import Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-05-csv-import-wizard" }
      ],
      depends_on: ["BE-EDGE-11"]
    },
    {
      code: "BE-EDGE-14",
      block: "BE-EDGE",
      title: "Academic year rollover background job with rollback support",
      description: `### Goal
Implement \`year-rollover\` job archiving past academic terms, advancing student grade levels, creating next-year classes, and storing reversal snapshot.

### Implementation Details
- Verify Super Admin authorization.
- Capture pre-rollover snapshot in database to allow 48-hour rollback.
- Archive classes from concluding term.
- Advance student grades (e.g. Grade 5 -> Grade 6).
- Create new academic classes for next school year.
- Log action in \`audit_log\`.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/job-runner/handlers/year-rollover.ts\`
- **Conflict Prevention**: Ensure rollback capability is thoroughly tested before rollout.`,
      acceptance_criteria: `- Successfully shifts student grades and archives past classes.
- Rollback operation cleanly restores students to previous grades if triggered.
- Logs full administrative audit trail.`,
      estimate: "2h",
      priority: "high",
      tags: ["edge-functions", "rollover", "admin"],
      links: [
        { label: "Admin Year Rollover Spec", url: "frontend/docs/05-admin/ADMIN-SPEC.md#ad-06-year-rollover" }
      ],
      depends_on: ["BE-EDGE-11"]
    },
    {
      code: "BE-EDGE-15",
      block: "BE-EDGE",
      title: "Storage upload pre-signed URL generator and SVG/rich text sanitizer",
      description: `### Goal
Create \`storage-upload\` Edge Function issuing presigned URLs for media uploads with MIME validation and SVG sanitizer.

### Implementation Details
- Endpoint \`/functions/v1/storage-upload\` receiving \`{ bucket, filename, content_type, size_bytes }\`.
- Validate file size limits (avatars: 2MB, images: 10MB, audio: 25MB).
- If SVG, parse and strip dangerous script tags, onload handlers, and foreignObject elements.
- Return pre-signed upload URL for direct client-to-storage upload.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/storage-upload/**\`
- **Conflict Prevention**: Never allow arbitrary file uploads without extension and MIME validation.`,
      acceptance_criteria: `- Issues secure pre-signed upload URLs for authorized users.
- Blocks prohibited file types (.exe, .html, unsafe .svg).
- Enforces strict bucket-specific file size limits.`,
      estimate: "1h",
      priority: "high",
      tags: ["edge-functions", "storage", "upload", "security"],
      links: [
        { label: "Storage Buckets Spec", url: "backend/docs/08-STORAGE-REALTIME-NOTIFICATIONS.md#1-buckets" }
      ],
      depends_on: ["BE-EDGE-01"]
    },
    {
      code: "BE-EDGE-16",
      block: "BE-EDGE",
      title: "Global search Edge Function across courses, questions, students and help docs",
      description: `### Goal
Implement \`global-search\` Edge Function executing high-speed, role-filtered searches across curriculum, assessments, users, and platform articles.

### Implementation Details
- Endpoint \`/functions/v1/global-search\` receiving query string and active role.
- Perform full-text search using PostgreSQL \`websearch_to_tsquery\` and trigram matching.
- Filter results based on caller's role (students only see published courses; teachers see their students and class assessments; admins see all).
- Return grouped results: \`{ courses: [...], lessons: [...], assessments: [...], users: [...] }\`.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/global-search/**\`
- **Conflict Prevention**: Enforce strict role-based output filtering.`,
      acceptance_criteria: `- Sub-100ms search results across multi-table corpus.
- Renders results grouped by category with highlighted search snippets.
- Strict data privacy: students cannot search other students' grades.`,
      estimate: "1h",
      priority: "medium",
      tags: ["edge-functions", "search", "full-text-search"],
      links: [
        { label: "Search Spec", url: "backend/docs/05-API-CONTRACT.md#1-conventions" }
      ],
      depends_on: ["BE-EDGE-01"]
    },
    {
      code: "BE-EDGE-17",
      block: "BE-EDGE",
      title: "Realtime WebSocket channel authorization and broadcast dispatcher",
      description: `### Goal
Create Edge Function middleware and webhook handlers coordinating Supabase Realtime channel broadcasts for notifications, grading presence, and platform announcements.

### Implementation Details
- Authorize Realtime channel subscriptions:
  - \`notifications:{user_id}\` (user private)
  - \`class:{class_id}\` (enrolled students and teachers)
  - \`grading:{assessment_id}\` (teacher presence lock)
  - \`platform:announcements\` (broadcast to all)
- Dispatch events on database mutation triggers.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/realtime-dispatcher/**\`
- **Conflict Prevention**: Follow Realtime channel topology in backend docs §8.`,
      acceptance_criteria: `- Prevents unauthorized users from subscribing to other users' channels.
- Broadcasts new notifications and announcements with sub-200ms delivery.
- Presence tracking prevents multiple teachers from editing same grade.`,
      estimate: "1h",
      priority: "high",
      tags: ["edge-functions", "realtime", "websockets"],
      links: [
        { label: "Realtime Channels Spec", url: "backend/docs/08-STORAGE-REALTIME-NOTIFICATIONS.md#6-realtime" }
      ],
      depends_on: ["BE-EDGE-01"]
    },
    {
      code: "BE-EDGE-18",
      block: "BE-EDGE",
      title: "Scheduled cron tasks: daily midnight rollover, auto-submit quizzes and cleanup",
      description: `### Goal
Implement scheduled maintenance cron functions in Edge Functions or pg_cron: midnight streak updates, expiring timed quiz attempts, and temporary files cleanup.

### Implementation Details
- Daily midnight job: evaluate unactive students, consume streak freezes or reset streaks, generate fresh daily quests.
- Every 5-minutes job: scan \`assessment_attempts\` where \`expires_at < app_now()\` and status is still 'in_progress'; invoke \`submit_quiz_attempt\` automatically.
- Weekly job: refresh materialized views and prune expired upload tokens.

### Execution & File Ownership
- **Owns**:
  - \`supabase/functions/cron-maintenance/**\`
- **Conflict Prevention**: Operations must be idempotent and fault-tolerant.`,
      acceptance_criteria: `- Timed out quiz attempts are automatically graded and submitted.
- Streaks accurately transition at midnight in school timezone.
- Cron logs execution status and duration in scheduler_state.`,
      estimate: "1h",
      priority: "high",
      tags: ["edge-functions", "cron", "maintenance", "streaks"],
      links: [
        { label: "Operations & Cron", url: "backend/docs/11-OPERATIONS-CICD.md#3-cron-schedules" },
        { label: "Auto-submit Quizzes", url: "backend/docs/06-BUSINESS-LOGIC.md#32-autosave-and-timing" }
      ],
      depends_on: ["BE-OPS-07", "BE-OPS-11"]
    }
  ]
};
