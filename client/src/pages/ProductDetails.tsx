import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, ShoppingCart, Star, ArrowLeft, Minus, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  costPrice?: string;
  category: string;
  images: string[];
  ratings: string;
  totalRatings: number;
  stock: number;
  isActive: boolean;
}

interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
}

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { currency } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const productId = params?.id || "";

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
  });

  const { data: wishlist = [] } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const { data: cartItems = [] } = useQuery<{ id: string; productId: string; quantity: number }[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/products", productId, "reviews"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!productId,
  });

  const isWishlisted = wishlist.some(item => item.productId === productId);
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart", { productId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${quantity} item(s) added to your cart`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("POST", "/api/wishlist", { productId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/wishlist/${productId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist",
      });
    },
  });

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (isWishlisted) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    addToCartMutation.mutate({ productId, quantity });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist</p>
          <Button onClick={() => navigate("/")} data-testid="button-back-home">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const sellingPrice = parseFloat(product.price);
  const originalPrice = product.costPrice ? parseFloat(product.costPrice) : null;
  const discount = originalPrice && originalPrice > sellingPrice
    ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
    : 0;
  const rating = parseFloat(product.ratings) || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-end p-2 border-b bg-background">
        <ThemeToggle />
      </div>

      <Header
        cartItemsCount={cartItemsCount}
        onCartClick={() => isAuthenticated ? navigate("/cart") : navigate("/auth")}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={product.images[selectedImage] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    data-testid="img-product-main"
                  />
                  {discount > 0 && (
                    <Badge 
                      className="absolute top-4 left-4 bg-destructive text-destructive-foreground"
                      data-testid="badge-discount"
                    >
                      -{discount}%
                    </Badge>
                  )}
                </div>
              </Card>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, idx) => (
                    <Card
                      key={idx}
                      className={`cursor-pointer overflow-hidden ${selectedImage === idx ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedImage(idx)}
                      data-testid={`img-thumbnail-${idx}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold" data-testid="text-product-name">
                    {product.name}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleWishlist}
                    className={isWishlisted ? "text-destructive" : ""}
                    data-testid="button-wishlist"
                  >
                    <Heart className={`h-6 w-6 ${isWishlisted ? "fill-current" : ""}`} />
                  </Button>
                </div>

                {rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                      <span className="ml-1 font-semibold" data-testid="text-rating">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-muted-foreground" data-testid="text-reviews">
                      ({product.totalRatings} reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <span 
                    className="text-4xl font-bold text-primary"
                    data-testid="text-selling-price"
                  >
                    {currency} {sellingPrice.toFixed(2)}
                  </span>
                  {originalPrice && originalPrice > sellingPrice && (
                    <span 
                      className="text-xl text-muted-foreground line-through decoration-2"
                      data-testid="text-cost-price"
                    >
                      {currency} {originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <Badge variant="secondary" data-testid="badge-category">
                  {product.category}
                </Badge>
              </div>

              {product.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground" data-testid="text-description">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span 
                      className="w-16 text-center font-semibold"
                      data-testid="text-quantity"
                    >
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({product.stock} available)
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.isActive || product.stock === 0 || addToCartMutation.isPending}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6" data-testid="heading-reviews">
                Customer Reviews ({reviews.length})
              </h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6" data-testid={`review-${review.id}`}>
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {review.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold" data-testid={`review-name-${review.id}`}>
                              {review.userName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1" data-testid={`review-rating-${review.id}`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-primary text-primary"
                                    : "fill-muted text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground" data-testid={`review-comment-${review.id}`}>
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
