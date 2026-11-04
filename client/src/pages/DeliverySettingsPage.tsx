import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronRight,
  FiAlertCircle,
  FiPlus,
  FiMapPin,
} from "react-icons/fi";

import DeliveryStats from "../admin/components/delivery/DeliveryStats";
import DeliveryTabs from "../admin/components/delivery/DeliveryTabs";
import DeliveryToolbar from "../admin/components/delivery/DeliveryToolbar";
import DeliveryFeesTable from "../admin/components/delivery/DeliveryFeesTable";
import DeliveryFeeModal from "../admin/components/delivery/DeliveryFeeModal";
import DeliveryPagination from "../admin/components/delivery/DeliveryPagination";
import DeliveryZones from "../admin/components/delivery/DeliveryZones";
import DeliverySettingsForm from "../admin/components/delivery/DeliverySettingsForm";

import {
  createAdminDeliveryFee,
  deleteAdminDeliveryFee,
  duplicateAdminDeliveryFee,
  getAdminDeliveryFees,
  toggleAdminDeliveryFee,
  updateAdminDeliveryFee,
} from "../admin/services/adminDelivery.service";

import {
  demoDeliveryFees,
  demoDeliverySettings,
  demoDeliveryZones,
} from "../admin/data/delivery.mock";

import type {
  DeliveryFee,
  DeliveryFeeInput,
  DeliveryFeesQuery,
  DeliverySettings,
  DeliverySummary,
  DeliveryTab,
} from "../admin/types/delivery.types";

import { getDeliveryStates } from "../admin/utils/delivery.utils";

const initialQuery: DeliveryFeesQuery = {
  search: "",
  state: "all",
  status: "all",
  page: 1,
  limit: 8,
};

const initialSummary: DeliverySummary = {
  totalLocations: 0,
  activeFees: 0,
  inactiveFees: 0,
  defaultFee: demoDeliverySettings.defaultFee,
};

