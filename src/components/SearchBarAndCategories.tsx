import React from 'react';
import { Search, X, Flame, Layers, Utensils, Sparkles, Coffee, Heart, LayoutGrid } from 'lucide-react';
import { Category } from '../types';

interface SearchBarAndCategoriesProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryCounts: Record<string, number>;
}

export const SearchBarAndCategories: React.FC<SearchBarAndCategoriesProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  categoryCounts,
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'combos':
        return <Flame className="w-3.5 h-3.5" />;
      case 'smash':
        return <Layers className="w-3.5 h-3.5" />;
      case 'brutamontes':
        return <Flame className="w-3.5 h-3.5" />;
      case 'artesanais':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'porcoes':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'bebidas':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'sobremesas':
        return <Heart className="w-3.5 h-3.5" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5" />;
    }
  };

  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div id="cardapio" className="relative z-10 bg-zinc-50 pt-4 pb-3 border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por hambúrguer, batata, combo, bebida..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-full cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs (Segmented control) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200/80'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Todos os Itens</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === 'all' ? 'bg-orange-600/60 text-white' : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200/80'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-orange-600/60 text-white' : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
