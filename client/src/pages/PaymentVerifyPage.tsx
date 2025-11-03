import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface VerificationResult {
  verified: boolean;
  message: string;
  transaction?: {
    id: string;
    orderId: string;
    amount: string;
    status: string;
  };
}

export default function PaymentVerifyPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/auth");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference");
    
    if (ref) {
      setReference(ref);
    } else {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const { data: verification, isLoading, error } = useQuery<VerificationResult>({
    queryKey: ["/api/payments/verify", reference],
    queryFn: async () => {
      const res = await fetch(`/api/payments/verify/${reference}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Verification failed");
      }
      const result = await res.json();
      
      if (result.verified && result.transaction) {
        queryClient.invalidateQueries({ queryKey: ["/api/orders", result.transaction.orderId] });
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
      
      return result;
    },
    enabled: !!reference && isAuthenticated,
    retry: false,
  });

  if (authLoading || isLoading || !reference) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying Payment
            </CardTitle>
            <CardDescription>Please wait while we confirm your payment...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Verification Error</CardTitle>
            </div>
            <CardDescription>
              {(error as Error).message || "Failed to verify payment"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you were charged, please contact support with reference: <strong>{reference}</strong>
            </p>
            <Button onClick={() => navigate("/")} className="w-full" data-testid="button-home">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verification?.verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              <CardTitle>Payment Successful!</CardTitle>
            </div>
            <CardDescription>Your payment has been confirmed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verification.transaction && (
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs" data-testid="text-transaction-id">
                    {verification.transaction.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium" data-testid="text-transaction-amount">
                    GHS {parseFloat(verification.transaction.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-green-600" data-testid="text-transaction-status">
                    {verification.transaction.status}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={() => navigate("/track")} 
                className="w-full" 
                size="lg"
                data-testid="button-track-order"
              >
                Track Your Order
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                variant="outline" 
                className="w-full"
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-6 w-6" />
            <CardTitle>Payment Failed</CardTitle>
          </div>
          <CardDescription>
            {verification?.message || "Your payment could not be completed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Reference: <strong>{reference}</strong>
          </p>
          <Button onClick={() => navigate("/")} className="w-full" data-testid="button-try-again">
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
