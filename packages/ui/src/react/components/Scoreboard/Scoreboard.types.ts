import type { ComponentPropsWithRef, ReactNode } from "react";
import type { PlayerStatusTone } from "../PlayerList/PlayerList.types.ts";

export type ScoreboardSize = "sm" | "md";

export type ScoreboardAlign = "start" | "end";

/** An extra statistic column, such as eliminations, assists, or latency. */
export interface ScoreboardColumn {
  /** Key used to read this column's value from a row. */
  id: string;
  header: ReactNode;
  /** Defaults to `end`, which suits numbers. */
  align?: ScoreboardAlign;
}

export interface ScoreboardRow {
  /** Stable, unique identifier for this row. */
  id: string;
  /** Player or team name. */
  name: ReactNode;
  /** The row's main value. */
  score?: ReactNode;
  /** Placement text. The game decides how ties and ranking work. */
  rank?: ReactNode;
  status?: ReactNode;
  statusTone?: PlayerStatusTone;
  /** Marks the local player's row. */
  self?: boolean;
  /** Marks a winning or otherwise notable row. The game decides who wins. */
  highlight?: boolean;
  /** Values for the extra `columns`, keyed by column id. */
  values?: Readonly<Record<string, ReactNode>>;
}

export interface ScoreboardProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** Rows in final order. The game ranks, sorts, and groups them. */
  rows: readonly ScoreboardRow[];
  /** Extra statistic columns, in display order. */
  columns?: readonly ScoreboardColumn[];
  /** Accessible and visible description of the table. */
  caption?: ReactNode;
  /** Hide the caption visually while keeping it for screen readers. */
  hideCaption?: boolean;
  nameHeader?: ReactNode;
  scoreHeader?: ReactNode;
  rankHeader?: ReactNode;
  /** Shown when there are no rows. */
  empty?: ReactNode;
  size?: ScoreboardSize;
}
