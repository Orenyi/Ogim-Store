import {
  FiMail,
  FiRefreshCw,
  FiXCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import type {
  AdminStaffInvitation,
  StaffInvitationStatus,
} from "../../types/staff.types";

type Props = {
  invitations: AdminStaffInvitation[];
  loading: boolean;

  search: string;
  status: StaffInvitationStatus | "all";

  page: number;
  total: number;
  totalPages: number;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: StaffInvitationStatus | "all") => void;
  onPageChange: (page: number) => void;

  onResend: (invitation: AdminStaffInvitation) => void;
  onRevoke: (invitation: AdminStaffInvitation) => void;
};

const statusStyles: Record<StaffInvitationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  expired: "bg-[var(--color-stone)] text-[var(--color-muted)]",
  revoked: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
  failed: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function InvitationStatus({ status }: { status: StaffInvitationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
        statusStyles[status]
      }`}
    >
      {status}
    </span>
  );
}

function EmailDeliveryStatus({
  status,
}: {
  status: AdminStaffInvitation["emailStatus"];
}) {
  const styles = {
    sent: "text-[var(--color-success)]",
    failed: "text-[var(--color-error)]",
    not_sent: "text-[var(--color-muted)]",
  };

  const labels = {
    sent: "Email sent",
    failed: "Email failed",
    not_sent: "Not sent",
  };

  return (
    <span className={`text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function InvitationActions({
  invitation,
  onResend,
  onRevoke,
}: {
  invitation: AdminStaffInvitation;
  onResend: () => void;
  onRevoke: () => void;
}) {
  const canResend =
    invitation.status === "pending" ||
    invitation.status === "failed" ||
    invitation.status === "expired";

  const canRevoke = invitation.status === "pending";

  return (
    <div className="flex items-center justify-end gap-2">
      {canResend && (
        <button
          type="button"
          onClick={onResend}
          title="Resend invitation"
          aria-label={`Resend invitation to ${invitation.email}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
        >
          <FiRefreshCw size={16} />
        </button>
      )}

      {canRevoke && (
        <button
          type="button"
          onClick={onRevoke}
          title="Revoke invitation"
          aria-label={`Revoke invitation for ${invitation.email}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)]"
        >
          <FiXCircle size={16} />
        </button>
      )}

      {!canResend && !canRevoke && (
        <span className="text-xs text-[var(--color-muted)]">No actions</span>
      )}
    </div>
  );
}

function InvitationSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-16 animate-pulse rounded-xl bg-[var(--color-stone)]"
        />
      ))}
    </div>
  );
}

export default function StaffInvitations({
  invitations,
  loading,
  search,
  status,
  page,
  total,
  totalPages,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onResend,
  onRevoke,
}: Props) {
  return (
    <section className="space-y-5">
      {/* Invitation filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <FiMail
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-white)] pl-10 pr-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as StaffInvitationStatus | "all")
          }
          className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] sm:w-48"
        >
          <option value="all">All invitations</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Invitation list */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)]">
        {loading ? (
          <InvitationSkeleton />
        ) : invitations.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <FiMail size={21} />
            </span>

            <h3 className="mt-3 font-heading font-bold text-[var(--color-ink)]">
              No invitations found
            </h3>

            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Invitations will appear here when you invite staff members.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)]">
                    <th className="px-5 py-4">Invitee</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Invitation Status</th>
                    <th className="px-4 py-4">Email Delivery</th>
                    <th className="px-4 py-4">Expires</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {invitations.map((invitation) => (
                    <tr
                      key={invitation.id}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-muted)]/60"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[var(--color-ink)]">
                          {invitation.fullName}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                          {invitation.email}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--color-ink)]">
                        {invitation.role?.name || "Unassigned"}
                      </td>

                      <td className="px-4 py-4">
                        <InvitationStatus status={invitation.status} />
                      </td>

                      <td className="px-4 py-4">
                        <EmailDeliveryStatus status={invitation.emailStatus} />
                      </td>

                      <td className="px-4 py-4 text-xs text-[var(--color-muted)]">
                        {formatDate(invitation.expiresAt)}
                      </td>

                      <td className="px-4 py-4">
                        <InvitationActions
                          invitation={invitation}
                          onResend={() => onResend(invitation)}
                          onRevoke={() => onRevoke(invitation)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile invitation cards */}
            <div className="grid gap-3 p-3 md:hidden">
              {invitations.map((invitation) => (
                <article
                  key={invitation.id}
                  className="rounded-xl border border-[var(--color-border)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--color-ink)]">
                        {invitation.fullName}
                      </p>

                      <p className="mt-1 break-all text-xs text-[var(--color-muted)]">
                        {invitation.email}
                      </p>
                    </div>

                    <InvitationActions
                      invitation={invitation}
                      onResend={() => onResend(invitation)}
                      onRevoke={() => onRevoke(invitation)}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <InvitationStatus status={invitation.status} />

                    <span className="rounded-full bg-[var(--color-stone)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)]">
                      {invitation.role?.name || "Unassigned"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 border-t border-[var(--color-border)] pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[var(--color-muted)]">
                        Email delivery
                      </span>
                      <EmailDeliveryStatus status={invitation.emailStatus} />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                        <FiClock size={13} />
                        Expires
                      </span>
                      <span className="text-xs text-[var(--color-ink)]">
                        {formatDate(invitation.expiresAt)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && invitations.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-muted)]">
            Showing {invitations.length} of {total} invitations
          </p>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-stone)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft size={16} />
              Previous
            </button>

            <span className="text-xs text-[var(--color-muted)]">
              Page {page} of {Math.max(totalPages, 1)}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-stone)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
