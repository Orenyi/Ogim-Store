import { FiDownload, FiPlus, FiSearch } from "react-icons/fi";

import type {
  DeliveryPartner,
  DispatchStatus,
} from "../../types/dispatch.types";

type Props = {
  search: string;
  partner: DeliveryPartner | "all";
  status: DispatchStatus | "all";
  onSearchChange: (value: string) => void;
  onPartnerChange: (value: DeliveryPartner | "all") => void;
  onStatusChange: (value: DispatchStatus | "all") => void;
  onExport: () => void;
  onAssign: () => void;
};

const partners: DeliveryPartner[] = [
  "GIGL Logistics",
  "Sendbox",
  "Ogim Delivery",
  "DHL",
  "Other",
];

export default function DispatchToolbar({
  search,
  partner,
  status,
  onSearchChange,
  onPartnerChange,
  onStatusChange,
  onExport,
  onAssign,
}: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_170px_150px_auto_auto]">
      <label className="relative min-w-0">
        <FiSearch
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search order, customer or tracking number..."
          aria-label="Search dispatches"
          className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white pl-10 pr-3 text-xs outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      <select
        value={partner}
        onChange={(event) =>
          onPartnerChange(event.target.value as DeliveryPartner | "all")
        }
        aria-label="Filter by delivery partner"
        className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-xs outline-none focus:border-[var(--color-accent)]"
      >
        <option value="all">Delivery Partner: All</option>
        {partners.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as DispatchStatus | "all")
        }
        aria-label="Filter by dispatch status"
        className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-xs outline-none focus:border-[var(--color-accent)]"
      >
        <option value="all">Status: All</option>
        <option value="pending">Pending</option>
        <option value="dispatched">Dispatched</option>
        <option value="in_transit">In Transit</option>
        <option value="delivered">Delivered</option>
      </select>

      <button
        type="button"
        onClick={onExport}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-accent)] px-4 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
      >
        <FiDownload size={15} />
        Export
      </button>

      <button
        type="button"
        onClick={onAssign}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-xs font-bold text-white transition hover:bg-[var(--color-accent-hover)]"
      >
        <FiPlus size={16} />
        Assign Dispatch
      </button>
    </div>
  );
}
