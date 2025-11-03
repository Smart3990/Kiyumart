import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import DashboardSidebar from "@/components/DashboardSidebar";
import MetricCard from "@/components/MetricCard";
import ProductCard from "@/components/ProductCard";
import ThemeToggle from "@/components/ThemeToggle";
import { DollarSign, Package, ShoppingBag, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
}

interface Product {
  id: string;
  name: string;
  price: string;
  images: string[];
  discount: number | null;
  sellerId: string;
  isActive: boolean;
}

interface Order {
  id: string;
  status: string;
  sellerId: string;
}

export default function SellerDashboardConnected() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "seller")) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated && user?.role === "seller",
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/products?sellerId=${user?.id}`);
      return res.json();
    },
    enabled: isAuthenticated && user?.role === "seller" && !!user?.id,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.role === "seller",
  });

  if (authLoading || !isAuthenticated || user?.role !== "seller") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-seller" />
      </div>
    );
  }

  const pendingOrders = orders.filter(o => 
    o.sellerId === user.id && 
    (o.status === "pending" || o.status === "processing")
  ).length;

  const activeProducts = products.filter(p => p.isActive).length;

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        role="seller"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName={user.name}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Seller Dashboard</h1>
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
                  title="Total Sales"
                  value={`GHS ${parseFloat(analytics.totalRevenue.toString()).toFixed(2)}`}
                  icon={DollarSign}
                  change={18.2}
                />
                <MetricCard
                  title="Total Orders"
                  value={analytics.totalOrders.toString()}
                  icon={Package}
                  change={12.5}
                />
                <MetricCard
                  title="Pending Orders"
                  value={pendingOrders.toString()}
                  icon={ShoppingBag}
                />
                <MetricCard
                  title="Active Products"
                  value={activeProducts.toString()}
                  icon={TrendingUp}
                  change={5.4}
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

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">My Products</h2>
                <Button data-testid="button-add-product">Add New Product</Button>
              </div>

              {productsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={parseFloat(product.price)}
                      image={product.images[0] || ""}
                      discount={product.discount || undefined}
                      rating={4.5}
                      reviewCount={0}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <p className="mb-4">No products yet</p>
                    <Button onClick={() => console.log('Add product')}>
                      Add Your First Product
                    </Button>
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
