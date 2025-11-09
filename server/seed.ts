import { db } from "../db/index";
import {
  users,
  products,
  stores,
  categories,
  orders,
  reviews,
  heroBanners,
  footerPages,
  deliveryZones,
  orderItems,
  chatMessages,
  notifications,
  cart,
  transactions,
  adminPermissions,
  passwordResetTokens,
  supportConversations,
  supportMessages,
  deliveryAssignments,
  mediaLibrary,
  wishlists,
  commissions,
  sellerPayouts
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

const STORE_TYPES = [
  "clothing",
  "electronics",
  "beauty_cosmetics",
  "home_garden",
  "sports_fitness",
  "books_media",
  "toys_games",
  "food_beverages",
  "health_wellness",
  "automotive"
] as const;

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log("🌱 Starting comprehensive seed...");

  try {
    console.log("🧹 Clearing existing data...");
    await db.delete(supportMessages);
    await db.delete(supportConversations);
    await db.delete(deliveryAssignments);
    await db.delete(mediaLibrary);
    await db.delete(wishlists);
    await db.delete(sellerPayouts);
    await db.delete(commissions);
    await db.delete(chatMessages);
    await db.delete(notifications);
    await db.delete(cart);
    await db.delete(transactions);
    await db.delete(orderItems);
    await db.delete(reviews);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(stores);
    await db.delete(adminPermissions);
    await db.delete(passwordResetTokens);
    await db.delete(categories);
    await db.delete(heroBanners);
    await db.delete(footerPages);
    await db.delete(deliveryZones);
    await db.delete(users);

    console.log("👥 Seeding users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const [superAdmin] = await db.insert(users).values({
      email: "superadmin@kiyumart.com",
      password: hashedPassword,
      name: "Super Admin",
      role: "super_admin",
      isApproved: true
    }).returning();

    const [admin1] = await db.insert(users).values({
      email: "admin1@kiyumart.com",
      password: hashedPassword,
      name: "Admin One",
      role: "admin",
      isApproved: true
    }).returning();

    const [admin2] = await db.insert(users).values({
      email: "admin2@kiyumart.com",
      password: hashedPassword,
      name: "Admin Two",
      role: "admin",
      isApproved: true
    }).returning();

    const sellers: typeof users.$inferSelect[] = [];
    for (let i = 0; i < STORE_TYPES.length; i++) {
      const storeType = STORE_TYPES[i];
      const [seller] = await db.insert(users).values({
        email: `seller.${storeType}@kiyumart.com`,
        password: hashedPassword,
        name: `${storeType.charAt(0).toUpperCase() + storeType.slice(1)} Seller`,
        role: "seller",
        phone: `+233${2400000000 + i}`,
        storeType,
        storeName: `${storeType.charAt(0).toUpperCase() + storeType.slice(1).replace('_', ' ')} Store`,
        businessAddress: `${i + 1} Market Street, Accra, Ghana`,
        isApproved: true,
        profileImage: `https://res.cloudinary.com/demo/image/upload/sample.jpg`
      }).returning();
      sellers.push(seller);
    }

    const riders: typeof users.$inferSelect[] = [];
    for (let i = 0; i < 5; i++) {
      const [rider] = await db.insert(users).values({
        email: `rider${i + 1}@kiyumart.com`,
        password: hashedPassword,
        name: `Rider ${i + 1}`,
        role: "rider",
        phone: `+233${2500000000 + i}`,
        vehicleInfo: { type: i % 2 === 0 ? "motorcycle" : "bicycle", plateNumber: `GH-${1000 + i}` },
        isApproved: true,
        profileImage: `https://res.cloudinary.com/demo/image/upload/sample.jpg`
      }).returning();
      riders.push(rider);
    }

    const buyers: typeof users.$inferSelect[] = [];
    for (let i = 0; i < 20; i++) {
      const [buyer] = await db.insert(users).values({
        email: `buyer${i + 1}@kiyumart.com`,
        password: hashedPassword,
        name: `Customer ${i + 1}`,
        role: "buyer",
        phone: `+233${2600000000 + i}`
      }).returning();
      buyers.push(buyer);
    }

    console.log(`✅ Created ${1 + 2 + sellers.length + riders.length + buyers.length} users`);

    console.log("📦 Seeding delivery zones...");
    const zones = ["Accra Central", "Kumasi", "Takoradi", "Tamale", "Cape Coast"];
    const zoneRecords: typeof deliveryZones.$inferSelect[] = [];
    for (let i = 0; i < zones.length; i++) {
      const [zone] = await db.insert(deliveryZones).values({
        name: zones[i],
        fee: String(10 + (i * 5)),
        isActive: true
      }).returning();
      zoneRecords.push(zone);
    }

    console.log("🏪 Seeding stores...");
    const storesData: typeof stores.$inferSelect[] = [];
    for (const seller of sellers) {
      const [store] = await db.insert(stores).values({
        name: seller.storeName!,
        description: `Premium ${seller.storeType} products for modest fashion enthusiasts`,
        primarySellerId: seller.id,
        storeType: seller.storeType!,
        isActive: true,
        logo: seller.profileImage
      }).returning();
      storesData.push(store);
    }

    console.log("📑 Seeding simplified categories (5 per store type)...");
    const categoryMapping: Record<string, string[]> = {
      clothing: ["Hijabs & Scarves", "Abayas & Jilbabs", "Modest Dresses", "Islamic Accessories", "Modest Footwear"],
      electronics: ["Smartphones", "Laptops & Tablets", "Accessories", "Smart Home", "Audio & Gaming"],
      beauty_cosmetics: ["Halal Skincare", "Halal Makeup", "Haircare", "Fragrances", "Beauty Tools"],
      home_garden: ["Furniture", "Decor", "Kitchen", "Garden", "Storage"],
      sports_fitness: ["Modest Sportswear", "Fitness Equipment", "Outdoor Gear", "Yoga & Meditation", "Sports Accessories"],
      books_media: ["Islamic Books", "Children's Books", "Educational", "Arabic Literature", "Self-Help"],
      toys_games: ["Educational Toys", "Dolls & Figures", "Games", "Arts & Crafts", "Outdoor Toys"],
      food_beverages: ["Halal Snacks", "Dates & Honey", "Spices", "Halal Meat", "Beverages"],
      health_wellness: ["Vitamins", "First Aid", "Personal Care", "Wellness", "Medical Devices"],
      automotive: ["Car Accessories", "Tools", "Care Products", "Electronics", "Safety"]
    };

    const allCategories: typeof categories.$inferSelect[] = [];
    for (const [storeType, cats] of Object.entries(categoryMapping)) {
      for (const catName of cats) {
        const [cat] = await db.insert(categories).values({
          name: catName,
          slug: generateSlug(catName),
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
          description: `${catName} for ${storeType}`,
          storeTypes: [storeType],
          isActive: true
        }).returning();
        allCategories.push(cat);
      }
    }

    console.log(`✅ Created ${allCategories.length} categories (5 per store type)`);

    console.log("🛍️ Seeding products with 4K images...");
    
    const clothingSeller = sellers.find(s => s.storeType === "clothing")!;
    const clothingStore = storesData.find(s => s.primarySellerId === clothingSeller.id)!;
    const clothingCats = allCategories.filter(c => c.storeTypes?.includes("clothing"));
    
    const clothingProducts = [
      {
        name: "Premium Silk Hijab - Black",
        description: "Luxurious premium silk hijab with soft texture and elegant drape. Perfect for all occasions.",
        price: "89.99",
        images: [
          "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=3840&q=90",
          "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=3840&q=90",
          "https://images.unsplash.com/photo-1544957992-20514f595d6f?w=3840&q=90",
          "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=3840&q=90",
          "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=3840&q=90"
        ],
        video: "https://res.cloudinary.com/demo/video/upload/v1/product_demo.mp4"
      },
      {
        name: "Elegant Black Abaya with Embroidery",
        description: "Beautiful black abaya featuring delicate hand embroidery, flowing fabric, and modest design.",
        price: "149.99",
        images: [
          "https://images.unsplash.com/photo-1564694098663-5b51c23e43d2?w=3840&q=90",
          "https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=3840&q=90",
          "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=3840&q=90",
          "https://images.unsplash.com/photo-1566206091558-7e1a19fd5a7a?w=3840&q=90",
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=3840&q=90"
        ],
        video: "https://res.cloudinary.com/demo/video/upload/v1/abaya_demo.mp4"
      },
      {
        name: "Modest Maxi Dress - Navy Blue",
        description: "Comfortable and stylish maxi dress with long sleeves and flowing silhouette.",
        price: "129.99",
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=3840&q=90",
          "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=3840&q=90",
          "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=3840&q=90",
          "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=3840&q=90",
          "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=3840&q=90"
        ],
        video: "https://res.cloudinary.com/demo/video/upload/v1/dress_demo.mp4"
      }
    ];

    for (const prod of clothingProducts) {
      const randomCat = clothingCats[Math.floor(Math.random() * clothingCats.length)];
      await db.insert(products).values({
        name: prod.name,
        description: prod.description,
        price: prod.price,
        images: prod.images,
        video: prod.video,
        sellerId: clothingSeller.id,
        storeId: clothingStore.id,
        categoryId: randomCat.id,
        stock: Math.floor(Math.random() * 100) + 20,
        isActive: true
      });
    }

    console.log(`✅ Created ${clothingProducts.length} products with 4K images`);

    console.log("🎨 Seeding hero banners...");
    await db.insert(heroBanners).values([
      {
        title: "New Modest Fashion Collection",
        subtitle: "Discover elegant hijabs and abayas",
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=3840&q=90",
        ctaLink: "/products",
        displayOrder: 1,
        isActive: true
      },
      {
        title: "Premium Electronics Sale",
        subtitle: "Up to 30% off latest gadgets",
        image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=3840&q=90",
        ctaLink: "/products",
        displayOrder: 2,
        isActive: true
      }
    ]);

    console.log("📄 Seeding footer pages...");
    await db.insert(footerPages).values([
      {
        title: "About Us",
        slug: "about",
        content: `# About KiyuMart\n\nGhana's premier marketplace for modest Islamic women's fashion.`,
        isActive: true,
        displayOrder: 1
      },
      {
        title: "Privacy Policy",
        slug: "privacy",
        content: `# Privacy Policy\n\nYour privacy is important to us.`,
        isActive: true,
        displayOrder: 2
      }
    ]);

    console.log("\n✨ Seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   👤 Users: ${1 + 2 + sellers.length + riders.length + buyers.length}`);
    console.log(`      - 1 Super Admin (superadmin@kiyumart.com)`);
    console.log(`      - 2 Admins (admin1@, admin2@)`);
    console.log(`      - ${sellers.length} Sellers (seller.[storetype]@)`);
    console.log(`      - ${riders.length} Riders (rider1-5@)`);
    console.log(`      - ${buyers.length} Buyers (buyer1-20@)`);
    console.log(`   🏪 Stores: ${storesData.length}`);
    console.log(`   📑 Categories: ${allCategories.length} (5 per store type)`);
    console.log(`   🛍️  Products: ${clothingProducts.length}`);
    console.log(`   🎨 Hero Banners: 2`);
    console.log(`   📄 Footer Pages: 2`);
    console.log(`   🚚 Delivery Zones: ${zones.length}`);
    console.log(`\n🔑 All passwords: password123`);
    console.log(`\n🌐 Try logging in:`);
    console.log(`   - superadmin@kiyumart.com`);
    console.log(`   - seller.clothing@kiyumart.com`);
    console.log(`   - buyer1@kiyumart.com`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\n✅ Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
