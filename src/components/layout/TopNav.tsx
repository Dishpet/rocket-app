import { Bell, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TopNav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-rfa-dark/80 backdrop-blur-md border-b border-rfa-gray z-50">
      <div className="container h-full flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-white">
            RFA
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rfa-red rounded-full"></span>
          </button>
          
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-rfa-gray border-rfa-gray-light">
              <DropdownMenuItem className="text-gray-200 hover:text-white focus:text-white cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;