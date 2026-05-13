import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, CreditCard, Shield, Zap, Lock, Star, ArrowRight, ShieldCheck } from '../App';
import { Card, PageWrapper } from '../App';
import { useAuth, usePremium } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const PremiumSection: React.FC = () => {
  const { token } = useAuth();
  const isPremium = usePremium();
  const navigate = useNavigate();

  const handlePremiumClick = () => {
    if (!token) {
      alert("Please login first");
      return;
    }
    navigate('/checkout');
  };

  if (isPremium) {
    return (
      <PageWrapper>
        <header className="mb-24 text-center mt-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-32 h-32 bg-gradient-to-tr from-accent/30 to-accent/10 text-accent rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 rotate-6 shadow-2xl shadow-accent/20 border border-white"
          >
            <Star size={64} fill="currentColor" />
          </motion.div>
          <h1 className="text-5xl font-black text-primary mb-6 tracking-tighter">Welcome to Premium</h1>
          <p className="text-gray-400 font-medium max-w-xl mx-auto leading-relaxed text-xl">
            Your support helps us keep the joints of the world moving. You have full access to everything Knee-Care offers.
          </p>
        </header>

        <Card className="max-w-3xl mx-auto border-none shadow-[0_50px_100px_rgba(0,0,0,0.15)] bg-primary text-secondary p-16 overflow-hidden relative rounded-[4rem]">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
            <Shield size={400} />
          </div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-12">
              <div className="bg-accent text-primary p-4 rounded-2xl shadow-xl shadow-accent/30">
                <ShieldCheck size={32} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent block mb-1">Authenticated Member</span>
                <h3 className="text-3xl font-black tracking-tight">Premium Identity Active</h3>
              </div>
            </div>
            
            <p className="text-xl mb-12 opacity-80 leading-relaxed max-w-2xl font-medium">Your joint health journey is now prioritized with our most advanced recovery frameworks and personalized intelligence.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-500 group">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent group-hover:text-primary transition-all duration-500">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-accent/80 mb-2">Recovery Hub</p>
                <p className="text-2xl font-black">Fully Unlocked</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-500 group">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent group-hover:text-primary transition-all duration-500">
                  <Zap size={32} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-accent/80 mb-2">Movement AI</p>
                <p className="text-2xl font-black">Priority Status</p>
              </div>
            </div>
            
            <div className="mt-16 pt-10 border-t border-white/10 flex justify-center italic text-sm opacity-40 font-medium tracking-widest">
              VALIDATED BY KNEE-CARE SECURITY PROTOCOL
            </div>
          </div>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <header className="mb-24 text-center mt-10">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 border border-accent/20">
          <Sparkles size={16} /> Join the elite
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-primary mb-6 tracking-tighter leading-[0.9]">Elevate Your <br /><span className="text-accent italic font-serif">Recovery Rhythm</span></h1>
        <p className="text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed text-xl">
          The ultimate framework for joint longevity, stability, and natural movement.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-6xl mx-auto items-start mb-32">
        <div className="lg:col-span-12 xl:col-span-7 space-y-20 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {[
              { icon: Zap, title: "Precision Framework", desc: "Advanced stability protocols calibrated for your unique joint biomechanics." },
              { icon: Shield, title: "Long-Term Preservation", desc: "Exclusive deep-tissue recovery strategies used by professional athletes." },
              { icon: Lock, title: "Elite Modules", desc: "Unlock the full technical library of movement and structural nutrition." },
              { icon: Sparkles, title: "Neural Intelligence", desc: "Priority access to our most advanced movement analysis systems." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-6 group"
              >
                <div className="w-20 h-20 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-center text-primary shadow-[0_15px_40px_rgba(0,0,0,0.04)] group-hover:bg-primary group-hover:text-secondary group-hover:scale-110 transition-all duration-500">
                  <feature.icon size={36} />
                </div>
                <div>
                  <h4 className="font-black text-primary text-2xl mb-3 tracking-tight group-hover:text-accent transition-colors">{feature.title}</h4>
                  <p className="text-gray-400 font-medium leading-[1.6] text-lg">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white p-16 rounded-[4rem] border border-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
              <Star size={120} fill="currentColor" className="text-accent" />
            </div>
            <h4 className="font-black text-primary text-xl mb-6 flex items-center gap-3 tracking-tighter">
              <Star size={24} className="text-accent" fill="currentColor" /> Why Thousands Trust Us
            </h4>
            <p className="text-gray-500 text-xl italic font-serif leading-relaxed mb-8">
              "Knee-Care Premium changed how I approach my morning routine. The stability guides are incredibly thorough and easy to follow."
            </p>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary font-black shadow-inner">SJ</div>
              <div>
                <p className="text-base font-black text-primary">Sarah J.</p>
                <p className="text-xs font-black text-accent uppercase tracking-widest">Marathon Runner</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="lg:col-span-12 xl:col-span-5 border-none shadow-[0_60px_120px_-20px_rgba(30,58,52,0.15)] p-12 flex flex-col bg-white rounded-[4rem] sticky top-10 border border-white">
          <div className="flex justify-between items-center mb-12">
            <div className="bg-primary text-secondary px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20">
              Lifetime Access
            </div>
            <div className="bg-accent/10 text-accent px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-accent/20">
              Best Value
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-4xl font-black text-primary mb-3 tracking-tighter leading-tight">Structural <br />Integrity Plan</h3>
            <p className="text-gray-400 font-medium text-lg">Your foundation for years of painless movement.</p>
          </div>

          <div className="mb-12 bg-muted p-10 rounded-[3rem] border border-border/50 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
              <Sparkles size={100} className="text-accent" />
            </div>
            <div className="flex items-baseline gap-4 relative z-10">
              <span className="text-6xl font-black text-primary tracking-tighter">₹499</span>
              <span className="text-gray-300 text-2xl line-through font-bold">₹1,999</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-accent text-xs font-black bg-accent/20 px-3 py-1 rounded-full uppercase tracking-widest">Global Special Offer</span>
            </div>
          </div>

          <ul className="space-y-6 mb-16">
            {["All Premium Joint Routines", "Custom Stability AI Analysis", "Lifetime Sync & Updates", "Pure Ad-Free Environment"].map((feature, i) => (
              <li key={i} className="flex items-start gap-5 text-lg text-gray-500 font-medium group">
                <div className="w-8 h-8 bg-accent text-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-accent/20 transition-transform group-hover:scale-110">
                  <CheckCircle2 size={18} />
                </div>
                <span className="leading-tight group-hover:text-primary transition-colors">{feature}</span>
              </li>
            ))}
          </ul>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePremiumClick}
            className="w-full bg-primary text-secondary py-10 rounded-[3rem] font-black text-2xl shadow-[0_30px_70px_rgba(30,58,52,0.3)] hover:shadow-[0_45px_90px_rgba(30,58,52,0.4)] transition-all flex items-center justify-center gap-6"
          >
            <CreditCard size={32} />
            Unlock Now <ArrowRight size={28} />
          </motion.button>
          
          <div className="flex flex-col items-center gap-6 mt-12 bg-muted/50 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-primary/40" />
              <p className="text-[10px] text-primary/40 uppercase tracking-[0.4em] font-black">Trusted by 10k+ Members</p>
            </div>
            <p className="text-[10px] text-gray-300 text-center font-bold tracking-wider leading-relaxed px-4">
              SECURE BIOMETRIC PAYMENT GATEWAY. <br />
              PCI-DSS COMPLIANT | 256-BIT ENCRYPTION
            </p>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );

};

export default PremiumSection;
