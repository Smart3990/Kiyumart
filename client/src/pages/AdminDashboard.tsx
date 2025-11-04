import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MetricCard from "@/components/MetricCard";
import OrderCard from "@/components/OrderCard";
import ThemeToggle from "@/components/ThemeToggle";
import StoreModeToggle from "@/components/StoreModeToggle";
import { DollarSign, ShoppingBag, Users, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [activeItem, setActiveItem] = useState("dashboard");

  const recentOrders = [
    {
      orderId: "ORD-001",
      customerName: "Sarah Johnson",
      items: 3,
      total: 459.97,
      status: "processing" as const,
      deliveryMethod: "rider" as const,
      date: "Nov 2, 2024",
    },
    {
      orderId: "ORD-002",
      customerName: "Michael Brown",
      items: 1,
      total: 299.99,
      status: "shipped" as const,
      deliveryMethod: "bus" as const,
      date: "Nov 1, 2024",
    },
    {
      orderId: "ORD-003",
      customerName: "Emma Wilson",
      items: 2,
      total: 179.98,
      status: "delivered" as const,
      deliveryMethod: "pickup" as const,
      date: "Oct 30, 2024",
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        role="admin"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName="Admin User"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <StoreModeToggle role="admin" />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value="GHS 45,231"
                icon={DollarSign}
                change={12.5}
              />
              <MetricCard
                title="Total Orders"
                value="1,234"
                icon={ShoppingBag}
                change={8.2}
              />
              <MetricCard
                title="Active Users"
                value="892"
                icon={Users}
                change={-3.1}
              />
              <MetricCard
                title="Deliveries"
                value="456"
                icon={Truck}
                change={15.3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <Button variant="outline">View All</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    {...order}
                    onViewDetails={(id) => console.log('View details:', id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
