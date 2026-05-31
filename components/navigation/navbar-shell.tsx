"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NavbarUser = {
  name: string | null;
  email: string;
} | null;

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

export function NavbarShell() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<NavbarUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const showSessionState = !isAuthPage;
  const links = isAuthPage ? authLinks : appLinks;
  const statusLabel = !showSessionState
    ? null
    : isLoading
      ? "Checking session..."
      : user
        ? `Signed in as ${user.name ?? user.email}`
        : "Not signed in";

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/get-session", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to load session");
        }

        const data = (await response.json()) as {
          user?: { name?: string | null; email: string } | null;
        };

        if (active) {
          setUser(
            data.user
              ? {
                  name: data.user.name ?? null,
                  email: data.user.email,
                }
              : null,
          );
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-white-200 bg-black/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-6 py-3">
        <Link href={user ? "/dashboard" : "/"} className="mr-2 text-sm font-semibold">
          Kakiyo Outreach
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  active ? "bg-black text-white" : "text-white/80 hover:bg-green-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {statusLabel ? (
            <span className="rounded-full border border-white-200 px-3 py-1 text-xs text-white/80">
              {statusLabel}
            </span>
          ) : null}

          {showSessionState && user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-white-300 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
