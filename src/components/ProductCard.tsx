import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { DataStore } from '../services/storage';
import { ShoppingBag, Star, Heart, CheckCircle2, MapPin, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct?: (product: Product) => void;
  onSelectShop?: (shopId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onSelectShop,
}) => {
  const { addToCart } = useCart();
  const { showToast } = useNotification();
  const [isFavorite, setIsFavorite] = React.useState(() => {
    return DataStore.getFavorites().includes(product.id);
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.status === 'out_of_stock') return;
    addToCart(product, 1);
    showToast('Ajouté au panier !', `${product.name} (1) ajouté.`, 'success');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = DataStore.toggleFavorite(product.id);
    setIsFavorite(updated);
    showToast(
      updated ? 'Ajouté aux favoris' : 'Retiré des favoris',
      product.name,
      'info'
    );
  };

  return (
    <div
      onClick={() => onSelectProduct?.(product)}
      className="group flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer h-full"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Promo discount badge */}
        {product.discountPercent && product.discountPercent > 0 ? (
          <div className="absolute top-2.5 left-2.5 bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded shadow flex items-center gap-1">
            <Flame className="w-3 h-3 fill-white" />
            <span>-{product.discountPercent}%</span>
          </div>
        ) : product.isPromoted ? (
          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded shadow flex items-center gap-1">
            <Flame className="w-3 h-3 fill-stone-950" />
            <span>PROMO</span>
          </div>
        ) : null}

        {/* Out of stock label */}
        {product.status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
            <span className="bg-stone-900 text-white font-semibold text-xs px-3 py-1.5 rounded uppercase tracking-wider">
              Rupture de stock
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-red-500 shadow-xs transition-colors"
          title="Ajouter aux favoris"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
          />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Metadata clean line without pill boxes */}
          <div className="text-xs text-stone-500 font-medium flex items-center gap-1.5 truncate">
            <span>{product.category}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-stone-700 font-semibold">
              <MapPin className="w-3 h-3 text-emerald-800" />
              {product.city}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm text-stone-900 line-clamp-2 mt-1 group-hover:text-emerald-800 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Shop information */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectShop?.(product.shopId);
            }}
            className="mt-1 flex items-center gap-1 text-xs text-stone-600 hover:text-emerald-700 font-medium truncate"
          >
            <span className="truncate">{product.shopName}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          </div>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-amber-600 mb-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-stone-800">{product.rating}</span>
            <span className="text-stone-400">({product.reviewCount})</span>
          </div>

          {/* Price & Action */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
            <div>
              <div className="font-black text-base text-stone-900 tracking-tight text-emerald-900">
                {product.price.toLocaleString('fr-FR')} FC
              </div>
              {product.oldPrice && (
                <div className="text-xs text-stone-400 line-through">
                  {product.oldPrice.toLocaleString('fr-FR')} FC
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.status === 'out_of_stock'}
              className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                product.status === 'out_of_stock'
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-800 text-white hover:bg-emerald-900 active:scale-95 shadow-xs'
              }`}
              title="Ajouter au panier"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
