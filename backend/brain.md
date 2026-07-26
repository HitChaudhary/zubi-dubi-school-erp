# brain.md — Zubi Dubi Project Knowledge

> A single source of truth for what this project is, how it's built, and what's still missing.
> Read this before making changes — it'll save you from re-discovering decisions that were already made.

---

## 1. What this is

**Zubi Dubi** is a multi-tenant school management platform ("Your school, fully digital"). Each **School** is a tenant. Inside a school there are **Teachers** and **Students**, managed by a **School Admin**. A **Super Admin** oversees every school on the platform, approves new schools, and manages subscriptions.

Core features: live class meetings (external video link, e.g. Jitsi/Zoom), assignments + submissions + grading, and a self-service school registration flow with Super Admin approval.

---

## 2. Tech stack

| Layer | Tech |
|---|---|
| Backend | Node.js (ESM, `"type": "module"`), Express 5 |
| ORM / DB | Prisma 6 + PostgreSQL |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` password hashing |
| Email | `nodemailer` over SMTP (degrades to console-log if unconfigured) |
| Frontend | React 18 + Vite, React Router v6 |
| Styling | Tailwind (custom theme) + a lot of inline `style={{}}` (see §7) |
| Animation | `gsap` (free, incl. SplitText) for text reveals; `motion` (the Framer Motion successor) for spring/count-up animations — both used sparingly, see §7a |
| Icons | Material Symbols (Google Fonts, loaded via `index.html`) |

---

## 3. Repo layout

```
backend/
  server.js                  — Express app entry, mounts all routers, loads .env
  config/
    prisma.js                — shared PrismaClient singleton (import this, never `new PrismaClient()` elsewhere)
    db.js                    — unused raw `pg` Pool, kept for future raw-SQL needs
  midddleware/authmiddlerware.js   — authenticateJWT, authorizeRoles(...roles)  [note: "midddleware" typo, intentionally kept to avoid breaking imports]
  controllers/               — one per role: admin, teacher, student, superadmin, auth, registration
  routes/                    — one per controller, mounted under /api/<role>
  utils/mailer.js            — SMTP notifications for the registration flow
  prisma/schema.prisma       — the data model (see §4)
  prisma/migrations/         — 2 migrations so far: init, init_school_platform. Registration feature's
                               migration has NOT been generated yet — see §9.
  seed.js                    — creates 1 school + 1 user per role, password "password123" for all

