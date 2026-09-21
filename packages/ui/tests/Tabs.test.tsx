// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { Tabs, type TabItem } from "../src/react/index.ts";

afterEach(cleanup);

const sections: TabItem[] = [
  { value: "audio", label: "Audio", content: <p>Audio settings</p> },
  { value: "video", label: "Video", content: <p>Video settings</p> },
  { value: "controls", label: "Controls", content: <p>Control settings</p> },
];

test("shows the first tab's panel by default, named by its tab", () => {
  render(<Tabs tabs={sections} listLabel="Settings sections" />);
  expect(screen.getByRole("tablist", { name: "Settings sections" })).toBeTruthy();
  expect(screen.getByRole("tab", { name: "Audio" }).getAttribute("aria-selected")).toBe("true");
  expect(screen.getByRole("tabpanel", { name: "Audio" }).textContent).toBe("Audio settings");
  expect(screen.queryByText("Video settings")).toBeNull();
});

test("switches panels by click and by arrow keys", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Tabs tabs={sections} onValueChange={onValueChange} />);

  await user.click(screen.getByRole("tab", { name: "Video" }));
  expect(onValueChange).toHaveBeenLastCalledWith("video");
  expect(screen.getByText("Video settings")).toBeTruthy();

  await user.keyboard("{ArrowRight}{Enter}");
  expect(onValueChange).toHaveBeenLastCalledWith("controls");
  expect(screen.getByText("Control settings")).toBeTruthy();
});

test("starts on defaultValue", () => {
  render(<Tabs tabs={sections} defaultValue="controls" />);
  expect(screen.getByText("Control settings")).toBeTruthy();
});

test("skips a disabled first tab when choosing the default", () => {
  render(
    <Tabs
      tabs={[{ value: "online", label: "Online", content: "Online", disabled: true }, ...sections]}
    />,
  );
  expect(screen.getByRole("tab", { name: "Audio" }).getAttribute("aria-selected")).toBe("true");
});

test("disabled tabs cannot be selected", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const tabs = sections.map((tab) => (tab.value === "video" ? { ...tab, disabled: true } : tab));
  render(<Tabs tabs={tabs} onValueChange={onValueChange} />);
  await user.click(screen.getByRole("tab", { name: "Video" }));
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByText("Audio settings")).toBeTruthy();
});

test("follows a tab the game controls", async () => {
  const user = userEvent.setup();
  function Settings() {
    const [tab, setTab] = useState("video");
    return <Tabs tabs={sections} value={tab} onValueChange={setTab} />;
  }
  render(<Settings />);
  expect(screen.getByText("Video settings")).toBeTruthy();
  await user.click(screen.getByRole("tab", { name: "Audio" }));
  expect(screen.getByText("Audio settings")).toBeTruthy();
});

test("keepMounted keeps inactive panels in the DOM, hidden", () => {
  render(<Tabs tabs={sections} keepMounted />);
  const hidden = screen.getByText("Video settings").closest("[role=tabpanel]");
  expect(hidden?.hasAttribute("hidden")).toBe(true);
});

test("applies size, class names, and refs", () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(<Tabs ref={ref} tabs={sections} size="sm" className="mt-4" />);
  const root = container.firstElementChild as HTMLElement;
  expect(ref.current).toBe(root);
  expect(root.dataset.size).toBe("sm");
  expect(root.className.split(" ").at(-1)).toBe("mt-4");
  expect(screen.getByRole("tab", { name: "Audio" }).className).toContain("px-game-sm");
});
