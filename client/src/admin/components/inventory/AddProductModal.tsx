import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBox,
  FiCheck,
  FiDollarSign,
  FiInfo,
  FiLayers,
  FiPackage,
  FiX,
} from "react-icons/fi";

import type {
  CreateInventoryProductInput,
  ProductBrand,
  ProductCondition,
  ProductImage,
  ProductTechnicalSpecifications,
} from "../../types/inventory.types";

import { deleteAdminProductImage } from "../../services/adminInventory.service";
import ProductImageUpload from "./ProductImageUpload";

type Props = {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: CreateInventoryProductInput) => Promise<void>;
};

type FormState = {
  name: string;
  model: string;
  description: string;
  brand: ProductBrand;
  condition: ProductCondition;
  price: string;
  compareAtPrice: string;
  storage: string;
  colour: string;
  sku: string;
  stockQuantity: string;
  ram: string;
  display: string;
  battery: string;
  camera: string;
  operatingSystem: string;
  network: string;
  processor: string;
  additionalFeatures: string;
  isFeatured: boolean;
  isNewArrival: boolean;
};

const initialForm: FormState = {
  name: "",
  model: "",
  description: "",
  brand: "Samsung",
  condition: "new",
  price: "",
  compareAtPrice: "",
  storage: "",
  colour: "",
  sku: "",
  stockQuantity: "0",
  ram: "",
  display: "",
  battery: "",
  camera: "",
  operatingSystem: "",
  network: "",
  processor: "",
  additionalFeatures: "",
  isFeatured: false,
  isNewArrival: false,
};

const brands: ProductBrand[] = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Tecno",
  "Infinix",
  "Other",
];

const conditions: {
  value: ProductCondition;
  label: string;
}[] = [
  { value: "new", label: "Brand New" },
  { value: "uk-used", label: "UK Used" },
  { value: "refurbished", label: "Refurbished" },
];

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--color-ink)]">
        {label}
        {required && <span className="ml-1 text-[var(--color-error)]">*</span>}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full min-w-0 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";

