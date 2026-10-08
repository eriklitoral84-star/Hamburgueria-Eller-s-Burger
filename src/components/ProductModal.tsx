import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, UtensilsCrossed } from 'lucide-react';
import { Product, Addon, CartItem } from '../types';
import { formatCurrency } from '../utils/deliveryCalculator';

interface ProductModalProps {
  product: Product | null;
  availableAddons: Addon[];
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  availableAddons,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [observation, setObservation] = useState('');
  const [currentSrc, setCurrentSrc] = useState(product ? encodeURI(product.image) : '');
  const [imageError, setImageError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Reset state when opening a new product
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedAddons([]);
      setObservation('');
      setCurrentSrc(encodeURI(product.image));
      setImageError(false);
      setAttempt(0);
    }
  }, [product]);

  const handleImageError = () => {
    if (!currentSrc) {
      setImageError(true);
      return;
    }
    if (attempt === 0) {
      setAttempt(1);
      // Try alternative folder: /images/ vs /
      if (currentSrc.startsWith('/images/')) {
        setCurrentSrc(currentSrc.replace('/images/', '/'));
        return;
      } else {
        setCurrentSrc(`/images${currentSrc}`);
        return;
      }
    } else if (attempt === 1) {
      setAttempt(2);
      // Try alternative extension: .jpeg <-> .jpg <-> .png
      if (currentSrc.includes('.jpeg')) {
        setCurrentSrc(currentSrc.replace('.jpeg', '.jpg'));
        return;
      } else if (currentSrc.includes('.jpg')) {
        setCurrentSrc(currentSrc.replace('.jpg', '.png'));
        return;
      } else if (currentSrc.includes('.png')) {
        setCurrentSrc(currentSrc.replace('.png', '.jpeg'));
        return;
      }
    }
    setImageError(true);
  };

  // Handle ESC key to close modal and lock body scroll
  useEffect(() => {
    if (!product) return;

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
  }, [product, onClose]);

  if (!product) return null;

  // Filter addons relevant to this product
  const relevantAddons = availableAddons.filter((addon) =>
    product.addons ? product.addons.includes(addon.id) : false
  );

  const toggleAddon = (addon: Addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const unitPrice = product.price + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const cartItemId = `${product.id}-${Date.now()}`;
    const newItem: CartItem = {
      cartItemId,
      product,
      quantity,
      selectedAddons,
      observation,
      itemPriceUnit: unitPrice,
      itemPriceTotal: totalPrice,
    };
    onAddToCart(newItem);
    onClose();
  };

  const commonObsPills = [
    'Sem cebola',
    'Sem tomate',
    'Sem molho',
    'Carne ao ponto',
    'Carne bem passada',
    'Sem salada',
  ];

  const addObservationSuggestion = (pill: string) => {
    if (!observation) {
      setObservation(pill);
    } else if (!observation.includes(pill)) {
      setObservation(`${observation}, ${pill}`);
    }
  };

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
        aria-labelledby="product-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-2 bg-white/90 hover:bg-white text-zinc-700 hover:text-zinc-950 rounded-full shadow-md transition-all active:scale-90 cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
          {/* Header Image */}
          <div className="relative aspect-16/9 sm:aspect-16/10 w-full bg-zinc-100">
            {!imageError ? (
              <img
                src={currentSrc}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 text-orange-600">
                <UtensilsCrossed className="w-12 h-12 mb-2" />
                <span className="text-sm font-bold">{product.name}</span>
              </div>
            )}
            {product.tag && (
              <span className="absolute bottom-3 left-3 bg-zinc-950/85 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                {product.tag}
              </span>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <h2 id="product-modal-title" className="text-xl sm:text-2xl font-black text-zinc-950 font-heading">
              {product.name}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-orange-600 font-mono tabular-nums">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-zinc-400">Preço base</span>
            </div>

            {/* Add-ons Selection */}
            {relevantAddons.length > 0 && (
              <div className="mt-6 pt-5 border-t border-zinc-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Deseja Adicionais?
                  </h3>
                  <span className="text-xs text-zinc-500">Opcional</span>
                </div>

                <div className="space-y-2">
                  {relevantAddons.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <button
                        type="button"
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/60 text-zinc-950 shadow-xs'
                            : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : 'border-zinc-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs sm:text-sm font-medium">
                            {addon.name}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-orange-600 font-mono tabular-nums">
                          +{formatCurrency(addon.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Observations field */}
            <div className="mt-6 pt-5 border-t border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="product-observation"
                  className="text-sm font-bold text-zinc-900"
                >
                  Observações do Item
                </label>
                <span className="text-xs text-zinc-500">Opcional</span>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {commonObsPills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => addObservationSuggestion(pill)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-orange-100 hover:text-orange-700 text-zinc-700 transition-colors cursor-pointer"
                  >
                    + {pill}
                  </button>
                ))}
              </div>

              <textarea
                id="product-observation"
                rows={2}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: sem cebola, ponto da carne, molho à parte..."
                className="w-full p-3 text-xs sm:text-sm bg-zinc-50 border border-zinc-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Bar */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 bg-white flex items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-zinc-300 rounded-xl bg-zinc-50 p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-black text-zinc-900 font-mono">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-700 hover:bg-white transition-all cursor-pointer"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-between cursor-pointer"
          >
            <span>Adicionar ao Pedido</span>
            <span className="font-mono tabular-nums">{formatCurrency(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
