import React, { useState, useEffect } from 'react';
import { ChefHat, BookOpen, ShieldCheck, Calendar, ArrowRight, School, User, Database } from 'lucide-react';
import { AppSettings } from '../types';

interface WelcomeScreenProps {
  settings: AppSettings;
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ settings, onEnter }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] bg-slate-800/30 rounded-full blur-[100px]"></div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      <div className={`max-w-6xl w-full z-10 transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800/50 min-h-[600px]">
          
          {/* LEFT: Hero / Branding Section */}
          <div className="relative bg-slate-900 p-10 lg:p-16 flex flex-col justify-between text-white overflow-hidden">
             {/* Decorative circle */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-full pointer-events-none"></div>
             
             {/* Identity Header */}
             <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                   <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                      <ChefHat size={32} className="text-amber-400" />
                   </div>
                   <div>
                      <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide">Mis Recetas</h1>
                      <p className="text-slate-400 text-sm tracking-widest uppercase">Gestión Gastronómica</p>
                   </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-white/10">
                   <div className="flex items-center gap-4">
                      {settings.instituteLogo ? (
                        <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center shrink-0">
                           <img src={settings.instituteLogo} alt="IES" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                           <School size={24} className="text-slate-300" />
                        </div>
                      )}
                      <div>
                         <p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold mb-0.5">Centro Educativo</p>
                         <h3 className="text-lg font-medium text-slate-100 leading-tight">{settings.instituteName}</h3>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      {settings.teacherLogo ? (
                        <div className="w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0 border-2 border-white/20">
                           <img src={settings.teacherLogo} alt="Profesor" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                           <User size={24} className="text-slate-300" />
                        </div>
                      )}
                      <div>
                         <p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold mb-0.5">Profesor Responsable</p>
                         <h3 className="text-lg font-medium text-slate-100 leading-tight">{settings.teacherName}</h3>
                      </div>
                   </div>
                </div>
             </div>

             {/* Bottom Decoration */}
             <div className="relative z-10 pt-12 mt-auto">
                <p className="text-slate-400 text-xs italic border-l-2 border-amber-500 pl-4">
                  "La cocina es un lenguaje mediante el cual se puede expresar armonía, felicidad, belleza, poesía, complejidad, magia, humor, provocación, cultura."
                </p>
             </div>
          </div>

          {/* RIGHT: Features / Action */}
          <div className="bg-slate-50 p-10 lg:p-16 flex flex-col justify-center">
             <div className="mb-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Bienvenido al Panel de Control</h2>
                <p className="text-slate-500">Herramientas digitales para la estandarización y control de procesos culinarios.</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                <FeatureBox 
                  icon={<BookOpen size={20} className="text-blue-600"/>}
                  title="Fichas Técnicas"
                  desc="Escandallos y procesos"
                />
                <FeatureBox 
                  icon={<ShieldCheck size={20} className="text-red-600"/>}
                  title="Alérgenos"
                  desc="Control seguridad alimentaria"
                />
                <FeatureBox 
                  icon={<Calendar size={20} className="text-amber-600"/>}
                  title="Menús y Eventos"
                  desc="Planificación de servicios"
                />
                <FeatureBox 
                  icon={<Database size={20} className="text-emerald-600"/>}
                  title="Base de Datos"
                  desc="Gestión de materias primas"
                />
             </div>

             <button 
               onClick={onEnter}
               className="group w-full bg-slate-900 text-white text-lg font-medium py-4 px-6 rounded-xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden"
             >
               <span className="relative z-10">Acceder a la Aplicación</span>
               <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
             </button>
             
             <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                  Versión 1.0 • IES La Flota
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const FeatureBox = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-slate-300 flex items-start gap-3">
    <div className="bg-slate-50 p-2 rounded-lg shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  </div>
);