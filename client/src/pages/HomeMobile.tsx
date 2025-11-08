import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { RefreshCw } from "lucide-react";
import MobileHeader from "@/components/MobileHeader";
import BottomNavigation from "@/components/BottomNavigation";
import CategoryChips from "@/components/CategoryChips";
import ProductGridMobile from "@/components/ProductGridMobile";
import { Card } from "@/components/ui/card";

export default function HomeMobile() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: platformSettings, isLoading: isLoadingSettings } = useQuery<{
    isMultiVendor: boolean;
    primaryStoreId?: string;
    shopDisplayMode?: string;
  }>({
    queryKey: ["/api/platform-settings"],
  });

  const { data: heroBanners = [], isLoading: isLoadingBanners } = useQuery<Array<{
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
  }>>({
    queryKey: ["/api/hero-banners"],
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
    isActive: boolean;
  }>>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories?isActive=true");
      return res.json();
    },
  });

  const { data: allProducts = [], isLoading: isLoadingProducts } = useQuery<Array<any>>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products?isActive=true");
      return res.json();
    },
  });

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/hero-banners"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/products"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/platform-settings"] }),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [queryClient]);

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = searchQuery
      ? product.name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularProducts = filteredProducts
    .filter((p) => p.rating && parseFloat(p.rating as string) >= 4.5)
    .slice(0, 6);

  const activeBanner = heroBanners.find((b: any) => b.isActive);
  const isLoading = isLoadingBanners || isLoadingCategories || isLoadingProducts;

  // Premium Glass Skeleton Loaders
  const HeroSkeleton = () => (
    <div className="px-4">
      <div className="glass-skeleton aspect-[16/9] rounded-3xl" />
    </div>
  );

  const CategorySkeleton = () => (
    <div className="px-4">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-skeleton h-11 w-28 rounded-full flex-shrink-0" />
        ))}
      </div>
    </div>
  );

  const ProductGridSkeleton = () => (
    <div className="px-4">
      <div className="glass-skeleton h-7 w-36 mb-4 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="glass-skeleton aspect-square rounded-2xl" />
            <div className="glass-skeleton h-5 w-4/5 rounded-lg" />
            <div className="glass-skeleton h-4 w-2/3 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 glass-bg-gradient">
      <MobileHeader showSearch onSearchChange={setSearchQuery} />

      {/* Pull-to-Refresh Indicator - Glass Style */}
      {isRefreshing && (
        <div className="flex justify-center py-3 glass-card mx-4 mb-3">
          <RefreshCw className="h-5 w-5 animate-spin gradient-text" />
        </div>
      )}

      <main className="space-y-6 pt-4">
        {/* Pull-to-Refresh Trigger Area */}
        <div
          className="absolute top-0 left-0 right-0 h-20 z-0"
          onTouchStart={(e) => {
            const startY = e.touches[0].clientY;
            const onTouchMove = (moveE: TouchEvent) => {
              const currentY = moveE.touches[0].clientY;
              if (currentY - startY > 100 && !isRefreshing) {
                handleRefresh();
                document.removeEventListener('touchmove', onTouchMove);
              }
            };
            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', () => {
              document.removeEventListener('touchmove', onTouchMove);
            }, { once: true });
          }}
        />

        {/* Hero Banner - Premium Glass */}
        {isLoading ? (
          <HeroSkeleton />
        ) : activeBanner ? (
          <div className="px-4">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl glass-panel glow-border floating-glass">
              {activeBanner.imageUrl ? (
                <>
                  <img
                    src={activeBanner.imageUrl}
                    alt={activeBanner.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent" />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 glass-card m-3">
                <h2 className="text-2xl font-bold text-white mb-2 gradient-text" data-testid="text-hero-title">
                  {activeBanner.title || "Welcome to KiyuMart"}
                </h2>
                <p className="text-sm text-white/90 leading-relaxed" data-testid="text-hero-description">
                  {activeBanner.description || "Discover modest fashion"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Category Chips */}
        {isLoading ? (
          <CategorySkeleton />
        ) : (
          <div className="px-4">
            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>
        )}

        {/* Popular Products */}
        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGridMobile
            products={popularProducts}
            title="Most Popular"
            showSeeAll
            onSeeAll={() => navigate("/products")}
          />
        )}

        {/* All Products */}
        {!isLoading && filteredProducts.length > popularProducts.length && (
          <ProductGridMobile
            products={filteredProducts.slice(6)}
            title="More Products"
            showSeeAll={false}
          />
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
