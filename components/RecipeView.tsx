
import React, { useMemo, useState } from 'react';
import { Recipe, AppSettings, Allergen, SERVICE_TYPES } from '../types';
import { Printer, ArrowLeft, Info, AlertOctagon, Utensils, Thermometer, ChefHat, User, Link as LinkIcon, Users, DollarSign } from 'lucide-react';

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

  const serviceTypeData = useMemo(() => {
    return SERVICE_TYPES.find(t => t.name === recipe.serviceDetails.serviceType);
  }, [recipe.serviceDetails.serviceType]);

  const scaleQuantity = (qtyStr: string): string => {
    const num = parseFloat(qtyStr.replace(',', '.'));
    if (isNaN(num)) return qtyStr;
    const scaled = num * paxRatio;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(3);
  };

  const currentTotalCost = (recipe.totalCost || 0) * paxRatio;
  const currentCostPerPortion = currentTotalCost / dynamicPax;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors">
          <ArrowLeft size={20} />
          <span>Panel Principal</span>
        </button>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Users size={18} className="text-indigo-500" />
            <span className="text-xs font-black text-slate-400 uppercase">Ajustar Pax:</span>
            <input 
              type="number" 
              value={dynamicPax} 
              onChange={e => setDynamicPax(Math.max(1, Number(e.target.value)))}
              className="w-16 font-black text-center text-indigo-600 outline-none border-b-2 border-indigo-100 focus:border-indigo-500"
            />
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg font-bold">
            <Printer size={20} />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white shadow-2xl print:shadow-none print:w-full overflow-hidden rounded-[2.5rem] print:rounded-none border border-slate-200 print:border-none">
        {/* Cabecera Impresión */}
        <div className="hidden print:flex justify-between items-center p-10 border-b-4 border-slate-900">
          <div className="w-1/3">
            {settings.instituteLogo && <img src={settings.instituteLogo} alt="IES" className="h-20 object-contain" />}
            <p className="font-black text-[10px] mt-2 uppercase tracking-widest">{settings.instituteName}</p>
          </div>
          <div className="w-1/3 text-center">
            <h1 className="text-4xl font-serif font-black uppercase leading-tight tracking-tighter">{recipe.name}</h1>
            <p className="text-xs text-slate-500 uppercase tracking-[0.3em] mt-2">Ficha Técnica de Producción</p>
          </div>
          <div className="w-1/3 text-right">
            <p className="font-black text-[10px] uppercase text-slate-400 mb-1">Chef Responsable:</p>
            <p className="font-black text-lg uppercase">{recipe.creator || settings.teacherName}</p>
            <p className="text-[10px] text-slate-400 mt-2">Rendimiento: {dynamicPax} {recipe.yieldUnit}</p>
          </div>
        </div>

        {/* Cabecera Pantalla */}
        <div className="bg-slate-900 text-white p-10 print:hidden relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <span className="bg-amber-500 text-slate-900 font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-lg">{recipe.category}</span>
              <h1 className="text-5xl font-serif font-black leading-tight tracking-tighter">{recipe.name}</h1>
              <div className="flex items-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-2"><User size={16} className="text-amber-500"/> {recipe.creator || settings.teacherName}</span>
                {recipe.sourceUrl && (
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                    <LinkIcon size={16}/> Link Referencia
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl text-right border border-white/10 shadow-2xl">
                <div className="text-[10px] uppercase font-black text-amber-500 mb-1 tracking-widest">Escandallo Escalado</div>
                <div className="text-4xl font-black">{dynamicPax} <span className="text-sm font-bold opacity-40 uppercase">{recipe.yieldUnit}</span></div>
                <div className="mt-3 flex items-center gap-2 justify-end">
                   <DollarSign size={14} className="text-emerald-400"/>
                   <span className="text-emerald-400 font-mono font-black text-xl">{currentCostPerPortion.toFixed(2)}€</span>
                   <span className="text-[9px] font-bold text-slate-400 uppercase">/Ración</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Técnica */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100 print:border-slate-900">
          <div className="p-8 flex items-start gap-5">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 print:bg-white print:border print:border-slate-900"><Utensils size={24} /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Servicio Sugerido</p>
              <p className="font-black text-slate-800 uppercase text-sm tracking-tight">{recipe.serviceDetails.serviceType}</p>
              {serviceTypeData && <p className="text-[10px] text-slate-500 mt-2 leading-relaxed italic">{serviceTypeData.desc}</p>}
            </div>
          </div>
          <div className="p-8 flex items-start gap-5">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 print:bg-white print:border print:border-slate-900"><Utensils size={24} /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Marcaje / Cubiertos</p>
              <p className="font-bold text-slate-800 text-sm leading-relaxed uppercase">{recipe.serviceDetails.cutlery || 'Estándar'}</p>
            </div>
          </div>
          <div className="p-8 flex items-start gap-5">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 print:bg-white print:border print:border-slate-900"><Thermometer size={24} /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Temperatura / Pase</p>
              <p className="font-black text-slate-800 text-lg">{recipe.serviceDetails.servingTemp || 'N/A'}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-black bg-slate-50 px-2 py-0.5 rounded-lg inline-block">Pase: {recipe.serviceDetails.passTime || 'Inmediato'}</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5 space-y-8">
              <div className="aspect-[4/3] bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner print:border-slate-900 relative">
                {recipe.photo ? (
                  <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200"><ChefHat size={80}/></div>
                )}
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 print:bg-white print:border-slate-900">
                <h4 className="font-black text-[10px] uppercase text-slate-400 mb-4 tracking-[0.2em] flex items-center gap-2"><Info size={14}/> Nota de Servicio</h4>
                <p className="text-sm italic font-serif text-slate-700 leading-relaxed border-l-4 border-amber-300 pl-6 print:border-slate-900">
                  "{recipe.serviceDetails.clientDescription || 'No se ha definido una descripción para el cliente.'}"
                </p>
              </div>
            </div>
            <div className="md:col-span-7">
              <div className="flex items-center gap-4 mb-6 border-b-2 border-slate-900 pb-4">
                <ChefHat className="text-slate-900" size={32} />
                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Montaje y Presentación</h3>
              </div>
              <div className="text-base text-slate-700 whitespace-pre-wrap leading-loose text-justify bg-slate-50/30 p-8 rounded-[2rem] border border-slate-50 print:p-0 print:bg-white print:border-none print:text-black">
                {recipe.platingInstructions || "Instrucciones de montaje no definidas."}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-2xl font-black text-center border-y-4 border-slate-900 py-6 uppercase tracking-[0.4em] text-slate-900 bg-slate-50 print:bg-white">Procesos de Elaboración</h2>
            {recipe.subRecipes?.map((sub, idx) => (
              <div key={sub.id || idx} className="border border-slate-200 rounded-[2.5rem] p-10 bg-white shadow-sm print:border-slate-900 print:p-6 break-inside-avoid">
                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="lg:w-5/12 space-y-8">
                    <div className="flex items-center gap-5">
                      <span className="bg-slate-900 text-white w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black print:bg-slate-900">{idx + 1}</span>
                      <h3 className="font-black text-xl uppercase tracking-tight text-slate-900 border-b-2 border-slate-100 pb-1">{sub.name}</h3>
                    </div>
                    {sub.photo && <img src={sub.photo} className="w-full aspect-video rounded-3xl object-cover border border-slate-100 print:border-slate-900 shadow-md" alt="" />}
                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 print:bg-white print:border-slate-900 print:p-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b-2 border-slate-900 uppercase text-[10px] font-black text-slate-400 print:text-slate-900">
                            <th className="text-left py-3">Materia Prima</th>
                            <th className="text-right py-3">Escalado</th>
                            <th className="text-left py-3 pl-4">Ud.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                          {sub.ingredients?.map((ing, iIdx) => (
                            <tr key={ing.id || iIdx} className="hover:bg-indigo-50/50 transition-colors">
                              <td className="py-3.5 font-black text-slate-700 uppercase tracking-tight print:text-slate-900">{ing.name}</td>
                              <td className="py-3.5 text-right font-mono text-indigo-600 font-black text-sm print:text-slate-900">{scaleQuantity(ing.quantity)}</td>
                              <td className="py-3.5 pl-4 text-slate-400 print:text-slate-900 uppercase font-bold text-[10px]">{ing.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="lg:w-7/12 lg:border-l-4 border-slate-100 lg:pl-12 print:border-slate-900 print:border-l-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-[0.2em] flex items-center gap-3 print:text-slate-900"><Info size={16} /> Técnica de Elaboración</h4>
                    <div className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed text-justify print:text-slate-900">{sub.instructions || "No se han descrito pasos técnicos para esta elaboración."}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {allAllergens.length > 0 && (
          <div className="bg-red-50 border-t-4 border-red-200 p-10 flex flex-col md:flex-row items-center gap-8 print:bg-white print:border-slate-900 print:border-t-2">
            <div className="flex items-center gap-3 text-red-600 font-black text-xs uppercase tracking-[0.2em] shrink-0">
               <AlertOctagon size={24} /> Declaración de Alérgenos:
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {allAllergens.map(a => (
                <span key={a} className="bg-white border-2 border-red-100 text-red-700 px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-sm print:border-slate-900 print:border">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="hidden print:flex justify-between items-center text-[10px] font-bold text-slate-400 p-10 border-t-4 border-slate-900 mt-20">
          <p className="uppercase tracking-widest">{settings.instituteName} • Área de Cocina</p>
          <p className="uppercase tracking-widest">Generado por: {recipe.creator || settings.teacherName} • {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};
