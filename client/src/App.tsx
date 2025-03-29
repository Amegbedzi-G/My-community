import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeToggle";
import { AuthProvider } from "@/hooks/use-auth";
import { WalletProvider } from "@/hooks/use-wallet";

import NotFound from "@/pages/not-found";
import LandingPage from "@/components/LandingPage";
import HomePage from "@/pages/home-page";
import MessagesPage from "@/pages/messages-page";
import ProfilePage from "@/pages/profile-page";
import WalletPage from "@/pages/wallet-page";
import SubscriptionsPage from "@/pages/subscriptions-page";
import SettingsPage from "@/pages/settings-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/admin/dashboard-page";
import AddPostPage from "@/pages/admin/add-post-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/wallet" component={WalletPage} />
      <ProtectedRoute path="/subscriptions" component={SubscriptionsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/admin/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/admin/add-post" component={AddPostPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WalletProvider>
            <Router />
            <Toaster />
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
