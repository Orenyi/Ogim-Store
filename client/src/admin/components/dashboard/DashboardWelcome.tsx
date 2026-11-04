type DashboardWelcomeProps = {
  adminName?: string;
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

export default function DashboardWelcome({
  adminName = "Admin",
}: DashboardWelcomeProps) {
  return (
    <section className="flex min-w-0 flex-col gap-1">
      <h1 className="font-heading text-2xl font-extrabold tracking-[-0.05em] text-[var(--color-ink)] sm:text-3xl lg:text-[34px]">
        {getGreeting()}, {adminName} <span aria-hidden="true">👋</span>
      </h1>

      <p className="text-sm text-[var(--color-muted)] sm:text-base">
        Here's what's happening at Ogim Store today.
      </p>
    </section>
  );
}
