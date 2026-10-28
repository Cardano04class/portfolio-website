import type { MetadataRoute } from "next";
import { projects } from "@/app/data/projects";
import { SITE_URL } from "@/app/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    return ["/", "/projects", ...projects.map((p) => `/projects/${p.slug}`)].map((path) => ({
        url: new URL(path, SITE_URL).toString(),
    }));
}
