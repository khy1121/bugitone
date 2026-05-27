const INSECURE_HTTP_URL = /^http:\/\//i;
const ABSOLUTE_HTTP_URL = /^https?:\/\//i;
const API_PROXY_URL = "/api/proxy";
const UPLOADS_PATH_PREFIX = "/uploads/";

function isHttpsPage() {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

function toUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getConfiguredProxyOrigin() {
  const configuredTarget =
    import.meta.env.VITE_API_PROXY_TARGET?.trim() ||
    import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredTarget || !ABSOLUTE_HTTP_URL.test(configuredTarget)) {
    return null;
  }

  return toUrl(configuredTarget)?.origin ?? null;
}

export function resolveRemoteAssetUrl(value, fallback = "") {
  const source = `${value ?? ""}`.trim();

  if (!source) return fallback;
  if (!isHttpsPage() || !INSECURE_HTTP_URL.test(source)) return source;

  const sourceUrl = toUrl(source);

  if (sourceUrl?.pathname.startsWith(UPLOADS_PATH_PREFIX)) {
    return `${sourceUrl.pathname}${sourceUrl.search}${sourceUrl.hash}`;
  }

  const proxyOrigin = getConfiguredProxyOrigin();

  if (proxyOrigin && sourceUrl?.origin !== proxyOrigin) {
    return source.replace(INSECURE_HTTP_URL, "https://");
  }

  return `${API_PROXY_URL}?__proxy_url=${encodeURIComponent(source)}`;
}
