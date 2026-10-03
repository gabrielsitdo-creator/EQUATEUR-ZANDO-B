import React from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Flame, ArrowLeft, Percent, Clock } from 'lucide-react';

interface PromotionsViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectShop: (shopId: string) => void;
  onNavigate: (view: string) => void;
}

export const PromotionsView: React.FC<PromotionsViewProps> = ({
  products,
  onSelectProduct,
  onSelectShop,
  onNavigate,
}) => {
  const promoProducts = products.filter(
    (p) => p.discountPercent && p.discountPercent > 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
          <Flame className="w-4 h-4 fill-white" />
          <span>Offres de la semaine</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          🔥 PROMOTIONS EQUATEUR ZANDO
        </h1>

        <p className="text-xs sm:text-sm text-white/90 max-w-lg leading-relaxed">
          Profitez de remises exclusives jusqu'à -20% directement auprès de nos commerçants partenaires à Mbandaka et Gemena.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">
          {promoProducts.length} article(s) en promotion
        </span>
        <button
          onClick={() => onNavigate('catalog')}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voir tout le catalogue</span>
        </button>
      </div>

      {promoProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
          Aucune promotion active pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {promoProducts.map((p) => (
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
  );
};
