import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import DesktopNavigation from "@/components/layout/DesktopNavigation";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeToggle";
import {
  User,
  KeyIcon,
  BellIcon,
  ShieldIcon,
  CreditCardIcon,
  LogOutIcon,
  Loader2,
  MoonIcon,
  SunIcon,
  UserIcon,
  PencilIcon,
} from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  // Profile settings states
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  
  // Notification settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || "");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; bio: string; avatar_url?: string }) => {
      return apiRequest("PUT", `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
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
  
  const handleUpdateProfile = () => {
    if (!name.trim()) {
      toast({
        title: "Invalid name",
        description: "Name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate({
      name,
      bio,
      avatar_url: avatarUrl,
    });
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <DesktopNavigation />
      
      <div className="container mx-auto max-w-6xl px-4 py-6 pb-20 md:pb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-[250px_1fr] gap-6">
          {/* Settings Sidebar */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" className="justify-start" asChild>
                    <a href="#profile-section">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </a>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <a href="#appearance-section">
                      <MoonIcon className="mr-2 h-4 w-4" />
                      Appearance
                    </a>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <a href="#notifications-section">
                      <BellIcon className="mr-2 h-4 w-4" />
                      Notifications
                    </a>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <a href="#security-section">
                      <ShieldIcon className="mr-2 h-4 w-4" />
                      Security
                    </a>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <a href="#payment-section">
                      <CreditCardIcon className="mr-2 h-4 w-4" />
                      Payment Methods
                    </a>
                  </Button>
                  <Separator className="my-2" />
                  <Button 
                    variant="ghost" 
                    className="justify-start text-red-600 dark:text-red-400 hover:text-red-700 hover:dark:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Settings Content */}
          <div className="space-y-6">
            {/* Profile Section */}
            <Card id="profile-section">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </CardTitle>
                <CardDescription>
                  Manage your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || "https://github.com/shadcn.png"} />
                      <AvatarFallback className="text-2xl">
                        {name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                      onClick={() => {
                        toast({
                          title: "Feature coming soon",
                          description: "Profile picture upload will be available in a future update.",
                        });
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="avatar-url">Profile Picture URL</Label>
                      <Input 
                        id="avatar-url" 
                        value={avatarUrl} 
                        onChange={(e) => setAvatarUrl(e.target.value)} 
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Tell us about yourself..."
                    className="w-full min-h-[100px] p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Appearance Section */}
            <Card id="appearance-section">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MoonIcon className="mr-2 h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how the app looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <MoonIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <SunIcon className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {theme === "dark" ? "Dark mode" : "Light mode"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Notifications Section */}
            <Card id="notifications-section">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BellIcon className="mr-2 h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications in-browser
                    </p>
                  </div>
                  <Switch 
                    checked={pushNotifications} 
                    onCheckedChange={setPushNotifications} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Notification preferences saved",
                      description: "Your notification settings have been updated.",
                    });
                  }}
                >
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
            
            {/* Security Section */}
            <Card id="security-section">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldIcon className="mr-2 h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update your password regularly for better security
                    </p>
                  </div>
                  <Button variant="outline">
                    <KeyIcon className="mr-2 h-4 w-4" />
                    Change
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Account Verification</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Verify your account to access tipping and other features
                    </p>
                  </div>
                  <Button variant="outline">
                    {user?.is_verified ? (
                      "Verified ✓"
                    ) : (
                      <>
                        <ShieldIcon className="mr-2 h-4 w-4" />
                        Verify Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Methods Section */}
            <Card id="payment-section">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCardIcon className="mr-2 h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your preferred payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="mb-4">No payment methods added yet</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Feature coming soon",
                        description: "Payment method management will be available in a future update.",
                      });
                    }}
                  >
                    <CreditCardIcon className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Mobile-only Logout Section */}
            <Card className="md:hidden">
              <CardContent className="p-6">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
