export function timeAgo(input) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function fullDate(input) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Deterministic pastel avatar background from a username. */
const AVATAR_PAIRS = [
  ["#e8f0fe", "#0b57d0"],
  ["#fce8e6", "#c5221f"],
  ["#fef7e0", "#b06000"],
  ["#e6f4ea", "#137333"],
  ["#f3e8fd", "#9334e6"],
  ["#e8fbff", "#007b83"],
  ["#fcefe3", "#b06000"],
  ["#e9eef6", "#444746"],
];

export function avatarColors(name = "?") {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PAIRS[hash % AVATAR_PAIRS.length];
}

export function initials(name = "?") {
  const parts = String(name).trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function normalizePostsPayload(data) {
  if (Array.isArray(data)) return { posts: data, totalPages: 1, currentPage: 1 };
  return {
    posts: data.posts || data.results || [],
    currentPage: data.currentPage || data.page || 1,
    totalPages: data.totalPages || 1,
    total: data.totalNoPosts ?? data.total ?? undefined,
  };
}

export function normalizeSearchPayload(data) {
  if (Array.isArray(data)) return data;
  return data.results || data.posts || [];
}

export function isProbablyUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}
