# Cloud Deployment Guide — Campus Accessibility Issue Reporter

This walks through getting the whole project live at a public URL. You already have:
- Database on **Neon** (from Phase 2)
- Image storage on **Cloudinary** (from Phase 7)

What's left: push your code to GitHub, deploy the **backend** to Render, deploy the **frontend** to Vercel, then connect the two together. Total time: ~20 minutes.

---

## 0. Push your code to GitHub

Both Render and Vercel deploy by connecting to a GitHub repository, so this has to happen first.

1. Go to **github.com** → sign in → click the **+** icon (top right) → **New repository**.
2. Name it `campus-accessibility-reporter` → keep it **Public** or **Private** (either works) → **Create repository**. Don't check "Add a README" — you'll push your existing folder.
3. On your own computer, open a terminal in your project's root folder (the one containing `frontend/`, `backend/`, `database/`, `docs/`) and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/campus-accessibility-reporter.git
   git push -u origin main
   ```
4. **Before this step**, make sure `.env` files are NOT committed. Create a `.gitignore` in your project root containing:
   ```
   node_modules/
   .env
   dist/
   ```
   If you already ran `git add .` before creating `.gitignore`, run `git rm -r --cached backend/.env frontend/.env` (if they exist) before committing.
5. Refresh your GitHub repo page — you should see `frontend/`, `backend/`, `database/`, `docs/` folders there.

---

## 1. Database — confirm it's ready (Neon)

You already set this up in Phase 2. Just double-check:
1. Log into **neon.tech** → open your project → confirm the connection string is still visible under **Connection Details**.
2. Keep this tab open — you'll paste this string into Render in step 2.

---

## 2. Deploy the backend (Render)

1. Go to **render.com** → sign up/log in (GitHub login is easiest — it'll also grant Render access to your repos).
2. Click **New +** → **Web Service**.
3. Connect your `campus-accessibility-reporter` repository (you may need to click "Configure account" to grant Render access to it first).
4. Fill in the settings:
   | Field | Value |
   |---|---|
   | Name | `campus-accessibility-backend` |
   | **Root Directory** | `backend` ← important, since backend and frontend share one repo |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free |
5. Scroll to **Environment Variables** → click **Add Environment Variable** and add each of these (values from your local `backend/.env`):
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string |
   | `JWT_SECRET` | your long random string |
   | `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
   | `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
   | `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |
   | `FRONTEND_ORIGIN` | leave as `http://localhost:5173` for now — you'll update this in step 4 |
   *(`PORT` doesn't need to be set — Render sets its own and your `server.js` already reads `process.env.PORT` with a fallback.)*
6. Click **Create Web Service**. Render will build and deploy — this takes 2–5 minutes. Watch the logs; you're looking for `Server running on port ...`.
7. Once live, Render gives you a public URL like:
   ```
   https://campus-accessibility-backend.onrender.com
   ```
8. **Test it immediately:** open `https://campus-accessibility-backend.onrender.com/api/health` in your browser. You should see:
   ```json
   {"success":true,"message":"API is running","database":"connected"}
   ```
   If you see `"database not reachable"`, double check the `DATABASE_URL` env var for typos.

   *Free-tier note: Render's free web services "spin down" after 15 minutes of inactivity and take ~30–60 seconds to wake up on the next request — expected behavior, not a bug. Worth mentioning during your demo if the first request feels slow.*

---

## 3. Deploy the frontend (Vercel)

1. Go to **vercel.com** → sign up/log in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your `campus-accessibility-reporter` repository.
4. Configure:
   | Field | Value |
   |---|---|
   | Framework Preset | Vite (should auto-detect) |
   | **Root Directory** | `frontend` ← click "Edit" next to Root Directory and select it |
   | Build Command | `npm run build` (default, leave as-is) |
   | Output Directory | `dist` (default, leave as-is) |
5. Expand **Environment Variables** → add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://campus-accessibility-backend.onrender.com/api` (your Render URL from step 2, with `/api` on the end) |
6. Click **Deploy**. Takes about a minute.
7. Once done, Vercel gives you a public URL like:
   ```
   https://campus-accessibility-reporter.vercel.app
   ```

---

## 4. Connect them — update backend's CORS setting

Right now your backend only accepts requests from `http://localhost:5173`. Update it to also accept your live frontend URL:

1. Go back to your **Render** dashboard → your backend service → **Environment**.
2. Edit `FRONTEND_ORIGIN` → change its value to your Vercel URL:
   ```
   https://campus-accessibility-reporter.vercel.app
   ```
3. Save — Render will automatically redeploy with the new value (takes ~1 minute).

---

## 5. Final verification checklist

Open your live Vercel URL in a browser and walk through:

- [ ] Landing page loads
- [ ] Register a new student account → redirected to dashboard
- [ ] Refresh the page → still logged in
- [ ] Report an issue with a photo → succeeds, photo preview shows "uploaded successfully"
- [ ] Issue appears in "My Reports"
- [ ] Open the issue → details, status timeline, empty update history all render
- [ ] In Neon's SQL Editor, run `SELECT * FROM accessibility_issues;` → confirm the row is really there
- [ ] Promote your test account to admin via SQL, log out, log back in
- [ ] Admin Dashboard shows correct stats
- [ ] Change the issue's status + add a comment → save
- [ ] Log back in as the student → update history now shows that change

If every box checks, your app is fully live and cloud-deployed end to end.

---

## 6. Common deployment errors & fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Frontend loads but every request fails, browser console shows a CORS error | `FRONTEND_ORIGIN` on Render doesn't match your Vercel URL exactly | Re-check for trailing slashes / `http` vs `https` mismatch |
| Vercel build fails with "vite: not found" | Root Directory wasn't set to `frontend` | Go to Project Settings → General → Root Directory → set to `frontend`, redeploy |
| Render deploy fails immediately | Root Directory wasn't set to `backend`, or `package.json`'s `start` script is missing | Confirm Root Directory = `backend`; confirm `"start": "node src/server.js"` exists |
| `/api/health` shows `database: not reachable` | Wrong or expired `DATABASE_URL` | Copy the connection string fresh from Neon, re-paste into Render env vars |
| First request after inactivity takes 30–60 seconds | Render free-tier cold start | Expected — mention this in your demo, or open the health-check URL a minute before presenting |
| Login works locally but not on the deployed site | `VITE_API_BASE_URL` on Vercel still points to `localhost` | Fix the env var on Vercel, then redeploy (Vercel → Deployments → ⋯ → Redeploy) |
| Image upload fails only in production | Cloudinary env vars weren't copied over to Render | Re-add all three `CLOUDINARY_*` variables in Render's Environment tab |

---

## What to include in your report

- Your live URLs: `https://campus-accessibility-reporter.vercel.app` (frontend) and `https://campus-accessibility-backend.onrender.com` (backend API)
- A screenshot of the Render and Vercel dashboards showing successful deploys
- A screenshot of `/api/health` returning `"database":"connected"` in production
