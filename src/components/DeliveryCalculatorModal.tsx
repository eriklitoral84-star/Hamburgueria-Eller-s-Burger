import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calculator,
  Navigation,
  ExternalLink,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  STORE_LOCATION,
  calculateDeliveryFee,
  formatCurrency,
  fetchAddressByCep,
  estimateDistanceByAddress,
  buildGoogleMapsRouteUrl,
  cleanCep,
  formatCep,
} from '../utils/deliveryCalculator';

interface DeliveryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDistance?: (
    distanceKm: number,
    neighborhoodName?: string,
    city?: string,
    addressDetails?: {
      cep?: string;
      street?: string;
      number?: string;
    }
  ) => void;
}

export const DeliveryCalculatorModal: React.FC<DeliveryCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyDistance,
}) => {
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [selectedCity, setSelectedCity] = useState<'Caraguatatuba' | 'São Sebastião'>('Caraguatatuba');
  const [distanceKm, setDistanceKm] = useState<number>(2.0);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationFeedback, setCalculationFeedback] = useState<string>('');
  const [cepError, setCepError] = useState(false);

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

  const currentFee = calculateDeliveryFee(distanceKm, STORE_LOCATION.ratePerKm);

  // Auto-search CEP when 8 digits are typed
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatCep(rawVal);
    setCep(formatted);

    const digits = cleanCep(rawVal);
    if (digits.length === 8) {
      setCepError(false);
      setIsLoadingCep(true);
      setCalculationFeedback('');
      try {
        const addr = await fetchAddressByCep(digits);
        if (addr) {
          if (addr.street) setStreet(addr.street);
          if (addr.neighborhood) setNeighborhood(addr.neighborhood);
          if (addr.city) {
            const isSS = addr.city.toLowerCase().includes('sebastiao');
            setSelectedCity(isSS ? 'São Sebastião' : 'Caraguatatuba');
          }

          // Trigger automatic distance calculation with fetched address
          const result = await estimateDistanceByAddress({
            cep: digits,
            street: addr.street,
            neighborhood: addr.neighborhood,
            city: addr.city,
          });
          setDistanceKm(result.distanceKm);
          setCalculationFeedback('Endereço e distância calculados pelo CEP com sucesso!');
        } else {
          setCalculationFeedback('CEP não encontrado nos Correios. Preencha seu bairro e rua manualmente.');
        }
      } catch {
        setCalculationFeedback('Não foi possível autocompletar o CEP. Preencha manualmente.');
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleManualCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cleanCep(cep);
    if (digits.length !== 8) {
      setCepError(true);
      setCalculationFeedback('O preenchimento do CEP (Código Postal com 8 dígitos) é obrigatório.');
      return;
    }

    setCepError(false);
    setIsCalculating(true);
    setCalculationFeedback('');

    try {
      const result = await estimateDistanceByAddress({
        cep: digits,
        street,
        number,
        neighborhood,
        city: selectedCity,
      });

      setDistanceKm(result.distanceKm);
      setCalculationFeedback(
        result.source === 'gps'
          ? 'Distância exata calculada por coordenadas geográficas a partir da loja!'
          : 'Distância estimada com base na localização do seu bairro a partir da loja!'
      );
    } catch {
      setCalculationFeedback('Erro ao calcular. Ajuste a quilometragem manualmente se necessário.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleApply = () => {
    const digits = cleanCep(cep);
    if (digits.length !== 8) {
      setCepError(true);
      setCalculationFeedback('O preenchimento do CEP (Código Postal com 8 dígitos) é obrigatório para confirmar o endereço.');
      return;
    }
    setCepError(false);
    if (onApplyDistance) {
      onApplyDistance(distanceKm, neighborhood || 'Endereço Calculado', selectedCity, {
        cep: digits,
        street,
        number,
      });
    }
    onClose();
  };

  const fullDestinationAddress = [
    street ? `${street}${number ? ', ' + number : ''}` : '',
    neighborhood,
    selectedCity,
    'SP',
    cleanCep(cep) ? `CEP ${formatCep(cep)}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const googleMapsUrl = fullDestinationAddress
    ? buildGoogleMapsRouteUrl(fullDestinationAddress)
    : buildGoogleMapsRouteUrl(`${neighborhood || 'Centro'}, ${selectedCity} - SP`);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calc-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 id="calc-modal-title" className="text-base sm:text-lg font-bold text-zinc-950 font-heading">
                Calculadora de Quilometragem
              </h2>
              <p className="text-xs text-zinc-500">
                Cálculo a partir do ponto de saída da loja (R$ 1,50/km)
              </p>
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
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Departure Point (Origem da Hamburgueria) */}
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs text-zinc-700">
                <span className="font-extrabold text-zinc-900 block text-[13px]">
                  Ponto de Saída (Origem): {STORE_LOCATION.name}
                </span>
                <p className="text-zinc-500 mt-0.5">{STORE_LOCATION.address}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-orange-700">
                  <span className="bg-orange-100 px-2 py-0.5 rounded-full">CEP 11669-170</span>
                  <span>•</span>
                  <span>Taxa: R$ 1,50 por km (Mínimo R$ 5,00)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Destination Form */}
          <form onSubmit={handleManualCalculate} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-zinc-900 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-orange-600" />
                <span>Endereço de Destino do Cliente</span>
              </label>
              <span className="text-[11px] text-zinc-500">
                Preencha o CEP para preenchimento rápido
              </span>
            </div>

            {/* CEP Field with auto-fill (Obrigatório) */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold text-zinc-900 flex items-center gap-1.5">
                  <span>CEP / Código Postal</span>
                  <span className="text-red-600 font-black text-[11px] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
                    * Obrigatório
                  </span>
                </label>
                <span className="text-[10px] text-zinc-500 font-medium">8 dígitos numéricos</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={cep}
                  onChange={handleCepChange}
                  maxLength={9}
                  required
                  aria-required="true"
                  placeholder="Ex: 11669-170 (Código Postal obrigatório)"
                  className={`w-full p-2.5 pr-10 bg-white border rounded-xl text-xs font-mono font-medium text-zinc-900 focus:outline-none transition-all ${
                    cepError
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : 'border-zinc-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                <div className="absolute right-3 top-2.5 text-zinc-400">
                  {isLoadingCep ? (
                    <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </div>
              </div>
              {cepError && (
                <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Preenchimento do CEP é obrigatório (8 dígitos).</span>
                </p>
              )}
            </div>

            {/* Street & Number */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Rua / Avenida
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ex: Av. Geraldo Nogueira da Silva"
                  className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Nº"
                  className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Neighborhood & City (Free text) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Digite o bairro..."
                  className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Cidade
                </label>
                <div className="grid grid-cols-2 gap-1 bg-zinc-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedCity('Caraguatatuba')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedCity === 'Caraguatatuba'
                        ? 'bg-white text-orange-600 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Caraguá
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCity('São Sebastião')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedCity === 'São Sebastião'
                        ? 'bg-white text-orange-600 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    São Sebastião
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCalculating || cleanCep(cep).length !== 8}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculando distância exata...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Calcular Distância do Endereço</span>
                </>
              )}
            </button>
          </form>

          {calculationFeedback && (
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{calculationFeedback}</span>
            </div>
          )}

          {/* Calculated Result Card */}
          <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl text-white shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-100">
                Resultado do Cálculo
              </span>
              <span className="text-[11px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full font-medium">
                Ponto inicial: Perequê Mirim
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-orange-100 block">Distância Calculada</span>
                <span className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                  {distanceKm.toFixed(1)} km
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-orange-100 block">Taxa de Entrega</span>
                <span className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                  {formatCurrency(currentFee)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-orange-100">
                {distanceKm < 2.0
                  ? 'Tarifa mínima fixa de R$ 5,00 (< 2 km)'
                  : `Cálculo: ${distanceKm.toFixed(1)} km × R$ 1,50 = ${formatCurrency(currentFee)}`}
              </span>

              {/* Link to view route directly on Google Maps */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white text-orange-900 font-bold px-3 py-1.5 rounded-lg text-[11px] hover:bg-orange-50 transition-colors shrink-0 shadow-xs"
              >
                <span>Ver rota no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Manual Fine-Tuning Slider */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-700">Ajuste manual da quilometragem:</span>
              <span className="font-mono font-extrabold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                {distanceKm.toFixed(1)} km
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>0.5 km (Centro/Próximo)</span>
              <span>25 km (Norte/Sul)</span>
              <span>50 km (Extremo)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Fechar
          </button>

          {onApplyDistance && (
            <button
              onClick={handleApply}
              className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Usar este Endereço e Taxa ({formatCurrency(currentFee)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
