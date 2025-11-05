import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MessageSquare, Send, ArrowLeft } from "lucide-react";

export default function AdminMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    enabled: isAuthenticated && user?.role === "admin",
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  if (authLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-messages">Messages</h1>
              <p className="text-muted-foreground mt-1">Customer support and communications</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-messages"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Conversations</h3>
                {unreadData && unreadData.count > 0 && (
                  <Badge variant="destructive" data-testid="badge-unread-count">
                    {unreadData.count} unread
                  </Badge>
                )}
              </div>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground" data-testid="text-no-conversations">
                  No conversations yet
                </p>
              </div>
            </Card>
            
            <Card className="md:col-span-2 p-4">
              <div className="flex flex-col h-[600px]">
                <div className="flex-1 border-b mb-4 pb-4">
                  <div className="text-center py-24">
                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground" data-testid="text-select-conversation">
                      Select a conversation to view messages
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    disabled
                    data-testid="input-message"
                  />
                  <Button disabled data-testid="button-send">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
    </DashboardLayout>
  );
}
