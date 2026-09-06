# Campus Accessibility Issue Reporter — Project Report

## Title
**Campus Accessibility Issue Reporter: A Cloud-Based Platform for Reporting and Resolving Campus Accessibility Barriers**

## Abstract
Physical accessibility barriers on college campuses — broken ramps, non-functional elevators, blocked pathways, missing signage — disproportionately affect students and staff with mobility, visual, or other disabilities, yet there is often no structured way to report or track them. This project presents a cloud-based web application that lets any member of the campus community report an accessibility issue in under a minute, complete with category, location, and photo evidence, and lets a maintenance/administrative team triage, prioritize, assign, and resolve those reports through a dedicated dashboard. The system is built on a three-tier cloud architecture — a React frontend, a Node.js/Express REST API, and a managed PostgreSQL database, with images stored separately in cloud object storage — demonstrating core cloud-computing principles including centralized multi-user access, separated storage concerns, stateless authentication, and horizontal scalability, all while remaining simple enough to build, understand, and demonstrate within the scope of a college assignment.

## Problem Statement
Accessibility infrastructure on campus (ramps, elevators, handrails, signage, parking) degrades over time, but there is typically no formal, trackable channel for reporting these issues beyond informal complaints to front-desk staff or word of mouth. This leads to slow response times, no accountability trail, and no way for the reporter to know whether anything was done. Students and staff with disabilities are the most affected by these gaps, yet have the least visibility into whether their concerns are being addressed.

## Objectives
1. Provide a simple, low-friction way for any student or staff member to report an accessibility issue with details, location, and photo evidence.
2. Give administrators a centralized dashboard to view, prioritize, assign, and resolve reported issues.
3. Maintain a transparent, auditable history of every status change so reporters can track progress.
4. Demonstrate a complete cloud-computing architecture: cloud-hosted database, cloud-hosted backend, cloud object storage, and RESTful communication between all tiers.
5. Build the system using widely-available free-tier cloud services so it is realistically deployable by a student without institutional infrastructure.

## Existing System
Currently, accessibility issues on most campuses are reported informally — a phone call to facilities management, an email, or a note left at a help desk. This has several shortcomings:
- No structured record of what was reported, when, or by whom.
- No way for the reporter to check status without following up manually.
- No prioritization mechanism — urgent issues (e.g., a broken elevator in a multi-story building) aren't distinguished from minor ones.
- No historical data for facilities teams to identify recurring problem areas.

## Proposed System
The proposed system is a role-based web application with two user types — **Reporters** (students/staff) and **Administrators** (maintenance staff) — connected through a REST API to a shared cloud database. Reporters submit structured issue reports (category, location, description, optional photo) and can track their status through a defined lifecycle (Reported → Under Review → Assigned → In Progress → Resolved → Closed). Administrators see all reports in a filterable dashboard, can change status/priority/assignment, and leave resolution notes — each of which is logged to a permanent, reporter-visible update history.

## Functional Requirements
- User registration and login (JWT-based authentication)
- Create, view, update, and delete accessibility issue reports (with ownership and status-based restrictions)
- Upload a photo as evidence, stored in cloud object storage
- View issue status and a full history of status changes
- Admin: view all issues, filter/search by status, priority, and category
- Admin: update status, priority, and assignment; add resolution notes
- Admin: view aggregate dashboard statistics
- Role-based access control preventing students from performing admin actions

## Non-Functional Requirements
- **Security:** password hashing (bcrypt), JWT authentication, role-based authorization, parameterized SQL queries, environment-variable secrets, CORS restricted to the deployed frontend.
- **Scalability:** stateless authentication allows the backend to scale horizontally; database and storage are managed cloud services that can scale independently.
- **Usability:** clean, responsive UI usable on both desktop and mobile, with accessible design (visible focus states, icon+text status indicators, adequate tap targets) — fitting given the application's subject matter.
- **Reliability:** centralized cloud database ensures all users see consistent, up-to-date data regardless of location or device.
- **Maintainability:** clear separation of frontend/backend/database, RESTful API design, and commented code where logic is non-obvious.

## Technology Stack
| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon, cloud-hosted) |
| Authentication | JWT + bcrypt |
| Image storage | Cloudinary (cloud object storage) |
| Backend hosting | Render |
| Frontend hosting | Vercel |

## System Architecture
The system follows a three-tier cloud architecture:
```
User → Cloud-hosted Frontend (React, Vercel) → REST API (Express, Render) → Cloud Database (PostgreSQL, Neon)
                                                        ↓
                                              Cloud Object Storage (Cloudinary)
```
The frontend never talks to the database directly — every operation goes through the authenticated REST API, which enforces validation and access control before touching the database. Images are uploaded straight from the backend to Cloudinary; only the resulting URL is persisted in PostgreSQL, keeping the database lightweight and fast. Because both the API and database are hosted centrally in the cloud, any user — student or administrator — sees the same live data regardless of their location or device, which is the central cloud-computing concept this project demonstrates.

