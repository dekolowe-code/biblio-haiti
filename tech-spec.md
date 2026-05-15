# Tech Spec — Biblio-Haiti

## Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | DOM renderer |
| react-router | ^7.6.0 | Navigation (mobile tabs + stack) |
| @supabase/supabase-js | ^2.49.0 | Backend (auth, database, storage) |
| framer-motion | ^12.6.0 | Animations (page transitions, gestures, micro-interactions) |
| lucide-react | ^0.510.0 | Icon set |
| tailwindcss | ^4.1.0 | Styling |
| @tailwindcss/vite | ^4.1.0 | Tailwind Vite plugin |
| typescript | ^5.8.0 | Type safety |
| vite | ^6.3.0 | Build tool |
| @vitejs/plugin-react | ^4.4.0 | React Vite plugin |

### Dev

| Package | Version | Purpose |
|---------|---------|---------|
| @types/react | ^19.1.0 | React type definitions |
| @types/react-dom | ^19.1.0 | React DOM type definitions |
| @types/node | ^22.15.0 | Node type definitions |

### Fonts (Google Fonts via `<link>`)

- **Poppins** (400, 500, 600, 700, 800) — headings, titles, buttons
- **Inter** (400, 500) — body text, captions, nav labels
- **Merriweather** (400, 700) — book reading content

---

## Component Inventory

### Layout

| Component | Source | Reuse | Notes |
|-----------|--------|-------|-------|
| MobileShell | Custom | Global | App shell: status bar + top nav + content area + bottom nav. Renders on every screen. |
| BottomNav | Custom | Global | 4-tab gradient nav. Active state with dot indicator. |
| TopNav | Custom | Global | Gradient header with logo + app title + search icon. |
| ContentCard | Custom | Global | Off-white card with rounded top corners (24px) that sits below the hero. |

### Navigation

| Component | Source | Reuse | Notes |
|-----------|--------|-------|-------|
| ScreenTransition | Custom (framer-motion) | Global | Wraps each screen with AnimatePresence + slide/fade variants. |

### Shared Components

| Component | Source | Reuse | Notes |
|-----------|--------|-------|-------|
| BookCard | Custom | Home, Catalog, Library, Detail-related | 120px width cover + title + author + rating. Optional premium lock overlay. |
| BookCardSkeleton | Custom | Home, Catalog, Library | Pulse animation placeholder for BookCard. |
| CategoryPill | Custom | Home, Catalog filters | Icon + label, full-rounded, category-colored. Horizontal scroll. |
| StarBadge | Custom | Home (floating), Book detail | Circular golden badge showing star balance. |
| QuizCard | Custom | Home, Quiz list | Banner CTA with trophy + "Jouer au Quiz" button. |
| ActionButton | Custom | Book detail, Auth, Quiz | Full-width gradient button (Teal for primary actions, Golden for unlock). |
| IconButton | Custom | Toolbar, overlays | Circular button with icon. |
| Toast | Custom (framer-motion) | Global | Slide-down notification, auto-dismiss 3s. |
| BottomSheet | Custom (framer-motion) | Catalog filters, premium purchase | Slide-up modal with overlay. |
| Confetti | Custom (framer-motion) | Quiz score, unlock | Particle burst animation with falling pieces. |
| CircularProgress | Custom | Library stats | SVG circle showing reading goal progress. |
| Skeleton | Custom | All screens loading | Pulse animation rectangles. |

### Screen Sections

| Component | Source | Reuse | Notes |
|-----------|--------|-------|-------|
| HeroBanner | Custom | Home only | Carousel with book illustration + subtitle + dots. 200px height. |
| ReadingStatsCard | Custom | Library only | Gradient card with circular progress + reading stats. |
| UserInfoCard | Custom | Profile only | Gradient card with avatar + name + email. |
| StatsRow | Custom | Profile only | 4 stat cards (books read, stars, quizzes, favorites). |
| QuizQuestion | Custom | Quiz only | Question card + timer + 4 answer buttons. |
| QuizScore | Custom | Quiz only | Score display with confetti + star reward animation. |

### Hooks

