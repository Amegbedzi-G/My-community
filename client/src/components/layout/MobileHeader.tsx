import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export default function MobileHeader() {
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-20 px-4 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M16.5 7.5v.001"></path>
          </svg>
          <span className="font-bold text-lg">CreatorConnect</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 dark:text-gray-300"
          onClick={handleLogout}
        >
          <LogOutIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}