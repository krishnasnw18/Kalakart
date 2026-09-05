import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  SAMPLE_HANDICRAFT_IMAGES,
  CATEGORIES
} from '../data/sampleData';

import {
  Camera,
  Upload,
  Mic,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Edit3,
  DollarSign,
  Wand2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AddProductWizard: React.FC = () => {
  const {
    user,
    draftProduct,
    setDraftProduct,
    setCurrentScreen,
    saveCurrentDraftProduct,
    setSelectedProductIdForListing,
    t,
    language
  } = useApp();

  const [currentStep, setCurrentStep] =
    useState(draftProduct.step || 1);

  // Voice
  const [isListening, setIsListening] =
    useState(false);

  const [voiceSuccessAlert, setVoiceSuccessAlert] =
    useState(false);

  // Image processing
  const [aiProcessingState, setAiProcessingState] =
    useState<'idle' | 'processing' | 'done'>('idle');

  const [aiProgressText, setAiProgressText] =
    useState('');

  const [isUploadingImage, setIsUploadingImage] =
    useState(false);

  const [uploadError, setUploadError] =
    useState('');

  const [saveError, setSaveError] =
    useState('');

  const [isSavingProduct, setIsSavingProduct] =
    useState(false);

  // Editing
  const [isEditingCatalog, setIsEditingCatalog] =
    useState(false);

  const [isEditingPrice, setIsEditingPrice] =
    useState(false);

  // ==========================================
  // IMAGE UPLOAD
  // ==========================================

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError('');

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setUploadError(
        language === 'en'
          ? 'Please select an image file.'
          : 'कृपया एक चित्र फ़ाइल चुनें।'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        language === 'en'
          ? 'Image must be smaller than 10 MB.'
          : 'चित्र 10 MB से छोटा होना चाहिए।'
      );
      return;
    }

    // Show local preview immediately
    const localPreviewUrl =
      URL.createObjectURL(file);

    setDraftProduct(prev => ({
      ...prev,
      imageUrl: localPreviewUrl,
      enhancedImageUrl: localPreviewUrl
    }));

    setIsUploadingImage(true);

    try {
      const formData = new FormData();

      formData.append('image', file);

      const response = await fetch(
        'http://localhost:5000/api/upload-image',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Image upload failed.'
        );
      }

      // Replace local preview with Cloudinary URL
      setDraftProduct(prev => ({
        ...prev,
        imageUrl: data.imageUrl,
        enhancedImageUrl: data.imageUrl
      }));
    } catch (error) {
      console.error(
        'Image upload error:',
        error
      );

      setUploadError(
        language === 'en'
          ? 'Image upload failed. Please try again.'
          : 'चित्र अपलोड विफल हुआ। कृपया फिर से प्रयास करें।'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ==========================================
  // SAMPLE IMAGE
  // ==========================================

  const handleSelectPreset = (
    item: typeof SAMPLE_HANDICRAFT_IMAGES[0]
  ) => {
    setUploadError('');

    setDraftProduct(prev => ({
      ...prev,
      imageUrl: item.url,
      enhancedImageUrl:
        item.enhancedUrl || item.url,
      category: item.category,
      rawMaterialCost: item.cost,
      aiTitleEn: item.name,
      aiTitleHi: item.nameHi
    }));
  };

  // ==========================================
  // VOICE INPUT DEMO
  // ==========================================

  const handleVoiceInputSimulate = () => {
    setIsListening(true);
    setVoiceSuccessAlert(false);

    setTimeout(() => {
      setIsListening(false);
      setVoiceSuccessAlert(true);

      const sampleText =
        language === 'en'
          ? 'Handmade pure silk saree woven with traditional Zari pattern borders by heritage master weavers.'
          : 'पारंपरिक जरी पैटर्न बॉर्डर वाली हस्तनिर्मित शुद्ध सिल्क साड़ी।';

      setDraftProduct(prev => ({
        ...prev,
        rawDescription: sampleText,
        voiceInputUsed: true
      }));
    }, 1800);
  };

  // ==========================================
  // AI IMAGE STUDIO DEMO
  // ==========================================

  useEffect(() => {
    if (currentStep !== 3) {
      return;
    }

    setAiProcessingState('processing');
    setAiProgressText(
      t('processingBg')
    );

    const timer1 = setTimeout(() => {
      setAiProgressText(
        t('processingLighting')
      );
    }, 1000);

    const timer2 = setTimeout(() => {
      setAiProgressText(
        t('processingCropping')
      );
    }, 2000);

    const timer3 = setTimeout(() => {
      setAiProcessingState('done');
      setAiProgressText(
        t('processingComplete')
      );
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [currentStep, t]);

  // ==========================================
  // AI CATALOG / PRICE CALCULATION
  // ==========================================

  const generateAiResults = () => {
    const cost =
      draftProduct.rawMaterialCost || 500;

    const minVal =
      Math.round(cost * 1.5);

    const maxVal =
      Math.round(cost * 2.2);

    const suggested =
      Math.round(cost * 1.75) - 1;

    const titleEn =
      draftProduct.aiTitleEn ||
      'Handcrafted Artisan Product';

    const titleHi =
      draftProduct.aiTitleHi ||
      'हस्तनिर्मित कारीगर उत्पाद';

    const descEn =
      draftProduct.rawDescription ||
      draftProduct.aiDescriptionEn ||
      'High-quality authentic Indian handcrafted item made using traditional techniques.';

    const descHi =
      draftProduct.rawDescription &&
      language === 'hi'
        ? draftProduct.rawDescription
        : draftProduct.aiDescriptionHi ||
          'पारंपरिक तकनीकों का उपयोग करके बनाया गया उच्च गुणवत्ता वाला प्रामाणिक भारतीय हस्तनिर्मित उत्पाद।';

    setDraftProduct(prev => ({
      ...prev,

      marketPriceRange: {
        min: minVal,
        max: maxVal
      },

      suggestedPrice: suggested,

      selectedPrice:
        prev.selectedPrice || suggested,

      aiTitleEn: titleEn,

      aiTitleHi: titleHi,

      aiDescriptionEn: descEn,

      aiDescriptionHi: descHi
    }));
  };

  // ==========================================
  // SAVE PRODUCT TO FIREBASE
  // ==========================================

  const saveProductToBackend = async (
    product: ReturnType<
      typeof saveCurrentDraftProduct
    >
  ) => {
    // User-created local blob/data image cannot
    // be used as a permanent product URL.
    const invalidImage =
      product.imageUrl.startsWith('blob:') ||
      product.imageUrl.startsWith('data:');

    if (invalidImage) {
      throw new Error(
        'Image has not finished uploading.'
      );
    }

    const response = await fetch(
      'http://localhost:5000/api/products',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          name: product.title,

          category: product.category,

          descriptionEnglish:
            product.description,

          descriptionHindi:
            product.descriptionHi || '',

          material: '',

          rawMaterialCost:
            product.rawMaterialCost,

          price: product.finalPrice,

          imageUrl:
            product.imageUrl,

          userId:
            user.phone
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          'Product could not be saved.'
      );
    }

    return data;
  };

  // ==========================================
  // NEXT STEP
  // ==========================================

  const handleNextStep = async () => {
    setSaveError('');

    if (
      currentStep === 1 &&
      isUploadingImage
    ) {
      return;
    }

    if (currentStep === 2) {
      generateAiResults();

      setAiProcessingState('idle');
    }

    if (currentStep < 6) {
      const next =
        currentStep + 1;

      setCurrentStep(next);

      setDraftProduct(prev => ({
        ...prev,
        step: next
      }));

      return;
    }

    // ========================================
    // FINAL STEP
    // SAVE TO FIREBASE
    // ========================================

    setIsSavingProduct(true);

    try {
      // Build product locally first
      const newProduct =
        saveCurrentDraftProduct();

      // Send to Firebase through backend
      await saveProductToBackend(
        newProduct
      );

      setSelectedProductIdForListing(
        newProduct.id
      );

      setCurrentScreen(
        'sell_online'
      );
    } catch (error) {
      console.error(
        'Save product error:',
        error
      );

      setSaveError(
        language === 'en'
          ? 'Could not save the product. Please try again.'
          : 'उत्पाद सहेजा नहीं जा सका। कृपया फिर से प्रयास करें।'
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  // ==========================================
  // PREVIOUS STEP
  // ==========================================

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const previous =
        currentStep - 1;

      setCurrentStep(previous);

      setDraftProduct(prev => ({
        ...prev,
        step: previous
      }));
    } else {
      setCurrentScreen('home');
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="app-screen-container"
      style={{
        padding: '16px'
      }}
    >
      {/* ======================================
          PROGRESS
      ====================================== */}

      <div
        style={{
          marginBottom: '16px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}
        >
          <button
            type="button"
            onClick={handlePrevStep}
            style={{
              background: 'none',
              border: 'none',
              color: '#c85a32',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            disabled={isSavingProduct}
          >
            <ArrowLeft size={16} />

            <span>
              {t('back')}
            </span>
          </button>

          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#6e625a'
            }}
          >
            {language === 'en'
              ? `Step ${currentStep} of 6`
              : `चरण ${currentStep} / 6`}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '6px',
            height: '6px'
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(
            step => (
              <div
                key={step}
                style={{
                  flex: 1,
                  borderRadius: '3px',
                  background:
                    step <= currentStep
                      ? 'linear-gradient(90deg, #c85a32, #d97706)'
                      : '#e8ded5',
                  transition:
                    'all 0.3s ease'
                }}
              />
            )
          )}
        </div>
      </div>

      {/* ======================================
          STEP 1
      ====================================== */}

      {currentStep === 1 && (
        <div>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '6px',
              color: '#c85a32'
            }}
          >
            {t('step1Title')}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#6e625a',
              marginBottom: '20px'
            }}
          >
            {language === 'en'
              ? 'Capture or select your handicraft photo'
              : 'अपने हस्तशिल्प का चित्र लें या अपलोड करें'}
          </p>

          {uploadError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '12px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <AlertCircle size={16} />

              <span>
                {uploadError}
              </span>
            </div>
          )}

          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '16px'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '240px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#f5eee6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <img
                src={
                  draftProduct.imageUrl
                }
                alt="Selected Handicraft"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {isUploadingImage && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'rgba(255,255,255,0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <Upload
                    size={28}
                    color="#c85a32"
                  />

                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#c85a32'
                    }}
                  >
                    {language === 'en'
                      ? 'Uploading image...'
                      : 'चित्र अपलोड हो रहा है...'}
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '10px',
                marginTop: '14px'
              }}
            >
              <label
                htmlFor="camera-input"
                className="btn-secondary"
                id="btn-take-photo"
                style={{
                  cursor: 'pointer',
                  margin: 0
                }}
              >
                <Camera
                  size={18}
                  color="#c85a32"
                />

                <span>
                  {t('takePhoto')}
                </span>

                <input
                  type="file"
                  id="camera-input"
                  accept="image/*"
                  capture="environment"
                  onChange={
                    handleFileUpload
                  }
                  style={{
                    display: 'none'
                  }}
                />
              </label>

              <label
                htmlFor="gallery-input"
                className="btn-secondary"
                id="btn-upload-gallery"
                style={{
                  cursor: 'pointer',
                  margin: 0
                }}
              >
                <Upload
                  size={18}
                  color="#c85a32"
                />

                <span>
                  {t('uploadGallery')}
                </span>

                <input
                  type="file"
                  id="gallery-input"
                  accept="image/*"
                  onChange={
                    handleFileUpload
                  }
                  style={{
                    display: 'none'
                  }}
                />
              </label>
            </div>
          </div>

          <h4
            style={{
              fontSize: '14px',
              color: '#4a2e1b',
              marginBottom: '10px'
            }}
          >
            {t('orSelectPreset')}
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            {SAMPLE_HANDICRAFT_IMAGES.map(
              sample => (
                <div
                  key={sample.id}
                  onClick={() =>
                    handleSelectPreset(
                      sample
                    )
                  }
                  style={{
                    border:
                      draftProduct.imageUrl ===
                      sample.url
                        ? '2px solid #c85a32'
                        : '1px solid #e8ded5',
                    borderRadius: '12px',
                    padding: '8px',
                    background: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />

                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#2a201b',
                      overflow: 'hidden',
                      textOverflow:
                        'ellipsis'
                    }}
                  >
                    {language === 'hi'
                      ? sample.nameHi
                      : sample.name}
                  </div>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            className="btn-primary"
            id="btn-step1-continue"
            onClick={
              handleNextStep
            }
            disabled={
              isUploadingImage ||
              isSavingProduct
            }
          >
            <span>
              {t('continue')}
            </span>

            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ======================================
          STEP 2
      ====================================== */}

      {currentStep === 2 && (
        <div>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '6px',
              color: '#c85a32'
            }}
          >
            {t('step2Title')}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#6e625a',
              marginBottom: '20px'
            }}
          >
            {language === 'en'
              ? 'Enter craft costs & description'
              : 'हस्तशिल्प की लागत और विवरण दर्ज करें'}
          </p>

          <div className="card">
            <div className="form-group">
              <label>
                {t('selectCategory')} *
              </label>

              <select
                id="input-category"
                className="form-control"
                value={
                  draftProduct.category
                }
                onChange={e =>
                  setDraftProduct(
                    prev => ({
                      ...prev,
                      category:
                        e.target.value
                    })
                  )
                }
              >
                {CATEGORIES.map(
                  category => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                {t('rawMaterialCost')} *
              </label>

              <input
                type="number"
                id="input-raw-cost"
                className="form-control"
                placeholder="800"
                value={
                  draftProduct.rawMaterialCost ||
                  ''
                }
                onChange={e =>
                  setDraftProduct(
                    prev => ({
                      ...prev,
                      rawMaterialCost:
                        Number(
                          e.target.value
                        )
                    })
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                {t('quantity')}
              </label>

              <input
                type="number"
                id="input-quantity"
                className="form-control"
                placeholder="10"
                value={
                  draftProduct.quantity ||
                  ''
                }
                onChange={e =>
                  setDraftProduct(
                    prev => ({
                      ...prev,
                      quantity:
                        Number(
                          e.target.value
                        )
                    })
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>
                {t('dimensions')}
              </label>

              <input
                type="text"
                id="input-dimensions"
                className="form-control"
                placeholder="e.g. 5.5m x 1.2m, 450g"
                value={
                  draftProduct.dimensions
                }
                onChange={e =>
                  setDraftProduct(
                    prev => ({
                      ...prev,
                      dimensions:
                        e.target.value
                    })
                  )
                }
              />
            </div>

            {/* Voice */}
            <div
              style={{
                marginTop: '18px',
                padding: '14px',
                background: '#fef3c7',
                borderRadius: '12px',
                border:
                  '1px solid #f59e0b'
              }}
            >
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Mic size={16} />

                <span>
                  {t(
                    'voiceDescription'
                  )}
                </span>
              </label>

              <button
                type="button"
                id="btn-voice-input"
                className="btn-secondary"
                onClick={
                  handleVoiceInputSimulate
                }
                style={{
                  marginTop: '8px',
                  background:
                    isListening
                      ? '#fee2e2'
                      : '#ffffff',
                  borderColor:
                    isListening
                      ? '#ef4444'
                      : '#d97706',
                  color:
                    isListening
                      ? '#b91c1c'
                      : '#b45309'
                }}
              >
                {isListening ? (
                  <span>
                    🔴{' '}
                    {language === 'en'
                      ? 'Listening...'
                      : 'सुन रहा है...'}
                  </span>
                ) : (
                  <>
                    <Mic size={18} />

                    <span>
                      {t(
                        'tapToSpeak'
                      )}
                    </span>
                  </>
                )}
              </button>

              {voiceSuccessAlert && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#15803d',
                    marginTop: '6px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2
                    size={14}
                  />

                  <span>
                    {t(
                      'voiceSimulatedAlert'
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Text */}
            <div
              className="form-group"
              style={{
                marginTop: '16px'
              }}
            >
              <label>
                {t('textFallback')}
              </label>

              <textarea
                id="input-raw-description"
                className="form-control"
                rows={3}
                placeholder={
                  language === 'en'
                    ? 'Describe the material, color, design, and special craft details...'
                    : 'सामग्री, रंग, डिज़ाइन और शिल्प विवरण लिखें...'
                }
                value={
                  draftProduct.rawDescription
                }
                onChange={e =>
                  setDraftProduct(
                    prev => ({
                      ...prev,
                      rawDescription:
                        e.target.value
                    })
                  )
                }
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            id="btn-step2-continue"
            onClick={
              handleNextStep
            }
          >
            <span>
              {t('continue')}
            </span>

            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ======================================
          STEP 3
      ====================================== */}

      {currentStep === 3 && (
        <div>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '6px',
              color: '#c85a32'
            }}
          >
            {t('step3Title')}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#6e625a',
              marginBottom: '20px'
            }}
          >
            {language === 'en'
              ? 'AI photo enhancement preview'
              : 'AI फोटो सुधार पूर्वावलोकन'}
          </p>

          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '20px'
            }}
          >
            <div
              style={{
                background:
                  aiProcessingState ===
                  'done'
                    ? '#dcfce7'
                    : '#fef3c7',
                color:
                  aiProcessingState ===
                  'done'
                    ? '#15803d'
                    : '#b45309',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              {aiProcessingState ===
                'processing' && (
                <Wand2
                  size={16}
                  className="ai-pulse-box"
                />
              )}

              {aiProcessingState ===
                'done' && (
                <CheckCircle2
                  size={16}
                />
              )}

              <span>
                {aiProgressText}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '12px'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6e625a',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  {t(
                    'originalImage'
                  )}
                </span>

                <img
                  src={
                    draftProduct.imageUrl
                  }
                  alt="Original"
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border:
                      '1px solid #e8ded5'
                  }}
                />
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#c85a32',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  ✨{' '}
                  {t(
                    'aiEnhancedImage'
                  )}
                </span>

                <div
                  style={{
                    position:
                      'relative',
                    width: '100%',
                    height: '140px'
                  }}
                >
                  <img
                    src={
                      draftProduct.enhancedImageUrl ||
                      draftProduct.imageUrl
                    }
                    alt="AI Enhanced"
                    className={
                      aiProcessingState ===
                      'processing'
                        ? 'shimmer-effect'
                        : ''
                    }
                    style={{
                      width: '100%',
                      height: '140px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border:
                        '2px solid #c85a32',
                      boxShadow:
                        '0 4px 12px rgba(200, 90, 50, 0.2)'
                    }}
                  />

                  {aiProcessingState ===
                    'processing' && (
                    <div
                      style={{
                        position:
                          'absolute',
                        inset: 0,
                        background:
                          'rgba(255,255,255,0.4)',
                        display: 'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        borderRadius:
                          '10px'
                      }}
                    >
                      <Sparkles
                        size={24}
                        color="#d97706"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <button
              type="button"
              className="btn-primary"
              id="btn-use-enhanced-image"
              onClick={
                handleNextStep
              }
              disabled={
                aiProcessingState ===
                'processing'
              }
            >
              <Sparkles size={18} />

              <span>
                {t(
                  'useThisImage'
                )}
              </span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              id="btn-try-again-image"
              onClick={() =>
                setAiProcessingState(
                  'idle'
                )
              }
            >
              <span>
                {t('tryAgain')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================
          STEP 4
      ====================================== */}

      {currentStep === 4 && (
        <div>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '6px',
              color: '#c85a32'
            }}
          >
            {t('step4Title')}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#6e625a',
              marginBottom: '20px'
            }}
          >
            {t(
              'aiCatalogSubtitle'
            )}
          </p>

          <div className="card">
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom:
                  '14px'
              }}
            >
              <span className="badge badge-amber">
                ✨ AI Generated Listing
              </span>

              <button
                type="button"
                onClick={() =>
                  setIsEditingCatalog(
                    prev => !prev
                  )
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c85a32',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit3 size={14} />

                <span>
                  {isEditingCatalog
                    ? 'Done'
                    : 'Edit'}
                </span>
              </button>
            </div>

            <div className="form-group">
              <label>
                {t('productTitle')}
              </label>

              {isEditingCatalog ? (
                <input
                  type="text"
                  className="form-control"
                  value={
                    draftProduct.aiTitleEn
                  }
                  onChange={e =>
                    setDraftProduct(
                      prev => ({
                        ...prev,
                        aiTitleEn:
                          e.target.value
                      })
                    )
                  }
                />
              ) : (
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#2a201b'
                  }}
                >
                  {
                    draftProduct.aiTitleEn
                  }
                </div>
              )}
            </div>

            <div
              className="form-group"
              style={{
                marginTop: '12px'
              }}
            >
              <label>
                {t('descEn')}
              </label>

              {isEditingCatalog ? (
                <textarea
                  className="form-control"
                  rows={3}
                  value={
                    draftProduct.aiDescriptionEn
                  }
                  onChange={e =>
                    setDraftProduct(
                      prev => ({
                        ...prev,
                        aiDescriptionEn:
                          e.target.value
                      })
                    )
                  }
                />
              ) : (
                <p
                  style={{
                    fontSize: '13px',
                    color: '#4a2e1b',
                    background:
                      '#fdfbf7',
                    padding: '10px',
                    borderRadius: '8px'
                  }}
                >
                  {
                    draftProduct.aiDescriptionEn
                  }
                </p>
              )}
            </div>

            <div
              className="form-group"
              style={{
                marginTop: '12px'
              }}
            >
              <label>
                {t('descHi')}
              </label>

              {isEditingCatalog ? (
                <textarea
                  className="form-control lang-hi"
                  rows={3}
                  value={
                    draftProduct.aiDescriptionHi
                  }
                  onChange={e =>
                    setDraftProduct(
                      prev => ({
                        ...prev,
                        aiDescriptionHi:
                          e.target.value
                      })
                    )
                  }
                />
              ) : (
                <p
                  className="lang-hi"
                  style={{
                    fontSize: '13px',
                    color: '#4a2e1b',
                    background:
                      '#fdfbf7',
                    padding: '10px',
                    borderRadius: '8px'
                  }}
                >
                  {
                    draftProduct.aiDescriptionHi
                  }
                </p>
              )}
            </div>

            <div
              className="form-group"
              style={{
                marginTop: '12px'
              }}
            >
              <label>
                {t('keywordsTags')}
              </label>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '6px'
                }}
              >
                {draftProduct.keywords.map(
                  (keyword, index) => (
                    <span
                      key={index}
                      style={{
                        background:
                          '#f3e8ff',
                        color:
                          '#6b21a8',
                        padding:
                          '4px 10px',
                        borderRadius:
                          '12px',
                        fontSize:
                          '12px',
                        fontWeight: 600
                      }}
                    >
                      #{keyword}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            id="btn-step4-continue"
            onClick={
              handleNextStep
            }
          >
            <span>
              {t('continue')}
            </span>

            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ======================================
          STEP 5
      ====================================== */}

      {currentStep === 5 && (
        <div>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '6px',
              color: '#c85a32'
            }}
          >
            {t('step5Title')}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#6e625a',
              marginBottom: '20px'
            }}
          >
            {language === 'en'
              ? 'Smart pricing calculator based on cost & demand'
              : 'लागत और बाजार मांग के आधार पर AI मूल्य निर्धारण'}
          </p>

          <div
            className="card"
            style={{
              padding: '20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                paddingBottom:
                  '12px',
                borderBottom:
                  '1px solid #e8ded5'
              }}
            >
              <span
                style={{
                  color: '#6e625a',
                  fontSize: '14px'
                }}
              >
                {t(
                  'rawMaterialCost'
                )}
              </span>

              <span
                style={{
                  fontWeight: 700,
                  fontSize: '16px'
                }}
              >
                ₹
                {
                  draftProduct.rawMaterialCost
                }
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                padding: '12px 0',
                borderBottom:
                  '1px solid #e8ded5'
              }}
            >
              <span
                style={{
                  color: '#6e625a',
                  fontSize: '14px'
                }}
              >
                {t(
                  'estimatedMarketRange'
                )}
              </span>

              <span
                style={{
                  fontWeight: 600,
                  fontSize: '15px',
                  color: '#2563eb'
                }}
              >
                ₹
                {
                  draftProduct
                    .marketPriceRange
                    .min
                }{' '}
                - ₹
                {
                  draftProduct
                    .marketPriceRange
                    .max
                }
              </span>
            </div>

            <div
              style={{
                background:
                  'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'center',
                margin: '16px 0',
                border:
                  '2px solid #f59e0b'
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#b45309',
                  textTransform:
                    'uppercase',
                  letterSpacing: '1px'
                }}
              >
                ✨{' '}
                {t(
                  'aiSuggestedPrice'
                )}
              </span>

              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#c85a32',
                  margin: '4px 0'
                }}
              >
                ₹
                {
                  draftProduct.suggestedPrice
                }
              </div>

              <p
                style={{
                  fontSize: '12px',
                  color: '#6e625a',
                  marginTop: '6px'
                }}
              >
                {t(
                  'pricingExplanation',
                  {
                    cost: draftProduct
                      .rawMaterialCost
                  }
                )}
              </p>
            </div>

            {isEditingPrice && (
              <div
                className="form-group"
                style={{
                  marginTop: '12px'
                }}
              >
                <label>
                  {t('editPrice')}
                </label>

                <input
                  type="number"
                  className="form-control"
                  value={
                    draftProduct.selectedPrice
                  }
                  onChange={e =>
                    setDraftProduct(
                      prev => ({
                        ...prev,
                        selectedPrice:
                          Number(
                            e.target.value
                          )
                      })
                    )
                  }
                />
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <button
              type="button"
              className="btn-primary"
              id="btn-use-suggested-price"
              onClick={() => {
                setDraftProduct(
                  prev => ({
                    ...prev,
                    selectedPrice:
                      prev.suggestedPrice
                  })
                );

                void handleNextStep();
              }}
            >
              <Check size={18} />

              <span>
                {t(
                  'useSuggestedPrice',
                  {
                    price: draftProduct
                      .suggestedPrice
                  }
                )}
              </span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              id="btn-edit-price-toggle"
              onClick={() =>
                setIsEditingPrice(
                  prev => !prev
                )
              }
            >
              <DollarSign
                size={18}
              />

              <span>
                {isEditingPrice
                  ? 'Keep Selected Price'
                  : t(
                      'editPrice'
                    )}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================
          STEP 6
      ====================================== */}

      {currentStep === 6 && (
        <div>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '6px',
              color: '#c85a32'
            }}
          >
            {t('step6Title')}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#6e625a',
              marginBottom: '20px'
            }}
          >
            {language === 'en'
              ? 'Review your AI-enhanced product listing preview'
              : 'अपनी AI एनहैन्स्ड लिस्टिंग का पूर्वावलोकन करें'}
          </p>

          {saveError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle
                size={18}
              />

              <span>
                {saveError}
              </span>
            </div>
          )}

          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden'
            }}
          >
            <img
              src={
                draftProduct.enhancedImageUrl ||
                draftProduct.imageUrl
              }
              alt="Preview"
              style={{
                width: '100%',
                height: '220px',
                objectFit: 'cover'
              }}
            />

            <div
              style={{
                padding: '16px'
              }}
            >
              <span className="badge badge-amber">
                {draftProduct.category}
              </span>

              <h3
                style={{
                  fontSize: '18px',
                  marginTop: '8px',
                  color: '#2a201b'
                }}
              >
                {
                  draftProduct.aiTitleEn
                }
              </h3>

              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'baseline',
                  gap: '8px',
                  margin: '10px 0'
                }}
              >
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#c85a32'
                  }}
                >
                  ₹
                  {
                    draftProduct.selectedPrice
                  }
                </span>

                <span
                  style={{
                    fontSize: '12px',
                    color: '#6e625a'
                  }}
                >
                  (Stock:{' '}
                  {
                    draftProduct.quantity
                  }{' '}
                  units)
                </span>
              </div>

              <p
                style={{
                  fontSize: '13px',
                  color: '#4a2e1b',
                  lineHeight: 1.4,
                  marginBottom: '12px'
                }}
              >
                {
                  draftProduct.aiDescriptionEn
                }
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}
              >
                {draftProduct.keywords.map(
                  (keyword, index) => (
                    <span
                      key={index}
                      style={{
                        background:
                          '#f3f4f6',
                        color:
                          '#4b5563',
                        padding:
                          '3px 8px',
                        borderRadius:
                          '10px',
                        fontSize:
                          '11px'
                      }}
                    >
                      #{keyword}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            id="btn-continue-to-sell"
            onClick={() =>
              void handleNextStep()
            }
            disabled={
              isSavingProduct
            }
            style={{
              marginTop: '14px'
            }}
          >
            <Sparkles
              size={18}
            />

            <span>
              {isSavingProduct
                ? language === 'en'
                  ? 'Saving product...'
                  : 'उत्पाद सहेजा जा रहा है...'
                : t(
                    'continueToSell'
                  )}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};