import { Button, Modal } from "@gameui/react";
import { useState } from "react";

/** Pause menu. Whether the game is paused lives in this example, not in the framework. */
export function PauseMenu() {
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);

  function close() {
    setLeaving(false);
    setPaused(false);
  }

  return (
    <>
      <Button onClick={() => setPaused(true)}>Pause</Button>
      <Modal
        open={paused}
        onClose={close}
        title="Paused"
        description="The match continues for other players."
        size="sm"
        actions={
          <>
            <Button variant="danger" onClick={() => setLeaving(true)}>
              Leave match
            </Button>
            <Button onClick={close}>Resume</Button>
          </>
        }
      >
        {/* Nested so the confirmation stacks on the pause menu instead of replacing it. */}
        <Modal
          open={leaving}
          dismissible={false}
          title="Leave match?"
          description="You will lose rank points for this match."
          size="sm"
          actions={
            <>
              <Button variant="secondary" onClick={() => setLeaving(false)}>
                Stay
              </Button>
              <Button variant="danger" onClick={close}>
                Leave
              </Button>
            </>
          }
        />
      </Modal>
    </>
  );
}
