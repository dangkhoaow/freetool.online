import ProjectDetail from '@/app/projly/pages/ProjectDetail';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  console.log('[ProjectDetailPage] Route params:', params);

  return <ProjectDetail projectId={id} />;
}

export const dynamic = 'force-dynamic'; // Ensure this page is server-side rendered
