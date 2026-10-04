import React from 'react';
import { DataStore } from '../services/storage';
import { useNotification } from '../context/NotificationContext';
import {
  RotateCcw,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  AlertCircle,
  Store,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenReportModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenReportModal }) => {
  const { showToast } = useNotification();
  const settings = DataStore.getSettings();

  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données de démonstration de MARCHE LUMUMBA RDC ?')) {
      DataStore.resetToDefaults();
      showToast('Données réinitialisées !', 'Toutes les boutiques, produits et commandes de test ont été remis à zéro.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 400);
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Value props banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10 border-b border-stone-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Grand Marché Ouvert</h4>
              <p className="text-stone-400 mt-1 leading-relaxed">
                Tous les produits de tous les commerçants visibles ensemble sans barrières régionales.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Vendeurs Autonomes</h4>
              <p className="text-stone-400 mt-1 leading-relaxed">
                Le commerçant organise directement la livraison de son colis par le moyen de transport de son choix.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Paiements Mobile Money</h4>
              <p className="text-stone-400 mt-1 leading-relaxed">
                Payez en toute simplicité via Vodacom M-Pesa, Airtel Money, Orange Money ou à la livraison.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Abonnement Commerçant</h4>
              <p className="text-stone-400 mt-1 leading-relaxed">
                Seulement 4 $/mois (promo 3 mois) pour exposer votre marchandise partout en RDC et en Afrique.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10 border-b border-stone-800">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <img
                src={DataStore.getMarketLogo()}
                alt="Logo MARCHE LUMUMBA RDC"
                className="w-8 h-8 rounded-lg object-cover border border-emerald-700 bg-white/10"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base tracking-tight">
                  MARCHE <span className="text-emerald-400">LUMUMBA RDC</span>
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  Et partout en Afrique
                </span>
              </div>
            </div>
            <p className="text-stone-300 font-semibold text-xs">
              MARCHE LUMUMBA RDC — Et partout en Afrique 🇨🇩 🌍
            </p>
            <p className="text-stone-400 leading-relaxed max-w-sm">
              « C'est le moment de faire la promotion de votre marchandise partout où tu es. Produits physiques et produits digitaux disponibles sur MARCHE LUMUMBA RDC. »
            </p>

            <div className="flex flex-col gap-1.5 pt-2 text-stone-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp / Appel : <strong>{settings.supportPhone}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Email officiel : <strong>{settings.supportEmail}</strong></span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
              Marketplace
            </h5>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-emerald-400 transition-colors">
                  Tous les Produits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('promotions')} className="hover:text-emerald-400 transition-colors">
                  Produits Promotionnels
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register-merchant')} className="hover:text-emerald-400 transition-colors">
                  Ouvrir ma boutique (4 $/mois)
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Assistance */}
          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
              Support & Confiance
            </h5>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={onOpenReportModal}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Signaler un problème
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.supportWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400"
                >
                  Contacter le support WhatsApp
                </a>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-emerald-400">
                  Administration Centrale
                </button>
              </li>
              <li className="pt-3">
                <button
                  onClick={handleResetData}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  title="Restaurer les données initiales de démonstration"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser Démo MARCHE LUMUMBA RDC</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} MARCHE LUMUMBA RDC — Et partout en Afrique. Tous droits réservés.
          </div>
          <div className="flex items-center gap-4">
            <span>Abonnement : 4 $/mois</span>
            <span>·</span>
            <span>Commission : 5%</span>
            <span>·</span>
            <span>M-Pesa · Airtel Money · Orange Money</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
