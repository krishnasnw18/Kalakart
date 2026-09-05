import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, setCurrentScreen } = useApp();

  return (
    <header className="header-bar">
      <div className="header-logo" onClick={() => setCurrentScreen('home')}>
        <span style={{ fontSize: '22px' }}>🪔</span>
        <span>ShilpAura</span>
        <span style={{ 
          fontSize: '10px', 
          backgroundColor: '#fef3c7', 
          color: '#b45309', 
          padding: '2px 6px', 
          borderRadius: '10px',
          fontWeight: '600'
        }}>
          AI
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          className="lang-toggle-badge"
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          title="Switch Language / भाषा बदलें"
        >
          <Globe size={14} color="#c85a32" />
          <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
      </div>
    </header>
  );
};
