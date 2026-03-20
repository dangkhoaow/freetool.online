export function filePathToRoutePath(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const pageMarker = '/app/';
  const pageIndex = normalizedPath.lastIndexOf(pageMarker);
  const appRelativePath = pageIndex >= 0 ? normalizedPath.slice(pageIndex + pageMarker.length) : normalizedPath;

  if (appRelativePath === 'page.tsx' || appRelativePath === 'metadata.ts') {
    return '/';
  }

  const withoutPageSuffix = appRelativePath.replace(/\/page\.tsx$/, '').replace(/\/metadata\.ts$/, '');
  const segments = withoutPageSuffix.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '/';
  }

  const routeSegments = segments.map((segment) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      const cleaned = segment.slice(1, -1);
      if (cleaned.startsWith('...')) {
        return '*';
      }
      return `:${cleaned}`;
    }

    return segment;
  });

  return `/${routeSegments.join('/')}`.replace(/\/{2,}/g, '/');
}
