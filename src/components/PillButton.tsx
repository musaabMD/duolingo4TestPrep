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
      "bg-[var(--brand)] text-white hover:brightness-105 active:translate-y-[1px]",
    ghost:
      "bg-[var(--track)] text-[var(--ink)] hover:bg-[#e6e6e6]",
    disabled: "bg-[var(--track)] text-[#afafaf] cursor-not-allowed",
  } as const;

  const look = disabled ? styles.disabled : styles[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex min-h-14 w-full items-center justify-center rounded-full px-6 text-lg font-extrabold tracking-tight transition ${look} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
