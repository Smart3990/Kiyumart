import { ShoppingCart, Search, Menu, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  cartItemsCount?: number;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onSearch?: (query: string) => void;
}

export default function Header({ 
  cartItemsCount = 0, 
  onMenuClick,
  onCartClick,
  onSearch 
}: HeaderProps) {
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
            
            <h1 className="text-2xl font-bold text-primary" data-testid="text-logo">
              KiyuMart
            </h1>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                <DropdownMenuItem data-testid="option-english">🇬🇧 English - GHS</DropdownMenuItem>
                <DropdownMenuItem data-testid="option-french">🇫🇷 Français - EUR</DropdownMenuItem>
                <DropdownMenuItem data-testid="option-spanish">🇪🇸 Español - USD</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-account"
            >
              <User className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
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
