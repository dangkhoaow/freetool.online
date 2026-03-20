import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ConditionalNavbar } from '@/components/conditional-navbar';
import ScrollToTop from '@/components/scroll-to-top';
import { ProductionProvider } from '@/components/production-detector';
import { GTMScripts } from '@/components/gtm-scripts';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ProductionProvider>
      <GTMScripts />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ConditionalNavbar />
        {children}
        <ScrollToTop />
      </ThemeProvider>
    </ProductionProvider>
  );
}
