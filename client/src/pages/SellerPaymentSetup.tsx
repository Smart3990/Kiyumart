import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign, CheckCircle2, ArrowLeft } from "lucide-react";

const paymentSetupSchema = z.object({
  payoutType: z.enum(["bank_account"]),
  bankCode: z.string().min(1, "Bank is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
});

type PaymentSetupFormData = z.infer<typeof paymentSetupSchema>;

interface Bank {
  id: number;
  name: string;
  code: string;
}

interface Store {
  id: string;
  name: string;
  primarySellerId: string;
  paystackSubaccountId?: string;
}

export default function SellerPaymentSetup() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "seller")) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: store, isLoading: storeLoading } = useQuery<Store>({
    queryKey: ["/api/stores/my-store"],
    enabled: isAuthenticated && user?.role === "seller",
  });

  const { data: banks = [] } = useQuery<Bank[]>({
    queryKey: ["/api/paystack/banks"],
  });

  const form = useForm<PaymentSetupFormData>({
    resolver: zodResolver(paymentSetupSchema),
    defaultValues: {
      payoutType: "bank_account",
      bankCode: "",
      accountNumber: "",
      accountName: "",
    },
  });

  const verifyAccountMutation = useMutation({
    mutationFn: async (data: { accountNumber: string; bankCode: string }) => {
      const res = await apiRequest("POST", "/api/paystack/verify-account", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.accountName) {
        form.setValue("accountName", data.accountName);
        setVerified(true);
        toast({
          title: "Account Verified",
          description: `Account belongs to ${data.accountName}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify account. Please check details.",
        variant: "destructive",
      });
    },
  });

  const setupPaymentMutation = useMutation({
    mutationFn: async (data: PaymentSetupFormData) => {
      if (!store?.id) {
        throw new Error("Store not found");
      }

      const payoutDetails = {
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        bankName: banks.find(b => b.code === data.bankCode)?.name,
      };

      const res = await apiRequest("POST", `/api/stores/${store.id}/setup-paystack`, {
        payoutType: "bank_account",
        payoutDetails,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores/my-store"] });
      toast({
        title: "Success",
        description: "Payment details set up successfully! You can now receive payments.",
      });
      setTimeout(() => navigate("/seller"), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to set up payment details",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    const accountNumber = form.getValues("accountNumber");
    const bankCode = form.getValues("bankCode");

    if (!accountNumber || !bankCode) {
      toast({
        title: "Missing Information",
        description: "Please select a bank and enter account number",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    verifyAccountMutation.mutate({ accountNumber, bankCode });
    setVerifying(false);
  };

  const onSubmit = (data: PaymentSetupFormData) => {
    if (!verified) {
      toast({
        title: "Account Not Verified",
        description: "Please verify your bank account before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!store?.id) {
      toast({
        title: "Store Not Found",
        description: "Unable to find your store. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setupPaymentMutation.mutate(data);
  };

  if (authLoading || storeLoading || !isAuthenticated || user?.role !== "seller") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return (
      <DashboardLayout role="seller">
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>Store Not Found</CardTitle>
              <CardDescription>
                You need to have an active store before setting up payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/seller")} data-testid="button-back-dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (store.paystackSubaccountId) {
    return (
      <DashboardLayout role="seller">
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>Payment Setup Complete</CardTitle>
              <CardDescription>
                Your payment details are already configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/seller")} data-testid="button-back-dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="seller">
      <div className="p-8" data-testid="page-seller-payment-setup">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-payment-setup">
              <DollarSign className="h-8 w-8" />
              Payment Setup
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure your payment details to receive earnings from sales
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
              <CardDescription>
                Enter your bank account information to receive payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bankCode">Select Bank</Label>
                  <Select
                    onValueChange={(value) => {
                      form.setValue("bankCode", value);
                      setVerified(false);
                    }}
                  >
                    <SelectTrigger data-testid="select-bank">
                      <SelectValue placeholder="Choose your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code} data-testid={`bank-option-${bank.code}`}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accountNumber"
                      {...form.register("accountNumber")}
                      placeholder="0123456789"
                      data-testid="input-account-number"
                      onChange={() => setVerified(false)}
                    />
                    <Button
                      type="button"
                      onClick={handleVerify}
                      disabled={verifying || !form.getValues("accountNumber") || !form.getValues("bankCode")}
                      data-testid="button-verify-account"
                    >
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                    </Button>
                  </div>
                </div>

                {verified && form.getValues("accountName") && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Account Verified</p>
                        <p className="text-sm text-green-700 dark:text-green-300" data-testid="text-account-name">
                          {form.getValues("accountName")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={setupPaymentMutation.isPending || !verified}
                    data-testid="button-submit-payment-setup"
                    className="gap-2"
                  >
                    {setupPaymentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Setting Up...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/seller")}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
