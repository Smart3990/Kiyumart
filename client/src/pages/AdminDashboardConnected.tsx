import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import DashboardSidebar from "@/components/DashboardSidebar";
import MetricCard from "@/components/MetricCard";
import OrderCard from "@/components/OrderCard";
import ThemeToggle from "@/components/ThemeToggle";
import { DollarSign, ShoppingBag, Users, Truck, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  deliveryMethod: string;
  total: string;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function AdminDashboardConnected() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  useEffect(() => {
    // Navigate when sidebar item is clicked
    switch(activeItem) {
      case "dashboard":
        // Already on dashboard
        break;
      case "mode":
        navigate("/admin/settings");
        break;
      case "categories":
        navigate("/admin/categories");
        break;
      case "products":
        navigate("/admin/products");
        break;
      case "orders":
        navigate("/admin/orders");
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "riders":
        navigate("/admin/riders");
        break;
      case "zones":
        navigate("/admin/zones");
        break;
      case "messages":
        navigate("/admin/messages");
        break;
      case "analytics":
        navigate("/admin/analytics");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
    }
  }, [activeItem, navigate]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: buyers = [] } = useQuery<User[]>({
    queryKey: ["/api/users", "buyer"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=buyer");
      return res.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  if (authLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-admin" />
      </div>
    );
  }

  const recentOrders = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const buyerMap = new Map(buyers.map(b => [b.id, b]));

  const deliveredCount = orders.filter(o => o.status === "delivered").length;

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        role="admin"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName={user.name}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Admin Dashboard</h1>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {analyticsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={`GHS ${parseFloat(analytics.totalRevenue.toString()).toFixed(2)}`}
                  icon={DollarSign}
                  change={12.5}
                />
                <MetricCard
                  title="Total Orders"
                  value={analytics.totalOrders.toString()}
                  icon={ShoppingBag}
                  change={8.2}
                />
                <MetricCard
                  title="Total Users"
                  value={analytics.totalUsers.toString()}
                  icon={Users}
                  change={-3.1}
                />
                <MetricCard
                  title="Deliveries"
                  value={deliveredCount.toString()}
                  icon={Truck}
                  change={15.3}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed to load analytics</span>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Platform Settings</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/admin/settings")}
                  data-testid="button-configure"
                >
                  Configure
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold">Platform Configuration</p>
                      <p className="text-sm text-muted-foreground">
                        Manage payment settings, contact info, and branding
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <Button variant="outline" onClick={() => navigate("/orders")} data-testid="button-view-all">View All</Button>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentOrders.map((order) => {
                    const buyer = buyerMap.get(order.buyerId);
                    const orderDate = new Date(order.createdAt);
                    const formattedDate = orderDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    });

                    return (
                      <OrderCard
                        key={order.id}
                        orderId={order.orderNumber}
                        customerName={buyer?.name || "Unknown Customer"}
                        items={1}
                        total={parseFloat(order.total)}
                        status={order.status as any}
                        deliveryMethod={order.deliveryMethod as any}
                        date={formattedDate}
                        onViewDetails={(id) => console.log('View details:', id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No orders yet
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
