import React from 'react';
import { Market, Shop } from '../types';
import { ShopCard } from '../components/ShopCard';
import { MapPin, Store, ArrowRight } from 'lucide-react';

interface MarketsViewProps {
  markets: Market[];
  shops: Shop[];
  onSelectShop: (shopId: string) => void;
  onNavigate: (view: string) => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({
  markets,
  shops,
  onSelectShop,
  onNavigate,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Les Grands Marchés de la Région de l'Équateur
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Explorez les carrefours commerciaux de Mbandaka, Gemena, Gbadolite et Lisala
        </p>
      </div>

      <div className="space-y-8">
        {markets.map((mkt) => {
          const marketShops = shops.filter((s) => s.marketName === mkt.name);

          return (
            <div
              key={mkt.id}
              className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {mkt.cityName || mkt.city}
                    </span>
                    {(mkt.territory || mkt.zone || mkt.address) && (
                      <>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs text-stone-500 font-medium">
                          {mkt.address || `${mkt.territory || ''} ${mkt.zone ? `(${mkt.zone})` : ''}`}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-stone-900">{mkt.name}</h2>
                  <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
                    {mkt.description}
                  </p>
                </div>

                <div className="text-xs font-semibold text-stone-500 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100 self-start sm:self-auto">
                  {marketShops.length} boutique(s) en ligne
                </div>
              </div>

              {/* Shops in this market */}
              {marketShops.length === 0 ? (
                <div className="text-center py-6 text-xs text-stone-400">
                  Aucune boutique enregistrée pour le moment sur ce marché.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketShops.map((shop) => (
                    <ShopCard key={shop.id} shop={shop} onSelectShop={onSelectShop} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
