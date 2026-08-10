import type { ButtonHTMLAttributes, ReactNode } from "react";

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "brand" | "ghost" | "disabled";
};

export function PillButton({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: PillButtonProps) {
  const styles = {
    primary:
      "bg-[var(--ink)] text-white hover:bg-black active:translate-y-[1px]",
    brand:
      "bg-[var(--brand)] text-white shadow-[0_4px_0_var(--brand-deep)] hover:brightness-105 active:translate-y-[1px]",
    ghost:
      "bg-[var(--surface)] text-[var(--ink)] hover:bg-[#ececec]",
    disabled: "bg-[var(--track)] text-[#afafaf] cursor-not-allowed",
  } as const;

  const look = disabled ? styles.disabled : styles[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex min-h-14 w-full items-center justify-center rounded-2xl px-6 text-lg font-extrabold tracking-tight transition ${look} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
