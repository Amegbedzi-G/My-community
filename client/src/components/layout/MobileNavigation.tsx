import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  HomeIcon, 
  MessageSquareIcon, 
  PlusSquareIcon, 
  UserIcon, 
  SettingsIcon 
} from "lucide-react";

export default function MobileNavigation() {
  const { user, isAdmin } = useAuth();
  const [location] = useLocation();

  const isActiveRoute = (route: string) => {
    return location === route;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-20">
      <div className="flex justify-around items-center py-3">
        <Link href="/home">
          <a className={`flex flex-col items-center ${isActiveRoute("/home") ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            <HomeIcon className="text-xl h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/messages">
          <a className={`flex flex-col items-center ${isActiveRoute("/messages") ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            <MessageSquareIcon className="text-xl h-5 w-5" />
            <span className="text-xs mt-1">Messages</span>
          </a>
        </Link>
        
        {/* Admin-only icon */}
        {isAdmin ? (
          <Link href="/admin/add-post">
            <a className={`flex flex-col items-center ${isActiveRoute("/admin/add-post") ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
              <PlusSquareIcon className="text-xl h-5 w-5" />
              <span className="text-xs mt-1">Add Post</span>
            </a>
          </Link>
        ) : null}
        
        <Link href="/profile">
          <a className={`flex flex-col items-center ${isActiveRoute("/profile") ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            <UserIcon className="text-xl h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
        
        {/* Only show settings for non-admin */}
        {!isAdmin && (
          <Link href="/settings">
            <a className={`flex flex-col items-center ${isActiveRoute("/settings") ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
              <SettingsIcon className="text-xl h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
            </a>
          </Link>
        )}
      </div>
    </div>
  );
}
