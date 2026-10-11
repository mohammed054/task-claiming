// Block FND: Foundation, Tooling, Tokens & Infrastructure (~16 tasks)
module.exports = {
  block: {
    code: "FND",
    name: "Foundation, Tooling, Tokens & Infrastructure",
    description: "Repository scaffolding, pnpm configuration, strict TypeScript/ESLint/Prettier, Tailwind theme and tokens, Supabase client, Auth and Query providers, routing core, and CI/CD pipelines.",
  },
  tasks: [
    {
      code: "FND-01",
      block: "FND",
      title: "Scaffold cleanup, pnpm migration and directory layout",
      description: `### Goal
Migrate repository tooling to pnpm, clean up outdated scaffold files, and establish the Page Alone directory layout in frontend according to ARCHITECTURE §1 and §3.

### Implementation Details
- Remove obsolete scaffold mock files and unused starter assets.
- Configure pnpm workspace/package manifests and enforce engine constraints (\`node >= 20\`, \`pnpm >= 9\`).
- Establish standard folder structure:
  - \`frontend/src/app/\` (core app entry, router, providers)
  - \`frontend/src/pages/\` (isolated page bundles)
  - \`frontend/src/shared/\` (components, api, hooks, utils, types, styles)
  - \`frontend/src/assets/\` (fonts, audio sprites, images)

### Execution & File Ownership
- **Owns**:
  - \`frontend/package.json\`
  - \`frontend/pnpm-lock.yaml\`
  - \`frontend/src/main.tsx\`
  - \`frontend/src/app/**\`
  - \`frontend/src/shared/**\`
- **Conflict Prevention**: Do not modify files in \`frontend/docs\` or \`backend/docs\`. Coordinate with FND-02 for compiler configurations.`,
      acceptance_criteria: `- Clean pnpm install passes without warnings or duplicate react instances.
- Directory structure strictly mirrors ARCHITECTURE §3.
- Page Alone convention documented in README or frontend/README.
- Zero leftover boilerplate landing pages or placeholder files in src.`,
      estimate: "1h",
      priority: "critical",
      tags: ["setup", "tooling", "pnpm"],
      links: [
        { label: "Architecture Layout", url: "frontend/docs/ARCHITECTURE.md#1-repository-layout" },
        { label: "Folder Structure", url: "frontend/docs/ARCHITECTURE.md#3-folder-structure-page-alone" }
      ],
      depends_on: []
    },
    {
      code: "FND-02",
      block: "FND",
      title: "Strict TypeScript, ESLint, Prettier and path aliases",
      description: `### Goal
Set up rigorous TypeScript compiler settings, ESLint flat config with React and accessibility plugins, Prettier, and path aliases (\`@/*\` pointing to \`frontend/src/*\`).

### Implementation Details
- Update \`tsconfig.json\` and \`tsconfig.node.json\` with strict null checks, no implicit any, verbatimModuleSyntax, and path aliases (\`@/*\`).
- Configure ESLint with \`typescript-eslint\`, \`eslint-plugin-react-hooks\`, and \`eslint-plugin-jsx-a11y\`.
- Configure \`prettier.config.js\` with consistent indentation, single quotes/double quotes rules, and tailwindcss sorting plugin.
- Add npm scripts: \`typecheck\`, \`lint\`, \`format:check\`.

### Execution & File Ownership
- **Owns**:
  - \`frontend/tsconfig.json\`
  - \`frontend/tsconfig.node.json\`
  - \`frontend/.eslintrc.cjs\` (or \`eslint.config.js\`)
  - \`frontend/.prettierrc\`
  - \`frontend/vite.config.ts\` (alias resolution)
- **Conflict Prevention**: Only modify configuration files. Keep configs modular.`,
      acceptance_criteria: `- \`pnpm typecheck\` runs without errors across the codebase.
- \`pnpm lint\` executes cleanly and flags missing dependencies or a11y violations.
- Path alias \`@/...\` imports resolve correctly in IDE and Vite builds.`,
      estimate: "1h",
      priority: "high",
      tags: ["tooling", "typescript", "linting"],
      links: [
        { label: "Tech Stack", url: "frontend/docs/ARCHITECTURE.md#2-tech-stack-final-for-v1" }
      ],
      depends_on: ["FND-01"]
    },
    {
      code: "FND-03",
      block: "FND",
      title: "Testing framework setup with Vitest and React Testing Library",
      description: `### Goal
Configure the unit and component testing environment using Vitest, jsdom, and React Testing Library.

### Implementation Details
- Install and configure \`vitest\`, \`@testing-library/react\`, \`@testing-library/user-event\`, and \`@testing-library/jest-dom\`.
- Configure \`vitest.config.ts\` or integrate with \`vite.config.ts\` test settings with jsdom environment and setup file.
- Create \`frontend/src/test/setup.ts\` with matchers, cleanup routines, and mock implementations for \`window.matchMedia\`, \`ResizeObserver\`, and \`IntersectionObserver\`.
- Add smoke test \`frontend/src/test/smoke.test.tsx\` validating React render and DOM assertion.

### Execution & File Ownership
- **Owns**:
  - \`frontend/vitest.config.ts\`
  - \`frontend/src/test/**\`
- **Conflict Prevention**: Keep setup scripts isolated in test folder.`,
      acceptance_criteria: `- \`pnpm test\` executes synchronously and runs smoke test.
- RTL DOM matchers (\`toBeInTheDocument\`, etc.) operate with typed assertions.
- Browser API mocks prevent headless environment crashes.`,
      estimate: "1h",
      priority: "high",
      tags: ["testing", "vitest"],
      links: [
        { label: "Testing Architecture", url: "frontend/docs/ARCHITECTURE.md#9-testing-and-quality" }
      ],
      depends_on: ["FND-02"]
    },
    {
      code: "FND-04",
      block: "FND",
      title: "Playwright E2E framework initialization",
      description: `### Goal
Initialize Playwright E2E testing framework with multi-browser configurations and local dev server orchestration.

### Implementation Details
- Configure \`playwright.config.ts\` targeting chromium, webkit, and mobile viewports (Mobile Safari 375x667).
- Set up local webServer command in Playwright config (\`pnpm preview\` or \`pnpm dev\`).
- Create basic initial smoke test in \`e2e/smoke.spec.ts\` validating index page loading.
- Add npm script \`test:e2e\`.

### Execution & File Ownership
- **Owns**:
  - \`frontend/playwright.config.ts\`
  - \`frontend/e2e/**\`
- **Conflict Prevention**: Keep e2e tests out of src directory.`,
      acceptance_criteria: `- Playwright initializes without error on local headless chromium.
- Mobile viewport profile tests run at 375px width.
- Trace, video, and screenshot artifact recording configured for CI failures.`,
      estimate: "1h",
      priority: "medium",
      tags: ["testing", "playwright", "e2e"],
      links: [
        { label: "Testing Spec", url: "frontend/docs/ARCHITECTURE.md#9-testing-and-quality" }
      ],
      depends_on: ["FND-02"]
    },
    {
      code: "FND-05",
      block: "FND",
      title: "CI/CD GitHub Actions workflows for frontend and verification",
      description: `### Goal
Create GitHub Actions workflows to automate CI checks: typecheck, linting, unit tests, bundle budget check, and PR previews.

### Implementation Details
- Create \`.github/workflows/ci.yml\` executing on PR and push to main.
- Setup pnpm cache, node 20, install dependencies, run \`typecheck\`, \`lint\`, and \`test\`.
- Add bundle size check comparing outputs against initial budget threshold.
- Create preview build step verifying static artifact generation.

### Execution & File Ownership
- **Owns**:
  - \`.github/workflows/ci.yml\`
- **Conflict Prevention**: Coordinate with existing deployment workflows.`,
      acceptance_criteria: `- CI workflow passes cleanly in GitHub Actions environment.
- Any lint or type error fails PR check immediately.
- Bundle budget validation triggers warnings or failures if thresholds exceed limits.`,
      estimate: "1h",
      priority: "high",
      tags: ["devops", "ci-cd", "github-actions"],
      links: [
        { label: "CI Operations", url: "backend/docs/11-OPERATIONS-CICD.md#1-pipeline-topology" }
      ],
      depends_on: ["FND-03", "FND-04"]
    },
    {
      code: "FND-06",
      block: "FND",
      title: "Environment variables, validation schema and runtime config",
      description: `### Goal
Establish validated environment variable configuration using Zod and Vite env typing.

### Implementation Details
- Create \`frontend/src/shared/config/env.ts\` parsing \`import.meta.env\`.
- Enforce required variables: \`VITE_SUPABASE_URL\`, \`VITE_SUPABASE_ANON_KEY\`, \`VITE_APP_ENV\` (local, staging, production).
- Add optional flags: \`VITE_ENABLE_MOCKS\`, \`VITE_APP_VERSION\`.
- Generate \`.env.example\` with documented dummy development keys.
- Update \`frontend/src/vite-env.d.ts\` with full \`ImportMetaEnv\` typing.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/config/env.ts\`
  - \`frontend/.env.example\`
  - \`frontend/src/vite-env.d.ts\`
- **Conflict Prevention**: Never commit actual secrets into \`.env.example\` or code.`,
      acceptance_criteria: `- Invalid or missing Supabase env variables throw clear startup validation error.
- Full IntelliSense available on \`env\` object across frontend codebase.
- \`.env.example\` committed with placeholder keys.`,
      estimate: "1h",
      priority: "critical",
      tags: ["config", "zod", "env"],
      links: [
        { label: "Environment & Config", url: "frontend/docs/ARCHITECTURE.md#10-environment-and-configuration" }
      ],
      depends_on: ["FND-02"]
    },
    {
      code: "FND-07",
      block: "FND",
      title: "Design tokens and CSS custom properties generation",
      description: `### Goal
Generate the comprehensive CSS tokens file representing all colors, worlds, neutrals, strokes, shadows, and radii specified in GLOBAL-STYLES-SPEC.

### Implementation Details
- Create \`frontend/src/shared/styles/tokens.css\`.
- Implement CSS variables for:
  - 6 Worlds: Coral, Amber, Mint, Sky, Violet, Rose (with 50, 100, 200, 300, 400, 500, 600, 700 shades).
  - Neutrals: Surface, Surface Elevated, Background, Stroke (solid 2px outline), Muted.
  - Arcade Shadows: \`--shadow-sm\` (2px 2px #000), \`--shadow-md\` (4px 4px #000), \`--shadow-lg\` (8px 8px #000).
  - Radii: \`--radius-sm\` (6px), \`--radius-md\` (12px), \`--radius-lg\` (20px), \`--radius-pill\` (9999px).
  - Font families: \`--font-heading\` (Fredoka), \`--font-body\` (Figtree), \`--font-accent\` (Caveat), \`--font-arabic\` (Amiri).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/styles/tokens.css\`
- **Conflict Prevention**: Follow exact hex values and token names in GLOBAL-STYLES §3 and §6.`,
      acceptance_criteria: `- CSS variables match GLOBAL-STYLES-SPEC §3, §6 without omission.
- Solid offset box shadows render crisp black outlines without blur.
- CSS file imports cleanly into main stylesheet.`,
      estimate: "2h",
      priority: "critical",
      tags: ["design-system", "tokens", "css"],
      links: [
        { label: "Color System", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#3-color-system" },
        { label: "Shape, Outline & Shadow", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#6-shape-outline-shadow-and-spacing" }
      ],
      depends_on: ["FND-01"]
    },
    {
      code: "FND-08",
      block: "FND",
      title: "Tailwind CSS configuration with design system mappings",
      description: `### Goal
Configure \`tailwind.config.ts\` mapping Tailwind utilities directly to the design tokens and custom properties created in FND-07.

### Implementation Details
- Map custom colors (\`world-coral\`, \`world-amber\`, etc., \`surface\`, \`stroke\`).
- Map border widths (\`border-2\` as default stroke).
- Map retro drop shadows (\`shadow-retro-sm\`, \`shadow-retro-md\`, \`shadow-retro-lg\`).
- Configure typography font families: \`font-heading\`, \`font-body\`, \`font-accent\`, \`font-arabic\`.
- Configure custom animation keyframes for sticker wiggles, celebrations, and pulse.

### Execution & File Ownership
- **Owns**:
  - \`frontend/tailwind.config.ts\`
- **Conflict Prevention**: Keep tailwind extensions structured and strictly aligned with tokens.css.`,
      acceptance_criteria: `- Tailwind utility classes (\`bg-world-coral-400\`, \`shadow-retro-md\`, \`font-heading\`) compile properly.
- No arbitrary values required for primary brand elements.
- Strict 2px border defaults enforced.`,
      estimate: "1h",
      priority: "critical",
      tags: ["tailwind", "tokens", "design-system"],
      links: [
        { label: "Styling Spec", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#3-color-system" },
        { label: "Frontend Styling", url: "frontend/docs/ARCHITECTURE.md#7-styling" }
      ],
      depends_on: ["FND-07"]
    },
    {
      code: "FND-09",
      block: "FND",
      title: "Typography, Google fonts loader, Arabic fonts and font fallback stack",
      description: `### Goal
Set up Google Fonts and Arabic font loaders with fallback font stack to prevent layout shift (CLS).

### Implementation Details
- Configure font preloading in \`frontend/index.html\` for:
  - Fredoka (headings, weights 500, 600, 700)
  - Figtree (body, weights 400, 500, 600, 700)
  - Caveat (handwriting/stickers)
  - Amiri / Scheherazade New (Arabic script)
- Configure font fallback stacks with size-adjust and ascent-override in CSS to eliminate FOUT/CLS.
- Create typography utility classes in \`frontend/src/shared/styles/typography.css\`.

### Execution & File Ownership
- **Owns**:
  - \`frontend/index.html\` (font preload links)
  - \`frontend/src/shared/styles/typography.css\`
- **Conflict Prevention**: Test with Arabic and English character sets.`,
      acceptance_criteria: `- Fonts load without layout shift; zero cumulative layout shift (CLS < 0.05).
- Arabic texts automatically render with Amiri/Scheherazade font family.
- Heading and body styles render accurately at all breakpoints.`,
      estimate: "1h",
      priority: "high",
      tags: ["typography", "fonts", "i18n"],
      links: [
        { label: "Typography Spec", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#5-typography" }
      ],
      depends_on: ["FND-08"]
    },
    {
      code: "FND-10",
      block: "FND",
      title: "Global base CSS, focus rings and accessibility styles",
      description: `### Goal
Create global base stylesheet establishing high-contrast accessibility focus rings, selection styling, and box-sizing resets according to GLOBAL-STYLES-SPEC.

### Implementation Details
- Create \`frontend/src/shared/styles/base.css\`.
- Enforce universal 2px high-visibility focus ring on \`:focus-visible\` with 2px offset.
- Set custom text selection colors (\`selection:bg-primary-300 selection:text-black\`).
- Apply standard scrollbar styling matching arcade theme.
- Ensure \`prefers-reduced-motion\` global killswitch disables transition/animation durations.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/styles/base.css\`
  - \`frontend/src/app/globals.css\` (imports)
- **Conflict Prevention**: Maintain unified stylesheet imports.`,
      acceptance_criteria: `- Keyboard navigation displays clear 2px outline focus rings on all interactive elements.
- Text selection uses brand highlight styles.
- \`prefers-reduced-motion\` instantly pauses all CSS keyframe animations.`,
      estimate: "1h",
      priority: "high",
      tags: ["a11y", "css", "focus-ring"],
      links: [
        { label: "Component Visual Law", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["FND-08"]
    },
    {
      code: "FND-11",
      block: "FND",
      title: "Supabase client initialization and typed database interface",
      description: `### Goal
Initialize the singleton Supabase browser client with strict TypeScript typing generated from the database schema.

### Implementation Details
- Create \`frontend/src/shared/api/supabase.ts\` initializing \`createClient<Database>\`.
- Configure custom storage handler, auth session persistence in \`localStorage\`, and auto-refresh token handling.
- Create placeholder/initial \`frontend/src/shared/types/database.types.ts\`.
- Add script \`pnpm db:types\` in \`frontend/package.json\` to run Supabase typegen.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/api/supabase.ts\`
  - \`frontend/src/shared/types/database.types.ts\`
- **Conflict Prevention**: Do not hardcode Supabase keys; import strictly from \`src/shared/config/env.ts\`.`,
      acceptance_criteria: `- Supabase client initializes cleanly with environment variables.
- TypeScript queries against Supabase tables possess full autocomplete and type safety.
- Auth session recovery handles expired tokens without infinite reload.`,
      estimate: "1h",
      priority: "critical",
      tags: ["supabase", "api", "database"],
      links: [
        { label: "Data Layer", url: "frontend/docs/ARCHITECTURE.md#4-data-layer" },
        { label: "Auth & Access", url: "backend/docs/04-AUTH-AND-ACCESS.md#1-session-and-jwt" }
      ],
      depends_on: ["FND-06"]
    },
    {
      code: "FND-12",
      block: "FND",
      title: "Authentication context provider and session state management",
      description: `### Goal
Implement \`AuthProvider\` with session lifecycle management, user profile resolution, role parsing, and lockout detection.

### Implementation Details
- Create \`frontend/src/app/providers/AuthProvider.tsx\` and \`useAuth()\` hook.
- Listen to \`supabase.auth.onAuthStateChange\`.
- Fetch active profile (\`profiles\` table) on login, caching user role (\`student\`, \`teacher\`, \`admin\`, \`super_admin\`), status (\`active\`, \`locked\`, \`archived\`), and must_change_password flag.
- Provide sign-in, sign-out, and refresh methods.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/app/providers/AuthProvider.tsx\`
  - \`frontend/src/shared/hooks/useAuth.ts\`
- **Conflict Prevention**: Keep auth state independent of UI components.`,
      acceptance_criteria: `- User session state (profile, role, permissions) available across React tree via \`useAuth()\`.
- Login, logout, and token expiration automatically update auth state.
- Locked or password-reset-required states correctly flagged.`,
      estimate: "2h",
      priority: "critical",
      tags: ["auth", "security", "provider"],
      links: [
        { label: "Auth Routing & Guards", url: "frontend/docs/ARCHITECTURE.md#5-auth-routing-and-guards" },
        { label: "Session & Roles", url: "backend/docs/04-AUTH-AND-ACCESS.md#2-roles-and-permissions" }
      ],
      depends_on: ["FND-11"]
    },
    {
      code: "FND-13",
      block: "FND",
      title: "TanStack Query provider, global cache defaults and error normalization",
      description: `### Goal
Configure \`QueryClientProvider\` with resilient network retry logic, stale times, and global API error normalization.

### Implementation Details
- Create \`frontend/src/app/providers/QueryProvider.tsx\`.
- Configure \`QueryClient\` default options:
  - \`staleTime: 1000 * 60 * 2\` (2 minutes for standard data)
  - \`gcTime: 1000 * 60 * 10\` (10 minutes garbage collection)
  - Retries: 2 for network failures, 0 for 401/403/404 errors.
- Create \`normalizeApiError()\` utility parsing Supabase PostgREST errors into typed AppError objects (\`code\`, \`message\`, \`details\`).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/app/providers/QueryProvider.tsx\`
  - \`frontend/src/shared/api/error-normalizer.ts\`
- **Conflict Prevention**: Standardize error types used by all subsequent API tasks.`,
      acceptance_criteria: `- Query client properly wraps application root.
- PostgREST errors are transformed into clean user-friendly error objects.
- Unauthorized calls trigger auth refresh rather than silent crashes.`,
      estimate: "1h",
      priority: "high",
      tags: ["tanstack-query", "cache", "api"],
      links: [
        { label: "Data Layer", url: "frontend/docs/ARCHITECTURE.md#4-data-layer" },
        { label: "API Envelope & Errors", url: "backend/docs/05-API-CONTRACT.md#11-envelope-and-errors" }
      ],
      depends_on: ["FND-02"]
    },
    {
      code: "FND-14",
      block: "FND",
      title: "React Router setup, route definitions and authentication guards",
      description: `### Goal
Set up React Router v6 data router with route protection, role-based guard middleware, and redirection logic.

### Implementation Details
- Create \`frontend/src/app/router.tsx\` using \`createBrowserRouter\`.
- Implement \`<ProtectedRoute />\` guard checking authentication, role permissions, and user status.
- Implement role redirects: students to \`/student\`, teachers to \`/teacher\`, admins to \`/admin\`.
- Handle special states: unauthenticated users redirected to \`/login\`, \`must_change_password\` redirected to \`/set-new-password\`, \`locked\` users redirected to \`/account-not-active\`.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/app/router.tsx\`
  - \`frontend/src/app/guards/ProtectedRoute.tsx\`
- **Conflict Prevention**: Follow route table specifications in SHARED-SPEC §6.`,
      acceptance_criteria: `- Protected routes prevent unauthenticated or unauthorized role access.
- Role-based redirect sends users to correct portal upon login.
- Deep links preserved via \`?redirect=\` search parameter.`,
      estimate: "2h",
      priority: "critical",
      tags: ["routing", "react-router", "guards"],
      links: [
        { label: "Routing & Guards", url: "frontend/docs/ARCHITECTURE.md#5-auth-routing-and-guards" },
        { label: "Public Sitemap", url: "frontend/docs/02-public/SHARED-SPEC.md#3-sitemap" }
      ],
      depends_on: ["FND-12"]
    },
    {
      code: "FND-15",
      block: "FND",
      title: "Toast and modal dialog providers with retro arcade styling",
      description: `### Goal
Create global Toast notification and modal Dialog providers styled with retro arcade borders, drop shadows, and world themes.

### Implementation Details
- Create \`frontend/src/app/providers/ToastProvider.tsx\` and \`useToast()\` hook.
- Support notification variants: \`success\`, \`error\`, \`warning\`, \`info\`, \`reward\` (with coins/XP icon).
- Style toasts with solid 2px outline, retro black shadow (\`4px 4px #000\`), and entry spring animation.
- Implement accessible Radix UI dialog primitive container for modal management.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/app/providers/ToastProvider.tsx\`
  - \`frontend/src/shared/components/feedback/Toast.tsx\`
- **Conflict Prevention**: Ensure toasts dismiss cleanly on timeout or swipe.`,
      acceptance_criteria: `- \`useToast().show({ title, type })\` renders accessible toast notification.
- Toasts stack neatly at top-right or bottom-center on mobile.
- Toasts dismiss on Escape key or close button click.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui", "toast", "feedback"],
      links: [
        { label: "Component Styling Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["FND-10"]
    },
    {
      code: "FND-16",
      block: "FND",
      title: "Platform settings and feature flags hook with backend sync",
      description: `### Goal
Implement \`useFeatures()\` and \`usePlatformSettings()\` hook reading active platform configuration from Supabase \`platform_settings\`.

### Implementation Details
- Create \`frontend/src/shared/hooks/usePlatformSettings.ts\`.
- Fetch global settings: maintenance mode, registration enabled, AI features enabled, sound enabled by default.
- Provide helper methods: \`isFeatureEnabled(featureKey: string): boolean\`.
- Gracefully fallback to safe defaults if network request fails or user is offline.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/hooks/usePlatformSettings.ts\`
- **Conflict Prevention**: Read-only hook; do not implement mutation here (mutations are in ADM).`,
      acceptance_criteria: `- Platform settings load on application mount with TanStack Query.
- Disabled features can be conditionally queried across views.
- Offline state serves cached or fallback default settings.`,
      estimate: "1h",
      priority: "medium",
      tags: ["settings", "features", "hooks"],
      links: [
        { label: "Platform Settings", url: "backend/docs/03-DATA-MODEL-ENGAGEMENT-AI-ADMIN.md#2-settings-and-configuration" }
      ],
      depends_on: ["FND-13"]
    }
  ]
};
