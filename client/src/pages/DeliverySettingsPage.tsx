import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronRight,
  FiAlertCircle,
  FiPlus,
  FiMapPin,
  FiX,
  FiSearch,
  FiMap,
  FiSave,
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
  getAdminDeliverySettings,
  updateAdminDeliverySettings,
  getAdminDeliveryZones,
  createAdminDeliveryZone,
  updateAdminDeliveryZone,
  toggleAdminDeliveryZone,
  deleteAdminDeliveryZone,
} from "../admin/services/adminDelivery.service";

import type {
  DeliveryFee,
  DeliveryFeeInput,
  DeliveryFeesQuery,
  DeliverySettings,
  DeliverySummary,
  DeliveryTab,
  DeliveryZone,
} from "../admin/types/delivery.types";

import type {
  DeliveryZoneInput,
  DeliveryZonesQuery,
} from "../admin/services/adminDelivery.service";

// ============================================
// INITIAL VALUES
// ============================================

const initialQuery: DeliveryFeesQuery = {
  search: "",
  state: "all",
  status: "all",
  page: 1,
  limit: 8,
};

const initialZoneQuery: DeliveryZonesQuery = {
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
  defaultFee: 0,
};

const initialZoneForm: DeliveryZoneInput = {
  name: "",
  state: "",
  locations: [],
  estimatedDelivery: "",
  status: "active",
};

const zoneInputClass =
  "mt-2 h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 disabled:cursor-not-allowed disabled:opacity-60";

// ============================================
// PAGE
// ============================================

