import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Bike, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const becomeRiderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleNumber: z.string().min(3, "Vehicle number is required"),
  licenseNumber: z.string().min(3, "License number is required"),
  nationalIdCard: z.string().min(5, "National ID card is required"),
});

type BecomeRiderFormData = z.infer<typeof becomeRiderSchema>;

export default function BecomeRiderPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<BecomeRiderFormData>({
    resolver: zodResolver(becomeRiderSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      vehicleType: "",
      vehicleNumber: "",
      licenseNumber: "",
      nationalIdCard: "",
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: BecomeRiderFormData) => {
      const applicationData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "rider",
        vehicleInfo: {
          type: data.vehicleType,
          plateNumber: data.vehicleNumber,
          license: data.licenseNumber,
        },
        nationalIdCard: data.nationalIdCard,
      };
      return apiRequest("POST", "/api/applications/rider", applicationData);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your rider application has been submitted successfully. You will be notified once approved.",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BecomeRiderFormData) => {
    applyMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Bike className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Become a Rider</CardTitle>
                  <CardDescription>
                    Join our delivery team and start earning
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-name" />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+233 XX XXX XXXX" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-vehicle-type">
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="motorcycle">Motorcycle</SelectItem>
                            <SelectItem value="bicycle">Bicycle</SelectItem>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="van">Van</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Number / Plate</FormLabel>
                        <FormControl>
                          <Input placeholder="GR-1234-23" {...field} data-testid="input-vehicle-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver's License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="DL-123456" {...field} data-testid="input-license-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationalIdCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="GHA-123456789-0" {...field} data-testid="input-national-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={applyMutation.isPending}
                      data-testid="button-submit"
                    >
                      {applyMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Application
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
