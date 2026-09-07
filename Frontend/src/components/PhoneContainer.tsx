import React, { useState } from 'react';
import { Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface PhoneContainerProps {
  children: React.ReactNode;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <div className="app-viewport-wrapper">
      <button 
        className="view-toggle-btn"
        onClick={() => setIsFullScreen(!isFullScreen)}
        title="Toggle Phone Frame View"
      >
        {isFullScreen ? (
          <>
            <Smartphone size={16} />
            <span>Mobile Frame</span>
          </>
        ) : (
          <>
            <Maximize2 size={16} />
            <span>Expand Screen</span>
          </>
        )}
      </button>

      <div className={`mobile-phone-frame ${isFullScreen ? 'full-view' : ''}`}>
        {!isFullScreen && (
          <div className="phone-notch">
            <div className="phone-camera"></div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};


