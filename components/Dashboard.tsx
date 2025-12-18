
import React, { useState, useRef } from 'react';
import { Recipe, AppSettings, Allergen } from '../types';
import { Plus, Search, Eye, Edit2, Trash2, Download, Upload, ChefHat, Settings, Calendar, Database, LogOut, Copy, FileJson } from 'lucide-react';

interface DashboardProps {
  recipes: Recipe[];
  settings: AppSettings;
  onNew: () => void;
  onEdit: (recipe: Recipe) => void;
  onView: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onImport: (recipe: Recipe) => void;
  onOpenSettings: () => void;
  onOpenMenuPlanner: () => void;
  onOpenProductDB: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  recipes, 
  settings, 
  onNew, 
  onEdit, 
  onView, 
  onDelete, 
  onImport,
  onOpenSettings,
  onOpenMenuPlanner,
  onOpenProductDB,
  onLogout
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyRecipePrompt = () => {
    const prompt = `ACTÚA COMO UN GENERADOR DE DATOS ESTRUCTURADOS PARA UNA FICHA TÉCNICA DE COCINA. 
NO ESCRIBAS EXPLICACIONES, NO SALUDES, NO USES BLOQUES DE CÓDIGO (\`\`\`). SOLO EL JSON.

Genera el objeto JSON para la receta: [NOMBRE O LISTA DE INGREDIENTES].
ESTRUCTURA OBLIGATORIA (Copia exactamente esta estructura):
{
  "name": "Nombre exacto del plato",
  "category": "Carnes",
  "yieldQuantity": 10,
  "yieldUnit": "Raciones",
  "subRecipes": [
    {
      "name": "Nombre de la elaboración (ej: Relleno)",
      "ingredients": [
        { "name": "Nombre ingrediente", "quantity": "0.500", "unit": "kg", "allergens": [] }
      ],
      "instructions": "Pasos técnicos paso a paso..."
    }
  ],
  "platingInstructions": "Cómo se monta el plato final...",
  "serviceDetails": {
    "serviceType": "Servicio a la Americana",
    "cutlery": "Tenedor y cuchillo...",
    "servingTemp": "75ºC",
    "clientDescription": "Descripción sugerente para la carta..."
  }
}

IMPORTANTE: Los ingredientes deben coincidir con nombres comunes de inventario. Devuelve ÚNICAMENTE las llaves { ... }.`;
    
    navigator.clipboard.writeText(prompt);
    alert('Prompt Maestro de Receta copiado. Pégalo en Gemini y luego usa "Pegado Inteligente" en el editor.');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.name) {
            onImport({ ...json, id: Date.now().toString(), lastModified: Date.now() });
        } else { alert('El archivo no es una ficha válida.'); }
      } catch (err) { alert('Error al leer el JSON.'); }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  const getRecipeAllergens = (recipe: Recipe): string[] => {
     const set = new Set<string>();
     recipe.subRecipes?.forEach(sub => sub.ingredients.forEach(i => i.allergens?.forEach(a => set.add(a))));
     return Array.from(set);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-slate-900 text-white shadow-lg">
        <div className="bg-slate-950/50 px-4 py-2 border-b border-slate-800">
           <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-slate-400">
              <div className="flex items-center gap-3">
                 {settings.instituteLogo && <img src={settings.instituteLogo} alt="IES" className="h-8 bg-white/10 rounded px-1" />}
                 <span>{settings.instituteName}</span>
              </div>
              <div className="flex items-center gap-4">
                 <span>{settings.teacherName}</span>
                 <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                    <LogOut size={14} /> <span className="text-xs">Salir</span>
                 </button>
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl"><ChefHat size={40} className="text-amber-400" /></div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight uppercase">Panel de Cocina</h1>
                <p className="text-slate-400 text-sm">Gestión Técnica de Producción y Costes</p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap justify-center">
              <button onClick={onOpenSettings} className="p-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-white" title="Ajustes"><Settings size={20} /></button>
              <button onClick={onOpenProductDB} className="p-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-white" title="Inventario"><Database size={20} /></button>
              <button onClick={onOpenMenuPlanner} className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all uppercase text-xs tracking-widest"><Calendar size={18}/> Planificar Menú</button>
              
              <div className="h-10 w-px bg-slate-700 mx-2 hidden sm:block"></div>

              <button onClick={copyRecipePrompt} className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all text-amber-400 font-bold text-xs uppercase" title="Copiar Prompt para Gemini">
                <Copy size={16} /> <span>Prompt IA</span>
              </button>
              
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
              <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all text-slate-300">
                <FileJson size={18}/> <span className="text-xs font-bold uppercase">Importar JSON</span>
              </button>
              
              <button onClick={onNew} className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black rounded-lg shadow-lg transition-all uppercase text-xs tracking-widest">
                <Plus size={20} /> Nueva Ficha
              </button>
            </div>
          </div>

          <div className="mt-8 max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Filtrar por nombre o categoría..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => {
            const allergens = getRecipeAllergens(recipe);
            const costPerPortion = recipe.totalCost && recipe.yieldQuantity ? (recipe.totalCost / recipe.yieldQuantity).toFixed(2) : '0.00';
            
            return (
              <div key={recipe.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group">
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                  {recipe.photo ? (
                    <img src={recipe.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><ChefHat size={60} /></div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-slate-900/90 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
                      {recipe.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-amber-500 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 uppercase">
                      Coste: <span className="text-sm">{costPerPortion}€</span>/Ración
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-grow">
                  <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 uppercase tracking-tighter truncate">{recipe.name}</h3>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase mb-4">
                    <span>{recipe.yieldQuantity} {recipe.yieldUnit}</span>
                    <span className="bg-slate-50 px-2 py-1 rounded-lg">Last: {new Date(recipe.lastModified).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {allergens.length > 0 ? allergens.slice(0, 5).map(a => (
                      <span key={a} className="text-[8px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded-lg border border-red-100 uppercase">{a.substring(0,3)}</span>
                    )) : <span className="text-[9px] text-green-500 font-bold uppercase">✓ Libre de Alérgenos</span>}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between gap-1">
                  <div className="flex gap-1">
                    <button onClick={() => onView(recipe)} className="p-2.5 bg-white text-slate-600 hover:text-slate-900 rounded-xl shadow-sm transition-all"><Eye size={18} /></button>
                    <button onClick={() => {
                        const blob = new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${recipe.name.replace(/\s+/g, '_')}.json`;
                        a.click();
                      }} className="p-2.5 bg-white text-slate-600 hover:text-slate-900 rounded-xl shadow-sm transition-all"><Download size={18} /></button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(recipe)} className="p-2.5 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => confirm(`¿Borrar ficha técnica de ${recipe.name}?`) && onDelete(recipe.id)} className="p-2.5 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-xl shadow-sm transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
