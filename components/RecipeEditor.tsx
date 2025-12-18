import React, { useState, useEffect } from 'react';
import { 
  Recipe, Ingredient, ServiceDetails, SubRecipe, 
  CATEGORIES, Allergen, ALLERGEN_LIST, Product, 
  CUTLERY_DICTIONARY, SERVICE_TYPES, TEMPERATURE_DICTIONARY 
} from '../types';
import { 
  Save, X, Plus, Trash2, Image as ImageIcon, 
  Layers, Shield, Check, Book, Utensils, Thermometer, Info, ChevronDown, ChevronUp
} from 'lucide-react';

interface RecipeEditorProps {
  initialRecipe?: Recipe | null;
  productDatabase: Product[];
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

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ initialRecipe, productDatabase, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [yieldQuantity, setYieldQuantity] = useState<number>(1);
  const [yieldUnit, setYieldUnit] = useState('Raciones');
  const [photo, setPhoto] = useState('');
  const [platingInstructions, setPlatingInstructions] = useState('');
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails>(emptyServiceDetails);
  const [subRecipes, setSubRecipes] = useState<SubRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<{idx: number, list: Product[]} | null>(null);
  const [editingAllergens, setEditingAllergens] = useState<{subIndex: number, ingIndex: number} | null>(null);

  // Estados para colapsables del diccionario
  const [openDict, setOpenDict] = useState<'none' | 'cutlery' | 'temp' | 'service'>('none');

  useEffect(() => {
    if (initialRecipe) {
      setName(initialRecipe.name);
      setCategory(initialRecipe.category);
      setYieldQuantity(initialRecipe.yieldQuantity);
      setYieldUnit(initialRecipe.yieldUnit);
      setPhoto(initialRecipe.photo);
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
    }
  }, [initialRecipe]);

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

  const addSubRecipe = () => {
    const newSub = { 
      id: Date.now().toString(), 
      name: `Nueva Elaboración`, 
      ingredients: [], 
      instructions: '', 
      photo: '' 
    };
    setSubRecipes([...subRecipes, newSub]);
    setActiveTab(subRecipes.length);
  };

  const removeSubRecipe = (index: number) => {
    if (subRecipes.length === 1) return alert("Mínimo 1 elaboración.");
    if (confirm("¿Eliminar esta elaboración por completo?")) {
      setSubRecipes(subRecipes.filter((_, i) => i !== index));
      setActiveTab(Math.max(0, activeTab - 1));
    }
  };

  const updateSubRecipe = (idx: number, field: keyof SubRecipe, value: any) => {
    const newSubs = [...subRecipes];
    newSubs[idx] = { ...newSubs[idx], [field]: value };
    setSubRecipes(newSubs);
  };

