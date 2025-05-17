import { notFound } from 'next/navigation';
import ProjectDetail from '@/app/projly/pages/ProjectDetail';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetail projectId={params.id} />;
}

export const dynamic = 'force-dynamic'; // Ensure this page is server-side rendered
