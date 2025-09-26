import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProjectForm from '../components/ProjectForm';
import CertificateForm from '../components/CertificateForm';
import ResumeManagement from '../components/ResumeManagement';

import Modal from '../components/Modal';
import { database } from '../../firebase';
import { ref, onValue, remove } from 'firebase/database';
import {
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  FileText, 
  Award, 
  Plus,
  Edit,
  Trash2,
  Home,
  Bug
} from 'lucide-react';

const AdminPanel = () => {
  const { user, isAuthenticated, login, loading } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Data states
  const [projects, setProjects] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Project form states
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  // Certificate form states
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<any | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const projectsRef = ref(database, 'projects');
    const certificatesRef = ref(database, 'certificates');

    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsArray = Object.entries(data).map(([id, project]) => ({
          id,
          ...project
        }));
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
      setIsDataLoading(false);
    });

    const unsubscribeCertificates = onValue(certificatesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const certificatesArray = Object.entries(data).map(([id, certificate]) => ({
          id,
          ...certificate
        }));
        setCertificates(certificatesArray);
      } else {
        setCertificates([]);
      }
    });

    return () => {
      unsubscribeProjects();
      unsubscribeCertificates();
    };
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(loginData.email, loginData.password);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await remove(ref(database, `projects/${projectId}`));
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Failed to delete project.');
      }
    }
  };

  const handleProjectFormSubmit = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleAddCertificate = () => {
    setEditingCertificate(null);
    setShowCertificateForm(true);
  };

  const handleEditCertificate = (certificate: any) => {
    setEditingCertificate(certificate);
    setShowCertificateForm(true);
  };

  const handleDeleteCertificate = async (certificateId: string) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await remove(ref(database, `certificates/${certificateId}`));
      } catch (error) {
        console.error('Error deleting certificate:', error);
        setError('Failed to delete certificate.');
      }
    }
  };

  const handleCertificateFormSubmit = () => {
    setShowCertificateForm(false);
    setEditingCertificate(null);
  };

  const tabs = [
    { id: 'projects', name: 'Projects', icon: <FileText size={20} /> },
    { id: 'certificates', name: 'Certificates', icon: <Award size={20} /> },
    { id: 'resume', name: 'Resume', icon: <FileText size={20} /> },
  ];

  // Show loading spinner while Firebase is initializing
  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div 
          className="max-w-md w-full mx-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                Admin Login
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Access the content management system
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="admin@example.com"
                    required
                  />
                  <User size={20} className="absolute left-4 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <Lock size={20} className="absolute left-4 top-3.5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Lock size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </form>
            
            <div className="mt-6 text-center">
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <Home size={16} />
                <span>Back to Home</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Welcome back, {user?.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => navigate('/')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  <Home size={16} />
                  <span>Back to Home</span>
                </motion.button>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Last login: Just now
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'projects' && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Manage Projects
                  </h2>
                  <motion.button
                    onClick={handleAddProject}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={20} />
                    <span>Add Project</span>
                  </motion.button>
                </div>
                
                {isDataLoading && <p className="text-center text-gray-600 dark:text-gray-400">Loading projects...</p>}
                {!isDataLoading && projects.length === 0 && (
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    No projects found. Add a new project to get started.
                  </p>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">Project Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">Technology</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{project.title}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{project.technologies?.join(', ')}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{project.description}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditProject(project)}
                                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Modal
                  isOpen={showProjectForm}
                  onClose={() => setShowProjectForm(false)}
                  title={editingProject ? 'Edit Project' : 'Add New Project'}
                >
                  <ProjectForm
                    project={editingProject}
                    onSubmit={handleProjectFormSubmit}
                    onCancel={() => setShowProjectForm(false)}
                  />
                </Modal>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Manage Certificates
                  </h2>
                  <motion.button
                    onClick={handleAddCertificate}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={20} />
                    <span>Add Certificate</span>
                  </motion.button>
                </div>

                {isDataLoading && <p className="text-center text-gray-600 dark:text-gray-400">Loading certificates...</p>}
                {!isDataLoading && certificates.length === 0 && (
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    No certificates found. Add a new certificate to get started.
                  </p>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">Certificate Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">Issuer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.map((certificate) => (
                        <tr key={certificate.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{certificate.title}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{certificate.issuer}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{certificate.date}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditCertificate(certificate)}
                                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCertificate(certificate.id)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Modal
                  isOpen={showCertificateForm}
                  onClose={() => setShowCertificateForm(false)}
                  title={editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
                >
                  <CertificateForm
                    certificate={editingCertificate}
                    onSubmit={handleCertificateFormSubmit}
                    onCancel={() => setShowCertificateForm(false)}
                  />
                </Modal>
              </div>
            )}

            {activeTab === 'resume' && (
              <ResumeManagement />
            )}

            {activeTab === 'test' && (
              <ResumeTest />
            )}

            {activeTab === 'cloudinary' && (
              <CloudinaryTest />
            )}

            {activeTab === 'reset' && (
              <div className="space-y-6">
                <ResetResumeData />
              </div>
            )}

            {activeTab === 'debug' && (
              <ResumeDebugTest />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;
