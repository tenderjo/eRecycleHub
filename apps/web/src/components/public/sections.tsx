import { Compass, Eye, Lock, Megaphone, Plus, Target, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { RichHtml } from "@/components/rich-html";
import { cn } from "@/lib/format";

/** Values of a keyed message object ({ a: {...}, b: {...} }) in catalogue order. Objects, not arrays, so admins can override each text. */
export const entries = <T,>(raw: unknown) => Object.entries(raw as Record<string, T>);

export function Kicker({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-extrabold", light ? "text-cyan" : "text-patina")}>
      <span className={cn("h-1.5 w-6 rounded-full", light ? "bg-cyan" : "bg-lime")} aria-hidden />
      {children}
    </span>
  );
}

export function SectionTitle({ kicker, title, body, center, light, action }: { kicker?: string; title: string; body?: string; center?: boolean; light?: boolean; action?: ReactNode }) {
  return (
    <div className={cn("mb-10 flex flex-wrap items-end justify-between gap-4", center && "flex-col items-center text-center")}>
      <div className={cn(center && "max-w-2xl")}>
        {kicker && <Kicker light={light}>{kicker}</Kicker>}
        <h2 className={cn("mt-3 text-2xl font-black sm:text-[2rem]", light && "text-white")}>{title}</h2>
        {body && <p className={cn("mt-3 max-w-2xl leading-8", light ? "text-white/80" : "text-ink-2")}>{body}</p>}
      </div>
      {action}
    </div>
  );
}

/** Teal banner at the top of informational pages; an optional photo fades in from the end side. */
export function PageBanner({ kicker, title, description, image }: { kicker?: string; title: string; description?: string; image?: string }) {
  return (
    // Pulled up under the floating header pill (its height: 0.75rem/1rem top gap + 4.5rem).
    <section className="teal-band relative -mt-[5.25rem] overflow-hidden pt-[5.25rem] text-white sm:-mt-[5.5rem] sm:pt-[5.5rem]">
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="absolute inset-y-0 end-0 hidden h-full w-1/2 object-cover opacity-60 md:block" />
          <span className="absolute inset-y-0 end-0 hidden w-1/2 bg-gradient-to-r from-patina-900 via-patina-900/40 to-transparent md:block rtl:bg-gradient-to-l" aria-hidden />
        </>
      )}
      <div className="container-page relative py-12 sm:py-16">
        <div className="max-w-2xl">
          {kicker && <Kicker light>{kicker}</Kicker>}
          <h1 className="mt-3 text-3xl font-black sm:text-[2.6rem]">{title}</h1>
          {description && <p className="mt-4 text-base leading-8 text-white/85 sm:text-lg">{description}</p>}
        </div>
      </div>
    </section>
  );
}

const PURPOSE: { key: "message" | "mission" | "vision"; icon: LucideIcon; tone: string }[] = [
  { key: "message", icon: Megaphone, tone: "bg-purple/10 text-purple" },
  { key: "mission", icon: Target, tone: "bg-orange/10 text-orange" },
  { key: "vision", icon: Compass, tone: "bg-patina-50 text-patina" },
];

/** Our message / mission / vision. */
export async function PurposeCards() {
  const t = await getTranslations("public.brand");
  return (
    <ul className="grid gap-5 lg:grid-cols-3">
      {PURPOSE.map(({ key, icon: Icon, tone }) => (
        <li key={key} className="relative overflow-hidden rounded-2xl border border-line bg-surface p-7 shadow-raise">
          <span className={cn("grid h-14 w-14 place-items-center rounded-2xl", tone)}>
            <Icon aria-hidden />
          </span>
          <h3 className="mt-5 text-xl font-black">{t(`${key}.title`)}</h3>
          <p className="mt-3 leading-8 text-ink-2">{t(`${key}.body`)}</p>
        </li>
      ))}
    </ul>
  );
}

