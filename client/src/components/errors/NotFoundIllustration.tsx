import { FiArrowDownLeft, FiSearch, FiSmartphone } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";

export default function NotFoundIllustration() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center sm:max-w-[340px]"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-[8%] rounded-full bg-[var(--color-accent-soft)]" />
      <div className="absolute right-[10%] top-[13%] h-5 w-5 rounded-full bg-[var(--color-accent)] sm:h-7 sm:w-7" />
      <div className="absolute bottom-[14%] left-[10%] h-3 w-3 rounded-full bg-[var(--color-border-strong)] sm:h-4 sm:w-4" />

      {/* Floating search icon */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        className="absolute right-[12%] top-[22%] grid h-14 w-14 place-items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-accent)] shadow-[var(--shadow-card)] sm:h-16 sm:w-16"
      >
        <FiSearch size={26} />
      </motion.div>

      {/* Main phone illustration */}
      <motion.div
        animate={
          reduceMotion ? undefined : { y: [0, 5, 0], rotate: [-3, 0, -3] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative flex h-[65%] w-[43%] flex-col items-center justify-between rounded-[30px] border-[5px] border-[var(--color-ink)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-card)] sm:rounded-[36px] sm:p-4"
      >
        <span className="mt-1 h-1.5 w-10 rounded-full bg-[var(--color-stone)]" />

        <div className="flex flex-col items-center">
          <span className="text-5xl font-extrabold tracking-tighter text-[var(--color-accent)] sm:text-6xl">
            404
          </span>
          <span className="mt-2 text-center text-[10px] font-semibold leading-4 text-[var(--color-muted)] sm:text-xs">
            Page not found
          </span>
        </div>

        <span className="mb-1 h-2 w-2 rounded-full bg-[var(--color-stone)]" />
      </motion.div>

      {/* Small route arrow */}
      <div className="absolute bottom-[15%] right-[15%] grid h-12 w-12 place-items-center rounded-full bg-[var(--color-accent)] text-white shadow-[var(--shadow-card)] sm:h-14 sm:w-14">
        <FiArrowDownLeft size={24} />
      </div>

      <div className="absolute bottom-[12%] left-[18%] grid h-12 w-12 place-items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-ink)] shadow-[var(--shadow-sm)] sm:h-14 sm:w-14">
        <FiSmartphone size={22} />
      </div>
    </div>
  );
}
