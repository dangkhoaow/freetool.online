import { useEffect, useMemo } from 'react';
import { filePathToRoutePath } from './route-path';

type RouteMetadata = {
  title?: string;
  description?: string;
  keywords?: string | string[];
};

const metadataModules = import.meta.glob('../../app/**/metadata.ts', { eager: true }) as Record<
  string,
  {
    metadata?: RouteMetadata;
    default?: RouteMetadata;
  }
>;

const metadataByRoute = new Map<string, RouteMetadata>();

for (const [filePath, module] of Object.entries(metadataModules)) {
  const routePath = filePathToRoutePath(filePath);
  const exportedMetadata = module.metadata || module.default;
  if (exportedMetadata) {
    metadataByRoute.set(routePath, exportedMetadata);
  }
}

function humanizeSegment(segment: string): string {
  return segment
    .replace(/^:/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function fallbackMetadata(pathname: string): RouteMetadata {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return {
      title: 'FreeTool Online',
      description: 'Free browser-based tools for everyday tasks.',
    };
  }

  const lastSegment = segments[segments.length - 1];
  const parentSegment = segments.length > 1 ? segments[segments.length - 2] : '';
  const baseTitle = parentSegment ? humanizeSegment(parentSegment) : 'FreeTool Online';
  const pageTitle = humanizeSegment(lastSegment);

  return {
    title: `${pageTitle} | ${baseTitle}`,
    description: `${pageTitle} on FreeTool Online.`,
  };
}

function resolveMetadata(pathname: string): RouteMetadata {
  if (metadataByRoute.has(pathname)) {
    return metadataByRoute.get(pathname) || {};
  }

  const segments = pathname.split('/').filter(Boolean);
  while (segments.length > 0) {
    segments.pop();
    const candidate = `/${segments.join('/')}`;
    if (metadataByRoute.has(candidate)) {
      return metadataByRoute.get(candidate) || {};
    }
  }

  return fallbackMetadata(pathname);
}

function setMetaTag(name: string, content?: string) {
  if (!content || typeof document === 'undefined') {
    return;
  }

  let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

export function useRouteMetadata(pathname: string) {
  const metadata = useMemo(() => resolveMetadata(pathname), [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (metadata.title) {
      document.title = metadata.title;
    }

    setMetaTag('description', metadata.description);
  }, [metadata]);

  return metadata;
}
