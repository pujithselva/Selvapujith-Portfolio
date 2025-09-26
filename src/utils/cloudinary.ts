interface UploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
  statusCode?: number;
  raw?: any;
}

class ResumeManager {
  private static readonly CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  private static readonly API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
  private static readonly API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
  private static readonly UNSIGNED_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Validate required environment variables
  private static validateEnvironment(): boolean {
    if (!this.CLOUD_NAME || !this.API_KEY || !this.API_SECRET) {
      console.error('Missing required Cloudinary env vars. Ensure VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY, VITE_CLOUDINARY_API_SECRET are set.');
      return false;
    }
    return true;
  }

  private static validateEnvironmentUnsigned(): boolean {
    return !!this.CLOUD_NAME && !!this.UNSIGNED_PRESET;
  }

  // Build signature according to Cloudinary signed upload rules
  private static async generateSignature(params: Record<string, string>): Promise<string> {
    const filtered = Object.keys(params)
      .filter(k => params[k] !== undefined && params[k] !== '')
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('&');
    const toSign = filtered + this.API_SECRET;
    const encoder = new TextEncoder();
    const data = encoder.encode(toSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Generic signed upload (image/video/raw/pdf)
  private static async signedUpload(file: File, options: { folder: string; publicId?: string; resourceType?: 'image' | 'video' | 'raw' | 'auto'; overwrite?: boolean; }): Promise<UploadResult> {
    if (!this.validateEnvironment()) {
      return { success: false, error: 'Cloudinary configuration is incomplete' };
    }

    // Determine resource type
    let resourceType: 'image' | 'video' | 'raw' | 'auto';
    if (options.resourceType) {
      resourceType = options.resourceType;
    } else {
      if (file.type === 'application/pdf') {
        resourceType = 'raw';
      } else if (file.type.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.type.startsWith('video/')) {
        resourceType = 'video';
      } else {
        resourceType = 'auto';
      }
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params: Record<string, string> = {
      folder: options.folder,
      timestamp,
    };
    if (options.publicId) params.public_id = options.publicId;
    if (options.overwrite) params.overwrite = 'true';

    const signature = await this.generateSignature(params);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', this.API_KEY);
    Object.entries(params).forEach(([k, v]) => formData.append(k, v));
    formData.append('signature', signature);

    const endpoint = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/${resourceType}/upload`;

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data?.error?.message || 'Upload failed' };
      }
      return { success: true, url: data.secure_url, public_id: data.public_id };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Upload failed' };
    }
  }

  private static async unsignedUpload(file: File, options: { folder: string; publicId?: string; resourceType?: 'image' | 'video' | 'raw' | 'auto' }): Promise<UploadResult> {
    if (!this.validateEnvironmentUnsigned()) {
      return { success: false, error: 'Unsigned preset not configured' };
    }
    let resourceType: 'image' | 'video' | 'raw' | 'auto';
    if (options.resourceType) {
      resourceType = options.resourceType;
    } else {
      if (file.type === 'application/pdf') {
        resourceType = 'raw';
      } else if (file.type.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.type.startsWith('video/')) {
        resourceType = 'video';
      } else {
        resourceType = 'auto';
      }
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.UNSIGNED_PRESET);
    formData.append('folder', options.folder);
    if (options.publicId) formData.append('public_id', options.publicId);

    const endpoint = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/${resourceType}/upload`;
    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data?.error?.message || 'Unsigned upload failed', statusCode: response.status, raw: data };
      }
      return { success: true, url: data.secure_url, public_id: data.public_id, raw: data };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Unsigned upload failed' };
    }
  }

  // Existing uploadToCloudinary now delegates to signedUpload
  public static async uploadToCloudinary(file: File, folder: string): Promise<UploadResult> {
    return this.signedUpload(file, { folder });
  }

  // Resume specific helper with SIGNED upload prioritized
  public static async uploadResume(file: File): Promise<UploadResult> {
    console.log('ResumeManager.uploadResume called with:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudName: this.CLOUD_NAME,
      unsignedPreset: this.UNSIGNED_PRESET,
      hasApiKey: !!this.API_KEY,
      hasApiSecret: !!this.API_SECRET
    });

    // Generate a dynamic public_id
    const timestamp = Date.now();
    const publicId = `resume_${timestamp}`;
    const folder = 'portfolio/resume';

    // TRY SIGNED UPLOAD FIRST (more reliable for public access)
    if (this.validateEnvironment()) {
      console.log('Attempting signed upload (prioritized for reliability)');
      
      const signedResult = await this.signedUpload(file, { 
        folder: folder, 
        publicId: publicId, 
        resourceType: 'raw' 
      });
      
      console.log('Signed upload result:', signedResult);
      
      if (signedResult.success && signedResult.url) {
        return signedResult;
      } else {
        console.warn('Signed upload failed:', signedResult.error);
      }
    }

    // Fallback to unsigned upload if signed fails
    if (this.validateEnvironmentUnsigned()) {
      console.log('Attempting unsigned upload as fallback');
      
      const unsignedResult = await this.unsignedUpload(file, { 
        folder: folder, 
        publicId: publicId, 
        resourceType: 'raw' 
      });
      
      console.log('Unsigned upload result:', unsignedResult);
      
      if (unsignedResult.success && unsignedResult.url) {
        return unsignedResult;
      } else {
        console.warn('Unsigned upload failed:', unsignedResult.error);
      }
    }

    return { 
      success: false, 
      error: `All upload methods failed. Please check your Cloudinary configuration:
      - VITE_CLOUDINARY_CLOUD_NAME: ${this.CLOUD_NAME ? '✓' : '✗'}
      - VITE_CLOUDINARY_API_KEY: ${this.API_KEY ? '✓' : '✗'}
      - VITE_CLOUDINARY_API_SECRET: ${this.API_SECRET ? '✓' : '✗'}
      - VITE_CLOUDINARY_UPLOAD_PRESET: ${this.UNSIGNED_PRESET ? '✓' : '✗'}` 
    };
  }

  // Helper to build a stable delivery URL
  public static getResumeUrl(): string | null {
    if (!this.CLOUD_NAME) return null;
    return `https://res.cloudinary.com/${this.CLOUD_NAME}/raw/upload/portfolio/resume/`;
  }

  // Test if a Cloudinary URL is accessible
  public static async testUrlAccessibility(url: string): Promise<{ accessible: boolean; status?: number; error?: string }> {
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

  // Generate a public URL for a known public_id
  public static getPublicUrl(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'raw'): string | null {
    if (!this.CLOUD_NAME) return null;
    return `https://res.cloudinary.com/${this.CLOUD_NAME}/${resourceType}/upload/${publicId}`;
  }
}

export default ResumeManager;
