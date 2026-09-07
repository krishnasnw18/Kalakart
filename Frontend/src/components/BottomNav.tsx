import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Package, Store, User } from 'lucide-react';
import { ScreenName } from '../types';

export const BottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen, t } = useApp();

  // Hide nav on login & register screens
  if (currentScreen === 'login' || currentScreen === 'register') {
    return null;
  }

  const navItems: { id: ScreenName; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t('home'), icon: <Home size={20} /> },
    { id: 'my_products', label: t('products'), icon: <Package size={20} /> },
    { id: 'sell_online', label: t('sell'), icon: <Store size={20} /> },
    { id: 'profile', label: t('profile'), icon: <User size={20} /> }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const isActive = currentScreen === item.id || 
          (item.id === 'my_products' && currentScreen === 'add_product') ||
          (item.id === 'sell_online' && currentScreen === 'marketplace_listing') ||
          (item.id === 'sell_online' && currentScreen === 'my_listings');
        
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setCurrentScreen(item.id)}
            id={`nav-${item.id}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};