frontend/
  src/
    App.jsx                  — all routing lives here
    pages/
      home, about, contact   — public marketing site (has Navbar)
      login/LoginPage.jsx    — standalone auth page (no Navbar), redirects by role after login
      register/              — public self-signup (RegisterPage) + status checker (RegistrationStatusPage)
      admin/AdminDashboard.jsx        — School Admin
      teacher/TeacherDashboard.jsx    — Teacher
      student/StudentDashboard.jsx    — Student
      superadmin/SuperAdminDashboard.jsx — Super Admin
    components/
      common/ProtectedRoute.jsx      — auth + role gate, used by every dashboard route
      common/Navbar.jsx, Footer.jsx  — public site chrome
      dashboard/DashboardShell.jsx   — shared sidebar+topbar shell used by all 4 dashboards
      dashboard/Widgets.jsx          — StatCard, Card, Badge, Modal, PrimaryButton, FormField, etc.
      login/LoginLeftPanel.jsx       — shared branding panel reused by Login/Register/Status pages
    utils/
      api.js                  — fetch wrapper: attaches JWT, throws on !ok, clears storage on 401
      auth.js                 — getCurrentUser/getToken/logout, ROLE_HOME + ROLE_LABEL maps
    styles/index.css           — custom utility classes: .form-input, .form-label, .btn-primary, etc.
  tailwind.config.js          — custom color tokens (primary #3525cd, secondary-container #39b8fd, etc.)
```

---

## 4. Data model (Prisma)

Enums: `Role` (SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT), `SubscriptionStatus` (ACTIVE, EXPIRED, CANCELLED), `MeetingStatus` (SCHEDULED, ONGOING, ENDED), `RequestStatus` (PENDING, APPROVED, REJECTED).

Models:
- **School** — `name`, `domain` (unique, optional) → has many Users, Subscriptions, Meetings, Assignments
- **Subscription** — belongs to a School; `planName`, `status`, `endDate`
- **User** — `name`, `email` (unique), `password` (bcrypt hash), `role`, `schoolId` (nullable — SUPER_ADMIN has none)
- **Meeting** — `title`, `meetingLink`, `status`, `startTime`/`endTime`, belongs to School + `host` (User)
- **Assignment** — `title`, `description`, `fileUrl`, `dueDate`, belongs to School + `teacher` (User)
- **Submission** — `fileUrl`, `grade` (nullable string), belongs to Assignment + `student` (User). `@@unique([assignmentId, studentId])` — one submission per student per assignment.
- **RegistrationRequest** — *not yet migrated* (see §9). `schoolName`, `domain`, `adminName`, `adminEmail`, `password` (hashed at submit time), `status`, `rejectionReason`, `reviewedByName`, `reviewedAt`.

**Tenancy rule:** every school-scoped query filters by `schoolId` from the JWT (`req.user.schoolId`), never from the request body/params. This is what keeps schools isolated from each other — don't break this pattern.

---

## 5. Auth & routing model

- Login (`POST /api/auth/login`) returns a JWT containing `{ userId, role, schoolId }`. Frontend stores the raw token + a `user` object in `localStorage` (keys: `token`, `user`).
- `GET /api/auth/me` re-validates a stored token (used for session checks, not currently wired into a "remember me" auto-refresh anywhere — see §9).
- Backend: `authenticateJWT` verifies the token and attaches `req.user`; `authorizeRoles('ROLE', ...)` is layered on top per-router via `router.use(...)`. Every `*.routes.js` file (except `auth` and `registration`) is fully locked to one role.
- Frontend: `<ProtectedRoute allowedRoles={[...]}>` wraps each dashboard route in `App.jsx`. If the role doesn't match, it redirects to *that user's own* dashboard via `ROLE_HOME` (not to login) — so a Teacher hitting `/admin/dashboard` lands on `/teacher/dashboard`, not a confusing redirect loop.
- `utils/api.js`'s `apiRequest()` clears `localStorage` and throws on a `401`, so any dashboard fetch failing with "session expired" will naturally bounce the user via the error banner + they can re-login. There's no automatic redirect-to-login built into the fetch wrapper itself — components show the error inline.

**Known gap:** No refresh tokens. JWTs are signed with a 1-day expiry (`authcontroller.js`); after that, the user just starts getting 401s on dashboard calls until they manually go to `/login` again.

---

## 6. API surface (by role)

All routes are prefixed `/api`. Role-scoped routers (`admin`, `teacher`, `student`, `superadmin`) require `Authorization: Bearer <token>` and enforce the matching role.

**Public**
- `POST /auth/login`
- `GET /auth/me` (auth required, any role)
- `POST /register` — submit a school signup request
- `GET /register/status?email=` — check a request's status

**`/admin/*`** (SCHOOL_ADMIN — scoped to `req.user.schoolId`)
- `GET /stats` — teacher/student/meeting/assignment counts
- `GET /school`, `PUT /school` — own school profile + latest subscription (read-only billing)
- `GET /users?role=`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id` — manage teachers & students
- `GET /meetings`, `POST /meetings`, `PUT /meetings/:id`, `DELETE /meetings/:id` — full moderation of every meeting in the school, not just ones the admin hosts
- `GET /assignments`, `POST /assignments`, `DELETE /assignments/:id`, `GET /assignments/:id/submissions`, `PUT /submissions/:id/grade` — same idea, full oversight

**`/teacher/*`** (TEACHER — scoped to `req.user.userId` for meetings/assignments they own)
- `GET /stats`
- `GET /meetings`, `POST /meetings`, `PUT /meetings/:id`, `DELETE /meetings/:id` — only their own
- `GET /assignments`, `POST /assignments`, `DELETE /assignments/:id`, `GET /assignments/:id/submissions`, `PUT /submissions/:id/grade` — only their own

**`/student/*`** (STUDENT — scoped to `req.user.schoolId` for visibility, `req.user.userId` for their own work)
- `GET /stats`
- `GET /meetings` — every meeting in their school
- `GET /assignments` — every assignment in their school, annotated with `mySubmission`
- `POST /assignments/:id/submit`, `GET /submissions`

**`/superadmin/*`** (SUPER_ADMIN — platform-wide, no schoolId scoping)
- `GET /stats` — totals + `roleCounts` + `pendingRequests`
- `GET /schools`, `GET /schools/:id`, `POST /schools`, `PUT /schools/:id`, `DELETE /schools/:id`
- `GET /subscriptions`, `POST /subscriptions`, `PUT /subscriptions/:id`, `DELETE /subscriptions/:id`
- `GET /users?role=&schoolId=` — every user, any school
- `GET /registration-requests?status=`, `PUT /registration-requests/:id/approve`, `PUT /registration-requests/:id/reject`

---

## 7. Frontend conventions (read before adding a new page)

- **Dashboards are NOT built with Tailwind utility classes.** They use a shared component kit (`DashboardShell` + `Widgets.jsx`) with inline `style={{}}` objects, hardcoded to the brand hex values (`#3525cd` primary, `#39b8fd` secondary, `#f8f9ff` background, `#0b1c30` text, `#777587` muted text, `#e5eeff` borders). This was a deliberate choice to match the pre-existing `AdminDashboard.jsx`/`LoginPage.jsx` style rather than introduce a second design system. **Stick to this pattern for new dashboard UI** — don't suddenly switch to Tailwind classes for one new tab, it'll look inconsistent.
- **Public marketing pages** (`home`, `about`, `contact`) and **auth pages** (`login`, `register`) *do* use Tailwind + the custom theme classes (`font-headline`, `text-on-surface`, `.btn-primary`, `.form-input`, etc., defined in `tailwind.config.js` / `index.css`). Don't mix the two systems within one page.
- **Every dashboard follows the same shape**: a `NAV_ITEMS` array → `DashboardShell` → tab content gated by `activeTab === 'x'` → a single `load(tab, ...)` callback that fetches only what the active tab needs. Follow this when adding a tab instead of inventing a new pattern.
- **Modals** use the shared `<Modal>` from `Widgets.jsx`, controlled by either a boolean (`showXModal`) or an object-or-null state (e.g. `userModal = { mode: 'create'|'edit', data }`) when the modal needs to handle two cases.
- Material Symbols icons: just `<span className="material-symbols-outlined">icon_name</span>` — the font is loaded globally in `index.html`, no import needed.

### 7a. Landing-page motion ( `components/effects/` )

Three small components, adapted from **React Bits** (reactbits.dev — an open-source, copy-into-your-repo component collection, not an npm library) to fit this project's design tokens and to drop their heavier dependencies (ScrollTrigger, `@gsap/react`, WebGL/`ogl`) where a lighter approach was just as good:

- **`SplitText.jsx`** — word-by-word stagger reveal using `gsap`. The authentic React Bits version uses GSAP's ScrollTrigger to fire on scroll; this one is deliberately simplified to fire on mount instead, since its only current use (`HeroSection`'s headline) is always above the fold — no need for scroll-trigger machinery there. If you reuse this further down a page, you'd want to either add ScrollTrigger back or accept it animating off-screen.
- **`CountUp.jsx`** — spring-based count-up number, ported close to verbatim from React Bits, using `motion` (`useInView` + `useMotionValue` + `useSpring`). Used in `StatsSection`.
- **`SpotlightCard.jsx`** — zero-dependency mouse-tracking hover glow, ported close to verbatim from React Bits but restyled onto this project's existing `.card` class instead of React Bits' own dark-neutral default. Used in `FeaturesSection`.

**Deliberate choice — no WebGL background.** React Bits also has an `Aurora`/`SoftAurora` shader background (via `ogl`) that would have been the obvious pick for the hero. It was skipped in favor of animating the *existing* `.blob` divs (see `blobDrift` keyframe in `index.css`) with plain CSS instead — same "glowing premium gradient" feel, none of the WebGL context-loss/driver-quirk/mobile-performance risk. Revisit this trade-off if you want a flashier hero and are OK with the added fragility.

**Reduced motion:** `index.css` has a global `prefers-reduced-motion: reduce` block that collapses all CSS animations/transitions to ~0, and both `SplitText` and `CountUp` check `window.matchMedia('(prefers-reduced-motion: reduce)')` directly and skip straight to the end state. Keep that pattern for any future animated component.

**"Less is more"** is React Bits' own stated philosophy, and it's followed here on purpose: exactly 3 effects, each used in exactly one place, not stacked together. Resist the urge to sprinkle these (or the rest of the 80+ React Bits catalog) across every section — that's what tips a site from "premium" into "trying too hard."

---

## 8. Things that are NOT bugs (intentional/pre-existing quirks)

- `midddleware/` directory and `authmiddlerware.js` filename are misspelled — left as-is everywhere to avoid a churn-y rename across every route file.
- `mongoose` and `pg` are in `backend/package.json` but unused (the app talks to Postgres exclusively through Prisma). `multer` is also installed but not yet wired up — see §9.
- `config/db.js` is dead code (a raw `pg` Pool), kept in case raw SQL is ever needed outside Prisma. It was previously CommonJS in an ESM project (would have crashed if imported) — fixed to ESM, but still unused.
- `server.js` didn't load `.env` at all until this was fixed (only `prisma.config.ts` loaded it, for CLI commands). `import 'dotenv/config'` is now the very first line of `server.js` — keep it there.

---

## 9. Known gaps / next priorities

Roughly in the order they'd bite a real user:

1. **File uploads are just URLs.** Assignment submissions and assignment attachments are plain text URL fields — there's no actual upload endpoint. `multer` is installed but unused. This is the biggest realism gap.
2. **RegistrationRequest has no migration yet.** The model is in `schema.prisma` but `npx prisma migrate dev --name add_registration_requests` has not been run (this sandbox can't reach the Prisma engine binary host to test it). **Run that migration before using the registration feature.**
3. **No bulk user import** (CSV) — School Admin adds teachers/students one at a time.
4. **No password reset / forgot-password flow.**
5. **No pagination/search** on long tables (All Users, Staff & Students) — fine at demo scale, will degrade with real data.
6. **No refresh tokens** — see §5.
7. **SMTP must be configured for registration emails to actually send** — see `backend/.env.example`. Without it, the app still works, it just logs emails to the console instead of sending them.
8. **Subscriptions are admin-entered records, not tied to real billing** — no payment processor integration.
9. **Meetings rely on an external link** (Jitsi/Zoom/etc.), not embedded video.

---

## 10. Running it locally

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev          # picks up any pending migrations, including registration requests
npm run seed                    # creates demo data, password "password123" for every account below
npm run dev                     # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev                      # http://localhost:5173 (Vite default)
```

Seeded accounts (all password `password123`):
| Role | Email |
|---|---|
| Super Admin | `superadmin@zibidubi.com` |
| School Admin | `admin@sunriseschool.in` |
| Teacher | `teacher@sunriseschool.in` |
| Student | `student@sunriseschool.in` |

See `backend/.env.example` for every environment variable the app reads, including SMTP setup notes for Gmail/Outlook.
