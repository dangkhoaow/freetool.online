import { useState, ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

// Style component to hide the main FreeTool.Online header on Projly routes
const GlobalStyles = () => {
  return (
    <style jsx global>{`
      /* Hide the main FreeTool.Online header on Projly routes */
      body > header:first-of-type {
        display: none !important;
      }
    `}</style>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen w-full flex-col lg:flex-row">
      {/* Global styles to hide the main FreeTool.Online header */}
      <GlobalStyles />
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          // fixed overlay on mobile, relative in flow on desktop
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:z-0 lg:transition-none",
          sidebarOpen
            ? "translate-x-0 lg:w-64 lg:overflow-visible"
            : "-translate-x-full lg:w-0 lg:overflow-hidden"
        )}
      >
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
