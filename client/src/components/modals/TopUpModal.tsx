import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { PaymentMethod, TopUpOption } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XIcon, DollarSignIcon } from "lucide-react";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const { topUpMutation } = useWallet();
  const { toast } = useToast();
  
  const topUpOptions: TopUpOption[] = [
    { amount: 1000, label: "$10" },
    { amount: 2000, label: "$20" },
    { amount: 5000, label: "$50" },
    { amount: 10000, label: "$100" },
  ];
  
  const paymentMethods: { id: PaymentMethod; label: string; icon: JSX.Element }[] = [
    { 
      id: "PayPal", 
      label: "PayPal", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.58 2.965-2.68 6.19-7.993 6.19H9.39c-.525 0-.968.382-1.05.9l-1.154 7.323h3.919c.524 0 .968-.382 1.05-.9l.468-2.965c.082-.518.526-.9 1.051-.9h1.324c4.313 0 7.732-1.76 8.727-6.853.402-2.047.204-3.824-.503-5.059v1.55z"/>
        </svg>
      ),
    },
    { 
      id: "Card", 
      label: "Card", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      ),
    },
    { 
      id: "Apple Pay", 
      label: "Apple Pay", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.5 2.8c0.7-0.9 1.2-2.1 1.1-3.3-1 0-2.3 0.7-3.1 1.6-0.7 0.8-1.2 1.9-1.1 3.2 1.1 0 2.2-0.6 3.1-1.5zM15.6 4.4c-1.7-0.1-3.2 1-4.1 1-0.9 0-2.2-0.9-3.6-0.9-1.9 0-3.5 1.1-4.4 2.7-1.9 3.3-0.5 8.1 1.3 10.7 0.9 1.3 2 2.7 3.4 2.7 1.4-0 1.9-0.9 3.5-0.9 1.6 0 2.1 0.9 3.5 0.9 1.4 0 2.4-1.3 3.3-2.6 0.7-0.9 1.1-1.9 1.4-3-3.4-1.3-3.9-6-0.5-7.8-1-1.2-2.3-1.9-3.8-1.8z"></path>
        </svg>
      ),
    },
  ];
  
  const [selectedAmount, setSelectedAmount] = useState<number>(5000); // Default to $50
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("Card");
  
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setCustomAmount(value);
    
    // Update selected amount if valid
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setSelectedAmount(Math.round(numericValue * 100)); // Convert to cents
    }
  };
  
  const selectTopUpOption = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };
  
  const handleRequestPayment = () => {
    if (!selectedAmount || selectedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to top up.",
        variant: "destructive",
      });
      return;
    }
    
    topUpMutation.mutate(
      { 
        amount: selectedAmount, 
        payment_method: selectedPaymentMethod 
      },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Top Up Wallet</DialogTitle>
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
          <p className="text-gray-600 dark:text-gray-300 mb-4">Select amount to add to your wallet:</p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {topUpOptions.map((option) => (
              <Button
                key={option.amount}
                variant={selectedAmount === option.amount ? "default" : "outline"}
                className={selectedAmount === option.amount 
                  ? "bg-primary text-white font-medium" 
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
                }
                onClick={() => selectTopUpOption(option.amount)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          <div className="relative mb-6">
            <Label htmlFor="topup-amount" className="block text-gray-700 dark:text-gray-300 mb-2">Custom amount</Label>
            <div className="relative">
              <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <Input
                id="topup-amount"
                type="text"
                placeholder="Enter amount"
                className="pl-8"
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <Label className="block text-gray-700 dark:text-gray-300 mb-2">Payment Method</Label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                  className={`py-3 px-2 rounded-lg font-medium flex flex-col items-center ${
                    selectedPaymentMethod === method.id 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="mb-1">{method.icon}</div>
                  <span className="text-sm">{method.label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            variant="default" 
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold"
            onClick={handleRequestPayment}
            disabled={topUpMutation.isPending}
          >
            {topUpMutation.isPending ? "Processing..." : "Request Payment"}
          </Button>
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
            After requesting payment, the admin will provide payment details and verify your transaction
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
