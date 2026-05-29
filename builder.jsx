// Full-screen Builder: left rail = resources, right = per-resource config (assignee · form · rules).
const { useState: useStateB, useMemo: useMemoB, useRef: useRefB, useEffect: useEffectB } = React;

// ---- Build initial config for a building ----
let __qidCounter = 0;
const qid = () => `q${Date.now().toString(36)}${(__qidCounter++).toString(36)}`;

function makeQuestion(q) {
  return {
    id: qid(),
    label: q.label || '',
    type: q.type || 'short',
    required: !!q.required,
    multi: q.type === 'choice' ? !!q.multi : false,
    options: q.type === 'choice'
      ? (q.options || ['Option 1']).map(text => ({ id: qid(), text }))
      : [],
  };
}

function buildInitialConfig() {
  const out = {};
  for (const r of DATA.RESOURCES) {
    const questions = (DATA.QUESTION_STARTERS[r.id] || []).map(makeQuestion);
    const rules = {};
    const ruleConfig = {};
    for (const rule of DATA.RULES) {
      if (rule.resources && !rule.resources.includes(r.id)) continue;
      rules[rule.id] = rule.defaultOn;
      if (rule.config) ruleConfig[rule.id] = { ...rule.config };
    }
    out[r.id] = {
      enabled: true,
      assignees: ['alex'],
      questions,
      rules,
      ruleConfig,
    };
  }
  return out;
}

