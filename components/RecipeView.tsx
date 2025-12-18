import React, { useMemo } from 'react';
import { Recipe, AppSettings, Allergen, SERVICE_TYPES } from '../types';
import { Printer, ArrowLeft, Info, AlertOctagon, Utensils, Thermometer, ChefHat } from 'lucide-react';

interface RecipeViewProps {
  recipe: Recipe;
  settings: AppSettings;
  onBack: () => void;
}

export const RecipeView: React.FC<RecipeViewProps> = ({ recipe, settings, onBack }) => {
  
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Botones de acción */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold"
        >
          <ArrowLeft size={20} />
          <span>Volver al Panel</span>
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-all shadow-lg"
        >
          <Printer size={20} />
          <span>Imprimir / PDF</span>
        </button>
      </div>

      {/* Ficha Principal */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl print:shadow-none print:w-full overflow-hidden rounded-2xl print:rounded-none">
        
        {/* Cabecera Impresión */}
        <div className="hidden print:flex justify-between items-center p-8 border-b-2 border-black">
          <div className="w-1/3">
            {settings.instituteLogo && <img src={settings.instituteLogo} alt="IES" className="h-16 object-contain" />}
            <p className="font-bold text-[10px] mt-1 uppercase">{settings.instituteName}</p>
          </div>
          <div className="w-1/3 text-center">
            <h1 className="text-3xl font-serif font-bold uppercase leading-tight">{recipe.name}</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{recipe.category} • FICHA TÉCNICA</p>
          </div>
          <div className="w-1/3 text-right">
            {settings.teacherLogo && <img src={settings.teacherLogo} alt="Teacher" className="h-12 w-12 rounded-full object-cover ml-auto mb-1 border" />}
            <p className="font-bold text-[10px]">{settings.teacherName}</p>
          </div>
        </div>

        {/* Cabecera Pantalla */}
        <div className="bg-slate-900 text-white p-8 print:hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-2">{recipe.category}</p>
              <h1 className="text-4xl font-serif font-bold leading-tight">{recipe.name}</h1>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm text-right">
              <div className="text-[10px] uppercase font-bold opacity-60">Rendimiento</div>
              <div className="text-2xl font-black">{recipe.yieldQuantity} <span className="text-sm font-normal opacity-80">{recipe.yieldUnit}</span></div>
            </div>
          </div>
        </div>

        {/* Alérgenos */}
        {allAllergens.length > 0 && (
          <div className="bg-red-50 border-b border-red-100 p-4 px-8 flex items-center gap-4 print:bg-white print:border-black print:border-b-2">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase">
              <AlertOctagon size={18} /> Alérgenos:
            </div>
            <div className="flex flex-wrap gap-2">
              {allAllergens.map(a => (
                <span key={a} className="bg-white border-2 border-red-200 text-red-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase print:border-black">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bloque Información de Sala (Solicitado) */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b border-slate-100 print:border-black">
          <div className="p-6 flex items-start gap-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 print:bg-white print:border print:border-black">
              <Utensils size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Servicio de Sala</p>
              <p className="font-bold text-slate-800 text-sm">{recipe.serviceDetails.serviceType}</p>
              {serviceTypeData && <p className="text-[10px] text-slate-500 mt-1 italic">{serviceTypeData.desc}</p>}
            </div>
          </div>
          <div className="p-6 flex items-start gap-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 print:bg-white print:border print:border-black">
              <Utensils size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Marcaje de Cubiertos</p>
              <p className="font-medium text-slate-800 text-sm leading-relaxed">{recipe.serviceDetails.cutlery || 'Estándar'}</p>
            </div>
          </div>
          <div className="p-6 flex items-start gap-4">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600 print:bg-white print:border print:border-black">
              <Thermometer size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Temperatura Pase</p>
              <p className="font-bold text-slate-800 text-sm">{recipe.serviceDetails.servingTemp || 'N/A'}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Pase: {recipe.serviceDetails.passTime || 'Inmediato'}</p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="p-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Foto e Info Lateral */}
            <div className="md:col-span-4 space-y-6">
              <div className="aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner print:border-black">
                {recipe.photo ? (
                  <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 italic text-xs">Sin imagen principal</div>
                )}
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-black">
                <h4 className="font-black text-[10px] uppercase text-slate-400 mb-3 tracking-widest">Descripción Comercial</h4>
                <p className="text-sm italic font-serif text-slate-700 leading-relaxed border-l-4 border-amber-200 pl-4 print:border-black">
                  "{recipe.serviceDetails.clientDescription || 'No definida.'}"
                </p>
              </div>
            </div>

            {/* Montaje Final */}
            <div className="md:col-span-8">
              <div className="flex items-center gap-3 mb-4">
                <ChefHat className="text-slate-400" size={24} />
                <h3 className="text-lg font-bold uppercase tracking-widest text-slate-800 print:text-black">Montaje y Emplatado</h3>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-loose text-justify bg-slate-50/50 p-6 rounded-2xl border border-slate-100 print:p-0 print:bg-white print:border-none print:text-black">
                {recipe.platingInstructions || "Instrucciones de montaje no definidas."}
              </div>
            </div>
          </div>

          {/* Elaboraciones (SubRecipes) */}
          <div className="space-y-10">
            <h2 className="text-xl font-black text-center border-y-2 border-slate-100 py-4 uppercase tracking-[0.3em] text-slate-400 print:border-black print:text-black">Desglose de Elaboraciones</h2>
            
            {recipe.subRecipes?.map((sub, idx) => (
              <div key={sub.id || idx} className="border border-slate-200 rounded-3xl p-8 bg-white shadow-sm print:border-black print:p-4 break-inside-avoid">
                <div className="flex flex-col md:flex-row gap-10">
                  {/* Ingredientes */}
                  <div className="md:w-5/12">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black print:bg-black">{idx + 1}</span>
                      <h3 className="font-black text-lg uppercase text-slate-800 print:text-black">{sub.name}</h3>
                    </div>
                    
                    {sub.photo && (
                      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 mb-6 print:border-black">
                        <img src={sub.photo} alt={sub.name} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 print:text-black print:border-black">
                          <th className="text-left py-2">Ingrediente</th>
                          <th className="text-right py-2">Cant.</th>
                          <th className="text-left py-2 pl-3">Ud.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 print:divide-slate-200">
                        {sub.ingredients?.map((ing, iIdx) => (
                          <tr key={ing.id || iIdx}>
                            <td className="py-2.5 font-bold text-slate-700 print:text-black">{ing.name}</td>
                            <td className="py-2.5 text-right font-mono text-slate-500 print:text-black">{ing.quantity}</td>
                            <td className="py-2.5 pl-3 text-slate-400 print:text-black">{ing.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Proceso */}
                  <div className="md:w-7/12 md:border-l border-slate-100 md:pl-10 print:border-black print:border-l-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-300 mb-4 tracking-widest flex items-center gap-2 print:text-black">
                      <Info size={14} /> Procedimiento Técnico
                    </h4>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed text-justify print:text-black">
                      {sub.instructions || "Sin instrucciones detalladas."}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Impresión */}
        <div className="hidden print:flex justify-between items-center text-[9px] text-slate-400 p-8 border-t border-black mt-12">
          <p>{settings.instituteName} • Departamento de Hostelería</p>
          <p>Generado por {settings.teacherName} • {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};