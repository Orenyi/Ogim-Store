import { useEffect, useRef, useState } from "react";
import { FiPlus, FiTrash2, FiUpload } from "react-icons/fi";

import type { ProductImage } from "../../types/inventory.types";

import {
  uploadAdminProductImages,
  deleteAdminProductImage,
} from "../../services/adminInventory.service";

type PendingImage = {
  id: string;
  file: File;
  preview: string;
};

type Props = {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export default function ProductImageUpload({
  images,
  onChange,
  onUploadingChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef(new Map<string, string>());

  const [items, setItems] = useState<PendingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const previews = previewUrlsRef.current;

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
      previews.clear();
    };
  }, []);

  function revokePreview(id: string) {
    const preview = previewUrlsRef.current.get(id);

    if (preview) {
      URL.revokeObjectURL(preview);
      previewUrlsRef.current.delete(id);
    }
  }

  function selectImages(files: FileList | null) {
    if (!files) return;

    setError("");

    const selected = Array.from(files);
    const availableSlots = Math.max(
      0,
      MAX_IMAGES - images.length - items.length,
    );

    if (availableSlots === 0) {
      setError("You can add a maximum of five product images.");
      return;
    }

    const validFiles: File[] = [];

    for (const file of selected) {
      if (validFiles.length >= availableSlots) {
        setError("You can add a maximum of five product images.");
        break;
      }

      if (!ALLOWED_TYPES.has(file.type)) {
        setError(`${file.name} is not a supported image format.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds the 5 MB image limit.`);
        continue;
      }

      validFiles.push(file);
    }

    const newItems = validFiles.map((file) => {
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);

      previewUrlsRef.current.set(id, preview);

      return { id, file, preview };
    });

    setItems((current) => [...current, ...newItems]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImages() {
    if (items.length === 0 || uploading || removingId) return;

    setUploading(true);
    onUploadingChange?.(true);
    setError("");

    try {
      const uploadedImages = await uploadAdminProductImages(
        items.map((item) => item.file),
      );

      if (uploadedImages.length !== items.length) {
        throw new Error("The server returned an incomplete image upload.");
      }

      if (uploadedImages.some((image) => !image.publicId || !image.url)) {
        throw new Error(
          "An uploaded image is missing its Cloudinary metadata.",
        );
      }

      onChange([...images, ...uploadedImages]);

      items.forEach((item) => revokePreview(item.id));
      setItems([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to upload product images.",
      );
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  async function removeUploadedImage(index: number) {
    const image = images[index];

    if (!image || uploading || removingId) return;

    if (!image.publicId) {
      setError("This image has no Cloudinary ID and cannot be deleted.");
      return;
    }

    setRemovingId(image.publicId);
    setError("");

    try {
      await deleteAdminProductImage(image.publicId);

      onChange(images.filter((_, imageIndex) => imageIndex !== index));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this image from Cloudinary.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  function removePendingImage(id: string) {
    revokePreview(id);
    setItems((current) => current.filter((item) => item.id !== id));
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
            Add up to five JPEG, PNG, WebP or AVIF images. Maximum 5 MB each.
          </p>
        </div>

        <span className="shrink-0 text-xs font-semibold text-[var(--color-muted)]">
          {totalImages}/{MAX_IMAGES}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {images.map((image, index) => (
          <div
            key={image.publicId || `${image.url}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
          >
            <img
              src={image.url}
              alt={image.alt || `Product ${index + 1}`}
              className="h-full w-full object-contain p-2"
            />

            <button
              type="button"
              onClick={() => void removeUploadedImage(index)}
              disabled={Boolean(removingId) || uploading}
              aria-label={`Remove image ${index + 1}`}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--color-error)] shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {removingId === image.publicId ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-error)] border-t-transparent" />
              ) : (
                <FiTrash2 size={13} />
              )}
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
              disabled={uploading}
              aria-label="Remove selected image"
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--color-error)] shadow disabled:opacity-50"
            >
              <FiTrash2 size={13} />
            </button>

            <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-1 text-[9px] font-semibold">
              Not uploaded
            </span>
          </div>
        ))}

        {totalImages < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || Boolean(removingId)}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiPlus size={22} />
            <span className="text-[10px] font-semibold">Add image</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="sr-only"
        onChange={(event) => selectImages(event.target.files)}
      />

      {items.length > 0 && (
        <button
          type="button"
          disabled={uploading || Boolean(removingId)}
          onClick={() => void uploadImages()}
          className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-4 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiUpload size={15} />
          {uploading
            ? "Uploading images..."
            : `Upload ${items.length} selected image${items.length > 1 ? "s" : ""}`}
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
