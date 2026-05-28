import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Zap, Leaf, Coffee, Egg, Utensils, ChevronDown, Lock, ArrowRight, Sparkles } from '../App';
import { Card, Section, PageWrapper } from '../App';
import { RECIPES, TEAS, Tea } from '../constants';
import { usePremium } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const TeaItem: React.FC<{ tea: Tea }> = ({ tea }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasDetails = !!(tea.description || tea.benefits || tea.preparation);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, shadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
      whileTap={hasDetails ? { scale: 0.98 } : {}}
      onClick={() => hasDetails && setIsOpen(!isOpen)}
      className={`p-10 rounded-[3rem] border border-white transition-all text-center group ${hasDetails ? 'cursor-pointer' : ''} ${isOpen ? 'bg-white border-accent/20 ring-4 ring-accent/5 shadow-2xl' : 'bg-white/40 shadow-sm'}`}
    >
      <motion.div 
        animate={isOpen ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
        className={`w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-colors ${isOpen ? 'bg-accent text-primary shadow-lg shadow-accent/20' : 'bg-primary/5 text-primary'}`}
      >
        <Coffee size={28} />
      </motion.div>
      <h4 className={`text-2xl font-black text-primary mb-3 transition-colors tracking-tight ${isOpen ? 'text-accent' : 'group-hover:text-accent'}`}>{tea.name}</h4>
      <p className="text-base text-gray-500 leading-relaxed font-medium mb-4">{tea.benefit}</p>
      
      {hasDetails && (
        <div className="flex justify-center text-primary/20">
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown size={18} />
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {isOpen && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden text-left mt-4 pt-4 border-t border-primary/10"
          >
            {tea.description && <p className="text-xs text-gray-600 mb-4 leading-relaxed italic">{tea.description}</p>}
            
            {tea.benefits && (
              <div className="mb-4">
                <h5 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Key Benefits</h5>
                <ul className="space-y-1">
                  {tea.benefits.map((b, i) => (
                    <li key={i} className="text-[10px] text-gray-500 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-accent" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tea.preparation && (
              <div>
                <h5 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Preparation</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed">{tea.preparation}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NutritionItem = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
    className="flex gap-8 items-start p-8 hover:shadow-2xl rounded-[2.5rem] transition-all border border-transparent hover:border-white group"
  >
    <div className="w-16 h-16 rounded-[1.5rem] bg-secondary flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-110 group-hover:bg-accent transition-all duration-500">
      <Icon size={32} />
    </div>
    <div>
      <h4 className="text-2xl font-black text-primary mb-2 tracking-tight group-hover:text-accent transition-colors">{title}</h4>
      <p className="text-base text-gray-400 font-medium leading-[1.7]">{description}</p>
    </div>
  </motion.div>
);

export const DietSection: React.FC = () => {
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [herbalOpen, setHerbalOpen] = useState(false);
  const isPremium = usePremium();
  const navigate = useNavigate();

  const handleLockedClick = () => {
    navigate('/checkout');
  };

  return (
    <PageWrapper>
      <header className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
          <Utensils size={14} /> Structural Nutrition
        </div>
        <h1 className="text-4xl font-black text-primary mb-4 tracking-tight">Joint Preservation Fuel</h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto text-lg leading-relaxed">Optimize your biochemistry with foods that reduce inflammation and build collagen.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="px-4 mb-4">
            <h3 className="text-xs font-black text-accent uppercase tracking-[0.3em]">Phase 1: Foundation</h3>
          </div>
          <div className="space-y-2">
            <NutritionItem 
              icon={Droplets} 
              title="Liquid Integrity" 
              description="Hydration is the primary driver of synovial fluid production, ensuring smooth joint mechanics." 
            />
            <NutritionItem 
              icon={Leaf} 
              title="Anti-Inflammatory Hub" 
              description="Polyphenols found in deep pigments neutralize oxidative stress in joint tissues." 
            />
            <NutritionItem 
              icon={Zap} 
              title="Electrolyte Balance" 
              description="Critical mineral ratios prevent muscular pull and maintain nerve conductivity." 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="px-4 mb-4">
            <h3 className="text-xs font-black text-accent uppercase tracking-[0.3em]">Phase 2: Joint Shielding</h3>
          </div>
          <div className="space-y-2">
            <NutritionItem 
              icon={Egg} 
              title="Amino Reconstruction" 
              description="High-density proteins provide the literal bricks for cartilaginous preservation and muscle synthesis." 
            />
            <NutritionItem 
              icon={Coffee} 
              title="Strategic Restriction" 
              description="Eliminating metabolic friction by minimizing refined sugars and artificial additives." 
            />
            <NutritionItem 
              icon={Utensils} 
              title="Lipid Lubrication" 
              description="Omega-3 fatty acids act as high-grade internal lubricant for structural hinges." 
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-md rounded-[3.5rem] overflow-hidden relative group/card border border-white">
          <button 
            onClick={isPremium ? () => setRecipesOpen(!recipesOpen) : handleLockedClick}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl ${isPremium ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-400'} flex items-center justify-center shadow-inner`}>
                {isPremium ? <Utensils size={28} /> : <Lock size={28} />}
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-black text-primary group-hover:text-accent transition-colors tracking-tight">Anti-Inflammatory Recipes</h2>
                {!isPremium ? (
                  <div className="inline-flex items-center gap-1.5 mt-1 bg-accent/10 px-2 py-0.5 rounded-lg">
                    <span className="text-[10px] text-accent font-black uppercase tracking-widest">Premium Resource</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 font-medium mt-1">Anti-inflammatory meal frameworks</p>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: recipesOpen ? 180 : 0 }}
              className="text-gray-300 group-hover:text-accent transition-all bg-muted rounded-full p-2"
            >
              {isPremium ? <ChevronDown size={24} /> : <ArrowRight size={20} />}
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isPremium && recipesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {RECIPES.map((recipe, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="p-8 rounded-[2.5rem] bg-white border border-white shadow-sm hover:shadow-2xl transition-all group/item"
                    >
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-6 text-accent">
                        <Leaf size={20} />
                      </div>
                      <h4 className="text-xl font-bold text-primary mb-3 group-hover/item:text-accent transition-colors tracking-tight">
                        {recipe.name}
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{recipe.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isPremium && (
            <div className="absolute inset-x-0 bottom-0 top-[120px] bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col items-center justify-center pointer-events-none p-12">
              <div className="bg-primary text-secondary px-8 py-4 rounded-[2rem] text-sm font-bold shadow-2xl flex items-center gap-3 animate-bounce">
                <Sparkles size={20} className="text-accent" /> Unlock Structural Recipes
              </div>
              <p className="text-gray-400 text-xs font-bold mt-4 uppercase tracking-widest">Premium Content</p>
            </div>
          )}
        </Card>

        <Card className="p-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-md rounded-[3.5rem] overflow-hidden relative group/card border border-white">
          <button 
            onClick={isPremium ? () => setHerbalOpen(!herbalOpen) : handleLockedClick}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl ${isPremium ? 'bg-primary/5 text-primary' : 'bg-gray-100 text-gray-400'} flex items-center justify-center shadow-inner`}>
                {isPremium ? <Coffee size={28} /> : <Lock size={28} />}
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-black text-primary group-hover:text-accent transition-colors tracking-tight">Herbal Infusions</h2>
                {!isPremium ? (
                  <div className="inline-flex items-center gap-1.5 mt-1 bg-accent/10 px-2 py-0.5 rounded-lg">
                    <span className="text-[10px] text-accent font-black uppercase tracking-widest">Premium Resource</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 font-medium mt-1">Specific joint-support teas</p>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: herbalOpen ? 180 : 0 }}
              className="text-gray-300 group-hover:text-accent transition-all bg-muted rounded-full p-2"
            >
              {isPremium ? <ChevronDown size={24} /> : <ArrowRight size={20} />}
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isPremium && herbalOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {TEAS.map((tea, i) => (
                    <TeaItem key={i} tea={tea} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isPremium && (
            <div className="absolute inset-x-0 bottom-0 top-[120px] bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col items-center justify-center pointer-events-none p-12">
              <div className="bg-primary text-secondary px-8 py-4 rounded-[2rem] text-sm font-bold shadow-2xl flex items-center gap-3">
                <Coffee size={20} className="text-accent" /> Unlock Herbal Infusions
              </div>
              <p className="text-gray-400 text-xs font-bold mt-4 uppercase tracking-widest">Premium Content</p>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default DietSection;
