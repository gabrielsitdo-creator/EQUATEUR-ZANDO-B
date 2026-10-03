import React, { useState } from 'react';
import { Product, Shop, Category, Market } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ShopCard } from '../components/ShopCard';
import { DataStore } from '../services/storage';
import {
  Flame,
  ArrowRight,
  Sparkles,
  Store,
  ShieldCheck,
  Search,
  MapPin,
  TrendingUp,
  Tag,
  Zap,
} from 'lucide-react';

interface HomeViewProps {
  products: Product[];
  shops: Shop[];
  categories: Category[];
  promotedProducts?: Product[];
  markets?: Market[];
  onSelectProduct: (product: Product) => void;
  onSelectShop: (shopId: string) => void;
  onSelectCategory: (categoryName: string) => void;
  onSelectMarket?: (marketId: string) => void;
  onSearch?: (query: string) => void;
  onNavigate: (view: string) => void;
  onOpenAIAssistant: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  shops,
  categories,
  promotedProducts = products.filter((p) => p.isPromoted || (p.discountPercent && p.discountPercent > 0)),
  markets = [],
  onSelectProduct,
  onSelectShop,
  onSelectCategory,
  onSelectMarket,
  onSearch,
  onNavigate,
  onOpenAIAssistant,
}) => {
  const [localQuery, setLocalQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'relevance' | 'price_asc' | 'price_desc' | 'rating'>('newest');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      if (onSearch) {
        onSearch(localQuery.trim());
      } else {
        onNavigate('catalog');
      }
    }
  };

  const sortedAllProducts = [...products]
    .filter((p) => p.status === 'active')
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      return 0;
    });

  const popularSearches = [
    'Chaussures',
    'Karawa',
    'Chaussures Karawa',
    'Téléphone',
    'Riz',
    'Super Wax',
    'Huile de palme Karawa',
    'Mbandaka',
  ];

  const heroImage = DataStore.getHeroBanner();
  const marketLogo = DataStore.getMarketLogo();

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Section with Modern Supermarket Background */}
      <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 mt-4 p-6 sm:p-12 shadow-2xl border border-stone-800 min-h-[440px] sm:min-h-[480px] flex flex-col justify-center">
        {/* Background Image: Supermarché moderne aux rayons colorés */}
        <img
          src={heroImage}
          alt="Supermarché moderne aux rayons colorés — EQUATEUR ZANDO MARKET"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-700 ease-out"
        />

        {/* Gradient Overlay: Bleu très foncé / transparent pour garder excellente lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030d1b] via-[#05172e]/92 sm:via-[#071f3d]/85 via-55% to-[#082243]/20 pointer-events-none" />

        {/* Subtle bottom gradient for soft blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020914]/80 via-transparent to-black/25 pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Logo officiel présent */}
            <img
              src={marketLogo}
              alt="Logo EQUATEUR ZANDO MARKET"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shadow-2xl border-2 border-amber-400/60 bg-white/10 backdrop-blur-md p-0.5"
            />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase backdrop-blur-md shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>LE GRAND MARCHÉ DE LA RDC ET L’AFRIQUE</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            EQUATEUR <span className="text-emerald-400">ZANDO MARKET</span>
          </h1>

          <p className="text-stone-100 text-sm sm:text-base leading-relaxed max-w-2xl font-medium drop-shadow-sm">
            « C'est le moment de faire la promotion de votre marchandise partout où tu es. C'est possible avec EQUATEUR ZANDO MARKET. »
          </p>

          {/* Central Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-3 max-w-2xl"
          >
            <div className="flex items-center w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-1.5 focus-within:ring-4 focus-within:ring-emerald-400/40 border border-stone-200">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Rechercher un produit, une ville ou une boutique..."
                className="w-full px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-hidden font-medium"
              />
              <button
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black text-xs transition-colors flex items-center gap-2 flex-shrink-0 cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>Rechercher</span>
              </button>
            </div>
          </form>

          {/* Popular search chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-stone-200">
            <span className="text-stone-300 text-[11px] font-semibold drop-shadow-xs">Exemples :</span>
            {popularSearches.map((s, idx) => (
              <button
                key={idx}
                onClick={() => (onSearch ? onSearch(s) : onNavigate('catalog'))}
                className="bg-slate-900/60 hover:bg-emerald-800/80 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-lg text-white font-medium text-[11px] transition-all cursor-pointer shadow-xs"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold whitespace-nowrap shadow-xs"
          >
            Tous les Produits ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.name)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-semibold border border-stone-200 whitespace-nowrap transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 1: 🔥 PRODUITS PROMOTIONNELS (Sections 9, 18, 19) */}
      {promotedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <Flame className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                  🔥 PRODUITS PROMOTIONNELS
                  <span className="bg-white text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Offres Actives
                  </span>
                </h2>
                <p className="text-xs text-white/90">
                  Articles en promotion immédiate chez les commerçants du marché
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('promotions')}
              className="hidden sm:flex text-xs font-bold text-white hover:underline items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {promotedProducts.slice(0, 10).map((p) => (
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

      {/* SECTION 2: 🛍️ TOUS LES PRODUITS ENSEMBLE (Sections 8, 9, 24) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>🛍️ TOUS LES PRODUITS DU MARCHÉ</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Découvrez l'ensemble des articles proposés par tous les commerçants sans séparation de ville
            </p>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 font-medium">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-800 font-semibold focus:outline-hidden focus:border-emerald-700 cursor-pointer"
            >
              <option value="newest">Nouveautés d'abord</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="rating">Meilleures évaluations</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {sortedAllProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
              onSelectShop={onSelectShop}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3: 🏪 BOUTIQUES ACTIVES (Section 9 - Discrete, non-dominant) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-800" />
              <span>Boutiques Actives du Grand Marché</span>
            </h3>
            <p className="text-xs text-stone-500">
              Des commerçants vérifiés à Karawa, Mbandaka, Businga, Kinshasa...
            </p>
          </div>

          <button
            onClick={() => onNavigate('register-merchant')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>Ouvrir ma boutique (4 $/mois)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {shops.slice(0, 6).map((s) => (
            <ShopCard key={s.id} shop={s} onSelectShop={onSelectShop} />
          ))}
        </div>
      </section>

      {/* Commerçant Onboarding Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-stone-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-800/40">
          <div className="space-y-1.5 max-w-xl text-center md:text-left">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
              Offre Commerçant · 4 $ / mois (Promo 3 mois)
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Faites la promotion de vos marchandises partout en RDC
            </h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              Ouvrez votre boutique en 3 minutes, publiez vos produits, gérez vos prix en FC et organisez vos livraisons librement.
            </p>
          </div>

          <button
            onClick={() => onNavigate('register-merchant')}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-xl transition-all whitespace-nowrap active:scale-95"
          >
            Ouvrir ma boutique (4 $/mois)
          </button>
        </div>
      </section>
    </div>
  );
};
