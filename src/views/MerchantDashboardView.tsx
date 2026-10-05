import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { DataStore } from '../services/storage';
import {
  Product,
  Order,
  OrderStatus,
  CurrencyCode,
  formatPrice,
  SUPPORTED_CURRENCIES,
  MerchantPaymentAccount,
} from '../types';
import { CurrencySelector } from '../components/CurrencySelector';
import { MerchantPaymentSettings } from '../components/MerchantPaymentSettings';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Store,
  Flame,
  MessageCircle,
  Phone,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  AlertTriangle,
  Globe,
  Coins,
  BarChart3,
  Wallet,
  FileText,
  Download,
  ExternalLink,
  Shield,
  Lock,
  Layers,
  Check,
  Smartphone,
  Building,
} from 'lucide-react';

interface MerchantDashboardViewProps {
  onNavigate: (view: string, payload?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const MerchantDashboardView: React.FC<MerchantDashboardViewProps> = ({
  onNavigate,
  onSelectProduct,
}) => {
  const { currentUser, userShop, hasActiveSubscription } = useAuth();
  const { showToast } = useNotification();

  const shopId = userShop?.id || currentUser?.shopId || 'shop-1';
  const currentShop = DataStore.getShopById(shopId) || DataStore.getShops()[0];
  const categories = DataStore.getCategories();

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'products' | 'orders' | 'sales' | 'payments' | 'subscription' | 'settings'
  >('products');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Shop currency & settings
  const [shopCurrency, setShopCurrency] = useState<CurrencyCode>(
    (currentShop.currency || 'CDF') as CurrencyCode
  );
  const [shopName, setShopName] = useState(currentShop.name);
  const [shopCity, setShopCity] = useState(currentShop.city);
  const [shopAddress, setShopAddress] = useState(currentShop.address || '');
  const [shopWhatsapp, setShopWhatsapp] = useState(
    currentShop.ownerWhatsapp || currentShop.ownerPhone || ''
  );

  // Merchant Direct Payment Accounts
  const initialPaymentAccount = DataStore.getMerchantPaymentAccount(currentShop.id);
  const [saspayEnabled, setSaspayEnabled] = useState(initialPaymentAccount.saspayEnabled);
  const [saspayMerchantId, setSaspayMerchantId] = useState(
    initialPaymentAccount.saspayMerchantId || `SAS-MLM-${currentShop.id.toUpperCase().slice(-4)}`
  );
  const [saspayWalletPhone, setSaspayWalletPhone] = useState(
    initialPaymentAccount.saspayWalletPhone || currentShop.ownerPhone || '+243820000000'
  );
  const [saspayEnvironment, setSaspayEnvironment] = useState<'live' | 'test'>(
    initialPaymentAccount.saspayEnvironment || 'live'
  );
  const [directMobileMoneyEnabled, setDirectMobileMoneyEnabled] = useState(
    initialPaymentAccount.directMobileMoneyEnabled
  );
  const [mpesaNumber, setMpesaNumber] = useState(
    initialPaymentAccount.mpesaNumber || currentShop.ownerPhone || ''
  );
  const [airtelNumber, setAirtelNumber] = useState(
    initialPaymentAccount.airtelNumber || currentShop.ownerPhone || ''
  );
  const [orangeNumber, setOrangeNumber] = useState(
    initialPaymentAccount.orangeNumber || currentShop.ownerPhone || ''
  );
  const [mobileMoneyAccountName, setMobileMoneyAccountName] = useState(
    initialPaymentAccount.mobileMoneyAccountName || currentShop.name
  );
  const [paypalEnabled, setPaypalEnabled] = useState(initialPaymentAccount.paypalEnabled);
  const [paypalEmail, setPaypalEmail] = useState(initialPaymentAccount.paypalEmail || '');
  const [paypalMeLink, setPaypalMeLink] = useState(initialPaymentAccount.paypalMeLink || '');
  const [stripeEnabled, setStripeEnabled] = useState(initialPaymentAccount.stripeEnabled);
  const [stripeAccountId, setStripeAccountId] = useState(
    initialPaymentAccount.stripeAccountId || ''
  );
  const [bankEnabled, setBankEnabled] = useState(initialPaymentAccount.bankEnabled);
  const [bankName, setBankName] = useState(initialPaymentAccount.bankName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(
    initialPaymentAccount.bankAccountNumber || ''
  );
  const [bankAccountHolder, setBankAccountHolder] = useState(
    initialPaymentAccount.bankAccountHolder || currentShop.name
  );
  const [bankSwiftIban, setBankSwiftIban] = useState(initialPaymentAccount.bankSwiftIban || '');
  const [paymentInstructions, setPaymentInstructions] = useState(
    initialPaymentAccount.paymentInstructions ||
      'Paiement direct sécurisé au commerçant sans intermédiaire. Vos fonds nous parviennent directement.'
  );

  // Live products & orders
  const shopProducts = DataStore.getProductsByShop(currentShop.id);
  const shopOrders = DataStore.getOrdersByShop(currentShop.id);
  const subscriptions = DataStore.getSubscriptions().filter(
    (s) => s.userId === currentUser?.id || s.shopName === currentShop.name
  );
  const activeSub = subscriptions.find(
    (s) =>
      (s.status === 'PAID' || (s.status as any) === 'active') && new Date(s.endDate) >= new Date()
  );
  const latestSub = subscriptions[0];
  const isSubscriptionActive =
    !!activeSub || (hasActiveSubscription && (!latestSub || latestSub.status === 'PAID'));

  // Dedicated Merchant Sales Stats (Strictly for THIS merchant)
  const salesStats = DataStore.getMerchantSalesStats(currentShop.id);

  // Product Form State (Physical & Digital)
  const [formProductType, setFormProductType] = useState<'physical' | 'digital'>('physical');
  const [formDigitalType, setFormDigitalType] = useState<
    'pdf' | 'ebook' | 'formation' | 'video' | 'audio' | 'musique' | 'logiciel' | 'zip' | 'autre'
  >('pdf');
  const [formDigitalDeliveryUrl, setFormDigitalDeliveryUrl] = useState('');
  const [formDigitalDownloadLimit, setFormDigitalDownloadLimit] = useState<number>(5);
  const [formDigitalExpiryDays, setFormDigitalExpiryDays] = useState<number>(30);
  const [formAcceptedPayments, setFormAcceptedPayments] = useState<string[]>([
    'saspay',
    'mpesa',
    'airtel',
    'orange',
  ]);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formProductCurrency, setFormProductCurrency] = useState<CurrencyCode>(shopCurrency);
  const [formOldPrice, setFormOldPrice] = useState<number | ''>('');
  const [formStock, setFormStock] = useState<number>(10);
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Alimentation & Vivres');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive' | 'out_of_stock'>('active');
  const [formIsPromoted, setFormIsPromoted] = useState(false);
  const [formPromoStartDate, setFormPromoStartDate] = useState('');
  const [formPromoEndDate, setFormPromoEndDate] = useState('');

  const openAddModal = () => {
    if (!isSubscriptionActive) {
      showToast(
        'Abonnement requis ou expiré',
        'Votre abonnement boutique (4 $/mois) a expiré. Veuillez le renouveler pour publier de nouveaux produits.',
        'warning'
      );
      setActiveTab('subscription');
      return;
    }
    setEditingProduct(null);
    setFormProductType('physical');
    setFormDigitalType('pdf');
    setFormDigitalDeliveryUrl('');
    setFormDigitalDownloadLimit(5);
    setFormDigitalExpiryDays(30);
    setFormAcceptedPayments(['saspay', 'mpesa', 'airtel', 'orange']);
    setFormName('');
    setFormDesc('');
    setFormPrice(15000);
    setFormProductCurrency(shopCurrency);
    setFormOldPrice('');
    setFormStock(20);
    setFormCategory(categories[0]?.name || 'Alimentation & Vivres');
    setFormImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?w=600');
    setFormStatus('active');
    setFormIsPromoted(false);
    setFormPromoStartDate(new Date().toISOString().split('T')[0]);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setFormPromoEndDate(nextMonth.toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormProductType(p.productType || 'physical');
    setFormDigitalType(p.digitalType || 'pdf');
    setFormDigitalDeliveryUrl(p.digitalDeliveryUrl || '');
    setFormDigitalDownloadLimit(p.digitalDownloadLimit ?? 5);
    setFormDigitalExpiryDays(p.digitalExpiryDays ?? 30);
    setFormAcceptedPayments(
      p.acceptedPaymentMethods || ['saspay', 'mpesa', 'airtel', 'orange']
    );
    setFormName(p.name);
    setFormDesc(p.description);
    setFormPrice(p.price);
    setFormProductCurrency((p.currency || p.currency_code || shopCurrency) as CurrencyCode);
    setFormOldPrice(p.oldPrice || '');
    setFormStock(p.productType === 'digital' ? 999 : p.stock);
    setFormCategory(p.category);
    setFormImageUrl(p.images[0] || '');
    setFormStatus(p.status);
    setFormIsPromoted(!!p.isPromoted);
    setFormPromoStartDate(p.promoStartDate || '');
    setFormPromoEndDate(p.promoEndDate || '');
    setIsAddModalOpen(true);
  };

  const handleTogglePaymentMethod = (methodKey: string) => {
    if (formAcceptedPayments.includes(methodKey)) {
      setFormAcceptedPayments(formAcceptedPayments.filter((m) => m !== methodKey));
    } else {
      setFormAcceptedPayments([...formAcceptedPayments, methodKey]);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (formProductType === 'digital' && !formDigitalDeliveryUrl.trim()) {
      showToast(
        'Lien obligatoire',
        'Veuillez renseigner le lien de livraison du produit digital.',
        'warning'
      );
      return;
    }

    const discountPercent =
      formOldPrice && Number(formOldPrice) > formPrice
        ? Math.round(((Number(formOldPrice) - formPrice) / Number(formOldPrice)) * 100)
        : undefined;

    const finalStock = formProductType === 'digital' ? 999 : formStock;
    const finalCurrency = formProductCurrency || shopCurrency || 'CDF';

    if (editingProduct) {
      DataStore.updateProduct(editingProduct.id, {
        name: formName,
        description: formDesc,
        price: formPrice,
        currency: finalCurrency,
        currency_code: finalCurrency,
        oldPrice: formOldPrice ? Number(formOldPrice) : undefined,
        discountPercent,
        stock: finalStock,
        category: formCategory,
        images: [formImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'],
        status: finalStock === 0 ? 'out_of_stock' : formStatus,
        city: currentShop.city,
        address: currentShop.address,
        isPromoted: formIsPromoted,
        promoStartDate: formIsPromoted ? formPromoStartDate : undefined,
        promoEndDate: formIsPromoted ? formPromoEndDate : undefined,
        productType: formProductType,
        digitalType: formProductType === 'digital' ? formDigitalType : undefined,
        digitalDeliveryUrl: formProductType === 'digital' ? formDigitalDeliveryUrl.trim() : undefined,
        digitalDownloadLimit:
          formProductType === 'digital' ? formDigitalDownloadLimit : undefined,
        digitalExpiryDays: formProductType === 'digital' ? formDigitalExpiryDays : undefined,
        acceptedPaymentMethods: formAcceptedPayments,
      });

      if (formProductType === 'digital' && formDigitalDeliveryUrl.trim()) {
        DataStore.updateDigitalDeliveryUrl(editingProduct.id, formDigitalDeliveryUrl.trim());
      }

      showToast('Produit mis à jour', formName, 'success');
    } else {
      DataStore.addProduct({
        shopId: currentShop.id,
        shopName: currentShop.name,
        name: formName,
        description: formDesc,
        price: formPrice,
        currency: finalCurrency,
        currency_code: finalCurrency,
        oldPrice: formOldPrice ? Number(formOldPrice) : undefined,
        discountPercent,
        stock: finalStock,
        category: formCategory,
        images: [formImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'],
        status: finalStock === 0 ? 'out_of_stock' : formStatus,
        city: currentShop.city,
        address: currentShop.address,
        isPromoted: formIsPromoted,
        promoStartDate: formIsPromoted ? formPromoStartDate : undefined,
        promoEndDate: formIsPromoted ? formPromoEndDate : undefined,
        productType: formProductType,
        digitalType: formProductType === 'digital' ? formDigitalType : undefined,
        digitalDeliveryUrl: formProductType === 'digital' ? formDigitalDeliveryUrl.trim() : undefined,
        digitalDownloadLimit:
          formProductType === 'digital' ? formDigitalDownloadLimit : undefined,
        digitalExpiryDays: formProductType === 'digital' ? formDigitalExpiryDays : undefined,
        acceptedPaymentMethods: formAcceptedPayments,
      });
      showToast(
        formProductType === 'digital'
          ? 'Produit digital publié avec succès ! 📱'
          : 'Produit physique publié sur le marché 📦',
        formName,
        'success'
      );
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteProduct = (productId: string, name: string) => {
    if (window.confirm(`Supprimer définitivement "${name}" ?`)) {
      DataStore.deleteProduct(productId);
      showToast('Produit supprimé', name, 'info');
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    DataStore.updateOrderStatus(orderId, newStatus);
    showToast('Statut mis à jour', `Nouveau statut : ${newStatus}`, 'success');
  };

  const handleSaveShopSettings = () => {
    DataStore.updateShop(currentShop.id, {
      name: shopName,
      city: shopCity,
      address: shopAddress,
      ownerWhatsapp: shopWhatsapp,
      currency: shopCurrency,
      currency_code: shopCurrency,
    });
    showToast(
      'Paramètres enregistrés !',
      `Devise active : ${shopCurrency} · Coordonnées mises à jour.`,
      'success'
    );
  };

  const handleSavePaymentAccounts = () => {
    const updatedAccount: MerchantPaymentAccount = {
      id: initialPaymentAccount.id || `pay-acc-${currentShop.id}`,
      shopId: currentShop.id,
      merchantId: currentShop.ownerId,
      saspayEnabled,
      saspayMerchantId: saspayMerchantId.trim(),
      saspayWalletPhone: saspayWalletPhone.trim(),
      saspayEnvironment,
      directMobileMoneyEnabled,
      mpesaNumber: mpesaNumber.trim(),
      airtelNumber: airtelNumber.trim(),
      orangeNumber: orangeNumber.trim(),
      mobileMoneyAccountName: mobileMoneyAccountName.trim(),
      paypalEnabled,
      paypalEmail: paypalEmail.trim(),
      paypalMeLink: paypalMeLink.trim(),
      stripeEnabled,
      stripeAccountId: stripeAccountId.trim(),
      bankEnabled,
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      bankAccountHolder: bankAccountHolder.trim(),
      bankSwiftIban: bankSwiftIban.trim(),
      paymentInstructions: paymentInstructions.trim(),
      updatedAt: new Date().toISOString(),
    };

    DataStore.saveMerchantPaymentAccount(updatedAccount);
    showToast(
      'Moyens de paiement enregistrés !',
      'Vos clients paieront directement sur ces canaux sécurisés.',
      'success'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Alerte Expiration Abonnement */}
      {!isSubscriptionActive && (
        <div className="bg-amber-500 text-stone-950 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border-2 border-amber-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-sm text-stone-950">
                Abonnement boutique expiré (4 $ / mois)
              </p>
              <p className="text-xs text-stone-900 font-medium">
                Conformément aux règles du système, l'ajout de nouveaux produits est suspendu. Veuillez renouveler votre abonnement Mobile Money.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('register-merchant')}
            className="px-5 py-2.5 bg-stone-950 hover:bg-stone-900 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <span>Renouveler mon abonnement (4 $/mois)</span>
          </button>
        </div>
      )}

      {/* Shop Info Header */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-bold text-xl overflow-hidden border border-emerald-800 flex-shrink-0">
            {currentShop.logoUrl ? (
              <img src={currentShop.logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              currentShop.name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black text-stone-900 tracking-tight">
                {currentShop.name}
              </h1>
              {currentShop.isVerified && (
                <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Vendeur Vérifié
                </span>
              )}
              <span className="bg-emerald-100 text-emerald-900 font-black text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                Devise : {shopCurrency}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Localisation : <strong>{currentShop.city}</strong> · {currentShop.address || 'Marché central'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('shop-detail', currentShop)}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs"
          >
            Voir ma boutique publique
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau produit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Strictly for this merchant) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <div className="text-stone-400 text-xs font-semibold">Chiffre d’affaires brut</div>
          <div className="text-xl font-black text-stone-900">
            {formatPrice(salesStats.totalRevenue, shopCurrency)}
          </div>
          <div className="text-[11px] text-stone-500">{salesStats.totalOrders} commande(s)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <div className="text-stone-400 text-xs font-semibold">Produits vendus</div>
          <div className="text-xl font-black text-stone-900">
            {salesStats.productsSoldCount} unités
          </div>
          <div className="text-[11px] text-stone-500">
            {salesStats.digitalProductsSoldCount} digitaux · {salesStats.physicalProductsSoldCount} physiques
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <div className="text-stone-400 text-xs font-semibold">Paiements directs réussis</div>
          <div className="text-xl font-black text-emerald-800">
            {salesStats.successfulPayments} validé(s)
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">Reçus directement</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <div className="text-stone-400 text-xs font-semibold">Abonnement Plateforme</div>
          <div className="text-xl font-black text-amber-700">4 $ / mois</div>
          <div className="text-[11px] text-emerald-700 font-bold">
            {hasActiveSubscription ? '✓ Actif' : 'En attente'}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-stone-200 text-xs font-bold gap-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'products'
              ? 'border-emerald-800 text-emerald-900 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mes Produits ({shopProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'orders'
              ? 'border-emerald-800 text-emerald-900 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Commandes ({shopOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'sales'
              ? 'border-emerald-800 text-emerald-900 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-700" />
          <span>Mes Ventes</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'payments'
              ? 'border-emerald-800 text-emerald-900 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Wallet className="w-4 h-4 text-blue-600" />
          <span>Paiements (SasPay.me direct)</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'subscription'
              ? 'border-emerald-800 text-emerald-900 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Mon Abonnement (4 $/mois)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'settings'
              ? 'border-emerald-800 text-emerald-900 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Coordonnées & Devise</span>
        </button>
      </div>

      {/* Tab 1: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">
              Tous vos produits physiques & digitaux sur MARCHE LUMUMBA RDC
            </h3>
            <button
              onClick={openAddModal}
              className="px-3.5 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter produit
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Produit</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Prix & Devise</th>
                    <th className="p-3.5">Stock / Disponibilité</th>
                    <th className="p-3.5">Paiements direct</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {shopProducts.map((p) => {
                    const isDigital = p.productType === 'digital';
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg border border-stone-100 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-stone-900 line-clamp-1">{p.name}</span>
                              <span className="text-[11px] text-stone-500">{p.category}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          {isDigital ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                              <FileText className="w-3 h-3 text-blue-700" />
                              Digital ({p.digitalType?.toUpperCase() || 'FICHIER'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              <Package className="w-3 h-3 text-amber-700" />
                              Physique
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-stone-900">
                            {formatPrice(p.price, p.currency || currentShop.currency)}
                          </span>
                          {p.oldPrice && (
                            <div className="text-[10px] text-stone-400 line-through">
                              {formatPrice(p.oldPrice, p.currency || currentShop.currency)}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 font-semibold text-stone-800">
                          {isDigital ? (
                            <span className="text-emerald-700 font-bold">Illimité (Téléchargeable)</span>
                          ) : (
                            `${p.stock} unités`
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="text-[10px] text-stone-600 font-medium">
                            {p.acceptedPaymentMethods && p.acceptedPaymentMethods.length > 0
                              ? p.acceptedPaymentMethods.map((m) => m.toUpperCase()).join(', ')
                              : 'SASPAY, MOBILE MONEY'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              p.status === 'active'
                                ? 'bg-emerald-100 text-emerald-900'
                                : p.status === 'out_of_stock'
                                ? 'bg-red-100 text-red-900'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {p.status === 'active'
                              ? 'En vente'
                              : p.status === 'out_of_stock'
                              ? 'Rupture'
                              : 'Inactif'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-lg"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-stone-900">
              Commandes reçues · Gestion de l'expédition directe
            </h3>
            <p className="text-xs text-stone-500">
              Vous êtes responsable de l'acheminement de vos colis ou de la délivrance de vos fichiers digitaux.
            </p>
          </div>

          <div className="space-y-3">
            {shopOrders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-xs text-stone-400">
                Aucune commande enregistrée pour le moment.
              </div>
            ) : (
              shopOrders.map((order) => {
                const shopItems = order.items.filter((it) => it.shopId === currentShop.id);
                const orderSubtotal = shopItems.reduce((sum, it) => sum + it.totalPrice, 0);

                return (
                  <div
                    key={order.id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-stone-900">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-900'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {DataStore.getOrderStatusLabel(order.status)}
                          </span>
                          {order.containsDigitalItems && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                              Contient produit digital
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-sm text-emerald-900">
                          Total boutique : {formatPrice(orderSubtotal, order.currency || shopCurrency)}
                        </div>
                        <div className="text-[10px] text-stone-500 uppercase">
                          Moyen de paiement : {order.paymentMethod.toUpperCase()} (Direct)
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {shopItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs p-2 bg-stone-50 rounded-xl"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={item.productImage}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div className="truncate">
                              <span className="font-semibold text-stone-900 block truncate">
                                {item.productName}
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {item.quantity} x {formatPrice(item.unitPrice, item.currency || shopCurrency)}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-stone-900 shrink-0">
                            {formatPrice(item.totalPrice, item.currency || shopCurrency)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Client & Shipping info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                      <div>
                        <span className="font-bold text-stone-700 block mb-0.5">Destinataire :</span>
                        <div className="text-stone-800 font-semibold">{order.clientName}</div>
                        <div className="text-stone-600 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-700" />
                          <span>{order.clientPhone}</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-stone-700 block mb-0.5">Mode de livraison :</span>
                        <div className="text-stone-800">
                          {order.deliveryType === 'digital_instant' ? (
                            <span className="text-blue-700 font-bold">Livraison digitale sécurisée</span>
                          ) : order.deliveryType === 'market_pickup' ? (
                            'Retrait au stand vendeur'
                          ) : (
                            `Livraison à domicile : ${order.deliveryAddress.streetDetails}, ${order.deliveryAddress.city}`
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-stone-600">Changer statut :</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="p-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium"
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="processing">En préparation</option>
                          <option value="ready">Prêt à expédier</option>
                          <option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée avec succès</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </div>

                      <a
                        href={`https://wa.me/${(order.clientWhatsapp || order.clientPhone).replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-900"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Contacter client</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Mes Ventes (Section dédiée & strictement propre à ce commerçant) */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Tableau de bord des ventes · {currentShop.name}</span>
            </div>
            <h2 className="text-2xl font-black">
              Chiffre d’affaires total : {formatPrice(salesStats.totalRevenue, shopCurrency)}
            </h2>
            <p className="text-xs text-emerald-200 max-w-2xl leading-relaxed">
              Vos revenus correspondent exclusivement aux transactions de votre boutique. MARCHÉ LUMUMBA RDC ne centralise aucun paiement : vos fonds vous sont directement versés via SasPay.me ou vos comptes connectés.
            </p>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="text-stone-500 font-semibold block">Total Commandes</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">
                {salesStats.totalOrders}
              </span>
              <span className="text-[10px] text-stone-400">Toutes catégories</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="text-stone-500 font-semibold block">Produits Digitaux Vendus</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">
                {salesStats.digitalProductsSoldCount}
              </span>
              <span className="text-[10px] text-blue-600 font-medium">E-books, vidéos, zips</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="text-stone-500 font-semibold block">Produits Physiques Vendus</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">
                {salesStats.physicalProductsSoldCount}
              </span>
              <span className="text-[10px] text-amber-600 font-medium">Articles expédiés</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="text-stone-500 font-semibold block">Paiements Réussis</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">
                {salesStats.successfulPayments}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                {salesStats.pendingOrders} en attente · {salesStats.failedPayments} échoué(s)
              </span>
            </div>
          </div>

          {/* Historique des ventes */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100 flex items-center justify-between">
              <span>Historique détaillé de vos ventes ({salesStats.shopOrders.length})</span>
              <span className="text-xs text-stone-400 font-normal">
                Devise de compte : <strong className="text-stone-900">{shopCurrency}</strong>
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">N° Commande</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Articles</th>
                    <th className="p-3">Total Reçu</th>
                    <th className="p-3">Paiement</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {salesStats.shopOrders.map((o) => {
                    const myItems = o.items.filter((it) => it.shopId === currentShop.id);
                    const orderTotal = myItems.reduce((sum, it) => sum + it.totalPrice, 0);
                    return (
                      <tr key={o.id} className="hover:bg-stone-50/50">
                        <td className="p-3 font-mono font-bold">{o.orderNumber}</td>
                        <td className="p-3">
                          <span className="font-bold text-stone-800 block">{o.clientName}</span>
                          <span className="text-[10px] text-stone-400">{o.clientPhone}</span>
                        </td>
                        <td className="p-3">
                          {myItems.map((it) => (
                            <div key={it.id} className="truncate max-w-xs text-[11px] text-stone-600">
                              {it.quantity}x {it.productName}
                            </div>
                          ))}
                        </td>
                        <td className="p-3 font-black text-emerald-900">
                          {formatPrice(orderTotal, o.currency || shopCurrency)}
                        </td>
                        <td className="p-3 uppercase text-[10px] font-bold text-stone-600">
                          {o.paymentMethod}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                            {o.paymentStatus === 'paid' ? 'Payé' : o.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Moyens de Paiement (Faire sortir SASPAY.me & paiements directs avec MerchantPaymentSettings) */}
      {activeTab === 'payments' && (
        <MerchantPaymentSettings
          shop={currentShop}
          onSaveSuccess={() => {
            showToast(
              'Configurations enregistrées !',
              'Vos comptes de paiement directs et sécurisés sont opérationnels.',
              'success'
            );
          }}
        />
      )}

      {/* Tab 5: Subscription */}
      {activeTab === 'subscription' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 max-w-xl space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="font-black text-base text-stone-900">
                Abonnement Partenaire Marché (4 $ / mois)
              </h3>
              <p className="text-stone-500">
                Frais d’hébergement de votre stand ou boutique sur MARCHE LUMUMBA RDC.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
            <span className="font-bold text-emerald-950 block">Statut actuel :</span>
            <div className="text-emerald-800 font-extrabold text-sm">
              {hasActiveSubscription ? '✓ Abonnement Actif' : 'En attente de paiement'}
            </div>
            <p className="text-[11px] text-emerald-700">
              Profitez de la visibilité sur toute la RDC et en Afrique.
            </p>
          </div>

          <button
            onClick={() => onNavigate('register-merchant')}
            className="w-full py-3 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 flex items-center justify-center gap-1.5"
          >
            <span>Renouveler mon abonnement par Mobile Money (4 $/mois)</span>
          </button>
        </div>
      )}

      {/* Tab 6: Settings (Coordonnées & CHOIX DU SYSTÈME DE 10 DEVISES) */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 max-w-xl space-y-5 text-xs">
          <h3 className="font-black text-base text-stone-900 pb-2 border-b border-stone-100">
            Coordonnées de la boutique & Choix de la Devise
          </h3>

          {/* COMPOSANT CURRENCY SELECTOR (Exigence 1, 2, 3) */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
            <CurrencySelector
              value={shopCurrency}
              onChange={(newCode) => setShopCurrency(newCode)}
              label="« Choisissez votre devise »"
              description="Sélectionnez la monnaie dans laquelle vous souhaitez vendre vos produits physiques et digitaux. Vos prix seront saisis et affichés dans cette devise sans conversion automatique."
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Nom de la boutique</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-2">Emplacement physique & Stand au marché</h4>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Ville (saisie manuelle) *</label>
                <input
                  type="text"
                  value={shopCity}
                  onChange={(e) => setShopCity(e.target.value)}
                  placeholder="Ex: Kinshasa, Lubumbashi, Goma, Mbandaka..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Écrivez manuellement votre ville (RDC ou Afrique).
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Adresse précise (marché, stand, galerie) *
              </label>
              <input
                type="text"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                placeholder="Ex: Marché Central, Stand 15 ou En ligne"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Numéro WhatsApp</label>
              <input
                type="tel"
                value={shopWhatsapp}
                onChange={(e) => setShopWhatsapp(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <button
              onClick={handleSaveShopSettings}
              className="px-6 py-2.5 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900"
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal (Physique & Digital) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-black text-base text-stone-900">
                  {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
                </h3>
                <span className="text-xs text-stone-500">
                  Devise de votre boutique : <strong>{shopCurrency}</strong>
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* 1. CHOIX DU TYPE DE PRODUIT (Exigence UX clé) */}
              <div className="space-y-2">
                <label className="font-black text-stone-900 block text-xs">
                  Quel type de produit voulez-vous vendre ? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormProductType('physical')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formProductType === 'physical'
                        ? 'border-emerald-800 bg-emerald-50/60 ring-2 ring-emerald-800/10'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-stone-900">
                      <Package className="w-4 h-4 text-emerald-800" />
                      <span>Produit physique</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                      Article matériel avec stock et livraison physique ou retrait au marché.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setFormProductType('digital');
                      setFormCategory('Produits Digitaux & E-books');
                    }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formProductType === 'digital'
                        ? 'border-blue-700 bg-blue-50/60 ring-2 ring-blue-700/10'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-stone-900">
                      <FileText className="w-4 h-4 text-blue-700" />
                      <span>Produit digital</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                      PDF, E-book, formation, vidéo, musique, logiciel ou fichier ZIP.
                    </p>
                  </div>
                </div>
              </div>

              {/* CHAMPS SPÉCIFIQUES PRODUIT DIGITAL */}
              {formProductType === 'digital' && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-blue-200">
                    <span className="font-black text-blue-950 text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-700" />
                      Configuration de livraison digitale
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                      Téléchargement sécurisé
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Type de produit digital *
                    </label>
                    <select
                      value={formDigitalType}
                      onChange={(e: any) => setFormDigitalType(e.target.value)}
                      className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-medium"
                    >
                      <option value="pdf">Document PDF</option>
                      <option value="ebook">Ebook (Livre électronique)</option>
                      <option value="formation">Formation en ligne / Vidéos</option>
                      <option value="video">Vidéo exclusive</option>
                      <option value="audio">Audio / Podcast</option>
                      <option value="musique">Musique / Morceau musical</option>
                      <option value="logiciel">Logiciel / Application</option>
                      <option value="zip">Fichier ZIP / Archive complète</option>
                      <option value="autre">Autre format digital</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-blue-950 block mb-1">
                      « Lien de livraison du produit digital » *
                    </label>
                    <input
                      type="url"
                      value={formDigitalDeliveryUrl}
                      onChange={(e) => setFormDigitalDeliveryUrl(e.target.value)}
                      placeholder="https://drive.google.com/... ou lien de téléchargement"
                      className="w-full p-2.5 bg-white border border-blue-300 rounded-xl text-stone-900 font-mono text-xs"
                      required={formProductType === 'digital'}
                    />
                    <p className="text-[10px] text-blue-700 mt-0.5">
                      Ce lien restera strictement caché. Il sera délivré au client automatiquement et de façon sécurisée après validation de son paiement direct.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">
                        Limite de téléchargements :
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formDigitalDownloadLimit}
                        onChange={(e) => setFormDigitalDownloadLimit(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-stone-300 rounded-xl"
                      />
                      <span className="text-[10px] text-stone-400">0 = Illimité</span>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">
                        Validité du lien (en jours) :
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formDigitalExpiryDays}
                        onChange={(e) => setFormDigitalExpiryDays(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-stone-300 rounded-xl"
                      />
                      <span className="text-[10px] text-stone-400">0 = Sans expiration</span>
                    </div>
                  </div>
                </div>
              )}

              {/* INFORMATIONS PRINCIPALES DU PRODUIT */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nom du produit *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={
                    formProductType === 'digital'
                      ? 'Ex: Guide E-commerce en Afrique (E-book PDF)'
                      : 'Ex: Chaussures Mocassins Cuir Homme'
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Catégorie *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRIX ET DEVISE DU PRODUIT */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-bold text-stone-700 block mb-1">Devise du produit *</label>
                  <select
                    value={formProductCurrency}
                    onChange={(e) => setFormProductCurrency(e.target.value as CurrencyCode)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
                  >
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.flag} {curr.code} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="font-bold text-stone-700 block mb-1">
                    Prix de vente ({formProductCurrency}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-black text-emerald-900"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="font-bold text-stone-700 block mb-1">Ancien prix (si promo)</label>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) =>
                      setFormOldPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Facultatif"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* STOCK (Seulement pour physique) */}
              {formProductType === 'physical' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Quantité en Stock *</label>
                    <input
                      type="number"
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Statut *</label>
                    <select
                      value={formStatus}
                      onChange={(e: any) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                    >
                      <option value="active">Actif en vente</option>
                      <option value="out_of_stock">Rupture de stock</option>
                      <option value="inactive">Désactivé</option>
                    </select>
                  </div>
                </div>
              )}

              {/* MOYENS DE PAIEMENT ACCEPTÉS POUR CE PRODUIT */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                <label className="font-bold text-stone-800 block text-xs">
                  Moyens de paiement acceptés pour ce produit :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formAcceptedPayments.includes('saspay')}
                      onChange={() => handleTogglePaymentMethod('saspay')}
                      className="accent-blue-700"
                    />
                    <span>SasPay.me</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formAcceptedPayments.includes('mpesa')}
                      onChange={() => handleTogglePaymentMethod('mpesa')}
                      className="accent-red-600"
                    />
                    <span>M-Pesa</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formAcceptedPayments.includes('airtel')}
                      onChange={() => handleTogglePaymentMethod('airtel')}
                      className="accent-red-600"
                    />
                    <span>Airtel Money</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formAcceptedPayments.includes('orange')}
                      onChange={() => handleTogglePaymentMethod('orange')}
                      className="accent-orange-600"
                    />
                    <span>Orange Money</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formAcceptedPayments.includes('paypal')}
                      onChange={() => handleTogglePaymentMethod('paypal')}
                      className="accent-blue-700"
                    />
                    <span>PayPal</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formAcceptedPayments.includes('stripe')}
                      onChange={() => handleTogglePaymentMethod('stripe')}
                      className="accent-indigo-700"
                    />
                    <span>Stripe</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={formAcceptedPayments.includes('bank_transfer')}
                      onChange={() => handleTogglePaymentMethod('bank_transfer')}
                      className="accent-stone-700"
                    />
                    <span>Banque</span>
                  </label>
                  {formProductType === 'physical' && (
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                      <input
                        type="checkbox"
                        checked={formAcceptedPayments.includes('cash_on_delivery')}
                        onChange={() => handleTogglePaymentMethod('cash_on_delivery')}
                        className="accent-emerald-700"
                      />
                      <span>À la livraison</span>
                    </label>
                  )}
                </div>
              </div>

              {/* PRODUIT PROMOTIONNEL */}
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-black text-amber-950 text-xs">
                  <input
                    type="checkbox"
                    checked={formIsPromoted}
                    onChange={(e) => setFormIsPromoted(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <Flame className="w-4 h-4 fill-red-600 text-red-600" />
                  <span>Placer ce produit dans les Promotions Spéciales</span>
                </label>

                {formIsPromoted && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1 text-[11px]">
                        Date début :
                      </label>
                      <input
                        type="date"
                        value={formPromoStartDate}
                        onChange={(e) => setFormPromoStartDate(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1 text-[11px]">
                        Date fin :
                      </label>
                      <input
                        type="date"
                        value={formPromoEndDate}
                        onChange={(e) => setFormPromoEndDate(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">URL de la photo *</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description *</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Description détaillée du produit physique ou digital..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900"
                >
                  {editingProduct ? 'Mettre à jour' : 'Publier sur le marché'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-3 bg-stone-100 text-stone-700 font-semibold rounded-xl"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
