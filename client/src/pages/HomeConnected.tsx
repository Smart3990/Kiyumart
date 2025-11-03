import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import ThemeToggle from "@/components/ThemeToggle";

import heroImage from "@assets/generated_images/Fashion_hero_banner_lifestyle_000ccc89.png";
import menCategoryImage from "@assets/generated_images/Men's_fashion_category_image_d439510a.png";
import accessoriesImage from "@assets/generated_images/Women's_accessories_category_image_091f4ac1.png";
import footwearImage from "@assets/generated_images/Footwear_category_image_9d3587fc.png";

interface Product {
  id: string;
  name: string;
  price: string;
  costPrice?: string;
  images: string[];
  discount: number;
  ratings: string;
  totalRatings: number;
  category: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  createdAt: string;
}

interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export default function HomeConnected() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { currency, t } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: wishlist = [] } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const { data: cartProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/cart/products"],
    queryFn: async () => {
      if (!cartItems.length) return [];
      const productIds = cartItems.map(item => item.productId);
      const productsData = await Promise.all(
        productIds.map(async (id) => {
          const res = await fetch(`/api/products/${id}`);
          return res.json();
        })
      );
      return productsData;
    },
    enabled: cartItems.length > 0,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const res = await apiRequest("POST", "/api/cart", { productId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
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

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cart/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Could not add to wishlist",
        variant: "destructive",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Could not remove from wishlist",
        variant: "destructive",
      });
    },
  });

  const bannerSlides = [
    {
      image: heroImage,
      title: t("newSeasonCollection"),
      description: t("discoverLatest"),
      cta: t("shopNow")
    },
    {
      image: heroImage,
      title: t("upTo50Off"),
      description: t("limitedOffer"),
      cta: t("viewDeals")
    }
  ];

  const categories = [
    { id: "men", name: "Men's Fashion", image: menCategoryImage, productCount: products.filter(p => p.category === "men").length },
    { id: "women", name: "Women's Accessories", image: accessoriesImage, productCount: products.filter(p => p.category === "women").length },
    { id: "footwear", name: "Footwear Collection", image: footwearImage, productCount: products.filter(p => p.category === "footwear").length },
  ];

  const cartItemsForSidebar = cartItems.map(cartItem => {
    const product = cartProducts.find(p => p.id === cartItem.productId);
    if (!product) return null;
    
    return {
      id: cartItem.id,
      name: product.name,
      price: parseFloat(product.price) * (1 - product.discount / 100),
      quantity: cartItem.quantity,
      image: product.images[0] || heroImage,
    };
  }).filter(Boolean) as any[];

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    addToCartMutation.mutate({ productId });
  };

  const handleToggleWishlist = (productId: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const isWishlisted = wishlist.some(item => item.productId === productId);
    if (isWishlisted) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  // Debounced search handler
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(query.toLowerCase().trim());
    }, 300);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery)
      )
    : products;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-end p-2 border-b bg-background">
        <ThemeToggle />
      </div>
      
      <Header
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => isAuthenticated ? navigate("/cart") : navigate("/auth")}
        onSearch={handleSearch}
      />

      <HeroBanner slides={bannerSlides} />

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8">{t("shopByCategory")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                {...category}
                onClick={(id) => console.log('Category clicked:', id)}
              />
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {searchQuery ? `${t("search").replace("...", "")} (${filteredProducts.length})` : t("featuredProducts")}
            </h2>
          </div>
          {productsLoading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No products found matching "{searchQuery}"
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(searchQuery ? filteredProducts : filteredProducts.slice(0, 8)).map((product) => {
                const sellingPrice = parseFloat(product.price);
                const originalPrice = product.costPrice ? parseFloat(product.costPrice) : null;
                const calculatedDiscount = originalPrice && originalPrice > sellingPrice
                  ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
                  : 0;

                const isWishlisted = wishlist.some(item => item.productId === product.id);

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={sellingPrice}
                    costPrice={originalPrice || undefined}
                    currency={currency}
                    image={product.images[0] || heroImage}
                    discount={calculatedDiscount}
                    rating={parseFloat(product.ratings) || 0}
                    reviewCount={product.totalRatings}
                    isWishlisted={isWishlisted}
                    onToggleWishlist={handleToggleWishlist}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {isAuthenticated && (
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItemsForSidebar}
          onUpdateQuantity={(id, quantity) => {
            updateCartMutation.mutate({ id, quantity });
          }}
          onRemoveItem={(id) => {
            removeFromCartMutation.mutate(id);
          }}
          onCheckout={() => {
            setIsCartOpen(false);
            navigate('/checkout');
          }}
        />
      )}
    </div>
  );
}
