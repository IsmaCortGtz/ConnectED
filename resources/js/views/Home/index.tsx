import './home.scss';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import FeatureCard from '@/components/FeatureCard';
import ImageCarousel from '@/components/ImageCarousel';
import { Icon } from '@/components/Icon';
import { useNavigate } from 'react-router';

export default function HomePage() {
  const navigate = useNavigate();
  const videoUrl = '';

  const carouselImages = [
    {
      src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
      alt: 'Students collaborating',
      caption: 'Learn in real-time with your peers'
    },
    {
      src: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200',
      alt: 'Laptop with code',
      caption: 'Master new technological skills'
    },
    {
      src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
      alt: 'Virtual class',
      caption: 'Interact with expert instructors'
    },
    {
      src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200',
      alt: 'Online student',
      caption: 'Flexibility to learn at your own pace'
    }
  ];

  const features = [
    {
      icon: 'video',
      title: 'Live Video Calls',
      description: 'Interactive classes with state-of-the-art WebRTC technology for an immersive experience.'
    },
    {
      icon: 'book',
      title: 'Specialized Courses',
      description: 'Wide variety of courses designed by industry experts to maximize your learning.'
    },
    {
      icon: 'users',
      title: 'Global Community',
      description: 'Connect with students and teachers from around the world, network and collaborate on projects.'
    },
    {
      icon: 'certificate',
      title: 'Certifications',
      description: 'Get recognized certificates that validate your skills and boost your professional career.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Active Students' },
    { value: '500+', label: 'Available Courses' },
    { value: '150+', label: 'Expert Instructors' },
    { value: '95%', label: 'Satisfaction' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className='landing-page-container'>
      <motion.section 
        className='hero-section'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className='hero-content'>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1>
              Learn without limits with
              <span className='brand-text'> ConnectED</span>
            </h1>
          </motion.div>

          <motion.p
            className='hero-description'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The educational platform that revolutionizes online learning with
            real-time video calls, specialized courses and a global community
            of students and teachers.
          </motion.p>

          <motion.div
            className='hero-buttons'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button btnType='filled' btnLevel='primary' onClick={() => navigate("/discover")}>
              Get Started
            </Button>
          </motion.div>
        </div>

        <motion.div
          className='hero-background'
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
          <div className='gradient-orb orb-3'></div>
        </motion.div>
      </motion.section>

      <motion.section 
        className='stats-section'
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className='stats-grid'>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className='stat-card'
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        className='features-section'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why choose ConnectED?
        </motion.h2>
        
        <div className='features-grid'>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </motion.section>

      <motion.section 
        className='video-section'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Experience the future of education
        </motion.h2>

        <motion.div
          className='video-container'
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {videoUrl ? (
            <video 
              controls 
              preload="metadata"
              poster="https://images.unsplash.com/photo-1588072432836-e10032774350?w=1200"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          ) : (
            <div className='video-placeholder'>
              <Icon icon='play' className='play-icon' />
              <p>Video Placeholder</p>
              <span>Coming soon: Interactive platform tour</span>
            </div>
          )}
        </motion.div>
      </motion.section>

      <motion.section 
        className='carousel-section'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Join thousands of successful students
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <ImageCarousel images={carouselImages} autoPlayDelay={5000} />
        </motion.div>
      </motion.section>

      <motion.section 
        className='benefits-section'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className='benefits-content'>
          <motion.div
            className='benefits-text'
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>Learn smarter, not harder</h2>
            <ul className='benefits-list'>
              <motion.li
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Icon icon='check' />
                <span>Unlimited access to all courses</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Icon icon='check' />
                <span>Live sessions with instructors</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Icon icon='check' />
                <span>Downloadable materials and exclusive resources</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Icon icon='check' />
                <span>24/7 support from our community</span>
              </motion.li>
            </ul>
          </motion.div>

          <motion.div
            className='benefits-image'
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' 
              alt='Team collaborating'
            />
          </motion.div>
        </div>
      </motion.section>
    </section>
  );
}