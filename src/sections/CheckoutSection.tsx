import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, ChevronLeft, ArrowRight, Sparkles, CheckCircle2, Lock, Shield } from '../App';
import { Card, PageWrapper } from '../App';
import { useNavigate } from 'react-router-dom';
import { useAuth, usePremium } from '../hooks/useAuth';
import { paymentService } from '../services/paymentService';

export const CheckoutSection: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const isPremium = usePremium();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCompletePayment = async () => {
    if (!token) {
      alert("Please login to continue");
      return;
    }
    setLoading(true);

    try {
      const paymentResponse = await paymentService.initiatePayment(token, {
        name: "Knee-Care Premium",
        description: "Official Premium Support & Plans",
        prefill: {
          email: user?.email || "",
        }
      });

      const verifyData = await paymentService.verifyPayment(token, paymentResponse);
      
      if (verifyData.success) {
        if (verifyData.user) {
          updateUser(verifyData.user);
        }
        alert("Payment Successful! Welcome to Knee-Care Premium.");
        navigate('/premium');
      } else {
        throw new Error(verifyData.error || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      if (error.message !== 'Payment cancelled by user') {
        alert(error.message || "Payment could not be completed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-32">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 bg-accent/10 text-accent rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-accent/10 border border-white"
          >
            <ShieldCheck size={64} />
          </motion.div>
          <h2 className="text-5xl font-black text-primary mb-6 tracking-tighter">You're Already Premium!</h2>
          <p className="text-gray-400 font-medium text-xl mb-12 max-w-lg mx-auto">You have full access to all specialized knee recovery strategies and support.</p>
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/premium')}
            className="bg-primary text-secondary px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/20 transition-all"
          >
            Go to Premium Dashboard
          </motion.button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto">
        <motion.button 
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-gray-400 hover:text-primary transition-all mb-16 font-black uppercase text-[10px] tracking-[0.4em]"
        >
          <ChevronLeft size={20} /> Back to Plans
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Order Summary */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-2 block">Secure Checkout</span>
              <h1 className="text-5xl font-black text-primary mb-4 tracking-tighter">Finalize Upgrade</h1>
              <p className="text-gray-400 font-medium text-xl max-w-xl">Review your personalized structural support plan and complete your upgrade.</p>
            </div>

            <Card className="p-12 border-none shadow-[0_40px_100px_rgba(0,0,0,0.06)] bg-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
                <Sparkles size={200} />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-12 pb-12 border-b border-gray-100 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary text-secondary rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20">
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-primary tracking-tight">Knee-Care Premium</h3>
                    <p className="text-xs text-accent font-black uppercase tracking-widest mt-1">Direct Lifetime Access</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-primary tracking-tighter">₹499</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {[
                  "Advanced Recovery Protocols",
                  "AI Movement Analysis",
                  "Direct Physiotherapy Support",
                  "Full Exercise Database",
                  "Priority Updates"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 text-base text-gray-500 font-medium group">
                    <div className="w-8 h-8 bg-accent/20 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={18} className="text-accent" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex items-start gap-6 p-10 bg-primary/[0.03] rounded-[3.5rem] border border-primary/5">
              <Lock size={28} className="text-primary/40 shrink-0 mt-1" />
              <p className="text-sm text-primary/40 font-bold leading-[1.6] tracking-wide">
                YOUR TRANSACTION IS ANCHORED BY INDUSTRY-STANDARD 256-BIT SSL ENCRYPTION. WE DO NOT STORE SENSITIVE FINANCIAL IDENTIFIERS ON OUR SERVERS.
              </p>
            </div>
          </div>

          {/* Payment Action */}
          <div className="lg:col-span-5 lg:pt-24">
            <Card className="p-12 border-none shadow-[0_60px_120px_-20px_rgba(0,0,0,0.1)] bg-white border border-white">
              <h3 className="text-2xl font-black text-primary mb-8 tracking-tighter">Secure Gateway</h3>
              
              <div className="space-y-6 mb-12">
                <div className="p-8 border-4 border-primary bg-primary/[0.02] rounded-[2.5rem] relative group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 font-black text-primary text-lg">
                      <Shield size={24} className="text-accent" /> Encrypted Pay
                    </div>
                    <div className="w-6 h-6 rounded-full border-4 border-primary bg-primary animate-pulse shadow-[0_0_15px_rgba(30,58,52,0.3)]" />
                  </div>
                  <div className="flex flex-wrap gap-3 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
                    {["Visa", "Mastercard", "UPI", "Wallets", "Cards"].map((p) => (
                      <div key={p} className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest">{p}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-gray-100 mb-12">
                <div className="flex justify-between text-base text-gray-400 font-medium">
                  <span>Upgrade to Premium</span>
                  <span>₹499</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span className="text-lg font-black uppercase tracking-widest">Total Due</span>
                  <span className="text-4xl font-black tracking-tighter">₹499</span>
                </div>
              </div>

              <motion.button
                whileHover={!loading ? { scale: 1.05, y: -5 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
                onClick={handleCompletePayment}
                disabled={loading}
                className="w-full bg-primary text-secondary py-10 rounded-[2.5rem] font-black text-2xl shadow-[0_30px_70px_rgba(30,58,52,0.3)] hover:shadow-[0_45px_100px_rgba(30,58,52,0.4)] transition-all flex items-center justify-center gap-6 disabled:opacity-50 disabled:cursor-wait"
              >
                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                    Validating...
                  </div>
                ) : (
                  <>
                    Upgrade Now <ArrowRight size={28} />
                  </>
                )}
              </motion.button>
              
              <p className="text-[10px] text-gray-300 font-black text-center mt-8 leading-relaxed px-4 uppercase tracking-[0.2em]">
                Verified Secure Processor • No Recurring Fees
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
