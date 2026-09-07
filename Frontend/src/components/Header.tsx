import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, setCurrentScreen } = useApp();

  return (
    <header className="header-bar">
      <button
        type="button"
        className="header-logo"
        onClick={() => setCurrentScreen('home')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
        }}
      >
        <span
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img
            src="/kalakart-logo.jpeg"
            alt="Kalakart"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
            }}
          />
        </span>

        <span>Kalakart</span>

        <span
          style={{
            fontSize: '10px',
            backgroundColor: '#e3f0f0',
            color: '#3C6E71',
            padding: '2px 6px',
            borderRadius: '10px',
            fontWeight: '600',
          }}
        >
          AI
        </span>
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          type="button"
          className="lang-toggle-badge"
          onClick={() =>
            setLanguage(language === 'en' ? 'hi' : 'en')
          }
          title="Switch Language / भाषा बदलें"
        >
          <Globe size={14} color="#3C6E71" />
          <span>
            {language === 'en' ? 'हिंदी' : 'English'}
          </span>
        </button>
      </div>
    </header>
  );
};