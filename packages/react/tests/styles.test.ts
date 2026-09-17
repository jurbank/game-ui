// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile } from "@tailwindcss/node";
import { expect, test } from "vite-plus/test";
import * as buttonStyles from "../src/components/Button/Button.styles.ts";
import * as modalStyles from "../src/components/Modal/Modal.styles.ts";
import * as panelStyles from "../src/components/Panel/Panel.styles.ts";

const stylesPath = fileURLToPath(new URL("../src/styles.css", import.meta.url));

const styleModules: Record<string, string | Record<string, string>>[] = [
  buttonStyles,
  modalStyles,
  panelStyles,
];

const classStrings = styleModules.flatMap((styles) =>
  Object.values(styles).flatMap((value) =>
    typeof value === "string" ? [value] : Object.values(value),
  ),
);

const classNames = [
  ...new Set(classStrings.flatMap((value) => value.split(/\s+/).filter(Boolean))),
];

test("every component class generates CSS", async () => {
  const compiler = await compile(readFileSync(stylesPath, "utf8"), {
    base: fileURLToPath(new URL("../src/", import.meta.url)),
    onDependency: () => {},
  });

  // Unknown classes, typos, and default-theme values such as `px-4` or
  // `bg-blue-600` generate no rule because the default theme is not loaded.
  const css = compiler.build(classNames);
  const selector = (name: string) => `.${name.replace(/[^\w-]/g, "\\$&")}`;
  const missing = classNames.filter((name) => !css.includes(selector(name)));
  expect(missing).toEqual([]);
});
