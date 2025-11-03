import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["admin", "seller", "buyer", "rider", "agent"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "delivering", "delivered", "cancelled", "disputed"]);
export const deliveryMethodEnum = pgEnum("delivery_method", ["pickup", "bus", "rider"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "processing", "completed", "failed", "refunded"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("buyer"),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  profileImage: text("profile_image"),
  storeName: text("store_name"),
  storeDescription: text("store_description"),
  storeBanner: text("store_banner"),
  vehicleInfo: jsonb("vehicle_info").$type<{ type: string; plateNumber: string; license: string }>(),
  ratings: decimal("ratings", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  isMultiVendor: boolean("is_multi_vendor").default(false),
  platformName: text("platform_name").default("ModestGlow"),
  logo: text("logo"),
  primaryColor: text("primary_color").default("#1e7b5f"),
  onboardingImages: text("onboarding_images").array(),
  defaultCurrency: text("default_currency").default("GHS"),
  paystackPublicKey: text("paystack_public_key"),
  paystackSecretKey: text("paystack_secret_key"),
  processingFeePercent: decimal("processing_fee_percent", { precision: 4, scale: 2 }).default("1.95"),
  cloudinaryCloudName: text("cloudinary_cloud_name"),
  cloudinaryApiKey: text("cloudinary_api_key"),
  cloudinaryApiSecret: text("cloudinary_api_secret"),
  contactPhone: text("contact_phone").default("+233 XX XXX XXXX"),
  contactEmail: text("contact_email").default("support@kiyumart.com"),
  contactAddress: text("contact_address").default("Accra, Ghana"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  footerDescription: text("footer_description").default("Your trusted fashion marketplace. Quality products, fast delivery, and excellent service."),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discount: integer("discount").default(0),
  stock: integer("stock").default(0),
  images: text("images").array().notNull(),
  video: text("video"),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  ratings: decimal("ratings", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deliveryZones = pgTable("delivery_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  riderId: varchar("rider_id").references(() => users.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  deliveryMethod: deliveryMethodEnum("delivery_method").notNull(),
  deliveryZoneId: varchar("delivery_zone_id").references(() => deliveryZones.id),
  deliveryAddress: text("delivery_address"),
  deliveryCity: text("delivery_city"),
  deliveryPhone: text("delivery_phone"),
  deliveryLatitude: decimal("delivery_latitude", { precision: 10, scale: 7 }),
  deliveryLongitude: decimal("delivery_longitude", { precision: 10, scale: 7 }),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("GHS"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  paymentReference: text("payment_reference"),
  qrCode: text("qr_code"),
  estimatedDelivery: timestamp("estimated_delivery"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const deliveryTracking = pgTable("delivery_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  riderId: varchar("rider_id").notNull().references(() => users.id),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  accuracy: decimal("accuracy", { precision: 10, scale: 2 }),
  speed: decimal("speed", { precision: 10, scale: 2 }),
  heading: decimal("heading", { precision: 10, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("GHS"),
  paymentProvider: text("payment_provider").default("paystack"),
  paymentReference: text("payment_reference").notNull(),
  status: paymentStatusEnum("status").default("pending"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cart = pgTable("cart", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wishlist = pgTable("wishlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserProduct: unique("wishlist_user_product_unique").on(table.userId, table.productId),
}));

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productVariants = pgTable("product_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  color: text("color"),
  size: text("size"),
  sku: text("sku"),
  stock: integer("stock").default(0),
  priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const heroBanners = pgTable("hero_banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  image: text("image").notNull(),
  ctaText: text("cta_text"),
  ctaLink: text("cta_link"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
  role: true,
  phone: true,
  storeName: true,
  storeDescription: true,
  vehicleInfo: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  category: true,
  costPrice: true,
  price: true,
  discount: true,
  stock: true,
  images: true,
  video: true,
  tags: true,
});

export const insertDeliveryZoneSchema = createInsertSchema(deliveryZones).pick({
  name: true,
  fee: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  buyerId: true,
  sellerId: true,
  deliveryMethod: true,
  deliveryZoneId: true,
  deliveryAddress: true,
  deliveryFee: true,
  subtotal: true,
  processingFee: true,
  total: true,
  currency: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  receiverId: true,
  message: true,
  messageType: true,
});

export const insertWishlistSchema = createInsertSchema(wishlist).pick({
  productId: true,
});

export const insertDeliveryTrackingSchema = createInsertSchema(deliveryTracking).pick({
  orderId: true,
  riderId: true,
  latitude: true,
  longitude: true,
  accuracy: true,
  speed: true,
  heading: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  productId: true,
  rating: true,
  comment: true,
});

export const insertProductVariantSchema = createInsertSchema(productVariants).pick({
  productId: true,
  color: true,
  size: true,
  sku: true,
  stock: true,
  priceAdjustment: true,
});

export const insertHeroBannerSchema = createInsertSchema(heroBanners).pick({
  title: true,
  subtitle: true,
  image: true,
  ctaText: true,
  ctaLink: true,
  isActive: true,
  displayOrder: true,
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertDeliveryZone = z.infer<typeof insertDeliveryZoneSchema>;
export type DeliveryZone = typeof deliveryZones.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type OrderItem = typeof orderItems.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type Transaction = typeof transactions.$inferSelect;

export type PlatformSettings = typeof platformSettings.$inferSelect;

export type Cart = typeof cart.$inferSelect;

export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlist.$inferSelect;

export type InsertDeliveryTracking = z.infer<typeof insertDeliveryTrackingSchema>;
export type DeliveryTracking = typeof deliveryTracking.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;

export type InsertHeroBanner = z.infer<typeof insertHeroBannerSchema>;
export type HeroBanner = typeof heroBanners.$inferSelect;
