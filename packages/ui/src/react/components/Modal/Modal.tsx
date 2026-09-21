import { Dialog } from "@base-ui/react/dialog";
import { useLayoutEffect, useRef, useState } from "react";
import { readThemeScope, type ThemeScope } from "../../internal/themeScope.ts";
import {
  modalActions,
  modalBackdrop,
  modalClose,
  modalDescription,
  modalHeader,
  modalPopup,
  modalSizes,
  modalTitle,
  modalViewport,
} from "./Modal.styles.ts";
import type { ModalCloseReason, ModalProps } from "./Modal.types.ts";

const closeReasons: Partial<Record<string, ModalCloseReason>> = {
  "escape-key": "escape",
  "outside-press": "backdrop",
  "close-press": "close-button",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  dismissible = true,
  closeLabel = "Close",
  size = "md",
  initialFocus,
  finalFocus,
  className,
}: ModalProps) {
  // The dialog renders under <body>, outside any themed region. This anchor
  // stays where the modal is declared so the theme in effect there can be
  // carried into the portal.
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [scope, setScope] = useState<ThemeScope>();

  useLayoutEffect(() => {
    if (open && anchorRef.current) setScope(readThemeScope(anchorRef.current));
  }, [open]);

  return (
    <>
      <span ref={anchorRef} hidden />
      <Dialog.Root
        open={open}
        disablePointerDismissal={!dismissible}
        onOpenChange={(nextOpen, details) => {
          if (nextOpen) return;
          const reason = closeReasons[details.reason];
          if (!dismissible || !reason) {
            details.cancel();
            return;
          }
          onClose?.(reason);
        }}
      >
        <Dialog.Portal data-game-theme={scope?.theme} style={scope?.style}>
          <Dialog.Backdrop className={modalBackdrop} />
          <Dialog.Viewport className={modalViewport}>
            <Dialog.Popup
              initialFocus={initialFocus}
              finalFocus={finalFocus}
              data-size={size}
              className={[modalPopup, modalSizes[size], className].filter(Boolean).join(" ")}
            >
              <div className={modalHeader}>
                <Dialog.Title className={modalTitle}>{title}</Dialog.Title>
                {dismissible && (
                  <Dialog.Close aria-label={closeLabel} className={modalClose}>
                    <span aria-hidden="true">×</span>
                  </Dialog.Close>
                )}
              </div>
              {description !== undefined && description !== null && (
                <Dialog.Description className={modalDescription}>{description}</Dialog.Description>
              )}
              {children}
              {actions !== undefined && actions !== null && (
                <div className={modalActions}>{actions}</div>
              )}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
