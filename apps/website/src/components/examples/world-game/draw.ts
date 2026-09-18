import type { WorldDescriptor } from "@game-ui/world-ui";
import type { CanvasPresentation } from "./presentation";
import { healthFraction } from "./spatial";

/**
 * Draws one descriptor centred on a projected screen point, in CSS pixels.
 * Expects `ctx.font`, `textAlign: "center"`, and `textBaseline: "middle"`.
 */
export function drawDescriptor(
  ctx: CanvasRenderingContext2D,
  theme: CanvasPresentation,
  descriptor: WorldDescriptor<"2d">,
  x: number,
  y: number,
) {
  const tone = descriptor.tone ?? "default";
  if (descriptor.kind === "health-bar") {
    ctx.fillStyle = theme.panel;
    ctx.fillRect(x - 36, y - 4, 72, 8);
    ctx.fillStyle = theme.fillTones[tone];
    ctx.fillRect(x - 36, y - 4, 72 * healthFraction(descriptor.value, descriptor.max), 8);
    ctx.strokeStyle = theme.border;
    ctx.strokeRect(x - 36, y - 4, 72, 8);
    return;
  }
  const text =
    descriptor.kind === "nameplate"
      ? `${descriptor.selected ? "◆ " : ""}${descriptor.name}${descriptor.status ? ` · ${descriptor.status}` : ""}`
      : descriptor.text;
  const textWidth = ctx.measureText(text).width;
  ctx.fillStyle = theme.panel;
  ctx.fillRect(x - textWidth / 2 - 5, y - 10, textWidth + 10, 20);
  ctx.fillStyle = theme.textTones[tone];
  ctx.fillText(text, x, y);
}
