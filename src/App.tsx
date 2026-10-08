/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import menuData from './data/menu.json';
import { RestaurantInfo, Category, Product, Addon, CartItem } from './types';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { SearchBarAndCategories } from './components/SearchBarAndCategories';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { DeliveryCalculatorModal } from './components/DeliveryCalculatorModal';
import { StoreInfoModal } from './components/StoreInfoModal';
import { FloatingMobileCart } from './components/FloatingMobileCart';
import { Footer } from './components/Footer';
import { Search, Flame, Layers, Sparkles, Coffee } from 'lucide-react';
import { clearPhotosFromStorage } from './utils/photoStorage';

export default function App() {
  const restaurant: RestaurantInfo = menuData.restaurant;
  const categories: Category[] = menuData.categories;
  const availableAddons: Addon[] = menuData.availableAddons;

  // Clear any legacy client-side database cache to ensure all devices display the definitive project photos
  useEffect(() => {
    clearPhotosFromStorage().catch(() => {});
  }, []);

  // Definitive project products directly from menuData.products - identical on all devices and shares
  const products: Product[] = menuData.products;

  // Search and filter state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Delivery distance, neighborhood and city applied from calculator
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | undefined>(undefined);
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState<string | undefined>(undefined);
  const [deliveryCity, setDeliveryCity] = useState<string | undefined>(undefined);

  // Cart state with localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ellers_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ellers_cart_items', JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  // Cart operations
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      // Check if item with same product and same exact addons + observation exists
      const existingIndex = prev.findIndex(
        (i) =>
          i.product.id === newItem.product.id &&
          i.observation.trim() === newItem.observation.trim() &&
          JSON.stringify(i.selectedAddons.map((a) => a.id).sort()) ===
            JSON.stringify(newItem.selectedAddons.map((a) => a.id).sort())
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = current.quantity + newItem.quantity;
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          itemPriceTotal: current.itemPriceUnit * newQty,
        };
        return updated;
      }

      return [...prev, newItem];
    });

    // Provide subtle feedback (can open cart or keep browsing)
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: newQuantity,
              itemPriceTotal: item.itemPriceUnit * newQuantity,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Cart totals
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.itemPriceTotal, 0);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || product.category === activeCategory;

      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, searchQuery]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Highlighted products (combos/mais pedidos)
  const highlightedProducts = useMemo(() => {
    return products.filter((p) => p.highlight);
  }, [products]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <Header
        restaurant={restaurant}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      {/* Main Hero Banner */}
      <HeroBanner
        restaurant={restaurant}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
      />

      {/* Search Bar & Category Filter Tabs */}
      <SearchBarAndCategories
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryCounts={categoryCounts}
      />

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* If searching or filtering a single category, show filtered grid */}
        {searchQuery || activeCategory !== 'all' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-heading tracking-tight">
                  {searchQuery
                    ? `Resultados para "${searchQuery}"`
                    : categories.find((c) => c.id === activeCategory)?.name || 'Produtos'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {filteredProducts.length}{' '}
                  {filteredProducts.length === 1 ? 'item disponível' : 'itens disponíveis'}
                </p>
              </div>

              {activeCategory !== 'all' && (
                <button
                  onClick={() => setActiveCategory('all')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Ver Cardápio Completo
                </button>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">
                  Nenhum produto encontrado
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Não encontramos nenhum item com o termo &quot;{searchQuery}&quot;. Tente buscar por smash, brutamontes, batata ou refrigerante.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Ver Todos os Produtos
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Full categorized menu display: Smash, Brutamontes, Porções, Bebidas */
          <div className="space-y-12">
            {/* Destaques da Casa */}
            {highlightedProducts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-orange-500 text-white flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-heading tracking-tight">
                    Destaques da Casa
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {highlightedProducts.slice(0, 3).map((product) => (
                    <ProductCard
                      key={`highlight-${product.id}`}
                      product={product}
                      onSelect={setSelectedProduct}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Categoria Smash */}
            <section id="categoria-smash">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-heading tracking-tight">
                      Categoria Smash
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Smash burgers artesanais na crostinha dourada, pão brioche e molhos especiais
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                  {products.filter((p) => p.category === 'smash').length} opções
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter((p) => p.category === 'smash')
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={setSelectedProduct}
                    />
                  ))}
              </div>
            </section>

            {/* Categoria Brutamontes */}
            <section id="categoria-brutamontes">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-heading tracking-tight">
                      Categoria Brutamontes
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Os gigantes da casa com duplo, triplo e quádruplo smash de carne para quem tem fome de verdade
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                  {products.filter((p) => p.category === 'brutamontes').length} gigantes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter((p) => p.category === 'brutamontes')
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={setSelectedProduct}
                    />
                  ))}
              </div>
            </section>

            {/* Categoria Porções & Batatas */}
            <section id="categoria-porcoes">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-heading tracking-tight">
                      Porções & Batatas
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Batatas sequinhas, crocantes e porções de onion rings douradas
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  {products.filter((p) => p.category === 'porcoes').length} opções
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter((p) => p.category === 'porcoes')
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={setSelectedProduct}
                    />
                  ))}
              </div>
            </section>

            {/* Categoria Bebidas */}
            <section id="categoria-bebidas">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-heading tracking-tight">
                      Bebidas Geladas
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Refrigerantes em lata e águas minerais bem geladas para acompanhar seu lanche
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                  {products.filter((p) => p.category === 'bebidas').length} opções
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter((p) => p.category === 'bebidas')
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={setSelectedProduct}
                    />
                  ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart for Mobile */}
      <FloatingMobileCart
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Footer */}
      <Footer
        restaurant={restaurant}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
      />

      {/* Product Customization Modal */}
      <ProductModal
        product={selectedProduct}
        availableAddons={availableAddons}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        restaurant={restaurant}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenCalculator={() => {
          setIsCartOpen(false);
          setIsCalculatorOpen(true);
        }}
        initialDistanceKm={deliveryDistanceKm}
        initialNeighborhood={deliveryNeighborhood}
        initialCity={deliveryCity}
      />

      {/* Delivery Fee Calculator Modal */}
      <DeliveryCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyDistance={(km, neighborhoodName, city) => {
          setDeliveryDistanceKm(km);
          if (neighborhoodName) {
            setDeliveryNeighborhood(neighborhoodName);
          }
          if (city) {
            setDeliveryCity(city);
          }
          setIsCalculatorOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* Store Info Modal */}
      <StoreInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        restaurant={restaurant}
      />
    </div>
  );
}
