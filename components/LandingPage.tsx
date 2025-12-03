import React from 'react';
import { AppSettings } from '../types';
import { ChefHat, ArrowRight, School, User } from 'lucide-react';

interface LandingPageProps {
  settings: AppSettings;
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ settings, onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-fade-in">
        
        {/* Left Side - Identity */}
        <div className="bg-slate-50 p-8 md:p-12 md:w-1/2 flex flex-col justify-between border-r border-slate-100">
           <div className="space-y-10">
              {/* Institute */}
              <div className="flex items-start gap-5">
                 <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200 p-2 shrink-0">
                    {settings.instituteLogo ? (
                      <img src={settings.instituteLogo} alt="IES" className="w-full h-full object-contain" />
                    ) : (
                      <School className="text-slate-400" size={36} />
                    )}
                 </div>
                 <div>
                    <span className="inline-block py-1 px-2 rounded bg-slate-200 text-[10px] uppercase tracking-wider text-slate-600 font-bold mb-1">Centro Educativo</span>
                    <h2 className="text-2xl font-bold text-slate-800 leading-tight">{settings.instituteName}</h2>
                 </div>
              </div>

              {/* Teacher */}
              <div className="flex items-start gap-5">
                 <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                    {settings.teacherLogo ? (
                      <img src={settings.teacherLogo} alt="Profesor" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-slate-400" size={36} />
                    )}
                 </div>
                 <div>
                    <span className="inline-block py-1 px-2 rounded bg-amber-100 text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">Profesor Responsable</span>
                    <h2 className="text-2xl font-bold text-slate-800 leading-tight">{settings.teacherName}</h2>
                 </div>
              </div>
           </div>

           <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-400 flex justify-between items-center">
              <span>Departamento de Hostelería y Turismo</span>
              <span>v1.0</span>
           </div>
        </div>

        {/* Right Side - App Entry */}
        <div className="p-8 md:p-12 md:w-1/2 bg-white flex flex-col justify-center items-center text-center relative">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <ChefHat size={120} />
           </div>

           <div className="w-24 h-24 bg-amber-500 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-amber-500/30 rotate-3 transition-transform hover:rotate-6">
              <ChefHat size={48} />
           </div>
           
           <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Mis Recetas</h1>
           <p className="text-lg text-slate-500 mb-10 max-w-xs mx-auto leading-relaxed font-light">
             Gestión integral de fichas técnicas, control de alérgenos y planificación de servicios.
           </p>

           <button 
             onClick={onEnter}
             className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-xl hover:shadow-2xl w-full md:w-auto justify-center"
           >
             Acceder a la Aplicación
             <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

      </div>
    </div>
  );
};