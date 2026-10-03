import React, { useState } from 'react';
import { Shop, Product } from '../types';
import { DataStore } from '../services/storage';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  MapPin,
  Store,
  CheckCircle2,
  Star,
  Phone,
  MessageCircle,
  ArrowLeft,
  Mail,
  Send,
  AlertCircle,
} from 'lucide-react';

interface ShopDetailViewProps {
  shop: Shop;
  onSelectProduct: (product: Product) => void;
  onOpenReportModal?: (targetType: any, targetId?: string, targetName?: string) => void;
  onBack: () => void;
}

export const ShopDetailView: React.FC<ShopDetailViewProps> = ({
  shop,
  onSelectProduct,
  onOpenReportModal,
  onBack,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  const products = DataStore.getProductsByShop(shop.id);
  const reviews = DataStore.getShopReviews(shop.id);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    DataStore.addReview({
      shopId: shop.id,
      shopName: shop.name,
      clientId: currentUser?.id || 'guest',
      clientName: currentUser?.name || 'Client',
      rating: newReviewRating,
      comment: newReviewComment.trim(),
    });

    setNewReviewComment('');
    showToast('Avis enregistré !', 'Merci pour votre retour sur ce commerçant.', 'success');
  };

  const whatsappPhone = (shop.ownerWhatsapp || shop.ownerPhone || '').replace(/[^0-9]/g, '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au marché</span>
      </button>

      {/* Simple Shop Banner & Card (Section 16) */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-emerald-950 p-1 shadow-md border border-stone-200 overflow-hidden flex-shrink-0">
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {shop.name}
                </h1>
                {shop.isVerified && (
                  <span className="bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Vendeur Vérifié
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-medium">
                <span className="flex items-center gap-1 text-emerald-800 font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  {shop.city}
                </span>
                <span>·</span>
                <span className="text-stone-500">{shop.address || shop.marketName}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-500">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-stone-900">{shop.rating}</span>
                  <span>({shop.reviewCount} avis)</span>
                </div>
                <span>·</span>
                <span>{products.length} produit(s) en vente</span>
              </div>

              <p className="text-xs text-stone-600 max-w-xl leading-relaxed pt-1">
                {shop.description}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2 self-start sm:self-auto flex-shrink-0">
            {whatsappPhone && (
              <a
                href={`https://wa.me/${whatsappPhone}?text=Mbote!%20Je%20vous%20contacte%20depuis%20votre%20boutique%20sur%20EQUATEUR%20ZANDO%20MARKET`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contacter sur WhatsApp</span>
              </a>
            )}

            <a
              href={`tel:${shop.ownerPhone}`}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-800" />
              <span>Appeler le vendeur</span>
            </a>

            <button
              onClick={() => onOpenReportModal?.('boutique', shop.id, shop.name)}
              className="text-stone-400 hover:text-red-600 text-xs flex items-center justify-center gap-1 py-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Signaler cette boutique</span>
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex border-t border-stone-200 bg-stone-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-emerald-800 text-emerald-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Produits du vendeur ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-emerald-800 text-emerald-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Avis Clients ({reviews.length})
          </button>
        </div>
      </div>

      {/* Products list */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-stone-900">
            Tous les articles vendus par {shop.name}
          </h3>

          {products.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
              Aucun produit n'a encore été publié par ce commerçant.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews list */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-bold text-base text-stone-900">
              Avis des acheteurs ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                Aucun avis pour l'instant.
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-white border border-stone-200 rounded-xl space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{rev.clientName}</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-600 italic">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>

          {/* Add review */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 text-xs h-fit">
            <h4 className="font-bold text-sm text-stone-900">Laisser une évaluation</h4>
            <form onSubmit={handleAddReview} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Note :</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReviewRating(star)}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newReviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-stone-800 ml-1">{newReviewRating}/5</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Commentaire :</label>
                <textarea
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs"
              >
                Envoyer mon avis
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
