import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { DataStore } from '../services/storage';
import { City, Market, PaymentMethod, SubscriptionStatus } from '../types';
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Lock,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Upload,
  Check,
  Zap,
} from 'lucide-react';

interface RegisterMerchantViewProps {
  initialStep?: 'payment' | 'form';
  onSuccess: () => void;
  onBack: () => void;
}

export const RegisterMerchantView: React.FC<RegisterMerchantViewProps> = ({
  initialStep = 'payment',
  onSuccess,
  onBack,
}) => {
  const { currentUser, registerMerchant } = useAuth();
  const { showToast } = useNotification();
  const settings = DataStore.getSettings();

  const categories = DataStore.getCategories();
  const cities = DataStore.getCities();
  const markets = DataStore.getMarkets();

  // Check if current user already has an active PAID subscription
  const hasPaid = currentUser ? DataStore.hasActivePaidSubscription(currentUser.id) : false;

  // Flow steps: 'payment' | 'verifying' | 'confirmed' | 'create_shop'
  const [currentStep, setCurrentStep] = useState<'payment' | 'verifying' | 'confirmed' | 'create_shop'>(() => {
    if (hasPaid && initialStep !== 'payment') {
      return 'create_shop';
    }
    return 'payment';
  });

  // Auto-redirect to Step 5 (CRÉATION DE MA BOUTIQUE) after confirmed payment
  useEffect(() => {
    if (currentStep === 'confirmed') {
      const timer = setTimeout(() => {
        setCurrentStep('create_shop');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Mobile Money Payment States (Steps 2, 3, 4)
  const [currency, setCurrency] = useState<'USD' | 'FC'>('USD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [payerPhone, setPayerPhone] = useState(currentUser?.phone || '+243');
  const [payerName, setPayerName] = useState(currentUser?.name || '');
  const [projectedShopName, setProjectedShopName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<SubscriptionStatus>('PENDING');
  const [transactionRef, setTransactionRef] = useState('');
  const [createdSubId, setCreatedSubId] = useState<string>('');

  // Shop Creation Form States (Step 5)
  const [ownerName, setOwnerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+243');
  const [whatsapp, setWhatsapp] = useState(currentUser?.phone || '+243');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState(projectedShopName);
  const [category, setCategory] = useState(categories[0]?.name || 'Alimentation & Vivres');
  const [city, setCity] = useState('Kinshasa');
  const [territory, setTerritory] = useState('Gombe');
  const [zone, setZone] = useState('Centre Commercial');
  const [marketName, setMarketName] = useState('Grand Marché Central');
  const [standNumber, setStandNumber] = useState('');
  const [description, setDescription] = useState('');
  const [shopLogoUrl, setShopLogoUrl] = useState('');
  const [shopBannerUrl, setShopBannerUrl] = useState('');

  // Platform receiver number for selected operator
  const platformReceiverNumber =
    paymentMethod === 'mpesa'
      ? settings.mobileMoneyAccounts?.mpesaNumber || '+243 820 000 000'
      : paymentMethod === 'airtel'
      ? settings.mobileMoneyAccounts?.airtelNumber || '+243 990 000 000'
      : settings.mobileMoneyAccounts?.orangeNumber || '+243 890 000 000';

  const platformAccountName = settings.mobileMoneyAccounts?.accountName || 'MARCHE LUMUMBA RDC SARL';

  // STEP 3: Handle Mobile Money Payment Initiation
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!payerPhone.trim() || payerPhone.length < 10) {
      showToast('Numéro invalide', 'Veuillez saisir un numéro Mobile Money valide.', 'warning');
      return;
    }

    const userId = currentUser?.id || `user-merchant-${Date.now()}`;
    const initiatedSub = DataStore.initiateSubscriptionPayment({
      userId,
      userName: payerName || currentUser?.name || 'Commerçant Partenaire',
      phone: payerPhone.trim(),
      shopName: projectedShopName.trim() || 'Boutique en création',
      paymentMethod,
      currency,
    });

    setCreatedSubId(initiatedSub.id);
    setTransactionRef(initiatedSub.transactionRef);
    setPaymentStatus('PENDING');
    setCurrentStep('verifying');

    showToast(
      'Demande de paiement envoyée',
      'Veuillez confirmer sur votre téléphone la transaction Mobile Money de 4 $ (ou 11 000 FC).',
      'info'
    );
  };

  // STEP 4: Confirm Mobile Money Payment
  const handleConfirmPaymentSuccess = () => {
    if (!createdSubId) return;

    const confirmed = DataStore.confirmSubscriptionPayment(createdSubId, transactionRef);
    if (confirmed) {
      setPaymentStatus('PAID');
      setCurrentStep('confirmed');
      setShopName(projectedShopName);
      setOwnerName(payerName || currentUser?.name || '');
      setPhone(payerPhone);
      setWhatsapp(payerPhone);

      showToast(
        'Paiement confirmé avec succès ! 🎉',
        'Votre abonnement boutique (4 $/mois) est validé. Vous pouvez maintenant configurer votre boutique.',
        'success'
      );
    }
  };

  const handleSimulatePaymentFailure = (status: 'FAILED' | 'CANCELLED') => {
    if (createdSubId) {
      DataStore.updateSubscriptionStatus(createdSubId, status);
    }
    setPaymentStatus(status);
    showToast(
      status === 'FAILED' ? 'Paiement échoué' : 'Paiement annulé',
      'Le paiement n’a pas abouti. Veuillez réessayer.',
      'error'
    );
  };

  const handleRetryPayment = () => {
    setPaymentStatus('PENDING');
    setCurrentStep('payment');
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setShopLogoUrl(event.target?.result as string);
        showToast('Logo chargé', 'Aperçu du logo disponible.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Banner Upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setShopBannerUrl(event.target?.result as string);
        showToast('Bannière chargée', 'Aperçu de la bannière disponible.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // STEP 5: Finalize Shop Creation Form
  const handleSubmitShop = (e: React.FormEvent) => {
    e.preventDefault();

    // STRICT CHECK: Cannot create shop without verified payment
    const canCreate = paymentStatus === 'PAID' || hasPaid;
    if (!canCreate) {
      showToast(
        'Paiement requis',
        'RÈGLE DU SYSTÈME : Vous devez obligatoirement confirmer le paiement Mobile Money de 4 $/mois avant de créer votre boutique.',
        'error'
      );
      setCurrentStep('payment');
      return;
    }

    if (!ownerName.trim() || !phone.trim() || !shopName.trim() || !standNumber.trim()) {
      showToast('Formulaire incomplet', 'Veuillez renseigner tous les champs obligatoires (*)', 'warning');
      return;
    }

    if (password && password !== confirmPassword) {
      showToast('Erreur mot de passe', 'Les deux mots de passe ne correspondent pas.', 'error');
      return;
    }

    registerMerchant({
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim() || `${phone.replace(/[^0-9]/g, '')}@marchelumumba.cd`,
      shopName: shopName.trim(),
      category,
      city: city.trim(),
      territory: territory.trim(),
      zone: zone.trim(),
      address: `Stand ${standNumber.trim()}, ${marketName}`,
      marketName,
      standNumber: standNumber.trim(),
      description: description.trim() || `Boutique officielle ${shopName} au marché ${marketName}.`,
      logoUrl: shopLogoUrl,
      bannerUrl: shopBannerUrl,
    });

    showToast(
      'Boutique créée et activée avec succès ! 🎉',
      `Bienvenue sur MARCHE LUMUMBA RDC, la boutique ${shopName} est maintenant active et visible en ligne.`,
      'success'
    );

    onSuccess();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Step Header Indicator */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl border border-stone-800 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
          <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>OUVERTURE DE BOUTIQUE COMMERÇANT & CRÉATEUR</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Ouvrez votre boutique sur <span className="text-emerald-400">MARCHE LUMUMBA RDC</span>
        </h1>
        <p className="text-amber-300 font-bold text-xs uppercase tracking-wider">
          Et partout en Afrique 🇨🇩 🌍
        </p>

        <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
          Exposez vos produits physiques et digitaux partout en RDC et en Afrique. Tarif : 4 $ / mois pour une visibilité illimitée.
        </p>

        {/* Stepper visual */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold">
          <div
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
              currentStep === 'payment' || currentStep === 'verifying'
                ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300'
                : 'bg-emerald-800 text-white'
            }`}
          >
            <span>1. Paiement Mobile Money (4 $)</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-stone-500" />

          <div
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
              currentStep === 'confirmed' || currentStep === 'create_shop'
                ? 'bg-emerald-500 text-stone-950 font-black ring-2 ring-emerald-300'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            <span>2. Informations de ma boutique</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ÉTAPE 2 : PAIEMENT DE LA BOUTIQUE (MOBILE MONEY OBLIGATOIRE) */}
      {/* ========================================================================= */}
      {currentStep === 'payment' && (
        <div className="bg-white border-2 border-emerald-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Paiement obligatoire avant ouverture</span>
              </div>
              <h2 className="text-xl font-black text-stone-900 mt-1">
                PAIEMENT DE LA BOUTIQUE
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Veuillez effectuer votre paiement Mobile Money pour débloquer la création de votre boutique.
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-right flex-shrink-0">
              <div className="text-[11px] font-bold text-stone-500">Prix de la boutique :</div>
              <div className="text-2xl font-black text-emerald-950">
                {currency === 'USD' ? '4 $ USD' : `${settings.subscriptionPriceFc.toLocaleString('fr-FR')} FC`}
              </div>
              <div className="text-[10px] font-semibold text-emerald-700">Abonnement 1 mois</div>
            </div>
          </div>

          <form onSubmit={handleInitiatePayment} className="space-y-5 text-xs">
            {/* Devise Toggle */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-800 block">
                Devise disponible :
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    currency === 'USD'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Dollars Américains (4 $)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('FC')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    currency === 'FC'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Francs Congolais (~{settings.subscriptionPriceFc.toLocaleString('fr-FR')} FC)
                </button>
              </div>
            </div>

            {/* Opérateur Mobile Money */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-800 block">
                Opérateur Mobile Money <span className="text-red-500">*</span> :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'mpesa', name: 'Vodacom M-Pesa', color: 'border-red-500' },
                  { id: 'airtel', name: 'Airtel Money', color: 'border-red-600' },
                  { id: 'orange', name: 'Orange Money', color: 'border-orange-500' },
                  { id: 'cash_on_delivery', name: 'Afrimoney', color: 'border-blue-500' },
                ].map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setPaymentMethod(op.id as any)}
                    className={`p-3 rounded-2xl border-2 text-left font-bold transition-all cursor-pointer ${
                      paymentMethod === op.id
                        ? 'border-emerald-800 bg-emerald-50/70 text-emerald-950 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{op.name}</span>
                      {paymentMethod === op.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro de téléphone Mobile Money */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Votre numéro de téléphone Mobile Money <span className="text-red-500">*</span> :
                </label>
                <input
                  type="text"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="+243 820 123 456"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold"
                  required
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Numéro débité pour le paiement de 4 $ (ou 11 000 FC)
                </span>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Nom du commerçant / Responsable <span className="text-red-500">*</span> :
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Ex: Jean-Luc Mboyo"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Nom envisagé pour votre boutique :
              </label>
              <input
                type="text"
                value={projectedShopName}
                onChange={(e) => setProjectedShopName(e.target.value)}
                placeholder="Ex: Mboyo Vivres Frais & Terroir"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>

            {/* Platform Official Receiver Display */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 block text-[11px]">
                Compte récepteur officiel MARCHE LUMUMBA RDC :
              </span>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-600">
                <span>Titulaire : <strong className="text-stone-900">{platformAccountName}</strong></span>
                <span>Numéro de réception : <strong className="text-emerald-800 font-mono">{platformReceiverNumber}</strong></span>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                className="text-stone-500 hover:text-stone-800 font-bold text-xs"
              >
                ← Retour à l'accueil
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Payer maintenant ({currency === 'USD' ? '4 $ USD' : '11 000 FC'})</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 3 & 4 : VÉRIFICATION DU PAIEMENT EN COURS */}
      {/* ========================================================================= */}
      {currentStep === 'verifying' && (
        <div className="bg-white border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center animate-pulse">
            <Smartphone className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs uppercase mb-2">
              <span>STATUT : {paymentStatus}</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Vérification du paiement Mobile Money...
            </h2>
            <p className="text-xs text-stone-600 max-w-md mx-auto mt-2 leading-relaxed">
              Une demande de débit de <strong>4 $ (ou 11 000 FC)</strong> a été initiée vers le numéro{' '}
              <strong className="font-mono text-stone-900">{payerPhone}</strong> sur le réseau{' '}
              <strong className="uppercase">{paymentMethod}</strong>.
            </p>
            <div className="mt-2 text-stone-400 font-mono text-[11px]">
              Réf : {transactionRef}
            </div>
          </div>

          {/* Test verification controller */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 max-w-md mx-auto space-y-3 text-xs">
            <span className="font-bold text-stone-800 block text-[11px] uppercase tracking-wider">
              Simulation de réponse opérateur Mobile Money :
            </span>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmPaymentSuccess}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirmer le paiement opérateur (Succès)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulatePaymentFailure('FAILED')}
                  className="py-2 bg-stone-200 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Simuler Échec
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePaymentFailure('CANCELLED')}
                  className="py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Annuler la requête
                </button>
              </div>
            </div>
          </div>

          {(paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs space-y-2">
              <div className="font-bold flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Le paiement n'a pas été confirmé (Statut : {paymentStatus}).</span>
              </div>
              <p className="text-[11px]">
                Conformément aux règles de sécurité, vous ne pouvez pas créer de boutique sans paiement confirmé.
              </p>
              <button
                type="button"
                onClick={handleRetryPayment}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réessayer le paiement Mobile Money</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAIEMENT CONFIRMÉ : ÉCRAN DE VALIDATION SUCCÈS */}
      {/* ========================================================================= */}
      {currentStep === 'confirmed' && (
        <div className="bg-white border-2 border-emerald-700 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="inline-block bg-emerald-100 text-emerald-900 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Statut : PAID ✓
            </span>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Paiement confirmé avec succès
            </h2>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              Votre souscription commerçant a été validée. Redirection automatique vers <strong>CRÉATION DE MA BOUTIQUE</strong>...
            </p>
            <div className="text-stone-400 font-mono text-[11px] pt-1">
              Réf transaction : {transactionRef}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentStep('create_shop')}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Continuer vers : CRÉATION DE MA BOUTIQUE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 5 : CRÉATION DE MA BOUTIQUE (ACCESSIBLE SEULEMENT SI PAIEMENT CONFIRMÉ) */}
      {/* ========================================================================= */}
      {currentStep === 'create_shop' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Paiement 4$ confirmé (Statut : PAID)</span>
              </div>
              <h2 className="text-xl font-black text-stone-900 mt-0.5">
                CRÉATION DE MA BOUTIQUE
              </h2>
              <p className="text-xs text-stone-500">
                Remplissez les informations de votre stand ou magasin pour commencer à publier vos produits.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full text-xs">
              Actif ✓
            </span>
          </div>

          <form onSubmit={handleSubmitShop} className="space-y-6 text-xs">
            {/* Section 1: Informations Responsable */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-stone-900 pb-1 border-b border-stone-100">
                1. Responsable de la boutique
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Nom complet du commerçant <span className="text-red-500">*</span> :
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ex: Jean-Luc Mboyo"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Numéro de Téléphone d'appel <span className="text-red-500">*</span> :
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+243 820 123 456"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Numéro WhatsApp officiel <span className="text-red-500">*</span> :
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+243 820 123 456"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-stone-400">
                    Utilisé pour les contacts directs de livraison avec les clients.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Email de contact (facultatif) :
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="boutique@mail.cd"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Détails de la boutique */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-stone-900 pb-1 border-b border-stone-100">
                2. Profil & Images de la boutique
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Nom commercial de la boutique <span className="text-red-500">*</span> :
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Ex: Mboyo Vivres Frais & Terroir"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Catégorie principale :
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Description de votre activité & produits :
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Spécialiste des vivres frais du fleuve Congo, poissons capitaines fumés, manioc de Mbandaka et pagnes Super Wax."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              {/* Uploads Logo & Couverture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Logo de votre boutique :
                  </label>
                  <input
                    type="file"
                    id="shop-logo-file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="shop-logo-file"
                      className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 border border-stone-300"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choisir un logo</span>
                    </label>
                    {shopLogoUrl && (
                      <img
                        src={shopLogoUrl}
                        alt="Logo"
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-600"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Image de couverture / Bannière :
                  </label>
                  <input
                    type="file"
                    id="shop-banner-file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="shop-banner-file"
                      className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 border border-stone-300"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choisir une couverture</span>
                    </label>
                    {shopBannerUrl && (
                      <img
                        src={shopBannerUrl}
                        alt="Couverture"
                        className="w-16 h-10 rounded-xl object-cover border border-emerald-600"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Emplacement physique */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-stone-900 pb-1 border-b border-stone-100">
                3. Emplacement physique & Stand au marché
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Ville (saisie manuelle) <span className="text-red-500">*</span> :
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Kinshasa, Lubumbashi, Goma, Mbandaka..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                    required
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Écrivez manuellement votre ville (RDC ou Afrique).
                  </span>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Territoire / Commune :</label>
                  <input
                    type="text"
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    placeholder="Ex: Gombe, Wangata, Ibanda..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Quartier ou Zone :</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="Ex: Centre Commercial"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Nom du marché ou espace commercial :
                  </label>
                  <input
                    type="text"
                    value={marketName}
                    onChange={(e) => setMarketName(e.target.value)}
                    placeholder="Ex: Grand Marché Central, Marché de la Liberté, En ligne..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Marché physique ou mention « En ligne » pour produits digitaux.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Numéro de stand ou allée <span className="text-red-500">*</span> :
                  </label>
                  <input
                    type="text"
                    value={standNumber}
                    onChange={(e) => setStandNumber(e.target.value)}
                    placeholder="Ex: Stand 15 / Allée C / En ligne"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Mot de passe (si nouveau compte) */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-stone-900 pb-1 border-b border-stone-100">
                4. Sécurité du compte
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mot de passe :</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Confirmer le mot de passe :</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="text-stone-500 hover:text-stone-800 font-bold text-xs"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Enregistrer et Activer ma boutique</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
