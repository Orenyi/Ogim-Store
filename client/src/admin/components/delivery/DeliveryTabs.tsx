import { motion } from "framer-motion";
import { FiMapPin, FiMap, FiSettings } from "react-icons/fi";
import type { DeliveryTab } from "../../types/delivery.types";

type Props = {
  activeTab: DeliveryTab;
  onChange: (tab: DeliveryTab) => void;
};

const tabs: {
  id: DeliveryTab;
  label: string;
  icon: typeof FiMapPin;
}[] = [
  { id: "fees", label: "Delivery Fees", icon: FiMapPin },
  { id: "zones", label: "Delivery Zones", icon: FiMap },
  { id: "settings", label: "Settings", icon: FiSettings },
];

export default function DeliveryTabs({ activeTab, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-[var(--color-border)] px-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex shrink-0 items-center gap-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-5 ${
              active
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={16} />
            {tab.label}

            {active && (
              <motion.span
                layoutId="delivery-tab-indicator"
                className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-[var(--color-accent)]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
