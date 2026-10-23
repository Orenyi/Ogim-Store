import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
};

export default function Skeleton({
  variant = "text",
  width,
  height,
  lines = 1,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const shapeStyles = {
    text: "h-3 rounded-md",
    circular: "aspect-square rounded-full",
    rectangular: "rounded-[var(--radius-control)]",
  };

  const resolvedWidth = width ?? (variant === "text" ? "100%" : undefined);

  const resolvedHeight =
    height ??
    (variant === "text"
      ? "12px"
      : variant === "circular"
        ? undefined
        : "120px");

  const lineCount = Math.max(1, Math.floor(lines));

  return (
    <div className={className} aria-hidden="true" {...props}>
      {Array.from({ length: lineCount }, (_, index) => (
        <div
          key={index}
          className={[
            "animate-pulse bg-[var(--color-stone)]",
            "motion-reduce:animate-none",
            shapeStyles[variant],
            index === lineCount - 1 && lineCount > 1 ? "w-3/5" : "",
          ].join(" ")}
          style={{
            width: resolvedWidth,
            height: resolvedHeight,
            ...style,
          }}
        />
      ))}
    </div>
  );
}
