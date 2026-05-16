/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component, ErrorInfo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Activity, 
  Utensils, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Lock, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ShieldCheck, 
  Shield, 
  Pause, 
  Play, 
  Square, 
  Droplets, 
  Zap, 
  Leaf, 
  Coffee, 
  Egg, 
  X, 
  Info, 
  Star, 
  Sparkles, 
  ClipboardList, 
  ChevronDown, 
  ArrowRight,
  Wind,
  RotateCcw,
  Timer,
  Sun,
  Moon,
  Dna,
  Heart
} from 'lucide-react';

export { 
  HomeIcon, 
  Activity, 
  Utensils, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Lock, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ShieldCheck, 
  Shield, 
  Pause, 
  Play, 
  Square, 
  Droplets, 
  Zap, 
  Leaf, 
  Coffee, 
  Egg, 
  X, 
  Info, 
  Star, 
  Sparkles, 
  ClipboardList, 
  ChevronDown, 
  ArrowRight,
  Wind,
  RotateCcw,
  Timer,
  Sun,
  Moon,
  Dna,
  Heart
};

import { cn } from './lib/utils';
import { EXERCISES, RELAXATIONS, RECIPES, TEAS } from './constants';
import { getKneeCareTip, generateKneeContent } from './services/geminiService';
import HomeSection from './sections/HomeSection';
import ExerciseSection from './sections/ExerciseSection';
import DietSection from './sections/DietSection';
import HelpSection from './sections/HelpSection';
import PremiumSection from './sections/PremiumSection';
import { CheckoutSection } from './sections/CheckoutSection';

// --- Context ---

export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const AuthContext = React.createContext<{
  isLoggedIn: boolean;
  token: string | null;
  user: any | null;
  login: (token: string, user: any) => void;
  updateUser: (userData: any) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}>({
  isLoggedIn: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  refreshUser: async () => {},
  updateUser: () => {},
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = React.useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('user_id');
    
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      // Always use /api/auth/me as it correctly identifies the user from the token
      const endpoint = `${API_URL}/api/auth/me`;
      
      const res = await fetch(endpoint, {
        headers: { Authorization: "Bearer " + currentToken }
      });
      if (res.ok) {
        const userData = await res.json();
        updateUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const currentToken = localStorage.getItem('token');
      try {
        if (currentToken) {
          await refreshUser();
        } else {
          // Auto-login disabled temporarily to fix 404 issues in production
          console.log("LOG: [Auth] Auto-login request skipped (Manual override) 🛡️");
          // Proceed as guest/unauthenticated without crash
        }
      } catch (e) {
        console.error("LOG ERROR: [Auth] Initialization check failed:", e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [refreshUser]);

  const updateUser = React.useCallback((userData: any) => {
    setUser(userData);
    if (userData?.isPremium) {
      localStorage.setItem('is_premium', 'true');
    } else {
      localStorage.removeItem('is_premium');
    }
  }, []);

  const login = React.useCallback((newToken: string, userData: any) => {
    setToken(newToken);
    updateUser(userData);
    localStorage.setItem('token', newToken);
    if (userData && userData.user_id) {
      localStorage.setItem('user_id', userData.user_id);
    }
  }, [updateUser]);

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_premium');
    window.location.reload();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn: !!token, 
      token, 
      user, 
      login, 
      updateUser,
      logout,
      isLoading,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Components ---

export const KneeIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <span className={className} style={{ fontSize: size }}>🦵</span>
);

export const AppLogo = ({ size = "small" }: { size?: "small" | "large" }) => {
  const dimensions = size === "large" ? "w-28 h-28" : "w-10 h-10";
  const iconSize = size === "large" ? 48 : 20;

  return (
    <div className={cn(
      dimensions,
      "bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_15px_40px_rgba(30,58,52,0.2)] border border-white/10"
    )}>
      <KneeIcon size={iconSize} />
    </div>
  );
};

export const AppLogoLarge = () => <AppLogo size="large" />;

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Home' },
  { path: '/exercises', icon: Activity, label: 'Ex' },
  { path: '/diet', icon: Utensils, label: 'Diet' },
  { path: '/help', icon: HelpCircle, label: 'Help' },
  { path: '/premium', icon: Star, label: 'Premium' },
  { path: '/about', icon: Info, label: 'About' },
];

const Navbar = () => {
  const location = useLocation();
  const { isLoggedIn, logout } = React.useContext(AuthContext);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-border/20 sticky top-0 z-[100] transition-all duration-500">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-center py-6 lg:h-24 gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <AppLogo />
            <span className="font-black text-2xl text-primary tracking-tighter group-hover:text-accent transition-colors">Knee-Care</span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full lg:w-auto justify-start lg:justify-end">
            <nav className="flex items-center gap-1 md:gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 px-5 py-3 rounded-2xl whitespace-nowrap",
                    location.pathname === item.path 
                      ? "text-primary bg-primary/5 shadow-sm" 
                      : "text-gray-400 hover:text-primary hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {isLoggedIn && (
              <div className="ml-4 pl-4 border-l border-gray-100 flex items-center gap-4">
                <button 
                  onClick={logout}
                  className="w-10 h-10 bg-red-50 text-red-400 rounded-full flex items-center justify-center hover:bg-red-100 transition-all shadow-sm"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/');
        }
      }}
      className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-6 font-bold text-sm group"
    >
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-border/50 group-hover:border-accent/50 transition-all">
        <ChevronLeft size={20} />
      </div>
      <span>Back</span>
    </motion.button>
  );
};

