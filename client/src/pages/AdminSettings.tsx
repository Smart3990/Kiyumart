import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Settings2, CreditCard, Mail, Palette, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const settingsSchema = z.object({
  platformName: z.string().min(1, "Platform name is required"),
  isMultiVendor: z.boolean(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Must be a valid hex color"),
  defaultCurrency: z.string(),
  paystackPublicKey: z.string().optional(),
  paystackSecretKey: z.string().optional(),
  processingFeePercent: z.string().min(0),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactEmail: z.string().email("Must be a valid email"),
  contactAddress: z.string().min(1, "Contact address is required"),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  footerDescription: z.string().min(1, "Footer description is required"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface PlatformSettings extends SettingsFormData {
  id: string;
  logo?: string;
  onboardingImages?: string[];
  updatedAt: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery<PlatformSettings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: settings ? {
      platformName: settings.platformName,
      isMultiVendor: settings.isMultiVendor,
      primaryColor: settings.primaryColor,
      defaultCurrency: settings.defaultCurrency,
      paystackPublicKey: settings.paystackPublicKey || "",
      paystackSecretKey: settings.paystackSecretKey || "",
      processingFeePercent: settings.processingFeePercent,
      contactPhone: settings.contactPhone,
      contactEmail: settings.contactEmail,
      contactAddress: settings.contactAddress,
      facebookUrl: settings.facebookUrl || "",
      instagramUrl: settings.instagramUrl || "",
      twitterUrl: settings.twitterUrl || "",
      footerDescription: settings.footerDescription,
    } : undefined,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const res = await apiRequest("PATCH", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Platform settings have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-admin-settings">
            <Settings2 className="h-8 w-8" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your platform configuration, payment settings, and contact information
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="general" data-testid="tab-general">
                <Settings2 className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">
                <CreditCard className="h-4 w-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="contact" data-testid="tab-contact">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="branding" data-testid="tab-branding">
                <Palette className="h-4 w-4 mr-2" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="currency" data-testid="tab-currency">
                <DollarSign className="h-4 w-4 mr-2" />
                Currency
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure your platform's basic information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      {...form.register("platformName")}
                      placeholder="KiyuMart"
                      data-testid="input-platform-name"
                    />
                    {form.formState.errors.platformName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.platformName.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="isMultiVendor">Multi-Vendor Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable multiple sellers to list products on your platform
                      </p>
                    </div>
                    <Switch
                      id="isMultiVendor"
                      checked={form.watch("isMultiVendor")}
                      onCheckedChange={(checked) => form.setValue("isMultiVendor", checked)}
                      data-testid="switch-multi-vendor"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Paystack Integration</CardTitle>
                  <CardDescription>
                    Configure your Paystack payment gateway credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paystackPublicKey">Paystack Public Key</Label>
                    <Input
                      id="paystackPublicKey"
                      {...form.register("paystackPublicKey")}
                      placeholder="pk_test_xxxxxxxxxxxxxxxx"
                      data-testid="input-paystack-public"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Paystack public key (starts with pk_test_ or pk_live_)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paystackSecretKey">Paystack Secret Key</Label>
                    <Input
                      id="paystackSecretKey"
                      type="password"
                      {...form.register("paystackSecretKey")}
                      placeholder="sk_test_xxxxxxxxxxxxxxxx"
                      data-testid="input-paystack-secret"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Paystack secret key (starts with sk_test_ or sk_live_)
                    </p>
                    {form.formState.errors.paystackSecretKey && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.paystackSecretKey.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="processingFeePercent">Processing Fee (%)</Label>
                    <Input
                      id="processingFeePercent"
                      type="number"
                      step="0.01"
                      {...form.register("processingFeePercent")}
                      placeholder="1.95"
                      data-testid="input-processing-fee"
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentage fee charged per transaction
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Update your platform's contact details displayed in the footer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      {...form.register("contactPhone")}
                      placeholder="+233 XX XXX XXXX"
                      data-testid="input-contact-phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      {...form.register("contactEmail")}
                      placeholder="support@kiyumart.com"
                      data-testid="input-contact-email"
                    />
                    {form.formState.errors.contactEmail && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contactEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactAddress">Contact Address</Label>
                    <Input
                      id="contactAddress"
                      {...form.register("contactAddress")}
                      placeholder="Accra, Ghana"
                      data-testid="input-contact-address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footerDescription">Footer Description</Label>
                    <Textarea
                      id="footerDescription"
                      {...form.register("footerDescription")}
                      placeholder="Your trusted fashion marketplace..."
                      rows={3}
                      data-testid="input-footer-description"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-4">Social Media Links</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebookUrl">Facebook URL</Label>
                        <Input
                          id="facebookUrl"
                          {...form.register("facebookUrl")}
                          placeholder="https://facebook.com/yourpage"
                          data-testid="input-facebook-url"
                        />
                        {form.formState.errors.facebookUrl && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.facebookUrl.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagramUrl">Instagram URL</Label>
                        <Input
                          id="instagramUrl"
                          {...form.register("instagramUrl")}
                          placeholder="https://instagram.com/yourpage"
                          data-testid="input-instagram-url"
                        />
                        {form.formState.errors.instagramUrl && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.instagramUrl.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitterUrl">Twitter URL</Label>
                        <Input
                          id="twitterUrl"
                          {...form.register("twitterUrl")}
                          placeholder="https://twitter.com/yourpage"
                          data-testid="input-twitter-url"
                        />
                        {form.formState.errors.twitterUrl && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.twitterUrl.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Branding & Appearance</CardTitle>
                  <CardDescription>
                    Customize your platform's visual identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        {...form.register("primaryColor")}
                        placeholder="#1e7b5f"
                        data-testid="input-primary-color"
                        className="flex-1"
                      />
                      <div 
                        className="w-12 h-10 rounded border"
                        style={{ backgroundColor: form.watch("primaryColor") }}
                      />
                    </div>
                    {form.formState.errors.primaryColor && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.primaryColor.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Hex color code for your brand's primary color
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="currency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Currency Settings</CardTitle>
                  <CardDescription>
                    Configure your platform's default currency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select
                      value={form.watch("defaultCurrency")}
                      onValueChange={(value) => form.setValue("defaultCurrency", value)}
                    >
                      <SelectTrigger data-testid="select-default-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GHS">GHS - Ghanaian Cedi</SelectItem>
                        <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                        <SelectItem value="XOF">XOF - West African CFA Franc</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateSettingsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
