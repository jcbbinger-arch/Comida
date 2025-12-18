
import React, { useState, useEffect } from 'react';
import { Recipe, AppSettings, AppBackup, Product, DEFAULT_CATEGORIES } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Dashboard } from './components/Dashboard';
import { RecipeEditor } from './components/RecipeEditor';
import { RecipeView } from './components/RecipeView';
import { SettingsModal } from './components/SettingsModal';
import { MenuPlanner } from './components/MenuPlanner';
import { ProductDatabaseViewer } from './components/ProductDatabaseViewer';
import { LandingPage } from './components/LandingPage';
import { INITIAL_PRODUCT_DATABASE } from './data/products';

type ViewState = 'LANDING' | 'DASHBOARD' | 'EDITOR' | 'VIEWER' | 'MENU_PLANNER' | 'PRODUCT_DB';

const defaultSettings: AppSettings = {
  teacherName: "Juan Codina Barranco",
  instituteName: "IES La Flota",
  teacherLogo: "",
  instituteLogo: "",
  categories: DEFAULT_CATEGORIES
};

function App() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('appSettings', defaultSettings);
  const [productDatabase, setProductDatabase] = useLocalStorage<Product[]>('productDatabase', INITIAL_PRODUCT_DATABASE);
  
  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Asegurar que las categorías dinámicas existan
  useEffect(() => {
    if (!settings.categories || settings.categories.length === 0) {
      setSettings(prev => ({ ...prev, categories: DEFAULT_CATEGORIES }));
    }
  }, [settings.categories, setSettings]);

  const handleEnterApp = () => setViewState('DASHBOARD');
  const handleLogout = () => { setViewState('LANDING'); setCurrentRecipe(null); };

  const handleCreateNew = () => { setCurrentRecipe(null); setViewState('EDITOR'); };

  const migrateRecipeIfNeeded = (r: Recipe): Recipe => {
    const legacy = r as any;
    if (legacy.subRecipes && legacy.subRecipes.length > 0) return r;
    return {
      ...r,
      creator: legacy.creator || settings.teacherName,
      subRecipes: [{
        id: 'legacy-1',
        name: 'Elaboración Principal',
        ingredients: legacy.ingredients || [],
        instructions: legacy.instructions || '',
        photo: ''
      }],
      platingInstructions: legacy.platingInstructions || ''
    };
  };

  const handleEdit = (recipe: Recipe) => {
    setCurrentRecipe(migrateRecipeIfNeeded(recipe));
    setViewState('EDITOR');
  };

  const handleView = (recipe: Recipe) => {
    setCurrentRecipe(migrateRecipeIfNeeded(recipe));
    setViewState('VIEWER');
  };

  const handleSave = (recipe: Recipe) => {
    setRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      return exists ? prev.map(r => r.id === recipe.id ? recipe : r) : [recipe, ...prev];
    });
    setViewState('DASHBOARD');
    setCurrentRecipe(null);
  };

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        recipes={recipes}
        productDatabase={productDatabase}
        onSave={setSettings}
        onRestore={(backup) => {
          setRecipes(backup.recipes);
          setSettings(backup.settings);
          if (backup.productDatabase) setProductDatabase(backup.productDatabase);
          alert('Copia de seguridad restaurada correctamente.');
        }}
      />

      {viewState === 'LANDING' ? (
        <LandingPage settings={settings} onEnter={handleEnterApp} />
      ) : viewState === 'VIEWER' && currentRecipe ? (
        <RecipeView recipe={currentRecipe} onBack={() => setViewState('DASHBOARD')} settings={settings} />
      ) : viewState === 'EDITOR' ? (
        <RecipeEditor 
          initialRecipe={currentRecipe} 
          productDatabase={productDatabase} 
          settings={settings} 
          onSave={handleSave} 
          onCancel={() => setViewState('DASHBOARD')} 
          onAddProduct={(p) => setProductDatabase(prev => [p, ...prev])}
        />
      ) : viewState === 'MENU_PLANNER' ? (
        <MenuPlanner recipes={recipes} settings={settings} onBack={() => setViewState('DASHBOARD')} productDatabase={productDatabase} />
      ) : viewState === 'PRODUCT_DB' ? (
        <ProductDatabaseViewer products={productDatabase} onBack={() => setViewState('DASHBOARD')} onAdd={(p) => setProductDatabase([p, ...productDatabase])} onEdit={(p) => setProductDatabase(productDatabase.map(old => old.id === p.id ? p : old))} onDelete={(id) => setProductDatabase(productDatabase.filter(p => p.id !== id))} onImport={(list) => setProductDatabase([...list])} />
      ) : (
        <Dashboard recipes={recipes} settings={settings} onNew={handleCreateNew} onEdit={handleEdit} onView={handleView} onDelete={(id) => setRecipes(recipes.filter(r => r.id !== id))} onImport={(r) => setRecipes([r, ...recipes])} onOpenSettings={() => setIsSettingsOpen(true)} onOpenMenuPlanner={() => setViewState('MENU_PLANNER')} onOpenProductDB={() => setViewState('PRODUCT_DB')} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
