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

  // Skeleton Loaders
  const HeroSkeleton = () => (
    <div className="px-4">
      <div className="native-skeleton aspect-[16/9] rounded-2xl" />
    </div>
  );

  const CategorySkeleton = () => (
    <div className="px-4">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="native-skeleton h-10 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
    </div>
  );

  const ProductGridSkeleton = () => (
    <div className="px-4">
      <div className="native-skeleton h-6 w-32 mb-3 rounded" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="native-skeleton aspect-square rounded-xl" />
            <div className="native-skeleton h-4 w-3/4 rounded" />
            <div className="native-skeleton h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch onSearchChange={setSearchQuery} />

      {/* Pull-to-Refresh Indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-2 bg-primary/10">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
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

        {/* Hero Banner */}
        {isLoading ? (
          <HeroSkeleton />
        ) : activeBanner ? (
          <div className="px-4">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 native-card">
              {activeBanner.imageUrl ? (
                <>
                  <img
                    src={activeBanner.imageUrl}
                    alt={activeBanner.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </>
              ) : null}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2 className="native-title-large text-white mb-1" data-testid="text-hero-title">
                  {activeBanner.title || "Welcome to KiyuMart"}
                </h2>
                <p className="native-body text-white/90" data-testid="text-hero-description">
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
