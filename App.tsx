
import React, { useState } from 'react';
import { Recipe, AppSettings, AppBackup, Product } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Dashboard } from './components/Dashboard';
import { RecipeEditor } from './components/RecipeEditor';
import { RecipeView } from './components/RecipeView';
import { SettingsModal } from './components/SettingsModal';
import { MenuPlanner } from './components/MenuPlanner';
import { ProductDatabaseViewer } from './components/ProductDatabaseViewer';
import { INITIAL_PRODUCT_DATABASE } from './data/products';

type ViewState = 'DASHBOARD' | 'EDITOR' | 'VIEWER' | 'MENU_PLANNER' | 'PRODUCT_DB';

const defaultSettings: AppSettings = {
  teacherName: "Juan Codina Barranco",
  instituteName: "IES La Flota",
  teacherLogo: "",
  instituteLogo: ""
};

function App() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('appSettings', defaultSettings);
  const [productDatabase, setProductDatabase] = useLocalStorage<Product[]>('productDatabase', INITIAL_PRODUCT_DATABASE);
  
  const [viewState, setViewState] = useState<ViewState>('DASHBOARD');
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Actions ---

  const handleCreateNew = () => {
    setCurrentRecipe(null);
    setViewState('EDITOR');
  };

  const handleEdit = (recipe: Recipe) => {
    // Check if recipe needs migration in memory before editing
    const preparedRecipe = migrateRecipeIfNeeded(recipe);
    setCurrentRecipe(preparedRecipe);
    setViewState('EDITOR');
  };

  const handleView = (recipe: Recipe) => {
    const preparedRecipe = migrateRecipeIfNeeded(recipe);
    setCurrentRecipe(preparedRecipe);
    setViewState('VIEWER');
  };

  const handleDelete = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    if (currentRecipe?.id === id) {
      setViewState('DASHBOARD');
      setCurrentRecipe(null);
    }
  };

  const handleSave = (recipe: Recipe) => {
    // 1. Save the Recipe
    setRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      if (exists) {
        return prev.map(r => r.id === recipe.id ? recipe : r);
      } else {
        return [recipe, ...prev];
      }
    });

    // 2. Auto-Learn New Ingredients
    // We scan the recipe for ingredients that are NOT in our database and add them.
    const newProducts: Product[] = [];
    // Create a Set of existing lowercased names for O(1) lookup
    const existingNames = new Set(productDatabase.map(p => p.name.trim().toLowerCase()));

    recipe.subRecipes.forEach(sub => {
      sub.ingredients.forEach(ing => {
        const normalizedName = ing.name.trim();
        // If it has a name and is not in database
        if (normalizedName && !existingNames.has(normalizedName.toLowerCase())) {
          
          // Avoid duplicates within the same batch
          const alreadyAdded = newProducts.find(p => p.name.toLowerCase() === normalizedName.toLowerCase());
          
          if (!alreadyAdded) {
            newProducts.push({
              id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: normalizedName,
              category: 'Otros', // Default category for learned items
              unit: ing.unit || 'kg',
              allergens: ing.allergens || []
            });
            // Add to set to prevent duplicate adds in this loop
            existingNames.add(normalizedName.toLowerCase());
          }
        }
      });
    });

    if (newProducts.length > 0) {
      setProductDatabase(prev => [...prev, ...newProducts]);
      console.log(`Auto-learned ${newProducts.length} new ingredients.`);
    }

    setViewState('DASHBOARD');
    setCurrentRecipe(null);
  };

  // --- Product Database CRUD Actions ---

  const handleProductAdd = (newProduct: Product) => {
    setProductDatabase(prev => [newProduct, ...prev]);
  };

  const handleProductEdit = (updatedProduct: Product) => {
    setProductDatabase(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleProductDelete = (id: string) => {
    setProductDatabase(prev => prev.filter(p => p.id !== id));
  };

  const handleProductDatabaseImport = (importedProducts: Product[]) => {
    setProductDatabase(prev => {
      const currentMap = new Map(prev.map(p => [p.id, p]));
      let addedCount = 0;
      let updatedCount = 0;

      importedProducts.forEach(p => {
        if (p.id && p.name) {
          if (currentMap.has(p.id)) {
            updatedCount++;
          } else {
            addedCount++;
          }
          // Update existing or add new
          currentMap.set(p.id, p);
        }
      });

      alert(`Base de datos actualizada:\n- ${addedCount} productos nuevos\n- ${updatedCount} productos actualizados`);
      return Array.from(currentMap.values());
    });
  };

  const handleImport = (recipe: Recipe) => {
     // Ensure imported recipe has valid structure
     const migrated = migrateRecipeIfNeeded(recipe);
     // Assign new ID to avoid collisions
     migrated.id = Date.now().toString(); 
     setRecipes(prev => [migrated, ...prev]);
  };

  const handleBackToDashboard = () => {
    setViewState('DASHBOARD');
    setCurrentRecipe(null);
  };

  const handleRestoreBackup = (backup: AppBackup) => {
    setRecipes(backup.recipes);
    setSettings(backup.settings);
    // If backup has product database, restore it, otherwise keep existing or default
    if (backup.productDatabase && backup.productDatabase.length > 0) {
      setProductDatabase(backup.productDatabase);
    }
    alert('Copia de seguridad restaurada correctamente.');
  };

  // Helper to migrate old single-ingredient recipes to new multi-subrecipe structure on the fly
  const migrateRecipeIfNeeded = (r: Recipe): Recipe => {
    if (r.subRecipes && r.subRecipes.length > 0) return r;
    
    // Create a subrecipe from legacy data
    return {
      ...r,
      subRecipes: [{
        id: 'legacy-1',
        name: 'Elaboración Principal',
        ingredients: r.ingredients || [],
        instructions: r.instructions || '',
        photo: ''
      }],
      platingInstructions: ''
    };
  };

  // --- Render ---

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        recipes={recipes}
        productDatabase={productDatabase}
        onSave={setSettings}
        onRestore={handleRestoreBackup}
      />

      {viewState === 'VIEWER' && currentRecipe ? (
        <RecipeView 
          recipe={currentRecipe} 
          onBack={handleBackToDashboard} 
          settings={settings}
        />
      ) : viewState === 'EDITOR' ? (
        <RecipeEditor 
          initialRecipe={currentRecipe} 
          productDatabase={productDatabase}
          onSave={handleSave} 
          onCancel={handleBackToDashboard} 
        />
      ) : viewState === 'MENU_PLANNER' ? (
        <MenuPlanner
          recipes={recipes}
          settings={settings}
          onBack={handleBackToDashboard}
        />
      ) : viewState === 'PRODUCT_DB' ? (
        <ProductDatabaseViewer
          products={productDatabase}
          onBack={handleBackToDashboard}
          onAdd={handleProductAdd}
          onEdit={handleProductEdit}
          onDelete={handleProductDelete}
          onImport={handleProductDatabaseImport}
        />
      ) : (
        <Dashboard 
          recipes={recipes} 
          settings={settings}
          onNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onImport={handleImport}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMenuPlanner={() => setViewState('MENU_PLANNER')}
          onOpenProductDB={() => setViewState('PRODUCT_DB')}
        />
      )}
    </>
  );
}

export default App;
