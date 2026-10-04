import React, { useState } from 'react';
import { DataStore } from '../services/storage';
import { useNotification } from '../context/NotificationContext';
import {
  ShieldCheck,
  TrendingUp,
  Store,
  Package,
  CheckCircle2,
  Trash2,
  AlertCircle,
  CreditCard,
  Upload,
  Image as ImageIcon,
  Smartphone,
  RotateCcw,
  Check,
  Percent,
} from 'lucide-react';
import { Report, SubscriptionStatus } from '../types';
import { defaultSettings } from '../services/mockData';

export const AdminDashboardView: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'banner' | 'payments' | 'shops' | 'products' | 'commissions' | 'reports' | 'settings'
  >('overview');

  const stats = DataStore.getAdminStats();
  const shops = DataStore.getShops();
  const products = DataStore.getProducts();
  const commissions = DataStore.getCommissions();
  const subscriptions = DataStore.getSubscriptions();
  const reports = DataStore.getReports();
  const settings = DataStore.getSettings();

  // Settings states
  const [commissionRate, setCommissionRate] = useState(settings.commissionRate);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);

  // Mobile Money accounts states
  const [mpesaNumber, setMpesaNumber] = useState(settings.mobileMoneyAccounts?.mpesaNumber || '+243 820 000 000');
  const [airtelNumber, setAirtelNumber] = useState(settings.mobileMoneyAccounts?.airtelNumber || '+243 990 000 000');
  const [orangeNumber, setOrangeNumber] = useState(settings.mobileMoneyAccounts?.orangeNumber || '+243 890 000 000');
  const [accountName, setAccountName] = useState(settings.mobileMoneyAccounts?.accountName || 'MARCHE LUMUMBA RDC SARL');

  // Hero Banner image management
  const currentBanner = DataStore.getHeroBanner();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Market Logo management
  const currentLogo = DataStore.getMarketLogo();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Fichier trop volumineux', 'Veuillez choisir une image inférieure à 10 Mo.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBannerPreview(result);
        showToast('Aperçu prêt', 'Cliquez sur "Enregistrer" pour appliquer la miniature.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBanner = () => {
    if (!bannerPreview) return;
    DataStore.updateSettings({ heroBannerImage: bannerPreview });
    setBannerPreview(null);
    showToast(
      'Miniature enregistrée ! 🖼️',
      'La nouvelle image de fond du Hero est désormais visible sur la page d’accueil.',
      'success'
    );
  };

  const handleResetBannerToDefault = () => {
    if (window.confirm('Voulez-vous rétablir la miniature de supermarché moderne par défaut ?')) {
      const defBanner = defaultSettings.heroBannerImage || '/images/Supermarché moderne aux rayons colorés.jpg';
      DataStore.updateSettings({ heroBannerImage: defBanner });
      setBannerPreview(null);
      showToast('Miniature réinitialisée', 'Image de supermarché par défaut restaurée.', 'success');
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        showToast('Logo chargé', 'Cliquez sur "Enregistrer le logo" pour confirmer.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = () => {
    if (!logoPreview) return;
    DataStore.updateSettings({ marketLogoUrl: logoPreview });
    setLogoPreview(null);
    showToast('Logo enregistré !', 'Le nouveau logo officiel a été mis à jour.', 'success');
  };

  const handleResetLogoToDefault = () => {
    const defLogo = defaultSettings.marketLogoUrl || '/images/Design Concepts Author Portfolio _ Freepik.jpg';
    DataStore.updateSettings({ marketLogoUrl: defLogo });
    setLogoPreview(null);
    showToast('Logo réinitialisé', 'Logo officiel par défaut restauré.', 'success');
  };

  const handleUpdateSubscriptionStatus = (subId: string, newStatus: SubscriptionStatus) => {
    DataStore.updateSubscriptionStatus(subId, newStatus);
    showToast('Statut mis à jour', `Paiement boutique passé à : ${newStatus}`, 'success');
  };

  const handleToggleVerified = (shopId: string) => {
    const isNowVerified = DataStore.toggleShopVerified(shopId);
    showToast(
      isNowVerified ? 'Boutique Vérifiée !' : 'Badge retiré',
      'Statut Vendeur Vérifié mis à jour.',
      'success'
    );
  };

  const handleToggleApproval = (shopId: string) => {
    const isApproved = DataStore.toggleShopApproval(shopId);
    showToast(
      isApproved ? 'Boutique Approuvée' : 'Boutique Suspendue',
      "Statut d'approbation modifié.",
      'info'
    );
  };

  const handleUpdateReportStatus = (reportId: string, newStatus: Report['status']) => {
    DataStore.updateReportStatus(reportId, newStatus);
    showToast('Signalement mis à jour', `Statut : ${newStatus}`, 'success');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    DataStore.updateSettings({
      commissionRate: Number(commissionRate),
      supportPhone,
      supportWhatsapp: supportPhone,
      supportEmail,
    });
    showToast('Paramètres sauvegardés', 'Les modifications sont appliquées.', 'success');
  };

  const handleSaveMobileMoneySettings = (e: React.FormEvent) => {
    e.preventDefault();
    DataStore.updateSettings({
      mobileMoneyAccounts: {
        mpesaNumber,
        airtelNumber,
        orangeNumber,
        accountName,
      },
    });
    showToast('Comptes Mobile Money enregistrés !', 'Numéros mis à jour pour les paiements commerçants.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Title Bar */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">
                Direction Centrale · MARCHE LUMUMBA RDC
              </h1>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-400/30">
                ADMINISTRATION
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Supervision de la marketplace ouverte (RDC & Afrique)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
            <span className="text-stone-400">Abonnement boutique : </span>
            <span className="font-bold text-amber-400">4 $ / mois</span>
          </div>
          <div className="bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
            <span className="text-stone-400">Commission : </span>
            <span className="font-bold text-emerald-400">{settings.commissionRate}%</span>
          </div>
        </div>
      </div>

      {/* KPI Global Platform Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <div className="text-[11px] text-stone-500 font-semibold">Ventes totales</div>
          <div className="text-base sm:text-lg font-black text-stone-900 mt-1">
            {stats.totalSalesFc.toLocaleString('fr-FR')} FC
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <div className="text-[11px] text-stone-500 font-semibold">Commissions (5%)</div>
          <div className="text-base sm:text-lg font-black text-emerald-800 mt-1">
            {stats.totalCommissionsFc.toLocaleString('fr-FR')} FC
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <div className="text-[11px] text-stone-500 font-semibold">Paiements 4$</div>
          <div className="text-base sm:text-lg font-black text-amber-800 mt-1">
            {subscriptions.filter((s) => s.status === 'PAID' || (s.status as any) === 'active').length} payé(s)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <div className="text-[11px] text-stone-500 font-semibold">Boutiques actives</div>
          <div className="text-base sm:text-lg font-black text-stone-900 mt-1">{stats.totalShops}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <div className="text-[11px] text-stone-500 font-semibold">Produits réels</div>
          <div className="text-base sm:text-lg font-black text-stone-900 mt-1">{stats.totalProducts}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200">
          <div className="text-[11px] text-stone-500 font-semibold">Signalements</div>
          <div className="text-base sm:text-lg font-black text-red-700 mt-1">
            {stats.pendingReports} en attente
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-purple-700 text-purple-950 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Vue Générale</span>
        </button>

        <button
          onClick={() => setActiveTab('banner')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'banner'
              ? 'border-purple-700 text-purple-950 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-emerald-800" />
          <span>Miniature du marché</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'payments'
              ? 'border-purple-700 text-purple-950 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-800" />
          <span>Paiements boutiques ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shops')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'shops'
              ? 'border-purple-700 text-purple-950 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Commerçants & Boutiques ({shops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'products'
              ? 'border-purple-700 text-purple-950 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Produits ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'commissions'
              ? 'border-purple-700 text-purple-950 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Commissions (5%)</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'reports'
              ? 'border-purple-700 text-purple-950 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Signalements ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'settings'
              ? 'border-purple-700 text-purple-950 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Paramètres & Mobile Money</span>
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
            <h2 className="text-base font-black text-stone-900">
              Bienvenue sur le centre de commande MARCHE LUMUMBA RDC
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
              MARCHE LUMUMBA RDC fonctionne comme un grand marché national en ligne ouvert à toute l'Afrique. Les commerçants et créateurs s'enregistrent après paiement obligatoire de 4 $/mois par Mobile Money, exposent leurs produits physiques et digitaux et organisent la livraison ou l'accès avec leurs clients.
            </p>
          </div>
        </div>
      )}

      {/* Tab: MINIATURE DU MARCHÉ (GESTION MANUELLE PAR L'ADMINISTRATEUR) */}
      {activeTab === 'banner' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-6 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs mb-2">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gestionnaire d'arrière-plan de la page d'accueil</span>
              </div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">
                Miniature du marché (Image de fond du Hero)
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                Cette grande image représentant un supermarché moderne aux rayons colorés est utilisée comme background du grand bloc Hero d'accueil. L'administrateur peut insérer manuellement sa miniature ici sans modifier le code.
              </p>
            </div>

            {/* Aperçu en direct de l'image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">
                  {bannerPreview ? 'Aperçu de la nouvelle image sélectionnée :' : 'Miniature actuelle affichée sur le site :'}
                </span>
                {bannerPreview && (
                  <span className="text-amber-700 bg-amber-50 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    Non enregistrée
                  </span>
                )}
              </div>

              <div className="relative rounded-3xl overflow-hidden border-2 border-stone-300 h-72 sm:h-96 shadow-xl bg-stone-950">
                <img
                  src={bannerPreview || currentBanner}
                  alt="Aperçu Miniature du marché"
                  className="w-full h-full object-cover object-center"
                />

                {/* Simulation de l'overlay réel */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#030d1b] via-[#05172e]/92 sm:via-[#071f3d]/85 via-55% to-[#082243]/20 flex flex-col justify-center p-6 sm:p-10 text-white max-w-xl pointer-events-none">
                  <span className="inline-block text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full self-start mb-2 backdrop-blur-md">
                    APERÇU DU BLOC HERO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">MARCHE LUMUMBA RDC</h3>
                  <p className="text-amber-300 text-xs font-bold">Et partout en Afrique 🇨🇩 🌍</p>
                  <p className="text-xs text-stone-200 mt-1.5 leading-relaxed">
                    « C'est le moment de faire la promotion de votre marchandise partout où tu es. Produits physiques et produits digitaux disponibles sur MARCHE LUMUMBA RDC. »
                  </p>
                  <div className="mt-4 bg-white/20 backdrop-blur-md border border-white/20 p-2.5 rounded-xl text-[11px] text-white/90">
                    🔍 Barre de recherche et rayons de supermarché clairement visibles sur la droite
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Administrateur */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <input
                type="file"
                id="admin-market-banner-upload"
                accept="image/*"
                onChange={handleBannerFileChange}
                className="hidden"
              />

              <label
                htmlFor="admin-market-banner-upload"
                className="px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2 shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{bannerPreview ? 'Remplacer la miniature' : 'Ajouter une miniature'}</span>
              </label>

              {bannerPreview && (
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  className="px-5 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetBannerToDefault}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Supprimer la miniature</span>
              </button>
            </div>
          </div>

          {/* Section Logo Officiel */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-stone-900 tracking-tight">
                Logo officiel du marché
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Ce logo est affiché dans la barre de navigation, le bloc Hero et le pied de page du marché.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md p-1 bg-white flex-shrink-0">
                <img
                  src={logoPreview || currentLogo}
                  alt="Aperçu Logo marché"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <input
                  type="file"
                  id="admin-market-logo-upload"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2.5">
                  <label
                    htmlFor="admin-market-logo-upload"
                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{logoPreview ? 'Remplacer le logo' : 'Ajouter un logo'}</span>
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleSaveLogo}
                      className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Enregistrer le logo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleResetLogoToDefault}
                    className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Rétablir logo initial
                  </button>
                </div>
                <p className="text-[11px] text-stone-400">
                  Image carrée recommandée (PNG ou JPG).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: PAIEMENTS BOUTIQUES */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  Paiements boutiques & Abonnements Commerçants
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tarif obligatoire : 4 $ / mois pour l'ouverture d'une boutique sur MARCHE LUMUMBA RDC.
                </p>
              </div>
              <span className="bg-purple-100 text-purple-900 font-bold px-3 py-1 rounded-full text-xs self-start sm:self-auto">
                {subscriptions.length} paiement(s) enregistré(s)
              </span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Commerçant</th>
                    <th className="p-3.5">Boutique</th>
                    <th className="p-3.5">Montant</th>
                    <th className="p-3.5">Méthode</th>
                    <th className="p-3.5">Téléphone</th>
                    <th className="p-3.5">Réf Transaction</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Expiration</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">{sub.userName || 'Commerçant'}</td>
                      <td className="p-3.5 font-medium text-stone-800">{sub.shopName || 'Boutique'}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-emerald-950">{sub.amountUsd} $</span>
                        <span className="text-stone-400 text-[11px] block">~{sub.amountFc.toLocaleString('fr-FR')} FC</span>
                      </td>
                      <td className="p-3.5 uppercase font-semibold text-stone-700">{sub.paymentMethod}</td>
                      <td className="p-3.5 font-mono text-[11px] text-stone-600">{sub.userPhone}</td>
                      <td className="p-3.5 font-mono text-[11px] font-bold text-stone-700">{sub.transactionRef}</td>
                      <td className="p-3.5 text-stone-500">{new Date(sub.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="p-3.5 font-semibold text-stone-700">{sub.endDate}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          sub.status === 'PAID' || (sub.status as any) === 'active'
                            ? 'bg-emerald-100 text-emerald-900'
                            : sub.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-900'
                            : sub.status === 'FAILED'
                            ? 'bg-red-100 text-red-900'
                            : sub.status === 'CANCELLED'
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-rose-100 text-rose-900'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <select
                          value={sub.status}
                          onChange={(e) => handleUpdateSubscriptionStatus(sub.id, e.target.value as any)}
                          className="p-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 cursor-pointer"
                        >
                          <option value="PAID">PAID (Confirmé)</option>
                          <option value="PENDING">PENDING (En attente)</option>
                          <option value="FAILED">FAILED (Échoué)</option>
                          <option value="CANCELLED">CANCELLED (Annulé)</option>
                          <option value="EXPIRED">EXPIRED (Expiré)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Configuration Mobile Money de réception */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 max-w-3xl space-y-4 shadow-xs text-xs">
            <h3 className="font-black text-base text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-800" />
              <span>Configuration des comptes Mobile Money de la plateforme</span>
            </h3>
            <p className="text-stone-500 leading-relaxed">
              Ces coordonnées sont présentées aux commerçants lors du paiement de leur abonnement de boutique (4 $/mois).
            </p>

            <form onSubmit={handleSaveMobileMoneySettings} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Numéro Vodacom M-Pesa officiel :
                  </label>
                  <input
                    type="text"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    placeholder="+243 820 000 000"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Numéro Airtel Money officiel :
                  </label>
                  <input
                    type="text"
                    value={airtelNumber}
                    onChange={(e) => setAirtelNumber(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    placeholder="+243 990 000 000"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Numéro Orange Money officiel :
                  </label>
                  <input
                    type="text"
                    value={orangeNumber}
                    onChange={(e) => setOrangeNumber(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    placeholder="+243 890 000 000"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Nom du compte / Titulaire officiel :
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    placeholder="MARCHE LUMUMBA RDC SARL"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Enregistrer les comptes Mobile Money
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Shops Management */}
      {activeTab === 'shops' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-xs text-stone-700 flex justify-between items-center">
            <span>Toutes les boutiques inscrites sur MARCHE LUMUMBA RDC</span>
            <span className="text-stone-400 font-normal">{shops.length} marchands</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Boutique</th>
                  <th className="p-3.5">Responsable</th>
                  <th className="p-3.5">Ville & Marché</th>
                  <th className="p-3.5">Note</th>
                  <th className="p-3.5">Paiement 4$</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {shops.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/70">
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{s.name}</div>
                      <div className="text-stone-400 text-[11px]">{s.category}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-stone-800">{s.ownerName}</div>
                      <div className="text-stone-500 text-[11px]">{s.ownerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-stone-800">{s.city}</div>
                      <div className="text-stone-500 text-[11px]">{s.marketName} · Stand {s.standNumber}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-amber-600">★ {s.rating}</span>
                      <span className="text-stone-400 text-[11px]"> ({s.reviewCount})</span>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded">
                        PAID ✓
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleVerified(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          s.isVerified
                            ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {s.isVerified ? '✓ Vérifié' : 'Non vérifié'}
                      </button>

                      <button
                        onClick={() => handleToggleApproval(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          s.isApproved
                            ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {s.isApproved ? 'Actif' : 'Suspendu'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-xs text-stone-700">
            Tous les produits référencés ({products.length})
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Produit</th>
                  <th className="p-3.5">Boutique</th>
                  <th className="p-3.5">Prix (FC)</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/70">
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{p.name}</div>
                      <div className="text-stone-400 text-[11px]">{p.category}</div>
                    </td>
                    <td className="p-3.5 font-medium">{p.shopName}</td>
                    <td className="p-3.5 font-bold text-emerald-900">
                      {p.price.toLocaleString('fr-FR')} FC
                    </td>
                    <td className="p-3.5">{p.stock}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-xs text-stone-700">
            Signalements & Réclamations clients
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-stone-400">Aucun signalement reçu.</div>
            ) : (
              reports.map((rep) => (
                <div key={rep.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{rep.reporterName}</span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-500">{rep.reporterPhone}</span>
                      <span className="text-stone-400">·</span>
                      <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {rep.reason}
                      </span>
                    </div>

                    <select
                      value={rep.status}
                      onChange={(e) => handleUpdateReportStatus(rep.id, e.target.value as any)}
                      className="p-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <option value="pending">pending (En attente)</option>
                      <option value="investigating">investigating (En cours)</option>
                      <option value="resolved">resolved (Résolu)</option>
                    </select>
                  </div>

                  <p className="text-stone-700 bg-stone-50 p-2.5 rounded-xl leading-relaxed">
                    {rep.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Commissions */}
      {activeTab === 'commissions' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-xs text-stone-700">
            Grand livre des commissions (5%)
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">N° Commande</th>
                  <th className="p-3.5">Boutique</th>
                  <th className="p-3.5">Montant Vente</th>
                  <th className="p-3.5">Taux</th>
                  <th className="p-3.5">Commission Marché</th>
                  <th className="p-3.5">Net Commerçant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{c.orderNumber}</td>
                    <td className="p-3.5 font-medium">{c.shopName}</td>
                    <td className="p-3.5">{c.orderAmount.toLocaleString('fr-FR')} FC</td>
                    <td className="p-3.5 font-bold text-stone-600">{c.ratePercent}%</td>
                    <td className="p-3.5 font-black text-emerald-800">
                      +{c.commissionAmount.toLocaleString('fr-FR')} FC
                    </td>
                    <td className="p-3.5">{c.merchantAmount.toLocaleString('fr-FR')} FC</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 max-w-xl space-y-4 text-xs">
          <h3 className="font-bold text-base text-stone-900 pb-2 border-b border-stone-100">
            Configuration globale MARCHE LUMUMBA RDC
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Taux de commission standard (%) :
              </label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Téléphone & WhatsApp officiel d'assistance :
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Email de contact & réclamations :
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl cursor-pointer"
            >
              Enregistrer les paramètres
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
