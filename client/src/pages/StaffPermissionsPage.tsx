import { useCallback, useEffect, useState } from "react";
import {
  FiChevronRight,
  FiPlus,
  FiShield,
  FiUsers,
  FiX,
  FiMail,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import StaffStats from "../admin/components/staff/StaffStats";
import StaffToolbar from "../admin/components/staff/StaffToolbar";
import StaffTable from "../admin/components/staff/StaffTable";
import StaffModal from "../admin/components/staff/StaffModal";
import RolesOverview from "../admin/components/staff/RolesOverview";
import RoleModal from "../admin/components/staff/RoleModal";
import StaffQuickActions from "../admin/components/staff/StaffQuickActions";
import StaffInvitations from "../admin/components/staff/StaffInvitations";

import {
  createAdminRole,
  createAdminStaff,
  deleteAdminRole,
  getAdminRoles,
  getAdminStaff,
  getAdminStaffInvitations,
  resendAdminStaffInvitation,
  revokeAdminStaffInvitation,
  updateAdminRole,
  updateAdminStaff,
  updateAdminStaffStatus,
} from "../admin/services/adminStaff.service";

import type {
  AdminStaff,
  AdminStaffInvitation,
  CreateRoleInput,
  CreateStaffInput,
  StaffInvitationQuery,
  StaffQuery,
  StaffResponse,
  StaffRole,
} from "../admin/types/staff.types";

const initialQuery: StaffQuery = {
  search: "",
  roleId: "all",
  status: "all",
  page: 1,
  limit: 5,
};

const initialInvitationQuery: StaffInvitationQuery = {
  search: "",
  status: "all",
  page: 1,
  limit: 10,
};

const emptyResponse: StaffResponse = {
  staff: [],
  summary: {
    totalStaff: 0,
    totalRoles: 0,
    activeStaff: 0,
    inactiveStaff: 0,
  },
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  },
};

type ConfirmState = {
  staff: AdminStaff;
  nextStatus: AdminStaff["status"];
};

type InvitationConfirmState = {
  invitation: AdminStaffInvitation;
};

type ActiveTab = "staff" | "invitations" | "roles";

