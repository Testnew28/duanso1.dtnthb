import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { Layout } from '@/components/layout/Layout';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { SciencePage } from '@/pages/SciencePage';
import { PricingPage } from '@/pages/PricingPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage';
import { LookupPage } from '@/pages/LookupPage';
import { LocationPage } from '@/pages/LocationPage';
import { AdminPage } from '@/pages/AdminPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <StoreProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cua-hang" element={<ShopPage />} />
                  <Route path="/khoa-hoc" element={<SciencePage />} />
                  <Route path="/khao-sat-gia" element={<PricingPage />} />
                  <Route path="/dat-hang" element={<CheckoutPage />} />
                  <Route path="/xac-nhan" element={<Navigate to="/dat-hang" replace />} />
                  <Route path="/don-hang/:code" element={<OrderSuccessPage />} />
                  <Route path="/tra-cuu" element={<LookupPage />} />
                  <Route path="/vi-tri" element={<LocationPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
