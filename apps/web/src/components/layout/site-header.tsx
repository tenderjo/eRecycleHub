import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { getSession, loadPublicOptional, serverApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";
import { pick } from "@/lib/format";
import { Logo } from "./logo";
import { MobileNav, NavLinks } from "./nav";
import { LocaleSwitcher } from "./switchers";
import { NotificationBell, UserMenu } from "./user-menu";

export async function SiteHeader() {
  const [t, locale, user, client] = await Promise.all([getTranslations("common"), getLocale(), getSession(), serverApi()]);
  // Optional announcement bar, written in Admin > Pages & settings (key "top-bar"); nothing is shown when it is empty.
  const bar = await loadPublicOptional<Schema<"SettingDto">>(client.GET("/api/content/settings/{key}", { params: { path: { key: "top-bar" } } }));
  const barText = pick(locale, bar?.valueEn, bar?.valueAr).trim();
  const links = [
    { href: "/", label: t("nav.home"), exact: true },
    { href: "/auctions", label: t("nav.auctions") },
    { href: "/about", label: t("nav.about") },
    { href: "/services", label: t("nav.services") },
    { href: "/how-to-buy", label: t("nav.howToBuy") },
    { href: "/apply", label: t("nav.apply") },
  ];
  // A floating pill: the wrapper is transparent so the homepage photo hero shows around it (the hero pulls itself up under it).
  return (
    <header className="sticky top-0 z-40">
      {barText && <div className="bg-patina-900 px-4 py-2 text-center text-xs text-white sm:text-sm">{barText}</div>}
      <div className="container-page pt-3 sm:pt-4">
        <div className="flex h-[4.5rem] items-center gap-3 rounded-2xl border border-white/60 bg-surface/90 px-3 shadow-[0_10px_40px_-12px_rgb(15_47_51/0.35)] backdrop-blur-md sm:px-5 lg:gap-6">
          <MobileNav links={links} signedIn={!!user} />
          <Link href="/" className="shrink-0" aria-label={t("nav.home")}>
            <Logo className="h-12 sm:h-14" />
          </Link>
          <NavLinks links={links} label={t("nav.main")} />
          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            <div className="hidden items-center gap-1 md:flex">
              <Suspense>
                <LocaleSwitcher />
              </Suspense>
            </div>
            {user ? (
              <>
                {user.role !== "Admin" && <NotificationBell />}
                <UserMenu />
              </>
            ) : (
              <>
                <Link href="/login" className="hidden h-11 items-center rounded-xl border border-patina/30 px-4 text-sm font-bold text-patina hover:bg-patina-50 sm:inline-flex">
                  {t("user.signIn")}
                </Link>
                <Link href="/register" className="inline-flex h-11 items-center rounded-xl bg-patina px-4 text-sm font-bold text-white shadow-[0_8px_20px_#087b7033] hover:bg-patina-700">
                  {t("user.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
