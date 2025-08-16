import { ReactNode } from 'react';
import { metadata } from './metadata';
import { LanguageProvider } from './contexts/language-context';
import AuthWrapper from './components/auth-wrapper';

export { metadata };

export default function ContractManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <AuthWrapper>
        {children}
      </AuthWrapper>
    </LanguageProvider>
  );
}