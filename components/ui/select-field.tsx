"use client";

import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({ className = "", ...props }: Props) {
  return (
    <select
      className={[
        "w-full rounded-md border border-white-300 bg-white px-3 py-2 text-sm text-black outline-none ring-offset-2 focus:border-white-500 focus:ring-2",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
