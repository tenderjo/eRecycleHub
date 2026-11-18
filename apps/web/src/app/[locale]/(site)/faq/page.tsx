import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { ContentPage } from "@/components/public/content";
import { FaqList } from "@/components/public/public-forms";
import { defaultFaq } from "@/components/public/sections";
import { Link } from "@/i18n/navigation";
import { load, serverApi } from "@/lib/api/server";
import { pick } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("public.faq"), getLocale()]);
  return { title: t("title"), description: t("description"), alternates: alternates(locale, "/faq") };
}

export default async function FaqPage() {
  const [t, locale, client] = await Promise.all([getTranslations("public.faq"), getLocale(), serverApi()]);
  const [cms, tf] = await Promise.all([load(client.GET("/api/content/faq")), getTranslations("public.faqDefault")]);
  // Until questions are published in the CMS, the documented FAQ is shown.
  const groups = cms.length
    ? cms.map((g) => ({ id: g.id, title: pick(locale, g.titleEn, g.titleAr), faqs: g.faqs.map((f) => ({ id: f.id, question: pick(locale, f.questionEn, f.questionAr), answer: pick(locale, f.answerEn, f.answerAr) })) }))
    : [{ id: 0, title: tf("group"), faqs: (await defaultFaq()).map((f, i) => ({ id: i, question: f.q, answer: f.a })) }];
  return (
    <ContentPage title={t("title")} description={t("description")}>
      <FaqList groups={groups} />
      <p className="mt-10 text-ink-2">
        {t("stillNeed")}{" "}
        <Link href="/contact" className="font-medium text-patina hover:underline">{t("contact")}</Link>
      </p>
    </ContentPage>
  );
}
