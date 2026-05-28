// Static data for the prototype

const PEOPLE = [
  { id: 'alex',    name: 'Alex Chen',       role: 'Office Admin',         c1: '#b58d6b', c2: '#7d5f49', initials: 'AC' },
  { id: 'jordan',  name: 'Jordan Park',     role: 'Facilities Manager',   c1: '#6a8fce', c2: '#3e5fa0', initials: 'JP' },
  { id: 'sam',     name: 'Sam Rivera',      role: 'IT Operations Lead',   c1: '#5fb198', c2: '#3a8170', initials: 'SR' },
  { id: 'priya',   name: 'Priya Shah',      role: 'Workplace Experience', c1: '#c47ab4', c2: '#925189', initials: 'PS' },
  { id: 'marcus',  name: 'Marcus Webb',     role: 'Security & Access',    c1: '#d39158', c2: '#a06736', initials: 'MW' },
  { id: 'team',    name: 'Facilities Team', role: 'Group',                c1: '#7e8aa3', c2: '#4f5a72', initials: 'FT' },
  { id: 'rc',      name: 'Rebekah C.',      role: 'Workplace Manager',    c1: '#9b7dd4', c2: '#6a4fa8', initials: 'RC' },
];

const BUILDINGS = [
  { id: 'sf',  name: 'San Francisco HQ',   address: '525 Market St · 12 floors · 840 seats' },
  { id: 'nyc', name: 'New York',           address: '1 Park Ave · 4 floors · 320 seats' },
  { id: 'lon', name: 'London',             address: '20 Old Bailey · 6 floors · 410 seats' },
  { id: 'atx', name: 'Austin',             address: '2nd & Brazos · 3 floors · 180 seats' },
  { id: 'sgp', name: 'Singapore',          address: 'Marina One · 2 floors · 95 seats' },
];

const RESOURCES = [
  { id: 'spaces',  name: 'Spaces',           sub: 'Rooms, lounges, phone booths', icon: 'Spaces' },
  { id: 'desks',   name: 'Desks',            sub: 'Hot, hoteling & assigned',     icon: 'Desk' },
  { id: 'laptops', name: 'Laptops',          sub: 'Loaner & permanent assignment', icon: 'Laptop' },
  { id: 'parking', name: 'Parking spots',    sub: 'Covered, EV & visitor',         icon: 'Car' },
  { id: 'lockers', name: 'Lockers',          sub: 'Day-use & assigned',            icon: 'Locker' },
  { id: 'poi',     name: 'Points of Interest', sub: 'Kitchens, printers, A/V',     icon: 'Star' },
];

// Field types available in the form builder.
const QUESTION_TYPES = [
  { id: 'short',  label: 'Short text' },
  { id: 'long',   label: 'Long text' },
  { id: 'choice', label: 'Multiple choice' },
  { id: 'file',   label: 'File upload' },
  { id: 'date',   label: 'Date' },
  { id: 'yesno',  label: 'Yes / No' },
];

// Starting form questions per resource. Each gets an id at build time.
const DEFAULT_QUESTIONS = [
  { label: "What's the issue?",  type: 'choice', required: true,  multi: false,
    options: ['Cleanliness', 'Climate', 'Power/connectivity', 'Other'] },
  { label: 'Additional details', type: 'long',   required: false },
  { label: 'Upload a photo',     type: 'file',   required: false },
];

const POI_QUESTIONS = [
  { label: "What's the issue?",  type: 'choice', required: true,  multi: false,
    options: ['Cleanliness', 'Climate', 'Power/connectivity', 'Other'] },
  { label: 'Additional details', type: 'long',   required: false },
  { label: 'Upload a photo',     type: 'file',   required: false },
];

const QUESTION_STARTERS = {
  spaces:  DEFAULT_QUESTIONS,
  desks:   DEFAULT_QUESTIONS,
  laptops: DEFAULT_QUESTIONS,
  parking: DEFAULT_QUESTIONS,
  lockers: DEFAULT_QUESTIONS,
  poi:     POI_QUESTIONS,
};

// Rules. `resources` scopes a rule to specific resource types. `parent` makes a rule a
// child that only appears when its parent rule is on.
const RULES = [
  {
    id: 'mark_unusable',
    icon: 'AlertOctagon',
    title: 'Allow users to mark resource as unusable',
    sub: 'Reporters can flag a resource as unusable when filing an issue.',
    defaultOn: true,
    resources: ['spaces', 'desks', 'laptops', 'parking', 'lockers', 'poi'],
  },
  {
    id: 'take_offline',
    icon: 'AlertOctagon',
    title: 'If marked unusable, take resource offline',
    sub: 'The resource won\u2019t be bookable until the issue is resolved or you bring it back online.',
    defaultOn: true,
    resources: ['spaces', 'desks', 'laptops', 'parking', 'lockers'],
    parent: 'mark_unusable',
    config: { duration: 'until_resolved' },
  },
  {
    id: 'mark_high_priority',
    icon: 'Flag',
    title: 'If marked unusable, mark issue as high priority',
    sub: 'The issue will be flagged as high priority when a reporter marks the resource as unusable.',
    defaultOn: true,
    resources: ['spaces', 'desks', 'laptops', 'parking', 'lockers', 'poi'],
    parent: 'mark_unusable',
  },
];

