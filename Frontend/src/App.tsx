import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PhoneContainer } from './components/PhoneContainer';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ChatBot } from './components/ChatBot';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { AddProductWizard } from './screens/AddProductWizard';
import { SellOnlineScreen } from './screens/SellOnlineScreen';
import { MarketplaceListingScreen } from './screens/MarketplaceListingScreen';
import { MyProductsScreen } from './screens/MyProductsScreen';
import { MyListingsScreen } from './screens/MyListingsScreen';
import { ProfileScreen } from './screens/ProfileScreen';

const KalakartSplashScreen: React.FC<{ onFinish: () => void }> = ({
  onFinish,
}) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const finishTimer = window.setTimeout(() => {
      setFading(true);

      window.setTimeout(() => {
        onFinish();
      }, 500);
    }, 2400);

    return () => {
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#3C6E71',
        backgroundImage: "url('/kalakart-splash.jpeg')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        opacity: fading ? 0 : 1,
        transition: 'opacity 500ms ease-in-out',
        pointerEvents: fading ? 'none' : 'auto',
      }}
      aria-label="Kalakart splash screen"
    />
  );
};

const MainScreenRouter: React.FC = () => {
  const { currentScreen, user } = useApp();

  // MUST start on Login screen if not logged in
  if (!user.isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <>
      <Header />

      {(() => {
        switch (currentScreen) {
          case 'login':
          case 'register':
            return <LoginScreen />;

          case 'home':
            return <HomeScreen />;

          case 'add_product':
            return <AddProductWizard />;

          case 'sell_online':
            return <SellOnlineScreen />;

          case 'marketplace_listing':
            return <MarketplaceListingScreen />;

          case 'my_products':
            return <MyProductsScreen />;

          case 'my_listings':
            return <MyListingsScreen />;

          case 'profile':
            return <ProfileScreen />;

          default:
            return <HomeScreen />;
        }
      })()}

      <BottomNav />

      {/* AI Sahayak is available throughout the logged-in app */}
      <ChatBot />
    </>
  );
};

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AppProvider>
      <PhoneContainer>
        {showSplash ? (
          <KalakartSplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <MainScreenRouter />
        )}
      </PhoneContainer>
    </AppProvider>
  );
};

export default App;


