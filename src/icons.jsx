const Icon = ({ d, size = 18, fill = false, viewBox = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill ? "currentColor" : "none"}
       stroke={fill ? "none" : "currentColor"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

export const I = {
  Pin: (p) => <Icon size={p?.size} d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  Calendar: (p) => <Icon size={p?.size} d={<>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18 M8 3v4 M16 3v4" />
  </>} />,
  People: (p) => <Icon size={p?.size} d={<>
    <circle cx="9" cy="9" r="3.5" />
    <path d="M2.5 19c.7-3 3.6-5 6.5-5s5.8 2 6.5 5" />
    <circle cx="17" cy="7.5" r="2.5" />
    <path d="M16 13.5c2.6.4 4.5 2.3 5 4.5" />
  </>} />,
  Building: (p) => <Icon size={p?.size} d={<>
    <path d="M4 21V5l8-2 8 2v16" />
    <path d="M8 9h2 M8 13h2 M8 17h2 M14 9h2 M14 13h2 M14 17h2" />
    <path d="M2.5 21h19" />
  </>} />,
  Desk: (p) => <Icon size={p?.size} d={<>
    <path d="M3 9h18 M3 9v3 M21 9v3 M5 12v8 M19 12v8 M9 12v4 M15 12v4" />
  </>} />,
  Stack: (p) => <Icon size={p?.size} d={<>
    <path d="M12 3 2 8l10 5 10-5-10-5Z" />
    <path d="m2 13 10 5 10-5 M2 18l10 5 10-5" />
  </>} />,
  Chart: (p) => <Icon size={p?.size} d={<>
    <path d="M4 19V5 M4 19h16 M8 16V11 M12 16V8 M16 16v-6" />
  </>} />,
  Gear: (p) => <Icon size={p?.size} d={<>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </>} />,
  Help: (p) => <Icon size={p?.size} d={<>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4 M12 17h0" />
  </>} />,
  Chat: (p) => <Icon size={p?.size} d="M4 5h16v11H8l-4 4V5Z" />,
  Bell: (p) => <Icon size={p?.size} d={<>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2.5h-15L6 16Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>} />,
  Plus: (p) => <Icon size={p?.size} d="M12 5v14 M5 12h14" />,
  Close: (p) => <Icon size={p?.size} d="M6 6l12 12 M18 6 6 18" />,
  Check: (p) => <Icon size={p?.size} d="M4 12l5 5L20 6" />,
  Chevron: (p) => <Icon size={p?.size} d="M6 9l6 6 6-6" />,
  ChevronR: (p) => <Icon size={p?.size} d="M9 6l6 6-6 6" />,
  Arrow: (p) => <Icon size={p?.size} d="M5 12h14 M13 6l6 6-6 6" />,
  Search: (p) => <Icon size={p?.size} d={<>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>} />,
  Drag: (p) => <Icon size={p?.size} d="M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01" />,
  Trash: (p) => <Icon size={p?.size} d={<>
    <path d="M4 7h16 M10 11v6 M14 11v6" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M9 7V4h6v3" />
  </>} />,
  Spaces: (p) => <Icon size={p?.size} d={<>
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M3 9h18 M9 4v14" />
  </>} />,
  Laptop: (p) => <Icon size={p?.size} d={<>
    <rect x="4" y="5" width="16" height="11" rx="1.5" />
    <path d="M2 19h20" />
  </>} />,
  Car: (p) => <Icon size={p?.size} d={<>
    <path d="M5 13l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 13 M3 13h18v5h-2v1.5a1.5 1.5 0 0 1-3 0V18H8v1.5a1.5 1.5 0 0 1-3 0V18H3v-5Z" />
    <circle cx="7.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
  </>} />,
  Locker: (p) => <Icon size={p?.size} d={<>
    <rect x="5" y="3" width="14" height="18" rx="1.5" />
    <path d="M5 12h14 M15 7h.01 M15 16h.01" />
  </>} />,
  Star: (p) => <Icon size={p?.size} d="M12 3l2.7 5.5L21 9.4l-4.5 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L3 9.4l6.3-.9L12 3Z" />,
  ServiceNow: (p) => <Icon size={p?.size} d={<>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" />
  </>} />,
  Sparkle: (p) => <Icon size={p?.size} d="M12 3v4 M12 17v4 M3 12h4 M17 12h4 M5.5 5.5l2.5 2.5 M16 16l2.5 2.5 M5.5 18.5 8 16 M16 8l2.5-2.5" />,
  Mail: (p) => <Icon size={p?.size} d={<>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>} />,
  Slack: (p) => <Icon size={p?.size} d={<>
    <rect x="13" y="2" width="4" height="9" rx="2" />
    <rect x="7" y="13" width="4" height="9" rx="2" />
    <rect x="2" y="7" width="9" height="4" rx="2" />
    <rect x="13" y="13" width="9" height="4" rx="2" />
  </>} />,
  Photo: (p) => <Icon size={p?.size} d={<>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="11" r="2" />
    <path d="m3 17 5-4 5 3 4-3 4 4" />
  </>} />,
  Clock: (p) => <Icon size={p?.size} d={<>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>} />,
  AlertOctagon: (p) => <Icon size={p?.size} d={<>
    <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8l6-6Z" />
    <path d="M12 8v4 M12 16h0" />
  </>} />,
  ListChecks: (p) => <Icon size={p?.size} d={<>
    <path d="m3 7 2 2 4-4 M3 14l2 2 4-4 M13 8h8 M13 16h8" />
  </>} />,
  Tag: (p) => <Icon size={p?.size} d={<>
    <path d="M3 12V4h8l10 10-8 8L3 12Z" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
  </>} />,
  Text: (p) => <Icon size={p?.size} d="M5 6h14 M5 12h14 M5 18h9" />,
  Paragraph: (p) => <Icon size={p?.size} d="M5 6h14 M5 10h14 M5 14h14 M5 18h10" />,
  Pin2: (p) => <Icon size={p?.size} d={<>
    <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M19 9c0 6-7 12-7 12s-7-6-7-12a7 7 0 1 1 14 0Z" />
  </>} />,
  Anonymous: (p) => <Icon size={p?.size} d={<>
    <path d="M4 15c1.5-2 4-3.5 8-3.5s6.5 1.5 8 3.5" />
    <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
    <path d="M3 18h18" />
  </>} />,
  Sliders: (p) => <Icon size={p?.size} d="M4 6h10 M18 6h2 M4 12h2 M10 12h10 M4 18h12 M20 18h0 M14 4v4 M6 10v4 M16 16v4" />,
  Flag: (p) => <Icon size={p?.size} d="M5 4v17 M5 4h12l-4 5 4 5H5" />,
};
