import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLabel: string;
  children: ReactNode;
};

export function AuthCard({
  title,
  description,
  footerText,
  footerHref,
  footerLabel,
  children,
}: Props) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
      <section className="w-full space-y-4 rounded-xl border border-white-200 p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-white/80">{description}</p>
        </div>
        {children}
        <p className="text-sm text-white/80">
          {footerText}{" "}
          <Link href={footerHref} className="font-medium text-white underline">
            {footerLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
