import { metadata as toolMetadata } from "./metadata"
import AIDataVisualizationClientLayout from "./client-layout"

export const metadata = toolMetadata

export default function AIDataVisualizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AIDataVisualizationClientLayout>{children}</AIDataVisualizationClientLayout>
  )
}
