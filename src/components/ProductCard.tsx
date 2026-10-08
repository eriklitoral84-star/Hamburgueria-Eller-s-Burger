import React, { useState } from 'react';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/deliveryCalculator';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [currentSrc, setCurrentSrc] = useState(encodeURI(product.image));
  const [imageError, setImageError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Sync if product image changes
  React.useEffect(() => {
    setCurrentSrc(encodeURI(product.image));
    setImageError(false);
    setAttempt(0);
  }, [product.image, product.id]);

  const handleImageError = () => {
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

  const hasAddons = product.addons && product.addons.length > 0;

  return (
    <article
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-orange-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Image Container with Resilient Fallback */}
        <div className="relative aspect-4/3 w-full bg-zinc-100 overflow-hidden">
          {!imageError ? (
            <img
              src={currentSrc}
              alt={product.name}
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-zinc-100 text-orange-500 p-4">
              <UtensilsCrossed className="w-8 h-8 stroke-[1.5] mb-1" />
              <span className="text-xs font-semibold text-zinc-600 text-center">
                {product.name}
              </span>
            </div>
          )}

          {/* Clean minimal tag if highlighted */}
          {product.tag && (
            <div className="absolute top-2.5 left-2.5">
              <span className="bg-zinc-950/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                {product.tag}
              </span>
            </div>
          )}
        </div>

        {/* Content details */}
        <div className="p-4">
          <h3 className="font-heading font-bold text-base sm:text-lg text-zinc-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-zinc-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer with Price and Action Button */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-2 border-t border-zinc-100 mt-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 font-medium">A partir de</span>
          <span className="text-base sm:text-lg font-extrabold text-zinc-900 font-mono tabular-nums">
            {formatCurrency(product.price)}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
          aria-label={`Adicionar ${product.name}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{hasAddons ? 'Personalizar' : 'Adicionar'}</span>
        </button>
      </div>
    </article>
  );
};
