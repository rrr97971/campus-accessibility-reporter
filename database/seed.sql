-- =========================================================
-- Campus Accessibility Issue Reporter — VIT Chennai Campus Seed Data
-- Target: PostgreSQL (Neon / Render / any Postgres 13+)
-- =========================================================

-- ---------------------------------------------------------
-- 1. Users
-- ---------------------------------------------------------
INSERT INTO users (name, email, password_hash, role) VALUES
('Rohith Raj R', 'rohithraj.r2025@vitstudent.ac.in', '$2b$10$examplehashforrohith000000000000000000000000000', 'student'),
('Admin User',   'admin@vitstudent.ac.in',          '$2b$10$examplehashforadmin000000000000000000000000000',  'admin')
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------
-- 2. Accessibility Issues (VIT Chennai Campus)
-- Men's Hostels: A BLOCK, D BLOCK, E BLOCK, F BLOCK
-- Girls' Hostels: B BLOCK, C BLOCK
-- Academic Blocks: AB-1, AB-2, AB-3, AB-4, AB-5
-- Administrative: ADMIN BLOCK
-- ---------------------------------------------------------
INSERT INTO accessibility_issues
    (user_id, title, description, category, location_building, location_area,
     location_description, latitude, longitude, priority, status, assigned_to)
VALUES
(1, 'Broken Wheelchair Ramp in AB-1',
    'Wheelchair ramp in AB-1 main entrance has loose and cracked granite tiles.',
    'Wheelchair Ramp', 'AB-1', 'Ground Floor', 'Near AB-1 Portico', 12.840600, 80.153300,
    'Critical', 'Assigned', 'Campus Civil Works'),

(1, 'Lift 3 door sensor malfunction on 3rd floor',
    'Elevator 3 doors close too quickly without detecting wheelchair occupants or crutches, presenting a safety hazard.',
    'Elevator/Lift', 'AB-2', 'Core Lift Lobby, 3rd Floor', 'Adjacent to Dean office corridor', 12.840750, 80.153420,
    'Critical', 'Assigned', 'Otis Maintenance Team'),

(1, 'Tactile paving missing at entrance staircase',
    'Warning tactile blister paving is missing before the exterior flight of stairs, creating a tripping hazard for visually impaired students.',
    'Pathway', 'AB-3', 'South Entrance Plaza', 'Main pedestrian ramp intersection', 12.840920, 80.153810,
    'High', 'Under Review', NULL),

(1, 'Accessible restroom door latch jammed',
    'Special needs accessible restroom door latch on the 1st floor requires excessive force to operate and grab rail is loose.',
    'Restroom', 'AB-4', '1st Floor East Wing', 'Opposite Seminar Hall 401', 12.841200, 80.153950,
    'Medium', 'Reported', NULL),

(1, 'Steep slope on rear entrance connecting ramp',
    'Ramp gradient exceeds 1:12 slope and lacks intermediate rest landings between AB-4 and AB-5 crossover corridor.',
    'Wheelchair Ramp', 'AB-5', 'Ground Floor Link Bridge', 'Near Central Food Court side ramp', 12.841510, 80.154200,
    'High', 'Under Review', NULL),

(1, 'Accessible parking bay occupied & faded signage',
    'Dedicated accessibility parking spot near the Administrative entrance has faded blue paint and missing upright international wheelchair symbol sign.',
    'Accessible Parking', 'ADMIN BLOCK', 'Visitor Parking Lot A', 'First two bays closest to Admissions foyer', 12.840210, 80.153100,
    'Medium', 'Assigned', 'Estate Office Security'),

(1, 'Braille signage missing for Controller of Examinations office',
    'Door placards lack tactile Braille text, making room identification difficult for visually impaired students during exam registration.',
    'Signage', 'ADMIN BLOCK', 'Ground Floor Corridor', 'Room AD-104 (CoE Office)', 12.840300, 80.153180,
    'Low', 'Resolved', 'Campus Signage Vendor'),

(1, 'Elevator B out of service - upper floor access blocked',
    'Elevator B in Men''s Hostel A Block has been halted for routine hoist rope replacement, leaving only stair access.',
    'Elevator/Lift', 'A BLOCK', 'Hostel Lobby West', 'Service elevator bank serving floors 1 to 9', 12.839800, 80.152400,
    'Critical', 'In Progress', 'Hostel Engineering Team'),

