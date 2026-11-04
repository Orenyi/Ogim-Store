import { FiBox, FiLayers, FiAlertTriangle, FiPackage } from "react-icons/fi";

import InventoryStatCard from "./InventoryStatCard";
import type { InventorySummary } from "../../types/inventory.types";

type Props = {
  summary: InventorySummary;
};

export default function InventoryStats({ summary }: Props) {
  const cards = [
    {
      title: "Total Products",
      value: summary.totalProducts,
      icon: FiBox,
      tone: "accent" as const,
      helper: "Across all categories",
    },
    {
      title: "In Stock",
      value: summary.inStock,
      icon: FiLayers,
      tone: "success" as const,
      helper: "Available for purchase",
    },
    {
      title: "Low Stock",
      value: summary.lowStock,
      icon: FiAlertTriangle,
      tone: "warning" as const,
      helper: "Restock recommended",
    },
    {
      title: "Out of Stock",
      value: summary.outOfStock,
      icon: FiPackage,
      tone: "error" as const,
      helper: "Currently unavailable",
    },
  ];

  return (
    <section
      aria-label="Inventory summary"
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <InventoryStatCard key={card.title} {...card} />
      ))}
    </section>
  );
}
