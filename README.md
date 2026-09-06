# Campus Accessibility Issue Reporter

A cloud-based platform where students and staff report accessibility issues around campus — broken ramps, jammed elevators, missing signage — and track them through to resolution.

**Live app:** _add your Vercel URL here after deployment_
**Live API:** _add your Render URL here after deployment_

## Stack

- **Frontend:** React (Vite), deployed on Vercel
- **Backend:** Node.js + Express, deployed on Render
- **Database:** PostgreSQL, hosted on Neon
- **Image storage:** Cloudinary
- **Auth:** JWT + bcrypt

## Project structure

\`\`\`
frontend/    React SPA
backend/     Express REST API
database/    schema.sql, seed.sql
docs/        architecture, API docs, testing table, deployment guide
\`\`\`

## Running locally

\`\`\`bash
# 1. Database — see docs/ for Neon setup, or point DATABASE_URL at any local Postgres
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/seed.sql

# 2. Backend
cd backend
cp .env.example .env   # fill in real values
npm install
npm run dev             # http://localhost:5000

# 3. Frontend
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
\`\`\`

## Documentation

- [\`docs/01_architecture_and_plan.md\`](docs/01_architecture_and_plan.md) — system architecture, database design, REST API list
- [\`docs/testing-table.md\`](docs/testing-table.md) — full test case table + automated test script
- [\`docs/deployment-guide.md\`](docs/deployment-guide.md) — step-by-step cloud deployment
- \`backend/tests/api-test-script.sh\` — automated API test suite

## Deploying

See [\`docs/deployment-guide.md\`](docs/deployment-guide.md) for the full walkthrough (Neon → Render → Vercel → Cloudinary).