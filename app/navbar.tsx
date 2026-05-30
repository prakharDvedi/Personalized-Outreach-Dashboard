
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const appLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/offerings", label: "Offerings" },
  { href: "/prompt", label: "Prompt" },
  { href: "/prospects", label: "Prospects" },
];

const authLinks = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
];

export default function Navbar() {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const links = isAuthPage ? authLinks : appLinks;

  return (
    <nav className="sticky top-0 z-20 border-b border-white-200 bg-black/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-6 py-3">
        <Link href="/dashboard" className="mr-3 text-sm font-semibold">
          Kakiyo Outreach
        </Link>

        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-black text-white"
                  : "text-white/80 hover:bg-green-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}