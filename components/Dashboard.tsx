
import React, { useState, useRef } from 'react';
import { Recipe, AppSettings, Allergen } from '../types';
import { Plus, Search, Eye, Edit2, Trash2, Download, ChefHat, Settings, Calendar, Database, LogOut, Copy, FileJson, Sparkles } from 'lucide-react';

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
  onOpenAIBridge: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  recipes, settings, onNew, onEdit, onView, onDelete, onImport, onOpenSettings, onOpenMenuPlanner, onOpenProductDB, onOpenAIBridge, onLogout
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecipes = recipes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.category.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.name) onImport({ ...json, id: Date.now().toString(), lastModified: Date.now() });
      } catch (err) { alert('Archivo no válido.'); }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-slate-900 text-white shadow-lg">
        <div className="bg-slate-950/50 px-4 py-2 border-b border-slate-800">
           <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              <div className="flex items-center gap-3">
                 {settings.instituteLogo && <img src={settings.instituteLogo} alt="IES" className="h-6" />}
                 <span>{settings.instituteName}</span>
              </div>
              <div className="flex items-center gap-4">
                 <span>{settings.teacherName}</span>
                 <button onClick={onLogout} className="hover:text-white flex items-center gap-1 transition-colors"><LogOut size={12} /> Salir</button>
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 p-3 rounded-2xl shadow-xl shadow-amber-900/20"><ChefHat size={32} className="text-slate-900" /></div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase">Panel de Gestión</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">IES La Flota • Gastronomía Técnica</p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap justify-center">
              <button onClick={onOpenSettings} className="p-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white" title="Configuración"><Settings size={20} /></button>
              <button onClick={onOpenProductDB} className="p-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white" title="Inventario Maestro"><Database size={20} /></button>
              <button onClick={onOpenMenuPlanner} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg transition-all uppercase text-[10px] tracking-widest"><Calendar size={18}/> Menú del Día</button>
              
              <div className="h-10 w-px bg-slate-700 mx-2"></div>

              <button onClick={onOpenAIBridge} className="flex items-center gap-2 px-5 py-3 bg-slate-950 border border-amber-500/30 hover:border-amber-500 hover:bg-slate-900 rounded-xl transition-all text-amber-400 font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Sparkles size={16} /> Puente IA
              </button>
              
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
              <button onClick={handleImportClick} className="flex items-center gap-2 px-5 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-all text-slate-300 font-black text-[10px] uppercase tracking-widest">
                <FileJson size={18}/> Importar JSON
              </button>
              
              <button onClick={onNew} className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black rounded-xl shadow-xl transition-all uppercase text-[10px] tracking-widest">
                <Plus size={20} /> Nueva Ficha
              </button>
            </div>
          </div>

          <div className="mt-8 max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Buscar por nombre, categoría o ingrediente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.length > 0 ? filteredRecipes.map(recipe => {
            const costPerPortion = recipe.totalCost && recipe.yieldQuantity ? (recipe.totalCost / recipe.yieldQuantity).toFixed(2) : '0.00';
            return (
              <div key={recipe.id} className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden flex flex-col group">
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  {recipe.photo ? (
                    <img src={recipe.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><ChefHat size={48} /></div>
                  )}
                  <div className="absolute top-4 left-4"><span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{recipe.category}</span></div>
                  <div className="absolute bottom-4 right-4"><div className="bg-amber-500 text-slate-900 text-[10px] font-black px-4 py-2 rounded-2xl shadow-xl uppercase tracking-tighter"><span className="text-sm">{costPerPortion}€</span>/Pax</div></div>
                </div>
                <div className="p-6 flex-grow">
                  <h3 className="text-lg font-black text-slate-800 leading-tight mb-3 uppercase tracking-tighter line-clamp-2">{recipe.name}</h3>
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>{recipe.yieldQuantity} {recipe.yieldUnit}</span>
                    <span className="bg-slate-50 px-2 py-1 rounded-lg">ID: {recipe.id.slice(-4)}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                  <div className="flex gap-1">
                    <button onClick={() => onView(recipe)} className="p-3 bg-white text-slate-600 hover:text-slate-900 rounded-xl shadow-sm transition-all"><Eye size={18} /></button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(recipe)} className="p-3 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => confirm(`¿Borrar ${recipe.name}?`) && onDelete(recipe.id)} className="p-3 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-xl shadow-sm transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 text-center">
               <ChefHat size={64} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay fichas técnicas registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
