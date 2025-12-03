
import React, { useState, useEffect } from 'react';
import { Recipe, Ingredient, ServiceDetails, SubRecipe, CATEGORIES, Allergen, ALLERGEN_LIST, Product } from '../types';
import { Save, X, Plus, Trash2, Image as ImageIcon, Upload, Layers, AlertTriangle, Shield, Check } from 'lucide-react';

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
  serviceType: '',
  clientDescription: ''
};

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ initialRecipe, productDatabase, onSave, onCancel }) => {
  // Main Recipe State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [yieldQuantity, setYieldQuantity] = useState<number>(1);
  const [yieldUnit, setYieldUnit] = useState('Raciones');
  const [photo, setPhoto] = useState('');
  const [platingInstructions, setPlatingInstructions] = useState('');
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails>(emptyServiceDetails);
  
  // SubRecipes State
  const [subRecipes, setSubRecipes] = useState<SubRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Helper for suggestions
  const [suggestions, setSuggestions] = useState<{idx: number, list: Product[]} | null>(null);

  // Allergen Modal State
  const [editingAllergens, setEditingAllergens] = useState<{subIndex: number, ingIndex: number} | null>(null);

  useEffect(() => {
    if (initialRecipe) {
      setName(initialRecipe.name);
      setCategory(initialRecipe.category);
      setYieldQuantity(initialRecipe.yieldQuantity);
      setYieldUnit(initialRecipe.yieldUnit);
      setPhoto(initialRecipe.photo);
      setServiceDetails(initialRecipe.serviceDetails);
      
      // Handle Migration from old structure to new SubRecipe structure
      if (initialRecipe.subRecipes && initialRecipe.subRecipes.length > 0) {
        setSubRecipes(initialRecipe.subRecipes);
        setPlatingInstructions(initialRecipe.platingInstructions || '');
      } else {
        // Migration: Create one sub-recipe from the old data
        setSubRecipes([{
          id: Date.now().toString(),
          name: 'Elaboración Principal',
          ingredients: initialRecipe.ingredients || [],
          instructions: initialRecipe.instructions || '',
          photo: ''
        }]);
        setPlatingInstructions('');
      }
    } else {
      // New Recipe default state
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
        if (isMain) {
          setPhoto(reader.result as string);
        } else if (subRecipeIndex !== undefined) {
          const newSubs = [...subRecipes];
          newSubs[subRecipeIndex].photo = reader.result as string;
          setSubRecipes(newSubs);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- SubRecipe Management ---

  const addSubRecipe = () => {
    setSubRecipes([
      ...subRecipes, 
      { 
        id: Date.now().toString(), 
        name: `Nueva Elaboración ${subRecipes.length + 1}`, 
        ingredients: [], 
        instructions: '', 
        photo: '' 
      }
    ]);
    setActiveTab(subRecipes.length);
  };

  const removeSubRecipe = (index: number) => {
    if (subRecipes.length === 1) {
      alert("Debe haber al menos una elaboración.");
      return;
    }
    const newSubs = subRecipes.filter((_, i) => i !== index);
    setSubRecipes(newSubs);
    setActiveTab(Math.max(0, activeTab - 1));
  };

  const updateSubRecipeName = (index: number, name: string) => {
    const newSubs = [...subRecipes];
    newSubs[index].name = name;
    setSubRecipes(newSubs);
  };

  const updateSubRecipeInstructions = (index: number, text: string) => {
    const newSubs = [...subRecipes];
    newSubs[index].instructions = text;
    setSubRecipes(newSubs);
  };

  // --- Ingredient Management & Autocomplete ---

  const addIngredient = (subIndex: number) => {
    const newSubs = [...subRecipes];
    newSubs[subIndex].ingredients.push({ 
      id: Date.now().toString(), 
      name: '', 
      quantity: '', 
      unit: '',
      allergens: [] 
    });
    setSubRecipes(newSubs);
  };

  const removeIngredient = (subIndex: number, ingIndex: number) => {
    const newSubs = [...subRecipes];
    newSubs[subIndex].ingredients.splice(ingIndex, 1);
    setSubRecipes(newSubs);
  };

  const updateIngredient = (subIndex: number, ingIndex: number, field: keyof Ingredient, value: any) => {
    const newSubs = [...subRecipes];
    newSubs[subIndex].ingredients[ingIndex] = { 
      ...newSubs[subIndex].ingredients[ingIndex], 
      [field]: value 
    };

    // Auto-detect allergens if name changes
    if (field === 'name') {
      const lowerVal = (value as string).toLowerCase();
      if (lowerVal.length > 1) {
        // Use the passed productDatabase prop for dynamic search
        const matches = productDatabase.filter(p => p.name.toLowerCase().includes(lowerVal));
        if (matches.length > 0) {
           setSuggestions({ idx: ingIndex, list: matches });
        } else {
           setSuggestions(null);
        }
      } else {
        setSuggestions(null);
      }
    }

    setSubRecipes(newSubs);
  };

  const selectProduct = (subIndex: number, ingIndex: number, product: Product) => {
    const newSubs = [...subRecipes];
    newSubs[subIndex].ingredients[ingIndex] = {
      ...newSubs[subIndex].ingredients[ingIndex],
      name: product.name,
      allergens: product.allergens,
      unit: product.unit || newSubs[subIndex].ingredients[ingIndex].unit // Autofill unit if available
    };
    setSubRecipes(newSubs);
    setSuggestions(null);
  };

  const toggleAllergen = (subIndex: number, ingIndex: number, allergen: Allergen) => {
    const newSubs = [...subRecipes];
    const ing = newSubs[subIndex].ingredients[ingIndex];
    if (ing.allergens.includes(allergen)) {
      ing.allergens = ing.allergens.filter(a => a !== allergen);
    } else {
      ing.allergens = [...ing.allergens, allergen];
    }
    setSubRecipes(newSubs);
  };

  // --- Form Submission ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe: Recipe = {
      id: initialRecipe?.id || Date.now().toString(),
      name,
      category,
      photo,
      yieldQuantity,
      yieldUnit,
      subRecipes, // La nueva estructura
      platingInstructions,
      serviceDetails,
      lastModified: Date.now()
    };
    onSave(recipe);
  };

  const updateServiceDetail = (field: keyof ServiceDetails, value: string) => {
    setServiceDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 min-h-screen pb-20 relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">
            {initialRecipe ? 'Editar Ficha Compuesta' : 'Nueva Ficha Compuesta'}
          </h2>
          <p className="text-xs text-slate-500">Define las elaboraciones y el montaje del plato</p>
        </div>
        
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
            <X size={20} /> <span className="hidden sm:inline">Cancelar</span>
          </button>
          <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md">
            <Save size={20} /> <span className="hidden sm:inline">Guardar Ficha</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TOP SECTION: Basic Info & Main Photo */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="md:col-span-3">
              <label className="block text-sm font-bold text-slate-700 mb-2">Foto Final del Plato</label>
              <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-slate-400 transition-colors group">
                {photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-xs">Subir foto plato</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handlePhotoUpload(e, true)} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="text-white text-xs font-bold flex items-center gap-1"><Upload size={14}/> Cambiar</p>
                </div>
              </div>
           </div>

           <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de la Ficha (Plato)</label>
                <input 
                  required
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 font-serif text-lg"
                  placeholder="Ej: Solomillo al vino tinto con guarnición de castañas"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Rendimiento</label>
                 <input 
                   type="number" 
                   min="1"
                   value={yieldQuantity} 
                   onChange={e => setYieldQuantity(Number(e.target.value))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Unidad</label>
                 <input 
                   type="text" 
                   value={yieldUnit} 
                   onChange={e => setYieldUnit(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                   placeholder="Ej: Raciones"
                 />
              </div>
              <div className="md:col-span-1 flex items-end pb-2 text-xs text-gray-500">
                <InfoBox text="Define aquí el nombre global del plato. Añade las elaboraciones (salsas, guarniciones) abajo." />
              </div>
           </div>
        </div>

        {/* MIDDLE SECTION: SubRecipes Manager */}
        <div className="lg:col-span-8 space-y-4">
           
           <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layers className="text-amber-500" size={20}/> Elaboraciones
              </h3>
              <button 
                type="button" 
                onClick={addSubRecipe}
                className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-700 transition-colors shadow-sm"
              >
                <Plus size={16} /> Nueva Elaboración
              </button>
           </div>

           {/* Tabs */}
           <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
              {subRecipes.map((sub, idx) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === idx 
                    ? 'bg-white text-slate-900 border border-gray-200 border-b-white shadow-sm -mb-px relative z-10' 
                    : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
                  }`}
                >
                  {sub.name || `Elab. ${idx + 1}`}
                  {subRecipes.length > 1 && (
                     <span 
                       onClick={(e) => { e.stopPropagation(); removeSubRecipe(idx); }}
                       className="hover:text-red-500 p-0.5 rounded-full"
                     >
                       <X size={14}/>
                     </span>
                  )}
                </button>
              ))}
           </div>

           {/* Active Tab Content */}
           <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm p-6 relative">
              {subRecipes[activeTab] && (
                 <div className="space-y-6 animate-fadeIn">
                    
                    {/* SubRecipe Header */}
                    <div className="flex flex-col md:flex-row gap-6">
                       <div className="flex-grow space-y-4">
                          <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre de la elaboración</label>
                             <input 
                               type="text" 
                               value={subRecipes[activeTab].name} 
                               onChange={(e) => updateSubRecipeName(activeTab, e.target.value)}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 font-bold"
                               placeholder="Ej: Salsa de vino tinto"
                             />
                          </div>
                          
                          {/* Ingredients */}
                          {/* FIX: Removed overflow-hidden from here to allow autocomplete dropdown to show */}
                          <div className="bg-slate-50 rounded-lg border border-gray-200">
                             <div className="px-3 py-2 bg-slate-100 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
                                <span className="text-xs font-bold text-slate-700 uppercase">Ingredientes (Géneros)</span>
                                <button type="button" onClick={() => addIngredient(activeTab)} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                                  <Plus size={14}/> Añadir
                                </button>
                             </div>
                             <div className="divide-y divide-gray-100">
                                {subRecipes[activeTab].ingredients.map((ing, iIdx) => (
                                   <div key={ing.id} className="p-2 relative group hover:bg-white transition-colors">
                                      <div className="flex gap-2 items-start">
                                         <div className="flex-grow relative">
                                            {/* IMPROVED SEARCH INPUT STYLES */}
                                            <input 
                                              type="text" 
                                              placeholder="Buscar género..." 
                                              value={ing.name}
                                              onChange={(e) => updateIngredient(activeTab, iIdx, 'name', e.target.value)}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none placeholder-gray-400 shadow-sm"
                                            />
                                            {/* Autocomplete Dropdown */}
                                            {suggestions && suggestions.idx === iIdx && (
                                              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                                                {suggestions.list.map(p => (
                                                  <div 
                                                    key={p.id}
                                                    onClick={() => selectProduct(activeTab, iIdx, p)}
                                                    className="px-3 py-2 hover:bg-amber-50 cursor-pointer text-sm flex justify-between items-center border-b border-gray-50 last:border-0"
                                                  >
                                                    <span className="font-medium text-slate-700">{p.name}</span>
                                                    <div className="flex gap-1">
                                                      {p.allergens.map(a => <span key={a} className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{a.substring(0,3)}</span>)}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                         </div>
                                         <input 
                                            type="text" 
                                            placeholder="Cant." 
                                            value={ing.quantity}
                                            onChange={(e) => updateIngredient(activeTab, iIdx, 'quantity', e.target.value)}
                                            className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm text-right text-slate-900 bg-white shadow-sm"
                                          />
                                          <input 
                                            type="text" 
                                            placeholder="Ud." 
                                            value={ing.unit}
                                            onChange={(e) => updateIngredient(activeTab, iIdx, 'unit', e.target.value)}
                                            className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white shadow-sm"
                                          />
                                          
                                          {/* Allergen Button - Triggers Modal */}
                                          <button 
                                            type="button"
                                            onClick={() => setEditingAllergens({ subIndex: activeTab, ingIndex: iIdx })}
                                            className={`p-2 rounded-lg hover:bg-gray-200 transition-colors border border-transparent hover:border-gray-300 ${ing.allergens.length > 0 ? 'text-red-500 bg-red-50 border-red-100' : 'text-gray-400'}`}
                                            title="Gestionar Alérgenos"
                                          >
                                            <Shield size={18} fill={ing.allergens.length > 0 ? "currentColor" : "none"} />
                                          </button>

                                          <button 
                                            type="button" 
                                            onClick={() => removeIngredient(activeTab, iIdx)}
                                            className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                          >
                                            <Trash2 size={18} />
                                          </button>
                                      </div>
                                      
                                      {/* Allergen Tags (Read Only in List) */}
                                      <div className="flex flex-wrap gap-1 mt-2 pl-1">
                                        {ing.allergens.map(alg => (
                                          <span key={alg} className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                                            {alg}
                                          </span>
                                        ))}
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>

                       {/* SubRecipe Photo */}
                       <div className="w-full md:w-32 flex-shrink-0">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Foto Elab.</label>
                          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-slate-400 group">
                            {subRecipes[activeTab].photo ? (
                              <img src={subRecipes[activeTab].photo} alt="Sub" className="w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon size={20} className="text-gray-300" />
                              </div>
                            )}
                             <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handlePhotoUpload(e, false, activeTab)} 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                              />
                          </div>
                          {subRecipes[activeTab].photo && (
                            <button type="button" onClick={() => {
                              const newSubs = [...subRecipes];
                              newSubs[activeTab].photo = '';
                              setSubRecipes(newSubs);
                            }} className="text-[10px] text-red-500 w-full text-center mt-1">Borrar</button>
                          )}
                       </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proceso de Elaboración</label>
                      <textarea 
                        value={subRecipes[activeTab].instructions}
                        onChange={e => updateSubRecipeInstructions(activeTab, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none text-slate-700 resize-y min-h-[150px] focus:ring-1 focus:ring-amber-400"
                        placeholder="1. Cortar las verduras..."
                      ></textarea>
                    </div>

                 </div>
              )}
           </div>
        </div>

        {/* RIGHT COLUMN: Service & Plating */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* Plating Instructions */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-slate-800 border-b border-gray-200 pb-2 mb-3">Montaje y Emplatado</h3>
              <p className="text-xs text-slate-500 mb-2">Describa cómo ensamblar las elaboraciones en el plato.</p>
              <textarea 
                value={platingInstructions}
                onChange={e => setPlatingInstructions(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-lg outline-none text-slate-700 resize-none h-40 focus:bg-white focus:ring-2 focus:ring-amber-400"
                placeholder="Disponer la salsa en el fondo..."
              ></textarea>
           </div>

           {/* Service Details */}
           <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-4">
              <h3 className="font-bold text-slate-800 border-b border-amber-200 pb-2 mb-4">Datos de Servicio</h3>
              
              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Temperatura Servicio</label>
                   <input 
                     type="text" 
                     value={serviceDetails.servingTemp}
                     onChange={e => updateServiceDetail('servingTemp', e.target.value)}
                     className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                   />
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tiempo de Pase</label>
                   <input 
                     type="text" 
                     value={serviceDetails.passTime}
                     onChange={e => updateServiceDetail('passTime', e.target.value)}
                     className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                   />
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cubiertos / Marcaje</label>
                   <input 
                     type="text" 
                     value={serviceDetails.cutlery}
                     onChange={e => updateServiceDetail('cutlery', e.target.value)}
                     className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                   />
                </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo de Servicio</label>
                   <select
                     value={serviceDetails.serviceType}
                     onChange={e => updateServiceDetail('serviceType', e.target.value)}
                     className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                   >
                     <option value="">Seleccionar...</option>
                     <option value="Emplatado">Emplatado</option>
                     <option value="Fuente">Fuente / Family Style</option>
                     <option value="Gueridón">Gueridón</option>
                     <option value="Buffet">Buffet</option>
                     <option value="Take Away">Take Away</option>
                   </select>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notas Visuales</label>
                   <textarea
                     value={serviceDetails.presentation}
                     onChange={e => updateServiceDetail('presentation', e.target.value)}
                     className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none resize-none h-20"
                     placeholder="Altura, colores..."
                   ></textarea>
                </div>
              </div>
           </div>
           
           <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Descripción Comercial</label>
              <textarea
                value={serviceDetails.clientDescription}
                onChange={e => updateServiceDetail('clientDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none resize-none h-24"
              ></textarea>
           </div>

        </div>
      </div>

      {/* Allergen Selection Modal */}
      {editingAllergens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
             <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2"><Shield size={20}/> Selección de Alérgenos</h3>
                <button 
                  type="button"
                  onClick={() => setEditingAllergens(null)} 
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
             </div>
             
             <div className="p-6">
                <p className="text-sm text-slate-500 mb-4">
                  Selecciona los alérgenos presentes en: <span className="font-bold text-slate-900">{subRecipes[editingAllergens.subIndex].ingredients[editingAllergens.ingIndex].name || "Ingrediente sin nombre"}</span>
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {ALLERGEN_LIST.map(allergen => {
                     const isSelected = subRecipes[editingAllergens.subIndex].ingredients[editingAllergens.ingIndex].allergens.includes(allergen);
                     return (
                       <button
                         key={allergen}
                         type="button"
                         onClick={() => toggleAllergen(editingAllergens.subIndex, editingAllergens.ingIndex, allergen)}
                         className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                           isSelected 
                           ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' 
                           : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                         }`}
                       >
                         <span>{allergen}</span>
                         {isSelected && <Check size={16} />}
                       </button>
                     );
                   })}
                </div>
             </div>

             <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button 
                  type="button"
                  onClick={() => setEditingAllergens(null)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  Confirmar
                </button>
             </div>
          </div>
        </div>
      )}

    </form>
  );
};

const InfoBox = ({text}: {text: string}) => (
  <div className="bg-blue-50 text-blue-700 p-2 rounded text-xs flex gap-2 items-start border border-blue-100">
    <div className="mt-0.5"><AlertTriangle size={12}/></div>
    <span>{text}</span>
  </div>
);
