import { db } from "../db/index";
import { 
  users, products, orders, orderItems, deliveryZones, deliveryTracking,
  chatMessages, transactions, platformSettings, cart, wishlist,
  type User, type InsertUser, type Product, type InsertProduct,
  type Order, type InsertOrder, type DeliveryZone, type InsertDeliveryZone,
  type ChatMessage, type InsertChatMessage, type Transaction, type PlatformSettings,
  type Cart, type Wishlist, type DeliveryTracking, type InsertDeliveryTracking
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
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
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  updateOrder(orderId: string, data: Partial<Order>): Promise<Order | undefined>;
  assignRider(orderId: string, riderId: string): Promise<Order | undefined>;
  
  // Delivery Zone operations
  createDeliveryZone(zone: InsertDeliveryZone): Promise<DeliveryZone>;
  getDeliveryZones(): Promise<DeliveryZone[]>;
  updateDeliveryZone(id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone | undefined>;
  
  // Chat operations
  createMessage(message: InsertChatMessage & { senderId: string }): Promise<ChatMessage>;
  getMessages(userId1: string, userId2: string): Promise<ChatMessage[]>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  
  // Transaction operations
  createTransaction(data: any): Promise<Transaction>;
  getTransactionByReference(reference: string): Promise<Transaction | undefined>;
  
  // Platform settings
  getPlatformSettings(): Promise<PlatformSettings>;
  updatePlatformSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings>;
  
  // Cart operations
  addToCart(userId: string, productId: string, quantity: number): Promise<Cart>;
  getCart(userId: string): Promise<Cart[]>;
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
  
  // Analytics
  getAnalytics(userId?: string, role?: string): Promise<any>;
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
  async addToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    const existing = await db.select().from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(cart)
        .set({ quantity: existing[0].quantity + quantity, updatedAt: new Date() })
        .where(eq(cart.id, existing[0].id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(cart).values({ userId, productId, quantity }).returning();
    return newItem;
  }

  async getCart(userId: string): Promise<Cart[]> {
    return db.select().from(cart).where(eq(cart.userId, userId)).orderBy(desc(cart.createdAt));
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
}

export const storage = new DbStorage();
