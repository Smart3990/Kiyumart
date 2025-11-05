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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, MessageSquare, Send, ArrowLeft, CheckCircle2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SupportConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  agentId: string | null;
  agentName: string | null;
  status: "open" | "assigned" | "resolved";
  subject: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export default function AdminMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<SupportConversation[]>({
    queryKey: ["/api/support/conversations"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/support/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; message: string }) => {
      return apiRequest("POST", `/api/support/conversations/${data.conversationId}/messages`, {
        message: data.message,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/support/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/conversations"] });
    },
  });

  const resolveConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest("POST", `/api/support/conversations/${conversationId}/resolve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/conversations"] });
      toast({
        title: "Conversation Resolved",
        description: "This support ticket has been marked as resolved",
      });
    },
  });

  const handleSendMessage = () => {
    if (message.trim() && selectedConversation) {
      sendMessageMutation.mutate({
        conversationId: selectedConversation,
        message: message.trim(),
      });
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

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
              <Badge variant="secondary" data-testid="badge-total-count">
                {filteredConversations.length}
              </Badge>
            </div>
            <ScrollArea className="h-[600px]">
              {conversationsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground" data-testid="text-no-conversations">
                    No conversations yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedConversation === conv.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-accent border-transparent"
                      }`}
                      data-testid={`conversation-${conv.id}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm line-clamp-1">{conv.subject}</p>
                        <Badge
                          variant={
                            conv.status === "resolved"
                              ? "secondary"
                              : conv.status === "assigned"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs ml-2"
                        >
                          {conv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{conv.customerName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{conv.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          <Card className="md:col-span-2 p-4">
            {selectedConv ? (
              <div className="flex flex-col h-[600px]">
                <div className="flex items-center justify-between pb-4 border-b mb-4">
                  <div>
                    <h3 className="font-semibold">{selectedConv.subject}</h3>
                    <p className="text-sm text-muted-foreground">{selectedConv.customerName} • {selectedConv.customerEmail}</p>
                  </div>
                  {selectedConv.status !== "resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveConversationMutation.mutate(selectedConv.id)}
                      disabled={resolveConversationMutation.isPending}
                      data-testid="button-resolve"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                </div>

                <ScrollArea className="flex-1 mb-4">
                  {messagesLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
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
                            <p className="text-xs text-muted-foreground mb-1">{msg.senderName}</p>
                            <div
                              className={`inline-block p-3 rounded-lg ${
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
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={selectedConv.status === "resolved" || sendMessageMutation.isPending}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || selectedConv.status === "resolved" || sendMessageMutation.isPending}
                    data-testid="button-send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[600px]">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground" data-testid="text-select-conversation">
                      Select a conversation to view messages
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
