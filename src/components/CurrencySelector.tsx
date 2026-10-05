import React from 'react';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '../types';
import { Coins, Check, Globe } from 'lucide-react';

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  label?: string;
  description?: string;
  showExample?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  label = 'Choisissez votre devise',
  description = 'Chaque vendeur choisit sa devise principale. Vos prix seront saisis et affichés dans cette monnaie sans conversion automatique.',
  showExample = true,
  className = '',
}) => {
  const currentCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === value) || SUPPORTED_CURRENCIES[0];

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
          <Coins className="w-3.5 h-3.5 text-emerald-700" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Devise active : {currentCurrency.code} ({currentCurrency.symbol})
        </span>
      </div>

      {description && <p className="text-[11px] text-stone-500 leading-relaxed">{description}</p>}

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as CurrencyCode)}
          className="w-full p-3 bg-stone-50 hover:bg-stone-100/70 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all appearance-none cursor-pointer"
        >
          {SUPPORTED_CURRENCIES.map((curr) => (
            <option key={curr.code} value={curr.code} className="py-1">
              {curr.flag} {curr.code} — {curr.name} ({curr.symbol}) — {curr.region}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
          <Globe className="w-4 h-4 text-emerald-700" />
        </div>
      </div>

      {showExample && (
        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-emerald-950 font-bold block">
              Devise de ma boutique : {currentCurrency.code} — {currentCurrency.name}
            </span>
            <span className="text-[10px] text-emerald-700 block">
              Exemple de prix affiché sur votre boutique :{' '}
              <strong className="font-black text-emerald-900 text-xs">{currentCurrency.example}</strong>
            </span>
          </div>
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
        </div>
      )}
    </div>
  );
};
