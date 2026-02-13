const defaultVideoUrl = "/smartcast-intro.mp4";

export const publicBrand = {
  socials: {
    instagram: process.env.NEXT_PUBLIC_SMARTCAST_INSTAGRAM_URL || "https://instagram.com/smartcast.uz",
    telegram: process.env.NEXT_PUBLIC_SMARTCAST_TELEGRAM_URL || "https://t.me/smartcast_uz",
    youtube: process.env.NEXT_PUBLIC_SMARTCAST_YOUTUBE_URL || "https://youtube.com/@smartcast",
    linkedin: process.env.NEXT_PUBLIC_SMARTCAST_LINKEDIN_URL || "https://linkedin.com/company/smartcast"
  },
  introVideoUrl: process.env.NEXT_PUBLIC_SMARTCAST_VIDEO_URL || defaultVideoUrl
};

function extractYouTubeVideoId(url: string) {
  const trimmed = url.trim();

  if (trimmed.includes("youtube.com/embed/")) {
    const match = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    return match?.[1] ?? null;
  }

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch?.[1]) {
    return shortMatch[1];
  }

  const longMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch?.[1]) {
    return longMatch[1];
  }

  return null;
}

export function resolveIntroVideo(videoUrl: string) {
  const youtubeId = extractYouTubeVideoId(videoUrl);

  if (youtubeId) {
    return {
      mode: "youtube" as const,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`
    };
  }

  const normalized = videoUrl.startsWith("/") ? videoUrl : `/${videoUrl}`;

  return {
    mode: "file" as const,
    fileUrl: normalized,
    fileSources: Array.from(new Set([normalized, "/smartcast-intro.mp4", "/videos/smartcast-intro.mp4"])),
    watchUrl: normalized
  };
}
