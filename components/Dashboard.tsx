
import React, { useState, useRef } from 'react';
import { Recipe, AppSettings, Allergen } from '../types';
import { Plus, Search, Eye, Edit2, Trash2, Download, Upload, ChefHat, Settings, Calendar, Database } from 'lucide-react';

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
  onOpenProductDB
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = (recipe: Recipe) => {
    // Use Blob API for robust file download (handles large base64 strings better than data URIs)
    const jsonString = JSON.stringify(recipe, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.href = url;
    downloadAnchorNode.download = `${recipe.name.replace(/\s+/g, '_')}_ficha.json`;
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    
    // Cleanup
    document.body.removeChild(downloadAnchorNode);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation updated for new structure
        if (json.name) {
            const newRecipe = { ...json, id: Date.now().toString() };
            onImport(newRecipe);
        } else {
            alert('El archivo no parece ser una ficha técnica válida.');
        }
      } catch (err) {
        console.error(err);
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  const getRecipeAllergens = (recipe: Recipe): string[] => {
     const set = new Set<string>();
     if (recipe.subRecipes) {
       recipe.subRecipes.forEach(sub => sub.ingredients.forEach(i => i.allergens?.forEach(a => set.add(a))));
     } else if (recipe.ingredients) {
       // Legacy fallback
       recipe.ingredients.forEach(i => i.allergens?.forEach(a => set.add(a)));
     }
     return Array.from(set);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-lg">
        
        {/* Branding Bar */}
        <div className="bg-slate-950/50 px-4 py-2 border-b border-slate-800">
           <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-slate-400">
              <div className="flex items-center gap-3">
                 {settings.instituteLogo ? (
                   <img src={settings.instituteLogo} alt="Institute" className="h-8 w-auto object-contain bg-white/10 rounded px-1" />
                 ) : (
                   <span className="font-serif italic">{settings.instituteName}</span>
                 )}
                 {settings.instituteLogo && <span>{settings.instituteName}</span>}
              </div>
              <div className="flex items-center gap-3">
                 <span>{settings.teacherName}</span>
                 {settings.teacherLogo && (
                   <img src={settings.teacherLogo} alt="Teacher" className="h-8 w-8 rounded-full object-cover border border-slate-700" />
                 )}
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                 <ChefHat size={40} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Mis Recetas</h1>
                <p className="text-slate-400">Gestor de Fichas Técnicas Compuestas</p>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap justify-center">
               <button 
                onClick={onOpenSettings}
                className="flex items-center justify-center p-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-white"
                title="Configuración"
              >
                <Settings size={20} />
              </button>

              <button
                onClick={onOpenProductDB}
                className="flex items-center justify-center p-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-white"
                title="Base de Datos de Productos"
              >
                <Database size={20} />
              </button>

              <button
                onClick={onOpenMenuPlanner}
                className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all"
              >
                <Calendar size={18}/>
                <span>Planificador Menús</span>
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleFileChange} 
              />
              <button 
                onClick={handleImportClick}
                className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all"
              >
                <Upload size={18} className="text-slate-400"/>
                <span className="hidden sm:inline text-sm font-medium">Importar</span>
              </button>
              <button 
                onClick={onNew}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Nueva Ficha</span>
              </button>
            </div>
          </div>

          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar receta..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-slate-800 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <ChefHat size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium">No se encontraron recetas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map(recipe => {
              const allergens = getRecipeAllergens(recipe);
              return (
                <div key={recipe.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group flex flex-col">
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {recipe.photo ? (
                      <img 
                        src={recipe.photo} 
                        alt={recipe.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ChefHat size={32} className="opacity-20 mb-2" />
                        <span className="text-xs">Sin foto</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                        {recipe.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-grow">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1 truncate" title={recipe.name}>{recipe.name}</h3>
                    <p className="text-sm text-slate-500 mb-3">{recipe.yieldQuantity} {recipe.yieldUnit}</p>
                    
                    {/* Allergens Summary */}
                    <div className="flex flex-wrap gap-1 mb-3 h-5 overflow-hidden">
                      {allergens.length > 0 ? allergens.slice(0, 4).map(a => (
                        <span key={a} className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 uppercase">
                          {a.substring(0,3)}
                        </span>
                      )) : (
                        <span className="text-[10px] text-green-600 px-1.5 py-0.5">Sin alérgenos detectados</span>
                      )}
                      {allergens.length > 4 && <span className="text-[9px] text-gray-400">+{allergens.length - 4}</span>}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 text-xs text-slate-400 border-t border-gray-100 pt-3">
                      {recipe.subRecipes ? (
                        <span title="Elaboraciones">📚 {recipe.subRecipes.length} Elab.</span>
                      ) : (
                         <span>📄 Simple</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onView(recipe)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleExport(recipe)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onEdit(recipe)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm('¿Borrar esta ficha?')) {
                            onDelete(recipe.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
