import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { DataStore } from '../services/storage';
import { Product, Order, Category, OrderStatus } from '../types';
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

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'subscription' | 'settings'>('products');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Live data
  const shopProducts = DataStore.getProductsByShop(currentShop.id);
  const shopOrders = DataStore.getOrdersByShop(currentShop.id);
  const subscriptions = DataStore.getSubscriptions().filter(
    (s) => s.userId === currentUser?.id || s.shopName === currentShop.name
  );
  const activeSub = subscriptions.find(
    (s) => (s.status === 'PAID' || (s.status as any) === 'active') && new Date(s.endDate) >= new Date()
  );
  const latestSub = subscriptions[0];
  const isSubscriptionActive = !!activeSub || (hasActiveSubscription && (!latestSub || latestSub.status === 'PAID'));

  // Financial calculations
  const totalRevenueFc = shopOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => {
      const shopItems = o.items.filter((it) => it.shopId === currentShop.id);
      return sum + shopItems.reduce((s, it) => s + it.totalPrice, 0);
    }, 0);

  const totalCommissionsFc = Math.round(totalRevenueFc * 0.05);
  const netEarningsFc = totalRevenueFc - totalCommissionsFc;

  // Product Form State (Sections 18 & 19)
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
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
    setFormName('');
    setFormDesc('');
    setFormPrice(15000);
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
    setFormName(p.name);
    setFormDesc(p.description);
    setFormPrice(p.price);
    setFormOldPrice(p.oldPrice || '');
    setFormStock(p.stock);
    setFormCategory(p.category);
    setFormImageUrl(p.images[0] || '');
    setFormStatus(p.status);
    setFormIsPromoted(!!p.isPromoted);
    setFormPromoStartDate(p.promoStartDate || '');
    setFormPromoEndDate(p.promoEndDate || '');
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const discountPercent =
      formOldPrice && Number(formOldPrice) > formPrice
        ? Math.round(((Number(formOldPrice) - formPrice) / Number(formOldPrice)) * 100)
        : undefined;

    if (editingProduct) {
      DataStore.updateProduct(editingProduct.id, {
        name: formName,
        description: formDesc,
        price: formPrice,
        oldPrice: formOldPrice ? Number(formOldPrice) : undefined,
        discountPercent,
        stock: formStock,
        category: formCategory,
        images: [formImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'],
        status: formStock === 0 ? 'out_of_stock' : formStatus,
        city: currentShop.city,
        address: currentShop.address,
        isPromoted: formIsPromoted,
        promoStartDate: formIsPromoted ? formPromoStartDate : undefined,
        promoEndDate: formIsPromoted ? formPromoEndDate : undefined,
      });
      showToast('Produit mis à jour', formName, 'success');
    } else {
      DataStore.addProduct({
        shopId: currentShop.id,
        shopName: currentShop.name,
        name: formName,
        description: formDesc,
        price: formPrice,
        oldPrice: formOldPrice ? Number(formOldPrice) : undefined,
        discountPercent,
        stock: formStock,
        category: formCategory,
        images: [formImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'],
        status: formStock === 0 ? 'out_of_stock' : formStatus,
        city: currentShop.city,
        address: currentShop.address,
        isPromoted: formIsPromoted,
        promoStartDate: formIsPromoted ? formPromoStartDate : undefined,
        promoEndDate: formIsPromoted ? formPromoEndDate : undefined,
      });
      showToast(
        formIsPromoted ? 'Produit ajouté en promotion ! 🔥' : 'Produit ajouté',
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <div className="text-stone-400 text-xs font-semibold">Chiffre d’affaires brut</div>
          <div className="text-xl font-black text-stone-900">
            {totalRevenueFc.toLocaleString('fr-FR')} FC
          </div>
          <div className="text-[11px] text-stone-500">{shopOrders.length} commande(s)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <div className="text-stone-400 text-xs font-semibold">Commission (5%)</div>
          <div className="text-xl font-black text-stone-700">
            {totalCommissionsFc.toLocaleString('fr-FR')} FC
          </div>
          <div className="text-[11px] text-stone-500">Taux plateforme</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <div className="text-stone-400 text-xs font-semibold">Revenus Nets Vendeur</div>
          <div className="text-xl font-black text-emerald-900">
            {netEarningsFc.toLocaleString('fr-FR')} FC
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">95% des ventes</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <div className="text-stone-400 text-xs font-semibold">Abonnement Commerçant</div>
          <div className="text-xl font-black text-amber-700">
            4 $ / mois
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            {hasActiveSubscription ? '✓ Actif (Promo 3 mois)' : 'En attente'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'products'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mes Produits ({shopProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'orders'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Mes Commandes à Livrer ({shopOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'subscription'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Mon Abonnement (4 $/mois)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'settings'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Coordonnées Boutique</span>
        </button>
      </div>

      {/* Tab: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">
              Tous vos produits en ligne sur EQUATEUR ZANDO MARKET
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
                    <th className="p-3.5">Prix en FC</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Promotion</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {shopProducts.map((p) => (
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
                        <span className="font-bold text-stone-900">{p.price.toLocaleString('fr-FR')} FC</span>
                        {p.oldPrice && (
                          <div className="text-[10px] text-stone-400 line-through">
                            {p.oldPrice.toLocaleString('fr-FR')} FC
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 font-semibold text-stone-800">{p.stock} unités</td>

                      <td className="p-3.5">
                        {p.isPromoted ? (
                          <span className="bg-red-100 text-red-800 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                            <Flame className="w-3 h-3 fill-red-600 text-red-600" />
                            Active {p.promoEndDate ? `(jusqu'au ${p.promoEndDate})` : ''}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Non</span>
                        )}
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
                          {p.status === 'active' ? 'En vente' : p.status === 'out_of_stock' ? 'Rupture' : 'Inactif'}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Orders Management (Section 4 & 5) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-stone-900">
              Commandes reçues · Gestion de l'expédition directe
            </h3>
            <p className="text-xs text-stone-500">
              Vous êtes responsable de l'acheminement de vos colis par le moyen de transport de votre choix (motard, taxi, etc.).
            </p>
          </div>

          {shopOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
              Aucune commande reçue pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {shopOrders.map((ord) => {
                const clientWhatsappPhone = (ord.clientWhatsapp || ord.clientPhone).replace(/[^0-9]/g, '');

                return (
                  <div
                    key={ord.id}
                    className="p-5 bg-white border border-stone-200 rounded-3xl space-y-3.5 text-xs shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-stone-900">{ord.orderNumber}</span>
                        <span className="text-stone-300">·</span>
                        <span className="text-stone-500">
                          {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-700">Statut :</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                          className="p-1.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-xs text-stone-900"
                        >
                          <option value="pending">pending (En attente)</option>
                          <option value="confirmed">confirmed (Confirmée)</option>
                          <option value="processing">processing (En préparation)</option>
                          <option value="ready">ready (Prêt pour expédition/retrait)</option>
                          <option value="shipped">shipped (Expédiée / Remise au moyen de livraison)</option>
                          <option value="delivered">delivered (Livrée / Réceptionnée)</option>
                          <option value="cancelled">cancelled (Annulée)</option>
                        </select>
                      </div>
                    </div>

                    {/* Client & Delivery Info (Section 4 & 5) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                      <div>
                        <span className="font-bold text-stone-900 block mb-0.5">👤 Client :</span>
                        <div className="font-semibold text-stone-800">{ord.clientName}</div>
                        <div className="text-stone-600 font-mono text-[11px] mt-0.5">📞 {ord.clientPhone}</div>
                        {ord.clientWhatsapp && ord.clientWhatsapp !== ord.clientPhone && (
                          <div className="text-stone-600 font-mono text-[11px]">💬 WA: {ord.clientWhatsapp}</div>
                        )}
                        <div className="mt-1 text-[11px] font-bold text-emerald-800">
                          Montant : {ord.items.filter((it) => it.shopId === currentShop.id).reduce((s, it) => s + it.totalPrice, 0).toLocaleString('fr-FR')} FC
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-stone-900 block mb-0.5">📍 Mode & Adresse :</span>
                        <div className="font-medium text-stone-800">
                          {ord.deliveryType === 'market_pickup'
                            ? '🏬 Retrait direct en boutique / marché'
                            : '🛵 Livraison organisée par vos soins'}
                        </div>
                        <div className="text-stone-600 text-[11px] mt-0.5">
                          {ord.deliveryAddress.city}{ord.deliveryAddress.quartier ? ` · Q. ${ord.deliveryAddress.quartier}` : ''}
                        </div>
                        {ord.deliveryType !== 'market_pickup' && ord.deliveryAddress.streetDetails && (
                          <div className="text-stone-600 text-[11px]">
                            {ord.deliveryAddress.streetDetails}
                          </div>
                        )}
                        {ord.deliveryAddress.deliveryInstructions && (
                          <div className="text-[11px] text-amber-800 font-medium italic mt-1 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                            Note client : {ord.deliveryAddress.deliveryInstructions}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-stone-900 block mb-0.5">⚡ Organiser la livraison :</span>
                        <p className="text-[11px] text-stone-500 mb-2">
                          Contactez l'acheteur pour convenir du motard, taxi ou heure de passage :
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`https://wa.me/${clientWhatsappPhone}?text=Bonjour%20${encodeURIComponent(ord.clientName)},%20je%20suis%20le%20commerçant%20${encodeURIComponent(currentShop.name)}%20sur%20EQUATEUR%20ZANDO%20MARKET%20pour%20votre%20commande%20${ord.orderNumber}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${ord.clientPhone}`}
                            className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-700" />
                            <span>Appeler</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1">
                      <span className="font-bold text-stone-600 block">Articles commandés :</span>
                      <div className="text-stone-800 font-medium">
                        {ord.items
                          .filter((it) => it.shopId === currentShop.id)
                          .map((it) => `${it.quantity}x ${it.productName} (${it.totalPrice.toLocaleString('fr-FR')} FC)`)
                          .join(', ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Subscription Management (Section 20 & 21) */}
      {activeTab === 'subscription' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 max-w-xl space-y-5 text-xs shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-black text-base text-stone-900">
                Abonnement Boutique Commerçant
              </h3>
              <p className="text-stone-500">Tarif officiel : 4 $ / mois (~11 000 FC)</p>
            </div>
            <span
              className={`font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
                isSubscriptionActive
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {isSubscriptionActive ? 'PAID / Actif ✓' : 'EXPIRED / Expiré'}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 text-stone-800">
            <div className="flex justify-between">
              <span className="text-stone-500">Prix de la boutique :</span>
              <span className="font-bold text-stone-900">4 $ / mois (~11 000 FC)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Statut de l'abonnement :</span>
              <span
                className={`font-black uppercase ${
                  isSubscriptionActive ? 'text-emerald-800' : 'text-amber-800'
                }`}
              >
                {latestSub?.status || (isSubscriptionActive ? 'PAID' : 'EXPIRED')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date de début :</span>
              <span className="font-bold text-stone-900">
                {latestSub?.startDate || 'Actif lors de l’inscription'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date d'expiration :</span>
              <span className="font-bold text-stone-900">
                {latestSub?.endDate || 'À renouveler mensuellement'}
              </span>
            </div>
            {latestSub?.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-stone-500">Moyen Mobile Money :</span>
                <span className="font-bold uppercase text-stone-800">
                  {latestSub.paymentMethod}
                </span>
              </div>
            )}
            {latestSub?.transactionRef && (
              <div className="flex justify-between">
                <span className="text-stone-500">Réf. transaction :</span>
                <span className="font-mono text-[11px] font-bold text-stone-700">
                  {latestSub.transactionRef}
                </span>
              </div>
            )}
          </div>

          <p className="text-stone-500 text-[11px] leading-relaxed">
            Votre abonnement donne le droit de publier vos produits, de les modifier, d'accéder aux promotions et de recevoir des commandes en direct des clients sur <strong>EQUATEUR ZANDO MARKET</strong>.
          </p>

          <button
            onClick={() => onNavigate('register-merchant')}
            className="w-full py-3 bg-emerald-800 text-white font-black rounded-xl text-xs hover:bg-emerald-700 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Renouveler mon abonnement par Mobile Money (4 $/mois)</span>
          </button>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 max-w-xl space-y-4 text-xs">
          <h3 className="font-black text-base text-stone-900 pb-2 border-b border-stone-100">
            Coordonnées de la boutique
          </h3>
          <div className="space-y-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Nom de la boutique</label>
              <input
                type="text"
                defaultValue={currentShop.name}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Ville (saisie libre)</label>
              <input
                type="text"
                defaultValue={currentShop.city}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Adresse précise (marché, stand)</label>
              <input
                type="text"
                defaultValue={currentShop.address}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Numéro WhatsApp</label>
              <input
                type="tel"
                defaultValue={currentShop.ownerWhatsapp || currentShop.ownerPhone}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <button
              onClick={() => showToast('Modifications enregistrées', currentShop.name, 'success')}
              className="px-5 py-2.5 bg-emerald-800 text-white font-bold rounded-xl"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal (Sections 18 & 19: 🔥 Produit Promotionnel) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-black text-base text-stone-900">
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nom du produit *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Chaussures Mocassins Cuir Homme"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Prix de vente en FC *</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Ancien prix (si remise)</label>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Facultatif"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Quantité en Stock *</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
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

              {/* SECTION 18 & 19: 🔥 PRODUIT PROMOTIONNEL */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer font-black text-amber-950 text-xs">
                  <input
                    type="checkbox"
                    checked={formIsPromoted}
                    onChange={(e) => setFormIsPromoted(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <Flame className="w-4 h-4 fill-red-600 text-red-600" />
                  <span>Ce produit est en promotion (Placer dans Produits Promotionnels)</span>
                </label>

                {formIsPromoted && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1 text-[11px]">
                        Date de début :
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
                        Date de fin (fin automatique) :
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
                <label className="font-bold text-stone-700 block mb-1">URL de la photo</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Détails du produit..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
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
