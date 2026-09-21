import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { tabsList, tabsPanel, tabsRoot, tabsTab, tabsTabSizes } from "./Tabs.styles.ts";
import type { TabsProps } from "./Tabs.types.ts";

export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  listLabel,
  keepMounted = false,
  size = "md",
  className,
  ...props
}: TabsProps) {
  // Base UI would otherwise select index 0, which matches no string value.
  const initial =
    value === undefined ? (defaultValue ?? tabs.find((tab) => !tab.disabled)?.value) : undefined;

  return (
    <BaseTabs.Root
      {...props}
      value={value}
      defaultValue={initial}
      onValueChange={onValueChange && ((next) => onValueChange(next as string))}
      data-size={size}
      className={[tabsRoot, className].filter(Boolean).join(" ")}
    >
      <BaseTabs.List aria-label={listLabel} className={tabsList}>
        {tabs.map((tab) => (
          <BaseTabs.Tab
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={[tabsTab, tabsTabSizes[size]].join(" ")}
          >
            {tab.label}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {tabs.map((tab) => (
        <BaseTabs.Panel
          key={tab.value}
          value={tab.value}
          keepMounted={keepMounted}
          className={tabsPanel}
        >
          {tab.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
