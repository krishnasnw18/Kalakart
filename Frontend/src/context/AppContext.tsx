import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import {
  User,
  Product,
  MarketplaceListing,
  ScreenName,
  Language,
  DraftProduct,
  Marketplace
} from '../types';

import {
  INITIAL_PRODUCTS,
  INITIAL_LISTINGS,
  TRANSLATIONS
} from '../data/sampleData';

interface AppContextType {
  user: User;
  language: Language;
  setLanguage: (lang: Language) => void;

  currentScreen: ScreenName;
  setCurrentScreen: (screen: ScreenName) => void;

  products: Product[];
  listings: MarketplaceListing[];

  draftProduct: DraftProduct;
  setDraftProduct: React.Dispatch<
    React.SetStateAction<DraftProduct>
  >;

  selectedMarketplace: Marketplace | null;
  setSelectedMarketplace: (
    marketplace: Marketplace | null
  ) => void;

  selectedProductIdForListing: string | null;
  setSelectedProductIdForListing: (
    id: string | null
  ) => void;

  // Authentication
  sendOtp: (phone: string) => Promise<boolean>;
  login: (phone: string, otp: string) => Promise<boolean>;
  register: (
    userData: Omit<User, 'isLoggedIn'>
  ) => Promise<boolean>;
  logout: () => void;

  // Products
  saveCurrentDraftProduct: () => Product;

  // Marketplace
  saveMarketplaceListing: (
    listing: Omit<
      MarketplaceListing,
      'id' | 'preparedAt'
    >
  ) => void;

  // Translation
  t: (
    key: keyof typeof TRANSLATIONS['en'],
    params?: Record<string, string | number>
  ) => string;

  resetDraft: () => void;
}

const API_BASE_URL = 'http://localhost:5000';

const DEFAULT_USER: User = {
  name: 'Rameshwar Ram',
  businessName: 'Ram Handicrafts & Terracotta',
  phone: '9876543210',
  language: 'en',
  location: 'Varanasi, Uttar Pradesh',
  isLoggedIn: false
};

const DEFAULT_DRAFT: DraftProduct = {
  step: 1,

  imageUrl:
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',

  category: 'Handloom & Textiles',

  material: 'Pure Silk',
  color: 'Red and Gold',
  design: 'Traditional Zari Border',
  technique: 'Handloom Weaving',
  features: [
    'Handwoven',
    'Traditional Zari Work',
    'Soft Silk Fabric'
  ],

  rawMaterialCost: 800,

  quantity: 10,

  dimensions: '5.5m x 1.2m',

  weight: '500g',

  voiceInputUsed: false,

  rawDescription:
    'Handwoven pure silk saree with fine gold Zari embroidery made in Varanasi.',

  aiTitleEn:
    'Handmade Pure Silk Saree with Zari Border',

  aiTitleHi:
    'जरी बॉर्डर वाली हस्तनिर्मित शुद्ध सिल्क साड़ी',

  aiDescriptionEn:
    'Exquisite handcrafted silk saree featuring traditional Indian weaving. Soft texture, high durability and rich golden Zari borders perfect for weddings and cultural festivals.',

  aiDescriptionHi:
    'पारंपरिक भारतीय बुनाई वाली उत्कृष्ट हस्तनिर्मित सिल्क साड़ी। शादी और सांस्कृतिक त्योहारों के लिए बहुत ही सुंदर।',

  keywords: [
    'Handloom',
    'Silk Saree',
    'Zari Work',
    'Banarasi',
    'Artisan Made',
    'Ethical'
  ],

  suggestedPrice: 1399,

  marketPriceRange: {
    min: 1200,
    max: 1700
  },

  selectedPrice: 1399
};

