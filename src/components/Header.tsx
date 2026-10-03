import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole } from '../types';
import { DataStore } from '../services/storage';
import {
  ShoppingBag,
  Bell,
  Search,
  Menu,
  X,
  Store,
  User,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Flame,
  LayoutDashboard,
  LogOut,
  AlertCircle,
  CreditCard,
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, payload?: any) => void;
  onOpenAIAssistant: () => void;
  onOpenReportModal?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  selectedCity?: string;
  setSelectedCity?: (city: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAIAssistant,
  onOpenReportModal,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  selectedCity,
  setSelectedCity,
}) => {
  const { currentUser, role, logout, switchRole, hasActiveSubscription, userShop } = useAuth();
  const { itemCount } = useCart();
  const { unreadCount, notifications, markAsRead } = useNotification();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    } else {
      onNavigate('catalog');
    }
  };

  const handleOpenShopClick = () => {
    if (userShop) {
      onNavigate('merchant-dashboard');
    } else {
      onNavigate('register-merchant');
    }
  };

  const getRoleBadgeStyle = (r: UserRole | null) => {
    switch (r) {
      case 'ADMINISTRATEUR':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'COMMERÇANT':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      {/* Top Banner: Slogan & Quick Role Switcher */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Main platform message as required by Section 23 */}
          <div className="flex items-center gap-2 font-medium">
            <span className="text-amber-400 font-extrabold uppercase tracking-wider text-[10px]">
              LE GRAND MARCHÉ DE LA RDC ET L’AFRIQUE
            </span>
            <span className="hidden sm:inline text-stone-500">|</span>
            <span className="hidden md:inline text-stone-300 text-[11px]">
              « C'est le moment de faire la promotion de votre marchandise partout où tu es. »
            </span>
          </div>

          {/* Quick Demo Switcher (CLIENT, COMMERÇANT, ADMINISTRATEUR) */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-stone-400 text-[11px] hidden sm:inline">
              Mode Démo (Rôle) :
            </span>
            {(['CLIENT', 'COMMERÇANT', 'ADMINISTRATEUR'] as UserRole[]).map((r) => {
              const isActive = role === r;
              return (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-stone-950 shadow-xs'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                  title={`Basculer en rôle ${r}`}
                >
                  {r === 'ADMINISTRATEUR' ? 'ADMIN' : r}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
          >
            <img
              src={DataStore.getMarketLogo()}
              alt="Logo EQUATEUR ZANDO MARKET"
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-emerald-700 bg-white/10"
            />
            <div className="flex flex-col">
              <span className="font-black text-lg md:text-xl tracking-tight text-stone-900 leading-tight">
                EQUATEUR <span className="text-emerald-800">ZANDO MARKET</span>
              </span>
              <span className="text-[10px] text-stone-500 font-semibold tracking-wide">
                Grand Marché Ouvert · RDC & Afrique
              </span>
            </div>
          </div>

          {/* Search Bar (Central requirement, Sections 9, 10, 11, 12, 13) */}
          <form
            onSubmit={handleSubmit}
            className="hidden md:flex flex-1 max-w-2xl items-center relative"
          >
            <div className="flex items-center w-full border-2 border-stone-300 rounded-xl bg-stone-50/70 hover:border-emerald-600 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-700/10 transition-all overflow-hidden shadow-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une ville ou une boutique..."
                className="w-full px-4 py-2.5 text-sm bg-transparent outline-hidden text-stone-900 placeholder-stone-400 font-medium"
              />

              <button
                type="submit"
                className="bg-emerald-800 text-white px-5 py-2.5 hover:bg-emerald-900 transition-colors flex items-center justify-center h-full font-bold text-xs"
                title="Rechercher"
              >
                <Search className="w-4 h-4 mr-1.5" />
                <span>Rechercher</span>
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant */}
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-xs"
              title="Assistant IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span className="hidden sm:inline">Assistant IA</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="relative p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                    <span className="font-bold text-xs text-stone-800">Notifications</span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {notifications.length} message(s)
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-stone-500">
                        Aucune notification pour le moment.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.linkUrl) onNavigate(n.linkUrl.replace('/', ''));
                            setNotifMenuOpen(false);
                          }}
                          className={`p-3 cursor-pointer hover:bg-stone-50 transition-colors ${
                            !n.isRead ? 'bg-emerald-50/50 font-medium' : ''
                          }`}
                        >
                          <div className="font-semibold text-stone-900">{n.title}</div>
                          <div className="text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
              title="Panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors bg-white text-stone-800"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                  {currentUser?.name.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-stone-900 leading-none truncate max-w-[120px]">
                    {currentUser?.name || 'Mon Compte'}
                  </span>
                  <span className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-wide">
                    {role || 'Invité'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-stone-100 bg-stone-50">
                    <div className="font-bold text-xs text-stone-900 truncate">
                      {currentUser?.name}
                    </div>
                    <div className="text-[11px] text-stone-500">{currentUser?.phone}</div>
                    <div className="mt-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeStyle(
                          role
                        )}`}
                      >
                        {role}
                      </span>
                    </div>
                  </div>

                  <div className="p-1 text-xs text-stone-700 flex flex-col">
                    {role === 'CLIENT' && (
                      <button
                        onClick={() => {
                          onNavigate('client-dashboard');
                          setRoleMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 text-left font-medium"
                      >
                        <User className="w-4 h-4 text-emerald-700" />
                        Mes commandes & Profil
                      </button>
                    )}

                    {role === 'COMMERÇANT' && (
                      <>
                        <button
                          onClick={() => {
                            onNavigate('merchant-dashboard');
                            setRoleMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 text-left font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                          Dashboard Commerçant
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('merchant-subscription');
                            setRoleMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 text-left font-medium"
                        >
                          <CreditCard className="w-4 h-4 text-amber-600" />
                          Mon Abonnement (4 $/mois)
                        </button>
                      </>
                    )}

                    {role === 'ADMINISTRATEUR' && (
                      <button
                        onClick={() => {
                          onNavigate('admin-dashboard');
                          setRoleMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 text-left font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-700" />
                        Administration Centrale
                      </button>
                    )}

                    <button
                      onClick={() => {
                        handleOpenShopClick();
                        setRoleMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 text-left font-medium"
                    >
                      <Store className="w-4 h-4 text-stone-600" />
                      {userShop ? 'Gérer ma boutique' : 'Ouvrir ma boutique (4 $/mois)'}
                    </button>

                    <button
                      onClick={() => {
                        onOpenReportModal?.();
                        setRoleMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-700 text-left font-medium"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Signaler un problème
                    </button>

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setRoleMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 text-stone-500 text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 rounded-lg hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <form onSubmit={handleSubmit} className="mt-3 md:hidden">
          <div className="flex items-center w-full border-2 border-stone-300 rounded-xl bg-stone-50 overflow-hidden shadow-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit, une ville ou une boutique..."
              className="w-full px-3 py-2 text-xs bg-transparent outline-hidden text-stone-900"
            />
            <button
              type="submit"
              className="bg-emerald-800 text-white px-3.5 py-2 flex items-center justify-center font-bold text-xs"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation Sub-Bar (Desktop) - Section 30 simplified */}
      <nav className="hidden md:block bg-stone-50 border-t border-stone-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-6 font-medium py-2.5">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-emerald-800 transition-colors ${
                currentView === 'home'
                  ? 'text-emerald-800 font-black border-b-2 border-emerald-800 pb-0.5'
                  : 'text-stone-600'
              }`}
            >
              Accueil
            </button>

            <button
              onClick={() => onNavigate('catalog')}
              className={`hover:text-emerald-800 transition-colors ${
                currentView === 'catalog'
                  ? 'text-emerald-800 font-black border-b-2 border-emerald-800 pb-0.5'
                  : 'text-stone-600'
              }`}
            >
              Tous les Produits
            </button>

            <button
              onClick={() => onNavigate('promotions')}
              className={`flex items-center gap-1 text-red-600 font-bold hover:text-red-700 transition-colors ${
                currentView === 'promotions' ? 'border-b-2 border-red-600 pb-0.5' : ''
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-red-600" />
              Produits Promotionnels
            </button>

            <button
              onClick={() => onNavigate('catalog')}
              className="text-stone-600 hover:text-emerald-800 transition-colors"
            >
              Catégories
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenShopClick}
              className="text-emerald-800 font-bold hover:text-emerald-950 flex items-center gap-1.5 py-1 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Ouvrir ma boutique (4 $/mois)</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 p-4 space-y-3 animate-in fade-in text-sm font-medium">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-stone-50"
            >
              Accueil
            </button>
            <button
              onClick={() => {
                onNavigate('catalog');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-stone-50"
            >
              Tous les Produits
            </button>
            <button
              onClick={() => {
                onNavigate('promotions');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg text-red-600 font-bold flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 fill-red-600" />
              Produits Promotionnels
            </button>
            <button
              onClick={() => {
                handleOpenShopClick();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg bg-emerald-50 text-emerald-900 font-bold flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              Ouvrir ma boutique (4 $/mois)
            </button>
            <button
              onClick={() => {
                onOpenReportModal?.();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg text-red-600 font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Signaler un problème
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
