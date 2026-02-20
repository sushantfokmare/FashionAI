import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface NavbarProps {
  onAuthClick: (type: 'login' | 'signup') => void;
  onNavigate: (section: string) => void;
}

export const Navbar = ({ onAuthClick, onNavigate }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = {
    'Topwear': ['T-Shirts', 'Shirts', 'Hoodies', 'Jackets'],
    'Bottomwear': ['Jeans', 'Trousers'],
    'Footwear': ['Sneakers', 'Formal Shoes'],
    'Accessories': ['Watches', 'Bags']
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Categories', id: 'categories' },
    { name: 'AI Design Studio', id: 'ai-studio' },
    { name: 'About', id: 'about' },
  ];

  // Determine navbar style based on route and scroll
  const isOnAIStudio = location.pathname === '/ai-studio';
  const isOnHome = location.pathname === '/';
  
  // On AI Studio: always white/solid
  // On Home: transparent at top, white when scrolled
  const useLightNav = isOnAIStudio || (isOnHome && isScrolled);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        useLightNav
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Sparkles className={`w-8 h-8 ${useLightNav ? 'text-rose-600 dark:text-rose-400' : 'text-white'}`} />
            <span
              className={`text-2xl font-bold tracking-tight ${
                useLightNav ? 'text-gray-900 dark:text-white' : 'text-white'
              }`}
            >
              Fashion AI
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.id === 'categories' ? (
                <div
                  key={link.id}
                  className="relative group"
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate(link.id)}
                    className={`text-sm font-medium transition-colors relative flex items-center gap-1 ${
                      useLightNav ? 'text-gray-700 dark:text-gray-200 hover:text-rose-600 dark:hover:text-rose-400' : 'text-white hover:text-rose-200'
                    }`}
                  >
                    {link.name}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 group-hover:w-full transition-all duration-300"></span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {isCategoriesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                      >
                        {/* Gradient header */}
                        <div className="bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500 px-4 py-3">
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Shop by Category
                          </h3>
                        </div>
                        
                        <div className="py-3 px-2 max-h-96 overflow-y-auto">
                          {Object.entries(categories).map(([category, items], idx) => (
                            <div key={category} className="mb-3 last:mb-0">
                              <div className="flex items-center gap-2 px-3 py-2">
                                <div className="w-1 h-5 bg-gradient-to-b from-rose-500 to-purple-500 rounded-full"></div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                  {category}
                                </h4>
                              </div>
                              <ul className="space-y-0.5 ml-2">
                                {items.map((item) => (
                                  <li key={item}>
                                    <button
                                      onClick={() => {
                                        setIsCategoriesOpen(false);
                                        onNavigate(`category-${item.toLowerCase().replace(' ', '-')}`);
                                      }}
                                      className="group w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 dark:hover:from-rose-900/20 dark:hover:to-purple-900/20 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-all duration-200 flex items-center justify-between"
                                    >
                                      <span className="font-medium">{item}</span>
                                      <motion.span
                                        initial={{ opacity: 0, x: -5 }}
                                        whileHover={{ opacity: 1, x: 0 }}
                                        className="text-rose-500 opacity-0 group-hover:opacity-100"
                                      >
                                        →
                                      </motion.span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                              {idx < Object.entries(categories).length - 1 && (
                                <div className="mx-4 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Bottom gradient accent */}
                        <div className="h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  key={link.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate(link.id)}
                  className={`text-sm font-medium transition-colors relative group ${
                    useLightNav ? 'text-gray-700 dark:text-gray-200 hover:text-rose-600 dark:hover:text-rose-400' : 'text-white hover:text-rose-200'
                  }`}
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 group-hover:w-full transition-all duration-300"></span>
                </motion.button>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('cart')}
                  className={`p-2 rounded-full transition-colors ${
                    useLightNav ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-white/20'
                  }`}
                >
                  <ShoppingCart className={`w-5 h-5 ${useLightNav ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center space-x-2"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full border-2 border-rose-600"
                  />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAuthClick('login')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    useLightNav
                      ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAuthClick('signup')}
                  className="px-6 py-2 bg-rose-600 dark:bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-700 dark:hover:bg-rose-600 transition-colors"
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${useLightNav ? 'text-gray-900 dark:text-white' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${useLightNav ? 'text-gray-900 dark:text-white' : 'text-white'}`} />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                link.id === 'categories' ? (
                  <div key={link.id}>
                    <button
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className="flex items-center justify-between w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 dark:hover:from-rose-900/20 dark:hover:to-purple-900/20 rounded-lg transition-all font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        {link.name}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180 text-rose-500' : 'text-gray-400'}`} />
                    </button>
                    <AnimatePresence>
                      {isCategoriesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 ml-2 bg-gradient-to-br from-rose-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:via-purple-900/10 dark:to-gray-800/50 rounded-xl p-3 space-y-3 border border-rose-100 dark:border-gray-700"
                        >
                          {Object.entries(categories).map(([category, items], idx) => (
                            <div key={category}>
                              <div className="flex items-center gap-2 px-2 py-1">
                                <div className="w-1 h-4 bg-gradient-to-b from-rose-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                  {category}
                                </h3>
                              </div>
                              <div className="space-y-1">
                                {items.map((item) => (
                                  <button
                                    key={item}
                                    onClick={() => {
                                      onNavigate(`category-${item.toLowerCase().replace(' ', '-')}`);
                                      setIsMobileMenuOpen(false);
                                      setIsCategoriesOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                              {idx < Object.entries(categories).length - 1 && (
                                <div className="mx-2 my-2 h-px bg-gradient-to-r from-transparent via-rose-200 dark:via-gray-600 to-transparent"></div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => {
                      onNavigate(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {link.name}
                  </button>
                )
              ))}
              {!isAuthenticated && (
                <>
                  <button
                    onClick={() => {
                      onAuthClick('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onAuthClick('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 bg-rose-600 dark:bg-rose-500 text-white rounded-lg hover:bg-rose-700 dark:hover:bg-rose-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('home');
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
