import { FiBox, FiTruck, FiMapPin, FiCheckCircle } from "react-icons/fi";

import type { DispatchSummary } from "../../types/dispatch.types";
import DispatchStatCard from "./DispatchStatCard";

export default function DispatchStats({
  summary,
}: {
  summary: DispatchSummary;
}) {
  const cards = [
    {
      title: "Pending Dispatch",
      value: summary.pending,
      icon: FiBox,
      tone: "accent" as const,
      helper: "Awaiting assignment",
    },
    {
      title: "Dispatched",
      value: summary.dispatched,
      icon: FiTruck,
      tone: "accent" as const,
      helper: "Handed to partner",
    },
    {
      title: "In Transit",
      value: summary.inTransit,
      icon: FiMapPin,
      tone: "warning" as const,
      helper: "On the way",
    },
    {
      title: "Delivered",
      value: summary.delivered,
      icon: FiCheckCircle,
      tone: "success" as const,
      helper: "Successfully delivered",
    },
  ];

  return (
    <section
      aria-label="Dispatch summary"
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <DispatchStatCard key={card.title} {...card} />
      ))}
    </section>
  );
}
