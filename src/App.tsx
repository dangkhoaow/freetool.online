import { Suspense, lazy, useEffect, type ComponentType, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import NotFoundPage from '../app/not-found';
import { AppProviders } from './app-shell/AppProviders';
import { AvFoundationShell, ContractManagementShell, ProjlyShell } from './app-shell/RouteShells';
import { RouteBoundary } from './router/RouteBoundary';
import { resolveLegacyHashRouteTarget } from './router/hash-path';
import { useRouteMetadata } from './router/route-metadata';
import { filePathToRoutePath } from './router/route-path';

type PageModule = {
  default: ComponentType<any>;
};

type RouteEntry = {
  path: string;
  Component: ComponentType<any>;
};

const pageModules = import.meta.glob('../app/**/page.tsx');

const routeEntries: RouteEntry[] = Object.entries(pageModules).map(([filePath, loader]) => {
  const path = filePathToRoutePath(filePath);
  const Component = lazy(async () => {
    const module = (await loader()) as PageModule;
    return { default: module.default };
  });

  return {
    path,
    Component,
  };
});

const routeComponentMap = new Map<string, ComponentType<any>>(
  routeEntries.map((entry) => [entry.path, entry.Component]),
);

const loginAlias = routeComponentMap.get('/projly/login');
if (loginAlias) {
  routeEntries.push({
    path: '/projly/auth/login',
    Component: loginAlias,
  });
}

function getShell(pathname: string, children: React.ReactNode) {
  if (pathname.startsWith('/projly')) {
    return <ProjlyShell>{children}</ProjlyShell>;
  }

  if (pathname.startsWith('/contract-management')) {
    return <ContractManagementShell>{children}</ContractManagementShell>;
  }

  if (pathname.startsWith('/av-foundation')) {
    return <AvFoundationShell>{children}</AvFoundationShell>;
  }

  return children;
}

function RouteScreen({ Component }: { Component: ComponentType<any> }) {
  const location = useLocation();
  const params = useParams();

  useRouteMetadata(location.pathname);

  return getShell(location.pathname, <Component params={params} />);
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-sm text-muted-foreground">Loading...</div>
    </div>
  );
}

function LegacyHashRouteRedirect({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const legacyHashTarget =
    typeof window !== 'undefined' ? resolveLegacyHashRouteTarget(window.location.hash) : null;

  useEffect(() => {
    if (legacyHashTarget) {
      console.log('[ROUTER] Redirecting legacy hash route to clean URL:', legacyHashTarget);
      navigate(legacyHashTarget, { replace: true });
    }
  }, [legacyHashTarget, navigate]);

  if (legacyHashTarget) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <LegacyHashRouteRedirect>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {routeEntries.map(({ path, Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <RouteBoundary>
                      <RouteScreen Component={Component} />
                    </RouteBoundary>
                  }
                />
              ))}
              <Route
                path="*"
                element={
                  <RouteBoundary>
                    <NotFoundPage />
                  </RouteBoundary>
                }
              />
            </Routes>
          </Suspense>
        </LegacyHashRouteRedirect>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
