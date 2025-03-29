import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { ThemeToggle } from "@/components/ThemeToggle";
import DesktopNavigation from "@/components/layout/DesktopNavigation";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TopUpModal } from "@/components/modals/TopUpModal";
import { SubscriptionPlan } from "@shared/schema";
import { CheckIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const { balance } = useWallet();
  const { toast } = useToast();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    error: plansError,
  } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const {
    data: activeSubscription = { subscribed: false },
    isLoading: isSubscriptionLoading,
  } = useQuery<{ subscribed: boolean; subscription?: any; plan?: SubscriptionPlan }>({
    queryKey: ["/api/active-subscription"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  const subscribeMutation = useMutation({
    mutationFn: async (planId: number) => {
      return apiRequest("POST", "/api/subscribe", { plan_id: planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/active-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({
        title: "Subscription successful",
        description: "You are now subscribed and can access premium content.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      
      if (error.message.includes("Insufficient")) {
        setShowTopUpModal(true);
      }
    },
  });
  
  const handleSubscribe = (planId: number, price: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to subscribe",
        variant: "destructive",
      });
      return;
    }
    
    if (balance !== null && balance < price) {
      toast({
        title: "Insufficient balance",
        description: "Please top up your wallet to subscribe",
        variant: "destructive",
      });
      setShowTopUpModal(true);
      return;
    }
    
    subscribeMutation.mutate(planId);
  };
  
  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case "weekly":
        return "week";
      case "monthly":
        return "month";
      case "yearly":
        return "year";
      default:
        return duration;
    }
  };
  
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <DesktopNavigation />
      
      <div className="container mx-auto max-w-6xl px-4 py-6 pb-20 md:pb-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs and get access to exclusive content and features
          </p>
        </div>
        
        {/* Current Subscription Status */}
        {!isSubscriptionLoading && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold mb-1">Subscription Status</h2>
                  {activeSubscription.subscribed ? (
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mr-2">
                        Active
                      </Badge>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your {activeSubscription.plan?.duration} subscription is active until{" "}
                        {activeSubscription.subscription?.end_date && 
                          format(new Date(activeSubscription.subscription.end_date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 mr-2">
                        Inactive
                      </Badge>
                      <p className="text-gray-600 dark:text-gray-400">
                        Subscribe to unlock premium content and messaging
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-center md:text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current wallet balance:</div>
                  <div className="text-2xl font-bold">${balance !== null ? (balance / 100).toFixed(2) : "0.00"}</div>
                  {balance !== null && balance < 1000 && (
                    <Button 
                      variant="link" 
                      className="text-primary p-0 h-auto"
                      onClick={() => setShowTopUpModal(true)}
                    >
                      Top up your wallet
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isPlansLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plansError ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400">
                Failed to load subscription plans. Please try again later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {plans.map((plan) => {
              const isPopular = plan.duration === "monthly";
              const isActive = activeSubscription.subscribed && 
                activeSubscription.plan?.id === plan.id;
              
              return (
                <Card
                  key={plan.id}
                  className={`flex-1 max-w-md mx-auto md:mx-0 ${
                    isPopular ? "border-2 border-primary" : ""
                  } transition-transform hover:scale-105 duration-300`}
                >
                  {isPopular && (
                    <div className="text-center mt-4">
                      <Badge className="bg-primary hover:bg-primary">Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {formatPrice(plan.price)}{" "}
                      <span className="text-gray-500 text-base font-normal">
                        /{getDurationLabel(plan.duration)}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="mb-8 space-y-3">
                      {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      variant="default"
                      className={`w-full ${isActive ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary-dark"}`}
                      onClick={() => handleSubscribe(plan.id, plan.price)}
                      disabled={isActive || subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isActive ? "Current Plan" : "Subscribe Now"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Subscription Benefits */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Subscription Benefits</CardTitle>
            <CardDescription>
              Why subscribe to our premium content
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="content">
              <TabsList className="mb-4">
                <TabsTrigger value="content">Premium Content</TabsTrigger>
                <TabsTrigger value="messaging">Messaging</TabsTrigger>
                <TabsTrigger value="updates">Exclusive Updates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Unlock Premium Content</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      With a subscription, you'll get access to all premium posts and content.
                      Premium content includes high-quality images, videos, and exclusive behind-the-scenes content.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                        <span>Full access to all premium posts</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                        <span>High-resolution images and videos</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                        <span>Behind-the-scenes content</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1581338834647-b0fb40704e21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                      alt="Premium content example" 
                      className="rounded-lg max-h-60 object-cover"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="messaging">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Direct Messaging</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Subscribers can directly message the creator for free. Get personalized responses
                      and engage in meaningful conversations.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                        <span>Unlimited messaging with the creator</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                        <span>Priority responses</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                        <span>Access to subscriber-only messages</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <div className="h-full flex flex-col">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-2 self-start max-w-[70%]">
                        <p className="text-sm">Hi! I really loved your latest post. How did you create that effect?</p>
                      </div>
                      <div className="bg-primary text-white rounded-lg p-3 self-end max-w-[70%]">
                        <p className="text-sm">Thanks for your message! I'd be happy to explain the technique I used...</p>
                      </div>
                      <div className="mt-auto text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>Free messaging for subscribers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="updates">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Exclusive Updates</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Get regular updates and be the first to know about new content, special events,
                      and more. Each subscription tier comes with its own exclusive updates schedule.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                        <span>Weekly, monthly, or yearly exclusive content drops</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                        <span>Early access to new content</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                        <span>Special subscriber-only announcements</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex flex-col h-full justify-center">
                      <div className="mb-4">
                        <Badge className="mb-2">Weekly</Badge>
                        <p className="text-sm">Fresh content every week</p>
                      </div>
                      <div className="mb-4">
                        <Badge variant="outline" className="bg-primary text-white mb-2">Monthly</Badge>
                        <p className="text-sm">In-depth tutorials and premium collections</p>
                      </div>
                      <div>
                        <Badge variant="outline" className="bg-secondary text-white mb-2">Yearly</Badge>
                        <p className="text-sm">Exclusive year-in-review content and special events</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <MobileNavigation />
      
      {/* Top Up Modal */}
      {showTopUpModal && (
        <TopUpModal 
          isOpen={showTopUpModal} 
          onClose={() => setShowTopUpModal(false)} 
        />
      )}
    </div>
  );
}
