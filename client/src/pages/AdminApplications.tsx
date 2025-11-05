import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Store, Bike, Check, X, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isApproved: boolean;
  createdAt: string;
  storeName?: string;
  storeDescription?: string;
  vehicleInfo?: {
    type: string;
    plateNumber: string;
    license: string;
  };
  nationalIdCard?: string;
}

export default function AdminApplications() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: sellerApplications = [], isLoading: sellersLoading } = useQuery<Application[]>({
    queryKey: ["/api/users", "seller", "pending"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=seller&isApproved=false");
      return res.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: riderApplications = [], isLoading: ridersLoading } = useQuery<Application[]>({
    queryKey: ["/api/users", "rider", "pending"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=rider&isApproved=false");
      return res.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  const approveApplicationMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return apiRequest("PATCH", `/api/users/${userId}/approve`, { isApproved: true });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", "seller", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", "rider", "pending"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve application",
        variant: "destructive",
      });
    },
  });

  const rejectApplicationMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", "seller", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", "rider", "pending"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject application",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-applications">
                Applications
              </h1>
              <p className="text-muted-foreground mt-1">Review and approve seller and rider applications</p>
            </div>
          </div>

          <Tabs defaultValue="sellers" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="sellers" data-testid="tab-sellers">
                Seller Applications ({sellerApplications.length})
              </TabsTrigger>
              <TabsTrigger value="riders" data-testid="tab-riders">
                Rider Applications ({riderApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sellers" className="mt-6">
              {sellersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {sellerApplications.map((application) => (
                    <Card key={application.id} className="p-4" data-testid={`card-seller-${application.id}`}>
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-500/10 p-3 rounded-full">
                          <Store className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg" data-testid={`text-name-${application.id}`}>
                            {application.name}
                          </h3>
                          <div className="space-y-1 mt-2">
                            <p className="text-sm text-muted-foreground" data-testid={`text-email-${application.id}`}>
                              Email: {application.email}
                            </p>
                            {application.phone && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-phone-${application.id}`}>
                                Phone: {application.phone}
                              </p>
                            )}
                            {application.storeName && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-store-${application.id}`}>
                                Store: {application.storeName}
                              </p>
                            )}
                            {application.storeDescription && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-description-${application.id}`}>
                                {application.storeDescription}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground" data-testid={`text-date-${application.id}`}>
                              Applied: {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => approveApplicationMutation.mutate({ userId: application.id })}
                            disabled={approveApplicationMutation.isPending}
                            data-testid={`button-approve-${application.id}`}
                            className="gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => rejectApplicationMutation.mutate({ userId: application.id })}
                            disabled={rejectApplicationMutation.isPending}
                            data-testid={`button-reject-${application.id}`}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {sellerApplications.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground" data-testid="text-no-sellers">
                        No pending seller applications
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="riders" className="mt-6">
              {ridersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {riderApplications.map((application) => (
                    <Card key={application.id} className="p-4" data-testid={`card-rider-${application.id}`}>
                      <div className="flex items-start gap-4">
                        <div className="bg-orange-500/10 p-3 rounded-full">
                          <Bike className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg" data-testid={`text-name-${application.id}`}>
                            {application.name}
                          </h3>
                          <div className="space-y-1 mt-2">
                            <p className="text-sm text-muted-foreground" data-testid={`text-email-${application.id}`}>
                              Email: {application.email}
                            </p>
                            {application.phone && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-phone-${application.id}`}>
                                Phone: {application.phone}
                              </p>
                            )}
                            {application.nationalIdCard && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-id-${application.id}`}>
                                ID: {application.nationalIdCard}
                              </p>
                            )}
                            {application.vehicleInfo && (
                              <div className="text-sm text-muted-foreground" data-testid={`text-vehicle-${application.id}`}>
                                <p>Vehicle: {application.vehicleInfo.type}</p>
                                <p>Plate: {application.vehicleInfo.plateNumber}</p>
                                <p>License: {application.vehicleInfo.license}</p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground" data-testid={`text-date-${application.id}`}>
                              Applied: {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => approveApplicationMutation.mutate({ userId: application.id })}
                            disabled={approveApplicationMutation.isPending}
                            data-testid={`button-approve-${application.id}`}
                            className="gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => rejectApplicationMutation.mutate({ userId: application.id })}
                            disabled={rejectApplicationMutation.isPending}
                            data-testid={`button-reject-${application.id}`}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {riderApplications.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground" data-testid="text-no-riders">
                        No pending rider applications
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
    </DashboardLayout>
  );
}
