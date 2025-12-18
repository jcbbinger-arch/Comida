import React, { useState, useMemo, useRef } from 'react';
import { Product, Allergen, ALLERGEN_LIST } from '../types';
import { Search, Plus, ArrowLeft, Edit2, Trash2, Save, X, Shield, Check, Download, Upload, DollarSign } from 'lucide-react';

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

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products
      .filter(p => p.name.toLowerCase().includes(term) || p.category?.toLowerCase().includes(term))
      .slice(0, 100);
  }, [products, searchTerm]);

  const handleEditClick = (product: Product) => {
    setEditingProduct({ ...product });
    setIsCreating(false);
  };

  const handleCreateClick = () => {
    setEditingProduct({
      id: `custom_${Date.now()}`,
      name: '',
      category: 'Otros',
      unit: 'kg',
      pricePerUnit: 0,
      allergens: []
    });
    setIsCreating(true);
  };

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
  };

  const toggleAllergen = (allergen: Allergen) => {
    if (!editingProduct) return;
    const current = editingProduct.allergens || [];
    const updated = current.includes(allergen)
      ? current.filter(a => a !== allergen)
      : [...current, allergen];
    setEditingProduct({ ...editingProduct, allergens: updated });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-slate-600">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tighter uppercase">Gestión de Inventario</h1>
              <p className="text-slate-500 text-sm">Control de alérgenos y precios base ({products.length} productos)</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" />
            </div>
            <button onClick={handleCreateClick} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold">
              <Plus size={18} /> Nuevo Producto
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Género / Materia Prima</th>
                <th className="px-6 py-4">Precio Base</th>
                <th className="px-6 py-4">Unidad</th>
                <th className="px-6 py-4">Alérgenos</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {product.name}
                    <div className="text-[10px] text-slate-400 uppercase font-normal">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                    {product.pricePerUnit.toFixed(2)}€
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-bold uppercase">{product.unit}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.allergens?.length > 0 ? (
                        product.allergens.map(a => <span key={a} className="text-[9px] font-black bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 uppercase">{a.substring(0,3)}</span>)
                      ) : <span className="text-[10px] text-green-600 opacity-50 flex items-center gap-1"><Check size={12}/> Libre</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => confirm(`¿Borrar ${product.name}?`) && onDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">{isCreating ? 'Añadir Género' : 'Actualizar Producto'}</h2>
              <button onClick={() => setEditingProduct(null)}><X size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nombre del Producto</label>
                <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Precio (€)</label>
                  <div className="relative">
                    <input type="number" step="any" value={editingProduct.pricePerUnit} onChange={e => setEditingProduct({...editingProduct, pricePerUnit: parseFloat(e.target.value) || 0})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-bold" />
                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Unidad Base</label>
                  <select value={editingProduct.unit} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold">
                    <option value="kg">kg (Kilogramos)</option>
                    <option value="L">L (Litros)</option>
                    <option value="unidad">unidad</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Alérgenos</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-40 overflow-y-auto custom-scrollbar">
                  {ALLERGEN_LIST.map(a => {
                    const isSel = editingProduct.allergens.includes(a);
                    return (
                      <button key={a} type="button" onClick={() => toggleAllergen(a)} className={`px-2 py-2 rounded-xl text-[9px] font-black border transition-all uppercase ${isSel ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-100 text-slate-400'}`}>
                        {a.substring(0,3)} {isSel && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Guardar Cambios</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};