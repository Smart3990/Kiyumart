import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  price: number | string;
  costPrice?: number | string;
  images?: string[];
  image?: string;
  discount?: number;
  rating?: number | string;
  reviewCount?: number;
  inStock?: boolean;
  isWishlisted?: boolean;
}

interface ProductGridMobileProps {
  products: Product[];
  onToggleWishlist?: (id: string) => void;
  title?: string;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}

export default function ProductGridMobile({
  products,
  onToggleWishlist,
  title = "Products",
  showSeeAll = true,
  onSeeAll,
}: ProductGridMobileProps) {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-bold" data-testid="text-section-title">
          {title}
        </h2>
        {showSeeAll && products.length > 0 && (
          <button
            onClick={onSeeAll}
            className="text-sm font-medium text-primary hover:underline"
            data-testid="button-see-all"
          >
            See All
          </button>
        )}
      </div>

      {/* Product Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            costPrice={product.costPrice}
            image={(product.images && product.images[0]) || product.image || ""}
            discount={product.discount}
            rating={product.rating}
            reviewCount={product.reviewCount}
            inStock={product.inStock}
            isWishlisted={product.isWishlisted}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
}
