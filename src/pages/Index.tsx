import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import Feed from "@/components/feed/Feed";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-400">Please sign in to view posts</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Feed />
    </MainLayout>
  );
};

export default Index;