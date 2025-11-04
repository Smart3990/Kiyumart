import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarketplaceBannerCarousel from "@/components/MarketplaceBannerCarousel";
import SellerCategoryCard from "@/components/SellerCategoryCard";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, ShoppingBag } from "lucide-react";
import type { User as BaseUser, Product, PlatformSettings } from "@shared/schema";

type Seller = BaseUser;

export default function MultiVendorHome() {
  const { user } = useAuth();
  
  const { data: settings } = useQuery<PlatformSettings>({
    queryKey: ["/api/platform-settings"],
  });

  const { data: sellers = [], isLoading: sellersLoading } = useQuery<Seller[]>({
    queryKey: ["/api/homepage/sellers"],
  });

  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/homepage/featured-products"],
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const getSellerProductCount = (sellerId: string) => {
    return allProducts.filter((p) => p.sellerId === sellerId).length;
  };
  
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <Header />
      
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 py-6 space-y-12">
          <MarketplaceBannerCarousel
            autoplayEnabled={settings?.bannerAutoplayEnabled ?? true}
            autoplayDuration={settings?.bannerAutoplayDuration ?? 5000}
          />

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 
                  className="text-2xl md:text-3xl font-bold text-foreground dark:text-white"
                  data-testid="heading-categories"
                >
                  Shop by Store
                </h2>
              </div>
              {isAdmin && (
                <Badge variant="outline" className="text-sm" data-testid="badge-store-count">
                  {sellers.length} {sellers.length === 1 ? "Store" : "Stores"}
                </Badge>
              )}
            </div>

            {sellersLoading ? (
              <div className="category-grid">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[16/10] rounded-lg" data-testid={`skeleton-seller-${i}`} />
                ))}
              </div>
            ) : sellers.length > 0 ? (
              <div className="category-grid" data-testid="grid-sellers">
                {sellers.map((seller) => (
                  <SellerCategoryCard
                    key={seller.id}
                    seller={seller}
                    productCount={getSellerProductCount(seller.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground" data-testid="empty-sellers">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No stores available yet</p>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 
                className="text-2xl md:text-3xl font-bold text-foreground dark:text-white"
                data-testid="heading-featured"
              >
                Featured Products
              </h2>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" data-testid={`skeleton-product-${i}`} />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-testid="grid-featured-products">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    costPrice={product.costPrice || undefined}
                    image={product.images[0] || ""}
                    discount={product.discount || 0}
                    rating={product.ratings || "0"}
                    reviewCount={product.totalRatings || 0}
                    inStock={(product.stock || 0) > 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground" data-testid="empty-products">
                <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No products available yet</p>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-primary" />
              <h2 
                className="text-2xl md:text-3xl font-bold text-foreground dark:text-white"
                data-testid="heading-new-arrivals"
              >
                New Arrivals
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-testid="grid-new-arrivals">
              {allProducts.slice(0, 10).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  costPrice={product.costPrice || undefined}
                  image={product.images[0] || ""}
                  discount={product.discount || 0}
                  rating={product.ratings || "0"}
                  reviewCount={product.totalRatings || 0}
                  inStock={(product.stock || 0) > 0}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <style>{`
        .category-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          align-items: start;
        }

        @media (min-width: 640px) {
          .category-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .category-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
