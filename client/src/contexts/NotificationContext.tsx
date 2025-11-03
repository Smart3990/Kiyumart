import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { io, Socket } from "socket.io-client";

interface NotificationContextType {
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        isConnectedRef.current = false;
      }
      return;
    }

    const socket = io({
      auth: { userId: user.id }
    });

    socket.on("connect", () => {
      console.log("🔔 Notification system connected");
      isConnectedRef.current = true;
      socket.emit("register", user.id);
    });

    socket.on("disconnect", () => {
      console.log("🔕 Notification system disconnected");
      isConnectedRef.current = false;
    });

    // Order Status Updates
    socket.on("order_status_updated", (data: { 
      orderId: string; 
      orderNumber: string; 
      status: string; 
      updatedAt: string 
    }) => {
      console.log("📦 Order status updated:", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      toast({
        title: "Order Status Updated",
        description: `Order #${data.orderNumber} is now ${data.status}`,
        duration: 5000,
      });

      if (data.status === "delivered") {
        toast({
          title: "🎉 Order Delivered!",
          description: `Order #${data.orderNumber} has been successfully delivered`,
          duration: 7000,
        });
      }
    });

    // Payment Confirmation
    socket.on("payment_completed", (data: {
      orderId: string;
      orderNumber: string;
      amount: string;
      paymentMethod: string;
    }) => {
      console.log("💳 Payment completed:", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: "✅ Payment Successful",
        description: `Payment of ${data.amount} confirmed for Order #${data.orderNumber}`,
        duration: 6000,
      });
    });

    // Payment Failed
    socket.on("payment_failed", (data: {
      orderId: string;
      orderNumber: string;
      reason: string;
    }) => {
      console.log("❌ Payment failed:", data);
      
      toast({
        title: "Payment Failed",
        description: `Payment for Order #${data.orderNumber} failed. ${data.reason}`,
        variant: "destructive",
        duration: 8000,
      });
    });

    // Delivery Updates
    socket.on("rider_location_updated", (data: {
      orderId: string;
      orderNumber: string;
      latitude: string;
      longitude: string;
      timestamp: string;
    }) => {
      console.log("🚚 Rider location updated:", data);
      
      // Only show notification occasionally, not for every location update
      const lastNotification = localStorage.getItem(`rider_notif_${data.orderId}`);
      const now = Date.now();
      
      if (!lastNotification || now - parseInt(lastNotification) > 300000) { // 5 minutes
        localStorage.setItem(`rider_notif_${data.orderId}`, now.toString());
        
        toast({
          title: "Delivery Update",
          description: `Your delivery for Order #${data.orderNumber} is on the way`,
          duration: 4000,
        });
      }
    });

    // Order Shipped
    socket.on("order_shipped", (data: {
      orderId: string;
      orderNumber: string;
      trackingNumber?: string;
    }) => {
      console.log("📮 Order shipped:", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      toast({
        title: "Order Shipped",
        description: data.trackingNumber 
          ? `Order #${data.orderNumber} has been shipped. Tracking: ${data.trackingNumber}`
          : `Order #${data.orderNumber} has been shipped`,
        duration: 6000,
      });
    });

    // New Product Available (for wishlist items)
    socket.on("product_back_in_stock", (data: {
      productId: string;
      productName: string;
    }) => {
      console.log("📢 Product back in stock:", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      
      toast({
        title: "Product Available",
        description: `${data.productName} is back in stock!`,
        duration: 7000,
      });
    });

    // General Notifications
    socket.on("notification", (data: {
      title: string;
      message: string;
      type?: "default" | "success" | "error" | "warning";
    }) => {
      console.log("📬 General notification:", data);
      
      toast({
        title: data.title,
        description: data.message,
        variant: data.type === "error" ? "destructive" : "default",
        duration: 5000,
      });
    });

    // Promotional/Marketing Messages
    socket.on("promotion", (data: {
      title: string;
      message: string;
      code?: string;
    }) => {
      console.log("🎁 Promotion:", data);
      
      toast({
        title: data.title,
        description: data.code 
          ? `${data.message} Use code: ${data.code}`
          : data.message,
        duration: 8000,
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [user?.id, toast]);

  return (
    <NotificationContext.Provider value={{ isConnected: isConnectedRef.current }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
