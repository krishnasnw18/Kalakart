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

export type Marketplace = 'amazon' | 'meesho' | 'flipkart';

export type ListingStatus = 'Prepared' | 'Draft' | 'Pending' | 'Not Prepared';

export interface Product {
  id: string;
  title: string;
  titleHi?: string;
  category: string;
  description: string;
  descriptionHi?: string;
  rawMaterialCost: number;
  marketPriceRange: { min: number; max: number };
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
  step: number; // 1: Image, 2: Details, 3: AI Studio, 4: AI Catalog, 5: AI Pricing, 6: Preview
  imageUrl: string;
  enhancedImageUrl?: string;
  category: string;
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
  marketPriceRange: { min: number; max: number };
  selectedPrice: number;
}
