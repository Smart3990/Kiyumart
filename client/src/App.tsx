import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";

import Home from "@/pages/HomeConnected";
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboardConnected";
import SellerDashboard from "@/pages/SellerDashboardConnected";
import RiderDashboard from "@/pages/RiderDashboard";
// import ChatPage from "@/pages/ChatPageConnected"; // TEMPORARILY DISABLED - Phase 2 feature
import OrderTracking from "@/pages/OrderTracking";
import Checkout from "@/pages/CheckoutConnected";
import PaymentPage from "@/pages/PaymentPage";
import PaymentVerifyPage from "@/pages/PaymentVerifyPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment/:orderId" component={PaymentPage} />
      <Route path="/payment/verify" component={PaymentVerifyPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/seller" component={SellerDashboard} />
      <Route path="/rider" component={RiderDashboard} />
      {/* <Route path="/chat" component={ChatPage} /> */} {/* TEMPORARILY DISABLED - Phase 2 feature */}
      <Route path="/track" component={OrderTracking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
