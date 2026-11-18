import { ArrowLeft, CalendarClock, CircleCheck, Gavel, Layers, Radio, Recycle, Search, Store, Users } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { AuctionGrid } from "@/components/auction/auction-card";
import { AuctionTabs } from "@/components/public/auction-tabs";
import { AuctionTypes, FaqAccordion, NumbersBand, PurposeCards, RStrip, SectionTitle, defaultFaq } from "@/components/public/sections";
import { RichHtml } from "@/components/rich-html";
import { EmptyState } from "@/components/ui/display";
import { Link } from "@/i18n/navigation";
import { getCountryId, load, loadOptional, serverApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";
import { fileUrl, nowMs, number, pick } from "@/lib/format";
import { parseHeroTitle, type HeroTone } from "@/lib/hero-title";
import { alternates } from "@/lib/seo";
import { siteImages } from "@/lib/site-images";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("public.home"), getLocale()]);
  return { title: t("metaTitle"), description: t("heroBody"), alternates: alternates(locale, "/") };
}

/** Admin-editable heading/body per homepage section: settings "home-<section>" (title = heading, value = text); built-in text when absent. */
const SECTIONS = ["categories", "live", "upcoming", "steps", "seller"] as const;
const DEFAULT_HERO_IMAGE = "/images/content/hero-scrap-bales.jpg";

const heroTones: Record<HeroTone, string | undefined> = { plain: undefined, green: "text-lime", purple: "text-cyan" };

/** Hero button: site paths go through the locale-aware Link, full URLs (set by an admin) are plain links. */
function HeroLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return href.startsWith("/") ? (
    <Link href={href} className={className}>{children}</Link>
  ) : (
    <a href={href} rel="noopener noreferrer" className={className}>{children}</a>
  );
}

