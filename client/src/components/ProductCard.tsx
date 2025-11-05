import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface ProductCardProps {
  id: string;
  name: string;
  price: number | string;
  costPrice?: number | string;
  currency?: string;
  image: string;
  discount?: number;
  rating?: number | string;
  reviewCount?: number;
  inStock?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

/**
 * CRITICAL: This product card layout MUST remain exactly as designed below.
 * DO NOT modify the structure, spacing, or element order without explicit user approval.
 * 
 * Required Layout (from top to bottom):
 * 1. Image (aspect-[3/4]) with discount badge (top-left) and wishlist button (top-right)
 * 2. Product name (font-semibold, line-clamp-2)
 * 3. Rating with star icon and review count: ★ X.X (N)
 * 4. Price section: Original price (struck through) + Sale price (green, bold)
 * 
 * This layout matches the approved design specification and ensures consistency
 * across all product displays. Any changes must preserve this exact structure.
 */
export default function ProductCard({
  id,
  name,
  price,
  costPrice,
  currency = "GHS",
  image,
  discount = 0,
  rating = 0,
  reviewCount = 0,
  inStock = true,
  isWishlisted: initialWishlisted = false,
  onToggleWishlist,
}: ProductCardProps) {
  const [, navigate] = useLocation();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const sellingPrice = typeof price === 'string' ? parseFloat(price) : price;
  const originalPrice = costPrice ? (typeof costPrice === 'string' ? parseFloat(costPrice) : costPrice) : null;
  const ratingNum = typeof rating === 'string' ? parseFloat(rating) : rating;
  
  const actualDiscount = originalPrice && originalPrice > sellingPrice 
    ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onToggleWishlist?.(id);
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <Card 
      className="group overflow-hidden hover-elevate transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
      data-testid={`card-product-${id}`}
    >
      {/* Product Image Container - DO NOT MODIFY ASPECT RATIO */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-testid={`img-product-${id}`}
        />
        {actualDiscount > 0 && (
          <Badge 
            className="absolute top-2 left-2 bg-red-600 text-white z-10 font-bold text-xs px-2 py-1 shadow-md"
            data-testid={`badge-discount-${id}`}
          >
            {actualDiscount}% OFF
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background ${
            isWishlisted ? "text-destructive" : ""
          }`}
          onClick={handleWishlistToggle}
          data-testid={`button-wishlist-${id}`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </Button>
        {!inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary" data-testid={`badge-out-of-stock-${id}`}>
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info Section - DO NOT REORDER ELEMENTS */}
      <div className="p-3 space-y-1.5">
        {/* Product Name */}
        <h3 
          className="font-semibold text-sm line-clamp-2"
          data-testid={`text-product-name-${id}`}
        >
          {name}
        </h3>

        {/* Rating Row - Star Icon + Number + (Review Count) */}
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-xs font-medium" data-testid={`text-rating-${id}`}>
            {ratingNum.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground" data-testid={`text-reviews-${id}`}>
            ({reviewCount})
          </span>
        </div>

        {/* Price Row - Original Price (struck) + Sale Price (green) */}
        <div className="flex items-baseline gap-2">
          {originalPrice && originalPrice > sellingPrice && (
            <span 
              className="text-xs text-gray-500 dark:text-gray-400 line-through"
              data-testid={`text-cost-price-${id}`}
            >
              {currency} {originalPrice.toFixed(2)}
            </span>
          )}
          <span 
            className="text-lg font-bold text-primary"
            data-testid={`text-selling-price-${id}`}
          >
            {currency} {sellingPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
}
