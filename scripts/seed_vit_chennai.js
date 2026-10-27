/**
 * VIT Chennai Campus Seed Script
 * Populates realistic accessibility issues across:
 * - Men's Hostels: A BLOCK, D BLOCK, E BLOCK, F BLOCK
 * - Girls' Hostels: B BLOCK, C BLOCK
 * - Academic Blocks: AB-1, AB-2, AB-3, AB-4, AB-5
 * - Administrative Block: ADMIN BLOCK
 */

const pool = require('../backend/src/config/db');

const vitIssues = [
  {
    title: 'Lift 3 door sensor malfunction on 3rd floor',
    description: 'Elevator 3 doors close too quickly without detecting wheelchair occupants or crutches, presenting a safety hazard.',
    category: 'Elevator/Lift',
    location_building: 'AB-2',
    location_area: 'Core Lift Lobby, 3rd Floor',
    location_description: 'Adjacent to Dean office corridor',
    latitude: 12.840750,
    longitude: 80.153420,
    priority: 'Critical',
    status: 'Assigned',
    assigned_to: 'Otis Maintenance Team',
    updates: [
      { prev: 'Reported', next: 'Under Review', comment: 'Complaint logged from faculty & students with mobility needs.' },
      { prev: 'Under Review', next: 'Assigned', comment: 'Dispatched Otis certified technician for optical sensor recalibration.' }
    ]
  },
  {
    title: 'Tactile paving missing at entrance staircase',
    description: 'Warning tactile blister paving is missing before the exterior flight of stairs, creating a tripping hazard for visually impaired students.',
    category: 'Pathway',
    location_building: 'AB-3',
    location_area: 'South Entrance Plaza',
    location_description: 'Main pedestrian ramp intersection',
    latitude: 12.840920,
    longitude: 80.153810,
    priority: 'High',
    status: 'Under Review',
    assigned_to: null,
    updates: [
      { prev: 'Reported', next: 'Under Review', comment: 'Site measurements taken by estate accessibility inspection team.' }
    ]
  },
  {
    title: 'Accessible restroom door latch jammed',
    description: 'Special needs accessible restroom door latch on the 1st floor requires excessive force to operate and grab rail is loose.',
    category: 'Restroom',
    location_building: 'AB-4',
    location_area: '1st Floor East Wing',
    location_description: 'Opposite Seminar Hall 401',
    latitude: 12.841200,
    longitude: 80.153950,
    priority: 'Medium',
    status: 'Reported',
    assigned_to: null,
    updates: []
  },
  {
    title: 'Steep slope on rear entrance connecting ramp',
    description: 'Ramp gradient exceeds 1:12 slope and lacks intermediate rest landings between AB-4 and AB-5 crossover corridor.',
    category: 'Wheelchair Ramp',
    location_building: 'AB-5',
    location_area: 'Ground Floor Link Bridge',
    location_description: 'Near Central Food Court side ramp',
    latitude: 12.841510,
    longitude: 80.154200,
    priority: 'High',
    status: 'Under Review',
    assigned_to: null,
    updates: [
      { prev: 'Reported', next: 'Under Review', comment: 'Civil team reviewing feasibility of adding a switchback ramp with 1:15 gradient.' }
    ]
  },
  {
    title: 'Accessible parking bay occupied & faded signage',
    description: 'Dedicated accessibility parking spot near the Administrative entrance has faded blue paint and missing upright international wheelchair symbol sign.',
    category: 'Accessible Parking',
    location_building: 'ADMIN BLOCK',
    location_area: 'Visitor Parking Lot A',
    location_description: 'First two bays closest to Admissions foyer',
    latitude: 12.840210,
    longitude: 80.153100,
    priority: 'Medium',
    status: 'Assigned',
    assigned_to: 'Estate Office Security',
    updates: [
      { prev: 'Reported', next: 'Assigned', comment: 'Security guards briefed to ensure no unauthorized parking. Work order issued to repaint.' }
    ]
  },
  {
    title: 'Braille signage missing for Controller of Examinations office',
    description: 'Door placards lack tactile Braille text, making room identification difficult for visually impaired students during exam registration.',
    category: 'Signage',
    location_building: 'ADMIN BLOCK',
    location_area: 'Ground Floor Corridor',
    location_description: 'Room AD-104 (CoE Office)',
    latitude: 12.840300,
    longitude: 80.153180,
    priority: 'Low',
    status: 'Resolved',
    assigned_to: 'Campus Signage Vendor',
    updates: [
      { prev: 'Reported', next: 'Under Review', comment: 'Specifications verified against ADA / Harmonised Guidelines standards.' },
      { prev: 'Under Review', next: 'In Progress', comment: 'Tactile acrylic plate fabricated.' },
      { prev: 'In Progress', next: 'Resolved', comment: 'Braille & high-contrast signage installed and verified at 1.4m eye height.' }
    ]
  },
  {
    title: 'Elevator B out of service - upper floor access blocked',
    description: 'Elevator B in Men\'s Hostel A Block has been halted for routine hoist rope replacement, leaving only stair access.',
    category: 'Elevator/Lift',
    location_building: 'A BLOCK',
    location_area: 'Hostel Lobby West',
    location_description: 'Service elevator bank serving floors 1 to 9',
    latitude: 12.839800,
    longitude: 80.152400,
    priority: 'Critical',
    status: 'In Progress',
    assigned_to: 'Hostel Engineering Team',
    updates: [
      { prev: 'Reported', next: 'In Progress', comment: 'Replacement parts delivered; technicians on site working on motor controller.' }
    ]
  },
  {
    title: 'Cracked pavement and tree root obstruction on hostel pathway',
    description: 'Roots from roadside trees have dislodged pavers, creating an impassable 8cm lip for wheelchair users between D Block and Central Mess.',
    category: 'Pathway',
    location_building: 'D BLOCK',
    location_area: 'Mess Walkway Route',
    location_description: 'Pathway leading towards Gazebo & Dining Hall',
    latitude: 12.839500,
    longitude: 80.152800,
    priority: 'High',
    status: 'Under Review',
    assigned_to: null,
    updates: [
      { prev: 'Reported', next: 'Under Review', comment: 'Horticulture team and civil works evaluating root barrier installation.' }
    ]
  },
  {
    title: 'Missing grab rails in ground floor adapted shower room',
    description: 'L-shaped safety grab rails next to the accessible shower seat were removed during tiling repair and need re-anchoring.',
    category: 'Restroom',
    location_building: 'E BLOCK',
    location_area: 'Ground Floor Block Washrooms',
    location_description: 'Room E-008 Adapted Facility',
    latitude: 12.839200,
    longitude: 80.153100,
    priority: 'Medium',
    status: 'Assigned',
    assigned_to: 'Plumbing & Fitting Team',
    updates: [
      { prev: 'Reported', next: 'Assigned', comment: 'Heavy-duty 304 stainless steel grab bars assigned for installation.' }
    ]
  },
  {
    title: 'Main porch entrance ramp has no non-slip coating',
    description: 'During rains, the polished granite ramp at F Block main entrance becomes dangerously slippery for crutch and cane users.',
    category: 'Wheelchair Ramp',
    location_building: 'F BLOCK',
    location_area: 'Main Entrance Porch',
    location_description: 'Front gate reception ramp',
    latitude: 12.838900,
    longitude: 80.153400,
    priority: 'High',
    status: 'Reported',
    assigned_to: null,
    updates: []
  },
  {
    title: 'Audible emergency alarm strobe not functioning in corridors',
    description: 'High-visibility strobe beacon for hearing-impaired residents did not trigger on 2nd and 3rd floor corridors during scheduled drill.',
    category: 'Other',
    location_building: 'B BLOCK',
    location_area: '2nd & 3rd Floor Residential Corridors',
    location_description: 'Near fire exit staircase B-2',
    latitude: 12.840100,
    longitude: 80.154600,
    priority: 'High',
    status: 'Assigned',
    assigned_to: 'Fire & Safety Maintenance Unit',
    updates: [
      { prev: 'Reported', next: 'Assigned', comment: 'Wiring continuity fault suspected. Electrician dispatched.' }
    ]
  },
  {
    title: 'Handrail bracket detached on external entrance ramp',
    description: 'Stainless steel handrail anchor bracket on the ramp has loosened from the masonry wall, causing noticeable sway.',
    category: 'Handrail',
    location_building: 'C BLOCK',
    location_area: 'North Ramp to Dining Hall',
    location_description: 'Girls Hostel C Block garden entry',
    latitude: 12.840400,
    longitude: 80.154900,
    priority: 'Medium',
    status: 'Resolved',
    assigned_to: 'Campus Fabrication Workshop',
    updates: [
      { prev: 'Reported', next: 'In Progress', comment: 'Chemical anchor bolts installed.' },
      { prev: 'In Progress', next: 'Resolved', comment: 'Handrail load-tested to 1.5 kN and certified safe.' }
    ]
  },
  {
    title: 'Heavy fire exit door spring tension impedes wheelchair egress',
    description: 'Overhead door closer requires excessive push force (over 45N), preventing independent opening from a seated position.',
    category: 'Entrance',
    location_building: 'AB-1',
    location_area: 'Ground Floor Auditorium Exit',
    location_description: 'West exit corridor leading to campus green',
    latitude: 12.840500,
    longitude: 80.153200,
    priority: 'Medium',
    status: 'Reported',
    assigned_to: null,
    updates: []
  }
];

