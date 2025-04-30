import type { ReactNode } from "react";
import { metadata as toolMetadata } from "./metadata";

export const metadata = toolMetadata;

export default function ToolLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
