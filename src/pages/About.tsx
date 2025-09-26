import { motion, Variants } from 'framer-motion';
import { Brain, Target, Heart, MapPin, Mail, Phone, Linkedin, Github } from 'lucide-react';
import profileImg from '../assets/profile-image.jpeg';

const About = () => {
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

  const hobbies = [
    { name: 'Traveling', icon: '🌍', description: 'Exploring new places and cultures' },
    { name: 'Exploring', icon: '🔍', description: 'Discovering new technologies and innovations' },
    { name: 'Green Scape', icon: '🌱', description: 'Connecting with nature and sustainability' },
  ];

  const softSkills = [
    { name: 'Critical Thinking', icon: <Brain size={24} /> },
    { name: 'Team Collaboration', icon: <Target size={24} /> },
    { name: 'Problem Solving', icon: <Brain size={24} /> },
    { name: 'Adaptability', icon: <Heart size={24} /> },
  ];

  return (
    <section id="about" className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
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
            About Me
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Passionate Data Science enthusiast with a vision to transform raw data into meaningful insights
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Profile Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Profile Summary
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Data Science Enthusiast specializing in Machine Learning, Predictive Modeling, and Data Analytics. 
                With strong technical skills in Python, SQL, TensorFlow, and Scikit-Learn, I excel in statistical 
                analysis and data visualization. I have proven expertise in developing high-accuracy machine learning 
                models, automating workflows, and building comprehensive dashboards.
              </p>
              <br />
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                My certifications span across Data Science, Machine Learning, and SQL, complemented by hands-on 
                experience in NLP, predictive analytics, and automation. I'm passionate about leveraging data to 
                solve real-world problems and drive intelligent decision-making.
              </p>
            </div>

            {/* Soft Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Soft Skills
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {softSkills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-blue-600 dark:text-blue-400">
                      {skill.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {skill.name}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Hobbies & Interests */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Hobbies & Interests
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {hobbies.map((hobby, index) => (
                  <motion.div
                    key={hobby.name}
                    className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl"
                    whileHover={{ scale: 1.05, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-4xl mb-3">{hobby.icon}</div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {hobby.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {hobby.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Info Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <img 
                    src={profileImg}
                  alt="SelvaPujith T"
                  className="w-full h-full object-cover rounded-full border-4 border-blue-200 dark:border-blue-700"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-2">
                SelvaPujith T
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Data Science Enthusiast
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Mail size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm">selvapujith30@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Phone size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm">+91 9629537579</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm">Bangalore, India</span>
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.a
                  href="https://www.linkedin.com/in/selvapujith/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Linkedin size={20} />
                </motion.a>
                <motion.a
                  href="https://github.com/SELVAPUJITH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github size={20} />
                </motion.a>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Quick Facts
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current CGPA:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">8.6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Projects:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">15+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Certifications:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">8+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">2+ Years</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;