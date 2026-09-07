export type ScreenName =
  | 'login'
  | 'register'
  | 'home'
  | 'add_product'
  | 'sell_online'
  | 'marketplace_listing'
  | 'my_products'
  | 'my_listings'
  | 'profile';

export type Language = 'en' | 'hi';

export interface User {
  name: string;
  businessName: string;
  phone: string;
  language: Language;
  location: string;
  isLoggedIn: boolean;
}

export type Marketplace = 'amazon' | 'meesho' | 'flipkart' | 'myntra';

export type ListingStatus =
  | 'Prepared'
  | 'Draft'
  | 'Pending'
  | 'Not Prepared';

export interface Product {
  id: string;
  title: string;
  titleHi?: string;
  category: string;
  description: string;
  descriptionHi?: string;

  // Structured product information
  material: string;
  color?: string;
  design?: string;
  technique?: string;
  features?: string[];

  rawMaterialCost: number;
  marketPriceRange: {
    min: number;
    max: number;
  };
  suggestedPrice: number;
  finalPrice: number;
  quantity: number;
  dimensions?: string;
  weight?: string;
  keywords: string[];
  imageUrl: string;
  enhancedImageUrl?: string;
  createdAt: string;
  status: 'Ready' | 'Draft';
}

export interface MarketplaceListing {
  id: string;
  productId: string;
  marketplace: Marketplace;
  status: ListingStatus;
  preparedAt?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  keywords: string[];
  sku?: string;
}

export interface DraftProduct {
  step: number;

  imageUrl: string;
  enhancedImageUrl?: string;

  category: string;

  // Structured AI product information
  material: string;
  color: string;
  design: string;
  technique: string;
  features: string[];

  rawMaterialCost: number;
  quantity: number;
  dimensions: string;
  weight: string;

  voiceInputUsed: boolean;
  rawDescription: string;

  aiTitleEn: string;
  aiTitleHi: string;

  aiDescriptionEn: string;
  aiDescriptionHi: string;

  keywords: string[];

  suggestedPrice: number;

  marketPriceRange: {
    min: number;
    max: number;
  };

  selectedPrice: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  conversationId: string;
  message?: string;
}

