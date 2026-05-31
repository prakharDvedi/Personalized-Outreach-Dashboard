"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Variant = "primary" | "secondary" | "destructive";

type Props = {
  children: ReactNode;
  pendingLabel?: string;
  busy?: boolean;
  variant?: Variant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:bg-neutral-800 active:translate-y-px shadow-sm shadow-black/20",
  secondary:
    "border border-white-300 text-white/90 hover:bg-white/10 active:translate-y-px",
  destructive:
    "border border-red-300 text-red-700 hover:bg-red-50 active:translate-y-px",
};

export function ActionButton({
  children,
  pendingLabel,
  busy,
  variant = "primary",
  className = "",
  type = "submit",
  disabled,
  ...props
}: Props) {
  const formStatus = useFormStatus();
  const isPending = busy ?? formStatus.pending;

  return (
    <button
      type={type}
      disabled={disabled || isPending}
      className={[
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {isPending ? pendingLabel ?? children : children}
    </button>
  );
}
