import { Product, Allergen } from '../types';

// Map codes from the JSON to full Allergen names
const ALLERGEN_MAP: Record<string, Allergen> = {
  'GLU': 'Gluten', 'CRU': 'Crustáceos', 'HUE': 'Huevos', 'PES': 'Pescado',
  'CAC': 'Cacahuetes', 'SOY': 'Soja', 'LAC': 'Lácteos', 'FRA': 'Frutos de cáscara',
  'API': 'Apio', 'MUS': 'Mostaza', 'SES': 'Sésamo', 'SUL': 'Sulfitos',
  'ALT': 'Altramuces', 'MOL': 'Moluscos'
};

// Reduced initial dataset (Lightweight for GitHub ~50 items)
// Full database can be imported via JSON in the app later
const RAW_DATA = [
  {"id":"prod_0001","name":"Solomillo de ternera","category":"carnes","unit":"kg","allergens":[]},
  {"id":"prod_0003","name":"Filete de ternera","category":"carnes","unit":"kg","allergens":[]},
  {"id":"prod_0005","name":"Lomo bajo de cerdo","category":"carnes","unit":"kg","allergens":[]},
  {"id":"prod_0010","name":"Pechuga de pollo entera","category":"carnes","unit":"kg","allergens":[]},
  {"id":"prod_0011","name":"Muslo de pollo deshuesado","category":"carnes","unit":"kg","allergens":[]},
  {"id":"prod_0015","name":"Foie fresco","category":"carnes","unit":"kg","allergens":[]},
  {"id":"prod_0030","name":"Carne picada mixta","category":"carnes","unit":"kg","allergens":[]},
  {"id":"prod_0080","name":"Huevo de gallina","category":"lacteos","unit":"unidad","allergens":["HUE"]},
  
  {"id":"prod_0181","name":"Salmón fresco","category":"pescados","unit":"kg","allergens":["PES"]},
  {"id":"prod_0184","name":"Merluza fresca","category":"pescados","unit":"kg","allergens":["PES"]},
  {"id":"prod_0187","name":"Dorada","category":"pescados","unit":"unidad","allergens":["PES"]},
  {"id":"prod_0191","name":"Atún rojo","category":"pescados","unit":"kg","allergens":["PES"]},
  {"id":"prod_0194","name":"Bacalao fresco","category":"pescados","unit":"kg","allergens":["PES"]},
  {"id":"prod_0343","name":"Langostinos cocidos","category":"mariscos","unit":"kg","allergens":["CRU"]},
  {"id":"prod_0372","name":"Almejas finas","category":"mariscos","unit":"kg","allergens":["MOL"]},
  {"id":"prod_0385","name":"Pulpo","category":"mariscos","unit":"kg","allergens":["MOL"]},

  {"id":"prod_0499","name":"Zanahoria","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0504","name":"Cebolla blanca","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0509","name":"Ajo","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0512","name":"Tomate rama","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0517","name":"Pimiento rojo","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0521","name":"Calabacín","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0524","name":"Berenjena","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0539","name":"Perejil fresco","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0482","name":"Lechuga Iceberg","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0493","name":"Coliflor","category":"verduras","unit":"kg","allergens":[]},
  {"id":"prod_0561","name":"Champiñón","category":"verduras","unit":"kg","allergens":[]},

  {"id":"prod_0731","name":"Manzana Golden","category":"frutas","unit":"kg","allergens":[]},
  {"id":"prod_0748","name":"Limón","category":"frutas","unit":"kg","allergens":[]},
  {"id":"prod_0742","name":"Naranja","category":"frutas","unit":"kg","allergens":[]},
  {"id":"prod_0765","name":"Plátano","category":"frutas","unit":"kg","allergens":[]},
  {"id":"prod_0778","name":"Fresas","category":"frutas","unit":"kg","allergens":[]},

  {"id":"prod_0951","name":"Leche entera","category":"lacteos","unit":"L","allergens":["LAC"]},
  {"id":"prod_0961","name":"Nata 35% MG","category":"lacteos","unit":"L","allergens":["LAC"]},
  {"id":"prod_0965","name":"Mantequilla","category":"lacteos","unit":"kg","allergens":["LAC"]},
  {"id":"prod_0981","name":"Queso Manchego","category":"lacteos","unit":"kg","allergens":["LAC"]},
  {"id":"prod_1005","name":"Mozzarella","category":"lacteos","unit":"kg","allergens":["LAC"]},

  {"id":"prod_1281","name":"Harina de trigo","category":"almacen","unit":"kg","allergens":["GLU"]},
  {"id":"prod_1309","name":"Azúcar blanco","category":"almacen","unit":"kg","allergens":[]},
  {"id":"prod_1305","name":"Sal fina","category":"almacen","unit":"kg","allergens":[]},
  {"id":"prod_1344","name":"Arroz redondo","category":"almacen","unit":"kg","allergens":[]},
  {"id":"prod_1358","name":"Espaguetis","category":"almacen","unit":"kg","allergens":["GLU"]},
  {"id":"prod_1561","name":"Aceite de Oliva Virgen Extra","category":"aceites","unit":"L","allergens":[]},
  {"id":"prod_1564","name":"Aceite de Girasol","category":"aceites","unit":"L","allergens":[]},
  {"id":"prod_1592","name":"Vinagre de vino blanco","category":"aceites","unit":"L","allergens":["SUL"]},
  {"id":"prod_1443","name":"Pimienta negra grano","category":"almacen","unit":"kg","allergens":[]},
  {"id":"prod_1677","name":"Ketchup","category":"condimentos","unit":"kg","allergens":[]},
  {"id":"prod_1673","name":"Mayonesa","category":"condimentos","unit":"kg","allergens":["HUE", "SES"]},
  {"id":"prod_1712","name":"Tomate frito","category":"condimentos","unit":"kg","allergens":[]}
];

export const INITIAL_PRODUCT_DATABASE: Product[] = RAW_DATA.map(item => ({
  id: item.id,
  name: item.name,
  category: item.category,
  unit: item.unit,
  allergens: (item.allergens as string[]).map(code => ALLERGEN_MAP[code] || (code as Allergen))
}));