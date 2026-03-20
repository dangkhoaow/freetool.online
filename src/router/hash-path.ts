export interface RouteParts {
  pathname: string;
  search: string;
  hash: string;
}

export interface ParsedHref {
  pathname: string;
  search: string;
  hash: string;
  external: boolean;
}

export function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

export function normalizeRoutePath(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed) {
    return '/';
  }

  let normalized = trimmed.replace(/^#/, '');
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  normalized = normalized.replace(/\/{2,}/g, '/');

  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/, '');
  }

  return normalized || '/';
}

/**
 * Vite `base` without trailing slash, e.g. `/freetool.online` or `` when base is `/`.
 * Used for BrowserRouter basename and for stripping `window.location.pathname`.
 */
export function getVitePublicPathPrefix(): string {
  const base = import.meta.env.BASE_URL || '/';
  if (base === '/' || base === '') {
    return '';
  }
  return base.replace(/\/+$/, '');
}

/**
 * Strip Vite public base from a full browser pathname so route matching uses `/tools` not `/freetool.online/tools`.
 */
export function stripVitePublicPathPrefix(pathname: string): string {
  const prefix = getVitePublicPathPrefix();
  if (!prefix) {
    return normalizeRoutePath(pathname || '/');
  }
  const p = pathname || '/';
  if (p === prefix || p === `${prefix}/`) {
    return '/';
  }
  if (p.startsWith(`${prefix}/`)) {
    return normalizeRoutePath(p.slice(prefix.length));
  }
  return normalizeRoutePath(p);
}

/**
 * Prefix internal app paths for real browser URLs (GitHub Pages subpath, open in new tab, window.location).
 */
export function withVitePublicPathPrefix(pathWithQueryHash: string): string {
  const prefix = getVitePublicPathPrefix();
  const raw = pathWithQueryHash.startsWith('/') ? pathWithQueryHash : `/${pathWithQueryHash}`;
  if (!prefix) {
    return raw;
  }
  return `${prefix}${raw}`;
}

export function parseInternalHref(href: string): ParsedHref {
  const rawHref = href.trim();

  if (!rawHref) {
    return {
      pathname: '/',
      search: '',
      hash: '',
      external: false,
    };
  }

  if (isExternalHref(rawHref)) {
    return {
      pathname: rawHref,
      search: '',
      hash: '',
      external: true,
    };
  }

  const [pathAndSearch = '', hash = ''] = rawHref.split('#', 2);
  const [pathnamePart = '', searchPart = ''] = pathAndSearch.split('?', 2);

  return {
    pathname: normalizeRoutePath(pathnamePart || '/'),
    search: searchPart ? `?${searchPart}` : '',
    hash: hash ? `#${hash}` : '',
    external: false,
  };
}

export function resolveLegacyHashRouteTarget(hash: string): string | null {
  const rawHash = hash.trim();

  if (!rawHash.startsWith('#/')) {
    return null;
  }

  const parsed = parseInternalHref(rawHash.slice(1));
  return buildRouteHref(parsed.pathname, parsed.search, parsed.hash);
}

export function getCurrentRouteInfo(): RouteParts {
  if (typeof window === 'undefined') {
    return {
      pathname: '/',
      search: '',
      hash: '',
    };
  }

  return {
    pathname: stripVitePublicPathPrefix(window.location.pathname || '/'),
    search: window.location.search || '',
    hash: window.location.hash || '',
  };
}

export function getCurrentRoutePathname(): string {
  return getCurrentRouteInfo().pathname;
}

export function getCurrentRouteSearch(): string {
  return getCurrentRouteInfo().search;
}

export function buildRouteHref(pathname: string, search = '', hash = ''): string {
  const normalizedPath = normalizeRoutePath(pathname);
  const safeSearch = search && search.startsWith('?') ? search : search ? `?${search}` : '';
  const safeHash = hash && hash.startsWith('#') ? hash : hash ? `#${hash}` : '';
  return `${normalizedPath}${safeSearch}${safeHash}`;
}

export function buildBrowserRouteUrl(href: string): string {
  const rawHref = href.trim();
  const parsed = parseInternalHref(rawHref);

  if (parsed.external) {
    return href;
  }

  const legacyHashTarget = resolveLegacyHashRouteTarget(rawHref);
  if (legacyHashTarget) {
    return withVitePublicPathPrefix(legacyHashTarget);
  }

  if (typeof window === 'undefined') {
    return withVitePublicPathPrefix(buildRouteHref(parsed.pathname, parsed.search, parsed.hash));
  }

  const anchorOnly = rawHref.startsWith('#') && !rawHref.startsWith('#/');
  if (anchorOnly) {
    return `${window.location.pathname}${window.location.search}${parsed.hash}`;
  }

  return withVitePublicPathPrefix(buildRouteHref(parsed.pathname, parsed.search, parsed.hash));
}

export function scrollToHash(hash: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const targetId = hash.replace(/^#/, '').replace(/^\/+/, '');
  if (!targetId) {
    return;
  }

  const element = document.getElementById(decodeURIComponent(targetId));
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function scheduleHashScroll(hash: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.setTimeout(() => {
    scrollToHash(hash);
  }, 50);
}

export function navigateToRoute(href: string, replace = false): void {
  if (typeof window === 'undefined') {
    return;
  }

  const targetUrl = buildBrowserRouteUrl(href);
  if (replace) {
    window.location.replace(targetUrl);
    return;
  }

  window.location.href = targetUrl;
}
