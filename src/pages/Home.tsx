import { motion, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ChevronRight, ExternalLink, Github, Linkedin, Mail, MapPin, Download } from 'lucide-react';
import profileImg from '../assets/profile-image.jpg';
import { unifiedResumeService as resumeService, ResumeData } from '../services/unifiedResumeService';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import logger from '../utils/logger';


const Home = () => {
  // Smooth scroll to anchor when visiting `/#section` or when hash changes
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          // give layout a tick to ensure elements are laid out
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
      }
    };

    // initial
    scrollToHash();

    // listen for user-triggered hash changes
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  const [stats, setStats] = useState({ projects: 0, certificates: 0 });
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Projects count from RTDB
        const projectsRef = ref(database, 'projects');
        onValue(projectsRef, (snapshot) => {
          const data = snapshot.val();
          const projectCount = data ? Object.keys(data).length : 0;
          
          // Fetch Certificates count from RTDB
          const certificatesRef = ref(database, 'certificates');
          onValue(certificatesRef, (snapshot) => {
            const certData = snapshot.val();
            const certCount = certData ? Object.keys(certData).length : 0;
            
            setStats({ projects: projectCount, certificates: certCount });
          }, { onlyOnce: true });
        }, { onlyOnce: true });

        // Fetch Resume data using the unified service
        try {
          const currentResume = await resumeService.getCurrentResume();
          setResumeData(currentResume);
          
          if (currentResume) {
            // Debug logging
            logger.log('home-page', 'Resume setup complete:', {
              originalUrl: currentResume.fileUrl,
              fileName: currentResume.fileName,
              resumeData: {
                id: currentResume.id,
                version: currentResume.version,
                storageType: currentResume.storageType
              }
            });
          } else {
            logger.info('home-page', 'No resume found in database');
          }
        } catch (error) {
          logger.error('home-page', 'Error fetching resume:', error);
        }
      } catch (error) {
        logger.error('home-page', 'Error fetching portfolio data:', error);
      }
    };
    
    fetchData();
  }, []);

  const homeContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const homeItemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 12
      }
    }
  };

  const lineVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  const handleResumeDownload = () => {
    if (resumeData && resumeData.fileUrl) {
      logger.log('home-page', 'Resume download initiated:', {
        url: resumeData.fileUrl,
        fileName: resumeData.fileName,
        storageType: resumeData.storageType
      });

      // Create download link with original URL
      const link = document.createElement('a');
      link.href = resumeData.fileUrl;
      link.setAttribute('download', resumeData.fileName || 'Selvapujith_Resume.pdf');
      link.click();
    } else {
      logger.warn('home-page', 'No resume data available for download');
      alert('Resume not available. Please contact the administrator.');
    }
  };

  const handleSmoothScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      // Update URL hash for better navigation
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-900/20 pt-16"
        variants={homeContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={homeItemVariants} className="space-y-8">
              <div className="space-y-4">
                <motion.div 
                  className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={0}
                  variants={lineVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  👋 Welcome to my portfolio
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={1}
                  variants={lineVariants}
                >
                  SelvaPujith T
                </motion.h1>
                <div className="space-y-2">
                  <motion.h2 
                    className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={2}
                    variants={lineVariants}
                  >
                    Data Scientist
                  </motion.h2>
                  <motion.p 
                    className="text-lg text-gray-600 dark:text-gray-400"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={3}
                    variants={lineVariants}
                  >
                    Machine Learning • Predictive Modeling • Data Analytics
                  </motion.p>
                </div>
              </div>

              <motion.p 
                className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={4}
                variants={lineVariants}
              >
                Passionate about transforming data into actionable insights. Skilled in Python, SQL, TensorFlow, 
                and Scikit-Learn with proven expertise in developing high-accuracy machine learning models and 
                building intelligent automation systems.
              </motion.p>

              {/* Contact Info */}
              <motion.div 
                className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={5}
                variants={lineVariants}
              >
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                  <a
                    href="mailto:selvapujith30@gmail.com"
                    className="hover:text-blue-600 dark:hover:text-blue-400 underline decoration-transparent hover:decoration-inherit transition-colors"
                  >
                    selvapujith30@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                  <span>Bangalore, India</span>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-wrap gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={6}
                variants={lineVariants}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button 
                    onClick={() => handleSmoothScroll('projects')}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    View My Work
                    <ChevronRight size={20} className="ml-2" />
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button 
                    onClick={() => handleSmoothScroll('contact')}
                    className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all duration-200"
                  >
                    Get In Touch
                    <ExternalLink size={20} className="ml-2" />
                  </button>
                </motion.div>
              </motion.div>

              {/* Social Links */}
              <motion.div 
                className="flex space-x-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={7}
                variants={lineVariants}
              >
                <motion.a
                  href="https://www.linkedin.com/in/selvapujith"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit LinkedIn Profile"
                  className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-blue-600 hover:text-blue-700"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Linkedin size={24} />
                </motion.a>
                <motion.a
                  href="https://github.com/SELVAPUJITH"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit GitHub Profile"
                  className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github size={24} />
                </motion.a>
                <motion.a
                  href="mailto:selvapujith30@gmail.com"
                  aria-label="Send Email"
                  className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-red-600 hover:text-red-700"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail size={24} />
                </motion.a>
                <motion.button
                  onClick={handleResumeDownload}
                  aria-label="Download Resume"
                  className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-white hover:from-green-600 hover:to-emerald-700"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  title="Download Resume"
                >
                  <Download size={24} />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Hero Image (simplified) */}
            <motion.div
              variants={homeItemVariants}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto">
                <motion.div
                  className="w-full h-full rounded-full overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.img
                    src={profileImg}
                    alt="Selvapujith T - Data Science Enthusiast"
                    className="w-full h-full object-cover block"
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Quick Stats */}
      <motion.section 
        className="py-16 bg-white dark:bg-gray-800"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Projects Completed', value: `${stats.projects}+` },
              { label: 'Technologies Mastered', value: '10+' },
              { label: 'CGPA (Current)', value: '8.6' },
              { label: 'Certifications', value: `${stats.certificates}+` },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;