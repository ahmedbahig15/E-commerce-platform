import { StoreProvider, useStore } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

function AppContent() {
  const { state } = useStore();

  const renderPage = () => {
    switch (state.page) {
      case 'home': return <Home />;
      case 'products': return <Products />;
      case 'product-detail': return <ProductDetail />;
      case 'cart': return <Cart />;
      case 'wishlist': return <Wishlist />;
      case 'checkout': return <Checkout />;
      case 'orders': return <Orders />;
      case 'auth': return <Auth />;
      case 'admin': return <Admin />;
      default: return <Home />;
    }
  };

  const hideFooter = state.page === 'checkout' || state.page === 'auth';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
