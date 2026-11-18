import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { ContentPage } from "@/components/public/content";
import { RichHtml } from "@/components/rich-html";
import { FeatureGrid, entries } from "@/components/public/sections";
import { BadgeDollarSign, BarChart3, Gauge, Globe2, HeartHandshake, Recycle, Scale } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { load, serverApi } from "@/lib/api/server";
import { fileUrl, pick } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("public.benefits"), getLocale()]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale, "/benefits") };
}

export default async function BenefitsPage() {
  const [t, ts, tc, locale, client] = await Promise.all([getTranslations("public.benefits"), getTranslations("public.services"), getTranslations("common"), getLocale(), serverApi()]);
  const items = await load(client.GET("/api/content/benefits"));
  return (
    <ContentPage title={t("title")} description={t("description")} wide>
      {items.length === 0 ? (
        // Nothing written in Admin > Benefits yet: show the documented "value we deliver" list.
        <FeatureGrid items={entries<{ t: string; d: string }>(ts.raw("value.items"))} icons={[Globe2, Scale, BadgeDollarSign, Gauge, Recycle, BarChart3, HeartHandshake]} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <li key={b.id} className="rounded-2xl border border-line bg-surface p-6 shadow-raise">
              {b.iconFileId && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileUrl(b.iconFileId)} alt="" className="mb-3 h-12 w-12 rounded-md" />
              )}
              <h2 className="text-lg font-semibold">{pick(locale, b.titleEn, b.titleAr)}</h2>
              <RichHtml html={pick(locale, b.descEn, b.descAr)} className="mt-1 text-sm" />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/register" className="inline-flex h-11 items-center rounded-xl bg-patina px-4 font-medium text-white hover:bg-patina-700">{tc("user.register")}</Link>
        <Link href="/apply" className="inline-flex h-11 items-center rounded-xl border border-line-strong bg-surface px-4 font-medium hover:bg-sunken">{tc("nav.apply")}</Link>
      </div>
    </ContentPage>
  );
}
