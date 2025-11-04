import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Users, ArrowLeft } from "lucide-react";

interface Analytics {
  totalRevenue: number;
  totalOrders: string;
  totalUsers: string;
  totalProducts: string;
}

export default function AdminAnalytics() {
  const [activeItem, setActiveItem] = useState("analytics");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    switch(id) {
      case "dashboard":
        navigate("/admin");
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
        // Already on analytics page
        break;
      case "branding":
        navigate("/admin/branding");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
    }
  };

  if (authLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        role="admin"
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userName={user?.name || "Admin"}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-analytics">Analytics</h1>
              <p className="text-muted-foreground mt-1">Platform performance and statistics</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card data-testid="card-revenue">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-revenue">
                    GHS {analytics ? analytics.totalRevenue.toFixed(2) : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    All time revenue
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-orders">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-orders">
                    {analytics ? analytics.totalOrders : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Orders placed
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-users">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-users">
                    {analytics ? analytics.totalUsers : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-products">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-products">
                    {analytics ? analytics.totalProducts : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Products listed
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground" data-testid="text-charts-placeholder">
                    Detailed analytics charts coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
