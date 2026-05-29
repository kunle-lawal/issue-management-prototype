const MAP_FLOORS = {
  sf:  ['Floor 1','Floor 2','Floor 3','Floor 4','Floor 5','Floor 6','Floor 7','Floor 8','Floor 9','Floor 10','Floor 11','Floor 12'],
  nyc: ['Floor 1','Floor 2','Floor 3','Floor 4'],
  lon: ['Floor 1','Floor 2','Floor 3','Floor 4','Floor 5','Floor 6'],
  atx: ['Floor 1','Floor 2','Floor 3'],
  sgp: ['Floor 1','Floor 2'],
};

const MAP_SPACES = [
  { id: 'mission-control',   name: 'Mission Control',   x: 200, y: 55,  w: 84,  h: 110, capacity: 8,  status: 'available' },
  { id: 'echo-chamber',      name: 'Echo Chamber',      x: 200, y: 175, w: 84,  h: 82,  capacity: 4,  status: 'available' },
  { id: 'pulsar',            name: 'Pulsar',            x: 298, y: 55,  w: 96,  h: 72,  capacity: 6,  status: 'busy'      },
  { id: 'star-dust',         name: 'Star Dust',         x: 408, y: 55,  w: 106, h: 72,  capacity: 8,  status: 'available' },
  { id: 'comet',             name: 'Comet',             x: 528, y: 55,  w: 96,  h: 72,  capacity: 6,  status: 'available' },
  { id: 'meteor',            name: 'Meteor',            x: 638, y: 55,  w: 98,  h: 72,  capacity: 6,  status: 'busy'      },
  { id: 'asteroid',          name: 'Asteroid',          x: 292, y: 234, w: 100, h: 72,  capacity: 4,  status: 'available' },
  { id: 'supernova',         name: 'Supernova',         x: 406, y: 234, w: 120, h: 72,  capacity: 10, status: 'busy'      },
  { id: 'millennium-falcon', name: 'Millennium Falcon', x: 650, y: 262, w: 90,  h: 110, capacity: 12, status: 'available' },
  { id: 'solaris',           name: 'Solaris',           x: 650, y: 385, w: 62,  h: 38,  capacity: 4,  status: 'available' },
  { id: 'starship',          name: 'Starship',          x: 55,  y: 298, w: 80,  h: 82,  capacity: 6,  status: 'available' },
];

const _rows = (sx, sy, cols, rows, dw, dh, gap) => {
  const out = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      out.push({ x: sx + c*(dw+gap), y: sy + r*(dh+gap), w: dw, h: dh });
  return out;
};

const _rawDesks = [
  ..._rows(302, 147, 4, 2, 22, 13, 5),
  ..._rows(424, 147, 4, 2, 22, 13, 5),
  ..._rows(546, 147, 4, 2, 22, 13, 5),
  ..._rows(295, 328, 4, 3, 22, 13, 5),
  ..._rows(423, 328, 4, 3, 22, 13, 5),
  ..._rows(548, 248, 3, 3, 22, 13, 5),
];

const MAP_DESKS = _rawDesks.map((d, i) => ({
  id: `desk-${i}`,
  name: `Desk ${i + 1}`,
  ...d,
  status: i % 4 === 0 ? 'assigned' : 'available',
}));

const MAP_POI = [
  { id: 'phone-1',      name: 'Phone Booth',   x: 740, y: 195 },
  { id: 'phone-2',      name: 'Phone Booth',   x: 740, y: 225 },
  { id: 'phone-3',      name: 'Phone Booth',   x: 740, y: 255 },
  { id: 'kitchen',      name: 'Main Kitchen',  x: 624, y: 198 },
  { id: 'printer-1',    name: 'Printer',       x: 548, y: 314 },
  { id: 'shuffleboard', name: 'Shuffleboard',  x: 700, y: 240 },
  { id: 'foosball',     name: 'Foosball',      x: 722, y: 398 },
];

export const MAP_DATA = { MAP_FLOORS, MAP_SPACES, MAP_DESKS, MAP_POI };
