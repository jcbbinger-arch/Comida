
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, AppBackup, Recipe, Product } from '../types';
import { X, Save, Upload, School, User, Database, Download } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  recipes: Recipe[];
  productDatabase: Product[];
  onSave: (settings: AppSettings) => void;
  onRestore: (backup: AppBackup) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, recipes, productDatabase, onSave, onRestore }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const backupInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'teacherLogo' | 'instituteLogo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleDownloadBackup = () => {
    const backup: AppBackup = {
      version: 1,
      timestamp: Date.now(),
      settings: localSettings,
      recipes: recipes,
      productDatabase: productDatabase
    };
    
    // Use Blob to handle large files (many Base64 images) preventing "Network Error" or truncation
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchorNode.download = `mis_recetas_backup_${dateStr}.json`;
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    
    // Cleanup
    document.body.removeChild(downloadAnchorNode);
    URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => {
    if (confirm("ATENCIÓN: Restaurar una copia de seguridad borrará TODAS las recetas y configuraciones actuales. ¿Deseas continuar?")) {
      backupInputRef.current?.click();
    }
  };

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Simple validation
        if (json.recipes && json.settings) {
           onRestore(json);
           onClose();
        } else {
           alert("El archivo no parece ser una copia de seguridad válida.");
        }
      } catch (err) {
        console.error(err);
        alert("Error al leer el archivo de copia de seguridad.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">Configuración de la App</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Institute Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b pb-2 mb-4">
                <School className="text-amber-500" /> Datos del Instituto
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del IES</label>
                <input 
                  type="text" 
                  value={localSettings.instituteName}
                  onChange={e => setLocalSettings(prev => ({...prev, instituteName: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Logo del IES</label>
                <div className="relative aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group hover:border-slate-400 transition-colors">
                  {localSettings.instituteLogo ? (
                      <img src={localSettings.instituteLogo} alt="IES Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <School size={32} className="mb-1 opacity-50"/>
                        <span className="text-xs">Subir logo</span>
                      </div>
                  )}
                  <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleImageUpload(e, 'instituteLogo')}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="text-white text-xs font-bold flex items-center gap-1"><Upload size={14}/> Cambiar</p>
                  </div>
                </div>
                {localSettings.instituteLogo && (
                  <button onClick={() => setLocalSettings(prev => ({...prev, instituteLogo: ''}))} className="text-xs text-red-500 mt-1 hover:underline">Eliminar logo</button>
                )}
              </div>
            </div>

            {/* Teacher Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b pb-2 mb-4">
                <User className="text-amber-500" /> Datos del Profesor
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Profesor</label>
                <input 
                  type="text" 
                  value={localSettings.teacherName}
                  onChange={e => setLocalSettings(prev => ({...prev, teacherName: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Logo / Avatar</label>
                <div className="relative aspect-square w-32 mx-auto bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group hover:border-slate-400 transition-colors">
                  {localSettings.teacherLogo ? (
                      <img src={localSettings.teacherLogo} alt="Teacher Logo" className="w-full h-full object-cover" />
                  ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <User size={32} className="mb-1 opacity-50"/>
                        <span className="text-xs">Foto</span>
                      </div>
                  )}
                  <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleImageUpload(e, 'teacherLogo')}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-full">
                      <p className="text-white text-xs font-bold"><Upload size={14}/></p>
                  </div>
                </div>
                {localSettings.teacherLogo && (
                  <div className="text-center mt-1">
                    <button onClick={() => setLocalSettings(prev => ({...prev, teacherLogo: ''}))} className="text-xs text-red-500 hover:underline">Eliminar foto</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Backup Section */}
          <div className="pt-4 border-t border-gray-200">
             <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
                <Database className="text-blue-500" /> Gestión de Datos
             </div>
             <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-blue-800">
                  <p className="font-bold">Centro de Control de Copias de Seguridad</p>
                  <p className="opacity-80">Descarga todos tus datos o restaura una copia anterior.</p>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={handleDownloadBackup}
                     className="px-3 py-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                   >
                     <Download size={16}/> Descargar Todo
                   </button>
                   <input type="file" ref={backupInputRef} className="hidden" accept=".json" onChange={handleRestoreFileChange} />
                   <button 
                     onClick={handleRestoreClick}
                     className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                   >
                     <Upload size={16}/> Restaurar
                   </button>
                </div>
             </div>
          </div>

        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Save size={18} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
