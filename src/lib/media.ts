// Zamienia link z YouTube / Vimeo na adres do osadzenia w <iframe>.
export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com" || host === "music.youtube.com") {
      if (u.pathname.startsWith("/embed/")) return url;
      if (u.pathname.startsWith("/shorts/"))
        return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === "vimeo.com") return `https://player.vimeo.com/video/${u.pathname.slice(1)}`;
  } catch {
    return null;
  }
  return null;
}

// ID filmu YouTube z linku (watch, youtu.be, shorts, embed, live) albo samo 11-znakowe ID.
export function youTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null | undefined = null;
    if (host === "youtu.be") id = u.pathname.split("/")[1];
    else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com"))
      id =
        u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
