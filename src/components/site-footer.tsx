import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-900">KPOP Games GO</p>
          <p className="max-w-md text-sm text-slate-500">
            Copyright {new Date().getFullYear()} KPOP Games GO. Lightning-fast HTML5 games streamed from Cloudflare R2 with HotPool recommendations refreshed daily.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
          <Link className="transition hover:text-blue-600" href="/terms">
            Terms of Use
          </Link>
          <Link className="transition hover:text-blue-600" href="/privacy">
            Privacy Policy
          </Link>
          <a className="transition hover:text-blue-600" href="mailto:hello@kpopgamesgo.com">
            hello@kpopgamesgo.com
          </a>
        </div>
      </div>
    </footer>
  );
}
