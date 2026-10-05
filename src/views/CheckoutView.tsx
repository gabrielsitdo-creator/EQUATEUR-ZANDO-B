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
  FileText,
  Wallet,
  Globe,
  CreditCard,
  Building,
  Lock,
  Download,
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

  const hasDigital = items.some((it) => it.product.productType === 'digital');
  const allDigital = items.every((it) => it.product.productType === 'digital');

  const primaryShopId = items[0]?.product.shopId;
  const merchantAccount = primaryShopId ? DataStore.getMerchantPaymentAccount(primaryShopId) : null;

  // Check accepted payment methods from cart items & merchant account
  const productAcceptedMethods: string[] = [];
  items.forEach((it) => {
    if (it.product.acceptedPaymentMethods && it.product.acceptedPaymentMethods.length > 0) {
      productAcceptedMethods.push(...it.product.acceptedPaymentMethods);
    }
  });

  const isMethodAllowed = (method: PaymentMethod): boolean => {
    // 1. Digital products cannot use cash on delivery
    if (method === 'cash_on_delivery' && allDigital) return false;

    // 2. If product specifically declared accepted methods, it must match
    if (productAcceptedMethods.length > 0 && !productAcceptedMethods.includes(method)) {
      return false;
    }

    // 3. Merchant account configurations
    if (merchantAccount) {
      if (method === 'saspay' && merchantAccount.saspayEnabled === false) return false;
      if (
        (method === 'mpesa' || method === 'airtel' || method === 'orange') &&
        merchantAccount.directMobileMoneyEnabled === false &&
        !merchantAccount.mpesaNumber &&
        !merchantAccount.airtelNumber &&
        !merchantAccount.orangeNumber
      ) {
        return false;
      }
      if (method === 'paypal' && !merchantAccount.paypalEnabled && !merchantAccount.paypalEmail) {
        return false;
      }
      if (
        method === 'bank_transfer' &&
        !merchantAccount.bankEnabled &&
        !merchantAccount.bankAccountNumber
      ) {
        return false;
      }
    }

    return true;
  };

  const initialMethod: PaymentMethod = isMethodAllowed('saspay')
    ? 'saspay'
    : isMethodAllowed('mpesa')
    ? 'mpesa'
    : isMethodAllowed('airtel')
    ? 'airtel'
    : isMethodAllowed('orange')
    ? 'orange'
    : isMethodAllowed('paypal')
    ? 'paypal'
    : isMethodAllowed('bank_transfer')
    ? 'bank_transfer'
    : 'cash_on_delivery';

  // Form states
  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [clientWhatsapp, setClientWhatsapp] = useState(
    currentUser?.whatsapp || currentUser?.phone || ''
  );
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');

  // Address (free manual text input)
  const [city, setCity] = useState(currentUser?.city || 'Kinshasa');
  const [quartier, setQuartier] = useState(currentUser?.zone || 'Centre');
  const [streetDetails, setStreetDetails] = useState(
    currentUser?.address || 'Marché central ou domicile'
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Payment (default to first available allowed method)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialMethod);
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = 0; // Pas de frais cachés
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
      showToast(
        'Formulaire incomplet',
        'Veuillez renseigner votre nom et votre numéro de téléphone.',
        'warning'
      );
      return;
    }

    if (hasDigital && !clientEmail.trim()) {
      showToast(
        'Email requis',
        'Veuillez renseigner votre adresse email pour recevoir vos accès et liens de téléchargement sécurisés.',
        'warning'
      );
      return;
    }

    if (!allDigital && deliveryType === 'home_delivery' && (!city.trim() || !streetDetails.trim())) {
      showToast(
        'Adresse requise',
        'Veuillez saisir votre ville et votre adresse pour la livraison physique.',
        'warning'
      );
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const finalDeliveryType: DeliveryType = allDigital
      ? 'digital_instant'
      : deliveryType;

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
      productType: it.product.productType || 'physical',
      digitalType: it.product.digitalType,
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
      deliveryType: finalDeliveryType,
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
      'Commande enregistrée avec succès !',
      allDigital
        ? `Commande ${result.order.orderNumber} validée. Accédez immédiatement à vos téléchargements.`
        : `Votre commande ${result.order.orderNumber} a été transmise au commerçant.`,
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

        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>PAIEMENT DIRECT COMMERÇANT SÉCURISÉ</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
          {/* Avertissement Digital si applicable */}
          {hasDigital && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs">
              <FileText className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-black text-blue-950 block">
                  Votre commande inclut des produits digitaux
                </span>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  Dès confirmation de votre règlement direct au vendeur, vous recevrez un accès immédiat et sécurisé pour télécharger vos fichiers ou visionner vos cours.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Informations Client & Mode de réception */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Vos Coordonnées & Réception
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
                  Téléphone <span className="text-red-500">*</span>
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
                  Numéro WhatsApp (recommandé)
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
                <label className="font-bold text-stone-700 block mb-1">
                  Email {hasDigital && <span className="text-red-500">* (Requis pour produits digitaux)</span>}
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="votre-email@domaine.cd"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                  required={hasDigital}
                />
              </div>
            </div>

            {/* Mode de réception (Si produits physiques) */}
            {!allDigital ? (
              <div className="pt-2 space-y-2 text-xs">
                <label className="font-bold text-stone-800 block">
                  Mode de réception des colis physiques :
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
                      <span>Livraison directe</span>
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
                        <span>Retrait stand vendeur</span>
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
                          placeholder="Ex: Kinshasa, Mbandaka, Goma..."
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Quartier</label>
                        <input
                          type="text"
                          value={quartier}
                          onChange={(e) => setQuartier(e.target.value)}
                          placeholder="Ex: Quartier Gombe, Bakusu..."
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
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-700" />
                  Mode : Téléchargement & Accès Digital Instantané
                </span>
                <span className="text-emerald-700 font-black text-[10px] uppercase">
                  Sans frais de port
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Moyen de Paiement (Faire sortir SASPAY.me Mobile Money) */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Moyen de Paiement Direct au Vendeur
              </h2>
              <span className="text-[10px] text-stone-500 font-semibold">
                Zéro intermédiaire financier
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Option 1: SASPAY.ME MOBILE MONEY (MIS EN VALEUR) */}
              {isMethodAllowed('saspay') && (
                <div
                  onClick={() => setPaymentMethod('saspay')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'saspay'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/10'
                      : 'border-stone-200 hover:border-blue-300 bg-stone-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xs">
                        SAS
                      </span>
                      <div>
                        <span className="font-black text-stone-900 text-sm block">
                          SASPAY.me — Mobile Money & Cartes Directes
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Airtel Money · Vodacom M-Pesa · Orange Money · Visa / Mastercard
                        </span>
                      </div>
                    </div>
                    {paymentMethod === 'saspay' ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-700" />
                    ) : (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Recommandé
                      </span>
                    )}
                  </div>

                  {paymentMethod === 'saspay' && (
                    <div className="mt-3 pt-3 border-t border-blue-200/80 text-[11px] text-blue-950 space-y-1">
                      <p className="leading-snug">
                        Paiement direct sécurisé au vendeur via la passerelle <strong>SasPay.me</strong>.
                        {merchantAccount?.saspayMerchantId && (
                          <span> Identifiant Marchand : <strong>{merchantAccount.saspayMerchantId}</strong></span>
                        )}
                      </p>
                      <span className="text-[10px] text-emerald-800 font-bold block">
                        ✓ Confirmation instantanée et délivrance immédiate de la commande.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Option 2: Mobile Money Direct RDC */}
              {isMethodAllowed('mpesa') && (
                <div
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-red-600 bg-red-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-stone-900">
                      Vodacom M-Pesa Direct (Compte Vendeur)
                    </span>
                  </div>
                  {paymentMethod === 'mpesa' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                </div>
              )}

              {isMethodAllowed('airtel') && (
                <div
                  onClick={() => setPaymentMethod('airtel')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'airtel'
                      ? 'border-red-700 bg-red-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-red-700" />
                    <span className="font-bold text-stone-900">
                      Airtel Money Direct (Compte Vendeur)
                    </span>
                  </div>
                  {paymentMethod === 'airtel' && <CheckCircle2 className="w-4 h-4 text-red-700" />}
                </div>
              )}

              {isMethodAllowed('orange') && (
                <div
                  onClick={() => setPaymentMethod('orange')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'orange'
                      ? 'border-orange-500 bg-orange-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-stone-900">
                      Orange Money Direct (Compte Vendeur)
                    </span>
                  </div>
                  {paymentMethod === 'orange' && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                </div>
              )}

              {/* Option 3: PayPal (si commerçant activé) */}
              {isMethodAllowed('paypal') && (
                <div
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-700 bg-blue-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-stone-900">
                      PayPal Direct (Compte Vendeur)
                    </span>
                  </div>
                  {paymentMethod === 'paypal' && <CheckCircle2 className="w-4 h-4 text-blue-700" />}
                </div>
              )}

              {/* Option 4: Virement bancaire */}
              {isMethodAllowed('bank_transfer') && (
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-stone-800 bg-stone-100'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-stone-800" />
                    <span className="font-bold text-stone-900">
                      Virement Bancaire (Compte Vendeur)
                    </span>
                  </div>
                  {paymentMethod === 'bank_transfer' && (
                    <CheckCircle2 className="w-4 h-4 text-stone-800" />
                  )}
                </div>
              )}

              {/* Option 5: Paiement à la livraison (Uniquement si article physique) */}
              {isMethodAllowed('cash_on_delivery') && (
                <div
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-emerald-800 bg-emerald-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-800" />
                    <span className="font-bold text-stone-900">
                      Paiement en espèces à la livraison / retrait
                    </span>
                  </div>
                  {paymentMethod === 'cash_on_delivery' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  )}
                </div>
              )}
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 text-[11px] leading-relaxed">
              <strong>Transparence & Sécurité :</strong> Aucun fonds ne transite par les comptes de la marketplace. Le paiement s'effectue directement auprès du commerçant.
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
              <div
                key={it.product.id}
                className="pt-2 first:pt-0 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-bold text-stone-900 truncate">{it.product.name}</div>
                  <div className="text-stone-400 text-[11px] flex items-center gap-1.5">
                    <span>{it.product.shopName}</span>
                    {it.product.productType === 'digital' && (
                      <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                        Digital
                      </span>
                    )}
                  </div>
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
                {allDigital
                  ? 'Téléchargement digital immédiat'
                  : deliveryType === 'market_pickup'
                  ? 'Retrait au marché (Gratuit)'
                  : 'Livraison physique'}
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
                    <span className="text-xs text-stone-500 font-semibold">Total ({cur}) :</span>
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
            className="w-full py-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <span>{isProcessing ? 'Validation en cours...' : 'VALIDER ET PAYER LE COMMERÇANT'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
