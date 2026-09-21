import { Toast as BaseToast } from "@base-ui/react/toast";
import {
  toastDescription,
  toastRoot,
  toastTitle,
  toastTones,
  toastViewport,
} from "./Toast.styles.ts";
import type { ToastManager, ToastRegionProps, ToastTone } from "./Toast.types.ts";

type BaseManager = ReturnType<typeof BaseToast.createToastManager>;

/** Base UI is an implementation detail: the game only sees `ToastManager`. */
const baseManagers = new WeakMap<ToastManager, BaseManager>();

const tones = new Set<string>(["default", "primary", "success", "warning", "danger"]);
const toneOf = (type: string | undefined): ToastTone =>
  type !== undefined && tones.has(type) ? (type as ToastTone) : "default";

/** Create a handle for posting toasts. Pass it to a `ToastRegion` to display them. */
export function createToastManager(): ToastManager {
  const base = BaseToast.createToastManager();
  const manager: ToastManager = {
    show: ({ tone = "default", ...options }) => base.add({ ...options, type: tone }),
    update: (id, { tone, ...options }) =>
      base.update(id, tone === undefined ? options : { ...options, type: tone }),
    close: (id) => base.close(id),
  };
  baseManagers.set(manager, base);
  return manager;
}

/**
 * Shows the toasts posted to `manager`, newest last. Place it in a HudSlot,
 * such as `bottom-left`; toasts stack in normal flow.
 */
export function ToastRegion({
  manager,
  timeout = 4000,
  limit = 4,
  className,
  ...props
}: ToastRegionProps) {
  const base = baseManagers.get(manager);
  if (!base) throw new Error("ToastRegion needs a manager from createToastManager()");
  return (
    <BaseToast.Provider toastManager={base} timeout={timeout} limit={limit}>
      <BaseToast.Viewport
        {...props}
        className={[toastViewport, className].filter(Boolean).join(" ")}
      >
        <ToastList />
      </BaseToast.Viewport>
    </BaseToast.Provider>
  );
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  // Base UI lists newest first; a feed reads oldest to newest, like chat.
  return [...toasts].reverse().map((toast) => {
    const tone = toneOf(toast.type);
    return (
      <BaseToast.Root
        key={toast.id}
        toast={toast}
        data-tone={tone}
        className={`${toastRoot} ${toastTones[tone]}`}
      >
        <BaseToast.Title className={toastTitle}>{toast.title}</BaseToast.Title>
        {toast.description !== undefined && toast.description !== null && (
          <BaseToast.Description className={toastDescription}>
            {toast.description}
          </BaseToast.Description>
        )}
      </BaseToast.Root>
    );
  });
}
