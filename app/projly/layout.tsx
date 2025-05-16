import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";

// Styles for the application
import "@/app/globals.css";

// Import the client component wrapper
import { ClientLayoutWrapper } from "./components/layout/ClientLayoutWrapper";

// Font configuration
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Define metadata for the application
export const metadata = {
  title: "Projly - Project Management Tool",
  description: "Manage your projects and tasks efficiently with Projly",
};

export default function ProjlyRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is a server component, no useState or useEffect here
  return (
    <div
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}
    >
      <ClientLayoutWrapper>
        {children}
      </ClientLayoutWrapper>
    </div>
  );
}