const AppContext =
  createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem(
      'Kalakart_user'
    );

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USER;
      }
    }

    return DEFAULT_USER;
  });

  const [language, setLanguageState] =
    useState<Language>(() => {
      return user.language || 'en';
    });

  const [currentScreen, setCurrentScreen] =
    useState<ScreenName>(() => {
      return user.isLoggedIn ? 'home' : 'login';
    });

  const [products, setProducts] =
    useState<Product[]>(() => {
      const saved = localStorage.getItem(
        'Kalakart_products'
      );

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return INITIAL_PRODUCTS;
        }
      }

      return INITIAL_PRODUCTS;
    });

  const [listings, setListings] =
    useState<MarketplaceListing[]>(() => {
      const saved = localStorage.getItem(
        'Kalakart_listings'
      );

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return INITIAL_LISTINGS;
        }
      }

      return INITIAL_LISTINGS;
    });

  const [draftProduct, setDraftProduct] =
    useState<DraftProduct>(DEFAULT_DRAFT);

  const [selectedMarketplace, setSelectedMarketplace] =
    useState<Marketplace | null>('amazon');

  const [
    selectedProductIdForListing,
    setSelectedProductIdForListing
  ] = useState<string | null>('prod_1');

  // ------------------------------------------
  // Local storage
  // ------------------------------------------

  useEffect(() => {
    localStorage.setItem(
      'Kalakart_user',
      JSON.stringify(user)
    );
  }, [user]);

  useEffect(() => {
    localStorage.setItem(
      'Kalakart_products',
      JSON.stringify(products)
    );
  }, [products]);

  useEffect(() => {
    localStorage.setItem(
      'Kalakart_listings',
      JSON.stringify(listings)
    );
  }, [listings]);

  // ------------------------------------------
  // Language
  // ------------------------------------------

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);

    setUser(prev => ({
      ...prev,
      language: lang
    }));
  };

  // ------------------------------------------
  // SEND OTP
  // ------------------------------------------

  const sendOtp = async (
    phone: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/send-otp`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            phone
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          'Send OTP failed:',
          data?.message
        );

        return false;
      }

      console.log(
        'OTP response:',
        data
      );

      return true;
    } catch (error) {
      console.error(
        'Send OTP error:',
        error
      );

      return false;
    }
  };

  // ------------------------------------------
  // VERIFY OTP / LOGIN
  // ------------------------------------------

  const login = async (
    phone: string,
    otp: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/verify-otp`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            phone,
            otp
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          'Login failed:',
          data?.message
        );

        return false;
      }

      const loggedInUser: User = {
        ...data.user,
        isLoggedIn: true
      };

      setUser(loggedInUser);

      setLanguageState(
        loggedInUser.language || 'en'
      );

      setCurrentScreen('home');

      return true;
    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      return false;
    }
  };

  // ------------------------------------------
  // REGISTER
  // ------------------------------------------

  const register = async (
    userData: Omit<User, 'isLoggedIn'>
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(userData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          'Registration failed:',
          data?.message
        );

        return false;
      }

      const registeredUser: User = {
        ...data.user,
        isLoggedIn: true
      };

      setUser(registeredUser);

      setLanguageState(
        registeredUser.language || 'en'
      );

      setCurrentScreen('home');

      return true;
    } catch (error) {
      console.error(
        'Registration error:',
        error
      );

      return false;
    }
  };

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------

  const logout = () => {
    setUser(prev => ({
      ...prev,
      isLoggedIn: false
    }));

    setCurrentScreen('login');
  };

  // ------------------------------------------
  // RESET DRAFT
  // ------------------------------------------

  const resetDraft = () => {
    setDraftProduct(DEFAULT_DRAFT);
  };

  // ------------------------------------------
  // SAVE PRODUCT
  // ------------------------------------------

  const saveCurrentDraftProduct = (): Product => {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,

      title: draftProduct.aiTitleEn,

      titleHi: draftProduct.aiTitleHi,

      category: draftProduct.category,

      material: draftProduct.material,
      color: draftProduct.color,
      design: draftProduct.design,
      technique: draftProduct.technique,
      features: draftProduct.features,

      description:
        draftProduct.aiDescriptionEn,

      descriptionHi:
        draftProduct.aiDescriptionHi,

      rawMaterialCost:
        draftProduct.rawMaterialCost,

      marketPriceRange:
        draftProduct.marketPriceRange,

      suggestedPrice:
        draftProduct.suggestedPrice,

      finalPrice:
        draftProduct.selectedPrice,

      quantity:
        draftProduct.quantity,

      dimensions:
        draftProduct.dimensions,

      weight:
        draftProduct.weight,

      keywords:
        draftProduct.keywords,

      imageUrl:
        draftProduct.imageUrl,

      enhancedImageUrl:
        draftProduct.enhancedImageUrl ||
        draftProduct.imageUrl,

      createdAt:
        new Date()
          .toISOString()
          .split('T')[0],

      status: 'Ready'
    };

    setProducts(prev => [
      newProduct,
      ...prev
    ]);

    return newProduct;
  };

  // ------------------------------------------
  // SAVE MARKETPLACE LISTING
  // ------------------------------------------

  const saveMarketplaceListing = (
    listingData: Omit<
      MarketplaceListing,
      'id' | 'preparedAt'
    >
  ) => {
    const newListing: MarketplaceListing = {
      ...listingData,

      id: `list_${Date.now()}`,

      preparedAt:
        new Date()
          .toISOString()
          .split('T')[0]
    };

    setListings(prev => {
      const existingIndex =
        prev.findIndex(
          listing =>
            listing.productId ===
              listingData.productId &&
            listing.marketplace ===
              listingData.marketplace
        );

      if (existingIndex >= 0) {
        const updated = [...prev];

        updated[existingIndex] =
          newListing;

        return updated;
      }

      return [
        newListing,
        ...prev
      ];
    });
  };

  // ------------------------------------------
  // TRANSLATIONS
  // ------------------------------------------

  const t = (
    key: keyof typeof TRANSLATIONS['en'],
    params?: Record<
      string,
      string | number
    >
  ): string => {
    const dictionary =
      TRANSLATIONS[language] ||
      TRANSLATIONS['en'];

    let text =
      dictionary[key] ||
      TRANSLATIONS['en'][key] ||
      key;

    if (params) {
      Object.keys(params).forEach(
        parameter => {
          text = text.replace(
            `{${parameter}}`,
            String(params[parameter])
          );
        }
      );
    }

    return text;
  };

  // ------------------------------------------
  // PROVIDER
  // ------------------------------------------

  return (
    <AppContext.Provider
      value={{
        user,
        language,
        setLanguage,

        currentScreen,
        setCurrentScreen,

        products,
        listings,

        draftProduct,
        setDraftProduct,

        selectedMarketplace,
        setSelectedMarketplace,

        selectedProductIdForListing,
        setSelectedProductIdForListing,

        sendOtp,
        login,
        register,
        logout,

        saveCurrentDraftProduct,
        saveMarketplaceListing,

        t,
        resetDraft
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ------------------------------------------
// useApp hook
// ------------------------------------------

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used within an AppProvider'
    );
  }

  return context;
};