export default function StaffPermissionsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("staff");

  const [query, setQuery] = useState<StaffQuery>(initialQuery);
  const [response, setResponse] = useState<StaffResponse>(emptyResponse);
  const [roles, setRoles] = useState<StaffRole[]>([]);

  const [invitationQuery, setInvitationQuery] = useState<StaffInvitationQuery>(
    initialInvitationQuery,
  );

  const [invitations, setInvitations] = useState<AdminStaffInvitation[]>([]);

  const [invitationPagination, setInvitationPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [processingInvitationId, setProcessingInvitationId] = useState<
    string | null
  >(null);

  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminStaff | null>(null);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);

  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const [invitationConfirm, setInvitationConfirm] =
    useState<InvitationConfirmState | null>(null);

  const [roleToDelete, setRoleToDelete] = useState<StaffRole | null>(null);

  // ---------------------------------------------------------------------------
  // Load staff and roles
  // ---------------------------------------------------------------------------

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [staffResult, rolesResult] = await Promise.all([
        getAdminStaff(query),
        getAdminRoles(),
      ]);

      setResponse(staffResult);
      setRoles(rolesResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load staff and permissions.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  // ---------------------------------------------------------------------------
  // Load invitations
  // ---------------------------------------------------------------------------

  const loadInvitations = useCallback(async () => {
    setInvitationsLoading(true);

    try {
      const result = await getAdminStaffInvitations(invitationQuery);

      setInvitations(result.invitations);
      setInvitationPagination(result.pagination);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load staff invitations.",
      );
    } finally {
      setInvitationsLoading(false);
    }
  }, [invitationQuery]);

  useEffect(() => {
    if (activeTab === "invitations") {
      void loadInvitations();
    }
  }, [activeTab, loadInvitations]);

  // ---------------------------------------------------------------------------
  // Staff actions
  // ---------------------------------------------------------------------------

  async function handleSaveStaff(input: CreateStaffInput) {
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      if (editingStaff) {
        await updateAdminStaff(editingStaff.id, input);
        setFeedback("Staff role updated successfully.");
      } else {
        await createAdminStaff(input);

        setFeedback(
          `Invitation request submitted for ${input.email.trim()}. The invitation will only create an account after acceptance.`,
        );
      }

      const wasCreating = !editingStaff;

      setStaffModalOpen(false);
      setEditingStaff(null);

      await loadPageData();

      if (wasCreating) {
        setInvitationQuery(initialInvitationQuery);
        setActiveTab("invitations");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save staff details.";

      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmStatusChange() {
    if (!confirmState) return;

    setSaving(true);
    setError("");
    setFeedback("");

    try {
      await updateAdminStaffStatus(
        confirmState.staff.id,
        confirmState.nextStatus,
      );

      setFeedback(
        `${confirmState.staff.fullName} is now ${
          confirmState.nextStatus === "active" ? "active" : "inactive"
        }.`,
      );

      setConfirmState(null);
      await loadPageData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update staff status.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openAddStaff() {
    setEditingStaff(null);
    setStaffModalOpen(true);
  }

  function openEditStaff(staff: AdminStaff) {
    setEditingStaff(staff);
    setStaffModalOpen(true);
  }

  // ---------------------------------------------------------------------------
  // Invitation actions
  // ---------------------------------------------------------------------------

  async function handleResendInvitation(invitation: AdminStaffInvitation) {
    setProcessingInvitationId(invitation.id);
    setError("");
    setFeedback("");

    try {
      await resendAdminStaffInvitation(invitation.id);

      setFeedback(
        `A new invitation email has been sent to ${invitation.email}.`,
      );

      await loadInvitations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend this invitation.",
      );

      // Refresh because the backend may have recorded an email delivery failure.
      await loadInvitations();
    } finally {
      setProcessingInvitationId(null);
    }
  }

  function handleRequestRevokeInvitation(invitation: AdminStaffInvitation) {
    setInvitationConfirm({ invitation });
  }

  async function handleConfirmRevokeInvitation() {
    if (!invitationConfirm) return;

    const invitation = invitationConfirm.invitation;

    setProcessingInvitationId(invitation.id);
    setError("");
    setFeedback("");

    try {
      await revokeAdminStaffInvitation(invitation.id);

      setFeedback(`The invitation for ${invitation.email} has been revoked.`);
      setInvitationConfirm(null);

      await loadInvitations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to revoke this invitation.",
      );
    } finally {
      setProcessingInvitationId(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Role actions
  // ---------------------------------------------------------------------------

  async function handleSaveRole(input: CreateRoleInput) {
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      if (editingRole) {
        await updateAdminRole(editingRole.id, input);
        setFeedback("Role permissions updated successfully.");
      } else {
        await createAdminRole(input);
        setFeedback("New role created successfully.");
      }

      setRoleModalOpen(false);
      setEditingRole(null);

      await loadPageData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save this role.",
      );
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRole() {
    if (!roleToDelete) return;

    setSaving(true);
    setError("");
    setFeedback("");

    try {
      await deleteAdminRole(roleToDelete.id);

      setFeedback(`${roleToDelete.name} was deleted successfully.`);
      setRoleToDelete(null);

      await loadPageData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete this role.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openAddRole() {
    setEditingRole(null);
    setRoleModalOpen(true);
  }

  function openEditRole(role: StaffRole) {
    // The protected Administrator role must never be editable.
    if (role.key === "administrator") return;

    setEditingRole(role);
    setRoleModalOpen(true);
  }

  // ---------------------------------------------------------------------------
  // Shared tab button
  // ---------------------------------------------------------------------------

  function renderTab(tab: ActiveTab, label: string, count: number) {
    const isActive = activeTab === tab;

    return (
      <button
        key={tab}
        type="button"
        onClick={() => {
          setActiveTab(tab);
          setError("");
          setFeedback("");
        }}
        className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-1 pb-3 text-sm font-semibold transition ${
          isActive
            ? "text-[var(--color-accent)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        }`}
      >
        {tab === "staff" && <FiUsers size={16} />}
        {tab === "invitations" && <FiMail size={16} />}
        {tab === "roles" && <FiShield size={16} />}

        <span>
          {label} ({count})
        </span>

        {isActive && (
          <motion.span
            layoutId="staff-tab-indicator"
            className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[var(--color-accent)]"
          />
        )}
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // Page
  // ---------------------------------------------------------------------------

  return (
    <main className="w-full min-w-0 max-w-full space-y-5 overflow-x-clip pb-8">
      {/* Page heading */}
      <div className="min-w-0">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex min-w-0 flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-muted)] sm:text-sm"
        >
          <span>Dashboard</span>
          <FiChevronRight className="shrink-0" size={14} />
          <span className="text-[var(--color-ink)]">Users &amp; Roles</span>
        </nav>

        <h1 className="break-words font-heading text-2xl font-extrabold tracking-[-0.045em] text-[var(--color-ink)] sm:text-3xl">
          Staff &amp; Permissions
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
          Manage admin staff, invitations, roles and access permissions.
        </p>
      </div>

      {/* Summary */}
      <div className="w-full min-w-0 max-w-full">
        <StaffStats summary={response.summary} />
      </div>

      {/* Tabs */}
      <div className="flex w-full min-w-0 max-w-full flex-col gap-3 border-b border-[var(--color-border)] sm:flex-row sm:items-end sm:justify-between">
        <div
          role="tablist"
          aria-label="Staff management sections"
          className="flex min-w-0 max-w-full items-center gap-5 overflow-x-auto overscroll-x-contain sm:gap-8"
        >
          {renderTab("staff", "Staff", response.summary.totalStaff)}
          {renderTab("invitations", "Invitations", invitationPagination.total)}
          {renderTab("roles", "Roles & Permissions", roles.length)}
        </div>

        {activeTab === "roles" && (
          <button
            type="button"
            onClick={openAddRole}
            className="mb-2 inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] sm:w-auto"
          >
            <FiPlus size={16} />
            Add Role
          </button>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="w-full min-w-0 break-words rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)]"
        >
          {error}
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className="w-full min-w-0 break-words rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] px-4 py-3 text-sm font-medium text-[var(--color-success)]"
        >
          {feedback}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Staff tab */}
      {/* ------------------------------------------------------------------- */}

      {activeTab === "staff" && (
        <>
          <section className="w-full min-w-0 max-w-full space-y-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-card)] sm:p-4">
            <StaffToolbar
              query={query}
              roles={roles}
              onChange={setQuery}
              onAddStaff={openAddStaff}
            />

            {/* The table scrolls independently instead of stretching the page. */}
            <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-[var(--color-border)]">
              <div className="min-w-0">
                <StaffTable
                  staff={response.staff}
                  roles={roles}
                  loading={loading}
                  onEdit={openEditStaff}
                  onStatusChange={(staff) =>
                    setConfirmState({
                      staff,
                      nextStatus:
                        staff.status === "active" ? "inactive" : "active",
                    })
                  }
                />
              </div>
            </div>

            {!loading && (
              <div className="flex min-w-0 flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 text-xs text-[var(--color-muted)] sm:text-sm">
                  Showing{" "}
                  <strong className="text-[var(--color-ink)]">
                    {response.pagination.total === 0
                      ? 0
                      : (response.pagination.page - 1) *
                          response.pagination.limit +
                        1}
                    {" – "}
                    {Math.min(
                      response.pagination.page * response.pagination.limit,
                      response.pagination.total,
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-[var(--color-ink)]">
                    {response.pagination.total}
                  </strong>{" "}
                  staff
                </p>

                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <select
                    aria-label="Staff per page"
                    value={query.limit}
                    onChange={(event) =>
                      setQuery((current) => ({
                        ...current,
                        limit: Number(event.target.value),
                        page: 1,
                      }))
                    }
                    className="h-9 min-w-0 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-white)] px-2 text-xs text-[var(--color-ink)] outline-none"
                  >
                    {[5, 10, 20, 50].map((limit) => (
                      <option key={limit} value={limit}>
                        {limit} per page
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={response.pagination.page <= 1}
                    onClick={() =>
                      setQuery((current) => ({
                        ...current,
                        page: current.page - 1,
                      }))
                    }
                    className="h-9 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-ink)] disabled:opacity-40 sm:text-sm"
                  >
                    Previous
                  </button>

                  <span className="whitespace-nowrap text-xs font-semibold text-[var(--color-ink)]">
                    {response.pagination.page}/{response.pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      response.pagination.page >= response.pagination.totalPages
                    }
                    onClick={() =>
                      setQuery((current) => ({
                        ...current,
                        page: current.page + 1,
                      }))
                    }
                    className="h-9 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-ink)] disabled:opacity-40 sm:text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="grid w-full min-w-0 gap-4 xl:grid-cols-2">
            <div className="min-w-0">
              <RolesOverview roles={roles} onEditRole={openEditRole} />
            </div>

            <div className="min-w-0">
              <StaffQuickActions
                onAddStaff={openAddStaff}
                onManageRoles={() => setActiveTab("roles")}
              />
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Invitations tab */}
      {/* ------------------------------------------------------------------- */}

      {activeTab === "invitations" && (
        <section className="w-full min-w-0 max-w-full space-y-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-card)] sm:p-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
                Staff invitations
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)] sm:text-sm">
                Review invitations, check delivery status, resend or revoke
                access links.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddStaff}
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] sm:w-auto"
            >
              <FiPlus size={16} />
              Invite staff
            </button>
          </div>

          <div className="w-full min-w-0 max-w-full">
            <StaffInvitations
              invitations={invitations}
              loading={invitationsLoading}
              search={invitationQuery.search ?? ""}
              status={invitationQuery.status ?? "all"}
              page={invitationQuery.page ?? 1}
              total={invitationPagination.total}
              totalPages={invitationPagination.totalPages}
              onSearchChange={(value) =>
                setInvitationQuery((current) => ({
                  ...current,
                  search: value,
                  page: 1,
                }))
              }
              onStatusChange={(value) =>
                setInvitationQuery((current) => ({
                  ...current,
                  status: value,
                  page: 1,
                }))
              }
              onPageChange={(page) =>
                setInvitationQuery((current) => ({
                  ...current,
                  page,
                }))
              }
              onResend={handleResendInvitation}
              onRevoke={handleRequestRevokeInvitation}
            />
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Roles tab */}
      {/* ------------------------------------------------------------------- */}

      {activeTab === "roles" && (
        <section className="w-full min-w-0 max-w-full space-y-4">
          <div className="w-full min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
                  Roles &amp; Permissions
                </h2>

                <p className="mt-1 text-xs leading-5 text-[var(--color-muted)] sm:text-sm">
                  Control which areas of Ogim Store each staff role can access.
                </p>
              </div>

              <span className="w-fit shrink-0 rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)]">
                {roles.length} roles configured
              </span>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {roles.map((role) => {
              const protectedRole = role.key === "administrator";

              return (
                <article
                  key={role.id}
                  className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-heading text-base font-extrabold text-[var(--color-ink)]">
                          {role.name}
                        </h3>

                        {protectedRole && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Protected
                          </span>
                        )}
                      </div>

                      <p className="mt-1 break-words text-xs leading-5 text-[var(--color-muted)]">
                        {role.description || "No description provided."}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)]">
                      {role.staffCount} staff
                    </span>
                  </div>

                  <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                    {role.permissions.slice(0, 5).map((permission) => (
                      <span
                        key={permission}
                        className="max-w-full break-all rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-accent)]"
                      >
                        {permission.split(".").join(" · ")}
                      </span>
                    ))}

                    {role.permissions.length > 5 && (
                      <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-muted)]">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                    <span className="text-xs text-[var(--color-muted)]">
                      {role.permissions.length} permissions
                      {role.isSystem ? " · System role" : " · Custom role"}
                    </span>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={protectedRole}
                        onClick={() => openEditRole(role)}
                        className="text-xs font-bold text-[var(--color-accent)] hover:underline disabled:cursor-not-allowed disabled:text-[var(--color-muted)] disabled:no-underline"
                      >
                        Manage permissions
                      </button>

                      {!role.isSystem && !protectedRole && (
                        <button
                          type="button"
                          onClick={() => setRoleToDelete(role)}
                          className="text-xs font-bold text-[var(--color-error)] hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Staff modal */}
      {/* ------------------------------------------------------------------- */}

      <StaffModal
        open={staffModalOpen}
        roles={roles}
        staff={editingStaff}
        saving={saving}
        onClose={() => {
          setStaffModalOpen(false);
          setEditingStaff(null);
        }}
        onSubmit={handleSaveStaff}
      />

      {/* Role modal */}
      <RoleModal
        open={roleModalOpen}
        role={editingRole}
        saving={saving}
        onClose={() => {
          setRoleModalOpen(false);
          setEditingRole(null);
        }}
        onSubmit={handleSaveRole}
      />

      {/* ------------------------------------------------------------------- */}
      {/* Staff status confirmation */}
      {/* ------------------------------------------------------------------- */}

      <AnimatePresence>
        {confirmState && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                setConfirmState(null);
              }
            }}
          >
            <motion.section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="staff-status-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-md rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id="staff-status-title"
                    className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
                  >
                    {confirmState.nextStatus === "inactive"
                      ? "Deactivate staff account?"
                      : "Activate staff account?"}
                  </h2>

                  <p className="mt-2 break-words text-sm leading-6 text-[var(--color-muted)]">
                    {confirmState.nextStatus === "inactive"
                      ? `${confirmState.staff.fullName} will no longer be able to access the admin portal once this change is enforced by the backend.`
                      : `${confirmState.staff.fullName} will be marked as active.`}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setConfirmState(null)}
                  aria-label="Close confirmation"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-stone)]"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setConfirmState(null)}
                  className="h-11 rounded-xl border border-[var(--color-border-strong)] px-5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleConfirmStatusChange()}
                  className="h-11 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
                >
                  {saving
                    ? "Updating..."
                    : confirmState.nextStatus === "inactive"
                      ? "Deactivate Account"
                      : "Activate Account"}
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------- */}
      {/* Invitation revoke confirmation */}
      {/* ------------------------------------------------------------------- */}

      <AnimatePresence>
        {invitationConfirm && (
          <motion.div
            className="fixed inset-0 z-[125] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !processingInvitationId
              ) {
                setInvitationConfirm(null);
              }
            }}
          >
            <motion.section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="revoke-invitation-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-md rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
            >
              <h2
                id="revoke-invitation-title"
                className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
              >
                Revoke this invitation?
              </h2>

              <p className="mt-2 break-words text-sm leading-6 text-[var(--color-muted)]">
                The invitation link sent to{" "}
                <strong className="text-[var(--color-ink)]">
                  {invitationConfirm.invitation.email}
                </strong>{" "}
                will no longer be valid. They will not be able to use this
                invitation to create an admin account.
              </p>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={Boolean(processingInvitationId)}
                  onClick={() => setInvitationConfirm(null)}
                  className="h-11 rounded-xl border border-[var(--color-border-strong)] px-5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={Boolean(processingInvitationId)}
                  onClick={() => void handleConfirmRevokeInvitation()}
                  className="h-11 rounded-xl bg-[var(--color-error)] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {processingInvitationId ? "Revoking..." : "Revoke invitation"}
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------- */}
      {/* Role deletion confirmation */}
      {/* ------------------------------------------------------------------- */}

      <AnimatePresence>
        {roleToDelete && (
          <motion.div
            className="fixed inset-0 z-[125] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                setRoleToDelete(null);
              }
            }}
          >
            <motion.section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-role-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-md rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
            >
              <h2
                id="delete-role-title"
                className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
              >
                Delete {roleToDelete.name}?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                This role cannot be recovered after deletion. The backend will
                also prevent deletion if staff members are still assigned to it.
              </p>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setRoleToDelete(null)}
                  className="h-11 rounded-xl border border-[var(--color-border-strong)] px-5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleDeleteRole()}
                  className="h-11 rounded-xl bg-[var(--color-error)] px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Deleting..." : "Delete role"}
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
