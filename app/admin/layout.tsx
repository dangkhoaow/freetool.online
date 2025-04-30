import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for FreeTool Service",
  icons: {
    icon: "/favicon.32x32.png",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}