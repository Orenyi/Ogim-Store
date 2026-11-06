import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiRefreshCw } from "react-icons/fi";

import InventoryStats from "../admin/components/inventory/InventoryStats";
import InventoryToolbar from "../admin/components/inventory/InventoryToolbar";
import InventoryTable from "../admin/components/inventory/InventoryTable";
import InventoryMobileList from "../admin/components/inventory/InventoryMobileList";
import InventoryPagination from "../admin/components/inventory/InventoryPagination";
import AddProductModal from "../admin/components/inventory/AddProductModal";

import {
  createAdminProduct,
  getAdminInventory,
  updateAdminProductStock,
} from "../admin/services/adminInventory.service";

import type {
  CreateInventoryProductInput,
  InventoryProduct,
  InventoryQuery,
  InventoryResponse,
} from "../admin/types/inventory.types";

const initialQuery: InventoryQuery = {
  search: "",
  category: "all",
  status: "all",
  page: 1,
  limit: 5,
};

const emptyResponse: InventoryResponse = {
  products: [],
  summary: {
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  },
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  },
};

export default function InventoryPage() {
  const [query, setQuery] = useState<InventoryQuery>(initialQuery);
  const [data, setData] = useState<InventoryResponse>(emptyResponse);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<InventoryProduct | null>(
    null,
  );
  const [stockValue, setStockValue] = useState("");

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminInventory(query);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load inventory.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  function updateQuery<K extends keyof InventoryQuery>(
    key: K,
    value: InventoryQuery[K],
  ) {
    setQuery((current) => ({
      ...current,
      [key]: value,
      ...(key === "page" ? {} : { page: 1 }),
    }));
  }

  async function handleCreateProduct(input: CreateInventoryProductInput) {
    setSaving(true);

    try {
      await createAdminProduct(input);

      setAddModalOpen(false);
      setQuery((current) => ({
        ...current,
        page: 1,
        search: "",
        category: "all",
        status: "all",
      }));

      setNotice("Product added to the inventory.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStock() {
    if (!stockProduct) return;

    const quantity = Number(stockValue);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Enter a valid stock quantity.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateAdminProductStock(stockProduct.id, quantity);
      setStockProduct(null);
      setNotice("Stock quantity updated.");
      await loadInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update stock.");
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    const headers = [
      "Product",
      "SKU",
      "Brand",
      "Condition",
      "Price",
      "Stock",
      "Status",
    ];

    const rows = data.products.map((product) => [
      product.name,
      product.sku,
      product.brand,
      product.condition,
      product.price,
      product.stockQuantity,
      product.stockQuantity <= 0
        ? "Out of Stock"
        : product.stockQuantity <= 10
          ? "Low Stock"
          : "In Stock",
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
    link.download = "ogim-inventory.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 pb-8 sm:space-y-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-[var(--color-muted)]"
      >
        <Link to="/admin" className="hover:text-[var(--color-accent)]">
          Dashboard
        </Link>
        <FiChevronRight size={13} />
        <span className="font-semibold text-[var(--color-ink)]">Inventory</span>
      </nav>

      {/* Page heading */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-ink)] sm:text-4xl">
          Inventory Management
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
          Track stock levels, product availability and manage inventory.
        </p>
      </div>

      <InventoryStats summary={data.summary} />

      <InventoryToolbar
        search={query.search}
        category={query.category}
        status={query.status}
        onSearchChange={(value) => updateQuery("search", value)}
        onCategoryChange={(value) => updateQuery("category", value)}
        onStatusChange={(value) => updateQuery("status", value)}
        onAddProduct={() => setAddModalOpen(true)}
        onExport={handleExport}
      />

      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] px-4 py-3"
        >
          <p className="text-xs leading-5 text-[var(--color-success)]">
            {notice}
          </p>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="shrink-0 text-xs font-bold text-[var(--color-success)]"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-4 py-3"
        >
          <p className="text-xs text-[var(--color-error)]">{error}</p>
          <button
            type="button"
            onClick={() => void loadInventory()}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--color-error)]"
          >
            <FiRefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      {/* Inventory table */}
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
        {loading ? (
          <div className="space-y-3 p-4" role="status">
            <span className="sr-only">Loading inventory...</span>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-[66px] animate-pulse rounded-xl bg-[var(--color-surface-muted)]"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <InventoryTable
                products={data.products}
                selectedIds={[]}
                onToggle={() => undefined}
                onToggleAll={() => undefined}
                onEditStock={(product) => {
                  setStockProduct(product);
                  setStockValue(String(product.stockQuantity));
                }}
              />
            </div>

            <div className="p-3 md:hidden">
              <InventoryMobileList
                products={data.products}
                onEditStock={(product) => {
                  setStockProduct(product);
                  setStockValue(String(product.stockQuantity));
                }}
              />
            </div>

            <InventoryPagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={(page) => updateQuery("page", page)}
              onLimitChange={(limit) => updateQuery("limit", limit)}
            />
          </>
        )}
      </section>

      {/* Add product */}
      <AddProductModal
        open={addModalOpen}
        saving={saving}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateProduct}
      />

      {/* Stock adjustment dialog */}
      {stockProduct && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[var(--color-ink)]/55 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-dialog-title"
            className="w-full max-w-sm rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-dropdown)]"
          >
            <h2
              id="stock-dialog-title"
              className="font-heading text-lg font-extrabold"
            >
              Update Stock
            </h2>

            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {stockProduct.name}
            </p>

            <label
              htmlFor="stock-quantity"
              className="mb-2 mt-5 block text-xs font-semibold"
            >
              Available quantity
            </label>

            <input
              id="stock-quantity"
              type="number"
              min="0"
              step="1"
              value={stockValue}
              onChange={(event) => setStockValue(event.target.value)}
              className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setStockProduct(null)}
                disabled={saving}
                className="h-10 flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] text-xs font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleUpdateStock()}
                disabled={saving}
                className="h-10 flex-1 rounded-[var(--radius-control)] bg-[var(--color-accent)] text-xs font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
