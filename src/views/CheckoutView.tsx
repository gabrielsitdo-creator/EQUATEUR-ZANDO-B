import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { DataStore } from '../services/storage';
import { DeliveryType, PaymentMethod, Order, formatPrice } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Store,
  Truck,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Banknote,
  Info,
  MessageCircle,
} from 'lucide-react';

interface CheckoutViewProps {
  onOrderSuccess: (order: Order) => void;
  onBack: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onOrderSuccess,
  onBack,
}) => {
  const { items, subtotal, deliveryType, setDeliveryType, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  // Form states
  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [clientWhatsapp, setClientWhatsapp] = useState(currentUser?.whatsapp || currentUser?.phone || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');

  // Address (free manual text input as required by Section 15, 27)
  const [city, setCity] = useState(currentUser?.city || 'Kinshasa');
  const [quartier, setQuartier] = useState(currentUser?.zone || 'Centre');
  const [streetDetails, setStreetDetails] = useState(
    currentUser?.address || 'Marché central ou domicile'
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = 0; // In V1, merchant & client agree directly or included
  const totalAmount = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Votre panier est vide</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
        >
          Retour au marché
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim()) {
      showToast('Formulaire incomplet', 'Veuillez renseigner votre nom et votre numéro de téléphone.', 'warning');
      return;
    }

    if (deliveryType === 'home_delivery' && (!city.trim() || !streetDetails.trim())) {
      showToast('Adresse requise', 'Veuillez saisir votre ville et votre adresse pour la livraison.', 'warning');
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const orderItems = items.map((it) => ({
      id: `item-${Date.now()}-${Math.random()}`,
      productId: it.product.id,
      productName: it.product.name,
      productImage: it.product.images[0],
      shopId: it.product.shopId,
      shopName: it.product.shopName,
      unitPrice: it.product.price,
      quantity: it.quantity,
      totalPrice: it.product.price * it.quantity,
      currency: it.product.currency || 'CDF',
      currency_code: it.product.currency || 'CDF',
    }));

    const result = DataStore.createOrder({
      clientId: currentUser?.id || `guest-${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientWhatsapp: clientWhatsapp.trim() || clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryType,
      deliveryAddress: {
        city: city.trim(),
        quartier: quartier.trim(),
        streetDetails: streetDetails.trim(),
        recipientName: clientName.trim(),
        recipientPhone: clientPhone.trim(),
        recipientWhatsapp: clientWhatsapp.trim() || clientPhone.trim(),
        deliveryInstructions: deliveryInstructions.trim(),
      },
      paymentMethod,
      notes: orderNotes.trim(),
    });

    setIsProcessing(false);
    clearCart();
    showToast(
      'Commande enregistrée !',
      `Votre commande ${result.order.orderNumber} a été transmise au commerçant.`,
      'success'
    );
    onOrderSuccess(result.order);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-emerald-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au panier</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Finaliser ma commande
          </h1>
        </div>

        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>ENVIRONNEMENT DE PAIEMENT TEST</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
          {/* Section 1: Informations Client & Mode de réception (Section 27) */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Vos Coordonnées & Mode de Réception
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Josephine Mbemba"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Téléphone d'appel <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+243..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Numéro WhatsApp (recommandé en RDC)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={clientWhatsapp}
                    onChange={(e) => setClientWhatsapp(e.target.value)}
                    placeholder="+243..."
                    className="w-full pl-8 pr-2.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                  />
                  <MessageCircle className="w-4 h-4 text-emerald-700 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Email (Facultatif)</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@mail.cd"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                />
              </div>
            </div>

            {/* Mode de réception (Section 27) */}
            <div className="pt-2 space-y-2 text-xs">
              <label className="font-bold text-stone-800 block">
                Mode de réception du colis :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setDeliveryType('home_delivery')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryType === 'home_delivery'
                      ? 'border-emerald-800 bg-emerald-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <Truck className="w-4 h-4 text-emerald-800" />
                    <span>Livraison</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                    Le commerçant organise lui-même l'acheminement de votre colis à votre adresse.
                  </p>
                </div>

                <div
                  onClick={() => setDeliveryType('market_pickup')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryType === 'market_pickup'
                      ? 'border-emerald-800 bg-emerald-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-800" />
                      <span>Retrait commerçant</span>
                    </div>
                    <span className="text-emerald-700 font-black text-[10px] uppercase">
                      Gratuit
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                    Vous récupérez le colis directement auprès du stand/boutique du vendeur.
                  </p>
                </div>
              </div>
            </div>

            {/* Address fields if Livraison */}
            {deliveryType === 'home_delivery' && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Ville de destination <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Karawa, Mbandaka, Kinshasa..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Quartier
                    </label>
                    <input
                      type="text"
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value)}
                      placeholder="Ex: Quartier Mission, Bakusu..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Adresse précise & Repère connu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetDetails}
                    onChange={(e) => setStreetDetails(e.target.value)}
                    placeholder="Ex: En face de l’église, avenue principale n° 14"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Instructions particulières pour la livraison :
                  </label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="Ex: Appeler avant d'arriver, confier au motard habituel..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Paiement */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Moyen de Paiement
            </h2>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'mpesa'
                    ? 'border-red-600 bg-red-50/50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <span className="font-bold text-stone-900">Vodacom M-Pesa (Mode Test)</span>
                {paymentMethod === 'mpesa' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
              </div>

              <div
                onClick={() => setPaymentMethod('airtel')}
                className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'airtel'
                    ? 'border-red-700 bg-red-50/50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <span className="font-bold text-stone-900">Airtel Money (Mode Test)</span>
                {paymentMethod === 'airtel' && <CheckCircle2 className="w-4 h-4 text-red-700" />}
              </div>

              <div
                onClick={() => setPaymentMethod('orange')}
                className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'orange'
                    ? 'border-orange-500 bg-orange-50/50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <span className="font-bold text-stone-900">Orange Money (Mode Test)</span>
                {paymentMethod === 'orange' && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
              </div>

              <div
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-emerald-800 bg-emerald-50/50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <span className="font-bold text-stone-900">Paiement en espèces à la réception</span>
                {paymentMethod === 'cash_on_delivery' && <CheckCircle2 className="w-4 h-4 text-emerald-800" />}
              </div>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 text-[11px] leading-relaxed">
              <strong>Mise en relation directe :</strong> Le commerçant prendra contact avec vous dès réception de la commande pour confirmer l'expédition de votre colis.
            </div>
          </div>
        </div>

        {/* Sidebar Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="font-black text-base text-stone-900 tracking-tight pb-3 border-b border-stone-100">
            Articles de la commande
          </h2>

          <div className="max-h-60 overflow-y-auto space-y-2 text-xs divide-y divide-stone-100 pr-1">
            {items.map((it) => (
              <div key={it.product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-stone-900 truncate">{it.product.name}</div>
                  <div className="text-stone-400 text-[11px]">{it.product.shopName} ({it.product.city})</div>
                </div>
                <div className="font-bold text-stone-900 flex-shrink-0">
                  {it.quantity} x {formatPrice(it.product.price, it.product.currency)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Mode de réception :</span>
              <span className="font-semibold text-stone-800">
                {deliveryType === 'market_pickup' ? 'Retrait chez commerçant (Gratuit)' : 'Livraison directe'}
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200 space-y-1">
              <span className="font-black text-sm text-stone-900 block">Total à payer :</span>
              {Array.from(new Set(items.map((it) => it.product.currency || 'CDF'))).map((cur) => {
                const curTotal = items
                  .filter((it) => (it.product.currency || 'CDF') === cur)
                  .reduce((sum, it) => sum + it.product.price * it.quantity, 0);
                return (
                  <div key={cur} className="flex justify-between items-baseline">
                    <span className="text-xs text-stone-500 font-semibold">Devise {cur} :</span>
                    <span className="font-black text-xl text-emerald-950">
                      {formatPrice(curTotal, cur)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
          >
            {isProcessing ? (
              <span>Transmission de la commande...</span>
            ) : (
              <>
                <span>Confirmer ma commande</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center text-[11px] text-stone-400">
            Support assistance : +243 833358006
          </div>
        </div>
      </div>
    </div>
  );
};
