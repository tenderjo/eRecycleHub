import "server-only";
import { getLocale } from "next-intl/server";
import { loadPublicOptional, serverApi } from "@/lib/api/server";
import { fileUrl, pick } from "@/lib/format";

/** Photo slots on the public pages, replaceable in Admin > Page images (stored as settings keyed "image-<slot>"). */
export const SITE_IMAGES = {
  "home-why-1": "/images/content/steel-profiles.jpg",
  "home-why-2": "/images/content/tanks.jpg",
  "home-why-3": "/images/content/metal-parts.jpg",
  "home-closing": "/images/content/machinery.jpg",
  "about-banner": "/images/content/pipes.jpg",
  "about-intro-1": "/images/content/drums.jpg",
  "about-intro-2": "/images/content/vessels.jpg",
  "about-gap": "/images/content/compressors.jpg",
  "about-solution": "/images/content/steel-brackets.jpg",
  "services-banner": "/images/content/crane.jpg",
  "auctions-banner": "/images/content/hero-scrap-bales.jpg",
} as const;

export type SiteImageSlot = keyof typeof SITE_IMAGES;

/** Resolver for this request: the uploaded photo (and its alt text) for a slot, or the bundled default. */
export async function siteImages() {
  const [client, locale] = await Promise.all([serverApi(), getLocale()]);
  const rows = (await loadPublicOptional(client.GET("/api/content/images")).catch(() => null)) ?? [];
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return (slot: SiteImageSlot) => {
    const r = byKey.get(`image-${slot}`);
    return r?.imageFileId ? { src: fileUrl(r.imageFileId) ?? SITE_IMAGES[slot], alt: pick(locale, r.titleEn, r.titleAr) ?? "" } : { src: SITE_IMAGES[slot], alt: "" };
  };
}
