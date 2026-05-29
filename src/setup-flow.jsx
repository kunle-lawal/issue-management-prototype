import { useState, useMemo } from 'react';
import { I } from './icons';
import { DATA } from './data';

function SetupChoiceModal({ onClose, onPickScratch, onPickServiceNow }) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h2 className="modal__title">How would you like to start?</h2>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Close"><I.Close /></button>
        </div>
        <div className="modal__body">
          <div className="choices">
            <button className="choice" onClick={onPickScratch}>
              <div className="choice__icon"><I.Sparkle size={22} /></div>
              <h3 className="choice__title">Start from scratch</h3>
              <p className="choice__desc">Set up resources, forms and routing rules with Robin. Best if you don't have an existing ticketing system.</p>
              <div className="choice__meta">
                <span className="tag">~5 min per building</span>
              </div>
            </button>
            <button className="choice choice--alt" onClick={onPickServiceNow}>
              <div className="choice__icon"><I.ServiceNow size={22} /></div>
              <h3 className="choice__title">Integrate with ServiceNow</h3>
              <p className="choice__desc">Forward issues to your existing ServiceNow instance and use its assignment groups and SLAs.</p>
              <div className="choice__meta">
                <span className="tag">Requires admin access</span>
                <span className="tag">Sync in ~2 min</span>
              </div>
            </button>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function BuildingSelectModal({ onBack, onClose, onContinue, configured }) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  const buildings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA.BUILDINGS.filter(b =>
      !q || b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h2 className="modal__title">Which building are you setting up?</h2>
            <p className="modal__sub">Pick a building to configure. You can set up more buildings after this one.</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Close"><I.Close /></button>
        </div>
        <div className="modal__body">
          <div className="search" style={{ marginBottom: 10 }}>
            <I.Search size={16} />
            <input
              placeholder="Search buildings"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="building-list">
            {buildings.map(b => {
              const isConfigured = !!configured[b.id];
              const isSelected = selected === b.id;
              return (
                <button
                  key={b.id}
                  className={`building ${isSelected ? 'building--selected' : ''}`}
                  onClick={() => !isConfigured && setSelected(b.id)}
                  disabled={isConfigured}
                  style={isConfigured ? { opacity: 0.55, cursor: 'not-allowed' } : null}
                >
                  <div className="building__radio" />
                  <div className="building__icon"><I.Building size={18} /></div>
                  <div className="building__meta">
                    <div className="building__name">{b.name}</div>
                    <div className="building__sub">{b.address}</div>
                  </div>
                  {isConfigured && <span className="building__status building__status--configured">Configured</span>}
                </button>
              );
            })}
            {buildings.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-muted)' }}>
                No buildings match "{query}"
              </div>
            )}
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onBack}>Back</button>
          <button
            className="btn btn--primary"
            disabled={!selected}
            onClick={() => onContinue(selected)}
          >
            Open Builder
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceNowStubModal({ onBack, onClose }) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <p className="kicker">ServiceNow integration</p>
            <h2 className="modal__title">Not part of this prototype</h2>
            <p className="modal__sub">This flow is focused on the <strong>Start from scratch</strong> path. Head back and pick that option to continue.</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Close"><I.Close /></button>
        </div>
        <div className="modal__body" />
        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onBack}>Back</button>
        </div>
      </div>
    </div>
  );
}

export const SetupModals = { SetupChoiceModal, BuildingSelectModal, ServiceNowStubModal };
