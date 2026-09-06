# Campus Accessibility Issue Reporter — Phase 1: Architecture & Development Plan

## 1. Technology Stack (Final)

The requested stack (React + Node/Express + PostgreSQL + JWT) is a good fit for this assignment — simple, well-documented, and every free-tier cloud service supports it well. No changes proposed except pinning down specifics:

| Layer | Technology | Why |
|---|---|---|
| Frontend | React.js (Vite) + plain CSS / CSS Modules | Fast dev server, no heavy framework overhead, easy to explain in a viva |
| Backend | Node.js + Express.js | Minimal boilerplate, huge ecosystem, easy to deploy |
| Database | PostgreSQL (cloud-hosted) | Free managed tiers widely available (Neon, Supabase, Render), strong relational integrity for this schema (foreign keys, constraints) |
| ORM/Query layer | `pg` (node-postgres) with raw parameterized SQL, or Prisma | Raw SQL keeps things transparent for a college evaluator; Prisma is optional if you want auto-migrations — **recommendation: raw `pg` + a `db/schema.sql` file**, simplest to explain |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless, standard, easy to demo with Postman |
| Image storage | Cloudinary (free tier) OR Supabase Storage | Dedicated object storage, returns a public URL, avoids bloating the DB |
| Backend hosting | Render.com (free/hobby tier) | One-click Node deploy from GitHub, free HTTPS, environment variable UI |
| Frontend hosting | Vercel or Netlify | Free static hosting, auto-deploys from GitHub, instant public URL |
| Database hosting | Neon (serverless Postgres) or Render Postgres | Free tier, connection string ready in seconds |
| API testing docs | Postman collection + Markdown API doc | Required deliverable |

No microservices, no Kubernetes, no map SDK dependency by default (lat/long fields are stored but the UI does not require a map library to function).

---

## 2. System Architecture

```
                        ┌─────────────────────────┐
                        │        Students /        │
                        │      Administrators       │
                        │   (browser, any device)   │
                        └────────────┬──────────────┘
                                     │ HTTPS
                                     ▼
                    ┌────────────────────────────────┐
                    │   Cloud-hosted Frontend (SPA)    │
                    │   React app on Vercel/Netlify    │
                    │   Static build served via CDN    │
                    └────────────┬───────────────────┘
                                 │ REST API calls (HTTPS, JSON, JWT in header)
                                 ▼
                    ┌────────────────────────────────┐
                    │   Cloud-hosted Backend (API)      │
                    │   Node.js + Express on Render      │
                    │   - Auth (JWT issue/verify)        │
                    │   - Business logic / validation    │
                    │   - Role-based authorization        │
                    └───────┬───────────────────┬────────┘
                            │                   │
              SQL (pooled, │                   │ Upload API
              TLS)         ▼                   ▼
                ┌────────────────────┐  ┌────────────────────────┐
                │ Cloud PostgreSQL     │  │ Cloud Object Storage    │
                │ (Neon / Render PG)   │  │ (Cloudinary / Supabase) │
                │ Users, Issues,       │  │ stores actual image     │
                │ IssueUpdates tables  │  │ files, returns a URL    │
                └────────────────────┘  └────────────────────────┘
```

