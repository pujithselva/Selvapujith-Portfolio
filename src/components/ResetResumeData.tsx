import React, { useState } from 'react';
import { ref, remove } from 'firebase/database';
import { database } from '../../firebase';
import logger from '../utils/logger';

const ResetResumeData: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to delete all resume data? This will remove the resume from Firebase but NOT from Cloudinary.')) {
      return;
    }

    setIsDeleting(true);
    setMessage('');

    try {
      // Delete the resume data from Firebase
      const resumeRef = ref(database, 'resume');
      await remove(resumeRef);
      
      logger.info('reset-resume-data', 'Resume data deleted from Firebase');
      setMessage('✅ Resume data successfully deleted from Firebase. You can now upload a new resume with the updated preset.');
    } catch (error) {
      logger.error('reset-resume-data', 'Failed to delete resume data:', error);
      setMessage('❌ Failed to delete resume data. Check console for details.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Reset Resume Data</h3>
        <p className="text-yellow-700 text-sm mb-4">
          This will delete the current resume metadata from Firebase. The actual file will remain in Cloudinary.
          Use this if you want to start fresh with your new upload preset.
        </p>
        
        <button
          onClick={handleReset}
          disabled={isDeleting}
          className={`px-4 py-2 rounded text-white font-medium ${
            isDeleting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isDeleting ? 'Deleting...' : 'Delete Resume Data'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ResetResumeData;
