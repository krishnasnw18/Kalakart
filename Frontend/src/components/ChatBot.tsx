import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Camera,
  Mic,
  MicOff,
  Volume2,
  Trash2
} from 'lucide-react';
import { ChatMessage } from '../types';
import {
  sendChatMessage,
  ChatLanguage
} from '../services/chatService';

export const ChatBot: React.FC = () => {
  const { language, setLanguage, user } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatLanguage, setChatLanguage] = useState<ChatLanguage>(
    language === 'hi' ? 'hi' : 'en'
  );
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Live Camera Stream overlay state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setChatLanguage(language === 'hi' ? 'hi' : 'en');
  }, [language]);

  // Clean up SpeechRecognizer on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const getWelcomeMessage = (lang: ChatLanguage): string => {
    if (lang === 'hi') {
      return `नमस्ते ${user.name || 'कारीगर'} जी! 🙏 मैं आपका AI बिजनेस सहायक हूँ।\n\nआप मुझसे प्रश्न पूछ सकते हैं, अपने उत्पाद की फोटो (Gallery या Camera से) भेज सकते हैं, या बोलकर अपनी बात कह सकते हैं।\n\nआज मैं आपकी क्या सहायता करूँ?`;
    }

    return `Namaste ${user.name || 'Artisan'}! 🙏 I am your AI Business Assistant.\n\nYou can ask questions, attach photos of your craft (via Gallery or Camera), or use voice input.\n\nHow can I help your business today?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome_1',
      sender: 'ai',
      text: getWelcomeMessage(chatLanguage),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading, selectedImage]);

  // Gallery Image Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(chatLanguage === 'hi' ? 'कृपया केवल फोटो फाइल चुनें।' : 'Please select an image file.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert(chatLanguage === 'hi' ? 'फोटो का साइज 8MB से कम होना चाहिए।' : 'Image size must be less than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Direct Device Camera Handler (Live Camera stream or capture="environment")
  const handleStartCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        setIsCameraActive(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }, 100);
        return;
      } catch (err) {
        console.warn('getUserMedia camera stream failed, falling back to capture input:', err);
      }
    }
    // Fallback trigger for environment camera input
    cameraInputRef.current?.click();
  };

  const handleSnapPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        handleStopCamera();
      }
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Speech-to-Text Handler
  const toggleSpeechToText = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(chatLanguage === 'hi'
        ? 'आपके डिवाइस/ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है।'
        : 'Voice input is not supported on this device/browser.');
      return;
    }

    // Stop and cleanup if recognition is already running
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore stop errors
      }
      setIsListening(false);
      recognitionRef.current = null;
      return;
    }

    // Destroy any existing stale recognizer instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore abort errors
      }
      recognitionRef.current = null;
    }

    // Request runtime microphone permission if available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop audio tracks after obtaining permission
        stream.getTracks().forEach(track => track.stop());
      } catch (err: any) {
        console.warn('Microphone permission check failed:', err);
        const permErrMsg = chatLanguage === 'hi'
          ? 'वॉइस इनपुट के लिए माइक्रोफ़ोन की अनुमति आवश्यक है।'
          : 'Microphone permission is required for voice input.';
        alert(permErrMsg);
        setIsListening(false);
        return;
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      if (chatLanguage === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        recognitionRef.current = null;

        if (event.error === 'not-allowed') {
          alert(chatLanguage === 'hi'
            ? 'माइक्रोफ़ोन की अनुमति अस्वीकृत की गई।'
            : 'Microphone permission is required for voice input.');
        } else if (event.error === 'no-speech') {
          alert(chatLanguage === 'hi'
            ? 'कुछ सुनाई नहीं दिया। कृपया पुनः प्रयास करें।'
            : "Didn't catch that. Please try again.");
        } else if (event.error === 'audio-capture') {
          alert(chatLanguage === 'hi'
            ? 'कोई माइक्रोफ़ोन नहीं मिला।'
            : 'No microphone was found on this device.');
        } else if (event.error !== 'aborted') {
          alert(chatLanguage === 'hi'
            ? 'स्पीच पहचान में त्रुटि आई। कृपया पुनः प्रयास करें।'
            : 'Speech recognition error. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (err) {
      console.error('STT Init exception:', err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  // Text-to-Speech Handler
  const handleTextToSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this device.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));

    if (chatLanguage === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Clear Chat Handler
  const handleClearChat = () => {
    if (messages.length > 1) {
      if (confirm(chatLanguage === 'hi' ? 'क्या आप पूरी चैट हटाना चाहते हैं?' : 'Clear all messages in this chat?')) {
        setMessages([
          {
            id: 'welcome_1',
            sender: 'ai',
            text: getWelcomeMessage(chatLanguage),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setConversationId(undefined);
        setSelectedImage(null);
        setError(null);
      }
    }
  };

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    const imageToSend = selectedImage;

    if ((!query && !imageToSend) || isLoading) return;

    setError(null);
    setInputMessage('');
    setSelectedImage(null);

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: query,
      image: imageToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: query,
        image: imageToSend || undefined,
        conversationId: conversationId,
        language: chatLanguage
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg = err.message || 'Could not connect to AI service. Please check your connection and try again.';
      setError(errorMsg);

      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'error'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPromptChips = () => {
    if (chatLanguage === 'hi') {
      return [
        '🏷️ यह उत्पाद कितने रुपये में बेचना चाहिए?',
        '🏷️ मेरे उत्पाद की सही कीमत क्या होनी चाहिए?',
        '📈 बिक्री कैसे बढ़ाएं?',
        '💰 मुनाफा कैसे बढ़ा सकता हूँ?',
        '🛍️ मीशो और अमेज़न पर कैसे बेचें?'
      ];
    } else {
      return [
        '🏷️ What price should I sell this product for?',
        '🏷️ Predict a suitable price for my product.',
        '📈 How can I increase my sales?',
        '💰 How can I improve my profit margin?',
        '🛍️ How to sell on Meesho & Amazon?'
      ];
    }
  };

  return (
    <>
      {/* Hidden Inputs for Gallery (GetContent) & Camera (Capture) */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Direct Live Camera Overlay Modal */}
      {isCameraActive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1000,
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px'
        }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', color: '#ffffff' }}>
            <span style={{ fontWeight: 700 }}>📷 Device Camera</span>
            <button onClick={handleStopCamera} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: '100%', height: '70%', objectFit: 'cover', borderRadius: '16px', background: '#222' }}
          />

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={handleSnapPhoto}
              style={{
                background: 'linear-gradient(135deg, #3C6E71 0%, #3C6E71 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '30px',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Camera size={20} />
              <span>Take Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          id="btn-open-chatbot"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '16px',
            zIndex: 950,
            background: 'linear-gradient(135deg, #3C6E71 0%, #3C6E71 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '28px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(60, 110, 113, 0.4)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '13px'
          }}
        >
          <Sparkles size={18} color="#fef3c7" />
          <span>AI Sahayak</span>
          <span style={{
            background: '#ffffff',
            color: '#3C6E71',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '8px',
            fontWeight: 800
          }}>
            LIVE
          </span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          id="chatbot-drawer"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            backgroundColor: '#fdfbf7',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #3C6E71 0%, #3C6E71 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Kalakart AI Sahayak
                  <Sparkles size={14} color="#fef3c7" />
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  {chatLanguage === 'hi' ? '24/7 व्यवसाय सलाहकार' : '24/7 Business Advisor'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Clear Chat */}
              <button
                onClick={handleClearChat}
                title="Clear Chat"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={15} />
              </button>

              {/* Language Selector */}
              <select
                value={chatLanguage}
                onChange={(e) => {
                  const newLang = e.target.value as ChatLanguage;
                  setChatLanguage(newLang);
                  setLanguage(newLang);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  padding: '4px 6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="en" style={{ color: '#000' }}>English</option>
                <option value="hi" style={{ color: '#000' }}>हिंदी</option>
              </select>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                id="btn-close-chatbot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#fdfbf7'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 14px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, #3C6E71 0%, #3C6E71 100%)'
                      : (msg.status === 'error' ? '#fee2e2' : '#ffffff'),
                    color: msg.sender === 'user'
                      ? '#ffffff'
                      : (msg.status === 'error' ? '#991b1b' : '#2a201b'),
                    border: msg.sender === 'user' ? 'none' : '1px solid #e8ded5',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    position: 'relative'
                  }}
                >
                  {/* Image attachment preview */}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Uploaded attachment"
                      style={{
                        width: '100%',
                        maxHeight: '180px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        marginBottom: '8px',
                        display: 'block'
                      }}
                    />
                  )}

                  {msg.text}

                  {/* Audio Playback Button */}
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handleTextToSpeech(msg.id, msg.text)}
                      title="Read aloud"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: speakingMsgId === msg.id ? '#3C6E71' : '#a09388',
                        cursor: 'pointer',
                        padding: '4px',
                        marginTop: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      <Volume2 size={14} color={speakingMsgId === msg.id ? '#3C6E71' : '#a09388'} />
                      <span>{speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                    </button>
                  )}
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    color: '#a09388',
                    marginTop: '4px',
                    marginRight: msg.sender === 'user' ? '4px' : '0',
                    marginLeft: msg.sender === 'ai' ? '4px' : '0'
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#ffffff', borderRadius: '18px 18px 18px 4px', border: '1px solid #e8ded5', width: 'fit-content' }}>
                <RefreshCw size={16} className="spin-animation" color="#3C6E71" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px', color: '#6e625a', fontWeight: 500 }}>
                  {chatLanguage === 'hi' ? 'AI उत्तर लिख रहा है...' : 'AI Assistant thinking...'}
                </span>
              </div>
            )}

            {/* Quick Suggestion Chips */}
            {messages.length <= 2 && !isLoading && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6e625a', fontWeight: 600, marginBottom: '8px' }}>
                  {chatLanguage === 'hi' ? '💡 सुझाये गए प्रश्न:' : '💡 Suggested questions:'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {getPromptChips().map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        background: '#ffffff',
                        border: '1px solid #e8ded5',
                        borderRadius: '12px',
                        fontSize: '13px',
                        color: '#4a2e1b',
                        cursor: 'pointer'
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attachment Preview Box */}
          {selectedImage && (
            <div style={{
              padding: '8px 14px',
              background: '#f7f2ed',
              borderTop: '1px solid #e8ded5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={selectedImage}
                  alt="Attachment preview"
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #3C6E71' }}
                />
                <span style={{ fontSize: '12px', color: '#4a2e1b', fontWeight: 600 }}>
                  {chatLanguage === 'hi' ? 'फोटो संलग्न है' : 'Photo attached'}
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Listening State Bar */}
          {isListening && (
            <div style={{
              padding: '6px 14px',
              background: '#fef3c7',
              color: '#b45309',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Mic size={14} className="spin-animation" />
              <span>{chatLanguage === 'hi' ? '🎙️ आपकी आवाज़ सुनी जा रही है...' : '🎙️ Listening... Speak now'}</span>
            </div>
          )}

          {/* Input Footer */}
          <div
            style={{
              padding: '10px 12px',
              background: '#ffffff',
              borderTop: '1px solid #e8ded5',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {/* Gallery Button (GetContent) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach photo from gallery"
              disabled={isLoading}
              style={{
                background: '#f0e6dd',
                color: '#6e625a',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ImageIcon size={18} />
            </button>

            {/* REAL Device Camera Button (TakePicture / getUserMedia) */}
            <button
              onClick={handleStartCamera}
              title="Open Device Camera"
              disabled={isLoading}
              style={{
                background: '#f0e6dd',
                color: '#3C6E71',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Camera size={18} />
            </button>

            {/* Microphone / STT Button */}
            <button
              onClick={toggleSpeechToText}
              title="Voice Input"
              disabled={isLoading}
              style={{
                background: isListening ? '#fee2e2' : '#f0e6dd',
                color: isListening ? '#dc2626' : '#6e625a',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder={
                chatLanguage === 'hi'
                  ? 'अपना प्रश्न यहाँ लिखें...'
                  : 'Ask AI assistant...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '20px',
                border: '1.5px solid #e8ded5',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: isLoading ? '#f9f6f0' : '#ffffff'
              }}
              id="input-chatbot-message"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
              id="btn-send-chatbot-message"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: ((!inputMessage.trim() && !selectedImage) || isLoading)
                  ? '#d1c4b8'
                  : 'linear-gradient(135deg, #3C6E71 0%, #3C6E71 100%)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: ((!inputMessage.trim() && !selectedImage) || isLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Inline CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};