// Resource types that support amenity selection in the issue form.
const AMENITY_RESOURCES = ['spaces', 'desks', 'parking', 'lockers'];

// Example amenities shown in the builder preview.
// The real form populates these from the specific resource's actual amenity list.
const AMENITY_EXAMPLES = {
  spaces:  ['Rally Bar Mini', 'Sayl Chair', 'Television', 'Laptop Power', 'Ethernet', 'High-top Seating'],
  desks:   ['Monitor', 'Chair', 'Laptop Stand', 'USB Hub', 'Ethernet'],
  parking: ['EV Charger', 'Covered Spot', 'Gate Access', 'Lighting'],
  lockers: ['Key Lock', 'Combo Lock', 'USB Charging', 'Mirror'],
};

// Sample resource instances shown in the form preview (one per resource type).
const PREVIEW_RESOURCE_SAMPLES = {
  spaces:  { name: 'Mission Control', floor: 'Floor 4' },
  desks:   { name: 'Desk 12-A',       floor: 'Floor 2' },
  laptops: { name: 'MacBook Pro #47', floor: null },
  parking: { name: 'Spot B-12',       floor: 'Level 1' },
  lockers: { name: 'Locker 204',      floor: 'Floor 2' },
  poi:     { name: 'Main Kitchen',    floor: 'Floor 3' },
};

// ---- Demo seed data ----
const _dq = (prefix) => ({
  id: `${prefix}-q0`, label: "What's the issue?", type: 'choice', required: true, multi: false,
  options: [
    { id: `${prefix}-o0`, text: 'Cleanliness' },
    { id: `${prefix}-o1`, text: 'Climate' },
    { id: `${prefix}-o2`, text: 'Power/connectivity' },
    { id: `${prefix}-o3`, text: 'Other' },
  ],
});
const _demoQs = (prefix) => [
  _dq(prefix),
  { id: `${prefix}-q1`, label: 'Additional details', type: 'long',  required: false },
  { id: `${prefix}-q2`, label: 'Upload a photo',     type: 'file',  required: false },
];
const _allRules    = { mark_unusable: true, take_offline: true, mark_high_priority: true };
const _allRuleCfg  = { take_offline: { duration: 'until_resolved' } };
const _poiRules    = { mark_unusable: true, mark_high_priority: true };
const _off         = { enabled: false, assignees: [], questions: [], rules: {}, ruleConfig: {} };

const DEMO_CONFIGS = {
  sf: {
    spaces:  { enabled: true, assignees: ['alex', 'jordan'], questions: _demoQs('sf-sp'), rules: _allRules, ruleConfig: _allRuleCfg },
    desks:   { enabled: true, assignees: ['sam'],            questions: _demoQs('sf-dk'), rules: _allRules, ruleConfig: _allRuleCfg },
    laptops: _off,
    parking: _off,
    lockers: _off,
    poi:     { enabled: true, assignees: ['alex'],           questions: _demoQs('sf-po'), rules: _poiRules, ruleConfig: {} },
  },
  nyc: {
    spaces:  { enabled: true, assignees: ['priya'],          questions: _demoQs('nyc-sp'), rules: _allRules, ruleConfig: _allRuleCfg },
    desks:   { enabled: true, assignees: ['priya', 'marcus'],questions: _demoQs('nyc-dk'), rules: _allRules, ruleConfig: _allRuleCfg },
    laptops: _off, parking: _off, lockers: _off,
    poi:     { enabled: true, assignees: ['priya'],          questions: _demoQs('nyc-po'), rules: _poiRules, ruleConfig: {} },
  },
};

