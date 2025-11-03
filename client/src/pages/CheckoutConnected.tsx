import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Bike, Building2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: string;
  images: string[];
  sellerId: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  fee: string;
}

export default function CheckoutConnected() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "bus" | "rider">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: deliveryZones = [] } = useQuery<DeliveryZone[]>({
    queryKey: ["/api/delivery-zones"],
  });

  const { data: cartProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/cart/products", cartItems],
    queryFn: async () => {
      if (!cartItems.length) return [];
      const productsData = await Promise.all(
        cartItems.map(async (item) => {
          const res = await fetch(`/api/products/${item.productId}`);
          return res.json();
        })
      );
      return productsData;
    },
    enabled: cartItems.length > 0,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      toast({
        title: "Order Placed Successfully",
        description: `Order #${data.orderNumber} has been created`,
      });

      if (data.paymentStatus === "pending") {
        navigate(`/payment/${data.id}`);
      } else {
        navigate("/track");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  if (!cartItems.length && !productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Cart is Empty</CardTitle>
            <CardDescription>Add some products to your cart before checking out</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const itemsWithProducts = cartItems.map(item => {
    const product = cartProducts.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const subtotal = itemsWithProducts.reduce((sum, item) => {
    return sum + (parseFloat(item.product!.price) * item.quantity);
  }, 0);

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const deliveryFee = deliveryMethod === "pickup" ? 0 : 
                      deliveryMethod === "bus" ? (selectedZone ? parseFloat(selectedZone.fee) * 0.5 : 5) :
                      selectedZone ? parseFloat(selectedZone.fee) : 10;

  const processingFee = (subtotal + deliveryFee) * 0.0195;
  const total = subtotal + deliveryFee + processingFee;

  const handlePlaceOrder = async () => {
    if (deliveryMethod !== "pickup" && !deliveryAddress) {
      toast({
        title: "Missing Information",
        description: "Please provide a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (deliveryMethod !== "pickup" && !selectedZoneId) {
      toast({
        title: "Missing Information",
        description: "Please select a delivery zone",
        variant: "destructive",
      });
      return;
    }

    const sellerId = itemsWithProducts[0]?.product?.sellerId || user?.id;

    const orderData = {
      items: itemsWithProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product!.price,
        total: (parseFloat(item.product!.price) * item.quantity).toFixed(2),
      })),
      sellerId,
      deliveryMethod,
      deliveryZoneId: selectedZoneId || null,
      deliveryAddress: deliveryAddress || null,
      deliveryFee: deliveryFee.toFixed(2),
      subtotal: subtotal.toFixed(2),
      processingFee: processingFee.toFixed(2),
      total: total.toFixed(2),
      currency: "GHS",
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card data-testid="card-delivery-method">
              <CardHeader>
                <CardTitle>Delivery Method</CardTitle>
                <CardDescription>Choose how you want to receive your order</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={(value) => setDeliveryMethod(value as any)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover-elevate">
                    <RadioGroupItem value="pickup" id="pickup" data-testid="radio-pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Pickup</div>
                        <div className="text-sm text-muted-foreground">Collect from store - Free</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover-elevate">
                    <RadioGroupItem value="bus" id="bus" data-testid="radio-bus" />
                    <Label htmlFor="bus" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Bus Delivery</div>
                        <div className="text-sm text-muted-foreground">Delivered via bus</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover-elevate">
                    <RadioGroupItem value="rider" id="rider" data-testid="radio-rider" />
                    <Label htmlFor="rider" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Bike className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Rider Delivery</div>
                        <div className="text-sm text-muted-foreground">Fast delivery by rider</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {deliveryMethod !== "pickup" && (
              <Card data-testid="card-delivery-address">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Details
                  </CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter your full delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      data-testid="input-address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zone">Delivery Zone</Label>
                    <select
                      id="zone"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      data-testid="select-zone"
                    >
                      <option value="">Select a zone</option>
                      {deliveryZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} (GHS {zone.fee})
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-4" data-testid="card-order-summary">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {itemsWithProducts.map((item) => (
                    <div key={item.id} className="flex gap-3" data-testid={`summary-item-${item.id}`}>
                      <div className="flex-1">
                        <div className="text-sm font-medium line-clamp-2">{item.product!.name}</div>
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium">
                        GHS {(parseFloat(item.product!.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="text-checkout-subtotal">GHS {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span data-testid="text-checkout-delivery">GHS {deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee (1.95%)</span>
                    <span data-testid="text-checkout-processing">GHS {processingFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span data-testid="text-checkout-total">GHS {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={createOrderMutation.isPending}
                  data-testid="button-place-order"
                >
                  {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
