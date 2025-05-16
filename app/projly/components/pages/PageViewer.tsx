
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageBySlug, usePageSections } from "@/hooks/use-pages";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Edit, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PageViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: pageResponse, isLoading: loadingPage, error } = usePageBySlug(slug || "");
  const page = pageResponse?.data;
  const { data: sectionsResponse, isLoading: loadingSections } = usePageSections(page?.id || "");
  const sections = sectionsResponse?.data || [];

  useEffect(() => {
    if (!loadingPage && !page) {
      navigate("/pages", { replace: true });
    }
  }, [loadingPage, page, navigate]);

  if (loadingPage || loadingSections) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="text-center py-10 text-red-500">
        {error?.message || "Page not found"}
      </div>
    );
  }

  // Check if the user can view this page
  const canEdit = user && (user.id === page.created_by || user.id === page.created_by);
  const isViewable = page.is_published || canEdit;

  if (!isViewable) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold mb-4">Page Not Available</h2>
        <p className="mb-6">This page is not published or you don't have permission to view it.</p>
        <Button variant="outline" onClick={() => navigate("/pages")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Pages
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <Button variant="outline" size="sm" onClick={() => navigate("/pages")}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Pages
            </Button>
          </div>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/pages/${page.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Page
            </Button>
          )}
        </div>
      </div>

      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
        
        {page.description && (
          <div className="text-lg text-muted-foreground mb-8">
            {page.description}
          </div>
        )}

        {sections.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              This page has no content sections yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.id} className="py-4">
                <h2 className="text-2xl font-semibold mb-4">{section.name}</h2>
                <div>
                  {/* Render different section types differently */}
                  {section.content && typeof section.content === 'object' && 'type' in section.content && section.content.type === "text" && (
                    <p>{section.content.value?.toString() || ''}</p>
                  )}
                  {section.content && typeof section.content === 'object' && 'type' in section.content && section.content.type === "html" && (
                    <div dangerouslySetInnerHTML={{ __html: section.content.value?.toString() || '' }} />
                  )}
                  {/* Add more section type renderers here */}
                  {(!section.content || typeof section.content !== 'object' || !('type' in section.content)) && (
                    <p>{JSON.stringify(section.content)}</p>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

export default PageViewer;
