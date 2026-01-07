
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
          <ArrowLeft size={18} />
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
              className="w-10 font-black text-center text-indigo-600 outline-none border-b-2 border-indigo-100 focus:border-indigo-500 bg-transparent"
            />
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg font-black uppercase text-xs tracking-widest">
            <Printer size={18} />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full overflow-hidden p-8 print:p-6 border border-slate-200 print:border-none rounded-[1.5rem] print:rounded-none">
        {/* Cabecera compacta */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
           <div className="flex flex-col gap-1">
              <span className="bg-emerald-50 text-emerald-600 font-black text-[8px] px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest inline-block w-fit">
                {recipe.category}
              </span>
              <h1 className="text-3xl font-serif font-black text-slate-900 leading-tight tracking-tighter uppercase">
                {recipe.name}
              </h1>
           </div>
           <div className="flex flex-col items-end">
             {settings.instituteLogo ? (
               <img src={settings.instituteLogo} alt="IES Logo" className="h-12 w-auto object-contain" />
             ) : (
               <span className="font-black text-[10px] uppercase opacity-20">{settings.instituteName}</span>
             )}
           </div>
        </div>
        
        {/* BLOQUE DE EXPLICACIÓN COMERCIAL - Más compacto */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl mb-8 flex items-start gap-6 relative overflow-hidden">
           <div className="bg-amber-500 p-3 rounded-xl text-slate-900 shrink-0 shadow-lg">
             <MessageSquare size={24} />
           </div>
           <div className="flex-grow">
             <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">Explicación Sugerente (Servicio)</p>
             <p className="text-base font-medium italic leading-snug text-slate-100 font-serif">
               "{recipe.serviceDetails.clientDescription || 'No definida.'}"
             </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          <div className="md:col-span-4 space-y-6">
             {recipe.photo && (
               <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-100">
                  <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
               </div>
             )}

             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h3 className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-tighter text-xs mb-3 border-b border-slate-200 pb-1">
                   <Utensils size={14} /> ESCANDALLO {dynamicPax} PAX
                </h3>
                <div className="space-y-6">
                   {recipe.subRecipes.map((sub, sIdx) => (
                     <div key={sub.id} className="break-inside-avoid">
                        <h4 className="text-[9px] font-black text-emerald-700 uppercase mb-2 flex items-center gap-2">
                          <span className="bg-emerald-100 w-4 h-4 flex items-center justify-center rounded-full text-[7px]">{sIdx + 1}</span>
                          {sub.name}
                        </h4>
                        <table className="w-full text-[10px] text-slate-700">
                          <tbody className="divide-y divide-slate-100">
                             {sub.ingredients.map((ing, iIdx) => (
                               <tr key={iIdx}>
                                  <td className="py-1.5 font-bold uppercase tracking-tight">{ing.name}</td>
                                  <td className="py-1.5 text-right font-black text-slate-900">{scaleQuantity(ing.quantity)}</td>
                                  <td className="py-1.5 pl-1 text-slate-400 font-bold uppercase text-[8px] text-right">{ing.unit}</td>
                               </tr>
                             ))}
                          </tbody>
                        </table>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="md:col-span-8 space-y-8">
             {/* ALÉRGENOS REDIMENSIONADOS */}
             <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-inner">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-2">
                   <AlertOctagon size={12} className="text-amber-500" /> CONTROL DE ALÉRGENOS
                </h4>
                <div className="grid grid-cols-7 gap-y-4 gap-x-1">
                   {ALLERGEN_LIST.map(allergen => {
                     const isPresent = allAllergens.includes(allergen);
                     return (
                       <div key={allergen} className="flex flex-col items-center gap-1 group">
                          <div className={`w-7 h-7 rounded-full border flex items-center justify-center relative transition-all ${isPresent ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50/30 opacity-20'}`}>
                             {isPresent && <div className="w-2.5 h-2.5 bg-rose-600 rounded-full"></div>}
                          </div>
                          <span className={`text-[7px] font-black uppercase text-center leading-[1] ${isPresent ? 'text-slate-900' : 'text-slate-300'}`}>
                            {allergen.split(' ')[0]}
                          </span>
                       </div>
                     );
                   })}
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xs border-b-2 border-slate-900 pb-1">PROCESO TÉCNICO DE COCINA</h3>
                {recipe.subRecipes.map((sub, sIdx) => (
                  <div key={sIdx} className="break-inside-avoid space-y-3">
                     <h4 className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-2">
                        <span className="bg-slate-900 text-white w-5 h-5 flex items-center justify-center rounded text-[9px]">{sIdx + 1}</span>
                        {sub.name}
                     </h4>
                     
                     <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {/* FOTOS CONDICIONALES: Solo se renderizan si existen */}
                        {sub.photos && sub.photos.length > 0 && (
                           <div className="grid grid-cols-3 gap-2 pb-2">
                              {sub.photos.map((p, pIdx) => (
                                <div key={pIdx} className="relative aspect-[4/3]">
                                  <img src={p} alt={`${sub.name} step ${pIdx+1}`} className="w-full h-full object-cover rounded-lg shadow-sm border border-slate-200" />
                                </div>
                              ))}
                           </div>
                        )}
                        <div className={`text-[11px] text-slate-600 leading-relaxed text-justify whitespace-pre-wrap font-serif italic ${sub.photos && sub.photos.length > 0 ? 'border-t border-slate-200 pt-3' : ''}`}>
                          {sub.instructions || "Técnica no definida."}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* FICHA TÉCNICA DE SERVICIO - Optimizado */}
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] mt-6 border border-slate-800 break-inside-avoid">
           <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Clock size={24} className="text-amber-500" />
              <div>
                 <h3 className="text-xl font-black uppercase tracking-tighter">Ficha de Pase y Servicio</h3>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Información clave para sala</p>
              </div>
           </div>
           
           <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Temperatura</p>
                 <div className="flex items-center gap-2">
                   <Thermometer size={16} className="text-rose-500" />
                   <span className="text-xs font-black text-amber-500">{recipe.serviceDetails.servingTemp || '--'}</span>
                 </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Técnica</p>
                 <div className="flex items-start gap-2">
                    <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-[9px] font-black uppercase text-slate-200 leading-tight">{recipe.serviceDetails.serviceType}</span>
                 </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Cubertería</p>
                 <div className="flex items-start gap-2">
                    <UtensilsCrossed size={16} className="text-amber-400 shrink-0" />
                    <span className="text-[8px] font-bold text-slate-300 uppercase leading-snug">{recipe.serviceDetails.cutlery || 'Estándar'}</span>
                 </div>
              </div>

              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                 <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-2">Rendimiento</p>
                 <div className="flex items-center gap-2">
                   <Users size={18} className="text-amber-500" />
                   <span className="text-lg font-black text-amber-500 leading-none">{dynamicPax} {recipe.yieldUnit.substring(0,3)}</span>
                 </div>
              </div>
           </div>

           <div className="mt-4 bg-white/5 p-5 rounded-2xl border border-white/5">
              <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Protocolo de Emplatado y Acabado</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                 {recipe.platingInstructions || "Seguir protocolo estándar de la categoría."}
              </p>
           </div>
        </div>

        {/* Pie de página limpio */}
        <div className="mt-8 text-center text-[9px] text-slate-300 font-black uppercase tracking-[0.4em] print:text-slate-900 border-t border-slate-50 pt-6">
           {settings.instituteName} • {settings.teacherName}
        </div>
      </div>
    </div>
  );
};
