
import React, { useMemo, useState } from 'react';
import { Recipe, AppSettings, Allergen, SERVICE_TYPES, ALLERGEN_LIST } from '../types';
import { Printer, ArrowLeft, Info, AlertOctagon, Utensils, Thermometer, ChefHat, User, Users, Clock, UtensilsCrossed } from 'lucide-react';

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
    // Formateo inteligente: si es entero lo deja tal cual, si no, 2 o 3 decimales según necesidad
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(scaled < 1 ? 3 : 2).replace('.', ',');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:p-0 print:bg-white font-sans text-slate-900">
      {/* Barra de herramientas (No se imprime) */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
          <ArrowLeft size={20} />
          <span>Volver al Panel</span>
        </button>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Users size={16} className="text-indigo-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajustar Pax:</span>
            <input 
              type="number" 
              value={dynamicPax} 
              onChange={e => setDynamicPax(Math.max(1, Number(e.target.value)))}
              className="w-12 font-black text-center text-indigo-600 outline-none border-b-2 border-indigo-100 focus:border-indigo-500"
            />
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg font-black uppercase text-xs tracking-widest">
            <Printer size={18} />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO DE LA FICHA (A4) */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full overflow-hidden p-10 print:p-8 border border-slate-200 print:border-none">
        
        {/* CABECERA */}
        <div className="flex justify-between items-start mb-2">
           <div className="flex items-center gap-3">
              <span className="bg-emerald-50 text-emerald-600 font-black text-[9px] px-3 py-1 rounded border border-emerald-100 uppercase tracking-widest">
                {recipe.category}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <User size={12} /> {recipe.creator || settings.teacherName}
              </span>
           </div>
           <div className="flex flex-col items-end">
             {settings.instituteLogo ? (
               <div className="flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-xs font-black text-slate-900 leading-none">{settings.instituteName}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dpto. Hostelería</p>
                 </div>
                 <img src={settings.instituteLogo} alt="IES Logo" className="h-16 w-auto object-contain" />
               </div>
             ) : (
               <div className="text-2xl font-black text-slate-900 leading-none">JCB <span className="text-[10px] block text-slate-400 font-bold">DESDE 1999</span></div>
             )}
           </div>
        </div>

        <h1 className="text-5xl font-serif font-black text-slate-900 leading-[1.1] mb-4 tracking-tighter">
          {recipe.name}
        </h1>
        <p className="text-slate-500 italic text-lg border-l-4 border-emerald-400 pl-4 mb-8">
          "{recipe.serviceDetails.clientDescription || 'Sin descripción comercial'}"
        </p>

        <div className="w-full h-1 bg-slate-900 mb-8"></div>

        {/* CONTENIDO PRINCIPAL EN DOS COLUMNAS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* COLUMNA IZQUIERDA: Foto y Escandallo */}
          <div className="md:col-span-5 space-y-8">
             <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-100">
                {recipe.photo ? (
                  <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <ChefHat size={60} strokeWidth={1} />
                  </div>
                )}
             </div>

             <div>
                <h3 className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-tighter text-lg mb-4 border-b border-slate-100 pb-2">
                   <Utensils size={20} /> ESCANDALLO ESCALADO
                </h3>
                <div className="space-y-6">
                   {recipe.subRecipes.map((sub, sIdx) => (
                     <div key={sub.id || sIdx} className="break-inside-avoid">
                        <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-3 border-b-2 border-emerald-50 inline-block pb-0.5">
                          {sIdx + 1}. {sub.name}
                        </h4>
                        <table className="w-full text-[11px] text-slate-700">
                          <tbody className="divide-y divide-slate-100">
                             {sub.ingredients.map((ing, iIdx) => (
                               <tr key={ing.id || iIdx}>
                                  <td className="py-2.5 pr-4 font-bold uppercase tracking-tight leading-tight">{ing.name}</td>
                                  <td className="py-2.5 text-right font-black text-slate-900 whitespace-nowrap">
                                    {scaleQuantity(ing.quantity)}
                                  </td>
                                  <td className="py-2.5 pl-2 text-slate-400 font-bold uppercase text-[9px] w-12 text-right">{ing.unit}</td>
                               </tr>
                             ))}
                          </tbody>
                        </table>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* COLUMNA DERECHA: Alérgenos, Elaboración y Presentación */}
          <div className="md:col-span-7 space-y-10">
             
             {/* MATRIZ DE ALÉRGENOS */}
             <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-6 flex items-center justify-center gap-2">
                   <AlertOctagon size={14} className="text-amber-500" /> DECLARACIÓN DE ALÉRGENOS (GLOBAL)
                </h4>
                <div className="grid grid-cols-7 gap-y-6 gap-x-2">
                   {ALLERGEN_LIST.map(allergen => {
                     const isPresent = allAllergens.includes(allergen);
                     return (
                       <div key={allergen} className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative transition-all ${isPresent ? 'border-red-500 bg-white shadow-sm ring-4 ring-red-50' : 'border-slate-100 bg-slate-50 opacity-40'}`}>
                             {isPresent && <div className="w-3 h-3 bg-red-600 rounded-full"></div>}
                          </div>
                          <span className={`text-[8px] font-black uppercase text-center leading-[1.1] ${isPresent ? 'text-slate-900' : 'text-slate-300'}`}>
                            {allergen.split(' ')[0]}
                          </span>
                       </div>
                     );
                   })}
                </div>
             </div>

             {/* ELABORACIÓN */}
             <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg mb-4 border-b border-slate-100 pb-2">
                  ELABORACIÓN
                </h3>
                <div className="space-y-8">
                   {recipe.subRecipes.map((sub, sIdx) => (
                     <div key={sub.id || sIdx} className="break-inside-avoid">
                        <h4 className="text-xs font-black text-slate-800 uppercase mb-3 bg-slate-50 px-3 py-1.5 rounded-lg border-l-4 border-slate-900">
                          {sIdx + 1}. {sub.name}
                        </h4>
                        <div className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-wrap font-serif pl-1">
                          {sub.instructions || "Sin pasos definidos."}
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* PRESENTACIÓN */}
             <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-dashed">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                   <Info size={16} /> PRESENTACIÓN Y EMPLATADO
                </h4>
                <div className="text-xs text-slate-500 italic leading-relaxed">
                   {recipe.platingInstructions || "Sin especificaciones de presentación."}
                </div>
             </div>

          </div>
        </div>

        {/* PIE DE PÁGINA: FICHA DE PASE */}
        <div className="border-t-2 border-slate-900 pt-8 mt-12">
           <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Clock size={22} /> FICHA DE PASE Y SERVICIO
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[100px]">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Temperatura</p>
                 <div className="flex items-center gap-2">
                   <Thermometer size={18} className="text-emerald-500" />
                   <span className="text-lg font-black text-slate-800">{recipe.serviceDetails.servingTemp || '--'}</span>
                 </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[100px]">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tiempo Pase</p>
                 <div className="text-lg font-black text-slate-800">
                   {recipe.serviceDetails.passTime || '--'}
                 </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[100px]">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Marcaje / Cubiertos</p>
                 <div className="flex items-start gap-2">
                    <UtensilsCrossed size={18} className="text-slate-400 mt-1" />
                    <span className="text-xs font-bold text-slate-800 uppercase">{recipe.serviceDetails.cutlery || 'Estándar'}</span>
                 </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[100px]">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo Servicio</p>
                 <div>
                    <span className="text-xs font-black text-slate-900 uppercase block mb-1">{recipe.serviceDetails.serviceType}</span>
                 </div>
              </div>
              <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 flex flex-col justify-between min-h-[100px]">
                 <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Rendimiento</p>
                 <div className="flex items-center gap-3">
                   <Users size={18} className="text-indigo-600" />
                   <span className="text-lg font-black text-indigo-900">{dynamicPax} {recipe.yieldUnit}</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-12 text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em] print:text-slate-900">
           {settings.instituteName} • ÁREA DE GASTRONOMÍA • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
