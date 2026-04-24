import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, MessageSquareText, Heart, ArrowRight, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-start min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-white">
        
        {/* BRANDING HEADER */}
        <div className="text-center py-4 bg-white">
          <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
            Namma<span className="text-[#2d4a3e]">ASHA</span>
          </h1>
        </div>

        {/* HERO IMAGE SECTION */}
        <div className="relative h-[320px] bg-blue-50 overflow-hidden">
          <img 
            src="/asha_bg.png" 
            alt="Healthcare Worker Hero" 
            className="w-full h-full object-cover object-center"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>

        {/* CONTENT AREA */}
        <div className="px-6 pb-10 pt-2 flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles size={16} className="text-[#2d4a3e] fill-[#2d4a3e]/20" />
            <span className="text-[#2d4a3e] text-[10px] font-black tracking-[0.2em] uppercase">
              ASHA Health Assistant
            </span>
          </div>

          <h2 className="text-[22px] font-black text-center text-[#2d4a3e] leading-tight mb-3">
            Empowering Field Workers.<br />
            <span className="text-[#2d4a3e]">Saving Lives.</span>
          </h2>

          <p className="text-center text-slate-400 text-xs font-medium leading-relaxed mb-8 px-4">
            A digital-first platform designed to help India's frontline heroes manage data and patient care with AI.
          </p>

          {/* FEATURE HIGHLIGHTS */}
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center text-center border border-slate-100">
              <div className="bg-emerald-500/10 p-2 rounded-xl mb-2 text-emerald-600">
                <ClipboardList size={20} />
              </div>
              <h3 className="font-bold text-xs text-[#102A43]">Digital Records</h3>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center text-center border border-slate-100">
              <div className="bg-emerald-500/10 p-2 rounded-xl mb-2 text-emerald-600">
                <MessageSquareText size={20} />
              </div>
              <h3 className="font-bold text-xs text-[#102A43]">AI Advisor</h3>
            </div>
          </div>

          {/* MAIN ACTION */}
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#2d4a3e] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-[#005bb5] active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            Get Started <ArrowRight size={18} />
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-6 opacity-60">
            <Heart size={14} className="text-rose-500 fill-rose-500" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Proudly supporting ASHAs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;