import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Post, Message } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon, LockIcon } from "lucide-react";

interface UnlockPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post;
  message?: Message;
}

export function UnlockPremiumModal({ 
  isOpen, 
  onClose, 
  post, 
  message 
}: UnlockPremiumModalProps) {
  const { toast } = useToast();
  const { balance } = useWallet();
  
  const price = post 
    ? post.premium_price 
    : message 
      ? message.ppv_price 
      : 0;
  
  const contentType = post ? "post" : "message";
  const contentPreviewUrl = post?.media_url || "https://images.unsplash.com/photo-1581338834647-b0fb40704e21";
  const contentId = post?.id || message?.id;
  
  const unlockMutation = useMutation({
    mutationFn: async () => {
      if (post) {
        return apiRequest("POST", `/api/posts/${post.id}/unlock`);
      } else if (message) {
        return apiRequest("POST", `/api/messages/${message.id}/unlock`);
      }
      throw new Error("No content to unlock");
    },
    onSuccess: () => {
      toast({
        title: "Content unlocked!",
        description: `You now have access to this premium ${contentType}.`,
      });
      
      // Invalidate related queries
      if (post) {
        queryClient.invalidateQueries({ queryKey: [`/api/purchased-content?post_id=${post.id}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      } else if (message) {
        queryClient.invalidateQueries({ queryKey: [`/api/purchased-content?message_id=${message.id}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/messages/${message.sender_id}`] });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unlock content",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const handleUnlock = () => {
    if (balance !== null && price > balance) {
      toast({
        title: "Insufficient balance",
        description: "Please top up your wallet to unlock this content.",
        variant: "destructive",
      });
      return;
    }
    
    unlockMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Unlock Premium Content</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mb-6">
          <div className="relative mb-4 rounded-lg overflow-hidden">
            <img 
              src={contentPreviewUrl} 
              alt="Premium content preview" 
              className="w-full h-48 object-cover blur-premium"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg">
                <LockIcon className="inline-block mr-2 h-5 w-5" />
                Premium Content
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Unlock this exclusive {contentType} for ${(price / 100).toFixed(2)}
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Your wallet balance:</span>
              <span className="font-semibold">${balance !== null ? (balance / 100).toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Content price:</span>
              <span className="text-primary">${(price / 100).toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            variant="default" 
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold"
            onClick={handleUnlock}
            disabled={unlockMutation.isPending}
          >
            {unlockMutation.isPending ? "Processing..." : "Unlock Now"}
          </Button>
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
            Once unlocked, you'll have permanent access to this content
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
