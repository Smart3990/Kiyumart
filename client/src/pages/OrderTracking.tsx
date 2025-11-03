import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPhone: string;
  qrCode: string;
  createdAt: string;
}

export default function OrderTracking() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && !!user,
  });

  const hasOrders = orders && orders.length > 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p data-testid="text-loading">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p data-testid="text-loading">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Error loading orders. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Track Your Orders</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {!hasOrders ? (
            <Card className="p-8 text-center">
              <p className="text-lg text-muted-foreground">No orders found</p>
              <Button onClick={() => navigate("/")} className="mt-4">Start Shopping</Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Your Orders</h2>
              {orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Number</p>
                        <p className="text-lg font-semibold" data-testid={`text-order-number-${order.id}`}>
                          #{order.orderNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="text-lg font-semibold capitalize" data-testid={`text-status-${order.id}`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Address</p>
                      <p data-testid={`text-address-${order.id}`}>{order.deliveryAddress}, {order.deliveryCity}</p>
                      <p className="text-sm text-muted-foreground mt-1">Phone: {order.deliveryPhone}</p>
                    </div>

                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-lg font-semibold" data-testid={`text-amount-${order.id}`}>
                          GHS {order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Order Date</p>
                        <p data-testid={`text-date-${order.id}`}>
                          {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Delivery Confirmation QR Code</p>
                      <div className="flex justify-center bg-muted/30 p-6 rounded-lg">
                        <div className="text-center">
                          <QRCodeDisplay
                            value={order.qrCode}
                            title=""
                            description="Show this QR code to the delivery rider to confirm receipt"
                          />
                          <p className="text-xs text-muted-foreground mt-2" data-testid={`text-qr-value-${order.id}`}>
                            {order.qrCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
