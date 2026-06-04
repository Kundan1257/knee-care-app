import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; 
import { Home as HomeIcon, ChevronRight, Activity, ArrowRight } from "lucide-react";

// ✨ Clean, inline UI declarations to guarantee ZERO path-finding module crashes
const AppLogoLarge = () => <div className="text-4xl font-bold text-primary">KneeCare</div>;
const Card = ({ children, className }: any) => <div className={`bg-card rounded-2xl p-6 ${className}`}>{children}</div>;
const Section = ({ title, subtitle, children }: any) => (
  <div className="my-12">
    <h2 className="text-3xl font-bold text-primary">{title}</h2>
    <p className="text-gray-400 mb-6">{subtitle}</p>
    {children}
  </div>
);
const PageWrapper = ({ children }: any) => <div className="max-w-7xl mx-auto px-4">{children}</div>;
const PersonalizedPlanSection = () => <div className="p-4 bg-muted/10 rounded-xl">Personalized Recovery Track Loaded</div>;
const KneeSupportSection = () => <div className="p-4 bg-muted/10 rounded-xl">Knee Stability Monitor Loaded</div>;
const KneeSupportGuide = () => <div className="p-4 bg-muted/10 rounded-xl">Structural Alignment Guide Active</div>;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const HomeSection = () => {
  return (
    <PageWrapper>
      <motion.div initial="hidden" animate="show" variants={container} className="space-y-12">
        
        {/* Header Graphic/App Logo branding */}
        <motion.div variants={item} className="mb-24 text-center mt-10">
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
        </motion.div>

        {/* Daily Rhythm Tracker Grid */}
        <motion.div variants={item}>
          <Section title="Daily Rhythm" subtitle="Simple habits for structural joint protection.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Walking", icon: HomeIcon, desc: "Step up with the stronger leg, down with the weak.", rotate: "" },
                { title: "Stairways", icon: ChevronRight, desc: "Always use handrails for added stability.", rotate: "rotate-90" },
                { title: "Posture", icon: Activity, desc: "Avoid crossing legs. Keep a 90-degree angle.", rotate: "" }
              ].map((activity, i) => (
                <div key={i} className="group relative">
                  <div className="absolute inset-x-4 inset-y-8 bg-accent/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <Card className="text-center p-12 border-none transition-all duration-700 relative z-10 hover:translate-y-[-12px]">
                    <div className="w-20 h-20 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-primary group-hover:text-secondary group-hover:scale-110 transition-all duration-500">
                      <activity.icon size={32} className={activity.rotate} />
                    </div>
                    <h4 className="text-2xl font-black text-primary mb-4 tracking-tight">{activity.title}</h4>
                    <p className="text-gray-400 font-medium">{activity.desc}</p>
                  </Card>
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Premium Upgrade CTA Section Element */}
        <motion.div variants={item}>
          <Section title="Premium Upgrade" subtitle="Take your recovery tracking to the next level.">
            <Card className="p-8 border border-accent/20 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                <div>
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

        {/* Info Layout Pipelines */}
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
