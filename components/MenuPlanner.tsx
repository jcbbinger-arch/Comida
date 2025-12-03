
import React, { useState } from 'react';
import { Recipe, AppSettings, ALLERGEN_LIST, Allergen } from '../types';
import { Plus, Trash2, ArrowLeft, Printer, Search, ArrowUp, ArrowDown, Calendar, FileText, Utensils, AlertOctagon } from 'lucide-react';

// Allergen Icons/Colors mapping for the Matrix
const ALLERGEN_CONFIG: Record<Allergen, { color: string, short: string, icon: string }> = {
  'Gluten': { color: 'bg-yellow-100 text-yellow-800', short: 'GLU', icon: '🌾' },
  'Crustáceos': { color: 'bg-red-100 text-red-800', short: 'CRU', icon: '🦀' },
  'Huevos': { color: 'bg-orange-100 text-orange-800', short: 'HUE', icon: '🥚' },
  'Pescado': { color: 'bg-blue-100 text-blue-800', short: 'PES', icon: '🐟' },
  'Cacahuetes': { color: 'bg-amber-100 text-amber-800', short: 'CAC', icon: '🥜' },
  'Soja': { color: 'bg-purple-100 text-purple-800', short: 'SOJ', icon: '🌱' },
  'Lácteos': { color: 'bg-sky-100 text-sky-800', short: 'LAC', icon: '🥛' },
  'Frutos de cáscara': { color: 'bg-emerald-100 text-emerald-800', short: 'FRU', icon: '🌰' },
  'Apio': { color: 'bg-green-100 text-green-800', short: 'API', icon: '🥬' },
  'Mostaza': { color: 'bg-yellow-200 text-yellow-900', short: 'MOS', icon: '🌭' },
  'Sésamo': { color: 'bg-stone-100 text-stone-800', short: 'SES', icon: '🥯' },
  'Sulfitos': { color: 'bg-gray-200 text-gray-800', short: 'SUL', icon: '🍷' },
  'Altramuces': { color: 'bg-pink-100 text-pink-800', short: 'ALT', icon: '🏵️' },
  'Moluscos': { color: 'bg-indigo-100 text-indigo-800', short: 'MOL', icon: '🐙' }
};

interface MenuPlannerProps {
  recipes: Recipe[];
  settings: AppSettings;
  onBack: () => void;
}

