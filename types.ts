
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
  category?: string; // Nueva propiedad para agrupamiento
  allergens: Allergen[];
  pricePerUnit?: number;
  cost?: number;
}

export interface SubRecipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  photo: string;
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
  productDatabase?: Product[];
}

export const DEFAULT_CATEGORIES = [
  "Entrantes", "Ensaladas", "Sopas y Cremas", "Carnes", "Aves", 
  "Pescados", "Mariscos", "Pastas y Arroces", "Guarniciones", 
  "Salsas", "Postres", "Panadería", "Bebidas", "Otros"
];

export const SERVICE_TYPES = [
  { id: "americana", name: "Servicio a la Americana", desc: "Emplatado en Cocina. El camarero deposita por la derecha." },
  { id: "inglesa", name: "Servicio a la Inglesa", desc: "Desde fuente por la izquierda con pinza de servicio." },
  { id: "francesa", name: "Servicio a la Francesa", desc: "Se presenta fuente por la izquierda y el cliente se sirve solo." },
  { id: "gueridon", name: "Servicio al Gueridón (o a la Rusa)", desc: "Trinchado o flambeado en carrito auxiliar frente al cliente." },
  { id: "milieu", name: "Servicio de Plat de Milieu", desc: "Al centro para compartir. Requiere cubiertos de servicio." },
  { id: "buffet", name: "Servicio de Buffet", desc: "Exposición en bandejas. Foco en desbarase y bebidas." }
];

export const CUTLERY_DICTIONARY = {
  "Entrantes y Cuchara": [
    "Cuchara sopera (Cremas/Sopas)", "Cuchara de consomé", "Tenedor trinchero + Cuchara sopera (Spaghetti)", "Tenedor trinchero (Pasta corta)"
  ],
  "Pescados y Mariscos": [
    "Pala + Tenedor de pescado", "Cuchillo/Tenedor pescado + Lavadedos", "Tenedor de pescado (Moluscos)", "Tenedor de cocktail"
  ],
  "Carnes": [
    "Cuchillo trinchero + Tenedor trinchero", "Cuchillo de carne (Chuletero) + Tenedor", "Cuchillo y Tenedor trinchero (Aves/Caza)"
  ],
  "Postres": [
    "Tenedor de postre (Tartas)", "Cuchillo + Tenedor de postre (Fruta)", "Cuchara de postre/café (Helados)", "Tenedor y cuchara de postre"
  ]
};

export const TEMPERATURE_DICTIONARY = {
  "Platos Calientes": [
    "Sopas y Cremas: 70°C - 80°C", "Carne Poco hecha: 50°C - 55°C", "Carne al Punto: 60°C - 65°C", "Carne Muy hecha: 70°C+", "Pescados: 55°C - 63°C", "Guarniciones: 65°C - 75°C"
  ],
  "Platos Fríos": [
    "Ensaladas/Gazpachos: 4°C - 8°C", "Pescados Crudos: 2°C - 5°C", "Embutidos/Ibéricos: 18°C - 22°C", "Quesos Frescos: 4°C - 8°C", "Quesos Curados: 16°C - 18°C"
  ],
  "Postres": [
    "Postres Nevera: 4°C - 6°C", "Helados/Sorbetes: -12°C a -15°C", "Postres Calientes: 50°C - 60°C"
  ]
};
