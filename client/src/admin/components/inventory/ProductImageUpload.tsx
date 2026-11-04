import { useEffect, useRef, useState } from "react";
import { FiPlus, FiTrash2, FiUpload } from "react-icons/fi";

import {
  isCloudinaryConfigured,
  uploadProductImage,
} from "../../services/cloudinary.service";

type ImageItem = {
  id: string;
  file: File;
  preview: string;
  url: string;
};

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

export default function ProductImageUpload({
  images,
  onChange,
  onUploadingChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [items]);

  function selectImages(files: FileList | null) {
    if (!files) return;

    setError("");

    const selected = Array.from(files);
    const availableSlots = Math.max(0, 5 - images.length);

    if (selected.length > availableSlots) {
      setError("You can add a maximum of five product images.");
    }

    const validFiles = selected
      .filter((file) => {
        const validType = ["image/jpeg", "image/png", "image/webp"].includes(
          file.type,
        );

        if (!validType) {
          setError("Use JPG, PNG or WebP images.");
          return false;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be 5MB or smaller.");
          return false;
        }

        return true;
      })
      .slice(0, availableSlots);

    const newItems = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      url: "",
    }));

    setItems((current) => [...current, ...newItems]);
  }

  async function uploadImages() {
    if (!isCloudinaryConfigured()) {
      setError(
        "Cloudinary is not configured yet. You can preview images in demo mode, but they will not be saved.",
      );
      return;
    }

    if (items.length === 0) return;

    setUploading(true);
    onUploadingChange?.(true);
    setError("");

    try {
      const uploaded = await Promise.all(
        items.map((item) => uploadProductImage(item.file)),
      );

      const urls = uploaded.map((image) => image.secure_url);

      onChange([...images, ...urls]);

      items.forEach((item) => URL.revokeObjectURL(item.preview));
      setItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  function removeUploadedImage(index: number) {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  }

  function removePendingImage(id: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);

      if (target) URL.revokeObjectURL(target.preview);

      return current.filter((item) => item.id !== id);
    });
  }

  const totalImages = images.length + items.length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--color-ink)]">
            Product images
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Add up to five JPG, PNG or WebP images. Maximum 5MB each.
          </p>
        </div>

        <span className="shrink-0 text-xs font-semibold text-[var(--color-muted)]">
          {totalImages}/5
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
          >
            <img
              src={url}
              alt={`Product ${index + 1}`}
              className="h-full w-full object-contain p-2"
            />

            <button
              type="button"
              onClick={() => removeUploadedImage(index)}
              aria-label={`Remove image ${index + 1}`}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--color-error)] shadow"
            >
              <FiTrash2 size={13} />
            </button>

            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-1 text-[9px] font-bold">
                Main image
              </span>
            )}
          </div>
        ))}

        {items.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-[var(--color-accent)] bg-[var(--color-surface-muted)]"
          >
            <img
              src={item.preview}
              alt="Selected product preview"
              className="h-full w-full object-contain p-2"
            />

            <button
              type="button"
              onClick={() => removePendingImage(item.id)}
              aria-label="Remove selected image"
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--color-error)] shadow"
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        ))}

        {totalImages < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <FiPlus size={22} />
            <span className="text-[10px] font-semibold">Add image</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => {
          selectImages(event.target.files);
          event.target.value = "";
        }}
      />

      {items.length > 0 && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => void uploadImages()}
          className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-4 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
        >
          <FiUpload size={15} />
          {uploading ? "Uploading..." : "Upload selected images"}
        </button>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 text-xs leading-5 text-[var(--color-error)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
