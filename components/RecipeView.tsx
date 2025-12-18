import React, { useMemo } from 'react';
import { Recipe, AppSettings, Allergen } from '../types';
import { Printer, ArrowLeft, Info, AlertOctagon } from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Botones de acción (No se imprimen) */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Printer size={20} />
          <span>Imprimir / PDF</span>
        </button>
      </div>

      {/* Ficha Técnica */}
      <div className="max-w-5xl mx-auto bg-white shadow-xl print:shadow-none print:w-full">
        
        {/* Cabecera para Impresión */}
        <div className="hidden print:flex justify-between items-center p-6 border-b-2 border-black mb-4">
          <div className="w-1/3">
            {settings.instituteLogo && <img src={settings.instituteLogo} alt="Logo IES" className="h-16 object-contain mb-1" />}
            <p className="font-bold text-[10px] uppercase">{settings.instituteName}</p>
          </div>
          <div className="w-1/3 text-center">
            <h1 className="text-2xl font-serif font-bold uppercase">{recipe.name}</h1>
            <p className="text-xs text-gray-500 uppercase">{recipe.category} • Ficha Técnica</p>
          </div>
          <div className="w-1/3 text-right">
            {settings.teacherLogo && <img src={settings.teacherLogo} alt="Avatar" className="h-12 w-12 rounded-full object-cover ml-auto mb-1 border" />}
            <p className="font-bold text-[10px]">{settings.teacherName}</p>
          </div>
        </div>

        {/* Cabecera para Pantalla */}
        <div className="bg-slate-900 text-white p-6 print:hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-xs">{recipe.category}</p>
              <h1 className="text-3xl font-serif font-bold mt-1">{recipe.name}</h1>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-70">Rendimiento</div>
              <div className="text-xl font-bold">{recipe.yieldQuantity} {recipe.yieldUnit}</div>
            </div>
          </div>
        </div>

        {/* Barra de Alérgenos */}
        {allAllergens.length > 0 && (
          <div className="bg-red-50 border-b border-red-100 p-3 px-6 flex items-center gap-3 print:bg-white print:border-black print:border-b-2">
            <AlertOctagon size={16} className="text-red-600" />
            <div className="flex flex-wrap gap-1">
              {allAllergens.map(a => (
                <span key={a} className="bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase print:border-black">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="p-6 md:p-8 print:p-6 print:pt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 print:mb-6">
            {/* Columna Izquierda: Foto y Detalles de Servicio */}
            <div className="md:col-span-1 space-y-6">
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 print:border-black">
                {recipe.photo ? (
                  <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">Sin foto</div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 print:bg-white print:border-black">
                <h3 className="font-bold text-xs uppercase border-b pb-2 mb-3 flex items-center gap-2">
                  <Info size={14} /> Servicio
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase font-bold text-[9px]">Temperatura</span>
                    <span className="font-medium">{recipe.serviceDetails?.servingTemp || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase font-bold text-[9px]">Tiempo Pase</span>
                    <span className="font-medium">{recipe.serviceDetails?.passTime || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase font-bold text-[9px]">Servicio</span>
                    <span className="font-medium">{recipe.serviceDetails?.serviceType || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Descripción y Montaje */}
            <div className="md:col-span-2">
              {recipe.serviceDetails?.clientDescription && (
                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 mb-6 print:bg-white print:border-black">
                  <h4 className="font-bold text-[10px] uppercase text-amber-800 mb-1 print:text-black">Descripción Comercial</h4>
                  <p className="text-sm italic text-slate-700 leading-relaxed print:text-black italic">"{recipe.serviceDetails.clientDescription}"</p>
                </div>
              )}
              
              <h3 className="font-bold text-sm uppercase border-b border-gray-200 pb-1 mb-3 print:border-black">Montaje y Emplatado</h3>
              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed print:text-black">
                {recipe.platingInstructions || "No se han definido instrucciones de montaje."}
              </div>
            </div>
          </div>

          {/* Sección de Elaboraciones */}
          <div className="space-y-8 print:space-y-6">
            <h2 className="text-lg font-bold text-center border-b-2 border-gray-100 pb-2 uppercase tracking-widest print:border-black">Desglose de Elaboraciones</h2>
            
            {recipe.subRecipes?.map((sub, idx) => (
              <div key={sub.id || idx} className="border border-gray-200 rounded-xl p-6 bg-white print:border-black print:p-4 break-inside-avoid">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Ingredientes de la elaboración */}
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-slate-800 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold print:bg-black">{idx + 1}</span>
                      <h3 className="font-bold text-base leading-tight">{sub.name}</h3>
                    </div>
                    
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-gray-100 uppercase text-slate-400 print:text-black print:border-black">
                          <th className="text-left py-1">Ingrediente</th>
                          <th className="text-right py-1">Cant.</th>
                          <th className="text-left py-1 pl-1">Ud.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 print:divide-gray-200">
                        {sub.ingredients?.map((ing, iIdx) => (
                          <tr key={ing.id || iIdx}>
                            <td className="py-1.5 font-medium text-slate-700 print:text-black">{ing.name}</td>
                            <td className="py-1.5 text-right font-mono text-slate-500 print:text-black">{ing.quantity}</td>
                            <td className="py-1.5 pl-1 text-slate-400 print:text-black">{ing.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Proceso de la elaboración */}
                  <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0 print:border-black print:border-l">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 print:text-black">Procedimiento</h4>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed print:text-black">
                      {sub.instructions || "Sin instrucciones detalladas."}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Pie de página para impresión */}
        <div className="hidden print:block text-center text-[9px] text-gray-400 mt-10 py-4 border-t border-black">
          {settings.instituteName} • {settings.teacherName} • Generado el {new Date().toLocaleDateString()}
        </div>

      </div>
    </div>
  );
};