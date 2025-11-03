import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
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

  // Convert decimal strings to numbers for display
  const sellingPrice = typeof price === 'string' ? parseFloat(price) : price;
  const originalPrice = costPrice ? (typeof costPrice === 'string' ? parseFloat(costPrice) : costPrice) : null;
  const ratingNum = typeof rating === 'string' ? parseFloat(rating) : rating;

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
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-testid={`img-product-${id}`}
        />
        {discount > 0 && (
          <Badge 
            className="absolute top-2 left-2 bg-destructive text-destructive-foreground"
            data-testid={`badge-discount-${id}`}
          >
            -{discount}%
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

      <div className="p-4">
        <h3 
          className="font-semibold text-base mb-2 line-clamp-2 min-h-[3rem]"
          data-testid={`text-product-name-${id}`}
        >
          {name}
        </h3>

        {ratingNum > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm ml-1" data-testid={`text-rating-${id}`}>
                {ratingNum.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground" data-testid={`text-reviews-${id}`}>
              ({reviewCount})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span 
            className="text-xl font-bold text-primary"
            data-testid={`text-selling-price-${id}`}
          >
            {currency} {sellingPrice.toFixed(2)}
          </span>
          {originalPrice && originalPrice > sellingPrice && (
            <span 
              className="text-sm text-muted-foreground line-through"
              data-testid={`text-cost-price-${id}`}
            >
              {currency} {originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
