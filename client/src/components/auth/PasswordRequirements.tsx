import { FiCheckCircle, FiCircle } from "react-icons/fi";

export function getPasswordRequirements(password: string) {
  return [
    {
      key: "length",
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      key: "uppercase",
      label: "Use an uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      label: "Use a lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      key: "number",
      label: "Must include a number",
      valid: /\d/.test(password),
    },
  ];
}

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  const requirements = getPasswordRequirements(password);

  return (
    <ul
      aria-label="Password requirements"
      className="space-y-2 rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-3 sm:p-4"
    >
      {requirements.map(({ key, label, valid }) => {
        const Icon = valid ? FiCheckCircle : FiCircle;

        return (
          <li key={key} className="flex items-center gap-2">
            <Icon
              size={15}
              aria-hidden="true"
              className={
                valid
                  ? "shrink-0 text-[var(--color-success)]"
                  : "shrink-0 text-[var(--color-muted)]"
              }
            />

            <span
              className={[
                "text-xs leading-5 sm:text-sm",
                valid
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-muted)]",
              ].join(" ")}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
