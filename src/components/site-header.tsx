"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/#popular", label: "Popular" },
  { href: "/#new", label: "New Releases" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/onlinegames")) {
    return null;
  }

  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white text-slate-900 shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={closeMobile}
          aria-label="KPOP Games GO home"
        >
          <Image src="/kpoplogo.png" alt="KPOP Games GO" width={270} height={63} className="h-14 w-auto" priority />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/" className="text-slate-700 transition hover:text-slate-900">
            Home
          </Link>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-slate-700 transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/#contact"
          className="hidden rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 md:inline-flex"
        >
          Submit a Game
        </Link>
        <button
          type="button"
          onClick={toggleMobile}
          className="inline-flex items-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          Menu
        </button>
      </div>
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-30 bg-slate-800/20 backdrop-blur-sm" onClick={closeMobile} />
          <div className="fixed inset-x-4 top-20 z-40 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>Navigation</span>
              <button
                type="button"
                onClick={closeMobile}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs transition hover:border-slate-300"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <Link href="/" onClick={closeMobile} className="rounded-2xl bg-blue-50 px-3 py-2 text-slate-900">
                Home
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className="rounded-2xl bg-blue-50 px-3 py-2 text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/#contact"
                onClick={closeMobile}
                className="rounded-2xl bg-blue-600 px-3 py-2 text-white"
              >
                Submit a Game
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
