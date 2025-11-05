import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/DashboardSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import StoreModeToggle from "@/components/StoreModeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Bell, Check, Trash2, ChevronLeft, Info, AlertCircle, CheckCircle } from "lucide-react";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AgentNotifications() {
  const [activeItem, setActiveItem] = useState("notifications");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "agent")) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated && user?.role === "agent",
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/notifications/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/notifications/mark-all-read", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "All marked as read",
        description: "All notifications have been marked as read",
      });
    },
  });

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    switch(id) {
      case "dashboard":
        navigate("/agent");
        break;
      case "tickets":
        navigate("/agent/tickets");
        break;
      case "customers":
        navigate("/agent/customers");
        break;
      case "messages":
        navigate("/admin/messages");
        break;
      case "notifications":
        navigate("/agent/notifications");
        break;
      case "settings":
        navigate("/settings");
        break;
      default:
        break;
    }
  };

  if (authLoading || !isAuthenticated || user?.role !== "agent") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-agent-notifications" />
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case "info": return <Info className="h-5 w-5 text-blue-500" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={`${!notification.isRead ? "border-primary" : ""}`} data-testid={`notification-${notification.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {getNotificationIcon(notification.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{notification.title}</h3>
              {!notification.isRead && (
                <Badge variant="default" className="text-xs">New</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => markAsReadMutation.mutate(notification.id)}
                data-testid={`button-mark-read-${notification.id}`}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteNotificationMutation.mutate(notification.id)}
              data-testid={`button-delete-${notification.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        role="agent"
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userName={user.name}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/agent")}
              data-testid="button-back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold" data-testid="title-notifications">Notifications</h1>
              <p className="text-sm text-muted-foreground">{unreadNotifications.length} unread</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {unreadNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                data-testid="button-mark-all-read"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
            <StoreModeToggle role="agent" />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="unread" className="space-y-4">
              <TabsList>
                <TabsTrigger value="unread" data-testid="tab-unread">
                  Unread ({unreadNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="read" data-testid="tab-read">
                  Read ({readNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="all" data-testid="tab-all">
                  All ({notifications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unread" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : unreadNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No unread notifications</p>
                    </CardContent>
                  </Card>
                ) : (
                  unreadNotifications.map(notification => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="read" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : readNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No read notifications</p>
                    </CardContent>
                  </Card>
                ) : (
                  readNotifications.map(notification => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : notifications.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No notifications</p>
                    </CardContent>
                  </Card>
                ) : (
                  notifications.map(notification => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
