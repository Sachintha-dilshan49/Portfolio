import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.siteUrl;
  return [
    { url: base },
    { url: `${base}/projects` },
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}` })),
    { url: `${base}/achievements` },
    { url: `${base}/about` },
    { url: `${base}/contact` },
  ];
}
