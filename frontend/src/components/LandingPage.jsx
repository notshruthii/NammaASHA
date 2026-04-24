import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, MessageSquareText, Heart, ArrowRight, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    // h-dvh (Dynamic Viewport Height) ensures it fits perfectly even with mobile browser bars
    <div className="h-dvh w-full bg-white flex flex-col overflow-hidden font-sans">
      
      

      {/* 2. HERO IMAGE (approx 30% height) */}
      <div className="h-[40%] w-full relative bg-slate-100">
        <img 
          src="/asha-photo.png" 
          alt="Healthcare Worker Hero" 
          className="w-full h-full object-cover"
           
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      {/* 3. CONTENT AREA (approx 62% height - distributed with flex-between) */}
      <div className="h-[62%] px-6 py-4 flex flex-col justify-between items-center text-center">
        
        {/* Top Text Group */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-2">
            <Sparkles size={14} className="text-[#2d4a3e] fill-[#2d4a3e]/20" />
            <span className="text-[#2d4a3e] text-[9px] font-black tracking-[0.2em] uppercase">
              ASHA Health Assistant
            </span>
          </div>

          <h2 className="text-[22px] font-black text-[#2d4a3e] leading-tight mb-2">
            Empowering Field Workers.<br />
            <span className="text-[#2d4a3e]/60">Saving Lives.</span>
          </h2>

          <p className="text-slate-500 text-[13px] leading-snug max-w-[280px]">
            A digital-first platform helping India's frontline heroes manage care with AI.
          </p>
        </div>

        {/* Feature Grid (Condensed) */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
            <div className="bg-emerald-500/10 p-2 rounded-lg mb-2 text-[#2d4a3e]">
              <ClipboardList size={20} />
            </div>
            <h3 className="font-bold text-[11px] text-[#102A43]">Digital Records</h3>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
            <div className="bg-emerald-500/10 p-2 rounded-lg mb-2 text-[#2d4a3e]">
              <MessageSquareText size={20} />
            </div>
            <h3 className="font-bold text-[11px] text-[#102A43]">AI Advisor</h3>
          </div>
        </div>

        {/* Action Group */}
        <div className="w-full max-w-sm flex flex-col items-center">
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#2d4a3e] text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            Get Started <ArrowRight size={18} />
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-4 opacity-50">
            <Heart size={12} className="text-rose-500 fill-rose-500" />
            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Supporting NHM Karnataka</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;