import {
  announcementCard,
  announcementDetail,
  announcementRegion,
  announcementTitle,
  announcementTitleSizes,
  announcementTitleTones,
} from "./Announcement.styles.ts";
import type { AnnouncementProps } from "./Announcement.types.ts";

/**
 * A big, brief message for a moment in the match: a countdown, "Go!", or
 * "Round over". Place it in a centered HudSlot; the game sets and clears it.
 */
export function Announcement({
  title,
  detail,
  tone = "default",
  size = "lg",
  politeness = "polite",
  className,
  ...props
}: AnnouncementProps) {
  const visible = title !== undefined && title !== null && title !== false && title !== "";
  // Remount on a new text title so the entrance animation plays for each beat of a countdown.
  const key =
    typeof title === "string" || typeof title === "number"
      ? `${String(title)}|${typeof detail === "string" ? detail : ""}`
      : undefined;

  return (
    <div
      {...props}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      data-tone={tone}
      data-size={size}
      className={[announcementRegion, className].filter(Boolean).join(" ")}
    >
      {visible && (
        <div key={key} data-game-part="card" className={announcementCard}>
          <p
            className={[
              announcementTitle,
              announcementTitleSizes[size],
              announcementTitleTones[tone],
            ].join(" ")}
          >
            {title}
          </p>
          {detail !== undefined && detail !== null && (
            <p className={announcementDetail}>{detail}</p>
          )}
        </div>
      )}
    </div>
  );
}
