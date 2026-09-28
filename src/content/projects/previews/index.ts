import projectsData from "../projects.json";
import { resolveThumbnail } from "../assetResolver";
import type { ProjectPreview } from "../../types";

function getPreviewsForLocale(lang: "de" | "en"): ProjectPreview[] {
  return projectsData.map((p) => ({
    title: p.title,
    slug: p.slug,
    thumbnail: resolveThumbnail(p.id, p.thumbnailKey),
    description: p.previewDescription[lang] || p.previewDescription.en,
  }));
}

export const previews = {
  de: () => Promise.resolve({ default: getPreviewsForLocale("de") }),
  en: () => Promise.resolve({ default: getPreviewsForLocale("en") }),
};
