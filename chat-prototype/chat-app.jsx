/* global React, ReactDOM, TweaksPanel, TweakSection, TweakRadio, TweakButton, useTweaks */
const { useState, useEffect, useRef, useMemo } = React;

// =========================================================================
// Tweakable defaults
// =========================================================================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "issueType": "room"
}/*EDITMODE-END*/;

// =========================================================================
// SVG icons (kept simple — no hand-drawn imagery)
// =========================================================================
const I = {
  more: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>,
  search: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  plus: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  caret: (p) => <svg {...p} viewBox="0 0 12 12" fill="currentColor"><path d="M3 4.5l3 3 3-3z"/></svg>,
  copilot: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 8l4-4 4 4-4 4z"/><path d="M12 12l4-4 4 4-4 4z"/></svg>,
  drafts: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19l4-1 11-11-3-3L5 15l-1 4z"/></svg>,
  alert: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l10 17H2L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="0.5" fill="currentColor"/></svg>,
  check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>,
  desk: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="7" width="18" height="3"/><path d="M5 10v9M19 10v9M9 14h6"/></svg>,
  door: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 3h12v18H6z"/><circle cx="15" cy="12" r="0.8" fill="currentColor"/></svg>,
  sparkle: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 4.8L18 8l-4.4 1.2L12 14l-1.6-4.8L6 8l4.4-1.2z"/></svg>,
  send: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-8-8 18-2-8z"/></svg>,
  emoji: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M8.5 14c1 1.5 2.2 2 3.5 2s2.5-.5 3.5-2"/></svg>,
  attach: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12l-9 9a5 5 0 0 1-7-7l9-9a3 3 0 0 1 4 4l-9 9a1 1 0 0 1-1-1l8-8"/></svg>,
  reset: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/></svg>,
};

// =========================================================================
// Robin avatar (original — magenta→violet gradient with pixel grid)
// =========================================================================
function RobinAvatar({ size = 28 }) {
  // dot pattern, evokes a stylized "R" without recreating the logo
  const pattern = [
    1,1,1,
    1,0,1,
    1,1,0,
  ];
  return (
    <span className="avatar" style={{ width: size, height: size, borderRadius: Math.max(4, size * 0.22) }}>
      <span className="dots">
        {pattern.map((on, i) => <span key={i} className={on ? "" : "off"} />)}
      </span>
    </span>
  );
}

// =========================================================================
// Person avatar (colored initials)
// =========================================================================
function PersonAvatar({ initials, color, size = 28 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: Math.max(4, size * 0.22),
      background: color,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      fontSize: size * 0.36, fontWeight: 600, color: "white", letterSpacing: 0.3,
    }}>{initials}</span>
  );
}

const PEOPLE = [
  { id: "sarah",  initials: "SC", name: "Sarah Chen",     color: "#3d7a6a" },
  { id: "marcus", initials: "MJ", name: "Marcus Johnson", color: "#7a4a2a" },
  { id: "priya",  initials: "PP", name: "Priya Patel",    color: "#3a5c8a" },
  { id: "alex",   initials: "AT", name: "Alex Torres",    color: "#6a3a7a" },
];

