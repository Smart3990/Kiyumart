import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import AdBanner from "@/components/AdBanner";
import MultiVendorHome from "./MultiVendorHome";
import type { PlatformSettings } from "@shared/schema";

import heroImage from "@assets/generated_images/Diverse_Islamic_fashion_banner_eb13714d.png";
import abayaCategoryImage from "@assets/generated_images/Abayas_category_collection_image_cbf9978c.png";
import hijabCategoryImage from "@assets/generated_images/Hijabs_and_accessories_category_09f9b1a2.png";
import eveningCategoryImage from "@assets/generated_images/Evening_wear_category_image_455c3389.png";

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { currency, currencySymbol, t } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: platformSettings, isLoading: settingsLoading } = useQuery<PlatformSettings>({
    queryKey: ["/api/platform-settings"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated && !authLoading,
  });

  const { data: wishlist = [] } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated && !authLoading,
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
    { id: "abayas", name: "Elegant Abayas", image: abayaCategoryImage, productCount: products.filter(p => p.category === "abayas").length },
    { id: "hijabs", name: "Hijabs & Accessories", image: hijabCategoryImage, productCount: products.filter(p => p.category === "hijabs").length },
    { id: "evening", name: "Evening Wear", image: eveningCategoryImage, productCount: products.filter(p => p.category === "evening").length },
  ];

  const cartItemsForSidebar = cartItems.map(cartItem => {
    const product = cartProducts.find(p => p.id === cartItem.productId);
    if (!product) return null;
    
    const productImage = Array.isArray(product.images) && product.images.length > 0 
      ? product.images[0] 
      : heroImage;
    
    return {
      id: cartItem.id,
      name: product.name,
      price: parseFloat(product.price) * (1 - product.discount / 100),
      quantity: cartItem.quantity,
      image: productImage,
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

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (platformSettings?.isMultiVendor) {
    return <MultiVendorHome />;
  }

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

      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdBanner position="hero" className="h-32 md:h-48" />
      </div>

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8">{t("shopByCategory")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                {...category}
                onClick={(id) => navigate(`/category/${id}`)}
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
                const productImage = Array.isArray(product.images) && product.images.length > 0 
                  ? product.images[0] 
                  : heroImage;

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={sellingPrice}
                    costPrice={originalPrice || undefined}
                    currency={currencySymbol}
                    image={productImage}
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

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <AdBanner position="footer" className="h-24 md:h-32" />
      </div>

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
