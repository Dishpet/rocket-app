import { Home, Users, MessageSquare, Newspaper } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Newspaper, label: "Academy", path: "/academy" },
    { icon: Users, label: "Directory", path: "/directory" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-rfa-dark/80 backdrop-blur-md border-t border-rfa-gray z-50">
      <div className="container h-full">
        <div className="h-full flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;