// ---- Assignee picker ----
function AssigneeAutocomplete({ value, onChange }) {
  const [query, setQuery] = useStateB('');
  const [open, setOpen] = useStateB(false);
  const ref = useRefB(null);
  const inputRef = useRefB(null);

  useEffectB(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selectedPeople = value.map(id => DATA.PEOPLE.find(p => p.id === id)).filter(Boolean);

  const filtered = DATA.PEOPLE.filter(p =>
    !value.includes(p.id) &&
    (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.role.toLowerCase().includes(query.toLowerCase()))
  );

  const add = (id) => {
    onChange([...value, id]);
    setQuery('');
    inputRef.current?.focus();
  };

  const remove = (id) => onChange(value.filter(v => v !== id));

  return (
    <div ref={ref} className="assignee-auto">
      <div
        className={`assignee-auto__field ${open ? 'assignee-auto__field--focused' : ''}`}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {selectedPeople.map(p => (
          <div key={p.id} className="assignee-chip">
            <div className="avatar" style={{ '--c1': p.c1, '--c2': p.c2, width: 20, height: 20, fontSize: 9 }}>{p.initials}</div>
            <span className="assignee-chip__name">{p.name}</span>
            <button
              className="assignee-chip__remove"
              onClick={(e) => { e.stopPropagation(); remove(p.id); }}
              aria-label={`Remove ${p.name}`}
            >
              <I.Close size={12} />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          className="assignee-auto__input"
          placeholder={selectedPeople.length === 0 ? 'Search by name or role…' : 'Add another…'}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="select-pop">
          {filtered.map(p => (
            <div key={p.id} className="select-pop__item" onClick={() => add(p.id)}>
              <div className="avatar" style={{ '--c1': p.c1, '--c2': p.c2 }}>{p.initials}</div>
              <div className="select__meta">
                <span className="select__name">{p.name}</span>
                <span className="select__role">{p.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Switch (reused) ----
function Switch({ on, onChange, disabled }) {
  return (
    <div
      className={`switch ${on ? 'switch--on' : ''} ${disabled ? 'switch--disabled' : ''}`}
      onClick={() => !disabled && onChange(!on)}
      role="switch"
      aria-checked={on}
    />
  );
}

// ---- Form preview panel ----
function PreviewField({ q }) {
  return (
    <div className="preview-field">
      <label className="preview-field__label">
        {q.label || <em style={{ color: 'var(--fg-muted)' }}>Untitled question</em>}
        {q.required && <span className="preview-field__req">*</span>}
      </label>
      {q.type === 'short' && (
        <input className="preview-field__input" type="text" disabled placeholder="Short answer" />
      )}
      {q.type === 'long' && (
        <textarea className="preview-field__textarea" disabled placeholder="Long answer" />
      )}
      {q.type === 'date' && (
        <input className="preview-field__input" type="date" disabled />
      )}
      {q.type === 'file' && (
        <div className="preview-field__file">
          <I.Photo size={16} />
          <span>Attach a file</span>
        </div>
      )}
      {q.type === 'yesno' && (
        <div className="preview-field__yesno">
          <button className="preview-field__yn-btn">Yes</button>
          <button className="preview-field__yn-btn">No</button>
        </div>
      )}
      {q.type === 'choice' && (
        <div className="preview-field__choices">
          {(q.options || []).map(o => (
            <label key={o.id} className="preview-field__choice">
              <input type={q.multi ? 'checkbox' : 'radio'} disabled readOnly />
              <span>{o.text}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function FormPreviewPanel({ building, resource, config, onClose }) {
  const questions = config[resource.id].questions;
  const showUnusable = config[resource.id].rules['mark_unusable'];
  const ResourceIcon = I[resource.icon];
  const sample = DATA.PREVIEW_RESOURCE_SAMPLES[resource.id];
  const byline = [sample.floor, building.name].filter(Boolean).join(', ');
  return (
    <aside className="builder__preview">
      <div className="preview__header">
        <h3 className="preview__title">Report an issue</h3>
        <button className="iconbtn" onClick={onClose} aria-label="Close preview"><I.Close /></button>
      </div>
      <div className="preview__body">
        <div className="preview-resource-id">
          <div className="preview-resource-id__icon"><ResourceIcon size={22} /></div>
          <div>
            <div className="preview-resource-id__name">{sample.name}</div>
            <div className="preview-resource-id__sub">{byline}</div>
          </div>
        </div>
        {DATA.AMENITY_RESOURCES.includes(resource.id) && (
          <div className="preview-field">
            <label className="preview-field__label">Which amenity is affected?</label>
            <div className="preview-amenity-tags">
              {DATA.AMENITY_EXAMPLES[resource.id].map(a => (
                <span key={a} className="preview-amenity-tag">{a}</span>
              ))}
            </div>
            <p className="preview-amenity-note">
              Example amenities shown. The actual form will display the amenities attached to the specific resource.
            </p>
          </div>
        )}
        {questions.map(q => <PreviewField key={q.id} q={q} />)}
        {showUnusable && (
          <PreviewField q={{ id: '__unusable', label: 'Is this resource unusable?', type: 'yesno', required: true }} />
        )}
        <button className="btn btn--primary preview__submit">Submit</button>
      </div>
    </aside>
  );
}

// ---- Form builder panel ----
function FormFieldsPanel({ resourceId, config, setConfig, previewOpen, setPreviewOpen }) {
  const questions = config[resourceId].questions;

  const updateQuestions = (mut) => {
    setConfig(prev => ({
      ...prev,
      [resourceId]: { ...prev[resourceId], questions: mut(prev[resourceId].questions) },
    }));
  };

  const patchQ = (qid_, patch) => updateQuestions(qs =>
    qs.map(q => q.id === qid_ ? { ...q, ...patch } : q));

  const deleteQ = (qid_) => updateQuestions(qs => qs.filter(q => q.id !== qid_));

  const moveQ = (qid_, delta) => updateQuestions(qs => {
    const idx = qs.findIndex(q => q.id === qid_);
    const j = idx + delta;
    if (idx < 0 || j < 0 || j >= qs.length) return qs;
    const next = [...qs];
    [next[idx], next[j]] = [next[j], next[idx]];
    return next;
  });

  const addQ = () => updateQuestions(qs => [
    ...qs,
    makeQuestion({ label: '', type: 'short', required: false }),
  ]);

  return (
    <div className="section section--form">
      <div className="section__head">
        <h3 className="section__title">Form</h3>
        <button
          className={`btn btn--sm ${previewOpen ? 'btn--preview-on' : 'btn--outline'}`}
          onClick={() => setPreviewOpen(o => !o)}
        >
          {previewOpen ? 'Hide preview' : 'Preview'}
        </button>
      </div>
      <div className="qlist">
        {DATA.AMENITY_RESOURCES.includes(resourceId) && (
          <div className="qcard qcard--system">
            <div className="qcard__top">
              <span className="qcard__label qcard__label--static">Which amenity is affected?</span>
              <span className="qcard__system-badge">System · Multi-select</span>
            </div>
            <p className="qcard__system-note">Populated from the resource's amenity list. Not editable.</p>
          </div>
        )}
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            isFirst={i === 0}
            isLast={i === questions.length - 1}
            onPatch={(patch) => patchQ(q.id, patch)}
            onDelete={() => deleteQ(q.id)}
            onMoveUp={() => moveQ(q.id, -1)}
            onMoveDown={() => moveQ(q.id, 1)}
          />
        ))}
        {config[resourceId].rules['mark_unusable'] && (
          <div className="qcard qcard--system">
            <div className="qcard__top">
              <span className="qcard__label qcard__label--static">Is this resource unusable?</span>
              <span className="qcard__system-badge">System · Yes / No</span>
            </div>
            <p className="qcard__system-note">Shown because "Allow users to mark resource as unusable" is on.</p>
          </div>
        )}
        <button className="qadd" onClick={addQ}>
          <I.Plus size={16} />
          Add question
        </button>
      </div>
    </div>
  );
}

function TypeDropdown({ value, onChange }) {
  const [open, setOpen] = useStateB(false);
  const ref = useRefB(null);
  useEffectB(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  const current = DATA.QUESTION_TYPES.find(t => t.id === value) || DATA.QUESTION_TYPES[0];
  return (
    <div ref={ref} className="qtype">
      <button type="button" className="qtype__btn" onClick={() => setOpen(o => !o)}>
        <span>{current.label}</span>
        <I.Chevron size={14} />
      </button>
      {open && (
        <div className="qtype__pop">
          {DATA.QUESTION_TYPES.map(t => (
            <div
              key={t.id}
              className={`qtype__item ${t.id === value ? 'qtype__item--selected' : ''}`}
              onClick={() => { onChange(t.id); setOpen(false); }}
            >
              {t.label}
              {t.id === value && <I.Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="cbx">
      <span
        className={`cbx__box ${checked ? 'cbx__box--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        {checked && <I.Check size={12} />}
      </span>
      <span onClick={() => onChange(!checked)}>{label}</span>
    </label>
  );
}

function QuestionCard({ q, isFirst, isLast, onPatch, onDelete, onMoveUp, onMoveDown }) {
  const onTypeChange = (newType) => {
    const patch = { type: newType };
    if (newType === 'choice' && (!q.options || q.options.length === 0)) {
      patch.options = [{ id: qid(), text: 'Option 1' }];
    }
    onPatch(patch);
  };

  const setOptionText = (oid, text) => {
    onPatch({ options: q.options.map(o => o.id === oid ? { ...o, text } : o) });
  };
  const addOption = () => {
    onPatch({ options: [...q.options, { id: qid(), text: `Option ${q.options.length + 1}` }] });
  };
  const deleteOption = (oid) => {
    onPatch({ options: q.options.filter(o => o.id !== oid) });
  };

  return (
    <div className="qcard">
      <div className="qcard__top">
        <div className="qcard__handle" title="Reorder">
          <button className="qcard__move" onClick={onMoveUp} disabled={isFirst} aria-label="Move up">
            <I.Drag size={16} />
          </button>
        </div>
        <input
          className="qcard__label"
          value={q.label}
          placeholder="Question"
          onChange={(e) => onPatch({ label: e.target.value })}
        />
        <TypeDropdown value={q.type} onChange={onTypeChange} />
      </div>

      {q.type === 'choice' && (
        <div className="qcard__options">
          {q.options.map(o => (
            <div key={o.id} className="qopt">
              <span className="qopt__handle"><I.Drag size={14} /></span>
              <input
                className="qopt__input"
                value={o.text}
                onChange={(e) => setOptionText(o.id, e.target.value)}
                placeholder="Option"
              />
              <button className="qopt__icon" title="Add description" type="button"><I.Paragraph size={15} /></button>
              <button className="qopt__icon" title="Add image" type="button"><I.Photo size={15} /></button>
              <button
                className="qopt__icon qopt__icon--danger"
                title="Remove option"
                type="button"
                onClick={() => deleteOption(o.id)}
                disabled={q.options.length <= 1}
              >
                <I.Trash size={15} />
              </button>
            </div>
          ))}
          <button className="qopt-add" onClick={addOption} type="button">
            <I.Plus size={14} /> Add option
          </button>
        </div>
      )}

      <div className="qcard__foot">
        <div className="qcard__foot-left">
          {q.type === 'choice' && (
            <Checkbox
              checked={!!q.multi}
              onChange={(v) => onPatch({ multi: v })}
              label="Multi-select"
            />
          )}
        </div>
        <div className="qcard__foot-right">
          <Checkbox
            checked={!!q.required}
            onChange={(v) => onPatch({ required: v })}
            label="Required"
          />
          <button className="qopt__icon qopt__icon--danger" onClick={onDelete} title="Delete question" type="button">
            <I.Trash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Rules panel ----
function RulesPanel({ resourceId, config, setConfig }) {
  const applicableRules = DATA.RULES.filter(r => !r.resources || r.resources.includes(resourceId));
  const enabledCount = applicableRules.filter(r => config[resourceId].rules[r.id]).length;

  const toggle = (rid) => {
    const currentlyOn = config[resourceId].rules[rid];
    const turningOn = !currentlyOn;
    setConfig(prev => {
      const updatedRules = { ...prev[resourceId].rules, [rid]: turningOn };
      // when a parent rule is turned on, reset its children to their defaultOn
      if (turningOn) {
        DATA.RULES.forEach(r => {
          if (r.parent === rid) updatedRules[r.id] = r.defaultOn;
        });
      }
      return { ...prev, [resourceId]: { ...prev[resourceId], rules: updatedRules } };
    });
  };

  const setRuleConf = (rid, patch) => {
    setConfig(prev => ({
      ...prev,
      [resourceId]: {
        ...prev[resourceId],
        ruleConfig: {
          ...prev[resourceId].ruleConfig,
          [rid]: { ...prev[resourceId].ruleConfig[rid], ...patch },
        },
      },
    }));
  };

  return (
    <div className="section">
      <div className="section__head">
        <div>
          <h3 className="section__title">Rules &amp; automations</h3>
          <p className="section__sub">Decide what happens when an issue is reported.</p>
        </div>
        <div className="muted small">{enabledCount} of {applicableRules.length} on</div>
      </div>
      <div>
        {applicableRules.filter(r => !r.parent).map(rule => {
          const Cmp = I[rule.icon];
          const on = config[resourceId].rules[rule.id];
          const children = applicableRules.filter(r => r.parent === rule.id);
          return (
            <React.Fragment key={rule.id}>
              <div className="rule">
                <div className="rule__icon"><Cmp size={16} /></div>
                <div className="rule__meta">
                  <div className="rule__title">{rule.title}</div>
                  <div className="rule__sub">{rule.sub}</div>
                </div>
                <Switch on={on} onChange={() => toggle(rule.id)} />
              </div>
              {on && children.map(child => {
                const ChildCmp = I[child.icon];
                const childOn = config[resourceId].rules[child.id];
                const childCfg = config[resourceId].ruleConfig[child.id];
                return (
                  <div key={child.id} className="rule rule--child">
                    <div className="rule__icon"><ChildCmp size={16} /></div>
                    <div className="rule__meta">
                      <div className="rule__title">{child.title}</div>
                      <div className="rule__sub">{child.sub}</div>
                      {childOn && child.id === 'take_offline' && (
                        <div className="rule__config">
                          <span>Take offline</span>
                          <select
                            className="rule__select"
                            value={childCfg.duration}
                            onChange={e => setRuleConf(child.id, { duration: e.target.value })}
                          >
                            <option value="until_resolved">Until issue is resolved</option>
                            <option value="until_manual">Until I manually take it back online</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <Switch on={childOn} onChange={() => toggle(child.id)} />
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function EscalatePicker({ value, onChange }) {
  const [open, setOpen] = useStateB(false);
  const ref = useRefB(null);

  useEffectB(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const person = DATA.PEOPLE.find(p => p.id === value) || DATA.PEOPLE[0];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="rule__chip" onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer' }}>
        <div className="avatar" style={{ '--c1': person.c1, '--c2': person.c2, width: 18, height: 18, fontSize: 9 }}>{person.initials}</div>
        {person.name}
        <I.Chevron size={12} />
      </button>
      {open && (
        <div className="select-pop" style={{ minWidth: 240, left: 0 }}>
          {DATA.PEOPLE.map(p => (
            <div
              key={p.id}
              className={`select-pop__item ${p.id === value ? 'select-pop__item--selected' : ''}`}
              onClick={() => { onChange(p.id); setOpen(false); }}
            >
              <div className="avatar" style={{ '--c1': p.c1, '--c2': p.c2 }}>{p.initials}</div>
              <div className="select__meta">
                <span className="select__name">{p.name}</span>
                <span className="select__role">{p.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Builder root ----
function Builder({ building, initialConfig, onCancel, onSave }) {
  const [config, setConfig] = useStateB(() => initialConfig || buildInitialConfig());
  const [activeId, setActiveId] = useStateB(DATA.RESOURCES[0].id);
  const [previewOpen, setPreviewOpen] = useStateB(false);
  const [reviewed, setReviewed] = useStateB(() => new Set([DATA.RESOURCES[0].id]));

  const goToResource = (id) => {
    setActiveId(id);
    setReviewed(prev => new Set([...prev, id]));
  };

  // A resource is "configured" once user has interacted (toggled something off default,
  // changed assignee, etc.) — for visual feedback only. We'll just consider all complete since
  // defaults are sensible.
  const completedSet = useMemoB(() => {
    const set = new Set();
    for (const r of DATA.RESOURCES) {
      // Always complete in this prototype — sensible defaults provided.
      set.add(r.id);
    }
    return set;
  }, [config]);

  const active = DATA.RESOURCES.find(r => r.id === activeId);
  const ActiveIcon = I[active.icon];

  return (
    <div className="builder" data-screen-label="Builder">
      {/* Top bar */}
      <div className="builder__topbar">
        <button className="iconbtn" onClick={onCancel} aria-label="Cancel"><I.Close /></button>
        <div className="builder__title">
          <span className="builder__crumb">Issue reporting · Builder</span>
          <span className="builder__name">{building.name}</span>
        </div>
        <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn--primary" onClick={() => onSave(config)}>
          Save &amp; finish
        </button>
      </div>

      {/* Body */}
      <div className="builder__body">
        {/* Resource rail */}
        <aside className="builder__rail">
          <div className="builder__rail-heading">Resources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {DATA.RESOURCES.map(r => {
              const Cmp = I[r.icon];
              const isActive = r.id === activeId;
              const enabled = config[r.id].enabled;
              const isReviewed = reviewed.has(r.id);
              return (
                <div
                  key={r.id}
                  className={`resource ${isActive ? 'resource--active' : ''} ${!enabled ? 'resource--disabled' : ''}`}
                  onClick={() => goToResource(r.id)}
                >
                  <div className="resource__icon"><Cmp size={16} /></div>
                  <div className="resource__meta">
                    <div className="resource__name">{r.name}</div>
                  </div>
                  {isReviewed && (
                    <div className="resource__check">
                      <I.Check size={14} />
                    </div>
                  )}
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      on={enabled}
                      onChange={(v) => setConfig(prev => ({
                        ...prev,
                        [r.id]: { ...prev[r.id], enabled: v },
                      }))}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <div className="builder__content" key={activeId} style={previewOpen ? { minWidth: 0 } : {}}>
          <div className="builder__content-inner">
            <div className="builder__header">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div className="resource__icon" style={{ width: 44, height: 44, background: 'var(--bg-subnav-active)', color: 'var(--accent-blue)' }}>
                  <ActiveIcon size={22} />
                </div>
                <div>
                  <h2 className="builder__resource-name">{active.name}</h2>
                </div>
              </div>
              <div className="enable-toggle">
                <span className="enable-toggle__label">
                  Issue reporting is <strong>{config[active.id].enabled ? 'on' : 'off'}</strong>
                </span>
                <Switch
                  on={config[active.id].enabled}
                  onChange={(v) => setConfig(prev => ({
                    ...prev,
                    [active.id]: { ...prev[active.id], enabled: v },
                  }))}
                />
              </div>
            </div>

            {!config[active.id].enabled ? (
              <div className="resource-off">
                <div className="resource-off__icon"><ActiveIcon size={28} /></div>
                <h3 className="resource-off__title">Issue reporting is off for {active.name}</h3>
                <p className="resource-off__sub">Reporters won’t see a way to file issues against {active.name.toLowerCase()} in this building.</p>
                <button
                  className="btn btn--primary"
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    [active.id]: { ...prev[active.id], enabled: true },
                  }))}
                >
                  Turn on for {active.name}
                </button>
              </div>
            ) : (
              <React.Fragment>
                {/* Assignee */}
                <div className="section">
                  <div className="section__head">
                    <div>
                      <h3 className="section__title">Default assignee</h3>
                      <p className="section__sub">Who should new {active.name.toLowerCase()} issues be routed to by default?</p>
                    </div>
                  </div>
                  <AssigneeAutocomplete
                    value={config[active.id].assignees || []}
                    onChange={(v) => setConfig(prev => ({
                      ...prev,
                      [active.id]: { ...prev[active.id], assignees: v },
                    }))}
                  />
                </div>

                <FormFieldsPanel resourceId={active.id} config={config} setConfig={setConfig} previewOpen={previewOpen} setPreviewOpen={setPreviewOpen} />
                {DATA.RULES.some(r => !r.resources || r.resources.includes(active.id)) && (
                  <RulesPanel resourceId={active.id} config={config} setConfig={setConfig} />
                )}
              </React.Fragment>
            )}

            {/* Footer hint */}
            <div className="row" style={{ justifyContent: 'space-between', paddingTop: 4 }}>
              <button
                className="btn btn--outline"
                disabled={DATA.RESOURCES.findIndex(r => r.id === activeId) === 0}
                onClick={() => {
                  const idx = DATA.RESOURCES.findIndex(r => r.id === activeId);
                  if (idx > 0) goToResource(DATA.RESOURCES[idx - 1].id);
                }}
              >
                <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><I.ChevronR size={14} /></span>
                Previous resource
              </button>
              {DATA.RESOURCES.findIndex(r => r.id === activeId) < DATA.RESOURCES.length - 1 ? (
                <button
                  className="btn btn--outline"
                  onClick={() => {
                    const idx = DATA.RESOURCES.findIndex(r => r.id === activeId);
                    goToResource(DATA.RESOURCES[idx + 1].id);
                  }}
                >
                  Next resource <I.ChevronR size={14} />
                </button>
              ) : (
                <button className="btn btn--primary" onClick={() => onSave(config)}>
                  Save &amp; finish <I.Check size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {previewOpen && (
          <FormPreviewPanel building={building} resource={active} config={config} onClose={() => setPreviewOpen(false)} />
        )}
      </div>
    </div>
  );
}

window.Builder = Builder;
