import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/BottomNavigation";
import { formatDistanceToNow } from "date-fns";

export default function MobileNotifications() {
  const [, navigate] = useLocation();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Notifications</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 px-4 pb-3">
          <button className="text-sm font-semibold text-primary border-b-2 border-primary pb-1">
            New
          </button>
          <button className="text-sm text-muted-foreground pb-1">All</button>
        </div>
      </header>

      <main className="p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No notifications</p>
          </div>
        ) : (
          notifications.map((notification: any) => (
            <Card
              key={notification.id}
              className="p-4 border-l-4 border-l-primary space-y-2"
              data-testid={`notification-${notification.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-sm text-primary">
                  {notification.title || "Content"}
                </h3>
                {!notification.isRead && (
                  <Badge className="bg-primary/10 text-primary text-xs">New</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {notification.message ||
                  "In this tutorial, you will learn how to build a Food delivery mobile app without coding"}
              </p>

              {notification.createdAt && (
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </Card>
          ))
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
