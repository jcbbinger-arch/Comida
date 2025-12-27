
import React, { useState } from 'react';
import { Recipe, AppSettings, SubRecipe, Ingredient } from '../types';
import { ArrowLeft, Sparkles, Copy, Check, FileJson, AlertCircle } from 'lucide-react';

interface AIBridgeProps {
  settings: AppSettings;
  onBack: () => void;
  onImport: (recipe: Recipe) => void;
}

export const AIBridge: React.FC<AIBridgeProps> = ({ settings, onBack, onImport }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const masterPrompt = `Actúa como un Chef Ejecutivo y experto en digitalización de datos gastronómicos.
Tu tarea es convertir el texto o imagen de una receta que te voy a proporcionar en un objeto JSON compatible con mi sistema de gestión de cocina.

REGLAS DE FORMATO:
1. Devuelve ÚNICAMENTE el código JSON, sin explicaciones ni texto adicional.
2. Esquema exacto:
{
  "name": "Nombre de la receta",
  "category": "${settings.categories?.join('|') || 'Entrantes|Carnes|Pescados|Postres'}",
  "yieldQuantity": 4,
  "yieldUnit": "raciones",
  "elaborations": [
    {
      "name": "Nombre de la elaboración (ej: Masa, Salsa, Principal)",
      "ingredients": [{"name": "Producto", "quantity": "100", "unit": "g|kg|ml|l|ud"}],
      "instructions": "Pasos detallados..."
    }
  ],
  "notes": "Alérgenos, puntos críticos o consejos",
  "serviceDetails": {
    "presentation": "Cómo emplatar",
    "servingTemp": "Temp ideal",
    "cutlery": "Cubiertos",
    "passTime": "Tiempo estimado",
    "serviceType": "A la Americana (Emplatado)",
    "clientDescription": "Descripción sugerente para carta"
  }
}

REGLAS TÉCNICAS:
- Cantidades siempre numéricas o strings limpios (ej: "0.500").
- Si no hay datos de servicio, deja los campos vacíos "".

RECETA A DIGITALIZAR:
[PEGA AQUÍ TU RECETA O ESCANEO]`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleProcessJSON = () => {
    try {
      setError(null);
      const data = JSON.parse(jsonInput);
      
      if (!data.name || !data.elaborations) {
        throw new Error("El JSON no tiene el formato correcto (faltan campos obligatorios).");
      }

      // Convertir el formato de la IA al formato de la App
      const subRecipes: SubRecipe[] = data.elaborations.map((elab: any, idx: number) => ({
        id: `sr_${Date.now()}_${idx}`,
        name: elab.name || 'Elaboración',
        instructions: elab.instructions || '',
        photo: '',
        ingredients: (elab.ingredients || []).map((ing: any, iIdx: number) => ({
          id: `ing_${Date.now()}_${idx}_${iIdx}`,
          name: (ing.name || '').toUpperCase(),
          quantity: String(ing.quantity || '0'),
          unit: ing.unit || 'kg',
          allergens: [], // Se vincularán al guardar si existen en el catálogo
          cost: 0
        }))
      }));

      const newRecipe: Recipe = {
        id: `ai_${Date.now()}`,
        name: data.name.toUpperCase(),
        category: data.category || settings.categories?.[0] || 'Otros',
        photo: '',
        creator: settings.teacherName,
        yieldQuantity: Number(data.yieldQuantity) || 1,
        yieldUnit: data.yieldUnit || 'raciones',
        subRecipes: subRecipes,
        platingInstructions: data.notes || '',
        serviceDetails: {
          presentation: data.serviceDetails?.presentation || '',
          servingTemp: data.serviceDetails?.servingTemp || '',
          cutlery: data.serviceDetails?.cutlery || '',
          passTime: data.serviceDetails?.passTime || '',
          serviceType: data.serviceDetails?.serviceType || 'Servicio a la Americana',
          clientDescription: data.serviceDetails?.clientDescription || ''
        },
        lastModified: Date.now()
      };

      onImport(newRecipe);
      alert(`¡Éxito! La receta "${newRecipe.name}" se ha digitalizado correctamente.`);
    } catch (err) {
      setError("Error al procesar el JSON. Asegúrate de que la IA te haya devuelto el código correctamente.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto w-full">
        {/* Cabecera */}
        <div className="flex items-center gap-4 mb-10">
           <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
             <ArrowLeft size={24} />
           </button>
           <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-lg">
                 <Sparkles size={24} />
              </div>
              <div>
                 <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Puente de Digitalización IA</h1>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Convierte texto, fotos o audios en fichas técnicas en segundos.</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          
          {/* PASO 1: Prompt Maestro */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-all"></div>
            
            <div>
              <span className="bg-emerald-500 text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-8 inline-block">Paso 1</span>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-6">Copia el<br/><span className="text-emerald-400">Prompt Maestro</span></h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                Hemos diseñado una instrucción ultra-precisa para que Gemini 3 o ChatGPT entiendan exactamente cómo estructurar tu receta sin errores.
              </p>
            </div>

            <button 
              onClick={handleCopyPrompt}
              className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${copySuccess ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-emerald-50'}`}
            >
              {copySuccess ? <><Check size={20}/> ¡Prompt Copiado!</> : <><Copy size={20}/> Copiar Prompt Maestro</>}
            </button>
          </div>

          {/* PASO 2: Importación */}
          <div className="bg-white rounded-[2.5rem] p-10 flex flex-col shadow-xl border border-slate-100">
            <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-8 inline-block self-start">Paso 2</span>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-6">Importa el<br/><span className="text-emerald-600">Resultado</span></h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
              Una vez la IA te devuelva el código JSON, pégalo aquí debajo para pre-visualizar tu nueva ficha técnica.
            </p>

            <div className="flex-grow flex flex-col gap-4">
              <div className="relative flex-grow">
                 <textarea 
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  className="w-full h-full min-h-[300px] p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all placeholder:text-slate-300"
                  placeholder="Pega el código JSON generado por la IA..."
                 />
                 {jsonInput && !error && (
                   <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 p-2 rounded-full animate-pulse">
                     <Check size={16}/>
                   </div>
                 )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 animate-fadeIn">
                   <AlertCircle size={20} className="shrink-0" />
                   <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
                </div>
              )}

              <button 
                onClick={handleProcessJSON}
                disabled={!jsonInput.trim()}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FileJson size={20}/> Crear Ficha desde JSON
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
