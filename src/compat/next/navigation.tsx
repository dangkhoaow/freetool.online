import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams as useRRParams } from 'react-router-dom';
import {
  normalizeRoutePath,
  parseInternalHref,
  resolveLegacyHashRouteTarget,
  scheduleHashScroll,
} from '../../router/hash-path';
import { NotFoundRouteError, RedirectRouteError } from '../../router/not-found-error';

type SearchParamInit =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>
  | Array<[string, string]>;

type RouterOptions = {
  replace?: boolean;
  scroll?: boolean;
  state?: unknown;
};

function toSearchString(init?: SearchParamInit | null): string {
  if (!init) {
    return '';
  }

  if (typeof init === 'string') {
    return init.startsWith('?') ? init : `?${init}`;
  }

  if (init instanceof URLSearchParams) {
    const search = init.toString();
    return search ? `?${search}` : '';
  }

  if (Array.isArray(init)) {
    const params = new URLSearchParams(init);
    const search = params.toString();
    return search ? `?${search}` : '';
  }

  const params = new URLSearchParams();
  Object.entries(init).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    params.set(key, String(value));
  });

  const search = params.toString();
  return search ? `?${search}` : '';
}

function buildSearchParamHandle(
  currentPathname: string,
  currentSearch: string,
  currentHash: string,
  navigate: ReturnType<typeof useNavigate>,
) {
  const params = new URLSearchParams(currentSearch);

  const setSearchParams = (
    nextInit: SearchParamInit | ((previous: URLSearchParams) => SearchParamInit),
    options: RouterOptions = {},
  ) => {
    const resolvedInit = typeof nextInit === 'function' ? nextInit(new URLSearchParams(params)) : nextInit;
    const nextSearch = toSearchString(resolvedInit);
    navigate(
      {
        pathname: currentPathname,
        search: nextSearch,
        hash: currentHash,
      },
      {
        replace: options.replace ?? false,
        state: options.state,
      },
    );
  };

  const augmented = params as URLSearchParams & Iterable<unknown>;
  Object.defineProperty(augmented, Symbol.iterator, {
    enumerable: false,
    value: function* iterator() {
      yield params;
      yield setSearchParams;
    },
  });

  return augmented;
}

export function usePathname(): string {
  const location = useLocation();
  return location.pathname || '/';
}

export function useSearchParams(): URLSearchParams & Iterable<unknown> {
  const location = useLocation();
  const navigate = useNavigate();

  return useMemo(
    () => buildSearchParamHandle(location.pathname || '/', location.search || '', location.hash || '', navigate),
    [location.pathname, location.search, location.hash, navigate],
  );
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  return useRRParams<T>();
}

export function useRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname || '/';
  const search = location.search || '';
  const hash = location.hash || '';

  const push = useCallback(
    (href: string, options: RouterOptions = {}) => {
      if (typeof window !== 'undefined' && href.startsWith('#') && !href.startsWith('#/')) {
        if (options.scroll !== false) {
          scheduleHashScroll(href);
        }
        return;
      }

      const legacyRouteTarget = href.startsWith('#/') ? resolveLegacyHashRouteTarget(href) : null;
      const parsed = parseInternalHref(href);
      if (parsed.external) {
        window.location.href = href;
        return;
      }

      if (legacyRouteTarget) {
        const legacyParsed = parseInternalHref(href.slice(1));
        navigate(
          {
            pathname: normalizeRoutePath(legacyParsed.pathname || pathname),
            search: legacyParsed.search,
            hash: legacyParsed.hash,
          },
          {
            replace: options.replace ?? false,
            state: options.state,
          },
        );

        if (options.scroll !== false) {
          if (legacyParsed.hash) {
            scheduleHashScroll(legacyParsed.hash);
          } else {
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        }
        return;
      }

      const targetPathname = normalizeRoutePath(parsed.pathname || pathname);
      navigate(
        {
          pathname: targetPathname,
          search: parsed.search,
          hash: parsed.hash,
        },
        {
          replace: options.replace ?? false,
          state: options.state,
        },
      );

      if (options.scroll !== false) {
        if (parsed.hash) {
          scheduleHashScroll(parsed.hash);
        } else if (targetPathname !== pathname || parsed.search !== search) {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      }
    },
    [navigate, pathname, search],
  );

  const replace = useCallback(
    (href: string, options: Omit<RouterOptions, 'replace'> = {}) => {
      push(href, { ...options, replace: true });
    },
    [push],
  );

  return {
    push,
    replace,
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: async () => undefined,
    pathname,
    query: Object.fromEntries(new URLSearchParams(search)),
    asPath: `${pathname}${search}${hash}`,
  };
}

export function notFound(): never {
  throw new NotFoundRouteError();
}

export function redirect(pathname: string): never {
  throw new RedirectRouteError(pathname);
}
