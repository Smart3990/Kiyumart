import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
  productCount?: number;
  onClick?: (id: string) => void;
}

export default function CategoryCard({
  id,
  name,
  image,
  productCount,
  onClick,
}: CategoryCardProps) {
  return (
    <Card
      className="group overflow-hidden cursor-pointer hover-elevate active-elevate-2 transition-all duration-300"
      onClick={() => onClick?.(id)}
      data-testid={`card-category-${id}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-semibold mb-1" data-testid={`text-category-name-${id}`}>
            {name}
          </h3>
          {productCount !== undefined && (
            <p className="text-sm text-white/90" data-testid={`text-product-count-${id}`}>
              {productCount} Products
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
