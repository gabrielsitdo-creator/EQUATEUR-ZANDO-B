export type UserRole = 'CLIENT' | 'COMMERÇANT' | 'ADMINISTRATEUR';

export interface User {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  role: UserRole;
  city: string;
  zone?: string;
  address?: string;
  createdAt: string;
  avatarUrl?: string;
  shopId?: string; // For COMMERÇANT
  hasActiveSubscription?: boolean; // For COMMERÇANT ($4/month promo)
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description?: string;
  productCount?: number;
}

export interface City {
  id: string;
  name: string;
  province?: string;
  territory?: string;
}

export interface Market {
  id: string;
  name: string;
  city: string;
  address?: string;
  shopCount?: number;
  cityName?: string;
  territory?: string;
  zone?: string;
  description?: string;
}

export interface Zone {
  id: string;
  name: string;
  cityId: string;
}

export interface Shop {
  id: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp?: string;
  ownerEmail?: string;
  name: string;
  description: string;
  category: string;
  city: string; // Free text entered manually (e.g. Karawa, Mbandaka, Kinshasa...)
  quartier?: string;
  territory?: string;
  address?: string; // Free text (e.g. Marché central de Karawa, stand 15)
  marketName?: string;
  standNumber?: string;
  logoUrl: string;
  bannerUrl: string;
  isVerified: boolean;
  isApproved: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  totalSalesFc?: number;
}

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  description: string;
  price: number; // in FC
  oldPrice?: number; // in FC
  discountPercent?: number;
  stock: number;
  category: string;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  city: string; // City of the shop (free text)
  address?: string;
  rating: number;
  reviewCount: number;
  isPromoted?: boolean; // 🔥 Produit promotionnel
  promoStartDate?: string;
  promoEndDate?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'mpesa' | 'airtel' | 'orange' | 'cash_on_delivery';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';

export type DeliveryType = 'home_delivery' | 'market_pickup';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  shopId: string;
  shopName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientWhatsapp?: string;
  clientEmail?: string;
  items: OrderItem[];
  subtotal: number; // in FC
  deliveryFee: number; // in FC (convenu ou gratuit)
  totalAmount: number; // in FC
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryAddress: {
    city: string;
    quartier?: string;
    streetDetails: string;
    recipientName: string;
    recipientPhone: string;
    recipientWhatsapp?: string;
    deliveryInstructions?: string;
    marketName?: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionRef?: string;
  isTestPayment: boolean;
  commissionTotal: number; // in FC (5%)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  orderId: string;
  orderNumber: string;
  shopId: string;
  shopName: string;
  orderAmount: number;
  ratePercent: number; // e.g., 5%
  commissionAmount: number; // in FC
  merchantAmount: number; // in FC
  status: 'pending' | 'collected' | 'paid_out';
  createdAt: string;
}

export interface Review {
  id: string;
  shopId: string;
  shopName: string;
  orderId?: string;
  clientId: string;
  clientName: string;
  rating: number; // 1 to 5
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export type SubscriptionStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'active';

export interface MerchantSubscription {
  id: string;
  userId: string;
  userName?: string;
  userPhone: string;
  shopName?: string;
  shopId?: string;
  amountUsd: number; // 4 $
  amountFc: number; // e.g. 11 000 FC (~4 USD)
  currency?: 'USD' | 'FC';
  durationMonths: number; // 1 mois ou 3 mois
  status: SubscriptionStatus;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId?: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  reason:
    | 'produit_non_conforme'
    | 'produit_frauduleux'
    | 'probleme_commande'
    | 'probleme_commercant'
    | 'prix_incorrect'
    | 'autre';
  targetType: 'produit' | 'boutique' | 'commande' | 'autre';
  targetId?: string;
  targetName?: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'subscription' | 'shop' | 'system' | 'promotion' | 'report';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface PlatformSettings {
  commissionRate: number; // 5%
  defaultCurrency: string; // 'FC'
  platformName: string;
  supportPhone: string; // +243 833358006
  supportWhatsapp: string; // +243 833358006
  supportEmail: string; // sitdoworldinformatique@gmail.com
  subscriptionPriceUsd: number; // 4
  subscriptionPriceFc: number; // 11000
  subscriptionPromoDurationMonths: number; // 3
  testPaymentMode: boolean;
  heroBannerImage?: string; // Miniature du marché / background du Hero
  marketLogoUrl?: string; // Logo du marché EQUATEUR ZANDO MARKET
  mobileMoneyAccounts?: {
    mpesaNumber: string;
    airtelNumber: string;
    orangeNumber: string;
    accountName: string;
  };
}
