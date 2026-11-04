import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiPlus, FiShield, FiUsers, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import StaffStats from "../admin/components/staff/StaffStats";
import StaffToolbar from "../admin/components/staff/StaffToolbar";
import StaffTable from "../admin/components/staff/StaffTable";
import StaffModal from "../admin/components/staff/StaffModal";
import RolesOverview from "../admin/components/staff/RolesOverview";
import RoleModal from "../admin/components/staff/RoleModal";
import StaffQuickActions from "../admin/components/staff/StaffQuickActions";

import {
  createAdminRole,
  createAdminStaff,
  getAdminRoles,
  getAdminStaff,
  updateAdminRole,
  updateAdminStaff,
  updateAdminStaffStatus,
} from "../admin/services/adminStaff.service";

import type {
  AdminStaff,
  CreateRoleInput,
  CreateStaffInput,
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

export default function StaffPermissionsPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff");
  const [query, setQuery] = useState<StaffQuery>(initialQuery);
  const [response, setResponse] = useState<StaffResponse>(emptyResponse);
  const [roles, setRoles] = useState<StaffRole[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminStaff | null>(null);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);

  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

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

  const roleMap = useMemo(
    () => new Map(roles.map((role) => [role.id, role])),
    [roles],
  );

  async function handleSaveStaff(input: CreateStaffInput) {
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      if (editingStaff) {
        await updateAdminStaff(editingStaff.id, input);
        setFeedback("Staff account updated successfully.");
      } else {
        await createAdminStaff(input);
        setFeedback("Staff account created successfully.");
      }

      setStaffModalOpen(false);
      setEditingStaff(null);
      await loadPageData();
    } finally {
      setSaving(false);
    }
  }

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

  function openAddRole() {
    setEditingRole(null);
    setRoleModalOpen(true);
  }

  function openEditRole(role: StaffRole) {
    setEditingRole(role);
    setRoleModalOpen(true);
  }

  return (
    <main className="min-w-0 space-y-5 pb-8">
      {/* Page heading */}
      <div>
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--color-muted)] sm:text-sm"
        >
          <span>Dashboard</span>
          <FiChevronRight size={14} />
          <span className="text-[var(--color-ink)]">Users &amp; Roles</span>
        </nav>

        <h1 className="font-heading text-2xl font-extrabold tracking-[-0.045em] text-[var(--color-ink)] sm:text-3xl">
          Staff &amp; Permissions
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
          Manage admin staff, roles and what they can access.
        </p>
      </div>

      {/* Summary */}
      <StaffStats summary={response.summary} />

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)]">
        <div className="flex min-w-0 items-center gap-5 sm:gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-semibold transition ${
              activeTab === "staff"
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <FiUsers size={16} />
            Staff ({response.summary.totalStaff})
            {activeTab === "staff" && (
              <motion.span
                layoutId="staff-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[var(--color-accent)]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-semibold transition ${
              activeTab === "roles"
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <FiShield size={16} />
            Roles &amp; Permissions ({roles.length})
            {activeTab === "roles" && (
              <motion.span
                layoutId="staff-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[var(--color-accent)]"
              />
            )}
          </button>
        </div>

        {activeTab === "roles" && (
          <button
            type="button"
            onClick={openAddRole}
            className="mb-2 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 text-xs font-semibold text-white hover:bg-[var(--color-accent-hover)] sm:h-10 sm:px-4 sm:text-sm"
          >
            <FiPlus size={15} />
            <span className="hidden sm:inline">Add Role</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)]"
        >
          {error}
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className="rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] px-4 py-3 text-sm font-medium text-[var(--color-success)]"
        >
          {feedback}
        </div>
      )}

      {/* Staff tab */}
      {activeTab === "staff" && (
        <>
          <section className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-card)] sm:p-4">
            <StaffToolbar
              query={query}
              roles={roles}
              onChange={setQuery}
              onAddStaff={openAddStaff}
            />

            <div className="overflow-visible rounded-xl border border-[var(--color-border)]">
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

              {!loading && (
                <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[var(--color-muted)] sm:text-sm">
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

                  <div className="flex items-center gap-2">
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
                      className="h-9 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-white)] px-2 text-xs text-[var(--color-ink)] outline-none"
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
                      className="h-9 rounded-lg border border-[var(--color-border)] px-3 text-sm disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="text-xs font-semibold text-[var(--color-ink)]">
                      {response.pagination.page}/
                      {response.pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        response.pagination.page >=
                        response.pagination.totalPages
                      }
                      onClick={() =>
                        setQuery((current) => ({
                          ...current,
                          page: current.page + 1,
                        }))
                      }
                      className="h-9 rounded-lg border border-[var(--color-border)] px-3 text-sm disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="grid min-w-0 gap-4 xl:grid-cols-2">
            <RolesOverview roles={roles} onEditRole={openEditRole} />

            <StaffQuickActions
              onAddStaff={openAddStaff}
              onManageRoles={() => setActiveTab("roles")}
            />
          </div>
        </>
      )}

      {/* Roles tab */}
      {activeTab === "roles" && (
        <section className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
                  Roles &amp; Permissions
                </h2>
                <p className="mt-1 text-xs text-[var(--color-muted)] sm:text-sm">
                  Control which areas of Ogim Store each staff role can access.
                </p>
              </div>
              <span className="mt-2 w-fit rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] sm:mt-0">
                {roles.length} roles configured
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <article
                key={role.id}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
                      {role.name}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                      {role.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)]">
                    {role.staffCount} staff
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {role.permissions.slice(0, 5).map((permission) => (
                    <span
                      key={permission}
                      className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-accent)]"
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

                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                  <span className="text-xs text-[var(--color-muted)]">
                    {role.permissions.length} permissions
                    {role.isSystem ? " · System role" : " · Custom role"}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditRole(role)}
                    className="text-xs font-bold text-[var(--color-accent)] hover:underline"
                  >
                    Manage permissions
                  </button>
                </div>
              </article>
            ))}
          </div>

          <RolesOverview roles={roles} onEditRole={openEditRole} />
        </section>
      )}

      {/* Staff modal */}
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

      {/* Custom activate/deactivate confirmation */}
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="staff-status-title"
                    className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
                  >
                    {confirmState.nextStatus === "inactive"
                      ? "Deactivate staff account?"
                      : "Activate staff account?"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
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
    </main>
  );
}
