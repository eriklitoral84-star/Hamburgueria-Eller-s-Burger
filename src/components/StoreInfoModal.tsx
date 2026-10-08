import React, { useEffect } from 'react';
import { X, MapPin, Clock, Phone, CreditCard, ExternalLink, Bike, ShieldCheck } from 'lucide-react';
import { RestaurantInfo } from '../types';
import { getStoreStatus } from '../utils/storeStatus';

interface StoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantInfo;
}

export const StoreInfoModal: React.FC<StoreInfoModalProps> = ({
  isOpen,
  onClose,
  restaurant,
}) => {
  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const status = getStoreStatus();

  const mapsQuery = encodeURIComponent(
    `${restaurant.address.street}, ${restaurant.address.number}, Caraguatatuba, SP`
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-info-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt={restaurant.name}
              className="w-11 h-11 rounded-full object-cover bg-black border border-red-500/40 p-0.5 shadow-sm"
            />
            <div>
              <h2 id="store-info-title" className="text-lg font-bold text-zinc-950 font-heading">
                {restaurant.name}
              </h2>
              <p className="text-xs text-zinc-500">{restaurant.tagline}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-5 text-sm text-zinc-700">
          {/* Location */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Localização em Caraguatatuba</span>
            </div>
            <p className="text-xs text-zinc-600">
              {restaurant.address.street}, {restaurant.address.number} - {restaurant.address.neighborhood}
              <br />
              {restaurant.address.city} - {restaurant.address.state}, {restaurant.address.country}
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline pt-1"
            >
              <span>Abrir no Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Delivery & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-xs">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Horário de Atendimento</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    status.isOpen
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'
                    }`}
                  />
                  {status.statusLabel}
                </span>
              </div>
              <p className="text-xs text-zinc-700 font-medium">
                Segunda a Sábado: 18:00 às 23:30
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Domingo: Fechado
              </p>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
              <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs mb-1">
                <Bike className="w-4 h-4 text-orange-500" />
                <span>Tempo de Entrega</span>
              </div>
              <p className="text-xs text-zinc-600 leading-snug">
                {restaurant.deliveryTime} (Delivery)
                <br />
                {restaurant.pickupTime} (Retirada)
              </p>
            </div>
          </div>

          {/* Delivery Rate Policy */}
          <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-orange-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Política de Taxa Justa de Entrega</span>
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed">
              Cobramos apenas <strong>R$ 1,50 por quilômetro percorrido</strong> (com <strong>taxa mínima de R$ 5,00</strong> para distâncias abaixo de 2 km) a partir do nosso endereço na <em>Rua Antônio Ovídeo Ferreira, 375 - Perequê Mirim</em> até a sua porta. Atendemos bairros de <strong>Caraguatatuba</strong> e <strong>São Sebastião</strong>! Use a nossa calculadora para saber o valor exato e tempo previsto.
            </p>
          </div>

          {/* Payment Methods */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs">
              <CreditCard className="w-4 h-4 text-orange-500" />
              <span>Formas de Pagamento Aceitas</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {restaurant.paymentMethods.map((pm) => (
                <span
                  key={pm.id}
                  className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-800 font-medium"
                >
                  {pm.name}
                </span>
              ))}
            </div>
          </div>

          {/* Direct WhatsApp Call */}
          <a
            href={`https://wa.me/55${restaurant.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Falar com o Restaurante no WhatsApp ({restaurant.whatsappFormatted})</span>
          </a>
        </div>
      </div>
    </div>
  );
};
