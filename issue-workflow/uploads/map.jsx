// Map page: floor plan with resource detail sidebar
const { useState: useStateMap, useRef: useRefMap, useEffect: useEffectMap } = React;

// ---- Alternative suggestion helpers ----
function getSuggestion(resource) {
  if (resource.type === 'space') {
    const alt = MAP_DATA.MAP_SPACES.find(s => s.id !== resource.id && s.status === 'available');
    return alt ? { ...alt, type: 'space' } : null;
  }
  if (resource.type === 'desk') {
    const alt = MAP_DATA.MAP_DESKS.find(d => d.id !== resource.id && d.status === 'available');
    return alt ? { ...alt, type: 'desk' } : null;
  }
  return null;
}

function getSuggestionTags(resource) {
  const typeKey = resource.type === 'space' ? 'spaces' : 'desks';
  const tags = ['Same floor', 'Available now'];
  if (DATA.AMENITY_RESOURCES.includes(typeKey)) {
    const total = (DATA.AMENITY_EXAMPLES[typeKey] || []).length;
    if (total > 0) tags.push(`${total - 1} of ${total} amenities`);
  } else {
    tags.push('Same neighborhood');
  }
  return tags;
}

// ---- Toolbar dropdowns ----
function MapDropdown({ value, options, onChange }) {
  const [open, setOpen] = useStateMap(false);
  const ref = useRefMap(null);
  useEffectMap(() => {
    if (!open) return;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="map-dropdown__btn" onClick={() => setOpen(o => !o)}>
        <span>{value}</span>
        <I.Chevron size={14} />
      </button>
      {open && (
        <div className="map-dropdown__pop">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`map-dropdown__item ${opt.value === value ? 'map-dropdown__item--selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- SVG floor plan ----
function SpaceLabel({ s }) {
  const words = s.name.split(' ');
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const lineH = 13;
  if (words.length === 1) {
    return <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="map-space__label">{s.name}</text>;
  }
  const startY = cy - ((words.length - 1) * lineH) / 2;
  return (
    <text textAnchor="middle" className="map-space__label">
      {words.map((w, i) => <tspan key={i} x={cx} y={startY + i * lineH}>{w}</tspan>)}
    </text>
  );
}

function FloorPlan({ visibleTypes, selectedId, unusableIds, onSelect }) {
  return (
    <svg className="map-svg" viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg">
      <polygon className="map-floor" points="195,45 750,45 750,395 648,395 648,440 325,440 325,400 195,400" />
      <polygon className="map-floor" points="50,228 195,228 195,400 50,400" />

      {visibleTypes.has('spaces') && MAP_DATA.MAP_SPACES.map(s => {
        const isSelected = selectedId === s.id;
        const isBusy = s.status === 'busy';
        const isUnusable = unusableIds.has(s.id);
        return (
          <g key={s.id} onClick={() => onSelect({ ...s, type: 'space' })} style={{ cursor: 'pointer' }}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="4"
              className={[
                'map-space',
                isBusy && !isUnusable ? 'map-space--busy' : '',
                isUnusable ? 'map-space--unusable' : '',
                isSelected ? 'map-space--selected' : '',
              ].filter(Boolean).join(' ')}
            />
            <SpaceLabel s={s} />
            {isUnusable && (
              <text x={s.x + s.w/2} y={s.y + s.h - 10} textAnchor="middle" className="map-space__unusable-label">
                Offline
              </text>
            )}
          </g>
        );
      })}

      {visibleTypes.has('desks') && MAP_DATA.MAP_DESKS.map(d => {
        const isUnusable = unusableIds.has(d.id);
        return (
          <rect key={d.id} x={d.x} y={d.y} width={d.w} height={d.h} rx="2"
            className={[
              'map-desk',
              d.status === 'assigned' && !isUnusable ? 'map-desk--assigned' : '',
              isUnusable ? 'map-desk--unusable' : '',
              selectedId === d.id ? 'map-desk--selected' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onSelect({ ...d, type: 'desk' })} style={{ cursor: 'pointer' }}
          />
        );
      })}

      {visibleTypes.has('poi') && MAP_DATA.MAP_POI.map(p => (
        <g key={p.id} onClick={() => onSelect({ ...p, type: 'poi' })} style={{ cursor: 'pointer' }}>
          <circle cx={p.x} cy={p.y} r={10} className={`map-poi ${selectedId === p.id ? 'map-poi--selected' : ''}`} />
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="map-poi__icon">i</text>
        </g>
      ))}
    </svg>
  );
}

// ---- Issue report form ----
function FormQuestionField({ q, value, onChange }) {
  return (
    <div className="map-form-field">
      <label className="map-form-field__label">
        {q.label || <em style={{ color: 'var(--fg-muted)' }}>Untitled question</em>}
        {q.required && <span className="map-form-field__req">*</span>}
      </label>
      {q.type === 'short' && (
        <input className="map-form__input" type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Your answer" />
      )}
      {q.type === 'long' && (
        <textarea className="map-form__textarea" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Your answer" rows={3} />
      )}
      {q.type === 'date' && (
        <input className="map-form__input" type="date" value={value || ''} onChange={e => onChange(e.target.value)} />
      )}
      {q.type === 'file' && (
        <label className="map-form__file">
          <I.Photo size={15} />
          <span>{value || 'Attach a file'}</span>
          <input type="file" style={{ display: 'none' }} onChange={e => onChange(e.target.files[0]?.name || '')} />
        </label>
      )}
      {q.type === 'yesno' && (
        <div className="map-form-yesno">
          <button type="button" className={`map-form-yn-btn ${value === 'yes' ? 'map-form-yn-btn--on' : ''}`} onClick={() => onChange('yes')}>Yes</button>
          <button type="button" className={`map-form-yn-btn ${value === 'no' ? 'map-form-yn-btn--on' : ''}`} onClick={() => onChange('no')}>No</button>
        </div>
      )}
      {q.type === 'choice' && (
        <div className="map-form-choices">
          {(q.options || []).map(o => (
            <label key={o.id} className="map-form-choice">
              <input
                type={q.multi ? 'checkbox' : 'radio'}
                name={q.id}
                checked={q.multi ? (value || []).includes(o.id) : value === o.id}
                onChange={() => {
                  if (q.multi) {
                    const curr = value || [];
                    onChange(curr.includes(o.id) ? curr.filter(x => x !== o.id) : [...curr, o.id]);
                  } else {
                    onChange(o.id);
                  }
                }}
              />
              <span>{o.text}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function IssueReportForm({ resource, resourceConfig, building, floor, onSubmit, onBack, onClose, onViewOnMap }) {
  const [answers, setAnswers] = useStateMap({});
  const [amenitySelected, setAmenitySelected] = useStateMap(new Set());
  const [unusableAnswer, setUnusableAnswer] = useStateMap(null);
  const [submitted, setSubmitted] = useStateMap(false);

  const typeKey = resource.type === 'space' ? 'spaces' : resource.type === 'desk' ? 'desks' : 'poi';
  const questions = resourceConfig?.questions || [];
  const showAmenity = DATA.AMENITY_RESOURCES.includes(typeKey) && DATA.AMENITY_EXAMPLES[typeKey];
  const showUnusable = !!resourceConfig?.rules?.mark_unusable;
  const ResourceIcon = resource.type === 'space' ? I.Spaces : resource.type === 'desk' ? I.Desk : I.Star;

  const toggleAmenity = (a) => setAmenitySelected(prev => {
    const next = new Set(prev);
    if (next.has(a)) next.delete(a); else next.add(a);
    return next;
  });

  const handleSubmit = () => {
    const issueQ = questions.find(q => q.type === 'choice' && (q.options || []).length > 0);
    const issueOptionId = issueQ ? answers[issueQ.id] : null;
    const issueType = issueOptionId
      ? (issueQ.options.find(o => o.id === issueOptionId)?.text || null)
      : null;

    const isPriority = unusableAnswer === 'yes' && !!resourceConfig?.rules?.mark_high_priority;

    // Build labeled answers (resolve choice IDs → text) for ticket sidebar display
    const labeledAnswers = questions.map(q => {
      let value = answers[q.id];
      if (value === undefined || value === null || value === '') return null;
      if (Array.isArray(value) && value.length === 0) return null;
      if (q.type === 'choice') {
        value = q.multi
          ? (Array.isArray(value) ? value : [value]).map(id => (q.options || []).find(o => o.id === id)?.text || id).join(', ')
          : ((q.options || []).find(o => o.id === value)?.text || value);
      }
      return { label: q.label, type: q.type, value };
    }).filter(Boolean);

    onSubmit({
      isUnusable: unusableAnswer === 'yes',
      issueType,
      amenities: Array.from(amenitySelected),
      labeledAnswers,
      resourceName: resource.name,
      resourceType: resource.type,
      buildingId: building?.id,
      buildingName: building?.name,
      floor,
      assignees: resourceConfig?.assignees || [],
      status: 'open',
      priority: isPriority ? 'high' : 'normal',
      reporterId: 'rc',
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    const suggestion = getSuggestion(resource);
    const suggestionTags = suggestion ? getSuggestionTags(suggestion) : [];
    const SuggestionIcon = suggestion?.type === 'space' ? I.Spaces : I.Desk;
    return (
      <div className="map-form-success">
        <div className="map-form-success__top">
          <div className="map-form-success__icon"><I.Check size={24} /></div>
          <div>
            <h3 className="map-form-success__title">Issue reported</h3>
            <p className="map-form-success__sub">Your report has been submitted. The team has been notified.</p>
          </div>
        </div>

        {resource.type !== 'poi' && (
          <>
            <div className="map-form-success__divider" />
            <div className="map-form-success__booking">
              <div className="map-form-success__booking-label">
                <I.Calendar size={13} />
                Your reservation
              </div>
              <div className="map-form-success__booking-detail">
                <div className="map-issue-form__resource-icon" style={{ width: 28, height: 28 }}>
                  {resource.type === 'space' ? <I.Spaces size={14} /> : <I.Desk size={14} />}
                </div>
                <div>
                  <div className="map-form-success__booking-name">{resource.name}</div>
                  <div className="map-form-success__booking-time">Today · 2:00 – 4:00 pm</div>
                </div>
              </div>
            </div>
          </>
        )}

        {suggestion && (
          <>
            <div className="map-form-success__divider" />
            <div className="map-form-success__alt">
              <div className="map-form-success__alt-label">
                <I.Sparkle size={13} />
                Suggested alternative
              </div>
              <div className="map-form-success__alt-card">
                <div className="map-form-success__alt-identity">
                  <div className="map-issue-form__resource-icon" style={{ width: 32, height: 32 }}>
                    <SuggestionIcon size={16} />
                  </div>
                  <div>
                    <div className="map-form-success__alt-name">{suggestion.name}</div>
                    <div className="map-issue-form__resource-loc">{floor}, {building?.name}</div>
                  </div>
                </div>
                <div className="map-form-success__alt-tags">
                  {suggestionTags.map(tag => (
                    <span key={tag} className="map-form-success__alt-tag">{tag}</span>
                  ))}
                </div>
                <div className="map-form-success__alt-actions">
                  <button className="btn btn--gradient btn--sm" style={{ flex: 1 }}>Book</button>
                  <button
                    className="btn btn--outline btn--sm"
                    style={{ flex: 1 }}
                    onClick={() => onViewOnMap(suggestion)}
                  >
                    View on map
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="map-form-success__divider" />
        <button className="btn btn--ghost btn--sm" onClick={onClose} style={{ alignSelf: 'center' }}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="map-issue-form">
      <div className="map-detail__header">
        <button className="iconbtn" onClick={onBack} aria-label="Back">
          <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><I.ChevronR size={16} /></span>
        </button>
        <span className="map-detail__title">Report issue</span>
        <button className="iconbtn" onClick={onClose} aria-label="Close"><I.Close /></button>
      </div>

      <div className="map-issue-form__body">
        <div className="map-issue-form__resource-id">
          <div className="map-issue-form__resource-icon"><ResourceIcon size={18} /></div>
          <div>
            <div className="map-issue-form__resource-name">{resource.name}</div>
            <div className="map-issue-form__resource-loc">{floor}, {building?.name}</div>
          </div>
        </div>

        {showAmenity && (
          <div className="map-form-field">
            <label className="map-form-field__label">Which amenity is affected?</label>
            <div className="map-form-amenity-tags">
              {DATA.AMENITY_EXAMPLES[typeKey].map(a => (
                <span
                  key={a}
                  className={`map-form-amenity-tag ${amenitySelected.has(a) ? 'map-form-amenity-tag--on' : ''}`}
                  onClick={() => toggleAmenity(a)}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {questions.map(q => (
          <FormQuestionField
            key={q.id}
            q={q}
            value={answers[q.id]}
            onChange={v => setAnswers(prev => ({ ...prev, [q.id]: v }))}
          />
        ))}

        {showUnusable && (
          <div className="map-form-field">
            <label className="map-form-field__label">
              Is this resource unusable?
              <span className="map-form-field__req">*</span>
            </label>
            <div className="map-form-yesno">
              <button type="button" className={`map-form-yn-btn ${unusableAnswer === 'yes' ? 'map-form-yn-btn--on' : ''}`} onClick={() => setUnusableAnswer('yes')}>Yes</button>
              <button type="button" className={`map-form-yn-btn ${unusableAnswer === 'no' ? 'map-form-yn-btn--on' : ''}`} onClick={() => setUnusableAnswer('no')}>No</button>
            </div>
          </div>
        )}

        <button className="btn btn--primary" style={{ width: '100%' }} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

// ---- Resource detail panel ----
function ResourceDetail({ resource, buildingId, building, floor, configs, reports, onReport, onViewOnMap, onClose }) {
  const [showForm, setShowForm] = useStateMap(false);

  const typeKey = resource.type === 'space' ? 'spaces' : resource.type === 'desk' ? 'desks' : 'poi';
  const resourceConfig = configs[buildingId]?.[typeKey];
  const hasWorkflow = !!(resourceConfig?.enabled);
  const report = reports[resource.id];
  const isUnusable = !!report?.isUnusable;

  const isSpace = resource.type === 'space';
  const isDesk = resource.type === 'desk';
  const isPoi = resource.type === 'poi';
  const ResourceIcon = isSpace ? I.Spaces : isDesk ? I.Desk : I.Star;
  const title = isSpace ? 'Space Details' : isDesk ? 'Desk Details' : 'Point of Interest';
  const isAvailable = resource.status === 'available' && !isUnusable;

  if (showForm) {
    return (
      <IssueReportForm
        resource={resource}
        resourceConfig={resourceConfig}
        building={building}
        floor={floor}
        onSubmit={(reportData) => onReport(resource.id, reportData)}
        onBack={() => setShowForm(false)}
        onClose={onClose}
        onViewOnMap={onViewOnMap}
      />
    );
  }

  return (
    <div className="map-detail">
      <div className="map-detail__header">
        <span className="map-detail__title">{title}</span>
        <button className="iconbtn" onClick={onClose} aria-label="Close"><I.Close /></button>
      </div>
      {isSpace && <div className="map-detail__photo" />}

      {isUnusable && (
        <div className="map-detail__issue-warning">
          <div className="map-detail__issue-warning__row">
            <I.AlertOctagon size={14} />
            <strong>Issue reported · Resource offline</strong>
          </div>
          {(report.issueType || (report.amenities?.length > 0)) && (
            <div className="map-detail__issue-warning__meta">
              {report.issueType && <span>{report.issueType}</span>}
              {report.amenities?.length > 0 && (
                <span className="map-detail__issue-warning__amenities">
                  {report.issueType && ' · '}
                  {report.amenities.join(', ')}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="map-detail__body">
        <div className="map-detail__identity">
          <div className="map-detail__identity-icon"><ResourceIcon size={20} /></div>
          <div>
            <div className="map-detail__name">{resource.name}</div>
            <div className="map-detail__location">{floor}, {building?.name}</div>
          </div>
        </div>
        {resource.capacity && (
          <div className="map-detail__row">
            <I.People size={15} />
            <span>Fits: {resource.capacity}</span>
          </div>
        )}
        {(isSpace || isDesk) && (
          <div className="map-detail__actions">
            <button className="btn btn--primary" style={{ flex: 1 }} disabled={isUnusable}>
              New event
            </button>
            {hasWorkflow && !isUnusable && (
              <button className="btn btn--outline" style={{ flex: 1 }} onClick={() => setShowForm(true)}>
                Report issue
              </button>
            )}
            {hasWorkflow && isUnusable && (
              <button className="btn btn--outline" style={{ flex: 1 }} disabled>
                Issue filed
              </button>
            )}
          </div>
        )}
        {isPoi && hasWorkflow && (
          <div className="map-detail__actions">
            {!isUnusable && (
              <button className="btn btn--outline" style={{ flex: 1 }} onClick={() => setShowForm(true)}>
                Report issue
              </button>
            )}
            {isUnusable && (
              <button className="btn btn--outline" style={{ flex: 1 }} disabled>
                Issue filed
              </button>
            )}
          </div>
        )}
        {(isSpace || isDesk) && !isUnusable && (
          <div className="map-detail__avail-section">
            <div className="map-detail__section-title">Availability</div>
            <div className="map-detail__avail-slot">Now – 5:15 pm</div>
            <button className="btn btn--outline btn--sm map-detail__more-times">View more times</button>
          </div>
        )}
        {isSpace && (
          <div className="map-detail__accordion">
            {['Amenities', 'Booking policies'].map(label => (
              <div key={label} className="map-detail__accordion-item">
                <span className="map-detail__accordion-chevron"><I.ChevronR size={14} /></span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Default sidebar ----
function MapSidebarDefault({ building }) {
  const samplePeople = DATA.PEOPLE.slice(0, 3);
  return (
    <div className="map-sidebar-default">
      <div className="map-sidebar-goal">
        <span className="map-sidebar-goal__label">
          <span className="map-sidebar-goal__icon">&#9653;</span> <strong>Goal</strong> 10 days/month
        </span>
        <div className="map-sidebar-goal__track">
          <div className="map-sidebar-goal__fill" style={{ width: '58%' }} />
        </div>
      </div>
      <div className="map-sidebar-info">
        <div className="map-sidebar-info__date">Mon, May 25</div>
        <div className="map-sidebar-info__building-row">
          <span className="map-sidebar-info__building">{building ? building.name : 'San Francisco HQ'}</span>
          <button className="iconbtn iconbtn--sm"><I.Help size={15} /></button>
          <button className="iconbtn iconbtn--sm"><I.Bell size={15} /></button>
        </div>
      </div>
      <div className="map-sidebar-people">
        <div className="map-sidebar-people__avatars">
          {samplePeople.map(p => (
            <div key={p.id} className="avatar avatar--sm" style={{ '--c1': p.c1, '--c2': p.c2 }}>{p.initials}</div>
          ))}
        </div>
        <span className="map-sidebar-people__label">6 people scheduled</span>
      </div>
      <div className="map-sidebar-schedule">
        <div className="map-sidebar-schedule__heading">
          <span>Today, May 25</span>
          <I.ChevronR size={14} />
        </div>
        <div className="map-sidebar-schedule__event">
          <I.Calendar size={14} />
          <span>Up Next: Office closed at 12:00 am</span>
        </div>
      </div>
    </div>
  );
}

// ---- Map page root ----
function MapPage({ onNavigate, configs, reports, onReport }) {
  const [buildingId, setBuildingId] = useStateMap('sf');
  const [floor, setFloor] = useStateMap('Floor 4');
  const [date, setDate] = useStateMap('2026-05-25');
  const visibleTypes = new Set(['spaces', 'desks', 'poi']);
  const [selected, setSelected] = useStateMap(null);

  const building = DATA.BUILDINGS.find(b => b.id === buildingId);
  const floors = MAP_DATA.MAP_FLOORS[buildingId] || [];
  const buildingOptions = DATA.BUILDINGS.map(b => ({ value: b.id, label: b.name }));
  const floorOptions = floors.map(f => ({ value: f, label: f }));

  const unusableIds = new Set(
    Object.entries(reports).filter(([, r]) => r.isUnusable).map(([id]) => id)
  );

  const FILTER_TABS = [
    { id: 'desks',         label: 'Desks',         Icon: I.Desk   },
    { id: 'spaces',        label: 'Spaces',        Icon: I.Spaces },
    { id: 'neighborhoods', label: 'Neighborhoods', Icon: I.Stack  },
    { id: 'poi',           label: 'Lockers',       Icon: I.Locker },
  ];

  return (
    <div className="app">
      <Shell.Rail activePage="map" onNavigate={onNavigate} />
      <main className="main map-main">
        <div className="map-page-header">
          <h1 className="main__title">Map</h1>
          <div className="map-toolbar">
            <MapDropdown
              value={building ? building.name : 'Select building'}
              options={buildingOptions}
              onChange={(v) => { setBuildingId(v); setFloor(MAP_DATA.MAP_FLOORS[v]?.[0] || ''); setSelected(null); }}
            />
            <MapDropdown value={floor} options={floorOptions} onChange={setFloor} />
            <input type="date" className="map-datepicker" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        <div className="map-body">
          <div className="map-canvas-area">
            <div className="map-filter-tabs">
              {FILTER_TABS.map(tab => (
                <span key={tab.id} className="map-filter-tab">
                  <tab.Icon size={13} />
                  {tab.label}
                </span>
              ))}
            </div>
            <div className="map-canvas">
              <FloorPlan
                visibleTypes={visibleTypes}
                selectedId={selected?.id}
                unusableIds={unusableIds}
                onSelect={setSelected}
              />
            </div>
          </div>

          <aside className="map-sidebar">
            {selected
              ? <ResourceDetail
                  resource={selected}
                  buildingId={buildingId}
                  building={building}
                  floor={floor}
                  configs={configs}
                  reports={reports}
                  onReport={onReport}
                  onViewOnMap={(r) => setSelected(r)}
                  onClose={() => setSelected(null)}
                />
              : <MapSidebarDefault building={building} />
            }
          </aside>
        </div>
      </main>
    </div>
  );
}

window.MapPage = MapPage;
