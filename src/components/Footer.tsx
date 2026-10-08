import React from 'react';
import { RestaurantInfo } from '../types';
import { MapPin, Phone, Clock, Calculator, Heart } from 'lucide-react';

interface FooterProps {
  restaurant: RestaurantInfo;
  onOpenCalculator: () => void;
  onOpenInfo: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  restaurant,
  onOpenCalculator,
  onOpenInfo,
}) => {
  return (
    <footer className="bg-white border-t border-zinc-200 mt-16 pt-12 pb-16 text-zinc-600 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/logo.svg"
                alt={restaurant.name}
                className="w-8 h-8 rounded-full object-cover bg-black border border-red-500/40 p-0.5 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="text-base font-extrabold text-zinc-950 font-heading">
                {restaurant.name}
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              {restaurant.tagline}. Ingredientes selecionados, carnes suculentas e atendimento de primeira em Caraguatatuba.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-900 text-sm mb-3">Atendimento & Entrega</h4>
            <div className="flex items-center gap-2 text-zinc-600">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{restaurant.openingHours}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <Calculator className="w-4 h-4 text-orange-500 shrink-0" />
              <button
                onClick={onOpenCalculator}
                className="hover:text-orange-600 underline underline-offset-2 transition-colors cursor-pointer text-left"
              >
                Taxa de R$ 1,50/km (mín. R$ 5,00 abaixo de 2 km)
              </button>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <button
                onClick={onOpenInfo}
                className="hover:text-orange-600 underline underline-offset-2 transition-colors cursor-pointer text-left"
              >
                {restaurant.address.street}, {restaurant.address.number} - {restaurant.address.neighborhood}
              </button>
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="font-bold text-zinc-900 text-sm mb-3">WhatsApp Oficial</h4>
            <p className="text-zinc-500 text-xs">
              Dúvidas ou pedidos especiais? Fale direto com a nossa equipe no WhatsApp:
            </p>
            <a
              href={`https://wa.me/55${restaurant.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-xs cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp: {restaurant.whatsappFormatted}</span>
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <p>© {new Date().getFullYear()} {restaurant.name} · Caraguatatuba - SP. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            <span>Cardápio digital moderno e responsivo</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
