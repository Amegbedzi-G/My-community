import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import DesktopNavigation from "@/components/layout/DesktopNavigation";
import MobileNavigation from "@/components/layout/MobileNavigation";
import MobileHeader from "@/components/layout/MobileHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <DesktopNavigation />
      <MobileHeader />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row container mx-auto max-w-6xl px-4 py-6 mt-14 md:mt-0 pb-20 md:pb-6">
        {children}
      </div>

      <MobileNavigation />
    </div>
  );
}