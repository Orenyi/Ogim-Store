import type { HTMLAttributes, ReactNode } from "react";

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
};

export default function PageContainer({
  children,
  className = "",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
