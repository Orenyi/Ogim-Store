import staffLoginImage from "../../../assets/images/staff_login_img.webp";

export default function AdminLoginVisual() {
  return (
    <section className="relative hidden min-h-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-paper)] lg:flex lg:items-center lg:justify-center">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[var(--color-accent-soft)]" />

      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[var(--color-stone)]/70" />

      {/* Brand and image */}
      <div className="relative z-10 flex w-full max-w-[620px] flex-col items-center px-8 py-12 xl:px-12">
        <div className="relative w-full max-w-[520px]">
          <img
            src={staffLoginImage}
            alt="Smartphones available at Ogim Store"
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
