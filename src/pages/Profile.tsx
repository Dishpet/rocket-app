import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Camera } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const Profile = () => {
  const { id } = useParams();
  const { user, profile: currentUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();

  console.log("Profile component rendering with id:", id);
  console.log("Current user profile:", currentUserProfile);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", id || user?.id],
    queryFn: async () => {
      try {
        console.log("Fetching profile for id:", id || user?.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id || user?.id)
          .maybeSingle();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Profile data fetched:", data);
        if (!data) {
          throw new Error("Profile not found");
        }
        return data;
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
    meta: {
      onSettled: (data, error) => {
        if (data) {
          setUsername(data.username);
          setFullName(data.full_name || "");
        }
        if (error) {
          console.error("Query settled with error:", error);
          toast({
            title: "Error loading profile",
            description: "Please try refreshing the page",
            variant: "destructive",
          });
        }
      }
    }
  });

  console.log("Render state:", { isLoading, error, profile });

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-rfa-red" />
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <p className="text-lg text-red-500">
            {error instanceof Error ? error.message : "Failed to load profile"}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="destructive"
          >
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isOwnProfile = user?.id === (id || user?.id);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="relative w-32 h-32 mx-auto">
          <img
            src={profile?.avatar_url || "/placeholder.svg"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
          {isOwnProfile && (
            <div className="absolute bottom-0 right-0">
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer bg-rfa-dark hover:bg-rfa-gray p-2 rounded-full border border-rfa-gray-light"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-rfa-gray border-rfa-gray-light"
                />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-rfa-gray border-rfa-gray-light"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateProfile}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-semibold">{profile?.username}</h2>
                <p className="text-gray-400">{profile?.full_name}</p>
              </div>
              {isOwnProfile && (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;