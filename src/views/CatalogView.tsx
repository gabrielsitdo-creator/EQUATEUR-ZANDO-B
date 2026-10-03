import React, { useState, useMemo } from 'react';
import { Product, Shop, Category, City, Market } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ShopCard } from '../components/ShopCard';
import { DataStore } from '../services/storage';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  MapPin,
  Store,
  Flame,
} from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  cities?: City[];
  markets?: Market[];
  initialCategory?: string;
  initialSearch?: string;
  initialCity?: string;
  onSelectProduct: (product: Product) => void;
  onSelectShop: (shopId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  cities = [],
  markets = [],
  initialCategory = 'ALL',
  initialSearch = '',
  initialCity = 'ALL',
  onSelectProduct,
  onSelectShop,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [promoOnly, setPromoOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating'>('relevance');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  React.useEffect(() => {
    if (initialCategory) setSelectedCat(initialCategory);
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialSearch !== undefined) setSearch(initialSearch);
  }, [initialSearch]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCat('ALL');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setPromoOnly(false);
    setSortBy('relevance');
  };

  // Run dynamic search engine
  const searchResults = useMemo(() => {
    return DataStore.searchAll(search);
  }, [search]);

  // Apply filters & sorting on matched products
  const finalProducts = useMemo(() => {
    return searchResults.matchedProducts
      .filter((p) => {
        if (selectedCat !== 'ALL' && p.category !== selectedCat) return false;
        if (minPrice !== '' && p.price < Number(minPrice)) return false;
        if (maxPrice !== '' && p.price > Number(maxPrice)) return false;
        if (inStockOnly && p.status === 'out_of_stock') return false;
        if (promoOnly && !p.isPromoted && (!p.discountPercent || p.discountPercent <= 0)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
        return 0;
      });
  }, [searchResults.matchedProducts, selectedCat, minPrice, maxPrice, inStockOnly, promoOnly, sortBy]);

  // City or combined search header label
  let searchTitle = 'Tous les Produits';
  if (search.trim()) {
    if (searchResults.detectedCity && !searchResults.detectedKeyword) {
      searchTitle = `RÉSULTATS À ${searchResults.detectedCity.toUpperCase()}`;
    } else if (searchResults.detectedCity && searchResults.detectedKeyword) {
      searchTitle = `RÉSULTATS POUR « ${searchResults.detectedKeyword.toUpperCase()} » À ${searchResults.detectedCity.toUpperCase()}`;
    } else {
      searchTitle = `RÉSULTATS POUR « ${search.toUpperCase()} »`;
    }
  } else if (selectedCat !== 'ALL') {
    searchTitle = `Catégorie : ${selectedCat}`;
  }

  const activeFiltersCount = [
    selectedCat !== 'ALL',
    minPrice !== '',
    maxPrice !== '',
    inStockOnly,
    promoOnly,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative flex items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit, une ville ou une boutique (ex: chaussures, Karawa, chaussures Karawa)..."
            className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-700 focus:bg-white text-stone-900 font-medium"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Title & Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {searchTitle}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {finalProducts.length} produit(s) trouvé(s)
            {searchResults.matchedShops.length > 0 && search.trim() && (
              <span> · {searchResults.matchedShops.length} boutique(s) correspondante(s)</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-800 font-semibold focus:outline-hidden focus:border-emerald-700 cursor-pointer"
            >
              <option value="relevance">Pertinence</option>
              <option value="newest">Nouveautés d'abord</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="rating">Meilleures évaluations</option>
            </select>
          </div>
        </div>
      </div>

      {/* If City Search matches shops (Section 12: Afficher boutiques trouvées) */}
      {search.trim() && searchResults.matchedShops.length > 0 && (
        <section className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-black text-emerald-950">
                Boutiques identifiées ({searchResults.matchedShops.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchResults.matchedShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} onSelectShop={onSelectShop} />
            ))}
          </div>
        </section>
      )}

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block bg-white p-5 rounded-2xl border border-stone-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-emerald-800" />
              Filtres
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-stone-400 hover:text-red-600 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Effacer
              </button>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Catégorie</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:border-emerald-700 font-medium text-stone-800"
            >
              <option value="ALL">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Prix en FC</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Min FC"
                className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Max FC"
                className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          {/* Stock only */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="font-medium text-stone-700">En stock uniquement</span>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-emerald-700"
            />
          </div>

          {/* Promotions only */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-red-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-red-600" />
              Promotions uniquement
            </span>
            <input
              type="checkbox"
              checked={promoOnly}
              onChange={(e) => setPromoOnly(e.target.checked)}
              className="w-4 h-4 accent-red-600"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="md:col-span-3 space-y-4">
          {finalProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-800">
                Aucun produit ne correspond à cette recherche
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Essayez d'écrire un nom de produit plus général (ex: "chaussures", "téléphone") ou de réinitialiser vos filtres.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {finalProducts.map((p) => (
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
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="font-bold text-sm text-stone-900">Filtres</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700">Catégorie</label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              >
                <option value="ALL">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-stone-700">Prix en FC</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Min FC"
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Max FC"
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <span className="font-medium text-stone-700">En stock uniquement</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-emerald-700"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-red-700">Promotions uniquement</span>
              <input
                type="checkbox"
                checked={promoOnly}
                onChange={(e) => setPromoOnly(e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-col gap-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-emerald-800 text-white rounded-xl font-bold"
              >
                Voir les résultats ({finalProducts.length})
              </button>
              <button
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2 bg-stone-100 text-stone-700 rounded-xl font-semibold"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
