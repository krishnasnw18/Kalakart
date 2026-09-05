import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, Package, Store, Edit, Sparkles, Tag, ArrowLeft } from 'lucide-react';

export const MyProductsScreen: React.FC = () => {
  const { products, setCurrentScreen, resetDraft, setSelectedProductIdForListing, t, language } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handlePrepareListingForProduct = (productId: string) => {
    setSelectedProductIdForListing(productId);
    setCurrentScreen('sell_online');
  };

  const handleAddNew = () => {
    resetDraft();
    setCurrentScreen('add_product');
  };

  return (
    <div className="app-screen-container" style={{ padding: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '22px', color: '#c85a32' }}>{t('myProducts')}</h2>
          <span style={{ fontSize: '12px', color: '#6e625a' }}>
            {products.length} {language === 'en' ? 'Craft Products Catalog' : 'कुल हस्तशिल्प उत्पाद'}
          </span>
        </div>

        <button
          className="btn-primary"
          id="btn-products-add-new"
          onClick={handleAddNew}
          style={{ width: 'auto', padding: '8px 14px', minHeight: '40px', fontSize: '13px' }}
        >
          <PlusCircle size={16} />
          <span>{t('addNewProduct')}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                border: selectedCategory === cat ? '2px solid #c85a32' : '1px solid #e8ded5',
                background: selectedCategory === cat ? '#fef3c7' : '#ffffff',
                color: selectedCategory === cat ? '#c85a32' : '#6e625a',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <Package size={40} color="#d1c4b8" style={{ marginBottom: '10px' }} />
          <p style={{ color: '#6e625a', fontSize: '14px' }}>{t('noProductsYet')}</p>
          <button className="btn-primary" onClick={handleAddNew} style={{ marginTop: '14px' }}>
            {t('addNewProduct')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredProducts.map(prod => (
            <div key={prod.id} className="card" style={{ padding: '14px', marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <img
                  src={prod.enhancedImageUrl || prod.imageUrl}
                  alt={prod.title}
                  style={{ width: '84px', height: '84px', borderRadius: '10px', objectFit: 'cover' }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-green" style={{ fontSize: '10px' }}>
                        {prod.status}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6e625a' }}>
                        {prod.category}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '15px', color: '#2a201b', marginTop: '4px', fontWeight: 700 }}>
                      {language === 'hi' && prod.titleHi ? prod.titleHi : prod.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#c85a32' }}>
                      ₹{prod.finalPrice}
                    </div>

                    <button
                      className="btn-secondary"
                      id={`btn-prepare-listing-${prod.id}`}
                      onClick={() => handlePrepareListingForProduct(prod.id)}
                      style={{ width: 'auto', padding: '4px 10px', minHeight: '32px', fontSize: '11px', gap: '4px' }}
                    >
                      <Store size={14} color="#c85a32" />
                      <span>{t('sellOnline')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
