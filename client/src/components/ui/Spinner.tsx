import { FiLoader } from "react-icons/fi";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-9 w-9",
};

export default function Spinner({
  size = "md",
  label = "Loading",
  className = "",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
    >
      <FiLoader
        aria-hidden="true"
        className={`${sizes[size]} animate-spin text-current motion-reduce:animate-none`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
