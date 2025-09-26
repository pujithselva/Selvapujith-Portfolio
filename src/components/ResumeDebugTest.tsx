import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';
import ResumeManager from '../utils/cloudinary';

const ResumeDebugTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [uploadTest, setUploadTest] = useState<any>(null);

  const runConfigurationTest = async () => {
    setTesting(true);
    setTestResults(null);

    const results = {
      environment: {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!import.meta.env.VITE_CLOUDINARY_API_KEY,
        hasApiSecret: !!import.meta.env.VITE_CLOUDINARY_API_SECRET,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      },
      tests: {} as any
    };

    // Test environment validation
    results.tests.unsignedValidation = {
      valid: !!(results.environment.cloudName && results.environment.uploadPreset),
      message: 'Unsigned upload environment check'
    };

    results.tests.signedValidation = {
      valid: !!(results.environment.cloudName && results.environment.hasApiKey && results.environment.hasApiSecret),
      message: 'Signed upload environment check'
    };

    // Test URL generation
    const testUrl = ResumeManager.getPublicUrl('test-resume', 'raw');
    results.tests.urlGeneration = {
      valid: !!testUrl,
      url: testUrl,
      message: 'URL generation test'
    };

    // Test URL accessibility (if we have a known URL)
    if (testUrl) {
      try {
        const accessTest = await ResumeManager.testUrlAccessibility(testUrl);
        results.tests.urlAccessibility = {
          ...accessTest,
          message: 'URL accessibility test (expected to fail for non-existent file)'
        };
      } catch (error) {
        results.tests.urlAccessibility = {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'URL accessibility test failed'
        };
      }
    }

    setTestResults(results);
    setTesting(false);
  };

  const handleTestUpload = async (file: File) => {
    setUploadTest({ status: 'uploading', message: 'Testing resume upload...' });

    try {
      const result = await ResumeManager.uploadResume(file);
      
      setUploadTest({
        status: result.success ? 'success' : 'error',
        message: result.success ? 'Upload test successful!' : `Upload failed: ${result.error}`,
        result: result
      });
    } catch (error) {
      setUploadTest({
        status: 'error',
        message: `Upload test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadTest({
          status: 'error',
          message: 'Please select a PDF file for testing'
        });
        return;
      }
      handleTestUpload(file);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Resume Upload Debug Tool
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Test and debug Cloudinary configuration and resume upload functionality
        </p>
      </div>

      {/* Configuration Test */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white">Configuration Test</h4>
          <button
            onClick={runConfigurationTest}
            disabled={testing}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {testing ? 'Testing...' : 'Run Test'}
          </button>
        </div>

        {testResults && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Environment Variables</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  {testResults.environment.cloudName ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span>Cloud Name: {testResults.environment.cloudName || 'Missing'}</span>
                </div>
                <div className="flex items-center">
                  {testResults.environment.hasApiKey ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span>API Key: {testResults.environment.hasApiKey ? 'Set' : 'Missing'}</span>
                </div>
                <div className="flex items-center">
                  {testResults.environment.hasApiSecret ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span>API Secret: {testResults.environment.hasApiSecret ? 'Set' : 'Missing'}</span>
                </div>
                <div className="flex items-center">
                  {testResults.environment.uploadPreset ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span>Upload Preset: {testResults.environment.uploadPreset || 'Missing'}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Validation Tests</h5>
              <div className="space-y-2 text-sm">
                {Object.entries(testResults.tests).map(([key, test]: [string, any]) => (
                  <div key={key} className="flex items-center">
                    {test.valid || test.accessible ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span>{test.message}</span>
                    {test.url && (
                      <span className="ml-2 text-gray-500 text-xs truncate">
                        ({test.url})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Test */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white">Upload Test</h4>
          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="debug-file-input"
            />
            <label
              htmlFor="debug-file-input"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors inline-flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Test Upload PDF
            </label>
          </div>
        </div>

        {uploadTest && (
          <div className={`rounded-lg p-4 ${
            uploadTest.status === 'success' 
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : uploadTest.status === 'error'
              ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
              : 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
          }`}>
            <div className="flex items-center">
              {uploadTest.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500 mr-2" />}
              {uploadTest.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500 mr-2" />}
              {uploadTest.status === 'uploading' && <Info className="w-5 h-5 text-blue-500 mr-2" />}
              <span className={`font-medium ${
                uploadTest.status === 'success' ? 'text-green-800 dark:text-green-200' :
                uploadTest.status === 'error' ? 'text-red-800 dark:text-red-200' :
                'text-blue-800 dark:text-blue-200'
              }`}>
                {uploadTest.message}
              </span>
            </div>
            
            {uploadTest.result && (
              <div className="mt-3 text-sm space-y-1">
                <div><strong>Success:</strong> {uploadTest.result.success ? 'Yes' : 'No'}</div>
                {uploadTest.result.url && (
                  <div>
                    <strong>URL:</strong> 
                    <a 
                      href={uploadTest.result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 ml-1 underline break-all"
                    >
                      {uploadTest.result.url}
                    </a>
                  </div>
                )}
                {uploadTest.result.public_id && (
                  <div><strong>Public ID:</strong> {uploadTest.result.public_id}</div>
                )}
                {uploadTest.result.error && (
                  <div><strong>Error:</strong> {uploadTest.result.error}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Troubleshooting Tips</h5>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• If unsigned upload fails, check if your upload preset allows public access</li>
          <li>• If signed upload fails, verify your API credentials</li>
          <li>• Check the browser console for detailed error logs</li>
          <li>• Ensure your Cloudinary account has sufficient quota</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeDebugTest;