export default function DeliverySettingsPage() {
  const [activeTab, setActiveTab] = useState<DeliveryTab>("fees");
  const [query, setQuery] = useState<DeliveryFeesQuery>(initialQuery);

  const [fees, setFees] = useState<DeliveryFee[]>([]);
  const [summary, setSummary] = useState<DeliverySummary>(initialSummary);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [settings, setSettings] =
    useState<DeliverySettings>(demoDeliverySettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<DeliveryFee | null>(null);
  const [deletingFee, setDeletingFee] = useState<DeliveryFee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const states = useMemo(() => getDeliveryStates(demoDeliveryFees), []);

  const loadFees = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getAdminDeliveryFees(query);

      setFees(response.fees);
      setSummary(response.summary);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load delivery locations.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadFees();
  }, [loadFees]);

  function openAddModal() {
    setEditingFee(null);
    setModalOpen(true);
  }

  function openEditModal(fee: DeliveryFee) {
    setEditingFee(fee);
    setModalOpen(true);
  }

  async function handleSaveFee(input: DeliveryFeeInput) {
    setSaving(true);
    setFeedback("");

    try {
      if (editingFee) {
        await updateAdminDeliveryFee(editingFee.id, input);
        setFeedback("Delivery fee updated successfully.");
      } else {
        await createAdminDeliveryFee(input);
        setFeedback("Delivery fee added successfully.");
      }

      setModalOpen(false);
      setEditingFee(null);

      // Return to the first page so a newly added fee is visible.
      setQuery((current) => ({ ...current, page: 1 }));

      // Refresh immediately as well.
      const response = await getAdminDeliveryFees({
        ...query,
        page: 1,
      });

      setFees(response.fees);
      setSummary(response.summary);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFee(fee: DeliveryFee) {
    setPageError("");
    setFeedback("");

    try {
      await toggleAdminDeliveryFee(fee.id);
      setFeedback(
        `${fee.location} delivery fee ${
          fee.status === "active" ? "deactivated" : "activated"
        }.`,
      );
      await loadFees();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Unable to update fee status.",
      );
    }
  }

  async function handleDuplicateFee(fee: DeliveryFee) {
    setPageError("");
    setFeedback("");

    try {
      await duplicateAdminDeliveryFee(fee.id);
      setFeedback(`${fee.location} fee duplicated.`);
      setQuery((current) => ({ ...current, page: 1 }));

      const response = await getAdminDeliveryFees({
        ...query,
        page: 1,
      });

      setFees(response.fees);
      setSummary(response.summary);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Unable to duplicate fee.",
      );
    }
  }

  async function handleDeleteFee() {
    if (!deletingFee) return;

    setDeleteLoading(true);
    setPageError("");

    try {
      await deleteAdminDeliveryFee(deletingFee.id);
      setFeedback(`${deletingFee.location} delivery fee deleted.`);
      setDeletingFee(null);
      await loadFees();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Unable to delete fee.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleExport() {
    const headers = [
      "Location",
      "State",
      "Country",
      "Delivery Fee",
      "Estimated Delivery",
      "Status",
    ];

    const rows = fees.map((fee) => [
      fee.location,
      fee.state,
      fee.country,
      fee.fee,
      fee.estimatedDelivery,
      fee.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ogim-delivery-fees.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function handleSettingsSave(nextSettings: DeliverySettings) {
    setSettings(nextSettings);
    setSummary((current) => ({
      ...current,
      defaultFee: nextSettings.defaultFee,
    }));
    setFeedback("Delivery settings updated in this session.");
  }

  return (
    <main className="min-w-0 space-y-5 pb-8">
      {/* Breadcrumb and page heading */}
      <div>
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--color-muted)] sm:text-sm"
        >
          <span>Dashboard</span>
          <FiChevronRight size={14} />
          <span className="text-[var(--color-ink)]">Delivery Settings</span>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-[-0.045em] text-[var(--color-ink)] sm:text-3xl">
              Delivery Settings
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
              Configure delivery fees by location and manage delivery options.
            </p>
          </div>

          {activeTab === "fees" && (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] sm:hidden"
            >
              <FiPlus size={17} />
              Add Delivery Fee
            </button>
          )}
        </div>
      </div>

      <DeliveryStats summary={summary} />

      {/* Main delivery settings panel */}
      <section className="overflow-visible rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-card)] sm:p-4">
        <DeliveryTabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setFeedback("");
            setPageError("");
          }}
        />

        <div className="pt-4">
          <AnimatePresence mode="wait">
            {activeTab === "fees" && (
              <motion.div
                key="fees"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <DeliveryToolbar
                  query={query}
                  states={states}
                  onQueryChange={setQuery}
                  onAdd={openAddModal}
                  onExport={handleExport}
                />

                {pageError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-3 text-sm text-[var(--color-error)]"
                  >
                    <FiAlertCircle className="mt-0.5 shrink-0" />
                    <span>{pageError}</span>
                  </div>
                )}

                {feedback && !pageError && (
                  <p
                    role="status"
                    className="rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] px-3 py-2.5 text-sm font-medium text-[var(--color-success)]"
                  >
                    {feedback}
                  </p>
                )}

                <div className="overflow-visible rounded-2xl border border-[var(--color-border)]">
                  <DeliveryFeesTable
                    fees={fees}
                    loading={loading}
                    onEdit={openEditModal}
                    onDuplicate={handleDuplicateFee}
                    onToggle={handleToggleFee}
                    onDelete={setDeletingFee}
                  />

                  {!loading && (
                    <DeliveryPagination
                      page={query.page}
                      totalPages={totalPages}
                      total={total}
                      limit={query.limit}
                      onPageChange={(page) =>
                        setQuery((current) => ({ ...current, page }))
                      }
                      onLimitChange={(limit) =>
                        setQuery((current) => ({
                          ...current,
                          limit,
                          page: 1,
                        }))
                      }
                    />
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "zones" && (
              <motion.div
                key="zones"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
                      Delivery Zones
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      View the areas covered by your delivery network.
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)]">
                    {demoDeliveryZones.length} configured zones
                  </span>
                </div>

                <DeliveryZones zones={demoDeliveryZones} />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
              >
                <div className="mb-4">
                  <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
                    Delivery configuration
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Manage the default delivery rules used by your store.
                  </p>
                </div>

                {feedback && (
                  <p
                    role="status"
                    className="mb-4 rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] px-3 py-2.5 text-sm font-medium text-[var(--color-success)]"
                  >
                    {feedback}
                  </p>
                )}

                <DeliverySettingsForm
                  settings={settings}
                  onSave={handleSettingsSave}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Add/Edit fee modal */}
      <DeliveryFeeModal
        open={modalOpen}
        fee={editingFee}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setEditingFee(null);
          }
        }}
        onSubmit={handleSaveFee}
      />

      {/* Custom delete confirmation */}
      <AnimatePresence>
        {deletingFee && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !deleteLoading) {
                setDeletingFee(null);
              }
            }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-delivery-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-md rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-error-soft)] text-[var(--color-error)]">
                <FiMapPin size={20} />
              </span>

              <h2
                id="delete-delivery-title"
                className="mt-4 font-heading text-lg font-extrabold text-[var(--color-ink)]"
              >
                Delete delivery fee?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                You're about to remove the delivery fee for{" "}
                <strong className="text-[var(--color-ink)]">
                  {deletingFee.location}, {deletingFee.state}
                </strong>
                . This action cannot be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setDeletingFee(null)}
                  className="rounded-xl border border-[var(--color-border-strong)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteFee}
                  className="rounded-xl bg-[var(--color-error)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete Fee"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
