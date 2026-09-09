import { getQuestIcon, DEFAULT_QUEST_ICON } from "../lib/questIcons.js";

/**
 * Renders a quest's icon as a black badge with a glowing neon-gold outline —
 * gamified, not decorative-colorful. Falls back to rendering the raw stored value
 * (older habits kept the plain emoji they were created with) so existing data never
 * disappears when the icon system changed.
 */
export default function QuestIcon({ value, size = 20, className = "" }) {
  const known = getQuestIcon(value) || getQuestIcon(DEFAULT_QUEST_ICON);
  const isLegacyEmoji = !getQuestIcon(value) && value;

  return (
    <span className={`quest-icon ${className}`.trim()} aria-hidden="true">
      {isLegacyEmoji ? (
        <span className="quest-icon-legacy" style={{ fontSize: size }}>
          {value}
        </span>
      ) : (
        <known.Icon size={size} weight="duotone" />
      )}
    </span>
  );
}
