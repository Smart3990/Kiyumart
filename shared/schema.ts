import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum, unique, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["admin", "seller", "buyer", "rider", "agent"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "delivering", "delivered", "cancelled", "disputed"]);
export const deliveryMethodEnum = pgEnum("delivery_method", ["pickup", "bus", "rider"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "processing", "completed", "failed", "refunded"]);
export const supportStatusEnum = pgEnum("support_status", ["open", "assigned", "resolved"]);
export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);
export const notificationTypeEnum = pgEnum("notification_type", ["order", "user", "product", "review", "message", "system"]);
export const adminTransactionTypeEnum = pgEnum("admin_transaction_type", ["sale", "commission", "promotion_fee"]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const deliveryAssignmentStatusEnum = pgEnum("delivery_assignment_status", ["assigned", "en_route", "delivered", "cancelled"]);
export const mediaCategoryEnum = pgEnum("media_category", ["banner", "category", "logo", "product", "general"]);
export const storeTypeEnum = pgEnum("store_type", ["clothing", "electronics", "food_beverages", "beauty_cosmetics", "home_garden", "sports_fitness", "books_media", "toys_games", "automotive", "health_wellness"]);

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
  ghanaCardFront: text("ghana_card_front"),
  ghanaCardBack: text("ghana_card_back"),
  businessAddress: text("business_address"),
  storeName: text("store_name"),
  storeDescription: text("store_description"),
  storeBanner: text("store_banner"),
  storeType: storeTypeEnum("store_type"),
  storeTypeMetadata: jsonb("store_type_metadata").$type<Record<string, any>>(),
  vehicleInfo: jsonb("vehicle_info").$type<{ type: string; plateNumber?: string; license?: string; color?: string }>(),
  nationalIdCard: varchar("national_id_card"),
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
  secondaryColor: text("secondary_color").default("#2c3e50"),
  accentColor: text("accent_color").default("#e74c3c"),
  lightBgColor: text("light_bg_color").default("#ffffff"),
  lightTextColor: text("light_text_color").default("#000000"),
  darkBgColor: text("dark_bg_color").default("#1a1a1a"),
  darkTextColor: text("dark_text_color").default("#ffffff"),
  lightCardColor: text("light_card_color").default("#f8f9fa"),
  darkCardColor: text("dark_card_color").default("#2a2a2a"),
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
  footerLinks: jsonb("footer_links").$type<Array<{title: string; url: string}>>().default([]),
  footerPaymentIcons: text("footer_payment_icons").array(),
  activeBannerCollectionId: varchar("active_banner_collection_id"),
  categoryDisplayStyle: text("category_display_style").default("grid"),
  bannerAutoplayEnabled: boolean("banner_autoplay_enabled").default(true),
  bannerAutoplayDuration: integer("banner_autoplay_duration").default(5000),
  adsEnabled: boolean("ads_enabled").default(false),
  heroBannerAdImage: text("hero_banner_ad_image"),
  heroBannerAdUrl: text("hero_banner_ad_url"),
  sidebarAdImage: text("sidebar_ad_image"),
  sidebarAdUrl: text("sidebar_ad_url"),
  shopDisplayMode: text("shop_display_mode").default("by-store"), // "by-store" or "by-category"
  footerAdImage: text("footer_ad_image"),
  footerAdUrl: text("footer_ad_url"),
  productPageAdImage: text("product_page_ad_image"),
  productPageAdUrl: text("product_page_ad_url"),
  allowSellerRegistration: boolean("allow_seller_registration").default(false),
  allowRiderRegistration: boolean("allow_rider_registration").default(false),
  primaryStoreId: varchar("primary_store_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stores table for multi-vendor support (backward compatible - optional)
export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  primarySellerId: varchar("primary_seller_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  banner: text("banner"),
  category: text("category"),
  storeType: storeTypeEnum("store_type"),
  storeTypeMetadata: jsonb("store_type_metadata").$type<Record<string, any>>(),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories (admin-manageable)
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  storeId: varchar("store_id").references(() => stores.id), // Optional - for multi-vendor mode
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discount: integer("discount").default(0),
  stock: integer("stock").default(0),
  images: text("images").array().notNull(),
  video: text("video"), // Max 30 seconds, MP4 or WEBM
  videoDuration: integer("video_duration"), // Duration in seconds for validation
  tags: text("tags").array(),
  dynamicFields: jsonb("dynamic_fields").$type<Record<string, any>>(), // Category-specific dynamic fields
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

export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumPurchase: decimal("minimum_purchase", { precision: 10, scale: 2 }).default("0"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  couponCode: text("coupon_code"),
  couponDiscount: decimal("coupon_discount", { precision: 10, scale: 2 }).default("0"),
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

export const supportConversations = pgTable("support_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  agentId: varchar("agent_id").references(() => users.id),
  status: supportStatusEnum("status").notNull().default("open"),
  subject: text("subject").notNull(),
  lastMessage: text("last_message").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportMessages = pgTable("support_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => supportConversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
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
  variantId: varchar("variant_id").references(() => productVariants.id),
  selectedColor: varchar("selected_color"),
  selectedSize: varchar("selected_size"),
  selectedImageIndex: integer("selected_image_index").default(0),
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
  orderId: varchar("order_id").references(() => orders.id), // Track which order this review is for
  rating: integer("rating").notNull(),
  comment: text("comment"),
  images: text("images").array(), // Optional review images
  isVerifiedPurchase: boolean("is_verified_purchase").default(false), // Only true if buyer actually purchased
  sellerReply: text("seller_reply"), // Seller can reply to reviews
  sellerReplyAt: timestamp("seller_reply_at"),
  isApproved: boolean("is_approved").default(true), // Admin moderation
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
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

export const bannerCollections = pgTable("banner_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketplaceBanners = pgTable("marketplace_banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").references(() => bannerCollections.id),
  title: text("title"),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  productRef: varchar("product_ref"),
  storeRef: varchar("store_ref"),
  ctaText: text("cta_text"),
  ctaUrl: text("cta_url"),
  displayOrder: integer("display_order").default(0),
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// New tables for comprehensive feature list
export const adminWalletTransactions = pgTable("admin_wallet_transactions", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  type: adminTransactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  productId: varchar("product_id").references(() => products.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id").notNull().references(() => products.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  promotedBy: varchar("promoted_by").notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  position: integer("position").default(0),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: jsonb("features").$type<Array<string>>(),
  duration: integer("duration").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const featuredListings = pgTable("featured_listings", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id").notNull().references(() => products.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  position: integer("position").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  addedAt: timestamp("added_at").defaultNow(),
});

export const productMedia = pgTable("product_media", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id").notNull().references(() => products.id),
  mediaUrl: varchar("media_url").notNull(),
  mediaType: mediaTypeEnum("media_type").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const currencyRates = pgTable("currency_rates", {
  id: serial("id").primaryKey(),
  fromCurrency: varchar("from_currency").notNull(),
  toCurrency: varchar("to_currency").notNull(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const deliveryAssignments = pgTable("delivery_assignments", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  riderId: varchar("rider_id").notNull().references(() => users.id),
  status: deliveryAssignmentStatusEnum("status").notNull().default("assigned"),
  assignedAt: timestamp("assigned_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  deliveryProof: varchar("delivery_proof"),
});

export const localizationStrings = pgTable("localization_strings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  en: text("en"),
  fr: text("fr"),
  ar: text("ar"),
  es: text("es"),
  zh: text("zh"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securitySettings = pgTable("security_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  pinEnabled: boolean("pin_enabled").default(false),
  pinHash: varchar("pin_hash"),
  fingerprintEnabled: boolean("fingerprint_enabled").default(false),
  faceIdEnabled: boolean("face_id_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
  role: true,
  phone: true,
  profileImage: true,
  ghanaCardFront: true,
  ghanaCardBack: true,
  nationalIdCard: true,
  businessAddress: true,
  storeName: true,
  storeDescription: true,
  storeBanner: true,
  storeType: true,
  storeTypeMetadata: true,
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
  videoDuration: true,
  tags: true,
  dynamicFields: true,
  storeId: true,
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
  couponCode: true,
  couponDiscount: true,
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
  orderId: true,
  rating: true,
  comment: true,
  images: true,
  isVerifiedPurchase: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  metadata: true,
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

export const insertCouponSchema = createInsertSchema(coupons).pick({
  code: true,
  discountType: true,
  discountValue: true,
  minimumPurchase: true,
  usageLimit: true,
  expiryDate: true,
  isActive: true,
});

export const insertBannerCollectionSchema = createInsertSchema(bannerCollections).pick({
  name: true,
  description: true,
  type: true,
  isActive: true,
});

export const insertMarketplaceBannerSchema = createInsertSchema(marketplaceBanners).pick({
  collectionId: true,
  title: true,
  subtitle: true,
  imageUrl: true,
  productRef: true,
  storeRef: true,
  ctaText: true,
  ctaUrl: true,
  displayOrder: true,
  startAt: true,
  endAt: true,
  isActive: true,
  metadata: true,
});

export const insertAdminWalletTransactionSchema = createInsertSchema(adminWalletTransactions).omit({ id: true, createdAt: true });
export const insertPromotionSchema = createInsertSchema(promotions).omit({ id: true, createdAt: true });
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true });
export const insertFeaturedListingSchema = createInsertSchema(featuredListings).omit({ id: true, createdAt: true });
export const insertWishlistsSchema = createInsertSchema(wishlists).omit({ id: true, addedAt: true });
export const insertProductMediaSchema = createInsertSchema(productMedia).omit({ id: true, createdAt: true });
export const insertCurrencyRateSchema = createInsertSchema(currencyRates).omit({ id: true, lastUpdated: true });
export const insertDeliveryAssignmentSchema = createInsertSchema(deliveryAssignments).omit({ id: true, assignedAt: true });
export const insertLocalizationStringSchema = createInsertSchema(localizationStrings).omit({ id: true, createdAt: true });
export const insertSecuritySettingSchema = createInsertSchema(securitySettings).omit({ id: true, createdAt: true, updatedAt: true });

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

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const insertSupportConversationSchema = createInsertSchema(supportConversations).pick({
  subject: true,
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages).pick({
  conversationId: true,
  message: true,
});

export type InsertSupportConversation = z.infer<typeof insertSupportConversationSchema>;
export type SupportConversation = typeof supportConversations.$inferSelect;

export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;

export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;

export type InsertHeroBanner = z.infer<typeof insertHeroBannerSchema>;
export type HeroBanner = typeof heroBanners.$inferSelect;

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

export type InsertBannerCollection = z.infer<typeof insertBannerCollectionSchema>;
export type BannerCollection = typeof bannerCollections.$inferSelect;

export type InsertMarketplaceBanner = z.infer<typeof insertMarketplaceBannerSchema>;
export type MarketplaceBanner = typeof marketplaceBanners.$inferSelect;

export type InsertAdminWalletTransaction = z.infer<typeof insertAdminWalletTransactionSchema>;
export type AdminWalletTransaction = typeof adminWalletTransactions.$inferSelect;

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertFeaturedListing = z.infer<typeof insertFeaturedListingSchema>;
export type FeaturedListing = typeof featuredListings.$inferSelect;

export type InsertWishlists = z.infer<typeof insertWishlistsSchema>;
export type Wishlists = typeof wishlists.$inferSelect;

export type InsertProductMedia = z.infer<typeof insertProductMediaSchema>;
export type ProductMedia = typeof productMedia.$inferSelect;

export type InsertCurrencyRate = z.infer<typeof insertCurrencyRateSchema>;
export type CurrencyRate = typeof currencyRates.$inferSelect;

export type InsertDeliveryAssignment = z.infer<typeof insertDeliveryAssignmentSchema>;
export type DeliveryAssignment = typeof deliveryAssignments.$inferSelect;

export type InsertLocalizationString = z.infer<typeof insertLocalizationStringSchema>;
export type LocalizationString = typeof localizationStrings.$inferSelect;

export type InsertSecuritySetting = z.infer<typeof insertSecuritySettingSchema>;
export type SecuritySetting = typeof securitySettings.$inferSelect;

// Media Library for storing reusable images (banners, categories, logos, products)
export const mediaLibrary = pgTable("media_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  category: mediaCategoryEnum("category").notNull(),
  uploaderRole: userRoleEnum("uploader_role").notNull(),
  uploaderId: varchar("uploader_id").references(() => users.id),
  filename: text("filename").notNull(),
  altText: text("alt_text"),
  tags: text("tags").array(),
  isTemporary: boolean("is_temporary").default(true), // hardcoded images are temporary
  createdAt: timestamp("created_at").defaultNow(),
});

// Category Fields for dynamic admin-created categories
export const categoryFields = pgTable("category_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryName: text("category_name").notNull(),
  fieldName: text("field_name").notNull(),
  fieldType: text("field_type").notNull(), // text, number, dropdown, multiselect, table
  fieldOptions: jsonb("field_options").$type<Array<string>>(), // For dropdown/multiselect
  isRequired: boolean("is_required").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaLibrarySchema = createInsertSchema(mediaLibrary).omit({ id: true, createdAt: true });
export type InsertMediaLibrary = z.infer<typeof insertMediaLibrarySchema>;
export type MediaLibrary = typeof mediaLibrary.$inferSelect;

export const insertCategoryFieldSchema = createInsertSchema(categoryFields).omit({ id: true, createdAt: true });
export type InsertCategoryField = z.infer<typeof insertCategoryFieldSchema>;
export type CategoryField = typeof categoryFields.$inferSelect;

// Store schema
export const insertStoreSchema = createInsertSchema(stores).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

// Category schema
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
