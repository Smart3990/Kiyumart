import DeliveryTracker from "@/components/DeliveryTracker";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function OrderTracking() {
  const trackingSteps = [
    { label: 'Order Placed', time: 'Nov 2, 10:30 AM', completed: true },
    { label: 'Order Confirmed', time: 'Nov 2, 10:35 AM', completed: true },
    { label: 'Out for Delivery', time: 'Nov 2, 2:15 PM', completed: true },
    { label: 'Delivered', completed: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Track Your Order</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DeliveryTracker
            orderId="ORD-001"
            riderName="Kwame Mensah"
            riderPhone="+233 XX XXX XXXX"
            steps={trackingSteps}
            estimatedArrival="3:30 PM"
          />
          
          <div className="flex items-center justify-center">
            <QRCodeDisplay
              value="ORD-001-2024-11-02"
              title="Delivery Confirmation Code"
              description="Show this QR code to the delivery rider to confirm receipt of your order"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
