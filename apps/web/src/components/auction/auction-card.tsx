import { Eye, Gavel, ImageOff, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { AuctionCard as Card, AuctionPhase } from "@/lib/api/types";
import { cn, date, fileUrl, money, number, pick, time } from "@/lib/format";
import { Badge, type Tone } from "@/components/ui/display";
import { Countdown } from "./countdown";
import { FavoriteButton } from "./toggles";

export const phaseTone: Record<AuctionPhase, Tone> = { Live: "live", Upcoming: "upcoming", Ended: "ended" };

export function PhaseBadge({ phase, className }: { phase: AuctionPhase; className?: string }) {
  const t = useTranslations("common.phase");
  return (
    <Badge tone={phaseTone[phase]} className={className}>
      {phase === "Live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-patina motion-reduce:animate-none" aria-hidden />}
      {t(phase)}
    </Badge>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="tabular mt-1 truncate text-sm font-extrabold text-ink">{children}</dd>
    </div>
  );
}

function When({ label, iso, fallback }: { label: string; iso: string | null; fallback: string }) {
  const locale = useLocale();
  return (
    <div className="flex min-w-0 flex-col items-center px-2 text-center">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="tabular mt-1 text-xs font-extrabold text-ink">{iso ? date(iso, locale) : fallback}</dd>
      {iso && <dd className="tabular text-[11px] text-muted">{time(iso, locale)}</dd>}
    </div>
  );
}

/**
 * A lot ticket: the photo with a countdown tab on its lower edge, the reference, category and seller, the key figures
 * (starting price, insurance, increment, bids), the current price with the start/end dates, and the actions.
 */
export function AuctionCard({ a, serverNow, className }: { a: Card; serverNow: number; className?: string }) {
  const t = useTranslations("auction.card");
  const locale = useLocale();
  const title = pick(locale, a.titleEn, a.titleAr);
  const href = `/auctions/${a.id}`;
  const ended = a.phase === "Ended";
  const logo = fileUrl(a.publisher?.logoFileId);
  return (
    <article className={cn("group relative flex flex-col rounded-2xl border border-line bg-surface shadow-raise transition hover:-translate-y-1 hover:shadow-pop motion-reduce:transform-none", className)}>
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden className="block aspect-[16/10] overflow-hidden rounded-t-2xl bg-sunken">
          {a.mainImageFileId ? (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded files are served by the API with long-lived caching
            <img src={fileUrl(a.mainImageFileId)} alt="" loading="lazy" decoding="async" className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none", ended && "grayscale-[35%]")} />
          ) : (
            <span className="flex h-full items-center justify-center text-muted">
              <ImageOff className="h-8 w-8" />
            </span>
          )}
        </Link>
        <PhaseBadge phase={a.phase} className="absolute start-3 top-3 shadow-sm" />
        <div className="absolute end-3 top-3 z-10">
          <FavoriteButton auctionId={a.id} initial={a.isFavorite} />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-1/2 justify-center px-4">
          {ended ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-extrabold text-white shadow-lg">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              {t("closed")}
            </span>
          ) : (
            <Countdown target={a.phase === "Upcoming" ? a.startsAtUtc : a.endsAtUtc} serverNow={serverNow} mode={a.phase === "Upcoming" ? "start" : "end"} size="card" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-12">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="tabular text-[11px] font-bold tracking-wide text-muted">{t("lot", { ref: a.refNumber })}</p>
            {a.category && <p className="mt-0.5 text-xs font-extrabold text-patina">{pick(locale, a.category.titleEn, a.category.titleAr)}</p>}
            <h3 className="mt-1.5 line-clamp-2 text-base font-black leading-snug">
              <Link href={href} className="hover:text-patina focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                {title}
              </Link>
            </h3>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface" title={a.publisher?.name ?? t("platform")}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={a.publisher?.name ?? ""} className="h-full w-full object-contain p-1" />
            ) : (
              <span className="text-sm font-black text-patina" aria-label={a.publisher?.name ?? t("platform")}>
                {(a.publisher?.name ?? t("platform")).slice(0, 2).toUpperCase()}
              </span>
            )}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4">
          <Fact label={t("startPrice")}>{money(a.startPrice, locale)}</Fact>
          <Fact label={t("insurance")}>{a.insuranceAmount > 0 ? money(a.insuranceAmount, locale) : "—"}</Fact>
          <Fact label={t("increment")}>{money(a.bidIncrement, locale)}</Fact>
          <Fact label={t("bidsLabel")}>
            <span className="inline-flex items-center gap-1">
              <Gavel className="h-3.5 w-3.5 text-lime" aria-hidden />
              {number(a.bidCount, locale)}
            </span>
          </Fact>
        </dl>

        <dl className="mt-4 grid grid-cols-3 items-center divide-x divide-line rounded-xl border border-line py-3 rtl:divide-x-reverse">
          <div className="flex min-w-0 flex-col items-center px-2 text-center">
            <dt className="text-[11px] text-muted">{a.bidCount > 0 ? t("currentBid") : t("startingBid")}</dt>
            <dd className="tabular mt-1 rounded-full bg-patina-50 px-2.5 py-1 text-xs font-black text-patina-700">{money(a.currentPrice, locale)}</dd>
          </div>
          <When label={t("starts")} iso={a.startsAtUtc} fallback="—" />
          <When label={t("ends")} iso={a.endsAtUtc} fallback={t("noEnd")} />
        </dl>

        <div className={cn("mt-4 grid gap-2", a.phase === "Live" && "grid-cols-2")}>
          <Link href={href} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-patina/40 text-sm font-extrabold text-patina transition hover:bg-patina-50">
            <Eye className="h-4 w-4" aria-hidden />
            {t("details")}
          </Link>
          {a.phase === "Live" && (
            <Link href={`${href}#bid`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-patina text-sm font-extrabold text-white shadow-[0_8px_20px_#087b7030] transition hover:bg-patina-700">
              <Gavel className="h-4 w-4" aria-hidden />
              {t("bidNow")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function AuctionGrid({ items, serverNow, className }: { items: Card[]; serverNow: number; className?: string }) {
  return (
    <ul className={cn("grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3", className)}>
      {items.map((a) => (
        <li key={a.id} className="flex">
          <AuctionCard a={a} serverNow={serverNow} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
