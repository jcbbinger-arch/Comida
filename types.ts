
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
  unit?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  allergens: Allergen[]; // Alérgenos específicos de este ingrediente en esta receta
}

export interface SubRecipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  photo: string; // Base64
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
  photo: string; // Foto principal del plato terminado
  yieldQuantity: number;
  yieldUnit: string;
  
  // Nuevo: Array de elaboraciones (ej: Salsa, Guarnición, Principal)
  subRecipes: SubRecipe[];
  
  // Nuevo: Instrucciones de montaje final
  platingInstructions: string;
  
  serviceDetails: ServiceDetails;
  lastModified: number;

  // Campos legacy para migración (opcionales)
  ingredients?: Ingredient[];
  instructions?: string;
}

export interface AppSettings {
  teacherName: string;
  instituteName: string;
  teacherLogo: string;
  instituteLogo: string;
}

export interface AppBackup {
  version: number;
  timestamp: number;
  settings: AppSettings;
  recipes: Recipe[];
  productDatabase?: Product[]; // Include custom products in backup
}

export const CATEGORIES = [
  "Entrantes",
  "Ensaladas",
  "Sopas y Cremas",
  "Carnes",
  "Aves",
  "Pescados",
  "Mariscos",
  "Pastas y Arroces",
  "Guarniciones",
  "Salsas",
  "Postres",
  "Panadería",
  "Bebidas",
  "Otros"
];