const textareaClass =
  "w-full min-w-0 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FiBox;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Icon size={17} />
      </span>

      <div>
        <h3 className="text-sm font-extrabold text-[var(--color-ink)]">
          {title}
        </h3>

        <p className="mt-0.5 text-xs text-[var(--color-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AddProductModal({
  open,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cleaningImages, setCleaningImages] = useState(false);
  const [error, setError] = useState("");

  // Keep the latest uploaded images available to cleanup logic.
  const imagesRef = useRef<ProductImage[]>([]);

  // Keep callbacks and state transitions safe across async operations.
  const mountedRef = useRef(false);
  const closingRef = useRef(false);
  const productCreatedRef = useRef(false);
  const cleanupPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateImages = useCallback((nextImages: ProductImage[]) => {
    imagesRef.current = nextImages;
    setImages(nextImages);
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    imagesRef.current = [];
    setImages([]);
    setUploading(false);
    setError("");
    productCreatedRef.current = false;
    closingRef.current = false;
    cleanupPromiseRef.current = null;
  }, []);

  /**
   * Delete only temporary Cloudinary images that are not attached
   * to a successfully created product.
   */
  const cleanupUploadedImages = useCallback(async () => {
    if (productCreatedRef.current || imagesRef.current.length === 0) {
      return;
    }

    // Reuse an existing cleanup request instead of sending duplicates.
    if (cleanupPromiseRef.current) {
      return cleanupPromiseRef.current;
    }

    const imagesToDelete = [...imagesRef.current].filter((image) =>
      Boolean(image.publicId),
    );

    // Clear the current list before sending requests.
    imagesRef.current = [];
    setImages([]);

    const cleanupPromise = (async () => {
      if (mountedRef.current) {
        setCleaningImages(true);
      }

      try {
        const results = await Promise.allSettled(
          imagesToDelete.map((image) =>
            deleteAdminProductImage(image.publicId),
          ),
        );

        const failedCount = results.filter(
          (result) => result.status === "rejected",
        ).length;

        if (failedCount > 0) {
          console.warn(
            `${failedCount} temporary product image(s) could not be deleted from Cloudinary.`,
          );

          if (mountedRef.current) {
            setError(
              "Some temporary images could not be deleted. Please try closing the form again.",
            );
          }
        }
      } finally {
        cleanupPromiseRef.current = null;

        if (mountedRef.current) {
          setCleaningImages(false);
        }
      }
    })();

    cleanupPromiseRef.current = cleanupPromise;

    return cleanupPromise;
  }, []);

  /**
   * One close handler for Cancel, close icon, backdrop and Escape.
   */
  const handleClose = useCallback(async () => {
    if (
      saving ||
      uploading ||
      cleaningImages ||
      closingRef.current ||
      productCreatedRef.current
    ) {
      return;
    }

    closingRef.current = true;
    setError("");

    try {
      await cleanupUploadedImages();

      // If cleanup failed, keep the modal open so the user can retry.
      if (cleanupPromiseRef.current) {
        closingRef.current = false;
        return;
      }

      onClose();
    } catch {
      closingRef.current = false;

      if (mountedRef.current) {
        setError("Unable to clean up temporary images. Please try again.");
      }
    }
  }, [saving, uploading, cleaningImages, cleanupUploadedImages, onClose]);

  // Reset state when the modal opens.
  useEffect(() => {
    if (!open) return;

    resetForm();
  }, [open, resetForm]);

  // Escape key support.
  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      event.preventDefault();
      void handleClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, handleClose]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving || uploading || cleaningImages || closingRef.current) return;

    setError("");

    const name = form.name.trim();
    const model = form.model.trim();
    const description = form.description.trim();
    const sku = form.sku.trim().toUpperCase();
    const storage = form.storage.trim();

    const price = Number(form.price);

    const compareAtPrice = form.compareAtPrice.trim()
      ? Number(form.compareAtPrice)
      : undefined;

    const stockQuantity = Number(form.stockQuantity);

    if (!name || !model || !description || !sku || !storage) {
      setError(
        "Product name, model, description, SKU and storage are required.",
      );
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid product selling price.");
      return;
    }

    if (
      compareAtPrice !== undefined &&
      (!Number.isFinite(compareAtPrice) || compareAtPrice <= price)
    ) {
      setError("Compare-at price must be greater than the selling price.");
      return;
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError("Stock quantity must be a non-negative whole number.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }

    if (images.some((image) => !image.url || !image.publicId)) {
      setError(
        "Every product image must have a valid Cloudinary URL and public ID.",
      );
      return;
    }

    const specifications: ProductTechnicalSpecifications = {
      storage,
      ram: form.ram.trim() || undefined,
      color: form.colour.trim() || undefined,
      display: form.display.trim() || undefined,
      battery: form.battery.trim() || undefined,
      camera: form.camera.trim() || undefined,
      operatingSystem: form.operatingSystem.trim() || undefined,
      network: form.network.trim() || undefined,
      processor: form.processor.trim() || undefined,
      additionalFeatures: form.additionalFeatures
        .split(",")
        .map((feature) => feature.trim())
        .filter(Boolean),
    };

    const input: CreateInventoryProductInput = {
      name,
      model,
      description,
      brand: form.brand,
      condition: form.condition,
      price,
      compareAtPrice,
      storage,
      colour: form.colour.trim(),
      stockQuantity,
      sku,
      image: images[0].url,
      images: [...images],
      specifications,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
    };

    try {
      await onSubmit(input);

      // The backend has successfully created the product.
      // Its Cloudinary images must now be preserved.
      productCreatedRef.current = true;
      imagesRef.current = [];
      setImages([]);
    } catch (err) {
      // Keep uploaded images so the admin can retry product creation.
      setError(
        err instanceof Error ? err.message : "Unable to create product.",
      );
    }
  }

  const closeDisabled =
    saving || uploading || cleaningImages || closingRef.current;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center bg-[var(--color-ink)]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              void handleClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-product-title"
            className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[24px] bg-[var(--color-paper)] shadow-[var(--shadow-dropdown)] sm:rounded-[var(--radius-card)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-4 py-4 sm:px-6">
              <div>
                <h2
                  id="add-product-title"
                  className="font-heading text-lg font-extrabold tracking-[-0.035em] text-[var(--color-ink)] sm:text-xl"
                >
                  Add New Product
                </h2>

                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Add product details and manage its inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleClose()}
                disabled={closeDisabled}
                aria-label="Close add product form"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiX size={18} />
              </button>
            </div>

            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                {/* Basic details */}
                <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 sm:p-5">
                  <SectionHeading
                    icon={FiBox}
                    title="Basic Information"
                    description="Identify and describe the product."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Product name" required>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="e.g. Samsung Galaxy S24 Ultra"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Model" required>
                      <input
                        required
                        value={form.model}
                        onChange={(e) => update("model", e.target.value)}
                        placeholder="e.g. Galaxy S24 Ultra"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Brand" required>
                      <select
                        value={form.brand}
                        onChange={(e) =>
                          update("brand", e.target.value as ProductBrand)
                        }
                        className={inputClass}
                      >
                        {brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Condition" required>
                      <select
                        value={form.condition}
                        onChange={(e) =>
                          update(
                            "condition",
                            e.target.value as ProductCondition,
                          )
                        }
                        className={inputClass}
                      >
                        {conditions.map((condition) => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Product description" required>
                        <textarea
                          required
                          rows={3}
                          value={form.description}
                          onChange={(e) =>
                            update("description", e.target.value)
                          }
                          placeholder="Describe the phone, its condition and key selling points..."
                          className={textareaClass}
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* Pricing */}
                <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 sm:p-5">
                  <SectionHeading
                    icon={FiDollarSign}
                    title="Pricing"
                    description="Set the selling price and optional previous price."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Selling price (₦)" required>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={form.price}
                        onChange={(e) => update("price", e.target.value)}
                        placeholder="1350000"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Compare-at price (₦)">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.compareAtPrice}
                        onChange={(e) =>
                          update("compareAtPrice", e.target.value)
                        }
                        placeholder="Optional previous price"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </section>

                {/* Specifications */}
                <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 sm:p-5">
                  <SectionHeading
                    icon={FiInfo}
                    title="Technical Specifications"
                    description="Add product specifications displayed to customers."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Storage" required>
                      <input
                        required
                        value={form.storage}
                        onChange={(e) => update("storage", e.target.value)}
                        placeholder="256GB"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="RAM">
                      <input
                        value={form.ram}
                        onChange={(e) => update("ram", e.target.value)}
                        placeholder="12GB"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Colour">
                      <input
                        value={form.colour}
                        onChange={(e) => update("colour", e.target.value)}
                        placeholder="Titanium Black"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Display">
                      <input
                        value={form.display}
                        onChange={(e) => update("display", e.target.value)}
                        placeholder="6.8-inch AMOLED"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Battery">
                      <input
                        value={form.battery}
                        onChange={(e) => update("battery", e.target.value)}
                        placeholder="5000mAh"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Camera">
                      <input
                        value={form.camera}
                        onChange={(e) => update("camera", e.target.value)}
                        placeholder="200MP"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Operating system">
                      <input
                        value={form.operatingSystem}
                        onChange={(e) =>
                          update("operatingSystem", e.target.value)
                        }
                        placeholder="Android"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Network">
                      <input
                        value={form.network}
                        onChange={(e) => update("network", e.target.value)}
                        placeholder="5G"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Processor">
                      <input
                        value={form.processor}
                        onChange={(e) => update("processor", e.target.value)}
                        placeholder="Snapdragon 8 Gen 3"
                        className={inputClass}
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Additional features">
                        <input
                          value={form.additionalFeatures}
                          onChange={(e) =>
                            update("additionalFeatures", e.target.value)
                          }
                          placeholder="S Pen, Wireless charging, Water resistant"
                          className={inputClass}
                        />

                        <span className="mt-1 block text-[10px] text-[var(--color-muted)]">
                          Separate features with commas.
                        </span>
                      </Field>
                    </div>
                  </div>
                </section>

                {/* Inventory */}
                <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 sm:p-5">
                  <SectionHeading
                    icon={FiLayers}
                    title="Inventory"
                    description="Set the SKU and starting stock quantity."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="SKU" required>
                      <input
                        required
                        value={form.sku}
                        onChange={(e) => update("sku", e.target.value)}
                        placeholder="SGS24U-256"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Stock quantity" required>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={form.stockQuantity}
                        onChange={(e) =>
                          update("stockQuantity", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </section>

                {/* Images */}
                <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 sm:p-5">
                  <SectionHeading
                    icon={FiPackage}
                    title="Product Images"
                    description="Upload the main product image and additional gallery images."
                  />

                  <ProductImageUpload
                    images={images}
                    onChange={updateImages}
                    onUploadingChange={setUploading}
                  />
                </section>

                {/* Store visibility */}
                <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold text-[var(--color-ink)]">
                    Store visibility
                  </h3>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border)] p-3">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => update("isFeatured", e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
                      />

                      <span>
                        <span className="block text-xs font-bold">
                          Featured product
                        </span>

                        <span className="mt-1 block text-[10px] text-[var(--color-muted)]">
                          Highlight this product on the storefront.
                        </span>
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border)] p-3">
                      <input
                        type="checkbox"
                        checked={form.isNewArrival}
                        onChange={(e) =>
                          update("isNewArrival", e.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
                      />

                      <span>
                        <span className="block text-xs font-bold">
                          New arrival
                        </span>

                        <span className="mt-1 block text-[10px] text-[var(--color-muted)]">
                          Mark this product as a new arrival.
                        </span>
                      </span>
                    </label>
                  </div>
                </section>

                {cleaningImages && (
                  <p className="text-xs text-[var(--color-muted)]">
                    Cleaning up temporary uploaded images...
                  </p>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-4 py-3 text-xs leading-5 text-[var(--color-error)]"
                  >
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[var(--color-border)] bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => void handleClose()}
                  disabled={closeDisabled}
                  className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cleaningImages ? "Cleaning images..." : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={
                    saving || uploading || cleaningImages || closingRef.current
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-xs font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiCheck size={16} />

                  {uploading
                    ? "Images uploading..."
                    : saving
                      ? "Adding product..."
                      : "Add Product"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
