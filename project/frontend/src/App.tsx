import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrendingItems } from './components/TrendingItems';
import { About } from './components/About';
import { AIDesignStudio } from './components/AIDesignStudio';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

function AppContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'signup'>('login');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // basic section tracking if needed in future
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = (type: 'login' | 'signup') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  const handleNavigate = (section: string) => {
    if (section === 'ai-studio') {
      if (isAuthenticated) {
        navigate('/ai-studio');
      } else {
        handleAuthClick('login');
      }
      return;
    }
    
    if (section === 'about') {
      navigate('/about');
      return;
    }
    
    // For home/other sections, if we're not on '/', navigate there first
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      // Scroll to top immediately after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
      return;
    }
    
    if (section === 'dashboard' || section === 'cart') {
      if (!isAuthenticated) {
        handleAuthClick('login');
        return;
      }
      section = 'dashboard';
    }

    // Special handling for home - scroll to top
    if (section === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    const element = document.getElementById(section);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/ai-studio');
    } else {
      handleAuthClick('signup');
    }
  };

  // Redirect to home after logout from protected pages only (e.g., leaving /ai-studio)
  useEffect(() => {
    if (!isAuthenticated && location.pathname === '/ai-studio') {
      navigate('/');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Scroll to top when navigating to home page
  useEffect(() => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Navbar onAuthClick={handleAuthClick} onNavigate={handleNavigate} />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {location.pathname === '/' ? (
          <div key="home">
            <Hero onGetStarted={handleGetStarted} />
            <TrendingItems />
          </div>
        ) : location.pathname === '/ai-studio' ? (
          <div key="ai-studio">
            <AIDesignStudio onAuthRequired={() => handleAuthClick('signup')} />
          </div>
        ) : location.pathname === '/about' ? (
          <div key="about">
            <About />
          </div>
        ) : null}
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialType={authModalType}
      />
    </div>
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
