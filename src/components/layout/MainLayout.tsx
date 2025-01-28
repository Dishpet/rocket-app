import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-rfa-dark text-white">
      <TopNav />
      <main className="container pt-20 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;