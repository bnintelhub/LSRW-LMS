import { useMemo, type ReactNode } from "react";
import { Bell, LogOut, Mail } from "lucide-react";
import { PortalSearch, type PortalSearchItem } from "./PortalSearch";

export type PortalNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

type Props = {
  brand: string;
  roleLabel: string;
  greeting: string;
  personName: string;
  personMeta: string;
  initials: string;
  nav: PortalNavItem[];
  active: string;
  onNav: (id: string) => void;
  onLogout: () => void;
  searchItems?: PortalSearchItem[];
  promo?: { title: string; text: string; action: string; onClick: () => void };
  headerExtra?: ReactNode;
  children: ReactNode;
};

export function PortalShell({
  brand,
  roleLabel,
  greeting,
  personName,
  personMeta,
  initials,
  nav,
  active,
  onNav,
  onLogout,
  searchItems = [],
  promo,
  headerExtra,
  children,
}: Props) {
  const allSearchItems = useMemo<PortalSearchItem[]>(
    () => [
      ...nav.map((item) => ({
        id: `page-${item.id}`,
        label: item.label,
        hint: "Go to page",
        category: "Pages",
        onSelect: () => onNav(item.id),
      })),
      ...searchItems,
    ],
    [nav, searchItems, onNav],
  );

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-logo">📚</div>
          <div>
            <p className="font-black text-slate-900">{brand}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">{roleLabel}</p>
          </div>
        </div>

        <nav className="portal-nav">
          {nav.map((item) => (
            <button
              key={item.id}
              className={`portal-nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => onNav(item.id)}
            >
              <span className="portal-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {promo && (
          <div className="portal-promo">
            <p className="text-sm font-black text-slate-900">{promo.title}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{promo.text}</p>
            <button onClick={promo.onClick} className="mt-3 w-full rounded-xl bg-orange-500 py-2 text-xs font-black text-white">
              {promo.action}
            </button>
          </div>
        )}
      </aside>

      <div className="portal-main">
        <header className="portal-topbar">
          <PortalSearch items={allSearchItems} />
          <div className="flex items-center gap-2">
            {headerExtra}
            <button className="portal-icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="portal-dot" />
            </button>
            <button className="portal-icon-btn" aria-label="Messages">
              <Mail size={18} />
            </button>
            <div className="portal-user">
              <div className="portal-avatar">{initials}</div>
              <div className="hidden sm:block">
                <p className="text-sm font-black text-slate-900">{greeting}</p>
                <p className="text-[11px] font-semibold text-slate-500">{personName} · {personMeta}</p>
              </div>
            </div>
            <button className="portal-icon-btn" onClick={onLogout} aria-label="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div className="portal-content">{children}</div>
      </div>
    </div>
  );
}

export function WelcomeBanner({
  title,
  text,
  badge,
}: {
  title: string;
  text: string;
  badge?: string;
}) {
  return (
    <div className="welcome-banner">
      <div>
        {badge && <span className="welcome-badge">{badge}</span>}
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600">{text}</p>
      </div>
      <div className="welcome-art" aria-hidden>
        <span>📘</span>
        <span>✏️</span>
        <span>🎓</span>
      </div>
    </div>
  );
}

export function Sparkline({ color = "#f97316" }: { color?: string }) {
  return (
    <svg width="72" height="28" viewBox="0 0 72 28" fill="none" className="mt-2">
      <path
        d="M1 20 C10 18, 14 8, 22 12 C30 16, 34 6, 42 9 C50 12, 56 4, 71 7"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RingProgress({ value, label }: { value: number; label: string }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#f97316"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="54" textAnchor="middle" className="fill-slate-900" fontSize="16" fontWeight="800">
          {value}%
        </text>
      </svg>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}