export default async function HomePage() {
  const [t, tb, tf, tc, locale, client, countryId, img] = await Promise.all([
    getTranslations("public.home"),
    getTranslations("public.brand"),
    getTranslations("public.faqDefault"),
    getTranslations("common"),
    getLocale(),
    serverApi(),
    getCountryId(),
    siteImages(),
  ]);
  const [home, faqGroups, ...rows] = await Promise.all([
    load(client.GET("/api/home", { params: { query: { countryId } } })),
    load(client.GET("/api/content/faq")),
    ...SECTIONS.map((key) => loadOptional<Schema<"SettingDto">>(client.GET("/api/content/settings/{key}", { params: { path: { key: `home-${key}` } } }))),
  ]);
  const sec = Object.fromEntries(SECTIONS.map((key, i) => [key, { title: pick(locale, rows[i]?.titleEn, rows[i]?.titleAr) || undefined, body: pick(locale, rows[i]?.valueEn, rows[i]?.valueAr) || undefined }])) as Record<(typeof SECTIONS)[number], { title?: string; body?: string }>;
  const serverNow = nowMs();
  // Homepage hero edited in the admin panel; each empty field keeps the built-in text in the page's language (never the other
  // language's custom text), no record keeps the built-in hero.
  const hero = home.hero;
  const custom = (en?: string | null, ar?: string | null) => (locale === "ar" ? ar : en) || undefined;
  const heroTitle = custom(hero?.titleEn, hero?.titleAr);
  const heroSrc = hero?.imageFileId ? fileUrl(hero.imageFileId) : DEFAULT_HERO_IMAGE;

  const cmsFaq = faqGroups.flatMap((g) => g.faqs.map((f) => ({ id: f.id, q: pick(locale, f.questionEn, f.questionAr), a: pick(locale, f.answerEn, f.answerAr) })));
  const faq = (cmsFaq.length ? cmsFaq : await defaultFaq()).slice(0, 5);

  const lists = [
    { key: "live", label: sec.live.title ?? t("live"), items: home.live, icon: <Radio className="h-4 w-4" aria-hidden />, href: "/auctions?status=live&sort=ending" },
    { key: "upcoming", label: sec.upcoming.title ?? t("upcoming"), items: home.upcoming, icon: <CalendarClock className="h-4 w-4" aria-hidden />, href: "/auctions?status=upcoming" },
    { key: "ended", label: t("ended"), items: home.ended, icon: <CircleCheck className="h-4 w-4" aria-hidden />, href: "/auctions?status=ended" },
  ];
  const more = "inline-flex h-12 items-center gap-2 rounded-full border-2 border-patina/40 px-7 text-sm font-extrabold text-patina transition hover:bg-patina hover:text-white";

  return (
    <>
      {/* Full-bleed photo hero, pulled up under the floating header pill. */}
      <section className="relative -mt-[5.25rem] overflow-hidden bg-patina-900 pt-[5.25rem] text-white sm:-mt-[5.5rem] sm:pt-[5.5rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroSrc} alt={(hero?.imageFileId && custom(hero.imageAltEn, hero.imageAltAr)) || t("heroImageAlt")} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-r from-patina-900 via-patina-700/85 to-patina/20 rtl:bg-gradient-to-l" aria-hidden />
        <span className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-patina-900/60 to-transparent" aria-hidden />
        <div className="container-page relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.25fr_1fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-extrabold backdrop-blur sm:text-sm">
              <Recycle className="h-4 w-4 shrink-0 text-lime" aria-hidden />
              {custom(hero?.badgeEn, hero?.badgeAr) ?? t("badge")}
            </span>
            <h1 className="mt-6 text-[length:var(--text-display)] font-black leading-[var(--text-display--line-height)] sm:mt-7">
              {heroTitle
                ? parseHeroTitle(heroTitle).map((line, i) => (
                    <span key={i} className={i > 0 ? "block" : undefined}>
                      {line.map((s, j) => <span key={j} className={heroTones[s.tone]}>{s.text}</span>)}
                    </span>
                  ))
                : t.rich("heroTitle", {
                    hl: (chunks) => <span className="text-lime">{chunks}</span>,
                    dot: (chunks) => <span className="text-orange">{chunks}</span>,
                    line: (chunks) => <span className="block">{chunks}</span>,
                    accent: (chunks) => <span className="text-cyan">{chunks}</span>,
                  })}
            </h1>
            <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-8 text-white/85 sm:text-lg sm:leading-9">{custom(hero?.leadEn, hero?.leadAr) ?? t("heroLead")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <HeroLink href={hero?.primaryCtaUrl || "/auctions?status=live"} className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-lime px-8 py-4 font-extrabold text-patina-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:brightness-105 motion-reduce:transform-none">
                <Gavel className="h-5 w-5" aria-hidden />
                {custom(hero?.primaryCtaEn, hero?.primaryCtaAr) ?? t("heroBrowse")}
              </HeroLink>
              <HeroLink href={hero?.secondaryCtaUrl || "/about"} className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/40 px-8 py-4 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/10 motion-reduce:transform-none">
                {custom(hero?.secondaryCtaEn, hero?.secondaryCtaAr) ?? t("heroHow")}
              </HeroLink>
            </div>
            {(hero?.showSearch ?? true) && (
              <form action="/auctions" role="search" className="mt-9 flex max-w-xl items-center gap-2 rounded-2xl bg-surface p-2 shadow-2xl shadow-black/25">
                <label className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
                  <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
                  <span className="sr-only">{tc("search")}</span>
                  <input name="q" type="search" placeholder={t("searchPlaceholder")} className="w-full min-w-0 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted" />
                </label>
                <button type="submit" className="shrink-0 rounded-xl bg-patina px-6 py-3 font-extrabold text-white transition hover:bg-patina-700 sm:px-8">
                  {t("searchBtn")}
                </button>
              </form>
            )}
          </div>

          {/* Glass card: the tagline and live count over the photo. */}
          <div className="hidden justify-end lg:flex">
            <div className="w-full max-w-sm rounded-3xl border border-white/25 bg-white/10 p-7 shadow-2xl backdrop-blur-md">
              <p className="text-sm font-bold text-lime">{t("liveNow", { count: home.stats.liveAuctions })}</p>
              <p className="mt-2 text-2xl font-black">{custom(hero?.cardTitleEn, hero?.cardTitleAr) ?? tb("tagline")}</p>
              <p className="mt-3 text-sm leading-7 text-white/80">{tb("purposeTitle")}</p>
              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 text-center">
                {[
                  [home.stats.liveAuctions, t("statLive")],
                  [home.categories.length, t("statCategories")],
                  [home.stats.totalBids, t("statBids")],
                ].map(([v, l]) => (
                  <div key={l as string}>
                    <dd className="tabular text-2xl font-black">{number(v as number, locale)}</dd>
                    <dt className="mt-1 text-[11px] leading-tight text-white/75">{l as string}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Auctions: status tabs, material chips, cards. */}
      <section className="container-page py-14 sm:py-16">
        <SectionTitle kicker={t("liveKicker")} title={t("auctionsTitle")} center />
        {home.categories.length > 0 && (
          <nav aria-label={sec.categories.title ?? t("categories")} className="mb-8 flex flex-wrap justify-center gap-2">
            <Link href="/auctions" className="inline-flex h-10 items-center gap-2 rounded-xl bg-patina px-4 text-sm font-bold text-white">
              {t("allCategories")}
              <span className="tabular rounded-full bg-white/20 px-2 text-xs">{home.categories.reduce((n, c) => n + c.count, 0)}</span>
            </Link>
            {home.categories.map((c) => (
              <Link key={c.id} href={`/auctions?category=${c.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-bold text-ink-2 transition hover:border-patina/40 hover:text-patina">
                {pick(locale, c.titleEn, c.titleAr)}
                <span className="tabular rounded-full bg-patina-50 px-2 text-xs text-patina-700">{c.count}</span>
              </Link>
            ))}
          </nav>
        )}
        <AuctionTabs
          label={t("tabsLabel")}
          initial={lists.find((l) => l.items.length > 0)?.key ?? "live"}
          tabs={lists.map((l) => ({
            key: l.key,
            label: l.label,
            count: l.items.length,
            icon: l.icon,
            content: (
              <>
                {l.items.length ? <AuctionGrid items={l.items} serverNow={serverNow} /> : <EmptyState icon={<Gavel className="h-8 w-8" />} title={t("tabEmpty")} />}
                <div className="mt-10 flex justify-center">
                  <Link href={l.items.length ? l.href : "/auctions"} className={more}>
                    {t("browseAll")}
                    <ArrowLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
                  </Link>
                </div>
              </>
            ),
          }))}
        />
      </section>

      {home.sliders.length > 0 && (
        <section className="container-page mb-14" aria-label={t("announcements")}>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {home.sliders.map((s) => {
              const img = (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileUrl(s.imageFileId)} alt={s.title ?? ""} className="aspect-[16/5] w-full rounded-2xl object-cover" />
              );
              return (
                <div key={s.id} className="w-full shrink-0 snap-start">
                  {s.link ? s.link.startsWith("/") ? <Link href={s.link}>{img}</Link> : <a href={s.link} rel="noopener noreferrer">{img}</a> : img}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Purpose: message, mission, vision. */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page">
          <SectionTitle kicker={tb("tagline")} title={tb("purposeTitle")} body={tb("purposeBody")} center />
          <PurposeCards />
        </div>
      </section>

      {/* Why eRecycleHUB + the 9 Rs. */}
      <section className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2">
        <div className="relative grid grid-cols-2 gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img("home-why-1").src} alt={img("home-why-1").alt} loading="lazy" className="row-span-2 h-full min-h-80 w-full rounded-3xl object-cover" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img("home-why-2").src} alt={img("home-why-2").alt} loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img("home-why-3").src} alt={img("home-why-3").alt} loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover" />
          <span className="absolute -bottom-5 start-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full border-4 border-ground bg-lime text-patina-900 shadow-lg rtl:translate-x-1/2" aria-hidden>
            <Recycle className="h-9 w-9" />
          </span>
        </div>
        <div>
          <SectionTitle kicker={tb("tagline")} title={tb("why.title")} />
          <div className="-mt-4 space-y-4 leading-8 text-ink-2">
            <p>{tb("why.p1")}</p>
            <p>{tb("why.p2")}</p>
          </div>
          <RStrip className="mt-7" />
          <Link href="/services" className={`${more} mt-8`}>
            {tb("why.more")}
            <ArrowLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20">
        <AuctionTypes />
      </section>

      {home.steps.length > 0 && (
        <section className="bg-surface py-16 sm:py-20">
          <div className="container-page">
            <SectionTitle kicker={t("stepsKicker")} title={sec.steps.title ?? t("steps")} body={sec.steps.body ?? t("stepsBody")} center />
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {home.steps.slice(0, 4).map((s, i) => (
                <li key={s.id} className="relative rounded-2xl border border-line bg-ground p-7">
                  <span className="tabular grid h-12 w-12 place-items-center rounded-xl bg-patina text-lg font-black text-white">{i + 1}</span>
                  <h3 className="mt-5 text-lg font-black">{pick(locale, s.titleEn, s.titleAr)}</h3>
                  <RichHtml html={pick(locale, s.descEn, s.descAr)} className="mt-2 text-sm leading-7" />
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {home.announcements.length > 0 && (
        <section className="container-page py-16">
          <SectionTitle title={t("announcements")} />
          <ul className="grid gap-4 sm:grid-cols-2">
            {home.announcements.map((a) => (
              <li key={a.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fileUrl(a.imageFileId)} alt="" loading="lazy" className="aspect-[16/6] w-full rounded-2xl border border-line object-cover" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionTitle kicker={tf("kicker")} title={tf("title")} body={tf("body")} />
          <Link href="/faq" className={`${more} -mt-2`}>
            {t("faqMore")}
            <ArrowLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
          </Link>
        </div>
        <FaqAccordion items={faq} />
      </section>

      <NumbersBand
        title={t("numbersTitle")}
        stats={[
          { icon: Gavel, value: number(home.stats.liveAuctions, locale), label: t("statLive") },
          { icon: Layers, value: number(home.categories.length, locale), label: t("statCategories") },
          { icon: Users, value: number(home.stats.totalBids, locale), label: t("statBids") },
          { icon: Store, value: number(home.stats.stores, locale), label: t("statStores") },
        ]}
      />

      {/* Closing: the partnership promise and the seller call to action. */}
      <section className="container-page pt-16 sm:pt-20">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-patina-900 text-white lg:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img("home-closing").src} alt={img("home-closing").alt} loading="lazy" className="h-64 w-full object-cover lg:h-full" />
          <div className="relative p-8 sm:p-12">
            <span className="text-sm font-extrabold text-lime">{t("closingKicker")}</span>
            <p className="mt-3 text-xl font-black leading-9 sm:text-2xl sm:leading-10">{t("closingBody")}</p>
            <p className="mt-4 leading-8 text-white/80">{t("closingBody2")}</p>
            <div className="mt-8 rounded-2xl bg-white/10 p-6">
              <h2 className="text-lg font-black">{sec.seller.title ?? t("sellerTitle")}</h2>
              <p className="mt-2 text-sm leading-7 text-white/80">{sec.seller.body ?? t("sellerBody")}</p>
              <Link href="/apply" className="mt-5 inline-flex items-center rounded-xl bg-lime px-7 py-3.5 font-black text-patina-900 transition hover:brightness-105">
                {t("sellerCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
