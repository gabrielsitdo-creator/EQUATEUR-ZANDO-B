import React, { useState } from 'react';
import { Shop, City } from '../types';
import { ShopCard } from '../components/ShopCard';
import { Store, Search, MapPin, CheckCircle2 } from 'lucide-react';

interface ShopsViewProps {
  shops: Shop[];
  cities: City[];
  onSelectShop: (shopId: string) => void;
  onNavigate: (view: string) => void;
}

export const ShopsView: React.FC<ShopsViewProps> = ({
  shops,
  cities,
  onSelectShop,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = shops.filter((s) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchMarket = (s.marketName || '').toLowerCase().includes(q);
      const matchOwner = s.ownerName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchMarket && !matchOwner) return false;
    }

    if (selectedCity !== 'ALL' && s.city !== selectedCity) return false;
    if (verifiedOnly && !s.isVerified) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Boutiques & Vendeurs du Grand Équateur
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Découvrez nos marchands certifiés avec stands physiques à Mbandaka, Gemena, Gbadolite et Lisala
          </p>
        </div>

        <button
          onClick={() => onNavigate('register-merchant')}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-900 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Store className="w-4 h-4" />
          <span>Ouvrir ma boutique</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une boutique, stand ou commerçant..."
            className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:border-emerald-700 text-stone-900"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="p-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-800"
        >
          <option value="ALL">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 accent-emerald-700"
          />
          <span>Vendeurs Vérifiés uniquement (✓)</span>
        </label>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
          Aucune boutique ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <ShopCard key={s.id} shop={s} onSelectShop={onSelectShop} />
          ))}
        </div>
      )}
    </div>
  );
};
