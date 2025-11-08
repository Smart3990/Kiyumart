import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MobileHeader from "@/components/MobileHeader";
import BottomNavigation from "@/components/BottomNavigation";
import CategoryChips from "@/components/CategoryChips";
import ProductGridMobile from "@/components/ProductGridMobile";
import { Card } from "@/components/ui/card";

export default function HomeMobile() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: platformSettings } = useQuery<{
    isMultiVendor: boolean;
    primaryStoreId?: string;
    shopDisplayMode?: string;
  }>({
    queryKey: ["/api/platform-settings"],
  });

  const { data: heroBanners = [] } = useQuery<Array<{
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
  }>>({
    queryKey: ["/api/hero-banners"],
  });

  const { data: categories = [] } = useQuery<Array<{
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

  const { data: allProducts = [] } = useQuery<Array<any>>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products?isActive=true");
      return res.json();
    },
  });

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch onSearchChange={setSearchQuery} />

      <main className="space-y-6 pt-4">
        {/* Hero Banner */}
        {activeBanner && (
          <div className="px-4">
            <Card className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
              {activeBanner.imageUrl ? (
                <>
                  <img
                    src={activeBanner.imageUrl}
                    alt={activeBanner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </>
              ) : null}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h2 className="text-xl font-bold mb-1" data-testid="text-hero-title">
                  {activeBanner.title || "Welcome to KiyuMart"}
                </h2>
                <p className="text-sm opacity-90" data-testid="text-hero-description">
                  {activeBanner.description || "Discover modest fashion"}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Category Chips */}
        <div className="px-4">
          <CategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Popular Products */}
        <ProductGridMobile
          products={popularProducts}
          title="Most Popular"
          showSeeAll
          onSeeAll={() => navigate("/products")}
        />

        {/* All Products */}
        {filteredProducts.length > popularProducts.length && (
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
