import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Play, Pause, CheckCircle2, ChevronRight, Sparkles, ChevronDown, Lock, ArrowRight, Wind, RotateCcw, Timer } from '../App';
import { Card, Section, PageWrapper, KneeSupportSection } from '../App';
import { EXERCISES, RELAXATIONS } from '../constants';
import { usePremium } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ExerciseRoutineProps {
  title: string;
  description: string;
  category: string;
  duration?: number;
}

const ExerciseRoutine: React.FC<ExerciseRoutineProps> = ({ title, description, category, duration = 300 }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsComplete(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsComplete(false);
  };

  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(duration);
    setIsComplete(false);
  };

  const progress = (timeLeft / duration) * 100;

  return (
    <Card className={`mb-8 border-none overflow-hidden p-0 rounded-[2.5rem] transition-all duration-700 ${isActive ? 'shadow-[0_30px_100px_rgba(0,0,0,0.1)] ring-2 ring-primary/5 bg-white' : 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/50 backdrop-blur-sm border border-white/40'}`}>
      <div className="flex flex-col md:flex-row min-h-[220px]">
        <div className={`flex-1 p-10 transition-all duration-500 ${isActive ? 'opacity-40 scale-[0.98] blur-[2px]' : 'opacity-100'}`}>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-inner">
              <Activity size={22} />
            </div>
            <h3 className="text-3xl font-black text-primary tracking-tighter">{title}</h3>
          </div>
          
          <div className="inline-flex items-center gap-1.5 mb-6 bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] text-accent font-black uppercase tracking-widest">{category}</span>
          </div>

          <p className="text-gray-500 mb-8 leading-relaxed font-medium text-lg max-w-md">{description}</p>
          
          <div className="flex items-center gap-4">
            {!isActive && !isComplete && (
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="bg-primary text-secondary py-5 px-10 rounded-[1.5rem] font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-3 text-lg"
              >
                <Play size={20} fill="currentColor" /> Start Session
              </motion.button>
            )}
            {isComplete && (
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="bg-accent text-primary py-5 px-10 rounded-[1.5rem] font-black shadow-2xl shadow-accent/20 hover:shadow-accent/40 transition-all flex items-center gap-3 text-lg"
              >
                <RotateCcw size={20} /> Restart
              </motion.button>
            )}
          </div>
        </div>

        <div className={`md:w-72 flex flex-col items-center justify-center p-10 text-center border-l border-white/50 relative overflow-hidden transition-all duration-700 ${isActive ? 'bg-primary/5' : 'bg-primary/5'}`}>
          {/* Breathing Animation Background */}
          {isActive && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.3, 0.8],
                opacity: [0.1, 0.4, 0.1],
                rotate: [0, 90, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-x-0 inset-y-0 bg-accent/20 rounded-full blur-[100px]"
            />
          )}

          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              key={timeLeft}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-7xl font-black text-primary mb-3 tabular-nums tracking-tighter"
            >
              {formatTime(timeLeft)}
            </motion.div>
            
            <motion.div 
              animate={isActive ? { opacity: [0.4, 1, 0.4], scale: [0.95, 1, 0.95] } : { opacity: 0.4 }}
              transition={isActive ? { duration: 4, repeat: Infinity } : {}}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-primary font-black mb-8"
            >
              {isActive ? (
                <>
                  <Wind size={12} className="text-accent" />
                  <span>Deep Breaths</span>
                </>
              ) : (
                <span>Duration</span>
              )}
            </motion.div>
            
            <div className="w-full bg-gray-200/50 h-2 rounded-full overflow-hidden shadow-inner mb-8">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary"
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>

            <div className="flex items-center gap-3">
              {isActive ? (
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePause}
                  className="w-14 h-14 bg-white text-primary rounded-2xl flex items-center justify-center shadow-xl border border-primary/10"
                >
                  <Pause size={24} fill="currentColor" />
                </motion.button>
              ) : timeLeft < duration && !isComplete && (
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleStart}
                  className="w-14 h-14 bg-primary text-secondary rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <Play size={24} fill="currentColor" />
                </motion.button>
              )}
              
              {(isActive || (timeLeft < duration && !isComplete)) && (
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleReset}
                  className="w-14 h-14 bg-white text-gray-400 rounded-2xl flex items-center justify-center shadow-md border border-gray-100"
                >
                  <RotateCcw size={20} />
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {isComplete && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mt-8 text-accent flex items-center gap-2 font-black text-sm bg-accent/10 px-6 py-3 rounded-2xl border border-accent/20"
                >
                  <CheckCircle2 size={18} /> Daily Goal Met
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {isComplete && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-white"
        >
          <div className="p-2 bg-accent/5">
            <KneeSupportSection />
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export const ExerciseSection: React.FC = () => {
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [relaxationOpen, setRelaxationOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const isPremium = usePremium();
  const navigate = useNavigate();

  const handleLockedClick = () => {
    navigate('/checkout');
  };

  const categories = ["All", "Daily Mobility", "Strength Focus", "Recovery", "Joint Stability"];

  const routines = [
    { 
      title: "Morning Stabilization", 
      description: "Prime your joints for the day with gentle awakening movements that reduce stiffness and optimize fluid flow.",
      category: "Daily Mobility"
    },
    { 
      title: "Structural Strength", 
      description: "Build the supporting muscular framework required to offload pressure from your knee joints.",
      category: "Strength Focus"
    },
    { 
      title: "Evening Deceleration", 
      description: "A vital cool-down phase to release tension and promote recovery while you rest.",
      category: "Recovery"
    },
    { 
      title: "Fluid Stability", 
      description: "Balance-focused movements to improve joint awareness and proprioception.",
      category: "Joint Stability"
    }
  ];

  const filteredRoutines = activeCategory === "All" 
    ? routines 
    : routines.filter(r => r.category === activeCategory);

  return (
    <PageWrapper>
      <header className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <Activity size={14} /> Guided Movement
        </div>
        <h1 className="text-4xl font-black text-primary mb-4 tracking-tight">Movement Therapy</h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto text-lg leading-relaxed">Scientific routines designed to stabilize and rejuvenate your joint structures.</p>
      </header>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeCategory === cat 
                ? "bg-primary text-secondary shadow-lg shadow-primary/20" 
                : "bg-white text-gray-400 border border-gray-100 hover:border-primary/20"
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mb-16 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filteredRoutines.map((routine, idx) => (
              <ExerciseRoutine 
                key={routine.title}
                title={routine.title} 
                description={routine.description}
                category={routine.category}
                duration={300}
              />
            ))}
            {filteredRoutines.length === 0 && (
              <div className="text-center py-20 text-gray-300 font-medium">
                No routines found in this category.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        <Card className="p-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-md rounded-[3rem] overflow-hidden relative group/card border border-white">
          <button 
            onClick={isPremium ? () => setInstructionsOpen(!instructionsOpen) : handleLockedClick}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${isPremium ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-400'} flex items-center justify-center shadow-inner`}>
                {isPremium ? <Sparkles size={28} /> : <Lock size={28} />}
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-bold text-primary group-hover:text-accent transition-colors tracking-tight">Movement Library</h2>
                {!isPremium ? (
                  <div className="inline-flex items-center gap-1.5 mt-1 bg-accent/10 px-2 py-0.5 rounded-lg">
                    <span className="text-[10px] text-accent font-black uppercase tracking-widest">Premium Unlock</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 font-medium mt-1">Deep-dive technical guides</p>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: instructionsOpen ? 180 : 0 }}
              className="text-gray-300 group-hover:text-accent transition-all bg-muted rounded-full p-2"
            >
              {isPremium ? <ChevronDown size={24} /> : <ArrowRight size={20} />}
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isPremium && instructionsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {EXERCISES.map((ex, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-muted/30 p-8 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all hover:bg-white flex flex-col h-full"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-primary text-secondary flex items-center justify-center text-sm font-black shrink-0 shadow-lg">{i+1}</span>
                          <h3 className="font-bold text-primary text-lg">{ex.name}</h3>
                        </div>
                        {ex.category && (
                          <div className="bg-accent/10 px-2 py-0.5 rounded-lg border border-accent/20">
                            <span className="text-[9px] text-accent font-black uppercase tracking-widest">{ex.category}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 leading-[1.7] font-medium grow">{ex.instruction}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isPremium && (
            <div className="absolute inset-x-0 bottom-0 top-[100px] bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col items-center justify-center pointer-events-none p-12">
              <div className="bg-primary text-secondary px-8 py-4 rounded-[2rem] text-sm font-bold shadow-2xl flex items-center gap-3 animate-bounce">
                <Sparkles size={20} className="text-accent" /> Unlock Technical Library
              </div>
              <p className="text-gray-400 text-xs font-bold mt-4 uppercase tracking-widest">Premium Membership Required</p>
            </div>
          )}
        </Card>

        <Card className="p-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-md rounded-[3.5rem] overflow-hidden relative group/card border border-white">
          <button 
            onClick={isPremium ? () => setRelaxationOpen(!relaxationOpen) : handleLockedClick}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${isPremium ? 'bg-primary/5 text-primary' : 'bg-gray-100/50 text-gray-300'} flex items-center justify-center shadow-inner`}>
                {isPremium ? <Activity size={28} /> : <Lock size={28} />}
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-bold text-primary group-hover:text-accent transition-colors tracking-tight">Recovery Protocols</h2>
                {!isPremium ? (
                  <div className="inline-flex items-center gap-1.5 mt-1 bg-accent/10 px-2 py-0.5 rounded-lg">
                    <span className="text-[10px] text-accent font-black uppercase tracking-widest">Premium Resource</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 font-medium mt-1">Post-movement relaxation</p>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: relaxationOpen ? 180 : 0 }}
              className="text-gray-300 group-hover:text-accent transition-all bg-muted rounded-full p-2"
            >
              {isPremium ? <ChevronDown size={24} /> : <ArrowRight size={20} />}
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isPremium && relaxationOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {RELAXATIONS.map((rel, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      className="text-center p-8 rounded-[2rem] bg-accent/5 border border-white shadow-sm hover:shadow-md transition-all hover:bg-white"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-accent">
                        <Activity size={24} />
                      </div>
                      <h4 className="font-bold text-primary mb-3 text-lg">{rel.name}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{rel.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isPremium && (
            <div className="absolute inset-x-0 bottom-0 top-[100px] bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col items-center justify-center pointer-events-none p-12">
              <div className="bg-primary text-secondary px-8 py-4 rounded-[2rem] text-sm font-bold shadow-2xl flex items-center gap-3">
                <Activity size={20} className="text-accent" /> Unlock Recovery Protocols
              </div>
              <p className="text-gray-400 text-xs font-bold mt-4 uppercase tracking-widest">Premium Membership Required</p>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};


export default ExerciseSection;
