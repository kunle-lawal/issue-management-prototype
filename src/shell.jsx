import React, { useState, useRef } from 'react';
import { I } from './icons';

function Rail({ activePage, onNavigate }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const closeTimer = useRef(null);

  const items = [
    { id: 'locations', icon: 'Pin',      page: 'map'      },
    { id: 'sched',     icon: 'Calendar'                   },
    { id: 'people',    icon: 'People'                     },
    { id: 'office',    icon: 'Building', submenu: [
      { label: 'Dashboard' },
      { label: 'Tickets',    page: 'tickets'  },
      { label: 'Visitors'   },
      { label: 'Deliveries' },
    ]},
    { id: 'desks',     icon: 'Desk'                       },
    { id: 'stack',     icon: 'Stack'                      },
    { id: 'analytics', icon: 'Chart'                      },
    { id: 'settings',  icon: 'Gear',    page: 'workflow'  },
  ];
  return (
    <div className="rail">
      <div className="rail__logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="6" cy="6" r="2.2" /><circle cx="12" cy="6" r="2.2" /><circle cx="18" cy="6" r="2.2" />
          <circle cx="6" cy="12" r="2.2" /><circle cx="12" cy="12" r="2.2" /><circle cx="18" cy="12" r="2.2" />
          <circle cx="6" cy="18" r="2.2" /><circle cx="12" cy="18" r="2.2" /><circle cx="18" cy="18" r="2.2" />
        </svg>
      </div>
      <div className="rail__items">
        {items.map(it => {
          const Cmp = I[it.icon];
          const isActive = it.page
            ? it.page === activePage
            : it.submenu?.some(s => s.page === activePage) || false;
          if (it.submenu) {
            return (
              <div
                key={it.id}
                className="rail__item-wrap"
                onMouseEnter={() => { clearTimeout(closeTimer.current); setOpenSubmenu(it.id); }}
                onMouseLeave={() => { closeTimer.current = setTimeout(() => setOpenSubmenu(null), 300); }}
              >
                <button className={`rail__btn ${isActive ? 'rail__btn--active' : ''}`}>
                  <Cmp size={20} />
                </button>
                {openSubmenu === it.id && (
                  <div className="rail__submenu">
                    {it.submenu.map(sub => (
                      <div
                        key={sub.label}
                        className={`rail__submenu-item ${sub.page === activePage ? 'rail__submenu-item--active' : ''}`}
                        onClick={() => sub.page && onNavigate && onNavigate(sub.page)}
                      >
                        {sub.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <button
              key={it.id}
              className={`rail__btn ${isActive ? 'rail__btn--active' : ''}`}
              onClick={() => it.page && onNavigate && onNavigate(it.page)}
            >
              <Cmp size={20} />
            </button>
          );
        })}
      </div>
      <div className="rail__footer">
        <button className="rail__btn"><I.Help size={20} /></button>
        <button className="rail__btn"><I.Chat size={20} /></button>
        <button className="rail__btn rail__notif"><I.Bell size={20} /></button>
        <div className="rail__avatar">RC</div>
      </div>
    </div>
  );
}

function SubNav() {
  const groups = [
    ['Organization', 'Offices', 'Themes', 'Integrations'],
    ['People', 'Group', 'Roles'],
    ['Workflows', 'Hybrid Work Policies', 'Amenities', 'Stickers'],
    ['Notifications', 'Billing', 'Priority support'],
  ];
  return (
    <nav className="subnav">
      {groups.map((g, gi) => (
        <React.Fragment key={gi}>
          <div className="subnav__group">
            {g.map(label => (
              <div key={label} className={`subnav__item ${label === 'Workflows' ? 'subnav__item--active' : ''}`}>
                {label}
              </div>
            ))}
          </div>
          {gi < groups.length - 1 && <div className="subnav__divider" />}
        </React.Fragment>
      ))}
    </nav>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="main__title">Workflows</h1>
      <div className="tabs" style={{ marginTop: 18 }}>
        <div className="tab">Meeting services</div>
        <div className="tab tab--active">Issue reports</div>
      </div>
    </div>
  );
}

function EmptyState({ onGetStarted }) {
  return (
    <div className="card empty">
      <svg className="illus" viewBox="0 0 200 130" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="68" y="32" width="50" height="34" rx="2" />
        <rect x="74" y="38" width="38" height="22" rx="1" />
        <path d="M62 70h62l-3 6H65l-3-6Z" />
        <path d="M30 80h140" />
        <path d="M40 80v36 M160 80v36 M40 92h120" />
        <path d="M132 50h22v40h-22z" />
        <path d="M143 90v22 M132 112h22 M132 90l-4 22 M154 90l4 22" />
      </svg>
      <h2 className="empty__title">No issue workflows yet</h2>
      <p className="empty__sub">Keep the office running smoothly by setting up routing rules and automations</p>
      <button className="btn btn--primary" onClick={onGetStarted}>Get started</button>
    </div>
  );
}

export const Shell = { Rail, SubNav, PageHeader, EmptyState };
