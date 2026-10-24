export default function SearchLoadingState() {
  return (
    <section
      aria-label="Searching for products"
      aria-busy="true"
      className="mt-6"
    >
      <p className="mb-4 text-sm text-muted">Searching for products…</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-card border border-stone bg-white p-3"
          >
            <div className="aspect-square rounded-lg bg-stone/70" />
            <div className="mt-4 h-3 w-4/5 rounded bg-stone" />
            <div className="mt-2 h-3 w-3/5 rounded bg-stone/80" />
            <div className="mt-4 h-4 w-2/5 rounded bg-stone" />
            <div className="mt-4 h-9 rounded-control bg-stone/70" />
          </div>
        ))}
      </div>
    </section>
  );
}
