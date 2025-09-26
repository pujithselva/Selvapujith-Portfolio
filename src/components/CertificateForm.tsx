import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../../firebase';
import { ref, push, set, update } from 'firebase/database';
import ResumeManager from '../utils/cloudinary';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText, Award, Link2, Check, AlertCircle } from 'lucide-react';

interface Certificate {
  id?: string;
  title: string;
  issuer: string;
  date?: string;
  description?: string;
  credentialUrl?: string;
  fileUrl?: string;
}

interface CertificateFormProps {
  certificateToEdit?: Certificate | null;
  onFormSubmit: () => void;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ certificateToEdit, onFormSubmit }) => {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [description, setDescription] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (certificateToEdit) {
      setTitle(certificateToEdit.title);
      setIssuer(certificateToEdit.issuer);
      setDescription(certificateToEdit.description || '');
      setCredentialUrl(certificateToEdit.credentialUrl || '');
    } else {
      // Reset form
      setTitle('');
      setIssuer('');
      setDescription('');
      setCredentialUrl('');
      setCertificateFile(null);
    }
  }, [certificateToEdit]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) newErrors.title = 'Certificate title is required';
    if (!issuer.trim()) newErrors.issuer = 'Issuer is required';
    if (!certificateFile && !certificateToEdit?.fileUrl) {
      newErrors.file = 'Certificate file is required';
    }
    if (credentialUrl && !isValidUrl(credentialUrl)) {
      newErrors.credentialUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors({...errors, file: 'File size must be less than 10MB'});
        return;
      }
      setCertificateFile(file);
      setErrors({...errors, file: ''});
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrors({...errors, file: 'File size must be less than 10MB'});
        return;
      }
      setCertificateFile(file);
      setErrors({...errors, file: ''});
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    
    if (!isAuthenticated) {
      setErrors({submit: 'You must be logged in to save certificates.'});
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let fileUrl = certificateToEdit?.fileUrl || '';

    if (certificateFile) {
      try {
        const uploadResult = await ResumeManager.uploadToCloudinary(certificateFile, 'certificates');
        if (uploadResult.success && uploadResult.url) {
          fileUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Cloudinary upload failed');
        }
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        if (errorMessage.includes('configuration is incomplete')) {
          alert('Cloudinary configuration is missing. Please check your environment variables.');
        } else if (errorMessage.includes('Invalid Signature')) {
          alert('Cloudinary authentication failed. Please check your API credentials.');
        } else {
          alert(`Error uploading file: ${errorMessage}`);
        }
        
        setIsUploading(false);
        return;
      }
    }

    const certificateData: Omit<Certificate, 'id'> = {
      title,
      issuer,
      description,
      credentialUrl,
      fileUrl,
    };

    try {
      if (certificateToEdit?.id) {
        await update(ref(database, `certificates/${certificateToEdit.id}`), certificateData);
      } else {
        const newCertificateRef = push(ref(database, 'certificates'));
        await set(newCertificateRef, certificateData);
      }
      setSuccessMessage('Certificate saved successfully!');
      setTimeout(() => {
        onFormSubmit();
      }, 1500);
    } catch (error) {
      console.error('Error saving certificate to Firebase:', error);
      setErrors({submit: 'Failed to save certificate. Please try again.'});
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4"
          >
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-200">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{errors.submit}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Certificate Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Award className="w-4 h-4 inline mr-2" />
            Certificate Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.title 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
            } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none`}
            placeholder="e.g., React Developer Certification"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Issuer */}
        <div>
          <label htmlFor="issuer" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Issuing Organization *
          </label>
          <input
            type="text"
            id="issuer"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.issuer 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
            } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none`}
            placeholder="e.g., Meta, Google, Microsoft"
          />
          {errors.issuer && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.issuer}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
            placeholder="Brief description of what this certification covers..."
          />
        </div>

        {/* Credential URL */}
        <div>
          <label htmlFor="credentialUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Link2 className="w-4 h-4 inline mr-2" />
            Credential URL (Optional)
          </label>
          <input
            type="url"
            id="credentialUrl"
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.credentialUrl 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
            } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none`}
            placeholder="https://verify.example.com/certificate/12345"
          />
          {errors.credentialUrl && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.credentialUrl}</p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Upload className="w-4 h-4 inline mr-2" />
            Certificate File *
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : errors.file
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              id="certificateFile"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              {certificateFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {certificateFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(certificateFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : certificateToEdit?.fileUrl ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current file will be kept (upload new file to replace)
                </p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drop your certificate file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports: Images (JPG, PNG) and PDF files (Max: 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>
          {errors.file && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.file}</p>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isUploading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
          whileHover={!isUploading ? { scale: 1.02 } : {}}
          whileTap={!isUploading ? { scale: 0.98 } : {}}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Uploading...
            </div>
          ) : (
            certificateToEdit ? 'Update Certificate' : 'Add Certificate'
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default CertificateForm;
