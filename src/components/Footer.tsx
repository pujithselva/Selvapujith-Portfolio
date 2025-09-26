import { motion } from 'framer-motion';
import { Heart, Mail, Linkedin, Github, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Skills', path: '/skills' },
    { name: 'Projects', path: '/projects' },
    { name: 'Education', path: '/education' },
    { name: 'Certificates', path: '/certificates' },
    { name: 'Contact', path: '/contact' },
  ];

  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/selvapujith/',
      icon: <Linkedin size={20} />,
      color: 'hover:text-blue-500'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/SELVAPUJITH',
      icon: <Github size={20} />,
      color: 'hover:text-gray-800 dark:hover:text-gray-200'
    },
    {
      name: 'Email',
      url: 'mailto:selvapujith30@gmail.com',
      icon: <Mail size={20} />,
      color: 'hover:text-red-500'
    }
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SelvaPujith T
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Data Science Enthusiast
              </p>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md leading-relaxed">
              Passionate about transforming data into actionable insights through machine learning, 
              predictive modeling, and advanced analytics. Always exploring new technologies and 
              methodologies in the data science field.
            </p>

            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 ${social.color} transition-all hover:shadow-lg`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Get In Touch
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Email:</strong><br />
                selvapujith30@gmail.com
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Phone:</strong><br />
                +91 9629537579
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Location:</strong><br />
                Coimbatore, Tamil Nadu
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <span>© 2024 SelvaPujith T. Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart size={16} className="text-red-500 fill-current" />
              </motion.div>
              <span>for the data science community</span>
            </motion.div>

            <motion.button
              onClick={scrollToTop}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <ArrowUp size={16} />
              <span>Back to Top</span>
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;