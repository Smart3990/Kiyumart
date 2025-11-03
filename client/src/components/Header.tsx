import { ShoppingCart, Search, Menu, Globe, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useLanguage, languages, Language } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoLight from "@assets/light_mode_1762169855262.png";
import logoDark from "@assets/photo_2025-09-24_21-19-48-removebg-preview_1762169855290.png";

interface HeaderProps {
  cartItemsCount?: number;
  notificationCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearch?: (query: string) => void;
}

export default function Header({ 
  cartItemsCount = 0,
  notificationCount = 0,
  onMenuClick,
  onCartClick,
  onSearch 
}: HeaderProps) {
  const [, navigate] = useLocation();
  const { language, currency, setLanguage, t } = useLanguage();

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
              <DropdownMenuContent align="end">
                {Object.values(languages).map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as Language)}
                    data-testid={`option-${lang.code}`}
                    className={language === lang.code ? "bg-accent" : ""}
                  >
                    {lang.flag} {lang.name} - {lang.currency}
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
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground"
                  data-testid="badge-notification-count"
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/profile")}
              data-testid="button-account"
            >
              <User className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick || (() => navigate("/cart"))}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
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
