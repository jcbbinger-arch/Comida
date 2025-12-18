
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Recipe, Ingredient, ServiceDetails, SubRecipe, 
  Allergen, ALLERGEN_LIST, Product, 
  CUTLERY_DICTIONARY, SERVICE_TYPES, TEMPERATURE_DICTIONARY, AppSettings 
} from '../types';
import { 
  Save, X, Plus, Trash2, Image as ImageIcon, 
  Layers, Shield, Check, Book, Utensils, Thermometer, Info, ChevronDown, ChevronUp, Link as LinkIcon, User, Sparkles, AlertTriangle, ClipboardText
} from 'lucide-react';

interface RecipeEditorProps {
  initialRecipe?: Recipe | null;
  productDatabase: Product[];
  settings: AppSettings;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

const emptyServiceDetails: ServiceDetails = {
  presentation: '',
  servingTemp: '',
  cutlery: '',
  passTime: '',
  serviceType: 'Servicio a la Americana',
  clientDescription: ''
};

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ initialRecipe, productDatabase, settings, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(settings.categories?.[0] || 'Otros');
  const [yieldQuantity, setYieldQuantity] = useState<number>(1);
  const [yieldUnit, setYieldUnit] = useState('Raciones');
  const [photo, setPhoto] = useState('');
  const [creator, setCreator] = useState(settings.teacherName);
  const [sourceUrl, setSourceUrl] = useState('');
  const [platingInstructions, setPlatingInstructions] = useState('');
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails>(emptyServiceDetails);
  const [subRecipes, setSubRecipes] = useState<SubRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<{idx: number, list: Product[]} | null>(null);
  const [editingAllergens, setEditingAllergens] = useState<{subIndex: number, ingIndex: number} | null>(null);
  const [openDict, setOpenDict] = useState<'none' | 'cutlery' | 'temp' | 'service'>('none');
  
