# Testing — Campus Accessibility Issue Reporter

Manual + scripted test cases covering every flow required by the assignment brief (§23). "Actual result" and "Status" columns are left for you to fill in as you run each test during your own verification pass — the automated script in `api-test-script.sh` runs most of the API-level cases for you and prints PASS/FAIL directly.

| # | Feature | Test Case | Steps / Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| 1 | Registration | Valid registration | POST `/api/auth/register` with unique name/email/password ≥6 chars | `201`, returns `token` + `user` object | | |
| 2 | Registration | Duplicate email | Register twice with the same email | `409 Conflict`, "account already exists" | | |
| 3 | Registration | Missing fields | Omit `password` from request body | `400 Bad Request` | | |
| 4 | Login | Valid login | POST `/api/auth/login` with correct email/password | `200`, returns `token` + `user` | | |
| 5 | Login | Invalid login (wrong password) | Correct email, wrong password | `401 Unauthorized` | | |
| 6 | Login | Invalid login (unknown email) | Email not in the database | `401 Unauthorized` (same generic message — doesn't leak which field was wrong) | | |
| 7 | Create issue | Create as authenticated student | POST `/api/issues` with valid token + required fields | `201`, issue returned with correct `user_id` from token | | |
| 8 | Create issue | Unauthenticated create | POST `/api/issues` with no `Authorization` header | `401 Unauthorized` | | |
| 9 | Create issue | Invalid category | POST with `category: "Not A Real Category"` | `400 Bad Request` | | |
| 10 | View issue | View own issues list | GET `/api/issues` as the owner | `200`, only that user's issues returned | | |
| 11 | View issue | View single issue (owner) | GET `/api/issues/:id` as the reporting student | `200`, full issue detail | | |
| 12 | View issue | View single issue (non-owner, non-admin) | GET `/api/issues/:id` as a different student | `403 Forbidden` | | |
| 13 | Update issue | Update own issue while `Reported` | PUT `/api/issues/:id` as owner, status still `Reported` | `200`, fields updated | | |
| 14 | Update issue | Update after status has changed | PUT `/api/issues/:id` once status ≠ `Reported` | `400 Bad Request`, "can no longer be edited" | | |
| 15 | Update issue | Update someone else's issue | PUT `/api/issues/:id` as a non-owner | `403 Forbidden` | | |
| 16 | Delete issue | Delete own issue while `Reported` | DELETE `/api/issues/:id` as owner | `200`, row removed from database | | |
| 17 | Delete issue | Delete after status has changed | DELETE once status ≠ `Reported` | `400 Bad Request` | | |
| 18 | Unauthorized access | Student calls admin-only route | GET `/api/admin/issues` with a student token | `403 Forbidden` | | |
| 19 | Unauthorized access | No token on protected route | GET `/api/issues` with no token | `401 Unauthorized` | | |
| 20 | Admin access | Admin views all issues | GET `/api/admin/issues` with an admin token | `200`, all issues across all users | | |
| 21 | Admin access | Admin dashboard stats | GET `/api/admin/dashboard` with an admin token | `200`, correct aggregate counts | | |
| 22 | Status update | Admin changes issue status | PUT `/api/admin/issues/:id/status` with valid status + comment | `200`, issue updated **and** a new row appears in `issue_updates` | | |
| 23 | Status update | Invalid status value | PUT status with `status: "Not A Status"` | `400 Bad Request` | | |
| 24 | Priority update | Admin changes priority | PUT `/api/admin/issues/:id/priority` with a valid value | `200`, priority updated | | |
| 25 | Priority update | Invalid priority value | PUT priority with `priority: "Urgent!"` | `400 Bad Request` | | |
| 26 | Assignment | Admin assigns an issue | PUT `/api/admin/issues/:id/assign` with `assigned_to` | `200`, `assigned_to` field updated | | |
| 27 | Image upload | Valid image upload | POST `/api/uploads/image` with a JPEG/PNG under 5MB, authenticated | `201`, returns a Cloudinary `image_url` | | |
| 28 | Image upload | Oversized file | Upload a file > 5MB | `400 Bad Request`, "must be smaller than 5MB" | | |
| 29 | Image upload | Non-image file | Upload a `.pdf` or `.txt` | `400 Bad Request`, "Only image files are allowed" | | |
| 30 | Image upload | Unauthenticated upload | POST `/api/uploads/image` with no token | `401 Unauthorized` | | |
| 31 | Database connectivity | Health check | GET `/api/health` | `200`, `{"database":"connected"}` | | |
| 32 | Database connectivity | Health check with DB unreachable | Stop the DB / use a bad `DATABASE_URL`, then GET `/api/health` | `500`, `{"database":"not reachable"}` (verifies graceful failure, not a crash) | | |
| 33 | API errors | Unknown route | GET `/api/not-a-real-route` | `404 Not Found`, consistent JSON shape | | |
| 34 | API errors | Malformed JSON body | POST with broken JSON syntax | `400`, handled by Express's body parser without crashing the server | | |
| 35 | Update history | Student views own update history | GET `/api/issues/:id/updates` as the reporting student | `200`, chronological list of status changes | | |
| 36 | Update history | Non-owner views update history | GET `/api/issues/:id/updates` as a different student | `403 Forbidden` | | |
| 37 | Update history | Student attempts to POST an update | POST `/api/issues/:id/updates` with a student token | `403 Forbidden` (admin-only) | | |

## How to run these

- **Automated (recommended for most rows):** run `api-test-script.sh` against your local or deployed backend — see instructions in that file's header comment. It exercises rows 1–21 and prints a PASS/FAIL summary.
- **Manual (image upload, DB-down case, UI-driven cases):** use Postman with the provided collection, or the running frontend directly — rows 27–30, 32, and any UI-level check are easiest to verify by hand.
- Fill in the "Actual Result" and "Status" columns as you go; this table is designed to be pasted directly into your assignment report's Testing section (§23) once completed.
