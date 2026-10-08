import { CartItem, CustomerOrderDetails, DeliveryNeighborhood, RestaurantInfo } from '../types';

export const STORE_LOCATION = {
  name: "ELLER'S BURGUER",
  address: "Rua Antônio Ovídeo Ferreira, 375 - Perequê Mirim, Caraguatatuba - SP",
  cep: "11669-170",
  lat: -23.70897,
  lng: -45.43798,
  ratePerKm: 1.5, // R$ 1,50 por km
  minFeeBelow2Km: 5.0, // Taxa mínima abaixo de 2 km: R$ 5,00
};

// Known neighborhoods in Caraguatatuba with route distance (in km) from store at Perequê Mirim
export const CARAGUA_NEIGHBORHOODS: DeliveryNeighborhood[] = [
  { name: "Perequê Mirim", city: "Caraguatatuba", distanceKm: 1.0 },
  { name: "Travessão", city: "Caraguatatuba", distanceKm: 2.0 },
  { name: "Pegorelli", city: "Caraguatatuba", distanceKm: 2.2 },
  { name: "Barranco Alto", city: "Caraguatatuba", distanceKm: 3.5 },
  { name: "Porto Novo", city: "Caraguatatuba", distanceKm: 4.5 },
  { name: "Morro do Algodão", city: "Caraguatatuba", distanceKm: 5.5 },
  { name: "Golfinho", city: "Caraguatatuba", distanceKm: 6.0 },
  { name: "Pontal Santamarina", city: "Caraguatatuba", distanceKm: 6.8 },
  { name: "Praia das Palmeiras", city: "Caraguatatuba", distanceKm: 7.5 },
  { name: "Jardim Britânia", city: "Caraguatatuba", distanceKm: 8.8 },
  { name: "Tinga", city: "Caraguatatuba", distanceKm: 9.5 },
  { name: "Indaiá", city: "Caraguatatuba", distanceKm: 10.5 },
  { name: "Jaraguazinho", city: "Caraguatatuba", distanceKm: 11.0 },
  { name: "Jardim Jaqueira", city: "Caraguatatuba", distanceKm: 11.5 },
  { name: "Poiares", city: "Caraguatatuba", distanceKm: 11.8 },
  { name: "Estrela D'Alva", city: "Caraguatatuba", distanceKm: 12.0 },
  { name: "Centro de Caraguatatuba", city: "Caraguatatuba", distanceKm: 13.0 },
  { name: "Prainha", city: "Caraguatatuba", distanceKm: 15.0 },
  { name: "Martim de Sá", city: "Caraguatatuba", distanceKm: 16.0 },
  { name: "Cantagalo", city: "Caraguatatuba", distanceKm: 17.5 },
  { name: "Capricórnio", city: "Caraguatatuba", distanceKm: 22.0 },
  { name: "Massaguaçu", city: "Caraguatatuba", distanceKm: 24.0 },
  { name: "Cocanha", city: "Caraguatatuba", distanceKm: 26.5 },
  { name: "Mococa", city: "Caraguatatuba", distanceKm: 29.0 },
  { name: "Tabatinga", city: "Caraguatatuba", distanceKm: 32.0 },
];

