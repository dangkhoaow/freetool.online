import { ReactNode } from 'react';
import { metadata } from './metadata';
import { LanguageProvider } from './contexts/language-context';
import ContractHeader from './components/contract-header';

export { metadata };

export default function ContractManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ContractHeader />
        <main className="pt-14">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
} 