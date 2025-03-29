import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import DesktopNavigation from "@/components/layout/DesktopNavigation";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Post } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import PostCard from "@/components/PostCard";
import { Loader2, EditIcon, CheckIcon } from "lucide-react";

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("posts");
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  
  const { data: profileData, isLoading: isProfileLoading } = useQuery<User>({
    queryKey: [`/api/users/${user?.id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  const { data: userPosts = [], isLoading: isPostsLoading } = useQuery<{post: Post, author: User}[]>({
    queryKey: [`/api/users/${user?.id}/posts`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  useEffect(() => {
    if (profileData) {
      setName(profileData.name);
      setBio(profileData.bio || "");
    }
  }, [profileData]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; bio: string }) => {
      return apiRequest("PUT", `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      setEditMode(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });
  
  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast({
        title: "Invalid name",
        description: "Name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate({ name, bio });
  };
  
  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <DesktopNavigation />
      
      <div className="container mx-auto max-w-6xl px-4 py-6 pb-20 md:pb-6">
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage 
                  src={profileData?.avatar_url || "https://github.com/shadcn.png"} 
                  alt={profileData?.name || "User"} 
                />
                <AvatarFallback className="text-2xl">
                  {profileData?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                      </label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="max-w-md"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                        Save
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setEditMode(false);
                          setName(profileData?.name || "");
                          setBio(profileData?.bio || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{profileData?.name}</h1>
                      {(isAdmin || user?.id === profileData?.id) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => setEditMode(true)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {profileData?.bio || "No bio yet"}
                    </p>
                    
                    <div className="flex justify-center md:justify-start space-x-4 mb-4">
                      <div className="text-center">
                        <div className="font-bold">{userPosts.length}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
                      </div>
                      <div className="border-r border-gray-300 dark:border-gray-600"></div>
                      <div className="text-center">
                        <div className="font-bold">{profileData?.is_verified ? "Verified" : "Unverified"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                      </div>
                      <div className="border-r border-gray-300 dark:border-gray-600"></div>
                      <div className="text-center">
                        <div className="font-bold">${(profileData?.wallet_balance || 0) / 100}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          onClick={() => navigate("/admin/add-post")}
                        >
                          Add New Post
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate("/admin/dashboard")}
                        >
                          Dashboard
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="purchased">Purchased Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            {isPostsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No posts yet</p>
                  {isAdmin && (
                    <Button
                      variant="default"
                      onClick={() => navigate("/admin/add-post")}
                    >
                      Create Your First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {userPosts.map((postData) => (
                  <PostCard 
                    key={postData.post.id} 
                    post={postData.post} 
                    author={postData.author} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="purchased">
            <Card>
              <CardHeader>
                <CardTitle>Purchased Content</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Your purchased content will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
