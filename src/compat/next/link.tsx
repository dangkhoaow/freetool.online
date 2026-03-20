import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  buildRouteHref,
  isExternalHref,
  normalizeRoutePath,
  parseInternalHref,
  resolveLegacyHashRouteTarget,
  scheduleHashScroll,
} from '../../router/hash-path';

type LinkHref = string | URL;

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: LinkHref;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  shallow?: boolean;
  legacyBehavior?: boolean;
  passHref?: boolean;
};

function formatHref(href: LinkHref): string {
  if (typeof href === 'string') {
    return href;
  }

  return `${href.pathname || ''}${href.search || ''}${href.hash || ''}`;
}

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, replace = false, scroll = true, onClick, target, rel, children, ...rest },
  ref,
) {
  const navigate = useNavigate();
  const rawHref = formatHref(href);

  const external = isExternalHref(rawHref) || target === '_blank';
  const anchorOnly = rawHref.startsWith('#') && !rawHref.startsWith('#/');
  const legacyRouteTarget = rawHref.startsWith('#/') ? resolveLegacyHashRouteTarget(rawHref) : null;
  const parsed = anchorOnly ? null : parseInternalHref(rawHref);
  const targetHref = external
    ? rawHref
    : anchorOnly
      ? rawHref
      : legacyRouteTarget || buildRouteHref(parsed.pathname, parsed.search, parsed.hash);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (external || isModifiedClick(event)) {
      return;
    }

    event.preventDefault();

    if (anchorOnly) {
      if (scroll) {
        scheduleHashScroll(rawHref);
      }
      return;
    }

    if (legacyRouteTarget) {
      const legacyParsed = parseInternalHref(rawHref.slice(1));
      navigate(
        {
          pathname: normalizeRoutePath(legacyParsed.pathname),
          search: legacyParsed.search,
          hash: legacyParsed.hash,
        },
        {
          replace,
        },
      );

      if (scroll && legacyParsed.hash) {
        scheduleHashScroll(legacyParsed.hash);
      }
      return;
    }

    if (!parsed) {
      return;
    }

    const nextPathname = normalizeRoutePath(parsed.pathname);
    navigate(
      {
        pathname: nextPathname,
        search: parsed.search,
        hash: parsed.hash,
      },
      {
        replace,
      },
    );

    if (scroll) {
      if (parsed.hash) {
        scheduleHashScroll(parsed.hash);
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }
  };

  return (
    <a
      ref={ref}
      href={targetHref}
      target={target}
      rel={rel}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;
