
import { useAuth } from "@/contexts/AuthContext";
import PagesList from "@/components/pages/PagesList";
import { Spinner } from "@/components/ui/spinner";

const Pages = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <PagesList />
    </div>
  );
};

export default Pages;
