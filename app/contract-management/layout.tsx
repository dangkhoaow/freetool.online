import { ReactNode } from 'react';
import { metadata } from './metadata';
import { LanguageProvider } from './contexts/language-context';

export { metadata };

export default function ContractManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-14 pt-2">
        {children}
      </div>
    </LanguageProvider>
  );
} 