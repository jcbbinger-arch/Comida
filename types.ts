
export type Allergen = 
  | 'Gluten' | 'Crustáceos' | 'Huevos' | 'Pescado' | 'Cacahuetes' 
  | 'Soja' | 'Lácteos' | 'Frutos de cáscara' | 'Apio' | 'Mostaza' 
  | 'Sésamo' | 'Sulfitos' | 'Altramuces' | 'Moluscos';

export const ALLERGEN_LIST: Allergen[] = [
  'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 
  'Soja', 'Lácteos', 'Frutos de cáscara', 'Apio', 'Mostaza', 
  'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
];

export interface Product {
  id: string;
  name: string;
  allergens: Allergen[];
  category?: string;
  unit: string;
  pricePerUnit: number; 
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string; 
  unit: string;
  category?: string;
  allergens: Allergen[];
  pricePerUnit?: number;
  cost?: number;
}

export interface SubRecipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  photos: string[]; // Actualizado a array
}

export interface ServiceDetails {
  presentation: string;
  servingTemp: string;
  cutlery: string;
  passTime: string;
  serviceType: string;
  clientDescription: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  photo: string;
  creator: string;
  sourceUrl?: string;
  yieldQuantity: number;
  yieldUnit: string;
  subRecipes: SubRecipe[];
  platingInstructions: string;
  serviceDetails: ServiceDetails;
  lastModified: number;
  totalCost?: number;
}

export interface MenuPlan {
  id: string;
  title: string;
  date: string;
  pax: number;
  recipeIds: string[];
  lastModified: number;
}

export interface AppSettings {
  teacherName: string;
  instituteName: string;
  teacherLogo: string;
  instituteLogo: string;
  categories: string[];
}

export interface AppBackup {
  version: number;
  timestamp: number;
  settings: AppSettings;
  recipes: Recipe[];
  productDatabase: Product[];
  savedMenus?: MenuPlan[];
}

export const DEFAULT_CATEGORIES = [
  "Entrantes", "Ensaladas", "Sopas y Cremas", "Carnes", "Aves", 
  "Pescados", "Mariscos", "Pastas y Arroces", "Guarniciones", 
  "Salsas", "Postres", "Panadería", "Bebidas", "Otros"
];

export const SERVICE_TYPES = [
  { id: "americana", name: "Servicio a la Americana", desc: "Práctico, rápido, plato montado en cocina." },
  { id: "inglesa", name: "Servicio a la Inglesa", desc: "Similar al americano, pero con mayor énfasis en presentación." },
  { id: "francesa", name: "Servicio a la Francesa", desc: "Tradicional, todos los platos al mismo tiempo en fuentes." },
  { id: "gueridon", name: "Servicio al Gueridón (o a la Rusa)", desc: "Teatral, preparación parcial en mesa frente al cliente." },
  { id: "milieu", name: "Servicio de Plat de Milieu", desc: "Platos servidos en el centro de la mesa (similar a familiar)." },
  { id: "buffet", name: "Servicio de Buffet", desc: "Autoservicio, alimentos expuestos en mesas o mostradores." }
];

export const CUTLERY_DICTIONARY = {
  "Carnes": "Tenedor trinchero + Cuchillo de carne",
  "Pescado": "Tenedor de pescado + Pala de pescado",
  "Entremeses": "Tenedor de entremés + Cuchillo de entremés",
  "Sopas": "Cuchara de sopa",
  "Postres": "Tenedor de postre + Cuchillo de postre (o cuchara)",
  "Quesos": "Cuchillo de queso + Tenedor pequeño (opcional)"
};

export const TEMPERATURE_DICTIONARY = {
  "Carnes Rojas": [
    { label: "Jugoso", value: "52–55 °C" },
    { label: "Medio", value: "57–60 °C" },
    { label: "Al Punto", value: "60–63 °C" },
    { label: "Bien Hecho", value: "68–72 °C" }
  ],
  "Aves": [
    { label: "Pollo/Pavo", value: "Mínimo 74 °C (sin rosa)" }
  ],
  "Cerdo": [
    { label: "Jugoso", value: "63–65 °C" },
    { label: "Bien Hecho", value: "70–72 °C" }
  ],
  "Cordero": [
    { label: "Jugoso", value: "52–55 °C" },
    { label: "Al Punto", value: "60–63 °C" }
  ],
  "Pescados": [
    { label: "Blanco (Suave)", value: "55–60 °C" },
    { label: "Azul (Rosado)", value: "50–55 °C" },
    { label: "Azul (Cocido)", value: "60–65 °C" }
  ],
  "Otros": [
    { label: "Mariscos (Gambas)", value: "60–65 °C" },
    { label: "Pulpo/Calamares", value: "70–75 °C" },
    { label: "Pastas/Arroces", value: "65–70 °C" },
    { label: "Verduras", value: "60–65 °C" },
    { label: "Ensaladas", value: "4–8 °C" }
  ]
};
