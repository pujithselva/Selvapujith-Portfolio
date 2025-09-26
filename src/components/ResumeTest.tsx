import React, { useEffect, useState } from 'react';
import { unifiedResumeService, ResumeData } from '../services/unifiedResumeService';
import { useAuth } from '../contexts/AuthContext';

const ResumeTest: React.FC = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    testResumeAccess();
  }, []);

  const testResumeAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing resume access...');
      console.log('User authenticated:', isAuthenticated);
      console.log('User:', user);
      
      const currentResume = await unifiedResumeService.getCurrentResume();
      setResume(currentResume);
      
      console.log('Resume data:', currentResume);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Resume test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    if (!isAuthenticated) {
      alert('Please log in first to test upload');
      return;
    }

    // Create a test file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          console.log('Testing upload with file:', file.name);
          const result = await unifiedResumeService.uploadResume(file);
          console.log('Upload result:', result);
          setResume(result);
          alert('Upload test successful!');
        } catch (err) {
          console.error('Upload test error:', err);
          alert('Upload test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
      }
    };
    
    input.click();
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Resume Service Test</h2>
      
      <div className="space-y-4">
        <div>
          <strong>Authentication Status:</strong> {isAuthenticated ? '✅ Logged in' : '❌ Not logged in'}
        </div>
        
        <div>
          <strong>User:</strong> {user ? user.email : 'None'}
        </div>
        
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        
        {error && (
          <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div>
          <strong>Current Resume:</strong>
          {resume ? (
            <div className="ml-4 mt-2 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p><strong>ID:</strong> {resume.id}</p>
              <p><strong>File Name:</strong> {resume.fileName}</p>
              <p><strong>Version:</strong> {resume.version}</p>
              <p><strong>Storage:</strong> {resume.storageType}</p>
              <p><strong>Size:</strong> {(resume.fileSize / 1024).toFixed(2)} KB</p>
              <p><strong>Uploaded:</strong> {new Date(resume.uploadedAt).toLocaleString()}</p>
              <p><strong>URL:</strong> <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a></p>
            </div>
          ) : (
            <span className="text-gray-500">No resume found</span>
          )}
        </div>
        
        <div className="flex space-x-4 mt-6">
          <button
            onClick={testResumeAccess}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Test
          </button>
          
          <button
            onClick={testUpload}
            disabled={!isAuthenticated}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Upload
          </button>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          <p>This component tests the resume service functionality:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Reading current resume data</li>
            <li>Authentication status</li>
            <li>Upload functionality (when logged in)</li>
            <li>Error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeTest;
