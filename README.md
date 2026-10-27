# Campus Accessibility Issue Reporter — VIT Chennai Campus

A cloud-based accessibility barrier reporting and remediation management platform for university campuses. Students and staff report accessibility hazards around campus — broken wheelchair ramps, jammed elevators, missing tactile paving, or damaged handrails — with geolocation and photo attachments, while campus administrators triage, prioritize, assign, and track them through to resolution.

- **Live Application (Frontend):** [https://campus-accessibility-reporter.vercel.app](https://campus-accessibility-reporter.vercel.app)
- **Live REST API (Backend):** [https://campus-accessibility-backend.onrender.com/api](https://campus-accessibility-backend.onrender.com/api)
- **Live Health & Database Status:** [https://campus-accessibility-backend.onrender.com/api/health](https://campus-accessibility-backend.onrender.com/api/health)
- **Git Branch:** `assignment-3` (Digital Assignment 3 Submission)

---

## Architecture & Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React (Vite), SPA | Responsive accessible UI deployed on **Vercel** with custom dark mode and status filters. |
| **Backend REST API** | Node.js, Express.js | Stateless microservice architecture deployed on **Render**; containerized via Docker. |
| **Load Balancer** | Nginx Reverse Proxy | Round-robin load balancer distributing traffic across 3 backend replicas (`http://localhost:8080`). |
| **Database** | PostgreSQL (Neon Cloud) | Serverless cloud-hosted PostgreSQL with relational foreign keys, transactions, and audit trail. |
| **Object Storage** | Cloudinary | Cloud object storage for high-resolution photo evidence. |
| **Authentication & RBAC** | JWT + bcrypt + RFC 6238 TOTP | Salted password hashing, stateless JSON Web Tokens, Two-Factor Authentication (MFA), and strict role authorization. |
| **Container Hardening** | Docker & Alpine Linux | Multi-stage build, non-root user execution (`USER node`), and Trivy CVE vulnerability remediation. |

---

## Campus Coverage (VIT Chennai)

The database includes realistic accessibility issues and audit histories across:
- **Men's Hostels:** A BLOCK, D BLOCK, E BLOCK, F BLOCK
- **Girls' Hostels:** B BLOCK, C BLOCK
- **Academic Blocks:** AB-1, AB-2, AB-3, AB-4, AB-5
- **Administrative:** ADMIN BLOCK (Admissions & CoE Office)

---

## Project Structure

```
campus-accessibility-reporter/
├── backend/
│   ├── src/
│   │   ├── config/          # Neon DB pool & Cloudinary configurations
│   │   ├── controllers/     # Auth (with TOTP MFA) & Issue business logic
│   │   ├── middleware/      # JWT verification, RBAC guards, file uploads
│   │   ├── routes/          # REST API route declarations
│   │   └── server.js        # Express app entrypoint with X-Served-By header
│   ├── tests/               # MFA unit tests & automated API test suites
│   ├── Dockerfile           # Baseline Node.js container
│   ├── Dockerfile.hardened  # Hardened Alpine non-root container
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Accessible UI components, Navbar, IssueCards
│   │   ├── pages/           # Student/Admin dashboards, Report/Edit issue pages
│   │   └── api/             # Axios/fetch API client configurations
│   ├── vercel.json          # Vercel deployment & rewrite configuration
│   └── vite.config.js
├── database/
│   ├── schema.sql           # PostgreSQL schema (users, issues, audit history)
│   └── seed.sql             # VIT Chennai campus seed dataset
├── nginx/
│   └── nginx.conf           # Load balancer round-robin upstream configuration
├── scripts/
│   ├── run_da3_tests.js     # Complete DA3 benchmarking & failover evaluation suite
│   ├── cluster_simulator.js # Multi-instance local cluster & proxy simulator
│   ├── load_test.js         # HTTP load testing engine (1,000 requests)
│   └── seed_vit_chennai.js  # Automated database seed utility
├── docker-compose.yml       # 3-Replica backend cluster + Nginx load balancer
├── render.yaml              # Render cloud infrastructure blueprint
└── docs/                    # Technical reports, test logs, and demo scripts
```

---

## Running Locally

### 1. Database Setup
Ensure you have access to a PostgreSQL instance (Neon or local):
```bash
# Populate schema and seed data
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/seed.sql
```

### 2. Backend (Single Instance)
```bash
cd backend
cp .env.example .env    # Configure your DATABASE_URL, JWT_SECRET, and Cloudinary keys
npm install
npm run dev             # Server listens on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env    # Set VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev             # Frontend opens on http://localhost:5173
```

---

## Digital Assignment 3 (DA3) Evaluation Commands

### Option A: Run Multi-Container Architecture via Docker Compose
Launches 3 backend instances (`campus-backend-1`, `2`, `3`) behind an Nginx load balancer:
```bash
docker-compose up --build
# Nginx Load Balancer accessible on: http://localhost:8080/api/health
```

### Option B: Run Automated Benchmark & Fault-Tolerance Suite
Executes the automated 1,000-request benchmark, round-robin load distribution validation, and zero-downtime failover demonstration:
```bash
node scripts/run_da3_tests.js
```

### Option C: Run MFA & RBAC Verification Test
Tests RFC 6238 TOTP Two-Factor Authentication and role-based route protection:
```bash
node backend/tests/test_mfa.js
```

---

## Documentation Index

- [**DA3 Full Report (`docs/DA3_Report.md`)**](docs/DA3_Report.md) — Comprehensive submission report for Digital Assignment 3 covering:
  - Question 1: Peak-Demand Scenario, 3-Instance Nginx Architecture, Load Testing (1,000 reqs), and Zero-Downtime Failover.
  - Question 2: Cloud Bursting & Edge/Fog Architecture, Salted Hash & TOTP MFA, Role-Based Access Control, Container Hardening, and Trivy CVE Remediation.
- [**DA3 Video Demonstration Script (`docs/DA3_Demo_Video_Script.md`)**](docs/DA3_Demo_Video_Script.md) — Step-by-step video script and walkthrough.
- [**Deployment Guide (`docs/deployment-guide.md`)**](docs/deployment-guide.md) — Cloud setup and deployment walkthrough (Neon + Render + Vercel + Cloudinary).
- [**Architecture & System Plan (`docs/01_architecture_and_plan.md`)**](docs/01_architecture_and_plan.md) — Initial system design, entity relations, and REST API specification.
- [**Test Case Matrix (`docs/testing-table.md`)**](docs/testing-table.md) — Comprehensive functional test cases and test automation scripts.