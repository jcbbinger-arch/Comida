import React, { useState, useEffect } from 'react';
import { ChefHat, BookOpen, ShieldCheck, Calendar, ArrowRight, School, User } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-slate-700/20 rounded-full blur-3xl"></div>
      </div>

      <div className={`max-w-5xl w-full z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="flex flex-col md:flex-row">
            
            {/* Left Column: Identity */}
            <div className="md:w-5/12 bg-slate-50 p-8 md:p-12 flex flex-col justify-between border-r border-gray-100 relative">
               <div className="space-y-8 relative z-10">
                  {/* Logos Section */}
                  <div className="space-y-6">
                    {/* Institute */}
                    <div className="flex items-center gap-4 group">
                       <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center p-2 overflow-hidden transition-transform group-hover:scale-105 duration-300">
                          {settings.instituteLogo ? (
                            <img src={settings.instituteLogo} alt="Logo IES" className="w-full h-full object-contain" />
                          ) : (
                            <School className="text-slate-400" size={32} />
                          )}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Centro Educativo</p>
                          <h2 className="text-lg font-bold text-slate-800 leading-tight">{settings.instituteName}</h2>
                       </div>
                    </div>

                    {/* Teacher */}
                    <div className="flex items-center gap-4 group">
                       <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-300">
                          {settings.teacherLogo ? (
                            <img src={settings.teacherLogo} alt="Logo Profesor" className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-slate-400" size={32} />
                          )}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profesor Responsable</p>
                          <h2 className="text-lg font-bold text-slate-800 leading-tight">{settings.teacherName}</h2>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="mt-12">
                  <div className="w-12 h-1 bg-amber-500 rounded-full mb-4"></div>
                  <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">Mis Recetas</h3>
                  <p className="text-slate-500">Gestión Integral de Fichas Técnicas de Cocina y Pastelería.</p>
               </div>
            </div>

            {/* Right Column: Features & Action */}
            <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white">
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <FeatureCard 
                    icon={<BookOpen className="text-amber-600" />}
                    title="Fichas Técnicas"
                    desc="Estandarización de recetas, cálculo de costes y procesos detallados."
                  />
                  <FeatureCard 
                    icon={<ShieldCheck className="text-red-600" />}
                    title="Control de Alérgenos"
                    desc="Detección automática y base de datos de productos actualizada."
                  />
                  <FeatureCard 
                    icon={<Calendar className="text-indigo-600" />}
                    title="Planificador de Menús"
                    desc="Organización de eventos, órdenes de servicio y matrices."
                  />
                  <FeatureCard 
                    icon={<ChefHat className="text-slate-700" />}
                    title="Gestión Profesional"
                    desc="Herramientas digitales para el control de la producción culinaria."
                  />
               </div>

               <div className="flex justify-center md:justify-start">
                 <button 
                   onClick={onEnter}
                   className="group relative px-8 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all duration-300 overflow-hidden w-full md:w-auto"
                 >
                   <span className="relative z-10 flex items-center justify-center gap-3">
                     Entrar a la Aplicación <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                   </span>
                   <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 </button>
               </div>

            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-xs opacity-60">
          &copy; {new Date().getFullYear()} {settings.instituteName} • Desarrollado para el Departamento de Hostelería
        </div>

      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-lg transition-colors duration-300">
    <div className="p-3 bg-slate-50 rounded-lg shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);