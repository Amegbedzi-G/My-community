import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import DesktopNavigation from "@/components/layout/DesktopNavigation";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { PaymentRequest, DashboardStats } from "@/lib/types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import {
  UsersIcon,
  DollarSignIcon,
  ImageIcon,
  UserIcon,
  BarChart3Icon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for charts
const earningsData = [
  { name: 'Jan', amount: 1200 },
  { name: 'Feb', amount: 1900 },
  { name: 'Mar', amount: 2400 },
  { name: 'Apr', amount: 1800 },
  { name: 'May', amount: 2800 },
  { name: 'Jun', amount: 3200 },
  { name: 'Jul', amount: 3800 },
];

const subscribersData = [
  { name: 'Jan', users: 25 },
  { name: 'Feb', users: 42 },
  { name: 'Mar', users: 68 },
  { name: 'Apr', users: 103 },
  { name: 'May', users: 142 },
  { name: 'Jun', users: 198 },
  { name: 'Jul', users: 256 },
];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin && user) {
      navigate("/home");
    }
  }, [isAdmin, user, navigate]);
  
  const { 
    data: stats = { totalUsers: 0, totalPosts: 0, totalSubscribers: 0, totalEarnings: 0 },
    isLoading: isStatsLoading,
  } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!isAdmin,
  });
  
  const { 
    data: pendingPaymentRequests = [],
    isLoading: isPaymentRequestsLoading,
  } = useQuery<PaymentRequest[]>({
    queryKey: ["/api/admin/payment-requests"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!isAdmin,
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
  
  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <DesktopNavigation />
      
      <div className="container mx-auto max-w-6xl px-4 py-6 pb-20 md:pb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your content, users, and earnings
            </p>
          </div>
          <Button 
            variant="default" 
            onClick={() => navigate("/admin/add-post")}
            className="hidden md:flex items-center"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Add New Post
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mb-2">
                <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mb-2">
                <DollarSignIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold">${(stats.totalEarnings / 100).toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mb-2">
                <ImageIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full mb-2">
                <UserIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-sm font-medium">Subscribers</p>
              <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Monthly earnings in USD ($)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80 w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Earnings']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar dataKey="amount" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Subscriber Growth</CardTitle>
              <CardDescription>Monthly subscribers count</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80 w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={subscribersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Subscribers']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#ec4899" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Pending Payment Requests */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Requests</CardTitle>
            <CardDescription>
              Review and manage pending payment requests from users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPaymentRequestsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pendingPaymentRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No pending payment requests
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPaymentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {(request.user?.name || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium line-clamp-1">{request.user?.name || "Unknown User"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {request.user?.username || "unknown"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell className="font-medium">
                        ${(request.amount / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>{request.payment_method}</TableCell>
                      <TableCell>
                        {getPaymentRequestStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm">View All Requests</Button>
          </CardFooter>
        </Card>
        
        {/* Recent Activity Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <Tabs defaultValue="posts" className="p-4">
            <TabsList className="mb-4">
              <TabsTrigger value="posts">
                <ImageIcon className="w-4 h-4 mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="users">
                <UsersIcon className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="earnings">
                <BarChart3Icon className="w-4 h-4 mr-2" />
                Earnings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Recent post activity will appear here
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Recent user activity will appear here
              </div>
            </TabsContent>
            
            <TabsContent value="earnings">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Recent earnings will appear here
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
