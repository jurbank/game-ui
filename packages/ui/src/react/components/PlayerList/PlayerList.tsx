import {
  playerListActions,
  playerListDetail,
  playerListEmpty,
  playerListIcon,
  playerListItems,
  playerListName,
  playerListRoot,
  playerListRow,
  playerListRowSizes,
  playerListStatus,
  playerListStatusTones,
} from "./PlayerList.styles.ts";
import type { PlayerListProps } from "./PlayerList.types.ts";

export function PlayerList({
  players,
  empty = "No players",
  size = "md",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: PlayerListProps) {
  return (
    <div
      {...props}
      data-size={size}
      data-empty={players.length === 0 ? "" : undefined}
      className={[playerListRoot, className].filter(Boolean).join(" ")}
    >
      {players.length === 0 ? (
        // No list is rendered when there is nothing in it, so screen reader
        // users hear the explanation instead of an empty list.
        <p data-game-part="empty" className={playerListEmpty}>
          {empty}
        </p>
      ) : (
        <ul aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className={playerListItems}>
          {players.map((player) => (
            <li
              key={player.id}
              data-game-part="player"
              data-player-id={player.id}
              data-self={player.self ? "" : undefined}
              className={[playerListRow, playerListRowSizes[size]].join(" ")}
            >
              {player.icon !== undefined && player.icon !== null && (
                <span className={playerListIcon}>{player.icon}</span>
              )}
              <span
                className={playerListName}
                title={typeof player.name === "string" ? player.name : undefined}
              >
                {player.name}
              </span>
              {player.detail !== undefined && player.detail !== null && (
                <span className={playerListDetail}>{player.detail}</span>
              )}
              {player.status !== undefined && player.status !== null && (
                <span
                  data-game-part="status"
                  className={[
                    playerListStatus,
                    playerListStatusTones[player.statusTone ?? "default"],
                  ].join(" ")}
                >
                  {player.status}
                </span>
              )}
              {player.actions !== undefined && player.actions !== null && (
                <span className={playerListActions}>{player.actions}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
