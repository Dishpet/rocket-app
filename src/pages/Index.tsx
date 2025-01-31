import MainLayout from "@/components/layout/MainLayout";
import Post from "@/components/feed/Post";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type PostWithRelations = {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  is_academy_post: boolean | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  likes: { count: number }[];
  comments: { count: number }[];
};

const Index = () => {
  const [newPost, setNewPost] = useState("");
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        console.log("Fetching posts...");
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            profiles (
              username,
              avatar_url
            ),
            likes(count),
            comments(count)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching posts:", error);
          if (mounted) {
            toast({
              title: "Error",
              description: "Failed to load posts. Please try again.",
              variant: "destructive",
            });
          }
          throw error;
        }

        if (!data) return [];

        return data.map(post => ({
          ...post,
          profiles: post.profiles || { username: 'Unknown', avatar_url: null }
        })) as PostWithRelations[];
      } catch (error) {
        console.error("Query error:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
  });

  const handleNewPost = async () => {
    if (!newPost.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a post",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("posts")
        .insert({
          content: newPost.trim(),
          author_id: user.id,
        });

      if (error) throw error;

      setNewPost("");
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <p className="text-red-500">Error loading posts. Please try again later.</p>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-rfa-red" />
          <p className="text-gray-400">Loading posts...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-rfa-gray/50 backdrop-blur-lg border border-rfa-gray-light rounded-lg p-4 mb-6">
          <Textarea
            placeholder="Share something with the community..."
            className="bg-transparent border-none resize-none mb-4 placeholder:text-gray-500 focus-visible:ring-0"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <button className="text-gray-400 hover:text-gray-200 transition-colors">
              <ImagePlus className="w-6 h-6" />
            </button>
            <Button 
              className="bg-rfa-red hover:bg-rfa-red/90"
              onClick={handleNewPost}
            >
              Post
            </Button>
          </div>
        </div>

        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <Post
              key={post.id}
              author={post.profiles.username}
              content={post.content}
              timestamp={new Date(post.created_at).toLocaleString()}
              likes={post.likes[0]?.count || 0}
              comments={post.comments[0]?.count || 0}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;