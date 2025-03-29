import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import DesktopNavigation from "@/components/layout/DesktopNavigation";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { PostFormData } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  ImageIcon, 
  UploadIcon, 
  DollarSignIcon,
  Loader2,
} from "lucide-react";

const postSchema = z.object({
  content: z.string().min(1, "Caption is required"),
  media_url: z.string().min(1, "Media URL is required").url("Please enter a valid URL"),
  is_premium: z.boolean().default(false),
  premium_price: z.number().min(0).default(0),
});

export default function AddPostPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [previewUrl, setPreviewUrl] = useState("");
  
  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin && user) {
      navigate("/home");
    }
  }, [isAdmin, user, navigate]);
  
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      media_url: "",
      is_premium: false,
      premium_price: 499, // $4.99 default
    },
  });
  
  const watchIsPremium = form.watch("is_premium");
  const watchMediaUrl = form.watch("media_url");
  
  // Update preview when media URL changes
  useEffect(() => {
    setPreviewUrl(watchMediaUrl);
  }, [watchMediaUrl]);
  
  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      return apiRequest("POST", "/api/posts", {
        ...data,
        user_id: user?.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/posts`] });
      navigate("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: PostFormData) => {
    // If premium is false, ensure premium price is 0
    if (!data.is_premium) {
      data.premium_price = 0;
    }
    
    createPostMutation.mutate(data);
  };
  
  // Sample image URLs for quick selection
  const sampleImageUrls = [
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
  ];
  
  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <DesktopNavigation />
      
      <div className="container mx-auto max-w-6xl px-4 py-6 pb-20 md:pb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Create New Post</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share content with your subscribers
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Post Form */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>
                Fill in the details for your new post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="media_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media URL</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field} 
                              className="rounded-r-none"
                            />
                            <Button 
                              type="button" 
                              variant="secondary"
                              className="rounded-l-none"
                              onClick={() => {
                                toast({
                                  title: "Feature coming soon",
                                  description: "Upload functionality will be available in a future update.",
                                });
                              }}
                            >
                              <UploadIcon className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the URL of an image or video
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caption</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write a caption for your post..." 
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_premium"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Premium Content</FormLabel>
                          <FormDescription>
                            Make this post available only to paying users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {watchIsPremium && (
                    <FormField
                      control={form.control}
                      name="premium_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (in cents)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                              <Input
                                type="number"
                                placeholder="499 (for $4.99)"
                                className="pl-8"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Set a price in cents (e.g., 499 for $4.99)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Post...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Publish Post
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Quick Image Selection:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {sampleImageUrls.map((url, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    type="button"
                    className="h-auto py-0"
                    onClick={() => form.setValue("media_url", url)}
                  >
                    <img
                      src={url}
                      alt={`Sample ${index + 1}`}
                      className="h-12 w-full object-cover rounded"
                    />
                  </Button>
                ))}
              </div>
            </CardFooter>
          </Card>
          
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Post Preview</CardTitle>
              <CardDescription>
                Preview how your post will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Just now</p>
                  </div>
                  {watchIsPremium && (
                    <div className="ml-auto">
                      <span className="text-xs font-medium bg-primary bg-opacity-20 text-primary dark:bg-opacity-30 dark:text-primary-light px-2 py-1 rounded-full">
                        Premium
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Post Content */}
                <div className="relative">
                  {previewUrl ? (
                    watchIsPremium ? (
                      // Blurred premium content
                      <>
                        <div className="blur-premium">
                          <img
                            src={previewUrl}
                            alt="Post preview"
                            className="w-full h-auto"
                          />
                        </div>
                        <div className="premium-overlay">
                          <Button
                            variant="default"
                            className="bg-white hover:bg-gray-100 text-primary font-semibold"
                          >
                            <LockIcon className="h-4 w-4 mr-2" />
                            Unlock for ${(form.getValues("premium_price") / 100).toFixed(2)}
                          </Button>
                        </div>
                      </>
                    ) : (
                      // Regular content
                      <img
                        src={previewUrl}
                        alt="Post preview"
                        className="w-full h-auto"
                      />
                    )
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <ImageIcon className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                </div>
                
                {/* Post Caption */}
                <div className="p-4">
                  <p className="mb-3">
                    {form.getValues("content") || "Your caption will appear here"}
                  </p>
                  
                  {/* Post Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-4">
                      <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                        </svg>
                        <span>0</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>0</span>
                      </button>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-secondary hover:bg-secondary-dark text-white rounded-full"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-1" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <span>Tip</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MobileNavigation />
    </div>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
