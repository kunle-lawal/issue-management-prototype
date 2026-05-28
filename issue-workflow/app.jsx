// Top-level App: state machine + summary view + composition.
const { useState: useStateApp, useEffect: useEffectApp } = React;


// ---- Post-save summary view (single white container with a table) ----
function ConfigSummary({ configs, onAddBuilding, onEdit }) {
  const [expanded, setExpanded] = useStateApp({});
  const buildings = Object.keys(configs).map(id => DATA.BUILDINGS.find(b => b.id === id)).filter(Boolean);

  const toggleExpand = (bid) => setExpanded(prev => ({ ...prev, [bid]: !prev[bid] }));

  return (
    <div className="summary-card">
      <div className="summary-card__head">
        <div>
          <h2 className="summary-card__title">Issue reporting</h2>
          <p className="summary-card__sub">{buildings.length} building{buildings.length === 1 ? '' : 's'} configured · routing live</p>
        </div>
        <div className="summary-card__actions">
          <button className="btn btn--primary" onClick={onAddBuilding}>
            <I.Plus size={14} />
            Add building
          </button>
        </div>
      </div>
      <table className="summary-table">
        <thead>
          <tr>
            <th>Building</th>
            <th>Assignees</th>
            <th>Status</th>
            <th style={{ width: 56 }} />
          </tr>
        </thead>
        <tbody>
          {buildings.map(b => {
            const cfg = configs[b.id];
            const isExpanded = !!expanded[b.id];

            return (
              <React.Fragment key={b.id}>
                <tr className="summary-building-row" onClick={() => toggleExpand(b.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="cell-building">
                      <div className="cell-building__expand">
                        {isExpanded ? <I.Chevron size={14} /> : <I.ChevronR size={14} />}
                      </div>
                      <div className="cell-building__icon"><I.Building size={18} /></div>
                      <div className="cell-building__name">{b.name}</div>
                    </div>
                  </td>
                  <td />
                  <td />
                  <td>
                    <button
                      className="row-action"
                      onClick={(e) => { e.stopPropagation(); onEdit(b.id); }}
                      aria-label={`Edit ${b.name}`}
                    >
                      <I.ChevronR size={16} />
                    </button>
                  </td>
                </tr>
                {isExpanded && DATA.RESOURCES.map(r => {
                  const Cmp = I[r.icon];
                  const resourceCfg = cfg[r.id];
                  const assigneeIds = resourceCfg.enabled ? (resourceCfg.assignees || []) : [];
                  const assignees = assigneeIds.map(id => DATA.PEOPLE.find(p => p.id === id)).filter(Boolean);
                  return (
                    <tr key={r.id} className="summary-resource-row">
                      <td>
                        <div className="cell-resource">
                          <div className="cell-resource__icon"><Cmp size={14} /></div>
                          <span className="cell-resource__name">{r.name}</span>
                        </div>
                      </td>
                      <td>
                        {!resourceCfg.enabled ? null : assignees.length === 0 ? (
                          <span className="muted small">—</span>
                        ) : (
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
                        )}
                      </td>
                      <td>
                        {resourceCfg.enabled
                          ? <span className="status-pill"><span className="status-pill__dot" />Live</span>
                          : <span className="status-pill status-pill--off"><span className="status-pill__dot" />Off</span>
                        }
                      </td>
                      <td />
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- Workflow page (all issue-reporting admin state lives here) ----
function WorkflowPage({ onNavigate, configs, onConfigsChange }) {
  const [modal, setModal] = useStateApp(null);
  const [builderBuilding, setBuilderBuilding] = useStateApp(null);
  const [flash, setFlash] = useStateApp(null);

  useEffectApp(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3500);
    return () => clearTimeout(t);
  }, [flash]);

  const startSetup = () => setModal('choose');
  const pickScratch = () => setModal('pickBuilding');
  const pickServiceNow = () => setModal('serviceNow');

  const onBuildingPicked = (bid) => {
    setBuilderBuilding(DATA.BUILDINGS.find(x => x.id === bid));
    setModal(null);
  };

  const onSave = (config) => {
    onConfigsChange(prev => ({ ...prev, [builderBuilding.id]: config }));
    setFlash(`Issue reporting is live for ${builderBuilding.name}.`);
    setBuilderBuilding(null);
  };

  const hasConfigs = Object.keys(configs).length > 0;

  return (
    <div className="app">
      <Shell.Rail activePage="workflow" onNavigate={onNavigate} />
      <Shell.SubNav />
      <main className="main" data-screen-label={hasConfigs ? 'Workflows · Configured' : 'Workflows · Empty'}>
        <Shell.PageHeader />

        {flash && (
          <div className="flash">
            <I.Check size={16} />
            {flash}
          </div>
        )}

        {hasConfigs
          ? <ConfigSummary
              configs={configs}
              onAddBuilding={startSetup}
              onEdit={(bid) => setBuilderBuilding(DATA.BUILDINGS.find(x => x.id === bid))}
            />
          : <Shell.EmptyState onGetStarted={startSetup} />
        }
      </main>

      {modal === 'choose' && (
        <SetupModals.SetupChoiceModal
          onClose={() => setModal(null)}
          onPickScratch={pickScratch}
          onPickServiceNow={pickServiceNow}
        />
      )}
      {modal === 'pickBuilding' && (
        <SetupModals.BuildingSelectModal
          onBack={() => setModal('choose')}
          onClose={() => setModal(null)}
          onContinue={onBuildingPicked}
          configured={configs}
        />
      )}
      {modal === 'serviceNow' && (
        <SetupModals.ServiceNowStubModal
          onBack={() => setModal('choose')}
          onClose={() => setModal(null)}
        />
      )}

      {builderBuilding && (
        <Builder
          building={builderBuilding}
          initialConfig={configs[builderBuilding.id]}
          onCancel={() => setBuilderBuilding(null)}
          onSave={onSave}
        />
      )}
    </div>
  );
}

// ---- App (page router) ----
function App() {
  const [page, setPage] = useStateApp('workflow');
  const [filled, setFilled] = useStateApp(true);
  const [configs, setConfigs] = useStateApp(DATA.DEMO_CONFIGS);
  const [reports, setReports] = useStateApp(DATA.DEMO_REPORTS);

  const handleReport = (resourceId, data) =>
    setReports(prev => ({ ...prev, [resourceId]: data }));

  const switchToFilled = () => { setConfigs(DATA.DEMO_CONFIGS); setReports(DATA.DEMO_REPORTS); setFilled(true); };
  const switchToEmpty  = () => { setConfigs({});                setReports({});                setFilled(false); };

  const page$ = page === 'map'     ? <MapPage      onNavigate={setPage} configs={configs} reports={reports} onReport={handleReport} />
              : page === 'tickets' ? <TicketsPage  onNavigate={setPage} reports={reports} onReport={handleReport} />
              :                      <WorkflowPage onNavigate={setPage} configs={configs} onConfigsChange={setConfigs} />;

  return (
    <React.Fragment>
      {page$}
      <div className="demo-toggle">
        <span className="demo-toggle__label">Preview</span>
        <div className="demo-toggle__btns">
          <button className={`demo-toggle__opt ${filled ? 'demo-toggle__opt--active' : ''}`}  onClick={switchToFilled}>Filled</button>
          <button className={`demo-toggle__opt ${!filled ? 'demo-toggle__opt--active' : ''}`} onClick={switchToEmpty}>Empty</button>
        </div>
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
