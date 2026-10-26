import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";

import { sampleProducts } from "../data/products";
import ProductGallery from "../components/product-details/ProductGallery";
import ProductInfo from "../components/product-details/ProductInfo";
import ProductPurchasePanel from "../components/product-details/ProductPurchasePanel";
import ProductOverview from "../components/product-details/ProductOverview";
import ProductSpecifications from "../components/product-details/ProductSpecifications";
import ProductDetailsAccordion from "../components/product-details/ProductDetailsAccordion";
import RelatedProducts from "../components/product-details/RelatedProducts";
import MobilePurchaseBar from "../components/product-details/MobilePurchaseBar";

const productDetails: Record<
  string,
  {
    description: string;
    highlights: string[];
    specifications: { label: string; value: string }[];
  }
> = {
  "iphone-16-pro": {
    description:
      "The iPhone 16 Pro combines powerful performance, an advanced camera system, and a premium titanium design for everyday use.",
    highlights: [
      "6.3-inch Super Retina XDR display",
      "A18 Pro chip",
      "Pro camera system",
      "Titanium design",
    ],
    specifications: [
      { label: "Display", value: "6.3-inch Super Retina XDR" },
      { label: "Chip", value: "A18 Pro" },
      { label: "Rear camera", value: "48MP + 12MP + 48MP" },
      { label: "Front camera", value: "12MP" },
      { label: "Storage", value: "256GB" },
      { label: "SIM", value: "Dual SIM support varies by model" },
    ],
  },
  "samsung-galaxy-s24": {
    description:
      "The Samsung Galaxy S24 delivers a premium Android experience with a bright display, capable cameras, and smooth performance.",
    highlights: [
      "Dynamic AMOLED 2X display",
      "High-performance processor",
      "Advanced multi-camera system",
      "Premium Galaxy design",
    ],
    specifications: [
      { label: "Display", value: "Dynamic AMOLED 2X" },
      { label: "Processor", value: "Varies by market" },
      { label: "Rear camera", value: "Triple-camera system" },
      { label: "Storage", value: "256GB" },
      { label: "Operating system", value: "Android" },
    ],
  },
  "google-pixel-8": {
    description:
      "The Google Pixel 8 offers a clean Android experience, intelligent photography features, and Google's software experience.",
    highlights: [
      "OLED display",
      "Google Tensor processor",
      "Google-powered photography features",
      "Clean Android experience",
    ],
    specifications: [
      { label: "Display", value: "OLED" },
      { label: "Processor", value: "Google Tensor G3" },
      { label: "Rear camera", value: "Dual-camera system" },
      { label: "Storage", value: "128GB" },
      { label: "Operating system", value: "Android" },
    ],
  },
};

const defaultHighlights = [
  "Explore the product's key features",
  "Designed for everyday performance",
  "Product details depend on the specific model",
];

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  const product = sampleProducts.find((item) => item.slug === slug);

  if (!product) {
    return (
      <main className="page-container py-16 sm:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-3xl">
            📱
          </div>

          <h1 className="text-2xl sm:text-3xl">Product not found</h1>

          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            This phone may have been removed or the link may be incorrect.
            Browse our shop to find another device.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            <FiArrowLeft size={16} />
            Browse phones
          </Link>
        </div>
      </main>
    );
  }

  const details = productDetails[product.slug];

  const description =
    details?.description ??
    `${product.name} from ${product.brand}. Review the available product information or contact Ogim Store if you need more details before ordering.`;

  const highlights = details?.highlights ?? defaultHighlights;

  const specifications = details?.specifications ?? [
    { label: "Brand", value: product.brand },
    { label: "Model", value: product.name },
    { label: "Storage", value: product.storage },
  ];

  const accordionItems = [
    {
      id: "overview",
      title: "Product overview",
      content: (
        <ProductOverview description={description} highlights={highlights} />
      ),
    },
    {
      id: "specifications",
      title: "Specifications",
      content: <ProductSpecifications specifications={specifications} />,
    },
    {
      id: "delivery",
      title: "Delivery & Returns",
      content: (
        <p>
          Delivery options, estimated arrival times, and return terms will be
          displayed here. Final information will come from the store's delivery
          and returns policy.
        </p>
      ),
    },
    {
      id: "warranty",
      title: "Warranty Information",
      content: (
        <p>
          Warranty coverage depends on the product and its condition. Confirm
          the applicable warranty terms before placing an order.
        </p>
      ),
    },
    {
      id: "reviews",
      title: `Reviews (${product.reviewCount ?? 0})`,
      content: (
        <p>
          {typeof product.rating === "number"
            ? `This product has a rating of ${product.rating.toFixed(1)} out of 5 based on ${product.reviewCount ?? 0} reviews.`
            : "Customer reviews are not available yet."}
        </p>
      ),
    },
  ];

  return (
    <main className="pb-28 sm:pb-16">
      {/* Breadcrumbs */}
      <div className="page-container">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 overflow-x-auto py-4 text-xs text-[var(--color-muted)] sm:py-5"
        >
          <Link to="/" className="shrink-0 hover:text-[var(--color-accent)]">
            Home
          </Link>

          <FiChevronRight className="shrink-0" size={13} />

          <Link
            to="/shop"
            className="shrink-0 hover:text-[var(--color-accent)]"
          >
            Shop
          </Link>

          <FiChevronRight className="shrink-0" size={13} />

          <span className="shrink-0">{product.brand}</span>

          <FiChevronRight className="shrink-0" size={13} />

          <span
            aria-current="page"
            className="truncate font-medium text-[var(--color-ink)]"
          >
            {product.name}
          </span>
        </nav>
      </div>

      {/* Product gallery and purchase information */}
      <section className="page-container">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-10 xl:gap-12">
          <ProductGallery
            productName={product.name}
            image={product.image}
            images={product.images}
          />

          <div className="flex min-w-0 flex-col">
            <ProductInfo product={product} />
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </section>

      {/* Desktop overview and specifications */}
      <section className="page-container mt-10 sm:mt-14">
        <div className="hidden gap-8 md:grid md:grid-cols-2 lg:gap-12">
          <ProductOverview description={description} highlights={highlights} />

          <ProductSpecifications specifications={specifications} />
        </div>

        {/* Expandable information for mobile and smaller screens */}
        <div className="md:hidden">
          <ProductDetailsAccordion items={accordionItems} />
        </div>
      </section>

      {/* Same-brand recommendations */}
      <section className="page-container mt-12 sm:mt-16">
        <RelatedProducts product={product} products={sampleProducts} />
      </section>

      {/* Sticky mobile purchase action */}
      <MobilePurchaseBar product={product} />
    </main>
  );
}
