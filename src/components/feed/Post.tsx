import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share } from "lucide-react";

interface PostProps {
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

const Post = ({ author, content, timestamp, likes, comments }: PostProps) => {
  return (
    <div className="bg-rfa-gray/50 backdrop-blur-lg border border-rfa-gray-light rounded-lg p-4 mb-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Avatar>
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>{author[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{author}</h3>
          <p className="text-sm text-gray-400">{timestamp}</p>
        </div>
      </div>
      
      <p className="text-gray-200 mb-4">{content}</p>
      
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-gray-400 hover:text-rfa-red transition-colors">
          <Heart className="w-5 h-5" />
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{comments}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
          <Share className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Post;