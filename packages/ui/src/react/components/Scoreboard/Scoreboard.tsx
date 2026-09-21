import { useId } from "react";
import { playerListStatusTones } from "../PlayerList/PlayerList.styles.ts";
import {
  scoreboardAlignments,
  scoreboardCaption,
  scoreboardCaptionHidden,
  scoreboardCell,
  scoreboardCellSizes,
  scoreboardEmpty,
  scoreboardHeaderCell,
  scoreboardName,
  scoreboardNameHeader,
  scoreboardNameText,
  scoreboardRank,
  scoreboardRoot,
  scoreboardRow,
  scoreboardScore,
  scoreboardStatus,
  scoreboardTable,
  scoreboardValue,
} from "./Scoreboard.styles.ts";
import type { ScoreboardProps } from "./Scoreboard.types.ts";

function isPresent(value: unknown) {
  return value !== undefined && value !== null;
}

export function Scoreboard({
  rows,
  columns = [],
  caption,
  hideCaption = false,
  nameHeader = "Player",
  scoreHeader = "Score",
  rankHeader = "#",
  empty = "No results yet",
  size = "md",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ScoreboardProps) {
  const captionId = useId();
  // Columns appear only when a row supplies them, so a simple scoreboard
  // stays two columns wide.
  const hasRank = rows.some((row) => isPresent(row.rank));
  const hasScore = rows.some((row) => isPresent(row.score));
  const hasStatus = rows.some((row) => isPresent(row.status));
  const cellSize = scoreboardCellSizes[size];

  return (
    <div
      {...props}
      data-size={size}
      data-empty={rows.length === 0 ? "" : undefined}
      className={[scoreboardRoot, className].filter(Boolean).join(" ")}
    >
      {rows.length === 0 ? (
        <p data-game-part="empty" className={scoreboardEmpty}>
          {empty}
        </p>
      ) : (
        <table
          aria-label={ariaLabel}
          aria-labelledby={
            ariaLabelledBy ?? (isPresent(caption) && !ariaLabel ? captionId : undefined)
          }
          className={scoreboardTable}
        >
          {isPresent(caption) && (
            <caption
              id={captionId}
              className={hideCaption ? scoreboardCaptionHidden : scoreboardCaption}
            >
              {caption}
            </caption>
          )}
          <thead>
            <tr>
              {hasRank && (
                <th scope="col" className={[scoreboardHeaderCell, cellSize].join(" ")}>
                  {rankHeader}
                </th>
              )}
              <th
                scope="col"
                className={[scoreboardHeaderCell, cellSize, scoreboardNameHeader].join(" ")}
              >
                {nameHeader}
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={[
                    scoreboardHeaderCell,
                    cellSize,
                    scoreboardAlignments[column.align ?? "end"],
                  ].join(" ")}
                >
                  {column.header}
                </th>
              ))}
              {hasScore && (
                <th
                  scope="col"
                  className={[scoreboardHeaderCell, cellSize, scoreboardAlignments.end].join(" ")}
                >
                  {scoreHeader}
                </th>
              )}
              {hasStatus && (
                <th
                  scope="col"
                  className={[scoreboardHeaderCell, cellSize, scoreboardAlignments.end].join(" ")}
                >
                  <span className={scoreboardCaptionHidden}>Status</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                data-game-part="row"
                data-row-id={row.id}
                data-self={row.self ? "" : undefined}
                data-highlight={row.highlight ? "" : undefined}
                className={scoreboardRow}
              >
                {hasRank && (
                  <td className={[scoreboardCell, cellSize, scoreboardRank].join(" ")}>
                    {row.rank}
                  </td>
                )}
                <th scope="row" className={[scoreboardCell, cellSize, scoreboardName].join(" ")}>
                  <span
                    className={scoreboardNameText}
                    title={typeof row.name === "string" ? row.name : undefined}
                  >
                    {row.name}
                  </span>
                </th>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={[
                      scoreboardCell,
                      cellSize,
                      scoreboardValue,
                      scoreboardAlignments[column.align ?? "end"],
                    ].join(" ")}
                  >
                    {row.values?.[column.id]}
                  </td>
                ))}
                {hasScore && (
                  <td
                    data-game-part="score"
                    className={[
                      scoreboardCell,
                      cellSize,
                      scoreboardScore,
                      scoreboardAlignments.end,
                    ].join(" ")}
                  >
                    {row.score}
                  </td>
                )}
                {hasStatus && (
                  <td
                    data-game-part="status"
                    className={[
                      scoreboardCell,
                      cellSize,
                      scoreboardStatus,
                      scoreboardAlignments.end,
                      playerListStatusTones[row.statusTone ?? "default"],
                    ].join(" ")}
                  >
                    {row.status}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
