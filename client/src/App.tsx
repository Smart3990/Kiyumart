import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboard";
import SellerDashboard from "@/pages/SellerDashboard";
import RiderDashboard from "@/pages/RiderDashboard";
import ChatPage from "@/pages/ChatPage";
import OrderTracking from "@/pages/OrderTracking";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
