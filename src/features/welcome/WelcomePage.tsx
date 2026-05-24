import { motion } from 'framer-motion';
import WelcomeForm from './components/WelcomeForm';
import logoImage from '../../assets/logo.png';

interface WelcomePageProps {
  onSubmit: (name: string, phone: string) => void;
}

export default function WelcomePage({ onSubmit }: WelcomePageProps) {
  return (
    <div 
      className="welcome-bg relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-cover bg-center bg-no-repeat"
    >
      {/* Background radial glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 pt-12 pb-32 z-10 w-full max-w-[480px] mx-auto">
        
        {/* Logo and Brand Image */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center mb-8"
        >
          <img 
            src={logoImage} 
            alt="Simpolo Tiles & Bathware" 
            className="w-48 max-w-[200px] h-auto object-contain"
          />
        </motion.div>

        {/* Heading */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <h1 className="font-sans text-white text-3xl font-semibold tracking-tight leading-tight">
            Welcome to the<br />Simpolo Factory Tour
          </h1>
          <p className="text-[#C4A99B] text-[15px] mt-2 font-light">
            Begin your exclusive factory tour experience.
          </p>
        </motion.div>

        {/* Form Container */}
        <WelcomeForm onSubmit={onSubmit} />
      </div>
    </div>
  );
}
