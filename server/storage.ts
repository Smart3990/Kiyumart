import { db } from "../db/index";
import { 
  users, products, orders, orderItems, deliveryZones, deliveryTracking,
  chatMessages, transactions, platformSettings, cart, wishlist, reviews,
  productVariants, heroBanners, coupons, bannerCollections, marketplaceBanners,
  stores, categoryFields, categories, notifications,
  type User, type InsertUser, type Product, type InsertProduct,
  type Order, type InsertOrder, type DeliveryZone, type InsertDeliveryZone,
  type ChatMessage, type InsertChatMessage, type Transaction, type PlatformSettings,
  type Cart, type Wishlist, type DeliveryTracking, type InsertDeliveryTracking,
  type Review, type InsertReview, type ProductVariant, type HeroBanner,
  type Coupon, type InsertCoupon, type BannerCollection, type InsertBannerCollection,
  type MarketplaceBanner, type InsertMarketplaceBanner, type Store, type CategoryField,
  type Category, type Notification, type InsertNotification
} from "@shared/schema";
import { eq, and, desc, sql, lte, gte, or, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Product operations
  createProduct(product: InsertProduct & { sellerId: string }): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getProducts(filters?: { sellerId?: string; category?: string; isActive?: boolean }): Promise<Product[]>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Order operations
  createOrder(order: InsertOrder, items: Array<{ productId: string; quantity: number; price: string; total: string }>): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string, role: "buyer" | "seller" | "rider"): Promise<Order[]>;
  getOrderItems(orderId: string): Promise<Array<{ productId: string; productName: string; quantity: number; price: string }>>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  updateOrder(orderId: string, data: Partial<Order>): Promise<Order | undefined>;
  assignRider(orderId: string, riderId: string): Promise<Order | undefined>;
  
  // Delivery Zone operations
  createDeliveryZone(zone: InsertDeliveryZone): Promise<DeliveryZone>;
  getDeliveryZones(): Promise<DeliveryZone[]>;
  updateDeliveryZone(id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone | undefined>;
  deleteDeliveryZone(id: string): Promise<boolean>;
  
  // Chat operations
  createMessage(message: InsertChatMessage & { senderId: string }): Promise<ChatMessage>;
  getMessages(userId1: string, userId2: string): Promise<ChatMessage[]>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // Transaction operations
  createTransaction(data: any): Promise<Transaction>;
  getTransactionByReference(reference: string): Promise<Transaction | undefined>;
  
  // Platform settings
  getPlatformSettings(): Promise<PlatformSettings>;
  updatePlatformSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings>;
  
  // Cart operations
  addToCart(userId: string, productId: string, quantity: number, variantId?: string, selectedColor?: string, selectedSize?: string, selectedImageIndex?: number): Promise<Cart>;
  getCart(userId: string): Promise<Array<{ id: string; productId: string; productName: string; productImage: string; quantity: number; price: string; variantId: string | null; selectedColor: string | null; selectedSize: string | null; selectedImageIndex: number | null }>>;
  updateCartItem(id: string, quantity: number): Promise<Cart | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<void>;
  
  // Wishlist operations
  addToWishlist(userId: string, productId: string): Promise<Wishlist>;
  getWishlist(userId: string): Promise<Wishlist[]>;
  removeFromWishlist(userId: string, productId: string): Promise<boolean>;
  
  // Delivery Tracking operations
  createDeliveryTracking(data: InsertDeliveryTracking): Promise<DeliveryTracking>;
  getLatestDeliveryLocation(orderId: string): Promise<DeliveryTracking | undefined>;
  getDeliveryTrackingHistory(orderId: string): Promise<DeliveryTracking[]>;
  
  // Review operations
  createReview(review: InsertReview & { userId: string }): Promise<Review>;
  getProductReviews(productId: string): Promise<Array<Review & { userName: string }>>;
  addSellerReply(reviewId: string, reply: string): Promise<Review | undefined>;
  verifyPurchaseForReview(userId: string, productId: string): Promise<{ verified: boolean; orderId?: string }>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  markNotificationAsRead(notificationId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
  // Product Variant operations
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  
  // Category Fields operations (admin only)
  createCategoryField(field: any): Promise<any>;
  getCategoryFields(categoryName?: string): Promise<any[]>;
  updateCategoryField(id: string, data: any): Promise<any | undefined>;
  deleteCategoryField(id: string): Promise<boolean>;
  
  // Store operations
  createStore(store: any): Promise<any>;
  getStore(id: string): Promise<any | undefined>;
  getStores(filters?: { isActive?: boolean; isApproved?: boolean }): Promise<any[]>;
  getStoreByPrimarySeller(sellerId: string): Promise<any | undefined>;
  updateStore(id: string, data: any): Promise<any | undefined>;
  deleteStore(id: string): Promise<boolean>;
  
  // Category operations
  createCategory(category: any): Promise<any>;
  getCategory(id: string): Promise<any | undefined>;
  getCategoryBySlug(slug: string): Promise<any | undefined>;
  getCategories(filters?: { isActive?: boolean }): Promise<any[]>;
  updateCategory(id: string, data: any): Promise<any | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Hero Banner operations
  getHeroBanners(): Promise<HeroBanner[]>;
  
  // Coupon operations
  createCoupon(coupon: InsertCoupon & { sellerId: string }): Promise<Coupon>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getCouponsBySeller(sellerId: string): Promise<Coupon[]>;
  updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;
  validateCoupon(code: string, sellerId: string, orderTotal: number): Promise<{ valid: boolean; message?: string; coupon?: Coupon }>;
  
  // Analytics
  getAnalytics(userId?: string, role?: string): Promise<any>;
  
  // Banner Collection operations
  createBannerCollection(collection: InsertBannerCollection): Promise<BannerCollection>;
  getBannerCollection(id: string): Promise<BannerCollection | undefined>;
  getBannerCollections(): Promise<BannerCollection[]>;
  updateBannerCollection(id: string, data: Partial<BannerCollection>): Promise<BannerCollection | undefined>;
  deleteBannerCollection(id: string): Promise<boolean>;
  
  // Marketplace Banner operations
  createMarketplaceBanner(banner: InsertMarketplaceBanner): Promise<MarketplaceBanner>;
  getMarketplaceBanner(id: string): Promise<MarketplaceBanner | undefined>;
  getMarketplaceBanners(collectionId?: string): Promise<MarketplaceBanner[]>;
  getActiveMarketplaceBanners(): Promise<MarketplaceBanner[]>;
  updateMarketplaceBanner(id: string, data: Partial<MarketplaceBanner>): Promise<MarketplaceBanner | undefined>;
  deleteMarketplaceBanner(id: string): Promise<boolean>;
  reorderMarketplaceBanners(bannerIds: string[]): Promise<void>;
  
  // Multi-vendor homepage data
  getApprovedSellers(): Promise<User[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role as any));
  }

  // Product operations
  async createProduct(product: InsertProduct & { sellerId: string }): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProducts(filters?: { sellerId?: string; category?: string; isActive?: boolean }): Promise<Product[]> {
    let query = db.select().from(products);
    
    if (filters?.sellerId) {
      query = query.where(eq(products.sellerId, filters.sellerId)) as any;
    }
    if (filters?.isActive !== undefined) {
      query = query.where(eq(products.isActive, filters.isActive)) as any;
    }
    
    return query.orderBy(desc(products.createdAt));
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const result = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Order operations
  async createOrder(
    order: InsertOrder, 
    items: Array<{ productId: string; quantity: number; price: string; total: string }>
  ): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}`;
    const qrCode = `${orderNumber}-${order.buyerId}`;
    
    const [newOrder] = await db.insert(orders).values({
      ...order,
      orderNumber,
      qrCode,
    }).returning();

    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        ...item,
      });
    }

    // Increment coupon usage count atomically if coupon was applied
    if (order.couponCode) {
      await db.update(coupons)
        .set({ usedCount: sql`COALESCE(${coupons.usedCount}, 0) + 1` })
        .where(eq(coupons.code, order.couponCode));
    }

    await this.clearCart(order.buyerId);

    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrdersByUser(userId: string, role: "buyer" | "seller" | "rider"): Promise<Order[]> {
    if (role === "buyer") {
      return db.select().from(orders).where(eq(orders.buyerId, userId)).orderBy(desc(orders.createdAt));
    } else if (role === "seller") {
      return db.select().from(orders).where(eq(orders.sellerId, userId)).orderBy(desc(orders.createdAt));
    } else {
      return db.select().from(orders).where(eq(orders.riderId, userId as any)).orderBy(desc(orders.createdAt));
    }
  }

  async getOrderItems(orderId: string): Promise<Array<{ productId: string; productName: string; quantity: number; price: string }>> {
    const items = await db
      .select({
        productId: orderItems.productId,
        productName: products.name,
        quantity: orderItems.quantity,
        price: orderItems.price,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
    
    return items.map(item => ({
      ...item,
      productName: item.productName || "Unknown Product"
    }));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db.update(orders).set({ 
      status: status as any,
      updatedAt: new Date(),
      ...(status === "delivered" ? { deliveredAt: new Date() } : {})
    }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async updateOrder(orderId: string, data: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(orders).set({ 
      ...data,
      updatedAt: new Date()
    }).where(eq(orders.id, orderId)).returning();
    return result[0];
  }

  async assignRider(orderId: string, riderId: string): Promise<Order | undefined> {
    const result = await db.update(orders).set({ 
      riderId,
      status: "processing",
      updatedAt: new Date()
    }).where(eq(orders.id, orderId)).returning();
    return result[0];
  }

  // Delivery Zone operations
  async createDeliveryZone(zone: InsertDeliveryZone): Promise<DeliveryZone> {
    const result = await db.insert(deliveryZones).values(zone).returning();
    return result[0];
  }

  async getDeliveryZones(): Promise<DeliveryZone[]> {
    return db.select().from(deliveryZones).where(eq(deliveryZones.isActive, true));
  }

  async updateDeliveryZone(id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone | undefined> {
    const result = await db.update(deliveryZones).set(data).where(eq(deliveryZones.id, id)).returning();
    return result[0];
  }

  async deleteDeliveryZone(id: string): Promise<boolean> {
    const result = await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
    return true;
  }

  // Chat operations
  async createMessage(message: InsertChatMessage & { senderId: string }): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  async getMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    return db.select().from(chatMessages)
      .where(
        sql`(${chatMessages.senderId} = ${userId1} AND ${chatMessages.receiverId} = ${userId2}) OR 
            (${chatMessages.senderId} = ${userId2} AND ${chatMessages.receiverId} = ${userId1})`
      )
      .orderBy(chatMessages.createdAt);
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await db.update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.senderId, senderId),
          eq(chatMessages.receiverId, receiverId)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db.select().from(chatMessages)
      .where(
        and(
          eq(chatMessages.receiverId, userId),
          eq(chatMessages.isRead, false)
        )
      );
    return result.length;
  }

  // Transaction operations
  async createTransaction(data: any): Promise<Transaction> {
    const result = await db.insert(transactions).values(data as any).returning();
    return result[0];
  }

  async getTransactionByReference(reference: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.paymentReference, reference)).limit(1);
    return result[0];
  }

  // Platform settings
  async getPlatformSettings(): Promise<PlatformSettings> {
    const result = await db.select().from(platformSettings).limit(1);
    if (result.length === 0) {
      const [settings] = await db.insert(platformSettings).values({}).returning();
      return settings;
    }
    return result[0];
  }

  async updatePlatformSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const existing = await this.getPlatformSettings();
    const result = await db.update(platformSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(platformSettings.id, existing.id))
      .returning();
    return result[0];
  }

  // Cart operations
  async addToCart(userId: string, productId: string, quantity: number, variantId?: string, selectedColor?: string, selectedSize?: string, selectedImageIndex?: number): Promise<Cart> {
    const existing = await db.select().from(cart)
      .where(and(
        eq(cart.userId, userId), 
        eq(cart.productId, productId),
        variantId ? eq(cart.variantId, variantId) : sql`${cart.variantId} IS NULL`,
        selectedColor ? eq(cart.selectedColor, selectedColor) : sql`${cart.selectedColor} IS NULL`,
        selectedSize ? eq(cart.selectedSize, selectedSize) : sql`${cart.selectedSize} IS NULL`
      ))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(cart)
        .set({ 
          quantity: existing[0].quantity + quantity, 
          selectedImageIndex: selectedImageIndex ?? existing[0].selectedImageIndex,
          updatedAt: new Date() 
        })
        .where(eq(cart.id, existing[0].id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(cart).values({ 
      userId, 
      productId, 
      quantity,
      variantId,
      selectedColor,
      selectedSize,
      selectedImageIndex: selectedImageIndex ?? 0
    }).returning();
    return newItem;
  }

  async getCart(userId: string): Promise<Array<{ id: string; productId: string; productName: string; productImage: string; quantity: number; price: string; variantId: string | null; selectedColor: string | null; selectedSize: string | null; selectedImageIndex: number | null }>> {
    const items = await db
      .select({
        id: cart.id,
        productId: cart.productId,
        productName: products.name,
        productImages: products.images,
        quantity: cart.quantity,
        price: products.price,
        variantId: cart.variantId,
        selectedColor: cart.selectedColor,
        selectedSize: cart.selectedSize,
        selectedImageIndex: cart.selectedImageIndex,
      })
      .from(cart)
      .leftJoin(products, eq(cart.productId, products.id))
      .where(eq(cart.userId, userId))
      .orderBy(desc(cart.createdAt));
    
    return items.map(item => {
      const imageIndex = item.selectedImageIndex ?? 0;
      const productImage = item.productImages && Array.isArray(item.productImages) && item.productImages.length > imageIndex
        ? item.productImages[imageIndex]
        : (item.productImages && Array.isArray(item.productImages) && item.productImages.length > 0 ? item.productImages[0] : "");
      
      return {
        id: item.id,
        productId: item.productId,
        productName: item.productName || "Unknown Product",
        productImage,
        quantity: item.quantity,
        price: item.price || "0",
        variantId: item.variantId,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        selectedImageIndex: item.selectedImageIndex
      };
    });
  }

  async updateCartItem(id: string, quantity: number): Promise<Cart | undefined> {
    if (quantity <= 0) {
      await db.delete(cart).where(eq(cart.id, id));
      return undefined;
    }
    const [updated] = await db.update(cart)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cart.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: string): Promise<boolean> {
    await db.delete(cart).where(eq(cart.id, id));
    return true;
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cart).where(eq(cart.userId, userId));
  }

  // Wishlist operations
  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    const existing = await db.select().from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [newItem] = await db.insert(wishlist).values({ userId, productId }).returning();
    return newItem;
  }

  async getWishlist(userId: string): Promise<Wishlist[]> {
    return db.select().from(wishlist).where(eq(wishlist.userId, userId)).orderBy(desc(wishlist.createdAt));
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const result = await db.delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Review operations
  async createReview(review: InsertReview & { userId: string }): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getProductReviews(productId: string): Promise<Array<Review & { userName: string }>> {
    const result = await db.select({
      id: reviews.id,
      productId: reviews.productId,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
    })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
    return result as Array<Review & { userName: string }>;
  }

  async addSellerReply(reviewId: string, reply: string): Promise<Review | undefined> {
    const [updated] = await db.update(reviews)
      .set({ sellerReply: reply, sellerReplyAt: new Date() })
      .where(eq(reviews.id, reviewId))
      .returning();
    return updated;
  }

  async verifyPurchaseForReview(userId: string, productId: string): Promise<{ verified: boolean; orderId?: string }> {
    const result = await db.select()
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.buyerId, userId),
          eq(orderItems.productId, productId),
          eq(orders.status, "delivered")
        )
      )
      .limit(1);
    
    if (result.length > 0) {
      return { verified: true, orderId: result[0].orders.id };
    }
    return { verified: false };
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: string, limit: number = 50): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return result[0]?.count || 0;
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))
      .returning();
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Product Variant operations
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  // Hero Banner operations
  async getHeroBanners(): Promise<HeroBanner[]> {
    return await db.select().from(heroBanners)
      .where(eq(heroBanners.isActive, true))
      .orderBy(heroBanners.displayOrder);
  }

  // Delivery Tracking operations
  async createDeliveryTracking(data: InsertDeliveryTracking): Promise<DeliveryTracking> {
    const [tracking] = await db.insert(deliveryTracking).values(data).returning();
    return tracking;
  }

  async getLatestDeliveryLocation(orderId: string): Promise<DeliveryTracking | undefined> {
    const result = await db.select()
      .from(deliveryTracking)
      .where(eq(deliveryTracking.orderId, orderId))
      .orderBy(desc(deliveryTracking.timestamp))
      .limit(1);
    return result[0];
  }

  async getDeliveryTrackingHistory(orderId: string): Promise<DeliveryTracking[]> {
    return db.select()
      .from(deliveryTracking)
      .where(eq(deliveryTracking.orderId, orderId))
      .orderBy(desc(deliveryTracking.timestamp));
  }

  // Coupon operations
  async createCoupon(coupon: InsertCoupon & { sellerId: string }): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values({
      ...coupon,
      code: coupon.code.toUpperCase(),
    }).returning();
    return newCoupon;
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    return result[0];
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
    return result[0];
  }

  async getCouponsBySeller(sellerId: string): Promise<Coupon[]> {
    return db.select().from(coupons).where(eq(coupons.sellerId, sellerId)).orderBy(desc(coupons.createdAt));
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined> {
    const updateData = { ...data };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    const result = await db.update(coupons).set(updateData).where(eq(coupons.id, id)).returning();
    return result[0];
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async validateCoupon(code: string, sellerId: string, orderTotal: number): Promise<{ valid: boolean; message?: string; coupon?: Coupon; discountAmount?: string }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
      return { valid: false, message: "This coupon is no longer active" };
    }

    if (coupon.sellerId !== sellerId) {
      return { valid: false, message: "This coupon is not valid for this seller" };
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, message: "This coupon has expired" };
    }

    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return { valid: false, message: "This coupon has reached its usage limit" };
    }

    const minimumPurchase = parseFloat(coupon.minimumPurchase || "0");
    if (orderTotal < minimumPurchase) {
      return { valid: false, message: `Minimum purchase of ${minimumPurchase} required to use this coupon` };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderTotal * parseFloat(coupon.discountValue)) / 100;
    } else {
      discountAmount = parseFloat(coupon.discountValue);
    }

    // Ensure discount doesn't exceed order total
    discountAmount = Math.min(discountAmount, orderTotal);

    return { valid: true, coupon, discountAmount: discountAmount.toFixed(2) };
  }

  // Analytics
  async getAnalytics(userId?: string, role?: string): Promise<any> {
    // Basic analytics - can be expanded
    const result: any = {};
    
    if (role === "admin" || !userId) {
      const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders);
      const totalRevenue = await db.select({ sum: sql<number>`sum(${orders.total})` }).from(orders);
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      
      result.totalOrders = totalOrders[0]?.count || 0;
      result.totalRevenue = totalRevenue[0]?.sum || 0;
      result.totalUsers = totalUsers[0]?.count || 0;
    } else if (role === "seller") {
      const sellerOrders = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.sellerId, userId));
      const sellerRevenue = await db.select({ sum: sql<number>`sum(${orders.total})` })
        .from(orders)
        .where(eq(orders.sellerId, userId));
      
      result.totalOrders = sellerOrders[0]?.count || 0;
      result.totalRevenue = sellerRevenue[0]?.sum || 0;
    }
    
    return result;
  }

  // Banner Collection operations
  async createBannerCollection(collection: InsertBannerCollection): Promise<BannerCollection> {
    const [newCollection] = await db.insert(bannerCollections).values(collection).returning();
    return newCollection;
  }

  async getBannerCollection(id: string): Promise<BannerCollection | undefined> {
    const result = await db.select().from(bannerCollections).where(eq(bannerCollections.id, id)).limit(1);
    return result[0];
  }

  async getBannerCollections(): Promise<BannerCollection[]> {
    return db.select().from(bannerCollections).orderBy(desc(bannerCollections.createdAt));
  }

  async updateBannerCollection(id: string, data: Partial<BannerCollection>): Promise<BannerCollection | undefined> {
    const [updated] = await db.update(bannerCollections).set(data).where(eq(bannerCollections.id, id)).returning();
    return updated;
  }

  async deleteBannerCollection(id: string): Promise<boolean> {
    await db.delete(bannerCollections).where(eq(bannerCollections.id, id));
    return true;
  }

  // Marketplace Banner operations
  async createMarketplaceBanner(banner: InsertMarketplaceBanner): Promise<MarketplaceBanner> {
    const [newBanner] = await db.insert(marketplaceBanners).values(banner).returning();
    return newBanner;
  }

  async getMarketplaceBanner(id: string): Promise<MarketplaceBanner | undefined> {
    const result = await db.select().from(marketplaceBanners).where(eq(marketplaceBanners.id, id)).limit(1);
    return result[0];
  }

  async getMarketplaceBanners(collectionId?: string): Promise<MarketplaceBanner[]> {
    if (collectionId) {
      return db.select().from(marketplaceBanners)
        .where(eq(marketplaceBanners.collectionId, collectionId))
        .orderBy(marketplaceBanners.displayOrder, desc(marketplaceBanners.createdAt));
    }
    return db.select().from(marketplaceBanners)
      .orderBy(marketplaceBanners.displayOrder, desc(marketplaceBanners.createdAt));
  }

  async getActiveMarketplaceBanners(): Promise<MarketplaceBanner[]> {
    const now = new Date();
    return db.select().from(marketplaceBanners)
      .where(
        and(
          eq(marketplaceBanners.isActive, true),
          or(
            isNull(marketplaceBanners.startAt),
            lte(marketplaceBanners.startAt, now)
          ),
          or(
            isNull(marketplaceBanners.endAt),
            gte(marketplaceBanners.endAt, now)
          )
        )
      )
      .orderBy(marketplaceBanners.displayOrder);
  }

  async updateMarketplaceBanner(id: string, data: Partial<MarketplaceBanner>): Promise<MarketplaceBanner | undefined> {
    const [updated] = await db.update(marketplaceBanners).set(data).where(eq(marketplaceBanners.id, id)).returning();
    return updated;
  }

  async deleteMarketplaceBanner(id: string): Promise<boolean> {
    await db.delete(marketplaceBanners).where(eq(marketplaceBanners.id, id));
    return true;
  }

  async reorderMarketplaceBanners(bannerIds: string[]): Promise<void> {
    for (let i = 0; i < bannerIds.length; i++) {
      await db.update(marketplaceBanners)
        .set({ displayOrder: i })
        .where(eq(marketplaceBanners.id, bannerIds[i]));
    }
  }

  // Multi-vendor homepage data
  async getApprovedSellers(): Promise<User[]> {
    return db.select().from(users)
      .where(
        and(
          eq(users.role, "seller"),
          eq(users.isApproved, true),
          eq(users.isActive, true)
        )
      )
      .orderBy(desc(users.createdAt));
  }

  async getFeaturedProducts(limit: number = 12): Promise<Product[]> {
    return db.select().from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.ratings), desc(products.createdAt))
      .limit(limit);
  }

  // Enhanced Review operations
  async addSellerReply(reviewId: string, reply: string): Promise<Review | undefined> {
    const [updated] = await db.update(reviews)
      .set({ sellerReply: reply, sellerReplyAt: new Date() })
      .where(eq(reviews.id, reviewId))
      .returning();
    return updated;
  }

  async verifyPurchaseForReview(userId: string, productId: string): Promise<{ verified: boolean; orderId?: string }> {
    // Check if user has a delivered order containing this product
    const result = await db.select({
      orderId: orders.id,
    })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.buyerId, userId),
          eq(orderItems.productId, productId),
          eq(orders.status, "delivered")
        )
      )
      .limit(1);

    if (result.length > 0) {
      return { verified: true, orderId: result[0].orderId };
    }
    return { verified: false };
  }

  // Category Fields operations
  async createCategoryField(field: any): Promise<CategoryField> {
    const [newField] = await db.insert(categoryFields).values(field).returning();
    return newField;
  }

  async getCategoryFields(categoryName?: string): Promise<CategoryField[]> {
    if (categoryName) {
      return await db.select()
        .from(categoryFields)
        .where(eq(categoryFields.categoryName, categoryName))
        .orderBy(categoryFields.displayOrder);
    }
    return await db.select().from(categoryFields).orderBy(categoryFields.categoryName, categoryFields.displayOrder);
  }

  async updateCategoryField(id: string, data: any): Promise<CategoryField | undefined> {
    const [updated] = await db.update(categoryFields)
      .set(data)
      .where(eq(categoryFields.id, id))
      .returning();
    return updated;
  }

  async deleteCategoryField(id: string): Promise<boolean> {
    const result = await db.delete(categoryFields).where(eq(categoryFields.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Store operations
  async createStore(store: any): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  async getStore(id: string): Promise<Store | undefined> {
    const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
    return result[0];
  }

  async getStores(filters?: { isActive?: boolean; isApproved?: boolean }): Promise<Store[]> {
    let query = db.select().from(stores);
    
    const conditions = [];
    if (filters?.isActive !== undefined) {
      conditions.push(eq(stores.isActive, filters.isActive));
    }
    if (filters?.isApproved !== undefined) {
      conditions.push(eq(stores.isApproved, filters.isApproved));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.orderBy(desc(stores.createdAt));
  }

  async getStoreByPrimarySeller(sellerId: string): Promise<Store | undefined> {
    const result = await db.select()
      .from(stores)
      .where(eq(stores.primarySellerId, sellerId))
      .limit(1);
    return result[0];
  }

  async updateStore(id: string, data: any): Promise<Store | undefined> {
    const [updated] = await db.update(stores)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stores.id, id))
      .returning();
    return updated;
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Category operations
  async createCategory(category: any): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async getCategories(filters?: { isActive?: boolean }): Promise<Category[]> {
    let query = db.select().from(categories);
    
    if (filters?.isActive !== undefined) {
      query = query.where(eq(categories.isActive, filters.isActive)) as any;
    }

    return query.orderBy(categories.displayOrder, categories.name);
  }

  async updateCategory(id: string, data: any): Promise<Category | undefined> {
    const [updated] = await db.update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DbStorage();
