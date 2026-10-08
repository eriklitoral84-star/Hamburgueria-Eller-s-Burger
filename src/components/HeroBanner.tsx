import React from 'react';
import { Clock, MapPin, Sparkles, Calculator, CheckCircle2 } from 'lucide-react';
import { RestaurantInfo } from '../types';
import { getStoreStatus } from '../utils/storeStatus';

interface HeroBannerProps {
  restaurant: RestaurantInfo;
  onOpenCalculator: () => void;
  onOpenInfo: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  restaurant,
  onOpenCalculator,
  onOpenInfo,
}) => {
  const status = getStoreStatus();

  return (
    <div className="relative overflow-hidden bg-zinc-950 text-white border-b border-zinc-800 pt-7 pb-10 px-4 sm:px-6">
      {/* Background Image of Beautiful Burger */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-burger.jpg"
          alt="Lanche artesanal suculento"
          className="w-full h-full object-cover object-center opacity-40 scale-100 sm:scale-105"
        />
        {/* Dark overlay gradients for contrast and text clarity */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/80 to-zinc-950/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/70" />
        {/* Warm amber radial glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
          {/* Main Hero Content */}
          <div className="max-w-2xl">
            {/* Status Pill with Schedule */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 shadow-md mb-3.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'
                }`}
              />
              <span className={status.isOpen ? 'text-emerald-400 font-bold' : 'text-zinc-300 font-bold'}>
                {status.statusLabel}
              </span>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-300 font-medium">
                Seg a Sáb: 18:00 às 23:30
              </span>
              <span className="text-zinc-500 hidden sm:inline">·</span>
              <span className="text-zinc-400 hidden sm:inline">
                Caraguatatuba & São Sebastião - SP
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading tracking-tight leading-tight drop-shadow-sm">
              Sabor artesanal de verdade, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                entregue quentinho
              </span> na sua porta.
            </h1>

            <p className="mt-3.5 text-zinc-300 text-sm sm:text-base leading-relaxed font-sans max-w-xl">
              Smash burgers na crostinha, burgers artesanais, pão brioche dourado na manteiga e batatas hiper crocantes. Peça online e receba rápido!
            </p>

            {/* Badges / Metrics info */}
            <div className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Seg a Sáb: 18:00 às 23:30</span>
              </div>
              <span className="text-zinc-600" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                <Calculator className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Taxa: R$ 1,50/km (mín. R$ 5,00)</span>
              </div>
              <span className="text-zinc-600" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onOpenInfo}
                className="flex items-center gap-1 text-zinc-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {restaurant.address.street}, {restaurant.address.number}
                </span>
              </button>
            </div>
          </div>

          {/* Quick interactive widget: Delivery Calculator card */}
          <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl p-5 border border-zinc-700/80 shadow-2xl max-w-sm w-full shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-2xs">
                  <Calculator className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    Calculadora de Entrega
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Caraguá & São Sebastião
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-400 bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-md">
                R$ 1,50/km
              </span>
            </div>

            <p className="text-xs text-zinc-300 mb-3.5 leading-relaxed">
              Consulte a taxa exata para seu endereço em Caraguatatuba ou São Sebastião antes de fazer o pedido.
            </p>

            <button
              onClick={onOpenCalculator}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>Simular Taxa para meu Endereço</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
