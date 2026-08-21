import projectsData from "../projects.json";
import type { ProjectPreview } from "../../types";

const thumbnails = import.meta.glob("../../../assets/thumbnails/*.{webp,png,jpg}", { eager: true, import: "default" }) as Record<string, string>;

function getThumbnail(key: string): string {
  for (const [path, url] of Object.entries(thumbnails)) {
    if (path.includes(`/${key}.`)) return url;
  }
  return "";
}

function getPreviewsForLocale(lang: "de" | "en"): ProjectPreview[] {
  return projectsData.map((p) => ({
    title: p.title,
    slug: p.slug,
    thumbnail: getThumbnail(p.thumbnailKey),
    description: p.previewDescription[lang] || p.previewDescription.en,
  }));
}

export const previews = {
  de: () => Promise.resolve({ default: getPreviewsForLocale("de") }),
  en: () => Promise.resolve({ default: getPreviewsForLocale("en") }),
};
