import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';
import { CreditCard, ShieldCheck, CheckCircle2, Globe, ChevronDown } from 'lucide-react';

export const CheckoutSection: React.FC = () => {
  const [region, setRegion] = useState<'SA' | 'US' | 'EU'>('SA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Dynamic currency logic based on chosen country region
  const pricing = {
    SA: { amount: 49900, label: '₹499 INR', symbol: '₹' },
    US: { amount: 999, label: '$9.99 USD', symbol: '$' },
    EU: { amount: 899, label: '€8.99 EUR', symbol: '€' }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const currentConfig = {
        name: "Knee-Care Premium Portal Suite",
        description: `Unlock Full Rehabilitation Suite (${region} Region Upgrade)`,
        amount: pricing[region].amount,
        currency: region === 'SA' ? 'INR' : region === 'US' ? 'USD' : 'EUR',
        region: region
      };

      // Calls your verified country payment service router dynamically
      const response = await paymentService.initiatePayment('session_token_placeholder', currentConfig);
      
      if (response && response.status === 'success' || response.razorpay_payment_id) {
        await paymentService.verifyPayment('session_token_placeholder', response);
        setPaymentSuccess(true);
      }
    } catch (err) {
      console.error("LOG ERROR: [Checkout] Process Aborted:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-card/30 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-text mb-3">Upgrade Complete!</h2>
          <p className="text-text/60 mb-6 text-sm">Your Knee-Care Premium access privileges have been permanently activated across our secure data layers.</p>
          <button onClick={() => window.location.href = '/'} className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4 rounded-xl transition-colors shadow-lg shadow-primary/20">
            Go to Premium Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: INTERACTIVE GEOGRAPHIC COUNTRY SELECTOR COMPONENT */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-card/20 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl border border-white/5 text-primary">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">Account Localization</h2>
              <p className="text-xs text-text/40">Select your country to unlock regional payment methods</p>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-text/50 uppercase tracking-wider mb-2">Select Your Region / Country</label>
            <div className="relative">
              <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full bg-background/40 border border-white/10 rounded-2xl px-5 py-4 text-text font-medium appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="SA" className="bg-neutral-900 text-text">🇮🇳 South Asian Branch (UPI / Cards via Razorpay)</option>
                <option value="US" className="bg-neutral-900 text-text">🇺🇸 United States / Global (Apple Pay / Stripe)</option>
                <option value="EU" className="bg-neutral-900 text-text">🇪🇺 European Union (SEPA / Cards via Stripe)</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text/40">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-background/20 rounded-2xl border border-white/5 text-xs text-text/50 space-y-1.5">
            <p>💡 <b>South Asia:</b> Supports instant payment via UPI apps, local debit/credit cards, and NetBanking routing layers.</p>
            <p>💡 <b>Global (US/EU):</b> Integrates secure card fields with automatic 3D-Secure verifications and native digital wallets.</p>
          </div>
        </div>

        {/* SECURITY GUARANTEE ELEMENT */}
        <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400/80 text-sm">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>End-to-end encrypted link connectivity. Your security strings are completely isolated.</span>
        </div>
      </div>

      {/* RIGHT COLUMN: DYNAMIC BILLING CARD SUMMARY */}
      <div className="lg:col-span-5 bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl sticky top-8">
        <h3 className="text-lg font-bold text-text mb-6">Order Details</h3>
        
        <div className="flex justify-between items-center py-4 border-b border-white/5 text-sm">
          <span className="text-text/60">Premium Access License</span>
          <span className="text-text font-medium">Life-time Pass</span>
        </div>
        
        <div className="flex justify-between items-center py-4 border-b border-white/5 text-sm">
          <span className="text-text/60">Regional Gateway Match</span>
          <span className="text-text font-semibold text-primary">{region === 'SA' ? 'Razorpay Inward' : 'Stripe Edge'}</span>
        </div>

        <div className="flex justify-between items-end py-6 text-text">
          <span className="text-sm text-text/60 font-medium mb-1">Total Pricing Amount</span>
          {/* 🚀 THE FIX: Price changes dynamically to dollar terms ($) or rupee terms (₹) on the fly! */}
          <span className="text-3xl font-extrabold tracking-tight text-white">{pricing[region].label}</span>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4.5 rounded-2xl transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          <CreditCard className="w-5 h-5" />
          <span>{isProcessing ? "Connecting Gateway..." : `Pay ${pricing[region].symbol === '₹' ? 'via UPI / Card' : 'via Secure Checkout'}`}</span>
        </button>
      </div>

    </div>
  );
};