export const PageWrapper: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => (
  <div className="relative min-h-screen overflow-hidden bg-muted/50">
    {/* Subtle Wellness Background Elements */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none translate-y-1/4 -translate-x-1/4" />
    
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 pb-40 pt-10 px-6 max-w-5xl mx-auto"
    >
      <BackButton />
      {children}
    </motion.div>
  </div>
));

export const Section: React.FC<{ title: string; children: React.ReactNode; subtitle?: string }> = React.memo(({ title, children, subtitle }) => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="mb-40 last:mb-0"
  >
    <div className="mb-16">
      <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tighter">{title}</h2>
      {subtitle && <p className="text-gray-400 font-medium text-xl max-w-2xl leading-relaxed">{subtitle}</p>}
      <div className="w-16 h-1.5 bg-accent/30 rounded-full mt-8" />
    </div>
    <div className="space-y-12">{children}</div>
  </motion.section>
));

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = React.memo(({ children, className }) => (
  <motion.div 
    layout
    whileHover={{ y: -6, shadow: "0 25px 60px -15px rgba(0,0,0,0.12)" }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className={cn(
      "bg-white p-12 md:p-16 rounded-[3.5rem] border border-white/40 shadow-[0_10px_50px_rgb(0,0,0,0.02)] transition-all duration-700", 
      className
    )}
  >
    {children}
  </motion.div>
));

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    (this as any).state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("UI Error caught:", error, errorInfo);
  }
  render() {
    const state = (this as any).state;
    const props = (this as any).props;
    
    if (state.hasError) {
      return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-8 text-center border-t-4 border-red-500">
          <Card className="max-w-md w-full p-10 space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} />
            </div>
            <h1 className="text-2xl font-bold text-primary">Something went wrong</h1>
            <p className="text-gray-500 text-sm leading-relaxed">The application encountered a temporary error. We have logged the issue and are working to fix it.</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-secondary py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Reload Application
            </button>
          </Card>
        </div>
      );
    }
    return props.children;
  }
}

