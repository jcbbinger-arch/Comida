
import React, { useState, useMemo, useRef } from 'react';
import { Product, Allergen, ALLERGEN_LIST } from '../types';
import { Search, Plus, ArrowLeft, Edit2, Trash2, Save, X, Shield, Check, Download, Upload, DollarSign, Copy, FileJson, FileSpreadsheet } from 'lucide-react';

interface ProductDatabaseViewerProps {
  products: Product[];
  onBack: () => void;
  onAdd: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onImport: (products: Product[]) => void;
}

export const ProductDatabaseViewer: React.FC<ProductDatabaseViewerProps> = ({ 
  products, onBack, onAdd, onEdit, onDelete, onImport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products
      .filter(p => p.name.toLowerCase().includes(term) || p.category?.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchTerm]);

  const copyProductPrompt = () => {
    const prompt = `ACTÚA COMO UN GENERADOR DE DATOS JSON PURO. NO ESCRIBAS EXPLICACIONES, NO USES BLOQUES DE CÓDIGO (\`\`\`).
Genera una lista de productos en formato JSON.
ESTRUCTURA: [ { "name": "Nombre", "category": "familia", "unit": "kg/L/unidad", "pricePerUnit": 0.00, "allergens": [] } ]
REGLA DE ALÉRGENOS: Usa solo: Gluten, Crustáceos, Huevos, Pescado, Cacahuetes, Soja, Lácteos, Frutos de cáscara, Apio, Mostaza, Sésamo, Sulfitos, Altramuces, Moluscos.
Devuelve exclusivamente el array JSON [ ... ].`;
    navigator.clipboard.writeText(prompt);
    alert('Prompt de Inventario copiado. Úsalo en Gemini para obtener el JSON directo.');
  };

  const mapCsvAllergen = (csvAllergen: string): Allergen | null => {
    const clean = csvAllergen.trim().toLowerCase();
    if (clean === 'leche') return 'Lácteos';
    if (clean === 'fruta de cascara' || clean === 'frutos de cascara') return 'Frutos de cáscara';
    return ALLERGEN_LIST.find(a => a.toLowerCase() === clean) || null;
  };

  const processImportedList = (importedList: any[]) => {
    const updatedDatabase = [...products];
    importedList.forEach((newProd: any) => {
      const index = updatedDatabase.findIndex(p => p.name.toLowerCase() === newProd.name.toLowerCase());
      const prodData: Product = {
        id: index >= 0 ? updatedDatabase[index].id : `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: newProd.name,
        category: newProd.category || 'Otros',
        unit: newProd.unit || 'kg',
        pricePerUnit: typeof newProd.pricePerUnit === 'string' 
          ? parseFloat(newProd.pricePerUnit.replace(',', '.')) 
          : (parseFloat(newProd.pricePerUnit) || 0),
        allergens: Array.isArray(newProd.allergens) ? newProd.allergens : []
      };
      if (index >= 0) { updatedDatabase[index] = prodData; }
      else { updatedDatabase.push(prodData); }
    });
    onImport(updatedDatabase);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedList = JSON.parse(event.target?.result as string);
        if (!Array.isArray(importedList)) return alert('El JSON debe ser un array de productos.');
        processImportedList(importedList);
        alert(`${importedList.length} productos procesados (JSON).`);
      } catch (err) { alert('Error al procesar el archivo JSON.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        const importedList: any[] = [];
        const startLine = lines[0].toLowerCase().includes('nombre') ? 1 : 0;

        for (let i = startLine; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(';');
          if (cols.length < 3) continue;

          const allergensRaw = cols[3] || '';
          const allergens: Allergen[] = allergensRaw === '-' 
            ? [] 
            : allergensRaw.split(',')
                .map(a => mapCsvAllergen(a))
                .filter((a): a is Allergen => a !== null);

          importedList.push({
            name: cols[0].trim(),
            pricePerUnit: cols[1].trim(),
            unit: cols[2].trim(),
            allergens: allergens,
            category: 'Importado CSV'
          });
        }
        processImportedList(importedList);
        alert(`${importedList.length} productos procesados (CSV).`);
      } catch (err) { alert('Error al procesar el archivo CSV.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (isCreating) onAdd(editingProduct);
    else onEdit(editingProduct);
    setEditingProduct(null);
  };

  const toggleAllergen = (allergen: Allergen) => {
    if (!editingProduct) return;
    const current = editingProduct.allergens || [];
    const updated = current.includes(allergen) ? current.filter(a => a !== allergen) : [...current, allergen];
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
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Inventario Maestro</h1>
              <p className="text-slate-500 text-xs font-bold uppercase opacity-60">Control de Precios y Alérgenos</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <button onClick={copyProductPrompt} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-amber-400 rounded-xl hover:bg-slate-700 transition-all font-bold text-xs uppercase border border-slate-700">
              <Copy size={16} /> Prompt IA
            </button>
            
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportJson} />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all font-bold text-xs uppercase border border-slate-700">
              <FileJson size={16} /> JSON
            </button>

            <input type="file" ref={csvInputRef} className="hidden" accept=".csv,.txt" onChange={handleImportCsv} />
            <button onClick={() => csvInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-emerald-100 rounded-xl hover:bg-emerald-700 transition-all font-bold text-xs uppercase border border-emerald-900">
              <FileSpreadsheet size={16} /> CSV
            </button>

            <button onClick={() => { setEditingProduct({ id: `p_${Date.now()}`, name: '', category: 'Almacén', unit: 'kg', pricePerUnit: 0, allergens: [] }); setIsCreating(true); }} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest">
              <Plus size={18} /> Añadir
            </button>
          </div>
        </div>

        <div className="mb-6 relative max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input type="text" placeholder="Filtrar catálogo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-slate-900 transition-all" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4 w-16">Nº</th>
                <th className="px-6 py-4">Género / Materia Prima</th>
                <th className="px-6 py-4">Precio Mercado</th>
                <th className="px-6 py-4">Unidad</th>
                <th className="px-6 py-4">Alérgenos</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product, idx) => (
                <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md">{idx + 1}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800 uppercase tracking-tight">
                    {product.name}
                    <div className="text-[10px] text-slate-400 font-bold opacity-60">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                    {product.pricePerUnit.toFixed(3)}€
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-black uppercase text-[10px]">{product.unit}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.allergens?.length > 0 ? (
                        product.allergens.map(a => <span key={a} className="text-[9px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded-lg border border-red-100 uppercase">{a.substring(0,3)}</span>)
                      ) : <span className="text-[10px] text-green-500 font-bold uppercase flex items-center gap-1 opacity-40"><Check size={12}/> Limpio</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingProduct({...product}); setIsCreating(false); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
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
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">{isCreating ? 'Nuevo Género' : 'Ficha de Producto'}</h2>
              <button onClick={() => setEditingProduct(null)}><X size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Descripción Producto</label>
                <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Precio €/{editingProduct.unit}</label>
                  <div className="relative">
                    <input type="number" step="any" value={editingProduct.pricePerUnit} onChange={e => setEditingProduct({...editingProduct, pricePerUnit: parseFloat(e.target.value) || 0})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-bold" />
                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Unidad</label>
                  <select value={editingProduct.unit} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold">
                    <option value="kg">kg (Kilo)</option>
                    <option value="L">L (Litro)</option>
                    <option value="unidad">unidad</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Declaración de Alérgenos</label>
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
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all hover:bg-slate-800">Actualizar Inventario</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
