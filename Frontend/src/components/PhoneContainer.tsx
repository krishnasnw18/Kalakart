import React from 'react';
import { Capacitor } from '@capacitor/core';

interface PhoneContainerProps {
  children: React.ReactNode;
}

const PhoneContainer: React.FC<PhoneContainerProps> = ({ children }) => {
  const isAndroidApp = Capacitor.isNativePlatform();

  return (
    <div
      className="app-viewport-wrapper"
      style={
        isAndroidApp
          ? {
              width: '100vw',
              height: '100dvh',
              minHeight: '100dvh',
              padding: 0,
              margin: 0,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'stretch',
              overflow: 'hidden'
            }
          : undefined
      }
    >
      <div
        className={`mobile-phone-frame${isAndroidApp ? ' full-view' : ''}`}
        style={
          isAndroidApp
            ? {
                width: '100%',
                maxWidth: 'none',
                height: '100dvh',
                maxHeight: '100dvh',
                minHeight: 0,
                margin: 0,
                borderRadius: 0,
                border: 'none',
                boxShadow: 'none',
                overflow: 'hidden'
              }
            : undefined
        }
      >
        {!isAndroidApp && (
          <div className="phone-notch">
            <div className="phone-camera" />
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default PhoneContainer;