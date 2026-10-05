import React, { useState } from 'react';
import { Product, Shop, formatPrice } from '../types';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { DataStore } from '../services/storage';
import { ProductCard } from '../components/ProductCard';
import {
  ShoppingBag,
  Zap,
  Phone,
  MessageCircle,
  MapPin,
  Store,
  CheckCircle2,
  Star,
  Heart,
  ArrowLeft,
  Share2,
  AlertCircle,
  Flame,
  FileText,
  Download,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  shop?: Shop;
  onSelectShop: (shopId: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenReportModal?: (targetType: any, targetId?: string, targetName?: string) => void;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  shop,
  onSelectShop,
  onSelectProduct,
  onOpenReportModal,
  onBack,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { showToast } = useNotification();
  const [selectedImage, setSelectedImage] = useState(product.images[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(() =>
    DataStore.getFavorites().includes(product.id)
  );

  const reviews = shop ? DataStore.getShopReviews(shop.id) : [];
  const relatedProducts = DataStore.getProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (product.status === 'out_of_stock') return;
    addToCart(product, quantity);
    showToast(
      'Produit ajouté !',
      `${product.name} (x${quantity}) ajouté au panier.`,
      'success'
    );
  };

  const handleBuyNow = () => {
    if (product.status === 'out_of_stock') return;
    addToCart(product, quantity);
    onNavigate('checkout');
  };

  const handleToggleFavorite = () => {
    const updated = DataStore.toggleFavorite(product.id);
    setIsFavorite(updated);
    showToast(
      updated ? 'Ajouté aux favoris' : 'Retiré des favoris',
      product.name,
      'info'
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Lien copié !', 'Le lien du produit a été copié.', 'info');
  };

  const whatsappPhone = (shop?.ownerWhatsapp || shop?.ownerPhone || '+243833358006').replace(/[^0-9]/g, '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour aux résultats</span>
      </button>

      {/* Main product view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Images Column (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative aspect-square w-full bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 shadow-xs">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercent && product.discountPercent > 0 ? (
              <div className="absolute top-4 left-4 bg-red-600 text-white font-black text-sm px-3 py-1 rounded-lg shadow flex items-center gap-1">
                <Flame className="w-4 h-4 fill-white" />
                <span>-{product.discountPercent}%</span>
              </div>
            ) : product.isPromoted ? (
              <div className="absolute top-4 left-4 bg-amber-500 text-stone-950 font-black text-xs px-3 py-1 rounded-lg shadow flex items-center gap-1">
                <Flame className="w-4 h-4 fill-stone-950" />
                <span>PROMOTION</span>
              </div>
            ) : null}

            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-700 hover:text-red-500 shadow-sm transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img
                      ? 'border-emerald-700 ring-2 ring-emerald-700/20'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
              <span>{product.category}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                {product.city}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="mt-3 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-stone-900">{product.rating}</span>
                <span className="text-stone-400">({product.reviewCount} avis)</span>
              </div>
              <span className="text-stone-300">|</span>
              <span
                className={`font-semibold ${
                  product.productType === 'digital'
                    ? 'text-blue-700 font-bold'
                    : product.stock > 0
                    ? 'text-emerald-700'
                    : 'text-red-600'
                }`}
              >
                {product.productType === 'digital'
                  ? '📱 Produit digital · Accès immédiat'
                  : product.stock > 0
                  ? `En stock (${product.stock} disponibles)`
                  : 'Rupture de stock'}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-baseline gap-3">
            <span className="text-3xl font-black text-emerald-950 tracking-tight">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.oldPrice && (
              <span className="text-base text-stone-400 line-through">
                {formatPrice(product.oldPrice, product.currency)}
              </span>
            )}
            {product.discountPercent && (
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                Économie de {formatPrice(product.oldPrice! - product.price, product.currency)}
              </span>
            )}
          </div>

          {/* Digital Product Delivery Card */}
          {product.productType === 'digital' && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-blue-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-700" />
                  Format : {product.digitalType?.toUpperCase() || 'FICHIER NUMÉRIQUE'}
                </span>
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200">
                  Téléchargement direct
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-snug">
                Dès confirmation de votre paiement direct au vendeur, vous recevrez un accès immédiat et sécurisé au lien de téléchargement.
              </p>
              <div className="pt-2 border-t border-blue-200/80 flex flex-wrap gap-3 text-[10px] text-blue-900 font-medium">
                <span>
                  Limite :{' '}
                  <strong>
                    {product.digitalDownloadLimit && product.digitalDownloadLimit > 0
                      ? `${product.digitalDownloadLimit} téléchargements`
                      : 'Illimité'}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  Validité :{' '}
                  <strong>
                    {product.digitalExpiryDays && product.digitalExpiryDays > 0
                      ? `${product.digitalExpiryDays} jours`
                      : 'Permanente'}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-stone-500">
              Description du produit
            </h4>
            <p className="text-stone-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
              {product.description}
            </p>
          </div>

          {/* Actions: Quantity & Buy buttons (Section 17) */}
          <div className="pt-3 border-t border-stone-200 space-y-4">
            <div className="flex items-center gap-4 text-xs">
              <span className="font-bold text-stone-700">Quantité :</span>
              <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-bold text-stone-900 bg-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  product.stock === 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-md active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>AJOUTER AU PANIER</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  product.stock === 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md active:scale-98'
                }`}
              >
                <Zap className="w-4 h-4 fill-stone-950" />
                <span>ACHETER MAINTENANT</span>
              </button>
            </div>
          </div>

          {/* FICHE BOUTIQUE SIMPLIFIÉE (Section 16) */}
          <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-stone-400 text-[11px]">
                Vendu par :
              </span>
              <button
                onClick={() => onOpenReportModal?.('produit', product.id, product.name)}
                className="text-stone-400 hover:text-red-600 flex items-center gap-1 text-[11px]"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Signaler ce produit
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold text-base overflow-hidden border border-emerald-700 flex-shrink-0">
                {shop?.logoUrl ? (
                  <img src={shop.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  product.shopName.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-stone-900 truncate">
                    {product.shopName}
                  </h4>
                  {shop?.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                </div>
                <div className="text-stone-500 truncate flex items-center gap-1 mt-0.5 text-[11px]">
                  <MapPin className="w-3 h-3 text-emerald-800" />
                  <span>{shop?.address || `${product.city}`}</span>
                </div>
              </div>
            </div>

            {/* Buttons required by Section 16: VISITER LA BOUTIQUE / CONTACTER SUR WHATSAPP */}
            <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectShop(product.shopId)}
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-stone-700" />
                <span>VISITER LA BOUTIQUE</span>
              </button>

              <a
                href={`https://wa.me/${whatsappPhone}?text=Bonjour%20${encodeURIComponent(product.shopName)},%20je%20suis%20intéressé%20par%20votre%20produit%20sur%20MARCHE%20LUMUMBA%20RDC:%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WHATSAPP</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews for Shop */}
      {reviews.length > 0 && (
        <section className="pt-8 border-t border-stone-200 space-y-4">
          <h3 className="text-lg font-black text-stone-900 tracking-tight">
            Avis clients vérifiés ({reviews.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{rev.clientName}</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-stone-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-stone-200 space-y-4">
          <h3 className="text-lg font-black text-stone-900 tracking-tight">
            Autres produits similaires sur le grand marché
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
                onSelectShop={onSelectShop}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