// Neighborhoods and regions in São Sebastião with route distance (in km) from store at Perequê Mirim
export const SAO_SEBASTIAO_NEIGHBORHOODS: DeliveryNeighborhood[] = [
  { name: "Canto do Mar", city: "São Sebastião", distanceKm: 2.0 },
  { name: "Enseada", city: "São Sebastião", distanceKm: 3.5 },
  { name: "Jaraguá", city: "São Sebastião", distanceKm: 5.0 },
  { name: "Praia das Cigarras", city: "São Sebastião", distanceKm: 9.0 },
  { name: "São Francisco", city: "São Sebastião", distanceKm: 13.0 },
  { name: "Portal da Olaria", city: "São Sebastião", distanceKm: 14.5 },
  { name: "Arrastão", city: "São Sebastião", distanceKm: 15.5 },
  { name: "Pontal da Cruz", city: "São Sebastião", distanceKm: 17.0 },
  { name: "Praia Deserta", city: "São Sebastião", distanceKm: 18.0 },
  { name: "Porto Grande", city: "São Sebastião", distanceKm: 19.5 },
  { name: "Centro Histórico de São Sebastião", city: "São Sebastião", distanceKm: 21.0 },
  { name: "Topolândia", city: "São Sebastião", distanceKm: 22.0 },
  { name: "Itatinga / Olaria", city: "São Sebastião", distanceKm: 22.5 },
  { name: "Varadouro", city: "São Sebastião", distanceKm: 23.5 },
  { name: "Barequeçaba", city: "São Sebastião", distanceKm: 27.0 },
  { name: "Pitangueiras", city: "São Sebastião", distanceKm: 28.5 },
  { name: "Guaecá", city: "São Sebastião", distanceKm: 31.0 },
  { name: "Toque-Toque Grande", city: "São Sebastião", distanceKm: 35.0 },
  { name: "Toque-Toque Pequeno", city: "São Sebastião", distanceKm: 38.0 },
  { name: "Paúba", city: "São Sebastião", distanceKm: 42.0 },
  { name: "Maresias", city: "São Sebastião", distanceKm: 46.0 },
  { name: "Boiçucanga", city: "São Sebastião", distanceKm: 55.0 },
  { name: "Cambury", city: "São Sebastião", distanceKm: 59.0 },
  { name: "Juquehy", city: "São Sebastião", distanceKm: 66.0 },
];

export const ALL_DELIVERY_NEIGHBORHOODS: DeliveryNeighborhood[] = [
  ...CARAGUA_NEIGHBORHOODS,
  ...SAO_SEBASTIAO_NEIGHBORHOODS,
];

export function cleanCep(cep: string): string {
  return (cep || '').replace(/\D/g, '');
}

export function formatCep(cep: string): string {
  const digits = cleanCep(cep).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Calculate delivery fee: R$ 1,50 per km with minimum fee of R$ 5,00 for distances under 2 km
export function calculateDeliveryFee(
  distanceKm: number,
  ratePerKm: number = STORE_LOCATION.ratePerKm,
  minFeeBelow2Km: number = STORE_LOCATION.minFeeBelow2Km
): number {
  if (distanceKm <= 0) return 0;
  const roundedKm = Math.round(distanceKm * 10) / 10;
  if (roundedKm < 2.0) {
    return minFeeBelow2Km; // Taxa mínima fixa de R$ 5,00 abaixo de 2 km
  }
  const fee = Math.max(minFeeBelow2Km, roundedKm * ratePerKm);
  return Math.round(fee * 100) / 100;
}

// Haversine formula with coastal road factor (~1.25x - 1.35x) for real vehicle driving distances
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;

  // Real driving tortuosity factor along SP-055 / urban routes
  const factor = straightDistance < 3 ? 1.25 : 1.35;
  const drivingDistance = straightDistance * factor;
  return Math.max(0.5, Math.round(drivingDistance * 10) / 10);
}

export interface AddressFromCep {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

// Fetch address data from free Brazilian postal services (ViaCEP with BrasilAPI fallback)
export async function fetchAddressByCep(rawCep: string): Promise<AddressFromCep | null> {
  const cleaned = cleanCep(rawCep);
  if (cleaned.length !== 8) return null;

  // Attempt ViaCEP first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (!data.erro) {
        return {
          cep: formatCep(cleaned),
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || 'Caraguatatuba',
          state: data.uf || 'SP',
        };
      }
    }
  } catch {
    // Continue to fallback
  }

  // Fallback to BrasilAPI
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleaned}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      return {
        cep: formatCep(cleaned),
        street: data.street || '',
        neighborhood: data.neighborhood || '',
        city: data.city || 'Caraguatatuba',
        state: data.state || 'SP',
      };
    }
  } catch {
    // Fallback failed
  }

  return null;
}

