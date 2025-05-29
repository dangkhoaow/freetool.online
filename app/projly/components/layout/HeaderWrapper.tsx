
import React, { ReactNode } from 'react';
import { HeaderActions } from './HeaderActions';
import { ModeToggle } from '../ui/mode-toggle';
import { Button } from '@/components/ui/button';
import { Coffee } from 'lucide-react';

interface HeaderWrapperProps {
  children?: ReactNode;
}

export const HeaderWrapper: React.FC<HeaderWrapperProps> = ({ children }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 flex items-center">
          {children}
        </div>
        
        <div className="flex items-center gap-2 mr-4">
          {/* PayPal Donate Button */}
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" className="inline-block">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----MIIHZwYJKoZIhvcNAQcEoIIHWDCCB1QCAQExggEwMIIBLAIBADCBlDCBjjELMAkGA1UEBhMCVVMxCzAJBgNVBAgTAkNBMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRQwEgYDVQQKEwtQYXlQYWwgSW5jLjETMBEGA1UECxQKbGl2ZV9jZXJ0czERMA8GA1UEAxQIbGl2ZV9hcGkxHDAaBgkqhkiG9w0BCQEWDXJlQHBheXBhbC5jb20CAQAwDQYJKoZIhvcNAQEBBQAEgYAVzubshOp9CF6mTNpqEAwIAk1YAwwLb4YvEpfe8i92D4iKi7Q7FhwbouCRgobzJOja1M/OgutHg6r1oR5LkR6AVHMSmx2HsDDIW9DDztKsE3NZ9a8a4ObJe9IaockIG16fKVhELTOdpVKSBCCjVPaBu4nKUlq+waK8aRb/ys639jELMAkGBSsOAwIaBQAwgeQGCSqGSIb3DQEHATAUBggqhkiG9w0DBwQIWloj9ImOvl+AgcDyHq8Atbkn6ELYsKxYVoFPc6F17/vNE/8+Hy3RufKiD75KaswgnCdcZYGIIuviEsml07nrJVEpC4GyVJKSWYn05mT1wXq3EBtdHgRELuAPQjVaucK1zwBgqF2sTe53uVItHlX9ggOVoyXpKeZoJSHdgqqU9+BZU2mHtQr0UFhEqVruqP3NdJIMrmi0NLP7nLQVRuSWpNkqQOMBkGURPY0Gs5pWf3Vf5eQBfK80Ua77O21X4CmFfb/RDliepddcmsWgggOHMIIDgzCCAuygAwIBAgIBADANBgkqhkiG9w0BAQUFADCBjjELMAkGA1UEBhMCVVMxCzAJBgNVBAgTAkNBMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRQwEgYDVQQKEwtQYXlQYWwgSW5jLjETMBEGA1UECxQKbGl2ZV9jZXJ0czERMA8GA1UEAxQIbGl2ZV9hcGkxHDAaBgkqhkiG9w0BCQEWDXJlQHBheXBhbC5jb20wHhcNMDQwMjEzMTAxMzE1WhcNMzUwMjEzMTAxMzE1WjCBjjELMAkGA1UEBhMCVVMxCzAJBgNVBAgTAkNBMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRQwEgYDVQQKEwtQYXlQYWwgSW5jLjETMBEGA1UECxQKbGl2ZV9jZXJ0czERMA8GA1UEAxQIbGl2ZV9hcGkxHDAaBgkqhkiG9w0BCQEWDXJlQHBheXBhbC5jb20wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAMFHTt38RMxLXJyO2SmS+Ndl72T7oKJ4u4uw+6awntALWh03PewmIJuzbALScsTS4sZoS1fKciBGoh11gIfHzylvkdNe/hJl66/RGqrj5rFb08sAABNTzDTiqqNpJeBsYs/c2aiGozptX2RlnBktH+SUNpAajW724Nv2Wvhif6sFAgMBAAGjge4wgeswHQYDVR0OBBYEFJaffLvGbxe9WT9S1wob7BDWZJRrMIG7BgNVHSMEgbMwgbCAFJaffLvGbxe9WT9S1wob7BDWZJRroYGUpIGRMIGOMQswCQYDVQQGEwJVUzELMAkGA1UECBMCQ0ExFjAUBgNVBAcTDU1vdW50YWluIFZpZXcxFDASBgNVBAoTC1BheVBhbCBJbmMuMRMwEQYDVQQLFApsaXZlX2NlcnRzMREwDwYDVQQDFAhsaXZlX2FwaTEcMBoGCSqGSIb3DQEJARYNcmVAcGF5cGFsLmNvbYIBADAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBBQUAA4GBAIFfOlaagFrl71+jq6OKidbWFSE+Q4FqROvdgIONth+8kSK//Y/4ihuE4Ymvzn5ceE3S/iBSQQMjyvb+s2TWbQYDwcp129OPIbD9epdr4tJOUNiSojw7BHwYRiPh58S1xGlFgHFXwrEBb3dgNbMUa+u4qectsMAXpVHnD9wIyfmHMYIBmjCCAZYCAQEwgZQwgY4xCzAJBgNVBAYTAlVTMQswCQYDVQQIEwJDQTEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEUMBIGA1UEChMLUGF5UGFsIEluYy4xEzARBgNVBAsUCmxpdmVfY2VydHMxETAPBgNVBAMUCGxpdmVfYXBpMRwwGgYJKoZIhvcNAQkBFg1yZUBwYXlwYWwuY29tAgEAMAkGBSsOAwIaBQCgXTAYBgkqhkiG9w0BCQMxCwYJKoZIhvcNAQcBMBwGCSqGSIb3DQEJBTEPFw0xNzA2MTkwODAxMDBaMCMGCSqGSIb3DQEJBDEWBBR0kGx7quzLGV9LowandCqh7+eSYTANBgkqhkiG9w0BAQEFAASBgG02Bp+4f/43yfUpUeBscZwxAmM8fdfMQEXuIs62jp2ZQ8hF6JULK4xlLARCoPusgroKWMN7OyNow1aNPKHcfAeX/ObMWD6/L3WwZek3D0S5FAvvREGFwUxFiqzQd4A4BW/t6GQ7OrD327A4t59NX1FLl6vt/2szvsFDDccp+QmH-----END PKCS7-----" />
            <Button title="Donate with PayPal" variant="ghost" size="sm" className="text-[#0070ba] hover:text-[#003087]" type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 154.728 190.5" className="w-4 h-4 mr-1">
                <g transform="translate(898.192 276.071)">
                  <path clipPath="none" d="M-837.663-237.968a5.49 5.49 0 0 0-5.423 4.633l-9.013 57.15-8.281 52.514-.005.044.01-.044 8.281-52.514c.421-2.669 2.719-4.633 5.42-4.633h26.404c26.573 0 49.127-19.387 53.246-45.658.314-1.996.482-3.973.52-5.924v-.003h-.003c-6.753-3.543-14.683-5.565-23.372-5.565z" fill="#001c64"/>
                  <path clipPath="none" d="M-766.506-232.402c-.037 1.951-.207 3.93-.52 5.926-4.119 26.271-26.673 45.658-53.246 45.658h-26.404c-2.701 0-4.999 1.964-5.42 4.633l-8.281 52.514-5.197 32.947a4.46 4.46 0 0 0 4.405 5.153h28.66a5.49 5.49 0 0 0 5.423-4.633l7.55-47.881c.423-2.669 2.722-4.636 5.423-4.636h16.876c26.573 0 49.124-19.386 53.243-45.655 2.924-18.649-6.46-35.614-22.511-44.026z" fill="#0070e0"/>
                  <path clipPath="none" d="M-870.225-276.071a5.49 5.49 0 0 0-5.423 4.636l-22.489 142.608a4.46 4.46 0 0 0 4.405 5.156h33.351l8.281-52.514 9.013-57.15a5.49 5.49 0 0 1 5.423-4.633h47.782c8.691 0 16.621 2.025 23.375 5.563.46-23.917-19.275-43.666-46.412-43.666z" fill="#003087"/>
                </g>
              </svg>
            </Button>
          </form>

          {/* Buy Me A Coffee Button */}
          <Button title="Buy me a coffee" asChild variant="ghost" size="sm" className="text-[#f1a10d] hover:text-[#FFDD00] hover:border-[#FFDD00] hover:bg-[#1A1A1A]">
            <a href="https://www.buymeacoffee.com/freetoolonline.com" target="_blank" rel="noopener noreferrer">
              <Coffee className="h-4 w-4" />
            </a>
          </Button>

          <ModeToggle />
          <HeaderActions />
        </div>
      </div>
    </header>
  );
};
