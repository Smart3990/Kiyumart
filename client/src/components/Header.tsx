import { Search, Menu, Globe, User, Bell, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useLanguage, languages, Language } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CartPopover from "@/components/CartPopover";
import logoLight from "@assets/light_mode_1762169855262.png";
import logoDark from "@assets/photo_2025-09-24_21-19-48-removebg-preview_1762169855290.png";

interface HeaderProps {
  cartItemsCount?: number;
  notificationCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearch?: (query: string) => void;
}

interface WishlistItem {
  id: string;
  productId: string;
}

export default function Header({ 
  cartItemsCount = 0,
  notificationCount = 0,
  onMenuClick,
  onCartClick,
  onSearch 
}: HeaderProps) {
  const [location, navigate] = useLocation();
  const { language, currency, currencySymbol, countryName, setLanguage, t } = useLanguage();
  
  const { data: wishlist = [] } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
  });

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div 
              className="cursor-pointer" 
              data-testid="logo-container"
              onClick={() => navigate("/")}
            >
              <img 
                src={logoLight}
                alt="KiyuMart"
                className="h-10 w-auto dark:hidden"
                data-testid="logo-light"
              />
              <img 
                src={logoDark}
                alt="KiyuMart"
                className="h-10 w-auto hidden dark:block"
                data-testid="logo-dark"
              />
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                className="pl-10"
                data-testid="input-search"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-language">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {Object.values(languages).map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as Language)}
                    data-testid={`option-${lang.code}`}
                    className={language === lang.code ? "bg-accent" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{lang.flag} {lang.country}</span>
                      <span className="text-muted-foreground text-xs">{lang.currency} ({lang.symbol})</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon"
              className="relative"
              onClick={() => navigate("/notifications")}
              data-testid="button-notifications"
            >
              <Bell className={`h-5 w-5 ${isActive("/notifications") ? "text-primary" : ""}`} />
              {notificationCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground rounded-full"
                  data-testid="badge-notification-count"
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              className="relative"
              onClick={() => navigate("/wishlist")}
              data-testid="button-wishlist"
            >
              <Heart className={`h-5 w-5 ${isActive("/wishlist") ? "text-primary fill-primary" : ""}`} />
              {wishlist.length > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground rounded-full"
                  data-testid="badge-wishlist-count"
                >
                  {wishlist.length > 9 ? "9+" : wishlist.length}
                </Badge>
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/orders")}
              data-testid="button-orders"
            >
              <Package className={`h-5 w-5 ${isActive("/orders") ? "text-primary" : ""}`} />
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/profile")}
              data-testid="button-account"
            >
              <User className={`h-5 w-5 ${isActive("/profile") ? "text-primary" : ""}`} />
            </Button>

            <CartPopover />
          </div>
        </div>

        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              data-testid="input-search-mobile"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
