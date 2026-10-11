// Block STU-GAM: Student Gamification, Quests, Shop, Games & AI Tutor (~22 tasks)
module.exports = {
  block: {
    code: "STU-GAM",
    name: "Student Gamification, Quests, Shop, Games & AI Tutor",
    description: "Gamified learning features: AI Tutor conversational chat, 7 arcade minigames, daily quests, weekly challenges, class leaderboards, achievements, rewards shop, and in-app notifications (ST-20 to ST-27, ST-30).",
  },
  tasks: [
    {
      code: "STU-GAM-01",
      block: "STU-GAM",
      title: "AI Tutor chat interface: conversation thread, Pip avatar and audio toggle (ST-20)",
      description: `### Goal
Build the primary AI Tutor chat screen (\`ST-20\`) with conversational message feed, Pip owl mascot avatar, and text-to-speech audio narration toggle.

### Implementation Details
- Create \`frontend/src/pages/student/AiTutorPage/index.tsx\`.
- Message feed rendering user speech bubbles and Pip assistant replies.
- Mascot animated presence: Pip looking attentive, blinking, or nodding during responses.
- Audio toggle button automatically narrating Pip's explanations aloud.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/AiTutorPage/index.tsx\`
  - \`frontend/src/pages/student/AiTutorPage/MessageFeed.tsx\`
- **Conflict Prevention**: Follow ST-20 in STUDENT-SPEC.`,
      acceptance_criteria: `- Renders friendly arcade chat UI with Pip mascot.
- Smooth auto-scroll keeps newest messages in view during conversation.
- Audio toggle plays speech narration cleanly.`,
      estimate: "2h",
      priority: "critical",
      tags: ["student", "ai-tutor", "chat"],
      links: [
        { label: "AI Tutor Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-20-ai-tutor" },
        { label: "AI Behavior", url: "frontend/docs/03-student/AI-BEHAVIOR.md#1-character-and-voice" }
      ],
      depends_on: ["UIK-27", "BE-EDGE-05"]
    },
    {
      code: "STU-GAM-02",
      block: "STU-GAM",
      title: "AI Tutor prompt suggestions, voice input and daily token limit meter (ST-20)",
      description: `### Goal
Implement contextual prompt suggestion chips, voice microphone input (Web Speech API), and daily student AI message quota indicator.

### Implementation Details
- Create \`frontend/src/pages/student/AiTutorPage/TutorInputBar.tsx\`.
- Contextual suggestion chips: "Explain this rule", "Give me an example", "Test my knowledge".
- Microphone button enabling voice-to-text input.
- Message counter badge displaying remaining daily AI interactions.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/AiTutorPage/TutorInputBar.tsx\`
- **Conflict Prevention**: Coordinate with STU-GAM-01 message feed.`,
      acceptance_criteria: `- Clicking suggestion chip populates input and sends message.
- Voice input records speech and transcribes accurately.
- Reaching daily message quota gracefully disables input with friendly explanation.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "ai-tutor", "voice", "metering"],
      links: [
        { label: "AI Tutor Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-20-ai-tutor" }
      ],
      depends_on: ["STU-GAM-01"]
    },
    {
      code: "STU-GAM-03",
      block: "STU-GAM",
      title: "Arcade minigames selection hub and Daily Featured Game banner (ST-21)",
      description: `### Goal
Implement \`/student/games\` arcade game selection hall featuring vibrant retro game posters, personal best scores, and Daily Featured Game bonus banner.

### Implementation Details
- Create \`frontend/src/pages/student/GamesHubPage/index.tsx\`.
- Hero banner highlighting today's featured game with 1.5x XP bonus multiplier.
- Grid of 7 educational minigames with illustrated arcade badges and player high scores.
- Filter by skill: Vocabulary, Spelling, Grammar, Speed.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/GamesHubPage/**\`
- **Conflict Prevention**: Follow ST-21 in STUDENT-SPEC.`,
      acceptance_criteria: `- Highlights Daily Featured Game with animated bonus badge.
- Displays player's personal high score on each game card.
- Clicking game opens game screen.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "games", "arcade", "hub"],
      links: [
        { label: "Games Selection Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-21-game-selection" },
        { label: "Economy & Games", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#9-games" }
      ],
      depends_on: ["UIK-23", "BE-CORE-12"]
    },
    {
      code: "STU-GAM-04",
      block: "STU-GAM",
      title: "Minigame execution shell: game lifecycle, timer and pause overlay (ST-22)",
      description: `### Goal
Build standard arcade wrapper shell managing countdown intro (3-2-1 GO!), active round timer, score counter, pause menu, and audio effects.

### Implementation Details
- Create \`frontend/src/pages/student/GameScreenPage/GameShell.tsx\`.
- Animated countdown overlay with arcade audio fanfare.
- Floating HUD: Current Score, Combo Streak multiplier, Round Timer, Mute button, Pause button.
- Accessible Pause modal with Resume and Exit options.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/GameScreenPage/GameShell.tsx\`
  - \`frontend/src/pages/student/GameScreenPage/PauseOverlay.tsx\`
- **Conflict Prevention**: Follow ST-22 in STUDENT-SPEC.`,
      acceptance_criteria: `- 3-2-1 GO intro initializes game state cleanly.
- HUD reflects real-time score updates and combo multipliers.
- Pause overlay suspends all timers and game loops.`,
      estimate: "2h",
      priority: "critical",
      tags: ["student", "games", "arcade-shell"],
      links: [
        { label: "Game Screen Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-22-game-screen" }
      ],
      depends_on: ["STU-GAM-03", "UIK-03"]
    },
    {
      code: "STU-GAM-05",
      block: "STU-GAM",
      title: "Minigame 1: Word Scramble letter tiles puzzle",
      description: `### Goal
Implement Word Scramble arcade game: unscrambling English vocabulary words using draggable/tappable letter tiles against a 60-second clock.

### Implementation Details
- Create \`frontend/src/pages/student/GameScreenPage/games/WordScrambleGame.tsx\`.
- Interactive letter tiles that can be tapped or dragged into target slots.
- Audio pronunciation hint button.
- Rapid feedback: correct word triggers coin ding and generates next word immediately.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/GameScreenPage/games/WordScrambleGame.tsx\`
- **Conflict Prevention**: Mounts inside GameShell.`,
      acceptance_criteria: `- Keyboard and touch friendly letter tile placement.
- Unscrambling word awards points and advances to next word.
- Tracks accuracy and elapsed time.`,
      estimate: "2h",
      priority: "high",
      tags: ["games", "word-scramble", "vocabulary"],
      links: [
        { label: "Games Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#9-games" }
      ],
      depends_on: ["STU-GAM-04"]
    },
    {
      code: "STU-GAM-06",
      block: "STU-GAM",
      title: "Minigame 2: Speed Match English-Arabic pairing frenzy",
      description: `### Goal
Implement Speed Match arcade game: tapping matching English and Arabic word cards on a dynamic 4x4 card grid before the clock runs out.

### Implementation Details
- Create \`frontend/src/pages/student/GameScreenPage/games/SpeedMatchGame.tsx\`.
- Dynamic card grid showing English terms and Arabic translations.
- Matching pairs pop with celebratory stars and vanish from board.
- Mismatched selections shake with gentle buzz and reset selection.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/GameScreenPage/games/SpeedMatchGame.tsx\`
- **Conflict Prevention**: Coordinate with audio effects in UIK-03.`,
      acceptance_criteria: `- Tapping two cards evaluates match immediately.
- Matched cards vanish with satisfying visual pop animation.
- Grid replenishes when pairs are cleared.`,
      estimate: "2h",
      priority: "high",
      tags: ["games", "speed-match", "vocabulary"],
      links: [
        { label: "Games Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#9-games" }
      ],
      depends_on: ["STU-GAM-04"]
    },
    {
      code: "STU-GAM-07",
      block: "STU-GAM",
      title: "Minigame 3: Grammar Dash rapid sentence repair runner",
      description: `### Goal
Implement Grammar Dash runner game: spotting grammatical errors in running sentences and selecting the correct fix before time expires.

### Implementation Details
- Create \`frontend/src/pages/student/GameScreenPage/games/GrammarDashGame.tsx\`.
- Sentences appear with highlighted questionable word/phrase.
- Two large arcade choice buttons for instant split-second decisions.
- Consecutive correct choices trigger 2x, 3x combo score streaks.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/GameScreenPage/games/GrammarDashGame.tsx\`
- **Conflict Prevention**: Follow timing rules in ECONOMY-AND-GAMES §9.`,
      acceptance_criteria: `- Rapid decision mechanics with immediate visual feedback.
- Combos escalate arcade soundtrack pitch or visual flair.
- Game ends cleanly when timer expires.`,
      estimate: "2h",
      priority: "high",
      tags: ["games", "grammar-dash", "grammar"],
      links: [
        { label: "Games Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#9-games" }
      ],
      depends_on: ["STU-GAM-04"]
    },
    {
      code: "STU-GAM-08",
      block: "STU-GAM",
      title: "Minigames 4-7: Spelling Bee, Sentence Builder, Word Safari and Memory Match",
      description: `### Goal
Implement the remaining 4 arcade minigames: audio Spelling Bee, tile Sentence Builder, animal-themed Word Safari, and concentration Memory Match.

### Implementation Details
- Implement \`SpellingBeeGame.tsx\` (listen to audio pronunciation and type word).
- Implement \`SentenceBuilderGame.tsx\` (reorder scrambled word tiles into valid syntax).
- Implement \`WordSafariGame.tsx\` (tap target vocabulary words as they pass on screen).
- Implement \`MemoryMatchGame.tsx\` (classic memory flip card game).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/GameScreenPage/games/SpellingBeeGame.tsx\`
  - \`frontend/src/pages/student/GameScreenPage/games/SentenceBuilderGame.tsx\`
  - \`frontend/src/pages/student/GameScreenPage/games/WordSafariGame.tsx\`
  - \`frontend/src/pages/student/GameScreenPage/games/MemoryMatchGame.tsx\`
- **Conflict Prevention**: Each game exports standard GameComponent interface.`,
      acceptance_criteria: `- All 4 minigames playable with keyboard and touch inputs.
- Audio synthesis integrates with Spelling Bee.
- Completing rounds reports score and accuracy to GameShell.`,
      estimate: "2h",
      priority: "high",
      tags: ["games", "arcade", "spelling", "syntax"],
      links: [
        { label: "Games Suite Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#9-games" }
      ],
      depends_on: ["STU-GAM-04"]
    },
    {
      code: "STU-GAM-09",
      block: "STU-GAM",
      title: "Minigame game over and results screen with high score check (ST-23)",
      description: `### Goal
Implement \`/student/games/:gameSlug/results\` game results screen calculating final score, new personal best fanfare, XP/coins earned, and retry button.

### Implementation Details
- Create \`frontend/src/pages/student/GameResultsPage/index.tsx\`.
- Big arcade score summary board with count-up animation.
- 'New High Score!' stamp celebration with confetti burst if current score beats personal record.
- Submit session to \`record_game_session\` RPC and display earned XP/Coins.
- 'Play Again' and 'Back to Arcade' CTA buttons.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/GameResultsPage/**\`
- **Conflict Prevention**: Follow ST-23 in STUDENT-SPEC.`,
      acceptance_criteria: `- Final score displays with energetic count-up animation.
- Celebrates new personal high score with confetti.
- Awards XP and coins via backend RPC.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "games", "results"],
      links: [
        { label: "Game Results Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-23-game-results" }
      ],
      depends_on: ["STU-GAM-04", "BE-OPS-17", "UIK-28"]
    },
    {
      code: "STU-GAM-10",
      block: "STU-GAM",
      title: "Daily quests and weekly goals hub with chest opening sequence (ST-24)",
      description: `### Goal
Implement \`/student/quests\` page showing active daily quests, weekly milestone challenges, and interactive animated treasure chest opening reward ceremony.

### Implementation Details
- Create \`frontend/src/pages/student/QuestsPage/index.tsx\`.
- Daily quests list with live progress meters and 'Claim Reward' button.
- Weekly challenges section with bonus coin reward.
- Interactive Chest Opening modal: chest shakes, springs open, and shoots out coins/XP rewards with fanfare.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/QuestsPage/**\`
- **Conflict Prevention**: Follow ST-24 in STUDENT-SPEC.`,
      acceptance_criteria: `- Displays 3 daily quests and weekly goal cards.
- Completed quests unlock claim button.
- Chest opening sequence plays joyful reward animation.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "quests", "rewards", "chests"],
      links: [
        { label: "Quests Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-24-daily-quests-and-weekly-goals" },
        { label: "Economy Rules", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#4-quests-and-weekly-goals" }
      ],
      depends_on: ["UIK-23", "BE-OPS-14", "UIK-28"]
    },
    {
      code: "STU-GAM-11",
      block: "STU-GAM",
      title: "Class and grade leaderboard with rank podium and privacy toggle (ST-25)",
      description: `### Goal
Implement \`/student/leaderboard\` page featuring 1st, 2nd, 3rd rank podium, scrolling ranking rows, student's current position, and weekly timeframe tabs.

### Implementation Details
- Create \`frontend/src/pages/student/LeaderboardPage/index.tsx\`.
- Top 3 podium display with gold, silver, bronze arcade medals.
- Sticky user rank bar at bottom indicating current student's position and points needed to climb rank.
- Filter tabs: 'This Week', 'This Month', 'All Time'.
- Respects class privacy rules (anonymizing names if mandated by teacher).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/LeaderboardPage/**\`
- **Conflict Prevention**: Follow ST-25 in STUDENT-SPEC.`,
      acceptance_criteria: `- Renders top 3 podium cards with medals.
- Renders list of class students sorted by XP.
- Sticky user rank bar shows user's current standing.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "leaderboard", "gamification"],
      links: [
        { label: "Leaderboard Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-25-leaderboard" },
        { label: "Economy Rules", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#6-leaderboard" }
      ],
      depends_on: ["UIK-23", "BE-OPS-16"]
    },
    {
      code: "STU-GAM-12",
      block: "STU-GAM",
      title: "Achievements and badges showcase with categories and unlock progress (ST-26)",
      description: `### Goal
Implement \`/student/achievements\` badge gallery showing unlocked vs locked badges categorized by Streaks, Learning, Quizzes, and Special Events.

### Implementation Details
- Create \`frontend/src/pages/student/AchievementsPage/index.tsx\`.
- Badge tiles with illustrated icons: unlocked badges display in full color with earn date; locked badges in monochrome silhouette with progress bar.
- Clicking badge opens detail popover with requirement description and XP reward.
- 'Pin to Profile' action button for unlocked badges.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/AchievementsPage/**\`
- **Conflict Prevention**: Follow ST-26 in STUDENT-SPEC.`,
      acceptance_criteria: `- Displays full catalog of achievement badges categorized neatly.
- Shows percentage progress toward locked badges.
- Pin button lets student equip up to 3 badges.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "achievements", "badges"],
      links: [
        { label: "Achievements Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-26-achievements-badges" },
        { label: "Badges Economy", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#5-badges" }
      ],
      depends_on: ["UIK-23", "BE-OPS-15"]
    },
    {
      code: "STU-GAM-13",
      block: "STU-GAM",
      title: "Arcade virtual shop: catalog browsing, item inspection and coin checkout (ST-27)",
      description: `### Goal
Implement \`/student/shop\` arcade store where students spend earned coins on themes, avatar items, sticker packs, and streak freezes.

### Implementation Details
- Create \`frontend/src/pages/student/ShopPage/index.tsx\`.
- Category tabs: Themes, Avatar Items, Stickers, Power-Ups (Streak Freezes).
- Shop item cards with coin price, required level, and 'Buy' or 'Equipped' status.
- Purchase confirmation modal showing student coin balance before and after checkout.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/ShopPage/**\`
- **Conflict Prevention**: Follow ST-27 in STUDENT-SPEC.`,
      acceptance_criteria: `- Displays all purchasable cosmetics with coin costs.
- Prevents buying if student lacks coins or level.
- Purchase completes via \`purchase_shop_item\` RPC with instant coin deduction.`,
      estimate: "2h",
      priority: "high",
      tags: ["student", "shop", "economy", "customization"],
      links: [
        { label: "Shop Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-27-shop" },
        { label: "Shop Rules", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#7-shop-and-customization" }
      ],
      depends_on: ["UIK-23", "BE-OPS-18"]
    },
    {
      code: "STU-GAM-14",
      block: "STU-GAM",
      title: "In-app notifications feed, announcement popups and real-time alerts (ST-30)",
      description: `### Goal
Implement \`/student/notifications\` inbox and slide-over drawer with real-time notification alerts, announcement dialogs, and mark-all-read action.

### Implementation Details
- Create \`frontend/src/pages/student/NotificationsPage/index.tsx\`.
- Filter tabs: 'All', 'Unread', 'Announcements', 'Achievements'.
- Realtime WebSocket subscription updating unread counter when new grade or announcement posted.
- School-wide urgent announcement modal popup.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/pages/student/NotificationsPage/**\`
- **Conflict Prevention**: Follow ST-30 in STUDENT-SPEC.`,
      acceptance_criteria: `- Unread count badge increments immediately on Realtime broadcast.
- Mark All Read clears unread status via API.
- Clicking notification links directly to relevant assignment or quiz result.`,
      estimate: "1h",
      priority: "high",
      tags: ["student", "notifications", "realtime"],
      links: [
        { label: "Notifications Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-30-notifications-and-announcements" },
        { label: "Notification Catalog", url: "backend/docs/08-STORAGE-REALTIME-NOTIFICATIONS.md#5-notification-catalog" }
      ],
      depends_on: ["UIK-23", "BE-EDGE-17"]
    },
    {
      code: "STU-GAM-15",
      block: "STU-GAM",
      title: "Audio pronunciation and speech recognition practice component",
      description: `### Goal
Build specialized pronunciation trainer tool allowing students to listen to model British/American pronunciation and record their own voice for match feedback.

### Implementation Details
- Create \`frontend/src/shared/components/practice/PronunciationTrainer.tsx\`.
- Audio player with slow-speed toggle (0.75x) for careful listening.
- Microphone record button with visual audio waveform visualizer.
- Speech recognition comparison scoring student pronunciation against phonetic target.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/components/practice/PronunciationTrainer.tsx\`
- **Conflict Prevention**: Reusable practice component.`,
      acceptance_criteria: `- Plays model pronunciation at normal and 0.75x speed.
- Records user audio and provides accuracy score.
- Audio waveform animates smoothly during recording.`,
      estimate: "2h",
      priority: "medium",
      tags: ["student", "audio", "speaking", "pronunciation"],
      links: [
        { label: "Student Practice Spec", url: "frontend/docs/03-student/STUDENT-SPEC.md#st-15-vocabulary" }
      ],
      depends_on: ["BE-EDGE-08", "UIK-03"]
    },
    {
      code: "STU-GAM-16",
      block: "STU-GAM",
      title: "Gamification soundscapes: audio fanfare hooks and ambient arcade sounds",
      description: `### Goal
Integrate celebratory arcade audio feedback hooks across gamification milestones (streak continuation ding, quest complete pop, level-up trumpet fanfare).

### Implementation Details
- Create \`frontend/src/shared/hooks/useGamificationAudio.ts\`.
- Connect audio events to streak updates, chest openings, coin gains, and badge awards.
- Polyphonic sound layering preventing audio clipping or jarring cutoffs.
- Strictly honors sound mute settings.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/hooks/useGamificationAudio.ts\`
- **Conflict Prevention**: Pure utility hook; does not alter UI components directly.`,
      acceptance_criteria: `- Plays distinct sound effects for coin ding, fanfare, and level up.
- Does not clip or distort when multiple sounds fire together.
- Instantly silences when mute toggle is activated.`,
      estimate: "1h",
      priority: "medium",
      tags: ["sound", "audio", "gamification"],
      links: [
        { label: "Audio Visual Law", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#10-component-styling-rules-visual-law-for-the-shared-kit" }
      ],
      depends_on: ["UIK-03", "UIK-28"]
    },
    {
      code: "STU-GAM-17",
      block: "STU-GAM",
      title: "Streak flame animation and freeze shield status indicator",
      description: `### Goal
Build dynamic \`StreakFlame\` indicator with tiered flame sizes (sparks at 1-6 days, blazing fire at 7-29 days, radiant blue flame at 30+ days) and freeze shield badge.

### Implementation Details
- Create \`frontend/src/shared/components/gamification/StreakFlame.tsx\`.
- CSS / SVG flame animation with particle embers.
- Freeze shield icon displaying count of active streak freezes.
- Explanatory tooltip explaining tomorrow's streak target and freeze protection rules.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/components/gamification/StreakFlame.tsx\`
- **Conflict Prevention**: Follow streak rules in ECONOMY-AND-GAMES §1.`,
      acceptance_criteria: `- Flame visual scales up at 7-day and 30-day milestones.
- Shield badge indicates available streak freezes accurately.
- Tooltip displays days count and active streak status.`,
      estimate: "1h",
      priority: "high",
      tags: ["gamification", "streaks", "animation"],
      links: [
        { label: "Streak Rules", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#1-time-rules" }
      ],
      depends_on: ["UIK-01", "UIK-15"]
    },
    {
      code: "STU-GAM-18",
      block: "STU-GAM",
      title: "Pip mascot companion widget with context-aware advice callouts",
      description: `### Goal
Build floating \`PipCompanion\` widget on student dashboard and lesson pages offering friendly hints, encouraging remarks, and streak reminders.

### Implementation Details
- Create \`frontend/src/shared/components/mascot/PipCompanion.tsx\`.
- Animated Pip owl character in bottom-right corner.
- Speech bubble callout with friendly reminder ("You are 20 XP away from leveling up!").
- Can be collapsed into mini icon badge or expanded on click.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/components/mascot/PipCompanion.tsx\`
- **Conflict Prevention**: Follow mascot specifications in GLOBAL-STYLES §11.`,
      acceptance_criteria: `- Friendly character presence with context-aware encouragement.
- Non-intrusive; dismissable and collapsible.
- Does not block interactive buttons or page content.`,
      estimate: "1h",
      priority: "medium",
      tags: ["mascot", "pip", "gamification"],
      links: [
        { label: "Characters Spec", url: "frontend/docs/01-styles/GLOBAL-STYLES-SPEC.md#11-characters-limited" }
      ],
      depends_on: ["UIK-06", "UIK-08"]
    },
    {
      code: "STU-GAM-19",
      block: "STU-GAM",
      title: "Interactive LevelUp celebration modal with reward unlocks preview",
      description: `### Goal
Create dedicated \`LevelUpModal\` displaying rank badge upgrade, new cosmetics unlocked in shop, bonus coins awarded, and shareable congratulatory card.

### Implementation Details
- Create \`frontend/src/shared/components/gamification/LevelUpModal.tsx\`.
- Big level number animation scaling in with celebratory sunburst.
- List of rewards unlocked: +50 Coins, New Avatar Hat unlocked, New Title unlocked.
- Fanfare sound effect and confetti cannon burst.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/components/gamification/LevelUpModal.tsx\`
- **Conflict Prevention**: Connects with \`CelebrationProvider\`.`,
      acceptance_criteria: `- Triggers automatically when student levels up.
- Highlights newly unlocked shop items and features.
- Closes cleanly and returns to active task.`,
      estimate: "1h",
      priority: "high",
      tags: ["gamification", "levels", "celebration"],
      links: [
        { label: "Levels Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#3-levels" }
      ],
      depends_on: ["UIK-28", "BE-OPS-05"]
    },
    {
      code: "STU-GAM-20",
      block: "STU-GAM",
      title: "Live Coin counter with animated delta numbers",
      description: `### Goal
Build tactile \`CoinCounter\` component in top navigation showing rolling number transition and floating floating \`+10\` gold coin chips on earnings.

### Implementation Details
- Create \`frontend/src/shared/components/gamification/CoinCounter.tsx\`.
- Animated number ticker smoothly rolling to new balance.
- Floating \`+X\` coin icon rising and fading out when coins are earned.
- Sound ding on balance increment.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/components/gamification/CoinCounter.tsx\`
- **Conflict Prevention**: Place in top navigation header.`,
      acceptance_criteria: `- Rolling number animation updates balance smoothly.
- Floating +X indicator provides instant reward feedback.
- Accessible ARIA live region announces coin earnings to screen readers.`,
      estimate: "1h",
      priority: "high",
      tags: ["gamification", "coins", "animation"],
      links: [
        { label: "Economy Rules", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#2-xp" }
      ],
      depends_on: ["UIK-01", "UIK-03"]
    },
    {
      code: "STU-GAM-21",
      block: "STU-GAM",
      title: "Class Quests collective goal tracker component",
      description: `### Goal
Implement \`ClassQuestProgress\` widget showing collective class progress toward group targets (e.g. "Read 500 pages together this week") with collective reward pool.

### Implementation Details
- Create \`frontend/src/shared/components/gamification/ClassQuestProgress.tsx\`.
- Class goal title, description, and group progress bar.
- Contributor avatars showing top helping classmates.
- Group reward banner (e.g. Free Arcade Day or Bonus 100 Coins for everyone).

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/shared/components/gamification/ClassQuestProgress.tsx\`
- **Conflict Prevention**: Follow class quest rules in ECONOMY-AND-GAMES §4.`,
      acceptance_criteria: `- Displays aggregated class progress accurately.
- Highlights individual student's personal contribution.
- Celebrates collective completion when target achieved.`,
      estimate: "1h",
      priority: "medium",
      tags: ["student", "quests", "class", "collaboration"],
      links: [
        { label: "Quests Spec", url: "frontend/docs/03-student/ECONOMY-AND-GAMES.md#4-quests-and-weekly-goals" }
      ],
      depends_on: ["UIK-16", "BE-CORE-11"]
    },
    {
      code: "STU-GAM-22",
      block: "STU-GAM",
      title: "Student gamification integration test suite and edge verification",
      description: `### Goal
Write comprehensive component and integration tests verifying reward claims, streak calculations, level up triggers, and minigame score reporting.

### Implementation Details
- Create \`frontend/src/test/integration/student-gamification.test.tsx\`.
- Test daily quest claiming and double-claim prevention.
- Test streak freeze protection when daily target is missed.
- Test level-up calculation and celebration trigger.
- Test shop purchase validation with insufficient coins.

### Execution & File Ownership
- **Owns**:
  - \`frontend/src/test/integration/student-gamification.test.tsx\`
- **Conflict Prevention**: Automated test suite.`,
      acceptance_criteria: `- All integration tests execute and pass in Vitest.
- Covers edge cases for streak freeze and level boundaries.
- Validates that UI state reflects backend ledger transactions.`,
      estimate: "2h",
      priority: "high",
      tags: ["testing", "gamification", "vitest"],
      links: [
        { label: "Testing Architecture", url: "backend/docs/12-TESTING.md#1-test-pyramid-and-responsibilities" }
      ],
      depends_on: ["STU-GAM-10", "STU-GAM-11", "STU-GAM-13"]
    }
  ]
};