export default function DeliverySettingsPage() {
  const [activeTab, setActiveTab] = useState<DeliveryTab>("fees");

  // ============================================
  // DELIVERY FEES STATE
  // ============================================

  const [query, setQuery] = useState<DeliveryFeesQuery>(initialQuery);

  const [fees, setFees] = useState<DeliveryFee[]>([]);
  const [summary, setSummary] = useState<DeliverySummary>(initialSummary);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<DeliveryFee | null>(null);
  const [deletingFee, setDeletingFee] = useState<DeliveryFee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ============================================
  // DELIVERY ZONES STATE
  // ============================================

  const [zoneQuery, setZoneQuery] =
    useState<DeliveryZonesQuery>(initialZoneQuery);

  const [zones, setZones] = useState<DeliveryZone[]>([]);

  const [zoneSummary, setZoneSummary] = useState({
    totalZones: 0,
    activeZones: 0,
    inactiveZones: 0,
    totalLocations: 0,
  });

  const [zoneTotal, setZoneTotal] = useState(0);
  const [zoneTotalPages, setZoneTotalPages] = useState(1);

  const [zonesLoading, setZonesLoading] = useState(false);
  const [zoneSaving, setZoneSaving] = useState(false);
  const [zoneDeleteLoading, setZoneDeleteLoading] = useState(false);

  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [deletingZone, setDeletingZone] = useState<DeliveryZone | null>(null);

  const [zoneForm, setZoneForm] = useState<DeliveryZoneInput>(initialZoneForm);

  const [locationsText, setLocationsText] = useState("");

  const [zoneError, setZoneError] = useState("");

  // ============================================
  // DELIVERY SETTINGS STATE
  // ============================================

  const [settings, setSettings] = useState<DeliverySettings | null>(null);

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [settingsError, setSettingsError] = useState("");

  // ============================================
  // SHARED FEEDBACK
  // ============================================

  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState("");

  // ============================================
  // DERIVED FILTER OPTIONS
  // ============================================

  const states = useMemo(
    () =>
      Array.from(
        new Set(fees.map((fee) => fee.state.trim()).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [fees],
  );

  const zoneStates = useMemo(
    () =>
      Array.from(
        new Set(zones.map((zone) => zone.state.trim()).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [zones],
  );

  // ============================================
  // DELIVERY FEES
  // ============================================

  const loadFees = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getAdminDeliveryFees(query);

      setFees(response.fees);

      setSummary((current) => ({
        ...response.summary,
        defaultFee: settings?.defaultFee ?? current.defaultFee,
      }));

      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);

      if (response.pagination.page !== query.page) {
        setQuery((current) => ({
          ...current,
          page: response.pagination.page,
        }));
      }
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load delivery locations.",
      );
    } finally {
      setLoading(false);
    }
  }, [query, settings?.defaultFee]);

  useEffect(() => {
    void loadFees();
  }, [loadFees]);

  function openAddFeeModal() {
    setEditingFee(null);
    setModalOpen(true);
    setPageError("");
    setFeedback("");
  }

  function openEditFeeModal(fee: DeliveryFee) {
    setEditingFee(fee);
    setModalOpen(true);
    setPageError("");
    setFeedback("");
  }

  async function handleSaveFee(input: DeliveryFeeInput) {
    setSaving(true);
    setPageError("");
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

      setQuery((current) => ({
        ...current,
        page: 1,
      }));
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to save the delivery fee.",
      );
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

      setQuery((current) => ({
        ...current,
        page: 1,
      }));
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to duplicate delivery fee.",
      );
    }
  }

  async function handleDeleteFee() {
    if (!deletingFee || deleteLoading) return;

    setDeleteLoading(true);
    setPageError("");
    setFeedback("");

    try {
      await deleteAdminDeliveryFee(deletingFee.id);

      setFeedback(`${deletingFee.location} delivery fee deleted successfully.`);

      setDeletingFee(null);

      const nextPage =
        fees.length === 1 && query.page > 1 ? query.page - 1 : query.page;

      setQuery((current) => ({
        ...current,
        page: nextPage,
      }));
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to delete delivery fee.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleExport() {
    if (fees.length === 0) {
      setFeedback("There are no delivery fees to export on this page.");
      return;
    }

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

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // ============================================
  // DELIVERY ZONES
  // ============================================

  const loadZones = useCallback(async () => {
    setZonesLoading(true);
    setZoneError("");

    try {
      const response = await getAdminDeliveryZones(zoneQuery);

      setZones(response.zones);
      setZoneSummary(response.summary);
      setZoneTotal(response.pagination.total);
      setZoneTotalPages(response.pagination.totalPages);

      if (response.pagination.page !== zoneQuery.page) {
        setZoneQuery((current) => ({
          ...current,
          page: response.pagination.page,
        }));
      }
    } catch (error) {
      setZoneError(
        error instanceof Error
          ? error.message
          : "Unable to load delivery zones.",
      );
    } finally {
      setZonesLoading(false);
    }
  }, [zoneQuery]);

  useEffect(() => {
    if (activeTab === "zones") {
      void loadZones();
    }
  }, [activeTab, loadZones]);

  function openAddZoneModal() {
    setEditingZone(null);
    setZoneForm(initialZoneForm);
    setLocationsText("");
    setZoneError("");
    setZoneModalOpen(true);
    setFeedback("");
  }

  function openEditZoneModal(zone: DeliveryZone) {
    setEditingZone(zone);

    setZoneForm({
      name: zone.name,
      state: zone.state,
      locations: zone.locations,
      estimatedDelivery: zone.estimatedDelivery,
      status: zone.status,
    });

    setLocationsText(zone.locations.join("\n"));
    setZoneError("");
    setZoneModalOpen(true);
    setFeedback("");
  }

  function closeZoneModal() {
    if (zoneSaving) return;

    setZoneModalOpen(false);
    setEditingZone(null);
    setZoneForm(initialZoneForm);
    setLocationsText("");
    setZoneError("");
  }

  function updateZoneForm<K extends keyof DeliveryZoneInput>(
    key: K,
    value: DeliveryZoneInput[K],
  ) {
    setZoneForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSaveZone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (zoneSaving) return;

    const locations = locationsText
      .split(/[\n,]+/)
      .map((location) => location.trim())
      .filter(Boolean);

    const uniqueLocations = Array.from(
      new Map(
        locations.map((location) => [location.toLowerCase(), location]),
      ).values(),
    );

    if (!zoneForm.name.trim()) {
      setZoneError("Enter a delivery zone name.");
      return;
    }

    if (!zoneForm.state.trim()) {
      setZoneError("Enter the state for this delivery zone.");
      return;
    }

    if (uniqueLocations.length === 0) {
      setZoneError("Add at least one delivery location.");
      return;
    }

    if (!zoneForm.estimatedDelivery.trim()) {
      setZoneError("Enter an estimated delivery time.");
      return;
    }

    const input: DeliveryZoneInput = {
      ...zoneForm,
      name: zoneForm.name.trim(),
      state: zoneForm.state.trim(),
      locations: uniqueLocations,
      estimatedDelivery: zoneForm.estimatedDelivery.trim(),
    };

    setZoneSaving(true);
    setZoneError("");
    setFeedback("");

    try {
      if (editingZone) {
        await updateAdminDeliveryZone(editingZone.id, input);
        setFeedback("Delivery zone updated successfully.");
      } else {
        await createAdminDeliveryZone(input);
        setFeedback("Delivery zone created successfully.");
      }

      setZoneModalOpen(false);
      setEditingZone(null);
      setZoneForm(initialZoneForm);
      setLocationsText("");

      setZoneQuery((current) => ({
        ...current,
        page: 1,
      }));
    } catch (error) {
      setZoneError(
        error instanceof Error
          ? error.message
          : "Unable to save the delivery zone.",
      );
    } finally {
      setZoneSaving(false);
    }
  }

  async function handleToggleZone(zone: DeliveryZone) {
    setZoneError("");
    setFeedback("");

    try {
      await toggleAdminDeliveryZone(zone.id);

      setFeedback(
        `${zone.name} ${
          zone.status === "active" ? "deactivated" : "activated"
        } successfully.`,
      );

      await loadZones();
    } catch (error) {
      setZoneError(
        error instanceof Error
          ? error.message
          : "Unable to update delivery zone status.",
      );
    }
  }

  async function handleDeleteZone() {
    if (!deletingZone || zoneDeleteLoading) return;

    setZoneDeleteLoading(true);
    setZoneError("");
    setFeedback("");

    try {
      await deleteAdminDeliveryZone(deletingZone.id);

      setFeedback(`${deletingZone.name} delivery zone deleted successfully.`);

      setDeletingZone(null);

      const nextPage =
        zones.length === 1 && zoneQuery.page > 1
          ? zoneQuery.page - 1
          : zoneQuery.page;

      setZoneQuery((current) => ({
        ...current,
        page: nextPage,
      }));
    } catch (error) {
      setZoneError(
        error instanceof Error
          ? error.message
          : "Unable to delete delivery zone.",
      );
    } finally {
      setZoneDeleteLoading(false);
    }
  }

  // ============================================
  // DELIVERY SETTINGS
  // ============================================

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError("");

    try {
      const response = await getAdminDeliverySettings();

      setSettings(response);

      setSummary((current) => ({
        ...current,
        defaultFee: response.defaultFee,
      }));
    } catch (error) {
      setSettingsError(
        error instanceof Error
          ? error.message
          : "Unable to load delivery settings.",
      );
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "settings" && settings === null) {
      void loadSettings();
    }
  }, [activeTab, settings, loadSettings]);

  async function handleSettingsSave(nextSettings: DeliverySettings) {
    if (settingsSaving) return;

    setSettingsSaving(true);
    setSettingsError("");
    setFeedback("");

    try {
      const updatedSettings = await updateAdminDeliverySettings(nextSettings);

      setSettings(updatedSettings);

      setSummary((current) => ({
        ...current,
        defaultFee: updatedSettings.defaultFee,
      }));

      setFeedback("Delivery settings saved successfully.");
    } catch (error) {
      setSettingsError(
        error instanceof Error
          ? error.message
          : "Unable to save delivery settings.",
      );
    } finally {
      setSettingsSaving(false);
    }
  }

  // ============================================
  // RENDER
  // ============================================

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
              onClick={openAddFeeModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] sm:hidden"
            >
              <FiPlus size={17} />
              Add Delivery Fee
            </button>
          )}

          {activeTab === "zones" && (
            <button
              type="button"
              onClick={openAddZoneModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              <FiPlus size={17} />
              Add Delivery Zone
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
            setZoneError("");
            setSettingsError("");
          }}
        />

        <div className="pt-4">
          <AnimatePresence mode="wait">
            {/* ================================== */}
            {/* DELIVERY FEES TAB */}
            {/* ================================== */}

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
                  onQueryChange={(nextQuery) => {
                    setFeedback("");
                    setPageError("");

                    setQuery((current) => ({
                      ...current,
                      ...nextQuery,
                    }));
                  }}
                  onAdd={openAddFeeModal}
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

                {feedback && activeTab === "fees" && !pageError && (
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
                    onEdit={openEditFeeModal}
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
                        setQuery((current) => ({
                          ...current,
                          page,
                        }))
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

            {/* ================================== */}
            {/* DELIVERY ZONES TAB */}
            {/* ================================== */}

            {activeTab === "zones" && (
              <motion.div
                key="zones"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
                      Delivery Zones
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      Manage the areas covered by your delivery network.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)]">
                    {zoneSummary.totalZones} configured zones
                  </span>
                </div>

                {/* Zone search and filters */}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="relative sm:col-span-2 lg:col-span-2">
                    <span className="sr-only">Search delivery zones</span>
                    <FiSearch
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                    />
                    <input
                      value={zoneQuery.search}
                      onChange={(event) =>
                        setZoneQuery((current) => ({
                          ...current,
                          search: event.target.value,
                          page: 1,
                        }))
                      }
                      placeholder="Search zone, state or location..."
                      className="h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] pl-10 pr-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
                    />
                  </label>

                  <label>
                    <span className="sr-only">Filter by state</span>
                    <select
                      value={zoneQuery.state}
                      onChange={(event) =>
                        setZoneQuery((current) => ({
                          ...current,
                          state: event.target.value,
                          page: 1,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="all">All states</option>
                      {zoneStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="sr-only">Filter by status</span>
                    <select
                      value={zoneQuery.status}
                      onChange={(event) =>
                        setZoneQuery((current) => ({
                          ...current,
                          status: event.target
                            .value as DeliveryZonesQuery["status"],
                          page: 1,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>

                {/* Zone summary */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "Total zones",
                      value: zoneSummary.totalZones,
                    },
                    {
                      label: "Active zones",
                      value: zoneSummary.activeZones,
                    },
                    {
                      label: "Inactive zones",
                      value: zoneSummary.inactiveZones,
                    },
                    {
                      label: "Covered locations",
                      value: zoneSummary.totalLocations,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
                    >
                      <p className="text-xs text-[var(--color-muted)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-[var(--color-ink)]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {zoneError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-3 text-sm text-[var(--color-error)]"
                  >
                    <FiAlertCircle className="mt-0.5 shrink-0" />
                    <span>{zoneError}</span>
                  </div>
                )}

                {feedback && activeTab === "zones" && !zoneError && (
                  <p
                    role="status"
                    className="rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] px-3 py-2.5 text-sm font-medium text-[var(--color-success)]"
                  >
                    {feedback}
                  </p>
                )}

                <DeliveryZones
                  zones={zones}
                  loading={zonesLoading}
                  onEdit={openEditZoneModal}
                  onToggle={handleToggleZone}
                  onDelete={setDeletingZone}
                />

                {!zonesLoading && (
                  <DeliveryPagination
                    page={zoneQuery.page}
                    totalPages={zoneTotalPages}
                    total={zoneTotal}
                    limit={zoneQuery.limit}
                    onPageChange={(page) =>
                      setZoneQuery((current) => ({
                        ...current,
                        page,
                      }))
                    }
                    onLimitChange={(limit) =>
                      setZoneQuery((current) => ({
                        ...current,
                        limit,
                        page: 1,
                      }))
                    }
                  />
                )}
              </motion.div>
            )}

            {/* ================================== */}
            {/* DELIVERY SETTINGS TAB */}
            {/* ================================== */}

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

                {settingsError && (
                  <div
                    role="alert"
                    className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-3 text-sm text-[var(--color-error)]"
                  >
                    <FiAlertCircle className="mt-0.5 shrink-0" />
                    <span>{settingsError}</span>
                  </div>
                )}

                {feedback && activeTab === "settings" && !settingsError && (
                  <p
                    role="status"
                    className="mb-4 rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] px-3 py-2.5 text-sm font-medium text-[var(--color-success)]"
                  >
                    {feedback}
                  </p>
                )}

                {settingsLoading && (
                  <div className="space-y-3 rounded-xl border border-[var(--color-border)] p-5">
                    <div className="h-5 w-40 animate-pulse rounded bg-[var(--color-stone)]" />
                    <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--color-stone)]" />
                    <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--color-stone)]" />
                    <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--color-stone)]" />
                  </div>
                )}

                {!settingsLoading && settings && (
                  <DeliverySettingsForm
                    settings={settings}
                    onSave={handleSettingsSave}
                    saving={settingsSaving}
                  />
                )}

                {!settingsLoading && !settings && settingsError && (
                  <div className="rounded-xl border border-[var(--color-border)] p-5">
                    <p className="text-sm text-[var(--color-muted)]">
                      Your delivery settings could not be loaded.
                    </p>

                    <button
                      type="button"
                      onClick={loadSettings}
                      className="mt-3 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================ */}
      {/* ADD / EDIT DELIVERY FEE MODAL */}
      {/* ============================================ */}

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

      {/* ============================================ */}
      {/* ADD / EDIT DELIVERY ZONE MODAL */}
      {/* ============================================ */}

      <AnimatePresence>
        {zoneModalOpen && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !zoneSaving) {
                closeZoneModal();
              }
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delivery-zone-modal-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                    <FiMapPin size={21} />
                  </span>

                  <h2
                    id="delivery-zone-modal-title"
                    className="mt-4 font-heading text-xl font-extrabold text-[var(--color-ink)]"
                  >
                    {editingZone ? "Edit delivery zone" : "Add delivery zone"}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Configure the state and locations covered by this zone.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={zoneSaving}
                  onClick={closeZoneModal}
                  aria-label="Close modal"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-stone)] disabled:opacity-50"
                >
                  <FiX size={19} />
                </button>
              </div>

              <form onSubmit={handleSaveZone} className="mt-6 space-y-4">
                {zoneError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-3 text-sm text-[var(--color-error)]"
                  >
                    <FiAlertCircle className="mt-0.5 shrink-0" />
                    <span>{zoneError}</span>
                  </div>
                )}

                <label className="block text-sm font-semibold text-[var(--color-ink)]">
                  Zone name
                  <input
                    required
                    maxLength={100}
                    value={zoneForm.name}
                    onChange={(event) =>
                      updateZoneForm("name", event.target.value)
                    }
                    placeholder="e.g. Abuja Central"
                    disabled={zoneSaving}
                    className={zoneInputClass}
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--color-ink)]">
                  State
                  <input
                    required
                    maxLength={100}
                    value={zoneForm.state}
                    onChange={(event) =>
                      updateZoneForm("state", event.target.value)
                    }
                    placeholder="e.g. FCT"
                    disabled={zoneSaving}
                    className={zoneInputClass}
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--color-ink)]">
                  Covered locations
                  <textarea
                    required
                    rows={5}
                    value={locationsText}
                    onChange={(event) => setLocationsText(event.target.value)}
                    placeholder={
                      "Enter one location per line:\nGarki\nWuse\nMaitama\nAsokoro"
                    }
                    disabled={zoneSaving}
                    className="mt-2 w-full resize-y rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
                    Enter each location on a new line or separate locations with
                    commas.
                  </span>
                </label>

                <label className="block text-sm font-semibold text-[var(--color-ink)]">
                  Estimated delivery
                  <input
                    required
                    maxLength={100}
                    value={zoneForm.estimatedDelivery}
                    onChange={(event) =>
                      updateZoneForm("estimatedDelivery", event.target.value)
                    }
                    placeholder="e.g. 1–2 days"
                    disabled={zoneSaving}
                    className={zoneInputClass}
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--color-ink)]">
                  Status
                  <select
                    value={zoneForm.status}
                    onChange={(event) =>
                      updateZoneForm(
                        "status",
                        event.target.value as "active" | "inactive",
                      )
                    }
                    disabled={zoneSaving}
                    className={zoneInputClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>

                <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={zoneSaving}
                    onClick={closeZoneModal}
                    className="h-11 rounded-xl border border-[var(--color-border-strong)] px-5 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-stone)] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={zoneSaving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiSave size={16} />
                    {zoneSaving
                      ? "Saving..."
                      : editingZone
                        ? "Save Changes"
                        : "Create Zone"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* DELETE DELIVERY FEE CONFIRMATION */}
      {/* ============================================ */}

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

      {/* ============================================ */}
      {/* DELETE DELIVERY ZONE CONFIRMATION */}
      {/* ============================================ */}

      <AnimatePresence>
        {deletingZone && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !zoneDeleteLoading) {
                setDeletingZone(null);
              }
            }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-zone-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-md rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-error-soft)] text-[var(--color-error)]">
                <FiMap size={20} />
              </span>

              <h2
                id="delete-zone-title"
                className="mt-4 font-heading text-lg font-extrabold text-[var(--color-ink)]"
              >
                Delete delivery zone?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                You're about to delete{" "}
                <strong className="text-[var(--color-ink)]">
                  {deletingZone.name}, {deletingZone.state}
                </strong>
                . Its {deletingZone.locations.length} covered location(s) will
                be removed from this zone. This action cannot be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={zoneDeleteLoading}
                  onClick={() => setDeletingZone(null)}
                  className="rounded-xl border border-[var(--color-border-strong)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={zoneDeleteLoading}
                  onClick={handleDeleteZone}
                  className="rounded-xl bg-[var(--color-error)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {zoneDeleteLoading ? "Deleting..." : "Delete Zone"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
