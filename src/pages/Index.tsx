import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";

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
            author:profiles(*)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        console.log("Posts fetched successfully:", data);
        return data;
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    meta: {
      onSettled: (data, error) => {
        if (error && mounted.current) {
          console.error("Query error handler:", error);
          toast({
            title: "Error loading posts",
            description: "Please try refreshing the page",
            variant: "destructive",
          });
        }
      }
    }
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
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
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="bg-rfa-gray p-4 rounded-lg border border-rfa-gray-light"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={post.author?.avatar_url || "/placeholder.svg"}
                alt={post.author?.username || "User"}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{post.author?.username || "Unknown User"}</p>
                <p className="text-sm text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-gray-200">{post.content}</p>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default Index;