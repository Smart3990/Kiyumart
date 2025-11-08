import { Search, Bell, Heart, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  title?: string;
}

export default function MobileHeader({ showSearch = true, onSearchChange, title }: MobileHeaderProps) {
  const [, navigate] = useLocation();

  const { data: platformSettings } = useQuery<{ platformName?: string; logo?: string }>({
    queryKey: ["/api/platform-settings"],
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    select: (data: any) => data?.count || 0,
  });

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border md:hidden">
      <div className="px-4 py-3 space-y-3">
        {/* Top Row: Logo + Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
            data-testid="link-home"
          >
            {platformSettings?.logo ? (
              <img
                src={platformSettings.logo}
                alt={platformSettings.platformName || "KiyuMart"}
                className="h-8 w-auto"
              />
            ) : (
              <h1 className="text-2xl font-bold text-primary">
                {platformSettings?.platformName || "KiyuMart"}
              </h1>
            )}
          </button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/notifications")}
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold border-2 border-card px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/wishlist")}
              data-testid="button-wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 pr-4 h-10 bg-muted/50 border-border"
              onChange={(e) => onSearchChange?.(e.target.value)}
              data-testid="input-search"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              data-testid="button-search-filter"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
