import { Target, Flame, Barbell, BookOpen, Star } from "@phosphor-icons/react";

// A small, curated set — five glyphs, not fifty — each broad enough to represent
// any kind of quest rather than one literal activity. Chosen over a wider emoji
// picker on purpose: fewer, better choices, rendered as glowing neon outlines
// instead of flat colored emoji.
export const QUEST_ICONS = [
  { id: "target", label: "Target", Icon: Target },
  { id: "flame", label: "Flame", Icon: Flame },
  { id: "barbell", label: "Barbell", Icon: Barbell },
  { id: "book", label: "Book", Icon: BookOpen },
  { id: "star", label: "Star", Icon: Star },
];

export const DEFAULT_QUEST_ICON = QUEST_ICONS[0].id;

export function getQuestIcon(id) {
  return QUEST_ICONS.find((i) => i.id === id);
}
