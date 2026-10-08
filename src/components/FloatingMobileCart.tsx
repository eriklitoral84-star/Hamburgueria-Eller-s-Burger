import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/deliveryCalculator';

interface FloatingMobileCartProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const FloatingMobileCart: React.FC<FloatingMobileCartProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  if (cartCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 duration-200">
      <button
        onClick={onOpenCart}
        className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold rounded-2xl shadow-xl flex items-center justify-between cursor-pointer transition-all"
        aria-label="Ver sacola de pedidos"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-600/70 flex items-center justify-center text-xs font-black">
            {cartCount}
          </div>
          <span className="text-sm">Ver Sacola</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-sm font-mono tabular-nums">
            {formatCurrency(cartTotal)}
          </span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};
