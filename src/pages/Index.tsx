import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";
import Post from "@/components/feed/Post";

const Index = () => {
  const { toast } = useToast();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      console.log("Fetching posts...");
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            profiles!posts_author_id_fkey_profiles(*),
            likes(count),
            comments(count)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Posts fetched successfully:", data);
        return data;
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    meta: {
      onSettled: (data, error) => {
        if (error && mounted.current) {
          console.error("Query settled with error:", error);
          toast({
            title: "Error loading posts",
            description: "Please try refreshing the page",
            variant: "destructive",
          });
        }
      }
    }
  });

  console.log("Render state:", { isLoading, error, postsCount: posts?.length });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-rfa-red" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <p className="text-lg text-red-500">
            {error instanceof Error ? error.message : "Failed to load posts"}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rfa-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {posts?.map((post) => (
          <Post
            key={post.id}
            author={post.profiles?.username || "Unknown User"}
            content={post.content}
            timestamp={new Date(post.created_at).toLocaleDateString()}
            likes={post.likes?.[0]?.count || 0}
            comments={post.comments?.[0]?.count || 0}
          />
        ))}
        {posts?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No posts yet. Be the first to post!
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;