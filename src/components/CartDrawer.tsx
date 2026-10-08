import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Bike,
  Store,
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Calculator,
  MessageSquare,
} from 'lucide-react';
import {
  CartItem,
  CustomerOrderDetails,
  DeliveryType,
  RestaurantInfo,
} from '../types';
import {
  STORE_LOCATION,
  buildWhatsAppOrderMessage,
  calculateDeliveryFee,
  formatCurrency,
  generateWhatsAppUrl,
  fetchAddressByCep,
  estimateDistanceByAddress,
  buildGoogleMapsRouteUrl,
  cleanCep,
  formatCep,
} from '../utils/deliveryCalculator';
import { Loader2, Search } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  restaurant: RestaurantInfo;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenCalculator: () => void;
  initialDistanceKm?: number;
  initialNeighborhood?: string;
  initialCity?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  restaurant,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCalculator,
  initialDistanceKm,
  initialNeighborhood,
  initialCity,
}) => {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');

  // Customer & Address State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState<'Caraguatatuba' | 'São Sebastião'>(
    (initialCity as 'Caraguatatuba' | 'São Sebastião') || 'Caraguatatuba'
  );
  const [neighborhood, setNeighborhood] = useState(initialNeighborhood || 'Perequê Mirim');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(initialDistanceKm || 2.0);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Sync initial distance, neighborhood and city if applied from calculator modal
  useEffect(() => {
    if (initialDistanceKm) setDistanceKm(initialDistanceKm);
    if (initialNeighborhood) setNeighborhood(initialNeighborhood);
    if (initialCity && (initialCity === 'Caraguatatuba' || initialCity === 'São Sebastião')) {
      setCity(initialCity);
    }
  }, [initialDistanceKm, initialNeighborhood, initialCity]);

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

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cashChangeFor, setCashChangeFor] = useState('');

  // Validation errors
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState('');

  if (!isOpen) return null;

  // Auto-search CEP when 8 digits are typed
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatCep(rawVal);
    setCep(formatted);

    const digits = cleanCep(rawVal);
    if (digits.length === 8) {
      setIsLoadingCep(true);
      try {
        const addr = await fetchAddressByCep(digits);
        if (addr) {
          if (addr.street) setStreet(addr.street);
          if (addr.neighborhood) setNeighborhood(addr.neighborhood);
          if (addr.city) {
            const isSS = addr.city.toLowerCase().includes('sebastiao');
            setCity(isSS ? 'São Sebastião' : 'Caraguatatuba');
          }

          const res = await estimateDistanceByAddress({
            cep: digits,
            street: addr.street,
            neighborhood: addr.neighborhood,
            city: addr.city,
          });
          setDistanceKm(res.distanceKm);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Recalculate distance when neighborhood or street changes
  const recalculateDistance = async (
    customNeigh?: string,
    customStreet?: string,
    customCity?: string
  ) => {
    const n = customNeigh !== undefined ? customNeigh : neighborhood;
    const s = customStreet !== undefined ? customStreet : street;
    const c = customCity !== undefined ? customCity : city;

    if (!n.trim() && !s.trim() && !cep.trim()) return;

    try {
      const res = await estimateDistanceByAddress({
        cep: cleanCep(cep),
        street: s,
        number,
        neighborhood: n,
        city: c,
      });
      setDistanceKm(res.distanceKm);
    } catch {
      // Keep existing distance
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.itemPriceTotal, 0);
  const deliveryFee =
    deliveryType === 'delivery'
      ? calculateDeliveryFee(distanceKm, STORE_LOCATION.ratePerKm)
      : 0;
  const totalOrder = subtotal + deliveryFee;

  // Phone formatting helper
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      setCustomerPhone(digits ? `(${digits}` : '');
    } else if (digits.length <= 6) {
      setCustomerPhone(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
    } else if (digits.length <= 10) {
      setCustomerPhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`);
    } else {
      setCustomerPhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`);
    }
  };

  const handleCheckout = () => {
    setErrorMessage('');

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!customerPhone.trim()) {
      setErrorMessage('Por favor, informe seu número de WhatsApp de contato.');
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMessage('Por favor, informe um número de WhatsApp válido com DDD (ex: 12 99999-9999).');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!street.trim()) {
        setErrorMessage('Por favor, informe o nome da sua rua / avenida.');
        return;
      }
      if (!number.trim()) {
        setErrorMessage('Por favor, informe o número da sua residência.');
        return;
      }
      if (!neighborhood.trim()) {
        setErrorMessage('Por favor, informe o bairro de entrega.');
        return;
      }
    }

    const orderDetails: CustomerOrderDetails = {
      customerName,
      customerPhone,
      deliveryType,
      cep: cleanCep(cep) || undefined,
      city,
      street,
      number,
      neighborhood,
      complement,
      reference,
      distanceKm: deliveryType === 'delivery' ? distanceKm : 0,
      deliveryFee,
      paymentMethod,
      cashChangeFor: paymentMethod === 'dinheiro' ? cashChangeFor : undefined,
    };

    const message = buildWhatsAppOrderMessage(
      restaurant,
      cartItems,
      orderDetails,
      subtotal,
      totalOrder
    );

    const whatsappUrl = generateWhatsAppUrl(restaurant.phone, message);
    setGeneratedWhatsAppUrl(whatsappUrl);
    setOrderSent(true);

    // Open WhatsApp link safely
    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = whatsappUrl;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 id="cart-drawer-title" className="text-base sm:text-lg font-bold text-zinc-950 font-heading">
                Sua Sacola de Pedidos
              </h2>
              <p className="text-xs text-zinc-500">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'} adicionados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Sent Order Screen */}
        {orderSent ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <MessageSquare className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-zinc-950 font-heading">
              Pedido Enviado ao WhatsApp!
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 max-w-xs leading-relaxed">
              Abrimos a conversa no WhatsApp do <strong>{restaurant.name}</strong> com todos os detalhes e valores prontos.
            </p>

            <div className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-left text-xs space-y-1.5 text-zinc-700">
              <div className="flex justify-between font-bold text-zinc-950 text-sm pb-1 border-b border-zinc-200">
                <span>Total do Pedido:</span>
                <span className="text-orange-600">{formatCurrency(totalOrder)}</span>
              </div>
              <div>
                <strong>Modalidade:</strong>{' '}
                {deliveryType === 'delivery'
                  ? `Entrega (~${distanceKm.toFixed(1)} km - ${restaurant.deliveryTime})`
                  : `Retirada no Balcão (${restaurant.pickupTime})`}
              </div>
              <div>
                <strong>Forma de Pagamento:</strong>{' '}
                {paymentMethod.toUpperCase()}
              </div>
            </div>

            <div className="w-full space-y-2 pt-2">
              <a
                href={generatedWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Reabrir WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onClearCart();
                  setOrderSent(false);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Fazer Outro Pedido
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty State */
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 font-heading">
                Sua sacola está vazia
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-xs">
                Explore nosso cardápio com os melhores smashs, hambúrgueres artesanais e porções crocantes de Caraguá!
              </p>
            </div>
            <button
              onClick={onClose}
              className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Ver Cardápio Agora
            </button>
          </div>
        ) : (
          /* Full Cart List and Checkout Form */
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-5 space-y-6">
            {/* List of Cart Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                <span>Itens selecionados</span>
                <button
                  onClick={onClearCart}
                  className="text-red-500 hover:text-red-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar sacola</span>
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3 bg-zinc-50 border border-zinc-200/90 rounded-2xl flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                        {item.product.name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-orange-600 tabular-nums">
                        {formatCurrency(item.itemPriceTotal)}
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center border border-zinc-300 rounded-lg bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.cartItemId, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-zinc-900 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.cartItemId, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Add-ons list if any */}
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div className="text-[11px] text-zinc-600 pl-2 border-l-2 border-orange-300 space-y-0.5">
                      {item.selectedAddons.map((addon) => (
                        <div key={addon.id} className="flex justify-between">
                          <span>+ {addon.name}</span>
                          <span className="font-mono text-zinc-500">
                            +{formatCurrency(addon.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Observations if any */}
                  {item.observation && (
                    <p className="text-[11px] text-zinc-500 italic bg-white p-1.5 rounded-lg border border-zinc-200">
                      Obs: {item.observation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Delivery Type Segmented Toggle */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-zinc-800 mb-2">
                Como deseja receber seu pedido?
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    deliveryType === 'delivery'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>Entrega (Delivery)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    deliveryType === 'pickup'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Retirada no Balcão</span>
                </button>
              </div>
            </div>

            {/* Delivery Address & Fee Calculator Fields */}
            {deliveryType === 'delivery' ? (
              <div className="space-y-3.5 p-4 bg-orange-50/40 border border-orange-200/70 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>Endereço de Entrega</span>
                  </span>
                  <button
                    type="button"
                    onClick={onOpenCalculator}
                    className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Calculadora R$ 1,50/km</span>
                  </button>
                </div>

                {/* CEP with automatic lookup */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    CEP (busca automática de rua e distância)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cep}
                      onChange={handleCepChange}
                      maxLength={9}
                      placeholder="Ex: 11669-170"
                      className="w-full p-2.5 pr-10 bg-white border border-zinc-300 rounded-xl text-xs font-mono font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <div className="absolute right-3 top-2.5 text-zinc-400">
                      {isLoadingCep ? (
                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Rua / Avenida *
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      onBlur={() => recalculateDistance(neighborhood, street, city)}
                      placeholder="Ex: Rua das Flores"
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      onBlur={() => recalculateDistance(neighborhood, street, city)}
                      placeholder="Nº"
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Free Text Neighborhood & City Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      onBlur={() => recalculateDistance(neighborhood, street, city)}
                      placeholder="Ex: Perequê Mirim, Centro..."
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Cidade
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-zinc-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setCity('Caraguatatuba');
                          recalculateDistance(neighborhood, street, 'Caraguatatuba');
                        }}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          city === 'Caraguatatuba'
                            ? 'bg-white text-orange-600 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        Caraguá
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCity('São Sebastião');
                          recalculateDistance(neighborhood, street, 'São Sebastião');
                        }}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          city === 'São Sebastião'
                            ? 'bg-white text-orange-600 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        São Sebastião
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto, Casa 2, Bloco..."
                      className="w-full p-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Ponto de Referência
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Próximo à padaria..."
                      className="w-full p-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Distance & Rate Breakdown */}
                <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs text-zinc-700 space-y-1.5 shadow-2xs">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-zinc-600">Distância da Loja (Saída Perequê Mirim):</span>
                    <span className="font-mono text-zinc-950 font-bold">
                      ~{distanceKm.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-zinc-500">
                    <span>
                      {distanceKm < 2.0
                        ? 'Taxa mínima fixa (< 2 km)'
                        : 'Cálculo: R$ 1,50 por km'}
                    </span>
                    <span className="font-mono font-extrabold text-orange-600">
                      Taxa: {formatCurrency(deliveryFee)}
                    </span>
                  </div>

                  {/* Route Link on Google Maps */}
                  <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between">
                    <a
                      href={buildGoogleMapsRouteUrl(
                        [
                          street ? `${street}${number ? ', ' + number : ''}` : '',
                          neighborhood,
                          city,
                          'SP',
                        ]
                          .filter(Boolean)
                          .join(', ') || `${neighborhood || 'Centro'}, ${city}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      <span>Ver trajeto no Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => recalculateDistance(neighborhood, street, city)}
                      className="text-[11px] text-zinc-400 hover:text-zinc-600"
                    >
                      Recalcular
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Pickup Info Banner */
              <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Retirada Grátis no Balcão</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  <strong>Endereço da Loja:</strong> {restaurant.address.street}, {restaurant.address.number} - {restaurant.address.neighborhood}, Caraguatatuba - SP.
                </p>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 pt-1">
                  <span>• Tempo médio de preparo: {restaurant.pickupTime}</span>
                  <span>• Taxa: R$ 0,00</span>
                </div>
              </div>
            )}

            {/* Customer Identification */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-800">
                Seus Dados para o Pedido
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Seu Nome <span className="text-orange-600 font-extrabold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    WhatsApp de Contato <span className="text-orange-600 font-extrabold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(12) 99999-9999"
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-800">
                Forma de Pagamento
              </label>

              <div className="grid grid-cols-2 gap-2">
                {restaurant.paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 text-xs ${
                      paymentMethod === pm.id
                        ? 'border-orange-500 bg-orange-50/60 text-zinc-950 font-bold shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
                    }`}
                  >
                    {pm.id === 'pix' && <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {pm.id === 'credito' && <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />}
                    {pm.id === 'debito' && <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />}
                    {pm.id === 'dinheiro' && <Banknote className="w-4 h-4 text-amber-600 shrink-0" />}
                    <span className="truncate">{pm.name}</span>
                  </button>
                ))}
              </div>

              {/* Cash change field if cash selected */}
              {paymentMethod === 'dinheiro' && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl mt-2">
                  <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                    Precisa de troco para quanto? (Opcional)
                  </label>
                  <input
                    type="text"
                    value={cashChangeFor}
                    onChange={(e) => setCashChangeFor(e.target.value)}
                    placeholder="Ex: Troco para R$ 50,00 ou R$ 100,00"
                    className="w-full p-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              )}

              {paymentMethod === 'pix' && (
                <p className="text-[11px] text-zinc-500 italic">
                  💡 A chave Pix será enviada na mensagem para confirmação instantânea.
                </p>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Financial Summary */}
            <div className="pt-3 border-t border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal dos itens:</span>
                <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>
                  Taxa de Entrega {deliveryType === 'delivery' ? `(${distanceKm.toFixed(1)} km)` : '(Retirada)'}:
                </span>
                <span className="font-mono tabular-nums">
                  {deliveryType === 'delivery' ? formatCurrency(deliveryFee) : 'Grátis'}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-zinc-950 pt-2 border-t border-zinc-200">
                <span>Total a Pagar:</span>
                <span className="font-mono tabular-nums text-orange-600 text-lg">
                  {formatCurrency(totalOrder)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer WhatsApp Button */}
        {!orderSent && cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-zinc-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-md flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>Enviar Pedido pelo WhatsApp</span>
              </div>
              <span className="font-mono tabular-nums">
                {formatCurrency(totalOrder)}
              </span>
            </button>
            <p className="text-[10px] text-center text-zinc-400 mt-2">
              Você será direcionado diretamente para o WhatsApp do restaurante
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
