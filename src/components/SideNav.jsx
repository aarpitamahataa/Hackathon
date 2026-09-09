import { House, Scroll, Buildings, BookOpen, UsersThree, GearSix } from "@phosphor-icons/react";

const ITEMS = [
  { id: "home", label: "Home", icon: House, available: true },
  { id: "quests", label: "Quests", icon: Scroll, available: true },
  { id: "houses", label: "Houses", icon: Buildings, available: true },
  { id: "chronicle", label: "Chronicle", icon: BookOpen, available: true },
  { id: "companions", label: "Companions", icon: UsersThree, available: false },
];

/**
 * Left icon rail. Each item is its own full page — clicking one shows only that
 * page's content, nothing else. "Companions" (social) genuinely needs real accounts,
 * which aren't built yet, so it's shown disabled rather than faked.
 */
export default function SideNav({ activeSection, onNavigate, onOpenSettings }) {
  return (
    <nav className="side-nav" aria-label="Primary">
      <div className="side-nav-brand" aria-hidden="true">
        <span className="side-nav-brand-glyph">✦</span>
      </div>
      <ul className="side-nav-list">
        {ITEMS.map(({ id, label, icon: Icon, available }) => (
          <li key={id}>
            <button
              type="button"
              className={"side-nav-item" + (activeSection === id ? " side-nav-item-active" : "")}
              disabled={!available}
              title={available ? label : `${label} — coming soon`}
              aria-label={available ? label : `${label}, coming soon`}
              onClick={() => available && onNavigate(id)}
            >
              <Icon size={22} weight={activeSection === id ? "fill" : "regular"} aria-hidden="true" />
              <span className="side-nav-label">{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="side-nav-item side-nav-settings"
        title="Settings"
        aria-label="Settings"
        onClick={onOpenSettings}
      >
        <GearSix size={22} aria-hidden="true" />
        <span className="side-nav-label">Settings</span>
      </button>
    </nav>
  );
}
