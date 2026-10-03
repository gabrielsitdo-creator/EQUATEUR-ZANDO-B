import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, ShoppingBag, Store, ShieldCheck, ArrowLeft } from 'lucide-react';

interface CartViewProps {
  onNavigate: (view: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({ onNavigate }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    totalAmount,
    deliveryType,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">
          Votre panier est vide
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Découvrez les meilleurs poissons fumés, pagnes Super Wax, kits solaires et vivres frais des marchés de l'Équateur.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-3 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-sm"
        >
          Découvrir les produits
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Mon Panier ({items.length} article(s))
          </h1>
          <p className="text-xs text-stone-500">
            Articles sélectionnés auprès des commerçants de l'Équateur
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-800 font-semibold"
        >
          Vider le panier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="p-4 bg-white border border-stone-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-stone-100 flex-shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-stone-900 line-clamp-1">
                    {item.product.name}
                  </h3>
                  <div className="text-xs text-stone-500 flex items-center gap-1">
                    <Store className="w-3 h-3 text-stone-400" />
                    <span>{item.product.shopName}</span>
                    <span>·</span>
                    <span>{item.product.city}</span>
                  </div>
                  <div className="font-black text-sm text-emerald-900">
                    {item.product.price.toLocaleString('fr-FR')} FC
                  </div>
                </div>
              </div>

              {/* Quantity control & Subtotal */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-stone-900 bg-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <div className="text-xs text-stone-400">Total</div>
                  <div className="font-black text-sm text-stone-900">
                    {(item.product.price * item.quantity).toLocaleString('fr-FR')} FC
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continuer mes achats sur EQUATEUR ZANDO</span>
          </button>
        </div>

        {/* Order Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <h2 className="font-black text-base text-stone-900 tracking-tight pb-3 border-b border-stone-100">
            Résumé de la commande
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Sous-total articles :</span>
              <span className="font-bold text-stone-900">
                {subtotal.toLocaleString('fr-FR')} FC
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Mode de réception :</span>
              <span className="font-semibold text-stone-800">
                {deliveryType === 'market_pickup'
                  ? 'Retrait au marché (Gratuit)'
                  : 'Livraison Moto'}
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Frais de livraison estimés :</span>
              <span className="font-bold text-stone-900">
                {deliveryFee === 0 ? 'GRATUIT' : `${deliveryFee.toLocaleString('fr-FR')} FC`}
              </span>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="font-black text-sm text-stone-900">Total à payer :</span>
              <span className="font-black text-xl text-emerald-950">
                {totalAmount.toLocaleString('fr-FR')} FC
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="w-full py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <span>Passer la commande</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Paiement sécurisé Mobile Money (M-Pesa, Airtel) ou Cash à la livraison.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
