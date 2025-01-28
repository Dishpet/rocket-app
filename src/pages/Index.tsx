import MainLayout from "@/components/layout/MainLayout";
import Post from "@/components/feed/Post";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [newPost, setNewPost] = useState("");

  const dummyPosts = [
    {
      author: "Ivan Rakitic",
      content: "Welcome to the Rocket Football Academy community! We're excited to have you here. Stay tuned for updates and announcements.",
      timestamp: "2 hours ago",
      likes: 42,
      comments: 8,
    },
    {
      author: "Coach Sarah",
      content: "Great training session today! Remember to stay hydrated and get enough rest before tomorrow's practice.",
      timestamp: "5 hours ago",
      likes: 24,
      comments: 3,
    },
  ];

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
            <Button className="bg-rfa-red hover:bg-rfa-red/90">Post</Button>
          </div>
        </div>

        {dummyPosts.map((post, index) => (
          <Post key={index} {...post} />
        ))}
      </div>
    </MainLayout>
  );
};

export default Index;