export const PersonalizedPlanSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [formData, setFormData] = useState({
    painLevel: 'Low',
    activityType: 'Walking',
    primaryIssue: 'Pain',
    ageGroup: '25–40',
    weight: '60–80 kg'
  });

  const generatePlan = React.useCallback(async () => {
    setLoading(true);
    const systemPrompt = `You are a specialized knee-care assistant. Create a structured "Personalized Knee Support Plan" based on the user's inputs. 
    The plan MUST have these exact sections:
    A. Daily Support Strategy
    B. Movement Guidance
    C. Recovery Tips
    D. Progress Advice

    RULES:
    - DO NOT mention the brand name "Knee-Lace".
    - Avoid medical claims; state that this is for informational purposes.
    - Format output in clear sections.
    - Be supportive and practical.
    - ADJUSTMENTS:
      * For higher age (40-60, 60+), recommend gentler, low-impact exercises.
      * For higher weight (80+ kg), recommend low-impact activities and slower progression.`;

    const userPrompt = `
    Pain Level: ${formData.painLevel}
    Activity Type: ${formData.activityType}
    Primary Issue: ${formData.primaryIssue}
    Age Group: ${formData.ageGroup}
    Weight: ${formData.weight}
    `;

    try {
      const result = await generateKneeContent(systemPrompt, userPrompt);
      setPlan(result);
    } catch (e) {
      console.error(e);
      setPlan("Unable to generate plan at this time. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const ChipSelector = ({ label, options, value, name }: any) => (
    <div className="space-y-4">
      <label className="text-xs font-black uppercase tracking-widest text-primary/40 block ml-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <motion.button
            key={opt}
            whileHover={{ y: -2, backgroundColor: value === opt ? "rgba(30,58,52,1)" : "rgba(30,58,52,0.05)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFormData(prev => ({ ...prev, [name]: opt }))}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all border",
              value === opt 
                ? "bg-primary text-secondary border-primary shadow-lg shadow-primary/20" 
                : "bg-white text-gray-400 border-gray-100 hover:border-primary/20"
            )}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <Section title="Personalized Support Plan">
      <Card className="border-none shadow-[0_50px_100px_rgba(0,0,0,0.06)] overflow-hidden bg-white relative p-0 rounded-[4rem]">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <ClipboardList size={280} />
        </div>
        
        <div className="p-10 md:p-16">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center text-accent shadow-inner">
              <Sparkles size={32} />
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-black text-primary tracking-tighter mb-2">Your Recovery Engine</h3>
              <p className="text-xl text-gray-400 font-medium tracking-tight">Tailored biomechanical guidance for your lifestyle.</p>
            </div>
          </div>
          
          <p className="text-xl text-gray-500 mb-16 leading-[1.8] max-w-3xl font-medium">
            Optimize your joint stability with a plan that understands your movement profile. This AI-driven guide identifies critical support areas based on your pain points and activity levels.
          </p>

          {!plan && !loading && !started ? (
            <div className="flex justify-center md:justify-start">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStarted(true)}
                className="bg-primary text-secondary px-12 py-6 rounded-[2.5rem] font-black text-xl flex items-center gap-4 shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                Start Personalization <ArrowRight size={24} />
              </motion.button>
            </div>
          ) : (
            <div className="space-y-12">
              {!plan ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 p-10 bg-muted/30 rounded-[3.5rem] border border-white"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <ChipSelector 
                      label="Pain Intensity" 
                      name="painLevel"
                      value={formData.painLevel}
                      options={['Low', 'Moderate', 'Severe']} 
                    />
                    <ChipSelector 
                      label="Primary Movement" 
                      name="activityType"
                      value={formData.activityType}
                      options={['Walking', 'Running', 'Sports', 'Sedentary']} 
                    />
                    <ChipSelector 
                      label="Focus Area" 
                      name="primaryIssue"
                      value={formData.primaryIssue}
                      options={['Pain', 'Weakness', 'Recovery', 'Injury']} 
                    />
                    <ChipSelector 
                      label="Age Range" 
                      name="ageGroup"
                      value={formData.ageGroup}
                      options={['Under 25', '25–40', '40–60', '60+']} 
                    />
                    <div className="lg:col-span-2">
                      <ChipSelector 
                        label="Body Metrics (Weight)" 
                        name="weight"
                        value={formData.weight}
                        options={['Under 60 kg', '60–80 kg', '80+ kg']} 
                      />
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generatePlan}
                    disabled={loading}
                    className="w-full bg-primary text-secondary py-8 rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                        Analyzing Profile...
                      </>
                    ) : (
                      <>Generate My Smart Plan <Sparkles size={24} /></>
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                    <div>
                      <h4 className="text-3xl md:text-4xl font-black text-primary tracking-tighter mb-2">Tailored Recovery Roadmap</h4>
                      <p className="text-gray-400 font-medium tracking-widest text-[10px] uppercase bg-muted/50 inline-block px-3 py-1 rounded-full">PLAN FOR {formData.ageGroup} PROFILE</p>
                    </div>
                    <button 
                      onClick={() => { setPlan(null); setStarted(false); }}
                      className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-accent transition-all bg-white border border-gray-100 rounded-full px-10 py-4 self-start md:self-auto shadow-sm hover:shadow-md"
                    >
                      Recalibrate Plan
                    </button>
                  </div>
                  
                  <Card className="bg-primary/[0.02] border-white p-12 md:p-20 rounded-[4rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-1000">
                      <Activity size={400} />
                    </div>
                    <div className="whitespace-pre-wrap text-xl md:text-2xl text-primary/80 leading-[2] font-medium relative z-10 plan-content tracking-tight">
                      {plan}
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4 bg-muted/40 p-10 rounded-[3rem] border border-white">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
                        <Info size={24} />
                      </div>
                      <p className="text-base text-gray-500 leading-relaxed font-medium">
                        This plan leverages biomechanical best practices for <span className="text-primary font-bold">{formData.activityType}</span> enthusiasts.
                      </p>
                    </div>
                    <div className="flex items-start gap-4 bg-amber-50 p-10 rounded-[3rem] border border-amber-100/50">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                        <AlertCircle size={24} />
                      </div>
                      <p className="text-base text-amber-900/60 leading-relaxed font-medium italic">
                        Not a substitute for clinical advice. Consult a specialist for persistent Joint Integrity issues.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </Card>
    </Section>
  );
};

export const KneeSupportSection = () => (
  <div className="mt-16 flex flex-col items-center">
    <div className="w-20 h-1 bg-slate-100 rounded-full mb-12" />
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="text-center max-w-2xl px-6"
    >
      <p className="text-2xl font-medium text-slate-400 italic font-display mb-10 leading-relaxed">
        “Movement is the natural medicine for your knees. With the right support, every step becomes an act of healing.”
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => document.getElementById('knee-support-guide')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full sm:w-auto bg-accent text-white py-5 px-10 rounded-[32px] font-bold shadow-2xl shadow-accent/20 hover:shadow-accent/40 transition-all flex items-center justify-center gap-3"
        >
          View Support Guide <ChevronDown size={20} />
        </motion.button>
        
        <Link to="/help">
          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-white text-primary py-5 px-10 rounded-[32px] border border-slate-100 font-bold card-shadow hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            Chat with AI <MessageCircle size={20} />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  </div>
);

export const KneeSupportGuide = () => {
  const navigate = useNavigate();
  
  return (
    <Section title="Support Guide">
      <div id="knee-support-guide" className="scroll-mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Daily Support",
              desc: "Best for walking and everyday activities.",
              features: ["Lightweight & hidden", "Breathable fabric", "Gentle compression"],
              icon: ShieldCheck,
              color: "bg-blue-600",
              light: "bg-blue-50",
              text: "text-blue-600"
            },
            {
              title: "Active Recovery",
              desc: "Enhanced stability for high impact movement.",
              features: ["Lateral support", "Moisture wicking", "Shock absorption"],
              icon: Activity,
              color: "bg-teal-600",
              light: "bg-teal-50",
              text: "text-teal-600"
            },
            {
              title: "Clinical Stability",
              desc: "Rigid support for injury prevention.",
              features: ["Maximum locking", "Adjustable straps", "Full patella guard"],
              icon: Lock,
              color: "bg-primary",
              light: "bg-slate-50",
              text: "text-primary"
            }
          ].map((tier, i) => (
            <Card key={i} className="flex flex-col h-full border-slate-100 hover:border-accent/20 hover:translate-y-[-8px] transition-all duration-500 overflow-hidden p-0 relative group">
              <div className={cn("h-2 transition-all duration-500 absolute top-0 left-0 right-0", tier.color)} />
              <div className="p-10 flex flex-col h-full">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform", tier.light, tier.text)}>
                  <tier.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{tier.title}</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">{tier.desc}</p>
                
                <div className="mt-auto space-y-4">
                  {tier.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <CheckCircle2 size={16} className={tier.text} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 p-8 glass rounded-[40px] border border-white flex flex-col items-center text-center">
            <p className="text-slate-400 text-xs italic mb-8 max-w-xl">
              "Note: This guide is for informational purposes. Always consult a healthcare professional for proper medical treatment."
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/help')}
              className="bg-primary text-white px-10 py-5 rounded-[32px] font-bold flex items-center gap-3 shadow-xl hover:bg-primary/90 transition-all font-display"
            >
              Consult AI Assistant
            </motion.button>
        </div>
      </div>
    </Section>
  );
};

// --- Pages ---

const AboutPage = () => (
  <PageWrapper>
    <header className="mb-24 text-center mt-10">
      <h1 className="text-5xl font-black text-primary mb-6 tracking-tighter">About Knee-Care</h1>
      <p className="text-gray-400 font-medium max-w-xl mx-auto text-xl leading-relaxed">Dedicated to structural joint resilience and natural movement recovery.</p>
    </header>

    <Section title="Our Mission">
      <Card className="border-none shadow-xl space-y-8 p-12 md:p-16">
        <p className="text-gray-500 font-medium text-xl leading-[1.8]">
          Knee-Care is a specialized wellness platform designed to empower individuals with the knowledge and tools for long-term knee health. We focus on natural stability, progressive movement, and structural recovery.
        </p>
        <p className="text-gray-500 font-medium text-xl leading-[1.8]">
          Our methodology combines traditional recovery wisdom with modern biomechanical insights, providing a balanced approach to joint preservation.
        </p>
        <div className="bg-muted p-10 rounded-[3rem] border border-border/50">
          <p className="text-primary font-black text-sm uppercase tracking-widest mb-4">Professional Disclaimer</p>
          <p className="text-gray-400 text-base leading-relaxed">
            This platform is for educational and informational purposes only. It does not replace professional medical diagnosis or treatment. Always consult with a qualified specialist for healthcare decisions.
          </p>
        </div>
      </Card>
    </Section>
  </PageWrapper>
);

const PrivacyPolicyPage = () => (
  <PageWrapper>
    <header className="mb-24 text-center mt-10">
      <h1 className="text-5xl font-black text-primary mb-6 tracking-tighter">Privacy Standards</h1>
      <p className="text-gray-400 font-medium max-w-xl mx-auto text-xl leading-relaxed">Your data integrity is fundamental to our trust.</p>
    </header>

    <Section title="Data Governance">
      <Card className="border-none shadow-xl space-y-10 p-12 md:p-16">
        <div className="space-y-6">
          <h4 className="text-2xl font-black text-primary tracking-tight">Personal Data Security</h4>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Knee-Care implements rigorous data protection protocols. We do not aggregate or store sensitive personal identifiers without explicit user authorization.
          </p>
        </div>
        <div className="space-y-6">
          <h4 className="text-2xl font-black text-primary tracking-tight">Non-Disclosure Commitment</h4>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            We operate on a zero-commercialization model regarding user information. Your activity data is strictly used for experience optimization within the platform.
          </p>
        </div>
        <div className="p-8 bg-primary text-secondary rounded-[2.5rem]">
          <p className="font-black text-center text-sm uppercase tracking-[0.3em]">Integrity Guaranteed</p>
        </div>
      </Card>
    </Section>
  </PageWrapper>
);

const ContactPage = () => (
  <PageWrapper>
    <header className="mb-24 text-center mt-10">
      <h1 className="text-5xl font-black text-primary mb-6 tracking-tighter">Connect with Us</h1>
      <p className="text-gray-400 font-medium max-w-xl mx-auto text-xl leading-relaxed">Our support network is here to guide your recovery journey.</p>
    </header>

    <Section title="Direct Assistance">
      <Card className="border-none shadow-xl space-y-10 p-12 md:p-16">
        <p className="text-gray-500 font-medium text-xl leading-relaxed">
          For technical inquiries, feedback, or collaborative opportunities, please reach out to our core team.
        </p>
        <div className="bg-muted p-12 rounded-[3.5rem] border border-border/50 text-center group hover:bg-white hover:shadow-2xl transition-all duration-500">
          <p className="text-primary/40 font-black text-xs uppercase tracking-[0.4em] mb-4">Official Channel</p>
          <a href="mailto:kneecare.help@gmail.com" className="text-3xl md:text-4xl font-black text-primary hover:text-accent transition-colors block break-all">
            kneecare.help@gmail.com
          </a>
        </div>
        <p className="text-gray-400 text-center font-medium italic">
          Typical response time: 24-48 business hours.
        </p>
      </Card>
    </Section>
  </PageWrapper>
);

const Footer = () => (
  <footer className="bg-white border-t border-border/50 py-8 mt-auto">
    <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <AppLogo />
        <span className="font-bold text-primary text-sm">Knee-Care</span>
      </div>
      <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-gray-400">
        <Link to="/about" className="hover:text-primary transition-colors">About</Link>
        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
        <Link to="/help" className="hover:text-primary transition-colors">Support</Link>
      </div>
      <p className="text-[10px] text-gray-400 font-medium">
        © {new Date().getFullYear()} Knee-Care. All rights reserved.
      </p>
    </div>
  </footer>
);

// --- Main App ---

function AppContent() {
  const { isLoading } = React.useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-muted flex flex-col">
        <Navbar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomeSection />} />
              <Route path="/exercises" element={<ExerciseSection />} />
              <Route path="/diet" element={<DietSection />} />
              <Route path="/help" element={<HelpSection />} />
              <Route path="/premium" element={<PremiumSection />} />
              <Route path="/checkout" element={<CheckoutSection />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
