# DA3 — 3-Minute Demo Video Recording Script & Presentation Guide
**Course:** BACSE344 — Cloud Infrastructure and Architecture  
**Assignment:** Digital Assignment 3 (DA3) Demo Video (Max 3 Minutes)  
**Student Name:** ROHITH RAJ R (`rohithraj.r2025@vitstudent.ac.in`)  
**Domain:** Campus Accessibility Issue Reporter  

---

## Video Recording Overview & Checklist
* **Target Duration:** Exactly 2 minutes 45 seconds – 3 minutes.
* **Recording Tool:** OBS Studio, Windows Xbox Game Bar (`Win + G`), Loom, or Zoom (Record Screen + Mic).
* **Screens to Have Ready:**
  1. Terminal / VS Code split:
     - Left: PowerShell / Terminal with test scripts.
     - Right: Browser (`http://localhost:5173` and `http://localhost:8080/api/health`).
  2. The `DA3_Report.md` showing the architecture diagram and comparison tables.

---

## Timed Video Script (0:00 – 3:00)

### [0:00 – 0:30] Introduction & Architecture Overview (Question 1a & 1d)
* **What to Show on Screen:**
  * Show the Architecture Diagram in `DA3_Report.md`.
* **What to Say:**
  > "Hello everyone and respected faculty. My name is Rohith Raj R, and this is my Digital Assignment 3 presentation for BACSE344 Cloud Infrastructure and Architecture, continuing my Campus Accessibility Issue Reporter application.
  >
  > For Question 1, our peak-demand scenario is the **Monsoon Semester Reopening Rush**, where over 25,000 students enter campus simultaneously, hitting our `GET /api/issues` endpoint to navigate flooded ramps and out-of-order elevators.
  >
  > To handle this without downtime, we deploy **three backend instances** behind an **Nginx load balancer** in Docker Compose, connected to our Neon Serverless PostgreSQL database. We also incorporated **Edge/Fog computing** at campus gates to cache map overlays and **Cloud Bursting** to Render when CPU exceeds 75%."

---

### [0:30 – 1:15] Load Balancing & Load Testing (Question 1a & 1b)
* **What to Show on Screen:**
  * Terminal showing the output of `node scripts/run_da3_tests.js` or `DA3_Report.md` load testing table.
* **What to Say:**
  > "Here, as you can see, our requests are evenly distributed across all 3 backend instances: exactly 33.4%, 33.3%, and 33.3%, proven by our `X-Served-By` headers.
  >
  > In Question 1b, we sent 1,000 requests using our benchmarking suite at 25 concurrent connections. 
  > - With **1 instance**, the baseline throughput was **188.01 requests per second** with an average latency of **130.61 milliseconds**.
  > - With **3 load-balanced instances**, throughput jumped to **324.04 requests per second** — a **+72.4% throughput improvement**, and average latency plummeted by **41.5% down to 76.46 milliseconds**, with 0 failed requests."

---

### [1:15 – 1:50] Zero-Downtime Failover (Question 1c)
* **What to Show on Screen:**
  * The Failover Comparison Table in `DA3_Report.md` and terminal stopping `backend2`.
* **What to Say:**
  > "For Question 1c, we tested fault tolerance by stopping backend instance 2 while sending traffic.
  > - **Before configuring Nginx**, 1 out of 3 requests failed, recording **100 failed requests** with HTTP 502 Bad Gateway.
  > - We then configured Nginx with `proxy_next_upstream` and connection timeouts. When an instance goes down, Nginx transparently re-routes the request to a healthy backend instance. In our second run, failed requests dropped to **0**, achieving 100% continuous uptime."

---

### [1:50 – 2:30] Security: Salted Hashing, TOTP MFA & RBAC (Question 2a & 2b)
* **What to Show on Screen:**
  * Run `node tests/test_mfa.js` in terminal (shows MFA + RBAC tests live).
* **What to Say:**
  > "Moving to Question 2: Secure Your Application.
  > - For 2a, our most sensitive data includes student credentials and disability profiling records. Passwords are never stored in plain text; they are hashed using **bcrypt with 10 salt rounds**, producing unique 60-character salted hashes that neutralize rainbow table attacks.
  > - For 2b, we implemented **Multi-Factor Authentication using RFC 6238 TOTP**, compatible with **Google Authenticator** and **Microsoft Authenticator**. As demonstrated here in our test run, logging in with password alone prompts for the 6-digit TOTP code. Invalid codes return 401 Unauthorized, and valid Authenticator codes grant access.
  > - Furthermore, our Update and Delete APIs are strictly guarded by Role-Based Access Control (`requireRole('admin')`). An unauthenticated request is rejected with **401 Unauthorized**, and a student token attempting to delete an issue is rejected with **403 Forbidden**."

---

### [2:30 – 3:00] Trivy Hardening, Threat Agents & Regulations (Question 2c & 2d)
* **What to Show on Screen:**
  * Trivy Results Table and Threat Agent section in `DA3_Report.md`.
* **What to Say:**
  > "For Question 2c, we scanned our baseline Debian `node:20` Docker image with **Trivy**, discovering 3 CRITICAL and 21 HIGH vulnerabilities. We hardened the container using a **multi-stage build with Alpine Linux (`node:20-alpine`)**, executed under a non-root `node` user. Re-scanning showed **zero CRITICAL and zero HIGH vulnerabilities** — a 100% reduction, along with an 84% reduction in image size.
  >
  > Finally, for 2d, we addressed two threat agents: Malicious insiders tampering with issue reports, guarded by RBAC and audit logging under the **RPwD Act 2016** and **ADA Title II**; and external botnets attempting credential stuffing, countered by salted bcrypt and TOTP MFA under **DPDP Act 2023** and **GDPR**.
  >
  > Everything is implemented and pushed to our `assignment-3` branch. Thank you!"
