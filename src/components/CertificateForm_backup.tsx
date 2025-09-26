import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, push, set, update } from 'firebase/database';
import ResumeManager from '../utils/cloudinary'; // Using ResumeManager for Cloudinary logic

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
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [description, setDescription] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !issuer || (!certificateFile && !certificateToEdit?.fileUrl)) {
      alert('Please fill all required fields and select a file for new certificates.');
      return;
    }

    setIsUploading(true);

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
      onFormSubmit();
    } catch (error) {
      console.error('Error saving certificate to Firebase:', error);
      alert('Failed to save certificate data.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Certificate Title</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issuer</label>
        <input type="text" id="issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
      </div>
      <div>
        <label htmlFor="credentialUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credential URL (Optional)</label>
        <input type="url" id="credentialUrl" value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label htmlFor="certificateFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Certificate File (Image/PDF)</label>
        <input type="file" id="certificateFile" onChange={handleFileChange} accept="image/*,application/pdf" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600" />
      </div>
      <button type="submit" disabled={isUploading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
        {isUploading ? 'Uploading...' : (certificateToEdit ? 'Update Certificate' : 'Add Certificate')}
      </button>
    </form>
  );
};

export default CertificateForm;