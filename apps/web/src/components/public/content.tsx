import type { ReactNode } from "react";
import { PageBanner } from "./sections";

/** Standard banner + width for informational pages. */
export function ContentPage({ title, description, children, wide }: { title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <>
      <PageBanner title={title} description={description} />
      <div className="container-page py-12">
        <div className={wide ? undefined : "max-w-3xl"}>{children}</div>
      </div>
    </>
  );
}
