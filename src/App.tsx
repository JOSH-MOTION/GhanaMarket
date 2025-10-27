import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AuthPage } from './pages/AuthPage';
import HomeRoute from './pages/routes/HomeRoute';
import ProductDetailRoute from './pages/routes/ProductDetailRoute';
import SellerStoreRoute from './pages/routes/SellerStoreRoute';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { MessagesPage } from './pages/MessagesPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AddProductPage } from './pages/AddProductPage';
import { ProductStoriesPage } from './pages/ProductStoriesPage';
import { Header } from './components/Header';

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <Outlet />;
}

function RequireSeller() {
  const { profile } = useAuth();
  if (profile?.role !== 'seller') return <Navigate to="/" replace />;
  return <Outlet />;
}

function WithHeaderLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<RequireAuth />}> 
            <Route element={<WithHeaderLayout />}> 
              <Route index element={<HomeRoute />} />
              <Route path="product/:id" element={<ProductDetailRoute />} />
              <Route path="store/:slug" element={<SellerStoreRoute />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="stories" element={<ProductStoriesPage />} />

              <Route element={<RequireSeller />}> 
                <Route path="dashboard" element={<SellerDashboardPage />} />
                <Route path="add-product" element={<AddProductPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
