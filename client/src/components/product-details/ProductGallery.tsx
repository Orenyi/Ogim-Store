import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMaximize2 } from "react-icons/fi";

interface ProductGalleryProps {
  productName: string;
  image: string;
  images?: string[];
}

export default function ProductGallery({
  productName,
  image,
  images,
}: ProductGalleryProps) {
  const galleryImages = images?.length ? images : [image];

  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const selectedImage = galleryImages[activeImage] ?? image;
  const selectedImageFailed = failedImages.includes(selectedImage);

  function markImageAsFailed(imageSrc: string) {
    setFailedImages((current) =>
      current.includes(imageSrc) ? current : [...current, imageSrc],
    );
  }

  function changeImage(direction: number) {
    setActiveImage((current) => {
      const next = current + direction;

      if (next < 0) return galleryImages.length - 1;
      if (next >= galleryImages.length) return 0;

      return next;
    });
  }

  return (
    <section aria-label={`${productName} image gallery`} className="min-w-0">
      {/* Main product image */}
      <div className="group relative min-w-0">
        <div className="relative flex aspect-[4/4.5] min-w-0 items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-stone)]/70 bg-white p-4 sm:p-6 lg:aspect-auto lg:h-[460px] lg:min-h-0 xl:h-[500px]">
          {selectedImageFailed ? (
            <div className="flex flex-col items-center gap-2 text-center text-sm text-[var(--color-muted)]">
              <span className="text-4xl" aria-hidden="true">
                📱
              </span>
              <span>Product image unavailable</span>
            </div>
          ) : (
            <img
              key={selectedImage}
              src={selectedImage}
              alt={productName}
              onError={() => markImageAsFailed(selectedImage)}
              className="h-full w-full object-contain transition-transform duration-300 ease-out motion-reduce:transition-none sm:group-hover:scale-[1.04]"
            />
          )}

          {/* Previous / next controls appear when multiple images exist */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => changeImage(-1)}
                aria-label="Previous product image"
                className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-stone)] bg-white/95 shadow-sm transition-colors hover:bg-[var(--color-paper)]"
              >
                <FiChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => changeImage(1)}
                aria-label="Next product image"
                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-stone)] bg-white/95 shadow-sm transition-colors hover:bg-[var(--color-paper)]"
              >
                <FiChevronRight size={18} />
              </button>
            </>
          )}

          {/* Visual hint for desktop zoom */}
          <div className="pointer-events-none absolute right-3 top-3 hidden rounded-full bg-white/95 p-2 text-[var(--color-muted)] shadow-sm sm:block">
            <FiMaximize2 size={16} />
          </div>
        </div>
      </div>

      {/* Thumbnails: horizontal on mobile, vertical on desktop */}
      {galleryImages.length > 1 && (
        <div
          aria-label="Choose product image"
          className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4 sm:gap-3"
        >
          {galleryImages.map((imageSrc, index) => {
            const thumbnailFailed = failedImages.includes(imageSrc);

            return (
              <button
                key={`${imageSrc}-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1} of ${productName}`}
                aria-pressed={activeImage === index}
                className={`flex size-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] border bg-white p-2 transition-colors sm:size-[76px] ${
                  activeImage === index
                    ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
                    : "border-[var(--color-stone)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                {thumbnailFailed ? (
                  <span aria-hidden="true">📱</span>
                ) : (
                  <img
                    src={imageSrc}
                    alt=""
                    loading="lazy"
                    onError={() => markImageAsFailed(imageSrc)}
                    className="h-full w-full object-contain"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