function normalizeStr(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Estimate distance using free OpenStreetMap geocoding with local neighborhood table fallback
export async function estimateDistanceByAddress(params: {
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
}): Promise<{ distanceKm: number; source: 'gps' | 'table' | 'default' }> {
  const normCity = params.city || 'Caraguatatuba';
  const normNeigh = normalizeStr(params.neighborhood || '');
  const normStreet = normalizeStr(params.street || '');
  const digitsCep = cleanCep(params.cep || '');

  // 1. Try free OpenStreetMap Nominatim geocoding (no API key required)
  const queriesToTry: string[] = [];
  if (params.street && params.neighborhood) {
    queriesToTry.push(`${params.street} ${params.number || ''}, ${params.neighborhood}, ${normCity}, SP, Brasil`);
    queriesToTry.push(`${params.street}, ${normCity}, SP, Brasil`);
  }
  if (params.neighborhood) {
    queriesToTry.push(`${params.neighborhood}, ${normCity}, SP, Brasil`);
  }
  if (digitsCep.length === 8) {
    queriesToTry.push(`${digitsCep}, Brasil`);
  }

  for (const q of queriesToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2800);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=1&countrycodes=br`;

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'pt-BR',
        },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            const calculatedKm = calculateDistanceKm(
              STORE_LOCATION.lat,
              STORE_LOCATION.lng,
              lat,
              lon
            );
            return { distanceKm: calculatedKm, source: 'gps' };
          }
        }
      }
    } catch {
      // Continue to next query
    }
  }

  // 2. Search local table of neighborhoods
  if (normNeigh) {
    const match = ALL_DELIVERY_NEIGHBORHOODS.find((item) => {
      const n = normalizeStr(item.name);
      return normNeigh.includes(n) || n.includes(normNeigh);
    });
    if (match) {
      return { distanceKm: match.distanceKm, source: 'table' };
    }
  }

  // 3. Fallback based on street name matching
  if (normStreet) {
    const match = ALL_DELIVERY_NEIGHBORHOODS.find((item) => {
      const n = normalizeStr(item.name);
      return normStreet.includes(n);
    });
    if (match) {
      return { distanceKm: match.distanceKm, source: 'table' };
    }
  }

  // 4. Default baseline distance for the city
  if (normalizeStr(normCity).includes('sebastiao')) {
    return { distanceKm: 13.0, source: 'default' };
  }

  return { distanceKm: 2.0, source: 'default' };
}

// Backwards-compatibility wrapper
export async function geocodeDeliveryAddress(
  address: string,
  preferredCity?: string
): Promise<number | null> {
  const result = await estimateDistanceByAddress({
    street: address,
    city: preferredCity,
  });
  return result.distanceKm;
}

export const geocodeCaraguatubaAddress = (addr: string) => geocodeDeliveryAddress(addr);

// Build Google Maps turn-by-turn route link from the store origin (no API key required)
export function buildGoogleMapsRouteUrl(destinationAddress: string): string {
  const origin = encodeURIComponent(STORE_LOCATION.address);
  const destination = encodeURIComponent(destinationAddress);
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
}

// Format the final WhatsApp checkout message
export function buildWhatsAppOrderMessage(
  restaurant: RestaurantInfo,
  cartItems: CartItem[],
  orderDetails: CustomerOrderDetails,
  subtotal: number,
  total: number
): string {
  const isDelivery = orderDetails.deliveryType === 'delivery';

  let msg = `🍔 *NOVO PEDIDO - ${restaurant.name.toUpperCase()}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Customer info
  msg += `👤 *Cliente:* ${orderDetails.customerName.trim() || 'Não informado'}\n`;
  msg += `📱 *Telefone:* ${orderDetails.customerPhone.trim() || 'Não informado'}\n`;
  msg += `📍 *Modalidade:* ${isDelivery ? '🚀 ENTREGA (DELIVERY)' : '🛍️ RETIRADA NO BALCÃO'}\n\n`;

  // Items
  msg += `📋 *ITENS DO PEDIDO:*\n`;
  cartItems.forEach((item, index) => {
    msg += `\n*${index + 1}. ${item.quantity}x ${item.product.name}* (${formatCurrency(item.itemPriceTotal)})\n`;

    if (item.selectedAddons && item.selectedAddons.length > 0) {
      msg += `   ➕ *Adicionais:*\n`;
      item.selectedAddons.forEach((addon) => {
        msg += `      • ${addon.name} (+${formatCurrency(addon.price)})\n`;
      });
    }

    if (item.observation && item.observation.trim().length > 0) {
      msg += `   📝 *Obs:* _${item.observation.trim()}_\n`;
    }
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;

  // Delivery / Address Details
  if (isDelivery) {
    const deliveryCity = orderDetails.city || 'Caraguatatuba';
    const cepText = orderDetails.cep ? ` (CEP: ${formatCep(orderDetails.cep)})` : '';
    const fullDest = `${orderDetails.street.trim()}, ${orderDetails.number.trim()} - ${orderDetails.neighborhood.trim()}, ${deliveryCity} - SP${orderDetails.cep ? ', ' + cleanCep(orderDetails.cep) : ''}`;
    const mapsRouteUrl = buildGoogleMapsRouteUrl(fullDest);

    msg += `🛵 *DADOS DE ENTREGA:*\n`;
    msg += `• *Endereço:* ${orderDetails.street.trim()}, Nº ${orderDetails.number.trim()}\n`;
    msg += `• *Bairro:* ${orderDetails.neighborhood.trim()} - ${deliveryCity}${cepText}\n`;
    if (orderDetails.complement && orderDetails.complement.trim()) {
      msg += `• *Complemento:* ${orderDetails.complement.trim()}\n`;
    }
    if (orderDetails.reference && orderDetails.reference.trim()) {
      msg += `• *Ponto de Ref:* ${orderDetails.reference.trim()}\n`;
    }
    const distanceRule = orderDetails.distanceKm < 2.0
      ? 'Taxa mínima R$ 5,00 (< 2 km)'
      : 'R$ 1,50/km';
    msg += `• *Distância da Loja:* ~${orderDetails.distanceKm.toFixed(1)} km (${distanceRule})\n`;
    msg += `• *Origem:* ${STORE_LOCATION.address}\n`;
    msg += `• *Previsão de Entrega:* ${restaurant.deliveryTime}\n`;
    msg += `🗺️ *Trajeto no Google Maps:* ${mapsRouteUrl}\n\n`;
  } else {
    msg += `🏢 *RETIRADA NO LOCAL:*\n`;
    msg += `• *Endereço da Loja:* ${restaurant.address.street}, ${restaurant.address.number} - ${restaurant.address.neighborhood}\n`;
    msg += `• *Previsão de Retirada:* ${restaurant.pickupTime}\n\n`;
  }

  // Payment
  msg += `💳 *FORMA DE PAGAMENTO:*\n`;
  const paymentName =
    restaurant.paymentMethods.find((p) => p.id === orderDetails.paymentMethod)?.name ||
    orderDetails.paymentMethod;
  msg += `• *Método:* ${paymentName}\n`;

  if (orderDetails.paymentMethod === 'dinheiro' && orderDetails.cashChangeFor) {
    msg += `• *Troco para:* ${orderDetails.cashChangeFor}\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *RESUMO DE VALORES:*\n`;
  msg += `• Subtotal dos itens: ${formatCurrency(subtotal)}\n`;
  if (isDelivery) {
    const feeLabel = orderDetails.distanceKm < 2.0
      ? `Taxa mínima (< 2 km)`
      : `Taxa de entrega (${orderDetails.distanceKm.toFixed(1)} km)`;
    msg += `• ${feeLabel}: ${formatCurrency(orderDetails.deliveryFee)}\n`;
  } else {
    msg += `• Taxa de entrega: GRÁTIS (Retirada)\n`;
  }
  msg += `• *TOTAL DO PEDIDO: ${formatCurrency(total)}*\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Por favor, confirmem o recebimento do pedido e o tempo estimado! Obrigado! 😋`;

  return msg;
}

export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  // Strip non-digits from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  // Format with country code 55 (Brazil)
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${fullPhone}?text=${encodedText}`;
}
