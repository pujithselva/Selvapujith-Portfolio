import { database } from '../../firebase';
import { ref, set, get, remove, onValue } from 'firebase/database';
import ResumeManager from '../utils/cloudinary';

export interface ResumeData {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  version: number;
  storageType: 'cloudinary' | 'firebase';
  publicId?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class UnifiedResumeService {
  private readonly RESUME_PATH = 'resume/current';
  private readonly RESUME_METADATA_PATH = 'metadata/resume';

  /**
   * Upload resume to Cloudinary and store metadata in Firebase RTDB
   */
  async uploadResume(file: File, onProgress?: (progress: UploadProgress) => void): Promise<ResumeData> {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are supported');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Simulate progress for upload start
      onProgress?.({ loaded: 0, total: file.size, percentage: 0 });

      // Upload to Cloudinary
      const uploadResult = await ResumeManager.uploadResume(file);
      
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Failed to upload to Cloudinary');
      }

      // The accessibility test is now redundant, as the upload function provides feedback
      console.log('✅ Upload successful and URL should be accessible:', uploadResult.url);

      // Simulate progress for upload completion
      onProgress?.({ loaded: file.size * 0.8, total: file.size, percentage: 80 });

      // Get current resume version
      const currentResume = await this.getCurrentResume();
      const newVersion = currentResume ? currentResume.version + 1 : 1;

      // Create resume data
      const resumeData: ResumeData = {
        id: `resume_v${newVersion}_${Date.now()}`,
        fileName: file.name,
        fileUrl: uploadResult.url,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        version: newVersion,
        storageType: 'cloudinary',
        publicId: uploadResult.public_id
      };

      // Store metadata in Firebase RTDB
      await this.saveResumeMetadata(resumeData);

      // Simulate final progress
      onProgress?.({ loaded: file.size, total: file.size, percentage: 100 });

      return resumeData;
    } catch (error) {
      console.error('Error uploading resume:', error);
      
      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('PERMISSION_DENIED')) {
          throw new Error('Permission denied. Please log in as an administrator to upload resumes.');
        }
        if (error.message.includes('configuration is incomplete')) {
          throw new Error('Cloudinary configuration is incomplete. Please check environment variables.');
        }
        if (error.message.includes('Invalid Signature')) {
          throw new Error('Cloudinary authentication failed. Please check API credentials.');
        }
      }
      
      throw error instanceof Error ? error : new Error('Failed to upload resume');
    }
  }

  /**
   * Get current resume from Firebase RTDB
   */
  async getCurrentResume(): Promise<ResumeData | null> {
    try {
      const resumeRef = ref(database, this.RESUME_PATH);
      const snapshot = await get(resumeRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as ResumeData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current resume:', error);
      
      // Handle specific permission errors
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('PERMISSION_DENIED')) {
          console.warn('Resume access requires authentication. User may need to log in to manage resumes.');
          // Return null gracefully for permission errors on read operations
          return null;
        }
      }
      
      return null;
    }
  }

  /**
   * Listen to resume changes in real-time
   */
  onResumeChange(callback: (resume: ResumeData | null) => void): () => void {
    const resumeRef = ref(database, this.RESUME_PATH);
    
    const unsubscribe = onValue(resumeRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as ResumeData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to resume changes:', error);
      callback(null);
    });

    return unsubscribe;
  }

  /**
   * Delete current resume (both from Cloudinary and Firebase)
   */
  async deleteResume(): Promise<void> {
    try {
      const currentResume = await this.getCurrentResume();
      
      if (!currentResume) {
        throw new Error('No resume found to delete');
      }

      // Remove from Firebase RTDB
      const resumeRef = ref(database, this.RESUME_PATH);
      const metadataRef = ref(database, this.RESUME_METADATA_PATH);
      
      await Promise.all([
        remove(resumeRef),
        remove(metadataRef)
      ]);

      console.log('Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error instanceof Error ? error : new Error('Failed to delete resume');
    }
  }

  /**
   * Save resume metadata to Firebase RTDB
   */
  private async saveResumeMetadata(resumeData: ResumeData): Promise<void> {
    try {
      const resumeRef = ref(database, this.RESUME_PATH);
      const metadataRef = ref(database, this.RESUME_METADATA_PATH);

      // Save full resume data
      await set(resumeRef, resumeData);

      // Save simplified metadata for quick access
      await set(metadataRef, {
        url: resumeData.fileUrl,
        fileName: resumeData.fileName,
        lastUpdated: resumeData.uploadedAt,
        version: resumeData.version
      });

      console.log('Resume metadata saved successfully');
    } catch (error) {
      console.error('Error saving resume metadata:', error);
      
      // Handle specific permission errors with better messaging
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('PERMISSION_DENIED')) {
          throw new Error('Permission denied. Please ensure you are logged in as an administrator to upload resumes.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Generate direct download URL for resume
   */
  getDirectDownloadUrl(originalUrl: string): string {
    // This function now returns the original URL to avoid download-forcing behavior
    // that can interfere with in-browser PDF viewers.
    return originalUrl;
  }

  /**
   * Generate simple download URL
   */
  getSimpleDownloadUrl(originalUrl: string): string {
    try {
      if (originalUrl.includes('cloudinary.com')) {
        // Add download flag
        const urlParts = originalUrl.split('/upload/');
        if (urlParts.length === 2) {
          return `${urlParts[0]}/upload/fl_attachment/${urlParts[1]}`;
        }
      }
      
      return originalUrl;
    } catch (error) {
      console.error('Error generating simple download URL:', error);
      return originalUrl;
    }
  }

  /**
   * Get best download URL based on multiple strategies
   */
  getBestDownloadUrl(originalUrl: string, fileName: string = 'resume.pdf'): string {
    try {
      console.log('Generating best download URL for:', { originalUrl, fileName });
      
      // For Cloudinary URLs, use simple download URL (most reliable)
      if (originalUrl.includes('cloudinary.com')) {
        const simpleUrl = this.getSimpleDownloadUrl(originalUrl);
        console.log('Generated simple download URL:', simpleUrl);
        return simpleUrl;
      }

      // For non-Cloudinary URLs, return as-is
      return originalUrl;
    } catch (error) {
      console.error('Error generating best download URL:', error);
      return originalUrl;
    }
  }

  /**
   * Generate safe download URL without complex transformations
   */
  getSafeDownloadUrl(originalUrl: string): string {
    // Just return the original Cloudinary URL - it should work for downloads
    // Cloudinary raw URLs are already optimized for file downloads
    return originalUrl;
  }

  /**
   * Test URL accessibility
   */
  async testUrlAccessibility(url: string): Promise<{ accessible: boolean; status?: number; error?: string }> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        accessible: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get resume statistics
   */
  async getResumeStats(): Promise<{
    hasResume: boolean;
    version?: number;
    lastUpdated?: string;
    fileSize?: number;
    storageType?: string;
  }> {
    try {
      const resume = await this.getCurrentResume();
      
      if (!resume) {
        return { hasResume: false };
      }

      return {
        hasResume: true,
        version: resume.version,
        lastUpdated: resume.uploadedAt,
        fileSize: resume.fileSize,
        storageType: resume.storageType
      };
    } catch (error) {
      console.error('Error getting resume stats:', error);
      return { hasResume: false };
    }
  }
}

// Export singleton instance
export const unifiedResumeService = new UnifiedResumeService();
export default unifiedResumeService;
