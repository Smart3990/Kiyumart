import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, User, Edit, Plus, Bike } from "lucide-react";

interface Rider {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  isActive: boolean;
}

export default function AdminRiders() {
  const [activeItem, setActiveItem] = useState("riders");
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: riders = [], isLoading } = useQuery<Rider[]>({
    queryKey: ["/api/users", "rider"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=rider");
      return res.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    switch(id) {
      case "dashboard":
        navigate("/admin");
        break;
      case "mode":
        navigate("/admin/settings");
        break;
      case "categories":
        navigate("/admin/categories");
        break;
      case "products":
        navigate("/admin/products");
        break;
      case "orders":
        navigate("/admin/orders");
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "riders":
        // Already on riders page
        break;
      case "zones":
        navigate("/admin/zones");
        break;
      case "messages":
        navigate("/admin/messages");
        break;
      case "analytics":
        navigate("/admin/analytics");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
    }
  };

  const filteredRiders = riders.filter(r => 
    r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        role="admin"
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userName={user?.username || "Admin"}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-riders">Riders Management</h1>
              <p className="text-muted-foreground mt-1">Manage delivery riders</p>
            </div>
            <Button data-testid="button-add-rider" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Rider
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search riders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-riders"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRiders.map((rider) => (
                <Card key={rider.id} className="p-4" data-testid={`card-rider-${rider.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500/10 p-3 rounded-full">
                      <Bike className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" data-testid={`text-username-${rider.id}`}>
                        {rider.username}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground" data-testid={`text-email-${rider.id}`}>
                          {rider.email}
                        </span>
                        {rider.phone && (
                          <span className="text-sm text-muted-foreground" data-testid={`text-phone-${rider.id}`}>
                            {rider.phone}
                          </span>
                        )}
                        {rider.isActive ? (
                          <Badge className="bg-green-500" data-testid={`badge-status-${rider.id}`}>Active</Badge>
                        ) : (
                          <Badge variant="secondary" data-testid={`badge-status-${rider.id}`}>Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" data-testid={`button-edit-${rider.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredRiders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-riders">
                    No riders found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
