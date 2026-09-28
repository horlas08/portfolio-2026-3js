// Dynamically glob all assets across per-project folders and legacy asset folders
// Supports extensions: .webp, .png, .jpg, .jpeg, .svg, .gif, .mp4, .webm, .mov, .ogg

const projectFolderAssets = import.meta.glob<string>(
  "../../assets/projects/**/*.{webp,png,jpg,jpeg,svg,gif,mp4,webm,mov,ogg}",
  { eager: true, import: "default" }
);

const legacyThumbnails = import.meta.glob<string>(
  "../../assets/thumbnails/*.{webp,png,jpg,jpeg,svg,gif}",
  { eager: true, import: "default" }
);

const legacyVideos = import.meta.glob<string>(
  "../../assets/videos/*.{mp4,webm,mov,ogg}",
  { eager: true, import: "default" }
);

const legacyProjectImages = import.meta.glob<string>(
  "../../assets/images/projects/**/*.{webp,png,jpg,jpeg,svg,gif}",
  { eager: true, import: "default" }
);

/**
 * Resolves thumbnail for a project ID / thumbnail key.
 * Checks per-project folder first (e.g. src/assets/projects/[id]/thumbnail.* or any image),
 * then falls back to src/assets/thumbnails/[key].*
 */
export function resolveThumbnail(projectId: string, thumbnailKey?: string): string {
  const key = (thumbnailKey || projectId).toLowerCase();
  const pid = projectId.toLowerCase();

  // 1. Check src/assets/projects/[projectId]/thumbnail.* or cover.* or preview.*
  for (const [path, url] of Object.entries(projectFolderAssets)) {
    const lowerPath = path.toLowerCase();
    if (
      lowerPath.includes(`/assets/projects/${pid}/`) &&
      (lowerPath.includes("/thumbnail.") || lowerPath.includes("/cover.") || lowerPath.includes("/preview."))
    ) {
      return url;
    }
  }

  // 2. Check any image inside src/assets/projects/[projectId]/
  for (const [path, url] of Object.entries(projectFolderAssets)) {
    const lowerPath = path.toLowerCase();
    if (
      lowerPath.includes(`/assets/projects/${pid}/`) &&
      !lowerPath.endsWith(".mp4") &&
      !lowerPath.endsWith(".webm") &&
      !lowerPath.endsWith(".mov") &&
      !lowerPath.endsWith(".ogg")
    ) {
      return url;
    }
  }

  // 3. Fallback to src/assets/thumbnails/[key].*
  for (const [path, url] of Object.entries(legacyThumbnails)) {
    const filename = path.split("/").pop() || "";
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf(".")).toLowerCase();
    if (nameWithoutExt === key || nameWithoutExt === pid) {
      return url;
    }
  }

  return "";
}

/**
 * Resolves media source (video or image) by mediaKey or filename.
 * Supports:
 * - "video:cubewar" -> src/assets/projects/cubewar/video.* OR src/assets/videos/cubewar.mp4
 * - "image:cubewar/cubewar-0" -> src/assets/projects/cubewar/0.* OR src/assets/images/projects/cubewar/cubewar-0.*
 */
export function resolveMediaSrc(mediaKey: string, projectId?: string): string {
  if (!mediaKey) return "";

  if (mediaKey.startsWith("video:")) {
    const videoName = mediaKey.replace("video:", "").toLowerCase();
    const pid = (projectId || videoName).toLowerCase();

    // Check per-project folder: src/assets/projects/[pid]/video.* or any video file inside [pid]
    for (const [path, url] of Object.entries(projectFolderAssets)) {
      const lowerPath = path.toLowerCase();
      if (
        lowerPath.includes(`/assets/projects/${pid}/`) &&
        (lowerPath.endsWith(".mp4") || lowerPath.endsWith(".webm") || lowerPath.endsWith(".mov") || lowerPath.endsWith(".ogg"))
      ) {
        return url;
      }
    }

    // Check legacy videos: src/assets/videos/[videoName].*
    for (const [path, url] of Object.entries(legacyVideos)) {
      const filename = path.split("/").pop() || "";
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf(".")).toLowerCase();
      if (nameWithoutExt === videoName) {
        return url;
      }
    }
  } else if (mediaKey.startsWith("image:")) {
    const rawKey = mediaKey.replace("image:", "").toLowerCase();
    const parts = rawKey.split("/");
    const pid = (parts.length > 1 ? (parts[0] || "") : (projectId || "")).toLowerCase();
    const imageName = parts.pop() || "";

    // Check per-project folder: src/assets/projects/[pid]/[imageName].*
    for (const [path, url] of Object.entries(projectFolderAssets)) {
      const lowerPath = path.toLowerCase();
      const filename = path.split("/").pop() || "";
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf(".")).toLowerCase();

      if (lowerPath.includes(`/assets/projects/${pid}/`)) {
        if (nameWithoutExt === imageName || nameWithoutExt.endsWith(`-${imageName}`) || nameWithoutExt === `${pid}-${imageName}`) {
          return url;
        }
      }
    }

    // Check legacy project images: src/assets/images/projects/[pid]/[imageName].*
    for (const [path, url] of Object.entries(legacyProjectImages)) {
      const lowerPath = path.toLowerCase();
      if (lowerPath.includes(`/${rawKey}.`) || lowerPath.endsWith(`/${imageName}.`)) {
        return url;
      }
    }
  }

  return "";
}
