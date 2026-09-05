import React from 'react';
import { useApp } from '../context/AppContext';
import { Marketplace, ListingStatus } from '../types';
import { CheckCircle2, Clock, FileEdit, PlusCircle, ArrowLeft, Store } from 'lucide-react';

export const MyListingsScreen: React.FC = () => {
  const { products, listings, setCurrentScreen, setSelectedProductIdForListing, setSelectedMarketplace, t, language } = useApp();

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case 'Prepared':
        return <span className="badge badge-green">✓ {t('prepared')}</span>;
      case 'Draft':
        return <span className="badge badge-amber">✍️ {t('draft')}</span>;
      case 'Pending':
        return <span className="badge badge-blue">⏳ {t('pending')}</span>;
      default:
        return <span className="badge badge-gray">⚪ {t('notPrepared')}</span>;
    }
  };

  const handlePreparePlatform = (productId: string, marketplace: Marketplace) => {
    setSelectedProductIdForListing(productId);
    setSelectedMarketplace(marketplace);
    setCurrentScreen('marketplace_listing');
  };

  return (
    <div className="app-screen-container" style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', color: '#c85a32' }}>{t('myListings')}</h2>
        <p style={{ fontSize: '13px', color: '#6e625a' }}>
          {language === 'en' ? 'Track platform-specific listing readiness status' : 'मार्केटप्लेस लिस्टिंग स्थिति ट्रैक करें'}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <p style={{ color: '#6e625a' }}>{t('noListingsYet')}</p>
          <button className="btn-primary" onClick={() => setCurrentScreen('add_product')} style={{ marginTop: '14px' }}>
            {t('addNewProduct')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {products.map(prod => {
            const amazonListing = listings.find(l => l.productId === prod.id && l.marketplace === 'amazon');
            const meeshoListing = listings.find(l => l.productId === prod.id && l.marketplace === 'meesho');
            const flipkartListing = listings.find(l => l.productId === prod.id && l.marketplace === 'flipkart');

            return (
              <div key={prod.id} className="card" style={{ padding: '16px', marginBottom: 0 }}>
                {/* Product Info Header */}
                <div style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #e8ded5' }}>
                  <img
                    src={prod.enhancedImageUrl || prod.imageUrl}
                    alt={prod.title}
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '15px', color: '#2a201b' }}>{prod.title}</h3>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#c85a32', marginTop: '2px' }}>
                      ₹{prod.finalPrice}
                    </div>
                  </div>
                </div>

                {/* Marketplace Status Rows */}
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Amazon Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📦</span>
                      <strong style={{ color: '#374151' }}>Amazon</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusBadge(amazonListing ? amazonListing.status : 'Not Prepared')}
                      {(!amazonListing || amazonListing.status !== 'Prepared') && (
                        <button
                          onClick={() => handlePreparePlatform(prod.id, 'amazon')}
                          style={{ background: 'none', border: 'none', color: '#c85a32', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                        >
                          {t('prepareListing')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Meesho Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🛍️</span>
                      <strong style={{ color: '#374151' }}>Meesho</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusBadge(meeshoListing ? meeshoListing.status : 'Not Prepared')}
                      {(!meeshoListing || meeshoListing.status !== 'Prepared') && (
                        <button
                          onClick={() => handlePreparePlatform(prod.id, 'meesho')}
                          style={{ background: 'none', border: 'none', color: '#c85a32', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                        >
                          {t('prepareListing')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Flipkart Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🛒</span>
                      <strong style={{ color: '#374151' }}>Flipkart</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusBadge(flipkartListing ? flipkartListing.status : 'Not Prepared')}
                      {(!flipkartListing || flipkartListing.status !== 'Prepared') && (
                        <button
                          onClick={() => handlePreparePlatform(prod.id, 'flipkart')}
                          style={{ background: 'none', border: 'none', color: '#c85a32', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                        >
                          {t('prepareListing')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
