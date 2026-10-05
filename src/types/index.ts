export type UserRole = 'CLIENT' | 'COMMERÇANT' | 'ADMINISTRATEUR';

// --- SYSTÈME DE 10 DEVISES - MARCHE LUMUMBA RDC ---
export type CurrencyCode =
  | 'CDF' // 🇨🇩 CDF — Franc congolais (FC) — République démocratique du Congo
  | 'USD' // 🌍 USD — Dollar américain ($) — Devise internationale
  | 'XOF' // 🌍 XOF — Franc CFA BCEAO — Afrique de l'Ouest
  | 'XAF' // 🌍 XAF — Franc CFA BEAC — Afrique centrale
  | 'ZAR' // 🇿🇦 ZAR — Rand sud-africain (R) — Afrique du Sud
  | 'NGN' // 🇳🇬 NGN — Naira nigérian (₦) — Nigeria
  | 'GHS' // 🇬🇭 GHS — Cedi ghanéen (GH₵) — Ghana
  | 'KES' // 🇰🇪 KES — Shilling kényan (KSh) — Kenya
  | 'TZS' // 🇹🇿 TZS — Shilling tanzanien (TSh) — Tanzanie
  | 'UGX'; // 🇺🇬 UGX — Shilling ougandais (USh) — Ouganda

export interface CurrencyOption {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  region: string;
  label: string;
  example: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  {
    code: 'CDF',
    name: 'Franc congolais',
    symbol: 'FC',
    flag: '🇨🇩',
    region: 'République démocratique du Congo',
    label: '🇨🇩 CDF — Franc congolais (FC)',
    example: '50 000 FC',
  },
  {
    code: 'USD',
    name: 'Dollar américain',
    symbol: '$',
    flag: '🌍',
    region: 'Devise internationale',
    label: '🌍 USD — Dollar américain ($)',
    example: '25 $',
  },
  {
    code: 'XOF',
    name: 'Franc CFA BCEAO',
    symbol: 'XOF',
    flag: '🌍',
    region: "Afrique de l'Ouest",
    label: "🌍 XOF — Franc CFA BCEAO (Afrique de l'Ouest)",
    example: '15 000 XOF',
  },
  {
    code: 'XAF',
    name: 'Franc CFA BEAC',
    symbol: 'XAF',
    flag: '🌍',
    region: 'Afrique centrale',
    label: '🌍 XAF — Franc CFA BEAC (Afrique centrale)',
    example: '15 000 XAF',
  },
  {
    code: 'ZAR',
    name: 'Rand sud-africain',
    symbol: 'R',
    flag: '🇿🇦',
    region: 'Afrique du Sud',
    label: '🇿🇦 ZAR — Rand sud-africain (R)',
    example: '500 R',
  },
  {
    code: 'NGN',
    name: 'Naira nigérian',
    symbol: '₦',
    flag: '🇳🇬',
    region: 'Nigeria',
    label: '🇳🇬 NGN — Naira nigérian (₦)',
    example: '30 000 ₦',
  },
  {
    code: 'GHS',
    name: 'Cedi ghanéen',
    symbol: 'GH₵',
    flag: '🇬🇭',
    region: 'Ghana',
    label: '🇬🇭 GHS — Cedi ghanéen (GH₵)',
    example: '200 GH₵',
  },
  {
    code: 'KES',
    name: 'Shilling kényan',
    symbol: 'KSh',
    flag: '🇰🇪',
    region: 'Kenya',
    label: '🇰🇪 KES — Shilling kényan (KSh)',
    example: '1 500 KSh',
  },
  {
    code: 'TZS',
    name: 'Shilling tanzanien',
    symbol: 'TSh',
    flag: '🇹🇿',
    region: 'Tanzanie',
    label: '🇹🇿 TZS — Shilling tanzanien (TSh)',
    example: '50 000 TSh',
  },
  {
    code: 'UGX',
    name: 'Shilling ougandais',
    symbol: 'USh',
    flag: '🇺🇬',
    region: 'Ouganda',
    label: '🇺🇬 UGX — Shilling ougandais (USh)',
    example: '100 000 USh',
  },
];

export function getCurrencySymbol(code?: CurrencyCode | string): string {
  const c = (code || 'CDF').toUpperCase();
  switch (c) {
    case 'USD':
      return '$';
    case 'XOF':
      return 'XOF';
    case 'XAF':
      return 'XAF';
    case 'ZAR':
      return 'R';
    case 'NGN':
      return '₦';
    case 'GHS':
      return 'GH₵';
    case 'KES':
      return 'KSh';
    case 'TZS':
      return 'TSh';
    case 'UGX':
      return 'USh';
    case 'CDF':
    case 'FC':
    default:
      return 'FC';
  }
}

