import React from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, Package, Store, CheckCircle2, Sparkles, TrendingUp, ChevronRight, ShoppingBag } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { user, products, listings, setCurrentScreen, resetDraft, t, language } = useApp();

  const preparedListingsCount = listings.filter(l => l.status === 'Prepared').length;

  const handleStartAddProduct = () => {
    resetDraft();
    setCurrentScreen('add_product');
  };

  return (
    <div className="app-screen-container" style={{ padding: '16px' }}>
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #c85a32 0%, #d97706 100%)',
        color: '#ffffff',
        border: 'none',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
              {user.businessName}
            </span>
            <h1 style={{ fontSize: '24px', color: '#ffffff', marginTop: '8px', fontWeight: 700 }}>
              {t('namaste')}, {user.name} 👋
            </h1>
            <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>
              {language === 'en' ? 'Empowering your craft with AI marketplace automation' : 'AI द्वारा आपके हस्तशिल्प का ऑनलाइन विस्तार'}
            </p>
          </div>
          <div style={{ fontSize: '32px' }}>✨</div>
        </div>

        {/* Quick KPI stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{products.length}</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>{t('myProducts')}</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{preparedListingsCount}</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>{t('prepared')} Listings</div>
          </div>
        </div>
      </div>

      {/* Main Action Callout: Add New Product */}
      <div 
        className="card ai-pulse-box" 
        onClick={handleStartAddProduct}
        id="btn-home-add-product"
        style={{
          cursor: 'pointer',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px'
        }}
      >
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: '#fef3c7',
          color: '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <PlusCircle size={32} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ fontSize: '18px', color: '#c85a32' }}>{t('addNewProduct')}</h3>
            <Sparkles size={16} color="#d97706" />
          </div>
          <p style={{ fontSize: '12px', color: '#6e625a', marginTop: '2px' }}>
            {t('addNewProductDesc')}
          </p>
        </div>
        <ChevronRight size={22} color="#c85a32" />
      </div>

      {/* Grid of Quick Actions */}
      <h3 style={{ fontSize: '16px', margin: '20px 0 12px', color: '#4a2e1b' }}>
        {t('whatToNext')}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Card 1: My Products */}
        <div 
          className="card" 
          onClick={() => setCurrentScreen('my_products')}
          id="btn-home-my-products"
          style={{ cursor: 'pointer', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px' }}>{t('myProducts')}</h4>
            <span style={{ fontSize: '12px', color: '#6e625a' }}>{products.length} {language === 'en' ? 'Items' : 'उत्पाद'}</span>
          </div>
        </div>

        {/* Card 2: Sell Online */}
        <div 
          className="card" 
          onClick={() => setCurrentScreen('sell_online')}
          id="btn-home-sell-online"
          style={{ cursor: 'pointer', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#dcfce7',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Store size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px' }}>{t('sellOnline')}</h4>
            <span style={{ fontSize: '12px', color: '#6e625a' }}>Amazon, Meesho, Flipkart</span>
          </div>
        </div>

        {/* Card 3: My Listings */}
        <div 
          className="card" 
          onClick={() => setCurrentScreen('my_listings')}
          id="btn-home-my-listings"
          style={{ cursor: 'pointer', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '10px', gridColumn: 'span 2' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px' }}>{t('myListings')}</h4>
                <span style={{ fontSize: '12px', color: '#6e625a' }}>
                  {preparedListingsCount} {t('listingsPreparedCount')}
                </span>
              </div>
            </div>
            <ChevronRight size={20} color="#6e625a" />
          </div>
        </div>
      </div>

      {/* Status Progress Section */}
      <div className="card" style={{ marginTop: '16px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <TrendingUp size={20} color="#c85a32" />
          <h4 style={{ fontSize: '15px' }}>{t('progressStatus')}</h4>
        </div>
        
        <div style={{ background: '#fdfbf7', padding: '12px', borderRadius: '10px', border: '1px solid #e8ded5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            <span>Marketplace Readiness</span>
            <span style={{ color: '#16a34a' }}>75% Ready</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e8ded5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #c85a32, #16a34a)' }}></div>
          </div>
          <p style={{ fontSize: '12px', color: '#6e625a', marginTop: '8px' }}>
            💡 {language === 'en' 
              ? 'Prepare your listings for Meesho to reach 10x more customers across India.' 
              : 'पूरे भारत में 10 गुना अधिक ग्राहकों तक पहुंचने के लिए अपनी लिस्टिंग तैयार करें।'}
          </p>
        </div>
      </div>
    </div>
  );
};
