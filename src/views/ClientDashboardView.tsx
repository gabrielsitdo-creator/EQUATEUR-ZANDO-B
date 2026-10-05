import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataStore } from '../services/storage';
import { Order, Product, formatPrice } from '../types';
import { ProductCard } from '../components/ProductCard';
import {
  User as UserIcon,
  Package,
  Heart,
  Bell,
  MapPin,
  Phone,
  Store,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Download,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface ClientDashboardViewProps {
  onSelectProduct: (product: Product) => void;
  onSelectShop: (shopId: string) => void;
  onNavigate: (view: string, payload?: any) => void;
}

export const ClientDashboardView: React.FC<ClientDashboardViewProps> = ({
  onSelectProduct,
  onSelectShop,
  onNavigate,
}) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'downloads' | 'favorites' | 'profile'>('orders');

  const orders = currentUser ? DataStore.getOrdersByClient(currentUser.id) : [];
  const digitalLinks = currentUser ? DataStore.getDigitalDeliveryLinksByClient(currentUser.id) : [];
  const favoriteIds = DataStore.getFavorites();
  const favoriteProducts = DataStore.getProducts().filter((p) =>
    favoriteIds.includes(p.id)
  );

  const [downloadMsg, setDownloadMsg] = useState<Record<string, string>>({});

  const handleDownload = (linkId: string) => {
    const res = DataStore.recordDigitalDownload(linkId, navigator.userAgent);
    if (res.success && res.deliveryUrl) {
      setDownloadMsg((prev) => ({
        ...prev,
        [linkId]: res.remaining && res.remaining >= 0 ? `Téléchargé (${res.remaining} restant(s))` : 'Succès !',
      }));
      window.open(res.deliveryUrl, '_blank');
    } else {
      setDownloadMsg((prev) => ({
        ...prev,
        [linkId]: res.message || 'Téléchargement impossible.',
      }));
    }
  };

  // Profile edits
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editCity, setEditCity] = useState(currentUser?.city || 'Mbandaka');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: editName,
      phone: editPhone,
      city: editCity,
      address: editAddress,
    });
    alert('Profil mis à jour !');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Profile Bar */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl overflow-hidden">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              currentUser?.name.charAt(0) || 'C'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900 tracking-tight">
                {currentUser?.name || 'Mon Compte Client'}
              </h1>
              <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">
                CLIENT
              </span>
            </div>
            <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
              <span>{currentUser?.phone}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-emerald-700" />
                {currentUser?.city || 'Mbandaka'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('register-merchant')}
          className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors self-start sm:self-auto"
        >
          <Store className="w-4 h-4 text-emerald-700" />
          <span>Ouvrir une boutique commerçant</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'orders'
              ? 'border-emerald-800 text-emerald-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mes Commandes ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'downloads'
              ? 'border-blue-700 text-blue-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Download className="w-4 h-4 text-blue-700" />
          <span>Mes Achats Digitaux ({digitalLinks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'favorites'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Mes Favoris ({favoriteProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'profile'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Mon Profil</span>
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-base text-stone-800">
                Vous n'avez pas encore passé de commande
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explorez les produits physiques et digitaux disponibles sur MARCHE LUMUMBA RDC.
              </p>
              <button
                onClick={() => onNavigate('catalog')}
                className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900"
              >
                Découvrir le catalogue
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 bg-white border border-stone-200 rounded-2xl hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-stone-900">
                        {ord.orderNumber}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="text-xs text-stone-500">
                        {new Date(ord.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                        {DataStore.getOrderStatusLabel(ord.status)}
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        {formatPrice(ord.totalAmount, ord.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="flex flex-wrap gap-2 text-xs text-stone-700">
                    {ord.items.map((it) => (
                      <span
                        key={it.id}
                        className="bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200"
                      >
                        {it.quantity}x {it.productName}
                      </span>
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        {ord.deliveryType === 'market_pickup'
                          ? `Retrait au marché: ${ord.deliveryAddress.marketName || 'Stand'}`
                          : ord.deliveryAddress.streetDetails}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('order-tracking', ord)}
                      className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                    >
                      <span>Voir le suivi</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Downloads (Achats Digitaux) */}
      {activeTab === 'downloads' && (
        <div className="space-y-4">
          {digitalLinks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <Download className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-base text-stone-800">
                Aucun achat digital pour le moment
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Retrouvez ici tous vos e-books, formations, logiciels et documents achetés sur MARCHE LUMUMBA RDC.
              </p>
              <button
                onClick={() => onNavigate('catalog')}
                className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900"
              >
                Explorer les produits digitaux
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {digitalLinks.map((link) => (
                <div
                  key={link.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                        {link.digitalType || 'Fichier digital'}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 leading-snug">
                        {link.productName}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Boutique : <strong>{link.shopName || 'Marchand certifié'}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownload(link.id)}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>
                      Téléchargé :{' '}
                      <strong>
                        {link.downloadCount}{' '}
                        {link.downloadLimit > 0 ? `/ ${link.downloadLimit}` : ''}
                      </strong>
                    </span>
                    {link.expiresAt && (
                      <span>
                        Expire :{' '}
                        <strong>{new Date(link.expiresAt).toLocaleDateString('fr-FR')}</strong>
                      </span>
                    )}
                  </div>

                  {downloadMsg[link.id] && (
                    <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg">
                      {downloadMsg[link.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favoriteProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <Heart className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-base text-stone-800">
                Aucun produit dans vos favoris
              </h3>
              <p className="text-xs text-stone-500">
                Cliquez sur le cœur d'un produit pour l'enregistrer dans votre liste.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favoriteProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={onSelectProduct}
                  onSelectShop={onSelectShop}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 max-w-xl space-y-4 text-xs">
          <h3 className="font-bold text-base text-stone-900 pb-2 border-b border-stone-100">
            Modifier mes informations personnelles
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Nom complet</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Téléphone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Ville</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Adresse par défaut</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900"
            >
              Enregistrer les modifications
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