export const MenuPlanner: React.FC<MenuPlannerProps> = ({ recipes, settings, onBack }) => {
  const [activeTab, setActiveTab] = useState<'planning' | 'service_order' | 'allergen_matrix'>('planning');
  const [menuTitle, setMenuTitle] = useState('SERVICIO ALMUERZO/CENA');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter recipes for the search list
  const filteredRecipes = recipes.filter(r => 
    !selectedRecipes.find(sr => sr.id === r.id) && // Exclude already selected
    (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToMenu = (recipe: Recipe) => {
    setSelectedRecipes([...selectedRecipes, recipe]);
  };

  const removeFromMenu = (index: number) => {
    const newMenu = [...selectedRecipes];
    newMenu.splice(index, 1);
    setSelectedRecipes(newMenu);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedRecipes.length - 1) return;
    
    const newMenu = [...selectedRecipes];
    const item = newMenu[index];
    newMenu.splice(index, 1);
    newMenu.splice(direction === 'up' ? index - 1 : index + 1, 0, item);
    setSelectedRecipes(newMenu);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to extract all allergens from a recipe
  const getRecipeAllergens = (r: Recipe): Allergen[] => {
    const set = new Set<Allergen>();
    r.subRecipes.forEach(sub => 
      sub.ingredients.forEach(ing => 
        ing.allergens.forEach(a => set.add(a))
      )
    );
    return Array.from(set);
  };

  if (activeTab === 'planning') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-slate-600" />
              </button>
              <h1 className="text-2xl font-bold text-slate-800">Planificador de Menús</h1>
            </div>
            <div className="flex gap-2">
               <button 
                 disabled={selectedRecipes.length === 0}
                 onClick={() => setActiveTab('service_order')}
                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <FileText size={18}/> Orden de Servicio
               </button>
               <button 
                 disabled={selectedRecipes.length === 0}
                 onClick={() => setActiveTab('allergen_matrix')}
                 className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <AlertOctagon size={18}/> Matriz Alérgenos
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
            
            {/* LEFT: Available Recipes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
               <div className="p-4 border-b border-gray-200 bg-gray-50">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar recetas para añadir..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                 </div>
               </div>
               <div className="flex-grow overflow-y-auto p-2 space-y-2">
                  {filteredRecipes.map(recipe => (
                    <div key={recipe.id} className="flex items-center justify-between p-3 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-colors group">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                             {recipe.photo && <img src={recipe.photo} className="w-full h-full object-cover" alt="" />}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800 text-sm">{recipe.name}</h4>
                             <p className="text-xs text-slate-500">{recipe.category}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => addToMenu(recipe)}
                         className="p-2 bg-white text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-600 hover:text-white transition-colors"
                       >
                         <Plus size={18} />
                       </button>
                    </div>
                  ))}
                  {filteredRecipes.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      No se encontraron recetas
                    </div>
                  )}
               </div>
            </div>

            {/* RIGHT: Current Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
               <div className="p-4 border-b border-gray-200 bg-indigo-50">
                  <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
                    <Utensils size={20}/> Menú Actual
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Título Evento</label>
                      <input 
                        type="text" 
                        value={menuTitle}
                        onChange={e => setMenuTitle(e.target.value)}
                        className="w-full px-3 py-1.5 border border-indigo-200 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Fecha</label>
                      <input 
                        type="date" 
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-indigo-200 rounded text-sm"
                      />
                    </div>
                  </div>
               </div>
               
               <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {selectedRecipes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                       <Calendar size={48} className="mb-2 opacity-20"/>
                       <p>Añade recetas desde la izquierda</p>
                    </div>
                  ) : (
                    selectedRecipes.map((recipe, idx) => (
                      <div key={`${recipe.id}_${idx}`} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                         <span className="font-mono text-slate-400 font-bold w-6 text-center">{idx + 1}</span>
                         <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {recipe.photo && <img src={recipe.photo} className="w-full h-full object-cover" alt="" />}
                         </div>
                         <div className="flex-grow">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{recipe.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{recipe.serviceDetails.serviceType || 'Sin servicio definido'}</p>
                         </div>
                         <div className="flex items-center gap-1">
                            <button onClick={() => moveItem(idx, 'up')} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" disabled={idx === 0}><ArrowUp size={16}/></button>
                            <button onClick={() => moveItem(idx, 'down')} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" disabled={idx === selectedRecipes.length -1}><ArrowDown size={16}/></button>
                            <button onClick={() => removeFromMenu(idx)} className="p-1 text-red-400 hover:text-red-600 ml-2"><Trash2 size={16}/></button>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- PRINT VIEWS HEADER COMPONENT ---
  const PrintHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
       <div className="w-1/4">
          {settings.instituteLogo ? (
            <img src={settings.instituteLogo} className="h-16 object-contain" alt="Logo IES" />
          ) : (
            <span className="font-bold text-lg">{settings.instituteName}</span>
          )}
       </div>
       <div className="w-2/4 text-center">
          <h1 className="text-2xl font-bold uppercase mb-1">{title}</h1>
          <p className="text-sm font-medium uppercase">{subtitle}</p>
       </div>
       <div className="w-1/4 flex flex-col items-end">
          {settings.teacherLogo ? (
            <img src={settings.teacherLogo} className="h-12 w-12 object-cover rounded-full border border-gray-300 mb-1" alt="Logo Profe" />
          ) : null}
          <span className="text-xs font-bold">{settings.teacherName}</span>
          <span className="text-xs">{settings.instituteName}</span>
       </div>
    </div>
  );

  // --- VIEW: SERVICE ORDER ---
  if (activeTab === 'service_order') {
    return (
      <div className="min-h-screen bg-gray-100 print:bg-white p-4">
         <div className="max-w-[297mm] mx-auto bg-white shadow-lg print:shadow-none p-8 print:p-0">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-8 print:hidden">
               <button onClick={() => setActiveTab('planning')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                 <ArrowLeft size={20}/> Volver
               </button>
               <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg">
                 <Printer size={20}/> Imprimir Orden
               </button>
            </div>

            {/* Document */}
            <PrintHeader title="ORDEN DE SERVICIO" subtitle={`EVENTO: ${menuTitle} | FECHA: ${eventDate}`} />

            <table className="w-full border-collapse border border-black text-xs">
               <thead>
                  <tr className="bg-gray-100 print:bg-gray-200 text-center uppercase">
                     <th className="border border-black p-2 w-[5%]">Nº</th>
                     <th className="border border-black p-2 w-[20%]">Menú (Plato)</th>
                     <th className="border border-black p-2 w-[15%]">Presentación</th>
                     <th className="border border-black p-2 w-[10%]">Temp.</th>
                     <th className="border border-black p-2 w-[10%]">Marcaje</th>
                     <th className="border border-black p-2 w-[10%]">Servicio</th>
                     <th className="border border-black p-2 w-[20%]">Descripción Cliente</th>
                     <th className="border border-black p-2 w-[10%]">Pase</th>
                  </tr>
               </thead>
               <tbody>
                  {selectedRecipes.map((recipe, idx) => (
                    <tr key={idx} className="print:break-inside-avoid">
                       <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                       <td className="border border-black p-2 font-bold">{recipe.name}</td>
                       <td className="border border-black p-2">{recipe.serviceDetails.presentation || '-'}</td>
                       <td className="border border-black p-2 text-center">{recipe.serviceDetails.servingTemp || '-'}</td>
                       <td className="border border-black p-2 text-center">{recipe.serviceDetails.cutlery || '-'}</td>
                       <td className="border border-black p-2 text-center">{recipe.serviceDetails.serviceType || '-'}</td>
                       <td className="border border-black p-2 italic">{recipe.serviceDetails.clientDescription || '-'}</td>
                       <td className="border border-black p-2 text-center font-bold">{recipe.serviceDetails.passTime || '-'}</td>
                    </tr>
                  ))}
                  {/* Empty rows filler if needed */}
                  {Array.from({ length: Math.max(0, 8 - selectedRecipes.length) }).map((_, i) => (
                    <tr key={`empty_${i}`}>
                       <td className="border border-black p-4">&nbsp;</td>
                       <td className="border border-black p-4">&nbsp;</td>
                       <td className="border border-black p-4">&nbsp;</td>
                       <td className="border border-black p-4">&nbsp;</td>
                       <td className="border border-black p-4">&nbsp;</td>
                       <td className="border border-black p-4">&nbsp;</td>
                       <td className="border border-black p-4">&nbsp;</td>
                       <td className="border border-black p-4">&nbsp;</td>
                    </tr>
                  ))}
               </tbody>
            </table>
            
            <div className="mt-8 border-t border-black pt-2 text-[10px] text-gray-500 text-center">
               Documento interno de cocina y sala - {settings.instituteName}
            </div>
         </div>
      </div>
    );
  }

  // --- VIEW: ALLERGEN MATRIX ---
  if (activeTab === 'allergen_matrix') {
    return (
      <div className="min-h-screen bg-gray-100 print:bg-white p-4">
         <div className="max-w-[297mm] mx-auto bg-white shadow-lg print:shadow-none p-8 print:p-0 landscape-print">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-8 print:hidden">
               <button onClick={() => setActiveTab('planning')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                 <ArrowLeft size={20}/> Volver
               </button>
               <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg">
                 <Printer size={20}/> Imprimir Matriz
               </button>
            </div>

            {/* Document */}
            <PrintHeader title="INFORMACIÓN ALÉRGENOS" subtitle={`FECHA SERVICIO: ${eventDate}`} />

            {/* Legend */}
            <div className="mb-4 flex flex-wrap gap-2 justify-center print:justify-start">
               {ALLERGEN_LIST.map(a => (
                 <div key={a} className="flex items-center gap-1 border border-black px-1.5 py-0.5 rounded text-[10px]">
                    <span className="text-base">{ALLERGEN_CONFIG[a].icon}</span>
                    <span className="uppercase font-bold">{a}</span>
                 </div>
               ))}
            </div>

            <table className="w-full border-collapse border border-black text-xs">
               <thead>
                  <tr className="bg-gray-100 print:bg-gray-200">
                     <th className="border border-black p-2 text-left uppercase w-[20%]">Platos</th>
                     {ALLERGEN_LIST.map(allergen => (
                       <th key={allergen} className="border border-black p-1 text-center w-[5%] rotate-text">
                          <div className="flex flex-col items-center justify-end h-24 pb-1">
                             <span className="text-base mb-1">{ALLERGEN_CONFIG[allergen].icon}</span>
                             <span className="writing-mode-vertical transform -rotate-180 uppercase text-[9px] tracking-tight">
                               {allergen}
                             </span>
                          </div>
                       </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {selectedRecipes.map((recipe, idx) => {
                    const allergens = getRecipeAllergens(recipe);
                    return (
                      <tr key={idx} className="print:break-inside-avoid">
                         <td className="border border-black p-2 font-bold uppercase text-sm">
                           {recipe.name}
                         </td>
                         {ALLERGEN_LIST.map(allergen => {
                           const hasAllergen = allergens.includes(allergen);
                           return (
                             <td key={allergen} className={`border border-black p-1 text-center ${hasAllergen ? 'bg-gray-200 print:bg-gray-200' : ''}`}>
                               {hasAllergen && (
                                 <span className="text-xl font-bold text-black">X</span>
                               )}
                             </td>
                           );
                         })}
                      </tr>
                    );
                  })}
                  {/* Footer Disclaimer */}
                  <tr>
                     <td colSpan={15} className="border border-black p-3 text-right text-[10px] italic">
                        Según Reglamento 1169/2011 y RD 126/2015. 
                        Todos los productos pueden contener trazas de gluten, lácteos, huevos, pescado, soja. 
                        Para más información, consultar con el personal.
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
         <style>{`
           .landscape-print { 
             /* Force landscape in print if possible via CSS, though usually user selects it */
             width: 100%;
           }
           @media print {
             @page { size: landscape; margin: 0.5cm; }
           }
         `}</style>
      </div>
    );
  }

  return null;
};
