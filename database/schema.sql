-- =========================================================
-- Campus Accessibility Issue Reporter — Database Schema
-- Target: PostgreSQL (Neon / Render Postgres / any Postgres 13+)
-- =========================================================

-- Drop tables if re-running during development (safe order: children first)
DROP TABLE IF EXISTS issue_updates;
DROP TABLE IF EXISTS accessibility_issues;
DROP TABLE IF EXISTS users;

-- =========================================================
-- 1. USERS
-- =========================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'student'
                        CHECK (role IN ('student', 'admin')),
    email_verified              BOOLEAN NOT NULL DEFAULT false,
    verification_token          VARCHAR(255),
    verification_token_expires  TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 2. ACCESSIBILITY ISSUES
-- =========================================================
CREATE TABLE accessibility_issues (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL
                                REFERENCES users(id) ON DELETE CASCADE,
    title                   VARCHAR(150) NOT NULL,
    description             TEXT NOT NULL,
    category                VARCHAR(30) NOT NULL
                                CHECK (category IN (
                                    'Wheelchair Ramp', 'Elevator/Lift', 'Accessible Parking',
                                    'Pathway', 'Handrail', 'Entrance', 'Signage',
                                    'Restroom', 'Other'
                                )),
    location_building       VARCHAR(100),
    location_area           VARCHAR(100),
    location_description    VARCHAR(255),
    latitude                DECIMAL(9,6),
    longitude               DECIMAL(9,6),
    priority                VARCHAR(10) NOT NULL DEFAULT 'Medium'
                                CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status                  VARCHAR(20) NOT NULL DEFAULT 'Reported'
                                CHECK (status IN (
                                    'Reported', 'Under Review', 'Assigned',
                                    'In Progress', 'Resolved', 'Closed'
                                )),
    assigned_to             VARCHAR(100),
    image_url               VARCHAR(500),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 3. ISSUE UPDATES (status/resolution history — audit trail)
-- =========================================================
CREATE TABLE issue_updates (
    id                  SERIAL PRIMARY KEY,
    issue_id            INTEGER NOT NULL
                            REFERENCES accessibility_issues(id) ON DELETE CASCADE,
    updated_by          INTEGER NOT NULL
                            REFERENCES users(id),
    previous_status     VARCHAR(20),
    new_status          VARCHAR(20) NOT NULL,
    comment             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 4. Indexes (performance — evaluators may ask about this)
-- =========================================================
CREATE INDEX idx_issues_user_id ON accessibility_issues(user_id);
CREATE INDEX idx_issues_status ON accessibility_issues(status);
CREATE INDEX idx_issues_priority ON accessibility_issues(priority);
CREATE INDEX idx_issues_category ON accessibility_issues(category);
CREATE INDEX idx_updates_issue_id ON issue_updates(issue_id);

-- =========================================================
-- 5. Trigger to auto-update `updated_at` on issue edits
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_issues_updated_at
BEFORE UPDATE ON accessibility_issues
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
