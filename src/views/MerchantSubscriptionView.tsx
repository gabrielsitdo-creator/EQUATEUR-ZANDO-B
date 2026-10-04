import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { DataStore } from '../services/storage';
import { PaymentMethod } from '../types';
import {
  Store,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertTriangle,
  Smartphone,
  Lock,
} from 'lucide-react';

interface MerchantSubscriptionViewProps {
  onSubscriptionSuccess: () => void;
  onBack: () => void;
}

export const MerchantSubscriptionView: React.FC<MerchantSubscriptionViewProps> = ({
  onSubscriptionSuccess,
  onBack,
}) => {
  const { currentUser, subscribeMerchant } = useAuth();
  const { showToast } = useNotification();
  const settings = DataStore.getSettings();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '+243820000000');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaySubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      showToast('Numéro requis', 'Veuillez renseigner votre numéro Mobile Money.', 'warning');
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    subscribeMerchant(paymentMethod);
    setIsProcessing(false);

    showToast(
      'Abonnement activé avec succès !',
      'Votre souscription de 4 $/mois (3 mois promo) est confirmée. Vous pouvez créer votre boutique.',
      'success'
    );

    onSubscriptionSuccess();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
          <span>Offre de lancement commerçant</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Ouvrez votre boutique sur <br />
          <span className="text-emerald-800">MARCHE LUMUMBA RDC</span>
        </h1>
        <p className="text-amber-800 font-bold text-xs uppercase tracking-wider">
          Et partout en Afrique 🇨🇩 🌍
        </p>

        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          Rejoignez le grand marché national en ligne de la RDC et de l'Afrique. Vendez vos produits physiques et digitaux à des milliers de clients.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="bg-white border-2 border-emerald-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-800 text-white font-extrabold text-[11px] px-4 py-1 rounded-bl-xl uppercase tracking-wider">
          Promotion 3 mois
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <h2 className="text-xl font-black text-stone-900">
              Abonnement Vendeur Pro
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Accès illimité à la publication de produits & visibilité nationale
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-4xl font-black text-emerald-950">4 $</span>
              <span className="text-stone-500 text-xs font-semibold">/ mois</span>
            </div>
            <div className="text-xs font-bold text-emerald-700">
              soit ~{settings.subscriptionPriceFc.toLocaleString('fr-FR')} FC / mois
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Tous vos produits visibles sur le marché général</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Recherche instantanée par ville (ex: Karawa, Mbandaka...)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Option 🔥 Produits Promotionnels incluse</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Lien direct WhatsApp & Téléphone sur chaque produit</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Vous organisez vous-même vos livraisons librement</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Assistance directe au +243 833358006</span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePaySubscription} className="pt-6 border-t border-stone-200 space-y-4 text-xs">
          <div className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-800" />
            <span>Paiement de l'abonnement par Mobile Money</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div
              onClick={() => setPaymentMethod('mpesa')}
              className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                paymentMethod === 'mpesa'
                  ? 'border-red-600 bg-red-50/50'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <span className="font-bold text-stone-900">Vodacom M-Pesa</span>
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
              <span className="font-bold text-stone-900">Airtel Money</span>
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
              <span className="font-bold text-stone-900">Orange Money</span>
              {paymentMethod === 'orange' && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Numéro de téléphone Mobile Money :
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+243..."
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
              required
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Environnement de test :</strong> Ce débit de 4 $ (11 000 FC) est simulé en mode TEST avec génération immédiate de reçu. Votre statut commerçant sera débloqué immédiatement pour créer votre boutique.
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
            >
              Retour
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
            >
              {isProcessing ? (
                <span>Validation du paiement Mobile Money...</span>
              ) : (
                <>
                  <span>Payer 4 $ & Débloquer la création de ma boutique</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
