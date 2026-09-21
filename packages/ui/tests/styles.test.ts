// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile } from "@tailwindcss/node";
import { expect, test } from "vite-plus/test";
import * as buttonStyles from "../src/react/components/Button/Button.styles.ts";
import * as modalStyles from "../src/react/components/Modal/Modal.styles.ts";
import * as panelStyles from "../src/react/components/Panel/Panel.styles.ts";
import * as playerListStyles from "../src/react/components/PlayerList/PlayerList.styles.ts";
import * as progressBarStyles from "../src/react/components/ProgressBar/ProgressBar.styles.ts";
import * as scoreboardStyles from "../src/react/components/Scoreboard/Scoreboard.styles.ts";
import * as sliderStyles from "../src/react/components/Slider/Slider.styles.ts";
import * as switchStyles from "../src/react/components/Switch/Switch.styles.ts";
import * as tabsStyles from "../src/react/components/Tabs/Tabs.styles.ts";
import * as timerStyles from "../src/react/components/Timer/Timer.styles.ts";

const stylesPath = fileURLToPath(new URL("../src/react/styles.css", import.meta.url));

const styleModules: Record<string, string | Record<string, string>>[] = [
  buttonStyles,
  modalStyles,
  panelStyles,
  playerListStyles,
  scoreboardStyles,
  progressBarStyles,
  timerStyles,
  sliderStyles,
  switchStyles,
  tabsStyles,
];

const classStrings = styleModules.flatMap((styles) =>
  Object.values(styles).flatMap((value) =>
    typeof value === "string" ? [value] : Object.values(value),
  ),
);

const classNames = [
  ...new Set(classStrings.flatMap((value) => value.split(/\s+/).filter(Boolean))),
];

test("animated components time themselves with motion tokens", () => {
  // Hard-coded durations would ignore the reduced-motion override, which works
  // by setting the duration tokens to 0ms.
  const timed = classNames.filter((name) => name.startsWith("duration-"));
  expect(timed.length).toBeGreaterThan(0);
  for (const name of timed) {
    expect(name).toMatch(/^duration-\(--game-duration-(fast|normal)\)$/);
  }
  for (const name of classNames.filter((name) => name.startsWith("ease-"))) {
    expect(name).toBe("ease-game");
  }
});

test("every component class generates CSS", async () => {
  const compiler = await compile(readFileSync(stylesPath, "utf8"), {
    base: fileURLToPath(new URL("../src/react/", import.meta.url)),
    onDependency: () => {},
  });

  // Unknown classes, typos, and default-theme values such as `px-4` or
  // `bg-blue-600` generate no rule because the default theme is not loaded.
  const css = compiler.build(classNames);
  const selector = (name: string) => `.${name.replace(/[^\w-]/g, "\\$&")}`;
  const missing = classNames.filter((name) => !css.includes(selector(name)));
  expect(missing).toEqual([]);
});