// =========================================================================
// Sidebar
// =========================================================================
function Sidebar({ activeChat, onSelectChat, hasRobinNotification }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h1>Chat</h1>
        <div className="sidebar-head-actions">
          <button className="icon-btn" title="More"><I.more /></button>
          <button className="icon-btn" title="Search"><I.search /></button>
          <button className="icon-btn" title="New chat"><I.plus /></button>
        </div>
      </div>

      <div className="sidebar-filters">
        <span className="chip">Unread</span>
        <span className="chip">Channels</span>
        <span className="chip">Chats</span>
      </div>

      <div className="sidebar-scroll">
        <div className="nav-item">
          <span className="nav-icon"><I.copilot /></span>
          Copilot
        </div>

        <div className="nav-section" style={{marginTop: 6}}>
          <I.caret /> Quick views
        </div>
        <div className="nav-item">
          <span className="nav-icon"><I.drafts /></span>
          Drafts
        </div>

        <div className="nav-section-divider" />

        <div className="nav-section" style={{marginTop: 10}}>
          <I.caret /> Favorites
        </div>

        <div className="nav-section">
          <I.caret /> Chats
        </div>
        <div
          className={`chat-row ${activeChat === "robin" ? "selected" : ""}`}
          onClick={() => onSelectChat("robin")}
        >
          <RobinAvatar size={28} />
          <span className="name">Robin</span>
          {hasRobinNotification && <span className="notif-dot" />}
        </div>
        {PEOPLE.map((p) => (
          <div
            className={`chat-row ${activeChat === p.id ? "selected" : ""}`}
            key={p.id}
            onClick={() => onSelectChat(p.id)}
          >
            <PersonAvatar initials={p.initials} color={p.color} size={28} />
            <span className="name">{p.name}</span>
          </div>
        ))}

        <div className="nav-section" style={{marginTop: 12}}>
          <I.caret /> Teams and channels
        </div>
        <div className="chat-row">
          <span className="avatar" style={{
            width: 28, height: 28, borderRadius: 6,
            background: "linear-gradient(135deg, #ff3d8a, #b026d6)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "white", letterSpacing: 0.5,
          }}>RP</span>
          <span className="name">Robin Powered</span>
        </div>
        <div className="nav-item" style={{paddingLeft: 56}}>General</div>
        <div className="see-all">See all your teams</div>

        <div className="nav-section" style={{marginTop: 14}}>
          <I.caret /> Muted <span className="pill-new">New</span>
        </div>
      </div>
    </aside>
  );
}

// =========================================================================
// Notification toast
// =========================================================================
function NotificationToast({ preset, onOpen, onDismiss }) {
  const preview = "⚠️ Issue reported on your upcoming booking";
  return (
    <div className="toast-wrap">
      <div className="toast-body" onClick={onOpen}>
        <RobinAvatar size={42} />
        <div className="toast-content">
          <div className="toast-name">Robin</div>
          <div className="toast-preview">{preview}</div>
        </div>
        <button
          className="toast-dismiss"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          title="Dismiss"
        >✕</button>
      </div>
      <div className="toast-reply" onClick={onOpen}>
        <span style={{fontSize: 16, lineHeight: 1}}>↩</span>
        Reply
      </div>
    </div>
  );
}

// =========================================================================
// Person chat view (non-Robin chats)
// =========================================================================
function PersonChat({ person, onSimulate, canSimulate }) {
  const isSarah = person.id === "sarah";
  return (
    <>
      <header className="chat-header">
        <PersonAvatar initials={person.initials} color={person.color} size={32} />
        <div className="title">{person.name}</div>
        <div className="tabs">
          <span className="tab active">Chat</span>
          <span className="tab">Schedule</span>
          <span className="tab">Settings</span>
          <span className="tab">About</span>
        </div>
        <div className="chat-header-spacer" />
        <div className="chat-header-actions">
          <button
            className="simulate-btn"
            onClick={onSimulate}
            disabled={!canSimulate}
            title={canSimulate ? "Trigger the booking alert" : "Alert already triggered — reset to replay"}
          >
            <I.sparkle /> Simulate incoming alert
          </button>
          <button className="icon-btn" title="Search"><I.search /></button>
          <button className="icon-btn" title="More"><I.more /></button>
        </div>
      </header>
      <div className="thread">
        {isSarah ? (
          <>
            <div className="day-divider">Today</div>
            <div className="msg">
              <PersonAvatar initials={person.initials} color={person.color} size={32} />
              <div>
                <div className="msg-meta">
                  <span className="who">{person.name}</span>
                  <span className="when">Today · 1:05 PM</span>
                </div>
                <div className="msg-text">Hey, still on for the design review at 2?</div>
              </div>
            </div>
            <div className="msg" style={{justifyContent: "flex-end", display: "flex", paddingRight: 4}}>
              <div style={{
                background: "#3a2c5e", color: "white",
                padding: "10px 14px", borderRadius: "16px 16px 4px 16px",
                maxWidth: 420, fontSize: 14,
              }}>
                Yep! Heading there at 2.
              </div>
            </div>
            <div className="msg">
              <PersonAvatar initials={person.initials} color={person.color} size={32} />
              <div>
                <div className="msg-meta">
                  <span className="who">{person.name}</span>
                  <span className="when">Today · 1:08 PM</span>
                </div>
                <div className="msg-text">See you there 👋</div>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--fg-faint)", fontSize: 14,
          }}>
            No messages yet
          </div>
        )}
      </div>
      <Composer />
    </>
  );
}

