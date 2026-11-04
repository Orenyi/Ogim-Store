import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiTruck,
} from "react-icons/fi";

import StatCard from "./StatCard";

import type { DashboardStats as DashboardStatsType } from "../../types/dashboard.types";

type DashboardStatsProps = {
  stats: DashboardStatsType;
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-NG");

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: currencyFormatter.format(stats.totalRevenue.value),
      icon: <FiDollarSign size={25} strokeWidth={1.8} />,
      percentageChange: stats.totalRevenue.percentageChange,
      trendLabel: "vs previous period",
      trendTone:
        stats.totalRevenue.trend === "down"
          ? ("danger" as const)
          : stats.totalRevenue.trend === "neutral"
            ? ("neutral" as const)
            : ("success" as const),
    },
    {
      title: "Total Orders",
      value: numberFormatter.format(stats.totalOrders.value),
      icon: <FiShoppingCart size={25} strokeWidth={1.8} />,
      percentageChange: stats.totalOrders.percentageChange,
      trendLabel: "vs previous period",
      trendTone:
        stats.totalOrders.trend === "neutral"
          ? ("neutral" as const)
          : ("success" as const),
    },
    {
      title: "In Stock",
      value: numberFormatter.format(stats.inStock.value),
      icon: <FiPackage size={25} strokeWidth={1.8} />,
      percentageChange: stats.inStock.percentageChange,
      trendLabel: "vs previous period",
      trendTone:
        stats.inStock.trend === "down"
          ? ("danger" as const)
          : stats.inStock.trend === "neutral"
            ? ("neutral" as const)
            : ("success" as const),
    },
    {
      title: "Pending Dispatch",
      value: numberFormatter.format(stats.pendingDispatch.value),
      icon: <FiTruck size={25} strokeWidth={1.8} />,
      percentageChange: stats.pendingDispatch.percentageChange,
      trendLabel: "vs previous period",
      trendTone:
        stats.pendingDispatch.trend === "up"
          ? ("warning" as const)
          : stats.pendingDispatch.trend === "down"
            ? ("success" as const)
            : ("neutral" as const),
    },
  ];

  return (
    <section aria-label="Store statistics">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-4">
        {cards.map((card, index) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            percentageChange={card.percentageChange}
            trendLabel={card.trendLabel}
            trendTone={card.trendTone}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
