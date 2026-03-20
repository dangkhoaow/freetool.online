import type { ReactNode } from 'react';
import { ProjlyAuthProvider } from '@/app/projly/providers/auth-provider';
import { ProjlyQueryProvider } from '@/app/projly/providers/query-provider';
import AuthWrapper from '@/app/contract-management/components/auth-wrapper';
import { LanguageProvider } from '@/app/contract-management/contexts/language-context';
import '@/app/av-foundation/av-foundation-theme.css';

type ShellProps = {
  children: ReactNode;
};

export function ProjlyShell({ children }: ShellProps) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ProjlyQueryProvider>
        <ProjlyAuthProvider>{children}</ProjlyAuthProvider>
      </ProjlyQueryProvider>
    </div>
  );
}

export function ContractManagementShell({ children }: ShellProps) {
  return (
    <LanguageProvider>
      <AuthWrapper>{children}</AuthWrapper>
    </LanguageProvider>
  );
}

export function AvFoundationShell({ children }: ShellProps) {
  return <div className="av-foundation-theme font-sans antialiased min-h-screen">{children}</div>;
}