  const updateIngredient = (subIdx: number, ingIdx: number, field: keyof Ingredient, value: any) => {
    const newSubs = [...subRecipes];
    newSubs[subIdx].ingredients[ingIdx] = { 
      ...newSubs[subIdx].ingredients[ingIdx], 
      [field]: value 
    };
    if (field === 'name') {
      const lowerVal = (value as string).toLowerCase();
      if (lowerVal.length > 1) {
        const matches = productDatabase.filter(p => p.name.toLowerCase().includes(lowerVal)).slice(0, 5);
        setSuggestions(matches.length ? { idx: ingIdx, list: matches } : null);
      } else setSuggestions(null);
    }
    setSubRecipes(newSubs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialRecipe?.id || Date.now().toString(),
      name, category, photo, yieldQuantity, yieldUnit,
      subRecipes, platingInstructions, serviceDetails,
      lastModified: Date.now()
    });
  };

  // Funciones para añadir desde diccionario (clicado múltiple)
  const appendCutlery = (item: string) => {
    const current = serviceDetails.cutlery.trim();
    const separator = current ? " + " : "";
    setServiceDetails({...serviceDetails, cutlery: current + separator + item});
  };

  const appendTemp = (item: string) => {
    const current = serviceDetails.servingTemp.trim();
    const separator = current ? " | " : "";
    setServiceDetails({...serviceDetails, servingTemp: current + separator + item});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-100 min-h-screen pb-20">
      {/* Barra de Herramientas Superior */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={24} />
          </button>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
            <Book size={24} className="text-amber-500"/> {initialRecipe ? 'Editar Ficha' : 'Nueva Ficha Técnica'}
          </h2>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 flex items-center gap-2 shadow-xl transition-all active:scale-95 font-bold uppercase text-xs">
            <Save size={18} /> Guardar Cambios
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* Cabecera: Info Básica */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Imagen del Plato</label>
            <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 transition-all flex items-center justify-center overflow-hidden group cursor-pointer shadow-inner">
              {photo ? <img src={photo} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-200" />}
              <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Nombre de la Receta</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none text-xl font-serif font-bold text-slate-800" placeholder="Ej: Arroz con Costillejas..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Rendimiento (Cant.)</label>
              <input type="number" value={yieldQuantity} onChange={e => setYieldQuantity(Number(e.target.value))} className="w-full px-5 py-3 border border-slate-100 rounded-2xl" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Unidad</label>
              <input type="text" value={yieldUnit} onChange={e => setYieldUnit(e.target.value)} className="w-full px-5 py-3 border border-slate-100 rounded-2xl" placeholder="Raciones" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Elaboraciones y Procesos */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                <Layers className="text-slate-300" /> Elaboraciones
              </h3>
              <button type="button" onClick={addSubRecipe} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-500 transition-all flex items-center gap-2 shadow-lg">
                <Plus size={16}/> Añadir Elaboración
              </button>
            </div>

            {/* Pestañas de Elaboración */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {subRecipes.map((sub, idx) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 flex items-center gap-3 ${activeTab === idx ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' : 'bg-white text-slate-400 border-white hover:border-slate-200'}`}
                >
                  <span className="opacity-50">{idx + 1}</span>
                  {sub.name || `Elab. ${idx+1}`}
                </button>
              ))}
            </div>

            {/* Editor de la Elaboración Activa */}
            {subRecipes[activeTab] && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-grow">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Título de la Elaboración</label>
                    <input type="text" value={subRecipes[activeTab].name} onChange={e => updateSubRecipe(activeTab, 'name', e.target.value)} className="w-full px-4 py-2 text-xl font-bold border-b-2 border-slate-100 focus:border-slate-900 outline-none transition-colors" placeholder="Nombre de la elaboración..." />
                  </div>
                  <div className="w-32">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Foto Técnica</label>
                    <div className="relative aspect-video bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden group">
                      {subRecipes[activeTab].photo ? <img src={subRecipes[activeTab].photo} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-200"/>}
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, false, activeTab)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  {subRecipes.length > 1 && (
                    <button type="button" onClick={() => removeSubRecipe(activeTab)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lista de Ingredientes</label>
                    <button type="button" onClick={() => {
                      const newSubs = [...subRecipes];
                      newSubs[activeTab].ingredients.push({ id: Date.now().toString(), name: '', quantity: '', unit: '', allergens: [] });
                      setSubRecipes(newSubs);
                    }} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                      <Plus size={14}/> Añadir Ingrediente
                    </button>
                  </div>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner">
                    {subRecipes[activeTab].ingredients.map((ing, iIdx) => (
                      <div key={ing.id} className="grid grid-cols-12 gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100 animate-fadeIn">
                        <div className="col-span-6 relative">
                          <input type="text" value={ing.name} onChange={e => updateIngredient(activeTab, iIdx, 'name', e.target.value)} className="w-full px-3 py-1.5 text-sm border-none bg-transparent outline-none font-bold text-slate-700" placeholder="Ingrediente..." />
                          {suggestions && suggestions.idx === iIdx && (
                            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                              {suggestions.list.map(p => (
                                <div key={p.id} onClick={() => {
                                  const newSubs = [...subRecipes];
                                  newSubs[activeTab].ingredients[iIdx] = { ...newSubs[activeTab].ingredients[iIdx], name: p.name, allergens: p.allergens, unit: p.unit || ing.unit };
                                  setSubRecipes(newSubs);
                                  setSuggestions(null);
                                }} className="px-5 py-3 hover:bg-slate-50 cursor-pointer text-sm flex justify-between border-b last:border-0">
                                  <span className="font-bold">{p.name}</span>
                                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded uppercase font-black">{p.unit}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <input type="text" value={ing.quantity} onChange={e => updateIngredient(activeTab, iIdx, 'quantity', e.target.value)} className="col-span-2 text-right px-1 py-1.5 text-sm border-none bg-transparent outline-none font-mono text-slate-500" placeholder="0.0" />
                        <input type="text" value={ing.unit} onChange={e => updateIngredient(activeTab, iIdx, 'unit', e.target.value)} className="col-span-2 px-1 py-1.5 text-sm border-none bg-transparent outline-none text-slate-400 font-bold" placeholder="ud" />
                        <div className="col-span-2 flex justify-end gap-1">
                          <button type="button" onClick={() => setEditingAllergens({subIndex: activeTab, ingIndex: iIdx})} className={`p-2 rounded-lg transition-colors ${ing.allergens.length ? 'bg-red-50 text-red-500' : 'text-slate-200 hover:text-slate-400'}`}><Shield size={18}/></button>
                          <button type="button" onClick={() => {
                            const newSubs = [...subRecipes];
                            newSubs[activeTab].ingredients.splice(iIdx, 1);
                            setSubRecipes(newSubs);
                          }} className="p-2 text-slate-200 hover:text-red-500"><Trash2 size={18}/></button>
                        </div>
                        {ing.allergens.length > 0 && (
                          <div className="col-span-12 px-3 pb-1 flex gap-1 flex-wrap">
                            {ing.allergens.map(a => <span key={a} className="text-[8px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-black uppercase">{a}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Procedimiento Técnico</label>
                  <textarea value={subRecipes[activeTab].instructions} onChange={e => updateSubRecipe(activeTab, 'instructions', e.target.value)} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm min-h-[200px] outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all leading-relaxed" placeholder="Describe los pasos de la elaboración..." />
                </div>
              </div>
            )}
          </div>

          {/* Diccionarios Interactivos (Columna Derecha) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* PANEL DE SALA (EL CEREBRO DEL CAMARERO) */}
            <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 bg-slate-800 text-white border-b border-white/5">
                <h3 className="font-black text-lg flex items-center gap-2 uppercase tracking-tighter">
                  <Utensils size={20} className="text-amber-400"/> Información de Sala
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Diccionario de Servicios */}
                <div className="space-y-3">
                   <button type="button" onClick={() => setOpenDict(openDict === 'service' ? 'none' : 'service')} className="w-full flex justify-between items-center text-xs font-black text-amber-400 uppercase tracking-widest p-2 bg-white/5 rounded-xl">
                      Tipo de Servicio {openDict === 'service' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                   </button>
                   {openDict === 'service' && (
                     <div className="grid grid-cols-1 gap-2 animate-fadeIn">
                       {SERVICE_TYPES.map(s => (
                         <button 
                            key={s.id} 
                            type="button" 
                            onClick={() => { setServiceDetails({...serviceDetails, serviceType: s.name}); setOpenDict('none'); }}
                            className={`text-left p-3 rounded-xl border transition-all ${serviceDetails.serviceType === s.name ? 'bg-amber-400 border-amber-400 text-slate-900' : 'bg-slate-800 border-slate-700 text-white hover:border-slate-500'}`}
                          >
                           <p className="font-black text-xs uppercase">{s.name}</p>
                           <p className={`text-[10px] mt-1 italic ${serviceDetails.serviceType === s.name ? 'text-slate-800' : 'text-slate-400'}`}>{s.desc}</p>
                         </button>
                       ))}
                     </div>
                   )}
                </div>

                {/* Diccionario de Cubiertos (Clicado Múltiple) */}
                <div className="space-y-3">
                   <button type="button" onClick={() => setOpenDict(openDict === 'cutlery' ? 'none' : 'cutlery')} className="w-full flex justify-between items-center text-xs font-black text-indigo-400 uppercase tracking-widest p-2 bg-white/5 rounded-xl">
                      Marcaje de Cubiertos {openDict === 'cutlery' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                   </button>
                   {openDict === 'cutlery' && (
                     <div className="space-y-4 bg-slate-800 p-4 rounded-2xl border border-slate-700 max-h-80 overflow-y-auto custom-scrollbar animate-fadeIn">
                       {Object.entries(CUTLERY_DICTIONARY).map(([cat, items]) => (
                         <div key={cat} className="space-y-2">
                           <p className="text-[9px] font-black text-slate-500 uppercase border-b border-slate-700 pb-1">{cat}</p>
                           <div className="flex flex-wrap gap-1">
                             {items.map(item => (
                               <button key={item} type="button" onClick={() => appendCutlery(item)} className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                 + {item}
                               </button>
                             ))}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                   <textarea value={serviceDetails.cutlery} onChange={e => setServiceDetails({...serviceDetails, cutlery: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500 h-24 custom-scrollbar" placeholder="Pulsa en los botones para añadir cubiertos..." />
                </div>

                {/* Diccionario de Temperaturas (Clicado Múltiple) */}
                <div className="space-y-3">
                   <button type="button" onClick={() => setOpenDict(openDict === 'temp' ? 'none' : 'temp')} className="w-full flex justify-between items-center text-xs font-black text-rose-400 uppercase tracking-widest p-2 bg-white/5 rounded-xl">
                      Temperaturas Pase {openDict === 'temp' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                   </button>
                   {openDict === 'temp' && (
                     <div className="space-y-4 bg-slate-800 p-4 rounded-2xl border border-slate-700 max-h-80 overflow-y-auto custom-scrollbar animate-fadeIn">
                       {Object.entries(TEMPERATURE_DICTIONARY).map(([cat, items]) => (
                         <div key={cat} className="space-y-2">
                           <p className="text-[9px] font-black text-slate-500 uppercase border-b border-slate-700 pb-1">{cat}</p>
                           <div className="flex flex-wrap gap-1">
                             {items.map(item => (
                               <button key={item} type="button" onClick={() => appendTemp(item)} className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-600 hover:text-white transition-all">
                                 + {item}
                               </button>
                             ))}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                   <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Temperatura</label>
                        <input type="text" value={serviceDetails.servingTemp} onChange={e => setServiceDetails({...serviceDetails, servingTemp: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs text-white" placeholder="Ej: 65°C - 75°C" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Pase</label>
                        <input type="text" value={serviceDetails.passTime} onChange={e => setServiceDetails({...serviceDetails, passTime: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs text-white" placeholder="Inmediato" />
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Montaje y Emplatado Final */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h3 className="font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-4">
                <Plus size={20} className="text-slate-300"/> Montaje Final
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Instrucciones de Emplatado</label>
                  <textarea value={platingInstructions} onChange={e => setPlatingInstructions(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[140px] outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all" placeholder="Cómo disponer los elementos en el plato final..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Descripción Comercial (Menú)</label>
                  <textarea value={serviceDetails.clientDescription} onChange={e => setServiceDetails({...serviceDetails, clientDescription: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm italic font-serif min-h-[100px] outline-none" placeholder="Texto sugerido para el camarero al servir..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Alérgenos (Mantiene funcionalidad previa) */}
      {editingAllergens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 border border-white/20">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 uppercase tracking-tighter"><Shield className="text-red-500" size={28}/> Gestión de Alérgenos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALLERGEN_LIST.map(a => {
                const ing = subRecipes[editingAllergens.subIndex].ingredients[editingAllergens.ingIndex];
                const isSelected = ing.allergens.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      const newSubs = [...subRecipes];
                      const ingRef = newSubs[editingAllergens.subIndex].ingredients[editingAllergens.ingIndex];
                      ingRef.allergens = isSelected ? ingRef.allergens.filter(x => x !== a) : [...ingRef.allergens, a];
                      setSubRecipes(newSubs);
                    }}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black border-2 flex items-center justify-between transition-all uppercase ${isSelected ? 'bg-red-50 border-red-500 text-red-700 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'}`}
                  >
                    {a} {isSelected && <Check size={14}/>}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setEditingAllergens(null)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest">Aceptar Cambios</button>
          </div>
        </div>
      )}
    </form>
  );
};