## Database Design
Three normalized tables:
- **users** — account records with a `role` column (`student`/`admin`) enforced via a `CHECK` constraint.
- **accessibility_issues** — the core issue records, with `CHECK` constraints on `category`, `priority`, and `status` to guarantee only valid enum values are ever stored, and foreign key `user_id → users(id)`.
- **issue_updates** — an append-only audit trail of every status change, linked to both the issue and the admin who made the change, giving reporters full transparency into their report's history.

Referential integrity is enforced with foreign keys (`ON DELETE CASCADE` from users/issues down to their dependent rows), and an auto-updating `updated_at` trigger keeps issue records honest without relying on application code to remember to set it. Full SQL is in `database/schema.sql`; sample data in `database/seed.sql`.

## ER Diagram Explanation
The ER diagram shows three entities: **USERS**, **ACCESSIBILITY_ISSUES**, and **ISSUE_UPDATES**.
- A **user** can report **many** accessibility issues (one-to-many, `reports`).
- A **user** (specifically an admin) can make **many** issue updates (one-to-many, `makes`).
- An **accessibility issue** can have **many** issue updates over its lifecycle (one-to-many, `has`).

This design normalizes cleanly to third normal form: no repeating groups, no partial dependencies, and the audit trail (`issue_updates`) is kept separate from the current-state table (`accessibility_issues`) rather than overloading a single table with both "current state" and "history" responsibilities.

## API Documentation
See `docs/api-documentation.md` for the complete endpoint-by-endpoint reference (method, purpose, auth requirement, request/response shapes, status codes), and `docs/postman_collection.json` for an importable Postman collection covering every endpoint. In summary, the API exposes 17 endpoints across five resource groups: Authentication, Issues, Issue Updates, Uploads, and Admin — all following REST conventions (proper HTTP verbs, resource-oriented URLs, consistent JSON response shape, and standard status codes).

## Cloud Services
| Service | Role |
|---|---|
| **Neon (PostgreSQL)** | Cloud-hosted relational database — single source of truth accessible from anywhere |
| **Render** | Hosts the Express backend as a public web service |
| **Vercel** | Hosts the built React frontend as a static site with global CDN delivery |
| **Cloudinary** | Cloud object storage for uploaded photo evidence |

Using managed cloud services for each tier means the project needs no server administration, comes with automatic HTTPS, and can scale each layer independently — a database upgrade, for instance, requires no changes to the backend or frontend code.

## Implementation
The system was built in 12 incremental phases: architecture planning, database schema, backend REST API, authentication, frontend UI (initially on mock data), frontend-backend integration, image upload, admin functionality, testing, cloud deployment, documentation, and demo preparation. This phased approach meant every layer was independently verifiable before the next was built on top of it — for example, the REST API was fully tested with curl before any frontend code was written, isolating backend bugs from frontend integration bugs.

## Testing
37 test cases were defined covering registration, login (valid/invalid), full CRUD on issues, ownership and role-based access control, admin operations (status/priority/assignment changes), image upload (valid/oversized/wrong-type/unauthenticated), database connectivity, and API error handling. An automated bash/curl test script (`backend/tests/api-test-script.sh`) exercises 30 of these cases end-to-end against a live server and database. See `docs/testing-table.md` for the full table and results.

## Results
The completed system successfully demonstrates: a working authentication flow with role-based access control; full CRUD operations on accessibility issue reports, correctly scoped by ownership; a functioning cloud image-upload pipeline; a complete admin workflow from triage to resolution; and a permanent, student-visible audit trail of every status change — all running against a live, publicly deployed cloud database and API.

## Advantages
- Centralizes accessibility reporting into one auditable system instead of informal, untracked complaints.
- Gives reporters visibility into progress via the status timeline and update history.
- Gives administrators a prioritization tool (Critical/High/Medium/Low) so urgent barriers get attention first.
- Cloud architecture means the system is accessible from any device, anywhere, with no local installation.
- Clean separation of concerns (frontend/backend/database/storage) makes the system easy to maintain and extend.

## Limitations
- No real-time push notifications — reporters must check the app to see status updates rather than receiving an alert.
- No map-based location picker (by design, to keep deployment simple) — location is captured as structured text fields instead.
- Free-tier hosting (Render) has a cold-start delay after inactivity, which would need a paid tier to eliminate in a production deployment.
- Admin accounts must currently be promoted manually via direct database access rather than through an in-app "manage admins" interface.

## Future Enhancements
- Email or push notifications when a reporter's issue status changes.
- An interactive map view for issue locations, once a lightweight mapping library can be integrated without complicating deployment.
- An in-app interface for promoting/demoting admin accounts.
- Analytics dashboard showing trends over time (e.g., which buildings generate the most reports).
- A mobile app wrapper using the same REST API.

## Conclusion
This project demonstrates a complete, working cloud-based application that addresses a genuine real-world problem — the lack of a structured channel for reporting campus accessibility barriers — while satisfying every technical requirement of the assignment: full CRUD functionality, a cloud-hosted relational database, a RESTful API with role-based authentication and authorization, cloud object storage separated from the database, and a fully cloud-deployed, publicly accessible final product. Beyond meeting the assignment brief, the system is genuinely usable: a student can report a broken ramp in under a minute, and see, days later, exactly what was done about it.
