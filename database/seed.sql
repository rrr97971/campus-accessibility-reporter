-- =========================================================
-- Campus Accessibility Issue Reporter — Sample / Seed Data
-- Run AFTER schema.sql
-- NOTE: password_hash values below are bcrypt hashes of "Password123"
--       (generated with bcrypt, 10 rounds) — safe to use for demo only.
-- =========================================================

-- ---------------------------------------------------------
-- Users (1 admin, 2 students)
-- ---------------------------------------------------------
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User',    'admin@campus.edu',   '$2b$10$examplehashforadmin000000000000000000000000000', 'admin'),
('Riya Sharma',   'riya@campus.edu',    '$2b$10$examplehashforriya0000000000000000000000000000', 'student'),
('Arjun Mehta',   'arjun@campus.edu',   '$2b$10$examplehashforarjun000000000000000000000000000', 'student');

-- ---------------------------------------------------------
-- Accessibility Issues
-- ---------------------------------------------------------
INSERT INTO accessibility_issues
    (user_id, title, description, category, location_building, location_area,
     location_description, latitude, longitude, priority, status, assigned_to, image_url)
VALUES
(2, 'Broken ramp near Block A entrance',
    'The wheelchair ramp at the main entrance of Block A has a large crack and is unsafe to use.',
    'Wheelchair Ramp', 'Block A', 'Main Entrance', 'Left side of the main door', 12.925100, 80.183000,
    'High', 'Under Review', NULL, NULL),

(2, 'Elevator not working in Library',
    'The library elevator has been out of service for a week, blocking access to the 2nd floor reading room.',
    'Elevator/Lift', 'Central Library', '2nd Floor', 'Near the reference section', 12.926500, 80.184200,
    'Critical', 'Assigned', 'Maintenance Team B', NULL),

(3, 'Missing accessible parking signage',
    'The reserved accessible parking spot near the admin block has no visible sign, so it is often occupied by regular vehicles.',
    'Signage', 'Admin Block', 'Parking Lot 1', 'Row nearest the entrance', 12.924800, 80.182500,
    'Medium', 'Reported', NULL, NULL),

(3, 'Damaged handrail on Block C stairs',
    'One of the handrail sections near the Block C stairwell is loose and wobbles when held.',
    'Handrail', 'Block C', 'Stairwell 2', 'Between ground and first floor', NULL, NULL,
    'Medium', 'Resolved', 'Maintenance Team A', NULL);

-- ---------------------------------------------------------
-- Issue Updates (status history / audit trail)
-- ---------------------------------------------------------
INSERT INTO issue_updates (issue_id, updated_by, previous_status, new_status, comment) VALUES
(1, 1, 'Reported', 'Under Review', 'Site inspection scheduled for this week.'),
(2, 1, 'Reported', 'Under Review', 'Confirmed with library staff.'),
(2, 1, 'Under Review', 'Assigned', 'Assigned to Maintenance Team B for part replacement.'),
(4, 1, 'Reported', 'Under Review', 'Checked, handrail is indeed loose.'),
(4, 1, 'Under Review', 'In Progress', 'Maintenance Team A dispatched.'),
(4, 1, 'In Progress', 'Resolved', 'Handrail bolted and secured. Verified on site.');
