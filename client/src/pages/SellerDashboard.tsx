import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MetricCard from "@/components/MetricCard";
import ProductCard from "@/components/ProductCard";
import ThemeToggle from "@/components/ThemeToggle";
import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import handbagImage from "@assets/generated_images/Designer_handbag_product_photo_d9f11f99.png";
import sneakersImage from "@assets/generated_images/Men's_sneakers_product_photo_2c87b833.png";
import dressImage from "@assets/generated_images/Summer_dress_product_photo_9f6f8356.png";

export default function SellerDashboard() {
  const [activeItem, setActiveItem] = useState("dashboard");

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
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        role="seller"
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userName="Seller Name"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
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
                    onAddToCart={(id) => console.log('Edit product:', id)}
                    onToggleWishlist={(id) => console.log('Delete product:', id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
