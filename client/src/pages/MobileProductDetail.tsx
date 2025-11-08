import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, Heart, Star, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import BottomNavigation from "@/components/BottomNavigation";
import { cn } from "@/lib/utils";

export default function MobileProductDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { formatPrice } = useLanguage();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<{
    id: string;
    name: string;
    description?: string;
    price: number | string;
    costPrice?: number | string;
    images?: string[];
    image?: string;
    rating?: number | string;
    reviewCount?: number;
    sold?: number;
    inStock?: boolean;
    video?: string;
  }>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", {
        productId: id,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product added to your cart successfully",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const rating = typeof product.rating === "string" ? parseFloat(product.rating) : product.rating || 0;
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const costPrice = product.costPrice
    ? typeof product.costPrice === "string"
      ? parseFloat(product.costPrice)
      : product.costPrice
    : null;

  // Mock variants (in production, these would come from API)
  const colors = images.map((img: string, idx: number) => ({ id: idx, name: `Color ${idx + 1}`, image: img }));
  const sizes = ["38", "39", "40", "41", "42"];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Product Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={images[selectedImage]}
          alt={product.name}
          className="w-full h-full object-cover"
          data-testid="img-product-main"
        />
      </div>

      {/* Image Thumbnails */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {images.map((img: string, idx: number) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={cn(
              "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
              selectedImage === idx
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent"
            )}
            data-testid={`thumb-${idx}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-xl font-bold leading-tight" data-testid="text-product-name">
              {product.name}
            </h1>
            {product.inStock === false && (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount || 0} reviews)
            </span>
            <span className="text-sm text-muted-foreground">
              {product.sold || 0} sold
            </span>
          </div>
        </div>

        {/* Colors */}
        {colors.length > 1 && (
          <div>
            <h3 className="text-sm font-bold mb-2">Colors</h3>
            <div className="flex gap-2">
              {colors.map((color: any, idx: number) => (
                <button
                  key={color.id}
                  onClick={() => {
                    setSelectedColor(idx);
                    setSelectedImage(idx);
                  }}
                  className={cn(
                    "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    selectedColor === idx
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border"
                  )}
                  data-testid={`color-${idx}`}
                >
                  <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        <div>
          <h3 className="text-sm font-bold mb-2">Sizes</h3>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "w-12 h-12 rounded-full border-2 text-sm font-medium transition-all",
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                )}
                data-testid={`size-${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Video Section */}
        {product.video && (
          <Card className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-medium">Complete Product Video</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Watch full product demonstration and details
            </p>
          </Card>
        )}

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="text-sm font-bold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 space-y-3">
        {/* Price and Quantity */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total price</p>
            <div className="flex items-baseline gap-2">
              {costPrice && costPrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(costPrice)}
                </span>
              )}
              <span className="text-2xl font-bold text-primary">
                {formatPrice(price)}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              data-testid="button-decrease-qty"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-bold w-8 text-center" data-testid="text-quantity">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setQuantity(quantity + 1)}
              data-testid="button-increase-qty"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={() => addToCartMutation.mutate()}
          disabled={addToCartMutation.isPending || product.inStock === false}
          data-testid="button-add-to-cart"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add To Cart
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}
