import React, { useState } from 'react';
import { DataStore } from '../services/storage';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, X, Send, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { Report } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: Report['targetType'];
  targetId?: string;
  targetName?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType = 'produit',
  targetId,
  targetName,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const settings = DataStore.getSettings();

  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [reporterPhone, setReporterPhone] = useState(currentUser?.phone || '');
  const [reason, setReason] = useState<Report['reason']>('produit_non_conforme');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !reporterPhone.trim() || !description.trim()) {
      showToast('Formulaire incomplet', 'Veuillez renseigner votre nom, téléphone et le motif.', 'warning');
      return;
    }

    DataStore.addReport({
      reporterId: currentUser?.id,
      reporterName: reporterName.trim(),
      reporterPhone: reporterPhone.trim(),
      reporterEmail: currentUser?.email,
      reason,
      targetType,
      targetId,
      targetName,
      description: description.trim(),
    });

    setIsSubmitted(true);
    showToast('Signalement envoyé', 'Notre équipe administrative va examiner ce problème rapidement.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="p-4 bg-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-white" />
            <h3 className="font-bold text-sm">Signaler un problème</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-red-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-6 text-center space-y-4 text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-black text-base text-stone-900">
              Votre signalement a été enregistré
            </h4>
            <p className="text-stone-600 leading-relaxed">
              Merci de nous aider à maintenir la qualité et la confiance sur <strong>EQUATEUR ZANDO MARKET</strong>. Notre service client prendra contact si nécessaire.
            </p>
            <div className="p-3 bg-stone-50 rounded-xl text-stone-600 space-y-1 text-left border border-stone-200">
              <div className="font-bold text-stone-800">Support direct :</div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>WhatsApp / Appel : {settings.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-700" />
                <span>Email : {settings.supportEmail}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
            {targetName && (
              <div className="p-2.5 bg-stone-50 rounded-xl text-stone-700 border border-stone-200">
                <span className="font-bold text-stone-900">Élément concerné : </span>
                <span>{targetName}</span>
              </div>
            )}

            <div>
              <label className="font-bold text-stone-700 block mb-1">Motif du signalement *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900"
              >
                <option value="produit_non_conforme">Produit non conforme à la description</option>
                <option value="produit_frauduleux">Suspicion d'article frauduleux ou contrefaçon</option>
                <option value="probleme_commande">Problème avec une commande passée</option>
                <option value="probleme_commercant">Problème de comportement avec un commerçant</option>
                <option value="prix_incorrect">Prix incorrect ou trompeur</option>
                <option value="autre">Autre motif</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Votre nom *</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Votre téléphone / WhatsApp *</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+243..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Détails du problème rencontré *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez précisément ce qui ne va pas..."
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer le signalement</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
