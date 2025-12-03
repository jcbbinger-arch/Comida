
import React, { useState, useMemo, useRef } from 'react';
import { Product, Allergen, ALLERGEN_LIST } from '../types';
import { Search, Plus, ArrowLeft, Edit2, Trash2, Save, X, Shield, Check, Download, Upload } from 'lucide-react';

interface ProductDatabaseViewerProps {
  products: Product[];
  onBack: () => void;
  onAdd: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onImport: (products: Product[]) => void;
}

export const ProductDatabaseViewer: React.FC<ProductDatabaseViewerProps> = ({ 
  products, 
  onBack, 
  onAdd, 
  onEdit, 
  onDelete,
  onImport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived state for filtered list
  // Optimization: Limit to 100 items to prevent rendering lag with 1700+ items
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products
      .filter(p => p.name.toLowerCase().includes(term) || p.category?.toLowerCase().includes(term))
      .slice(0, 100);
  }, [products, searchTerm]);

  // Handle Edit Click
  const handleEditClick = (product: Product) => {
    setEditingProduct({ ...product }); // Clone to avoid direct mutation
    setIsCreating(false);
  };

  // Handle Create Click
  const handleCreateClick = () => {
    setEditingProduct({
      id: `custom_${Date.now()}`,
      name: '',
      category: 'Otros',
      unit: 'kg',
      allergens: []
    });
    setIsCreating(true);
  };

  // Save Form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) return alert("El nombre es obligatorio");

    if (isCreating) {
      onAdd(editingProduct);
    } else {
      onEdit(editingProduct);
    }
    setEditingProduct(null);
    setIsCreating(false);
  };

  // Toggle Allergen in Form
  const toggleAllergen = (allergen: Allergen) => {
    if (!editingProduct) return;
    const current = editingProduct.allergens || [];
    const updated = current.includes(allergen)
      ? current.filter(a => a !== allergen)
      : [...current, allergen];
    setEditingProduct({ ...editingProduct, allergens: updated });
  };

  // EXPORT JSON
  const handleExport = () => {
    const jsonString = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productos_db_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // IMPORT JSON
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (confirm(`Se han encontrado ${json.length} productos en el archivo. ¿Deseas importarlos y fusionarlos con tu base de datos actual?`)) {
            onImport(json);
          }
        } else {
          alert("El formato del archivo no es una lista de productos válida.");
        }
      } catch (err) {
        console.error(err);
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-slate-600">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Base de Datos de Productos</h1>
              <p className="text-slate-500 text-sm">Gestiona materias primas y sus alérgenos ({products.length} total)</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>
            
            {/* Import/Export Buttons */}
            <button 
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              title="Descargar listado"
            >
              <Download size={18} /> <span className="hidden lg:inline text-sm">JSON</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
            <button 
              onClick={handleImportClick}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              title="Subir listado"
            >
              <Upload size={18} /> <span className="hidden lg:inline text-sm">JSON</span>
            </button>

            <button 
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm ml-2"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 border-b border-gray-200 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-bold">Nombre</th>
                  <th className="px-6 py-4 font-bold">Categoría</th>
                  <th className="px-6 py-4 font-bold">Unidad</th>
                  <th className="px-6 py-4 font-bold">Alérgenos</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-3 font-medium text-slate-800">{product.name}</td>
                    <td className="px-6 py-3 text-slate-500 capitalize">{product.category || '-'}</td>
                    <td className="px-6 py-3 text-slate-500">{product.unit || 'kg'}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.allergens && product.allergens.length > 0 ? (
                          product.allergens.map(a => (
                            <span key={a} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                              {a.substring(0, 3).toUpperCase()}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-green-600 flex items-center gap-1 opacity-50"><Check size={12}/> Libre</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm(`¿Eliminar "${product.name}" de la base de datos?`)) onDelete(product.id);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" 
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Search size={48} className="mx-auto mb-2 opacity-20" />
                      <p>No se encontraron productos que coincidan con tu búsqueda.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-center">
            Mostrando {filteredProducts.length} de {products.length} productos
          </div>
        </div>

      </div>

      {/* Edit/Create Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold">{isCreating ? 'Nuevo Producto' : 'Editar Producto'}</h2>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Producto</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                    placeholder="Ej: Harina de Trigo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
                    <input 
                      type="text" 
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                      list="categories-list"
                    />
                    <datalist id="categories-list">
                      <option value="carnes" />
                      <option value="pescados" />
                      <option value="verduras" />
                      <option value="frutas" />
                      <option value="lacteos" />
                      <option value="almacen" />
                      <option value="aceites" />
                      <option value="condimentos" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Unidad (Defecto)</label>
                    <input 
                      type="text" 
                      value={editingProduct.unit}
                      onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                      placeholder="kg, L, ud"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Shield size={16} className="text-red-500"/> Alérgenos
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALLERGEN_LIST.map(allergen => {
                      const isSelected = editingProduct.allergens.includes(allergen);
                      return (
                        <button
                          key={allergen}
                          type="button"
                          onClick={() => toggleAllergen(allergen)}
                          className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium border transition-all ${
                            isSelected 
                            ? 'bg-red-100 border-red-300 text-red-800' 
                            : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-100'
                          }`}
                        >
                          {allergen}
                          {isSelected && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>
                  {editingProduct.allergens.length === 0 && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Check size={12}/> Este producto se marcará como libre de alérgenos.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)} 
                  className="px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2"
                >
                  <Save size={18} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
