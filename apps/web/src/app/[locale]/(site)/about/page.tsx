import { CircleCheck, Coins, Leaf, Link2, SearchX, Unplug, UserX, Users, Waypoints } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { FeatureGrid, Kicker, PageBanner, PurposeCards, SectionTitle, entries } from "@/components/public/sections";
import { RichHtml } from "@/components/rich-html";
import { Link } from "@/i18n/navigation";
import { load, serverApi } from "@/lib/api/server";
import { cn, fileUrl, number, pick } from "@/lib/format";
import { alternates } from "@/lib/seo";
import { siteImages, type SiteImageSlot } from "@/lib/site-images";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("public.about"), getLocale()]);
  return { title: t("title"), description: t("overview.p1"), alternates: alternates(locale, "/about") };
}

const IMPACT = [
  { key: "env", icon: Leaf, tone: "bg-lime/20 text-patina-700" },
  { key: "econ", icon: Coins, tone: "bg-orange/10 text-orange" },
  { key: "social", icon: Users, tone: "bg-purple/10 text-purple" },
] as const;

export default async function AboutPage() {
  const [t, tc, locale, client, photo] = await Promise.all([getTranslations("public.about"), getTranslations("common"), getLocale(), serverApi(), siteImages()]);
  // Sections written in Admin > About still appear, below the documented company profile.
  const sections = await load(client.GET("/api/content/about"));
  const problems = entries<{ t: string; d: string }>(t.raw("problem.items"));
  const img = (slot: SiteImageSlot, className: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo(slot).src} alt={photo(slot).alt} loading="lazy" className={cn("w-full rounded-3xl object-cover", className)} />
  );

  return (
    <>
      <PageBanner kicker={t("kicker")} title={t("title")} description={t("lead")} image={photo("about-banner").src} />

      <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 leading-8 text-ink-2">
          <Kicker>{t("kicker")}</Kicker>
          <p className="text-lg font-bold leading-9 text-ink">{t("overview.p1")}</p>
          <p>{t("overview.p2")}</p>
          <p>{t("overview.p3")}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {img("about-intro-1", "aspect-[3/4]")}
          {img("about-intro-2", "mt-10 aspect-[3/4]")}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-page">
          <SectionTitle title={t("categoriesTitle")} body={t("categoriesBody")} center />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries<string>(t.raw("categories")).map(([k, label], i) => (
              <li key={k} className="flex items-center gap-3 rounded-2xl border border-line bg-ground p-4 font-bold">
                <span className="tabular grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-patina text-sm font-black text-white">{String(i + 1).padStart(2, "0")}</span>
                {label}
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-10 max-w-3xl space-y-4 text-center leading-8 text-ink-2">
            <p>{t("overview.p4")}</p>
            <p>{t("overview.p5")}</p>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <PurposeCards />
      </section>

      <section className="container-page grid items-center gap-12 pb-16 lg:grid-cols-2">
        {img("about-gap", "aspect-[4/3]")}
        <div>
          <SectionTitle title={t("gap.title")} />
          <div className="-mt-4 space-y-4 leading-8 text-ink-2">
            <p>{t("gap.p1")}</p>
            <p>{t("gap.p2")}</p>
            <p>{t("gap.p3")}</p>
          </div>
        </div>
      </section>

      {/* Jordan: the figures, the scenario and the problem statement. */}
      <section className="teal-band py-16 text-white sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionTitle title={t("jordan.title")} light />
            <div className="-mt-4 grid grid-cols-2 gap-4">
              {[
                [t("jordan.stat1"), t("jordan.stat1Label")],
                [t("jordan.stat2"), t("jordan.stat2Label")],
              ].map(([v, l]) => (
                <div key={v} className="rounded-2xl border border-white/15 bg-white/5 p-6">
                  <p className="tabular text-4xl font-black text-lime">{v}</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 leading-8 text-white/85">
            <p>{t("jordan.p1")}</p>
            <p>{t("jordan.p2")}</p>
            <h3 className="pt-4 text-xl font-black text-white">{t("scenario.title")}</h3>
            <p>{t("scenario.p1")}</p>
            <p>{t("scenario.p2")}</p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionTitle title={t("problem.title")} body={t("problem.intro")} center />
        <FeatureGrid items={problems} icons={[Unplug, Link2, SearchX, Waypoints, UserX]} />
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page">
          <SectionTitle title={t("priority.title")} body={t("priority.body")} center />
          <div className="grid gap-5 lg:grid-cols-3">
            {IMPACT.map(({ key, icon: Icon, tone }) => (
              <div key={key} className="rounded-2xl border border-line bg-ground p-7">
                <span className={cn("grid h-12 w-12 place-items-center rounded-xl", tone)}>
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-black">{t(`priority.${key}.title`)}</h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-ink-2">
                  {entries<string>(t.raw(`priority.${key}`))
                    .filter(([k]) => k !== "title")
                    .map(([k, line]) => (
                      <li key={k} className="flex gap-2">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-patina" aria-hidden />
                        {line}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionTitle title={t("solution.title")} body={t("solution.intro")} />
          <ul className="-mt-2 space-y-3">
            {entries<string>(t.raw("solution.items")).map(([k, line]) => (
              <li key={k} className="flex gap-3 leading-7 text-ink-2">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-patina" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-2xl bg-patina-50 p-5 font-bold leading-8 text-patina-700">{t("solution.outro")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auctions" className="inline-flex h-12 items-center rounded-xl bg-patina px-6 font-extrabold text-white hover:bg-patina-700">{tc("nav.auctions")}</Link>
            <Link href="/services" className="inline-flex h-12 items-center rounded-xl border border-patina/40 px-6 font-extrabold text-patina hover:bg-patina-50">{tc("nav.services")}</Link>
          </div>
        </div>
        {img("about-solution", "aspect-square")}
      </section>

      {sections.length > 0 && (
        <section className="container-page space-y-12 pb-8">
          <SectionTitle title={t("cmsTitle")} />
          {sections.map((s, i) => (
            <div key={s.id} className="grid items-start gap-8 lg:grid-cols-2">
              <div className={i % 2 ? "lg:order-2" : undefined}>
                {pick(locale, s.titleEn, s.titleAr) && <h3 className="text-2xl font-black">{pick(locale, s.titleEn, s.titleAr)}</h3>}
                <RichHtml html={pick(locale, s.descEn, s.descAr)} className="mt-3" />
                {s.totalBidders ? <p className="tabular mt-5 inline-block rounded-xl bg-patina-50 px-3 py-2 font-bold text-patina-700">{t("bidders", { count: number(s.totalBidders, locale) })}</p> : null}
              </div>
              <div className="grid gap-4">
                {[s.firstImageFileId, s.secondImageFileId].filter(Boolean).map((id) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={id} src={fileUrl(id)} alt="" loading="lazy" className="w-full rounded-2xl border border-line object-cover" />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
