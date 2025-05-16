
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

const PageEditorWrapper = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  
  console.log('PageEditorWrapper: Rendering with pageId:', pageId);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <Button variant="outline" onClick={() => navigate(`/pages`)} className="mr-2">
            View Pages
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Page Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            The page editor requires additional dependencies to be installed. Please check the console for details.
          </p>
          
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Return to Previous Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageEditorWrapper;