**Why each piece is cloud-hosted:**
- **Database in the cloud** — accessible from anywhere (backend can run on any machine/region), automatic backups, no local disk-dependency, matches the "centralized system, multiple access points" requirement.
- **Backend in the cloud** — gives a single stable public API endpoint that any frontend instance (or Postman, or a future mobile app) can call; horizontally scalable later.
- **Image storage separated from DB** — databases are inefficient at storing large binary blobs (slows queries/backups); object storage is purpose-built for files and serves them directly via CDN URLs, and the DB only stores a lightweight string (`image_url`).
- **Multiple users, same data** — every client (student's laptop, admin's desktop, another student's phone) talks to the *same* backend and *same* database instance over the internet, so all changes are immediately visible to everyone with the right permissions — this is the core "cloud computing" concept the assignment wants demonstrated.
- **Authentication** — JWT issued at login, stored client-side (localStorage or memory), sent as `Authorization: Bearer <token>` on every protected request; backend verifies signature + role on each call, no server-side session storage needed (stateless = scalable).
- **Scaling story (for your report)** — Render/Vercel can scale horizontally by adding instances behind a load balancer; Postgres can move to a larger tier or read replicas; object storage scales natively. Stateless JWT auth means any backend instance can serve any request.
- **Basic security** — HTTPS everywhere, bcrypt password hashing, parameterized SQL (no injection), environment variables for all secrets, CORS restricted to the deployed frontend origin, role checks on every admin route.

---

## 3. Database Schema

Slightly normalized from your draft — categories and statuses are constrained via SQL `CHECK` constraints (simpler than extra lookup tables for a college project, but still enforces data integrity).

### `users`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| role | VARCHAR(20) | NOT NULL, CHECK (role IN ('student','admin')), DEFAULT 'student' |
| created_at | TIMESTAMP | DEFAULT NOW() |

### `accessibility_issues`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | NOT NULL |
| category | VARCHAR(30) | CHECK (category IN ('Wheelchair Ramp','Elevator/Lift','Accessible Parking','Pathway','Handrail','Entrance','Signage','Restroom','Other')) |
| location_building | VARCHAR(100) | |
| location_area | VARCHAR(100) | |
| location_description | VARCHAR(255) | |
| latitude | DECIMAL(9,6) | nullable |
| longitude | DECIMAL(9,6) | nullable |
| priority | VARCHAR(10) | CHECK (priority IN ('Low','Medium','High','Critical')), DEFAULT 'Medium' |
| status | VARCHAR(20) | CHECK (status IN ('Reported','Under Review','Assigned','In Progress','Resolved','Closed')), DEFAULT 'Reported' |
| assigned_to | VARCHAR(100) | nullable — name/id of maintenance staff |
| image_url | VARCHAR(500) | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

*(Note: I split your single `location` field into `location_building` / `location_area` / `location_description` per requirement §15, but a single `location VARCHAR(255)` also works fine if you want to keep it simpler — your call.)*

### `issue_updates`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| issue_id | INTEGER | NOT NULL, FK → accessibility_issues(id) ON DELETE CASCADE |
| updated_by | INTEGER | NOT NULL, FK → users(id) |
| previous_status | VARCHAR(20) | |
| new_status | VARCHAR(20) | NOT NULL |
| comment | TEXT | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

**Relationships:** `users (1) → (many) accessibility_issues`, `accessibility_issues (1) → (many) issue_updates`, `users (1) → (many) issue_updates` (as the admin who made the update). This gives you a clean **audit trail** — every status change is logged, which doubles as your "resolution/update history" feature.

ER diagram, full `CREATE TABLE` SQL, and seed data will be delivered in Phase 2.

---

## 4. REST API List

**Auth**
- `POST /api/auth/register` — public
- `POST /api/auth/login` — public

**Issues (student-facing, scoped to own data + role checks)**
- `POST /api/issues` — auth required (student)
- `GET /api/issues` — auth required (returns only the logged-in user's issues)
- `GET /api/issues/:id` — auth required (owner or admin)
- `PUT /api/issues/:id` — auth required (owner only, and only while status = 'Reported')
- `DELETE /api/issues/:id` — auth required (owner only, and only while status = 'Reported')

**Issue updates / history**
- `POST /api/issues/:id/updates` — auth required (admin only)
- `GET /api/issues/:id/updates` — auth required (owner or admin)

**Admin**
- `GET /api/admin/issues` — admin only, supports `?status=&priority=&category=&search=`
- `PUT /api/admin/issues/:id/status` — admin only
- `PUT /api/admin/issues/:id/priority` — admin only
- `PUT /api/admin/issues/:id/assign` — admin only
- `DELETE /api/admin/issues/:id` — admin only

**Dashboard**
- `GET /api/dashboard` — student's own stats
- `GET /api/admin/dashboard` — admin-wide stats

**Uploads**
- `POST /api/uploads/image` — auth required, returns `{ image_url }` from cloud storage

Full request/response bodies + status codes will be delivered as part of the API documentation deliverable (Phase 3/11).

---

## 5. Frontend Pages/Components

```
Landing Page
Register
Login
Student Dashboard        (stats + recent reports + "Report an Issue" button)
Report Accessibility Issue (form + image upload)
My Reports                (list + search/filter)
Issue Details             (student view, incl. status history)
Edit Issue                (only while status = Reported)
Admin Dashboard           (stats + issues table + filters)
All Issues                (admin, full table, filter/search)
Admin Issue Details       (status/priority/assign/notes controls)
Profile/Account Page

Shared components:
  Navbar, ProtectedRoute (role-aware), StatusBadge, PriorityBadge,
  IssueCard, IssueTable, FilterBar, ImageUploader, LoadingSpinner, Toast
```

---

## 6. Project Folder Structure

```
campus-accessibility-reporter/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/          (AuthContext for JWT/user state)
│   │   ├── api/               (axios instance + API call functions)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example           (VITE_API_BASE_URL)
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/            (auth.js, issues.js, admin.js, uploads.js)
│   │   ├── controllers/
│   │   ├── middleware/        (auth.js, roleCheck.js, validate.js)
│   │   ├── db/                (pool.js, queries)
│   │   ├── config/
│   │   └── server.js
│   ├── .env.example           (DATABASE_URL, JWT_SECRET, CLOUDINARY_*, PORT)
│   └── package.json
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/
│   ├── api-documentation.md
│   ├── architecture-diagram.png
│   ├── er-diagram.png
│   ├── testing-table.md
│   └── postman_collection.json
└── README.md
```

---

## 7. How Cloud Services Are Used (summary for your report)

| Concept | How this project demonstrates it |
|---|---|
| Cloud database | Postgres hosted on Neon/Render — reachable from anywhere via connection string |
| Cloud compute (backend) | Express API deployed on Render, public URL, auto-restarts on crash |
| Cloud storage | Cloudinary stores uploaded images, DB stores only the URL |
| Centralized multi-access | Any student/admin, on any device/network, hits the same API + DB |
| Scalability | Stateless JWT auth + managed DB/hosting tiers that can scale up |
| Security in the cloud | HTTPS, env-var secrets, role-based route protection |

---

## 8. Requirement-by-Requirement Coverage

| Assignment requirement | How it's satisfied |
|---|---|
| Cloud-based web app | React frontend + Express backend, both deployed publicly |
| Real-world problem | Campus accessibility reporting (ramps, elevators, pathways etc.) |
| Complete CRUD | Issues: Create/Read/Update/Delete; Users: Create(register)/Read; Updates: Create/Read |
| Cloud-hosted database | PostgreSQL on Neon/Render |
| RESTful APIs | Full endpoint list above, proper verbs + status codes |
| Cloud deployment | Frontend on Vercel, backend on Render, DB on Neon |
| Cloud-computing concepts | Centralized access, separated storage, stateless auth, scalability discussion |
| Documentation set | Schema, ER diagram, API docs, Postman collection, architecture diagram — all planned as deliverables |

---

## 9. Development Roadmap (Phases)

1. **Architecture + requirements** — this document ✅
2. **Database** — `schema.sql`, ER diagram, seed data, local + cloud DB setup
3. **Backend + REST APIs** — Express server, routes, controllers, connect to cloud DB
4. **Authentication** — register/login, bcrypt, JWT issue/verify, role middleware
5. **Frontend** — pages/components, routing, forms (no backend wiring yet)
6. **Frontend/backend integration** — axios calls, auth context, protected routes
7. **Image upload** — Cloudinary integration, upload endpoint, form wiring
8. **Admin dashboard** — stats endpoint, table, filters, status/priority/assign controls
9. **Testing** — manual test table + basic automated checks (Postman/curl)
10. **Cloud deployment** — step-by-step: DB → backend → frontend → storage, verify public URL
11. **Documentation** — API docs, architecture diagram, ER diagram, full report content
12. **Demo preparation** — script + rehearsal checklist

Each phase will end with: what was built, files touched, how to run/test it, expected result, and common errors/fixes — before moving to the next phase.

---

### Next step
Say **"proceed to Phase 2"** when ready, and I'll deliver the full database schema (SQL scripts, ER diagram, sample data) and instructions for setting up the cloud Postgres instance.
