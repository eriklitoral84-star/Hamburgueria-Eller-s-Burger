export interface RestaurantAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  fullAddress: string;
}

export interface PaymentOption {
  id: string;
  name: string;
  description: string;
}

export interface RestaurantInfo {
  name: string;
  slug: string;
  tagline: string;
  type: string;
  phone: string;
  whatsappFormatted: string;
  address: RestaurantAddress;
  deliveryRatePerKm: number;
  minDeliveryFeeBelow2Km?: number;
  deliveryTime: string;
  pickupTime: string;
  openingHours: string;
  paymentMethods: PaymentOption[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  highlight?: boolean;
  tag?: string;
  addons?: string[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedAddons: Addon[];
  observation: string;
  itemPriceUnit: number;
  itemPriceTotal: number;
}

export interface DeliveryNeighborhood {
  name: string;
  city: 'Caraguatatuba' | 'São Sebastião';
  distanceKm: number;
}

export type DeliveryType = 'delivery' | 'pickup';

export interface CustomerOrderDetails {
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  // Delivery address fields
  cep?: string;
  city?: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  reference: string;
  distanceKm: number;
  deliveryFee: number;
  // Payment
  paymentMethod: string;
  cashChangeFor?: string;
}
