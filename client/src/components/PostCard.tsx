import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Post, User, Comment } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, LockIcon, DollarSignIcon } from "lucide-react";
import { TipModal } from "@/components/modals/TipModal";
import { UnlockPremiumModal } from "@/components/modals/UnlockPremiumModal";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
  author: User;
}

export default function PostCard({ post, author }: PostCardProps) {
  const { user } = useAuth();
  const [showTipModal, setShowTipModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const { data: isLiked = false } = useQuery<boolean>({
    queryKey: [`/api/posts/${post.id}/is-liked`],
    queryFn: async () => {
      try {
        const like = await apiRequest("GET", `/api/posts/${post.id}/like`);
        return true;
      } catch (error) {
        return false;
      }
    },
    enabled: !!user,
  });

  const { data: likesCount = 0 } = useQuery<number>({
    queryKey: [`/api/posts/${post.id}/likes-count`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/posts/${post.id}/likes-count`);
      const data = await response.json();
      return data.count;
    },
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${post.id}/comments`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: showComments,
  });

  const { data: isPurchased = false } = useQuery<boolean>({
    queryKey: [`/api/purchased-content?post_id=${post.id}`],
    queryFn: async () => {
      if (!post.is_premium) return true;
      const response = await apiRequest("GET", `/api/purchased-content?post_id=${post.id}`);
      const data = await response.json();
      return data.purchased;
    },
    enabled: !!user && post.is_premium,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/is-liked`] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/likes-count`] });
    },
  });

  const handleLikeClick = () => {
    if (!user) return;
    likeMutation.mutate();
  };

  const openTipModal = () => setShowTipModal(true);
  const closeTipModal = () => setShowTipModal(false);

  const openUnlockModal = () => setShowUnlockModal(true);
  const closeUnlockModal = () => setShowUnlockModal(false);

  const toggleComments = () => setShowComments(!showComments);

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6 animate-scaleIn">
      {/* Post Header */}
      <div className="p-4 flex items-center">
        <Avatar className="mr-3 h-10 w-10">
          <AvatarImage src={author.avatar_url || "https://github.com/shadcn.png"} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{author.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.created_at)}</p>
        </div>
        {post.is_premium && (
          <div className="ml-auto">
            <span className="text-xs font-medium bg-primary bg-opacity-20 text-primary dark:bg-opacity-30 dark:text-primary-light px-2 py-1 rounded-full">
              Premium
            </span>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="relative">
        {post.is_premium && !isPurchased ? (
          // Blurred premium content
          <>
            <div className="blur-premium">
              <img
                src={post.media_url}
                alt="Premium content"
                className="w-full h-auto"
              />
            </div>
            <div className="premium-overlay">
              <Button
                variant="default"
                className="bg-white hover:bg-gray-100 text-primary font-semibold"
                onClick={openUnlockModal}
              >
                <LockIcon className="h-4 w-4 mr-2" />
                Unlock for ${(post.premium_price / 100).toFixed(2)}
              </Button>
            </div>
          </>
        ) : (
          // Regular or unlocked premium content
          <img
            src={post.media_url}
            alt="Post content"
            className="w-full h-auto"
          />
        )}
      </div>

      {/* Post Caption */}
      <div className="p-4">
        <p className="mb-3">
          {post.is_premium && !isPurchased
            ? post.content.substring(0, 100) + "... "
            : post.content}
          {post.is_premium && !isPurchased && (
            <span
              className="text-primary cursor-pointer"
              onClick={openUnlockModal}
            >
              See more
            </span>
          )}
        </p>

        {/* Post Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-4">
            <button
              className={`flex items-center space-x-1 ${
                isLiked
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
              } transition-colors`}
              onClick={handleLikeClick}
            >
              <HeartIcon className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </button>
            <button
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
              onClick={toggleComments}
            >
              <MessageCircleIcon className="h-5 w-5" />
              <span>{comments.length}</span>
            </button>
          </div>
          <Button
            variant="default"
            size="sm"
            className="bg-secondary hover:bg-secondary-dark text-white rounded-full"
            onClick={openTipModal}
          >
            <DollarSignIcon className="h-4 w-4 mr-1" />
            <span>Tip</span>
          </Button>
        </div>

        {/* Comments Section (conditionally displayed) */}
        {showComments && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <h4 className="font-medium mb-3">Comments</h4>
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-sm flex-1">
                      <p className="font-medium">Username</p>
                      <p>{comment.content}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {/* Comment input */}
              <div className="flex gap-2 mt-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.avatar_url || "https://github.com/shadcn.png"} 
                    alt={user?.name || "User"} 
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 dark:bg-gray-700 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTipModal && (
        <TipModal
          isOpen={showTipModal}
          onClose={closeTipModal}
          receiverId={author.id}
          postId={post.id}
        />
      )}

      {showUnlockModal && (
        <UnlockPremiumModal
          isOpen={showUnlockModal}
          onClose={closeUnlockModal}
          post={post}
        />
      )}
    </div>
  );
}

// Helper function from the provided template
function getQueryFn({ on401 }: { on401: "returnNull" | "throw" }) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
    
    return await res.json();
  };
}
