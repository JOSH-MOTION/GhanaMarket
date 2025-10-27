import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SellerStorePage } from './pages/SellerStorePage';

type ViewType =
  | { type: 'home' }
  | { type: 'product'; productId: string }
  | { type: 'store'; storeSlug: string };

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>({ type: 'home' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      {currentView.type === 'home' && (
        <HomePage
          onProductClick={(productId) => setCurrentView({ type: 'product', productId })}
        />
      )}

      {currentView.type === 'product' && (
        <ProductDetailPage
          productId={currentView.productId}
          onBack={() => setCurrentView({ type: 'home' })}
          onViewStore={(storeSlug) => setCurrentView({ type: 'store', storeSlug })}
          onMessageSeller={(sellerId) => {
            console.log('Message seller:', sellerId);
          }}
        />
      )}

      {currentView.type === 'store' && (
        <SellerStorePage
          storeSlug={currentView.storeSlug}
          onBack={() => setCurrentView({ type: 'home' })}
          onProductClick={(productId) => setCurrentView({ type: 'product', productId })}
          onMessageSeller={(sellerId) => {
            console.log('Message seller:', sellerId);
          }}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
