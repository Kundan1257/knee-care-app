import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Globe, ChevronDown } from 'lucide-react';

export const CheckoutSection: React.FC = () => {
  const [region, setRegion] = useState<'SA' | 'US' | 'EU' | 'UK'>('SA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentSubmit = () => {
    try {
      setIsProcessing(true);
      console.log(`Redirecting securely to Razorpay Hosted Checkout for region: ${region}`);

      if (region === 'SA') {
        
        window.location.href = "https://rzp.io/rzp/Js4vsuA3";
      } else if (region === 'US' || region === 'UK') {
        
        window.location.href = "https://rzp.io/rzp/hB9oKg0y";
      } else if (region === 'EU') {
        
        window.location.href = "https://rzp.io/rzp/mfRJ5uvB";
      } else {
        window.location.href = "https://rzp.io/rzp/hB9oKg0y";
      }

    } catch (routingFault) {
      console.error("Gateway execution error:", routingFault);
      alert("Unable to open payment portal.");
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
          <h2 className="text-3xl font-bold text-white mb-3">Upgrade Complete!</h2>
          <p className="text-white/60 mb-6 text-sm">Your Knee-Care Premium access privileges have been permanently activated across our secure data layers.</p>
          <button onClick={() => window.location.href = '/'} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-4 rounded-xl transition-colors shadow-lg">
            Go to Premium Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-zinc-950 text-white">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
        <p className="text-zinc-400 mb-6 text-sm">Choose your regional tier configuration below</p>
        
        <div className="mb-6">
          <label className="block text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Select Region</label>
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value as any)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-zinc-500 transition-colors"
          >
            <option value="SA">South Asia (₹499 INR)</option>
            <option value="US">United States ($9.99 USD)</option>
            <option value="UK">United Kingdom ($9.99 USD)</option>
            <option value="EU">Europe (€8.89 EUR)</option>
          </select>
        </div>

        <button 
          onClick={handlePaymentSubmit}
          disabled={isProcessing}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
        >
          {isProcessing ? "Processing..." : "Proceed to Secure Payment"}
        </button>
      </div>
    </div>
  );
};
