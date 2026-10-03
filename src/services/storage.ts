import {
  User,
  Shop,
  Product,
  Category,
  City,
  Market,
  Order,
  Review,
  Commission,
  MerchantSubscription,
  Report,
  Notification,
  PlatformSettings,
  UserRole,
  PaymentMethod,
  DeliveryType,
  OrderItem,
  OrderStatus,
  SubscriptionStatus,
} from '../types';

import {
  demoUsers,
  demoShops,
  demoProducts,
  initialCategories,
  initialCities,
  initialMarkets,
  demoOrders,
  demoSubscriptions,
  demoReports,
  demoReviews,
  demoCommissions,
  demoNotifications,
  defaultSettings,
} from './mockData';

const DB_KEYS = {
  USERS: 'ezm_users',
  SHOPS: 'ezm_shops',
  PRODUCTS: 'ezm_products',
  CATEGORIES: 'ezm_categories',
  CITIES: 'ezm_cities',
  MARKETS: 'ezm_markets',
  ORDERS: 'ezm_orders',
  SUBSCRIPTIONS: 'ezm_subscriptions',
  REPORTS: 'ezm_reports',
  REVIEWS: 'ezm_reviews',
  COMMISSIONS: 'ezm_commissions',
  NOTIFICATIONS: 'ezm_notifications',
  SETTINGS: 'ezm_settings',
  CURRENT_USER: 'ezm_current_user',
  FAVORITES: 'ezm_favorites',
};

function getStorageItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

function setStorageItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('ezm_storage_change'));
  } catch (err) {
    console.error(`Error setting ${key} in storage:`, err);
  }
}