// =========================================================================
// Chat header
// =========================================================================
function ChatHeader({ onSimulate, canSimulate, onReset }) {
  return (
    <header className="chat-header">
      <RobinAvatar size={32} />
      <div className="title">Robin</div>
      <div className="tabs">
        <span className="tab active">Chat</span>
        <span className="tab">Schedule</span>
        <span className="tab">Settings</span>
        <span className="tab">About</span>
      </div>
      <div className="chat-header-spacer" />
      <div className="chat-header-actions">
        <button
          className="simulate-btn"
          onClick={onSimulate}
          disabled={!canSimulate}
          title={canSimulate ? "Trigger the booking alert" : "Alert already triggered — reset to replay"}
        >
          <I.sparkle /> Simulate incoming alert
        </button>
        <button className="icon-btn" title="Search"><I.search /></button>
        <button className="icon-btn" title="More"><I.more /></button>
      </div>
    </header>
  );
}

// =========================================================================
// Booking card
// =========================================================================
function BookingCard({ booking, variant = "default", actionLabel = "View in Robin", onAction, secondaryAction }) {
  const Thumb = booking.thumb === "photo"
    ? <div className="bc-thumb photo" />
    : <div className="bc-thumb">{booking.kind === "desk" ? <I.desk /> : <I.door />}</div>;

  return (
    <div className={`booking-card ${variant}`}>
      <div className="bc-row">
        <div>
          <div className="bc-title">{booking.title}</div>
          <div className="bc-time">
            <span>{booking.start}</span>
            <span className="arrow">→</span>
            <span>{booking.end}</span>
          </div>
          <div className="bc-fields">
            <div>
              <div className="bc-label">{booking.kind === "desk" ? "Desk" : "Space"}</div>
              <div className="bc-value">{booking.resource}</div>
            </div>
            <div>
              <div className="bc-label">Location</div>
              <div className="bc-value">{booking.location}</div>
            </div>
          </div>
        </div>
        {Thumb}
      </div>
      {variant !== "cancelled" && (
        <div className="bc-actions">
          <button className="btn" onClick={onAction}>{actionLabel}</button>
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// Issue presets — drives copy via Tweaks
// =========================================================================
const ISSUE_PRESETS = {
  room: {
    kind: "room",
    original: {
      title: "Design review",
      start: "2:00 PM EDT",
      end: "3:00 PM EDT",
      resource: "Nebula",
      location: "Boston HQ · 4th floor",
      thumb: "photo",
    },
    alternate: {
      title: "Design review",
      start: "2:00 PM EDT",
      end: "3:00 PM EDT",
      resource: "Andromeda",
      location: "Boston HQ · 4th floor",
      thumb: "icon",
      amenities: ["Seats 8", "Display", "Whiteboard", "Video conf."],
      fitTags: ["Same floor", "Fits 8", "5 of 6 amenities"],
    },
    alertText: "Heads up — the TV and conferencing system in Nebula was just reported as not working. Want me to move your 2:00 PM meeting?",
    suggestText: "Andromeda is free for your full window and is one floor up.",
    confirmText: "All set — I've moved your meeting to Andromeda and updated the calendar invite.",
  },
  desk: {
    kind: "desk",
    original: {
      title: "Desk booking",
      start: "9:00 AM EDT",
      end: "5:00 PM EDT",
      resource: "Desk 4B-12",
      location: "Boston HQ · 4th floor",
      thumb: "icon",
    },
    alternate: {
      title: "Desk booking",
      start: "9:00 AM EDT",
      end: "5:00 PM EDT",
      resource: "Desk 4B-08",
      location: "Boston HQ · 4th floor",
      thumb: "icon",
      amenities: ["Dual monitor", "Standing", "Near 4B team"],
      fitTags: ["Same floor", "Dual monitor", "Near 4B team"],
    },
    alertText: "Heads up — Desk 4B-12 was reported with a broken monitor this morning. Want me to find you another desk for today?",
    suggestText: "Desk 4B-08 is open all day, same floor, with the setup you usually book.",
    confirmText: "All set — you're now booked at Desk 4B-08 for today.",
  },
};

// =========================================================================
// Combined booking card (original + suggestion in one)
// =========================================================================
function CombinedBookingCard({ preset, onRebook, onDismiss, rebooked }) {
  const { original, alternate } = preset;

  const roomNameStyle = {
    fontSize: 20, fontWeight: 700, color: "var(--fg-strong)",
  };

  return (
    <div className="booking-card" style={{
      maxWidth: 560,
      borderColor: rebooked ? "#3a3a3a" : "#333",
    }}>
      {/* Event title + time */}
      <div className="bc-title">{original.title}</div>
      <div className="bc-time" style={{marginTop: 4}}>
        <span>{original.start}</span>
        <span className="arrow">→</span>
        <span>{original.end}</span>
      </div>

      <div style={{height: 1, background: "#3a3a3a", margin: "14px 0"}} />

      {/* Issue badge */}
      {!rebooked && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 12px", marginBottom: 16,
          border: "1px solid rgba(240,163,90,0.5)", borderRadius: 8,
          fontSize: 13.5, color: "var(--fg-default)",
        }}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"
               style={{width: 16, height: 16, flexShrink: 0}}>
            <circle cx="12" cy="12" r="9" stroke="var(--accent-warn)" />
            <path d="M12 8v4" stroke="var(--accent-warn)" />
            <circle cx="12" cy="16" r="0.7" fill="var(--accent-warn)" />
          </svg>
          Conference system issue reported at {original.resource}
        </div>
      )}

      {/* Side-by-side space comparison — 3-row grid so the → sits on the name row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        columnGap: 12,
        rowGap: 3,
        marginBottom: 16,
      }}>
        {/* Labels row */}
        <div className="bc-label" style={{opacity: rebooked ? 0.45 : 1}}>⚠️ Current space</div>
        <div />
        <div className="bc-label" style={{color: rebooked ? "var(--accent-good)" : undefined}}>✨ Suggested</div>

        {/* Room names + arrow row */}
        <div style={{
          ...roomNameStyle,
          opacity: rebooked ? 0.45 : 1,
          textDecoration: rebooked ? "line-through" : "none",
          textDecorationColor: "rgba(255,255,255,0.4)",
        }}>
          {original.resource}
        </div>
        <div style={{color: "var(--fg-muted)", fontSize: 18, alignSelf: "center"}}>→</div>
        <div style={roomNameStyle}>{alternate.resource}</div>

        {/* Location row */}
        <div style={{color: "var(--fg-muted)", fontSize: 13, opacity: rebooked ? 0.45 : 1}}>
          {original.location}
        </div>
        <div />
        <div style={{color: "var(--fg-muted)", fontSize: 13}}>{alternate.location}</div>
      </div>

      {/* Fit tags */}
      <div className="amenities" style={{marginBottom: 14}}>
        {alternate.fitTags.map((tag) => (
          <span className="amenity" key={tag}><span className="dot" />{tag}</span>
        ))}
      </div>

      {/* Actions */}
      {!rebooked && (
        <div className="bc-actions">
          <button className="btn primary" style={{flex: 1}} onClick={onRebook}>
            Book suggestion
          </button>
          <button className="btn" style={{flex: 1}} onClick={onDismiss}>
            View in Robin
          </button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// Alert message
// =========================================================================
function AlertMessage({ preset, onRebook, onDismiss, rebooked }) {
  return (
    <div className="msg anim-in">
      <RobinAvatar size={32} />
      <div>
        <div className="msg-meta">
          <span className="who">Robin</span>
          <span className="when">Today · 1:42 PM</span>
        </div>

        <div className="alert-banner">
          <span>⚠️</span>
          <span>
            Issue reported on your {preset.kind === "desk" ? "desk" : "meeting room"} booking
          </span>
        </div>

        <div className="msg-text" style={{maxWidth: 560}}>
          {preset.alertText}
        </div>

        <CombinedBookingCard
          preset={preset}
          onRebook={onRebook}
          onDismiss={onDismiss}
          rebooked={rebooked}
        />
      </div>
    </div>
  );
}

// =========================================================================
// Confirmation message
// =========================================================================
function ConfirmationMessage({ preset }) {
  return (
    <div className="msg anim-in">
      <RobinAvatar size={32} />
      <div>
        <div className="msg-meta">
          <span className="who">Robin</span>
          <span className="when">Today · 1:43 PM</span>
        </div>
        <div className="ok-banner">
          <I.check />
          <span>Rebooked</span>
        </div>
        <div className="msg-text" style={{maxWidth: 560}}>
          {preset.confirmText}
        </div>
        <BookingCard
          booking={preset.alternate}
          variant="success"
          actionLabel="View in Robin"
        />
      </div>
    </div>
  );
}

// =========================================================================
// User reply bubble (shown when user clicks Rebook)
// =========================================================================
function UserReply({ text }) {
  return (
    <div className="msg anim-in" style={{justifyContent: "flex-end", display: "flex", paddingRight: 4}}>
      <div style={{
        background: "#3a2c5e",
        color: "white",
        padding: "10px 14px",
        borderRadius: "16px 16px 4px 16px",
        maxWidth: 420,
        fontSize: 14,
      }}>
        {text}
      </div>
    </div>
  );
}

// =========================================================================
// Typing indicator row
// =========================================================================
function TypingRow() {
  return (
    <div className="msg anim-in">
      <RobinAvatar size={32} />
      <div>
        <div className="typing"><span/><span/><span/></div>
      </div>
    </div>
  );
}

// =========================================================================
// History (the prior, calm Robin notifications — mirrors the screenshot)
// =========================================================================
function HistoryThread() {
  return (
    <>
      <div className="msg">
        <RobinAvatar size={32} />
        <div>
          <div className="msg-meta">
            <span className="who">Robin</span>
            <span className="when">7/22/2025 · 10:26 AM</span>
          </div>
          <div className="msg-text">Your next meeting starts at 10:30 AM EDT in Naboo.</div>
          <BookingCard
            booking={{
              title: "Management standup global edition",
              start: "10:30 AM EDT",
              end: "11:00 AM EDT",
              resource: "Naboo",
              location: "Boston HQ · 3rd floor",
              kind: "room",
              thumb: "photo",
            }}
          />
        </div>
      </div>

      <div className="day-divider">Wednesday, July 23, 2025</div>

      <div className="msg">
        <RobinAvatar size={32} />
        <div>
          <div className="msg-meta">
            <span className="who">Robin</span>
            <span className="when">7/23/2025 · 4:55 AM</span>
          </div>
          <div className="msg-text">Your next meeting starts at 11:00 AM CEST in Nebula.</div>
          <BookingCard
            booking={{
              title: "Griffin 🐙: Standup",
              start: "11:00 AM CEST",
              end: "11:15 AM CEST",
              resource: "Nebula",
              location: "Dublin · 2nd floor",
              kind: "room",
              thumb: "icon",
            }}
          />
        </div>
      </div>

      <div className="day-divider">Today</div>
    </>
  );
}

// =========================================================================
// Composer
// =========================================================================
function Composer() {
  const [text, setText] = useState("");
  return (
    <div className="composer-wrap">
      <div className="view-prompts">
        <I.sparkle /> View prompts
      </div>
      <div className="composer">
        <button className="icon-btn" title="Attach"><I.attach /></button>
        <input
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="icon-btn" title="Emoji"><I.emoji /></button>
        <button className={`send ${text ? "active" : ""}`} title="Send"><I.send /></button>
      </div>
    </div>
  );
}

// =========================================================================
// Main app — state machine
// =========================================================================
// phases: "idle" | "notified" | "typing-alert" | "alert" | "user-replied" | "typing-confirm" | "confirmed"
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const preset = ISSUE_PRESETS[tweaks.issueType] || ISSUE_PRESETS.room;

  const [activeChat, setActiveChat] = useState("sarah");
  const [phase, setPhase] = useState("idle");
  const [showToast, setShowToast] = useState(false);
  const threadRef = useRef(null);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [phase]);

  useEffect(() => {
    setPhase("idle");
    setShowToast(false);
    setActiveChat("sarah");
  }, [tweaks.issueType]);

  function simulate() {
    if (phase !== "idle") return;
    if (activeChat === "robin") {
      setPhase("typing-alert");
      setTimeout(() => setPhase("alert"), 1400);
    } else {
      setPhase("notified");
      setShowToast(true);
    }
  }

  function openRobinChat() {
    setShowToast(false);
    setActiveChat("robin");
    if (phase === "notified") {
      setPhase("alert");
    }
  }

  function selectChat(id) {
    if (id === "robin") {
      openRobinChat();
    } else {
      setActiveChat(id);
    }
  }

  function rebook() {
    setPhase("user-replied");
    setTimeout(() => setPhase("typing-confirm"), 450);
    setTimeout(() => setPhase("confirmed"), 1700);
  }

  function resetFlow() {
    setPhase("idle");
    setShowToast(false);
    setActiveChat("sarah");
  }

  const canSimulate = phase === "idle";
  const hasRobinNotification = phase === "notified";
  const activePerson = PEOPLE.find(p => p.id === activeChat);

  return (
    <div className="app">
      <Sidebar
        activeChat={activeChat}
        onSelectChat={selectChat}
        hasRobinNotification={hasRobinNotification}
      />
      <div className="main">
        {activeChat === "robin" ? (
          <>
            <ChatHeader onSimulate={simulate} canSimulate={canSimulate} onReset={resetFlow} />
            <div className="thread" ref={threadRef}>
              <HistoryThread />
              {phase === "typing-alert" && <TypingRow />}
              {(phase === "alert" || phase === "user-replied" || phase === "typing-confirm" || phase === "confirmed") && (
                <AlertMessage
                  preset={preset}
                  onRebook={rebook}
                  onDismiss={() => {}}
                  rebooked={phase === "confirmed" || phase === "typing-confirm" || phase === "user-replied"}
                />
              )}
              {(phase === "user-replied" || phase === "typing-confirm" || phase === "confirmed") && (
                <UserReply text={`Yes, rebook me in ${preset.alternate.resource}`} />
              )}
              {phase === "typing-confirm" && <TypingRow />}
              {phase === "confirmed" && <ConfirmationMessage preset={preset} />}
            </div>
            <Composer />
          </>
        ) : (
          <PersonChat
            person={activePerson || PEOPLE[0]}
            onSimulate={simulate}
            canSimulate={canSimulate}
          />
        )}
      </div>

      {showToast && (
        <NotificationToast
          preset={preset}
          onOpen={openRobinChat}
          onDismiss={() => setShowToast(false)}
        />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Flow" />
        <TweakButton label="Replay the alert flow" onClick={resetFlow} />
        <TweakSection label="Issue type" />
        <TweakRadio
          label="Resource"
          value={tweaks.issueType}
          onChange={(v) => setTweak("issueType", v)}
          options={[
            { value: "room", label: "Meeting room" },
            { value: "desk", label: "Desk" },
          ]}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
