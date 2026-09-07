import React from 'react';
import { useApp } from '../context/AppContext';
import {
  PlusCircle,
  Package,
  Store,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Mic,
  Wand2,
  Globe2
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    user,
    products,
    listings,
    setCurrentScreen,
    resetDraft,
    t,
    language
  } = useApp();

  const preparedListingsCount = listings.filter(
    listing => listing.status === 'Prepared'
  ).length;

  const handleStartAddProduct = () => {
    resetDraft();
    setCurrentScreen('add_product');
  };

  return (
    <div
      className="app-screen-container"
      style={{
        padding: '16px',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* =========================================
          SUBTLE ARTISAN BACKGROUND DETAILS
         ========================================= */}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '24px',
          right: '-35px',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          border: '1px solid rgba(60, 110, 113, 0.10)',
          boxShadow:
            '0 0 0 16px rgba(60, 110, 113, 0.025), 0 0 0 32px rgba(60, 110, 113, 0.018)',
          pointerEvents: 'none'
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '145px',
          left: '-45px',
          width: '90px',
          height: '90px',
          borderRadius: '28px',
          border: '1px solid rgba(60, 110, 113, 0.08)',
          transform: 'rotate(22deg)',
          pointerEvents: 'none'
        }}
      />

      {/* =========================================
          WELCOME HERO
         ========================================= */}

      <div
        className="card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, #3C6E71 0%, #3C6E71 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '22px',
          boxShadow:
            '0 12px 28px rgba(60, 110, 113, 0.22)'
        }}
      >
        {/* Decorative circle */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '170px',
            height: '170px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.10)',
            right: '-65px',
            top: '-65px'
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '90px',
            height: '90px',
            borderRadius: '28px',
            border: '1px solid rgba(255,255,255,0.10)',
            right: '22px',
            bottom: '-42px',
            transform: 'rotate(25deg)'
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.16)',
              padding: '5px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              backdropFilter: 'blur(6px)'
            }}
          >
            <Sparkles size={13} />
            <span>{user.businessName}</span>
          </div>

          <h1
            style={{
              fontSize: '26px',
              color: '#ffffff',
              marginTop: '12px',
              fontWeight: 800,
              letterSpacing: '-0.3px'
            }}
          >
            {t('namaste')}, {user.name} 👋
          </h1>

          <p
            style={{
              fontSize: '13px',
              opacity: 0.92,
              marginTop: '6px',
              maxWidth: '290px',
              lineHeight: 1.5
            }}
          >
            {language === 'en'
              ? 'Your craft. Your story. AI that helps you take it online.'
              : 'आपकी कला, आपकी कहानी। AI आपकी कला को ऑनलाइन ले जाने में मदद करता है।'}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '16px',
              fontSize: '11px',
              opacity: 0.88
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#bbf7d0',
                boxShadow: '0 0 0 4px rgba(187,247,208,0.14)'
              }}
            />
            <span>
              {language === 'en'
                ? 'AI-powered artisan workspace'
                : 'AI-संचालित कारीगर कार्यक्षेत्र'}
            </span>
          </div>

          {/* Mini stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255,255,255,0.18)'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800
                }}
              >
                {products.length}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  opacity: 0.84
                }}
              >
                {t('myProducts')}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800
                }}
              >
                {preparedListingsCount}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  opacity: 0.84
                }}
              >
                {t('prepared')} Listings
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          MAIN AI ACTION
         ========================================= */}

      <div
        className="card ai-pulse-box"
        onClick={handleStartAddProduct}
        id="btn-home-add-product"
        style={{
          cursor: 'pointer',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '18px',
          marginTop: '2px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
      >
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background:
              'linear-gradient(135deg, #fff1d6, #fef3c7)',
            color: '#3C6E71',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <PlusCircle size={29} />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <h3
              style={{
                fontSize: '17px',
                color: '#3C6E71'
              }}
            >
              {t('addNewProduct')}
            </h3>

            <Sparkles
              size={15}
              color="#3C6E71"
              className="ai-sparkle"
            />
          </div>

          <p
            style={{
              fontSize: '12px',
              color: '#6e625a',
              marginTop: '3px',
              lineHeight: 1.45
            }}
          >
            {language === 'en'
              ? 'Upload one photo, speak naturally, and let AI prepare your product.'
              : 'एक फोटो अपलोड करें, अपनी भाषा में बोलें और AI को आपका उत्पाद तैयार करने दें।'}
          </p>
        </div>

        <ChevronRight
          size={21}
          color="#3C6E71"
          style={{ flexShrink: 0 }}
        />
      </div>

      {/* =========================================
          AI CAPABILITIES
         ========================================= */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '22px 2px 10px'
        }}
      >
        <Sparkles size={17} color="#3C6E71" />

        <h3
          style={{
            fontSize: '16px',
            color: '#4a2e1b'
          }}
        >
          {language === 'en'
            ? 'Kalakart helps with'
            : 'Kalakart आपकी मदद करता है'}
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}
      >
        {/* AI Voice */}
        <div
          className="card"
          style={{
            marginBottom: 0,
            padding: '15px',
            minHeight: '118px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#fff1f0',
              color: '#3C6E71',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
          >
            <Mic size={20} />
          </div>

          <h4 style={{ fontSize: '14px' }}>
            {language === 'en'
              ? 'Speak naturally'
              : 'अपनी भाषा में बोलें'}
          </h4>

          <p
            style={{
              fontSize: '11px',
              color: '#6e625a',
              marginTop: '4px',
              lineHeight: 1.4
            }}
          >
            {language === 'en'
              ? 'Hindi, Marathi or English'
              : 'हिंदी, मराठी या अंग्रेज़ी'}
          </p>
        </div>

        {/* AI Product Intelligence */}
        <div
          className="card"
          style={{
            marginBottom: 0,
            padding: '15px',
            minHeight: '118px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#fff7e6',
              color: '#3C6E71',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
          >
            <Wand2 size={20} />
          </div>

          <h4 style={{ fontSize: '14px' }}>
            {language === 'en'
              ? 'AI understands'
              : 'AI समझता है'}
          </h4>

          <p
            style={{
              fontSize: '11px',
              color: '#6e625a',
              marginTop: '4px',
              lineHeight: 1.4
            }}
          >
            {language === 'en'
              ? 'Details, descriptions & keywords'
              : 'विवरण, जानकारी और कीवर्ड'}
          </p>
        </div>

        {/* Translation */}
        <div
          className="card"
          style={{
            marginBottom: 0,
            padding: '15px',
            minHeight: '118px'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
          >
            <Globe2 size={20} />
          </div>

          <h4 style={{ fontSize: '14px' }}>
            {language === 'en'
              ? 'Reach more buyers'
              : 'अधिक खरीदारों तक पहुंचें'}
          </h4>

          <p
            style={{
              fontSize: '11px',
              color: '#6e625a',
              marginTop: '4px',
              lineHeight: 1.4
            }}
          >
            {language === 'en'
              ? 'Local language to online-ready English'
              : 'स्थानीय भाषा से ऑनलाइन अंग्रेज़ी'}
          </p>
        </div>

        {/* Product workspace */}
        <div
          className="card"
          style={{
            marginBottom: 0,
            padding: '15px',
            minHeight: '118px'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
          >
            <Package size={20} />
          </div>

          <h4 style={{ fontSize: '14px' }}>
            {language === 'en'
              ? 'Keep it organized'
              : 'सब कुछ व्यवस्थित रखें'}
          </h4>

          <p
            style={{
              fontSize: '11px',
              color: '#6e625a',
              marginTop: '4px',
              lineHeight: 1.4
            }}
          >
            {language === 'en'
              ? 'Your products stay in one place'
              : 'आपके सभी उत्पाद एक जगह'}
          </p>
        </div>
      </div>

      {/* =========================================
          QUICK ACTIONS
         ========================================= */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '22px 2px 10px'
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            color: '#4a2e1b'
          }}
        >
          {t('whatToNext')}
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}
      >
        {/* My Products */}
        <div
          className="card"
          onClick={() => setCurrentScreen('my_products')}
          id="btn-home-my-products"
          style={{
            cursor: 'pointer',
            marginBottom: 0,
            padding: '15px',
            transition: 'transform 0.2s ease'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
          >
            <Package size={21} />
          </div>

          <h4 style={{ fontSize: '14px' }}>
            {t('myProducts')}
          </h4>

          <span
            style={{
              fontSize: '11px',
              color: '#6e625a'
            }}
          >
            {products.length}{' '}
            {language === 'en' ? 'Items' : 'उत्पाद'}
          </span>
        </div>

        {/* Sell Online */}
        <div
          className="card"
          onClick={() => setCurrentScreen('sell_online')}
          id="btn-home-sell-online"
          style={{
            cursor: 'pointer',
            marginBottom: 0,
            padding: '15px',
            transition: 'transform 0.2s ease'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
          >
            <Store size={21} />
          </div>

          <h4 style={{ fontSize: '14px' }}>
            {t('sellOnline')}
          </h4>

          <span
            style={{
              fontSize: '11px',
              color: '#6e625a'
            }}
          >
            {language === 'en'
              ? 'Prepare marketplace listings'
              : 'मार्केटप्लेस लिस्टिंग तैयार करें'}
          </span>
        </div>
      </div>

      {/* My Listings */}
      <div
        className="card"
        onClick={() => setCurrentScreen('my_listings')}
        id="btn-home-my-listings"
        style={{
          cursor: 'pointer',
          marginTop: '10px',
          marginBottom: '16px',
          padding: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShoppingBag size={21} />
          </div>

          <div>
            <h4 style={{ fontSize: '14px' }}>
              {t('myListings')}
            </h4>

            <span
              style={{
                fontSize: '11px',
                color: '#6e625a'
              }}
            >
              {preparedListingsCount}{' '}
              {t('listingsPreparedCount')}
            </span>
          </div>
        </div>

        <ChevronRight
          size={19}
          color="#8b7d72"
        />
      </div>

      {/* =========================================
          CLOSING MESSAGE
         ========================================= */}

      <div
        style={{
          textAlign: 'center',
          padding: '8px 18px 4px',
          color: '#8b7d72'
        }}
      >
        <div
          style={{
            fontSize: '18px',
            marginBottom: '5px',
            opacity: 0.75
          }}
        >
          ✦
        </div>

        <p
          style={{
            fontSize: '11px',
            lineHeight: 1.5
          }}
        >
          {language === 'en'
            ? 'Crafted by hands. Powered by AI. Rooted in tradition.'
            : 'हाथों से बना। AI से सशक्त। परंपरा से जुड़ा।'}
        </p>
      </div>
    </div>
  );
};

