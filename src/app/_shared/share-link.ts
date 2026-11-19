export async function shareLink(title: string, path: string) {
  const url = new URL(path, window.location.origin).href;
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, url });
      return { kind: "shared" } as const;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return { kind: "cancelled" } as const;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return { kind: "copied" } as const;
  } catch {
    return { kind: "manual", url } as const;
  }
}
