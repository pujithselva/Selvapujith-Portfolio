import React, { useState } from 'react';
import ResumeManager from '../utils/cloudinary';

const CloudinaryTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testCloudinaryConfig = async () => {
    setTesting(true);
    setResults(null);

    const testResults = {
      config: {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        hasApiSecret: !!import.meta.env.VITE_CLOUDINARY_API_SECRET
      },
      tests: {} as any
    };

    // Test 1: Check if environment variables are set
    testResults.tests.envVars = {
      success: !!(testResults.config.cloudName && testResults.config.uploadPreset),
      details: testResults.config
    };

    // Test 2: Test a known public URL format
    const publicUrl = ResumeManager.getPublicUrl('resume/Selvapujith_Resume');
    if (publicUrl) {
      try {
        const urlTest = await ResumeManager.testUrlAccessibility(publicUrl);
        testResults.tests.publicUrl = {
          url: publicUrl,
          accessible: urlTest.accessible,
          status: urlTest.status,
          error: urlTest.error
        };
      } catch (error) {
        testResults.tests.publicUrl = {
          url: publicUrl,
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test 3: Try uploading a small test file
    try {
      // Create a small test PDF blob
      const testContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF';
      const testBlob = new Blob([testContent], { type: 'application/pdf' });
      const testFile = new File([testBlob], 'test.pdf', { type: 'application/pdf' });

      const uploadResult = await ResumeManager.uploadResume(testFile);
      testResults.tests.upload = uploadResult;

      if (uploadResult.success && uploadResult.url) {
        // Test the uploaded URL
        const uploadedUrlTest = await ResumeManager.testUrlAccessibility(uploadResult.url);
        testResults.tests.uploadedUrl = {
          url: uploadResult.url,
          accessible: uploadedUrlTest.accessible,
          status: uploadedUrlTest.status,
          error: uploadedUrlTest.error
        };
      }
    } catch (error) {
      testResults.tests.upload = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Cloudinary Configuration Test</h2>
      
      <div className="mb-4">
        <button
          onClick={testCloudinaryConfig}
          disabled={testing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Run Cloudinary Test'}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Configuration</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
              <p><strong>Cloud Name:</strong> {results.config.cloudName || 'NOT SET'}</p>
              <p><strong>API Key:</strong> {results.config.apiKey || 'NOT SET'}</p>
              <p><strong>Upload Preset:</strong> {results.config.uploadPreset || 'NOT SET'}</p>
              <p><strong>Has API Secret:</strong> {results.config.hasApiSecret ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Test Results</h3>
            
            {/* Environment Variables Test */}
            <div className="mb-3 p-3 border rounded">
              <div className="font-medium">Environment Variables</div>
              <div className={`text-sm ${results.tests.envVars.success ? 'text-green-600' : 'text-red-600'}`}>
                {results.tests.envVars.success ? '✅ All required variables set' : '❌ Missing required variables'}
              </div>
            </div>

            {/* Public URL Test */}
            {results.tests.publicUrl && (
              <div className="mb-3 p-3 border rounded">
                <div className="font-medium">Public URL Test</div>
                <div className="text-xs break-all mb-2 font-mono bg-gray-50 dark:bg-gray-700 p-1 rounded">
                  {results.tests.publicUrl.url}
                </div>
                <div className={`text-sm ${results.tests.publicUrl.accessible ? 'text-green-600' : 'text-red-600'}`}>
                  {results.tests.publicUrl.accessible ? '✅ URL Accessible' : `❌ URL Not Accessible (${results.tests.publicUrl.status || 'Network Error'})`}
                </div>
                {results.tests.publicUrl.error && (
                  <div className="text-xs text-red-500 mt-1">Error: {results.tests.publicUrl.error}</div>
                )}
              </div>
            )}

            {/* Upload Test */}
            {results.tests.upload && (
              <div className="mb-3 p-3 border rounded">
                <div className="font-medium">Upload Test</div>
                <div className={`text-sm ${results.tests.upload.success ? 'text-green-600' : 'text-red-600'}`}>
                  {results.tests.upload.success ? '✅ Upload Successful' : '❌ Upload Failed'}
                </div>
                {results.tests.upload.error && (
                  <div className="text-xs text-red-500 mt-1">Error: {results.tests.upload.error}</div>
                )}
                {results.tests.upload.url && (
                  <div className="text-xs break-all mt-1 font-mono bg-gray-50 dark:bg-gray-700 p-1 rounded">
                    {results.tests.upload.url}
                  </div>
                )}
              </div>
            )}

            {/* Uploaded URL Test */}
            {results.tests.uploadedUrl && (
              <div className="mb-3 p-3 border rounded">
                <div className="font-medium">Uploaded URL Test</div>
                <div className={`text-sm ${results.tests.uploadedUrl.accessible ? 'text-green-600' : 'text-red-600'}`}>
                  {results.tests.uploadedUrl.accessible ? '✅ Uploaded URL Accessible' : `❌ Uploaded URL Not Accessible (${results.tests.uploadedUrl.status || 'Network Error'})`}
                </div>
                {results.tests.uploadedUrl.error && (
                  <div className="text-xs text-red-500 mt-1">Error: {results.tests.uploadedUrl.error}</div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
            <h4 className="font-semibold mb-2">Recommendations:</h4>
            <ul className="text-sm space-y-1">
              {!results.config.cloudName && <li>❌ Set VITE_CLOUDINARY_CLOUD_NAME in your .env file</li>}
              {!results.config.uploadPreset && <li>❌ Set VITE_CLOUDINARY_UPLOAD_PRESET in your .env file</li>}
              {results.tests.upload?.success && !results.tests.uploadedUrl?.accessible && (
                <li>❌ Upload succeeds but files are not publicly accessible. Check your Cloudinary upload preset settings to enable public access.</li>
              )}
              {results.tests.uploadedUrl?.status === 401 && (
                <li>❌ 401 Unauthorized: Your upload preset may not allow public access. Go to Cloudinary Console → Settings → Upload → Edit your preset → Set "Resource access mode" to "Public"</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryTest;
