import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PaymentRequest } from "@shared/schema";

interface WalletContextType {
  balance: number | null;
  isLoading: boolean;
  error: Error | null;
  topUpMutation: ReturnType<typeof useTopUpMutation>;
  paymentRequests: PaymentRequest[] | null;
  isPaymentRequestsLoading: boolean;
}

// Custom hook for top up mutation
function useTopUpMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ amount, payment_method }: { amount: number; payment_method: string }) => {
      const res = await apiRequest("POST", "/api/payment-requests", { amount, payment_method });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests"] });
      toast({
        title: "Payment request submitted",
        description: "Your payment request has been submitted to the admin for approval.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const {
    data: walletData,
    error,
    isLoading,
  } = useQuery<{ balance: number }, Error>({
    queryKey: ["/api/wallet"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  const {
    data: paymentRequests,
    isLoading: isPaymentRequestsLoading,
  } = useQuery<PaymentRequest[], Error>({
    queryKey: ["/api/payment-requests"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  const topUpMutation = useTopUpMutation();

  return (
    <WalletContext.Provider
      value={{
        balance: walletData?.balance ?? null,
        isLoading,
        error,
        topUpMutation,
        paymentRequests: paymentRequests ?? null,
        isPaymentRequestsLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
