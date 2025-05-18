import { notFound } from 'next/navigation';
import ProjectDetail from '@/app/projly/pages/ProjectDetail';
import { use } from 'react';

export default function ProjectDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Unwrap params using React.use() to handle it as a Promise
  const unwrappedParams = use(params as Promise<{ id: string }>);
  
  // Add detailed logging for debugging
  console.log('[ProjectDetailPage] Unwrapped params:', unwrappedParams);
  
  return <ProjectDetail projectId={unwrappedParams.id} />;
}

export const dynamic = 'force-dynamic'; // Ensure this page is server-side rendered
