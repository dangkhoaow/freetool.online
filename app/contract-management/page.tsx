"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FileText, PanelRight, Briefcase } from "lucide-react"
import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"
import FeatureSection from "./components/landing-page/feature-section"
import UsageGuide from "./components/landing-page/usage-guide"
import FaqSection from "./components/landing-page/faq-section"
import SecuritySection from "./components/landing-page/security-section"
import { Button } from "@/components/ui/button"

export default function ContractManagementPage() {
  const router = useRouter();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[CONTRACT:LANDING] ${message}`, data);
    } else {
      console.log(`[CONTRACT:LANDING] ${message}`);
    }
  };
  
  useEffect(() => {
    log('Contract Management landing page mounted');
    
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('contractManagementToken');
        log('Authentication token checked', { hasToken: !!token });
      } catch (error) {
        console.error('[CONTRACT:LANDING] Error checking authentication:', error);
      }
    };
    
    checkAuthStatus();
    
    return () => {
      log('Contract Management landing page unmounted');
    };
  }, []);
  
  // Handler for the Get Started button
  const handleGetStarted = () => {
    log('Get Started button clicked');
    try {
      const token = localStorage.getItem('contractManagementToken');
      
      if (token) {
        log('User is authenticated, redirecting to dashboard');
        router.push('/contract-management/dashboard');
      } else {
        log('User is not authenticated, redirecting to login');
        router.push('/contract-management/login');
      }
    } catch (error) {
      console.error('[CONTRACT:LANDING] Error handling Get Started:', error);
      router.push('/contract-management/login');
    }
  };
  
  // Function to scroll to features section
  const scrollToFeatures = () => {
    log('Scrolling to features section');
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <HeroSection
        title="Contract Management Made"
        titleHighlight="Simple"
        description="Streamline your contract lifecycle with a comprehensive platform that helps you create, manage, and track contracts efficiently with full Vietnamese and English support."
        badge="Professional Contract Management"
        primaryButtonText="Get Started"
        secondaryButtonText="Explore Features"
        primaryButtonIcon={<FileText className="h-5 w-5" />}
        secondaryButtonIcon={<PanelRight className="h-5 w-5" />}
        onPrimaryButtonClick={handleGetStarted}
        onSecondaryButtonClick={scrollToFeatures}
      />

      {/* Features Section */}
      <FeatureSection />
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Streamline Your Contracts?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join organizations already using our platform to manage their contracts more efficiently. 
            Get started for free today and take control of your contract lifecycle.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-blue-700 hover:bg-blue-50 gap-2 w-full sm:w-auto"
            >
              <FileText className="h-5 w-5" />
              Create Free Account
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-700 hover:bg-blue-50 gap-2 w-full sm:w-auto"
            >
              <Link href="/contract-management/login">
                <Briefcase className="h-5 w-5" />
                Log In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <UsageGuide />

      {/* FAQ Section */}
      <FaqSection />

      {/* Security Section */}
      <SecuritySection />

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Start Managing Your Contracts Today</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Take control of your contract lifecycle with our comprehensive management platform.
            Join our growing community of efficient contract managers.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="gap-2"
          >
            <FileText className="h-5 w-5" />
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
} 