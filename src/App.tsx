import React, { useState, useEffect } from "react";

interface AlertState {
  type: "success" | "danger" | "info";
  message: string;
}

export default function App() {
  const [userName, setUserName] = useState<string>("Guest User");
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [alert, setAlert] = useState<AlertState | null>(null);
  
  // Support state for Help tab selection (View Support Guide vs Chat with AI)
  const [helpSubTab, setHelpSubTab] = useState<"guide" | "chat">("guide");
  
  // Interactive Chat with AI simulator state
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I am your Knee-Care Orthopedic Assistant. How can I help support your structural joint recovery journey today? 🦵" }
  ]);

  // Razorpay payment state
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [premiumSuccess, setPremiumSuccess] = useState<boolean>(false);

  // Diet sub tab state
  const [dietSubTab, setDietSubTab] = useState<"teas" | "dinner">("teas");

  // Exercise & Warm-Up Timer State
  const [timerSeconds, setTimerSeconds] = useState<{ [key: string]: number }>({
    mobility: 300,
    strength: 300,
    flexibility: 300,
  });
  const [timerRunning, setTimerRunning] = useState<{ [key: string]: boolean }>({
    mobility: false,
    strength: false,
    flexibility: false,
  });

  // Ticking effect for active countdown timers
  useEffect(() => {
    const interval = soulTick();
    function soulTick() {
      return setInterval(() => {
        setTimerSeconds((prev) => {
          const next = { ...prev };
          let updated = false;
          Object.keys(next).forEach((key) => {
            if (timerRunning[key]) {
              if (next[key] > 0) {
                next[key] = next[key] - 1;
                updated = true;
              } else {
                // Timer finished
                setTimerRunning((r) => ({ ...r, [key]: false }));
                showAlert("success", `${key === "mobility" ? "Mobility & Warm-Up" : key === "strength" ? "Strength Training" : "Flexibility & Recovery"} Completed! 🌟`);
              }
            }
          });
          return updated ? next : prev;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const toggleTimer = (timerKey: string) => {
    setTimerRunning((prev) => ({
      ...prev,
      [timerKey]: !prev[timerKey],
    }));
  };

  const resetTimer = (timerKey: string) => {
    setTimerRunning((prev) => ({
      ...prev,
      [timerKey]: false,
    }));
    setTimerSeconds((prev) => ({
      ...prev,
      [timerKey]: 300,
    }));
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper to show dynamic alert notifications
  const showAlert = (type: "success" | "danger" | "info", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Run initial checks on server load to fetch actual user session safely
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data && data.user_id) {
          setUserName(data.user_id);
        }
      } catch (err) {
        console.warn("Silent session query bypassed, running under guest tier environment", err);
      }
    }
    checkAuth();
  }, []);

  // Helper to inject check script dynamically for gateway backup
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fully operational Razorpay payment subscription routine
  const initiatePayment = async () => {
    try {
      setIsPaying(true);
      showAlert("info", "Initiating secure KneeCare Plus checkout channel...");

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK returned a network error. Ensure standard internet access is online.");
      }

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const orderResult = await orderRes.json();
      if (!orderResult.success) {
        throw new Error(orderResult.message || orderResult.error || "Order validation rejected by server gateway");
      }

      const rzpKeyRes = await fetch("/api/razorpay-key");
      const rzpKeyData = await rzpKeyRes.json();
      const keyId = rzpKeyData.keyId || "rzp_test_SrtSV2J4ngtpfL";

      const opt = {
        key: keyId,
        amount: orderResult.order.amount,
        currency: "INR",
        name: "Knee-Care Plus",
        description: "Premium Lifetime Specialized Structural Guidance Access",
        order_id: orderResult.order.id,
        handler: async function (response: any) {
          try {
            showAlert("info", "Verifying signature indices on server logs...");
            
            const verifyRes = await fetch("/api/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              showAlert("success", "VIP ACCESS ACTIVE: Premium recovery plans and movement strategies unlocked!");
              setPremiumSuccess(true);
              setActiveTab("Home");
            } else {
              throw new Error("Digital signature mismatch or revoked authorization");
            }
          } catch (err: any) {
            showAlert("danger", "Transaction verification error: " + err.message);
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: "KneeCare Patient User",
          email: "patient-care@digital-kneecare.com",
          contact: "9999999999",
        },
        theme: {
          color: "#142d28",
        },
      };

      const rzp = new (window as any).Razorpay(opt);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      showAlert("danger", "Gateway initialization failed. Diagnostic Log: " + err.message);
      setIsPaying(false);
    }
  };

  // AI Chat simulation sub-feature under Help View
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      let aiResponse = "Staying consistent with your natural knee movement path is the key to recovery. Is there a specific guidance card you are looking at?";
      const lower = userMsg.toLowerCase();
      if (lower.includes("pain") || lower.includes("relief") || lower.includes("hurt")) {
        aiResponse = "Keep tracking your dynamic stability. We suggest applying Ice Therapy for 15-20 minutes, resting at a stable 90-degree angle, and consulting your orthopedic advisor.";
      } else if (lower.includes("lace") || lower.includes("support") || lower.includes("benefit") || lower.includes("stability")) {
        aiResponse = "Knee-Lace acts as an advanced natural bracing guide, reducing immediate joint load while engaging core stability muscle structures safely.";
      } else if (lower.includes("routine") || lower.includes("daily")) {
        aiResponse = "A proper daily routine includes gentle warm-ups, knee-safe exercises combined with Knee-Lace support, and tracking your consistency scores.";
      } else if (lower.includes("exercise") || lower.includes("safe")) {
        aiResponse = "Knee-safe exercises prioritize protection. Focus on leg raises, hamstring curls, calf raises, wall squats, and step-ups with structural safety.";
      } else if (lower.includes("premium") || lower.includes("plus")) {
        aiResponse = "Our Premium tier unlocks signature biomechanical planning and direct AI coaching support immediately. Click on 'PREMIUM' inside navigation tabs to enroll.";
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    }, 1000);
  };

  const sendPresetMessage = (text: string) => {
    setChatMessages((prev) => [...prev, { sender: "user", text }]);
    setTimeout(() => {
      let aiResponse = "Staying consistent with your natural knee movement path is the key to recovery. Is there a specific guidance card you are looking at?";
      const lower = text.toLowerCase();
      if (lower.includes("pain") || lower.includes("relief") || lower.includes("hurt")) {
        aiResponse = "Keep tracking your dynamic stability. We suggest applying Ice Therapy for 15-20 minutes, resting at a stable 90-degree angle, and consulting your orthopedic advisor.";
      } else if (lower.includes("routine") || lower.includes("daily")) {
        aiResponse = "A proper daily routine includes gentle warm-ups, knee-safe exercises combined with Knee-Lace support, and tracking your consistency scores.";
      } else if (lower.includes("exercise") || lower.includes("safe")) {
        aiResponse = "Knee-safe exercises prioritize protection. Focus on leg raises, hamstring curls, calf raises, wall squats, and step-ups with structural safety.";
      } else if (lower.includes("lace") || lower.includes("benefit") || lower.includes("support")) {
        aiResponse = "Knee-Lace acts as an advanced natural bracing guide, reducing immediate joint load while engaging core stability muscle structures safely.";
      }
      setChatMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    }, 800);
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col justify-between">
      <div>
        
        {/* Navigation Header precisely matching mockup leg badge icon & spaced, uppercase links */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left Brand Area */}
            <div 
              className="flex items-center space-x-3 cursor-pointer select-none" 
              onClick={() => setActiveTab("Home")}
              id="appBrandLogo"
            >
              <div className="bg-[#142d28] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transform hover:scale-105 transition-all">
                <span className="text-2xl filter drop-shadow">🦵</span>
              </div>
              <div>
                <span className="font-black text-[24px] tracking-tight text-[#142d28]">
                  Knee-Care
                </span>
              </div>
            </div>

            {/* Right Spaced Uppercase Tabs with Soft Grey rounded pills */}
            <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none w-full sm:w-auto justify-center sm:justify-end">
              {[
                { id: "Home", label: "HOME" },
                { id: "Exercise", label: "EX" },
                { id: "Diet", label: "DIET" },
                { id: "Help", label: "HELP" },
                { id: "Premium", label: "PREMIUM" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-xs tracking-wider font-extrabold py-2 px-3 sm:px-4 rounded-full transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-slate-100 text-[#142d28] shadow-sm font-black"
                        : "text-slate-500 hover:text-slate-900 font-bold hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Dynamic global alert notifications system */}
        {alert && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
            <div
              className={`p-4 rounded-2xl flex items-start space-x-3 transition duration-150 shadow-sm ${
                alert.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500"
                  : alert.type === "danger"
                  ? "bg-rose-50 text-rose-800 border-l-4 border-rose-500"
                  : "bg-teal-50 text-teal-800 border-l-4 border-[#142d28]"
              }`}
            >
              <span className="text-lg">⚙️</span>
              <span className="font-semibold text-sm">{alert.message}</span>
            </div>
          </div>
        )}

        {/* Core switchable screen sections */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="primaryMainFrame">
          {activeTab === "Home" && (
            <div className="space-y-12">
              
              {/* Premium Dark Forest-Green Knee-Lace Showcase Card */}
              <section className="bg-[#142d28] text-white rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden border border-[#23453e]">
                {/* Minimalist ambient decorative background glows */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  
                  {/* Left Column: Knee-Lace description and targeted branding */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-xs font-black tracking-widest text-[#d4af37]">
                      <i className="fa-solid fa-star text-[10px] text-amber-400"></i>
                      <span>STABILITY BREAKTHROUGH</span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none uppercase">
                      Natural Stability <span className="inline-block text-3xl sm:text-4xl">🦵</span>
                    </h2>

                    <p className="text-[#a5b5b0] text-sm sm:text-base leading-relaxed font-semibold">
                      Knee-Lace acts as a natural support system for your knees, helping reduce strain and improve stability during daily activities. By systematically engaging targeted stabilizer muscles, it restores balance and structural confidence.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-3">
                      <button
                        onClick={() => setActiveTab("Exercise")}
                        className="bg-white text-[#142d28] hover:bg-slate-100 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full tracking-wide shadow-lg active:scale-95 transition cursor-pointer"
                      >
                        Explore Movement Guides
                      </button>
                      <button
                        onClick={() => setActiveTab("About")}
                        className="bg-white/10 text-white border border-white/20 hover:bg-white/15 px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wide transition cursor-pointer"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>

                  {/* Empty divider column */}
                  <div className="hidden lg:block lg:col-span-1"></div>

                  {/* Right Column: Mini-Highlights glass cards */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* Glassmorphism item 1 */}
                    <div className="bg-white/[0.05] backdrop-blur-lg border border-white/[0.08] p-5 rounded-2xl flex items-start space-x-4">
                      <div className="bg-[#d4af37]/10 text-[#d4af37] p-2.5 rounded-xl flex items-center justify-center border border-[#d4af37]/20">
                        <span className="text-lg">🛡️</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">Stability & Confidence</h4>
                        <p className="text-xs text-[#a5b5b0] leading-relaxed mt-1">
                          Dynamic protection designed to reinforce joints, supporting confidence in every movement.
                        </p>
                      </div>
                    </div>

                    {/* Glassmorphism item 2 */}
                    <div className="bg-white/[0.05] backdrop-blur-lg border border-white/[0.08] p-5 rounded-2xl flex items-start space-x-4">
                      <div className="bg-[#d4af37]/10 text-[#d4af37] p-2.5 rounded-xl flex items-center justify-center border border-[#d4af37]/20">
                        <span className="text-lg">⚡</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">Natural Support</h4>
                        <p className="text-xs text-[#a5b5b0] leading-relaxed mt-1">
                          Targeted pathways that minimize direct joint loading friction during routine actions.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* Lower Section Page Content - Restructured to match the requested real app text structure */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                
                {/* Section 1: Simple habits for structural joint protection */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-[#142d28] bg-teal-50 px-3 py-1.5 rounded-full uppercase tracking-wider font-mono">
                      Daily Routine Habits
                    </span>
                    <h3 className="text-xl font-black text-slate-800 mt-3">
                      Simple habits for structural joint protection.
                    </h3>
                  </div>

                  <div className="space-y-4 font-semibold text-xs sm:text-sm">
                    {/* Habit A */}
                    <div className="flex items-start space-x-3 p-3 bg-slate-50/55 rounded-xl border border-slate-100">
                      <span className="text-lg text-[#142d28]">🚶</span>
                      <div>
                        <h5 className="font-bold text-slate-800">Walking</h5>
                        <p className="text-slate-500 font-medium text-xs mt-0.5">
                          Step up with the stronger leg, down with the weak.
                        </p>
                      </div>
                    </div>

                    {/* Habit B */}
                    <div className="flex items-start space-x-3 p-3 bg-slate-50/55 rounded-xl border border-slate-100">
                      <span className="text-lg text-[#142d28]">🪜</span>
                      <div>
                        <h5 className="font-bold text-slate-800">Stairways</h5>
                        <p className="text-slate-500 font-medium text-xs mt-0.5">
                          Always use handrails for added stability.
                        </p>
                      </div>
                    </div>

                    {/* Habit C */}
                    <div className="flex items-start space-x-3 p-3 bg-slate-50/55 rounded-xl border border-slate-100">
                      <span className="text-lg text-[#142d28]">🪑</span>
                      <div>
                        <h5 className="font-bold text-slate-800">Posture</h5>
                        <p className="text-slate-500 font-medium text-xs mt-0.5">
                          Avoid crossing legs. Keep a 90-degree angle.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Recovery Tips - Optimize your structural healing response */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-[#142d28] bg-teal-50 px-3 py-1.5 rounded-full uppercase tracking-wider font-mono">
                      Biological Recovery
                    </span>
                    <h3 className="text-xl font-black text-[#111] mt-3">
                      Recovery Tips - Optimize your structural healing response.
                    </h3>
                  </div>

                  <div className="space-y-4 pt-1 font-semibold text-xs sm:text-sm">
                    {/* Tip A */}
                    <div className="p-4 bg-teal-50/20 rounded-xl border border-teal-100/40">
                      <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm mb-1.5">
                        <span>🧊</span>
                        <span>Ice Therapy</span>
                      </div>
                      <p className="text-slate-500 font-medium text-xs leading-relaxed">
                        Apply for 15-20 mins after intense activity to reduce swelling and inflammation.
                      </p>
                    </div>

                    {/* Tip B */}
                    <div className="p-4 bg-teal-50/20 rounded-xl border border-teal-100/40">
                      <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm mb-1.5">
                        <span>🩹</span>
                        <span>Compression</span>
                      </div>
                      <p className="text-slate-500 font-medium text-xs leading-relaxed">
                        Use a light wrap to maintain stability and manage immediate inflammation response.
                      </p>
                    </div>
                  </div>
                </div>

              </section>

              {/* Section 3: Expert Support - CONSISTENCY IS KEY */}
              <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center max-w-4xl mx-auto shadow-sm">
                <span className="text-[10px] font-black text-[#142d28] bg-amber-100 px-3 py-1.5 rounded-full uppercase tracking-wider font-mono">
                  Consistency Is Key
                </span>
                <h4 className="text-[#142d28] font-black text-2xl uppercase mt-4 mb-2">
                  Expert Support Required
                </h4>
                <p className="text-slate-600 font-semibold text-sm max-w-2xl mx-auto leading-relaxed">
                  "Your Recovery Journey: Every small action contributes to long-term joint health. Stay consistent with your daily movement and recovery rhythm to build lasting resilience. You've got this!"
                </p>
              </section>

            </div>
          )}

          {activeTab === "Premium" && (
            <div className="max-w-4xl mx-auto">
              {/* VIP enrollment card matching standard premium layout */}
              <div className="bg-gradient-to-br from-slate-950 via-[#142d28]/95 to-slate-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-slate-700">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold bg-white/10 text-teal-400 px-3.5 py-1 rounded-full border border-teal-500/30 uppercase tracking-widest inline-block text-amber-400">
                      Knee-Care Plus VIP Access
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight uppercase">
                      SIGNATURE EXPERIENCE
                    </h2>
                    <h3 className="text-xs sm:text-sm text-slate-400 mt-2 font-semibold">
                      Unlock Specialized Structural Guidance.
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 bg-[#d4af37]/10 border border-[#d4af37]/20 px-3.5 py-1.5 rounded-2xl self-start">
                    <span className="text-yellow-400 text-lg animate-pulse">👑</span>
                    <span className="text-xs font-black text-[#d4af37] uppercase tracking-wider">VIP Care</span>
                  </div>
                </div>

                <p className="text-slate-300 text-sm font-semibold leading-relaxed mb-8 max-w-3xl">
                  Get lifetime access to premium recovery plans, AI-powered movement strategies, and prioritized joint care support designed for immediate results.
                </p>

                {/* Core Features grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs sm:text-sm font-semibold text-slate-200">
                  <div className="flex items-center space-x-3 bg-white/5 border border-white/[0.04] p-4 rounded-xl">
                    <span className="text-lg text-amber-400">🧭</span>
                    <span>AI-powered specialized movement plans.</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 border border-white/[0.04] p-4 rounded-xl">
                    <span className="text-lg text-amber-400">🧪</span>
                    <span>Advanced physical joint diagnostics guidelines.</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 border border-white/[0.04] p-4 rounded-xl">
                    <span className="text-lg text-amber-400">⚡</span>
                    <span>High priority direct support channel access.</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 border border-white/[0.04] p-4 rounded-xl">
                    <span className="text-lg text-amber-400">🔒</span>
                    <span>Secure processing logs verified by Razorpay.</span>
                  </div>
                </div>

                {/* Subscription Action Trigger Box */}
                <div className="border-t border-white/10 pt-6 mt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-6">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">One-time VIP Lifetime Access Price</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl sm:text-4xl font-black text-[#d4af37]">₹499</span>
                        <span className="text-xs text-slate-500 line-through">₹1,999</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-teal-500/5 px-2.5 py-1.5 rounded-md border border-teal-500/10 uppercase tracking-wider font-extrabold text-[#d4af37]">
                      75% INTRODUCTORY SAVINGS ACTIVE
                    </span>
                  </div>

                  {premiumSuccess ? (
                    <div className="w-full bg-emerald-600 text-white font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2.5 shadow-lg shadow-emerald-600/10">
                      <span>Knee-Care Plus VIP Access Active ✅</span>
                    </div>
                  ) : (
                    <button
                      onClick={initiatePayment}
                      disabled={isPaying}
                      className="w-full bg-[#142d28] hover:bg-[#1a3832] text-white border border-white/15 font-black py-4 px-6 rounded-2xl flex items-center justify-center space-x-2.5 transition active:scale-[0.98] disabled:opacity-80 shadow-lg cursor-pointer text-sm sm:text-base"
                    >
                      {isPaying ? (
                        <>
                          <span>Connecting checkout server...</span>
                        </>
                      ) : (
                        <span>Get Access Now</span>
                      )}
                    </button>
                  )}

                  <p className="text-[11px] text-center text-slate-400 mt-4.5 font-bold">
                    <i className="fa-solid fa-lock mr-1.5 text-teal-400"></i> Securing connections via fully compliant INR Razorpay Checkout API
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Exercise" && (
            <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn">
              
              {/* 1. Sub-Header Banner & Navigation */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative">
                <button
                  onClick={() => setActiveTab("Home")}
                  className="inline-flex items-center space-x-1.5 text-xs font-black text-[#142d28] bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition cursor-pointer mb-5 text-[11px] tracking-wider uppercase"
                >
                  <span>←</span> <span>Back</span>
                </button>
                
                <div className="space-y-3">
                  <h1 id="exerciseHeaderMain" className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Support Your Knees with Knee-Lace 🏃
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed max-w-4xl">
                    Knee-Lace acts as a natural support system for your knees. It helps you move with stability, reduces stress on your joints, and supports your knees during every activity. Use these exercises to strengthen, protect, and maintain healthy knees.
                  </p>
                </div>
              </div>

              {/* 2. Exercises & Warm-Up Interactive Cards */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">⏱️</span>
                  <h3 className="font-extrabold text-slate-800 text-lg uppercase tracking-wider">
                    Exercises & Warm-Up Routines
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#142d28]/30 transition duration-150 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                          1. Mobility & Warm-Up
                        </h4>
                        <span className="inline-flex items-center text-[10px] font-black bg-teal-50 text-[#142d28] border border-teal-150 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          FREE / ✔
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Light jogging and gentle movements help your knees stay active and improve joint mobility. Essential before any physical activity.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center space-y-3">
                      <div className="font-mono text-2xl font-black text-slate-800 tracking-widest">
                        {formatTime(timerSeconds.mobility)}
                      </div>
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => toggleTimer("mobility")}
                          className={`flex-grow py-2 rounded-lg font-black text-xs text-center transition cursor-pointer tracking-wider uppercase border border-transparent ${
                            timerRunning.mobility
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-[#142d28] hover:bg-[#1a3832] text-white"
                          }`}
                        >
                          {timerRunning.mobility ? "⏸ Pause" : "▶ Start Routine"}
                        </button>
                        <button
                          onClick={() => resetTimer("mobility")}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs px-3.5 py-2 rounded-lg transition"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#142d28]/30 transition duration-150 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                          2. Strength Training
                        </h4>
                        <span className="inline-flex items-center text-[10px] font-black bg-teal-50 text-[#142d28] border border-teal-150 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          FREE / ✔
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Controlled exercises like squats and light drills strengthen muscles around the knee, providing better stability.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center space-y-3">
                      <div className="font-mono text-2xl font-black text-slate-800 tracking-widest">
                        {formatTime(timerSeconds.strength)}
                      </div>
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => toggleTimer("strength")}
                          className={`flex-grow py-2 rounded-lg font-black text-xs text-center transition cursor-pointer tracking-wider uppercase border border-transparent ${
                            timerRunning.strength
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-[#142d28] hover:bg-[#1a3832] text-white"
                          }`}
                        >
                          {timerRunning.strength ? "⏸ Pause" : "▶ Start Routine"}
                        </button>
                        <button
                          onClick={() => resetTimer("strength")}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs px-3.5 py-2 rounded-lg transition"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#142d28]/30 transition duration-150 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                          3. Flexibility & Recovery
                        </h4>
                        <span className="inline-flex items-center text-[10px] font-black bg-teal-50 text-[#142d28] border border-teal-150 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          FREE / ✔
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Stretching exercises reduce stiffness and improve flexibility for daily activities. Perfect for post-workout recovery.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center space-y-3">
                      <div className="font-mono text-2xl font-black text-slate-800 tracking-widest">
                        {formatTime(timerSeconds.flexibility)}
                      </div>
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => toggleTimer("flexibility")}
                          className={`flex-grow py-2 rounded-lg font-black text-xs text-center transition cursor-pointer tracking-wider uppercase border border-transparent ${
                            timerRunning.flexibility
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-[#142d28] hover:bg-[#1a3832] text-white"
                          }`}
                        >
                          {timerRunning.flexibility ? "⏸ Pause" : "▶ Start Routine"}
                        </button>
                        <button
                          onClick={() => resetTimer("flexibility")}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs px-3.5 py-2 rounded-lg transition"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3 & 4. Advanced Routines & Relaxation Sections with Premium Wrapper */}
              <div className="relative">
                {!premiumSuccess && (
                  <div className="absolute inset-x-0 inset-y-0.5 z-10 bg-slate-50/75 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200">
                    <div className="max-w-md mx-auto space-y-4 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
                      <div className="w-16 h-16 bg-amber-100 text-[#142d28] rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm animate-bounce">
                        👑
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                        👑 Premium Feature - Section Locked
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                        Unlock these advanced Knee-Lace orthopedic routines, tailored recovery paths, and breathing relaxation metrics immediately.
                      </p>
                      <button
                        onClick={initiatePayment}
                        disabled={isPaying}
                        className="w-full bg-[#142d28] hover:bg-[#1a3832] text-white font-black py-4 px-6 rounded-2xl transition active:scale-[0.98] disabled:opacity-80 shadow-md cursor-pointer text-xs sm:text-sm tracking-widest uppercase"
                      >
                        {isPaying ? "Connecting checkout server..." : "Unlock Premium Access Now"}
                      </button>
                    </div>
                  </div>
                )}

                <div className={`space-y-10 transition duration-300 ${!premiumSuccess ? "blur-md select-none pointer-events-none opacity-45" : ""}`}>
                  {/* 3. Advanced Routines Grid layout */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                        <span>⭐</span> <span>Knee-Safe Exercises</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        These exercises provide extra protection and recovery when combined with Knee-Lace support.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      
                      {/* Leg Raises */}
                      <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition flex items-start space-x-3.5">
                        <div className="bg-teal-50 text-[#142d28] font-black text-[13px] w-7 h-7 rounded-lg flex items-center justify-center border border-teal-100 shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Leg Raises</h4>
                          <p className="text-xs text-slate-500 leading-normal font-medium mt-0.5">
                            Lie on your back and lift one leg straight up while keeping the other bent.
                          </p>
                        </div>
                      </div>

                      {/* Hamstring Curls */}
                      <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition flex items-start space-x-3.5">
                        <div className="bg-teal-50 text-[#142d28] font-black text-[13px] w-7 h-7 rounded-lg flex items-center justify-center border border-teal-100 shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Hamstring Curls</h4>
                          <p className="text-xs text-slate-500 leading-normal font-medium mt-0.5">
                            Stand and hold a chair for balance, then lift your heel toward your buttocks.
                          </p>
                        </div>
                      </div>

                      {/* Wall Squats */}
                      <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition flex items-start space-x-3.5">
                        <div className="bg-teal-50 text-[#142d28] font-black text-[13px] w-7 h-7 rounded-lg flex items-center justify-center border border-teal-100 shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Wall Squats</h4>
                          <p className="text-xs text-slate-500 leading-normal font-medium mt-0.5">
                            Lean against a wall and slowly slide down until your knees are slightly bent.
                          </p>
                        </div>
                      </div>

                      {/* Step-ups */}
                      <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition flex items-start space-x-3.5">
                        <div className="bg-teal-50 text-[#142d28] font-black text-[13px] w-7 h-7 rounded-lg flex items-center justify-center border border-teal-100 shrink-0 mt-0.5">
                          4
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Step-ups</h4>
                          <p className="text-xs text-slate-500 leading-normal font-medium mt-0.5">
                            Step up onto a low platform with one foot, then step back down.
                          </p>
                        </div>
                      </div>

                      {/* Calf Raises */}
                      <div className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition flex items-start space-x-3.5">
                        <div className="bg-teal-50 text-[#142d28] font-black text-[13px] w-7 h-7 rounded-lg flex items-center justify-center border border-teal-100 shrink-0 mt-0.5">
                          5
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Calf Raises</h4>
                          <p className="text-xs text-slate-500 leading-normal font-medium mt-0.5">
                            Stand and slowly lift your heels off the floor, then lower them back down.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 4. Relaxation & Recovery Structural Feed Block */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🍃</span>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide">
                        Relaxation & Recovery
                      </h3>
                    </div>

                    <div className="divide-y divide-slate-100">
                      
                      {/* Breathing Relaxation */}
                      <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <h5 className="font-black text-slate-800 text-sm sm:w-1/4 shrink-0 flex items-center gap-2">
                          <span className="text-xs text-[#142d28]">•</span> Breathing Relaxation
                        </h5>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed sm:w-3/4">
                          Deep, slow breaths to calm the nervous system and reduce muscle tension.
                        </p>
                      </div>

                      {/* Light Stretching */}
                      <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <h5 className="font-black text-slate-800 text-sm sm:w-1/4 shrink-0 flex items-center gap-2">
                          <span className="text-xs text-[#142d28]">•</span> Light Stretching
                        </h5>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed sm:w-3/4">
                          Gentle stretches for the quadriceps and hamstrings to improve flexibility.
                        </p>
                      </div>

                      {/* Rest Posture */}
                      <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <h5 className="font-black text-slate-800 text-sm sm:w-1/4 shrink-0 flex items-center gap-2">
                          <span className="text-xs text-[#142d28]">•</span> Rest Posture
                        </h5>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed sm:w-3/4">
                          Elevating the legs slightly with a pillow under the knees to reduce pressure.
                        </p>
                      </div>

                      {/* Gentle Movement */}
                      <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <h5 className="font-black text-slate-800 text-sm sm:w-1/4 shrink-0 flex items-center gap-2">
                          <span className="text-xs text-[#142d28]">•</span> Gentle Movement
                        </h5>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed sm:w-3/4">
                          Slowly swinging the legs while sitting to promote joint lubrication.
                        </p>
                      </div>

                      {/* Mind Relaxation */}
                      <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <h5 className="font-black text-slate-800 text-sm sm:w-1/4 shrink-0 flex items-center gap-2">
                          <span className="text-xs text-[#142d28]">•</span> Mind Relaxation
                        </h5>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed sm:w-3/4">
                          Focusing on the sensation of the knees and releasing any held tension.
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === "Diet" && (
            <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn">
              
              {/* Top Banner section */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative">
                <button
                  onClick={() => setActiveTab("Home")}
                  className="inline-flex items-center space-x-1.5 text-xs font-black text-[#142d28] bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition cursor-pointer mb-5 text-[11px] tracking-wider uppercase"
                >
                  <span>←</span> <span>Back</span>
                </button>
                
                <div className="space-y-3">
                  <h1 id="dietHeaderMain" className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Orthopedic Clinical Nutrition 🥗
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed max-w-4xl">
                    Fueling your body with the right anti-inflammatory nutrients, vitamins, and minerals accelerates joint tissue cartilage repair. Combine dietary discipline with Knee-Lace support to restore optimal joint mobility.
                  </p>
                </div>
              </div>

              {/* 1. Nutrition Habits Section (ALWAYS FREE & OPEN) */}
              <div className="space-y-6 font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🍎</span>
                  <h3 className="font-extrabold text-slate-800 text-lg uppercase tracking-wider">
                    Nutrition Habits
                  </h3>
                  <span className="text-[10px] font-black bg-teal-50 text-[#142d28] border border-teal-150 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Always Free
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Hydration */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#142d28]/30 transition duration-150 flex items-start space-x-4">
                    <div className="text-2xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 mt-0.5">
                      💧
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Hydration</h4>
                      <p className="text-xs text-slate-500 leading-normal font-semibold mt-1">
                        Drink enough water to keep joints lubricated and reduce stiffness. 💧
                      </p>
                    </div>
                  </div>

                  {/* Banana */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#142d28]/30 transition duration-150 flex items-start space-x-4">
                    <div className="text-2xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 mt-0.5">
                      ⚡
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Banana</h4>
                      <p className="text-xs text-slate-500 leading-normal font-semibold mt-1">
                        High potassium helps muscle recovery and supports knee stability. ⚡
                      </p>
                    </div>
                  </div>

                  {/* Green Vegetables */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#142d28]/30 transition duration-150 flex items-start space-x-4">
                    <div className="text-2xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 mt-0.5">
                      🍃
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Green Vegetables</h4>
                      <p className="text-xs text-slate-500 leading-normal font-semibold mt-1">
                        Spinach, kale, and broccoli provide calcium and anti-inflammatory nutrients. 🍃
                      </p>
                    </div>
                  </div>

                  {/* Healthy Smoothie */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#142d28]/30 transition duration-150 flex items-start space-x-4">
                    <div className="text-2xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 mt-0.5">
                      ☕
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Healthy Smoothie</h4>
                      <p className="text-xs text-slate-500 leading-normal font-semibold mt-1">
                        Fruit and yogurt smoothies support recovery and energy. ☕
                      </p>
                    </div>
                  </div>

                  {/* Nuts & Seeds */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#142d28]/30 transition duration-150 flex items-start space-x-4">
                    <div className="text-2xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 mt-0.5">
                      🥜
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Nuts & Seeds</h4>
                      <p className="text-xs text-slate-500 leading-normal font-semibold mt-1">
                        Healthy fats and magnesium help reduce inflammation. ⚡
                      </p>
                    </div>
                  </div>

                  {/* Protein Foods */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#142d28]/30 transition duration-150 flex items-start space-x-4">
                    <div className="text-2xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 mt-0.5">
                      🥚
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Protein Foods</h4>
                      <p className="text-xs text-slate-500 leading-normal font-semibold mt-1">
                        Eggs, beans, and lentils support muscle strength around the knee. 🥚
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Premium Action Tabs (Sub-Navigation) */}
              <div className="border-t border-slate-200 pt-8 mt-4 flex flex-col items-center space-y-4">
                <span className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
                  Explore Specialized Orthopedic Nutrition
                </span>
                
                <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200 gap-1 sm:gap-2">
                  <button
                    onClick={() => setDietSubTab("teas")}
                    className={`flex items-center space-x-2 text-xs sm:text-sm font-black py-2.5 px-5 sm:px-6 rounded-full transition cursor-pointer select-none ${
                      dietSubTab === "teas"
                        ? "bg-[#142d28] text-white shadow-md font-black"
                        : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
                    }`}
                  >
                    <span>☕</span> <span>View Herbal Teas</span>
                  </button>
                  <button
                    onClick={() => setDietSubTab("dinner")}
                    className={`flex items-center space-x-2 text-xs sm:text-sm font-black py-2.5 px-5 sm:px-6 rounded-full transition cursor-pointer select-none ${
                      dietSubTab === "dinner"
                        ? "bg-[#142d28] text-white shadow-md font-black"
                        : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
                    }`}
                  >
                    <span>🍴</span> <span>View Dinner Ideas</span>
                  </button>
                </div>
              </div>

              {/* 3. Premium Paywall Condition Wrapper (Using premiumSuccess state) */}
              <div className="relative">
                {!premiumSuccess && (
                  <div className="absolute inset-x-0 inset-y-0.5 z-10 bg-slate-50/75 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200">
                    <div className="max-w-md mx-auto space-y-4 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
                      <div className="w-16 h-16 bg-amber-100 text-[#142d28] rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm animate-bounce">
                        🔒
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                        🔒 Premium Clinical Nutrition Database Locked
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                        Unlock 6 specialized therapeutic herbal recipes and 10 chef-curated anti-inflammatory dinner protocols designed to maximize your joint recovery response.
                      </p>
                      <button
                        onClick={initiatePayment}
                        disabled={isPaying}
                        className="w-full bg-[#142d28] hover:bg-[#1a3832] text-white font-black py-4 px-6 rounded-2xl transition active:scale-[0.98] disabled:opacity-80 shadow-md cursor-pointer text-xs sm:text-sm tracking-widest uppercase"
                      >
                        {isPaying ? "Connecting checkout server..." : "Upgrade Now to Reveal Plan"}
                      </button>
                    </div>
                  </div>
                )}

                <div className={`space-y-6 transition duration-300 ${!premiumSuccess ? "blur-md select-none pointer-events-none opacity-45" : ""}`}>
                  
                  {dietSubTab === "teas" && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                          <span>☕</span> <span>Specialized Therapeutic Herbal Teas</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          Nature's anti-inflammatory infusions customized to reduce systemic joint stiffness.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-semibold">
                        {/* Turmeric Tea */}
                        <div className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-150/60 transition space-y-2">
                          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            Turmeric Tea
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            Contains curcumin, which helps reduce inflammation and joint pain.
                          </p>
                        </div>

                        {/* Ginger Tea */}
                        <div className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-150/60 transition space-y-2">
                          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            Ginger Tea
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            Known for its anti-inflammatory properties and ability to soothe muscles.
                          </p>
                        </div>

                        {/* Green Tea */}
                        <div className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-150/60 transition space-y-2">
                          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            Green Tea
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            Rich in antioxidants that protect joints and improve overall health.
                          </p>
                        </div>

                        {/* Cinnamon Tea */}
                        <div className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-150/60 transition space-y-2">
                          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            Cinnamon Tea
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            Helps improve circulation and has mild anti-inflammatory effects.
                          </p>
                        </div>

                        {/* Chamomile Tea */}
                        <div className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-150/60 transition space-y-2">
                          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            Chamomile Tea
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            Promotes relaxation and helps reduce stress-related muscle tension.
                          </p>
                        </div>

                        {/* Carom Seed Tea (Ajwain Tea) */}
                        <div className="p-4 bg-amber-50/50 hover:bg-amber-50 rounded-2xl border border-amber-150/60 transition space-y-2 md:col-span-2 lg:col-span-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <h4 className="font-black text-[#142d28] text-sm flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                              Carom Seed Tea (Ajwain Tea)
                            </h4>
                            <span className="text-[10px] font-black bg-teal-100 text-[#142d28] px-2 py-0.5 rounded uppercase tracking-wider">
                              Highly Recommended Recipes
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                            Traditional herbal drink with anti-inflammatory and digestive-support properties.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px] font-semibold text-slate-500">
                            <div className="bg-white/70 p-2.5 rounded-lg border border-amber-100/50">
                              <span className="font-bold text-slate-800 block text-xs">⭐ BENEFITS:</span>
                              <p className="mt-0.5 font-medium">May help reduce inflammation, Supports digestion, Contains natural antioxidants.</p>
                            </div>
                            <div className="bg-white/70 p-2.5 rounded-lg border border-amber-100/50">
                              <span className="font-bold text-slate-800 block text-xs">🍳 PREPARATION:</span>
                              <p className="mt-0.5 font-medium">Boil 1 teaspoon of carom seeds in 1–2 cups of water for 5–7 minutes.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400 font-semibold italic">
                        Note: Use in moderation. If you have any medical condition or are pregnant, consult a professional before regular use.
                      </div>
                    </div>
                  )}

                  {dietSubTab === "dinner" && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                          <span>🍴</span> <span>Anti-Inflammatory Dinner Protocols</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          10 chef-curated premium nutrition dinner options optimized for tissue recovery.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-semibold">
                        {[
                          { title: "Turmeric Salmon", desc: "Fresh salmon seasoned with dynamic turmeric seasoning, high in inflammation-fighting omega-3s." },
                          { title: "Quinoa Salad", desc: "Light and fiber-rich salad filled with essential vitamins and muscle-rebuilding proteins." },
                          { title: "Steamed Broccoli & Tofu", desc: "Rich in calcium and minerals to strengthen bone matrix around target joints." },
                          { title: "Berry Spinach Smoothie Bowl", desc: "Packed with powerful antioxidants to clear free-radicals from joint tissues." },
                          { title: "Lentil Soup", desc: "High in plant protein and dietary fiber for general muscle repair support." },
                          { title: "Avocado & Chickpea Mash", desc: "Provides premium healthy fats to support joint flexibility and lubrication." },
                          { title: "Roasted Sweet Potato", desc: "High in beta-carotene to aid tissue recovery and joint-membrane health." },
                          { title: "Walnut & Pear Salad", desc: "An anti-inflammatory walnut pairing supporting joint health and healthy fats." },
                          { title: "Ginger Garlic Shrimp", desc: "Rich in lean proteins infused with organic ginger-garlic and healing properties." },
                          { title: "Miso Vegetable Broth", desc: "Supports digestive gut microbiome, reducing system-wide inflammatory responses." }
                        ].map((item, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-100 transition flex items-start space-x-3">
                            <span className="text-xs font-black text-[#142d28] bg-teal-50 w-6 h-6 rounded-full flex items-center justify-center border border-teal-100 shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{item.title}</h4>
                              <p className="text-[11px] sm:text-xs text-slate-500 leading-normal font-semibold mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Disclaimer */}
                      <div className="p-4 bg-[#fcfcfc] rounded-xl border border-slate-100 text-[11px] text-slate-400 font-semibold italic">
                        * Natural ingredients, no medical claims intended.
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {activeTab === "Help" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              
              {/* Help Header Navigation: "View Support Guide" & "Chat with AI" switcher tabs */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <span className="text-[10px] font-bold text-[#142d28] bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                  Support Hub
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-2 uppercase tracking-wide">
                  Clinical Assistance & Guidance
                </h2>
                
                {/* Switcher tabs */}
                <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 mt-6 gap-2 max-w-sm sm:max-w-md mx-auto sm:mx-0">
                  <button
                    onClick={() => setHelpSubTab("guide")}
                    className={`flex-1 py-2 text-xs sm:text-sm font-black rounded-full transition cursor-pointer text-center ${
                      helpSubTab === "guide"
                        ? "bg-[#142d28] text-white shadow-md font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    📖 View Support Guide
                  </button>
                  <button
                    onClick={() => setHelpSubTab("chat")}
                    className={`flex-1 py-2 text-xs sm:text-sm font-black rounded-full transition cursor-pointer text-center ${
                      helpSubTab === "chat"
                        ? "bg-[#142d28] text-white shadow-md font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    💬 Chat with AI
                  </button>
                </div>
              </div>

              {/* Sub-tab 1: Support Guide View cards */}
              {helpSubTab === "guide" && (
                <div className="space-y-6">
                  
                  {/* Three distinct styled cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Card 1: Daily Support */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#142d28]/45 transition duration-150 flex flex-col justify-between h-full">
                      <div>
                        <div className="bg-teal-50 text-[#142d28] w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-4 border border-teal-100">
                          👟
                        </div>
                        <h4 className="font-extrabold text-[#142d28] text-sm uppercase tracking-wider mb-2">Daily Support</h4>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          Best for walking and everyday activities. Lightweight & hidden | Breathable fabric | Gentle compression
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Active Recovery */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#142d28]/45 transition duration-150 flex flex-col justify-between h-full">
                      <div>
                        <div className="bg-teal-50 text-[#142d28] w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-4 border border-teal-100">
                          ⚡
                        </div>
                        <h4 className="font-extrabold text-[#142d28] text-sm uppercase tracking-wider mb-2">Active Recovery</h4>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          Enhanced stability for high impact movement. Lateral support | Moisture wicking | Shock absorption
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Clinical Stability */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#142d28]/45 transition duration-150 flex flex-col justify-between h-full">
                      <div>
                        <div className="bg-teal-50 text-[#142d28] w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-4 border border-teal-100">
                          🔬
                        </div>
                        <h4 className="font-extrabold text-[#142d28] text-sm uppercase tracking-wider mb-2">Clinical Stability</h4>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          Rigid support for injury prevention. Maximum locking | Adjustable straps | Full patella guard
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* Sub-tab 2: Chat with AI interactive assistant */}
              {helpSubTab === "chat" && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  {/* Assistant Header status */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-0.5">
                      <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                        <span>Knee-Care Assistant</span> <span>💬</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        Tailored post-surgical orthopedic advice
                      </p>
                    </div>
                    <span className="text-[10px] font-black bg-teal-100 text-[#142d28] border border-teal-200 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                      ● Always Online
                    </span>
                  </div>

                  {/* Message stack logs */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto min-h-[220px] p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold leading-relaxed">
                    
                    {/* Greeting Message Box always showing first */}
                    <div className="flex justify-start">
                      <div className="p-4 bg-slate-200 text-slate-850 rounded-2xl rounded-bl-none max-w-lg shadow-sm border border-slate-300/30">
                        <span className="font-bold text-[#142d28] block text-[11px] mb-1 uppercase tracking-wider">SYSTEM ADVISOR ✨</span>
                        Hello! I'm your Knee-Care assistant. How can I help you with your knee health or Knee-Lace support today?
                      </div>
                    </div>

                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`p-4 rounded-2xl max-w-lg shadow-sm font-semibold transition-all ${
                          msg.sender === "user" 
                            ? "bg-[#142d28] text-white rounded-br-none" 
                            : "bg-slate-200 text-slate-850 rounded-bl-none border border-slate-300/30"
                        }`}>
                          {msg.sender === "user" ? (
                            <span>{msg.text}</span>
                          ) : (
                            <>
                              <span className="font-bold text-[#142d28] block text-[11px] mb-1 uppercase tracking-wider">ASSISTANT GURU 🦵</span>
                              <span>{msg.text}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick-Action Clickable Query Tags */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block text-center sm:text-left">
                      💡 Tap Quick Queries to Consult Instantly
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      <button
                        type="button"
                        onClick={() => sendPresetMessage("Knee Pain Relief")}
                        className="p-2.5 text-center text-[11px] font-black text-[#142d28] bg-teal-50 hover:bg-[#142d28] hover:text-white transition duration-150 border border-teal-100 rounded-xl cursor-pointer uppercase tracking-wider"
                      >
                        [KNEE PAIN RELIEF]
                      </button>
                      <button
                        type="button"
                        onClick={() => sendPresetMessage("Daily Routine")}
                        className="p-2.5 text-center text-[11px] font-black text-[#142d28] bg-teal-50 hover:bg-[#142d28] hover:text-white transition duration-150 border border-teal-100 rounded-xl cursor-pointer uppercase tracking-wider"
                      >
                        [DAILY ROUTINE]
                      </button>
                      <button
                        type="button"
                        onClick={() => sendPresetMessage("Safe Exercises")}
                        className="p-2.5 text-center text-[11px] font-black text-[#142d28] bg-teal-50 hover:bg-[#142d28] hover:text-white transition duration-150 border border-teal-100 rounded-xl cursor-pointer uppercase tracking-wider"
                      >
                        [SAFE EXERCISES]
                      </button>
                      <button
                        type="button"
                        onClick={() => sendPresetMessage("Knee-Lace Benefits")}
                        className="p-2.5 text-center text-[11px] font-black text-[#142d28] bg-teal-50 hover:bg-[#142d28] hover:text-white transition duration-150 border border-teal-100 rounded-xl cursor-pointer uppercase tracking-wider"
                      >
                        [KNEE-LACE BENEFITS]
                      </button>
                    </div>
                  </div>

                  {/* Chat Input Bar */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your knee rehabilitation query..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-grow p-4 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#142d28] focus:border-[#142d28]"
                    />
                    <button
                      type="submit"
                      className="bg-[#142d28] hover:bg-[#1e4039] text-white px-6 rounded-2xl font-black text-xs transition uppercase tracking-widest cursor-pointer flex items-center gap-1"
                    >
                      Send <span>➔</span>
                    </button>
                  </form>

                </div>
              )}

              {/* Community Feed & Feedback Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Card: Community Tips */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <span className="text-[10px] font-black text-[#142d28] bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    ↗ Community Tips
                  </span>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs sm:text-sm text-slate-700 font-extrabold italic leading-relaxed">
                      "⭐ Daily Movement: 'Consistency is key. Even 5 minutes of movement makes a difference.'"
                    </p>
                  </div>
                </div>

                {/* Right Card: Feedback */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full space-y-4">
                  <div>
                    <span className="text-[10px] font-black text-[#142d28] bg-amber-50 border border-amber-100 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                      Feedback
                    </span>
                    <h4 className="text-slate-800 font-bold text-sm mt-3">Help us improve Knee-Care for everyone.</h4>
                  </div>
                  <button
                    onClick={() => {
                      showAlert("success", "Thank you! Your feedback has been sent to our recovery design unit.");
                    }}
                    className="w-full sm:w-auto bg-[#142d28] hover:bg-[#1a3832] text-white font-extrabold text-[11px] py-3 px-6 rounded-full transition uppercase tracking-wider cursor-pointer"
                  >
                    Send Feedback
                  </button>
                </div>

              </div>

              {/* Premium Medical Disclaimer Panel (At the Absolute Bottom) */}
              <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 sm:p-8 space-y-3">
                <h4 className="text-sm font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
                  <span>⚠️</span> <span>Medical Disclaimer</span>
                </h4>
                <p className="text-xs text-rose-700/90 font-semibold leading-relaxed">
                  This application provides educational information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>

            </div>
          )}

          {activeTab === "About" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              
              {/* About Header */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <span className="text-[10px] font-bold text-[#142d28] bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                  THE SCIENCE OF KNEE-LACE
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-3 uppercase tracking-wide">
                  ABOUT KNEE-CARE BIOMECHANICS
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-semibold leading-relaxed">
                  Pioneering modern physical rehabilitation guidelines specifically engineered to complement Knee-Lace stabilization systems. Our protocols integrate structural knee reconstruction support (ACL, PCL, MCL) with dynamic textile physics to offload deep joint stress.
                </p>
              </div>

              {/* Clinician context body */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-[#142d28] text-lg uppercase tracking-wide">CORE STABILITY MISSION</h3>
                  <p className="text-sm text-slate-650 leading-relaxed font-semibold">
                    We believe everyday joint protection success depends entirely on combining Knee-Lace anatomical alignments with micro-habit postural adjustments. This program syncs daily user movement safety indicators with our structural compression matrices to protect your healing cartilage.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 font-semibold border border-slate-100 italic text-center">
                  "Movement is the natural medicine for your knees. With the right support, every step becomes an act of healing."
                </div>
              </div>
            </div>
          )}

          {activeTab === "Privacy" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              
              {/* Privacy Header */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <span className="text-[10px] font-bold text-[#142d28] bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                  KNEE-LACE DATA PROTECTION
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-3 uppercase tracking-wide">
                  BIOMECHANIC DATA & PRIVACY POLICY
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-semibold leading-relaxed">
                  Your privacy is structurally anchored into our software architecture. Knee-Care safely isolates and encrypts all physical movement records, knee tension logs, and response telemetry generated while utilizing the Knee-Lace support system.
                </p>
              </div>

              {/* Security and compliance info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-[#142d28] text-lg uppercase tracking-wide">SECURE TELEMETRY CORE</h3>
                  <p className="text-sm text-slate-650 leading-relaxed font-semibold">
                    All user telemetry, pain scale logs, and profile metrics are stored securely under local device sandbox environments. We strictly process transit keys to verify Razorpay VIP entitlements without ever sharing your clinical recovery profile with third-party networks.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 font-semibold border border-slate-100 italic text-center">
                  "Your orthopedic wellness and physical movement compliance remain fully anonymous under military-grade standard encryptions."
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Beautiful Corporate Footer precisely matching user request visual anchors */}
      <footer className="bg-[#142d28] text-white border-t border-[#1a3a33] py-8 sm:py-12 mt-16 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6">
            
            {/* Left elements */}
            <div className="flex items-center space-x-2">
              <span className="text-xl">🦵</span>
              <span className="font-extrabold text-white text-base tracking-tight uppercase">Knee-Care</span>
            </div>

            {/* Right links */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[#a5b5b0] text-[11px] tracking-wider uppercase font-extrabold">
              <button onClick={() => setActiveTab("About")} className="hover:text-white transition cursor-pointer">ABOUT</button>
              <span>|</span>
              <button onClick={() => setActiveTab("Privacy")} className="hover:text-white transition cursor-pointer">PRIVACY</button>
              <span>|</span>
              <button onClick={() => setActiveTab("Help")} className="hover:text-white transition cursor-pointer">CONTACT</button>
              <span>|</span>
              <button onClick={() => { setActiveTab("Help"); setHelpSubTab("chat"); }} className="hover:text-white transition cursor-pointer">SUPPORT</button>
            </div>

          </div>

          {/* Copyright section */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 font-medium text-[11px] gap-2">
            <p>© 2026 Knee-Care. All rights reserved.</p>
            <p className="text-right text-[#a5b5b0]/65 text-[10px]">All clinical movement recovery strategies are registered post-surgical protocols.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
