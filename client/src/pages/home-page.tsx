import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Post, User } from "@shared/schema";
import AppLayout from "@/components/layout/AppLayout";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TopUpModal } from "@/components/modals/TopUpModal";
import { WalletIcon, CoinsIcon } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useState } from "react";
import { useLocation } from "wouter";

interface PostWithAuthor {
  post: Post;
  author: User;
}

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const { balance } = useWallet();
  const [, navigate] = useLocation();
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const {
    data: subscription = { subscribed: false },
    isLoading: isSubscriptionLoading,
  } = useQuery<{ subscribed: boolean }>({
    queryKey: ["/api/active-subscription"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const {
    data: admin,
    isLoading: isAdminLoading,
  } = useQuery<User>({
    queryKey: ["/api/users/admin"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && !isAdmin,
  });

  useEffect(() => {
    // Prefetch some related data
    if (user) {
      queryClient.prefetchQuery({
        queryKey: ["/api/wallet"],
        queryFn: getQueryFn({ on401: "throw" }),
      });
    }
  }, [user]);

  const openTopUpModal = () => setShowTopUpModal(true);
  const closeTopUpModal = () => setShowTopUpModal(false);

  return (
    <AppLayout>
      <>
        {/* Feed */}
        <div className="md:w-8/12 md:pr-6">
          <h1 className="text-2xl font-bold mb-6">Latest Posts</h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
              Failed to load posts. Please try again later.
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">No posts available yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((postData) => (
                <PostCard 
                  key={postData.post.id} 
                  post={postData.post} 
                  author={postData.author} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:w-4/12 mt-8 md:mt-0">
          {/* Creator Card */}
          {!isAdmin && admin && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage 
                    src={admin.avatar_url || "https://github.com/shadcn.png"} 
                    alt={admin.name} 
                  />
                  <AvatarFallback>{admin.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-1">{admin.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
                  {admin.bio || "Digital artist & content creator sharing my creative journey"}
                </p>
                <div className="flex space-x-3 mb-6">
                  <div className="text-center">
                    <div className="font-bold">124</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
                  </div>
                  <div className="border-r border-gray-300 dark:border-gray-600"></div>
                  <div className="text-center">
                    <div className="font-bold">4.2K</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Subscribers</div>
                  </div>
                  <div className="border-r border-gray-300 dark:border-gray-600"></div>
                  <div className="text-center">
                    <div className="font-bold">98%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                  </div>
                </div>
                <Button 
                  variant="default" 
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={() => navigate("/subscriptions")}
                >
                  Subscribe Now
                </Button>
              </div>
            </div>
          )}
          
          {/* Wallet Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Your Wallet</h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold">${balance !== null ? (balance / 100).toFixed(2) : "0.00"}</p>
                </div>
                <WalletIcon className="text-primary h-8 w-8" />
              </div>
            </div>
            <Button 
              variant="default" 
              className="w-full bg-secondary hover:bg-secondary-dark mb-2"
              onClick={openTopUpModal}
            >
              Top Up Wallet
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Funds are used for unlocking premium content, tipping, and subscriptions
            </p>
          </div>
          
          {/* Subscription Status */}
          {!isAdmin && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Subscription Status</h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                {isSubscriptionLoading ? (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                ) : subscription.subscribed ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <p className="font-medium">Active Subscription</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You have full access to all premium content and messaging
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <p className="font-medium">Not Subscribed</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Subscribe to unlock all premium content and message the creator
                    </p>
                  </div>
                )}
              </div>
              <Button 
                variant="default" 
                className="w-full bg-primary hover:bg-primary-dark"
                onClick={() => navigate("/subscriptions")}
              >
                {subscription.subscribed ? "Manage Subscription" : "View Plans"}
              </Button>
            </div>
          )}
        </div>
        
        {/* Top Up Modal */}
        {showTopUpModal && (
          <TopUpModal 
            isOpen={showTopUpModal} 
            onClose={closeTopUpModal} 
          />
        )}
      </>
    </AppLayout>
  );
}
