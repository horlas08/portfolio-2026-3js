import projectsData from "./projects.json";
import type { Locale } from "../../i18n/types";

const videos = import.meta.glob("../../assets/videos/*.mp4", { eager: true, import: "default" }) as Record<string, string>;
const projectImages = import.meta.glob("../../assets/images/projects/**/*.{webp,png,jpg}", { eager: true, import: "default" }) as Record<string, string>;

export const projectIds = projectsData.map((p) => p.id);

function getMediaSrc(key: string): string {
  if (key.startsWith("video:")) {
    const name = key.replace("video:", "");
    for (const [path, url] of Object.entries(videos)) {
      if (path.includes(`/${name}.mp4`)) return url;
    }
  } else if (key.startsWith("image:")) {
    const name = key.replace("image:", "");
    for (const [path, url] of Object.entries(projectImages)) {
      if (path.includes(`/${name}.`)) return url;
    }
  }
  return "";
}

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
            src: getMediaSrc(c.props.mediaKey),
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
