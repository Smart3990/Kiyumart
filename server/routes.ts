import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  requireAuth, 
  requireRole,
  type AuthRequest 
} from "./auth";
import { uploadToCloudinary } from "./cloudinary";
import { getExchangeRates, convertCurrency, SUPPORTED_CURRENCIES } from "./currency";
import multer from "multer";
import { insertUserSchema, insertProductSchema, insertDeliveryZoneSchema, insertOrderSchema, insertWishlistSchema, insertReviewSchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // ============ Authentication Routes ============
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const requestedRole = validatedData.role || "buyer";
      if (requestedRole === "admin") {
        return res.status(403).json({ error: "Cannot self-register as admin" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      
      const userData: any = {
        ...validatedData,
        role: requestedRole,
        password: hashedPassword,
      };
      
      const user = await storage.createUser(userData);

      const token = generateToken(user);
      const { password, ...userWithoutPassword } = user;

      // Set token as httpOnly cookie for security
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      if (!user.isApproved && (user.role === "seller" || user.role === "rider")) {
        return res.status(403).json({ error: "Account pending approval" });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      // Set token as httpOnly cookie for security
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new passwords are required" });
      }

      // Server-side password validation
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }
      if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
      }
      if (!/[a-z]/.test(newPassword)) {
        return res.status(400).json({ error: "Password must contain at least one lowercase letter" });
      }
      if (!/[0-9]/.test(newPassword)) {
        return res.status(400).json({ error: "Password must contain at least one number" });
      }

      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValidPassword = await comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Profile Routes ============
  app.get("/api/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...profile } = user;
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      // Only allow updating specific safe fields
      const allowedFields = ['username', 'phone', 'address', 'city', 'country'];
      const updateData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      // Prevent updates if no valid fields provided
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      const updatedUser = await storage.updateUser(req.user!.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/profile/upload-image", requireAuth, upload.single("profileImage"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Validate file type (server-side)
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed" });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (req.file.size > maxSize) {
        return res.status(400).json({ error: "File too large. Maximum size is 5MB" });
      }

      const imageUrl = await uploadToCloudinary(req.file.buffer, "kiyumart/profiles");

      const updatedUser = await storage.updateUser(req.user!.id, {
        profileImage: imageUrl,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ profileImage: imageUrl, user: userWithoutPassword });
    } catch (error: any) {
      console.error("Profile image upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload profile image" });
    }
  });

  // ============ User Management (Admin only) ============
  app.get("/api/users", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { role } = req.query;
      const users = role 
        ? await storage.getUsersByRole(role as string)
        : await storage.getUsersByRole("buyer");
      
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, { isApproved: true });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { isActive } = req.body;
      const user = await storage.updateUser(req.params.id, { isActive });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Product Routes ============
  app.post("/api/products", requireAuth, requireRole("admin", "seller"), upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 }
  ]), async (req: AuthRequest, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageUrls: string[] = [];
      let videoUrl: string | undefined;

      if (files.images) {
        for (const image of files.images) {
          const url = await uploadToCloudinary(image.buffer, "kiyumart/products");
          imageUrls.push(url);
        }
      }

      if (files.video && files.video[0]) {
        videoUrl = await uploadToCloudinary(files.video[0].buffer, "kiyumart/videos");
      }

      const productData = {
        ...req.body,
        images: imageUrls,
        video: videoUrl,
        price: req.body.price,
        sellerId: req.user!.id,
      };

      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct({
        ...validatedData,
        sellerId: req.user!.id,
      });

      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { sellerId, category, isActive } = req.query;
      const products = await storage.getProducts({
        sellerId: sellerId as string,
        category: category as string,
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      });
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", requireAuth, requireRole("admin", "seller"), async (req: AuthRequest, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (req.user!.role === "seller" && product.sellerId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updated = await storage.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", requireAuth, requireRole("admin", "seller"), async (req: AuthRequest, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (req.user!.role === "seller" && product.sellerId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Delivery Zone Routes ============
  app.post("/api/delivery-zones", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const validatedData = insertDeliveryZoneSchema.parse(req.body);
      const zone = await storage.createDeliveryZone(validatedData);
      res.json(zone);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/delivery-zones", async (req, res) => {
    try {
      const zones = await storage.getDeliveryZones();
      res.json(zones);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/delivery-zones/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const zone = await storage.updateDeliveryZone(req.params.id, req.body);
      if (!zone) {
        return res.status(404).json({ error: "Zone not found" });
      }
      res.json(zone);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/delivery-zones/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      await storage.deleteDeliveryZone(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Coupon Routes ============
  app.post("/api/coupons", requireAuth, requireRole("admin", "seller"), async (req: AuthRequest, res) => {
    try {
      const { code, discountType, discountValue, minimumPurchase, usageLimit, expiryDate, isActive } = req.body;
      
      if (!code || !discountType || !discountValue) {
        return res.status(400).json({ error: "Code, discount type, and discount value are required" });
      }

      if (discountType === "percentage" && (parseFloat(discountValue) < 0 || parseFloat(discountValue) > 100)) {
        return res.status(400).json({ error: "Percentage discount must be between 0 and 100" });
      }

      const coupon = await storage.createCoupon({
        sellerId: req.user!.id,
        code,
        discountType,
        discountValue,
        minimumPurchase: minimumPurchase || "0",
        usageLimit,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== false,
      });

      res.json(coupon);
    } catch (error: any) {
      if (error.message.includes("unique")) {
        return res.status(400).json({ error: "A coupon with this code already exists" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/coupons", requireAuth, requireRole("admin", "seller"), async (req: AuthRequest, res) => {
    try {
      const coupons = await storage.getCouponsBySeller(req.user!.id);
      res.json(coupons);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/coupons/:id", requireAuth, requireRole("admin", "seller"), async (req: AuthRequest, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      
      if (coupon.sellerId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/coupons/:id", requireAuth, requireRole("admin", "seller"), async (req: AuthRequest, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }

      if (coupon.sellerId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { discountType, discountValue } = req.body;

      if (discountType === "percentage" && discountValue && (parseFloat(discountValue) < 0 || parseFloat(discountValue) > 100)) {
        return res.status(400).json({ error: "Percentage discount must be between 0 and 100" });
      }

      const updated = await storage.updateCoupon(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/coupons/:id", requireAuth, requireRole("admin", "seller"), async (req: AuthRequest, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }

      if (coupon.sellerId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await storage.deleteCoupon(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/coupons/validate", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { code, sellerId, orderTotal } = req.body;

      if (!code || !sellerId || !orderTotal) {
        return res.status(400).json({ error: "Code, seller ID, and order total are required" });
      }

      const result = await storage.validateCoupon(code, sellerId, parseFloat(orderTotal));
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Cart Routes ============
  app.post("/api/cart", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const cartItem = await storage.addToCart(req.user!.id, productId, quantity);
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/cart", requireAuth, async (req: AuthRequest, res) => {
    try {
      const cartItems = await storage.getCart(req.user!.id);
      res.json(cartItems);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const { quantity } = req.body;
      const updated = await storage.updateCartItem(req.params.id, quantity);
      res.json(updated || { deleted: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/cart", requireAuth, async (req: AuthRequest, res) => {
    try {
      await storage.clearCart(req.user!.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Wishlist Routes ============
  app.post("/api/wishlist", requireAuth, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertWishlistSchema.parse(req.body);
      const wishlistItem = await storage.addToWishlist(req.user!.id, validatedData.productId);
      res.json(wishlistItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/wishlist", requireAuth, async (req: AuthRequest, res) => {
    try {
      const wishlist = await storage.getWishlist(req.user!.id);
      res.json(wishlist);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/wishlist/:productId", requireAuth, async (req: AuthRequest, res) => {
    try {
      await storage.removeFromWishlist(req.user!.id, req.params.productId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Review Routes ============
  app.post("/api/reviews", requireAuth, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview({
        ...validatedData,
        userId: req.user!.id,
      });
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId);
      res.json(reviews);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/products/:productId/variants", async (req, res) => {
    try {
      const variants = await storage.getProductVariants(req.params.productId);
      res.json(variants);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/hero-banners", async (req, res) => {
    try {
      const banners = await storage.getHeroBanners();
      res.json(banners);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Order Routes ============
  app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { items, ...orderData } = req.body;
      
      const orderInput = {
        ...orderData,
        buyerId: req.user!.id,
      };

      const validatedOrder = insertOrderSchema.parse(orderInput);
      const order = await storage.createOrder(validatedOrder, items);
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const role = req.user!.role as "buyer" | "seller" | "rider";
      const orders = await storage.getOrdersByUser(req.user!.id, role);
      
      // Fetch order items with product names for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return {
            ...order,
            totalAmount: order.total,
            items,
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Emit real-time order status update to buyer
      io.to(order.buyerId).emit("order_status_updated", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        updatedAt: order.updatedAt,
      });
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id/assign-rider", requireAuth, requireRole("admin", "seller"), async (req, res) => {
    try {
      const { riderId } = req.body;
      const order = await storage.assignRider(req.params.id, riderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Delivery Tracking Routes ============
  app.post("/api/delivery-tracking", requireAuth, requireRole("rider"), async (req: AuthRequest, res) => {
    try {
      const trackingData = {
        orderId: req.body.orderId,
        riderId: req.user!.id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        accuracy: req.body.accuracy,
        speed: req.body.speed,
        heading: req.body.heading,
      };

      const tracking = await storage.createDeliveryTracking(trackingData);
      
      // Emit real-time location update to buyer
      const order = await storage.getOrder(req.body.orderId);
      if (order) {
        io.to(order.buyerId).emit("rider_location_updated", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          latitude: tracking.latitude,
          longitude: tracking.longitude,
          timestamp: tracking.timestamp,
        });
      }
      
      res.json(tracking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/delivery-tracking/:orderId", requireAuth, async (req, res) => {
    try {
      const tracking = await storage.getLatestDeliveryLocation(req.params.orderId);
      if (!tracking) {
        return res.status(404).json({ error: "No tracking data found" });
      }
      res.json(tracking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/delivery-tracking/:orderId/history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getDeliveryTrackingHistory(req.params.orderId);
      res.json(history);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Chat Routes ============
  app.get("/api/support/contacts", requireAuth, async (req: AuthRequest, res) => {
    try {
      // Allow any authenticated user to get admin contacts for support
      const admins = await storage.getUsersByRole("admin");
      const adminsWithoutPasswords = admins.map(({ password, ...admin }) => admin);
      res.json(adminsWithoutPasswords);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/messages", requireAuth, async (req: AuthRequest, res) => {
    try {
      const messageData = {
        senderId: req.user!.id,
        receiverId: req.body.receiverId,
        message: req.body.message,
        messageType: req.body.messageType || "text",
      };

      const message = await storage.createMessage(messageData);
      
      io.to(req.body.receiverId).emit("new_message", message);
      
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/messages/:userId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const messages = await storage.getMessages(req.user!.id, req.params.userId);
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/messages/:userId/read", requireAuth, async (req: AuthRequest, res) => {
    try {
      await storage.markMessagesAsRead(req.params.userId, req.user!.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Platform Settings ============
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getPlatformSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/settings", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const settings = await storage.updatePlatformSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Currency Routes ============
  app.get("/api/currency/rates", async (req, res) => {
    try {
      const { base } = req.query;
      const rates = await getExchangeRates(base as string);
      res.json({ rates, currencies: SUPPORTED_CURRENCIES });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/currency/convert", async (req, res) => {
    try {
      const { amount, from, to } = req.body;
      const converted = await convertCurrency(amount, from, to);
      res.json({ amount: converted, from, to });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Payment Routes (Paystack) ============
  app.post("/api/payments/initialize", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { orderId } = req.body;
      
      // Get platform settings for Paystack key
      const settings = await storage.getPlatformSettings();
      if (!settings.paystackSecretKey) {
        return res.status(400).json({ error: "Payment gateway not configured. Please contact support." });
      }
      
      // Load and validate the order
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Verify the user owns this order
      if (order.buyerId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized to pay for this order" });
      }
      
      // Prevent double payment
      if (order.paymentStatus === "completed") {
        return res.status(400).json({ error: "Order is already paid" });
      }
      
      // Initialize payment with Paystack
      const callbackUrl = `${req.protocol}://${req.get('host')}/payment/verify`;
      
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: req.user!.email,
          amount: Math.round(parseFloat(order.total) * 100),
          currency: order.currency,
          callback_url: callbackUrl,
          metadata: {
            orderId: order.id,
            userId: req.user!.id,
            orderNumber: order.orderNumber,
          },
        }),
      });

      const data = await response.json();
      
      if (!data.status) {
        return res.status(400).json({ error: data.message });
      }

      // Store the payment reference on the order
      await storage.updateOrder(orderId, {
        paymentReference: data.data.reference,
        paymentStatus: "processing",
      });

      res.json(data.data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/payments/verify/:reference", requireAuth, async (req: AuthRequest, res) => {
    try {
      // Get platform settings for Paystack key
      const settings = await storage.getPlatformSettings();
      if (!settings.paystackSecretKey) {
        return res.status(400).json({ error: "Payment gateway not configured. Please contact support." });
      }
      
      // Check if transaction already exists (idempotency)
      const existingTransaction = await storage.getTransactionByReference(req.params.reference);
      if (existingTransaction) {
        const order = await storage.getOrder(existingTransaction.orderId);
        return res.json({ 
          transaction: existingTransaction, 
          verified: existingTransaction.status === "completed",
          orderId: existingTransaction.orderId,
          message: "Transaction already processed"
        });
      }

      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${req.params.reference}`,
        {
          headers: {
            Authorization: `Bearer ${settings.paystackSecretKey}`,
          },
        }
      );

      const data = await response.json();
      
      if (!data.status) {
        return res.status(400).json({ error: data.message });
      }

      const orderId = data.data.metadata.orderId;
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Verify the user owns this order
      if (order.buyerId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized to verify payment for this order" });
      }

      // Validate the payment reference matches
      if (order.paymentReference !== req.params.reference) {
        return res.status(400).json({ error: "Payment reference mismatch" });
      }

      // Validate the payment amount matches the order total
      const expectedAmount = Math.round(parseFloat(order.total) * 100);
      if (data.data.amount !== expectedAmount) {
        return res.status(400).json({ 
          error: "Payment amount mismatch",
          expected: expectedAmount / 100,
          received: data.data.amount / 100
        });
      }

      // Validate currency
      if (data.data.currency !== order.currency) {
        return res.status(400).json({ error: "Currency mismatch" });
      }

      const transactionData = {
        orderId: orderId,
        userId: data.data.metadata.userId,
        amount: (data.data.amount / 100).toString(),
        currency: data.data.currency,
        paymentProvider: "paystack",
        paymentReference: data.data.reference,
        status: data.data.status === "success" ? "completed" : "failed",
        metadata: data.data,
      };

      const transaction = await storage.createTransaction(transactionData);
      
      if (data.data.status === "success") {
        await storage.updateOrder(orderId, {
          paymentStatus: "completed",
          status: "processing",
        });
        
        // Emit payment success notification to buyer
        io.to(order.buyerId).emit("payment_completed", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: `${order.currency} ${order.total}`,
          paymentMethod: "Paystack",
        });
        
        // Also emit order status update
        io.to(order.buyerId).emit("order_status_updated", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: "processing",
          updatedAt: new Date().toISOString(),
        });
      } else {
        await storage.updateOrder(orderId, {
          paymentStatus: "failed",
        });
        
        // Emit payment failure notification to buyer
        io.to(order.buyerId).emit("payment_failed", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          reason: data.data.gateway_response || "Payment failed",
        });
      }

      res.json({ 
        transaction, 
        verified: data.data.status === "success",
        orderId: order.id,
        message: data.data.status === "success" ? "Payment verified successfully" : data.data.gateway_response || "Payment failed"
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Analytics Routes ============
  app.get("/api/analytics", requireAuth, async (req: AuthRequest, res) => {
    try {
      const analytics = await storage.getAnalytics(req.user!.id, req.user!.role);
      res.json(analytics);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Socket.IO for Real-time Chat ============
  const userSockets = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userId: string) => {
      userSockets.set(userId, socket.id);
      socket.join(userId);
      io.emit("user_online", userId);
    });

    socket.on("disconnect", () => {
      const entries = Array.from(userSockets.entries());
      for (const [userId, socketId] of entries) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          io.emit("user_offline", userId);
          break;
        }
      }
    });

    socket.on("typing", ({ receiverId }) => {
      io.to(receiverId).emit("user_typing", socket.id);
    });

    socket.on("stop_typing", ({ receiverId }) => {
      io.to(receiverId).emit("user_stop_typing", socket.id);
    });
  });

  // ============ Customer Support Routes ============
  app.get("/api/support/conversations", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { db } = await import("../db/index");
      const { supportConversations, supportMessages, users } = await import("@shared/schema");
      const { eq, desc, or } = await import("drizzle-orm");

      let conversationsQuery;
      
      if (user.role === "agent") {
        // Agents see all conversations
        conversationsQuery = db
          .select({
            id: supportConversations.id,
            customerId: supportConversations.customerId,
            customerName: users.name,
            customerEmail: users.email,
            agentId: supportConversations.agentId,
            agentName: users.name,
            status: supportConversations.status,
            subject: supportConversations.subject,
            lastMessage: supportConversations.lastMessage,
            createdAt: supportConversations.createdAt,
            updatedAt: supportConversations.updatedAt,
          })
          .from(supportConversations)
          .leftJoin(users, eq(supportConversations.customerId, users.id))
          .orderBy(desc(supportConversations.updatedAt));
      } else {
        // Customers see only their conversations
        conversationsQuery = db
          .select({
            id: supportConversations.id,
            customerId: supportConversations.customerId,
            customerName: users.name,
            customerEmail: users.email,
            agentId: supportConversations.agentId,
            agentName: users.name,
            status: supportConversations.status,
            subject: supportConversations.subject,
            lastMessage: supportConversations.lastMessage,
            createdAt: supportConversations.createdAt,
            updatedAt: supportConversations.updatedAt,
          })
          .from(supportConversations)
          .leftJoin(users, eq(supportConversations.customerId, users.id))
          .where(eq(supportConversations.customerId, user.id))
          .orderBy(desc(supportConversations.updatedAt));
      }

      const result = await conversationsQuery;
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/support/conversations", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { subject, message } = req.body;
      const user = req.user!;
      
      if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required" });
      }

      const { db } = await import("../db/index");
      const { supportConversations, supportMessages } = await import("@shared/schema");

      // Create conversation
      const [conversation] = await db.insert(supportConversations).values({
        customerId: user.id,
        subject,
        lastMessage: message,
        status: "open",
      }).returning();

      // Create first message
      await db.insert(supportMessages).values({
        conversationId: conversation.id,
        senderId: user.id,
        message,
      });

      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/support/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { db } = await import("../db/index");
      const { supportMessages, supportConversations, users } = await import("@shared/schema");
      const { eq, asc, or } = await import("drizzle-orm");

      // Check access
      const [conversation] = await db
        .select()
        .from(supportConversations)
        .where(eq(supportConversations.id, id))
        .limit(1);

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      if (user.role !== "agent" && conversation.customerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get messages with sender info
      const messages = await db
        .select({
          id: supportMessages.id,
          senderId: supportMessages.senderId,
          senderName: users.name,
          message: supportMessages.message,
          createdAt: supportMessages.createdAt,
        })
        .from(supportMessages)
        .leftJoin(users, eq(supportMessages.senderId, users.id))
        .where(eq(supportMessages.conversationId, id))
        .orderBy(asc(supportMessages.createdAt));

      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/support/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const user = req.user!;
      const { db } = await import("../db/index");
      const { supportMessages, supportConversations } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Check access
      const [conversation] = await db
        .select()
        .from(supportConversations)
        .where(eq(supportConversations.id, id))
        .limit(1);

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      if (user.role !== "agent" && conversation.customerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Create message
      const [newMessage] = await db.insert(supportMessages).values({
        conversationId: id,
        senderId: user.id,
        message,
      }).returning();

      // Update conversation last message and timestamp
      await db
        .update(supportConversations)
        .set({ lastMessage: message, updatedAt: new Date() })
        .where(eq(supportConversations.id, id));

      res.json(newMessage);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/support/conversations/:id/assign", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (req.user?.role !== "agent") {
        return res.status(403).json({ error: "Only agents can assign conversations" });
      }

      const { db } = await import("../db/index");
      const { supportConversations } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const [updated] = await db
        .update(supportConversations)
        .set({ agentId: user.id, status: "assigned", updatedAt: new Date() })
        .where(eq(supportConversations.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/support/conversations/:id/resolve", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      if (req.user?.role !== "agent") {
        return res.status(403).json({ error: "Only agents can resolve conversations" });
      }

      const { db } = await import("../db/index");
      const { supportConversations } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const [updated] = await db
        .update(supportConversations)
        .set({ status: "resolved", updatedAt: new Date() })
        .where(eq(supportConversations.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
