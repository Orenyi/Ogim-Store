import ShippingHero from "../components/shipping/ShippingHero";
import DeliveryHighlights from "../components/shipping/DeliveryHighlights";
import DeliveryOptions from "../components/shipping/DeliveryOptions";
import DeliveryProcess from "../components/shipping/DeliveryProcess";

export default function ShippingPage() {
  return (
    <main className="min-w-0 overflow-hidden bg-[var(--color-paper)]">
      <ShippingHero />
      <DeliveryHighlights />
      <DeliveryOptions />
      <DeliveryProcess />
    </main>
  );
}
