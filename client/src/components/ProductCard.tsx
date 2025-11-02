import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  currency?: string;
  image: string;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  price,
  currency = "GHS",
  image,
  discount,
  rating = 0,
  reviewCount = 0,
  inStock = true,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountedPrice = discount ? price * (1 - discount / 100) : price;

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    onToggleWishlist?.(id);
  };

  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-testid={`img-product-${id}`}
        />
        {discount && discount > 0 && (
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

        {rating > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm ml-1" data-testid={`text-rating-${id}`}>
                {rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground" data-testid={`text-reviews-${id}`}>
              ({reviewCount})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span 
            className="text-xl font-bold"
            data-testid={`text-price-${id}`}
          >
            {currency} {discountedPrice.toFixed(2)}
          </span>
          {discount && discount > 0 && (
            <span 
              className="text-sm text-muted-foreground line-through"
              data-testid={`text-original-price-${id}`}
            >
              {currency} {price.toFixed(2)}
            </span>
          )}
        </div>

        <Button
          className="w-full"
          onClick={() => onAddToCart?.(id)}
          disabled={!inStock}
          data-testid={`button-add-to-cart-${id}`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
