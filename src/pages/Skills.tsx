import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Database, BarChart3, Brain, Zap, Monitor } from 'lucide-react';

interface Skill {
  name: string;
  color: string;
}

interface SkillCategory {
  icon: React.ReactElement;
  title: string;
  skills: Skill[];
}

interface SkillCategories {
  [key: string]: SkillCategory;
}

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('programming');

  const skillCategories: SkillCategories = {
    programming: {
      icon: <Code size={24} />,
      title: 'Programming Languages',
      skills: [
        { name: 'Python', color: 'from-blue-500 to-blue-600' },
        { name: 'SQL', color: 'from-purple-500 to-purple-600' },
        { name: 'R', color: 'from-teal-500 to-teal-600' },
      ]
    },
    dataScience: {
      icon: <BarChart3 size={24} />,
      title: 'Data Science Libraries',
      skills: [
        { name: 'Pandas', color: 'from-green-500 to-green-600' },
        { name: 'NumPy', color: 'from-orange-500 to-orange-600' },
        { name: 'Matplotlib', color: 'from-red-500 to-red-600' },
        { name: 'Seaborn', color: 'from-pink-500 to-pink-600' },
      ]
    },
    machineLearning: {
      icon: <Brain size={24} />,
      title: 'Machine Learning',
      skills: [
        { name: 'Scikit-Learn', color: 'from-indigo-500 to-indigo-600' },
        { name: 'TensorFlow', color: 'from-yellow-500 to-yellow-600' },
        { name: 'Regression', color: 'from-cyan-500 to-cyan-600' },
        { name: 'Classification', color: 'from-lime-500 to-lime-600' },
        { name: 'Clustering', color: 'from-violet-500 to-violet-600' },
      ]
    },
    visualization: {
      icon: <Monitor size={24} />,
      title: 'Data Visualization',
      skills: [
        { name: 'Power BI', color: 'from-amber-500 to-amber-600' },
        { name: 'Matplotlib', color: 'from-emerald-500 to-emerald-600' },
        { name: 'Excel', color: 'from-green-500 to-green-600' },
        { name: 'Tableau', color: 'from-blue-500 to-blue-600' },
      ]
    },
    databases: {
      icon: <Database size={24} />,
      title: 'Databases',
      skills: [
        { name: 'MySQL', color: 'from-blue-500 to-cyan-500' },
        { name: 'DBMS', color: 'from-purple-500 to-pink-500' },
      ]
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <section id="skills" className="min-h-screen py-20 bg-white dark:bg-gray-800">
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
            Technical Skills
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive expertise across data science technologies and methodologies
          </p>
        </motion.div>

        {/* Category Navigation */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(skillCategories).map(([key, category]) => (
              <motion.button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeCategory === key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.icon}
                <span>{category.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Skills Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
                {skillCategories[activeCategory].icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                {skillCategories[activeCategory].title}
              </h2>
            </div>

            <div className="flex flex-wrap gap-4">
              {skillCategories[activeCategory].skills.map((skill: Skill, index: number) => (
                <motion.div
                  key={skill.name}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${skill.color}`}></div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {skill.name}
                  </h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Additional Skills Summary */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 grid md:grid-cols-3 gap-8"
        >
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Core Strengths
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Statistical Analysis, Predictive Modeling, Data Visualization, Automation
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-500 to-green-600 rounded-full flex items-center justify-center text-white">
              <Brain size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Specializations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              NLP, Computer Vision, Time Series Analysis, Deep Learning
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white">
              <BarChart3 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Tools & Platforms
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Jupyter, PyCharm, Power BI, Git, Docker, AWS, Google Colab
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Skills;