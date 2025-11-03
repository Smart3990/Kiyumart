import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "fr" | "es";
export type Currency = "GHS" | "EUR" | "USD";

interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
  currency: Currency;
}

export const languages: Record<Language, LanguageConfig> = {
  en: { code: "en", name: "English", flag: "🇬🇧", currency: "GHS" },
  fr: { code: "fr", name: "Français", flag: "🇫🇷", currency: "EUR" },
  es: { code: "es", name: "Español", flag: "🇪🇸", currency: "USD" },
};

export const translations = {
  en: {
    home: "Home",
    products: "Products",
    cart: "Cart",
    profile: "Profile",
    notifications: "Notifications",
    search: "Search products...",
    shopByCategory: "Shop by Category",
    featuredProducts: "Featured Products",
    viewAll: "View All",
    addToCart: "Add to Cart",
    products_count: "Products",
    newSeasonCollection: "New Season Collection",
    discoverLatest: "Discover the latest trends in fashion. Shop premium quality at unbeatable prices.",
    shopNow: "Shop Now",
    upTo50Off: "Up to 50% Off",
    limitedOffer: "Limited time offer on selected items. Don't miss out!",
    viewDeals: "View Deals",
  },
  fr: {
    home: "Accueil",
    products: "Produits",
    cart: "Panier",
    profile: "Profil",
    notifications: "Notifications",
    search: "Rechercher des produits...",
    shopByCategory: "Acheter par catégorie",
    featuredProducts: "Produits en vedette",
    viewAll: "Voir tout",
    addToCart: "Ajouter au panier",
    products_count: "Produits",
    newSeasonCollection: "Collection Nouvelle Saison",
    discoverLatest: "Découvrez les dernières tendances de la mode. Achetez une qualité premium à des prix imbattables.",
    shopNow: "Acheter maintenant",
    upTo50Off: "Jusqu'à 50% de réduction",
    limitedOffer: "Offre à durée limitée sur une sélection d'articles. Ne manquez pas!",
    viewDeals: "Voir les offres",
  },
  es: {
    home: "Inicio",
    products: "Productos",
    cart: "Carrito",
    profile: "Perfil",
    notifications: "Notificaciones",
    search: "Buscar productos...",
    shopByCategory: "Comprar por categoría",
    featuredProducts: "Productos destacados",
    viewAll: "Ver todo",
    addToCart: "Añadir al carrito",
    products_count: "Productos",
    newSeasonCollection: "Colección de Nueva Temporada",
    discoverLatest: "Descubre las últimas tendencias en moda. Compra calidad premium a precios inmejorables.",
    shopNow: "Comprar ahora",
    upTo50Off: "Hasta 50% de descuento",
    limitedOffer: "Oferta por tiempo limitado en artículos seleccionados. ¡No te lo pierdas!",
    viewDeals: "Ver ofertas",
  },
};

interface LanguageContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  const currency = languages[language].currency;

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, currency, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
