"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/format";

/**
 * Ticking countdown to an absolute UTC instant. The first render uses the server's clock (`serverNow`) so the server
 * and browser output match; afterwards the browser clock is corrected by the measured skew, so a wrong device clock or
 * time zone cannot show a different remaining time. The server still decides whether a bid is accepted.
 */
export function useServerClock(serverNow: number) {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const skew = serverNow - Date.now();
    const tick = () => setNow(Date.now() + skew);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [serverNow]);
  return now;
}

export function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/** Only the largest unit that is still non-zero: days while there are any, then hours, then minutes, then seconds. */
export function lead(p: ReturnType<typeof parts>) {
  if (p.days > 0) return { n: p.days, unit: "d" as const };
  if (p.hours > 0) return { n: p.hours, unit: "h" as const };
  if (p.minutes > 0) return { n: p.minutes, unit: "m" as const };
  return { n: p.seconds, unit: "s" as const };
}

export function Countdown({
  target,
  serverNow,
  mode = "end",
  size = "sm",
  className,
  onDone,
}: {
  target: string | null | undefined;
  serverNow: number;
  mode?: "end" | "start";
  size?: "sm" | "lg" | "card";
  className?: string;
  onDone?: () => void;
}) {
  const t = useTranslations("common.countdown");
  const now = useServerClock(serverNow);
  const remaining = target ? new Date(target).getTime() - now : 0;
  const done = remaining <= 0;

  useEffect(() => {
    if (done && onDone) onDone();
  }, [done, onDone]);

  if (done && size === "card") return null;
  if (done) return <span className={cn("text-sm font-medium text-muted", className)}>{mode === "end" ? t("ended") : ""}</span>;

  const p = parts(remaining);
  const soon = mode === "end" && remaining < 60 * 60 * 1000;
  const label = `${mode === "end" ? t("endsIn") : t("startsIn")}: ${t("label", p)}`;

  const { n, unit } = lead(p);

  if (size === "card") {
    // Ticket on the edge of a card photo: a coloured "Ends in" tab over four white cells (days, hours, minutes, seconds).
    const cells = [["d", p.days], ["h", p.hours], ["m", p.minutes], ["s", p.seconds]] as const;
    return (
      <div role="timer" aria-label={label} className={cn("overflow-hidden rounded-xl bg-surface shadow-[0_12px_30px_-10px_rgb(15_47_51/0.45)]", className)}>
        <div aria-hidden className={cn("flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-extrabold text-white", soon ? "bg-rust" : mode === "start" ? "bg-info" : "bg-patina")}>
          <Clock className="h-3.5 w-3.5" />
          {mode === "end" ? t("endsIn") : t("startsIn")}
        </div>
        <div aria-hidden className="grid grid-cols-4 divide-x divide-line rtl:divide-x-reverse">
          {cells.map(([u, v]) => (
            <span key={u} className="flex flex-col items-center px-2.5 py-1.5 leading-none">
              <span className={cn("tabular text-lg font-black", soon ? "text-rust" : "text-ink", u === "d" && v === 0 && "text-muted")}>{String(v).padStart(2, "0")}</span>
              <span className="mt-1 text-[10px] text-muted">{t(`unit.${u}`, { n: v })}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (size === "lg") {
    // Days : hours : minutes : seconds, one box each (follows the page direction, so days come first in both languages).
    const boxes = [["d", p.days], ["h", p.hours], ["m", p.minutes], ["s", p.seconds]] as const;
    return (
      <div role="timer" aria-label={label} className={cn("flex gap-1.5", className)}>
        {boxes.map(([u, v]) => (
          <div key={u} aria-hidden className={cn("flex min-w-0 flex-1 flex-col items-center rounded-md px-1 py-2 text-white", soon ? "bg-rust" : "bg-patina")}>
            <span className="tabular text-2xl font-semibold leading-none">{String(v).padStart(2, "0")}</span>
            <span className="mt-1 text-xs text-white/80">{t(`unit.${u}`, { n: v })}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span role="timer" aria-label={label} className={cn("tabular inline-flex items-baseline gap-1 font-extrabold text-orange-ink", soon && "text-rust", className)}>
      <span className="sr-only">{mode === "end" ? t("endsIn") : t("startsIn")}</span>
      <bdi aria-hidden>
        {n} {t(unit)}
      </bdi>
    </span>
  );
}
