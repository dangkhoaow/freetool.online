import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/AuthContext";
import { usePages, useDeletePage } from "@/hooks/use-pages";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Eye, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PagesList = () => {
  const { data: pagesResponse, isLoading, error } = usePages();
  const { mutate: deletePage, isPending: isDeleting } = useDeletePage();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deletePage(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading pages: {error.message}
      </div>
    );
  }

  const pages = pagesResponse?.data || [];

  if (pages.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No pages found</h3>
        <p className="text-muted-foreground mb-6">
          Create your first page to get started.
        </p>
        <Button asChild>
          <Link to="/pages/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Page
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pages</h2>
        <Button asChild>
          <Link to="/pages/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Page
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{page.title}</CardTitle>
                <Badge variant={(page.isPublished || page.is_published) ? "default" : "outline"}>
                  {page.status}
                </Badge>
              </div>
              <CardDescription className="mt-2 line-clamp-2">
                {page.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Slug:</span> {page.slug}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {formatDateForDisplay(page.createdAt || page.created_at)}
                </div>
                {(page.publishedAt || page.published_at) && (
                  <div>
                    <span className="font-medium">Published:</span>{" "}
                    {formatDateForDisplay(page.publishedAt || page.published_at)}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/pages/${page.slug}`}>
                  <Eye className="h-4 w-4 mr-1" /> View
                </Link>
              </Button>
              {user && page.created_by === user.id && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/pages/${page.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{page.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(page.id)}
                          disabled={isDeleting && deletingId === page.id}
                        >
                          {isDeleting && deletingId === page.id ? (
                            <Spinner className="mr-2 h-4 w-4" />
                          ) : null}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PagesList;
