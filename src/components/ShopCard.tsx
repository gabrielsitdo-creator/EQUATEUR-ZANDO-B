import React from 'react';
import { Shop } from '../types';
import { CheckCircle2, Star, MapPin, Store, ArrowRight } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
  onSelectShop: (shopId: string) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onSelectShop }) => {
  return (
    <div
      onClick={() => onSelectShop(shop.id)}
      className="group bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Banner */}
      <div className="relative h-24 w-full bg-emerald-950 overflow-hidden">
        <img
          src={shop.bannerUrl}
          alt={shop.name}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Logo overlay */}
        <div className="absolute -bottom-3 left-4 w-12 h-12 rounded-lg bg-white p-0.5 shadow border border-stone-100 overflow-hidden">
          <img
            src={shop.logoUrl}
            alt={shop.name}
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* Verified Badge */}
        {shop.isVerified && (
          <div className="absolute top-2 right-2 bg-emerald-700/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            Vendeur Vérifié
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 pt-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
              {shop.name}
            </h3>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {shop.description}
          </p>

          <div className="mt-3 flex flex-col gap-1 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 truncate">
              <Store className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="font-medium text-stone-700 truncate">{shop.marketName}</span>
              <span>·</span>
              <span className="text-stone-500 truncate">{shop.standNumber}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span>{shop.city}{shop.quartier ? ` · ${shop.quartier}` : shop.territory ? ` (${shop.territory})` : ''}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-amber-600">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-stone-900">{shop.rating}</span>
            <span className="text-stone-400">({shop.reviewCount} avis)</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Visiter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