(1, 'Cracked pavement and tree root obstruction on hostel pathway',
    'Roots from roadside trees have dislodged pavers, creating an impassable 8cm lip for wheelchair users between D Block and Central Mess.',
    'Pathway', 'D BLOCK', 'Mess Walkway Route', 'Pathway leading towards Gazebo & Dining Hall', 12.839500, 80.152800,
    'High', 'Under Review', NULL),

(1, 'Missing grab rails in ground floor adapted shower room',
    'L-shaped safety grab rails next to the accessible shower seat were removed during tiling repair and need re-anchoring.',
    'Restroom', 'E BLOCK', 'Ground Floor Block Washrooms', 'Room E-008 Adapted Facility', 12.839200, 80.153100,
    'Medium', 'Assigned', 'Plumbing & Fitting Team'),

(1, 'Main porch entrance ramp has no non-slip coating',
    'During rains, the polished granite ramp at F Block main entrance becomes dangerously slippery for crutch and cane users.',
    'Wheelchair Ramp', 'F BLOCK', 'Main Entrance Porch', 'Front gate reception ramp', 12.838900, 80.153400,
    'High', 'Reported', NULL),

(1, 'Audible emergency alarm strobe not functioning in corridors',
    'High-visibility strobe beacon for hearing-impaired residents did not trigger on 2nd and 3rd floor corridors during scheduled drill.',
    'Other', 'B BLOCK', '2nd & 3rd Floor Residential Corridors', 'Near fire exit staircase B-2', 12.840100, 80.154600,
    'High', 'Assigned', 'Fire & Safety Maintenance Unit'),

(1, 'Handrail bracket detached on external entrance ramp',
    'Stainless steel handrail anchor bracket on the ramp has loosened from the masonry wall, causing noticeable sway.',
    'Handrail', 'C BLOCK', 'North Ramp to Dining Hall', 'Girls Hostel C Block garden entry', 12.840400, 80.154900,
    'Medium', 'Resolved', 'Campus Fabrication Workshop'),

(1, 'Heavy fire exit door spring tension impedes wheelchair egress',
    'Overhead door closer requires excessive push force (over 45N), preventing independent opening from a seated position.',
    'Entrance', 'AB-1', 'Ground Floor Auditorium Exit', 'West exit corridor leading to campus green', 12.840500, 80.153200,
    'Medium', 'Reported', NULL);

-- ---------------------------------------------------------
-- 3. Audit Trail Updates (Issue Updates)
-- ---------------------------------------------------------
INSERT INTO issue_updates (issue_id, updated_by, previous_status, new_status, comment) VALUES
(2, 2, 'Reported', 'Under Review', 'Complaint logged from faculty & students with mobility needs.'),
(2, 2, 'Under Review', 'Assigned', 'Dispatched Otis certified technician for optical sensor recalibration.'),
(3, 2, 'Reported', 'Under Review', 'Site measurements taken by estate accessibility inspection team.'),
(5, 2, 'Reported', 'Under Review', 'Civil team reviewing feasibility of adding a switchback ramp with 1:15 gradient.'),
(6, 2, 'Reported', 'Assigned', 'Security guards briefed to ensure no unauthorized parking. Work order issued to repaint.'),
(7, 2, 'Reported', 'Under Review', 'Specifications verified against ADA / Harmonised Guidelines standards.'),
(7, 2, 'Under Review', 'In Progress', 'Tactile acrylic plate fabricated.'),
(7, 2, 'In Progress', 'Resolved', 'Braille & high-contrast signage installed and verified at 1.4m eye height.'),
(8, 2, 'Reported', 'In Progress', 'Replacement parts delivered; technicians on site working on motor controller.'),
(9, 2, 'Reported', 'Under Review', 'Horticulture team and civil works evaluating root barrier installation.'),
(10, 2, 'Reported', 'Assigned', 'Heavy-duty 304 stainless steel grab bars assigned for installation.'),
(12, 2, 'Reported', 'Assigned', 'Wiring continuity fault suspected. Electrician dispatched.'),
(13, 2, 'Reported', 'In Progress', 'Chemical anchor bolts installed.'),
(13, 2, 'In Progress', 'Resolved', 'Handrail load-tested to 1.5 kN and certified safe.');
