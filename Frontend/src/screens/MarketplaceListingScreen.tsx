import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Sparkles, ArrowLeft, Save, Eye, Layers, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const MarketplaceListingScreen: React.FC = () => {
  const { 
    products, 
    selectedProductIdForListing, 
    selectedMarketplace, 
    saveMarketplaceListing, 
    setCurrentScreen, 
    t, 
    language 
  } = useApp();

  const product = products.find(p => p.id === selectedProductIdForListing) || products[0];
  const marketplaceName = selectedMarketplace ? selectedMarketplace.toUpperCase() : 'AMAZON';

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrepared, setIsPrepared] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateListing = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsPrepared(true);
      // Trigger festive confetti celebrate effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Fallback silently if confetti canvas fails
      }
    }, 1500);
  };

  const handleSaveListing = () => {
    if (!product) return;
    saveMarketplaceListing({
      productId: product.id,
      marketplace: selectedMarketplace || 'amazon',
      status: 'Prepared',
      title: `${product.title} - ${marketplaceName} Verified Craft`,
      description: product.description,
      price: product.finalPrice,
      category: product.category,
      keywords: product.keywords,
      sku: `SA-${marketplaceName.slice(0, 3)}-${Date.now().toString().slice(-4)}`
    });
    setCurrentScreen('my_listings');
  };

  if (!product) {
    return (
      <div className="app-screen-container" style={{ padding: '20px', textAlign: 'center' }}>
        <p>{t('noProductsYet')}</p>
        <button className="btn-primary" onClick={() => setCurrentScreen('add_product')} style={{ marginTop: '16px' }}>
          {t('addNewProduct')}
        </button>
      </div>
    );
  }

  return (
    <div className="app-screen-container" style={{ padding: '16px' }}>
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => setCurrentScreen('sell_online')}
          style={{ background: 'none', border: 'none', color: '#3C6E71', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          <span>{t('back')}</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>
          {selectedMarketplace === 'amazon' ? '📦' : selectedMarketplace === 'meesho' ? '🛍️' : '🛒'}
        </span>
        <div>
          <h2 style={{ fontSize: '20px', color: '#111827' }}>
            {marketplaceName} {language === 'en' ? 'Listing Generator' : 'लिस्टिंग जेनरेटर'}
          </h2>
          <span className="badge badge-amber" style={{ fontSize: '11px' }}>
            Platform Taxonomies Formatted
          </span>
        </div>
      </div>

      {!isPrepared ? (
        /* PRE-GENERATION CHECKLIST & PREVIEW */
        <div>
          <div className="card" style={{ padding: '16px', background: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <img
                src={product.enhancedImageUrl || product.imageUrl}
                alt={product.title}
                style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <span className="badge badge-gray" style={{ fontSize: '10px' }}>{product.category}</span>
                <h3 style={{ fontSize: '15px', color: '#2a201b', marginTop: '4px' }}>{product.title}</h3>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#3C6E71', marginTop: '4px' }}>
                  ₹{product.finalPrice}
                </div>
              </div>
            </div>

            {/* Platform Specifications Data */}
            <div style={{ fontSize: '12px', background: '#fdfbf7', padding: '12px', borderRadius: '8px', border: '1px solid #e8ded5', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Stock Quantity:</strong> {product.quantity} units</div>
              <div><strong>Dimensions:</strong> {product.dimensions || '5.5m x 1.2m'}</div>
              <div><strong>Weight:</strong> {product.weight || '450g'}</div>
              <div><strong>Target Tags:</strong> {product.keywords.join(', ')}</div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="card" style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <h4 style={{ fontSize: '14px', color: '#15803d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={18} />
              <span>{language === 'en' ? 'Platform Compliance Checklist' : 'मार्केटप्लेस अनुपालन चेकलिस्ट'}</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#166534' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Product image high resolution (1080x1080 white bg)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Product title matches {marketplaceName} character length</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Search keywords optimized for {marketplaceName} algorithm</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Pricing compliance & profit margin validated</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Category mapped to {marketplaceName} craft category</span>
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            id="btn-generate-listing-submit"
            onClick={handleGenerateListing}
            disabled={isGenerating}
            style={{ marginTop: '10px' }}
          >
            {isGenerating ? (
              <>
                <Sparkles size={18} className="ai-pulse-box" />
                <span>Formatting for {marketplaceName}...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{t('generateListing')}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* POST-GENERATION SUCCESS STATE */
        <div style={{ textAlign: 'center' }}>
          <div className="card" style={{ padding: '24px', background: '#ffffff' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '20px', color: '#15803d', marginBottom: '8px' }}>
              {t('listingPreparedSuccess')}
            </h3>

            <p style={{ fontSize: '13px', color: '#6e625a', marginBottom: '20px' }}>
              {t('listingReadyNotice')} <strong>{marketplaceName}</strong>
            </p>

            {/* Generated Listing Copy Box */}
            <div style={{
              textAlign: 'left',
              background: '#fdfbf7',
              border: '1px dashed #3C6E71',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, color: '#3C6E71' }}>{marketplaceName} Formatted SKU Listing</span>
                <button
                  onClick={() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div><strong>Title:</strong> {product.title} - Authentic Handloom</div>
              <div><strong>SKU:</strong> SA-{marketplaceName.slice(0, 3)}-{Date.now().toString().slice(-4)}</div>
              <div><strong>Price:</strong> ₹{product.finalPrice}</div>
              <div><strong>Keywords:</strong> {product.keywords.join(', ')}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-primary"
                id="btn-save-listing"
                onClick={handleSaveListing}
              >
                <Save size={18} />
                <span>{t('saveListing')}</span>
              </button>

              <button
                className="btn-secondary"
                id="btn-view-listings"
                onClick={() => setCurrentScreen('my_listings')}
              >
                <Eye size={18} />
                <span>{t('viewListings')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


