# Inter-Department Collaboration Hub — Walkthrough

## What Was Built

A complete full-stack application with 3 separate codebases:

| Portal | Stack | Port |
|---|---|---|
| Backend API | Node.js + Express + MongoDB + Socket.io | 5000 |
| Student Portal | React 18 + Vite + Tailwind CSS | 5173 |
| Admin Portal | Angular 17 standalone + Angular Material | 4200 |

---

## File Structure Generated

```
ich/
├── backend/
│   ├── models/         User, CollabRequest, Message
│   ├── routes/         auth, request, profile, message, wall, admin
│   ├── middleware/     auth.middleware.js, role.middleware.js
│   ├── socket/         socket.js  (Socket.io room management)
│   ├── server.js
│   └── .env
├── student-portal/
│   └── src/
│       ├── context/    AuthContext.jsx (session restore, login/register/logout)
│       ├── pages/      Login, Browse, PostRequest, ProjectBoard,
│       │               ProjectDetail, Profile, Wall, Bookmarks
│       └── components/ Navbar, RequestCard, SkillTag, MilestoneItem,
│                       TeamChat, ProfileCard
└── admin-portal/
    └── src/app/
        ├── services/   auth, project, user, announcement
        ├── guards/     auth.guard.ts, role.guard.ts (standalone inject())
        ├── pipes/      date-ago.pipe.ts
        └── pages/      login, dashboard, users, announcements
```

---

## Verification Results

- ✅ **Backend** — all 14 JS files pass `node --check` syntax validation
- ✅ **Student Portal** — `vite build` succeeds: **127 modules, 0 errors** (fixed a Tailwind `@apply` circular reference bug)
- ✅ **Angular Portal** — packages installed (855 packages), angular.json and tsconfig.json valid

---

## How to Run

### 1. Backend
```bash
cd backend
# Make sure MongoDB is running
npm run dev      # nodemon server.js → http://localhost:5000
```

### 2. Student Portal (React)
```bash
cd student-portal
npm run dev      # → http://localhost:5173
```

### 3. Admin Portal (Angular)
```bash
cd admin-portal
npx ng serve     # → http://localhost:4200
```

---

## Key Features Implemented

### Backend
- JWT stored in **HTTP-only cookies** (secure, no XSS risk)
- **CORS** configured for both ports 5173 and 4200 with `credentials: true`
- **Socket.io** rooms per `projectId` — messages saved to MongoDB AND broadcast to room
- All routes have `try/catch` with descriptive error messages
- Passwords never returned (Mongoose `.select('-password')`)
- [requireRole('admin')](file:///e:/Inter%20dept%20proj/ich/backend/middleware/role.middleware.js#1-12) middleware guards all `/api/admin/*` routes

### React Student Portal
- **AuthContext** restores session on reload via `GET /api/auth/me`
- **Smart matching** on Browse page — skill-overlap score badge on matched cards
- **Kanban board** showing user's own projects by status
- **ProjectDetail** is role-gated: poster sees interested users + accept/reject, team members see milestones + chat
- **Milestone progress bar** = [(done / total) × 100%](file:///e:/Inter%20dept%20proj/ich/student-portal/src/App.jsx#49-58)
- **TeamChat** uses Socket.io client, auto-scrolls, shows chat bubbles (own right, others left)
- **Skill endorsement** with count display on Profile page
- **Bookmark toggle** persisted to DB per user

### Angular Admin Portal  
- All services use Angular **Signals** for reactive auth state
- All services use `withCredentials: true` on every HTTP call
- Route guards use `inject()` (standalone pattern, no constructor injection)
- Dashboard uses **RxJS `fromEvent` + `debounceTime(400)` + `switchMap`** for live search
- [DateAgoPipe](file:///e:/Inter%20dept%20proj/ich/admin-portal/src/app/pipes/date-ago.pipe.ts#3-37) is a standalone pure pipe used across all tables
- Reactive forms with `minLength` validators and inline `*ngIf` error messages

---

## Demo Flow (from your checklist)

| Step | Feature |
|---|---|
| Register student A (CSE, React/Node.js) | `/api/auth/register` → JWT cookie |
| Register student B (ECE, IoT) → post request | `POST /api/requests` |
| Student A browses → request appears first | Skill-match score sorts React skill |
| Student A clicks "I'm Interested" | `POST /api/requests/:id/interest` |
| Student B accepts student A | `PUT /api/requests/:id/accept/:userId` |
| Team chat works live | Socket.io rooms — both see messages instantly |
| Add milestones → mark done | Progress bar shows 50% with 1/2 done |
| Publish to Wall | `PUT /api/wall/:id/publish` → `isPublished: true` |
| Endorse skill on profile | `POST /api/profile/:id/endorse` increments count |
| Admin login → dashboard search | RxJS live filter with 400ms debounce |

---

## Important [.env](file:///e:/Inter%20dept%20proj/ich/backend/.env) Values to Set

```env
MONGO_URI=mongodb://localhost:27017/ich
JWT_SECRET=<your-strong-secret>       # CHANGE THIS
# TODO: Add Cloudinary key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

> **First Admin:** Register normally via the student portal, then use MongoDB Compass or shell to set `role: "admin"` on your account, then log in via the Angular portal.
