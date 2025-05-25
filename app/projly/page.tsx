"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Briefcase, PanelRight, Layers } from "lucide-react"
import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"
import FeatureSection from "./components/landing-page/feature-section"
import UsageGuide from "./components/landing-page/usage-guide"
import FaqSection from "./components/landing-page/faq-section"
import SecuritySection from "./components/landing-page/security-section"
import { Button } from "@/components/ui/button"
import { projlyAuthService } from "@/lib/services/projly"

export default function ProjlyLandingPage() {
  const router = useRouter();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:LANDING] ${message}`, data);
    } else {
      console.log(`[PROJLY:LANDING] ${message}`);
    }
  };
  
  useEffect(() => {
    log('Landing page mounted');
    
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        log('Authentication status checked', { isAuthenticated });
      } catch (error) {
        console.error('[PROJLY:LANDING] Error checking authentication:', error);
      }
    };
    
    checkAuthStatus();
    
    return () => {
      log('Landing page unmounted');
    };
  }, []);
  
  // Handler for the Get Started button
  const handleGetStarted = async () => {
    log('Get Started button clicked');
    try {
      const isAuthenticated = await projlyAuthService.isAuthenticated();
      
      if (isAuthenticated) {
        log('User is authenticated, redirecting to dashboard');
        router.push('/projly/dashboard');
      } else {
        log('User is not authenticated, redirecting to login');
        router.push('/projly/login');
      }
    } catch (error) {
      console.error('[PROJLY:LANDING] Error handling Get Started:', error);
      router.push('/projly/login');
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
        title="Project Management Made"
        titleHighlight="Simple"
        description="Projly is a comprehensive project management platform that helps teams organize tasks, collaborate effectively, and track progress in real-time."
        badge="Modern Project Management"
        primaryButtonText="Get Started"
        secondaryButtonText="Explore Features"
        primaryButtonIcon={<Briefcase className="h-5 w-5" />}
        secondaryButtonIcon={<PanelRight className="h-5 w-5" />}
        onPrimaryButtonClick={handleGetStarted}
        onSecondaryButtonClick={scrollToFeatures}
      />

      {/* Features Section */}
      <FeatureSection />
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Streamline Your Projects?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using Projly to manage their projects more efficiently. 
            Get started for free today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-blue-700 hover:bg-blue-50 gap-2 w-full sm:w-auto"
            >
              <Briefcase className="h-5 w-5" />
              Create Free Account
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-700 hover:bg-blue-50 gap-2 w-full sm:w-auto"
            >
              <Link href="/projly/login">
                <Layers className="h-5 w-5" />
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
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Start Managing Your Projects Today</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Projly offers all the tools you need to plan, track, and deliver successful projects.
            Join our growing community of productive teams.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="gap-2"
          >
            <Briefcase className="h-5 w-5" />
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
