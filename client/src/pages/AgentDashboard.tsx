import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import DashboardSidebar from "@/components/DashboardSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Users, MessageSquare, CheckCircle, Loader2 } from "lucide-react";

export default function AgentDashboard() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "agent")) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-agent" />
      </div>
    );
  }

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
          <div>
            <h1 className="text-2xl font-bold" data-testid="title-agent-dashboard">Agent Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => navigate("/")} data-testid="button-shop">
              Shop
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-open-tickets">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>

              <Card data-testid="card-resolved-tickets">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Closed tickets</p>
                </CardContent>
              </Card>

              <Card data-testid="card-total-customers">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">All customers</p>
                </CardContent>
              </Card>

              <Card data-testid="card-unread-messages">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">New messages</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>No recent activity</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
