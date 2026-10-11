// Block PUB: Shared Public Pages & Authentication (~14 tasks)
module.exports = {
  block: {
    code: "PUB",
    name: "Shared Public Pages & Authentication",
    description: "Public landing page with arcade animations, sign-in flows, password reset, inactive account handling, school contact, FAQ, terms, and system status/error pages (SH-01 to SH-14).",
  },
  tasks: [
    {
      code: "PUB-01",
      block: "PUB",
      title: "Public landing page: Hero section, interactive stickers and arcade CTA (SH-01)",
      description: `### Goal
Implement public landing page hero section with Fredoka typography, animated stickers, world preview switcher, and CTA buttons linking to Sign In and Explore.

### Implementation Details
- Create \`frontend/src/pages/public/LandingPage/HeroSection.tsx\`.
- Animated headline with Caveat accent handwriting badge ("Welcome to Al Hikmah").
- Interactive floating sticker elements with spring hover tilt.
- Primary CTA button "Sign In to Learn" with tactile arcade press physics.

### Git & Review Guidelines
- **Branch**: \`task/PUB-01-landing-hero\`
- **Owns**:
  - \`frontend/src/pages/public/LandingPage/HeroSection.tsx\`
- **Conflict Prevention**: Follow SH-01 specification in SHARED-SPEC.`,
      acceptance_criteria: `- Hero renders cleanly across mobile (375px) and desktop viewports.
- Stickers have subtle floating animation conforming to performance budget.
- Primary CTA navigates to /login.`,
      estimate: "2h",
      priority: "high",
      tags: ["public", "landing", "hero"],
      links: [
        { label: "Landing Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-01-landing-page" }
      ],
      depends_on: ["UIK-22", "UIK-06"]
    },
    {
      code: "PUB-02",
      block: "PUB",
      title: "Public landing page: Features, gamification showcase and curriculum overview",
      description: `### Goal
Build feature showcase sections for the landing page: gamification breakdown (XP, Quests, Arcade Minigames), AI Tutor introduction, and English curriculum structure.

### Implementation Details
- Create \`frontend/src/pages/public/LandingPage/FeaturesSection.tsx\` and \`CurriculumSection.tsx\`.
- Feature cards with 2px borders, retro offset shadows, and world color themes.
- Interactive tab switcher previewing student, teacher, and parent perspectives.

### Git & Review Guidelines
- **Branch**: \`task/PUB-02-landing-features\`
- **Owns**:
  - \`frontend/src/pages/public/LandingPage/FeaturesSection.tsx\`
  - \`frontend/src/pages/public/LandingPage/CurriculumSection.tsx\`
- **Conflict Prevention**: Coordinate with HeroSection in assemble task PUB-03.`,
      acceptance_criteria: `- Highlights all 6 gamified pillars and AI learning companion.
- Features display responsive card grid adapting from 1 col on mobile to 3 cols on desktop.
- World colors mapped consistently.`,
      estimate: "2h",
      priority: "medium",
      tags: ["public", "landing", "features"],
      links: [
        { label: "Landing Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-01-landing-page" }
      ],
      depends_on: ["UIK-07", "UIK-20"]
    },
    {
      code: "PUB-03",
      block: "PUB",
      title: "Public landing page assembly and scroll storytelling integration",
      description: `### Goal
Assemble all landing page sections into \`LandingPage.tsx\` with Lenis smooth scrolling, PublicHeader, and PublicFooter integration.

### Implementation Details
- Create \`frontend/src/pages/public/LandingPage/index.tsx\`.
- Assemble Hero, Features, Curriculum, Testimonials, and CTA banner sections.
- Integrate Lenis smooth scrolling container.
- Connect SEO meta tags (title, description, OpenGraph images).

### Git & Review Guidelines
- **Branch**: \`task/PUB-03-landing-assembly\`
- **Owns**:
  - \`frontend/src/pages/public/LandingPage/index.tsx\`
- **Conflict Prevention**: Isolated in LandingPage folder.`,
      acceptance_criteria: `- Page loads without layout shift (CLS < 0.05).
- Lenis smooth scroll operates at 60fps on desktop.
- Header and footer attach seamlessly.`,
      estimate: "1h",
      priority: "high",
      tags: ["public", "landing", "assembly"],
      links: [
        { label: "Landing Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-01-landing-page" }
      ],
      depends_on: ["PUB-01", "PUB-02"]
    },
    {
      code: "PUB-04",
      block: "PUB",
      title: "Sign-in page: form validation, authentication handling and role redirect (SH-02)",
      description: `### Goal
Implement \`/login\` sign-in page with username/password authentication, show/hide password toggle, remember me checkbox, and error handling.

### Implementation Details
- Create \`frontend/src/pages/public/LoginPage/index.tsx\`.
- Form validation with Zod and React Hook Form (valid username, minimum 6 characters password).
- Invoke \`supabase.auth.signInWithPassword\`.
- Check user profile upon success; route student to \`/student\`, teacher to \`/teacher\`, admin to \`/admin\`.
- Handle lockout: redirect to \`/account-not-active\` if account status is 'locked'.

### Git & Review Guidelines
- **Branch**: \`task/PUB-04-login-page\`
- **Owns**:
  - \`frontend/src/pages/public/LoginPage/**\`
- **Conflict Prevention**: Follow SH-02 specification in SHARED-SPEC.`,
      acceptance_criteria: `- Valid credentials authenticate and trigger role-specific dashboard redirect.
- Invalid credentials display friendly, non-revealing error message.
- Keyboard submission via Enter key works reliably.`,
      estimate: "2h",
      priority: "critical",
      tags: ["auth", "public", "login"],
      links: [
        { label: "Sign In Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-02-sign-in" },
        { label: "Auth & Access", url: "backend/docs/04-AUTH-AND-ACCESS.md#1-session-and-jwt" }
      ],
      depends_on: ["FND-12", "UIK-09", "UIK-04"]
    },
    {
      code: "PUB-05",
      block: "PUB",
      title: "Forgot password request page and school administrator instructions (SH-03)",
      description: `### Goal
Implement \`/forgot-password\` page allowing students and staff to submit password reset requests or view school IT administrator contact steps.

### Implementation Details
- Create \`frontend/src/pages/public/ForgotPasswordPage/index.tsx\`.
- Input field for username or email.
- Submitting request creates entry in \`password_reset_requests\` table or triggers reset email.
- Display school IT contact card with office hours and physical classroom support instructions.

### Git & Review Guidelines
- **Branch**: \`task/PUB-05-forgot-password\`
- **Owns**:
  - \`frontend/src/pages/public/ForgotPasswordPage/**\`
- **Conflict Prevention**: Follow SH-03 in SHARED-SPEC.`,
      acceptance_criteria: `- Submits reset request and displays clear confirmation banner.
- Provides direct school helpdesk email and office hours.
- Back to sign-in link returns to /login.`,
      estimate: "1h",
      priority: "high",
      tags: ["auth", "public", "forgot-password"],
      links: [
        { label: "Forgot Password Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-03-forgot-password-request-form-and-contact-info" }
      ],
      depends_on: ["PUB-04"]
    },
    {
      code: "PUB-06",
      block: "PUB",
      title: "Set new password page with password strength meter (SH-04)",
      description: `### Goal
Implement \`/set-new-password\` page for first-time login force-reset or recovery token confirmation with visual strength meter.

### Implementation Details
- Create \`frontend/src/pages/public/SetNewPasswordPage/index.tsx\`.
- Enforce password policy: min 8 characters, at least 1 number, at least 1 symbol.
- Dynamic password strength meter with animated color bar (Weak, Good, Strong).
- Confirm password matching check.
- Update password via Supabase Auth and clear \`must_change_password\` profile flag.

### Git & Review Guidelines
- **Branch**: \`task/PUB-06-set-new-password\`
- **Owns**:
  - \`frontend/src/pages/public/SetNewPasswordPage/**\`
- **Conflict Prevention**: Follow SH-04 in SHARED-SPEC.`,
      acceptance_criteria: `- Strength meter updates dynamically on keystrokes.
- Blocks submission if password requirements are not met.
- Successfully updates password and navigates to role dashboard.`,
      estimate: "1h",
      priority: "high",
      tags: ["auth", "public", "password-reset"],
      links: [
        { label: "Set New Password Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-04-set-a-new-password" }
      ],
      depends_on: ["PUB-04"]
    },
    {
      code: "PUB-07",
      block: "PUB",
      title: "Account not active and suspension notice page (SH-05)",
      description: `### Goal
Implement \`/account-not-active\` page explaining account status (pending activation, locked, or archived) with next steps.

### Implementation Details
- Create \`frontend/src/pages/public/AccountNotActivePage/index.tsx\`.
- Read active user session status or query param reason.
- Display reassuring explanation card with school IT contact details.
- Provide Sign Out button to allow logging in with another account.

### Git & Review Guidelines
- **Branch**: \`task/PUB-07-account-not-active\`
- **Owns**:
  - \`frontend/src/pages/public/AccountNotActivePage/**\`
- **Conflict Prevention**: Follow SH-05 in SHARED-SPEC.`,
      acceptance_criteria: `- Displays clear reason for inactive account status without revealing private system data.
- Sign Out button clears local session completely.
- Displays school support contact options.`,
      estimate: "1h",
      priority: "medium",
      tags: ["auth", "public", "account-status"],
      links: [
        { label: "Account Not Active Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-05-account-not-active" }
      ],
      depends_on: ["PUB-04"]
    },
    {
      code: "PUB-08",
      block: "PUB",
      title: "Help and contact the school page with inquiry form (SH-06)",
      description: `### Goal
Implement \`/help\` page with school department directory, physical campus location, office hours, and inquiry message form.

### Implementation Details
- Create \`frontend/src/pages/public/HelpContactPage/index.tsx\`.
- Campus map card and English Department contact card.
- Accessible contact form (Name, Student ID / Grade, Category, Message).
- Form submission feedback toast and reset.

### Git & Review Guidelines
- **Branch**: \`task/PUB-08-help-contact\`
- **Owns**:
  - \`frontend/src/pages/public/HelpContactPage/**\`
- **Conflict Prevention**: Follow SH-06 in SHARED-SPEC.`,
      acceptance_criteria: `- Contact form validates inputs with helpful error hints.
- Displays official school contact channels and operating hours.
- Confirms inquiry submission with success feedback.`,
      estimate: "1h",
      priority: "medium",
      tags: ["public", "help", "contact"],
      links: [
        { label: "Help & Contact Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-06-help-and-contact-the-school" }
      ],
      depends_on: ["UIK-22", "UIK-09"]
    },
    {
      code: "PUB-09",
      block: "PUB",
      title: "Frequently Asked Questions (FAQ) page with searchable accordion (SH-07)",
      description: `### Goal
Build \`/faq\` page featuring categorized questions (Students, Parents, Teachers, Technical) with instant search filter and expandable accordions.

### Implementation Details
- Create \`frontend/src/pages/public/FaqPage/index.tsx\`.
- Real-time search input filtering questions by keywords.
- Categorized accordion panels utilizing UIK-21 primitive.
- Helpful "Did this answer your question?" feedback buttons.

### Git & Review Guidelines
- **Branch**: \`task/PUB-09-faq-page\`
- **Owns**:
  - \`frontend/src/pages/public/FaqPage/**\`
- **Conflict Prevention**: Follow SH-07 in SHARED-SPEC.`,
      acceptance_criteria: `- Instant search filters matching questions across all categories.
- Accordion panels expand smoothly and support full keyboard navigation.
- Category pills filter visible questions.`,
      estimate: "1h",
      priority: "medium",
      tags: ["public", "faq", "search"],
      links: [
        { label: "FAQ Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-07-faq" }
      ],
      depends_on: ["UIK-21", "UIK-09"]
    },
    {
      code: "PUB-10",
      block: "PUB",
      title: "Terms of Service and Privacy Policy pages (SH-08)",
      description: `### Goal
Implement \`/terms\` and \`/privacy\` legal pages detailing student privacy standards, COPPA/GDPR-K educational compliance, and acceptable platform use.

### Implementation Details
- Create \`frontend/src/pages/public/LegalPage/index.tsx\`.
- Formatted markdown article layout with sticky table of contents navigation.
- Highlighting student data privacy guarantees (no advertising, data isolation).
- Print stylesheet optimization (\`@media print\`).

### Git & Review Guidelines
- **Branch**: \`task/PUB-10-terms-privacy\`
- **Owns**:
  - \`frontend/src/pages/public/LegalPage/**\`
- **Conflict Prevention**: Follow SH-08 in SHARED-SPEC.`,
      acceptance_criteria: `- Clean typography and readable line lengths (max 65ch).
- Sticky table of contents links navigate directly to article sections.
- Print stylesheet removes headers/footers for clean paper copies.`,
      estimate: "1h",
      priority: "low",
      tags: ["public", "legal", "privacy"],
      links: [
        { label: "Terms & Privacy Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-08-terms-and-privacy" }
      ],
      depends_on: ["UIK-22"]
    },
    {
      code: "PUB-11",
      block: "PUB",
      title: "About the platform page and pedagogical mission (SH-09)",
      description: `### Goal
Implement \`/about\` page outlining Al Hikmah School's pedagogical philosophy, CEFR framework integration, and gamification principles.

### Implementation Details
- Create \`frontend/src/pages/public/AboutPage/index.tsx\`.
- Mission statement hero banner.
- Grid detailing the 4 language skills (Reading, Writing, Listening, Speaking).
- Mascot backstory card explaining Pip and Nova.

### Git & Review Guidelines
- **Branch**: \`task/PUB-11-about-page\`
- **Owns**:
  - \`frontend/src/pages/public/AboutPage/**\`
- **Conflict Prevention**: Follow SH-09 in SHARED-SPEC.`,
      acceptance_criteria: `- Communicates school pedagogical goals clearly with engaging arcade visuals.
- Responsive design adapts to all screen sizes.
- Accessible typography conforming to design tokens.`,
      estimate: "1h",
      priority: "low",
      tags: ["public", "about"],
      links: [
        { label: "About Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-09-about-the-platform" }
      ],
      depends_on: ["UIK-22", "UIK-07"]
    },
    {
      code: "PUB-12",
      block: "PUB",
      title: "Not Found 404 page with arcade mini-game easter egg (SH-10)",
      description: `### Goal
Implement \`/404\` page with playful lost character illustration, helpful navigation links, and mini playable easter egg button.

### Implementation Details
- Create \`frontend/src/pages/public/NotFoundPage/index.tsx\`.
- Mascot illustration of Pip looking confused with a map.
- "Return to Home" and "Go to Dashboard" CTA buttons.
- Playful Easter egg: clicking the mascot 3 times plays a celebration sound and gives a mini coin bounce animation.

### Git & Review Guidelines
- **Branch**: \`task/PUB-12-not-found-page\`
- **Owns**:
  - \`frontend/src/pages/public/NotFoundPage/**\`
- **Conflict Prevention**: Follow SH-10 in SHARED-SPEC.`,
      acceptance_criteria: `- Renders whenever route does not match defined patterns.
- Clear button directing user back to safe destination.
- Mascot interaction plays sound effect cleanly.`,
      estimate: "1h",
      priority: "medium",
      tags: ["public", "404", "easter-egg"],
      links: [
        { label: "Not Found Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-10-not-found-404" }
      ],
      depends_on: ["UIK-04", "UIK-03"]
    },
    {
      code: "PUB-13",
      block: "PUB",
      title: "Something Went Wrong error boundary page (SH-11)",
      description: `### Goal
Implement React error boundary fallback page (\`SH-11\`) catching unhandled client exceptions with error reporting and reload button.

### Implementation Details
- Create \`frontend/src/pages/public/ErrorPage/index.tsx\`.
- Gracefully render error boundary UI without crashing the window.
- Display error summary (stack trace collapsible in dev mode only).
- "Try Again" reload button and "Report Issue" action.

### Git & Review Guidelines
- **Branch**: \`task/PUB-13-error-boundary-page\`
- **Owns**:
  - \`frontend/src/pages/public/ErrorPage/**\`
- **Conflict Prevention**: Follow SH-11 in SHARED-SPEC.`,
      acceptance_criteria: `- Catches unhandled React runtime errors cleanly.
- Try Again button resets error boundary and attempts re-render.
- Sensitive stack traces hidden in production builds.`,
      estimate: "1h",
      priority: "high",
      tags: ["public", "error-boundary", "reliability"],
      links: [
        { label: "Error Page Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-11-something-went-wrong" }
      ],
      depends_on: ["UIK-04", "UIK-07"]
    },
    {
      code: "PUB-14",
      block: "PUB",
      title: "Offline, Maintenance and No Access system pages (SH-12, SH-13, SH-14)",
      description: `### Goal
Implement system notification pages: \`/offline\` (SH-12), \`/maintenance\` (SH-13), and \`/no-access\` (SH-14).

### Implementation Details
- Create \`OfflinePage.tsx\` with automatic internet reconnection listener.
- Create \`MaintenancePage.tsx\` displaying estimated return time from platform settings.
- Create \`NoAccessPage.tsx\` displaying 403 Forbidden message with role switch instructions.

### Git & Review Guidelines
- **Branch**: \`task/PUB-14-system-status-pages\`
- **Owns**:
  - \`frontend/src/pages/public/SystemPages/**\`
- **Conflict Prevention**: Follow SH-12, SH-13, SH-14 in SHARED-SPEC.`,
      acceptance_criteria: `- Offline page automatically reloads once navigator.onLine becomes true.
- Maintenance page dynamically shows return time estimate.
- No access page prevents unauthorized loops.`,
      estimate: "1h",
      priority: "high",
      tags: ["public", "offline", "maintenance", "security"],
      links: [
        { label: "System Pages Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-12-offline" },
        { label: "Maintenance Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-13-maintenance" },
        { label: "No Access Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#sh-14-no-access" }
      ],
      depends_on: ["UIK-04", "UIK-07"]
    }
  ]
};