export function formatPrice(amount: number, code?: CurrencyCode | string): string {
  const c = (code || 'CDF').toUpperCase();
  const formatted = Number(amount || 0).toLocaleString('fr-FR');
  switch (c) {
    case 'USD':
      return `${formatted} $`;
    case 'XOF':
      return `${formatted} XOF`;
    case 'XAF':
      return `${formatted} XAF`;
    case 'ZAR':
      return `${formatted} R`;
    case 'NGN':
      return `${formatted} ₦`;
    case 'GHS':
      return `${formatted} GH₵`;
    case 'KES':
      return `${formatted} KSh`;
    case 'TZS':
      return `${formatted} TSh`;
    case 'UGX':
      return `${formatted} USh`;
    case 'CDF':
    case 'FC':
    default:
      return `${formatted} FC`;
  }
}

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
  currency?: CurrencyCode; // Devise choisie par le vendeur (ex: CDF, USD, XOF, etc.)
  currency_code?: CurrencyCode;
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
  price: number; // Montant saisi dans la devise de la boutique
  oldPrice?: number;
  currency?: CurrencyCode; // Devise du produit (héritée de la boutique ou définie par le vendeur)
  currency_code?: CurrencyCode;
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
  // --- NOUVEAU: VENTE PRODUIT DIGITAL OU PHYSIQUE ---
  productType?: 'physical' | 'digital'; // Défaut 'physical'
  digitalType?:
    | 'pdf'
    | 'ebook'
    | 'formation'
    | 'video'
    | 'audio'
    | 'musique'
    | 'logiciel'
    | 'zip'
    | 'autre';
  digitalDeliveryUrl?: string; // Lien de livraison du produit digital
  digitalDownloadLimit?: number; // Limite de téléchargements (0 = illimité)
  digitalExpiryDays?: number; // Expiration du lien en jours (0 = pas d'expiration)
  acceptedPaymentMethods?: string[]; // Moyens de paiement acceptés pour ce produit
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

export type PaymentMethod =
  | 'saspay'
  | 'mpesa'
  | 'airtel'
  | 'orange'
  | 'paypal'
  | 'stripe'
  | 'bank_transfer'
  | 'cash_on_delivery';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';

export type DeliveryType = 'home_delivery' | 'market_pickup' | 'digital_instant';

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
  currency?: CurrencyCode;
  currency_code?: CurrencyCode;
  productType?: 'physical' | 'digital';
  digitalType?: string;
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
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  currency?: CurrencyCode;
  currency_code?: CurrencyCode;
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
  commissionTotal: number; // in currency
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Digital delivery integration
  containsDigitalItems?: boolean;
  digitalDeliveryLinks?: DigitalDeliveryLink[];
}

export interface MerchantPaymentAccount {
  id: string;
  shopId: string;
  merchantId: string;
  // 1. SASPAY.me mobile money gateway
  saspayEnabled: boolean;
  saspayMerchantId?: string;
  saspaySecretKey?: string;
  hasSaspaySecretKey?: boolean;
  saspayMaskedKey?: string;
  saspayWalletPhone?: string;
  saspayEnvironment?: 'live' | 'test';
  saspayStatus?: 'connected' | 'disconnected' | 'pending';
  // 2. Mobile Money direct RDC
  directMobileMoneyEnabled: boolean;
  mpesaNumber?: string;
  airtelNumber?: string;
  orangeNumber?: string;
  mobileMoneyAccountName?: string;
  mobileMoneyStatus?: 'connected' | 'disconnected';
  // 3. PayPal
  paypalEnabled: boolean;
  paypalEmail?: string;
  paypalMeLink?: string;
  paypalClientId?: string;
  hasPaypalSecret?: boolean;
  paypalMaskedSecret?: string;
  paypalEnvironment?: 'live' | 'sandbox';
  paypalStatus?: 'connected' | 'disconnected';
  // 4. Stripe
  stripeEnabled: boolean;
  stripeAccountId?: string;
  stripePublishableKey?: string;
  hasStripeSecretKey?: boolean;
  stripeMaskedKey?: string;
  stripeMode?: 'connect' | 'api_keys';
  stripeStatus?: 'connected' | 'disconnected';
  // 5. Compte bancaire
  bankEnabled: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  bankSwiftIban?: string;
  // Instructions & metadata
  paymentInstructions?: string;
  lastTestedAt?: string;
  vaultStatus?: 'ENCRYPTED_SERVER_SIDE' | 'UNCONFIGURED';
  updatedAt: string;
}

export interface DigitalDeliveryLink {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  shopId: string;
  shopName?: string;
  clientId: string;
  clientEmail?: string;
  clientPhone?: string;
  secureAccessToken: string;
  deliveryUrl: string; // Lien original renseigné par le commerçant
  digitalType?: string;
  downloadLimit: number; // 0 = illimité
  downloadCount: number;
  expiresAt?: string; // ISO date
  isActive: boolean;
  createdAt: string;
  lastDownloadedAt?: string;
}

export interface DownloadLog {
  id: string;
  deliveryLinkId: string;
  orderId: string;
  productId: string;
  timestamp: string;
  userAgent?: string;
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
  marketLogoUrl?: string; // Logo du marché MARCHE LUMUMBA RDC
  mobileMoneyAccounts?: {
    mpesaNumber: string;
    airtelNumber: string;
    orangeNumber: string;
    accountName: string;
  };
}
