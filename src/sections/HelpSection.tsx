import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Send, Sparkles } from '../App';
import { cn } from '../lib/utils';
import { Card, PageWrapper } from '../App';
import { getKneeCareTip } from '../services/geminiService';

const ChatBubble: React.FC<{ message: string, isBot: boolean }> = ({ message, isBot }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, x: isBot ? -10 : 10 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className={cn(
      "p-4 rounded-2xl max-w-[85%] text-sm font-medium leading-relaxed mb-4 shadow-sm",
      isBot ? "bg-muted text-primary rounded-tl-none self-start" : "bg-primary text-secondary rounded-tr-none self-end ml-auto"
    )}
  >
    {message}
  </motion.div>
);

export const HelpSection: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string, isBot: boolean }[]>([
    { text: "Hello! I'm your Knee-Care assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setLoading(true);

    try {
      const response = await getKneeCareTip(userMsg);
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "I'm sorry, I couldn't process that. Please try again.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const suggestions = [
    "Reduce knee stiffness",
    "Best recovery exercise",
    "Foods for joint support",
    "Relaxation routine"
  ];

  return (
    <PageWrapper>
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-primary mb-3">AI Support Assistant</h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto">Get instant guidance on knee care, recovery techniques, and daily habit tips.</p>
      </header>

      <Card className="max-w-2xl mx-auto border-none shadow-2xl p-0 h-[650px] flex flex-col overflow-hidden bg-white">
        <div className="p-6 border-b border-border/10 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Knee Assistant Online</span>
          </div>
          <MessageCircle size={20} className="text-primary/20" />
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-4 custom-scrollbar"
        >
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg.text} isBot={msg.isBot} />
          ))}
          {loading && (
            <div className="flex gap-1 p-4 bg-muted w-16 rounded-2xl animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
            </div>
          )}
        </div>

        <div className="p-6 bg-muted/30 border-t border-border/10">
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((suggestion, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(var(--primary), 0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 rounded-full border border-primary/10 bg-white text-[11px] font-bold text-primary shadow-sm hover:shadow-md transition-all whitespace-nowrap"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>

          <div className="relative flex items-center gap-3">
            <input 
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about knee care..."
              className="flex-1 bg-white border border-border/50 px-5 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all outline-none pr-14"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 w-10 h-10 bg-primary text-secondary rounded-xl flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 text-center font-medium">Verified knee-care tips powered by Gemini AI Specialist</p>
        </div>
      </Card>
      
      <div className="mt-12 max-w-2xl mx-auto">
        <Card className="bg-blue-50/50 border-none">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1 text-sm">Expert Tip</h4>
              <p className="text-[10px] text-blue-800/60 font-medium leading-relaxed">Ask about "Knee recovery stretches" or "Healthy knee diet" to get started with research-backed guidance.</p>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default HelpSection;