export class DataStore {
  static init() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      this.resetToDefaults();
    }
  }

  static resetToDefaults() {
    setStorageItem(DB_KEYS.USERS, demoUsers);
    setStorageItem(DB_KEYS.SHOPS, demoShops);
    setStorageItem(DB_KEYS.PRODUCTS, demoProducts);
    setStorageItem(DB_KEYS.CATEGORIES, initialCategories);
    setStorageItem(DB_KEYS.ORDERS, demoOrders);
    setStorageItem(DB_KEYS.SUBSCRIPTIONS, demoSubscriptions);
    setStorageItem(DB_KEYS.REPORTS, demoReports);
    setStorageItem(DB_KEYS.REVIEWS, demoReviews);
    setStorageItem(DB_KEYS.COMMISSIONS, demoCommissions);
    setStorageItem(DB_KEYS.NOTIFICATIONS, demoNotifications);
    setStorageItem(DB_KEYS.SETTINGS, defaultSettings);
    setStorageItem(DB_KEYS.CURRENT_USER, demoUsers[0]); // Client
    setStorageItem(DB_KEYS.FAVORITES, ['prod-1', 'prod-5', 'prod-10']);
  }

  // --- SETTINGS ---
  static getSettings(): PlatformSettings {
    const s = getStorageItem<PlatformSettings>(DB_KEYS.SETTINGS, defaultSettings);
    return {
      ...defaultSettings,
      ...s,
      mobileMoneyAccounts: {
        mpesaNumber: s.mobileMoneyAccounts?.mpesaNumber || defaultSettings.mobileMoneyAccounts?.mpesaNumber || '+243 820 000 000',
        airtelNumber: s.mobileMoneyAccounts?.airtelNumber || defaultSettings.mobileMoneyAccounts?.airtelNumber || '+243 990 000 000',
        orangeNumber: s.mobileMoneyAccounts?.orangeNumber || defaultSettings.mobileMoneyAccounts?.orangeNumber || '+243 890 000 000',
        accountName: s.mobileMoneyAccounts?.accountName || defaultSettings.mobileMoneyAccounts?.accountName || 'EQUATEUR ZANDO SARL',
      },
      heroBannerImage: s.heroBannerImage || defaultSettings.heroBannerImage,
      marketLogoUrl: s.marketLogoUrl || defaultSettings.marketLogoUrl,
    };
  }

  static getHeroBanner(): string {
    return this.getSettings().heroBannerImage || defaultSettings.heroBannerImage || '/images/Supermarché moderne aux rayons colorés.jpg';
  }

  static getMarketLogo(): string {
    return this.getSettings().marketLogoUrl || defaultSettings.marketLogoUrl || '/images/Design Concepts Author Portfolio _ Freepik.jpg';
  }

  static updateSettings(partial: Partial<PlatformSettings>): PlatformSettings {
    const current = this.getSettings();
    const updated: PlatformSettings = {
      ...current,
      ...partial,
      mobileMoneyAccounts: {
        ...current.mobileMoneyAccounts,
        ...(partial.mobileMoneyAccounts || {}),
      } as any,
    };
    setStorageItem(DB_KEYS.SETTINGS, updated);
    return updated;
  }

  // --- USERS & AUTH ---
  static getUsers(): User[] {
    return getStorageItem<User[]>(DB_KEYS.USERS, demoUsers);
  }

  static getCurrentUser(): User | null {
    return getStorageItem<User | null>(DB_KEYS.CURRENT_USER, demoUsers[0]);
  }

  static setCurrentUser(user: User | null): void {
    setStorageItem(DB_KEYS.CURRENT_USER, user);
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static registerClient(data: {
    name: string;
    phone: string;
    email?: string;
    city: string;
    address?: string;
  }): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-client-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: 'CLIENT',
      city: data.city || 'Karawa',
      address: data.address,
      createdAt: new Date().toISOString(),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };
    users.push(newUser);
    setStorageItem(DB_KEYS.USERS, users);
    this.setCurrentUser(newUser);

    this.addNotification({
      userId: newUser.id,
      title: 'Bienvenue sur EQUATEUR ZANDO MARKET !',
      message: 'Votre compte client est prêt. Découvrez tous les produits disponibles en RDC.',
      type: 'system',
      linkUrl: '/',
    });

    return newUser;
  }

  // --- SUBSCRIPTIONS (4 $ / MOIS) ---
  static getSubscriptions(): MerchantSubscription[] {
    return getStorageItem<MerchantSubscription[]>(DB_KEYS.SUBSCRIPTIONS, demoSubscriptions);
  }

  static getSubscriptionById(id: string): MerchantSubscription | undefined {
    return this.getSubscriptions().find((s) => s.id === id);
  }

  static hasActivePaidSubscription(userId: string): boolean {
    const subs = this.getSubscriptions();
    const user = this.getUserById(userId);
    const active = subs.find(
      (s) =>
        s.userId === userId &&
        (s.status === 'PAID' || (s.status as any) === 'active') &&
        new Date(s.endDate) >= new Date()
    );
    if (active) return true;
    return !!(user?.hasActiveSubscription);
  }

  static hasActiveSubscription(userId: string): boolean {
    return this.hasActivePaidSubscription(userId);
  }

  static initiateSubscriptionPayment(params: {
    userId: string;
    userName?: string;
    phone: string;
    shopName?: string;
    paymentMethod: PaymentMethod;
    currency?: 'USD' | 'FC';
  }): MerchantSubscription {
    const subs = this.getSubscriptions();
    const settings = this.getSettings();
    const timestamp = Date.now();
    const startDate = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setMonth(end.getMonth() + settings.subscriptionPromoDurationMonths);
    const endDate = end.toISOString().split('T')[0];

    const transactionRef = `EZM-${params.paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newSub: MerchantSubscription = {
      id: `sub-${timestamp}`,
      userId: params.userId,
      userName: params.userName || 'Commerçant Partenaire',
      userPhone: params.phone,
      shopName: params.shopName || 'Boutique en création',
      amountUsd: settings.subscriptionPriceUsd,
      amountFc: settings.subscriptionPriceFc,
      currency: params.currency || 'USD',
      durationMonths: settings.subscriptionPromoDurationMonths,
      status: 'PENDING',
      paymentMethod: params.paymentMethod,
      transactionRef,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
    };

    subs.unshift(newSub);
    setStorageItem(DB_KEYS.SUBSCRIPTIONS, subs);
    return newSub;
  }

  static confirmSubscriptionPayment(
    subId: string,
    transactionRef?: string
  ): MerchantSubscription | null {
    const subs = this.getSubscriptions();
    const users = this.getUsers();
    const sub = subs.find((s) => s.id === subId);
    if (!sub) return null;

    sub.status = 'PAID';
    if (transactionRef) {
      sub.transactionRef = transactionRef;
    }
    setStorageItem(DB_KEYS.SUBSCRIPTIONS, subs);

    // Update user state to active merchant
    const user = users.find((u) => u.id === sub.userId);
    if (user) {
      user.hasActiveSubscription = true;
      user.role = 'COMMERÇANT';
      setStorageItem(DB_KEYS.USERS, users);
      if (this.getCurrentUser()?.id === user.id) {
        this.setCurrentUser(user);
      }
    }

    this.addNotification({
      userId: sub.userId,
      title: 'Paiement boutique confirmé avec succès ! 🎉',
      message: `Votre abonnement boutique de 4 $/mois a été vérifié et confirmé. Vous pouvez maintenant finaliser les informations de votre boutique.`,
      type: 'subscription',
      linkUrl: '/merchant',
    });

    return sub;
  }

  static updateSubscriptionStatus(
    subId: string,
    newStatus: SubscriptionStatus
  ): MerchantSubscription | null {
    const subs = this.getSubscriptions();
    const users = this.getUsers();
    const sub = subs.find((s) => s.id === subId);
    if (!sub) return null;

    sub.status = newStatus;
    setStorageItem(DB_KEYS.SUBSCRIPTIONS, subs);

    const user = users.find((u) => u.id === sub.userId);
    if (user) {
      user.hasActiveSubscription = newStatus === 'PAID';
      setStorageItem(DB_KEYS.USERS, users);
      if (this.getCurrentUser()?.id === user.id) {
        this.setCurrentUser(user);
      }
    }

    return sub;
  }

  static subscribeMerchant(params: {
    userId: string;
    phone: string;
    paymentMethod: PaymentMethod;
  }): MerchantSubscription {
    const initiated = this.initiateSubscriptionPayment(params);
    const confirmed = this.confirmSubscriptionPayment(initiated.id);
    return confirmed || initiated;
  }

  static registerMerchantShop(data: {
    ownerName: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    shopName: string;
    category: string;
    city: string; // Free text (Karawa, Mbandaka, Kinshasa, etc.)
    quartier?: string;
    address: string; // Free text (ex: Marché central de Karawa, stand 15)
    marketName?: string;
    standNumber?: string;
    description: string;
    logoUrl?: string;
    bannerUrl?: string;
  }): { user: User; shop: Shop } {
    const users = this.getUsers();
    const shops = this.getShops();

    let currentUser = this.getCurrentUser();
    const userId = currentUser ? currentUser.id : `user-merchant-${Date.now()}`;
    const shopId = `shop-${Date.now()}`;
    const slug = data.shopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newShop: Shop = {
      id: shopId,
      slug,
      ownerId: userId,
      ownerName: data.ownerName,
      ownerPhone: data.phone,
      ownerWhatsapp: data.whatsapp || data.phone,
      ownerEmail: data.email,
      name: data.shopName,
      description: data.description,
      category: data.category,
      city: data.city.trim(),
      quartier: data.quartier,
      address: data.address.trim(),
      marketName: data.marketName,
      standNumber: data.standNumber,
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&auto=format&fit=crop&q=80',
      bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&auto=format&fit=crop&q=80',
      isVerified: false,
      isApproved: true,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      totalSalesFc: 0,
    };

    let targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      targetUser.role = 'COMMERÇANT';
      targetUser.shopId = shopId;
      targetUser.hasActiveSubscription = true;
      targetUser.city = data.city;
      targetUser.address = data.address;
    } else {
      targetUser = {
        id: userId,
        name: data.ownerName,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        email: data.email,
        role: 'COMMERÇANT',
        city: data.city,
        address: data.address,
        shopId: shopId,
        hasActiveSubscription: true,
        createdAt: new Date().toISOString(),
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      };
      users.push(targetUser);
    }

    shops.push(newShop);
    setStorageItem(DB_KEYS.USERS, users);
    setStorageItem(DB_KEYS.SHOPS, shops);
    this.setCurrentUser(targetUser);

    this.addNotification({
      userId: targetUser.id,
      title: 'Boutique créée avec succès !',
      message: `Votre boutique "${newShop.name}" à ${newShop.city} est maintenant en ligne. Vous pouvez publier vos produits.`,
      type: 'shop',
      linkUrl: '/merchant',
    });

    return { user: targetUser, shop: newShop };
  }

  static switchUserByRole(role: UserRole): User {
    const users = this.getUsers();
    let target = users.find((u) => u.role === role);
    if (!target) {
      target = demoUsers.find((u) => u.role === role) || demoUsers[0];
    }
    this.setCurrentUser(target);
    return target;
  }

  // --- SHOPS ---
  static getShops(): Shop[] {
    return getStorageItem<Shop[]>(DB_KEYS.SHOPS, demoShops);
  }

  static getShopById(id: string): Shop | undefined {
    return this.getShops().find((s) => s.id === id);
  }

  static getShopBySlug(slug: string): Shop | undefined {
    return this.getShops().find((s) => s.slug === slug || s.id === slug);
  }

  static updateShop(shopId: string, partial: Partial<Shop>): Shop | null {
    const shops = this.getShops();
    const idx = shops.findIndex((s) => s.id === shopId);
    if (idx === -1) return null;
    shops[idx] = { ...shops[idx], ...partial };
    setStorageItem(DB_KEYS.SHOPS, shops);
    return shops[idx];
  }

  static toggleShopVerified(shopId: string): boolean {
    const shops = this.getShops();
    const shop = shops.find((s) => s.id === shopId);
    if (shop) {
      shop.isVerified = !shop.isVerified;
      setStorageItem(DB_KEYS.SHOPS, shops);
      return shop.isVerified;
    }
    return false;
  }

  static toggleShopApproval(shopId: string): boolean {
    const shops = this.getShops();
    const shop = shops.find((s) => s.id === shopId);
    if (shop) {
      shop.isApproved = !shop.isApproved;
      setStorageItem(DB_KEYS.SHOPS, shops);
      return shop.isApproved;
    }
    return false;
  }

  // --- PRODUCTS ---
  static getProducts(): Product[] {
    return getStorageItem<Product[]>(DB_KEYS.PRODUCTS, demoProducts);
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  static getProductsByShop(shopId: string): Product[] {
    return this.getProducts().filter((p) => p.shopId === shopId);
  }

  /**
   * Returns actively promoted products whose promotion end date is either not set or >= today
   */
  static getPromotedProducts(): Product[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getProducts().filter((p) => {
      if (p.status !== 'active') return false;
      if (!p.isPromoted) return false;
      if (p.promoEndDate && p.promoEndDate < today) {
        return false; // automatically expired
      }
      return true;
    });
  }

  static addProduct(
    productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'createdAt'>
  ): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    setStorageItem(DB_KEYS.PRODUCTS, products);
    return newProduct;
  }

  static updateProduct(productId: string, partial: Partial<Product>): Product | null {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...partial };
    setStorageItem(DB_KEYS.PRODUCTS, products);
    return products[idx];
  }

  static deleteProduct(productId: string): boolean {
    let products = this.getProducts();
    const before = products.length;
    products = products.filter((p) => p.id !== productId);
    if (products.length !== before) {
      setStorageItem(DB_KEYS.PRODUCTS, products);
      return true;
    }
    return false;
  }

  // --- CATEGORIES ---
  static getCategories(): Category[] {
    return getStorageItem<Category[]>(DB_KEYS.CATEGORIES, initialCategories);
  }

  static addCategory(category: Omit<Category, 'id' | 'productCount'>): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    categories.push(newCat);
    setStorageItem(DB_KEYS.CATEGORIES, categories);
    return newCat;
  }

  static updateCategory(id: string, partial: Partial<Category>): Category | null {
    const categories = this.getCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    categories[idx] = { ...categories[idx], ...partial };
    setStorageItem(DB_KEYS.CATEGORIES, categories);
    return categories[idx];
  }

  static deleteCategory(id: string): boolean {
    let categories = this.getCategories();
    const before = categories.length;
    categories = categories.filter((c) => c.id !== id);
    if (categories.length !== before) {
      setStorageItem(DB_KEYS.CATEGORIES, categories);
      return true;
    }
    return false;
  }

  // --- CITIES & MARKETS ---
  static getCities(): City[] {
    return getStorageItem<City[]>(DB_KEYS.CITIES, initialCities);
  }

  static getMarkets(): Market[] {
    return getStorageItem<Market[]>(DB_KEYS.MARKETS, initialMarkets);
  }

  // --- DYNAMIC SEARCH ENGINE ---
  /**
   * Central search matching products and shops dynamically.
   * Supports:
   * 1. Search by product (e.g. "chaussures")
   * 2. Search by city (e.g. "Karawa") -> returns shops in Karawa + products in Karawa
   * 3. Combined City + Product (e.g. "chaussures Karawa") -> returns products matching "chaussures" located in Karawa!
   * 4. Search by boutique name
   */
  static searchAll(rawQuery: string): {
    matchedProducts: Product[];
    matchedShops: Shop[];
    detectedCity?: string;
    detectedKeyword?: string;
  } {
    const query = rawQuery.trim().toLowerCase();
    const allProducts = this.getProducts().filter((p) => p.status === 'active');
    const allShops = this.getShops().filter((s) => s.isApproved);

    if (!query) {
      return { matchedProducts: allProducts, matchedShops: allShops };
    }

    const words = query.split(/\s+/).filter(Boolean);

    // Detect if any word matches a shop's city
    let detectedCity: string | undefined;
    let otherWords: string[] = [];

    for (const w of words) {
      const matchCity = allShops.some((s) => s.city.toLowerCase() === w || s.city.toLowerCase().includes(w));
      if (matchCity && !detectedCity) {
        detectedCity = w;
      } else {
        otherWords.push(w);
      }
    }

    const keyword = otherWords.join(' ').trim();

    // 1. Matched Shops: match by name, city, address, description
    const matchedShops = allShops.filter((s) => {
      const cityName = s.city.toLowerCase();
      const shopName = s.name.toLowerCase();
      const address = (s.address || '').toLowerCase();

      if (detectedCity && (cityName === detectedCity || cityName.includes(detectedCity))) {
        if (!keyword) return true;
        return shopName.includes(keyword) || address.includes(keyword);
      }

      return (
        shopName.includes(query) ||
        cityName.includes(query) ||
        address.includes(query) ||
        s.category.toLowerCase().includes(query)
      );
    });

    // 2. Matched Products:
    const matchedProducts = allProducts.filter((p) => {
      const prodName = p.name.toLowerCase();
      const prodDesc = p.description.toLowerCase();
      const prodCat = p.category.toLowerCase();
      const prodCity = p.city.toLowerCase();
      const shopName = p.shopName.toLowerCase();

      // Combined search (e.g. "chaussures Karawa")
      if (detectedCity) {
        const cityMatch = prodCity === detectedCity || prodCity.includes(detectedCity);
        if (!keyword) {
          // User just searched city (e.g. "Karawa") -> products in that city
          return cityMatch;
        }
        // Match keyword in product AND product is in detected city
        const kwMatch =
          prodName.includes(keyword) ||
          prodDesc.includes(keyword) ||
          prodCat.includes(keyword) ||
          shopName.includes(keyword);
        return cityMatch && kwMatch;
      }

      // Standard query matching
      return (
        prodName.includes(query) ||
        prodDesc.includes(query) ||
        prodCat.includes(query) ||
        prodCity.includes(query) ||
        shopName.includes(query)
      );
    });

    return {
      matchedProducts,
      matchedShops,
      detectedCity,
      detectedKeyword: keyword || undefined,
    };
  }

  // --- ORDERS ---
  static getOrders(): Order[] {
    return getStorageItem<Order[]>(DB_KEYS.ORDERS, demoOrders);
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderNumber === id);
  }

  static getOrdersByClient(clientId: string): Order[] {
    return this.getOrders().filter((o) => o.clientId === clientId);
  }

  static getOrdersByShop(shopId: string): Order[] {
    return this.getOrders().filter((o) => o.items.some((item) => item.shopId === shopId));
  }

  static createOrder(params: {
    clientId: string;
    clientName: string;
    clientPhone: string;
    clientWhatsapp?: string;
    clientEmail?: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    deliveryType: DeliveryType;
    deliveryAddress: {
      city: string;
      quartier?: string;
      streetDetails: string;
      recipientName: string;
      recipientPhone: string;
      recipientWhatsapp?: string;
      deliveryInstructions?: string;
    };
    paymentMethod: PaymentMethod;
    notes?: string;
  }): { order: Order; commission: Commission } {
    const orders = this.getOrders();
    const settings = this.getSettings();
    const commissions = this.getCommissions();

    const timestamp = Date.now();
    const orderNumber = `EZM-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const orderId = `ord-${timestamp}`;

    let paymentTransactionRef = '';
    if (params.paymentMethod === 'mpesa') {
      paymentTransactionRef = `MPESA-TEST-TX${Math.floor(10000 + Math.random() * 90000)}`;
    } else if (params.paymentMethod === 'airtel') {
      paymentTransactionRef = `AIRTEL-TEST-${Math.floor(10000 + Math.random() * 90000)}`;
    } else if (params.paymentMethod === 'orange') {
      paymentTransactionRef = `ORANGE-TEST-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const commissionRate = settings.commissionRate || 5;
    const commissionTotal = Math.round((params.subtotal * commissionRate) / 100);

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      clientId: params.clientId,
      clientName: params.clientName,
      clientPhone: params.clientPhone,
      clientWhatsapp: params.clientWhatsapp || params.clientPhone,
      clientEmail: params.clientEmail,
      items: params.items,
      subtotal: params.subtotal,
      deliveryFee: params.deliveryFee,
      totalAmount: params.totalAmount,
      status: 'confirmed', // Commerçant receives confirmed order to organize delivery
      deliveryType: params.deliveryType,
      deliveryAddress: params.deliveryAddress,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      paymentTransactionRef,
      isTestPayment: true,
      commissionTotal,
      notes: params.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    setStorageItem(DB_KEYS.ORDERS, orders);

    // Update stock and shop sales
    const products = this.getProducts();
    const shops = this.getShops();

    params.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (prod.stock === 0) {
          prod.status = 'out_of_stock';
        }
      }
      const shop = shops.find((s) => s.id === item.shopId);
      if (shop) {
        shop.totalSalesFc = (shop.totalSalesFc || 0) + item.totalPrice;
      }
    });
    setStorageItem(DB_KEYS.PRODUCTS, products);
    setStorageItem(DB_KEYS.SHOPS, shops);

    // Record Commission (5%)
    const firstShop = params.items[0];
    const newCommission: Commission = {
      id: `com-${timestamp}`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      shopId: firstShop?.shopId || 'multiple',
      shopName: firstShop?.shopName || 'Boutiques Équateur Zando',
      orderAmount: params.subtotal,
      ratePercent: commissionRate,
      commissionAmount: commissionTotal,
      merchantAmount: params.subtotal - commissionTotal,
      status: newOrder.paymentStatus === 'paid' ? 'collected' : 'pending',
      createdAt: new Date().toISOString(),
    };
    commissions.unshift(newCommission);
    setStorageItem(DB_KEYS.COMMISSIONS, commissions);

    // Notify client
    this.addNotification({
      userId: params.clientId,
      title: 'Commande validée ! 📦',
      message: `Votre commande ${orderNumber} de ${params.totalAmount.toLocaleString()} FC est bien enregistrée. Le commerçant prépare votre livraison.`,
      type: 'order',
      linkUrl: `/orders/${newOrder.id}`,
    });

    // Notify merchant
    const merchantUser = this.getUsers().find((u) => u.shopId === firstShop?.shopId);
    if (merchantUser) {
      this.addNotification({
        userId: merchantUser.id,
        title: 'Nouvelle commande client reçue ! 🔔',
        message: `Commande ${orderNumber} reçue. Client : ${params.clientName} (${params.clientPhone}). Organisez la livraison de votre colis.`,
        type: 'shop',
        linkUrl: '/merchant/orders',
      });
    }

    return { order: newOrder, commission: newCommission };
  }

  static updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    setStorageItem(DB_KEYS.ORDERS, orders);

    this.addNotification({
      userId: order.clientId,
      title: `Commande ${order.orderNumber} mise à jour`,
      message: `Nouveau statut : ${this.getOrderStatusLabel(status)}`,
      type: 'order',
      linkUrl: `/orders/${order.id}`,
    });

    return order;
  }

  static getOrderStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée (Reçue par le commerçant)';
      case 'processing':
        return 'En préparation en boutique';
      case 'ready':
        return 'Prêt pour livraison / retrait';
      case 'shipped':
        return 'Expédiée (Remise au moyen de livraison choisi par le commerçant)';
      case 'delivered':
        return 'Livrée / Réceptionnée par le client';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  }

  // --- COMMISSIONS ---
  static getCommissions(): Commission[] {
    return getStorageItem<Commission[]>(DB_KEYS.COMMISSIONS, demoCommissions);
  }

  // --- REVIEWS ---
  static getReviews(): Review[] {
    return getStorageItem<Review[]>(DB_KEYS.REVIEWS, demoReviews);
  }

  static getShopReviews(shopId: string): Review[] {
    return this.getReviews().filter((r) => r.shopId === shopId && r.isApproved);
  }

  static addReview(review: Omit<Review, 'id' | 'isApproved' | 'createdAt'>): Review {
    const reviews = this.getReviews();
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(newRev);
    setStorageItem(DB_KEYS.REVIEWS, reviews);
    return newRev;
  }

  // --- REPORTS (SIGNALER UN PROBLÈME) ---
  static getReports(): Report[] {
    return getStorageItem<Report[]>(DB_KEYS.REPORTS, demoReports);
  }

  static addReport(reportData: Omit<Report, 'id' | 'status' | 'createdAt'>): Report {
    const reports = this.getReports();
    const newReport: Report = {
      ...reportData,
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    setStorageItem(DB_KEYS.REPORTS, reports);
    return newReport;
  }

  static updateReportStatus(reportId: string, status: Report['status']): void {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (rep) {
      rep.status = status;
      setStorageItem(DB_KEYS.REPORTS, reports);
    }
  }

  // --- NOTIFICATIONS ---
  static getNotifications(): Notification[] {
    return getStorageItem<Notification[]>(DB_KEYS.NOTIFICATIONS, demoNotifications);
  }

  static getUserNotifications(userId: string): Notification[] {
    return this.getNotifications().filter((n) => n.userId === userId);
  }

  static addNotification(notif: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
    const notifs = this.getNotifications();
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    setStorageItem(DB_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  }

  static markNotificationRead(notifId: string): void {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === notifId);
    if (target) {
      target.isRead = true;
      setStorageItem(DB_KEYS.NOTIFICATIONS, notifs);
    }
  }

  // --- FAVORITES ---
  static getFavorites(): string[] {
    return getStorageItem<string[]>(DB_KEYS.FAVORITES, ['prod-1', 'prod-5', 'prod-10']);
  }

  static toggleFavorite(productId: string): boolean {
    const favs = this.getFavorites();
    const idx = favs.indexOf(productId);
    let isFav = false;
    if (idx > -1) {
      favs.splice(idx, 1);
    } else {
      favs.push(productId);
      isFav = true;
    }
    setStorageItem(DB_KEYS.FAVORITES, favs);
    return isFav;
  }

  // --- ADMIN STATS ---
  static getAdminStats() {
    const users = this.getUsers();
    const shops = this.getShops();
    const products = this.getProducts();
    const orders = this.getOrders();
    const commissions = this.getCommissions();
    const subscriptions = this.getSubscriptions();
    const reports = this.getReports();

    const totalSalesFc = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.subtotal, 0);

    const totalCommissionsFc = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    return {
      totalUsers: users.length,
      clientsCount: users.filter((u) => u.role === 'CLIENT').length,
      merchantsCount: users.filter((u) => u.role === 'COMMERÇANT').length,
      totalShops: shops.length,
      verifiedShops: shops.filter((s) => s.isVerified).length,
      totalProducts: products.length,
      promotedProducts: this.getPromotedProducts().length,
      totalOrders: orders.length,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
      totalReports: reports.length,
      pendingReports: reports.filter((r) => r.status === 'pending').length,
      totalSalesFc,
      totalCommissionsFc,
    };
  }
}
