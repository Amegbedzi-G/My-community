import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { TipOption } from "@/lib/types";
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

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: number;
  postId?: number;
  messageId?: number;
}

export function TipModal({ 
  isOpen, 
  onClose, 
  receiverId, 
  postId, 
  messageId 
}: TipModalProps) {
  const { toast } = useToast();
  const { balance } = useWallet();
  
  const tipOptions: TipOption[] = [
    { amount: 200, label: "$2" },
    { amount: 500, label: "$5" },
    { amount: 1000, label: "$10" },
    { amount: 2000, label: "$20" },
  ];
  
  const [selectedAmount, setSelectedAmount] = useState<number>(1000); // Default to $10
  const [customAmount, setCustomAmount] = useState<string>("");
  
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
  
  const selectTipOption = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };
  
  const tipMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/tips", {
        receiver_id: receiverId,
        amount: selectedAmount,
        post_id: postId,
        message_id: messageId
      });
    },
    onSuccess: () => {
      toast({
        title: "Tip sent!",
        description: `You sent $${(selectedAmount / 100).toFixed(2)} as a tip.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send tip",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const handleSendTip = () => {
    if (!selectedAmount || selectedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid tip amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (balance !== null && selectedAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "Please top up your wallet to send this tip.",
        variant: "destructive",
      });
      return;
    }
    
    tipMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Send a Tip</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Show your appreciation with a tip:</p>
          
          <div className="flex justify-center space-x-3 mb-6">
            {tipOptions.map((option) => (
              <Button
                key={option.amount}
                variant={selectedAmount === option.amount ? "default" : "outline"}
                className={selectedAmount === option.amount 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }
                onClick={() => selectTipOption(option.amount)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          <div className="relative mb-6">
            <Label htmlFor="custom-amount" className="sr-only">Custom amount</Label>
            <div className="relative">
              <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <Input
                id="custom-amount"
                type="text"
                placeholder="Custom amount"
                className="pl-8 text-center"
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Your wallet balance:</span>
              <span className="font-semibold">${balance !== null ? (balance / 100).toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Amount to tip:</span>
              <span className="text-primary">${(selectedAmount / 100).toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            variant="default" 
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold"
            onClick={handleSendTip}
            disabled={tipMutation.isPending}
          >
            {tipMutation.isPending ? "Sending..." : "Send Tip"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
