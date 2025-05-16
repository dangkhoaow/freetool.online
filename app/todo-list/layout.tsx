import type { ReactNode } from "react";
import { metadata as toolMetadata } from "./metadata";

export const metadata = toolMetadata;

export default function ToolLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check if we're in a route that should show project navigation
  const showProjectNav = true; // We'll always show it for now
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
