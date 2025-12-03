import React, { useMemo } from 'react';
import { Recipe, AppSettings, Allergen } from '../types';
import { Printer, ArrowLeft, Info, AlertOctagon } from 'lucide-react';

interface RecipeViewProps {
  recipe: Recipe;
  settings: AppSettings;
  onBack: () => void;
}

export const RecipeView: React.FC<RecipeViewProps> = ({ recipe, settings, onBack }) => {
  
  // Calculate distinct allergens from all ingredients in all subrecipes
  const allAllergens = useMemo(() => {
    const set = new Set<Allergen>();
    recipe.subRecipes.forEach(sub => {
      sub.ingredients.forEach(ing => {
        ing.allergens?.forEach(a => set.add(a));
      });
    });
    return Array.from(set);
  }, [recipe]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Navigation Bar - Hidden on Print */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver al Panel</span>
        </button>
        <button 
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Printer size={20} />
          <span>Imprimir / Guardar PDF</span>
        </button>
      </div>

      {/* Main Recipe Sheet */}
      <div className="max-w-5xl mx-auto bg-white shadow-xl print:shadow-none print:w-full print:max-w-none">
        
        {/* PRINT HEADER */}
        <div className="hidden print:flex justify-between items-center p-6 border-b-2 border-black mb-4">
            <div className="w-1/4 flex flex-col items-start justify-center">
               {settings.instituteLogo && (
                 <img src={settings.instituteLogo} alt="Logo IES" className="h-20 w-auto object-contain mb-2" />
               )}
               <span className="font-bold text-xs uppercase">{settings.instituteName}</span>
            </div>
            
            <div className="w-2/4 text-center">
               <h1 className="text-3xl font-serif font-bold mb-2 leading-tight">{recipe.name}</h1>
               <p className="text-gray-600 uppercase tracking-widest text-xs">{recipe.category} • Ficha Técnica</p>
            </div>

            <div className="w-1/4 flex flex-col items-end justify-center">
               {settings.teacherLogo && (
                 <img src={settings.teacherLogo} alt="Logo Profesor" className="h-16 w-16 rounded-full object-cover mb-2 border border-gray-300" />
               )}
               <span className="font-bold text-xs">{settings.teacherName}</span>
            </div>
        </div>

        {/* SCREEN HEADER */}
        <div className="bg-slate-900 text-white p-6 print:hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">{recipe.category}</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mt-1">{recipe.name}</h1>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Rendimiento</div>
              <div className="text-2xl font-bold">{recipe.yieldQuantity} <span className="text-lg font-normal">{recipe.yieldUnit}</span></div>
            </div>
          </div>
        </div>

        {/* ALLERGENS BAR */}
        {allAllergens.length > 0 && (
          <div className="bg-red-50 border-b border-red-100 p-3 px-6 flex items-center gap-4 print:border-black print:bg-white print:border-b-2">
            <span className="text-red-800 font-bold text-sm uppercase flex items-center gap-2">
              <AlertOctagon size={16}/> Alérgenos:
            </span>
            <div className="flex flex-wrap gap-2">
              {allAllergens.map(a => (
                <span key={a} className="bg-white border border-red-200 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase print:border-black print:text-black">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 md:p-8 print:p-6 print:pt-2">
          
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 print:mb-6">
            
            {/* Left: Main Photo & Service */}
            <div className="md:col-span-1 space-y-6">
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm print:border print:border-black">
                {recipe.photo ? (
                  <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">Sin imagen principal</span>
                  </div>
                )}
              </div>

              {/* Service Details Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 print:bg-white print:border-2 print:border-black">
                <h3 className="font-bold text-slate-900 border-b border-amber-200 pb-2 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider">
                  <Info size={16} /> Datos de Servicio
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Temperatura</span>
                    <span className="font-medium text-slate-800">{recipe.serviceDetails.servingTemp || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Tiempo Pase</span>
                    <span className="font-medium text-slate-800">{recipe.serviceDetails.passTime || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Marcaje</span>
                    <span className="font-medium text-slate-800 text-xs block">{recipe.serviceDetails.cutlery || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Tipo Servicio</span>
                    <span className="font-medium text-slate-800 text-xs block">{recipe.serviceDetails.serviceType || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Plating & Description */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {recipe.serviceDetails.clientDescription && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-white print:border-black print:border">
                  <h4 className="font-bold text-sm text-slate-900 mb-2 uppercase">Descripción Comercial</h4>
                  <p className="text-slate-700 italic leading-relaxed print:text-black">"{recipe.serviceDetails.clientDescription}"</p>
                </div>
              )}
              
              {recipe.platingInstructions && (
                 <div className="flex-grow">
                   <h3 className="font-bold text-slate-900 mb-2 border-b border-gray-200 pb-1 uppercase text-sm print:text-black print:border-black">Montaje y Emplatado</h3>
                   <div className="prose prose-sm prose-slate max-w-none print:text-black whitespace-pre-wrap text-justify">
                      {recipe.platingInstructions}
                   </div>
                   {recipe.serviceDetails.presentation && (
                      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-sm print:bg-white print:border-black print:border-l-4">
                        <span className="font-bold text-blue-900 print:text-black">Nota visual: </span>
                        <span className="text-blue-800 print:text-black">{recipe.serviceDetails.presentation}</span>
                      </div>
                   )}
                 </div>
              )}
            </div>
          </div>

          {/* SUB-RECIPES SECTION */}
          <div className="space-y-8 print:space-y-6">
             <h2 className="text-xl font-bold text-center border-b-2 border-slate-200 pb-2 uppercase tracking-widest text-slate-800 print:text-black print:border-black">Desglose de Elaboraciones</h2>
             
             {recipe.subRecipes.map((sub, idx) => (
                <div key={sub.id} className="break-inside-avoid border border-gray-200 rounded-xl p-4 md:p-6 bg-white shadow-sm print:shadow-none print:border-black print:p-4">
                   <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* Sub-recipe Ingredients */}
                      <div className="md:w-1/3">
                         <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-2 print:border-gray-400">
                            <span className="bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold print:bg-black print:text-white">{idx + 1}</span>
                            <h3 className="font-bold text-lg text-slate-900 leading-tight print:text-black">{sub.name}</h3>
                         </div>
                         
                         {sub.photo && (
                           <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 h-32 w-full print:border-black">
                             <img src={sub.photo} className="w-full h-full object-cover" alt={sub.name} />
                           </div>
                         )}

                         <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs uppercase text-slate-500 border-b border-gray-200 print:text-black">
                                <th className="text-left py-1">Ingrediente</th>
                                <th className="text-right py-1 w-16">Cant.</th>
                                <th className="text-left py-1 w-12 pl-2">Ud.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 print:divide-gray-200">
                              {sub.ingredients.map((ing, i) => (
                                <tr key={i}>
                                  <td className="py-1.5 align-top">
                                    <span className="font-medium text-slate-700 print:text-black">{ing.name}</span>
                                    {/* Allergens Hidden in Print mode via print:hidden */}
                                    {ing.allergens && ing.allergens.length > 0 && (
                                      <div className="flex flex-wrap gap-0.5 mt-0.5 print:hidden">
                                        {ing.allergens.map(a => (
                                          <span key={a} className="text-[9px] bg-red-50 text-red-600 px-1 rounded border border-red-100">
                                            {a.substring(0,3)}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-1.5 text-right align-top font-mono text-slate-600 print:text-black">{ing.quantity}</td>
                                  <td className="py-1.5 pl-2 align-top text-xs text-slate-500 print:text-black">{ing.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                         </table>
                      </div>

                      {/* Sub-recipe Process */}
                      <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0 print:border-l print:border-gray-300">
                         <h4 className="text-xs font-bold uppercase text-slate-500 mb-2 print:text-black">Proceso</h4>
                         <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed text-justify print:text-black">
                            {sub.instructions || "Sin instrucciones detalladas."}
                         </div>
                      </div>

                   </div>
                </div>
             ))}
          </div>
        
        {/* Footer for print */}
        <div className="hidden print:block text-center text-[10px] text-gray-500 mt-8 pt-4 border-t border-black">
          {settings.instituteName} • Documento generado el {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};