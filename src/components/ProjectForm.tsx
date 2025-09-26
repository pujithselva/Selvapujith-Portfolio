import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../../firebase';
import { ref, push, set, update } from 'firebase/database';
import ResumeManager from '../utils/cloudinary';
import { useAuth } from '../contexts/AuthContext';

import { Upload, Code, FileText, Image, Video, Check, AlertCircle, Zap } from 'lucide-react';

interface Project {
  id?: string;
  name: string;
  technology: string;
  description: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  githubUrl?: string;
  liveUrl?: string;
  tags?: string[];
}

interface ProjectFormProps {
  projectToEdit?: Project | null;
  onFormSubmit: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ projectToEdit, onFormSubmit }) => {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [technology, setTechnology] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);



  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setTechnology(projectToEdit.technology);
      setDescription(projectToEdit.description);
      setGithubUrl(projectToEdit.githubUrl || '');
      setLiveUrl(projectToEdit.liveUrl || '');
      setTags(projectToEdit.tags || []);
    } else {
      setName('');
      setTechnology('');
      setDescription('');
      setGithubUrl('');
      setLiveUrl('');
      setTags([]);
    }
  }, [projectToEdit]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) newErrors.name = 'Project name is required';
    if (!technology.trim()) newErrors.technology = 'Technology is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!mediaFile && !projectToEdit?.mediaUrl) {
      newErrors.file = 'Project media is required';
    }
    if (githubUrl && !isValidUrl(githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid GitHub URL';
    }
    if (liveUrl && !isValidUrl(liveUrl)) {
      newErrors.liveUrl = 'Please enter a valid live demo URL';
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

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setErrors({...errors, file: 'File size must be less than 50MB'});
        return;
      }
      setMediaFile(file);
      setErrors({...errors, file: ''});
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.size > 50 * 1024 * 1024) {
        setErrors({...errors, file: 'File size must be less than 50MB'});
        return;
      }
      setMediaFile(file);
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
      setErrors({submit: 'You must be logged in to save projects.'});
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let mediaUrl = projectToEdit?.mediaUrl || '';
    let mediaType: 'image' | 'video' = projectToEdit?.mediaType || 'image';

    if (mediaFile) {
      try {
        const uploadResult = await ResumeManager.uploadToCloudinary(mediaFile, 'portfolio_projects');
        if (uploadResult.success && uploadResult.url) {
          mediaUrl = uploadResult.url;
          mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
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

    // Build project data
    const projectData: any = {
      name,
      technology,
      description,
      githubUrl: githubUrl || null,
      liveUrl: liveUrl || null,
      tags: tags.length > 0 ? tags : null,
    };
    
    if (mediaUrl && mediaUrl.trim() !== '') {
      projectData.mediaUrl = mediaUrl;
      projectData.mediaType = mediaType;
    }

    try {
      if (projectToEdit?.id) {
        await update(ref(database, `projects/${projectToEdit.id}`), projectData);
      } else {
        const newProjectRef = push(ref(database, 'projects'));
        await set(newProjectRef, projectData);
      }
      setSuccessMessage('Project saved successfully!');
      setTimeout(() => {
        onFormSubmit();
      }, 1500);
    } catch (error) {
      console.error('Error saving project to Firebase:', error);
      setErrors({submit: 'Failed to save project. Please try again.'});
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
        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Code className="w-4 h-4 inline mr-2" />
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.name 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
            } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none`}
            placeholder="e.g., E-commerce Website"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Technology Used */}
        <div>
          <label htmlFor="technology" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Zap className="w-4 h-4 inline mr-2" />
            Technology Stack *
          </label>
          <input
            type="text"
            id="technology"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.technology 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
            } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none`}
            placeholder="e.g., React, Node.js, MongoDB"
          />
          {errors.technology && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.technology}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Project Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.description 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
            } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none resize-none`}
            placeholder="Describe your project, its features, and what makes it special..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>

        {/* GitHub URL */}
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            GitHub Repository (Optional)
          </label>
          <input
            type="url"
            id="githubUrl"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.githubUrl 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
            } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none`}
            placeholder="https://github.com/yourusername/project-name"
          />
          {errors.githubUrl && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.githubUrl}</p>
          )}
        </div>

        {/* Live Demo URL */}
        <div>
          <label htmlFor="liveUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Live Demo URL (Optional)
          </label>
          <input
            type="url"
            id="liveUrl"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.liveUrl 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
            } dark:bg-gray-700 dark:text-white focus:ring-2 focus:outline-none`}
            placeholder="https://yourproject.com"
          />
          {errors.liveUrl && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.liveUrl}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tags (Optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:bg-gray-700 dark:text-white"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Upload className="w-4 h-4 inline mr-2" />
            Project Media *
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
              id="media"
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              {mediaFile?.type.startsWith('video') ? (
                <Video className="w-8 h-8 mx-auto text-gray-400" />
              ) : (
                <Image className="w-8 h-8 mx-auto text-gray-400" />
              )}
              {mediaFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {mediaFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : projectToEdit?.mediaUrl ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current media will be kept (upload new file to replace)
                </p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drop your project media here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports: Images (JPG, PNG) and Videos (MP4, MOV) - Max: 50MB
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
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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
            projectToEdit ? 'Update Project' : 'Add Project'
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default ProjectForm;
