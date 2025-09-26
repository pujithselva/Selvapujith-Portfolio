import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, ExternalLink, Download } from 'lucide-react';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  fileUrl: string;
  filePublicId?: string; // Optional public ID for Cloudinary
  mediaType?: 'image' | 'video';
  skills: string[];
  credentialId: string;
  verifyUrl: string;
}

// Helper function to generate Cloudinary URL
const getCloudinaryFileUrl = (fileUrl: string, publicId?: string): string => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  console.log('getCloudinaryFileUrl called with:', { fileUrl, publicId, cloudName });
  
  // If we have a valid URL, use it
  if (fileUrl && (fileUrl.startsWith('http') || fileUrl.startsWith('https'))) {
    console.log('Using existing URL:', fileUrl);
    return fileUrl;
  }
  
  // If we have a public ID, generate Cloudinary URL
  if (publicId && cloudName) {
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/v1/certificates/${publicId}`;
    console.log('Generated URL from publicId:', url);
    return url;
  }
  
  // If fileUrl looks like a public ID, generate Cloudinary URL
  if (fileUrl && cloudName && !fileUrl.includes('/') && fileUrl.trim().length > 0) {
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/v1/certificates/${fileUrl}`;
    console.log('Generated URL from fileUrl as publicId:', url);
    return url;
  }
  
  // If no cloudName but we have a fileUrl, try to use it anyway
  if (fileUrl && fileUrl.trim().length > 0) {
    console.log('Using fileUrl as-is (no cloudName):', fileUrl);
    return fileUrl;
  }
  
  console.log('No valid file URL could be generated');
  // Return empty string if no valid image found
  return '';
};

const Certificates = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = () => {
      setIsLoading(true);
      try {
        const certificatesRef = ref(database, 'certificates');
        onValue(certificatesRef, (snapshot) => {
          const data = snapshot.val();
          console.log('Raw certificate data from Firebase:', data);
          if (data) {
            const certsData = Object.keys(data).map(key => {
              const cert = data[key];
              const fileUrl = getCloudinaryFileUrl(cert.fileUrl, cert.filePublicId);
              console.log(`Certificate ${key}:`, {
                original: cert,
                processedFileUrl: fileUrl
              });
              return {
                id: key,
                ...cert,
                fileUrl: fileUrl
              } as Certificate;
            });
            
            const validCerts = certsData.filter(cert => cert.fileUrl && cert.fileUrl.length > 0);
            console.log('Valid certificates after filtering:', validCerts);
            console.log('Total certificates before filtering:', certsData.length);
            console.log('Valid certificates after filtering:', validCerts.length);
            
            setCertificates(validCerts);
          } else {
            console.log('No certificate data found in Firebase');
            setCertificates([]);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error fetching certificates:", error);
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok.');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const fileExtension = url.split('.').pop() || 'png';
      link.download = `${title.replace(/ /g, '_')}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Could not download the file:', error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <section id="certificates" className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Certifications
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Professional certifications and specialized training in data science and technology
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{certificates.length}+</div>
            <div className="text-gray-600 dark:text-gray-400">Total Certifications</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">5</div>
            <div className="text-gray-600 dark:text-gray-400">Tech Giants</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">2024</div>
            <div className="text-gray-600 dark:text-gray-400">Latest</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">100%</div>
            <div className="text-gray-600 dark:text-gray-400">Verified</div>
          </div>
        </motion.div>

        {/* Certificates Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {isLoading && (
            <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">
              Loading certificates...
            </p>
          )}
          {!isLoading && certificates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                No certificates found or certificates are missing valid images.
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Check the browser console for debugging information.
              </p>
            </div>
          )}
          {certificates.map((certificate) => (
            <motion.div
              key={certificate.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden cursor-pointer group"
              onClick={() => setSelectedCertificate(certificate)}
            >
              <div className="relative">
                {certificate.mediaType === 'video' ? (
                  <video
                    src={certificate.fileUrl}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={certificate.fileUrl}
                    alt={certificate.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6">
                {certificate.date && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{certificate.date}</span>
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {certificate.title}
                </h3>
                
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
                  {certificate.issuer}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {(certificate.skills || []).slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {!!certificate.skills && certificate.skills.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                      +{certificate.skills.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Certificate Modal */}
        <AnimatePresence>
          {selectedCertificate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
              onClick={() => setSelectedCertificate(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  {selectedCertificate.mediaType === 'video' ? (
                    <video
                      src={selectedCertificate.fileUrl}
                      className="w-full h-64 object-cover rounded-t-3xl"
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={selectedCertificate.fileUrl}
                      alt={selectedCertificate.title}
                      className="w-full h-64 object-cover rounded-t-3xl"
                    />
                  )}
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={24} />
                  </button>
                   <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4">
                        {selectedCertificate.date && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar size={16} />
                            <span>Issued: {selectedCertificate.date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
                
                <div className="p-8">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {selectedCertificate.title}
                  </h2>
                  
                  <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-4">
                    {selectedCertificate.issuer}
                  </p>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {selectedCertificate.description}
                  </p>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                      Skills Acquired
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedCertificate.skills || []).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Credential ID:</span>
                      <span className="font-mono text-gray-800 dark:text-gray-200">{selectedCertificate.credentialId}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <motion.a
                      href={selectedCertificate.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ExternalLink size={20} />
                      <span>Verify Certificate</span>
                    </motion.a>
                    <motion.button
                      className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(selectedCertificate.fileUrl, selectedCertificate.title)}
                    >
                      <Download size={20} />
                      <span>Download</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default Certificates;