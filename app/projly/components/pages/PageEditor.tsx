
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

const PageEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  console.log('PageEditor: Rendering page editor with page ID:', id);

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h2 className="text-2xl font-bold">Page Editor</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {id ? `Editing page ID: ${id}` : 'Creating a new page'}
          </p>
          
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Return to Previous Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageEditor;
