import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Edit, Trash2, Eye } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: number;
  images: string[];
  isActive: boolean;
}

export default function AdminProducts() {
  const [activeItem, setActiveItem] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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
        // Already on products page
        break;
      case "orders":
        navigate("/admin/orders");
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "riders":
        navigate("/admin/riders");
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-products">Products Management</h1>
              <p className="text-muted-foreground mt-1">Manage your product catalog</p>
            </div>
            <Button data-testid="button-add-product" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-products"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="p-4" data-testid={`card-product-${product.id}`}>
                  <div className="flex items-center gap-4">
                    <img
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                      data-testid={`img-product-${product.id}`}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" data-testid={`text-product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-primary font-bold" data-testid={`text-price-${product.id}`}>
                          GHS {product.price}
                        </span>
                        <Badge variant="outline" data-testid={`badge-category-${product.id}`}>
                          {product.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground" data-testid={`text-stock-${product.id}`}>
                          Stock: {product.stock}
                        </span>
                        {product.isActive ? (
                          <Badge className="bg-green-500" data-testid={`badge-status-${product.id}`}>Active</Badge>
                        ) : (
                          <Badge variant="secondary" data-testid={`badge-status-${product.id}`}>Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" data-testid={`button-view-${product.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`button-edit-${product.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`button-delete-${product.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-products">
                    No products found
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
