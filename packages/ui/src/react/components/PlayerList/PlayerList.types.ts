import type { ComponentPropsWithRef, ReactNode } from "react";

/** Colour of a player's status text. The game decides what each state means. */
export type PlayerStatusTone = "default" | "primary" | "success" | "warning" | "danger";

export type PlayerListSize = "sm" | "md";

export interface PlayerEntry {
  /** Stable, unique identifier for this player. */
  id: string;
  /** Displayed name. Long names truncate rather than wrap. */
  name: ReactNode;
  /** Short state text such as "Ready", "Spectating", or "Eliminated". */
  status?: ReactNode;
  statusTone?: PlayerStatusTone;
  /** Secondary text such as a score, level, or latency. */
  detail?: ReactNode;
  /** Avatar, team colour, or role icon. */
  icon?: ReactNode;
  /** Marks the local player, so the row is easy to find in a long list. */
  self?: boolean;
  /** Controls for this player, such as a kick or mute button. */
  actions?: ReactNode;
}

export interface PlayerListProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** Players in the order they should appear. The game decides the order. */
  players: readonly PlayerEntry[];
  /** Shown when there are no players. */
  empty?: ReactNode;
  size?: PlayerListSize;
}
