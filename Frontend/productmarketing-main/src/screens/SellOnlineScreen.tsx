import React from 'react';
import { useApp } from '../context/AppContext';
import { Marketplace } from '../types';
import { Store, ChevronRight, AlertCircle, ShoppingBag, Layers, ArrowLeft } from 'lucide-react';

export const SellOnlineScreen: React.FC = () => {
  const { products, selectedProductIdForListing, setSelectedProductIdForListing, setSelectedMarketplace, setCurrentScreen, t, language } = useApp();

  const selectedProduct = products.find(p => p.id === selectedProductIdForListing) || products[0];

  const handleSelectMarketplace = (mp: Marketplace) => {
    setSelectedMarketplace(mp);
    setCurrentScreen('marketplace_listing');
  };

  return (
    <div className="app-screen-container" style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => setCurrentScreen('home')}
          style={{ background: 'none', border: 'none', color: '#c85a32', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          <span>{t('back')}</span>
        </button>
      </div>

      <h2 style={{ fontSize: '22px', color: '#c85a32', marginBottom: '6px' }}>{t('chooseMarketplace')}</h2>
      <p style={{ fontSize: '13px', color: '#6e625a', marginBottom: '18px' }}>
        {t('sellOnlineDesc')}
      </p>

      {/* Selected Product Pill */}
      {selectedProduct && (
        <div className="card" style={{ padding: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <img
            src={selectedProduct.enhancedImageUrl || selectedProduct.imageUrl}
            alt={selectedProduct.title}
            style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <span style={{ fontSize: '11px', color: '#6e625a', fontWeight: 600 }}>Selected Craft Product</span>
            <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedProduct.title}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#c85a32' }}>
              ₹{selectedProduct.finalPrice}
            </span>
          </div>
          {products.length > 1 && (
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px', fontSize: '12px' }}
              value={selectedProduct.id}
              onChange={(e) => setSelectedProductIdForListing(e.target.value)}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Notice box */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1e40af',
        padding: '10px 14px',
        borderRadius: '12px',
        fontSize: '12px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          {language === 'en' 
            ? 'Note: ShilpAura formats listings according to each marketplace taxonomy specs without requiring paid API keys.'
            : 'नोट: शिल्पओरा प्रत्येक मार्केटप्लेस की विनिर्देशों के अनुसार लिस्टिंग तैयार करता है।'}
        </span>
      </div>

      {/* 3 Marketplace Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Amazon Card */}
        <div className="card" style={{ padding: '18px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#fff7ed',
              border: '1px solid #ffedd5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📦
            </div>
            <div>
              <h3 style={{ fontSize: '17px', color: '#111827' }}>Amazon India</h3>
              <p style={{ fontSize: '12px', color: '#6e625a' }}>
                {language === 'en' ? 'A+ Content formatting & SEO keywords' : 'ए+ सामग्री प्रारूप और SEO कीवर्ड्स'}
              </p>
            </div>
          </div>
          <button
            className="btn-primary"
            id="btn-prepare-amazon"
            onClick={() => handleSelectMarketplace('amazon')}
            style={{ width: 'auto', padding: '10px 16px', minHeight: '40px', fontSize: '13px' }}
          >
            <span>{t('prepareListing')}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Meesho Card */}
        <div className="card" style={{ padding: '18px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#fdf2f8',
              border: '1px solid #fce7f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🛍️
            </div>
            <div>
              <h3 style={{ fontSize: '17px', color: '#111827' }}>Meesho</h3>
              <p style={{ fontSize: '12px', color: '#6e625a' }}>
                {language === 'en' ? 'Zero commission reseller catalog' : 'जीरो कमीशन रीसेलर कैटलॉग'}
              </p>
            </div>
          </div>
          <button
            className="btn-primary"
            id="btn-prepare-meesho"
            onClick={() => handleSelectMarketplace('meesho')}
            style={{ width: 'auto', padding: '10px 16px', minHeight: '40px', fontSize: '13px', background: 'linear-gradient(135deg, #db2777 0%, #e11d48 100%)' }}
          >
            <span>{t('prepareListing')}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Flipkart Card */}
        <div className="card" style={{ padding: '18px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🛒
            </div>
            <div>
              <h3 style={{ fontSize: '17px', color: '#111827' }}>Flipkart Samarth</h3>
              <p style={{ fontSize: '12px', color: '#6e625a' }}>
                {language === 'en' ? 'Artisan dedicated storefront template' : 'कारीगर विशेष स्टोरफ्रंट टेम्पलेट'}
              </p>
            </div>
          </div>
          <button
            className="btn-primary"
            id="btn-prepare-flipkart"
            onClick={() => handleSelectMarketplace('flipkart')}
            style={{ width: 'auto', padding: '10px 16px', minHeight: '40px', fontSize: '13px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
          >
            <span>{t('prepareListing')}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
