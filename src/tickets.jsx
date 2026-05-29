import React, { useState, useEffect } from 'react';
import { I } from './icons';
import { DATA } from './data';
import { MAP_DATA } from './map-data';
import { Shell } from './shell';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUSES = [
  { id: 'open',        label: 'Open',        color: 'var(--fg-secondary)',  bg: 'var(--bg-hover-soft)'    },
  { id: 'in_progress', label: 'In Progress', color: 'var(--accent-blue)',   bg: 'var(--accent-blue-soft)' },
  { id: 'resolved',    label: 'Resolved',    color: 'var(--green)',         bg: 'var(--green-soft)'       },
];

function StatusPill({ status }) {
  const s = STATUSES.find(x => x.id === status) || STATUSES[0];
  return (
    <span className="ticket-status-pill" style={{ color: s.color, background: s.bg }}>
      <span className="ticket-status-pill__dot" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function PriorityPill() {
  return (
    <span className="ticket-priority-pill">
      <I.Flag size={11} />
      High
    </span>
  );
}

function PersonCell({ personId }) {
  const person = DATA.PEOPLE.find(p => p.id === personId);
  if (!person) return <span className="muted small">—</span>;
  return (
    <div className="assignee-stack">
      <div className="avatar" style={{ '--c1': person.c1, '--c2': person.c2 }} title={person.name}>
        {person.initials}
      </div>
      <span className="assignee-stack__more">{person.name}</span>
    </div>
  );
}

function AffectedBookingsSummary({ resourceId, onSeeAll }) {
  const bookings = DATA.DEMO_BOOKINGS?.[resourceId] || [];
  if (bookings.length === 0) return null;
  const preview = bookings.slice(0, 2);
  return (
    <div className="ticket-sidebar__section">
      <div className="affected-bookings-summary">
        <div className="affected-bookings-summary__headline">
          {bookings.length} upcoming bookings may be impacted
        </div>
        {preview.map(b => (
          <div key={b.id} className="affected-bookings-summary__item">
            <span className="affected-bookings-summary__time">{b.start}</span>
            <span className="affected-bookings-summary__title">{b.title}</span>
          </div>
        ))}
        <button className="affected-bookings-summary__cta" onClick={onSeeAll}>
          {bookings.length > 2 ? `+${bookings.length - 2} more · ` : ''}See all bookings →
        </button>
      </div>
    </div>
  );
}

function AffectedBookingsDetail({ ticket, onBack, onClose }) {
  const [confirmed, setConfirmed] = useState(() => new Set());
  const [toast, setToast] = useState(null);
  const bookings = DATA.DEMO_BOOKINGS?.[ticket.id] || [];

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const confirm = (b) => {
    if (confirmed.has(b.id)) return;
    setConfirmed(prev => new Set([...prev, b.id]));
    const suggested = MAP_DATA.MAP_SPACES.find(s => s.id === b.suggestedSpaceId);
    setToast(`Booked · ${suggested?.name || 'Space'} · ${b.start} – ${b.end}`);
  };

  return (
    <aside className="ticket-sidebar">
      {toast && (
        <div className="booking-toast">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5 8.5 6 12 13.5 4"/></svg>
          {toast}
        </div>
      )}
      <div className="ticket-sidebar__header">
        <div className="ticket-sidebar__header-identity">
          <button className="iconbtn" onClick={onBack} aria-label="Back" style={{ marginRight: 2 }}>
            <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><I.ChevronR size={16} /></span>
          </button>
          <div>
            <div className="ticket-sidebar__title">Upcoming bookings</div>
            <div className="ticket-sidebar__loc">{ticket.resourceName} · {ticket.floor}</div>
          </div>
        </div>
        <button className="iconbtn" onClick={onClose} aria-label="Close"><I.Close /></button>
      </div>

      <div className="affected-bookings-subtitle">
        Here are suggestions to rebook today's events in {ticket.resourceName}
      </div>

      <div className="affected-bookings-list">
        {bookings.map((b, i) => {
          const suggested  = MAP_DATA.MAP_SPACES.find(s => s.id === b.suggestedSpaceId);
          const organizer  = DATA.PEOPLE.find(p => p.id === b.organizerId);
          const isConfirmed = confirmed.has(b.id);
          return (
            <React.Fragment key={b.id}>
              <div className="affected-booking-entry">
                <div className="affected-booking-entry__time">{b.start} – {b.end}</div>
                <div className="affected-booking-entry__title">{b.title}</div>
                {organizer && (
                  <div className="affected-booking-entry__organizer">
                    <div className="avatar avatar--xs" style={{ '--c1': organizer.c1, '--c2': organizer.c2 }}>{organizer.initials}</div>
                    <span>{organizer.name}</span>
                  </div>
                )}
                <div className="affected-booking-entry__space-row">
                  <div className="affected-booking-entry__thumb"><I.Spaces size={22} /></div>
                  <div className="affected-booking-entry__space-info">
                    <div className="affected-booking-entry__space-name">{suggested?.name || 'No suggestion'}</div>
                    <div className="affected-booking-entry__space-floor">Floor 4</div>
                  </div>
                  <button
                    className={`affected-booking-entry__check ${isConfirmed ? 'affected-booking-entry__check--booked' : ''}`}
                    onClick={() => confirm(b)}
                    aria-label="Book this space"
                    disabled={isConfirmed}
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2.5 8.5 6 12 13.5 4" />
                    </svg>
                  </button>
                </div>
                {b.tags && b.tags.length > 0 && (
                  <div className="affected-booking-entry__tags">
                    {b.tags.map(tag => (
                      <span key={tag} className="affected-booking-entry__tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              {i < bookings.length - 1 && <div className="affected-booking-entry__divider" />}
            </React.Fragment>
          );
        })}
      </div>
    </aside>
  );
}

function TicketSidebar({ ticket, onClose, onStatusChange }) {
  const [showBookings, setShowBookings] = useState(false);

  const assignees = (ticket.assignees || []).map(id => DATA.PEOPLE.find(p => p.id === id)).filter(Boolean);
  const reporter  = DATA.PEOPLE.find(p => p.id === ticket.reporterId);
  const ResourceIcon = ticket.resourceType === 'space' ? I.Spaces : ticket.resourceType === 'desk' ? I.Desk : I.Star;
  const currentStatus = STATUSES.find(s => s.id === ticket.status) || STATUSES[0];

  if (showBookings) {
    return <AffectedBookingsDetail ticket={ticket} onBack={() => setShowBookings(false)} onClose={onClose} />;
  }

  return (
    <aside className="ticket-sidebar">
      <div className="ticket-sidebar__header">
        <div className="ticket-sidebar__header-identity">
          <div className="ticket-sidebar__header-icon"><ResourceIcon size={16} /></div>
          <div>
            <div className="ticket-sidebar__title">{ticket.resourceName || 'Ticket'}</div>
            <div className="ticket-sidebar__loc">
              {[ticket.floor, ticket.buildingName].filter(Boolean).join(' · ')}
            </div>
            <div className="ticket-sidebar__created">{formatDate(ticket.createdAt)}</div>
          </div>
        </div>
        <button className="iconbtn" onClick={onClose} aria-label="Close"><I.Close /></button>
      </div>

      <div className="ticket-sidebar__body">
        {(ticket.description || ticket.issueType) && (
          <div className="ticket-sidebar__description">{ticket.description || ticket.issueType}</div>
        )}
        <div className="ticket-sidebar__section">
          <div className="ticket-sidebar__section-label">Status</div>
          <div className="ticket-status-select-wrap" style={{ '--status-color': currentStatus.color, '--status-bg': currentStatus.bg }}>
            <select
              className="ticket-status-select"
              value={ticket.status}
              onChange={e => onStatusChange(ticket.id, e.target.value)}
            >
              {STATUSES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {ticket.priority === 'high' && (
          <div className="ticket-sidebar__section">
            <div className="ticket-sidebar__section-label">Priority</div>
            <PriorityPill />
          </div>
        )}

        {reporter && (
          <div className="ticket-sidebar__section">
            <div className="ticket-sidebar__section-label">Reported by</div>
            <div className="assignee-stack">
              <div className="avatar" style={{ '--c1': reporter.c1, '--c2': reporter.c2 }} title={reporter.name}>
                {reporter.initials}
              </div>
              <span className="assignee-stack__more">{reporter.name}</span>
            </div>
          </div>
        )}

        {assignees.length > 0 && (
          <div className="ticket-sidebar__section">
            <div className="ticket-sidebar__section-label">Assignee</div>
            <div className="assignee-stack">
              {assignees.map(p => (
                <div key={p.id} className="avatar" style={{ '--c1': p.c1, '--c2': p.c2 }} title={p.name}>
                  {p.initials}
                </div>
              ))}
              <span className="assignee-stack__more">
                {assignees.length === 1 ? assignees[0].name : `${assignees.length} people`}
              </span>
            </div>
          </div>
        )}

        <div className="ticket-sidebar__divider" />

        {ticket.resourceType === 'space' && (DATA.DEMO_BOOKINGS?.[ticket.id]?.length > 0) && (
          <>
            <AffectedBookingsSummary resourceId={ticket.id} onSeeAll={() => setShowBookings(true)} />
            <div className="ticket-sidebar__divider" />
          </>
        )}

        <div className="ticket-sidebar__section-label" style={{ marginBottom: 14 }}>Submitted details</div>

        {ticket.issueType && (
          <div className="ticket-sidebar__field">
            <div className="ticket-sidebar__field-label">What's the issue?</div>
            <div className="ticket-sidebar__field-value">{ticket.issueType}</div>
          </div>
        )}

        {ticket.amenities?.length > 0 && (
          <div className="ticket-sidebar__field">
            <div className="ticket-sidebar__field-label">Amenities affected</div>
            <div className="ticket-sidebar__field-value">{ticket.amenities.join(', ')}</div>
          </div>
        )}

        {ticket.isUnusable !== undefined && (
          <div className="ticket-sidebar__field">
            <div className="ticket-sidebar__field-label">Resource marked unusable?</div>
            <div className="ticket-sidebar__field-value">{ticket.isUnusable ? 'Yes' : 'No'}</div>
          </div>
        )}

        {(ticket.labeledAnswers || [])
          .filter(a => a.type !== 'choice')
          .map((a, i) => (
            <div key={i} className="ticket-sidebar__field">
              <div className="ticket-sidebar__field-label">{a.label}</div>
              <div className="ticket-sidebar__field-value">
                {a.type === 'file' ? <span className="ticket-sidebar__file-val"><I.Photo size={13} />{a.value}</span> : a.value}
              </div>
            </div>
          ))
        }
      </div>
    </aside>
  );
}

function getResourcePos(ticket) {
  const id = ticket.id;
  if (ticket.resourceType === 'space') {
    const s = MAP_DATA.MAP_SPACES.find(x => x.id === id);
    if (s) return { cx: s.x + s.w / 2, cy: s.y + s.h / 2, baseR: Math.min(s.w, s.h) * 0.38 };
  }
  if (ticket.resourceType === 'desk') {
    const d = MAP_DATA.MAP_DESKS.find(x => x.id === id);
    if (d) return { cx: d.x + d.w / 2, cy: d.y + d.h / 2, baseR: 16 };
  }
  if (ticket.resourceType === 'poi') {
    const p = MAP_DATA.MAP_POI.find(x => x.id === id);
    if (p) return { cx: p.x, cy: p.y, baseR: 20 };
  }
  return null;
}

function HeatmapBlob({ ticket, isHovered, anyHovered, isActive, onClick }) {
  const pos = getResourcePos(ticket);
  if (!pos) return null;
  const isHigh = ticket.priority === 'high';
  const isDim  = ticket.status === 'resolved';
  const color  = isHigh ? (isDim ? '#fca5a5' : '#ef4444') : (isDim ? '#fcd34d' : '#f59e0b');
  const { cx, cy, baseR } = pos;
  const scale  = isHovered ? 1.22 : 1;
  const opacity = anyHovered && !isHovered ? 0.25 : 1;
  return (
    <g
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transformOrigin: `${cx}px ${cy}px`,
        transform: `scale(${scale})`,
        opacity,
        transition: 'transform 220ms ease, opacity 220ms ease',
      }}
    >
      <circle cx={cx} cy={cy} r={baseR * 2.8} fill={color} opacity={0.10} />
      <circle cx={cx} cy={cy} r={baseR * 1.7} fill={color} opacity={0.20} />
      <circle cx={cx} cy={cy} r={baseR}        fill={color} opacity={isDim ? 0.35 : 0.50} />
      <circle cx={cx} cy={cy} r={baseR * 0.4}  fill={color} opacity={isDim ? 0.70 : 0.95} />
      {isActive && <circle cx={cx} cy={cy} r={baseR * 1.15} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="4 3" />}
    </g>
  );
}

function HeatmapPanel({ tickets, hoveredId, onHover, detailId, onDetailChange }) {
  return (
    <div className="heatmap-panel">
      <div className="heatmap-panel__header">
        <span className="heatmap-panel__count">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="heatmap-panel__list">
        {tickets.length === 0 ? (
          <div className="heatmap-panel__empty">No issues on this floor</div>
        ) : tickets.map(t => {
          const isHigh = t.priority === 'high';
          const st = STATUSES.find(s => s.id === t.status) || STATUSES[0];
          return (
            <div
              key={t.id}
              className={`heatmap-ticket-row ${hoveredId === t.id ? 'heatmap-ticket-row--hovered' : ''} ${detailId === t.id ? 'heatmap-ticket-row--active' : ''}`}
              onMouseEnter={() => onHover(t.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onDetailChange(t.id)}
            >
              <span className={`heatmap-ticket-row__dot ${isHigh ? 'heatmap-ticket-row__dot--high' : 'heatmap-ticket-row__dot--normal'}`} />
              <div className="heatmap-ticket-row__body">
                <div className="heatmap-ticket-row__desc">{t.description || t.issueType || 'Issue reported'}</div>
                <div className="heatmap-ticket-row__meta">{t.resourceName}{t.floor ? ` · ${t.floor}` : ''}</div>
              </div>
              <span className="ticket-status-pill" style={{ color: st.color, background: st.bg, flexShrink: 0, fontSize: 11 }}>
                <span className="status-pill__dot" style={{ background: st.color }} />{st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TicketsHeatmap({ tickets, hoveredId, onHover, detailId, onDetailChange }) {
  const mappable = tickets.filter(t => getResourcePos(t) !== null);

  return (
    <div className="heatmap-container">
      <div className="heatmap-controls">
        <div className="heatmap-legend">
          <span className="heatmap-legend__dot heatmap-legend__dot--high" />
          <span className="heatmap-legend__label">High priority</span>
          <span className="heatmap-legend__dot heatmap-legend__dot--normal" />
          <span className="heatmap-legend__label">Normal</span>
        </div>
      </div>

      <div className="map-canvas heatmap-canvas" style={{ borderRadius: 12 }}>
        <svg className="map-svg" viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg">
          <polygon className="map-floor" points="195,45 750,45 750,395 648,395 648,440 325,440 325,400 195,400" />
          <polygon className="map-floor" points="50,228 195,228 195,400 50,400" />

          {MAP_DATA.MAP_SPACES.map(s => (
            <rect key={s.id} x={s.x} y={s.y} width={s.w} height={s.h} rx="4" className="heatmap-bg-shape" />
          ))}
          {MAP_DATA.MAP_DESKS.map(d => (
            <rect key={d.id} x={d.x} y={d.y} width={d.w} height={d.h} rx="2" className="heatmap-bg-shape heatmap-bg-shape--desk" />
          ))}
          {MAP_DATA.MAP_POI.map(p => (
            <circle key={p.id} cx={p.x} cy={p.y} r={7} className="heatmap-bg-shape" />
          ))}

          {mappable.map(t => (
            <HeatmapBlob
              key={t.id}
              ticket={t}
              isHovered={hoveredId === t.id}
              anyHovered={hoveredId !== null}
              isActive={detailId === t.id}
              onClick={() => onDetailChange(detailId === t.id ? null : t.id)}
            />
          ))}

          {MAP_DATA.MAP_SPACES.map(s => (
            <text key={s.id} x={s.x + s.w / 2} y={s.y + s.h / 2} textAnchor="middle" dominantBaseline="middle" className="heatmap-space-label">
              {s.name}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function TicketsPage({ onNavigate, reports, onReport }) {
  const [selectedId, setSelectedId] = useState(null);
  const [buildingFilter, setBuildingFilter] = useState('sf');
  const [floorFilter, setFloorFilter] = useState('Floor 4');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('table');
  const [mapHoveredId, setMapHoveredId] = useState(null);
  const [mapDetailId, setMapDetailId] = useState(null);

  const STATUS_ORDER = { open: 0, in_progress: 1, resolved: 2 };
  const RESOURCE_ORDER = { space: 0, desk: 1, locker: 2, parking: 3, laptop: 4, poi: 5 };

  const toggleSort = (col) => setSortBy(prev => prev === col ? `${col}_desc` : col);

  const allTickets = Object.entries(reports)
    .map(([id, r]) => ({ id, ...r }))
    .sort((a, b) => {
      const dir = sortBy.endsWith('_desc') ? -1 : 1;
      const col = sortBy.replace('_desc', '');
      if (col === 'floor') {
        return dir * (a.floor || '').localeCompare(b.floor || '');
      }
      if (col === 'resourceType') {
        return dir * ((RESOURCE_ORDER[a.resourceType] ?? 99) - (RESOURCE_ORDER[b.resourceType] ?? 99));
      }
      if (col === 'priority') {
        const pA = a.priority === 'high' ? 0 : 1;
        const pB = b.priority === 'high' ? 0 : 1;
        return dir * (pA - pB);
      }
      if (col === 'status') {
        return dir * ((STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0));
      }
      const pA = a.priority === 'high' ? 0 : 1;
      const pB = b.priority === 'high' ? 0 : 1;
      if (pA !== pB) return pA - pB;
      return (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
    });

  const RESOURCE_LABELS = { space: 'Spaces', desk: 'Desks', locker: 'Lockers', parking: 'Parking', laptop: 'Laptops', poi: 'Points of interest' };
  const buildingOptions = DATA.BUILDINGS.filter(b => allTickets.some(t => t.buildingId === b.id));
  const floorOptions    = buildingFilter !== 'all'
    ? (MAP_DATA.MAP_FLOORS[buildingFilter] || Array.from(new Set(allTickets.filter(t => t.buildingId === buildingFilter).map(t => t.floor).filter(Boolean))))
    : [];
  const resourceTypeOptions = Array.from(new Set(allTickets.map(t => t.resourceType).filter(Boolean))).sort((a, b) => (RESOURCE_ORDER[a] ?? 99) - (RESOURCE_ORDER[b] ?? 99));
  const tickets = allTickets
    .filter(t => buildingFilter === 'all' || t.buildingId === buildingFilter)
    .filter(t => floorFilter === 'all'    || t.floor === floorFilter)
    .filter(t => resourceFilter === 'all' || t.resourceType === resourceFilter);
  const selectedTicket = allTickets.find(t => t.id === selectedId) || null;

  const handleStatusChange = (resourceId, status) => {
    onReport(resourceId, { ...reports[resourceId], status });
  };

  return (
    <div className="app">
      <Shell.Rail activePage="tickets" onNavigate={onNavigate} />
      <main className="main">
        <div className="tickets-page-header">
          <h1 className="main__title">Tickets</h1>
        </div>

        <div className="tabs">
          <div className="tab tab--active">Issue reports</div>
          <div className="tab">Service requests</div>
        </div>

        <div className="tickets-filter-bar">
          {buildingOptions.length > 0 && (
            <select className="tickets-filter-select" value={buildingFilter}
              onChange={e => { setBuildingFilter(e.target.value); setFloorFilter('all'); }}>
              <option value="all">All buildings</option>
              {buildingOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          {buildingFilter !== 'all' && floorOptions.length > 0 && (
            <select className="tickets-filter-select" value={floorFilter} onChange={e => setFloorFilter(e.target.value)}>
              <option value="all">All floors</option>
              {floorOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
          {resourceTypeOptions.length > 1 && (
            <select className="tickets-filter-select" value={resourceFilter} onChange={e => setResourceFilter(e.target.value)}>
              <option value="all">All resources</option>
              {resourceTypeOptions.map(type => <option key={type} value={type}>{RESOURCE_LABELS[type] || type}</option>)}
            </select>
          )}
          <div className="tickets-view-toggle" style={{ marginLeft: 'auto' }}>
            <button className={`tickets-view-toggle__btn ${viewMode === 'table' ? 'tickets-view-toggle__btn--active' : ''}`} onClick={() => setViewMode('table')} title="Table view">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="14" height="3" rx="1"/><rect x="1" y="6" width="14" height="3" rx="1"/><rect x="1" y="11" width="14" height="3" rx="1"/></svg>
            </button>
            <button className={`tickets-view-toggle__btn ${viewMode === 'map' ? 'tickets-view-toggle__btn--active' : ''}`} onClick={() => setViewMode('map')} title="Map view">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a5 5 0 0 0-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
            </button>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="card empty" style={{ marginTop: 32 }}>
            <svg className="illus" viewBox="0 0 200 130" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="55" y="25" width="90" height="80" rx="6" />
              <line x1="75" y1="50" x2="125" y2="50" />
              <line x1="75" y1="65" x2="125" y2="65" />
              <line x1="75" y1="80" x2="105" y2="80" />
              <circle cx="150" cy="88" r="18" />
              <line x1="143" y1="88" x2="157" y2="88" />
              <line x1="150" y1="81" x2="150" y2="95" />
            </svg>
            <h2 className="empty__title">No tickets yet</h2>
            <p className="empty__sub">Tickets appear here once users submit issue reports from the map view.</p>
          </div>
        ) : viewMode === 'map' ? (
          <TicketsHeatmap
            tickets={tickets.filter(t => t.status !== 'resolved')}
            hoveredId={mapHoveredId}
            onHover={setMapHoveredId}
            detailId={mapDetailId}
            onDetailChange={setMapDetailId}
          />
        ) : (
          <div className="summary-card" style={{ marginTop: 8 }}>
            <table className="summary-table tickets-table">
              <thead>
                <tr>
                  <th className="tickets-table__sortable-th" onClick={() => toggleSort('priority')}>
                    Priority {sortBy === 'priority' ? '↑' : sortBy === 'priority_desc' ? '↓' : <span className="tickets-table__sort-hint">↕</span>}
                  </th>
                  <th className="tickets-table__sortable-th" onClick={() => toggleSort('status')}>
                    Status {sortBy === 'status' ? '↑' : sortBy === 'status_desc' ? '↓' : <span className="tickets-table__sort-hint">↕</span>}
                  </th>
                  <th>Description</th>
                  <th className="tickets-table__sortable-th" onClick={() => toggleSort('resourceType')}>
                    Resource type {sortBy === 'resourceType' ? '↑' : sortBy === 'resourceType_desc' ? '↓' : <span className="tickets-table__sort-hint">↕</span>}
                  </th>
                  <th className="tickets-table__sortable-th" onClick={() => toggleSort('floor')}>
                    Floor {sortBy === 'floor' ? '↑' : sortBy === 'floor_desc' ? '↓' : <span className="tickets-table__sort-hint">↕</span>}
                  </th>
                  <th>Reporter</th>
                  <th>Assignee</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => {
                  const assignees = (ticket.assignees || []).map(id => DATA.PEOPLE.find(p => p.id === id)).filter(Boolean);
                  const ResourceIcon = ticket.resourceType === 'space' ? I.Spaces : ticket.resourceType === 'desk' ? I.Desk : I.Star;
                  const isSelected = selectedId === ticket.id;

                  return (
                    <tr
                      key={ticket.id}
                      className={`summary-building-row tickets-table__row ${isSelected ? 'tickets-table__row--selected' : ''}`}
                      onClick={() => setSelectedId(isSelected ? null : ticket.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{ticket.priority === 'high' ? <PriorityPill /> : <span className="muted small">—</span>}</td>
                      <td><StatusPill status={ticket.status} /></td>
                      <td>
                        <span className="ticket-desc">{ticket.description || ticket.issueType || 'Issue reported'}</span>
                      </td>
                      <td>
                        <div className="cell-building">
                          <div className="cell-building__icon"><ResourceIcon size={16} /></div>
                          <div className="ticket-resource-cell__name">{ticket.resourceName}</div>
                        </div>
                      </td>
                      <td><span className="ticket-floor-cell">{ticket.floor || '—'}</span></td>
                      <td><PersonCell personId={ticket.reporterId} /></td>
                      <td>
                        {assignees.length > 0 ? (
                          <div className="assignee-stack">
                            {assignees.slice(0, 3).map(p => (
                              <div key={p.id} className="avatar" style={{ '--c1': p.c1, '--c2': p.c2 }} title={p.name}>
                                {p.initials}
                              </div>
                            ))}
                            <span className="assignee-stack__more">
                              {assignees.length === 1 ? assignees[0].name : `${assignees.length} people`}
                            </span>
                          </div>
                        ) : <span className="muted small">—</span>}
                      </td>
                      <td><span className="ticket-created">{formatDate(ticket.createdAt)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {viewMode === 'table' && selectedTicket && (
        <TicketSidebar
          key={selectedTicket.id}
          ticket={selectedTicket}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {viewMode === 'map' && !mapDetailId && (
        <HeatmapPanel
          tickets={tickets.filter(t => t.status !== 'resolved' && getResourcePos(t) !== null)}
          hoveredId={mapHoveredId}
          onHover={setMapHoveredId}
          detailId={mapDetailId}
          onDetailChange={setMapDetailId}
        />
      )}

      {viewMode === 'map' && mapDetailId && (() => {
        const t = allTickets.find(t => t.id === mapDetailId);
        return t ? (
          <TicketSidebar
            key={t.id}
            ticket={t}
            onClose={() => setMapDetailId(null)}
            onStatusChange={handleStatusChange}
          />
        ) : null;
      })()}
    </div>
  );
}
