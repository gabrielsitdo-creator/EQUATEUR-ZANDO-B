import React, { useState } from 'react';
import { AIAssistantService, AssistantResponse } from '../services/aiAssistant';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X, Send, Bot, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigate,
}) => {
  const { role } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useNotification();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; products?: Product[] }>>([
    {
      role: 'assistant',
      text: 'Mbote ! Je suis l’Assistant MARCHE LUMUMBA IA. Dites-moi ce que vous recherchez en produits physiques ou digitaux (ex: « Chaussures homme en cuir », « E-book entrepreneuriat », « Riz local », « Super Wax »), et je trouve les meilleures offres partout en RDC et en Afrique !',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    setPrompt('');
    setHistory((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response: AssistantResponse = await AIAssistantService.query(userMessage, role || 'CLIENT');
      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.message,
          products: response.matchedProducts,
        },
      ]);
    } catch (e) {
      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Désolé, une petite erreur est survenue lors de la recherche. Veuillez reformuler votre question.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Je cherche une paire de chaussures homme noire à moins de 30 000 FC',
    'Poisson capitaine fumé du fleuve Congo',
    'Huile de palme rouge et café de Gemena',
    'Kit solaire et powerbank pour téléphone',
    'Conseils pour booster mes ventes au Grand Marché',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-900 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">ASSISTANT MARCHE LUMUMBA IA</h3>
                <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.5 rounded uppercase">
                  V1 Active
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Recherche intelligente & conseils commerce en RDC et Afrique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 text-sm">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-800 text-white rounded-br-none'
                    : 'bg-white text-stone-900 border border-stone-200 shadow-xs rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* If products matched */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-2">
                    <span className="text-xs font-bold text-stone-700">Produits trouvés :</span>
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between gap-3 p-2 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                        onClick={() => {
                          onSelectProduct(prod);
                          onClose();
                        }}
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-xs text-stone-900 truncate">
                            {prod.name}
                          </h5>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                            <span className="text-emerald-800 font-bold">
                              {prod.price.toLocaleString('fr-FR')} FC
                            </span>
                            <span>·</span>
                            <span>{prod.city}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod, 1);
                            showToast('Ajouté !', `${prod.name} ajouté au panier`, 'success');
                          }}
                          className="p-1.5 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900"
                          title="Ajouter au panier"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-stone-500 text-xs italic">
              <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
              L'Assistant MARCHE LUMUMBA consulte les catalogues physiques et digitaux...
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-white border-t border-stone-200 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-stone-400 font-medium self-center mr-1">
            Exemples :
          </span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200 px-2.5 py-1 rounded-full text-stone-700 transition-colors truncate max-w-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 bg-white border-t border-stone-100 flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez votre question (ex: Je cherche des mocassins noirs à moins de 30 000 FC)..."
            className="flex-1 px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all text-stone-900"
          />
          <button
            onClick={() => handleSend()}
            disabled={!prompt.trim() || loading}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              prompt.trim() && !loading
                ? 'bg-emerald-800 text-white hover:bg-emerald-900 active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
