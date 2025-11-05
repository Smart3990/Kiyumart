import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  requireAuth, 
  requireRole,
  type AuthRequest 
} from "./auth";
import { uploadToCloudinary, uploadWithMetadata } from "./cloudinary";
import { getExchangeRates, convertCurrency, SUPPORTED_CURRENCIES } from "./currency";
import multer from "multer";
import { insertUserSchema, insertProductSchema, insertDeliveryZoneSchema, insertOrderSchema, insertWishlistSchema, insertReviewSchema, insertBannerCollectionSchema, insertMarketplaceBannerSchema } from "@shared/schema";

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

      // Notify admins about new seller/rider registration
      if (requestedRole === "seller" || requestedRole === "rider") {
        await notifyAdmins(
          "user",
          `New ${requestedRole} registration`,
          `${user.name} (${user.email}) has registered as a ${requestedRole}`,
          { userId: user.id, role: requestedRole }
        );
      }

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

  // Generic image upload endpoint (for admins/sellers)
  app.post("/api/upload/image", requireAuth, upload.single("file"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed" });
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
      }

      const imageUrl = await uploadToCloudinary(req.file.buffer, "kiyumart/uploads");
      res.json({ url: imageUrl });
    } catch (error: any) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload image" });
    }
  });

  // Generic video upload endpoint (for admins/sellers)
  app.post("/api/upload/video", requireAuth, upload.single("file"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type. Only MP4, WEBM, and MOV videos are allowed" });
      }

      const maxSize = 30 * 1024 * 1024; // 30MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ error: "File too large. Maximum size is 30MB" });
      }

      const result = await uploadWithMetadata(req.file.buffer, "kiyumart/videos");
      
      // Check video duration if metadata is available
      if (result.duration && result.duration > 30) {
        return res.status(400).json({ 
          error: `Video is too long (${Math.round(result.duration)}s). Maximum duration is 30 seconds` 
        });
      }

      res.json({ url: result.url, duration: result.duration });
    } catch (error: any) {
      console.error("Video upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload video" });
    }
  });

  // ============ User Management (Admin only) ============
  app.get("/api/users", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { role } = req.query;
      let users;
      
      if (role && role !== "all") {
        users = await storage.getUsersByRole(role as string);
      } else {
        // Get all users except admin (to avoid showing admin in the list)
        const allRoles = ["buyer", "seller", "rider", "agent"];
        users = [];
        for (const r of allRoles) {
          const roleUsers = await storage.getUsersByRole(r);
          users.push(...roleUsers);
        }
      }
      
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

  app.post("/api/users", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      // Capture store data before schema parsing strips it
      const { storeName, storeDescription, storeBanner } = req.body;
      
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      
      const userData: any = {
        ...validatedData,
        password: hashedPassword,
        isApproved: validatedData.role === "rider" || validatedData.role === "seller" ? true : false,
      };
      
      const user = await storage.createUser(userData);
      
      // Create store for seller with captured store data
      if (user.role === "seller") {
        try {
          const existingStore = await storage.getStoreByPrimarySeller(user.id);
          if (!existingStore) {
            await storage.createStore({
              primarySellerId: user.id,
              name: storeName || user.name + "'s Store",
              description: storeDescription || "",
              logo: storeBanner || "",
              isActive: true,
              isApproved: true
            });
          }
        } catch (storeError: any) {
          // If store creation fails, delete the user to avoid orphaned accounts
          await storage.deleteUser(user.id);
          throw new Error(`Failed to create store: ${storeError.message}`);
        }
      }
      
      const { password, ...userWithoutPassword } = user;

      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const allowedFields = ['name', 'email', 'phone', 'role', 'isActive', 'isApproved', 'vehicleInfo'];
      const updateData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      if (updateData.email) {
        const existingUser = await storage.getUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== req.params.id) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      
      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
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
      let videoDuration: number | undefined;

      if (files.images) {
        for (const image of files.images) {
          const url = await uploadToCloudinary(image.buffer, "kiyumart/products");
          imageUrls.push(url);
        }
      }

      if (files.video && files.video[0]) {
        const videoFile = files.video[0];
        
        // Video format validation
        const allowedFormats = ['video/mp4', 'video/webm'];
        if (!allowedFormats.includes(videoFile.mimetype)) {
          return res.status(400).json({ 
            error: "Invalid video format. Only MP4 and WEBM formats are allowed. Please upload an MP4 or WEBM file."
          });
        }

        // Upload video and get server-side metadata
        const videoMetadata = await uploadWithMetadata(videoFile.buffer, "kiyumart/videos");
        videoUrl = videoMetadata.url;
        
        // SERVER-SIDE validation of 30-second limit (critical security requirement)
        if (videoMetadata.duration) {
          videoDuration = Math.round(videoMetadata.duration);
          
          if (videoDuration > 30) {
            return res.status(400).json({ 
              error: `Video duration exceeds maximum limit of 30 seconds. Your video is ${videoDuration} seconds long. Please upload a shorter video (max 30 seconds).`
            });
          }
        }
      }

      // Parse dynamic fields if provided
      const dynamicFields = req.body.dynamicFields ? JSON.parse(req.body.dynamicFields) : undefined;

      const productData = {
        ...req.body,
        images: imageUrls,
        video: videoUrl,
        videoDuration,
        dynamicFields,
        price: req.body.price,
        sellerId: req.user!.id,
        storeId: req.body.storeId || undefined, // Optional store linkage for multi-vendor
      };

      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct({
        ...validatedData,
        sellerId: req.user!.id,
      });

      // Notify admins about new product
      await notifyAdmins(
        "product",
        "New product added",
        `${req.user!.name} added a new product: ${product.name}`,
        { productId: product.id, sellerId: req.user!.id }
      );

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
      const { productId, quantity = 1, variantId, selectedColor, selectedSize, selectedImageIndex } = req.body;
      const cartItem = await storage.addToCart(
        req.user!.id, 
        productId, 
        quantity,
        variantId,
        selectedColor,
        selectedSize,
        selectedImageIndex
      );
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
      
      // Automatically verify if user purchased the product
      const verification = await storage.verifyPurchaseForReview(req.user!.id, validatedData.productId);
      
      const review = await storage.createReview({
        ...validatedData,
        userId: req.user!.id,
        orderId: verification.orderId || null,
        isVerifiedPurchase: verification.verified,
      });
      
      // Notify admins about new review
      const product = await storage.getProduct(validatedData.productId);
      await notifyAdmins(
        "review",
        "New review posted",
        `${req.user!.name} posted a ${validatedData.rating}-star review${product ? ` for ${product.name}` : ''}`,
        { reviewId: review.id, productId: validatedData.productId, userId: req.user!.id }
      );
      
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

  // ============ Multi-Vendor Banner Management ============
  // Banner Collections (Admin only)
  app.post("/api/admin/banner-collections", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const validatedData = insertBannerCollectionSchema.parse(req.body);
      const collection = await storage.createBannerCollection(validatedData);
      res.json(collection);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/banner-collections", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const collections = await storage.getBannerCollections();
      res.json(collections);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/banner-collections/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const collection = await storage.getBannerCollection(req.params.id);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/banner-collections/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const updated = await storage.updateBannerCollection(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/banner-collections/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      await storage.deleteBannerCollection(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Marketplace Banners (Admin only)
  app.post("/api/admin/marketplace-banners", requireAuth, requireRole("admin"), upload.single("image"), async (req, res) => {
    try {
      let imageUrl = req.body.imageUrl;
      
      if (req.file) {
        imageUrl = await uploadToCloudinary(req.file.buffer, "kiyumart/banners");
      }

      if (!imageUrl) {
        return res.status(400).json({ error: "Image is required" });
      }

      const bannerData = {
        collectionId: req.body.collectionId || null,
        title: req.body.title || null,
        subtitle: req.body.subtitle || null,
        imageUrl,
        productRef: req.body.productRef || null,
        storeRef: req.body.storeRef || null,
        ctaText: req.body.ctaText || null,
        ctaUrl: req.body.ctaUrl || null,
        displayOrder: req.body.displayOrder ? parseInt(req.body.displayOrder) : 0,
        startAt: req.body.startAt ? new Date(req.body.startAt) : null,
        endAt: req.body.endAt ? new Date(req.body.endAt) : null,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
        metadata: req.body.metadata ? (typeof req.body.metadata === 'string' ? JSON.parse(req.body.metadata) : req.body.metadata) : {},
      };

      const validatedData = insertMarketplaceBannerSchema.parse(bannerData);
      const banner = await storage.createMarketplaceBanner(validatedData);
      res.json(banner);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/marketplace-banners", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { collectionId } = req.query;
      const banners = await storage.getMarketplaceBanners(collectionId as string);
      res.json(banners);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/marketplace-banners/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const banner = await storage.getMarketplaceBanner(req.params.id);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.json(banner);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/marketplace-banners/:id", requireAuth, requireRole("admin"), upload.single("image"), async (req, res) => {
    try {
      const updateData: any = { ...req.body };
      
      if (req.file) {
        updateData.imageUrl = await uploadToCloudinary(req.file.buffer, "kiyumart/banners");
      }

      if (req.body.startAt) {
        updateData.startAt = new Date(req.body.startAt);
      }
      if (req.body.endAt) {
        updateData.endAt = new Date(req.body.endAt);
      }
      if (req.body.metadata && typeof req.body.metadata === 'string') {
        updateData.metadata = JSON.parse(req.body.metadata);
      }

      const updated = await storage.updateMarketplaceBanner(req.params.id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/marketplace-banners/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      await storage.deleteMarketplaceBanner(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/marketplace-banners/reorder", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { bannerIds } = req.body;
      if (!Array.isArray(bannerIds)) {
        return res.status(400).json({ error: "bannerIds must be an array" });
      }
      await storage.reorderMarketplaceBanners(bannerIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Public Homepage APIs
  app.get("/api/homepage/banners", async (req, res) => {
    try {
      const banners = await storage.getActiveMarketplaceBanners();
      res.json(banners);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/homepage/sellers", async (req, res) => {
    try {
      const sellers = await storage.getApprovedSellers();
      res.json(sellers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/homepage/featured-products", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
      const products = await storage.getFeaturedProducts(limit);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Create test user accounts for all roles (Development/Testing only)
  app.post("/api/seed/test-users", async (req, res) => {
    try {
      const testUsers = [
        {
          email: "admin@kiyumart.com",
          password: await bcrypt.hash("admin123", 10),
          name: "Test Admin",
          role: "admin",
          isActive: true
        },
        {
          email: "seller@kiyumart.com",
          password: await bcrypt.hash("seller123", 10),
          name: "Test Seller",
          role: "seller",
          storeName: "Test Store",
          storeBanner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
          isApproved: true,
          isActive: true
        },
        {
          email: "buyer@kiyumart.com",
          password: await bcrypt.hash("buyer123", 10),
          name: "Test Buyer",
          role: "buyer",
          isActive: true
        },
        {
          email: "rider@kiyumart.com",
          password: await bcrypt.hash("rider123", 10),
          name: "Test Rider",
          role: "rider",
          vehicleInfo: { type: "motorcycle", number: "TEST-001", license: "LIC-001" },
          nationalIdCard: "TEST-ID-001",
          isActive: true,
          isApproved: true,
          phone: "+233501234567"
        },
        {
          email: "agent@kiyumart.com",
          password: await bcrypt.hash("agent123", 10),
          name: "Test Agent",
          role: "agent",
          isActive: true
        }
      ];

      const created = [];
      for (const user of testUsers) {
        try {
          const newUser = await storage.createUser(user as any);
          created.push({ email: user.email, role: user.role });
          
          // Check if store exists for seller and create one if it doesn't
          if (user.role === "seller") {
            const existingStore = await storage.getStoreByPrimarySeller(newUser.id);
            if (!existingStore) {
              await storage.createStore({
                primarySellerId: newUser.id,
                name: user.storeName || "Test Store",
                description: "Test store description",
                logo: user.storeBanner || "",
                isActive: true,
                isApproved: true
              });
            }
          }
        } catch (error: any) {
          if (error.message.includes("duplicate")) {
            created.push({ email: user.email, role: user.role, status: "already exists" });
          }
        }
      }

      res.json({
        success: true,
        message: "Test users created/verified for all 5 roles",
        users: created,
        credentials: {
          admin: "admin@kiyumart.com / admin123",
          seller: "seller@kiyumart.com / seller123",
          buyer: "buyer@kiyumart.com / buyer123",
          rider: "rider@kiyumart.com / rider123",
          agent: "agent@kiyumart.com / agent123"
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Complete marketplace seed - creates sellers, products, and banners (Development/Testing only)
  app.post("/api/seed/complete-marketplace", async (req, res) => {
    try {
      const results = {
        sellers: [] as any[],
        products: [] as any[],
        banners: [] as any[]
      };

      // Create 3 seller accounts
      const sellers = [
        {
          email: "seller1@kiyumart.com",
          password: await bcrypt.hash("password123", 10),
          name: "Fatima's Modest Fashion",
          role: "seller",
          storeName: "Fatima's Boutique",
          storeBanner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
          ratings: "4.8",
          isApproved: true,
          isActive: true
        },
        {
          email: "seller2@kiyumart.com",
          password: await bcrypt.hash("password123", 10),
          name: "Aisha's Elegant Wear",
          role: "seller",
          storeName: "Aisha's Collection",
          storeBanner: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
          ratings: "4.6",
          isApproved: true,
          isActive: true
        },
        {
          email: "seller3@kiyumart.com",
          password: await bcrypt.hash("password123", 10),
          name: "Zainab's Fashion House",
          role: "seller",
          storeName: "Zainab's Designs",
          storeBanner: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800",
          ratings: "4.9",
          isApproved: true,
          isActive: true
        }
      ];

      for (const seller of sellers) {
        const created = await storage.createUser(seller as any);
        results.sellers.push(created);
      }

      // Create products for each seller
      const productTemplates = [
        { name: "Elegant Black Abaya", category: "Abayas", price: "150.00", costPrice: "80.00", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500", stock: 25, discount: 15, isFeatured: true },
        { name: "Premium Silk Hijab - Navy", category: "Hijabs", price: "35.00", costPrice: "15.00", image: "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=500", stock: 50, discount: 10, isFeatured: true },
        { name: "Floral Maxi Dress", category: "Dresses", price: "120.00", costPrice: "65.00", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500", stock: 18, discount: 20, isFeatured: true },
        { name: "Beige Everyday Abaya", category: "Abayas", price: "95.00", costPrice: "50.00", image: "https://images.unsplash.com/photo-1550639524-72e1a2f61eb7?w=500", stock: 30, discount: 0, isFeatured: false },
        { name: "Chiffon Hijab Set", category: "Hijabs", price: "45.00", costPrice: "20.00", image: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=500", stock: 40, discount: 5, isFeatured: true },
      ];

      for (const seller of results.sellers) {
        for (const template of productTemplates) {
          const product = await storage.createProduct({
            ...template,
            description: `Beautiful ${template.name.toLowerCase()} from ${seller.storeName}`,
            images: [template.image],
            sellerId: seller.id,
            isActive: true
          } as any);
          results.products.push(product);
        }
      }

      // Create marketplace banners
      const collection = await storage.createBannerCollection({
        name: "Homepage Promotions",
        description: "Main homepage promotional banners",
        type: "homepage",
        isActive: true
      });

      const banners = [
        {
          collectionId: collection.id,
          title: "New Season Collection",
          subtitle: "Discover our latest modest fashion arrivals",
          imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
          ctaText: "Shop Now",
          ctaUrl: "/products",
          displayOrder: 1,
          isActive: true,
          metadata: { discount: 25 }
        },
        {
          collectionId: collection.id,
          title: "Premium Abayas",
          subtitle: "Elegant and comfortable abayas for every occasion",
          imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
          ctaText: "Explore Collection",
          ctaUrl: "/products",
          displayOrder: 2,
          isActive: true,
          metadata: { discount: 15 }
        }
      ];

      for (const banner of banners) {
        const created = await storage.createMarketplaceBanner(banner as any);
        results.banners.push(created);
      }

      res.json({
        success: true,
        message: "Complete marketplace seeded successfully!",
        stats: {
          sellers: results.sellers.length,
          products: results.products.length,
          banners: results.banners.length
        },
        credentials: "All sellers: password123"
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Islamic Fashion Products Seed (Development/Testing only)
  app.post("/api/seed/islamic-fashion", async (req, res) => {
    try {
      // Get or create a seller for the store
      let seller;
      try {
        const existingSeller = await storage.getUserByEmail("store@kiyumart.com");
        seller = existingSeller;
      } catch {
        seller = await storage.createUser({
          email: "store@kiyumart.com",
          password: await bcrypt.hash("store123", 10),
          name: "KiyuMart Store",
          role: "seller" as const,
          storeName: "KiyuMart - Islamic Fashion"
        });
        // Approve the seller
        if (seller) {
          await storage.updateUser(seller.id, { isActive: true });
        }
      }

      if (!seller) {
        throw new Error("Failed to create or find seller");
      }

      const products = [];
      const reviews = [];

      // Product 1: Navy Blue Embroidered Modest Dress
      const product1 = await storage.createProduct({
        sellerId: seller.id,
        name: "Navy Blue Embroidered Modest Dress",
        description: "Beautiful navy blue modest dress with intricate embroidery. Features full-length sleeves and an elegant A-line cut. Perfect for both formal and casual occasions.",
        category: "evening",
        price: "229.99",
        costPrice: "320.00",
        discount: 28,
        stock: 0,
        images: [
          "/attached_assets/generated_images/Elegant_black_abaya_with_gold_embroidery_cc860cad.png",
          "/attached_assets/generated_images/Burgundy_velvet_abaya_with_pearls_c19f2d40.png"
        ],
        video: "https://www.w3schools.com/html/mov_bbb.mp4"
      });
      products.push(product1);

      // Product 2: Pink Lace Abaya Dress
      const product2 = await storage.createProduct({
        sellerId: seller.id,
        name: "Pink Lace Abaya Dress",
        description: "Elegant pink abaya with beautiful lace details along the hem. Modest and stylish design perfect for special occasions.",
        category: "abayas",
        price: "279.99",
        costPrice: "380.00",
        discount: 26,
        stock: 15,
        images: [
          "/attached_assets/generated_images/Pink_lace_abaya_dress_53759991.png",
          "/attached_assets/generated_images/Cream_abaya_with_beige_embroidery_92e12aec.png"
        ]
      });
      products.push(product2);

      // Product 3: Emerald Green Satin Evening Dress
      const product3 = await storage.createProduct({
        sellerId: seller.id,
        name: "Emerald Green Satin Evening Dress",
        description: "Luxurious emerald green satin dress with elegant draping. Perfect for weddings and formal events.",
        category: "evening",
        price: "299.99",
        costPrice: "400.00",
        discount: 25,
        stock: 12,
        images: [
          "/attached_assets/generated_images/Burgundy_velvet_abaya_with_pearls_c19f2d40.png",
          "/attached_assets/generated_images/Elegant_black_abaya_with_gold_embroidery_cc860cad.png"
        ]
      });
      products.push(product3);

      // Product 4: Designer Modest Handbag
      const product4 = await storage.createProduct({
        sellerId: seller.id,
        name: "Designer Modest Handbag",
        description: "Premium leather handbag in elegant brown color. Spacious interior with multiple compartments.",
        category: "hijabs",
        price: "129.99",
        costPrice: "180.00",
        discount: 28,
        stock: 20,
        images: [
          "/attached_assets/generated_images/Hijabs_and_accessories_category_09f9b1a2.png"
        ]
      });
      products.push(product4);

      // Create customer accounts for reviews
      const customers = [];
      const customerData = [
        { email: "fatima@customer.com", name: "Fatima Ahmed" },
        { email: "aisha@customer.com", name: "Aisha Rahman" },
        { email: "mariam@customer.com", name: "Mariam Hassan" },
        { email: "zainab@customer.com", name: "Zainab Ibrahim" }
      ];

      for (const customer of customerData) {
        try {
          let user;
          try {
            user = await storage.getUserByEmail(customer.email);
          } catch {
            user = await storage.createUser({
              email: customer.email,
              password: await bcrypt.hash("customer123", 10),
              name: customer.name,
              role: "buyer"
            });
          }
          customers.push(user);
        } catch (error) {
          console.log(`Customer ${customer.email} already exists`);
        }
      }

      // Add real customer reviews
      if (customers.length >= 4) {
        const reviewsData = [
          { productId: product1.id, userId: customers[0]!.id, rating: 5, comment: "Beautiful dress, runs true to size. The embroidery makes it feel very special." },
          { productId: product1.id, userId: customers[1]!.id, rating: 4, comment: "Absolutely gorgeous dress! The navy blue color is rich and the fit is flattering. Highly recommend!" },
          { productId: product1.id, userId: customers[2]!.id, rating: 5, comment: "The quality exceeded my expectations. Perfect for formal occasions and very comfortable to wear all day." },
          { productId: product2.id, userId: customers[0]!.id, rating: 5, comment: "Love the lace details! Very elegant and modest. Got so many compliments." },
          { productId: product2.id, userId: customers[3]!.id, rating: 4, comment: "Beautiful abaya, the pink color is lovely. Great quality fabric." },
          { productId: product3.id, userId: customers[1]!.id, rating: 5, comment: "Stunning dress! The emerald green color is absolutely beautiful. Worth every penny." },
          { productId: product4.id, userId: customers[2]!.id, rating: 5, comment: "Perfect handbag! Good size and the quality is excellent. Very happy with my purchase." }
        ];

        for (const review of reviewsData) {
          try {
            const created = await storage.createReview(review);
            reviews.push(created);
          } catch (error) {
            console.log("Review already exists");
          }
        }
      }

      res.json({
        success: true,
        message: "Islamic fashion products seeded successfully!",
        stats: {
          products: products.length,
          reviews: reviews.length
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin seed for marketplace setup (Development only)
  app.post("/api/seed/marketplace-setup", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      // Create sample banner collection
      const collection = await storage.createBannerCollection({
        name: "Homepage Promotions",
        description: "Main homepage promotional banners",
        type: "homepage",
        isActive: true
      });

      // Create sample marketplace banners
      const banners = [
        {
          collectionId: collection.id,
          title: "New Season Collection",
          subtitle: "Discover our latest modest fashion arrivals with exclusive designs",
          imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
          ctaText: "Shop Now",
          ctaUrl: "/products",
          displayOrder: 1,
          isActive: true,
          metadata: { discount: 25 }
        },
        {
          collectionId: collection.id,
          title: "Premium Abayas",
          subtitle: "Elegant and comfortable abayas for every occasion",
          imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
          ctaText: "Explore Collection",
          ctaUrl: "/category/Abayas",
          displayOrder: 2,
          isActive: true,
          metadata: { discount: 15 }
        },
        {
          collectionId: collection.id,
          title: "Designer Hijabs",
          subtitle: "Premium quality hijabs in beautiful colors and fabrics",
          imageUrl: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200",
          ctaText: "View Collection",
          ctaUrl: "/category/Hijabs",
          displayOrder: 3,
          isActive: true,
          metadata: {}
        }
      ];

      const createdBanners = [];
      for (const banner of banners) {
        const created = await storage.createMarketplaceBanner(banner as any);
        createdBanners.push(created);
      }

      res.json({
        success: true,
        message: "Marketplace setup complete",
        collection,
        banners: createdBanners
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Seller seed for products (⚠️ DEVELOPMENT/TESTING ONLY - Remove or disable in production)
  app.post("/api/seed/sample-data", requireAuth, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const sellerId = req.user!.id;
      
      const sampleProducts = [
        {
          name: "Elegant Black Abaya",
          description: "Beautiful flowing black abaya with delicate embroidery",
          price: "150.00",
          costPrice: "80.00",
          category: "Abayas",
          images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500"],
          stock: 25,
          discount: 15,
          isFeatured: true,
          isActive: true,
          sellerId
        },
        {
          name: "Premium Silk Hijab - Navy",
          description: "Soft premium silk hijab in elegant navy color",
          price: "35.00",
          costPrice: "15.00",
          category: "Hijabs",
          images: ["https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=500"],
          stock: 50,
          discount: 10,
          isFeatured: true,
          isActive: true,
          sellerId
        },
        {
          name: "Floral Maxi Dress",
          description: "Modest floral maxi dress perfect for any occasion",
          price: "120.00",
          costPrice: "65.00",
          category: "Dresses",
          images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500"],
          stock: 18,
          discount: 20,
          isFeatured: true,
          isActive: true,
          sellerId
        },
        {
          name: "Beige Everyday Abaya",
          description: "Comfortable beige abaya for everyday wear",
          price: "95.00",
          costPrice: "50.00",
          category: "Abayas",
          images: ["https://images.unsplash.com/photo-1550639524-72e1a2f61eb7?w=500"],
          stock: 30,
          discount: 0,
          isFeatured: false,
          isActive: true,
          sellerId
        },
        {
          name: "Chiffon Hijab Set - Pastels",
          description: "Set of 3 pastel colored chiffon hijabs",
          price: "45.00",
          costPrice: "20.00",
          category: "Hijabs",
          images: ["https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=500"],
          stock: 40,
          discount: 5,
          isFeatured: true,
          isActive: true,
          sellerId
        },
        {
          name: "Embroidered Evening Abaya",
          description: "Luxurious evening abaya with gold embroidery",
          price: "220.00",
          costPrice: "120.00",
          category: "Abayas",
          images: ["https://images.unsplash.com/photo-1609840114035-3c981a782dfe?w=500"],
          stock: 12,
          discount: 25,
          isFeatured: true,
          isActive: true,
          sellerId
        },
        {
          name: "Cotton Jersey Hijab - Black",
          description: "Comfortable cotton jersey hijab in classic black",
          price: "25.00",
          costPrice: "12.00",
          category: "Hijabs",
          images: ["https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=500"],
          stock: 60,
          discount: 0,
          isFeatured: false,
          isActive: true,
          sellerId
        },
        {
          name: "Modest Summer Dress",
          description: "Light and airy summer dress with long sleeves",
          price: "85.00",
          costPrice: "45.00",
          category: "Dresses",
          images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500"],
          stock: 22,
          discount: 15,
          isFeatured: false,
          isActive: true,
          sellerId
        },
        {
          name: "Butterfly Abaya - Burgundy",
          description: "Flowing butterfly abaya in rich burgundy",
          price: "135.00",
          costPrice: "70.00",
          category: "Abayas",
          images: ["https://images.unsplash.com/photo-1602810319250-a1fa9b04b76c?w=500"],
          stock: 20,
          discount: 10,
          isFeatured: true,
          isActive: true,
          sellerId
        },
        {
          name: "Premium Georgette Hijab",
          description: "Elegant georgette hijab with beautiful drape",
          price: "40.00",
          costPrice: "18.00",
          category: "Hijabs",
          images: ["https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=500"],
          stock: 35,
          discount: 0,
          isFeatured: true,
          isActive: true,
          sellerId
        }
      ];

      const createdProducts = [];
      for (const product of sampleProducts) {
        const created = await storage.createProduct(product as any);
        createdProducts.push(created);
      }

      res.json({ 
        success: true, 
        message: `${createdProducts.length} products created successfully`,
        products: createdProducts 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Order Routes ============
  app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { items, ...orderData } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
      }
      
      // Server-side price recalculation to prevent tampering
      let serverSubtotal = 0;
      let serverProductSavings = 0;
      const validatedItems = [];
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ error: `Product ${item.productId} not found` });
        }
        
        if (!product.isActive) {
          return res.status(400).json({ error: `Product ${product.name} is no longer available` });
        }
        
        // Calculate actual price with discount
        const originalPrice = parseFloat(product.price);
        const discount = product.discount || 0;
        const discountedPrice = originalPrice * (1 - discount / 100);
        const itemTotal = discountedPrice * item.quantity;
        
        // Track savings
        serverProductSavings += (originalPrice - discountedPrice) * item.quantity;
        serverSubtotal += itemTotal;
        
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: discountedPrice.toFixed(2),
          total: itemTotal.toFixed(2),
        });
      }
      
      // Verify client-submitted subtotal matches server calculation
      const clientSubtotal = parseFloat(orderData.subtotal || "0");
      if (Math.abs(serverSubtotal - clientSubtotal) > 0.01) {
        return res.status(400).json({ 
          error: "Price mismatch detected. Please refresh and try again.",
          serverSubtotal: serverSubtotal.toFixed(2),
          clientSubtotal: clientSubtotal.toFixed(2)
        });
      }
      
      // Re-validate coupon on server-side
      let serverCouponDiscount = 0;
      if (orderData.couponCode && orderData.sellerId) {
        try {
          const validationResult = await storage.validateCoupon(
            orderData.couponCode,
            orderData.sellerId,
            serverSubtotal
          );
          
          if (!validationResult.valid) {
            return res.status(400).json({ 
              error: validationResult.message || "Invalid coupon" 
            });
          }
          
          serverCouponDiscount = parseFloat(validationResult.discountAmount || "0");
          
          // Verify the discount amount matches
          const clientDiscount = parseFloat(orderData.couponDiscount || "0");
          if (Math.abs(serverCouponDiscount - clientDiscount) > 0.01) {
            return res.status(400).json({ 
              error: "Coupon discount amount mismatch. Please refresh and try again." 
            });
          }
        } catch (validationError: any) {
          return res.status(400).json({ 
            error: `Coupon validation failed: ${validationError.message}` 
          });
        }
      }
      
      // Recalculate total server-side
      const deliveryFee = parseFloat(orderData.deliveryFee || "0");
      const serverProcessingFee = (serverSubtotal - serverCouponDiscount + deliveryFee) * 0.0195;
      const serverTotal = serverSubtotal - serverCouponDiscount + deliveryFee + serverProcessingFee;
      
      // Verify total matches
      const clientTotal = parseFloat(orderData.total || "0");
      if (Math.abs(serverTotal - clientTotal) > 0.02) {
        return res.status(400).json({ 
          error: "Total amount mismatch. Please refresh and try again.",
          serverTotal: serverTotal.toFixed(2),
          clientTotal: clientTotal.toFixed(2)
        });
      }
      
      const orderInput = {
        ...orderData,
        buyerId: req.user!.id,
        subtotal: serverSubtotal.toFixed(2),
        couponDiscount: serverCouponDiscount > 0 ? serverCouponDiscount.toFixed(2) : null,
        processingFee: serverProcessingFee.toFixed(2),
        total: serverTotal.toFixed(2),
      };

      const validatedOrder = insertOrderSchema.parse(orderInput);
      const order = await storage.createOrder(validatedOrder, validatedItems);
      
      // Notify admins about new order
      await notifyAdmins(
        "order",
        "New order placed",
        `Order #${order.orderNumber} has been placed by ${req.user!.name}`,
        { orderId: order.id, orderNumber: order.orderNumber, buyerId: req.user!.id }
      );
      
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
      
      // Notify admins about new messages to admin
      const receiver = await storage.getUser(req.body.receiverId);
      if (receiver && receiver.role === "admin") {
        await notifyAdmins(
          "message",
          "New message received",
          `${req.user!.name} sent you a message`,
          { messageId: message.id, senderId: req.user!.id }
        );
      }
      
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

  app.get("/api/messages/unread-count", requireAuth, async (req: AuthRequest, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.user!.id);
      res.json({ count });
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

  // Alias for platform settings (used by multi-vendor components)
  app.get("/api/platform-settings", async (req, res) => {
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

  // Helper function to send notifications to all admins
  async function notifyAdmins(type: string, title: string, message: string, metadata?: Record<string, any>) {
    try {
      const admins = await storage.getUsersByRole("admin");
      for (const admin of admins) {
        // Save notification to database
        await storage.createNotification({
          userId: admin.id,
          type: type as any,
          title,
          message,
          metadata,
        });
        
        // Send real-time notification via Socket.IO
        io.to(admin.id).emit("notification", {
          title,
          message,
          type: "default",
        });
      }
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  }

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
      
      if (user.role === "agent" || user.role === "admin") {
        // Agents and admins see all conversations
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

      if (user.role !== "agent" && user.role !== "admin" && conversation.customerId !== user.id) {
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

      if (user.role !== "agent" && user.role !== "admin" && conversation.customerId !== user.id) {
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

      if (req.user?.role !== "agent" && req.user?.role !== "admin") {
        return res.status(403).json({ error: "Only agents and admins can assign conversations" });
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

      if (req.user?.role !== "agent" && req.user?.role !== "admin") {
        return res.status(403).json({ error: "Only agents and admins can resolve conversations" });
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

  // ============ Category Fields Routes (Admin Only) ============
  app.post("/api/category-fields", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const field = await storage.createCategoryField(req.body);
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/category-fields", async (req, res) => {
    try {
      const { category } = req.query;
      const fields = await storage.getCategoryFields(category as string);
      res.json(fields);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/category-fields/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const field = await storage.updateCategoryField(req.params.id, req.body);
      if (!field) {
        return res.status(404).json({ error: "Category field not found" });
      }
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/category-fields/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteCategoryField(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category field not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Store Routes ============
  app.post("/api/stores", requireAuth, requireRole("admin", "seller"), async (req: AuthRequest, res) => {
    try {
      const storeData = {
        ...req.body,
        primarySellerId: req.user!.role === "seller" ? req.user!.id : req.body.primarySellerId,
      };
      const store = await storage.createStore(storeData);
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/stores", async (req, res) => {
    try {
      const { isActive, isApproved } = req.query;
      const stores = await storage.getStores({
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
        isApproved: isApproved === "true" ? true : isApproved === "false" ? false : undefined,
      });
      res.json(stores);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get current seller's store
  app.get("/api/stores/my-store", requireAuth, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const store = await storage.getStoreByPrimarySeller(req.user!.id);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/stores/:id", async (req, res) => {
    try {
      const store = await storage.getStore(req.params.id);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/stores/by-seller/:sellerId", async (req, res) => {
    try {
      const store = await storage.getStoreByPrimarySeller(req.params.sellerId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/stores/:id", requireAuth, requireRole("admin", "seller"), async (req: AuthRequest, res) => {
    try {
      const store = await storage.getStore(req.params.id);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      // Sellers can only update their own store
      if (req.user!.role === "seller" && store.primarySellerId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updated = await storage.updateStore(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/stores/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteStore(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Category Routes ============
  app.post("/api/categories", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const { isActive } = req.query;
      const categories = await storage.getCategories({
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      });
      res.json(categories);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/categories/by-slug/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/categories/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const updated = await storage.updateCategory(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Media Library Routes ============
  app.post("/api/media-library", requireAuth, async (req: AuthRequest, res) => {
    try {
      // Validate role - admin can upload all types, seller can only upload product images
      const userRole = req.user!.role;
      const { category } = req.body;

      if (userRole === "seller" && category !== "product") {
        return res.status(403).json({ error: "Sellers can only upload product images" });
      }

      if (userRole !== "admin" && userRole !== "seller") {
        return res.status(403).json({ error: "Unauthorized to upload media" });
      }

      const mediaItem = await storage.createMediaLibraryItem({
        ...req.body,
        uploaderRole: userRole,
        uploaderId: req.user!.id,
      });
      res.json(mediaItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/media-library", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { category, uploaderRole } = req.query;
      const userRole = req.user!.role;

      // Only admin and seller roles can access media library
      if (userRole !== "admin" && userRole !== "seller") {
        return res.status(403).json({ error: "Unauthorized to access media library" });
      }

      const filters: { category?: string; uploaderRole?: string; uploaderId?: string } = {};

      // Add category filter if specified
      if (category) {
        filters.category = category as string;
      }

      // Sellers can only see their own product images or admin's media
      if (userRole === "seller") {
        // If category is product, show seller's own products plus admin's products
        if (!category || category === "product") {
          const items = await storage.getMediaLibraryItems({ category: "product" });
          // Filter to only show seller's own or admin uploaded
          const filtered = items.filter(
            item => item.uploaderId === req.user!.id || item.uploaderRole === "admin"
          );
          return res.json(filtered);
        } else {
          // For non-product categories, sellers can only see admin uploads
          filters.uploaderRole = "admin";
        }
      }

      // Admin can see everything, optionally filtered
      if (uploaderRole && userRole === "admin") {
        filters.uploaderRole = uploaderRole as string;
      }

      const items = await storage.getMediaLibraryItems(filters);
      res.json(items);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/media-library/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;
      
      // Get the item first to check ownership
      const items = await storage.getMediaLibraryItems({});
      const item = items.find(i => i.id === req.params.id);

      if (!item) {
        return res.status(404).json({ error: "Media item not found" });
      }

      // Admin can delete anything, sellers can only delete their own product images
      if (userRole === "seller") {
        if (item.uploaderId !== req.user!.id) {
          return res.status(403).json({ error: "Unauthorized to delete this item" });
        }
      } else if (userRole !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const success = await storage.deleteMediaLibraryItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Media item not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Asset Browser Route ============
  app.get("/api/assets/images", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const assetsDir = path.join(process.cwd(), 'attached_assets');
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
      
      function getImagesFromDir(dir: string, baseDir: string = dir): any[] {
        const images: any[] = [];
        
        try {
          const items = fs.readdirSync(dir);
          
          for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              images.push(...getImagesFromDir(fullPath, baseDir));
            } else if (stat.isFile()) {
              const ext = path.extname(item).toLowerCase();
              if (imageExtensions.includes(ext)) {
                const relativePath = path.relative(process.cwd(), fullPath);
                const url = '/' + relativePath.replace(/\\/g, '/');
                
                images.push({
                  filename: item,
                  url: url,
                  path: relativePath,
                  size: stat.size,
                });
              }
            }
          }
        } catch (error) {
          console.error('Error reading directory:', error);
        }
        
        return images;
      }
      
      const images = getImagesFromDir(assetsDir);
      res.json(images);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Enhanced Review Routes ============
  app.post("/api/reviews/:id/reply", requireAuth, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const { reply } = req.body;
      if (!reply) {
        return res.status(400).json({ error: "Reply is required" });
      }

      const review = await storage.addSellerReply(req.params.id, reply);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/reviews/verify-purchase/:productId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const verification = await storage.verifyPurchaseForReview(req.user!.id, req.params.productId);
      res.json(verification);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Notification Routes ============
  app.get("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getNotificationsByUser(req.user!.id, limit);
      res.json(notifications);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req: AuthRequest, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.user!.id);
      res.json({ count });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req: AuthRequest, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/mark-all-read", requireAuth, async (req: AuthRequest, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user!.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
