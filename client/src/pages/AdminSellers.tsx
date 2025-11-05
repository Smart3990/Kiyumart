import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Store, Edit, Ban, ArrowLeft, Plus, CheckCircle, XCircle, ShieldCheck, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SellerData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  storeName: string | null;
  storeDescription: string | null;
  storeBanner: string | null;
  profileImage: string | null;
  createdAt: string;
}

const createSellerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  storeDescription: z.string().optional(),
  storeBanner: z.string().optional(),
});

const editSellerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  storeDescription: z.string().optional(),
  storeBanner: z.string().optional(),
});

type CreateSellerFormData = z.infer<typeof createSellerSchema>;
type EditSellerFormData = z.infer<typeof editSellerSchema>;

function CreateSellerDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateSellerFormData>({
    resolver: zodResolver(createSellerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      storeName: "",
      storeDescription: "",
      storeBanner: "",
    },
  });

  const createSellerMutation = useMutation({
    mutationFn: async (data: CreateSellerFormData) => {
      return apiRequest("POST", "/api/users", { ...data, role: "seller" });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Seller created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create seller",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateSellerFormData) => {
    createSellerMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-seller">
          <Plus className="mr-2 h-4 w-4" />
          Create New Seller
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Seller</DialogTitle>
          <DialogDescription>
            Add a new seller to the platform with store details
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} data-testid="input-create-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seller@example.com" {...field} data-testid="input-create-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} data-testid="input-create-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+233 XX XXX XXXX" {...field} data-testid="input-create-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="My Fashion Store" {...field} data-testid="input-create-store-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your store and products..." 
                      {...field} 
                      data-testid="input-create-store-description"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeBanner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Banner URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} data-testid="input-create-store-banner" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSellerMutation.isPending}
                data-testid="button-submit-create"
              >
                {createSellerMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Seller
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EditSellerDialog({ sellerData }: { sellerData: SellerData }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditSellerFormData>({
    resolver: zodResolver(editSellerSchema),
    defaultValues: {
      name: sellerData.name,
      email: sellerData.email,
      phone: sellerData.phone || "",
      password: "",
      storeName: sellerData.storeName || "",
      storeDescription: sellerData.storeDescription || "",
      storeBanner: sellerData.storeBanner || "",
    },
  });

  const editSellerMutation = useMutation({
    mutationFn: async (data: EditSellerFormData) => {
      const updateData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        storeBanner: data.storeBanner,
      };
      
      // Only include password if provided
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      return apiRequest("PATCH", `/api/users/${sellerData.id}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Seller updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update seller",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditSellerFormData) => {
    editSellerMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          data-testid={`button-edit-${sellerData.id}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Seller</DialogTitle>
          <DialogDescription>
            Update seller information and store details
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} data-testid="input-edit-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seller@example.com" {...field} data-testid="input-edit-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Leave blank to keep current)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} data-testid="input-edit-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+233 XX XXX XXXX" {...field} data-testid="input-edit-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="My Fashion Store" {...field} data-testid="input-edit-store-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your store and products..." 
                      {...field} 
                      data-testid="input-edit-store-description"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeBanner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Banner URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} data-testid="input-edit-store-banner" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editSellerMutation.isPending}
                data-testid="button-submit-edit"
              >
                {editSellerMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Seller
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function BanActivateDialog({ sellerData }: { sellerData: SellerData }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/users/${sellerData.id}/status`, { isActive: !sellerData.isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Seller ${sellerData.isActive ? 'deactivated' : 'activated'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update seller status",
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          data-testid={`button-ban-${sellerData.id}`}
        >
          <Ban className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {sellerData.isActive ? 'Deactivate' : 'Activate'} Seller?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {sellerData.isActive ? 'deactivate' : 'activate'} {sellerData.name}? 
            {sellerData.isActive && ' This will prevent them from accessing their account and managing their store.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-ban">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => toggleStatusMutation.mutate()}
            disabled={toggleStatusMutation.isPending}
            data-testid="button-confirm-ban"
          >
            {toggleStatusMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {sellerData.isActive ? 'Deactivate' : 'Activate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminSellers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: users = [], isLoading } = useQuery<SellerData[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Filter to show only sellers
  const sellers = users.filter(u => u.role === "seller");
  
  const filteredSellers = sellers.filter(s => 
    (s.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (s.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (s.storeName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (authLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout role="admin" showBackButton>
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
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-sellers">Sellers Management</h1>
              <p className="text-muted-foreground mt-1">Manage sellers, stores, and approvals</p>
            </div>
            <CreateSellerDialog />
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sellers by name, email or store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-sellers"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredSellers.map((seller) => (
                <Card key={seller.id} className="p-4" data-testid={`card-seller-${seller.id}`}>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate" data-testid={`text-name-${seller.id}`}>
                            {seller.name}
                          </h3>
                          <p className="text-sm text-primary font-medium truncate" data-testid={`text-store-${seller.id}`}>
                            {seller.storeName || "No store name"}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <EditSellerDialog sellerData={seller} />
                          <BanActivateDialog sellerData={seller} />
                          {seller.storeName && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => navigate(`/seller/${seller.id}`)}
                              data-testid={`button-view-store-${seller.id}`}
                            >
                              <Store className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span data-testid={`text-email-${seller.id}`}>{seller.email}</span>
                          {seller.phone && (
                            <>
                              <span>•</span>
                              <span data-testid={`text-phone-${seller.id}`}>{seller.phone}</span>
                            </>
                          )}
                        </div>
                        
                        {seller.storeDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-description-${seller.id}`}>
                            {seller.storeDescription}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {seller.isActive ? (
                          <Badge className="bg-green-500" data-testid={`badge-status-${seller.id}`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" data-testid={`badge-status-${seller.id}`}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        
                        {seller.isApproved ? (
                          <Badge className="bg-blue-500" data-testid={`badge-approval-${seller.id}`}>
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" data-testid={`badge-approval-${seller.id}`}>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Approval
                          </Badge>
                        )}
                        
                        <span className="text-xs text-muted-foreground ml-auto" data-testid={`text-joined-${seller.id}`}>
                          Joined {new Date(seller.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredSellers.length === 0 && (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground" data-testid="text-no-sellers">
                    {searchQuery ? "No sellers found matching your search" : "No sellers registered yet"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
    </DashboardLayout>
  );
}
