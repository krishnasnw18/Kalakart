import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PlusCircle,
  Package,
  Store,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface BackendProduct {
  id: string;
  name: string;
  category: string;
  descriptionEnglish?: string;
  descriptionHindi?: string;
  material?: string;
  rawMaterialCost?: number;
  price?: number;
  imageUrl?: string;
  userId?: string;
  createdAt?: unknown;
}

interface DisplayProduct {
  id: string;
  title: string;
  titleHi?: string;
  category: string;
  description: string;
  descriptionHi?: string;
  finalPrice: number;
  imageUrl: string;
  enhancedImageUrl?: string;
  status: 'Ready' | 'Draft';
  rawMaterialCost: number;
  quantity: number;
  keywords: string[];
  marketPriceRange: {
    min: number;
    max: number;
  };
  suggestedPrice: number;
  createdAt: string;
}

export const MyProductsScreen: React.FC = () => {
  const {
    products: localProducts,
    setCurrentScreen,
    resetDraft,
    setSelectedProductIdForListing,
    t,
    language,
    user
  } = useApp();

  const [products, setProducts] = useState<
    DisplayProduct[]
  >([]);

  const [selectedCategory, setSelectedCategory] =
    useState<string>('All');

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // ==========================================
  // LOAD PRODUCTS FROM BACKEND
  // ==========================================

  const loadProducts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://10.0.2.2:5000/api/products'
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Failed to load products'
        );
      }

      const backendProducts: BackendProduct[] =
        Array.isArray(data.products)
          ? data.products
          : [];

      // Only show products belonging to current user
      const userProducts =
        user.phone
          ? backendProducts.filter(
              product =>
                !product.userId ||
                product.userId === user.phone
            )
          : backendProducts;

      const mappedProducts: DisplayProduct[] =
        userProducts.map(product => ({
          id: product.id,

          title:
            product.name ||
            'Untitled Product',

          titleHi:
            product.name ||
            undefined,

          category:
            product.category ||
            'Other',

          description:
            product.descriptionEnglish ||
            '',

          descriptionHi:
            product.descriptionHindi ||
            '',

          finalPrice:
            Number(product.price) || 0,

          imageUrl:
            product.imageUrl ||
            'https://via.placeholder.com/300x300?text=No+Image',

          enhancedImageUrl:
            product.imageUrl ||
            undefined,

          status: 'Ready',

          rawMaterialCost:
            Number(
              product.rawMaterialCost
            ) || 0,

          quantity: 1,

          keywords: [],

          marketPriceRange: {
            min:
              Number(product.price) || 0,

            max:
              Number(product.price) || 0
          },

          suggestedPrice:
            Number(product.price) || 0,

          createdAt:
            product.createdAt
              ? String(
                  product.createdAt
                )
              : ''
        }));

      setProducts(mappedProducts);

    } catch (err) {
      console.error(
        'Load products error:',
        err
      );

      setError(
        language === 'en'
          ? 'Could not load products from the server.'
          : 'सर्वर से उत्पाद लोड नहीं हो सके।'
      );

      // Fallback to existing local products
      setProducts(
        localProducts.map(product => ({
          id: product.id,
          title: product.title,
          titleHi: product.titleHi,
          category: product.category,
          description: product.description,
          descriptionHi:
            product.descriptionHi,
          finalPrice:
            product.finalPrice,
          imageUrl:
            product.imageUrl,
          enhancedImageUrl:
            product.enhancedImageUrl,
          status:
            product.status,
          rawMaterialCost:
            product.rawMaterialCost,
          quantity:
            product.quantity,
          keywords:
            product.keywords,
          marketPriceRange:
            product.marketPriceRange,
          suggestedPrice:
            product.suggestedPrice,
          createdAt:
            product.createdAt
        }))
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, [user.phone]);

  // ==========================================
  // FILTER
  // ==========================================

  const categories = [
    'All',
    ...Array.from(
      new Set(
        products.map(
          product => product.category
        )
      )
    )
  ];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter(
          product =>
            product.category ===
            selectedCategory
        );

  // ==========================================
  // ACTIONS
  // ==========================================

  const handlePrepareListingForProduct = (
    productId: string
  ) => {
    setSelectedProductIdForListing(
      productId
    );

    setCurrentScreen(
      'sell_online'
    );
  };

  const handleAddNew = () => {
    resetDraft();
    setCurrentScreen(
      'add_product'
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return (
      <div
        className="app-screen-container"
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: '#6e625a'
          }}
        >
          <RefreshCw
            size={28}
            style={{
              marginBottom: '10px'
            }}
          />

          <p>
            {language === 'en'
              ? 'Loading your products...'
              : 'आपके उत्पाद लोड हो रहे हैं...'}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div
      className="app-screen-container"
      style={{
        padding: '16px'
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: '14px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '22px',
              color: '#3C6E71'
            }}
          >
            {t('myProducts')}
          </h2>

          <span
            style={{
              fontSize: '12px',
              color: '#6e625a'
            }}
          >
            {products.length}{' '}
            {language === 'en'
              ? 'Craft Products Catalog'
              : 'कुल हस्तशिल्प उत्पाद'}
          </span>
        </div>

        <button
          type="button"
          className="btn-primary"
          id="btn-products-add-new"
          onClick={handleAddNew}
          style={{
            width: 'auto',
            padding: '8px 14px',
            minHeight: '40px',
            fontSize: '13px'
          }}
        >
          <PlusCircle size={16} />

          <span>
            {t('addNewProduct')}
          </span>
        </button>
      </div>

      {/* SERVER ERROR */}

      {error && (
        <div
          style={{
            background: '#fff7ed',
            border:
              '1px solid #fdba74',
            color: '#9a3412',
            padding: '10px 12px',
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} />

          <span>
            {error}
          </span>
        </div>
      )}

      {/* CATEGORY FILTER */}

      {categories.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '12px'
          }}
        >
          {categories.map(
            category => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
                style={{
                  padding:
                    '6px 14px',
                  borderRadius:
                    '16px',
                  border:
                    selectedCategory ===
                    category
                      ? '2px solid #3C6E71'
                      : '1px solid #e8ded5',
                  background:
                    selectedCategory ===
                    category
                      ? '#fef3c7'
                      : '#ffffff',
                  color:
                    selectedCategory ===
                    category
                      ? '#3C6E71'
                      : '#6e625a',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace:
                    'nowrap'
                }}
              >
                {category}
              </button>
            )
          )}
        </div>
      )}

      {/* EMPTY */}

      {filteredProducts.length ===
      0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '30px'
          }}
        >
          <Package
            size={40}
            color="#d1c4b8"
            style={{
              marginBottom: '10px'
            }}
          />

          <p
            style={{
              color: '#6e625a',
              fontSize: '14px'
            }}
          >
            {t(
              'noProductsYet'
            )}
          </p>

          <button
            type="button"
            className="btn-primary"
            onClick={
              handleAddNew
            }
            style={{
              marginTop: '14px'
            }}
          >
            {t(
              'addNewProduct'
            )}
          </button>
        </div>
      ) : (
        /* PRODUCTS */

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {filteredProducts.map(
            product => (
              <div
                key={product.id}
                className="card"
                style={{
                  padding: '14px',
                  marginBottom: 0
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '12px'
                  }}
                >
                  <img
                    src={
                      product.enhancedImageUrl ||
                      product.imageUrl
                    }
                    alt={
                      product.title
                    }
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius:
                        '10px',
                      objectFit:
                        'cover'
                    }}
                    onError={event => {
                      event.currentTarget.src =
                        'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection:
                        'column',
                      justifyContent:
                        'space-between'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'flex-start'
                        }}
                      >
                        <span
                          className="badge badge-green"
                          style={{
                            fontSize:
                              '10px'
                          }}
                        >
                          {
                            product.status
                          }
                        </span>

                        <span
                          style={{
                            fontSize:
                              '11px',
                            color:
                              '#6e625a'
                          }}
                        >
                          {
                            product.category
                          }
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize:
                            '15px',
                          color:
                            '#2a201b',
                          marginTop:
                            '4px',
                          fontWeight: 700
                        }}
                      >
                        {language ===
                          'hi' &&
                        product.titleHi
                          ? product.titleHi
                          : product.title}
                      </h3>
                    </div>

                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                        alignItems:
                          'center',
                        marginTop:
                          '6px'
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            '16px',
                          fontWeight:
                            800,
                          color:
                            '#3C6E71'
                        }}
                      >
                        ₹
                        {
                          product.finalPrice
                        }
                      </div>

                      <button
                        type="button"
                        className="btn-secondary"
                        id={`btn-prepare-listing-${product.id}`}
                        onClick={() =>
                          handlePrepareListingForProduct(
                            product.id
                          )
                        }
                        style={{
                          width:
                            'auto',
                          padding:
                            '4px 10px',
                          minHeight:
                            '32px',
                          fontSize:
                            '11px',
                          gap: '4px'
                        }}
                      >
                        <Store
                          size={14}
                          color="#3C6E71"
                        />

                        <span>
                          {t(
                            'sellOnline'
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

