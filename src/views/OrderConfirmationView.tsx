import React from 'react';
import { Order, formatPrice } from '../types';
import { DataStore } from '../services/storage';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Phone,
  Store,
  ArrowRight,
  AlertTriangle,
  Receipt,
  MessageCircle,
  Download,
  FileText,
  ExternalLink,
  ShieldCheck as ShieldCheckIcon,
  Copy,
  Check,
} from 'lucide-react';

interface OrderConfirmationViewProps {
  order: Order;
  onNavigate: (view: string, payload?: any) => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onNavigate,
}) => {
  const getStatusStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'ready':
        return 3;
      case 'shipped':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 1;
    }
  };

  const steps = [
    { label: 'En attente', desc: 'Commande créée' },
    { label: 'Confirmée', desc: 'Reçue par vendeur' },
    { label: 'Préparation', desc: 'Au stand marchand' },
    { label: 'Prêt', desc: 'Prêt pour départ' },
    { label: 'Expédié', desc: 'Remis au transport' },
    { label: 'Livrée', desc: 'Remise au client' },
  ];

  const currentStep = getStatusStepIndex(order.status);
  const firstItem = order.items[0];
  const merchantShop = firstItem ? DataStore.getShopById(firstItem.shopId) : undefined;
  const merchantWhatsapp = (merchantShop?.ownerWhatsapp || merchantShop?.ownerPhone || '+243833358006').replace(/[^0-9]/g, '');

  const [downloadMessages, setDownloadMessages] = React.useState<Record<string, string>>({});
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  const handleDownload = (linkId: string) => {
    const res = DataStore.recordDigitalDownload(linkId, navigator.userAgent);
    if (res.success && res.deliveryUrl) {
      setDownloadMessages((prev) => ({
        ...prev,
        [linkId]: res.remaining && res.remaining >= 0 ? `Téléchargé ! (${res.remaining} restant(s))` : 'Téléchargé avec succès !',
      }));
      window.open(res.deliveryUrl, '_blank');
    } else {
      setDownloadMessages((prev) => ({
        ...prev,
        [linkId]: res.message || 'Téléchargement impossible.',
      }));
    }
  };

  const handleCopyLink = (token: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Votre commande a été transmise au commerçant !
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Le commerçant prépare votre commande et organise directement la livraison de votre colis.
        </p>

        <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-800 font-mono font-bold text-sm px-4 py-2 rounded-xl">
          <Receipt className="w-4 h-4 text-emerald-800" />
          <span>N° {order.orderNumber}</span>
        </div>

        <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs px-3 py-1 rounded-full font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          <span>
            Paiement TEST · Réf : {order.paymentTransactionRef || 'PAIEMENT-CASH'}
          </span>
        </div>
      </div>

      {/* Simplified Status Stepper (Section 5) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <span className="font-bold text-xs uppercase tracking-wider text-stone-500">
            Suivi de commande simplifié
          </span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
            Statut : {DataStore.getOrderStatusLabel(order.status)}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1 pt-2">
          {steps.map((st, i) => {
            const isCompleted = i <= currentStep;
            const isCurrent = i === currentStep;

            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-200 text-stone-500'
                  } ${isCurrent ? 'ring-4 ring-emerald-100 ring-offset-1' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold mt-1.5 truncate max-w-full ${
                    isCompleted ? 'text-emerald-950' : 'text-stone-400'
                  }`}
                >
                  {st.label}
                </span>
                <span className="hidden sm:block text-[9px] text-stone-400 mt-0.5 leading-tight">
                  {st.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Merchant Communication Card */}
      {merchantShop && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] block">
              Commerçant responsable de l'expédition :
            </span>
            <div className="font-black text-sm text-stone-900">{merchantShop.name}</div>
            <div className="text-stone-600">
              {merchantShop.address || merchantShop.city} · Tél : {merchantShop.ownerPhone}
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`https://wa.me/${merchantWhatsapp}?text=Bonjour%20je%20vous%20contacte%20concernant%20ma%20commande%20${order.orderNumber}%20sur%20MARCHE%20LUMUMBA%20RDC`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-bold flex items-center gap-1.5 hover:bg-emerald-900 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Écrire sur WhatsApp</span>
            </a>
            <a
              href={`tel:${merchantShop.ownerPhone}`}
              className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold flex items-center gap-1.5 hover:bg-emerald-100"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Appeler</span>
            </a>
          </div>
        </div>
      )}

      {/* Digital Products Instant Access Card */}
      {order.digitalDeliveryLinks && order.digitalDeliveryLinks.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl border border-blue-800">
          <div className="flex items-center justify-between pb-3 border-b border-blue-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                <Download className="w-5 h-5 text-white" />
              </span>
              <div>
                <h3 className="font-black text-base text-white">
                  Vos Accès & Téléchargements Digitaux Immédiats
                </h3>
                <span className="text-[11px] text-blue-200">
                  Délivrance sécurisée par MARCHE LUMUMBA RDC
                </span>
              </div>
            </div>
            <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Accès Débloqué
            </span>
          </div>

          <div className="space-y-3">
            {order.digitalDeliveryLinks.map((dl) => (
              <div
                key={dl.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-sm text-white block">
                      {dl.productName}
                    </span>
                    <span className="text-xs text-blue-300 flex items-center gap-2 mt-0.5">
                      <span>Format : {dl.digitalType?.toUpperCase() || 'FICHIER'}</span>
                      <span>·</span>
                      <span>Boutique : {dl.shopName || 'Marchand MLM'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(dl.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Accéder / Télécharger</span>
                    </button>
                    <button
                      onClick={() => handleCopyLink(dl.secureAccessToken, dl.deliveryUrl)}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-colors"
                      title="Copier le lien"
                    >
                      {copiedToken === dl.secureAccessToken ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-200" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-blue-200 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <span>
                      Téléchargements autorisés :{' '}
                      <strong>
                        {dl.downloadLimit > 0
                          ? `${dl.downloadCount} / ${dl.downloadLimit}`
                          : 'Illimité'}
                      </strong>
                    </span>
                    {dl.expiresAt && (
                      <span>
                        Expire le :{' '}
                        <strong>
                          {new Date(dl.expiresAt).toLocaleDateString('fr-FR')}
                        </strong>
                      </span>
                    )}
                  </div>
                  {downloadMessages[dl.id] && (
                    <span className="text-emerald-300 font-bold">
                      {downloadMessages[dl.id]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-blue-200/80 leading-relaxed pt-1">
            💡 Vous pouvez également retrouver l'ensemble de vos fichiers et formations à tout moment dans votre <strong>Espace Client → Mes Achats Digitaux</strong>.
          </p>
        </div>
      )}

      {/* Order Details */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6">
        <h3 className="font-bold text-base text-stone-900 pb-3 border-b border-stone-100">
          Détails de la livraison & Articles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
          <div className="p-3 bg-stone-50 rounded-xl space-y-1">
            <span className="font-bold text-stone-900 block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-800" />
              Lieu de réception
            </span>
            <div className="font-medium text-stone-800">
              {order.deliveryType === 'market_pickup'
                ? 'Retrait auprès du commerçant'
                : order.deliveryAddress.streetDetails}
            </div>
            <div className="text-stone-500">
              {order.deliveryAddress.quartier ? `${order.deliveryAddress.quartier}, ` : ''}{order.deliveryAddress.city}
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl space-y-1">
            <span className="font-bold text-stone-900 block flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-800" />
              Destinataire
            </span>
            <div className="font-medium text-stone-800">
              {order.deliveryAddress.recipientName}
            </div>
            <div className="text-stone-500">Tél : {order.deliveryAddress.recipientPhone}</div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Articles commandés ({order.items.length})
          </span>
          <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
            {order.items.map((it) => (
              <div key={it.id} className="p-3 flex items-center justify-between gap-3 text-xs bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={it.productImage}
                    alt={it.productName}
                    className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="truncate">
                    <div className="font-bold text-stone-900 truncate">{it.productName}</div>
                    <div className="text-[11px] text-stone-500">{it.shopName}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-stone-600">
                    {it.quantity} x {formatPrice(it.unitPrice, it.currency || order.currency)}
                  </div>
                  <div className="font-bold text-stone-900">
                    {formatPrice(it.totalPrice, it.currency || order.currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline text-xs">
          <span className="font-black text-sm text-stone-900">Total payé :</span>
          <span className="text-emerald-950 font-black text-xl">
            {formatPrice(order.totalAmount, order.currency)}
          </span>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('client-dashboard')}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2"
          >
            <span>Voir mes commandes</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('catalog')}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-100 text-stone-800 font-bold text-xs hover:bg-stone-200 transition-colors"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
};
