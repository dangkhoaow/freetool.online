
import React from 'react';
import { useParams } from 'react-router-dom';
import PageEditor from '@/components/pages/PageEditor';
import PageEditorWrapper from '@/components/pages/PageEditorWrapper';

const PageEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  console.log("PageEditorPage: Rendering the page editor with ID:", id);
  
  try {
    return <PageEditor />;
  } catch (error) {
    console.error("Error rendering PageEditor, falling back to wrapper:", error);
    return <PageEditorWrapper />;
  }
};

export default PageEditorPage;
