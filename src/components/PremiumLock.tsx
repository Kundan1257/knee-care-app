import React from 'react';
import { motion } from 'motion/react';
import { Lock, Sparkles, ArrowRight } from '../App';
import { Card } from '../App';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '../hooks/useAuth';

interface PremiumLockProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const PremiumLock: React.FC<PremiumLockProps> = ({ 
  children, 
  title = "Premium Content", 
  description = "This specialized recovery strategy is available for premium members."
}) => {
  const isPremium = usePremium();
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {/* Blurred overlay of real content (simulated) */}
      <div className="opacity-20 blur-md pointer-events-none select-none">
        {children}
      </div>

      {/* Lock UI */}
      <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
        <Card className="max-w-sm w-full border-none shadow-2xl bg-white/90 backdrop-blur-sm p-8 text-center section-gradient-border">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h3 className="text-xl font-bold text-primary mb-3 flex items-center justify-center gap-2">
            {title} <Sparkles size={18} className="text-accent" />
          </h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {description}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/premium')}
            className="w-full bg-primary text-secondary py-4 rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm"
          >
            Upgrade to Unlock <ArrowRight size={16} />
          </motion.button>
        </Card>
      </div>
    </div>
  );
};

export default PremiumLock;
