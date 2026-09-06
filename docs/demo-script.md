# Demonstration Script — Campus Accessibility Issue Reporter

Target: 5–7 minutes. Timings below are guides, not hard stops — adjust pacing to your evaluator's questions.

---

## Before you walk in (do this the night before, not 5 minutes before)

- [ ] Confirm the live URLs both load: frontend (Vercel) and `/api/health` on the backend (Render).
- [ ] **Hit the Render health-check URL ~1 minute before your slot** — free-tier cold start takes 30–60s; you don't want that delay eating into your live demo.
- [ ] Have one admin account ready (promoted via SQL beforehand — don't do this live, it looks fiddly).
- [ ] Delete/clean up test junk from earlier testing so the admin dashboard doesn't show obviously fake data (or don't — real seeded data works fine too).
- [ ] Have Postman open in a second tab/window with the collection imported and a token already pasted in, so you're not typing during the demo.
- [ ] Have Neon's SQL Editor open in a third tab, ready to run `SELECT * FROM accessibility_issues ORDER BY id DESC LIMIT 5;`.
- [ ] Have your architecture diagram (from Phase 1) ready to screen-share or show as a slide.

---

## Script

### 1. Introduce the problem (30 sec)
> "Accessibility issues on campus — broken ramps, elevators, missing signage — usually get reported informally, if at all, with no way to track what happens next. This app gives students and staff a structured way to report these issues and see them through to resolution."

### 2. Register / log in as a student (30 sec)
- Open the live frontend.
- Register a new account live (use an email like `demo.[yourname]@campus.edu` — fresh, so it's clearly not seeded data).
- Point out: lands directly on the Student Dashboard, session persists on refresh.

### 3. Create an accessibility issue (60 sec)
- Click "Report an Issue."
- Fill in a realistic example (e.g., "Broken ramp near Block A entrance," category Wheelchair Ramp, building/area fields).
- **Upload a photo** — narrate: "This uploads directly to Cloudinary, cloud object storage — the database only stores the resulting URL, not the image itself."
- Submit → redirected to My Reports, issue visible.

### 4. Show it in the dashboard (20 sec)
- Back to Student Dashboard — point out the stat counts updating, the recent-reports list.

### 5. Show the database record (30 sec)
- Switch to the Neon tab, run the `SELECT` query.
- "Same row, same data — the frontend and the database are talking to the same live cloud instance, from wherever you are."

### 6. Log in as administrator (20 sec)
- Log out, log in with the pre-promoted admin account.
- Land on Admin Dashboard — point out it's a different view entirely, enforced by role-based access control in the JWT.

### 7. Show the admin dashboard (30 sec)
- Point out the stat cards (Total, Reported, Under Review, In Progress, Resolved, Critical).
- Open "All Issues" — demonstrate a filter (e.g., filter by category or search by title).

### 8. Change priority/status, add a resolution note (60 sec)
- Open the issue you just created (Admin Issue Details).
- Change status to "Under Review," add a comment like "Site inspection scheduled."
- Change priority to "High."
- Save — point out this is a single database transaction: the issue *and* the audit-trail row are written together.

### 9. Return to student account, show updated status (30 sec)
- Log out, log back in as the student.
- Open the same report — status badge updated, update history now shows the admin's comment with a timestamp.
- "This is the transparency piece — the reporter doesn't have to follow up, they can just check."

### 10. Demonstrate the REST API directly (45 sec)
- Switch to Postman.
- Run `GET /api/admin/issues` — show the raw JSON response.
- Run one of the earlier requests again to show it's stateless (any client, not just the React app, can talk to this API).
- Optionally: try the same admin request with a student token to show `403 Forbidden` — a nice, fast way to demonstrate role-based authorization live.

### 11. Show the cloud architecture (30 sec)
- Show the architecture diagram slide/screen: Frontend (Vercel) → Backend API (Render) → Database (Neon), with Cloudinary alongside.
- "Three separate managed cloud services, each independently deployed and scalable — that's the cloud-computing piece of this assignment."

### 12. Close (15 sec)
> "So end to end: a student reports an issue with a photo, it's stored in a cloud database with the image in cloud object storage, an administrator triages and resolves it through a REST API enforcing role-based access, and the student sees the update — all through a fully cloud-deployed application."

---

## If something goes wrong live

- **Render is slow to respond:** you already pinged it beforehand, but if it still happens — narrate it. "This is the free tier's cold start — in a paid deployment this wouldn't happen." Evaluators respect an honest, calm explanation over silence.
- **A field doesn't save as expected:** don't panic-debug live. Say "let me show you that same flow via Postman instead" and pivot to the API directly — it's more reliable and still demonstrates the same functionality.
- **Wi-Fi drops:** have `npm run dev` running locally on your laptop as a backup, pointed at the same Neon database — same data, no internet dependency for the demo itself (only needed if evaluators specifically want to see the public URL).

---

## Anticipated questions and short answers

| Question | Answer |
|---|---|
| Why PostgreSQL over MongoDB? | The data is relational — issues belong to users, updates belong to issues — foreign keys and constraints give real data integrity that a document store would have to enforce in application code instead. |
| Why is the image not in the database? | Databases are inefficient at large binary blobs; object storage is purpose-built for files and serves them via CDN. The DB only needs a lightweight URL string. |
| How does the system scale? | Stateless JWT auth means any number of backend instances can serve any request — no server-side session to keep in sync. Database and storage are managed services that scale independently of the backend. |
| What stops a student from editing someone else's report? | Every issue route checks `req.user.id` (from the verified JWT) against the issue's `user_id` before allowing an edit or delete — enforced server-side, not just hidden in the UI. |
| What happens to the audit trail if two admins update at once? | Status changes are wrapped in a database transaction — the status update and the `issue_updates` row are written atomically, so there's no window where one succeeds without the other. |
