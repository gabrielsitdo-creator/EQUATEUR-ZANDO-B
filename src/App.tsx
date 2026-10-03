import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataStore } from './services/storage';
import { Product, Shop, Order, City, Market, Category } from './types';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AIAssistantModal } from './components/AIAssistantModal';

// Views
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { ShopDetailView } from './views/ShopDetailView';
import { ShopsView } from './views/ShopsView';
import { MarketsView } from './views/MarketsView';
import { PromotionsView } from './views/PromotionsView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { ClientDashboardView } from './views/ClientDashboardView';
import { MerchantDashboardView } from './views/MerchantDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { RegisterMerchantView } from './views/RegisterMerchantView';

const MainAppContent: React.FC = () => {
  const { currentUser, role } = useAuth();

  // Navigation states
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Search and filter globals
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // AI Modal
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Database snapshot
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>(DataStore.getCategories());
  const [markets, setMarkets] = useState<Market[]>(DataStore.getMarkets());
  const [cities, setCities] = useState<City[]>(DataStore.getCities());

  const refreshData = () => {
    setProducts(DataStore.getProducts());
    setShops(DataStore.getShops());
    setCategories(DataStore.getCategories());
    setMarkets(DataStore.getMarkets());
    setCities(DataStore.getCities());
  };

  useEffect(() => {
    DataStore.init();
    refreshData();

    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener('eqz_storage_change', handleStorageChange);
    return () => window.removeEventListener('eqz_storage_change', handleStorageChange);
  }, []);

  const handleNavigate = (view: string, payload?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'order-tracking' && payload) {
      setActiveOrder(payload);
      setCurrentView('order-tracking');
      return;
    }

    if (view.startsWith('orders/')) {
      const orderId = view.replace('orders/', '');
      const ord = DataStore.getOrderById(orderId);
      if (ord) {
        setActiveOrder(ord);
        setCurrentView('order-tracking');
        return;
      }
    }

    setCurrentView(view);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    const shop = DataStore.getShopById(product.shopId);
    setSelectedShop(shop || null);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectShop = (shopId: string) => {
    const shop = DataStore.getShopById(shopId);
    if (shop) {
      setSelectedShop(shop);
      setCurrentView('shop-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMarket = (marketId: string) => {
    const mkt = markets.find((m) => m.id === marketId);
    if (mkt) {
      setSearchQuery(mkt.name);
      setCurrentView('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrderSuccess = (order: Order) => {
    setActiveOrder(order);
    setCurrentView('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-800 selection:text-white">
      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            shops={shops}
            categories={categories}
            markets={markets}
            onSelectProduct={handleSelectProduct}
            onSelectShop={handleSelectShop}
            onSelectCategory={handleSelectCategory}
            onSelectMarket={handleSelectMarket}
            onNavigate={handleNavigate}
            onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogView
            products={products}
            categories={categories}
            cities={cities}
            markets={markets}
            initialCategory={selectedCategory}
            initialSearch={searchQuery}
            initialCity={selectedCity}
            onSelectProduct={handleSelectProduct}
            onSelectShop={handleSelectShop}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            shop={selectedShop || undefined}
            onSelectShop={handleSelectShop}
            onSelectProduct={handleSelectProduct}
            onBack={() => setCurrentView('catalog')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'shop-detail' && selectedShop && (
          <ShopDetailView
            shop={selectedShop}
            onSelectProduct={handleSelectProduct}
            onBack={() => setCurrentView('shops')}
          />
        )}

        {currentView === 'shops' && (
          <ShopsView
            shops={shops}
            cities={cities}
            onSelectShop={handleSelectShop}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'markets' && (
          <MarketsView
            markets={markets}
            shops={shops}
            onSelectShop={handleSelectShop}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'promotions' && (
          <PromotionsView
            products={products}
            onSelectProduct={handleSelectProduct}
            onSelectShop={handleSelectShop}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'cart' && <CartView onNavigate={handleNavigate} />}

        {currentView === 'checkout' && (
          <CheckoutView
            onOrderSuccess={handleOrderSuccess}
            onBack={() => setCurrentView('cart')}
          />
        )}

        {(currentView === 'order-confirmation' || currentView === 'order-tracking') &&
          activeOrder && (
            <OrderConfirmationView
              order={activeOrder}
              onNavigate={handleNavigate}
            />
          )}

        {currentView === 'client-dashboard' && (
          <ClientDashboardView
            onSelectProduct={handleSelectProduct}
            onSelectShop={handleSelectShop}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'merchant-dashboard' && (
          <MerchantDashboardView
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'admin-dashboard' && <AdminDashboardView />}

        {(currentView === 'register-merchant' ||
          currentView === 'merchant-subscription' ||
          currentView === 'register-merchant-form' ||
          currentView === 'create-shop') && (
          <RegisterMerchantView
            initialStep="payment"
            onSuccess={() => setCurrentView('merchant-dashboard')}
            onBack={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigate={handleNavigate}
      />

      {/* Real-time Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <MainAppContent />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
