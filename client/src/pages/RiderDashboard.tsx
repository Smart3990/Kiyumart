import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import DashboardSidebar from "@/components/DashboardSidebar";
import MetricCard from "@/components/MetricCard";
import OrderCard from "@/components/OrderCard";
import DeliveryTracker from "@/components/DeliveryTracker";
import ThemeToggle from "@/components/ThemeToggle";
import StoreModeToggle from "@/components/StoreModeToggle";
import { DollarSign, Package, MapPin, Star, Loader2 } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  riderId: string | null;
  deliveryMethod: string;
  total: string;
  status: string;
  createdAt: string;
}

export default function RiderDashboard() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "rider")) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.role === "rider",
  });

  if (authLoading || !isAuthenticated || user?.role !== "rider") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-rider" />
      </div>
    );
  }

  const myDeliveries = orders.filter(o => o.riderId === user.id);
  const activeDeliveries = myDeliveries.filter(o => 
    o.status === "processing" || o.status === "delivering"
  );
  const completedDeliveries = myDeliveries.filter(o => o.status === "delivered");
  
  const todayEarnings = completedDeliveries
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, o) => sum + parseFloat(o.total) * 0.1, 0);

  const trackingSteps = [
    { label: 'Order Picked Up', time: 'Today, 2:00 PM', completed: true },
    { label: 'En Route', time: 'Today, 2:30 PM', completed: true },
    { label: 'Nearby', completed: false },
    { label: 'Delivered', completed: false },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        role="rider"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName={user.name}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Rider Dashboard</h1>
          <div className="flex items-center gap-4">
            <StoreModeToggle role="rider" />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {ordersLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Today's Earnings"
                    value={`GHS ${todayEarnings.toFixed(2)}`}
                    icon={DollarSign}
                  />
                  <MetricCard
                    title="Completed Deliveries"
                    value={completedDeliveries.length.toString()}
                    icon={Package}
                  />
                  <MetricCard
                    title="Active Deliveries"
                    value={activeDeliveries.length.toString()}
                    icon={MapPin}
                  />
                  <MetricCard
                    title="Rating"
                    value="0.0"
                    icon={Star}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold" data-testid="text-active-deliveries">Active Deliveries</h2>
                    {activeDeliveries.length > 0 ? (
                      activeDeliveries.map((order) => (
                        <OrderCard
                          key={order.id}
                          orderId={order.orderNumber}
                          customerName="Customer"
                          items={1}
                          total={parseFloat(order.total)}
                          status={order.status as any}
                          deliveryMethod={order.deliveryMethod as any}
                          date={new Date(order.createdAt).toLocaleDateString()}
                          onViewDetails={(id) => navigate(`/track?orderId=${id}`)}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8" data-testid="text-no-deliveries">
                        No active deliveries
                      </p>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-4">Current Route</h2>
                    {activeDeliveries.length > 0 ? (
                      <DeliveryTracker
                        orderId={activeDeliveries[0].orderNumber}
                        riderName={user.name}
                        steps={trackingSteps}
                        estimatedArrival="3:15 PM"
                      />
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No active route
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
