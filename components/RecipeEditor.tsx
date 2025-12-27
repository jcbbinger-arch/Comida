
import React, { useState, useEffect } from 'react';
import { 
  Recipe, Ingredient, ServiceDetails, SubRecipe, 
  Allergen, Product, 
  CUTLERY_DICTIONARY, SERVICE_TYPES, TEMPERATURE_DICTIONARY, AppSettings 
} from '../types';
import { 
  Save, X, Plus, Trash2, Image as ImageIcon, 
  Book, Utensils, Thermometer, Info, Database, MessageSquare, ChevronDown, CheckCircle2,
  ChefHat, Users, Camera
} from 'lucide-react';

interface RecipeEditorProps {
  initialRecipe?: Recipe | null;
  productDatabase: Product[];
  settings: AppSettings;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  onAddProduct: (product: Product) => void;
}

const emptyServiceDetails: ServiceDetails = {
  presentation: '',
  servingTemp: '',
  cutlery: '',
  passTime: '',
  serviceType: 'Servicio a la Americana',
  clientDescription: ''
};

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ 
  initialRecipe, productDatabase, settings, onSave, onCancel, onAddProduct 
}) => {
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
      // Asegurar que subRecipes tenga el formato correcto (migración en caliente)
      setSubRecipes((initialRecipe.subRecipes || []).map(sr => ({
        ...sr,
        photos: sr.photos || (sr as any).photo ? [(sr as any).photo] : []
      })));
    } else {
      setSubRecipes([{ id: Date.now().toString(), name: 'Elaboración Principal', ingredients: [], instructions: '', photos: [] }]);
      setCreator(settings.teacherName);
    }
  }, [initialRecipe, settings.teacherName]);

  const updateIngredient = (subIdx: number, ingIdx: number, field: keyof Ingredient, value: any) => {
    const newSubs = [...subRecipes];
    const ing = newSubs[subIdx].ingredients[ingIdx];
    if (field === 'quantity') {
      const parsedVal = value.toString().replace(',', '.');
      ing.quantity = parsedVal;
      if (ing.pricePerUnit !== undefined) {
        const qtyNum = parseFloat(parsedVal);
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

  const handleAddSubRecipePhotos = (e: React.ChangeEvent<HTMLInputElement>, subIdx: number) => {
    const files = e.target.files;
    if (files) {
      const newSubs = [...subRecipes];
      const photosArray = [...(newSubs[subIdx].photos || [])];
      
      // Fix: Explicitly type 'file' as File to resolve "unknown is not assignable to Blob" error
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          photosArray.push(reader.result as string);
          newSubs[subIdx].photos = [...photosArray];
          setSubRecipes([...newSubs]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeSubRecipePhoto = (subIdx: number, photoIdx: number) => {
    const newSubs = [...subRecipes];
    newSubs[subIdx].photos = newSubs[subIdx].photos.filter((_, i) => i !== photoIdx);
    setSubRecipes(newSubs);
  };

  const selectProduct = (subIdx: number, ingIdx: number, product: Product) => {
    const newSubs = [...subRecipes];
    const qtyNum = parseFloat(newSubs[subIdx].ingredients[ingIdx].quantity.replace(',', '.'));
    newSubs[subIdx].ingredients[ingIdx] = {
      ...newSubs[subIdx].ingredients[ingIdx],
      name: product.name,
      category: product.category,
      allergens: product.allergens,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit,
      cost: !isNaN(qtyNum) ? qtyNum * product.pricePerUnit : 0
    };
    setSubRecipes(newSubs);
    setSuggestions(null);
  };

  const handleSave = () => {
    const totalCost = subRecipes.reduce((acc, sub) => acc + sub.ingredients.reduce((sAcc, ing) => sAcc + (ing.cost || 0), 0), 0);
    onSave({
      id: initialRecipe?.id || Date.now().toString(),
      name, category, photo, creator, sourceUrl,
      yieldQuantity, yieldUnit, totalCost,
      subRecipes, platingInstructions, serviceDetails,
      lastModified: Date.now()
    });
  };

  const selectedServiceTypeInfo = SERVICE_TYPES.find(s => s.name === serviceDetails.serviceType)?.desc;

  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
            <Book className="text-amber-500" /> {initialRecipe ? 'Editar Ficha' : 'Nueva Ficha Técnica'}
          </h2>
        </div>
        <button onClick={handleSave} className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 flex items-center gap-2 shadow-xl font-black uppercase text-xs tracking-widest">
          <Save size={18} /> Guardar Ficha
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Cabecera Principal */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
             <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner group">
                {photo ? <img src={photo} className="w-full h-full object-cover" alt="" /> : <div className="text-center"><ImageIcon size={48} className="text-slate-200 mx-auto" /><p className="text-[10px] font-black uppercase text-slate-300 mt-2">Portada Plato</p></div>}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Camera className="text-white" size={32} />
                </div>
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
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xl font-serif font-black" placeholder="Nombre de la receta" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Categoría</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black">
                  {settings.categories?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-inner">
                  <label className="block text-[10px] font-black text-amber-700 uppercase mb-2 flex items-center gap-2">
                    <Users size={12}/> Rendimiento (PAX)
                  </label>
                  <input type="number" value={yieldQuantity} onChange={e => setYieldQuantity(Number(e.target.value))} className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl font-black text-amber-900 outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Unidad de Medida</label>
                  <input type="text" value={yieldUnit} onChange={e => setYieldUnit(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-slate-900 transition-all" placeholder="Ej: raciones, pax, ud..." />
               </div>
               <div className="p-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Responsable / Creador</label>
                  <input type="text" value={creator} onChange={e => setCreator(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-black" />
               </div>
            </div>
          </div>
        </div>

        {/* Elaboraciones y Escandallos */}
        <div className="space-y-6">
           <div className="flex gap-2 overflow-x-auto pb-2">
              {subRecipes.map((sub, idx) => (
                <button key={idx} type="button" onClick={() => setActiveTab(idx)} className={`px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 ${activeTab === idx ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-white hover:border-slate-100'}`}>
                  {idx + 1}. {sub.name}
                </button>
              ))}
              <button onClick={() => setSubRecipes([...subRecipes, { id: Date.now().toString(), name: 'Nueva Elaboración', ingredients: [], instructions: '', photos: [] }])} className="p-3 bg-white text-slate-400 rounded-2xl border border-dashed border-slate-200 hover:text-slate-900"><Plus size={18}/></button>
           </div>

           {subRecipes[activeTab] && (
             <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8 overflow-visible">
                <div className="flex justify-between items-center border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Database className="text-slate-300" size={20} />
                    <input type="text" value={subRecipes[activeTab].name} onChange={e => {
                      const n = [...subRecipes]; n[activeTab].name = e.target.value; setSubRecipes(n);
                    }} className="text-xl font-black uppercase tracking-tight outline-none w-full" />
                  </div>
                  <button onClick={() => { if(confirm('¿Eliminar esta elaboración?')){ const n = subRecipes.filter((_,i)=>i!==activeTab); setSubRecipes(n); setActiveTab(0); }}} className="text-slate-300 hover:text-rose-500"><Trash2 size={20}/></button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   {/* Columna Izquierda: Ingredientes */}
                   <div className="lg:col-span-7 space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <span>Escandallo de Ingredientes</span>
                         <button onClick={() => {
                           const n = [...subRecipes]; n[activeTab].ingredients.push({ id: Math.random().toString(), name: '', quantity: '', unit: 'kg', allergens: [] }); setSubRecipes(n);
                         }} className="text-indigo-600 flex items-center gap-1 font-black"><Plus size={14}/> Añadir Ingrediente</button>
                      </div>
                      <div className="space-y-2">
                        {subRecipes[activeTab].ingredients.map((ing, iIdx) => (
                          <div key={ing.id} className="grid grid-cols-12 gap-2 relative group items-center">
                             <input type="text" value={ing.name} onChange={e => updateIngredient(activeTab, iIdx, 'name', e.target.value)} className="col-span-6 bg-slate-50 px-4 py-3 text-xs font-black rounded-xl outline-none uppercase placeholder:opacity-30" placeholder="Buscar ingrediente..." />
                             <input type="text" value={ing.quantity} onChange={e => updateIngredient(activeTab, iIdx, 'quantity', e.target.value)} className="col-span-2 text-right px-2 py-3 bg-white border border-slate-100 rounded-xl text-xs font-mono font-bold" placeholder="0.00" />
                             <span className="col-span-1 text-[9px] font-black text-slate-400 uppercase flex items-center">{ing.unit}</span>
                             <span className="col-span-2 text-right font-mono font-black text-indigo-600 text-xs flex items-center justify-end">{ing.cost?.toFixed(2)}€</span>
                             <button onClick={() => { const n = [...subRecipes]; n[activeTab].ingredients.splice(iIdx, 1); setSubRecipes(n); }} className="col-span-1 text-slate-200 hover:text-red-500 flex justify-center items-center"><Trash2 size={16}/></button>
                             
                             {suggestions && suggestions.idx === iIdx && (
                               <div className="absolute z-[100] left-0 right-0 top-full mt-1 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                  {suggestions.list.map(p => (
                                    <div key={p.id} onClick={() => selectProduct(activeTab, iIdx, p)} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-[10px] font-black uppercase flex justify-between border-b border-slate-50 last:border-0">
                                       <span>{p.name}</span>
                                       <span className="text-slate-300">{p.category}</span>
                                    </div>
                                  ))}
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Columna Derecha: Galería de Fotos Técnicas */}
                   <div className="lg:col-span-5 space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Galería de Imágenes Técnicas (Proceso/Punto)</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(subRecipes[activeTab].photos || []).map((photoSrc, pIdx) => (
                           <div key={pIdx} className="relative aspect-square rounded-2xl overflow-hidden shadow-md group border border-slate-100">
                              <img src={photoSrc} className="w-full h-full object-cover" alt="" />
                              <button 
                                onClick={() => removeSubRecipePhoto(activeTab, pIdx)}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <Trash2 size={12} />
                              </button>
                           </div>
                        ))}
                        <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors group shadow-inner">
                           <div className="text-center">
                              <Camera className="text-slate-200 mx-auto" size={32} />
                              <p className="text-[8px] font-black text-slate-300 mt-1 uppercase tracking-widest">Añadir Foto</p>
                           </div>
                           <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleAddSubRecipePhotos(e, activeTab)} />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Utensils size={14}/> Procedimiento de Cocina</label>
                   <textarea value={subRecipes[activeTab].instructions} onChange={e => {
                     const n = [...subRecipes]; n[activeTab].instructions = e.target.value; setSubRecipes(n);
                   }} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm min-h-[200px] leading-relaxed font-medium outline-none focus:ring-2 focus:ring-slate-900" placeholder="Describe los pasos técnicos, temperaturas de cocción, tiempos..." />
                </div>
             </div>
           )}
        </div>

        {/* Ficha de Servicio */}
        <div className="bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden text-white p-10 space-y-10 relative">
           <div className="absolute top-0 right-0 p-10 opacity-5"><ChefHat size={120}/></div>
           
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                 <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <MessageSquare size={32} className="text-amber-500" /> Ficha de Servicio (Sala)
                 </h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Protocolos de pase, servicio y atención al cliente</p>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Paso Final del Editor</span>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                 {/* Explicación Comercial */}
                 <div className="group">
                    <label className="block text-[10px] font-black text-amber-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                      <Info size={14}/> Explicación del Plato (Para Carta / Camarero)
                    </label>
                    <textarea value={serviceDetails.clientDescription} onChange={e => setServiceDetails({...serviceDetails, clientDescription: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-5 text-sm min-h-[120px] outline-none italic placeholder:text-slate-600 focus:border-amber-500 transition-all text-slate-200" placeholder="Ej: Delicada merluza de pincho asada sobre un velouté de hinojo y crujiente de tinta..." />
                 </div>

                 {/* Tipo de Servicio */}
                 <div className="group">
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Protocolo de Servicio</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                       {SERVICE_TYPES.map(s => (
                         <button key={s.id} type="button" onClick={() => setServiceDetails({...serviceDetails, serviceType: s.name})} className={`px-3 py-3 text-[9px] font-black rounded-xl border transition-all uppercase flex flex-col items-center gap-1 ${serviceDetails.serviceType === s.name ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-lg scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                           {s.name.replace('Servicio a la ', '').replace('Servicio de ', '')}
                         </button>
                       ))}
                    </div>
                    
                    <div className="flex gap-4 items-start">
                       <div className="flex-grow">
                          <input type="text" value={serviceDetails.serviceType} onChange={e => setServiceDetails({...serviceDetails, serviceType: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-amber-500" placeholder="Escribe tu propio tipo de servicio..." />
                       </div>
                    </div>
                    
                    {selectedServiceTypeInfo && (
                       <div className="mt-3 bg-white/5 p-4 rounded-xl border border-white/5 animate-fadeIn">
                          <p className="text-[10px] font-bold text-amber-500 italic flex items-center gap-2">
                            <Info size={12}/> {selectedServiceTypeInfo}
                          </p>
                       </div>
                    )}
                 </div>
              </div>

              <div className="space-y-8">
                 {/* Temperatura de Pase */}
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                       <Thermometer size={14}/> Temperatura de Pase (Asistente)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                       {Object.entries(TEMPERATURE_DICTIONARY).map(([cat, items]) => (
                         <div key={cat} className="group/temp relative">
                           <button type="button" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[8px] font-black text-slate-400 hover:bg-slate-700 flex items-center gap-1">
                             {cat} <ChevronDown size={10}/>
                           </button>
                           <div className="hidden group-hover/temp:block absolute z-50 left-0 bottom-full mb-2 bg-slate-950 border border-slate-700 rounded-xl p-2 shadow-2xl min-w-[180px]">
                              {items.map(item => (
                                <button key={item.label} type="button" onClick={() => setServiceDetails({...serviceDetails, servingTemp: `${item.label} (${item.value})`})} className="block w-full text-left px-3 py-2.5 hover:bg-slate-800 rounded-lg text-[9px] font-black text-slate-300 border-b border-white/5 last:border-0 transition-colors">
                                  {item.label} <span className="text-amber-500">{item.value}</span>
                                </button>
                              ))}
                           </div>
                         </div>
                       ))}
                    </div>
                    <input type="text" value={serviceDetails.servingTemp} onChange={e => setServiceDetails({...serviceDetails, servingTemp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm font-black text-amber-500 outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ej: Muy Caliente (75ºC)" />
                 </div>

                 {/* Cubertería */}
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                       <Utensils size={14}/> Marcaje y Cubertería Requerida
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                       {Object.entries(CUTLERY_DICTIONARY).map(([label, value]) => (
                         <button key={label} type="button" onClick={() => setServiceDetails({...serviceDetails, cutlery: value})} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[8px] font-black text-slate-400 hover:bg-slate-700">
                           {label}
                         </button>
                       ))}
                    </div>
                    <textarea value={serviceDetails.cutlery} onChange={e => setServiceDetails({...serviceDetails, cutlery: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-5 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-amber-500 font-bold uppercase" placeholder="Indica los cubiertos necesarios para el cliente..." />
                 </div>
              </div>
           </div>

           {/* Emplatado y Acabado (Lado Sala) */}
           <div className="pt-10 border-t border-white/5">
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Instrucciones de Emplatado y Acabado Final</label>
              <textarea value={platingInstructions} onChange={e => setPlatingInstructions(e.target.value)} className="w-full bg-slate-900 border-2 border-dashed border-slate-700 rounded-[2rem] p-8 text-sm min-h-[150px] outline-none focus:border-amber-500 transition-colors" placeholder="Pasos finales en cocina antes de que el camarero recoja el plato..." />
           </div>
        </div>
      </div>
    </div>
  );
};
