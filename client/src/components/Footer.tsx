import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import logoLight from "@assets/light_mode_1762169855262.png";
import logoDark from "@assets/photo_2025-09-24_21-19-48-removebg-preview_1762169855290.png";

interface PlatformSettings {
  platformName: string;
  logo?: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  footerDescription: string;
  isMultiVendor?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  category: string;
}

export default function Footer() {
  const { data: settings } = useQuery<PlatformSettings>({
    queryKey: ["/api/settings"],
  });
  
  // Fetch products to get categories dynamically (filtered by primary store in single-store mode)
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Get unique categories from products for single-store mode
  const productCategories = Array.from(new Set(products.map(p => p.category)))
    .filter(Boolean)
    .slice(0, 3);
  
  const { isAuthenticated } = useAuth();

  const openSocialLink = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCustomerSupportClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      window.location.href = '/auth';
    }
  };

  return (
    <footer className="bg-card border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className={`grid grid-cols-1 ${settings?.isMultiVendor ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-8`}>
          <div className={settings?.isMultiVendor ? 'md:col-span-1' : ''}>
            {settings?.logo ? (
              <img 
                src={settings.logo}
                alt={settings.platformName || "KiyuMart"}
                className="h-10 w-auto mb-4"
                data-testid="img-footer-logo"
              />
            ) : (
              <>
                <img 
                  src={logoLight}
                  alt="KiyuMart"
                  className="h-10 w-auto mb-4 dark:hidden"
                  data-testid="img-footer-logo-light"
                />
                <img 
                  src={logoDark}
                  alt="KiyuMart"
                  className="h-10 w-auto mb-4 hidden dark:block"
                  data-testid="img-footer-logo-dark"
                />
              </>
            )}
            <p className="text-muted-foreground mb-4">
              {settings?.footerDescription || "Your trusted fashion marketplace. Quality products, fast delivery, and excellent service."}
            </p>
            <div className="flex gap-2">
              {settings?.facebookUrl && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => openSocialLink(settings.facebookUrl)}
                  data-testid="button-facebook"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
              )}
              {settings?.instagramUrl && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openSocialLink(settings.instagramUrl)}
                  data-testid="button-instagram"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
              )}
              {settings?.twitterUrl && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openSocialLink(settings.twitterUrl)}
                  data-testid="button-twitter"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          <div>
            {settings?.isMultiVendor ? (
              <>
                <h4 className="font-semibold mb-4">Marketplace</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link href="/" className="hover:text-foreground transition-colors" data-testid="link-home">Home</Link></li>
                  <li><Link href="/products" className="hover:text-foreground transition-colors" data-testid="link-all-products">All Products</Link></li>
                  <li><Link href="/stores" className="hover:text-foreground transition-colors" data-testid="link-stores">Browse Stores</Link></li>
                  <li><Link href="/become-seller" className="hover:text-foreground transition-colors" data-testid="link-become-seller">Become a Seller</Link></li>
                </ul>
              </>
            ) : (
              <>
                <h4 className="font-semibold mb-4">Shop</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link href="/" className="hover:text-foreground transition-colors" data-testid="link-home">Home</Link></li>
                  {productCategories.length > 0 ? (
                    productCategories.map((category) => (
                      <li key={category}>
                        <Link 
                          href={`/category/${category.toLowerCase()}`} 
                          className="hover:text-foreground transition-colors capitalize" 
                          data-testid={`link-${category.toLowerCase()}`}
                        >
                          {category}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <>
                      <li><Link href="/products" className="hover:text-foreground transition-colors" data-testid="link-all-products">All Products</Link></li>
                    </>
                  )}
                </ul>
              </>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link 
                  href={isAuthenticated ? "/support" : "/auth"} 
                  className="hover:text-foreground transition-colors"
                  data-testid="link-support"
                >
                  Customer Support
                </Link>
              </li>
              <li>
                <Link 
                  href={isAuthenticated ? "/orders" : "/auth"} 
                  className="hover:text-foreground transition-colors" 
                  data-testid="link-orders"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link 
                  href={isAuthenticated ? "/wishlist" : "/auth"} 
                  className="hover:text-foreground transition-colors" 
                  data-testid="link-wishlist"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{settings?.contactPhone || "+233 XX XXX XXXX"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{settings?.contactEmail || "support@kiyumart.com"}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{settings?.contactAddress || "Accra, Ghana"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 {settings?.platformName || "KiyuMart"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