const DEMO_REPORTS = {
  'mission-control': {
    isUnusable: true,  issueType: 'Climate',           amenities: ['Projector', 'Whiteboard'],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'AC unit making loud noises, room is too warm.' }],
    resourceName: 'Mission Control',   resourceType: 'space', buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['alex', 'jordan'], status: 'in_progress', priority: 'high', reporterId: 'marcus', createdAt: '2026-05-27T09:15:00Z',
    description: 'AC unit overheating, room too warm',
  },
  'echo-chamber': {
    isUnusable: false, issueType: 'Cleanliness',        amenities: [],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'Leftover food and trash from a previous meeting.' }],
    resourceName: 'Echo Chamber',      resourceType: 'space', buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['alex', 'jordan'], status: 'resolved', priority: 'normal', reporterId: 'priya', createdAt: '2026-05-24T14:30:00Z',
    description: 'Food and trash left from previous meeting',
  },
  'pulsar': {
    isUnusable: true,  issueType: 'Power/connectivity', amenities: ['HDMI', 'TV Screen'],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'HDMI connection to the display not working, cable may be damaged.' }],
    resourceName: 'Pulsar',            resourceType: 'space', buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['alex', 'jordan'], status: 'open', priority: 'high', reporterId: 'sam', createdAt: '2026-05-27T11:45:00Z',
    description: 'HDMI display connection not working',
  },
  'star-dust': {
    isUnusable: false, issueType: 'Cleanliness',        amenities: [],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'Coffee spill on the carpet near the whiteboard.' }],
    resourceName: 'Star Dust',         resourceType: 'space', buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['alex', 'jordan'], status: 'open', priority: 'normal', reporterId: 'jordan', createdAt: '2026-05-26T16:20:00Z',
    description: 'Coffee spill on carpet near whiteboard',
  },
  'millennium-falcon': {
    isUnusable: false, issueType: 'Climate',            amenities: ['Projector'],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'Room temperature too cold, thermostat appears stuck.' }],
    resourceName: 'Millennium Falcon', resourceType: 'space', buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['alex', 'jordan'], status: 'resolved', priority: 'normal', reporterId: 'priya', createdAt: '2026-05-22T10:00:00Z',
    description: 'Room too cold, thermostat stuck',
  },
  'desk-3': {
    isUnusable: true,  issueType: 'Power/connectivity', amenities: [],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'USB-C hub not charging, other ports also dead.' }],
    resourceName: 'Desk 4',            resourceType: 'desk',  buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['sam'], status: 'open', priority: 'high', reporterId: 'alex', createdAt: '2026-05-27T08:30:00Z',
    description: 'USB-C hub not charging',
  },
  'desk-8': {
    isUnusable: false, issueType: 'Cleanliness',        amenities: [],
    labeledAnswers: [],
    resourceName: 'Desk 9',            resourceType: 'desk',  buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['sam'], status: 'resolved', priority: 'normal', reporterId: 'marcus', createdAt: '2026-05-23T13:15:00Z',
    description: 'Desk needs cleaning',
  },
  'desk-12': {
    isUnusable: false, issueType: 'Other',              amenities: [],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'Chair is broken — one wheel is missing.' }],
    resourceName: 'Desk 13',           resourceType: 'desk',  buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['sam'], status: 'in_progress', priority: 'normal', reporterId: 'jordan', createdAt: '2026-05-25T09:00:00Z',
    description: 'Chair missing a wheel',
  },
  'desk-20': {
    isUnusable: true,  issueType: 'Power/connectivity', amenities: [],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'No power at this station, outlet may be faulty.' }],
    resourceName: 'Desk 21',           resourceType: 'desk',  buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['sam'], status: 'open', priority: 'high', reporterId: 'sam', createdAt: '2026-05-26T14:45:00Z',
    description: 'No power at desk station',
  },
  'desk-30': {
    isUnusable: false, issueType: 'Other',              amenities: [],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'Monitor arm is loose, needs tightening.' }],
    resourceName: 'Desk 31',           resourceType: 'desk',  buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['sam'], status: 'open', priority: 'normal', reporterId: 'alex', createdAt: '2026-05-27T10:30:00Z',
    description: 'Monitor arm loose, needs tightening',
  },
  'kitchen': {
    isUnusable: false, issueType: 'Cleanliness',        amenities: [],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'Refrigerator needs cleaning, expired food inside.' }],
    resourceName: 'Main Kitchen',      resourceType: 'poi',   buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['alex'], status: 'in_progress', priority: 'normal', reporterId: 'priya', createdAt: '2026-05-24T11:00:00Z',
    description: 'Expired food in refrigerator',
  },
  'printer-1': {
    isUnusable: true,  issueType: 'Power/connectivity', amenities: [],
    labeledAnswers: [{ label: 'Additional details', type: 'long', value: 'Printer offline, paper jam indicator is lit.' }],
    resourceName: 'Printer',           resourceType: 'poi',   buildingId: 'sf', buildingName: 'San Francisco HQ', floor: 'Floor 4',
    assignees: ['alex'], status: 'open', priority: 'high', reporterId: 'sam', createdAt: '2026-05-27T07:45:00Z',
    description: 'Printer offline — paper jam',
  },
};

