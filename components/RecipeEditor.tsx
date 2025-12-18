
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Recipe, Ingredient, ServiceDetails, SubRecipe, 
  Allergen, ALLERGEN_LIST, Product, 
  // Fix: Renamed CUT_LIFE_DICTIONARY to CUTLERY_DICTIONARY as it's the correct export from ../types
  CUTLERY_DICTIONARY, SERVICE_TYPES, TEMPERATURE_DICTIONARY, AppSettings 
} from '../types';
import { 
  Save, X, Plus, Trash2, Image as ImageIcon, 
  Layers, Shield, Check, Book, Utensils, Thermometer, Info, Link as LinkIcon, User, Sparkles, AlertTriangle
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
      setSubRecipes([{ id: Date.now().toString(), name: 'Elaboración Principal', ingredients: [], instructions: '', photo: '' }]);
      setCreator(settings.teacherName);
    }
  }, [initialRecipe, settings.teacherName]);

  const extractJson = (text: string) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return match[0];
    return text;
  };

  const handleSmartImport = () => {
    try {
      const cleanText = extractJson(importText);
      const data = JSON.parse(cleanText);

      if (!data.name && !data.subRecipes) throw new Error("Formato inválido");

      setName(data.name || name);
      setCategory(data.category || category);
      setYieldQuantity(data.yieldQuantity || yieldQuantity);
      setYieldUnit(data.yieldUnit || yieldUnit);
      setPlatingInstructions(data.platingInstructions || platingInstructions);
      if (data.serviceDetails) setServiceDetails({ ...emptyServiceDetails, ...data.serviceDetails });

      const processedSubs = (data.subRecipes || []).map((sub: any) => ({
        id: `sub_${Math.random()}`,
        name: sub.name || 'Elaboración',
        instructions: sub.instructions || '',
        photo: '',
        ingredients: (sub.ingredients || []).map((ing: any) => {
          const match = productDatabase.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
          const qtyNum = parseFloat(ing.quantity?.toString().replace(',', '.') || '0');
          return {
            id: `ing_${Math.random()}`,
            name: match ? match.name : ing.name,
            quantity: ing.quantity?.toString() || '0',
            unit: match ? match.unit : (ing.unit || 'kg'),
            allergens: match ? match.allergens : (ing.allergens || []),
            pricePerUnit: match ? match.pricePerUnit : 0,
            cost: match ? qtyNum * match.pricePerUnit : 0
          };
        })
      }));

      if (processedSubs.length > 0) {
        setSubRecipes(processedSubs);
        setActiveTab(0);
      }
      
      setShowSmartImport(false);
      setImportText('');
      alert("¡Receta procesada! Revisa los ingredientes marcados con advertencia.");
    } catch (err) {
      alert("Error al procesar: Asegúrate de que el texto contiene un objeto JSON { ... }. No importa si hay texto extra alrededor.");
    }
  };

  const isIngredientInDB = (ingName: string) => {
    return productDatabase.some(p => p.name.toLowerCase() === ingName.toLowerCase());
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
    } else { (ing as any)[field] = value; }

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

  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
            <Book className="text-amber-500" /> {initialRecipe ? 'Editar Ficha' : 'Nueva Ficha Técnica'}
          </h2>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setShowSmartImport(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-all font-black uppercase text-[10px] tracking-widest">
            <Sparkles size={18} /> Cuadro de Pegado (IA)
          </button>
          <button onClick={(e) => {
            const totalCost = subRecipes.reduce((acc, sub) => acc + sub.ingredients.reduce((sAcc, ing) => sAcc + (ing.cost || 0), 0), 0);
            onSave({
              id: initialRecipe?.id || Date.now().toString(),
              name, category, photo, creator, sourceUrl,
              yieldQuantity, yieldUnit, totalCost,
              subRecipes, platingInstructions, serviceDetails,
              lastModified: Date.now()
            });
          }} className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 flex items-center gap-2 shadow-xl font-black uppercase text-xs tracking-widest">
            <Save size={18} /> Guardar Ficha
          </button>
        </div>
      </div>

      {showSmartImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-indigo-600 text-white px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2"><Sparkles /> Importador por Texto</h2>
                <p className="text-indigo-100 text-[10px] font-bold uppercase mt-1">Pega el texto de Gemini y el sistema extraerá los datos</p>
              </div>
              <button onClick={() => setShowSmartImport(false)}><X size={24}/></button>
            </div>
            <div className="p-8 space-y-4">
              <textarea 
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Pega aquí todo el texto que te dio la IA..."
                className="w-full h-80 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl font-mono text-xs focus:border-indigo-500 transition-all outline-none resize-none shadow-inner"
              ></textarea>
              <button onClick={handleSmartImport} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">
                Procesar y Rellenar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Foto Principal</label>
             <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner">
                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-200" />}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPhoto(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
             </div>
          </div>
          <div className="md:col-span-9 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Nombre del Plato</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xl font-serif font-black" placeholder="Ej: Merluza en Salsa Verde" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Categoría</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black">
                  {settings.categories?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Pax Base</label>
                <input type="number" value={yieldQuantity} onChange={e => setYieldQuantity(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Unidad</label>
                <input type="text" value={yieldUnit} onChange={e => setYieldUnit(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
             <div className="flex gap-2 overflow-x-auto pb-2">
                {subRecipes.map((sub, idx) => (
                  <button key={idx} type="button" onClick={() => setActiveTab(idx)} className={`px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 ${activeTab === idx ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-white hover:border-slate-100'}`}>
                    {idx + 1}. {sub.name}
                  </button>
                ))}
                <button onClick={() => setSubRecipes([...subRecipes, { id: Date.now().toString(), name: 'Nueva Elaboración', ingredients: [], instructions: '', photo: '' }])} className="p-3 bg-white text-slate-400 rounded-2xl border border-dashed border-slate-200 hover:text-slate-900"><Plus size={18}/></button>
             </div>

             {subRecipes[activeTab] && (
               <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center border-b pb-4">
                    <input type="text" value={subRecipes[activeTab].name} onChange={e => {
                      const n = [...subRecipes]; n[activeTab].name = e.target.value; setSubRecipes(n);
                    }} className="text-xl font-black uppercase tracking-tight outline-none w-full" />
                    {subRecipes.length > 1 && <button onClick={() => {
                      const n = subRecipes.filter((_, i) => i !== activeTab); setSubRecipes(n); setActiveTab(0);
                    }} className="text-red-400"><Trash2 size={20}/></button>}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Ingredientes / Escandallo</span>
                       <button onClick={() => {
                         const n = [...subRecipes]; n[activeTab].ingredients.push({ id: Math.random().toString(), name: '', quantity: '', unit: 'kg', allergens: [] }); setSubRecipes(n);
                       }} className="text-indigo-600 flex items-center gap-1"><Plus size={14}/> Añadir</button>
                    </div>
                    <div className="space-y-2">
                      {subRecipes[activeTab].ingredients.map((ing, iIdx) => {
                        const inDB = isIngredientInDB(ing.name);
                        return (
                          <div key={ing.id} className={`grid grid-cols-12 gap-2 p-2 rounded-xl border transition-all ${inDB ? 'bg-slate-50 border-slate-100' : 'bg-amber-50 border-amber-200 animate-pulse'}`}>
                             <div className="col-span-6 relative flex items-center gap-2">
                                {!inDB && ing.name && <AlertTriangle size={16} className="text-amber-500 shrink-0" title="No vinculado al inventario (Coste 0€)" />}
                                <input type="text" value={ing.name} onChange={e => updateIngredient(activeTab, iIdx, 'name', e.target.value)} className="w-full bg-transparent px-2 py-1 text-sm font-bold outline-none uppercase" placeholder="Ingrediente..." />
                                {suggestions && suggestions.idx === iIdx && (
                                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                                     {suggestions.list.map(p => (
                                       <div key={p.id} onClick={() => selectProduct(activeTab, iIdx, p)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-[10px] flex justify-between font-bold uppercase">
                                          <span>{p.name}</span> <span className="text-indigo-600">{p.pricePerUnit.toFixed(2)}€</span>
                                       </div>
                                     ))}
                                  </div>
                                )}
                             </div>
                             <input type="text" value={ing.quantity} onChange={e => updateIngredient(activeTab, iIdx, 'quantity', e.target.value)} className="col-span-2 text-right px-2 py-1 bg-white border rounded-lg text-sm font-mono" placeholder="0.00" />
                             <span className="col-span-1 text-[9px] font-black text-slate-400 uppercase flex items-center">{ing.unit}</span>
                             <span className="col-span-2 text-right font-mono font-black text-indigo-600 text-xs flex items-center justify-end">{ing.cost?.toFixed(2)}€</span>
                             <button onClick={() => {
                               const n = [...subRecipes]; n[activeTab].ingredients.splice(iIdx, 1); setSubRecipes(n);
                             }} className="col-span-1 text-slate-300 hover:text-red-500 flex justify-center items-center"><Trash2 size={16}/></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                     <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Procedimiento</label>
                     <textarea value={subRecipes[activeTab].instructions} onChange={e => {
                       const n = [...subRecipes]; n[activeTab].instructions = e.target.value; setSubRecipes(n);
                     }} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[200px] outline-none" placeholder="Escribe el proceso técnico..." />
                  </div>
               </div>
             )}
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-6">
                <h3 className="font-black uppercase tracking-tighter flex items-center gap-2 border-b border-white/10 pb-4"><Utensils size={18} className="text-amber-500"/> Datos de Sala</h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Servicio</label>
                      <select value={serviceDetails.serviceType} onChange={e => setServiceDetails({...serviceDetails, serviceType: e.target.value})} className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs">
                         {SERVICE_TYPES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Marcaje / Cubiertos</label>
                      <textarea value={serviceDetails.cutlery} onChange={e => setServiceDetails({...serviceDetails, cutlery: e.target.value})} className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs min-h-[60px]" placeholder="Ej: Cubierto de pescado..." />
                   </div>
                   <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Temperatura</label>
                      <input type="text" value={serviceDetails.servingTemp} onChange={e => setServiceDetails({...serviceDetails, servingTemp: e.target.value})} className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs" placeholder="Ej: 75ºC" />
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
                <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Montaje Final</h4>
                <textarea value={platingInstructions} onChange={e => setPlatingInstructions(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[100px]" placeholder="Instrucciones de emplatado..." />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
