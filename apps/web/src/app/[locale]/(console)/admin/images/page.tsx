import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cmsLabels } from "@/components/admin/cms-labels";
import { CmsManager } from "@/components/admin/cms-manager";
import { PageHeader } from "@/components/ui/display";
import { load, serverApi } from "@/lib/api/server";
import { SITE_IMAGES, type SiteImageSlot } from "@/lib/site-images";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("cms.images"))("title") };
}

/** Photos on the public pages: settings keyed "image-<slot>" with a picture (see lib/site-images). */
export default async function Page() {
  const [t, f, client, labels] = await Promise.all([getTranslations("cms.images"), getTranslations("cms.images.fields"), serverApi(), cmsLabels("images")]);
  const rows = (await load(client.GET("/api/admin/settings"))).filter((r) => r.key.startsWith("image-"));
  const slots = (Object.keys(SITE_IMAGES) as SiteImageSlot[]).map((s) => ({ value: `image-${s}`, label: t(`slots.${s}`) }));
  const slotLabels = Object.fromEntries(slots.map((s) => [s.value, s.label]));
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <CmsManager
        path="/api/admin/settings"
        multipart={true}
        labels={labels}
        titleKeys={["key"]}
        defaults={{ key: slots[0].value }}
        fields={[
          { name: "key", label: f("slot"), kind: "select", required: true, options: slots },
          { name: "image", label: f("image"), kind: "file", current: "imageFileId", hint: f("imageHint") },
          { name: "titleEn", label: f("altEn"), kind: "text", hint: f("altHint") },
          { name: "titleAr", label: f("altAr"), kind: "text", rtl: true, hint: f("altHint") },
        ]}
        columns={[
          { key: "imageFileId", label: f("image"), kind: "file" },
          { key: "key", label: f("slot"), kind: "option", options: slotLabels },
        ]}
        rows={rows}
      />
    </>
  );
}
