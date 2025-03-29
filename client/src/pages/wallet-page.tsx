import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useWallet } from "@/hooks/use-wallet";
import { ThemeToggle } from "@/components/ThemeToggle";
import DesktopNavigation from "@/components/layout/DesktopNavigation";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { TopUpModal } from "@/components/modals/TopUpModal";
import { 
  WalletIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { PurchasedContent, PaymentRequest, Tip } from "@shared/schema";

export default function WalletPage() {
  const { balance, paymentRequests } = useWallet();
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const { 
    data: purchasedContent = [],
    isLoading: isPurchasedContentLoading 
  } = useQuery<PurchasedContent[]>({
    queryKey: ["/api/purchased-content"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { 
    data: tips = [],
    isLoading: isTipsLoading 
  } = useQuery<Tip[]>({
    queryKey: ["/api/tips"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getPaymentRequestStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 flex items-center gap-1">
            <XCircleIcon className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <DesktopNavigation />

      <div className="container mx-auto max-w-6xl px-4 py-6 pb-20 md:pb-6">
        <div className="grid gap-8">
          {/* Wallet Balance Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold">Your Wallet</CardTitle>
              <CardDescription>
                Manage your funds for premium content, tips, and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">Available Balance</h3>
                    <WalletIcon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-2">
                    ${balance !== null ? (balance / 100).toFixed(2) : "0.00"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Use your balance to purchase premium content, send tips, and subscribe
                  </p>
                  <Button 
                    variant="default" 
                    className="w-full bg-primary hover:bg-primary-dark"
                    onClick={() => setShowTopUpModal(true)}
                  >
                    Top Up Wallet
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center text-center h-full">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full mb-2">
                          <ArrowUpIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-sm font-medium mb-1">Spent</p>
                        <p className="text-xl font-bold">
                          ${purchasedContent.reduce((sum, item) => sum + item.amount, 0) / 100}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center text-center h-full">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mb-2">
                          <ArrowDownIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium mb-1">Received</p>
                        <p className="text-xl font-bold">
                          ${tips.reduce((sum, item) => sum + item.amount, 0) / 100}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Requests */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle>Payment Requests</CardTitle>
              <CardDescription>
                Track your wallet top-up requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentRequests && paymentRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{formatDate(request.created_at)}</TableCell>
                        <TableCell className="font-medium">
                          ${(request.amount / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>{request.payment_method}</TableCell>
                        <TableCell>
                          {getPaymentRequestStatusBadge(request.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No payment requests yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowTopUpModal(true)}
                  >
                    Request Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent purchases and tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Purchases */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Purchases</h3>
                  {isPurchasedContentLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : purchasedContent.length > 0 ? (
                    <div className="space-y-3">
                      {purchasedContent.slice(0, 5).map((purchase) => (
                        <div key={purchase.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {purchase.post_id 
                                ? "Premium Post" 
                                : purchase.message_id 
                                  ? "PPV Message" 
                                  : "Content"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(purchase.created_at)}
                            </p>
                          </div>
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            -${(purchase.amount / 100).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No purchases yet
                    </p>
                  )}
                </div>

                {/* Tips */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tips Sent</h3>
                  {isTipsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : tips.length > 0 ? (
                    <div className="space-y-3">
                      {tips.slice(0, 5).map((tip) => (
                        <div key={tip.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {tip.post_id 
                                ? "Post Tip" 
                                : tip.message_id 
                                  ? "Message Tip" 
                                  : "Tip"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(tip.created_at)}
                            </p>
                          </div>
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            -${(tip.amount / 100).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No tips sent yet
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
