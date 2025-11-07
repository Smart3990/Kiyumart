import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useBranding } from "@/hooks/useBranding";

import Home from "@/pages/HomeConnected";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboardConnected";
import SellerDashboard from "@/pages/SellerDashboardConnected";
import RiderDashboard from "@/pages/RiderDashboard";
import BuyerDashboard from "@/pages/BuyerDashboard";
import AgentDashboard from "@/pages/AgentDashboard";
import AgentTickets from "@/pages/AgentTickets";
import AgentCustomers from "@/pages/AgentCustomers";
import AgentNotifications from "@/pages/AgentNotifications";
import ChatPage from "@/pages/ChatPageConnected";
import OrderTracking from "@/pages/OrderTracking";
import Checkout from "@/pages/CheckoutConnected";
import PaymentPage from "@/pages/PaymentPage";
import PaymentVerifyPage from "@/pages/PaymentVerifyPage";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailure from "@/pages/PaymentFailure";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import ChangePassword from "@/pages/ChangePassword";
import AdminSettings from "@/pages/AdminSettings";
import AdminStoreManager from "@/pages/AdminStoreManager";
import AdminBranding from "@/pages/AdminBranding";
import AdminDeliveryZones from "@/pages/AdminDeliveryZones";
import AdminBannerManager from "@/pages/AdminBannerManager";
import AdminCategoryManager from "@/pages/AdminCategoryManager";
import AdminProducts from "@/pages/AdminProducts";
import AdminOrders from "@/pages/AdminOrders";
import AdminUsers from "@/pages/AdminUsers";
import AdminSellers from "@/pages/AdminSellers";
import AdminRiders from "@/pages/AdminRiders";
import AdminAgents from "@/pages/AdminAgents";
import AdminMessages from "@/pages/AdminMessages";
import AdminAnalytics from "@/pages/AdminAnalytics";
import AdminMediaLibrary from "@/pages/AdminMediaLibrary";
import SellerMediaLibrary from "@/pages/SellerMediaLibrary";
import SellerProducts from "@/pages/SellerProducts";
import CategoryPage from "@/pages/CategoryPage";
import Wishlist from "@/pages/Wishlist";
import Orders from "@/pages/Orders";
import CustomerSupport from "@/pages/CustomerSupport";
import NotFound from "@/pages/not-found";
import AllProducts from "@/pages/AllProducts";
import BrowseStores from "@/pages/BrowseStores";
import SellerStorePage from "@/pages/SellerStorePage";
import BecomeSellerPage from "@/pages/BecomeSellerPage";
import BecomeRiderPage from "@/pages/BecomeRiderPage";
import AdminStoresList from "@/pages/AdminStoresList";
import AdminUserEdit from "@/pages/AdminUserEdit";
import RiderEdit from "@/pages/RiderEdit";
import AdminApplications from "@/pages/AdminApplications";
import AdminProductEdit from "@/pages/AdminProductEdit";
import AdminProductCreate from "@/pages/AdminProductCreate";
import DynamicPage from "@/pages/DynamicPage";

function Router() {
  // Apply branding colors from database settings
  useBranding();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={AllProducts} />
      <Route path="/stores" component={BrowseStores} />
      <Route path="/seller/:id" component={SellerStorePage} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/category/:id" component={CategoryPage} />
      <Route path="/cart" component={Cart} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment/verify" component={PaymentVerifyPage} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/failure" component={PaymentFailure} />
      <Route path="/payment/:orderId" component={PaymentPage} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/change-password" component={ChangePassword} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/orders" component={Orders} />
      <Route path="/support" component={CustomerSupport} />
      <Route path="/become-seller" component={BecomeSellerPage} />
      <Route path="/become-rider" component={BecomeRiderPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/stores" component={AdminStoresList} />
      <Route path="/admin/store" component={AdminStoreManager} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/branding" component={AdminBranding} />
      <Route path="/admin/zones" component={AdminDeliveryZones} />
      <Route path="/admin/delivery-zones" component={AdminDeliveryZones} />
      <Route path="/admin/banners" component={AdminBannerManager} />
      <Route path="/admin/categories" component={AdminCategoryManager} />
      <Route path="/admin/media-library" component={AdminMediaLibrary} />
      <Route path="/admin/products/create" component={AdminProductCreate} />
      <Route path="/admin/products/:id/edit" component={AdminProductEdit} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/users/:id/edit" component={AdminUserEdit} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/sellers" component={AdminSellers} />
      <Route path="/admin/riders/:id/edit" component={RiderEdit} />
      <Route path="/admin/riders" component={AdminRiders} />
      <Route path="/admin/agents" component={AdminAgents} />
      <Route path="/admin/applications" component={AdminApplications} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/seller" component={SellerDashboard} />
      <Route path="/seller/products" component={SellerProducts} />
      <Route path="/seller/media-library" component={SellerMediaLibrary} />
      <Route path="/rider" component={RiderDashboard} />
      <Route path="/buyer" component={BuyerDashboard} />
      <Route path="/agent" component={AgentDashboard} />
      <Route path="/agent/tickets" component={AgentTickets} />
      <Route path="/agent/customers" component={AgentCustomers} />
      <Route path="/agent/notifications" component={AgentNotifications} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/track" component={OrderTracking} />
      <Route path="/page/:slug" component={DynamicPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