  // Estado para el importador de texto
  const [showSmartImport, setShowSmartImport] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    if (initialRecipe) {
      setName(initialRecipe.name);
      setCategory(initialRecipe.category);
      setYieldQuantity(initialRecipe.yieldQuantity);
      setYieldUnit(initialRecipe.yieldUnit);
      setPhoto(initialRecipe.photo);
      setCreator(initialRecipe.creator || settings.teacherName);
      setSourceUrl(initialRecipe.sourceUrl || '');
      setServiceDetails(initialRecipe.serviceDetails || emptyServiceDetails);
      setPlatingInstructions(initialRecipe.platingInstructions || '');
      setSubRecipes(initialRecipe.subRecipes || []);
    } else {
      setSubRecipes([{
        id: Date.now().toString(),
        name: 'Elaboración Principal',
        ingredients: [],
        instructions: '',
        photo: ''
      }]);
      setCreator(settings.teacherName);
    }
  }, [initialRecipe, settings.teacherName]);

  const handleSmartImport = () => {
    try {
      // Limpiar el texto de posibles bloques de código markdown
      const cleanJson = importText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);

      if (!data.name) throw new Error("Formato no reconocido");

      setName(data.name || '');
      setCategory(data.category || settings.categories[0]);
      setYieldQuantity(data.yieldQuantity || 1);
      setYieldUnit(data.yieldUnit || 'Raciones');
      setPlatingInstructions(data.platingInstructions || '');
      setServiceDetails({
        ...emptyServiceDetails,
        ...(data.serviceDetails || {})
      });

      // Procesar sub-recetas y validar ingredientes
      const processedSubs = (data.subRecipes || []).map((sub: any) => ({
        id: `sub_${Date.now()}_${Math.random()}`,
        name: sub.name || 'Sin nombre',
        instructions: sub.instructions || '',
        photo: '',
        ingredients: (sub.ingredients || []).map((ing: any) => {
          // Intentar vincular con base de datos por nombre
          const match = productDatabase.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
          const qtyNum = parseFloat(ing.quantity?.toString().replace(',', '.') || '0');
          
          return {
            id: `ing_${Date.now()}_${Math.random()}`,
            name: match ? match.name : ing.name,
            quantity: ing.quantity?.toString() || '0',
            unit: match ? match.unit : (ing.unit || 'kg'),
            allergens: match ? match.allergens : (ing.allergens || []),
            pricePerUnit: match ? match.pricePerUnit : 0,
            cost: match ? qtyNum * match.pricePerUnit : 0
          };
        })
      }));

      setSubRecipes(processedSubs.length > 0 ? processedSubs : subRecipes);
      setShowSmartImport(false);
      setImportText('');
      alert("Receta adaptada correctamente. Revisa los ingredientes marcados.");
    } catch (err) {
      alert("Error: El texto pegado no tiene un formato JSON válido. Asegúrate de copiar todo el contenido que generó la IA.");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean, subRecipeIndex?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isMain) setPhoto(reader.result as string);
        else if (subRecipeIndex !== undefined) {
          const newSubs = [...subRecipes];
          newSubs[subRecipeIndex].photo = reader.result as string;
          setSubRecipes(newSubs);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateIngredient = (subIdx: number, ingIdx: number, field: keyof Ingredient, value: any) => {
    const newSubs = [...subRecipes];
    const ing = newSubs[subIdx].ingredients[ingIdx];
    
    if (field === 'quantity') {
      const normalizedValue = value.replace(',', '.');
      ing.quantity = normalizedValue;
      if (ing.pricePerUnit !== undefined) {
        const qtyNum = parseFloat(normalizedValue);
        ing.cost = !isNaN(qtyNum) ? qtyNum * ing.pricePerUnit : 0;
      }
    } else {
      (ing as any)[field] = value;
    }

    if (field === 'name') {
      const lowerVal = (value as string).toLowerCase();
      if (lowerVal.length > 1) {
        const matches = productDatabase.filter(p => p.name.toLowerCase().includes(lowerVal)).slice(0, 5);
        setSuggestions(matches.length ? { idx: ingIdx, list: matches } : null);
      } else setSuggestions(null);
    }
    setSubRecipes(newSubs);
  };

  const selectProduct = (subIdx: number, ingIdx: number, product: Product) => {
    const newSubs = [...subRecipes];
    const qtyNum = parseFloat(newSubs[subIdx].ingredients[ingIdx].quantity.replace(',', '.'));
    newSubs[subIdx].ingredients[ingIdx] = {
      ...newSubs[subIdx].ingredients[ingIdx],
      name: product.name,
      allergens: product.allergens,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit,
      cost: !isNaN(qtyNum) ? qtyNum * product.pricePerUnit : 0
    };
    setSubRecipes(newSubs);
    setSuggestions(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCost = subRecipes.reduce((acc, sub) => 
      acc + sub.ingredients.reduce((sAcc, ing) => sAcc + (ing.cost || 0), 0)
    , 0);

    onSave({
      id: initialRecipe?.id || Date.now().toString(),
      name, category, photo, creator, sourceUrl,
      yieldQuantity, yieldUnit, totalCost,
      subRecipes, platingInstructions, serviceDetails,
      lastModified: Date.now()
    });
  };

  const appendDictValue = (type: 'cutlery' | 'temp', value: string) => {
    if (type === 'cutlery') {
      const current = serviceDetails.cutlery.trim();
      setServiceDetails({...serviceDetails, cutlery: current ? `${current} + ${value}` : value});
    } else {
      const current = serviceDetails.servingTemp.trim();
      setServiceDetails({...serviceDetails, servingTemp: current ? `${current} | ${value}` : value});
    }
  };

  // Comprobar si un ingrediente está en la base de datos
  const isIngredientInDB = (ingName: string) => {
    return productDatabase.some(p => p.name.toLowerCase() === ingName.toLowerCase());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-100 min-h-screen pb-20">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={24} />
          </button>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
            <Book size={24} className="text-amber-500"/> {initialRecipe ? 'Editar Ficha' : 'Nueva Ficha Técnica'}
          </h2>
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => setShowSmartImport(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <Sparkles size={18} /> Pegado Inteligente (IA)
          </button>
          <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 flex items-center gap-2 shadow-xl transition-all font-bold uppercase text-xs">
            <Save size={18} /> Guardar Ficha
          </button>
        </div>
      </div>

      {/* MODAL DE IMPORTACIÓN INTELIGENTE */}
      {showSmartImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-indigo-600 text-white px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                   <Sparkles /> Pegar Receta de Gemini
                </h2>
                <p className="text-indigo-100 text-[10px] font-bold uppercase mt-1 opacity-80">El sistema adaptará automáticamente los campos</p>
              </div>
              <button onClick={() => setShowSmartImport(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
            </div>
            <div className="p-8 space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pega aquí el código generado por la IA:</label>
              <textarea 
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Empieza con { 'name': ..."
                className="w-full h-80 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl font-mono text-xs focus:border-indigo-500 focus:bg-white transition-all outline-none resize-none"
              ></textarea>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={handleSmartImport}
                  className="flex-grow bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
                >
                  Procesar y Adaptar Receta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Cabecera Datos Generales */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Foto Principal</label>
            <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 transition-all flex items-center justify-center overflow-hidden cursor-pointer shadow-inner">
              {photo ? <img src={photo} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-200" />}
              <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <div className="md:col-span-9 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Nombre del Plato</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xl font-serif font-bold" placeholder="Ej: Bacalao a la Riojana" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Categoría</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold">
                  {settings.categories?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase mb-2">
                  <User size={14}/> Autor / Chef
                </label>
                <input type="text" value={creator} onChange={e => setCreator(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase mb-2">
                  <LinkIcon size={14}/> Vídeo / Receta Original
                </label>
                <input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Rendimiento Base</label>
                <input type="number" step="any" value={yieldQuantity} onChange={e => setYieldQuantity(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-100 rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Unidad</label>
                <input type="text" value={yieldUnit} onChange={e => setYieldUnit(e.target.value)} className="w-full px-4 py-2 border border-slate-100 rounded-xl" placeholder="Raciones" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 uppercase flex items-center gap-2"><Layers className="text-slate-300"/> Elaboraciones</h3>
                <button type="button" onClick={() => {
                  const newSub = { id: Date.now().toString(), name: 'Nueva Elaboración', ingredients: [], instructions: '', photo: '' };
                  setSubRecipes([...subRecipes, newSub]);
                  setActiveTab(subRecipes.length);
                }} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 flex items-center gap-2">
                  <Plus size={16}/> Añadir bloque
                </button>
             </div>

             <div className="flex gap-2 overflow-x-auto pb-2">
                {subRecipes.map((sub, idx) => (
                  <button key={sub.id} type="button" onClick={() => setActiveTab(idx)} className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 ${activeTab === idx ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-white hover:border-slate-100'}`}>
                    {idx + 1}. {sub.name || 'Sin nombre'}
                  </button>
                ))}
             </div>

             {subRecipes[activeTab] && (
               <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8 animate-fadeIn">
                  <div className="flex justify-between items-center gap-4">
                    <input type="text" value={subRecipes[activeTab].name} onChange={e => {
                      const newSubs = [...subRecipes];
                      newSubs[activeTab].name = e.target.value;
                      setSubRecipes(newSubs);
                    }} className="flex-grow text-xl font-bold border-b-2 border-slate-50 focus:border-slate-900 outline-none p-1" placeholder="Nombre de la elaboración..." />
                    <button type="button" onClick={() => {
                      if (subRecipes.length > 1 && confirm('¿Eliminar bloque?')) {
                        const newSubs = subRecipes.filter((_, i) => i !== activeTab);
                        setSubRecipes(newSubs);
                        setActiveTab(0);
                      }
                    }} className="text-red-400 hover:text-red-600"><Trash2 size={20}/></button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingredientes y Costes</label>
                       <button type="button" onClick={() => {
                         const newSubs = [...subRecipes];
                         newSubs[activeTab].ingredients.push({ id: Date.now().toString(), name: '', quantity: '', unit: 'kg', allergens: [] });
                         setSubRecipes(newSubs);
                       }} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Plus size={14}/> Añadir fila</button>
                    </div>
                    <div className="space-y-2">
                       {subRecipes[activeTab].ingredients.map((ing, iIdx) => {
                         const exists = isIngredientInDB(ing.name);
                         return (
                           <div key={ing.id} className={`grid grid-cols-12 gap-2 p-2 rounded-xl border group transition-all ${exists ? 'bg-slate-50 border-slate-100' : 'bg-amber-50 border-amber-200'}`}>
                              <div className="col-span-5 relative flex items-center gap-2">
                                 {!exists && ing.name && (
                                   <div title="Ingrediente no encontrado en Inventario. El coste será 0€." className="text-amber-500 animate-pulse">
                                      <AlertTriangle size={18} />
                                   </div>
                                 )}
                                 <input type="text" value={ing.name} onChange={e => updateIngredient(activeTab, iIdx, 'name', e.target.value)} className="w-full px-3 py-2 text-sm bg-transparent outline-none font-bold" placeholder="Nombre ingrediente..." />
                                 {suggestions && suggestions.idx === iIdx && (
                                   <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                      {suggestions.list.map(p => (
                                        <div key={p.id} onClick={() => selectProduct(activeTab, iIdx, p)} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs flex justify-between border-b last:border-0">
                                           <span className="font-bold">{p.name}</span>
                                           <span className="text-slate-400 font-mono">{p.pricePerUnit.toFixed(2)}€/{p.unit}</span>
                                        </div>
                                      ))}
                                   </div>
                                 )}
                              </div>
                              <input 
                                type="text" 
                                value={ing.quantity} 
                                onChange={e => updateIngredient(activeTab, iIdx, 'quantity', e.target.value)} 
                                className="col-span-2 text-right px-2 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none font-mono focus:border-slate-900" 
                                placeholder="0.000" 
                              />
                              <div className="col-span-1 flex items-center text-[10px] font-bold text-slate-400 uppercase">{ing.unit}</div>
                              <div className="col-span-2 flex items-center justify-end font-mono text-xs text-indigo-600 font-bold">
                                 {ing.cost ? ing.cost.toFixed(2) + ' €' : '0.00 €'}
                              </div>
                              <div className="col-span-2 flex justify-end gap-1">
                                 <button type="button" onClick={() => setEditingAllergens({subIndex: activeTab, ingIndex: iIdx})} className={`p-1.5 rounded-lg ${ing.allergens.length ? 'bg-red-100 text-red-600' : 'text-slate-200 hover:text-slate-400'}`}><Shield size={16}/></button>
                                 <button type="button" onClick={() => {
                                   const newSubs = [...subRecipes];
                                   newSubs[activeTab].ingredients.splice(iIdx, 1);
                                   setSubRecipes(newSubs);
                                 }} className="p-1.5 text-slate-200 hover:text-red-500"><Trash2 size={16}/></button>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Procedimiento Técnico</label>
                     <textarea value={subRecipes[activeTab].instructions} onChange={e => {
                       const newSubs = [...subRecipes];
                       newSubs[activeTab].instructions = e.target.value;
                       setSubRecipes(newSubs);
                     }} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm min-h-[200px] outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all leading-relaxed" placeholder="Paso a paso..." />
                  </div>
               </div>
             )}
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="bg-slate-900 rounded-3xl shadow-2xl p-6 space-y-6">
                <h3 className="font-black text-lg text-white flex items-center gap-2 uppercase tracking-tighter border-b border-white/5 pb-4">
                  <Utensils size={20} className="text-amber-400"/> Información de Sala
                </h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Servicio Requerido</label>
                      <select value={serviceDetails.serviceType} onChange={e => setServiceDetails({...serviceDetails, serviceType: e.target.value})} className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500">
                         {SERVICE_TYPES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Marcaje de Cubiertos</label>
                        <button type="button" onClick={() => setOpenDict(openDict === 'cutlery' ? 'none' : 'cutlery')} className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-1 rounded-lg font-bold border border-slate-700">Diccionario</button>
                      </div>
                      {openDict === 'cutlery' && (
                        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 max-h-48 overflow-y-auto custom-scrollbar animate-fadeIn">
                           {Object.entries(CUTLERY_DICTIONARY).map(([cat, items]) => (
                             <div key={cat} className="mb-2">
                               <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{cat}</p>
                               <div className="flex flex-wrap gap-1">
                                  {items.map(item => <button key={item} type="button" onClick={() => appendDictValue('cutlery', item)} className="text-[9px] bg-slate-700 text-white px-2 py-1 rounded hover:bg-indigo-600 transition-colors">+ {item}</button>)}
                               </div>
                             </div>
                           ))}
                        </div>
                      )}
                      <textarea value={serviceDetails.cutlery} onChange={e => setServiceDetails({...serviceDetails, cutlery: e.target.value})} className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white outline-none min-h-[80px]" placeholder="Ej: Cubierto de pescado..." />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Temperatura Pase</label>
                        <button type="button" onClick={() => setOpenDict(openDict === 'temp' ? 'none' : 'temp')} className="text-[10px] bg-slate-800 text-rose-400 px-2 py-1 rounded-lg font-bold border border-slate-700">Guía</button>
                      </div>
                      {openDict === 'temp' && (
                        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 max-h-48 overflow-y-auto custom-scrollbar animate-fadeIn">
                           {Object.entries(TEMPERATURE_DICTIONARY).map(([cat, items]) => (
                             <div key={cat} className="mb-2">
                               <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{cat}</p>
                               <div className="flex flex-wrap gap-1">
                                  {items.map(item => <button key={item} type="button" onClick={() => appendDictValue('temp', item)} className="text-[9px] bg-slate-700 text-white px-2 py-1 rounded hover:bg-rose-600 transition-colors">+ {item}</button>)}
                               </div>
                             </div>
                           ))}
                        </div>
                      )}
                      <input type="text" value={serviceDetails.servingTemp} onChange={e => setServiceDetails({...serviceDetails, servingTemp: e.target.value})} className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="Ej: 65ºC - 75ºC" />
                   </div>
                </div>
             </div>
             <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
                <h3 className="font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-4">Montaje y Descripción</h3>
                <textarea value={platingInstructions} onChange={e => setPlatingInstructions(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[120px] outline-none" placeholder="Cómo montar el plato..." />
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Sugerencia para Sala</label>
                  <textarea value={serviceDetails.clientDescription} onChange={e => setServiceDetails({...serviceDetails, clientDescription: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm italic font-serif min-h-[100px] outline-none" placeholder="Descripción para el comensal..." />
                </div>
             </div>
          </div>
        </div>
      </div>

      {editingAllergens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 uppercase tracking-tighter"><Shield className="text-red-500" size={28}/> Alérgenos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALLERGEN_LIST.map(a => {
                const ing = subRecipes[editingAllergens.subIndex].ingredients[editingAllergens.ingIndex];
                const isSelected = ing.allergens.includes(a);
                return (
                  <button key={a} type="button" onClick={() => {
                    const newSubs = [...subRecipes];
                    const ingRef = newSubs[editingAllergens.subIndex].ingredients[editingAllergens.ingIndex];
                    ingRef.allergens = isSelected ? ingRef.allergens.filter(x => x !== a) : [...ingRef.allergens, a];
                    setSubRecipes(newSubs);
                  }} className={`px-4 py-3 rounded-2xl text-[10px] font-black border-2 flex items-center justify-between transition-all uppercase ${isSelected ? 'bg-red-50 border-red-500 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                    {a} {isSelected && <Check size={14}/>}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setEditingAllergens(null)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black shadow-2xl uppercase tracking-widest">Cerrar</button>
          </div>
        </div>
      )}
    </form>
  );
};
