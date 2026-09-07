import React from 'react';
import { useApp } from '../context/AppContext';
import { Marketplace } from '../types';
import {
  ChevronRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

const MARKETPLACE_LOGOS: Record<
  Marketplace,
  {
    src: string;
    alt: string;
    bg: string;
    border: string;
  }
> = {
  amazon: {
    src: 'https://www.google.com/s2/favicons?domain=amazon.in&sz=128',
    alt: 'Amazon logo',
    bg: '#fff7ed',
    border: '#ffedd5',
  },
  flipkart: {
    src: 'https://www.google.com/s2/favicons?domain=flipkart.com&sz=128',
    alt: 'Flipkart logo',
    bg: '#eff6ff',
    border: '#dbeafe',
  },
  meesho: {
    src: 'https://www.google.com/s2/favicons?domain=meesho.com&sz=128',
    alt: 'Meesho logo',
    bg: '#fdf2f8',
    border: '#fce7f3',
  },
  myntra: {
    src: 'https://www.google.com/s2/favicons?domain=myntra.com&sz=128',
    alt: 'Myntra logo',
    bg: '#fff1f2',
    border: '#ffe4e6',
  },
};

export const SellOnlineScreen: React.FC = () => {
  const {
    products,
    selectedProductIdForListing,
    setSelectedProductIdForListing,
    setSelectedMarketplace,
    setCurrentScreen,
    t,
    language,
  } = useApp();

  const selectedProduct =
    products.find(p => p.id === selectedProductIdForListing) ||
    products[0];

  const handleSelectMarketplace = (mp: Marketplace) => {
    setSelectedMarketplace(mp);
    setCurrentScreen('marketplace_listing');
  };

  const marketplaceCards: Array<{
    id: Marketplace;
    name: string;
    descriptionEn: string;
    descriptionHi: string;
    buttonBackground: string;
  }> = [
    {
      id: 'amazon',
      name: 'Amazon India',
      descriptionEn: 'A+ Content formatting & SEO keywords',
      descriptionHi: 'ए+ सामग्री प्रारूप और SEO कीवर्ड्स',
      buttonBackground:
        'linear-gradient(135deg, #3C6E71 0%, #ea580c 100%)',
    },
    {
      id: 'flipkart',
      name: 'Flipkart',
      descriptionEn: 'Artisan dedicated storefront template',
      descriptionHi: 'कारीगर विशेष स्टोरफ्रंट टेम्पलेट',
      buttonBackground:
        'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    },
    {
      id: 'meesho',
      name: 'Meesho',
      descriptionEn: 'Zero commission reseller catalog',
      descriptionHi: 'जीरो कमीशन रीसेलर कैटलॉग',
      buttonBackground:
        'linear-gradient(135deg, #db2777 0%, #e11d48 100%)',
    },
    {
      id: 'myntra',
      name: 'Myntra',
      descriptionEn: 'Fashion marketplace listing template',
      descriptionHi: 'फैशन मार्केटप्लेस लिस्टिंग टेम्पलेट',
      buttonBackground:
        'linear-gradient(135deg, #f43f5e 0%, #db2777 100%)',
    },
  ];

  return (
    <div
      className="app-screen-container"
      style={{ padding: '16px' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
        }}
      >
        <button
          type="button"
          onClick={() => setCurrentScreen('home')}
          style={{
            background: 'none',
            border: 'none',
            color: '#3C6E71',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          <span>{t('back')}</span>
        </button>
      </div>

      <h2
        style={{
          fontSize: '22px',
          color: '#3C6E71',
          marginBottom: '6px',
        }}
      >
        {t('chooseMarketplace')}
      </h2>

      <p
        style={{
          fontSize: '13px',
          color: '#6e625a',
          marginBottom: '18px',
        }}
      >
        {t('sellOnlineDesc')}
      </p>

      {/* Selected Product */}
      {selectedProduct && (
        <div
          className="card"
          style={{
            padding: '12px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <img
            src={
              selectedProduct.enhancedImageUrl ||
              selectedProduct.imageUrl
            }
            alt={selectedProduct.title}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />

          <div
            style={{
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                color: '#6e625a',
                fontWeight: 600,
              }}
            >
              Selected Craft Product
            </span>

            <div
              style={{
                fontWeight: 700,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {selectedProduct.title}
            </div>

            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#3C6E71',
              }}
            >
              ₹{selectedProduct.finalPrice}
            </span>
          </div>

          {products.length > 1 && (
            <select
              className="form-control"
              style={{
                width: 'auto',
                padding: '6px',
                fontSize: '12px',
              }}
              value={selectedProduct.id}
              onChange={e =>
                setSelectedProductIdForListing(e.target.value)
              }
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Notice */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
        }}
      >
        <AlertCircle
          size={16}
          style={{
            flexShrink: 0,
            marginTop: '2px',
          }}
        />

        <span>
          {language === 'en'
            ? 'Note: Kalakart formats listings according to each marketplace taxonomy specs without requiring paid API keys.'
            : 'नोट: शिल्पओरा प्रत्येक मार्केटप्लेस की विनिर्देशों के अनुसार लिस्टिंग तैयार करता है।'}
        </span>
      </div>

      {/* Marketplace Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {marketplaceCards.map(marketplace => {
          const logo = MARKETPLACE_LOGOS[marketplace.id];

          return (
            <div
              key={marketplace.id}
              className="card"
              style={{
                padding: '18px',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: logo.bg,
                    border: `1px solid ${logo.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    style={{
                      width: '34px',
                      height: '34px',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: '17px',
                      color: '#111827',
                    }}
                  >
                    {marketplace.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '12px',
                      color: '#6e625a',
                    }}
                  >
                    {language === 'en'
                      ? marketplace.descriptionEn
                      : marketplace.descriptionHi}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                id={`btn-prepare-${marketplace.id}`}
                onClick={() =>
                  handleSelectMarketplace(marketplace.id)
                }
                style={{
                  width: 'auto',
                  padding: '10px 16px',
                  minHeight: '40px',
                  fontSize: '13px',
                  background:
                    marketplace.buttonBackground,
                }}
              >
                <span>{t('prepareListing')}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

