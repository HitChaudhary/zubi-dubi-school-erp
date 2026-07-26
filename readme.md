# Zubi Dubi — Multi-Tenant School Management Platform

> **"Your school, fully digital"**  
> A complete, multi-tenant digital school ecosystem built for administrators, teachers, students, and platform super-admins.

---

## 📋 Table of Contents
- [Zubi Dubi — Multi-Tenant School Management Platform](#zubi-dubi--multi-tenant-school-management-platform)
  - [📋 Table of Contents](#-table-of-contents)
  - [1. What is Zubi Dubi?](#1-what-is-zubi-dubi)
    - [Core Features](#core-features)
  - [2. Tech Stack](#2-tech-stack)
  - [3. Repository Layout](#3-repository-layout)
  - [4. Data Model \& Multi-Tenancy](#4-data-model--multi-tenancy)
    - [Enums](#enums)
    - [Models](#models)
  - [5. Authentication \& Security](#5-authentication--security)
  - [6. API Reference](#6-api-reference)
    - [Public / Unauthenticated](#public--unauthenticated)
    - [School Admin (`/api/admin/*`)](#school-admin-apiadmin)
    - [Teacher (`/api/teacher/*`)](#teacher-apiteacher)
    - [Student (`/api/student/*`)](#student-apistudent)
    - [Super Admin (`/api/superadmin/*`)](#super-admin-apisuperadmin)
  - [7. Frontend Conventions \& UI](#7-frontend-conventions--ui)
  - [8. Local Development Setup](#8-local-development-setup)
    - [Prerequisite Steps](#prerequisite-steps)

---

## 1. What is Zubi Dubi?

**Zubi Dubi** is a multi-tenant school management platform. Each **School** acts as an isolated tenant containing **Teachers** and **Students**, governed by a **School Admin**. A **Super Admin** oversees all platform schools, approves new registration requests, and manages subscription billing lifecycles.

### Core Features
- 🎥 **Live Class Meetings:** Direct integration with external video providers (Jitsi, Zoom, Google Meet).
- 📝 **Assignments Engine:** Create assignments, submit work, and record grades with student feedback loops.
- 🏫 **Self-Service Onboarding:** Automated school registration request flow with Super Admin verification.
- 🔐 **Role-Based Isolation:** Granular RBAC ensuring tenant data remains strictly compartmentalized.

---

## 2. Tech Stack

| Layer              | Technology                                                       |
| ------------------ | ---------------------------------------------------------------- |
| **Backend**        | Node.js (ESM, `"type": "module"`), Express 5                     |
| **Database & ORM** | Prisma 6 + PostgreSQL                                            |
| **Authentication** | JWT (`jsonwebtoken`) + `bcrypt` password hashing                 |
| **Email Service**  | `nodemailer` over SMTP (graceful console logging fallback)       |
| **Frontend**       | React 18 + Vite, React Router v6                                 |
| **Styling**        | Tailwind CSS (custom design tokens) + Inline Style Design System |
| **Animations**     | `gsap` (text reveals) & `motion` (springs/count-up counters)     |
| **Icons**          | Material Symbols Outlined (Google Fonts)                         |

---

## 3. Repository Layout

backend/
  server.js                  — Express app entry point & router mounting
  config/
    prisma.js                — Shared PrismaClient singleton
    db.js                    — Unused raw pg Pool (kept for raw SQL)
  midddleware/authmiddlerware.js — JWT authentication & role authorization guards
  controllers/               — Business logic per role (admin, teacher, student, superadmin, auth, registration)
  routes/                    — Route handlers mounted under /api/<role>
  utils/mailer.js            — SMTP email dispatch helper
  prisma/schema.prisma       — Data models and Prisma schema definitions
  prisma/migrations/         — Schema migration histories
  seed.js                    — Default database seeder script

frontend/
  src/
    App.jsx                  — Central routing matrix & ProtectedRoute gates
    pages/
      home, about, contact   — Marketing landing site
      login/LoginPage.jsx    — Authentication login portal
      register/              — Self-signup and request status checking pages
      admin/AdminDashboard.jsx        — School Admin portal
      teacher/TeacherDashboard.jsx    — Teacher management dashboard
      student/StudentDashboard.jsx    — Student portal
      superadmin/SuperAdminDashboard.jsx — Platform Super Admin dashboard
    components/
      common/                — ProtectedRoute, Navbar, Footer
      dashboard/             — DashboardShell, StatCard, Card, Widgets, Modals
      effects/               — SplitText, CountUp, SpotlightCard
    utils/
      api.js                  — Fetch wrapper handling authorization headers & 401 clearing
      auth.js                 — Session utilities & role home routing maps
    styles/index.css         — Custom CSS tokens & animation keyframes
  tailwind.config.js          — Custom color definitions & brand tokens

---

## 4. Data Model & Multi-Tenancy

### Enums
- **`Role`**: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`
- **`SubscriptionStatus`**: `ACTIVE`, `EXPIRED`, `CANCELLED`
- **`MeetingStatus`**: `SCHEDULED`, `ONGOING`, `ENDED`
- **`RequestStatus`**: `PENDING`, `APPROVED`, `REJECTED`

### Models
- **`School`**: `name`, `domain` (unique, optional) → Has many Users, Subscriptions, Meetings, Assignments.
- **`Subscription`**: Belongs to School; stores `planName`, `status`, `endDate`.
- **`User`**: `name`, `email` (unique), `password` (bcrypt hash), `role`, `schoolId` (nullable for SUPER_ADMIN).
- **`Meeting`**: `title`, `meetingLink`, `status`, `startTime`/`endTime`, belongs to School + host User.
- **`Assignment`**: `title`, `description`, `fileUrl`, `dueDate`, belongs to School + teacher User.
- **`Submission`**: `fileUrl`, `grade` (nullable string), belongs to Assignment + student User (`@@unique([assignmentId, studentId])`).
- **`RegistrationRequest`**: Stores `schoolName`, `adminEmail`, and approval status.

> 🔒 **Tenancy Rule:** Every school-scoped backend query **must filter by `schoolId` extracted directly from the verified JWT (`req.user.schoolId`)**. Never trust `schoolId` passed via client request bodies or parameters.

---

## 5. Authentication & Security

- **Tokens & Storage:** `POST /api/auth/login` returns a JWT signed with `{ userId, role, schoolId }`. The token and user profile are saved in `localStorage`.
- **Backend Middleware:** `authenticateJWT` decodes and verifies incoming tokens; `authorizeRoles('ROLE')` restricts route access.
- **Frontend Guarding:** `<ProtectedRoute allowedRoles={[...]}>` verifies permissions on route navigation. If access is restricted, users are redirected to their designated dashboard (`ROLE_HOME`).

---

## 6. API Reference

All endpoints are mounted under the `/api` prefix. Protected routes require `Authorization: Bearer <token>`.

### Public / Unauthenticated
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Verify token session
- `POST /api/register` — Submit new school onboarding request
- `GET /api/register/status?email=` — Check registration status

### School Admin (`/api/admin/*`)
- `GET /stats` — School dashboard metrics
- `GET /school`, `PUT /school` — School metadata & subscription status
- `GET/POST/PUT/DELETE /users` — Manage teachers and students
- `GET/POST/PUT/DELETE /meetings` — Full moderation of school meetings
- `GET/POST/DELETE /assignments`, `PUT /submissions/:id/grade` — Full assignment oversight

### Teacher (`/api/teacher/*`)
- `GET /stats` — Teacher dashboard metrics
- `GET/POST/PUT/DELETE /meetings` — Manage hosted meetings
- `GET/POST/DELETE /assignments`, `PUT /submissions/:id/grade` — Manage assignments and grade submissions

### Student (`/api/student/*`)
- `GET /stats` — Student stats
- `GET /meetings` — View upcoming school meetings
- `GET /assignments` — View assignments annotated with submission status
- `POST /assignments/:id/submit`, `GET /submissions` — Submit assignments & view grades

### Super Admin (`/api/superadmin/*`)
- `GET /stats` — Platform-wide metrics
- `GET/POST/PUT/DELETE /schools` — Manage schools
- `GET/POST/PUT/DELETE /subscriptions` — Manage platform plans
- `GET /users` — Query users across all schools
- `GET/PUT /registration-requests` — Approve or reject pending onboarding applications

---

## 7. Frontend Conventions & UI

- **Dashboard UI:** Built using a dedicated component kit (`DashboardShell` + `Widgets.jsx`) with inline styling using hardcoded brand palette values (`#3525cd` primary, `#39b8fd` secondary, `#f8f9ff` background).
- **Public & Auth Pages:** Built using Tailwind CSS with custom theme classes defined in `tailwind.config.js`.
- **UI Motion Effects:** Uses micro-interactions provided by `SplitText` (GSAP), `CountUp` (Motion spring), and `SpotlightCard` (interactive card highlights). Motion automatically disables when `prefers-reduced-motion` is detected.

---

## 8. Local Development Setup

### Prerequisite Steps

1. **Clone the repository and set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
  

  Start backend ---------

   cd backend
npm install
npx prisma generate
npx prisma migrate dev      # Applies schema migrations
npm run seed                # Seeds initial database accounts
npm run dev                 # Starts backend on http://localhost:5000




start frontend ------

cd frontend
npm install
npm run dev                 # Starts Vite dev server on http://localhost:5173