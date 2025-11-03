import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import ChatInterface from "@/components/ChatInterface";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ChatPageConnected() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user) return;

    const socket = io({
      auth: { userId: user.id }
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("register", user.id);
    });

    socket.on("new_message", (message: ChatMessage) => {
      if (message.senderId === selectedContact?.id || message.receiverId === selectedContact?.id) {
        setMessages((prev) => [...prev, message]);
      }
      
      if (message.senderId !== user.id) {
        toast({
          title: "New Message",
          description: `${message.senderId}: ${message.message.substring(0, 50)}...`,
        });
      }
    });


    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user, selectedContact, toast]);

  const { data: contacts = [], isLoading: contactsLoading } = useQuery<User[]>({
    queryKey: ["/api/users", "all", user?.role],
    queryFn: async () => {
      if (user?.role === "admin") {
        const sellersRes = await apiRequest("GET", "/api/users?role=seller");
        const buyersRes = await apiRequest("GET", "/api/users?role=buyer");
        const ridersRes = await apiRequest("GET", "/api/users?role=rider");
        
        const sellers = await sellersRes.json();
        const buyers = await buyersRes.json();
        const riders = await ridersRes.json();
        
        return [...sellers, ...buyers, ...riders].filter(u => u.id !== user?.id);
      } else {
        const adminsRes = await apiRequest("GET", "/api/support/contacts");
        const admins = await adminsRes.json();
        return admins;
      }
    },
    enabled: isAuthenticated && !!user,
  });

  // Auto-select contact for non-admin users (support chat)
  useEffect(() => {
    if (user?.role !== "admin" && contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact, user?.role]);

  const { data: chatMessages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/messages", selectedContact?.id],
    queryFn: async () => {
      if (!selectedContact) return [];
      const res = await apiRequest("GET", `/api/messages/${selectedContact.id}`);
      if (!res.ok) {
        throw new Error("Failed to load messages");
      }
      return res.json();
    },
    enabled: !!selectedContact && isAuthenticated,
  });

  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages, selectedContact?.id]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: selectedContact?.id,
        message,
        messageType: "text",
      });
      return res.json();
    },
    onSuccess: (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Message",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (message: string) => {
    if (!selectedContact) return;
    sendMessageMutation.mutate(message);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-chat" />
      </div>
    );
  }

  const transformedMessages = messages.map((msg) => ({
    id: msg.id,
    text: msg.message,
    sender: msg.senderId === user?.id ? ('user' as const) : ('other' as const),
    timestamp: new Date(msg.createdAt).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex p-6 gap-6 overflow-hidden">
        <Card className="w-80 flex-shrink-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              <h2 className="font-semibold">
                {user?.role === "admin" ? "Contacts" : "Support"}
              </h2>
            </div>

            {contactsLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : contacts.length > 0 ? (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setSelectedContact(contact);
                      refetchMessages();
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors hover-elevate ${
                      selectedContact?.id === contact.id 
                        ? 'bg-accent' 
                        : 'bg-muted'
                    }`}
                    data-testid={`contact-${contact.id}`}
                  >
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">{contact.role}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                No contacts available
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex-1 flex items-center justify-center">
          {selectedContact ? (
            <div className="w-full max-w-4xl">
              <ChatInterface
                contactName={selectedContact.name}
                contactStatus="online"
                messages={transformedMessages}
                onSendMessage={handleSendMessage}
              />
            </div>
          ) : contactsLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="max-w-md">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Conversation Available</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.role === "admin" 
                    ? "Select a contact from the list to start chatting"
                    : "No support contacts available"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
