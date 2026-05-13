import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, HomeIcon, ChevronRight, Droplets, Zap, Star, Sparkles, ArrowRight, Shield, Leaf, Sun, Moon, Dna, Heart } from '../App';
import { Card, Section, PageWrapper, AppLogoLarge, KneeSupportSection, KneeSupportGuide, PersonalizedPlanSection } from '../App';

export const HomeSection: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <PageWrapper>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <motion.header variants={item} className="mb-24 text-center mt-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-block mb-10 relative"
          >
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 opacity-50" />
            <div className="relative z-10">
              <AppLogoLarge />
            </div>
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-black text-primary mb-8 tracking-tighter leading-[0.9]">
            Stronger Knees,<br />
            <span className="text-accent italic font-serif">Better Living.</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-xl mx-auto text-xl leading-relaxed">
            Daily movement guidance and structural support designed for long-term joint health and stability.
          </p>
          <div className="flex justify-center gap-8 mt-12 opacity-10 grayscale hover:grayscale-0 transition-all duration-700">
            <Leaf size={24} />
            <Sun size={24} />
            <Heart size={24} />
            <Dna size={24} />
          </div>
        </motion.header>

        <motion.div variants={item}>
          <Section title="Welcome">
            <Card className="bg-primary text-secondary border-none shadow-[0_40px_100px_rgba(0,0,0,0.15)] overflow-hidden relative p-12 md:p-16 rounded-[4rem]">
              <div className="absolute -top-40 -right-40 p-8 opacity-[0.02] pointer-events-none">
                <Activity size={800} />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-8 border border-white/5">
                  <Sparkles size={16} className="text-accent" />
                  <span className="text-[10px] uppercase tracking-widest font-black">Stability Breakthrough</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black mb-10 flex items-center gap-4 tracking-tighter">
                  Natural Stability 🦵
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  <p className="text-secondary/70 leading-[1.8] font-medium text-xl">
                    Knee-Lace acts as a natural support system for your knees, helping reduce strain and improve stability during daily activities. Designed to provide balanced movement confidence, it helps protect your joints from unnecessary pressure while encouraging healthier mobility and long-term care.
                  </p>
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { text: "Stability & Confidence", icon: Shield, desc: "Reinforce your joints during high-pressure transitions." },
                      { text: "Natural Support", icon: Zap, desc: "Enhance your body's innate structural alignment." }
                    ].map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-5 bg-white/5 py-8 px-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-all duration-500">
                        <div className="bg-accent text-primary p-4 rounded-2xl shadow-xl shadow-accent/20 shrink-0">
                          <feat.icon size={28} />
                        </div>
                        <div>
                          <span className="text-xl font-black tracking-tight block mb-1">{feat.text}</span>
                          <span className="text-secondary/50 text-sm font-medium">{feat.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Section>
        </motion.div>

        <motion.div variants={item}>
          <Section title="Daily Rhythm" subtitle="Simple habits for structural joint protection.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Walking", icon: HomeIcon, desc: "Step up with the stronger leg, down with the weak." },
                { title: "Stairways", icon: ChevronRight, desc: "Always use handrails for added stability.", rotate: "rotate-90" },
                { title: "Posture", icon: Activity, desc: "Avoid crossing legs. Keep a 90-degree angle." }
              ].map((activity, i) => (
                <div key={i} className="group relative">
                  <div className="absolute inset-x-4 inset-y-8 bg-accent/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <Card className="text-center p-12 border-none transition-all duration-700 relative z-10 hover:translate-y-[-12px]">
                    <div className="w-20 h-20 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-primary group-hover:text-secondary group-hover:scale-110 transition-all duration-500">
                      <activity.icon size={32} className={activity.rotate} />
                    </div>
                    <h4 className="text-2xl font-black text-primary mb-4 tracking-tight">{activity.title}</h4>
                    <p className="text-gray-400 font-medium leading-relaxed">{activity.desc}</p>
                  </Card>
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        <motion.div variants={item}>
          <Section title="Recovery Tips" subtitle="Optimize your structural healing response.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-blue-50/30 border-blue-100 shadow-none p-10 rounded-[3rem] hover:bg-blue-50/60 transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                    <Droplets size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-blue-900 mb-3 tracking-tight">Ice Therapy</h4>
                    <p className="text-lg text-blue-800/50 font-medium leading-relaxed">Apply for 15-20 mins after intense activity to reduce swelling and inflammation.</p>
                  </div>
                </div>
              </Card>
              <Card className="bg-amber-50/30 border-amber-100 shadow-none p-10 rounded-[3rem] hover:bg-amber-50/60 transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                    <Zap size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-amber-900 mb-3 tracking-tight">Compression</h4>
                    <p className="text-lg text-amber-800/50 font-medium leading-relaxed">Use a light wrap to maintain stability and manage immediate inflammation response.</p>
                  </div>
                </div>
              </Card>
            </div>
          </Section>
        </motion.div>

        <motion.div variants={item}>
          <Section title="Expert Support">
            <Card className="bg-white border-white p-0 overflow-hidden group rounded-[4rem] relative min-h-[400px] flex items-center shadow-[0_50px_100px_rgba(0,0,0,0.06)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_50%)]" />
              <div className="absolute bottom-0 right-0 p-12 opacity-[0.03] text-primary">
                <Heart size={300} fill="currentColor" />
              </div>
              <div className="flex flex-col md:flex-row relative z-10 w-full">
                <div className="flex-1 p-16 md:p-24">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 bg-accent text-primary rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(251,191,36,0.3)]">
                      <Star size={40} fill="currentColor" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent mb-2 block">Consistency is Key</span>
                      <h3 className="text-4xl md:text-5xl font-black text-primary tracking-tighter">Your Recovery Journey</h3>
                    </div>
                  </div>
                  <p className="text-gray-400 font-medium text-2xl mb-16 leading-[1.6] max-w-2xl">
                    Every small action contributes to long-term joint health. Stay consistent with your daily movement and recovery rhythm to build lasting resilience.
                  </p>
                  <div className="flex items-center gap-8">
                    <div className="inline-flex items-center gap-3 bg-accent/10 px-8 py-4 rounded-[2rem] border border-accent/10">
                      <Sparkles size={24} className="text-accent" />
                      <span className="text-accent font-black text-lg">You've got this!</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex md:w-64 bg-accent/5 items-center justify-center border-l border-white/50 relative overflow-hidden">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0], 
                      scale: [1, 1.2, 1],
                      y: [0, -20, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                  >
                    <Sparkles size={120} className="text-accent opacity-20 blur-sm" />
                  </motion.div>
                </div>
              </div>
            </Card>
          </Section>
        </motion.div>

        <motion.div variants={item}>
          <Section title="Premium Upgrade">
            <Card className="border-none shadow-[0_60px_120px_rgba(0,0,0,0.1)] bg-white p-16 md:p-20 relative overflow-hidden group rounded-[5rem]">
              <div className="absolute -right-40 -top-40 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
              <div className="absolute left-0 top-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />
              <div className="flex flex-col lg:flex-row items-center justify-between gap-20 relative z-10">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/5 text-primary rounded-full text-xs font-black uppercase tracking-[0.3em] mb-10 border border-primary/10">
                    <Sparkles size={16} className="text-accent" /> Signature Experience
                  </div>
                  <h3 className="text-5xl md:text-6xl font-black text-primary mb-10 tracking-tighter leading-[0.9]">
                    Unlock Specialized <br />
                    <span className="text-accent italic font-serif">Structural Guidance.</span>
                  </h3>
                  <p className="text-gray-400 font-medium text-xl leading-relaxed max-w-3xl">
                    Get lifetime access to premium recovery plans, AI-powered movement strategies, and prioritized joint care support designed for immediate results.
                  </p>
                </div>
                <Link to="/checkout" className="shrink-0 w-full lg:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full lg:w-auto bg-primary text-secondary px-16 py-10 rounded-[3rem] font-black text-2xl flex items-center justify-center gap-6 shadow-[0_30px_70px_rgba(30,58,52,0.3)] hover:shadow-[0_40px_90px_rgba(30,58,52,0.4)] transition-all"
                  >
                    Get Access Now <ArrowRight size={32} />
                  </motion.button>
                </Link>
              </div>
            </Card>
          </Section>
        </motion.div>

        <motion.div variants={item}>
          <PersonalizedPlanSection />
        </motion.div>

        <motion.div variants={item}>
          <KneeSupportSection />
        </motion.div>
        
        <motion.div variants={item}>
          <KneeSupportGuide />
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
};

export default HomeSection;
