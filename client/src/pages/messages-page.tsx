import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Message, User } from "@shared/schema";
import { Conversation } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import DesktopNavigation from "@/components/layout/DesktopNavigation";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TipModal } from "@/components/modals/TipModal";
import { UnlockPremiumModal } from "@/components/modals/UnlockPremiumModal";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeftIcon,
  ImageIcon,
  SendIcon,
  CoinsIcon,
  LockIcon,
  MessageSquareIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeConversationUserId, setActiveConversationUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showTipModal, setShowTipModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedPPVMessage, setSelectedPPVMessage] = useState<Message | null>(null);

  // Get all conversations
  const {
    data: conversations = [],
    isLoading: isConversationsLoading,
  } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Get messages for the active conversation
  const {
    data: messages = [],
    isLoading: isMessagesLoading,
  } = useQuery<Message[]>({
    queryKey: [`/api/messages/${activeConversationUserId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!activeConversationUserId,
  });

  // Get subscription status (to check if can message admin)
  const {
    data: subscription = { subscribed: false },
  } = useQuery<{ subscribed: boolean }>({
    queryKey: ["/api/active-subscription"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !isAdmin,
  });

  // Get active conversation user details
  const {
    data: activeUser,
    isLoading: isActiveUserLoading,
  } = useQuery<User>({
    queryKey: [`/api/users/${activeConversationUserId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!activeConversationUserId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!activeConversationUserId || !messageText.trim()) return;
      
      const isMessageToAdmin = activeUser?.role === "admin";
      
      // Check if user is subscribed when messaging admin
      if (isMessageToAdmin && !isAdmin && !subscription.subscribed) {
        toast({
          title: "Subscription required",
          description: "You need to subscribe to message the creator directly.",
          variant: "destructive",
        });
        return;
      }
      
      await apiRequest("POST", "/api/messages", {
        receiver_id: activeConversationUserId,
        content: messageText,
      });
      
      setMessageText("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${activeConversationUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send PPV message mutation (admin only)
  const sendPPVMessageMutation = useMutation({
    mutationFn: async ({ content, price }: { content: string; price: number }) => {
      if (!activeConversationUserId || !content.trim()) return;
      
      await apiRequest("POST", "/api/messages", {
        receiver_id: activeConversationUserId,
        content,
        is_ppv: true,
        ppv_price: price,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${activeConversationUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "PPV message sent",
        description: "The user will need to pay to unlock this content.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send PPV message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const messagesContainer = document.getElementById("messages-container");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessageMutation.mutate();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openConversation = (userId: number) => {
    setActiveConversationUserId(userId);
  };

  const backToConversationList = () => {
    setActiveConversationUserId(null);
  };

  const openTipModal = () => setShowTipModal(true);
  const closeTipModal = () => setShowTipModal(false);

  const openUnlockModal = (message: Message) => {
    setSelectedPPVMessage(message);
    setShowUnlockModal(true);
  };
  const closeUnlockModal = () => {
    setSelectedPPVMessage(null);
    setShowUnlockModal(false);
  };

  // Get the admin user for PPV sending (if current user is admin)
  const handleSendPPVMessage = () => {
    if (isAdmin && activeConversationUserId) {
      // This would typically open a modal to input content and price
      // For simplicity, we'll just use preset values
      sendPPVMessageMutation.mutate({
        content: "Exclusive content just for you! Check out this special behind-the-scenes footage.",
        price: 299, // $2.99
      });
    }
  };

  const formatMessageTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <DesktopNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex container mx-auto max-w-6xl px-4 py-6 pb-20 md:pb-6">
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="flex h-[calc(100vh-150px)]">
            {/* Conversation List - hidden on mobile when a chat is active */}
            <div 
              id="conversation-list" 
              className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto ${
                activeConversationUserId && window.innerWidth < 768 ? "hidden" : ""
              }`}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold">Messages</h2>
              </div>
              
              {isConversationsLoading ? (
                <div className="flex justify-center items-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No conversations yet
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.userId} 
                      className={`flex items-center p-4 ${
                        activeConversationUserId === conversation.userId 
                          ? "bg-gray-100 dark:bg-gray-700" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      } cursor-pointer`} 
                      onClick={() => openConversation(conversation.userId)}
                    >
                      <Avatar className="w-12 h-12 mr-3">
                        <AvatarImage 
                          src={conversation.user.avatar_url || "https://github.com/shadcn.png"} 
                          alt={conversation.user.name} 
                        />
                        <AvatarFallback>{conversation.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-semibold truncate">{conversation.user.name}</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatMessageTime(conversation.lastMessage.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {conversation.lastMessage.is_ppv && !conversation.lastMessage.is_unlocked && (
                            <LockIcon className="h-3 w-3 text-primary mr-1" />
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {conversation.lastMessage.is_ppv && !conversation.lastMessage.is_unlocked
                              ? "Exclusive content (Pay to unlock)"
                              : conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Conversation View */}
            <div 
              id="conversation-view" 
              className={`flex flex-col w-full md:w-2/3 ${
                !activeConversationUserId && window.innerWidth < 768 ? "hidden" : ""
              }`}
            >
              {activeConversationUserId ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <button 
                      className="md:hidden mr-2 text-gray-600 dark:text-gray-400" 
                      onClick={backToConversationList}
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    {isActiveUserLoading ? (
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mr-3"></div>
                        <div className="flex flex-col space-y-2">
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Avatar className="w-10 h-10 mr-3">
                          <AvatarImage 
                            src={activeUser?.avatar_url || "https://github.com/shadcn.png"} 
                            alt={activeUser?.name || "User"} 
                          />
                          <AvatarFallback>
                            {activeUser?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{activeUser?.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activeUser?.role === "admin" ? "Creator" : "User"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Messages Container */}
                  <div 
                    id="messages-container"
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {/* Date Separator */}
                    <div className="flex justify-center">
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
                        Today
                      </span>
                    </div>
                    
                    {isMessagesLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No messages yet. Start a conversation!
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isCurrentUser = message.sender_id === user?.id;
                        const showPPVOverlay = message.is_ppv && !message.is_unlocked && !isCurrentUser;
                        
                        return (
                          <div key={message.id} className="flex">
                            <div className={`message-bubble ${isCurrentUser ? "sender bg-primary text-white" : "receiver bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"} p-3 max-w-[80%] rounded-lg`}>
                              {showPPVOverlay ? (
                                <div className="locked-content p-3 bg-white bg-opacity-20 rounded-lg mb-2">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <LockIcon className="inline-block mr-1 h-4 w-4" />
                                      <span>Exclusive Content</span>
                                    </div>
                                    <span className="font-bold">${(message.ppv_price / 100).toFixed(2)}</span>
                                  </div>
                                  <p className="mt-2 text-sm opacity-90">
                                    Premium content from the creator. Unlock to view.
                                  </p>
                                  <Button 
                                    variant="default" 
                                    className="w-full bg-white text-primary hover:bg-gray-100 font-semibold mt-2"
                                    onClick={() => openUnlockModal(message)}
                                  >
                                    Unlock Now
                                  </Button>
                                </div>
                              ) : (
                                <p>{message.content}</p>
                              )}
                              <span className={`text-xs ${isCurrentUser ? "text-white opacity-75" : "text-gray-500 dark:text-gray-400"} mt-1 block`}>
                                {formatMessageTime(message.created_at)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    
                    {/* Tip Message Example (would be triggered by real tips) */}
                    {/* <div className="flex justify-center my-4">
                      <div className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 px-4 py-2 rounded-full text-sm">
                        <CoinsIcon className="inline-block h-4 w-4 mr-1" /> 
                        You received a $5.00 tip!
                      </div>
                    </div> */}
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-500 dark:text-gray-400 mr-3"
                        onClick={() => {
                          toast({
                            title: "Feature coming soon",
                            description: "Image upload will be available in a future update.",
                          });
                        }}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <div className="flex-1 relative">
                        <Input
                          type="text"
                          placeholder="Type your message..."
                          className="w-full rounded-full py-2 px-4"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={handleKeyPress}
                        />
                      </div>
                      <div className="flex items-center ml-3 space-x-2">
                        {isAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-secondary"
                            onClick={handleSendPPVMessage}
                            title="Send Pay-per-view Message"
                          >
                            <LockIcon className="h-5 w-5" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-secondary"
                          onClick={openTipModal}
                          title="Send a tip"
                        >
                          <CoinsIcon className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="default" 
                          size="icon" 
                          className="bg-primary hover:bg-primary-dark text-white rounded-full h-10 w-10"
                          onClick={handleSendMessage}
                          disabled={sendMessageMutation.isPending || messageText.trim() === ""}
                        >
                          <SendIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Empty State (shown when no conversation is selected)
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-800">
                  <div className="text-center">
                    <MessageSquareIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Select a conversation to start messaging or subscribe to message the creator directly.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileNavigation />
      
      {/* Modals */}
      {showTipModal && activeConversationUserId && (
        <TipModal 
          isOpen={showTipModal}
          onClose={closeTipModal}
          receiverId={activeConversationUserId}
        />
      )}
      
      {showUnlockModal && selectedPPVMessage && (
        <UnlockPremiumModal
          isOpen={showUnlockModal}
          onClose={closeUnlockModal}
          message={selectedPPVMessage}
        />
      )}
    </div>
  );
}
