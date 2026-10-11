// Block UIK: Shared UI Kit, Arcade Primitives & Shells (~28 tasks)
module.exports = {
  block: {
    code: "UIK",
    name: "Shared UI Kit, Arcade Primitives & Shells",
    description: "Accessible, keyboard-friendly UI primitives following GLOBAL-STYLES (2px black outlines, solid offset shadows, Fredoka/Figtree fonts, world colors), form controls, overlays, navigation shells, and feedback components.",
  },
  tasks: [
    {
      code: "UIK-01",
      block: "UIK",
      title: "WorldProvider context, world morph transitions and theme switcher",
      description: `### Goal
Implement \`WorldProvider\` and \`ThemeProvider\` handling active world switching (Coral, Amber, Mint, Sky, Violet, Rose) via \`data-world\` root attributes and animated color transitions.

### Implementation Details
- Create \`frontend/src/shared/providers/WorldProvider.tsx\` and \`useWorld()\` hook.
- Create \`frontend/src/shared/providers/ThemeProvider.tsx\` for full cosmetic reskins.
- Implement CSS smooth transition on background and text colors when world changes.
- Persist user preference to \`localStorage\` and synchronize with profile settings.

### Git & Review Guidelines
- **Branch**: \`task/UIK-01-world-provider\`
- **Owns**:
  - \`frontend/src/shared/providers/WorldProvider.tsx\`
  - \`frontend/src/shared/providers/ThemeProvider.tsx\`
  - \`frontend/src/shared/hooks/useWorld.ts\`
- **Conflict Prevention**: Sets \`data-world\` on root document element; do not hardcode styles.`,
      acceptance_criteria: `- Switching world updates \`data-world\` attribute immediately.
- CSS color custom properties smoothly morph between palette themes.
- Persists across reloads.`,
      estimate: "1h",
      priority: "critical",
      tags: ["ui-kit", "themes", "worlds"],
      links: [
        { label: "Color System", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#3-color-system" },
        { label: "Themes Spec", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#4-themes-the-full-re-skin" }
      ],
      depends_on: ["FND-08", "FND-10"]
    },
    {
      code: "UIK-02",
      block: "UIK",
      title: "EffectsProvider, performance tiers and motion governor",
      description: `### Goal
Implement \`EffectsProvider\` detecting user device capability (Low, Balanced, High) and honoring \`prefers-reduced-motion\` to throttle heavy visual effects.

### Implementation Details
- Create \`frontend/src/shared/providers/EffectsProvider.tsx\` and \`useEffectsTier()\` hook.
- Low tier: disables 3D, disables confetti, minimal CSS transitions.
- Balanced tier: lightweight particle bursts, standard 2D motion.
- High tier: full 60fps GSAP ticker, interactive stickers, 3D celebratory stages.
- Listen to hardware concurrency, memory hints, and battery status.

### Git & Review Guidelines
- **Branch**: \`task/UIK-02-effects-provider\`
- **Owns**:
  - \`frontend/src/shared/providers/EffectsProvider.tsx\`
  - \`frontend/src/shared/hooks/useEffectsTier.ts\`
- **Conflict Prevention**: Core performance governor used by all motion and celebration tasks.`,
      acceptance_criteria: `- Automatically chooses balanced or low tier on low-spec devices or battery saver mode.
- Instantly respects OS \`prefers-reduced-motion\` toggle.
- Provides \`canRender3D\` and \`canAnimateComplex\` boolean flags.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "performance", "motion", "a11y"],
      links: [
        { label: "Performance Budget", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#9-3d-moments-and-the-performance-budget" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-03",
      block: "UIK",
      title: "SoundProvider, Howler audio sprites and mute toggle",
      description: `### Goal
Implement \`SoundProvider\` utilizing Howler.js audio sprites for arcade sound effects (button click, correct answer, level up, coin ding, error buzz).

### Implementation Details
- Create \`frontend/src/shared/providers/SoundProvider.tsx\` and \`useSound()\` hook.
- Define sound sprite map (click, success, fanfare, coin, whoosh, buzz, pop).
- Provide volume control, mute toggle, and persist audio settings in localStorage.
- Respect user interaction requirement for Web Audio autoplay policy.

### Git & Review Guidelines
- **Branch**: \`task/UIK-03-sound-provider\`
- **Owns**:
  - \`frontend/src/shared/providers/SoundProvider.tsx\`
  - \`frontend/src/shared/hooks/useSound.ts\`
  - \`frontend/src/assets/audio/sprites.json\`
- **Conflict Prevention**: Fallback gracefully to silence if audio assets are missing or disabled.`,
      acceptance_criteria: `- Plays crisp arcade audio effects on trigger without stutter.
- Mute toggle silences all audio instantly.
- Handles browser autoplay policy cleanly without console warnings.`,
      estimate: "1h",
      priority: "medium",
      tags: ["ui-kit", "audio", "sound", "howler"],
      links: [
        { label: "Audio & Feedback", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-04",
      block: "UIK",
      title: "Button and IconButton primitives with arcade press physics",
      description: `### Goal
Implement arcade \`Button\` and \`IconButton\` components featuring 2px black outlines, 3D press physics (transform translateY on active), and solid shadows.

### Implementation Details
- Create \`frontend/src/shared/components/ui/Button.tsx\` and \`IconButton.tsx\`.
- Variants: \`primary\` (world theme), \`secondary\` (white surface), \`outline\`, \`ghost\`, \`danger\` (coral-600), \`success\` (mint-600).
- Sizes: \`sm\`, \`md\`, \`lg\`, \`pill\`.
- States: default, hover (shadow expand), active (translateY(2px) with flattened shadow), disabled, loading (with retro spinner).
- Integrate click sound effect via \`useSound()\`.

### Git & Review Guidelines
- **Branch**: \`task/UIK-04-buttons\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Button.tsx\`
  - \`frontend/src/shared/components/ui/IconButton.tsx\`
- **Conflict Prevention**: Fully accessible via standard \`<button>\` HTML element and ARIA attributes.`,
      acceptance_criteria: `- Tactile button press animation with translateY and shadow collapse.
- Accessible keyboard focus ring matching base CSS specification.
- Loading state renders spinner and disables clicks.`,
      estimate: "1h",
      priority: "critical",
      tags: ["ui-kit", "button", "primitives"],
      links: [
        { label: "Component Styling Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01", "UIK-03"]
    },
    {
      code: "UIK-05",
      block: "UIK",
      title: "Arcade Badge, Chip, Tag and LevelIndicator primitives",
      description: `### Goal
Implement small badge, status tag, and chip primitives with solid borders, pill shapes, and high contrast typography.

### Implementation Details
- Create \`Badge.tsx\` (counts, notifications, new indicator).
- Create \`Chip.tsx\` (clickable filters, selectable tags, removable chips).
- Create \`LevelIndicator.tsx\` displaying student level pill with mini star or shield icon.
- Support world color variants and inverted styles.

### Git & Review Guidelines
- **Branch**: \`task/UIK-05-badge-chip\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Badge.tsx\`
  - \`frontend/src/shared/components/ui/Chip.tsx\`
  - \`frontend/src/shared/components/ui/LevelIndicator.tsx\`
- **Conflict Prevention**: Ensure chips have visible keyboard focus and dismissal events.`,
      acceptance_criteria: `- Renders compact badges with 2px borders and legible typography.
- Removable chips support keyboard Backspace/Delete removal.
- Level badge adapts to current world color.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "badge", "chip"],
      links: [
        { label: "Visual Law", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-06",
      block: "UIK",
      title: "ShapeFrame, Sticker and Squiggle arcade decorative primitives",
      description: `### Goal
Build the signature arcade sticker book decorative primitives: \`ShapeFrame\` (wavy, scalloped borders), \`Sticker\` (peeling tilt hover), and self-drawing SVG \`Squiggle\`.

### Implementation Details
- Create \`ShapeFrame.tsx\` generating custom SVG mask or border clip paths (wavy, ticket, postage stamp edges).
- Create \`Sticker.tsx\` with interactive slight tilt on hover, white border sticker outline, and drop shadow.
- Create \`Squiggle.tsx\` drawing animated highlighter squiggles and circles underneath text with SVG stroke dashoffset.
- Respect \`prefers-reduced-motion\` and EffectsProvider.

### Git & Review Guidelines
- **Branch**: \`task/UIK-06-arcade-decorations\`
- **Owns**:
  - \`frontend/src/shared/components/ui/ShapeFrame.tsx\`
  - \`frontend/src/shared/components/ui/Sticker.tsx\`
  - \`frontend/src/shared/components/ui/Squiggle.tsx\`
- **Conflict Prevention**: Keep SVG path definitions lightweight to preserve rendering performance.`,
      acceptance_criteria: `- Sticker displays white border outline and subtle spring hover tilt.
- Squiggle draws smoothly under key words without blocking text flow.
- Performance conforms to 60fps budget.`,
      estimate: "2h",
      priority: "high",
      tags: ["ui-kit", "arcade", "stickers", "decorations"],
      links: [
        { label: "Texture & Decoration Kit", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#7-texture-and-decoration-kit" }
      ],
      depends_on: ["UIK-02"]
    },
    {
      code: "UIK-07",
      block: "UIK",
      title: "Card, Surface and RetroShadow containers",
      description: `### Goal
Implement foundational layout containers: \`Card\`, \`Surface\`, and \`RetroContainer\` with solid outlines, offset black shadows, and optional header bands.

### Implementation Details
- Create \`frontend/src/shared/components/ui/Card.tsx\`.
- Support header band with world accent colors (\`card-header-band\`).
- Configurable shadow depths: \`sm\` (2px), \`md\` (4px), \`lg\` (8px).
- Hoverable card variants with lift animation (\`-translate-y-1\` and expanded shadow).

### Git & Review Guidelines
- **Branch**: \`task/UIK-07-card-containers\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Card.tsx\`
  - \`frontend/src/shared/components/ui/Surface.tsx\`
- **Conflict Prevention**: Provide \`as\` prop for semantic HTML tag polymorphism (\`section\`, \`article\`, \`div\`).`,
      acceptance_criteria: `- Renders crisp 2px border and hard offset box shadow.
- Header band neatly attaches to top of card container.
- Interactive card lifts up smoothly on hover.`,
      estimate: "1h",
      priority: "critical",
      tags: ["ui-kit", "card", "containers"],
      links: [
        { label: "Shape, Outline & Shadow", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#6-shape-outline-shadow-and-spacing" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-08",
      block: "UIK",
      title: "User Avatar, Character Avatar and LevelRing components",
      description: `### Goal
Create avatar primitives: \`Avatar\` (student custom avatar, teacher photo, Pip & Nova AI mascots) with circular border and optional circular progress level ring.

### Implementation Details
- Create \`Avatar.tsx\` supporting image fallback, initials generator, and mascot SVGs.
- Create \`LevelRing.tsx\` SVG circular progress indicator wrapping avatar depicting student level percentage.
- Sizes: \`xs\` (24px), \`sm\` (32px), \`md\` (44px), \`lg\` (64px), \`xl\` (96px).
- Status indicator dot (online, offline, away).

### Git & Review Guidelines
- **Branch**: \`task/UIK-08-avatar-levelring\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Avatar.tsx\`
  - \`frontend/src/shared/components/ui/LevelRing.tsx\`
- **Conflict Prevention**: Fallback smoothly to colored initials on broken image URLs.`,
      acceptance_criteria: `- Avatar renders image, SVG mascot, or initials fallback cleanly.
- Level ring accurately charts progress percentage around perimeter.
- 2px solid border separates ring from avatar content.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "avatar", "gamification"],
      links: [
        { label: "Character Spec", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#11-characters-limited" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-09",
      block: "UIK",
      title: "Input, Textarea and SearchField form controls",
      description: `### Goal
Implement accessible text input controls with 2px solid outlines, Fredoka/Figtree typography, clear buttons, and error message integration.

### Implementation Details
- Create \`Input.tsx\`, \`Textarea.tsx\`, and \`SearchField.tsx\`.
- Features: left/right icon slots, clearable input button, character counter, error validation state.
- Focus state: brand outline and subtle shadow pop.
- Integrates with React Hook Form via \`forwardRef\`.

### Git & Review Guidelines
- **Branch**: \`task/UIK-09-form-inputs\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Input.tsx\`
  - \`frontend/src/shared/components/ui/Textarea.tsx\`
  - \`frontend/src/shared/components/ui/SearchField.tsx\`
- **Conflict Prevention**: Enforce ARIA invalid and describedby attributes for error states.`,
      acceptance_criteria: `- Clean input styling with 2px border and active retro shadow.
- \`SearchField\` includes search icon and instant clear button.
- React Hook Form validation errors clearly displayed.`,
      estimate: "1h",
      priority: "critical",
      tags: ["ui-kit", "forms", "inputs"],
      links: [
        { label: "Component Styling Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-10",
      block: "UIK",
      title: "Select, Checkbox, Radio and Switch accessible selection controls",
      description: `### Goal
Implement custom selection primitives built on Radix UI headless components with arcade styling.

### Implementation Details
- Create \`Select.tsx\` (custom dropdown using Radix Select with retro popover shadow).
- Create \`Checkbox.tsx\` (2px square checkbox with bouncy animated checkmark).
- Create \`RadioGroup.tsx\` (circular radio with solid center dot).
- Create \`Switch.tsx\` (tactile toggle switch with sliding thumb and sound effect).

### Git & Review Guidelines
- **Branch**: \`task/UIK-10-selection-controls\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Select.tsx\`
  - \`frontend/src/shared/components/ui/Checkbox.tsx\`
  - \`frontend/src/shared/components/ui/RadioGroup.tsx\`
  - \`frontend/src/shared/components/ui/Switch.tsx\`
- **Conflict Prevention**: Retain full standard keyboard navigation (Arrow keys, Space, Enter).`,
      acceptance_criteria: `- 100% accessible keyboard navigation via Radix primitives.
- Crisp retro aesthetic with high contrast checked states.
- Sound effect triggers on switch toggle.`,
      estimate: "2h",
      priority: "high",
      tags: ["ui-kit", "forms", "selection", "radix"],
      links: [
        { label: "Visual Law", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01", "UIK-03"]
    },
    {
      code: "UIK-11",
      block: "UIK",
      title: "FormField wrapper with labels, helper text and error message animations",
      description: `### Goal
Create unified \`FormField\` component managing labels, required asterisks, helper text, and animated error messaging.

### Implementation Details
- Create \`frontend/src/shared/components/ui/FormField.tsx\`.
- Automatically connect \`id\`, \`aria-labelledby\`, and \`aria-describedby\`.
- Animate error message entrance using Motion or CSS accordion slide.
- Support optional character count and tooltip info icon.

### Git & Review Guidelines
- **Branch**: \`task/UIK-11-form-field-wrapper\`
- **Owns**:
  - \`frontend/src/shared/components/ui/FormField.tsx\`
- **Conflict Prevention**: Ensure wrapper does not add unnecessary DOM wrapper bloat.`,
      acceptance_criteria: `- Accessible association between label, input, and error messages.
- Error messages animate smoothly into view without layout jumps.
- Required indicator clearly visible.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "forms", "a11y"],
      links: [
        { label: "Form Design Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-09"]
    },
    {
      code: "UIK-12",
      block: "UIK",
      title: "Dialog and Modal overlay components with accessible focus trap",
      description: `### Goal
Create accessible \`Dialog\` and \`Modal\` components using Radix Dialog with backdrop blur, bouncy modal entrance, and retro drop shadow.

### Implementation Details
- Create \`frontend/src/shared/components/ui/Dialog.tsx\`.
- Features: title, description, close button, footer action slots.
- Backdrop: dark tint with subtle blur (\`bg-black/40 backdrop-blur-sm\`).
- Entrance animation: scale-in and fade with spring physics.
- Automatic focus trap and restore focus on dismiss.

### Git & Review Guidelines
- **Branch**: \`task/UIK-12-dialog-modal\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Dialog.tsx\`
- **Conflict Prevention**: Follow WAI-ARIA Dialog (Modal) design pattern.`,
      acceptance_criteria: `- Traps focus within modal while open; closes on Escape key or overlay click.
- Screen readers announce title and description automatically.
- Smooth spring entrance animation.`,
      estimate: "1h",
      priority: "critical",
      tags: ["ui-kit", "dialog", "modal", "radix"],
      links: [
        { label: "Overlays & Feedback", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01", "UIK-04"]
    },
    {
      code: "UIK-13",
      block: "UIK",
      title: "Drawer slide-over panel for mobile drawers and inspection sheets",
      description: `### Goal
Implement slide-over \`Drawer\` component supporting bottom sheet on mobile and right side drawer on desktop.

### Implementation Details
- Create \`frontend/src/shared/components/ui/Drawer.tsx\` using Radix Dialog / Vaul.
- Mobile: draggable bottom sheet with touch drag handle, velocity gesture dismiss.
- Desktop: right-side slide-over panel for inspector sheets or Copilot chats.
- Accessible keyboard dismissal and focus containment.

### Git & Review Guidelines
- **Branch**: \`task/UIK-13-drawer-panel\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Drawer.tsx\`
- **Conflict Prevention**: Responsive breakpoint automatically selects bottom sheet vs right drawer.`,
      acceptance_criteria: `- Slides smoothly from bottom on mobile and right on desktop.
- Drag handle on mobile allows swipe-to-dismiss gesture.
- Focus trap operates reliably.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "drawer", "mobile"],
      links: [
        { label: "Mobile Drawer Specs", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-12"]
    },
    {
      code: "UIK-14",
      block: "UIK",
      title: "DropdownMenu and ContextMenu primitives",
      description: `### Goal
Implement custom accessible dropdown menus and context menus styled with arcade border, popover shadow, and keyboard arrow navigation.

### Implementation Details
- Create \`DropdownMenu.tsx\` and \`ContextMenu.tsx\` using Radix UI.
- Items support icons, keyboard shortcuts, danger red highlights, and sub-menus.
- 2px solid border, 4px black shadow, crisp rounded corners.

### Git & Review Guidelines
- **Branch**: \`task/UIK-14-dropdown-menu\`
- **Owns**:
  - \`frontend/src/shared/components/ui/DropdownMenu.tsx\`
  - \`frontend/src/shared/components/ui/ContextMenu.tsx\`
- **Conflict Prevention**: Use Radix primitives for guaranteed accessibility compliance.`,
      acceptance_criteria: `- Dropdown opens cleanly on button click; navigates with arrow keys.
- Closes on Escape or item selection.
- Clear hover and active highlight indicators.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "dropdown", "radix"],
      links: [
        { label: "Component Styling Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-15",
      block: "UIK",
      title: "Tooltip and Popover contextual help primitives",
      description: `### Goal
Create lightweight accessible tooltips and rich popover panels for badges, XP formulas, and contextual help icons.

### Implementation Details
- Create \`Tooltip.tsx\` and \`Popover.tsx\` using Radix UI.
- Tooltips display on hover and keyboard focus with 200ms delay.
- Styled with dark background or high-contrast theme border, arrow indicator.
- Screen reader accessible via \`aria-describedby\`.

### Git & Review Guidelines
- **Branch**: \`task/UIK-15-tooltip-popover\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Tooltip.tsx\`
  - \`frontend/src/shared/components/ui/Popover.tsx\`
- **Conflict Prevention**: Tooltips must not steal focus from parent elements.`,
      acceptance_criteria: `- Shows on hover and focus; dismisses on Escape.
- Positions automatically using collision detection to stay on screen.
- Screen reader accessible.`,
      estimate: "1h",
      priority: "medium",
      tags: ["ui-kit", "tooltip", "popover"],
      links: [
        { label: "Component Styling Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-16",
      block: "UIK",
      title: "ProgressBar, ProgressRing and XPBar gamified progress indicators",
      description: `### Goal
Implement arcade progress indicators: horizontal \`ProgressBar\`, circular \`ProgressRing\`, and animated \`XpBar\` with striped pattern fills.

### Implementation Details
- Create \`ProgressBar.tsx\` (2px outline, rounded pill container, animated fill width).
- Create \`ProgressRing.tsx\` (SVG circular ring with customizable radius and stroke).
- Create \`XpBar.tsx\` featuring animated diagonal stripes in fill bar, XP numerical label, and pulse on increase.
- Support world accent colors.

### Git & Review Guidelines
- **Branch**: \`task/UIK-16-progress-bars\`
- **Owns**:
  - \`frontend/src/shared/components/ui/ProgressBar.tsx\`
  - \`frontend/src/shared/components/ui/ProgressRing.tsx\`
  - \`frontend/src/shared/components/ui/XpBar.tsx\`
- **Conflict Prevention**: Animate width using CSS transitions or Motion springs.`,
      acceptance_criteria: `- Smooth fill transitions when value changes.
- \`aria-valuenow\`, \`aria-valuemin\`, \`aria-valuemax\` attributes present.
- XpBar displays striped arcade fill animation.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "progress", "gamification"],
      links: [
        { label: "Gamification Components", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-17",
      block: "UIK",
      title: "Skeleton loaders and EmptyState / ErrorState visual templates",
      description: `### Goal
Implement skeleton loaders with subtle pulse and charming illustrated \`EmptyState\` and \`ErrorState\` components with action buttons.

### Implementation Details
- Create \`Skeleton.tsx\` (custom pulse animation without aggressive flash).
- Create \`EmptyState.tsx\` (empty box illustration, friendly title, description, CTA button).
- Create \`ErrorState.tsx\` (warning sticker icon, error message, retry button).
- Include Arabic localized fallbacks.

### Git & Review Guidelines
- **Branch**: \`task/UIK-17-skeleton-empty-error\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Skeleton.tsx\`
  - \`frontend/src/shared/components/ui/EmptyState.tsx\`
  - \`frontend/src/shared/components/ui/ErrorState.tsx\`
- **Conflict Prevention**: Ensure empty states fit neatly inside cards or full-page layouts.`,
      acceptance_criteria: `- Skeletons match layout dimensions during loading states.
- Empty states present clear user call to action.
- Retry button triggers callback on error states.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "feedback", "loading"],
      links: [
        { label: "Component Styling Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-04", "UIK-07"]
    },
    {
      code: "UIK-18",
      block: "UIK",
      title: "DataTable component with column sorting, search and bulk actions bar",
      description: `### Goal
Implement high-performance \`DataTable\` component featuring sortable columns, row selection checkboxes, pagination, and floating bulk action bar.

### Implementation Details
- Create \`frontend/src/shared/components/ui/DataTable.tsx\` using TanStack Table.
- Retro table styling: 2px borders, alternating zebra rows, sticky header.
- Multi-row selection with floating bottom bulk actions bar (e.g. Delete, Archive, Export).
- Sorting arrows and per-column search filters.

### Git & Review Guidelines
- **Branch**: \`task/UIK-18-data-table\`
- **Owns**:
  - \`frontend/src/shared/components/ui/DataTable.tsx\`
- **Conflict Prevention**: Reusable table for teacher rosters and admin user management.`,
      acceptance_criteria: `- Smooth column sorting on header click.
- Bulk selection checkbox selects all page rows.
- Accessible keyboard navigation across cells and headers.`,
      estimate: "2h",
      priority: "high",
      tags: ["ui-kit", "tables", "data-display"],
      links: [
        { label: "Data Display Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-10", "UIK-04"]
    },
    {
      code: "UIK-19",
      block: "UIK",
      title: "Pagination and FilterBar search and faceted filtering components",
      description: `### Goal
Create accessible \`Pagination\` controls and \`FilterBar\` containing search input, filter chips, and sorting dropdown.

### Implementation Details
- Create \`Pagination.tsx\` (page numbers, previous/next buttons, page size selector).
- Create \`FilterBar.tsx\` combining search field, active filter tags with clear all button, and view mode toggle (grid vs list).
- Mobile responsive layout collapsing filter options into a drawer.

### Git & Review Guidelines
- **Branch**: \`task/UIK-19-pagination-filters\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Pagination.tsx\`
  - \`frontend/src/shared/components/ui/FilterBar.tsx\`
- **Conflict Prevention**: URL search params synchronized cleanly.`,
      acceptance_criteria: `- Pagination controls update page index without page jumps.
- FilterBar adapts cleanly to small mobile screens.
- Active filters show clear badges with instant removal.`,
      estimate: "1h",
      priority: "medium",
      tags: ["ui-kit", "pagination", "filters"],
      links: [
        { label: "Data Display Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-04", "UIK-09"]
    },
    {
      code: "UIK-20",
      block: "UIK",
      title: "Tabs and SegmentedControl accessible navigation switches",
      description: `### Goal
Implement accessible \`Tabs\` and \`SegmentedControl\` with sliding active pill highlight and keyboard arrow navigation.

### Implementation Details
- Create \`Tabs.tsx\` and \`SegmentedControl.tsx\` based on Radix Tabs.
- Sliding pill indicator behind active tab using layoutId animation.
- Arcade styling with 2px solid border and high contrast labels.
- Keyboard arrow left/right switches tabs.

### Git & Review Guidelines
- **Branch**: \`task/UIK-20-tabs-segmented\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Tabs.tsx\`
  - \`frontend/src/shared/components/ui/SegmentedControl.tsx\`
- **Conflict Prevention**: Follow ARIA Tabs pattern.`,
      acceptance_criteria: `- Smooth pill sliding animation between selected tabs.
- Arrow keys switch active tab with keyboard focus.
- Unselected tabs retain clear contrast.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "tabs", "navigation", "radix"],
      links: [
        { label: "Component Styling Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-21",
      block: "UIK",
      title: "Accordion and collapsible panel components",
      description: `### Goal
Create accessible \`Accordion\` component for FAQ sections, lesson unit breakdowns, and collapsible curriculum blocks.

### Implementation Details
- Create \`Accordion.tsx\` based on Radix Accordion.
- Support single and multiple expanded items.
- Smooth height expansion animation without layout stutter.
- Arrow icon rotates 180 degrees on expansion.

### Git & Review Guidelines
- **Branch**: \`task/UIK-21-accordion\`
- **Owns**:
  - \`frontend/src/shared/components/ui/Accordion.tsx\`
- **Conflict Prevention**: Screen readers must correctly read expanded state.`,
      acceptance_criteria: `- Smooth height expansion and collapse.
- Keyboard Enter and Space toggle items.
- Accessible ARIA expanded attributes.`,
      estimate: "1h",
      priority: "medium",
      tags: ["ui-kit", "accordion", "radix"],
      links: [
        { label: "Data Display Rules", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-01"]
    },
    {
      code: "UIK-22",
      block: "UIK",
      title: "PublicHeader and PublicFooter navigation shells for visitors",
      description: `### Goal
Build \`PublicHeader\` and \`PublicFooter\` components with sticky positioning, mobile menu drawer, and school branding.

### Implementation Details
- Create \`PublicHeader.tsx\` with logo, nav links (About, Curriculum, FAQ, Contact), and Sign In button.
- Create \`PublicFooter.tsx\` with school accreditation info, copyright, and legal links.
- Mobile burger menu sliding out responsive drawer on small viewports.
- Skip-to-content accessibility link.

### Git & Review Guidelines
- **Branch**: \`task/UIK-22-public-shells\`
- **Owns**:
  - \`frontend/src/shared/components/layout/PublicHeader.tsx\`
  - \`frontend/src/shared/components/layout/PublicFooter.tsx\`
- **Conflict Prevention**: Shell components must not wrap router outlets directly; exported as layout pieces.`,
      acceptance_criteria: `- Header remains sticky on scroll with subtle backdrop blur.
- Mobile hamburger menu toggles accessible drawer.
- Footer displays all legal and school links cleanly.`,
      estimate: "1h",
      priority: "high",
      tags: ["ui-kit", "layout", "public"],
      links: [
        { label: "Public Shell Spec", url: "frontend/docs/02-public/SHARED-SPEC.md#4-shared-components" }
      ],
      depends_on: ["UIK-04", "UIK-13"]
    },
    {
      code: "UIK-23",
      block: "UIK",
      title: "Student AppShell: sidebar, topbar, mobile bottom navigation and streak pill",
      description: `### Goal
Build student \`StudentAppShell\` layout incorporating arcade sidebar, top status bar (Coins, Streak Flame, Level, Theme switcher), and mobile bottom tab bar.

### Implementation Details
- Create \`StudentAppShell.tsx\`.
- Desktop sidebar: Dashboard, Courses, Quizzes, Assignments, Practice, AI Tutor, Games, Shop.
- Top bar: live coin counter, streak flame with days count, active world indicator, user avatar dropdown.
- Mobile: bottom navigation bar with 5 primary icons for touch navigation.
- Main content scroll container with Lenis integration.

### Git & Review Guidelines
- **Branch**: \`task/UIK-23-student-shell\`
- **Owns**:
  - \`frontend/src/shared/components/layout/StudentAppShell.tsx\`
  - \`frontend/src/shared/components/layout/StudentTopBar.tsx\`
  - \`frontend/src/shared/components/layout/StudentBottomNav.tsx\`
- **Conflict Prevention**: Follow student shell specifications in STUDENT-SPEC §3.`,
      acceptance_criteria: `- Clean responsive layout adapting from 375px mobile to widescreen desktop.
- Displays live Coins, Streak, Level, and XP in top header.
- Mobile bottom bar highlights current active route.`,
      estimate: "2h",
      priority: "critical",
      tags: ["ui-kit", "layout", "student-shell"],
      links: [
        { label: "Student Global Shell", url: "frontend/docs/03-student/STUDENT-SPEC.md#3-global-shell" },
        { label: "App Shell Styling", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#15-app-shell-styling" }
      ],
      depends_on: ["UIK-04", "UIK-08", "UIK-16"]
    },
    {
      code: "UIK-24",
      block: "UIK",
      title: "Teacher AppShell: sidebar, class switcher, action bar and focused mode",
      description: `### Goal
Build teacher \`TeacherAppShell\` layout with class quick-switcher, grading queue shortcut pill, AI Copilot toggle button, and focused grading mode.

### Implementation Details
- Create \`TeacherAppShell.tsx\`.
- Class switcher dropdown in header for instant class context filtering.
- Nav items: Dashboard, Classes, Students, Courses, Assignments, Quizzes, Question Bank, Grading, Reports, Copilot.
- Focused mode: hides sidebar when grading submissions to maximize screen estate.

### Git & Review Guidelines
- **Branch**: \`task/UIK-24-teacher-shell\`
- **Owns**:
  - \`frontend/src/shared/components/layout/TeacherAppShell.tsx\`
  - \`frontend/src/shared/components/layout/TeacherTopBar.tsx\`
- **Conflict Prevention**: Follow TEACHER-SPEC §3 shell layout.`,
      acceptance_criteria: `- Class switcher dropdown lets teacher switch between active classes.
- Focused mode hides navigation drawer during intensive grading.
- Unread submissions badge counter visible next to Grading tab.`,
      estimate: "2h",
      priority: "critical",
      tags: ["ui-kit", "layout", "teacher-shell"],
      links: [
        { label: "Teacher Global Shell", url: "frontend/docs/04-teacher/TEACHER-SPEC.md#3-global-shell" }
      ],
      depends_on: ["UIK-04", "UIK-10", "UIK-14"]
    },
    {
      code: "UIK-25",
      block: "UIK",
      title: "Admin AppShell: sidebar navigation, system health badge and View-As banner",
      description: `### Goal
Build \`AdminAppShell\` layout with administrative hierarchy navigation, system operational health pill, and persistent 'View-As' simulation banner.

### Implementation Details
- Create \`AdminAppShell.tsx\`.
- Sections: Overview, People (Users, Classes, Import, Rollover), Curriculum & Content, Engagement Studios, AI Governance, System (Audit, Settings).
- Sticky \`ViewAsBanner\`: high-visibility warning bar at top when admin simulates student/teacher views, with instant 'Exit Simulation' button.
- Super Admin badge on sensitive settings items.

### Git & Review Guidelines
- **Branch**: \`task/UIK-25-admin-shell\`
- **Owns**:
  - \`frontend/src/shared/components/layout/AdminAppShell.tsx\`
  - \`frontend/src/shared/components/layout/ViewAsBanner.tsx\`
- **Conflict Prevention**: Follow ADMIN-SPEC §4 shell specs.`,
      acceptance_criteria: `- View-As banner stays docked to top of screen whenever simulation is active.
- Exit simulation button immediately restores admin session.
- Submenu sections collapse neatly on smaller screens.`,
      estimate: "2h",
      priority: "critical",
      tags: ["ui-kit", "layout", "admin-shell", "view-as"],
      links: [
        { label: "Admin Global Shell", url: "frontend/docs/05-admin/ADMIN-SPEC.md#4-global-shell" }
      ],
      depends_on: ["UIK-04", "UIK-07"]
    },
    {
      code: "UIK-26",
      block: "UIK",
      title: "QuestionRenderer modular architecture supporting all exercise question types",
      description: `### Goal
Build modular \`QuestionRenderer\` component dynamically rendering interactive exercises: multiple choice, fill in the blank, matching, reorder, short answer, and audio spelling.

### Implementation Details
- Create \`frontend/src/shared/components/questions/QuestionRenderer.tsx\`.
- Create subcomponents:
  - \`MultipleChoiceQuestion.tsx\` (tactile selection cards)
  - \`FillBlankQuestion.tsx\` (inline input slots inside sentence)
  - \`MatchingQuestion.tsx\` (connecting pairs with visual feedback)
  - \`ReorderQuestion.tsx\` (accessible reordering / drag and drop)
  - \`ShortAnswerQuestion.tsx\` (freeform text area)
  - \`AudioSpellingQuestion.tsx\` (audio play button with letter tiles)
- Expose unified interface: \`value\`, \`onChange\`, \`readOnly\`, \`showSolution\`.

### Git & Review Guidelines
- **Branch**: \`task/UIK-26-question-renderer\`
- **Owns**:
  - \`frontend/src/shared/components/questions/**\`
- **Conflict Prevention**: Keep question components pure; no direct database mutations.`,
      acceptance_criteria: `- Renders all 6 core question types cleanly.
- Full keyboard support for drag-and-drop / matching exercises.
- \`showSolution\` mode highlights correct vs incorrect student answers with feedback.`,
      estimate: "2h",
      priority: "critical",
      tags: ["ui-kit", "questions", "exercises"],
      links: [
        { label: "Questions Data Model", url: "backend/docs/02-DATA-MODEL-CORE.md#5-questions-and-rubrics" },
        { label: "Student Practice Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-06-activity-page" }
      ],
      depends_on: ["UIK-04", "UIK-07", "UIK-09", "UIK-10"]
    },
    {
      code: "UIK-27",
      block: "UIK",
      title: "AI Chat UI kit: ChatMessage, ChatInput, TypingIndicator and ActionCardDisplay",
      description: `### Goal
Create shared AI chat components: user and assistant message bubbles, streaming typing indicator, voice input trigger, and visual \`ActionCard\` displays.

### Implementation Details
- Create \`ChatMessage.tsx\` (Pip mascot avatar, markdown rendering, copy button).
- Create \`ChatInput.tsx\` (auto-expanding textarea, send button, suggested prompt chips).
- Create \`TypingIndicator.tsx\` (pulsing dots or Pip thinking animation).
- Create \`ActionCardDisplay.tsx\` rendering proposed changes with 'Apply Changes' and 'Discard' buttons.

### Git & Review Guidelines
- **Branch**: \`task/UIK-27-ai-chat-kit\`
- **Owns**:
  - \`frontend/src/shared/components/ai/**\`
- **Conflict Prevention**: Modular UI components used by both AI Tutor and Teacher Copilot.`,
      acceptance_criteria: `- Renders streaming token text without scrolling jitter.
- Action cards visually summarize database modifications with clear CTA buttons.
- Accessible focus handling on send and suggestions.`,
      estimate: "2h",
      priority: "high",
      tags: ["ui-kit", "ai", "chat", "action-cards"],
      links: [
        { label: "AI Components Spec", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" },
        { label: "Action Cards Specs", url: "backend/docs/07-AI-SYSTEM.md#8-action-cards" }
      ],
      depends_on: ["UIK-04", "UIK-07", "UIK-09"]
    },
    {
      code: "UIK-28",
      block: "UIK",
      title: "ConfettiProvider and multi-tier CelebrationDialog queue",
      description: `### Goal
Implement arcade celebration system with canvas confetti bursts, audio fanfares, and modal dialogs for level ups, quest completions, and streak milestones.

### Implementation Details
- Create \`frontend/src/shared/providers/CelebrationProvider.tsx\` and \`useCelebration()\` hook.
- Celebration tiers:
  - Small: coin ding sound, subtle particle burst at trigger element.
  - Medium: full screen confetti shower, sound fanfare, banner.
  - Large: Level Up / Milestone celebration modal with Rive/animated character and reward summary.
- Manage queue so celebrations display sequentially rather than overlapping.

### Git & Review Guidelines
- **Branch**: \`task/UIK-28-celebrations\`
- **Owns**:
  - \`frontend/src/shared/providers/CelebrationProvider.tsx\`
  - \`frontend/src/shared/components/feedback/CelebrationDialog.tsx\`
- **Conflict Prevention**: Check \`EffectsProvider\` to ensure low-end devices run lightweight particle fallbacks.`,
      acceptance_criteria: `- \`celebrate({ tier: 'large', title: 'Level 5 Reached!' })\` triggers celebration sequence.
- Sequential queue displays multiple rewards cleanly one after another.
- Honors reduced motion and sound mute preferences.`,
      estimate: "2h",
      priority: "high",
      tags: ["ui-kit", "celebrations", "confetti", "gamification"],
      links: [
        { label: "Celebrations Visual Law", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-02", "UIK-03", "UIK-12"]
    }
  ]
};
