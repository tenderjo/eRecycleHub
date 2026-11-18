import {
  BadgeDollarSign, BarChart3, Boxes, ChartLine, ClipboardList, Cpu, Database, FileBarChart, Gauge, Globe2, Handshake, HeartHandshake, Layers,
  Leaf, LineChart, Lock, MapPin, Megaphone, Network, Recycle, Scale, Search, ShieldCheck, Sprout, Store, TrendingUp, Users, Workflow,
} from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { AuctionTypes, FeatureGrid, PageBanner, RStrip, SectionTitle, entries } from "@/components/public/sections";
import { Link } from "@/i18n/navigation";
import { alternates } from "@/lib/seo";
import { siteImages } from "@/lib/site-images";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("public.services"), getLocale()]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale, "/services") };
}

type Item = { t: string; d: string };

export default async function ServicesPage() {
  const [t, tb, th, img] = await Promise.all([getTranslations("public.services"), getTranslations("public.brand"), getTranslations("public.home"), siteImages()]);
  const list = (key: string) => entries<Item>(t.raw(key));

  return (
    <>
      <PageBanner kicker={t("title")} title={t("fullTitle")} description={t("description")} image={img("services-banner").src} />

      {/* Why + approach */}
      <section className="container-page grid gap-12 py-16 lg:grid-cols-2">
        <div>
          <SectionTitle kicker={tb("tagline")} title={tb("why.title")} />
          <div className="-mt-4 space-y-4 leading-8 text-ink-2">
            <p>{tb("why.p1")}</p>
            <p>{tb("why.p2")}</p>
            <p>{tb("why.p3")}</p>
          </div>
          <RStrip className="mt-7" />
        </div>
        <div className="rounded-3xl border border-line bg-surface p-7 shadow-raise sm:p-9">
          <h2 className="text-2xl font-black">{t("approach.title")}</h2>
          <h3 className="mt-6 font-black text-patina">{t("approach.trading.title")}</h3>
          <p className="mt-2 text-sm leading-7 text-ink-2">{t("approach.trading.intro")}</p>
          <ul className="mt-4 space-y-4">
            {list("approach.trading.items").map(([k, it], i) => {
              const Icon = [Handshake, Scale, Recycle, Sprout][i];
              return (
                <li key={k} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-patina-50 text-patina">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-extrabold">{it.t}</p>
                    <p className="text-sm leading-7 text-ink-2">{it.d}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 rounded-2xl bg-patina-50 p-5">
            <h3 className="font-black text-patina-700">{t("approach.data.title")}</h3>
            <p className="mt-2 text-sm leading-7 text-ink-2">{t("approach.data.body")}</p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page">
          <SectionTitle title={t("value.title")} body={t("value.intro")} center />
          <FeatureGrid items={list("value.items")} icons={[Globe2, Scale, BadgeDollarSign, Gauge, Recycle, BarChart3, HeartHandshake]} />
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionTitle title={t("eauctions.title")} body={t("eauctions.intro")} center />
        <FeatureGrid items={list("eauctions.items")} icons={[Megaphone, Network, Leaf]} />
        <div className="mt-16">
          <AuctionTypes />
        </div>
      </section>

      <section className="teal-band py-16 text-white sm:py-20">
        <div className="container-page">
          <SectionTitle title={t("data.title")} body={t("data.intro")} light center />
          <p className="-mt-4 mb-8 text-center font-bold text-lime">{t("data.listIntro")}</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list("data.items").map(([k, it], i) => {
              const Icon = [ClipboardList, FileBarChart, Store, Layers, LineChart, Search, ChartLine, MapPin, Database, Leaf][i % 10];
              return (
                <li key={k} className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
                  <Icon className="h-6 w-6 text-lime" aria-hidden />
                  <h3 className="mt-3 font-black">{it.t}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/80">{it.d}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionTitle title={t("features.title")} center />
        <FeatureGrid items={list("features.items")} icons={[Boxes, Users, Lock, Recycle, Cpu, TrendingUp, Globe2, ShieldCheck, Handshake, Scale, BadgeDollarSign, BarChart3, Workflow]} />
      </section>

      <section className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-patina-900 p-8 text-white sm:p-12 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black">{t("insights.title")}</h2>
            <p className="mt-3 leading-8 text-white/80">{t("insights.body")}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/auctions" className="inline-flex h-12 items-center rounded-xl bg-lime px-6 font-black text-patina-900 hover:brightness-105">{th("heroBrowse")}</Link>
            <Link href="/apply" className="inline-flex h-12 items-center rounded-xl border border-white/40 px-6 font-black hover:bg-white/10">{th("sellerCta")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
