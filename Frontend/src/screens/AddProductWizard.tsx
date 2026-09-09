import React, { useEffect, useRef, useState } from 'react';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/sampleData';

const API_BASE_URL = Capacitor.isNativePlatform()
  ? 'http://10.0.2.2:5000'
  : 'http://localhost:5000';

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

  const [currentStep, setCurrentStep] = useState(
    draftProduct.step || 1
  );

  const [isListening, setIsListening] =
    useState(false);

  const [voiceSuccessAlert, setVoiceSuccessAlert] =
    useState(false);

  const [voiceError, setVoiceError] =
    useState('');

  const [isVoiceProcessing, setIsVoiceProcessing] =
    useState(false);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const [isUploadingImage, setIsUploadingImage] =
    useState(false);

  const [uploadError, setUploadError] =
    useState('');

  const [saveError, setSaveError] =
    useState('');

  const [isSavingProduct, setIsSavingProduct] =
    useState(false);

  const [isGeneratingCatalog, setIsGeneratingCatalog] =
    useState(false);

  const [aiCatalogError, setAiCatalogError] =
    useState('');

  const [isEditingCatalog, setIsEditingCatalog] =
    useState(false);

  const [isEditingPrice, setIsEditingPrice] =
    useState(false);

  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError('');

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

    const previewUrl = URL.createObjectURL(file);

    setDraftProduct(prev => ({
      ...prev,
      imageUrl: previewUrl,
      enhancedImageUrl: previewUrl
    }));

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        `${API_BASE_URL}/api/upload-image`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Image upload failed.'
        );
      }

      setDraftProduct(prev => ({
        ...prev,
        imageUrl: data.imageUrl,
        enhancedImageUrl: data.imageUrl
      }));

      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Image upload error:', error);

      setUploadError(
        language === 'en'
          ? 'Image upload failed. Please try again.'
          : 'चित्र अपलोड विफल हुआ। कृपया फिर से प्रयास करें।'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  // =========================================================
  // VOICE INPUT
  // Android uses native SpeechRecognition. Browser uses MediaRecorder.
  // =========================================================

  const speechListenerRef =
    useRef<{ remove: () => Promise<void> } | null>(null);

  const nativeTranscriptRef = useRef('');

  const handleNativeAndroidVoice = async () => {
    const recognitionLanguage =
      language === 'hi' ? 'hi-IN' : 'en-IN';

    try {
      const permissionStatus =
        await SpeechRecognition.requestPermissions();

      if (permissionStatus.speechRecognition !== 'granted') {
        throw new Error('Microphone permission was not granted.');
      }

      const { available } = await SpeechRecognition.available();

      if (!available) {
        throw new Error('Speech recognition is not available on this device.');
      }

      if (speechListenerRef.current) {
        await speechListenerRef.current.remove();
        speechListenerRef.current = null;
      }

      nativeTranscriptRef.current = '';
      setIsListening(true);

      speechListenerRef.current =
        await SpeechRecognition.addListener('partialResults', event => {
          const accumulated =
            event.accumulatedText?.trim() ||
            event.accumulated?.trim() ||
            event.matches?.[0]?.trim() ||
            '';

          if (accumulated) {
            nativeTranscriptRef.current = accumulated;
          }
        });

      await SpeechRecognition.start({
        language: recognitionLanguage,
        maxResults: 3,
        partialResults: true,
        popup: false,
        useOnDeviceRecognition: false
      });
    } catch (error) {
      console.error('Native speech start error:', error);
      setIsListening(false);

      if (speechListenerRef.current) {
        await speechListenerRef.current.remove();
        speechListenerRef.current = null;
      }

      setVoiceError(
        language === 'en'
          ? error instanceof Error ? error.message : 'Could not start voice recognition. Please try again.'
          : 'वॉइस पहचान शुरू नहीं हो सकी। कृपया फिर से प्रयास करें।'
      );
    }
  };

  const stopNativeAndroidVoice = async () => {
    try {
      setIsVoiceProcessing(true);
      await SpeechRecognition.stop();
      await new Promise(resolve => setTimeout(resolve, 250));

      let transcript = nativeTranscriptRef.current.trim();

      try {
        const last = await SpeechRecognition.getLastPartialResult();
        transcript =
          last.text?.trim() ||
          last.matches?.[0]?.trim() ||
          transcript;
      } catch {
        // Keep accumulated transcript when final partial result is unavailable.
      }

      if (speechListenerRef.current) {
        await speechListenerRef.current.remove();
        speechListenerRef.current = null;
      }

      nativeTranscriptRef.current = '';
      setIsListening(false);

      if (!transcript) {
        throw new Error('No useful speech was detected.');
      }

      setDraftProduct(prev => ({
        ...prev,
        rawDescription: transcript,
        voiceInputUsed: true
      }));

      setVoiceSuccessAlert(true);
    } catch (error) {
      console.error('Native speech stop error:', error);
      setIsListening(false);
      nativeTranscriptRef.current = '';

      if (speechListenerRef.current) {
        await speechListenerRef.current.remove();
        speechListenerRef.current = null;
      }

      setVoiceError(
        language === 'en'
          ? error instanceof Error ? error.message : 'Could not process your voice. Please try again.'
          : 'आपकी आवाज़ संसाधित नहीं हो सकी। कृपया फिर से प्रयास करें।'
      );
    } finally {
      setIsVoiceProcessing(false);
    }
  };

  const handleBrowserVoiceInput = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError(
        language === 'en'
          ? 'Microphone recording is not supported on this device.'
          : 'इस डिवाइस पर माइक्रोफ़ोन रिकॉर्डिंग समर्थित नहीं है।'
      );
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setVoiceError(
        language === 'en'
          ? 'Audio recording is not supported on this device.'
          : 'इस डिवाइस पर ऑडियो रिकॉर्डिंग समर्थित नहीं है।'
      );
      return;
    }

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const supportedMimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/m4a'
      ];

      const mimeType =
        supportedMimeTypes.find(type =>
          MediaRecorder.isTypeSupported(type)
        ) || '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;
      setIsListening(true);

      recorder.ondataavailable = event => {
        if (event.data?.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsListening(false);
        mediaRecorderRef.current = null;
        stream?.getTracks().forEach(track => track.stop());

        const actualMimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        audioChunksRef.current = [];

        if (audioBlob.size === 0) {
          setVoiceError(
            language === 'en'
              ? 'No voice was recorded. Please try again.'
              : 'कोई आवाज़ रिकॉर्ड नहीं हुई। कृपया फिर से प्रयास करें।'
          );
          return;
        }

        setIsVoiceProcessing(true);

        try {
          const extension =
            actualMimeType.includes('mp4') || actualMimeType.includes('m4a')
              ? 'm4a'
              : 'webm';

          const formData = new FormData();
          formData.append('audio', audioBlob, `Kalakart-voice.${extension}`);
          formData.append('language', language);
          formData.append('category', draftProduct.category || '');

          const voiceResponse = await fetch(
            `${API_BASE_URL}/api/voice-description`,
            { method: 'POST', body: formData }
          );

          const voiceData = await voiceResponse.json();

          if (!voiceResponse.ok || !voiceData?.success || !voiceData?.data) {
            throw new Error(voiceData?.message || 'Voice processing failed.');
          }

          const result = voiceData.data;
          const transcript =
            result.transcript ||
            result.translatedEnglish ||
            result.productDescriptionEnglish ||
            '';

          if (!transcript.trim()) {
            throw new Error('No useful speech was detected.');
          }

          setDraftProduct(prev => ({
            ...prev,
            rawDescription: transcript,
            voiceInputUsed: true,
            aiTitleEn: result.title || prev.aiTitleEn,
            aiDescriptionEn: result.productDescriptionEnglish || prev.aiDescriptionEn,
            aiDescriptionHi: result.productDescriptionHindi || prev.aiDescriptionHi,
            material: result.material || prev.material || '',
            color: result.color || prev.color || '',
            design: result.design || prev.design || '',
            technique: result.technique || prev.technique || '',
            features: Array.isArray(result.features) ? result.features : prev.features || [],
            keywords: Array.isArray(result.keywords) ? result.keywords : prev.keywords || []
          }));

          setVoiceSuccessAlert(true);
        } catch (error) {
          console.error('Voice AI error:', error);
          setVoiceError(
            language === 'en'
              ? error instanceof Error ? error.message : 'Could not process your voice. Please try again.'
              : 'आपकी आवाज़ संसाधित नहीं हो सकी। कृपया फिर से प्रयास करें।'
          );
        } finally {
          setIsVoiceProcessing(false);
        }
      };

      recorder.start();
    } catch (error: any) {
      console.error('Microphone access error:', error);
      stream?.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsListening(false);

      const name = error?.name || '';
      const message =
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'Microphone access was blocked. Allow microphone access and try again.'
          : name === 'NotFoundError'
            ? 'No microphone was found on this device.'
            : name === 'NotReadableError' || name === 'AbortError'
              ? 'The microphone is busy or unavailable. Close other apps using the microphone and try again.'
              : error?.message || 'Could not access the microphone. Please try again.';

      setVoiceError(
        language === 'en'
          ? message
          : 'माइक्रोफ़ोन एक्सेस नहीं हो सका। कृपया फिर से प्रयास करें।'
      );
    }
  };

  const handleVoiceInput = async () => {
    setVoiceSuccessAlert(false);
    setVoiceError('');

    const isAndroidApp = Capacitor.getPlatform() === 'android';

    if (isAndroidApp) {
      if (isListening) {
        await stopNativeAndroidVoice();
      } else {
        await handleNativeAndroidVoice();
      }
      return;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      return;
    }

    await handleBrowserVoiceInput();
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach(track => track.stop());
      }
    };
  }, []);

  // =========================================================
  // IMAGE PREVIEW
  // =========================================================
  // Image enhancement has been removed from the workflow.
  // The uploaded Cloudinary image is used directly.


  // =========================================================
  // GEMINI PRODUCT RESULT GENERATION
  // =========================================================

  const generateAiResults = async () => {
    const rawDescription =
      draftProduct.rawDescription.trim();

    if (!rawDescription) {
      setAiCatalogError(
        language === 'en'
          ? 'Please describe your product first or use the voice button.'
          : 'कृपया पहले अपने उत्पाद का विवरण दें या वॉइस बटन का उपयोग करें।'
      );
      return false;
    }

    setAiCatalogError('');
    setIsGeneratingCatalog(true);

    try {
      const productInput = [
        `Category selected by artisan: ${draftProduct.category}`,
        `Raw material cost: ₹${draftProduct.rawMaterialCost || 0}`,
        `Quantity: ${draftProduct.quantity || 1}`,
        draftProduct.dimensions
          ? `Dimensions: ${draftProduct.dimensions}`
          : '',
        `Artisan description: ${rawDescription}`
      ]
        .filter(Boolean)
        .join('\n');

      let status = 0;
      let data: any = null;

      if (Capacitor.isNativePlatform()) {
        // Android: use Capacitor's native HTTP client so the request does
        // not depend on WebView fetch/CORS behavior.
        const response = await CapacitorHttp.post({
          url: `${API_BASE_URL}/api/generate-product`,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          data: {
            productInput
          }
        });

        status = response.status;
        data = response.data;
      } else {
        // Browser: keep the normal fetch path.
        const response = await fetch(
          `${API_BASE_URL}/api/generate-product`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify({
              productInput
            })
          }
        );

        status = response.status;

        const responseText = await response.text();

        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText);
          } catch {
            throw new Error(
              `Backend returned an invalid response (HTTP ${response.status}).`
            );
          }
        }
      }

      if (status < 200 || status >= 300) {
        const backendMessage =
          data?.message ||
          data?.error ||
          data?.details ||
          `HTTP ${status}`;

        if (status === 429) {
          throw new Error(
            `Gemini rate limit or quota reached. ${backendMessage}`
          );
        }

        if (status === 401 || status === 403) {
          throw new Error(
            `Gemini API authorization failed. ${backendMessage}`
          );
        }

        if (status === 404) {
          throw new Error(
            'The /api/generate-product endpoint was not found. Make sure the backend is running with the current routes.'
          );
        }

        if (status >= 500) {
          throw new Error(
            `Backend AI service failed (HTTP ${status}). ${backendMessage}`
          );
        }

        throw new Error(
          `Product AI request failed. ${backendMessage}`
        );
      }

      if (!data?.success || !data?.data) {
        throw new Error(
          data?.message ||
            data?.error ||
            'The backend did not return valid product information.'
        );
      }

      const aiProduct = data.data;

      // Keep the existing local pricing formula for now.
      const cost = draftProduct.rawMaterialCost || 500;
      const minPrice = Math.round(cost * 1.5);
      const maxPrice = Math.round(cost * 2.2);
      const suggestedPrice = Math.round(cost * 1.75) - 1;

      setDraftProduct(prev => ({
        ...prev,
        aiTitleEn: aiProduct.title || prev.aiTitleEn,
        aiDescriptionEn:
          aiProduct.descriptionEnglish ||
          aiProduct.description ||
          prev.aiDescriptionEn,
        aiDescriptionHi:
          aiProduct.descriptionHindi ||
          prev.aiDescriptionHi,
        material: aiProduct.material || prev.material || '',
        color: aiProduct.color || prev.color || '',
        design: aiProduct.design || prev.design || '',
        technique: aiProduct.technique || prev.technique || '',
        features: Array.isArray(aiProduct.features)
          ? aiProduct.features
          : prev.features || [],
        keywords: Array.isArray(aiProduct.keywords)
          ? aiProduct.keywords
          : prev.keywords || [],
        marketPriceRange: {
          min: minPrice,
          max: maxPrice
        },
        suggestedPrice,
        selectedPrice:
          prev.selectedPrice > 0
            ? prev.selectedPrice
            : suggestedPrice
      }));

      return true;
    } catch (error) {
      console.error('Gemini product generation error:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error while contacting the product AI service.';

      setAiCatalogError(
        language === 'en'
          ? errorMessage
          : `AI उत्पाद विवरण तैयार नहीं कर सका। ${errorMessage}`
      );

      return false;
    } finally {
      setIsGeneratingCatalog(false);
    }
  };

  // =========================================================
  // SAVE PRODUCT TO BACKEND
  // =========================================================

  const saveProductToBackend = async () => {
    const imageUrl =
      draftProduct.enhancedImageUrl ||
      draftProduct.imageUrl;

    if (
      imageUrl.startsWith('blob:') ||
      imageUrl.startsWith('data:')
    ) {
      throw new Error(
        'Please wait for the image upload to finish.'
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/products`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name:
            draftProduct.aiTitleEn ||
            'Handcrafted Artisan Product',

          category:
            draftProduct.category,

          descriptionEnglish:
            draftProduct.aiDescriptionEn || '',

          descriptionHindi:
            draftProduct.aiDescriptionHi || '',

          material: draftProduct.material || '',

          color: draftProduct.color || '',
          design: draftProduct.design || '',
          technique: draftProduct.technique || '',
          features: Array.isArray(draftProduct.features)
            ? draftProduct.features
            : [],
          keywords: Array.isArray(draftProduct.keywords)
            ? draftProduct.keywords
            : [],

          rawMaterialCost:
            draftProduct.rawMaterialCost,

          price:
            draftProduct.selectedPrice ||
            draftProduct.suggestedPrice,

          imageUrl,

          userId: user.phone
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

  // =========================================================
  // NEXT
  // =========================================================

  const handleNextStep = async () => {
    setSaveError('');

    if (
      currentStep === 1 &&
      isUploadingImage
    ) {
      return;
    }

    if (currentStep === 2) {
      const generated = await generateAiResults();

      if (!generated) {
        return;
      }
    }

    if (currentStep < 6) {
      const nextStep = currentStep + 1;

      setCurrentStep(nextStep);

      setDraftProduct(prev => ({
        ...prev,
        step: nextStep
      }));

      return;
    }

    setIsSavingProduct(true);

    try {
      const product =
        saveCurrentDraftProduct();

      await saveProductToBackend();

      setSelectedProductIdForListing(
        product.id
      );

      setCurrentScreen('sell_online');
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

  // =========================================================
  // BACK
  // =========================================================

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      const previousStep =
        currentStep - 1;

      setCurrentStep(previousStep);

      setDraftProduct(prev => ({
        ...prev,
        step: previousStep
      }));
    } else {
      setCurrentScreen('home');
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
  className="app-screen-container"
  style={{
    padding: '16px',
    paddingBottom: '120px'
  }}
>
      {/* =====================================================
          HEADER
      ===================================================== */}

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
            onClick={handlePreviousStep}
            disabled={isSavingProduct}
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
          >
            <ArrowLeft size={16} />
            <span>{t('back')}</span>
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
          {[1, 2, 3, 4, 5, 6].map(step => (
            <div
              key={step}
              style={{
                flex: 1,
                borderRadius: '4px',
                background:
                  step <= currentStep
                    ? 'linear-gradient(90deg, #c85a32, #d97706)'
                    : '#e8ded5'
              }}
            />
          ))}
        </div>
      </div>

      {/* =====================================================
          STEP 1
      ===================================================== */}

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
              ? 'Add a clear photo of your handicraft'
              : 'अपने हस्तशिल्प की एक स्पष्ट तस्वीर जोड़ें'}
          </p>

          {uploadError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px'
              }}
            >
              <AlertCircle size={16} />
              <span>{uploadError}</span>
            </div>
          )}

          <div
            className="card"
            style={{
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '240px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#f5eee6',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={draftProduct.imageUrl}
                alt="Product"
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
                      'rgba(255,255,255,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                style={{
                  cursor: 'pointer',
                  margin: 0
                }}
              >
                <Camera
                  size={18}
                  color="#c85a32"
                />
                <span>{t('takePhoto')}</span>

                <input
                  id="camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  style={{
                    display: 'none'
                  }}
                />
              </label>

              <label
                htmlFor="gallery-input"
                className="btn-secondary"
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
                  id="gallery-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{
                    display: 'none'
                  }}
                />
              </label>
            </div>
          </div>

          <div
            className="card"
            style={{
              marginTop: '14px',
              padding: '14px',
              background: '#fffaf0',
              border:
                '1px solid #f3d7a1'
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: '#b45309',
                fontSize: '13px',
                marginBottom: '8px'
              }}
            >
              {language === 'en'
                ? 'Photo tips'
                : 'फोटो टिप्स'}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                color: '#6e625a',
                fontSize: '12px'
              }}
            >
              <span>
                ✓{' '}
                {language === 'en'
                  ? 'Use good lighting'
                  : 'अच्छी रोशनी का उपयोग करें'}
              </span>

              <span>
                ✓{' '}
                {language === 'en'
                  ? 'Show the full product clearly'
                  : 'पूरा उत्पाद स्पष्ट रूप से दिखाएं'}
              </span>

              <span>
                ✓{' '}
                {language === 'en'
                  ? 'Keep the product in focus'
                  : 'उत्पाद को फोकस में रखें'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              void handleNextStep()
            }
            disabled={isUploadingImage}
            style={{
              marginTop: '16px'
            }}
          >
            <span>{t('continue')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* =====================================================
          STEP 2
      ===================================================== */}

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
            {/* CATEGORY */}

            <div className="form-group">
              <label>
                {t('selectCategory')} *
              </label>

              <select
                id="input-category"
                className="form-control"
                value={draftProduct.category}
                onChange={event => {
                  setDraftProduct(prev => ({
                    ...prev,
                    category:
                      event.target.value
                  }));
                }}
              >
                {CATEGORIES.map(category => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* COST */}

            <div className="form-group">
              <label>
                {t('rawMaterialCost')} *
              </label>

              <input
                id="input-raw-cost"
                type="number"
                className="form-control"
                value={
                  draftProduct.rawMaterialCost || ''
                }
                onChange={event => {
                  setDraftProduct(prev => ({
                    ...prev,
                    rawMaterialCost:
                      Number(
                        event.target.value
                      )
                  }));
                }}
                required
              />
            </div>

            {/* QUANTITY */}

            <div className="form-group">
              <label>
                {t('quantity')}
              </label>

              <input
                id="input-quantity"
                type="number"
                className="form-control"
                value={
                  draftProduct.quantity || ''
                }
                onChange={event => {
                  setDraftProduct(prev => ({
                    ...prev,
                    quantity:
                      Number(
                        event.target.value
                      )
                  }));
                }}
              />
            </div>

            {/* DIMENSIONS */}

            <div className="form-group">
              <label>
                {t('dimensions')}
              </label>

              <input
                id="input-dimensions"
                type="text"
                className="form-control"
                placeholder="e.g. 5.5m x 1.2m"
                value={draftProduct.dimensions}
                onChange={event => {
                  setDraftProduct(prev => ({
                    ...prev,
                    dimensions:
                      event.target.value
                  }));
                }}
              />
            </div>

            {/* VOICE */}

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
                  {t('voiceDescription')}
                </span>
              </label>

              <button
                type="button"
                id="btn-voice-input"
                className="btn-secondary"
                onClick={() => {
                  void handleVoiceInput();
                }}
                disabled={isVoiceProcessing}
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
                {isVoiceProcessing ? (
                  <span>
                    ⏳{' '}
                    {language === 'en'
                      ? 'Processing voice...'
                      : 'आवाज़ संसाधित हो रही है...'}
                  </span>
                ) : isListening ? (
                  <span>
                    🔴{' '}
                    {language === 'en'
                      ? 'Recording... Tap to stop'
                      : 'रिकॉर्डिंग... रोकने के लिए टैप करें'}
                  </span>
                ) : (
                  <>
                    <Mic size={18} />
                    <span>
                      {t('tapToSpeak')}
                    </span>
                  </>
                )}
              </button>

              {voiceError && (
                <div
                  style={{
                    marginTop: '7px',
                    color: '#b91c1c',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{voiceError}</span>
                </div>
              )}

              {voiceSuccessAlert && (
                <div
                  style={{
                    marginTop: '7px',
                    color: '#15803d',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <CheckCircle2
                    size={14}
                  />

                  <span>
                    {language === 'en'
                      ? 'Voice captured and AI product details generated.'
                      : 'आवाज़ कैप्चर हुई और AI उत्पाद विवरण तैयार हो गया।'}
                  </span>
                </div>
              )}
            </div>

            {/* TEXT DESCRIPTION */}

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
                rows={4}
                value={
                  draftProduct.rawDescription
                }
                placeholder={
                  language === 'en'
                    ? 'Describe the material, colour, design and craft details...'
                    : 'सामग्री, रंग, डिज़ाइन और शिल्प विवरण लिखें...'
                }
                onChange={event => {
                  setDraftProduct(prev => ({
                    ...prev,
                    rawDescription:
                      event.target.value
                  }));
                }}
              />
            </div>
          </div>

          {aiCatalogError && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#b91c1c',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{aiCatalogError}</span>
            </div>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              void handleNextStep()
            }
            disabled={isGeneratingCatalog}
            style={{
              marginTop: '14px'
            }}
          >
            {isGeneratingCatalog ? (
              <>
                <Wand2 size={18} />
                <span>
                  {language === 'en'
                    ? 'AI is creating your product details...'
                    : 'AI आपके उत्पाद का विवरण बना रहा है...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{t('continue')}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      )}

      {/* =====================================================
          STEP 3
      ===================================================== */}

      {currentStep === 3 && (
        <div>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '6px',
              color: '#c85a32'
            }}
          >
            {language === 'en'
              ? 'Photo Preview'
              : 'फोटो पूर्वावलोकन'}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#6e625a',
              marginBottom: '20px'
            }}
          >
            {language === 'en'
              ? 'Your uploaded product photo will be used for your listing.'
              : 'आपके लिस्टिंग के लिए अपलोड की गई उत्पाद तस्वीर का उपयोग किया जाएगा।'}
          </p>

          <div
            className="card"
            style={{
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '16px'
              }}
            >
              <CheckCircle2 size={16} />
              <span>
                {language === 'en'
                  ? 'Photo ready'
                  : 'फोटो तैयार है'}
              </span>
            </div>

            <img
              src={draftProduct.imageUrl}
              alt="Product"
              style={{
                width: '100%',
                maxHeight: '360px',
                borderRadius: '12px',
                objectFit: 'contain',
                background: '#f5eee6',
                border: '2px solid #e8ded5'
              }}
            />
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => void handleNextStep()}
            style={{
              marginTop: '14px'
            }}
          >
            <Check size={18} />
            <span>
              {language === 'en'
                ? 'Use This Photo'
                : 'इस फोटो का उपयोग करें'}
            </span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* =====================================================
          STEP 4
      ===================================================== */}

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
                  border: 'none',
                  background: 'none',
                  color: '#c85a32',
                  fontWeight: 600,
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

            {/* STRUCTURED AI PRODUCT DETAILS */}
            <div
              className="card"
              style={{
                marginTop: '14px',
                padding: '14px',
                background: '#fffaf4',
                border: '1px solid #ead8c8'
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#8a4b25',
                  marginBottom: '12px'
                }}
              >
                🧠 Product Details
              </div>

              {[
                ['Material', 'material'],
                ['Color', 'color'],
                ['Design / Motif', 'design'],
                ['Technique', 'technique']
              ].map(([label, field]) => {
                const value = (draftProduct as any)[field] || '';

                return (
                  <div
                    key={field}
                    className="form-group"
                    style={{ marginBottom: '10px' }}
                  >
                    <label>{label}</label>

                    {isEditingCatalog ? (
                      <input
                        type="text"
                        className="form-control"
                        value={value}
                        onChange={event =>
                          setDraftProduct(prev => ({
                            ...prev,
                            [field]: event.target.value
                          }))
                        }
                      />
                    ) : (
                      <div
                        style={{
                          padding: '9px 10px',
                          background: '#ffffff',
                          borderRadius: '8px',
                          color: value ? '#2a201b' : '#8a8178',
                          fontSize: '13px'
                        }}
                      >
                        {value || 'Not provided'}
                      </div>
                    )}
                  </div>
                );
              })}

              <div
                className="form-group"
                style={{ marginTop: '10px', marginBottom: 0 }}
              >
                <label>Key Features</label>

                {isEditingCatalog ? (
                  <textarea
                    className="form-control"
                    rows={3}
                    value={(draftProduct.features || []).join(', ')}
                    placeholder="e.g. handwoven, festive wear, lightweight"
                    onChange={event =>
                      setDraftProduct(prev => ({
                        ...prev,
                        features: event.target.value
                          .split(',')
                          .map(item => item.trim())
                          .filter(Boolean)
                      }))
                    }
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}
                  >
                    {(draftProduct.features || []).length > 0 ? (
                      (draftProduct.features || []).map(
                        (feature, index) => (
                          <span
                            key={`${feature}-${index}`}
                            style={{
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '5px 9px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            ✓ {feature}
                          </span>
                        )
                      )
                    ) : (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#8a8178'
                        }}
                      >
                        No features provided
                      </span>
                    )}
                  </div>
                )}
              </div>
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
                  onChange={event => {
                    setDraftProduct(
                      prev => ({
                        ...prev,
                        aiTitleEn:
                          event.target.value
                      })
                    );
                  }}
                />
              ) : (
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '16px'
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
                marginTop: '14px'
              }}
            >
              <label>
                {t('descEn')}
              </label>

              <textarea
                className="form-control"
                rows={4}
                value={
                  draftProduct.aiDescriptionEn
                }
                readOnly={
                  !isEditingCatalog
                }
                onChange={event => {
                  setDraftProduct(
                    prev => ({
                      ...prev,
                      aiDescriptionEn:
                        event.target.value
                    })
                  );
                }}
              />
            </div>

            <div
              className="form-group"
              style={{
                marginTop: '14px'
              }}
            >
              <label>
                {t('descHi')}
              </label>

              <textarea
                className="form-control lang-hi"
                rows={4}
                value={
                  draftProduct.aiDescriptionHi
                }
                readOnly={
                  !isEditingCatalog
                }
                onChange={event => {
                  setDraftProduct(
                    prev => ({
                      ...prev,
                      aiDescriptionHi:
                        event.target.value
                    })
                  );
                }}
              />
            </div>

            <div
              style={{
                marginTop: '14px'
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
                  marginTop: '8px'
                }}
              >
                {draftProduct.keywords.map(
                  (keyword, index) => (
                    <span
                      key={`${keyword}-${index}`}
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
                        fontWeight:
                          600
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
            onClick={() =>
              void handleNextStep()
            }
            style={{
              marginTop: '14px'
            }}
          >
            <span>{t('continue')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* =====================================================
          STEP 5
      ===================================================== */}

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
                paddingBottom: '12px',
                borderBottom:
                  '1px solid #e8ded5'
              }}
            >
              <span
                style={{
                  color: '#6e625a'
                }}
              >
                {t(
                  'rawMaterialCost'
                )}
              </span>

              <strong>
                ₹
                {
                  draftProduct.rawMaterialCost
                }
              </strong>
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
                  color: '#6e625a'
                }}
              >
                {t(
                  'estimatedMarketRange'
                )}
              </span>

              <strong
                style={{
                  color: '#2563eb'
                }}
              >
                ₹
                {
                  draftProduct
                    .marketPriceRange
                    .min
                }
                {' - '}
                ₹
                {
                  draftProduct
                    .marketPriceRange
                    .max
                }
              </strong>
            </div>

            <div
              style={{
                background:
                  'linear-gradient(135deg, #fef3c7, #fed7aa)',
                borderRadius: '14px',
                padding: '18px',
                textAlign: 'center',
                marginTop: '16px',
                border:
                  '2px solid #f59e0b'
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#b45309'
                }}
              >
                ✨{' '}
                {t(
                  'aiSuggestedPrice'
                )}
              </div>

              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#c85a32',
                  margin: '5px 0'
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
                  color: '#6e625a'
                }}
              >
                {t(
                  'pricingExplanation',
                  {
                    cost:
                      draftProduct
                        .rawMaterialCost
                  }
                )}
              </p>
            </div>

            {isEditingPrice && (
              <div
                className="form-group"
                style={{
                  marginTop: '14px'
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
                  onChange={event => {
                    setDraftProduct(
                      prev => ({
                        ...prev,
                        selectedPrice:
                          Number(
                            event.target.value
                          )
                      })
                    );
                  }}
                />
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '14px'
            }}
          >
            <button
              type="button"
              className="btn-primary"
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
                    price:
                      draftProduct
                        .suggestedPrice
                  }
                )}
              </span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setIsEditingPrice(
                  prev => !prev
                )
              }
            >
              <DollarSign size={18} />

              <span>
                {isEditingPrice
                  ? 'Keep Selected Price'
                  : t('editPrice')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          STEP 6
      ===================================================== */}

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
              ? 'Review your product before publishing'
              : 'प्रकाशित करने से पहले अपने उत्पाद की समीक्षा करें'}
          </p>

          {saveError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px'
              }}
            >
              <AlertCircle size={18} />
              <span>{saveError}</span>
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
              alt="Product preview"
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
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#c85a32',
                  margin: '10px 0'
                }}
              >
                ₹
                {
                  draftProduct.selectedPrice
                }
              </div>

              <p
                style={{
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: '#4a2e1b'
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
                  gap: '6px',
                  marginTop: '12px'
                }}
              >
                {draftProduct.keywords.map(
                  (keyword, index) => (
                    <span
                      key={`${keyword}-${index}`}
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
            onClick={() =>
              void handleNextStep()
            }
            disabled={isSavingProduct}
            style={{
              marginTop: '14px'
            }}
          >
            <Sparkles size={18} />

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