/** Reduce, reuse, recycle … as a row of chips. */
export async function RStrip({ className }: { className?: string }) {
  const t = await getTranslations("public.brand");
  const tones = ["bg-patina text-white", "bg-lime/20 text-patina-700", "bg-cyan/20 text-patina-900", "bg-purple/10 text-purple", "bg-orange/10 text-orange-ink", "bg-pink/10 text-pink-ink"];
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {entries<string>(t.raw("r")).map(([k, word], i) => (
        <li key={k} className={cn("rounded-full px-4 py-2 text-sm font-extrabold", tones[i % tones.length])}>
          {word}
        </li>
      ))}
    </ul>
  );
}

/** Public (open) and sealed-bid auctions. */
export async function AuctionTypes() {
  const t = await getTranslations("public.brand.types");
  const types = [
    { key: "public", icon: Eye, card: "bg-patina-700 text-white", tile: "bg-white/15 text-white", body: "text-white" },
    { key: "sealed", icon: Lock, card: "bg-surface border border-line", tile: "bg-purple/10 text-purple", body: "text-ink-2" },
  ] as const;
  return (
    <>
      <SectionTitle kicker={t("kicker")} title={t("title")} center />
      <ul className="grid gap-5 md:grid-cols-2">
        {types.map(({ key, icon: Icon, card, tile, body }) => (
          <li key={key} className={cn("rounded-2xl p-8 shadow-raise", card)}>
            <span className={cn("grid h-14 w-14 place-items-center rounded-2xl", tile)}>
              <Icon aria-hidden />
            </span>
            <h3 className="mt-5 text-xl font-black">{t(`${key}.title`)}</h3>
            <p className={cn("mt-3 leading-8", body)}>{t(`${key}.body`)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Icon tile + title + text, for the long feature/benefit lists. */
export function FeatureGrid({ items, icons, cols = "lg:grid-cols-3" }: { items: [string, { t: string; d: string }][]; icons: LucideIcon[]; cols?: string }) {
  const tones = ["bg-patina-50 text-patina", "bg-purple/10 text-purple", "bg-orange/10 text-orange", "bg-cyan/20 text-patina-900", "bg-lime/20 text-patina-700", "bg-pink/10 text-pink"];
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2", cols)}>
      {items.map(([k, it], i) => {
        const Icon = icons[i % icons.length];
        return (
          <li key={k} className="rounded-2xl border border-line bg-surface p-6 shadow-raise transition hover:-translate-y-0.5 hover:shadow-pop motion-reduce:transform-none">
            <span className={cn("grid h-12 w-12 place-items-center rounded-xl", tones[i % tones.length])}>
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-4 text-lg font-black">{it.t}</h3>
            <p className="mt-2 text-sm leading-7 text-ink-2">{it.d}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** Accordion rows (native details/summary). Answers may be sanitised HTML from the CMS. */
export function FaqAccordion({ items }: { items: { id: string | number; q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details key={f.id} className="group rounded-2xl border border-line bg-surface shadow-sm open:shadow-raise">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-extrabold [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-patina transition group-open:rotate-45 group-open:bg-patina group-open:text-white motion-reduce:transition-none">
              <Plus className="h-4 w-4" aria-hidden />
            </span>
          </summary>
          <RichHtml html={f.a} className="px-5 pb-5 text-sm leading-7 text-ink-2" />
        </details>
      ))}
    </div>
  );
}

/** The documented FAQ, used wherever no questions have been published in the CMS yet. */
export async function defaultFaq() {
  const t = await getTranslations("public.faqDefault");
  return entries<{ q: string; a: string }>(t.raw("items")).map(([id, f]) => ({ id, q: f.q, a: f.a }));
}

/** Teal strip of headline figures. */
export function NumbersBand({ title, stats }: { title: string; stats: { icon: LucideIcon; value: string; label: string }[] }) {
  return (
    <section className="teal-band relative overflow-hidden py-16 text-white sm:py-20">
      <Users className="pointer-events-none absolute -bottom-10 -start-10 h-56 w-56 text-white/5" aria-hidden />
      <div className="container-page relative">
        <h2 className="text-center text-2xl font-black sm:text-[2rem]">{title}</h2>
        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <li key={label} className="flex flex-col items-center rounded-2xl border border-white/15 bg-white/5 px-4 py-8 text-center backdrop-blur-sm">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-patina">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <span className="tabular mt-5 text-3xl font-black sm:text-4xl">{value}</span>
              <span className="mt-1 text-sm text-white/80">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