const DEMO_BOOKINGS = {
  'mission-control': [
    { id: 'b0', title: 'Engineering Standup',  start: '8:00 AM',  end: '8:30 AM',  organizerId: 'sam',    attendeeCount: 4,  suggestedSpaceId: 'echo-chamber',      tags: ['Fits 4', 'Same floor', 'Has display']         },
    { id: 'b1', title: 'Q2 Planning Sync',     start: '9:00 AM',  end: '10:00 AM', organizerId: 'jordan', attendeeCount: 8,  suggestedSpaceId: 'asteroid',          tags: ['Fits 8', 'Same floor', 'Available now']       },
    { id: 'b2', title: 'Design Review',        start: '10:30 AM', end: '12:00 PM', organizerId: 'priya',  attendeeCount: 5,  suggestedSpaceId: 'star-dust',         tags: ['Fits 8', 'Same floor', 'Has whiteboard']      },
    { id: 'b3', title: 'Lunch & Learn',        start: '12:00 PM', end: '12:30 PM', organizerId: 'rc',     attendeeCount: 10, suggestedSpaceId: 'millennium-falcon', tags: ['Fits 12', 'Same amenities', 'Natural light']  },
    { id: 'b4', title: '1:1 Check-in',         start: '1:00 PM',  end: '2:00 PM',  organizerId: 'alex',   attendeeCount: 2,  suggestedSpaceId: 'echo-chamber',      tags: ['Fits 4', 'Quiet zone', 'Nearby']              },
    { id: 'b5', title: 'Recruiting Interview', start: '2:30 PM',  end: '3:00 PM',  organizerId: 'priya',  attendeeCount: 3,  suggestedSpaceId: 'asteroid',          tags: ['Fits 4', 'Same floor', 'Available now']       },
    { id: 'b6', title: 'All Hands Prep',       start: '3:00 PM',  end: '4:30 PM',  organizerId: 'jordan', attendeeCount: 8,  suggestedSpaceId: 'millennium-falcon', tags: ['Fits 12', 'Same amenities', 'Has display']    },
    { id: 'b7', title: 'End of Day Retro',     start: '5:00 PM',  end: '5:30 PM',  organizerId: 'sam',    attendeeCount: 6,  suggestedSpaceId: 'comet',             tags: ['Fits 6', 'Same floor', 'Has whiteboard']      },
  ],
  'pulsar': [
    { id: 'p1', title: 'Sprint Planning',      start: '9:30 AM',  end: '10:30 AM', organizerId: 'sam',    attendeeCount: 6,  suggestedSpaceId: 'comet',             tags: ['Fits 6', 'Same floor', 'Available now']       },
    { id: 'p2', title: 'Roadmap Review',       start: '11:00 AM', end: '11:30 AM', organizerId: 'jordan', attendeeCount: 4,  suggestedSpaceId: 'asteroid',          tags: ['Fits 4', 'Same floor', 'Has display']         },
    { id: 'p3', title: 'Vendor Sync',          start: '2:00 PM',  end: '3:00 PM',  organizerId: 'marcus', attendeeCount: 4,  suggestedSpaceId: 'asteroid',          tags: ['Fits 4', 'Same amenities', 'Nearby']          },
    { id: 'p4', title: 'Team Standup',         start: '4:00 PM',  end: '4:30 PM',  organizerId: 'sam',    attendeeCount: 5,  suggestedSpaceId: 'comet',             tags: ['Fits 6', 'Same floor', 'Available now']       },
  ],
  'star-dust': [
    { id: 's1', title: 'Interview Panel',      start: '10:00 AM', end: '11:00 AM', organizerId: 'priya',  attendeeCount: 4,  suggestedSpaceId: 'comet',             tags: ['Fits 6', 'Same floor', 'Quiet zone']          },
    { id: 's2', title: 'Leadership Sync',      start: '11:30 AM', end: '12:00 PM', organizerId: 'jordan', attendeeCount: 5,  suggestedSpaceId: 'supernova',         tags: ['Fits 10', 'Same amenities', 'Has display']    },
    { id: 's3', title: 'Product Demo',         start: '2:30 PM',  end: '3:30 PM',  organizerId: 'alex',   attendeeCount: 6,  suggestedSpaceId: 'asteroid',          tags: ['Fits 4', 'Has display', 'Same amenities']     },
    { id: 's4', title: 'OKR Review',           start: '4:00 PM',  end: '5:00 PM',  organizerId: 'rc',     attendeeCount: 5,  suggestedSpaceId: 'comet',             tags: ['Fits 6', 'Same floor', 'Natural light']       },
  ],
};

window.DATA = { PEOPLE, BUILDINGS, RESOURCES, QUESTION_TYPES, QUESTION_STARTERS, RULES, AMENITY_RESOURCES, AMENITY_EXAMPLES, PREVIEW_RESOURCE_SAMPLES, DEMO_CONFIGS, DEMO_REPORTS, DEMO_BOOKINGS };
