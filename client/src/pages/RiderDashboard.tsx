import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MetricCard from "@/components/MetricCard";
import OrderCard from "@/components/OrderCard";
import DeliveryTracker from "@/components/DeliveryTracker";
import ThemeToggle from "@/components/ThemeToggle";
import { DollarSign, Package, MapPin, Star } from "lucide-react";

export default function RiderDashboard() {
  const [activeItem, setActiveItem] = useState("dashboard");

  const activeDeliveries = [
    {
      orderId: "ORD-004",
      customerName: "Alice Cooper",
      items: 2,
      total: 259.98,
      status: "shipped" as const,
      deliveryMethod: "rider" as const,
      date: "Nov 2, 2024",
    },
    {
      orderId: "ORD-005",
      customerName: "Bob Martin",
      items: 1,
      total: 89.99,
      status: "shipped" as const,
      deliveryMethod: "rider" as const,
      date: "Nov 2, 2024",
    },
  ];

  const trackingSteps = [
    { label: 'Order Picked Up', time: 'Nov 2, 2:00 PM', completed: true },
    { label: 'En Route', time: 'Nov 2, 2:30 PM', completed: true },
    { label: 'Nearby', completed: false },
    { label: 'Delivered', completed: false },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        role="rider"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName="Rider Name"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Rider Dashboard</h1>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Today's Earnings"
                value="GHS 145"
                icon={DollarSign}
                change={25.0}
              />
              <MetricCard
                title="Completed Deliveries"
                value="8"
                icon={Package}
              />
              <MetricCard
                title="Active Deliveries"
                value="2"
                icon={MapPin}
              />
              <MetricCard
                title="Rating"
                value="4.8"
                icon={Star}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Active Deliveries</h2>
                {activeDeliveries.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    {...order}
                    onViewDetails={(id) => console.log('View details:', id)}
                  />
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Current Route</h2>
                <DeliveryTracker
                  orderId="ORD-004"
                  riderName="You"
                  steps={trackingSteps}
                  estimatedArrival="3:15 PM"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
