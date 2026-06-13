// Helper to calculate avatar color based on user name
export const getAvatarColor = (name: string) => {
  const colors = [
    "bg-gradient-to-br from-red-400 to-rose-600 text-white",
    "bg-gradient-to-br from-blue-400 to-indigo-600 text-white",
    "bg-gradient-to-br from-emerald-400 to-teal-600 text-white",
    "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
    "bg-gradient-to-br from-purple-400 to-fuchsia-600 text-white",
    "bg-gradient-to-br from-pink-400 to-rose-500 text-white",
    "bg-gradient-to-br from-cyan-400 to-blue-500 text-white",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

export const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const getAttachmentUrl = (url: string | null) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${apiBaseUrl}${url}`;
};

export const isOnlyEmojis = (str: string) => {
  if (!str) return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  try {
    const emojiRegex = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u200D|\uFE0F|[\u2700-\u27BF]|[\u2600-\u26FF]|\s)+$/u;
    return emojiRegex.test(trimmed);
  } catch {
    return false;
  }
};

export const getEmojiSizeClass = (str: string) => {
  const trimmed = str.trim();
  let count = 1;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter();
      count = Array.from(segmenter.segment(trimmed)).length;
    } catch {
      count = Array.from(trimmed).length;
    }
  } else {
    count = Array.from(trimmed).length;
  }
  
  if (count === 1) return "text-5xl py-2 select-text";
  if (count === 2) return "text-4xl py-1 select-text";
  if (count === 3) return "text-3xl py-1 select-text";
  return "text-2xl py-0.5 select-text";
};
