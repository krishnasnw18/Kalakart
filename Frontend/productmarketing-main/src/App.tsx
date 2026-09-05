import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PhoneContainer } from './components/PhoneContainer';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { AddProductWizard } from './screens/AddProductWizard';
import { SellOnlineScreen } from './screens/SellOnlineScreen';
import { MarketplaceListingScreen } from './screens/MarketplaceListingScreen';
import { MyProductsScreen } from './screens/MyProductsScreen';
import { MyListingsScreen } from './screens/MyListingsScreen';
import { ProfileScreen } from './screens/ProfileScreen';

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
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <PhoneContainer>
        <MainScreenRouter />
      </PhoneContainer>
    </AppProvider>
  );
};

export default App;
