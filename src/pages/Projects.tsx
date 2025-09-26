import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const projectsRef = ref(database, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <section id="projects" className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-6">
            My Projects
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A showcase of my data science and machine learning projects
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <motion.div 
              key={project.id} 
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl"
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {project.mediaUrl ? (
                  project.mediaType === 'video' ? (
                    <video src={project.mediaUrl} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={project.mediaUrl} alt={project.name} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Media
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technology.split(',').map((tech: string, techIndex: number) => (
                    <span key={techIndex} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No projects available yet.
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default Projects;