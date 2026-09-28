import projectsData from "./projects.json";
import { resolveMediaSrc } from "./assetResolver";
import type { Locale } from "../../i18n/types";

export const projectIds = projectsData.map((p) => p.id);

function getProjectsByLocale(lang: Locale) {
  const localeKey = lang === "de" ? "de" : "en";
  const result: Record<string, any> = {};

  for (const p of projectsData) {
    result[p.id] = {
      default: {
        title: p.title,
        theme: p.theme,
        tags: p.tags,
        videoBorder: p.videoBorder ?? false,
        live: p.live || undefined,
        source: p.github || undefined,
        description: p.description[localeKey] || p.description.en,
        components: p.components.map((c) => ({
          type: c.type,
          props: {
            ...c.props,
            src: resolveMediaSrc(c.props.mediaKey, p.id),
            caption: typeof c.props.caption === "object" ? c.props.caption[localeKey] || c.props.caption.en : c.props.caption,
          },
        })),
      },
    };
  }
  return result;
}

export const projectModules = {
  get de() {
    return getProjectsByLocale("de");
  },
  get en() {
    return getProjectsByLocale("en");
  },
} as const satisfies Record<Locale, Record<string, any>>;
