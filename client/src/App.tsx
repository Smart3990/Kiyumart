import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Home from "@/pages/HomeConnected";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboardConnected";
import SellerDashboard from "@/pages/SellerDashboardConnected";
import RiderDashboard from "@/pages/RiderDashboard";
import ChatPage from "@/pages/ChatPageConnected";
import OrderTracking from "@/pages/OrderTracking";
import Checkout from "@/pages/CheckoutConnected";
import PaymentPage from "@/pages/PaymentPage";
import PaymentVerifyPage from "@/pages/PaymentVerifyPage";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import CategoryPage from "@/pages/CategoryPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/category/:id" component={CategoryPage} />
      <Route path="/cart" component={Cart} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment/:orderId" component={PaymentPage} />
      <Route path="/payment/verify" component={PaymentVerifyPage} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/seller" component={SellerDashboard} />
      <Route path="/rider" component={RiderDashboard} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/track" component={OrderTracking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
