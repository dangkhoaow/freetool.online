'use client';

import Script from 'next/script';
import { useIsProduction } from './production-detector';

export function GTMScripts() {
  // Get production state from our hook
  const isProduction = useIsProduction();

  if (!isProduction) {
    return null;
  }

  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TQVXPQXZ');
          console.log('GTM loaded in production environment (from client component)');
        `}
      </Script>
      <noscript>
        <iframe 
          src="https://www.googletagmanager.com/ns.html?id=GTM-TQVXPQXZ"
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
} 