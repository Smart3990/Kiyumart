import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, MessageSquare, Send, ArrowLeft, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserData {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function AdminMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Get userId from URL search params if present (when clicking from AdminUsers)
  const urlParams = new URLSearchParams(window.location.search);
  const userIdFilter = urlParams.get("userId");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "super_admin"))) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: users = [], isLoading: usersLoading } = useQuery<UserData[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "super_admin"),
  });

  // Auto-select user when filtering by userId
  useEffect(() => {
    if (userIdFilter && users.length > 0 && !selectedUserId) {
      const targetUser = users.find(u => u.id === userIdFilter);
      if (targetUser) {
        setSelectedUserId(targetUser.id);
      }
    }
  }, [userIdFilter, users, selectedUserId]);

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!selectedUserId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; message: string }) => {
      return apiRequest("POST", "/api/messages", {
        receiverId: data.receiverId,
        message: data.message,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (message.trim() && selectedUserId) {
      sendMessageMutation.mutate({
        receiverId: selectedUserId,
        message: message.trim(),
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role.toLowerCase()) {
      case "admin": return "bg-purple-500 text-white";
      case "seller": return "bg-blue-500 text-white";
      case "buyer": return "bg-green-500 text-white";
      case "rider": return "bg-orange-500 text-white";
      case "agent": return "bg-pink-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const filterUsersByRole = (users: UserData[], role: string) => {
    if (role === "all") return users;
    return users.filter(u => u.role === role);
  };

  const filterUsersBySearch = (users: UserData[], query: string) => {
    if (!query) return users;
    const lowerQuery = query.toLowerCase();
    return users.filter(u => 
      (u.username?.toLowerCase() || '').includes(lowerQuery) ||
      (u.name?.toLowerCase() || '').includes(lowerQuery) ||
      (u.email?.toLowerCase() || '').includes(lowerQuery)
    );
  };

  // Filter out the current admin user from the list
  const otherUsers = users.filter(u => u.id !== user?.id);
  const filteredUsers = filterUsersBySearch(
    filterUsersByRole(otherUsers, selectedRole),
    searchQuery
  );

  const rolesCounts = {
    all: otherUsers.length,
    admin: otherUsers.filter(u => u.role === "admin").length,
    seller: otherUsers.filter(u => u.role === "seller").length,
    buyer: otherUsers.filter(u => u.role === "buyer").length,
    rider: otherUsers.filter(u => u.role === "rider").length,
    agent: otherUsers.filter(u => u.role === "agent").length,
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  if (authLoading || !isAuthenticated || (user?.role !== "admin" && user?.role !== "super_admin")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout role={user?.role as any}>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground" data-testid="heading-messages">Messages</h1>
            <p className="text-muted-foreground mt-1">Chat with users on the platform</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
              <h3 className="font-semibold">Users</h3>
              <Badge variant="secondary" data-testid="badge-total-count">
                {filteredUsers.length}
              </Badge>
            </div>
            
            <Tabs value={selectedRole} onValueChange={setSelectedRole} className="mb-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" data-testid="tab-all">All ({rolesCounts.all})</TabsTrigger>
                <TabsTrigger value="seller" data-testid="tab-seller">Sellers ({rolesCounts.seller})</TabsTrigger>
                <TabsTrigger value="buyer" data-testid="tab-buyer">Buyers ({rolesCounts.buyer})</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-3 mt-2">
                <TabsTrigger value="rider" data-testid="tab-rider">Riders ({rolesCounts.rider})</TabsTrigger>
                <TabsTrigger value="admin" data-testid="tab-admin">Admins ({rolesCounts.admin})</TabsTrigger>
                <TabsTrigger value="agent" data-testid="tab-agent">Agents ({rolesCounts.agent})</TabsTrigger>
              </TabsList>
            </Tabs>

            <ScrollArea className="h-[500px]">
              {usersLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground" data-testid="text-no-users">
                    No users found
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((userData) => (
                    <div
                      key={userData.id}
                      onClick={() => setSelectedUserId(userData.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUserId === userData.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-accent border-transparent"
                      }`}
                      data-testid={`user-${userData.id}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-sm line-clamp-1">{userData.name || userData.username}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleBadgeColor(userData.role)} data-testid={`badge-role-${userData.id}`}>
                          {userData.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">{userData.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          <Card className="md:col-span-2 p-4">
            {selectedUser ? (
              <div className="flex flex-col h-[600px]">
                <div className="flex items-center justify-between pb-4 border-b mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedUser.name || selectedUser.username}</h3>
                      <p className="text-sm text-muted-foreground">{selectedUser.email} • {selectedUser.role}</p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 mb-4">
                  {messagesLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground" data-testid="text-no-messages">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.senderId === user?.id ? "flex-row-reverse" : ""}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className={`flex-1 ${msg.senderId === user?.id ? "text-right" : ""}`}>
                            <div
                              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                                msg.senderId === user?.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-accent"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    data-testid="button-send"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[600px]">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground" data-testid="text-select-user">
                      Select a user to start messaging
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
