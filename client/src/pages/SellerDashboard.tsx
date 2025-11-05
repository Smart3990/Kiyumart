import DashboardLayout from "@/components/DashboardLayout";
import MetricCard from "@/components/MetricCard";
import ProductCard from "@/components/ProductCard";
import ThemeToggle from "@/components/ThemeToggle";
import StoreModeToggle from "@/components/StoreModeToggle";
import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import handbagImage from "@assets/generated_images/Designer_handbag_product_photo_d9f11f99.png";
import sneakersImage from "@assets/generated_images/Men's_sneakers_product_photo_2c87b833.png";
import dressImage from "@assets/generated_images/Summer_dress_product_photo_9f6f8356.png";

export default function SellerDashboard() {

  const myProducts = [
    {
      id: "1",
      name: "Designer Leather Handbag",
      price: 299.99,
      image: handbagImage,
      discount: 15,
      rating: 4.5,
      reviewCount: 128,
    },
    {
      id: "2",
      name: "Men's Casual Sneakers",
      price: 89.99,
      image: sneakersImage,
      rating: 4.8,
      reviewCount: 256,
    },
    {
      id: "3",
      name: "Summer Floral Dress",
      price: 129.99,
      image: dressImage,
      discount: 20,
      rating: 4.6,
      reviewCount: 89,
    },
  ];

  return (
    <DashboardLayout role="seller">
      <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Sales"
                value="GHS 12,450"
                icon={DollarSign}
                change={18.2}
              />
              <MetricCard
                title="Products Sold"
                value="234"
                icon={Package}
                change={12.5}
              />
              <MetricCard
                title="Pending Orders"
                value="12"
                icon={ShoppingBag}
              />
              <MetricCard
                title="Conversion Rate"
                value="3.2%"
                icon={TrendingUp}
                change={5.4}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">My Products</h2>
                <Button>Add New Product</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onToggleWishlist={(id) => console.log('Delete product:', id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}
