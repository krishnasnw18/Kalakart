import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Globe, LogOut, Edit, MapPin, Phone, Building, Award, Check } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, logout, language, setLanguage, t } = useApp();

  return (
    <div className="app-screen-container" style={{ padding: '16px' }}>
      {/* Header Profile Hero Card */}
      <div className="card" style={{
        textAlign: 'center',
        padding: '24px 16px',
        background: 'linear-gradient(135deg, #fdfbf7 0%, #fef3c7 100%)',
        border: '2px solid #f59e0b'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #c85a32 0%, #d97706 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          margin: '0 auto 12px',
          boxShadow: '0 6px 16px rgba(200, 90, 50, 0.25)'
        }}>
          👨‍🎨
        </div>

        <h2 style={{ fontSize: '20px', color: '#2a201b' }}>{user.name}</h2>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#c85a32', marginTop: '2px' }}>
          {user.businessName}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, marginTop: '10px' }}>
          <Award size={14} />
          <span>Verified Master Artisan</span>
        </div>
      </div>

      {/* Profile Details List */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '15px', color: '#4a2e1b', marginBottom: '14px', borderBottom: '1px solid #e8ded5', paddingBottom: '8px' }}>
          {language === 'en' ? 'Artisan Profile Information' : 'कारीगर प्रोफाइल विवरण'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Phone size={18} color="#c85a32" />
            <div>
              <div style={{ fontSize: '11px', color: '#6e625a' }}>{t('mobileNumber')}</div>
              <div style={{ fontWeight: 600 }}>+91 {user.phone}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building size={18} color="#c85a32" />
            <div>
              <div style={{ fontSize: '11px', color: '#6e625a' }}>{t('businessName')}</div>
              <div style={{ fontWeight: 600 }}>{user.businessName}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={18} color="#c85a32" />
            <div>
              <div style={{ fontSize: '11px', color: '#6e625a' }}>{t('location')}</div>
              <div style={{ fontWeight: 600 }}>{user.location || 'Varanasi, UP'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Globe size={18} color="#c85a32" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#6e625a' }}>{t('preferredLanguage')}</div>
              <div style={{ fontWeight: 600 }}>{language === 'en' ? 'English' : 'हिंदी (Hindi)'}</div>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid #c85a32',
                background: '#fef3c7',
                color: '#c85a32',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <button
        className="btn-secondary"
        id="btn-logout"
        onClick={logout}
        style={{
          marginTop: '10px',
          borderColor: '#fee2e2',
          color: '#b91c1c',
          background: '#ffffff'
        }}
      >
        <LogOut size={18} />
        <span>{t('logout')}</span>
      </button>
    </div>
  );
};
