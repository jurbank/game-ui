// @vitest-environment happy-dom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useRef, useState } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { Button, Modal, type ModalProps } from "../src/index.ts";

afterEach(cleanup);

/** A game-owned open state with a button that opens the modal. */
function PauseMenu(props: Partial<ModalProps> & { onCloseSpy?: ModalProps["onClose"] }) {
  const { onCloseSpy, ...modalProps } = props;
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Pause</Button>
      <Modal
        title="Paused"
        {...modalProps}
        open={open}
        onClose={(reason) => {
          onCloseSpy?.(reason);
          setOpen(false);
        }}
        actions={<Button onClick={() => setOpen(false)}>Resume</Button>}
      />
    </>
  );
}

async function openWithKeyboard(user: ReturnType<typeof userEvent.setup>) {
  await user.tab();
  await user.keyboard("{Enter}");
  return screen.findByRole("dialog");
}

test("renders nothing while closed", () => {
  render(<Modal open={false} title="Paused" />);
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("the dialog is named by its title and described by its description", async () => {
  render(<Modal open title="Match found" description="Accept within 10 seconds." />);
  const dialog = await screen.findByRole("dialog", { name: "Match found" });
  const describedBy = dialog.getAttribute("aria-describedby");
  expect(describedBy && document.getElementById(describedBy)?.textContent).toBe(
    "Accept within 10 seconds.",
  );
  expect(screen.getByRole("heading", { name: "Match found" })).toBeTruthy();
});

test("opens by keyboard, moves focus inside, and restores focus on close", async () => {
  const user = userEvent.setup();
  render(<PauseMenu />);
  const dialog = await openWithKeyboard(user);

  await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Pause" })),
  );
});

test("keeps keyboard focus inside the dialog", async () => {
  const user = userEvent.setup();
  render(<PauseMenu />);
  const dialog = await openWithKeyboard(user);

  for (let i = 0; i < 4; i++) {
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  }
});

test("focuses the requested initial element", async () => {
  function Confirm() {
    const cancelRef = useRef<HTMLButtonElement>(null);
    return (
      <Modal
        open
        title="Forfeit match?"
        initialFocus={cancelRef}
        actions={
          <>
            <Button variant="danger">Forfeit</Button>
            <Button ref={cancelRef} variant="secondary">
              Cancel
            </Button>
          </>
        }
      />
    );
  }
  render(<Confirm />);
  const cancel = await screen.findByRole("button", { name: "Cancel" });
  await waitFor(() => expect(document.activeElement).toBe(cancel));
});

test("reports Escape, backdrop, and close button dismissals", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<PauseMenu onCloseSpy={onClose} />);
  const pause = screen.getByRole("button", { name: "Pause" });

  await openWithKeyboard(user);
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

  await user.click(pause);
  await user.click(await screen.findByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

  await user.click(pause);
  await screen.findByRole("dialog");
  // The viewport fills the screen around the popup, over the backdrop.
  await user.click(screen.getByRole("dialog").parentElement!);
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

  expect(onClose.mock.calls).toEqual([["escape"], ["close-button"], ["backdrop"]]);
});

test("a non-dismissible modal closes only when the game closes it", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<PauseMenu dismissible={false} onCloseSpy={onClose} />);
  await openWithKeyboard(user);

  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  await user.keyboard("{Escape}");
  await user.click(document.body);
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(onClose).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Resume" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

test("does not close when the game keeps it open", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<Modal open title="Reconnecting" onClose={onClose} />);
  await screen.findByRole("dialog");

  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledWith("escape");
  expect(screen.getByRole("dialog")).toBeTruthy();
});

test("uses a custom close label", async () => {
  render(<Modal open title="Settings" closeLabel="Fermer" />);
  expect(await screen.findByRole("button", { name: "Fermer" })).toBeTruthy();
});

test("carries the surrounding theme into the portal", async () => {
  function ThemedRegion({ open }: { open: boolean }) {
    return (
      <div data-game-theme="arcade">
        <Modal open={open} title="Victory" />
      </div>
    );
  }
  const { rerender } = render(<ThemedRegion open={false} />);
  await act(async () => rerender(<ThemedRegion open />));

  const dialog = await screen.findByRole("dialog");
  const themed = dialog.closest<HTMLElement>("[data-game-theme]");
  expect(themed?.dataset.gameTheme).toBe("arcade");
  // The dialog is portaled, not rendered inside the region.
  expect(themed?.parentElement).toBe(document.body);
});

test("applies size and consumer class names to the popup", async () => {
  render(<Modal open title="Loadout" size="lg" className="custom-modal" />);
  const dialog = await screen.findByRole("dialog");
  expect(dialog.dataset.size).toBe("lg");
  expect(dialog.className).toContain("max-w-[48rem]");
  expect(dialog.className.split(" ").at(-1)).toBe("custom-modal");
});

test("a modal nested in another stacks on it instead of replacing it", async () => {
  const user = userEvent.setup();
  function Stacked() {
    const [confirming, setConfirming] = useState(false);
    return (
      <Modal
        open
        title="Paused"
        actions={<Button onClick={() => setConfirming(true)}>Leave</Button>}
      >
        <Modal
          open={confirming}
          dismissible={false}
          title="Leave match?"
          actions={<Button onClick={() => setConfirming(false)}>Stay</Button>}
        />
      </Modal>
    );
  }
  render(<Stacked />);
  await user.click(await screen.findByRole("button", { name: "Leave" }));

  const dialogs = await waitFor(() => {
    const found = document.querySelectorAll("[role=dialog]");
    expect(found.length).toBe(2);
    return found;
  });
  expect([...dialogs].map((d) => d.querySelector("h2")?.textContent)).toEqual([
    "Paused",
    "Leave match?",
  ]);
  // The outer dialog stays mounted and marks that a nested dialog is open.
  expect(dialogs[0]?.hasAttribute("data-nested-dialog-open")).toBe(true);

  await user.click(screen.getByRole("button", { name: "Stay" }));
  await waitFor(() => expect(document.querySelectorAll("[role=dialog]").length).toBe(1));
});
