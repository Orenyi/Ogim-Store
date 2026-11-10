import { FiSearch, FiX, FiPlus, FiRotateCcw } from "react-icons/fi";

import type { StaffQuery, StaffRole } from "../../types/staff.types";

type Props = {
  query: StaffQuery;
  roles: StaffRole[];
  onChange: (query: StaffQuery) => void;
  onAddStaff: () => void;
};

const selectClass =
  "h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] sm:w-auto";

export default function StaffToolbar({
  query,
  roles,
  onChange,
  onAddStaff,
}: Props) {
  function update<K extends keyof StaffQuery>(key: K, value: StaffQuery[K]) {
    onChange({
      ...query,
      [key]: value,
      page: 1,
    });
  }

  const hasActiveFilters =
    Boolean(query.search?.trim()) ||
    query.roleId !== "all" ||
    query.status !== "all";

  function clearFilters() {
    onChange({
      ...query,
      search: "",
      roleId: "all",
      status: "all",
      page: 1,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(180px,1fr)_minmax(130px,170px)_minmax(130px,160px)]">
          {/* Search */}
          <label className="relative min-w-0">
            <span className="sr-only">Search staff</span>

            <FiSearch
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            />

            <input
              type="search"
              value={query.search ?? ""}
              onChange={(event) => update("search", event.target.value)}
              placeholder="Search staff by name, email or role..."
              className="h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] pl-10 pr-9 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
            />

            {query.search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => update("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] transition hover:text-[var(--color-error)]"
              >
                <FiX size={15} />
              </button>
            )}
          </label>

          {/* Role filter */}
          <label className="min-w-0">
            <span className="sr-only">Filter by role</span>

            <select
              value={query.roleId ?? "all"}
              onChange={(event) => update("roleId", event.target.value)}
              className={selectClass}
            >
              <option value="all">Role: All</option>

              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          {/* Status filter */}
          <label className="min-w-0">
            <span className="sr-only">Filter by status</span>

            <select
              value={query.status ?? "all"}
              onChange={(event) =>
                update("status", event.target.value as StaffQuery["status"])
              }
              className={selectClass}
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {/* Invite staff */}
        <button
          type="button"
          onClick={onAddStaff}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
        >
          <FiPlus size={17} />
          Invite Staff
        </button>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--color-muted)]">
            Staff filters are active.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] transition hover:underline"
          >
            <FiRotateCcw size={13} />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
