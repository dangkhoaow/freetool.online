
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageEditor from "@/components/pages/PageEditor";

const EditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log("EditPage: Rendering page editor for page ID:", id);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <PageEditor />
    </div>
  );
};

export default EditPage;
