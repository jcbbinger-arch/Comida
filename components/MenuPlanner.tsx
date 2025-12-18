import React, { useState, useMemo } from 'react';
import { Recipe, AppSettings, ALLERGEN_LIST, Allergen, Product } from '../types';
import { Plus, Trash2, ArrowLeft, Printer, Search, ArrowUp, ArrowDown, Calendar, FileText, Utensils, AlertOctagon, Users, ShoppingCart, ChevronDown, ChevronRight } from 'lucide-react';

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
  productDatabase: Product[];
}

export const MenuPlanner: React.FC<MenuPlannerProps> = ({ recipes, settings, onBack, productDatabase }) => {
  const [activeTab, setActiveTab] = useState<'planning' | 'service_order' | 'allergen_matrix' | 'purchase_order'>('planning');
  const [menuTitle, setMenuTitle] = useState('MENÚ DEL DÍA');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuPax, setMenuPax] = useState<number>(30);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = recipes.filter(r => 
    !selectedRecipes.find(sr => sr.id === r.id) &&
    (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const purchaseOrderData = useMemo(() => {
    const families: Record<string, Record<string, { name: string, quantity: number, unit: string }>> = {};
    
    selectedRecipes.forEach(recipe => {
      const ratio = menuPax / recipe.yieldQuantity;
      recipe.subRecipes.forEach(sub => {
        sub.ingredients.forEach(ing => {
          const product = productDatabase.find(p => p.name === ing.name);
          const family = product?.category || 'Otros';
          const qtyNum = parseFloat(ing.quantity.replace(',', '.'));
          const finalQty = isNaN(qtyNum) ? 0 : qtyNum * ratio;

          if (!families[family]) families[family] = {};
          if (!families[family][ing.name]) {
            families[family][ing.name] = { name: ing.name, quantity: finalQty, unit: ing.unit };
          } else {
            families[family][ing.name].quantity += finalQty;
          }
        });
      });
    });

    return Object.entries(families).sort(([a], [b]) => a.localeCompare(b));
  }, [selectedRecipes, menuPax, productDatabase]);

  const addToMenu = (recipe: Recipe) => setSelectedRecipes([...selectedRecipes, recipe]);
  const removeFromMenu = (index: number) => {
    const newMenu = [...selectedRecipes];
    newMenu.splice(index, 1);
    setSelectedRecipes(newMenu);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newMenu = [...selectedRecipes];
    const item = newMenu[index];
    newMenu.splice(index, 1);
    newMenu.splice(direction === 'up' ? index - 1 : index + 1, 0, item);
    setSelectedRecipes(newMenu);
  };

  const getRecipeAllergens = (r: Recipe): Allergen[] => {
    const set = new Set<Allergen>();
    r.subRecipes.forEach(sub => sub.ingredients.forEach(ing => ing.allergens.forEach(a => set.add(a))));
    return Array.from(set);
  };

  const PrintHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
       <div className="w-1/4">
          {settings.instituteLogo ? <img src={settings.instituteLogo} className="h-16 object-contain" alt="IES" /> : <span className="font-bold">{settings.instituteName}</span>}
       </div>
       <div className="w-2/4 text-center">
          <h1 className="text-2xl font-bold uppercase mb-1">{title}</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest">{subtitle}</p>
       </div>
       <div className="w-1/4 text-right">
          <p className="text-xs font-bold">{settings.teacherName}</p>
          <p className="text-[10px] text-slate-500">{new Date().toLocaleDateString()}</p>
       </div>
    </div>
  );

  if (activeTab === 'planning') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={24} className="text-slate-600" /></button>
              <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Planificador de Menús</h1>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
               <button onClick={() => setActiveTab('service_order')} disabled={selectedRecipes.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 font-bold text-xs uppercase tracking-widest transition-all"><FileText size={16}/> Orden Servicio</button>
               <button onClick={() => setActiveTab('allergen_matrix')} disabled={selectedRecipes.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 font-bold text-xs uppercase tracking-widest transition-all"><AlertOctagon size={16}/> Matriz Alérgenos</button>
               <button onClick={() => setActiveTab('purchase_order')} disabled={selectedRecipes.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-bold text-xs uppercase tracking-widest transition-all"><ShoppingCart size={16}/> Pedido Familia</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-[75vh]">
               <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Buscar recetas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none shadow-inner" />
                 </div>
               </div>
               <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {filteredRecipes.map(recipe => (
                    <div key={recipe.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shadow-inner">{recipe.photo && <img src={recipe.photo} className="w-full h-full object-cover" alt="" />}</div>
                          <div>
                             <h4 className="font-black text-slate-800 text-sm uppercase leading-none mb-1">{recipe.name}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{recipe.category}</p>
                          </div>
                       </div>
                       <button onClick={() => addToMenu(recipe)} className="p-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Plus size={20} /></button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden h-[75vh]">
               <div className="p-8 border-b border-indigo-50 bg-indigo-50/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><Utensils size={24}/></div>
                    <div>
                      <h3 className="font-black text-indigo-900 uppercase tracking-widest">Configuración del Menú</h3>
                      <p className="text-xs text-indigo-400 font-bold uppercase">Personaliza el servicio y volumen</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-indigo-700 uppercase mb-2 tracking-widest">Nombre del Evento / Servicio</label>
                      <input type="text" value={menuTitle} onChange={e => setMenuTitle(e.target.value)} className="w-full px-5 py-3 border border-indigo-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-indigo-700 uppercase mb-2 tracking-widest">Volumen (Pax)</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                        <input type="number" value={menuPax} onChange={e => setMenuPax(Math.max(1, Number(e.target.value)))} className="w-full pl-12 pr-4 py-3 border border-indigo-100 rounded-2xl text-sm font-black shadow-sm outline-none focus:ring-2 focus:ring-indigo-600" />
                      </div>
                    </div>
                  </div>
               </div>
               
               <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/30 custom-scrollbar">
                  {selectedRecipes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
                       <Calendar size={64} className="mb-4 opacity-10"/>
                       <p className="font-bold uppercase tracking-widest text-xs">Añade platos para empezar el menú</p>
                    </div>
                  ) : (
                    selectedRecipes.map((recipe, idx) => (
                      <div key={`${recipe.id}_${idx}`} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 animate-fadeIn">
                         <span className="font-black text-slate-200 text-xl w-8 text-center">{idx + 1}</span>
                         <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">{recipe.photo && <img src={recipe.photo} className="w-full h-full object-cover" alt="" />}</div>
                         <div className="flex-grow">
                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight truncate">{recipe.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold italic truncate">Ficha base para {recipe.yieldQuantity} raciones</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                              <button onClick={() => moveItem(idx, 'up')} className="p-1 text-slate-300 hover:text-slate-900 disabled:opacity-20" disabled={idx === 0}><ArrowUp size={16}/></button>
                              <button onClick={() => moveItem(idx, 'down')} className="p-1 text-slate-300 hover:text-slate-900 disabled:opacity-20" disabled={idx === selectedRecipes.length -1}><ArrowDown size={16}/></button>
                            </div>
                            <button onClick={() => removeFromMenu(idx)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
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

  if (activeTab === 'purchase_order') {
    return (
      <div className="min-h-screen bg-gray-100 print:bg-white p-4 md:p-10">
         <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none p-10 print:p-0 rounded-3xl overflow-hidden">
            <div className="flex justify-between items-center mb-8 print:hidden">
               <button onClick={() => setActiveTab('planning')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"><ArrowLeft size={20}/> Ajustar Menú</button>
               <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all"><Printer size={20}/> Imprimir Pedido</button>
            </div>

            <PrintHeader title="HOJA DE PEDIDO AGRUPADO" subtitle={`EVENTO: ${menuTitle} | PAX: ${menuPax} | FECHA: ${eventDate}`} />

            <div className="space-y-10">
               {purchaseOrderData.map(([family, items]) => (
                 <div key={family} className="break-inside-avoid border-t-4 border-slate-900 pt-4">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4 bg-slate-100 p-2 inline-block">FAMILIA: {family}</h3>
                    <table className="w-full text-left text-sm">
                       <thead className="border-b-2 border-slate-900">
                          <tr className="text-[10px] font-black uppercase text-slate-400">
                             <th className="py-2">Producto / Género</th>
                             <th className="py-2 text-right">Cantidad Total</th>
                             <th className="py-2 pl-4">Unidad</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {/* Explicitly cast mapped items to avoid unknown type errors on properties like name, quantity, and unit */}
                          {Object.values(items).map((item: any) => (
                            <tr key={item.name} className="hover:bg-slate-50">
                               <td className="py-3 font-bold text-slate-800">{item.name}</td>
                               <td className="py-3 text-right font-mono font-black text-emerald-600">{item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(3)}</td>
                               <td className="py-3 pl-4 font-bold text-slate-400 uppercase text-[10px]">{item.unit}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 text-center text-[10px] text-slate-300 print:text-black">
               Este pedido ha sido generado automáticamente para un volumen de {menuPax} comensales. Verifique mermas antes de solicitar.
            </div>
         </div>
      </div>
    );
  }

  if (activeTab === 'service_order') {
    return (
      <div className="min-h-screen bg-gray-100 print:bg-white p-4 md:p-10">
         <div className="max-w-[297mm] mx-auto bg-white shadow-2xl print:shadow-none p-10 print:p-0 rounded-3xl">
            <div className="flex justify-between items-center mb-8 print:hidden">
               <button onClick={() => setActiveTab('planning')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900"><ArrowLeft size={20}/> Volver</button>
               <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold"><Printer size={20}/> Imprimir Orden</button>
            </div>

            <PrintHeader title="ORDEN DE SERVICIO TÉCNICA" subtitle={`MENÚ: ${menuTitle} | VOLUMEN: ${menuPax} PAX`} />

            <table className="w-full border-collapse border border-slate-900 text-xs text-left">
               <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                     <th className="p-3 w-10">Nº</th>
                     <th className="p-3 w-1/4">Plato del Menú</th>
                     <th className="p-3 w-1/6">Servicio</th>
                     <th className="p-3">Marcaje Sala Requerido</th>
                     <th className="p-3 w-32">Temp. / Pase</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {selectedRecipes.map((recipe, idx) => (
                    <tr key={idx} className="print:break-inside-avoid">
                       <td className="p-4 text-center font-black bg-slate-50">{idx + 1}</td>
                       <td className="p-4">
                          <p className="font-black text-slate-800 uppercase">{recipe.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">"{recipe.serviceDetails.clientDescription || 'Sin descripción comercial'}"</p>
                       </td>
                       <td className="p-4 font-bold text-slate-600 uppercase text-[10px]">{recipe.serviceDetails.serviceType}</td>
                       <td className="p-4 text-slate-700 leading-relaxed font-medium">{recipe.serviceDetails.cutlery || 'Estándar'}</td>
                       <td className="p-4 text-center">
                          <p className="font-black text-rose-600">{recipe.serviceDetails.servingTemp || '-'}</p>
                          <p className="text-[9px] font-bold uppercase text-slate-400 mt-1">{recipe.serviceDetails.passTime || 'INMEDIATO'}</p>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    );
  }

  if (activeTab === 'allergen_matrix') {
    return (
      <div className="min-h-screen bg-gray-100 print:bg-white p-4 md:p-10">
         <div className="max-w-[297mm] mx-auto bg-white shadow-2xl print:shadow-none p-10 print:p-0 rounded-3xl">
            <div className="flex justify-between items-center mb-8 print:hidden">
               <button onClick={() => setActiveTab('planning')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900"><ArrowLeft size={20}/> Volver</button>
               <button onClick={() => window.print()} className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold"><Printer size={20}/> Imprimir Matriz</button>
            </div>

            <PrintHeader title="DECLARACIÓN DE ALÉRGENOS" subtitle={`FECHA SERVICIO: ${eventDate} | MENÚ: ${menuTitle}`} />

            <div className="overflow-x-auto">
               <table className="w-full border-collapse border border-slate-900 text-[10px] table-fixed">
                  <thead>
                     <tr className="bg-slate-50">
                        <th className="border border-slate-900 p-3 text-left uppercase font-black text-slate-900 w-1/5">Relación de Platos</th>
                        {ALLERGEN_LIST.map(allergen => (
                          <th key={allergen} className="border border-slate-900 p-1 text-center font-black uppercase text-[8px] vertical-text">
                             <div className="flex flex-col items-center justify-end h-24 pb-1">
                                <span className="text-lg mb-1">{ALLERGEN_CONFIG[allergen].icon}</span>
                                <span className="writing-mode-vertical rotate-180 transform">{allergen}</span>
                             </div>
                          </th>
                        ))}
                     </tr>
                  </thead>
                  <tbody>
                     {selectedRecipes.map((recipe, idx) => {
                       const allergens = getRecipeAllergens(recipe);
                       return (
                         <tr key={idx}>
                            <td className="border border-slate-900 p-3 font-black uppercase text-slate-800 leading-tight">{recipe.name}</td>
                            {ALLERGEN_LIST.map(allergen => {
                              const hasAllergen = allergens.includes(allergen);
                              return (
                                <td key={allergen} className={`border border-slate-900 p-1 text-center ${hasAllergen ? 'bg-rose-50' : ''}`}>
                                  {hasAllergen && <span className="text-xl font-black text-rose-600">X</span>}
                                </td>
                              );
                            })}
                         </tr>
                       );
                     })}
                  </tbody>
               </table>
            </div>
            <div className="mt-8 p-4 border border-slate-200 rounded-xl bg-slate-50 text-[10px] leading-relaxed italic text-slate-500">
               Información facilitada en cumplimiento del Reglamento UE 1169/2011. A pesar de los controles, no se puede garantizar la ausencia total de trazas por contaminación cruzada en cocina. Consulte siempre con su camarero.
            </div>
         </div>
      </div>
    );
  }

  return null;
};
