import type { ProductCondition } from "../../types/product";

interface ConditionBadgeProps {
  condition: ProductCondition;
  className?: string;
}

const conditionStyles: Record<
  ProductCondition,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-[#FDE8DF] text-[#B94317]",
  },
  "uk-used": {
    label: "UK-Used",
    className: "bg-[#FDE8DF] text-[#B94317]",
  },
  refurbished: {
    label: "Refurbished",
    className: "bg-[#E8F1E9] text-[#245D42]",
  },
};

export default function ConditionBadge({
  condition,
  className = "",
}: ConditionBadgeProps) {
  const style = conditionStyles[condition];

  return (
    <span
      className={`inline-flex w-fit items-center rounded-md px-2 py-1 text-[10px] font-semibold leading-none sm:text-[11px] ${style.className} ${className}`}
    >
      {style.label}
    </span>
  );
}