| Hook | Purpose |
|------|---------|
| useAuth | Supabase auth state (user, login, logout, register). |
| useStars | Star balance, transactions, earn/spend logic. |
| useBooks | Book fetching with filters (country, category, style, search). |
| useLibrary | User's library: unlocked books, favorites, reading progress. |
| useQuiz | Quiz fetching, submission, score calculation. |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| **Tab switch cross-fade** | framer-motion | `AnimatePresence` + `motion.div` with opacity variant (0→1, 200ms). | Low |
| **Push navigation (slide in/out)** | framer-motion | `motion.div` with x variant (±100%, 300ms ease-out/ease-in). `AnimatePresence` with custom direction. | Low |
| **Bottom sheet slide-up** | framer-motion | `motion.div` with y variant (100%→0, spring physics). Backdrop opacity 0→1. | Medium |
| **Star earned animation** | framer-motion | 3-phase sequence: (1) star scales 0→1.5 at center, (2) flies to badge position, (3) badge pulses. Use `useAnimation` + `animate`. | High |
| **Book unlock animation** | framer-motion | Chain: lock rotates+breaks (SVG morph), grayscale→color transition, "DÉBLOQUÉ!" bounce scale, confetti burst. | High |
| **Hero carousel auto-scroll** | framer-motion | `animate` on x offset, snap to slide width. 5s interval via `setInterval`. Dots animate width on active. | Medium |
| **Quiz answer selection** | framer-motion | Button bg fill from left (scaleX 0→1, origin left). Correct/wrong color + icon pop (scale 0→1). | Medium |
| **Confetti particles** | framer-motion | Array of 30-50 `motion.div` particles with random x/y velocities, rotation, and opacity fade. | Medium |
| **Pull-to-refresh spinner** | CSS + framer-motion | Golden spinner rotation via CSS `rotate` keyframes. Triggered by touch drag gesture. | Low |
| **Category pill press** | framer-motion | `whileTap={{ scale: 0.95 }}` + `transition: { type: "spring" }`. | Low |
| **FAB press** | framer-motion | `whileTap={{ scale: 0.9 }}`. Menu items stagger in on tap. | Low |
| **Toast slide-down** | framer-motion | `motion.div` y: -100→0, auto-dismiss with `setTimeout` + exit animation. | Low |
| **Skeleton pulse** | CSS | `animate-pulse` Tailwind class. | Low |
| **Star count roll-up** | Custom | Animate number from old→new value over 600ms with `requestAnimationFrame`. | Medium |
| **Reading toolbar toggle** | framer-motion | Opacity 0→1 + y offset on tap center. Auto-hide after 3s of inactivity. | Low |
| **Tab underline slide** | framer-motion | `layoutId` on underline element for automatic position animation between tabs. | Low |

---

## State & Logic

### Auth Flow (Supabase)

- `useAuth` hook manages Supabase auth state subscription.
- Login/Register screens are full-screen modals (no bottom nav).
- On auth state change, app re-renders with user context.
- RLS policies protect all user-specific data.

### Star Points System

- Stars stored in `users.stars_balance` (Supabase).
- All star changes go through `star_transactions` table (audit trail).
- Earn methods: daily login (+5), quiz completion (+10-50), reading 30min (+5), finish book (+20), share (+5).
- Spend method: unlock premium books (deducts `unlock_cost`).
- Optimistic UI updates: show new balance immediately, rollback on error.

### Book Reading

- Book content stored as `string[]` (pages) in `books.content`.
- Reading progress tracked in `user_books.current_page`.
- Full-screen reading view with hideable controls.
- Settings (font size, theme) persisted to `localStorage`.

### Quiz System

- Questions stored as JSON in `quizzes.questions`.
- Timer: 15s per question, visual circle countdown.
- Score calculation: correct answers / total * star_reward.
- Results saved to `quiz_results`, stars awarded via transaction.

### Data Fetching

- Direct Supabase queries (no tRPC since backend is Supabase, not custom server).
- All queries in custom hooks with loading/error states.
- Image covers from Supabase Storage.

---

## Other Key Decisions

### No shadcn/ui Components

The design is fully custom with unique colors (sunset gradient), shapes (fully rounded pills), and interactions. No shadcn/ui component maps cleanly to the design vision. All components are custom-built with Tailwind.

### Supabase Direct Integration (No tRPC/Drizzle)

The user explicitly requested Supabase as backend. All data operations use `@supabase/supabase-js` directly in custom hooks. No tRPC routers, no Drizzle ORM, no MySQL.

### Mobile Web App (Not Native)

Since the build environment outputs a web app, Biblio-Haiti is a mobile-first web app with PWA capabilities. It simulates a native mobile experience with:
- Viewport locked to mobile width (max 430px, centered)
- Touch-friendly interactions (44px min targets)
- Bottom nav, top nav, safe area support
- Full-screen reading mode

### Routing Structure

| Route | Screen | Auth Required |
|-------|--------|--------------|
| `/` | Home | No |
| `/catalogue` | Catalog | No |
| `/catalogue/:bookId` | Book Detail | No |
| `/catalogue/:bookId/read` | Reading View | Yes |
| `/bibliotheque` | My Library | Yes |
| `/quiz` | Quiz List | No |
| `/quiz/:quizId` | Quiz Play | Yes |
| `/profil` | Profile | Yes |
| `/profil/historique` | Star History | Yes |
| `/profil/parametres` | Settings | Yes |
| `/profil/compte` | Account Settings | Yes |
| `/login` | Login | No |
| `/register` | Register | No |

### Image Assets

All book covers, hero illustrations, and decorative images are generated via AI image generation and stored in the app's `public/` directory. The tropical leaf background pattern is CSS-based (not an image asset).
