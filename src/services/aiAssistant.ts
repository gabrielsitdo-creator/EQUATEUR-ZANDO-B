import { Product } from '../types';
import { DataStore } from './storage';

export interface AssistantResponse {
  message: string;
  matchedProducts?: Product[];
  suggestedAction?: {
    label: string;
    actionType: 'filter_category' | 'view_product' | 'view_shop' | 'open_merchant';
    payload: string;
  };
}

export class AIAssistantService {
  /**
   * Processes a user natural language query, detects intent, filters products,
   * and provides a friendly contextual answer.
   */
  static async query(userPrompt: string, role: string = 'CLIENT'): Promise<AssistantResponse> {
    const prompt = userPrompt.toLowerCase().trim();
    const products = DataStore.getProducts().filter((p) => p.status === 'active');
    const shops = DataStore.getShops();
    const categories = DataStore.getCategories();

    // 1. Price extraction (e.g., "moins de 30000", "moins de 30 000 fc", "max 50000")
    let maxPrice: number | null = null;
    const priceMatch = prompt.match(/(?:moins de|inférieur à|max(?:imum)? de?|<)\s*(\d+(?:[\s.,]\d+)?)\s*(?:fc|francs?)?/i);
    if (priceMatch) {
      const cleaned = priceMatch[1].replace(/[\s.,]/g, '');
      maxPrice = parseInt(cleaned, 10);
    }

    // 2. Keyword & category detection
    let filtered = products;

    if (maxPrice !== null && !isNaN(maxPrice)) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    // Category / Concept keywords
    if (prompt.includes('chaussure') || prompt.includes('sandale') || prompt.includes('mocassin') || prompt.includes('basket')) {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes('chaussure'));
    } else if (prompt.includes('poisson') || prompt.includes('capitaine') || prompt.includes('fufu') || prompt.includes('manioc') || prompt.includes('manger') || prompt.includes('vivre') || prompt.includes('nourriture')) {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes('alimentation'));
    } else if (prompt.includes('huile') || prompt.includes('palme') || prompt.includes('café') || prompt.includes('arachide') || prompt.includes('agricole')) {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes('agricole'));
    } else if (prompt.includes('téléphone') || prompt.includes('smartphone') || prompt.includes('powerbank') || prompt.includes('chargeur') || prompt.includes('batterie')) {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes('téléphone') || p.category.toLowerCase().includes('électronique'));
    } else if (prompt.includes('solaire') || prompt.includes('panneau') || prompt.includes('radio') || prompt.includes('lampe')) {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes('électronique') || p.category.toLowerCase().includes('téléphone'));
    } else if (prompt.includes('pagne') || prompt.includes('wax') || prompt.includes('chemise') || prompt.includes('robe') || prompt.includes('habit')) {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes('mode'));
    } else if (prompt.includes('savon') || prompt.includes('beauté') || prompt.includes('karité') || prompt.includes('soin')) {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes('beauté'));
    } else if (prompt.includes('natte') || prompt.includes('panier') || prompt.includes('artisanat') || prompt.includes('bois')) {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes('artisan'));
    }

    // Gender / specificity
    if (prompt.includes('homme')) {
      const sub = filtered.filter((p) => p.name.toLowerCase().includes('homme') || p.description.toLowerCase().includes('homme'));
      if (sub.length > 0) filtered = sub;
    } else if (prompt.includes('femme')) {
      const sub = filtered.filter((p) => p.name.toLowerCase().includes('femme') || p.description.toLowerCase().includes('femme'));
      if (sub.length > 0) filtered = sub;
    } else if (prompt.includes('enfant')) {
      const sub = filtered.filter((p) => p.category.toLowerCase().includes('enfant') || p.name.toLowerCase().includes('enfant'));
      if (sub.length > 0) filtered = sub;
    }

    // City filter
    if (prompt.includes('gemena')) {
      filtered = filtered.filter((p) => p.city.toLowerCase() === 'gemena');
    } else if (prompt.includes('mbandaka')) {
      filtered = filtered.filter((p) => p.city.toLowerCase() === 'mbandaka');
    } else if (prompt.includes('gbadolite')) {
      filtered = filtered.filter((p) => p.city.toLowerCase() === 'gbadolite');
    } else if (prompt.includes('lisala')) {
      filtered = filtered.filter((p) => p.city.toLowerCase() === 'lisala');
    }

    // Formulate intelligent response
    if (role === 'COMMERÇANT' && (prompt.includes('vendre') || prompt.includes('prix') || prompt.includes('description') || prompt.includes('stock'))) {
      return {
        message: `Mbote cher commerçant ! Voici quelques conseils pour optimiser votre boutique sur EQUATEUR ZANDO :\n\n1. **Photos nettes** : Photographiez vos produits à la lumière naturelle du jour.\n2. **Prix compétitifs** : Affichez vos prix en FC avec une réduction visible pour attirer les clients du Grand Marché.\n3. **Précision du stand** : Mentionnez clairement votre pavillon et numéro d'allée pour faciliter le retrait direct au marché.`,
        suggestedAction: {
          label: 'Gérer mes produits',
          actionType: 'open_merchant',
          payload: '/merchant/products',
        },
      };
    }

    if (filtered.length > 0) {
      const topProducts = filtered.slice(0, 3);
      const priceText = maxPrice ? ` à moins de ${maxPrice.toLocaleString()} FC` : '';
      return {
        message: `Mbote ! J'ai trouvé ${filtered.length} produit(s) correspondant à votre recherche${priceText} disponible(s) sur EQUATEUR ZANDO :`,
        matchedProducts: topProducts,
      };
    }

    // Default polite guide
    return {
      message: `Mbote ! Je suis l'Assistant EQUATEUR ZANDO. Je peux vous aider à dénicher les meilleurs produits locaux (poissons fumés, pagnes Super Wax, kits solaires, huiles pures) à Mbandaka, Gemena, Gbadolite ou Lisala. Que désirez-vous trouver aujourd'hui ?`,
      matchedProducts: products.slice(0, 2),
    };
  }
}
