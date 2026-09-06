# REST API Documentation — Campus Accessibility Issue Reporter

Base URL (local): `http://localhost:5000/api`
Base URL (production): `https://campus-accessibility-backend.onrender.com/api`

All request/response bodies are JSON unless noted (image upload uses `multipart/form-data`). Protected endpoints require an `Authorization: Bearer <token>` header, obtained from `/auth/register` or `/auth/login`.

---

## Authentication

### `POST /auth/register`
Create a new student account.

| | |
|---|---|
| **Auth required** | No |
| **Request body** | `{ "name": "string", "email": "string", "password": "string (min 6 chars)" }` |
| **Success response** | `201 Created` |
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": 3, "name": "Riya Sharma", "email": "riya@campus.edu", "role": "student", "created_at": "2026-08-28T04:10:00.000Z" }
}
```
| **Errors** | `400` missing/invalid fields · `409` email already registered |

### `POST /auth/login`
| | |
|---|---|
| **Auth required** | No |
| **Request body** | `{ "email": "string", "password": "string" }` |
| **Success response** | `200 OK` — same shape as register |
| **Errors** | `400` missing fields · `401` invalid credentials |

---

## Issues (student-facing)

### `POST /issues`
Create a new accessibility issue report. `user_id` is taken from the JWT, not the request body.

| | |
|---|---|
| **Auth required** | Yes (any role) |
| **Request body** | `{ "title", "description", "category", "location_building", "location_area", "location_description", "latitude", "longitude", "priority", "image_url" }` — only `title`, `description`, `category` are required |
| **Success response** | `201 Created`, returns the created issue |
| **Errors** | `400` missing required fields or invalid `category`/`priority` · `401` no/invalid token |

### `GET /issues`
List the logged-in user's own issues.

| | |
|---|---|
| **Auth required** | Yes |
| **Query params** | `status`, `priority`, `category` (all optional filters) |
| **Success response** | `200 OK` → `{ "success": true, "count": 2, "issues": [ ... ] }` |

### `GET /issues/:id`
Get a single issue's full detail.

| | |
|---|---|
| **Auth required** | Yes (must be the owner or an admin) |
| **Success response** | `200 OK`, full issue object |
| **Errors** | `403` not the owner/admin · `404` issue not found |

### `PUT /issues/:id`
Edit a report. Only the owner can edit, and only while `status = 'Reported'`.

| | |
|---|---|
| **Auth required** | Yes (owner only) |
| **Request body** | Any subset of `title`, `description`, `category`, `location_building`, `location_area`, `location_description`, `latitude`, `longitude` |
| **Success response** | `200 OK`, updated issue |
| **Errors** | `400` status is past `Reported` · `403` not the owner · `404` not found |

### `DELETE /issues/:id`
Delete a report. Only the owner, and only while `status = 'Reported'`.

| | |
|---|---|
| **Auth required** | Yes (owner only) |
| **Success response** | `200 OK` → `{ "success": true, "message": "Issue 4 deleted" }` |
| **Errors** | `400` status is past `Reported` · `403` not the owner · `404` not found |

---

## Issue Updates (status/resolution history)

### `GET /issues/:id/updates`
Chronological history of status changes and resolution notes for one issue.

| | |
|---|---|
| **Auth required** | Yes (owner or admin) |
| **Success response** | `200 OK` → `{ "success": true, "updates": [ { "id", "previous_status", "new_status", "comment", "updated_by_name", "created_at" }, ... ] }` |
| **Errors** | `403` not the owner/admin · `404` issue not found |

### `POST /issues/:id/updates`
Add a status change / resolution note directly (admin-only; the admin status-change endpoints below call this internally too).

| | |
|---|---|
| **Auth required** | Yes, **admin only** |
| **Request body** | `{ "new_status": "string", "comment": "string (optional)" }` |
| **Success response** | `201 Created`, the created update row |
| **Errors** | `400` missing `new_status` · `403` not an admin · `404` issue not found |

---

## Image Upload

### `POST /uploads/image`
Upload a photo to Cloudinary; returns only the URL (the file itself is never stored in the database or on the server disk).

| | |
|---|---|
| **Auth required** | Yes |
| **Request body** | `multipart/form-data` with one field, `image` (JPEG/PNG/etc., max 5MB) |
| **Success response** | `201 Created` → `{ "success": true, "image_url": "https://res.cloudinary.com/..." }` |
| **Errors** | `400` file too large, wrong type, or missing · `401` no/invalid token |

---

## Admin

All routes below require an **admin** JWT (`403` otherwise).

### `GET /admin/issues`
List every issue across all users, with reporter name/email joined in.

| | |
|---|---|
| **Query params** | `status`, `priority`, `category`, `search` (matches issue title, case-insensitive) |
| **Success response** | `200 OK` → `{ "success": true, "count": N, "issues": [ ... ] }` |

### `GET /admin/dashboard`
Aggregate statistics across all issues.

| | |
|---|---|
| **Success response** | `200 OK` |
```json
{
  "success": true,
  "stats": { "total": 12, "reported": 3, "under_review": 2, "in_progress": 4, "resolved": 3, "critical": 1 }
}
```

### `PUT /admin/issues/:id/status`
Change an issue's status. Automatically logs a row to `issue_updates` in the same database transaction.

| | |
|---|---|
| **Request body** | `{ "status": "Reported \| Under Review \| Assigned \| In Progress \| Resolved \| Closed", "comment": "string (optional)" }` |
| **Success response** | `200 OK`, updated issue |
| **Errors** | `400` invalid status value · `404` not found |

### `PUT /admin/issues/:id/priority`
| | |
|---|---|
| **Request body** | `{ "priority": "Low \| Medium \| High \| Critical" }` |
| **Success response** | `200 OK`, updated issue |
| **Errors** | `400` invalid priority value · `404` not found |

### `PUT /admin/issues/:id/assign`
| | |
|---|---|
| **Request body** | `{ "assigned_to": "string" }` |
| **Success response** | `200 OK`, updated issue |
| **Errors** | `400` missing `assigned_to` · `404` not found |

### `DELETE /admin/issues/:id`
Admins can delete a report regardless of status (unlike the student delete route).

| | |
|---|---|
| **Success response** | `200 OK` → `{ "success": true, "message": "Issue 4 deleted" }` |
| **Errors** | `404` not found |

---

## System

### `GET /health`
| | |
|---|---|
| **Auth required** | No |
| **Success response** | `200 OK` → `{ "success": true, "message": "API is running", "database": "connected" }` |
| **Failure response** | `500` → `{ "success": false, "message": "Database not reachable" }` |

---

## Standard error shape

Every error response follows the same JSON shape, regardless of endpoint:
```json
{ "success": false, "error": "Human-readable message" }
```

## HTTP status codes used throughout

| Code | Meaning in this API |
|---|---|
| `200` | Successful GET/PUT/DELETE |
| `201` | Successful POST (resource created) |
| `400` | Bad request — validation failure |
| `401` | Missing/invalid/expired JWT |
| `403` | Valid JWT, but insufficient permission (wrong owner or wrong role) |
| `404` | Resource not found |
| `500` | Unexpected server error |
