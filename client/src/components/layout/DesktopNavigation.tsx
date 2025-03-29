import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDownIcon } from "lucide-react";

export default function DesktopNavigation() {
  const { user, isAdmin, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 hidden md:block">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-primary-dark"
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
          <Link href="/home">
            <span className="font-bold text-xl cursor-pointer">CreatorConnect</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link href="/home">
            <a className="hover:text-primary-dark transition-colors">Home</a>
          </Link>
          <Link href="/messages">
            <a className="hover:text-primary-dark transition-colors">Messages</a>
          </Link>
          <Link href="/wallet">
            <a className="hover:text-primary-dark transition-colors">Wallet</a>
          </Link>
          <Link href="/profile">
            <a className="hover:text-primary-dark transition-colors">Profile</a>
          </Link>
          
          {/* Admin-only navigation items */}
          {isAdmin && (
            <>
              <Link href="/admin/add-post">
                <a className="hover:text-primary-dark transition-colors">Add Post</a>
              </Link>
              <Link href="/admin/dashboard">
                <a className="hover:text-primary-dark transition-colors">Dashboard</a>
              </Link>
            </>
          )}
          
          {/* User avatar dropdown */}
          <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-8">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} alt={user?.name || "User"} />
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/subscriptions")}>
                Subscriptions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400" 
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
