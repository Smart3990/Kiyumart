import { Home, ShoppingCart, Package, User } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  badge?: number;
}

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const { data: cart = [] } = useQuery<Array<{ quantity: number }>>({
    queryKey: ["/api/cart"],
  });

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: cartCount },
    { icon: Package, label: "Orders", path: "/orders" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-lg bg-card/95 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div className="relative">
                <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold border-2 border-card px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-xs font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
