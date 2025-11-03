import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import ThemeToggle from "@/components/ThemeToggle";

import heroImage from "@assets/generated_images/Fashion_hero_banner_lifestyle_000ccc89.png";
import handbagImage from "@assets/generated_images/Designer_handbag_product_photo_d9f11f99.png";
import sneakersImage from "@assets/generated_images/Men's_sneakers_product_photo_2c87b833.png";
import dressImage from "@assets/generated_images/Summer_dress_product_photo_9f6f8356.png";
import jacketImage from "@assets/generated_images/Leather_jacket_product_photo_999cea00.png";
import sunglassesImage from "@assets/generated_images/Designer_sunglasses_product_photo_2aa575e1.png";
import watchImage from "@assets/generated_images/Men's_watch_product_photo_7b78c9da.png";
import menCategoryImage from "@assets/generated_images/Men's_fashion_category_image_d439510a.png";
import accessoriesImage from "@assets/generated_images/Women's_accessories_category_image_091f4ac1.png";
import footwearImage from "@assets/generated_images/Footwear_category_image_9d3587fc.png";

export default function Home() {
  const [, navigate] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Designer Leather Handbag',
      price: 299.99,
      quantity: 1,
      image: handbagImage
    }
  ]);

  const bannerSlides = [
    {
      image: heroImage,
      title: "New Season Collection",
      description: "Discover the latest trends in fashion. Shop premium quality at unbeatable prices.",
      cta: "Shop Now"
    },
    {
      image: heroImage,
      title: "Up to 50% Off",
      description: "Limited time offer on selected items. Don't miss out!",
      cta: "View Deals"
    }
  ];

  const categories = [
    { id: "men", name: "Men's Fashion", image: menCategoryImage, productCount: 245 },
    { id: "women", name: "Women's Accessories", image: accessoriesImage, productCount: 318 },
    { id: "footwear", name: "Footwear Collection", image: footwearImage, productCount: 156 },
  ];

  const products = [
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
    {
      id: "4",
      name: "Premium Leather Jacket",
      price: 399.99,
      image: jacketImage,
      rating: 4.9,
      reviewCount: 45,
    },
    {
      id: "5",
      name: "Designer Sunglasses",
      price: 159.99,
      image: sunglassesImage,
      discount: 10,
      rating: 4.7,
      reviewCount: 203,
    },
    {
      id: "6",
      name: "Classic Men's Watch",
      price: 249.99,
      image: watchImage,
      rating: 4.8,
      reviewCount: 167,
    },
  ];

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const existingItem = cartItems.find(item => item.id === productId);
      if (existingItem) {
        setCartItems(cartItems.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        setCartItems([...cartItems, {
          id: product.id,
          name: product.name,
          price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
          quantity: 1,
          image: product.image
        }]);
      }
      console.log('Added to cart:', productId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-end p-2 border-b bg-background">
        <ThemeToggle />
      </div>
      
      <Header
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      <HeroBanner slides={bannerSlides} />

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
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
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <a href="#" className="text-primary hover:underline">
              View All
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={(id) => console.log('Wishlist toggled:', id)}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => {
          setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, quantity } : item
          ));
        }}
        onRemoveItem={(id) => {
          setCartItems(cartItems.filter(item => item.id !== id));
        }}
        onCheckout={() => {
          setIsCartOpen(false);
          navigate('/checkout');
        }}
      />
    </div>
  );
}
