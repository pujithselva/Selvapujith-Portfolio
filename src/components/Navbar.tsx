import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '#home' },
    { name: 'About', path: '#about' },
    { name: 'Skills', path: '#skills' },
    { name: 'Projects', path: '#projects' },
    { name: 'Education', path: '#education' },
    { name: 'Certificates', path: '#certificates' },
    { name: 'Contact', path: '#contact' },
  ];

  if (isAuthenticated && user?.isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin' });
  }

  const isHome = location.pathname === '/';
  const sectionIds = ['home', 'about', 'skills', 'projects', 'education', 'certificates', 'contact'];

  // Initialize active section from hash and observe sections on Home for scrollspy
  useEffect(() => {
    if (!isHome) return;

    // set initial from hash if present
    const initial = (location.hash || '#home').replace('#', '');
    if (sectionIds.includes(initial)) setActiveSection(initial);

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the most visible entry that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id && sectionIds.includes(visible.target.id)) {
          setActiveSection(visible.target.id);
        }
      },
      {
        // Trigger when section crosses 35% from top, helps with fixed navbar
        root: null,
        rootMargin: '-35% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isHome, location.hash]);

  const handleSmoothScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      setActiveSection(sectionId);
      setIsOpen(false);
      // Update URL hash
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-bold text-xl text-blue-600 dark:text-blue-400"
          >
            <Link to="/">SelvaPujith T</Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const sectionId = item.path.replace('#', '');
              const isActive = activeSection === sectionId;

              return item.name === 'Admin' ? (
                <Link
                  key={item.name}
                  to="/admin"
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/admin'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                  {location.pathname === '/admin' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-md"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => handleSmoothScroll(sectionId)}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-md"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </button>
              );
            })}
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center">
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin"
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  <User size={20} />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */
        }
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="py-2 space-y-1">
                {navItems.map((item) => {
                  const sectionId = item.path.replace('#', '');
                  const isActive = activeSection === sectionId;

                  return item.name === 'Admin' ? (
                    <Link
                      key={item.name}
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        location.pathname === '/admin'
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <button
                      key={item.name}
                      onClick={() => handleSmoothScroll(sectionId)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;