async function seedVitChennai() {
  console.log('Connecting to database...');
  const client = await pool.connect();

  try {
    // Check user 1 and user 2
    const uRes = await client.query('SELECT id, name, role FROM users ORDER BY id ASC');
    if (uRes.rows.length === 0) {
      throw new Error('No users found in database! Please register or seed a user first.');
    }
    const studentId = uRes.rows[0].id;
    const adminId = uRes.rows.find(u => u.role === 'admin')?.id || studentId;

    console.log(`Using Reporter ID: ${studentId}, Admin ID: ${adminId}`);

    for (const item of vitIssues) {
      // Check if title already exists to avoid duplicates
      const existing = await client.query('SELECT id FROM accessibility_issues WHERE title = $1', [item.title]);
      if (existing.rows.length > 0) {
        console.log(`- Skipping "${item.title}" (already exists as ID #${existing.rows[0].id})`);
        continue;
      }

      const res = await client.query(
        `INSERT INTO accessibility_issues
         (user_id, title, description, category, location_building, location_area, location_description,
          latitude, longitude, priority, status, assigned_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          studentId,
          item.title,
          item.description,
          item.category,
          item.location_building,
          item.location_area,
          item.location_description,
          item.latitude,
          item.longitude,
          item.priority,
          item.status,
          item.assigned_to
        ]
      );

      const newId = res.rows[0].id;
      console.log(`✓ Added [${item.location_building}] #${newId}: "${item.title}" (${item.status})`);

      for (const u of item.updates) {
        await client.query(
          `INSERT INTO issue_updates (issue_id, updated_by, previous_status, new_status, comment)
           VALUES ($1, $2, $3, $4, $5)`,
          [newId, adminId, u.prev, u.next, u.comment]
        );
      }
    }

    const countRes = await client.query('SELECT count(*) FROM accessibility_issues');
    console.log(`\nAll done! Total accessibility issues now in database: ${countRes.rows[0].count}`);
  } finally {
    client.release();
    await pool.end();
  }
}

seedVitChennai().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
