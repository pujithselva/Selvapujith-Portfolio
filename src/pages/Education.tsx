
import { motion } from 'framer-motion';
import { GraduationCap, Calendar, MapPin, Award, TrendingUp } from 'lucide-react';

const Education = () => {
  const educationData = [
    {
      id: 1,
      degree: 'M.Sc. Data Science & Business Analysis',
      institution: 'Rathinam College of Arts and Science',
      university: 'Bharathiyar University',
      duration: '2026 – Pursuing',
      cgpa: '8.6',
      status: 'Current',
      description: 'Advanced studies in data science methodologies, business analytics, and machine learning applications. Focus on statistical modeling, predictive analytics, and data-driven decision making.',
      highlights: [
        'Advanced Machine Learning Algorithms',
        'Business Intelligence & Analytics',
        'Statistical Modeling & Hypothesis Testing',
        'Big Data Technologies',
        'Research Methodology'
      ]
    },
    {
      id: 2,
      degree: 'B.Sc. Computer Science',
      institution: 'Muthayammal College of Arts and Science',
      university: 'Periyar University',
      duration: '2021 – 2024',
      cgpa: '7.1',
      status: 'Completed',
      description: 'Comprehensive undergraduate program covering fundamental computer science concepts, programming languages, and software development principles.',
      highlights: [
        'Programming Languages (Python, Java, C++)',
        'Database Management Systems',
        'Software Engineering Principles',
        'Data Structures & Algorithms',
        'Web Technologies'
      ]
    }
  ];

  const achievements = [
    {
      title: 'Academic Excellence',
      description: 'Maintaining consistent academic performance with current CGPA of 8.6',
      icon: <Award size={24} />
    },
    {
      title: 'Research Projects',
      description: 'Completed multiple research projects in machine learning and data analysis',
      icon: <TrendingUp size={24} />
    },
    {
      title: 'Practical Experience',
      description: 'Hands-on experience with industry-standard tools and technologies',
      icon: <GraduationCap size={24} />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
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
    <section id="education" className="min-h-screen py-20 bg-white dark:bg-gray-800">
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
            Educational Journey
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Academic foundation in computer science and data science with continuous learning
          </p>
        </motion.div>

        {/* Education Timeline */}
        <div className="relative">
          <div className="space-y-16">
            {educationData.map((edu, index) => (
              <motion.div
                key={edu.id}
                className={`flex flex-col md:flex-row items-start md:items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                variants={itemVariants}
              >
                {/* Content */}
                <div className={`flex-1 ml-16 md:ml-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        edu.status === 'Current' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {edu.status}
                      </span>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={16} />
                        <span className="text-sm">{edu.duration}</span>
                      </div>
                    </div>

                    {/* Degree Info */}
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                      {edu.degree}
                    </h2>
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <GraduationCap size={16} />
                        <span>{edu.institution}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <MapPin size={16} />
                        <span>{edu.university}</span>
                      </div>
                    </div>

                    {/* CGPA */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">CGPA</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{edu.cgpa}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(parseFloat(edu.cgpa) / 10) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      {edu.description}
                    </p>

                    {/* Key Highlights */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Key Areas of Study
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2">
                        {edu.highlights.map((highlight, idx) => (
                          <motion.div
                            key={highlight}
                            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                            <span>{highlight}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <motion.div 
          variants={itemVariants}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12">
            Academic Achievements
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-xl text-center"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                  {achievement.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {achievement.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Current Focus */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Currently Pursuing</h2>
          <p className="text-xl mb-6 opacity-90">
            Advanced research in Machine Learning and Business Analytics
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">2026</div>
              <div className="opacity-80">Expected Graduation</div>
            </div>
            <div>
              <div className="text-2xl font-bold">8.6</div>
              <div className="opacity-80">Current CGPA</div>
            </div>
            <div>
              <div className="text-2xl font-bold">15+</div>
              <div className="opacity-80">Research Projects</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Education;