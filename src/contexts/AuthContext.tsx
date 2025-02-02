import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { db } from "@/lib/store/db";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await db
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .select();

      if (error) throw error;
      if (data?.[0]) {
        console.log("Profile found:", data[0]);
        setProfile(data[0]);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = db.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session ? "logged in" : "logged out");
        
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await db.auth.getSession();
        console.log("Initial session check:", session ? "session found" : "no session");

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};