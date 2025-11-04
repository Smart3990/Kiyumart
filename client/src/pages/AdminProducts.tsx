import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Edit, Trash2, Eye, ArrowLeft } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: number;
  images: string[];
  isActive: boolean;
}

function DeleteProductDialog({ product }: { product: Product }) {
  const { toast } = useToast();

  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/products/${product.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid={`button-delete-${product.id}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{product.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteProductMutation.mutate()}
            disabled={deleteProductMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-delete"
          >
            {deleteProductMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminProducts() {
  const [activeItem, setActiveItem] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const handleItemClick = (id: string) => {
    navigate(
      id === "dashboard" ? "/admin" :
      id === "store" ? "/admin/store" :
      id === "branding" ? "/admin/branding" :
      id === "categories" ? "/admin/categories" :
      id === "products" ? "/admin/products" :
      id === "orders" ? "/admin/orders" :
      id === "users" ? "/admin/users" :
      id === "sellers" ? "/admin/sellers" :
      id === "riders" ? "/admin/riders" :
      id === "applications" ? "/admin/applications" :
      id === "zones" ? "/admin/zones" :
      id === "notifications" ? "/notifications" :
      id === "messages" ? "/admin/messages" :
      id === "analytics" ? "/admin/analytics" :
      id === "settings" ? "/admin/settings" :
      "/admin"
    );
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !isAuthenticated || user?.role !== "admin") {
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
        userName={user?.name || "Admin"}
      />
      
      <div className="flex-1 overflow-auto">
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
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-products">Products Management</h1>
              <p className="text-muted-foreground mt-1">Manage your product catalog</p>
            </div>
            <Button 
              onClick={() => navigate("/admin/products/new")}
              data-testid="button-add-product" 
              className="gap-2"
            >
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(`/product/${product.id}`)}
                        data-testid={`button-view-${product.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteProductDialog product={product} />
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
