// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { Switch } from "../src/react/index.ts";

afterEach(cleanup);

test("is a switch named by its label", () => {
  render(<Switch label="Show damage numbers" />);
  const toggle = screen.getByRole("switch", { name: "Show damage numbers" });
  expect(toggle.getAttribute("aria-checked")).toBe("false");
});

test("an unlabelled switch takes its name from aria-label", () => {
  render(<Switch aria-label="Mute" />);
  expect(screen.getByRole("switch", { name: "Mute" })).toBeTruthy();
});

// happy-dom runs a <label>'s activation even when the switch's click calls
// preventDefault, which real browsers do not, so a click on a labelled switch
// toggles twice here. Clicks on the switch itself are tested unlabelled; the
// labelled layout is checked in a browser through the website examples.
test("toggles by click and Space", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Switch aria-label="Subtitles" onCheckedChange={onCheckedChange} />);
  const toggle = screen.getByRole("switch");

  await user.click(toggle);
  expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  await user.keyboard(" ");
  expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  await user.keyboard(" ");
  expect(toggle.getAttribute("aria-checked")).toBe("true");
});

test("clicking the label text toggles the switch", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Switch label="Subtitles" onCheckedChange={onCheckedChange} />);
  await user.click(screen.getByText("Subtitles"));
  expect(onCheckedChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange).toHaveBeenLastCalledWith(true);
});

test("follows state the game controls", async () => {
  const user = userEvent.setup();
  function Settings() {
    const [muted, setMuted] = useState(true);
    return (
      <>
        <Switch aria-label="Mute" checked={muted} onCheckedChange={setMuted} />
        <output>{muted ? "muted" : "sound on"}</output>
      </>
    );
  }
  render(<Settings />);
  expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
  await user.click(screen.getByRole("switch"));
  expect(screen.getByText("sound on")).toBeTruthy();
  expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("false");
});

test("disabled switches cannot be toggled", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Switch label="Crossplay" disabled onCheckedChange={onCheckedChange} />);
  await user.click(screen.getByRole("switch"));
  expect(onCheckedChange).not.toHaveBeenCalled();
  expect(screen.getByRole("switch").getAttribute("aria-disabled")).toBe("true");
});

test("applies size, class names, and refs", () => {
  const ref = createRef<HTMLSpanElement>();
  const { rerender } = render(<Switch ref={ref} aria-label="Mute" size="sm" className="ml-auto" />);
  const toggle = screen.getByRole("switch");
  expect(ref.current).toBe(toggle);
  expect(toggle.dataset.size).toBe("sm");
  expect(toggle.className).toContain("w-[2.25rem]");
  expect(toggle.className.split(" ").at(-1)).toBe("ml-auto");

  // With a label, className goes on the wrapping label so it positions the whole row.
  rerender(<Switch ref={ref} label="Mute" className="ml-auto" />);
  expect(screen.getByText("Mute").parentElement?.className.split(" ").at(-1)).toBe("ml-auto");
  expect(screen.getByRole("switch").className).not.toContain("ml-auto");
});
