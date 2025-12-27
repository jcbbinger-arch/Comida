
import React, { useMemo, useState } from 'react';
import { Recipe, AppSettings, Allergen, ALLERGEN_LIST } from '../types';
import { Printer, ArrowLeft, AlertOctagon, Utensils, Thermometer, ChefHat, Users, Clock, UtensilsCrossed, MessageSquare, Info, Camera } from 'lucide-react';

interface RecipeViewProps {
  recipe: Recipe;
  settings: AppSettings;
  onBack: () => void;
}

export const RecipeView: React.FC<RecipeViewProps> = ({ recipe, settings, onBack }) => {
  const [dynamicPax, setDynamicPax] = useState<number>(recipe.yieldQuantity);
  
  const paxRatio = useMemo(() => {
    return dynamicPax / recipe.yieldQuantity;
  }, [dynamicPax, recipe.yieldQuantity]);

  const allAllergens = useMemo(() => {
    const set = new Set<Allergen>();
    recipe.subRecipes?.forEach(sub => {
      sub.ingredients?.forEach(ing => {
        ing.allergens?.forEach(a => set.add(a));
      });
    });
    return Array.from(set);
  }, [recipe]);

  const scaleQuantity = (qtyStr: string): string => {
    const num = parseFloat(qtyStr.replace(',', '.'));
    if (isNaN(num)) return qtyStr;
    const scaled = num * paxRatio;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(scaled < 1 ? 3 : 2).replace('.', ',');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:p-0 print:bg-white font-sans text-slate-900">
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors uppercase text-[10px] tracking-widest">
          <ArrowLeft size={20} />
          <span>Volver al Panel</span>
        </button>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Users size={16} className="text-indigo-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escalar Pax:</span>
            <input 
              type="number" 
              value={dynamicPax} 
              onChange={e => setDynamicPax(Math.max(1, Number(e.target.value)))}
              className="w-12 font-black text-center text-indigo-600 outline-none border-b-2 border-indigo-100 focus:border-indigo-500 bg-transparent"
            />
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg font-black uppercase text-xs tracking-widest">
            <Printer size={18} />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full overflow-hidden p-10 print:p-8 border border-slate-200 print:border-none rounded-[2rem] print:rounded-none">
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-3">
              <span className="bg-emerald-50 text-emerald-600 font-black text-[9px] px-3 py-1 rounded border border-emerald-100 uppercase tracking-widest">
                {recipe.category}
              </span>
           </div>
           <div className="flex flex-col items-end">
             {settings.instituteLogo ? (
               <img src={settings.instituteLogo} alt="IES Logo" className="h-16 w-auto object-contain" />
             ) : (
               <span className="font-black text-xs uppercase opacity-20">{settings.instituteName}</span>
             )}
           </div>
        </div>

        <h1 className="text-5xl font-serif font-black text-slate-900 leading-[1.1] mb-6 tracking-tighter uppercase">
          {recipe.name}
        </h1>
        
        {/* BLOQUE DE EXPLICACIÓN COMERCIAL */}
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-10"><MessageSquare size={100}/></div>
           <div className="bg-amber-500 p-4 rounded-2xl text-slate-900 shrink-0 shadow-xl shadow-amber-500/20">
             <MessageSquare size={32} />
           </div>
           <div className="flex-grow">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">Explicación Sugerente (Manual para Sala)</p>
             <p className="text-lg font-medium italic leading-relaxed text-slate-100 font-serif">
               "{recipe.serviceDetails.clientDescription || 'No se ha definido una explicación comercial para este plato. Definir para mejorar la comunicación con el cliente.'}"
             </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-5 space-y-10">
             <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-slate-100">
                {recipe.photo ? (
                  <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><ChefHat size={60} /></div>
                )}
             </div>

             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-tighter text-sm mb-4 border-b border-slate-200 pb-2">
                   <Utensils size={16} /> ESCANDALLO {dynamicPax} PAX
                </h3>
                <div className="space-y-8">
                   {recipe.subRecipes.map((sub, sIdx) => (
                     <div key={sub.id} className="break-inside-avoid">
                        <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-3 flex items-center gap-2">
                          <span className="bg-emerald-100 w-5 h-5 flex items-center justify-center rounded-full text-[8px]">{sIdx + 1}</span>
                          {sub.name}
                        </h4>
                        <table className="w-full text-[11px] text-slate-700">
                          <tbody className="divide-y divide-slate-100">
                             {sub.ingredients.map((ing, iIdx) => (
                               <tr key={iIdx}>
                                  <td className="py-2.5 font-bold uppercase tracking-tight leading-none">{ing.name}</td>
                                  <td className="py-2.5 text-right font-black text-slate-900 text-xs">{scaleQuantity(ing.quantity)}</td>
                                  <td className="py-2.5 pl-2 text-slate-400 font-bold uppercase text-[9px] text-right">{ing.unit}</td>
                               </tr>
                             ))}
                          </tbody>
                        </table>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="md:col-span-7 space-y-10">
             <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-inner">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-8 flex items-center justify-center gap-2">
                   <AlertOctagon size={14} className="text-amber-500" /> CONTROL DE ALÉRGENOS
                </h4>
                <div className="grid grid-cols-7 gap-y-8 gap-x-2">
                   {ALLERGEN_LIST.map(allergen => {
                     const isPresent = allAllergens.includes(allergen);
                     return (
                       <div key={allergen} className="flex flex-col items-center gap-2 group">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center relative transition-all ${isPresent ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-200 ring-4 ring-rose-50' : 'border-slate-50 bg-slate-20/50 opacity-20'}`}>
                             {isPresent && <div className="w-4 h-4 bg-rose-600 rounded-full animate-pulse"></div>}
                          </div>
                          <span className={`text-[8px] font-black uppercase text-center leading-[1.1] ${isPresent ? 'text-slate-900' : 'text-slate-300'}`}>
                            {allergen.split(' ')[0]}
                          </span>
                       </div>
                     );
                   })}
                </div>
             </div>

             <div className="space-y-12">
                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-sm mb-4 border-b border-slate-900 pb-2">PROCESO TÉCNICO DE COCINA</h3>
                {recipe.subRecipes.map((sub, sIdx) => (
                  <div key={sIdx} className="break-inside-avoid space-y-6">
                     <h4 className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-3">
                        <span className="bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-lg text-[10px]">{sIdx + 1}</span>
                        {sub.name}
                     </h4>
                     
                     <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        {sub.photos && sub.photos.length > 0 && (
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {sub.photos.map((p, pIdx) => (
                                <div key={pIdx} className="relative aspect-[4/3] group">
                                  <img src={p} alt={`${sub.name} step ${pIdx+1}`} className="w-full h-full object-cover rounded-xl shadow-md border border-slate-200" />
                                </div>
                              ))}
                           </div>
                        )}
                        <div className="text-xs text-slate-600 leading-relaxed text-justify whitespace-pre-wrap font-serif italic border-t border-slate-200 pt-4 mt-2">
                          {sub.instructions || "Técnica no definida."}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* FICHA TÉCNICA DE SERVICIO */}
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] mt-12 print:mt-6">
           <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
              <Clock size={32} className="text-amber-500" />
              <div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter">Ficha de Pase y Servicio</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Información clave para los compañeros de sala</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-full">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Temperatura Óptima</p>
                 <div className="flex items-center gap-3">
                   <Thermometer size={20} className="text-rose-500" />
                   <span className="text-sm font-black text-amber-500">{recipe.serviceDetails.servingTemp || '--'}</span>
                 </div>
              </div>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-full">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Técnica de Servicio</p>
                 <div className="flex items-start gap-3">
                    <Info size={18} className="text-indigo-400 mt-1 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-tight text-slate-200">{recipe.serviceDetails.serviceType}</span>
                 </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-full">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Cubertería Requerida</p>
                 <div className="flex items-start gap-3">
                    <UtensilsCrossed size={20} className="text-amber-400 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase leading-snug">{recipe.serviceDetails.cutlery || 'Estándar'}</span>
                 </div>
              </div>

              <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20 flex flex-col justify-between h-full">
                 <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-4">Rendimiento (PAX)</p>
                 <div className="flex items-center gap-3">
                   <Users size={24} className="text-amber-500" />
                   <span className="text-2xl font-black text-amber-500">{dynamicPax} {recipe.yieldUnit}</span>
                 </div>
              </div>
           </div>

           <div className="mt-8 bg-white/5 p-8 rounded-3xl border border-white/5">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Protocolo de Emplatado y Acabado (Finalización)</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                 {recipe.platingInstructions || "Seguir protocolo estándar de emplatado para esta categoría."}
              </p>
           </div>
        </div>

        <div className="mt-12 text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.5em] print:text-slate-900 border-t border-slate-50 pt-10">
           {settings.instituteName} • DEPARTAMENTO DE HOSTELERÍA • {settings.teacherName}
        </div>
      </div>
    </div>
  );
};
